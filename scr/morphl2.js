const log = require('./utils/logger')
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const axiRetry = require("./utils/axiRetry");
const { Web3 } = require('web3');
const web3 = new Web3();


class Morphl2 {

    constructor() { 
        this.baseURL = "https://events-api-holesky.morphl2.io/";
    };

    async getStats(wallet) {
        const url = this.baseURL + "activities/personal_stats" + "?address=" + wallet.address;
        const response = await axiRetry.get(url, wallet.axios);
        return response.data.data;
    };

    async getProjects(wallet) {
        const url = this.baseURL + "activities/project_stats" + "?address=" + wallet.address;
        const response = await axiRetry.get(url, wallet.axios);
        return response.data.data.list;
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

        const response = await axiRetry.post(url, body, wallet.axios);

        if (response.data.code != 1000 || response.data.code != 1002){
            log.error(`Wallet: ${wallet.address}. Daily Check-in returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
            throw new Error(`Check-in returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
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

        const response = await axiRetry.post(url, body, wallet.axios);

        if (response.data.code != 1000 || response.data.code != 1002){
            log.error(`Wallet: ${wallet.address}. Open Mystery Box returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
            throw new Error(`Mystery Box returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
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

        const response = await axiRetry.post(url, body, wallet.axios);

        if (response.data.code != 1000){
            log.error(`Wallet: ${wallet.address}. Vote returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
            throw new Error(`Vote returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
        };

        return true;
    };
    
};



module.exports = Morphl2;