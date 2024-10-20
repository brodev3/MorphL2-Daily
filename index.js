require('./scr/utils/errorHandler');
const Wallet = require('./scr/wallet');
const Morphl2 = require('./scr/morphl2');
const utils = require('./scr/utils/utils');
const log = require('./scr/utils/logger');
const config = require('./input/config');
const db = require("./scr/db/db");

const dapp = new Morphl2();

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
};

function randomValueDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function randomizeVotes(totalVotes, projects, minPercentage = 0.9) {
    const minVotesToSpend = Math.ceil(totalVotes * minPercentage); 
    const maxVotesPerProject = 100; 
    let remainingVotes = totalVotes; 
    let votesSpent = 0; 
  

    const votes = projects.map(() => 0);
  
    while (remainingVotes > 0 && votesSpent < minVotesToSpend) {
        const projectIndex = Math.floor(Math.random() * projects.length);
        const availableVotes = Math.min(
            remainingVotes,
            maxVotesPerProject - votes[projectIndex]
        );
  
        if (availableVotes > 0) {
            const votesToAdd = Math.ceil(Math.random() * availableVotes);
            votes[projectIndex] += votesToAdd;
            votesSpent += votesToAdd;
            remainingVotes -= votesToAdd;
        };
    };
  
    if (votesSpent < minVotesToSpend) {
      const difference = minVotesToSpend - votesSpent;
  
        for (let i = 0; i < difference; i++) {
            const projectIndex = Math.floor(Math.random() * projects.length);
            if (votes[projectIndex] < maxVotesPerProject) {
                votes[projectIndex]++;
            };
        };
    };
  
    return votes;
};

const daily = async (wallet) => {
    await collect(wallet);
    await randomDelay(15_000, 300_000);
    await vote(wallet);

    let timeout;
    if (config.scheduler.everyday) {
        const timeToNextDay = utils.fixedTimeToNextDay(config.scheduler.fixed_time, config.scheduler.utc_offset);
        const maxTime = config.scheduler.max_time_in_ms;
        timeout = randomValueDelay(timeToNextDay, timeToNextDay + maxTime);
    } else timeout = utils.timeToNextDay();
    setTimeout(daily, timeout, wallet);
};

const collect = async (wallet) => {
    try {
        const resultChekin = await dapp.checkin(wallet);
        log.successDB(wallet, "checkin", `Daily Check-in collected!`);
        await randomDelay(2000, 6000);
        const resultOpenBox = await dapp.openBox(wallet);
        log.successDB(wallet, "openBox", `Voting power collected!`);
        await randomDelay(2000, 6000);
        const stats = await dapp.getStats(wallet);
        log.infoDB(wallet, "getStats", `Total point: ${stats.total_point}. Total votes: ${stats.total_voting_power - stats.total_voted}`);
        await db.updateMetric(wallet, "points", `${stats.total_point}`);
        await db.updateMetric(wallet, "voting_power", `${stats.total_voting_power - stats.total_voted}`);
    }
    catch (err){
        await log.errorDB(wallet, "collect", err.message, err.stack);
    };
};

const vote = async (wallet) => {
    try {
        let stats = await dapp.getStats(wallet);
        const projectsList = await dapp.getProjects(wallet);
        const votes = randomizeVotes(stats.total_voting_power - stats.total_voted, projectsList);
        for (let index = 0; index < votes.length; index++) {
            const projectVotes = votes[index];
            if (projectVotes > 0) {
                const project_id = projectsList[index].project_id;
                const resultVote = await dapp.vote(wallet, project_id, projectVotes);
                log.successDB(wallet, "vote", `${projectVotes} votes for ${projectsList[index].project_name}!`);
                await randomDelay(10_000, 90_000);
            };
        };
        stats = await dapp.getStats(wallet);
        log.infoDB(wallet, "vote", `Voting end. Total point: ${stats.total_point}. Total voting power: ${stats.total_voting_power - stats.total_voted}`);
        await db.updateMetric(wallet, "points", `${stats.total_point}`);
        await db.updateMetric(wallet, "voting_power", `${stats.total_voting_power - stats.total_voted}`);

    }
    catch (err){
        await log.errorDB(wallet, "vote", err.message, err.stack);
    };
};

async function main() {
    await db.startApp();
    const data = config.decryption.decrypt ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray();
    const wallets = [];
    for (let index =  0; index < data.length; index++) {
        const row = data[index];
        const privateKey = row.split(";")[0];
        let proxy = row.split(";")[1] ? row.split(";")[1] : null;
        if (proxy) 
            proxy = {
                host: proxy.split(":")[0],
                port: proxy.split(":")[1],
                login: proxy.split(":")[2],
                password: proxy.split(":")[3],
            };

        const wallet = new Wallet(privateKey, proxy);
        await db.ensureByAddress(wallet);
        await db.addProjectToWallet(wallet, config.mongoDB.project_name);
        const startDate = config.scheduler.start_date ? utils.parseDateToTimestamp(config.scheduler.start_date, config.scheduler.utc_offset) : Date.now() + 2000;
        const maxTime = config.scheduler.max_time_in_ms;
        const timeToStart = startDate - Date.now();
        const delay = randomValueDelay(timeToStart <= 0 ? 0:timeToStart, timeToStart + maxTime);
        setTimeout(daily, delay, wallet);
        wallets.push(wallet);
    };
};

main();
