const log = require('../utils/logger');
const config = require('../../input/config');
const mongoose = require('mongoose');
const { walletSchema, logSchema, projectSchema } = require('./schema');

if (!config.mongoDB.use) return;

const WalletDB = mongoose.model('Wallet', walletSchema);
const Log = mongoose.model('Log', logSchema);
const Project = mongoose.model('Project', projectSchema);

async function ensureCollectionsExist() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    if (!collectionNames.includes('wallets')) throw new Error("Collection 'wallets' not found");
    if (!collectionNames.includes('logs')) throw new Error("Collection 'logs' not found");
    if (!collectionNames.includes('projects')) throw new Error("Collection 'projects' not found");
};

async function addLog(wallet, level, action, message, stackTrace) {
    if (!config.mongoDB.use) return;

    const logData = {
        index: wallet?.index || '',
        wallet: wallet?.address || '',
        project_name: config.mongoDB.project_name || '',
        level,
        action,
        message,
        stack_trace: stackTrace || '',
        date: new Date()
    };

    try {
        const log = new Log(logData);
        await log.save();
    } catch (error) {
        log.error(`Error addLog: ${error.message} \nStack: ${error.stack}`);
    };
};

async function ensureProjectExists() {
    const project_name = config.mongoDB.project_name;
    if (!project_name) throw new Error("project_name is not specified in config.js");
    const existingProject = await Project.findOne({ name: project_name });
    if (!existingProject) {
        log.debug(`Project '${project_name}' not found, creating a new one`);
        const newProject = new Project({
            name: project_name,
            created_at: new Date(),
            updated_at: new Date()
        });
        await newProject.save();
        log.infoDB({}, 'ensureProjectExists', `Project '${project_name}' successfully created`);
    };
};

async function startApp() {
    await mongoose.connect(config.mongoDB.URI, { ssl: true, autoIndex: true });
    log.info('Connected to MongoDB [1/3]');
    await ensureCollectionsExist();
    log.info('Collections checked [2/3]');
    await ensureProjectExists();
    log.infoDB({}, 'StartMongoDB', 'Database setup complete [3/3]');
};

async function ensureByAddress(wallet) {
    try {
        const existingWallet = await WalletDB.findOne({ address: wallet.address });

        if (!existingWallet) {
            log.infoDB(wallet, 'ensureByAddress', `Address not found, creating a new one`);
            const newWallet = new WalletDB({
                address: wallet.address,
                addressLowCase: wallet.address.toLowerCase(),
                projects: [],
                balances: {}
            });

            if (wallet.index) newWallet.index = wallet.index;
            await newWallet.save();
            log.infoDB(wallet, 'ensureByAddress', `Wallet successfully created`);
            wallet.id = newWallet._id;
            return newWallet;
        };

        if (existingWallet.index) wallet.index = existingWallet.index;
        wallet.id = existingWallet._id;
    } catch (error) {
        await log.errorDB(wallet, 'ensureByAddress', error.message, error.stack);
        throw error;
    };
};

async function addProjectToWallet(wallet, projectName) {
    try {
        const project = await Project.findOne({ name: projectName });
        if (!project) throw new Error(`Project '${projectName}' not found`);

        const projectId = project._id;
        if (!project.wallet_ids.includes(wallet.id)) {
            project.wallet_ids.push(wallet.id);
            await project.save();
            log.infoDB(wallet, 'addProjectToWallet', `Added to project '${projectName}'`);
        };

        const walletData = await WalletDB.findOne({ address: wallet.address });
        const existingProject = walletData.projects.find(p => p.project_id == projectId);
        if (!existingProject) {
            walletData.projects.push({
                project_id: projectId,
                project_name: projectName,
                added_at: new Date(),
                metrics: { points: 0, last_updated: new Date() }
            });
            await walletData.save();
            log.infoDB(wallet, 'addProjectToWallet', `Project '${projectName}' added to wallet`);
        };
    } catch (error) {
        await log.errorDB(wallet, 'addProjectToWallet', error.message, error.stack);
        throw error;
    };
};

async function updateWalletBalance(wallet, network, token, balance) {
    try {
        const walletData = await WalletDB.findOne({ address: wallet.address });

        if (!walletData.balances.has(network)) {
            walletData.balances.set(network, { balance: { [token]: balance }, added_at: new Date(), last_updated: new Date() });
            log.infoDB(wallet, 'updateWalletBalance', `New network '${network}' with token '${token}' and balance ${balance} added`);
        } else {
            const networkData = walletData.balances.get(network);

            if (!networkData.balance[token]) {
                networkData.balance[token] = balance;
                networkData.added_at = new Date();
                networkData.last_updated = new Date();
                log.infoDB(wallet, 'updateWalletBalance', `New token '${token}' added to '${network}' with balance ${balance}`);
            } else {
                networkData.balance[token] = balance;
                networkData.last_updated = new Date();
                log.infoDB(wallet, 'updateWalletBalance', `Token '${token}' in '${network}' updated to balance ${balance}`);
            };
            walletData.balances.set(network, networkData);
        };

        await walletData.save();
        log.infoDB(wallet, 'updateWalletBalance', `Balance for wallet '${wallet.address}' successfully updated`);
    } catch (error) {
        await log.errorDB(wallet, 'updateWalletBalance', `Error: ${error.message}`, error.stack);
        throw error;
    };
};

async function updateMetric(wallet, metricName, value) {
    try {
        const project_name = config.mongoDB.project_name;
        const setOptions = { 
            'projects.$.metrics.last_updated': new Date(),
            [`projects.$.metrics.${metricName}`]: value.toString()
        };

        const walletData = await WalletDB.findOneAndUpdate(
            { address: wallet.address, 'projects.project_name': project_name },
            { $set: setOptions },
            { new: true, upsert: false }
        );

        if (!walletData) throw new Error(`Wallet '${wallet.address}' or project '${project_name}' not found`);
        log.infoDB(wallet, 'updateMetric', metricName + ` updated to ${value}`);
        return walletData;
    } catch (error) {
        await log.errorDB(wallet, 'updateMetric', error.message, error.stack);
        throw error;
    };
};

module.exports = {
    WalletDB,
    Log,
    Project,
    addLog,
    startApp,
    updateMetric,
    updateWalletBalance,
    addProjectToWallet,
    ensureByAddress
};
