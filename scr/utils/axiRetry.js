const log = require('../utils/logger');

function getDelayTime(retryCount) {
    return Math.pow(2, retryCount) * 1000; 
};

async function delay(delayTime) {
    return new Promise(resolve => setTimeout(resolve, delayTime)); 
};

async function get(url, instance = axios, headers = null, retriesLeft = 5) {
    let response = await instance.get(url, headers ? headers:null).catch(async error => {
        if (retriesLeft > 0) {
            log.debug(`AxiRetry: retrying left ${retriesLeft}`);
            await delay(getDelayTime(5 - retriesLeft));
            return get(url, instance, retriesLeft - 1);
        } else {
            log.error(`AxiRetry: request error: ${error.message}\nStack Trace: ${error.stack}`)
            throw error;
        }
    });
    return response;
};

async function post(url, body, instance = axios, headers = null, retriesLeft = 5) {
    let response = await instance.post(url, body, headers ? headers:null).catch(async error => {
        if (retriesLeft > 0) {
            log.debug(`AxiRetry: retrying left ${retriesLeft}`)
            await delay(getDelayTime(5 - retriesLeft));
            return post(url, body, instance, headers, retriesLeft - 1);
        } else {
            log.error(`AxiRetry: request error: ${error.message}\nStack Trace: ${error.stack}`)
            throw error;
        }
    });
    return response;
};

module.exports = {
    get,
    post,
};
