const Wallet = require('./scr/wallet');
const Morphl2 = require('./scr/morphl2');
const utils = require('./scr/utils/utils');
const log = require('./scr/utils/logger');
const fs = require('fs/promises');

const dapp = new Morphl2();

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
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
        log.info(`Wallet: ${wallet.address}. Total point: ${stats.total_point}. Total voting power: ${stats.total_voting_power}`);
        const timeout = utils.timeToNextDay();
        setTimeout(collect, timeout, wallet);
    }
    catch (err){
        log.error(`Wallet: ${wallet.address}. Error message: ${err.message}\nStack: ${err.stack}`);
    };
};

async function readFile(fileName) {
    const data = await fs.readFile(__dirname + '/input/' + fileName, 'utf8');
    const lines = data.split('\n');
    return lines;
};

async function main() {
    const proxys = await readFile('proxy.txt');
    const wallets = [];
    for (let index = 0; index < proxys.length; index++) {
        const element = proxys[index].replace(/[\r\n]+/g, '');
        const proxy = {
            host: element.split(":")[0],
            port: element.split(":")[1],
            login: element.split(":")[2],
            password: element.split(":")[3],
        };
        wallets.push(new Wallet(null, proxy));
    };

    wallets.forEach(collect);
}

main();
