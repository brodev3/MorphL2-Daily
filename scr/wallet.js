const utils = require('./utils/utils');
const log = require('./utils/logger')
const { SocksProxyAgent } = require('socks-proxy-agent');
const fs = require('fs');
const axios = require("axios");
const { ethers } = require("ethers");
const path = require("path")


class Wallet {

    constructor(privateKey = null, proxy = null) { 
        if (privateKey)
            this.wallet = new ethers.Wallet(privateKey);
        else {
            this.wallet = ethers.Wallet.createRandom();
            fs.appendFile(path.resolve(__dirname, '..') + "/output/newWallets.txt", `${this.wallet.address}:${this.wallet.privateKey}` + '\n', (err) => {
                if (err) throw err;
                log.info(`${this.wallet.address} private key was written to txt`);
            });
        };
        this.address = this.wallet.address;
        this.privateKey = this.wallet.privateKey;

        const options = {
            headers: { 
                'User-Agent': utils.get_UA(),
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-US;q=0.8,en;q=0.7",
                "authorization": "Bearer",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.morphl2.io/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        };
        
        if (proxy) {
            this.proxy = proxy;
            const proxyAgent  = new SocksProxyAgent(
                `socks5://${this.proxy.login}:${this.proxy.password}@${this.proxy.host}:${this.proxy.port}`
            );
            options.httpsAgent = proxyAgent;
            options.httpAgent = proxyAgent;
        };

        this.axios = axios.create(options);

        this.points = 0; 
    };

    async signMessage(message) {
        return await this.wallet.signMessage(message);
    };
    
};



module.exports = Wallet;