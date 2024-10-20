const log = require('./utils/logger')
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const { Web3 } = require('web3');
const web3 = new Web3();
const fetcher = require("./utils/fetcher");

class Morphl2 {

    constructor() { 
        this.baseURL = "https://events-api-holesky.morphl2.io/";
    };

    async getStats(wallet) {
        const url = this.baseURL + "activities/personal_stats" + "?address=" + wallet.address;
        const response = await fetcher.get(url, wallet);
        return response.data;
    };

    async getProjects(wallet) {
        const url = this.baseURL + "activities/project_stats" + "?address=" + wallet.address;
        const response = await fetcher.get(url, wallet);
        return response.data.list;
    };

    async getData(wallet, projectId = null, votingPower = undefined) {
        const randomHexString = crypto.randomBytes(32).toString('hex');
        const hexString = Buffer.from(randomHexString, 'utf8').toString('hex');
        
        const param = {
            address: wallet.address,
            projectId: projectId ? projectId:hexString,
            votingPower: votingPower
        };

        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(param), "A1b2C3d4E5f6G7h8I9j0K!#");
        const message = web3.utils.sha3(JSON.stringify(param)) || "";

        return {
            message: message,
            data: encryptedData.toString(),
        };
    };

    async checkin(wallet) {
        const url = this.baseURL + "activities/sign_in";
        const param = await this.getData(wallet);
        const signTx = await wallet.signMessage(
            "Welcome to Morph!\n\nThis is only for address check purposes, it will not trigger a blockchain transaction or cost any gas fees.\n"
        );
        
        const body = {
            message: param.message,
            data: param.data,
            signature: signTx
        };

        const response = await fetcher.post(url, body, wallet);

        if (response.code != 1000 && response.code != 1002){
                if (response.code == 1001)
                    return await log.infoDB(wallet, "checkin", `You've opened the box today`);
            await log.errorDB(wallet, "checkin", `Daily Check-in returned wrong code! Code: ${response.code}. Message: ${response.message}`);
            throw new Error(`Check-in returned wrong code! Code: ${response.code}. Message: ${response.message}`);
        };

        return true;
    };

    async openBox(wallet) {
        const url = this.baseURL + "activities/open_blind_box";
        const param = await this.getData(wallet);
        const signTx = await wallet.signMessage(
            "Welcome to Morph!\n\nThis is only for address check purposes, it will not trigger a blockchain transaction or cost any gas fees.\n"
        );
        
        const body = {
            message: param.message,
            data: param.data,
            signature: signTx
        };

        const response = await fetcher.post(url, body, wallet);

        if (response.code != 1000 && response.code != 1002){
            if (response.code == 1001)
                return await log.infoDB(wallet, "checkin", `You've opened the box today`);
            await log.errorDB(wallet, "checkin", `Open Mystery Box returned wrong code! Code: ${response.code}. Message: ${response.message}`);
            throw new Error(`Mystery Box returned wrong code! Code: ${response.code}. Message: ${response.message}`);
        };

        return true;
    };

    async vote(wallet, projectId, votes) {
        const url = this.baseURL + "activities/vote";
        const param = await this.getData(wallet, projectId, votes);
        const signTx = await wallet.signMessage(
            "Welcome to Morph!\n\nThis is only for address check purposes, it will not trigger a blockchain transaction or cost any gas fees.\n"
        );
        
        const body = {
            message: param.message,
            data: param.data,
            signature: signTx
        };

        const response = await fetcher.post(url, body, wallet);

        if (response.code != 1000 && response.code != 1002){
            if (response.code == 1001)
                return await log.infoDB(wallet, "checkin", `You've opened the box today`);
            await log.errorDB(wallet, "checkin", `Vote returned wrong code! Code: ${response.code}. Message: ${response.message}`);
            throw new Error(`Vote returned wrong code! Code: ${response.code}. Message: ${response.message}`);
        };

        return true;
    };
    
};



module.exports = Morphl2;