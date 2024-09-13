const utils = require('./utils/utils');
const log = require('./utils/logger')
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const axiRetry = require("./utils/axiRetry");
const { Web3 } = require('web3');
const { error } = require('console');
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

    async getData(wallet) {
        const randomHexString = crypto.randomBytes(32).toString('hex');
        const hexString = Buffer.from(randomHexString, 'utf8').toString('hex');
        
        const param = {
            address: wallet.address,
            projectId: hexString
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

        if (response.data.code != 1000){
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

        if (response.data.code != 1000){
            log.error(`Wallet: ${wallet.address}. Open Mystery Box returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
            throw new Error(`Mystery Box returned wrong code! Code: ${response.data.code}. Message: ${response.data.message}`);
        };

        return true;
    };

    
    
};



module.exports = Morphl2;