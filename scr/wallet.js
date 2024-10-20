const utils = require('./utils/utils');
const log = require('./utils/logger')
const fs = require('fs');
const { socksDispatcher } = require("fetch-socks");
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

        let ua = utils.get_UA();
        this.cookie = {};

        this.options = {
            headers: { 
                // 'User-Agent': ua.userAgent,
                "accept": "application/json, text/plain, */*",
                "accept-language": utils.get_Local(),
                "authorization": "Bearer",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "pragma": "no-cache",
                "priority": "u=1, i",
                "sec-ch-ua": ua.componentUserAgent,
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://www.morphl2.io/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "origin": "https://morphl2.io",
                "cookie": this.cookie,
            },
            mode: "cors",
            credentials: "include",
            cache: "no-cache",
            redirect: "follow",
            referrer: "https://www.morphl2.io/",
            referrerPolicy: "strict-origin-when-cross-origin",
        };
        
        this.proxy = proxy ? proxy : null;
    };

    async signMessage(message) {
        return await this.wallet.signMessage(message);
    };

    async dispatcher(){
        if (this.proxy)
            return socksDispatcher({
                type: 5,
                host: this.proxy.host,
                port: +this.proxy.port,
                userId: this.proxy.login,
                password: this.proxy.password,
            });
    };
    
};



module.exports = Wallet;