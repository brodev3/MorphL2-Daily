const Wallet = require('./scr/wallet');
const Morphl2 = require('./scr/morphl2');
const utils = require('./scr/utils/utils');
const log = require('./scr/utils/logger');
const fs = require('fs/promises');

const dapp = new Morphl2();

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
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

    const timeout = utils.timeToNextDay();
    setTimeout(daily, timeout, wallet);
};

const collect = async (wallet) => {
    try {
        const resultChekin = await dapp.checkin(wallet);
        log.success(`Wallet: ${wallet.address}. Daily Check-in collected!`);
        await randomDelay(2000, 6000);
        const resultOpenBox = await dapp.openBox(wallet);
        log.success(`Wallet: ${wallet.address}. Voting power collected!`);
        await randomDelay(2000, 6000);
        const stats = await dapp.getStats(wallet);
        log.info(`Wallet: ${wallet.address}. Total point: ${stats.total_point}. Total votes: ${stats.total_voting_power - stats.total_voted}`);
    }
    catch (err){
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
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
                log.success(`Wallet: ${wallet.address}. ${projectVotes} votes for ${projectsList[index].project_name}!`);
                await randomDelay(10_000, 90_000);
            };
        };
        stats = await dapp.getStats(wallet);
        log.info(`Wallet: ${wallet.address}. Voting end. Total point: ${stats.total_point}. Total voting power: ${stats.total_voting_power - stats.total_voted}`);
    }
    catch (err){
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
    };
};

async function main() {
    const data = process.env.DECRYPT ? await utils.readDecryptCSVToArray() : await utils.readCSVToArray();
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
        const delay = Math.floor(Math.random() * (process.env.MAXTIME - 1_000 + 1)) + 1_000;
        setTimeout(daily, delay, wallet);
        wallets.push(wallet);
    };
};

main();
