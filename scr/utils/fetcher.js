const log = require('./logger');

function getDelayTime(retryCount) {
    return Math.pow(2, retryCount) * 1000; 
};

async function delay(delayTime) {
    return new Promise(resolve => setTimeout(resolve, delayTime)); 
};

function serializeCookie(cookies) {
    if (Object.entries(cookies).length === 0)
        return;
    let cookieString = '';
    for (let name in cookies) {
        cookieString = cookieString ? cookieString + "; " : "";
        const setCookie = name + "=" + cookies[name];
        cookieString = cookieString + setCookie;
    };
    return cookieString; 
};

function parseCookie(cookies) {
    if (cookies.length === 0)
        return;
    
    let cookieArray = {};
    for (let name of cookies) {
        const setCookie = name.split(";")[0 ];
        const [key, value] = setCookie.split(/=(.+)/);
        cookieArray[key] = value;
    };
    return cookieArray; 
};

async function get(url, instance, headers = null, retriesLeft = 5) {
    const options = JSON.parse(JSON.stringify(instance.options));
    options.headers = { ...options.headers, ...headers }; 
    options.method = 'GET';
    
    const cookies = serializeCookie(instance.cookie);
    if (cookies)
        options.headers.cookie = cookies;

    if (instance.proxy)
        options.dispatcher = await instance.dispatcher();
    
    let response;
    try {
        response = await fetch(url, options);

        if (instance.proxy)
            options.dispatcher = await instance.dispatcher();

        if (!response.ok) 
            throw new Error(`HTTP error! Status: ${response.status}. ${response.statusText}`);
    } catch (error) {
        if (retriesLeft > 0) {
            log.debugDB(instance, "Fetcher.get", `Fetcher: retrying left ${retriesLeft}.\n` + error.message, error.stack);
            // options.dispatcher.close();
            await delay(getDelayTime(5 - retriesLeft));
            return get(url, instance, headers, retriesLeft - 1);
        } else {
            await log.errorDB(instance, "Fetcher.get", error.message, error.stack);
            // options.dispatcher.close();
            throw error;
        };
    };
    // options.dispatcher.close();

    const responseCookies = [];
        
    response.headers.forEach((value, name) => {
        if (name.toLowerCase() === 'set-cookie') {
            responseCookies.push(value); 
        }
    });

    const newCookie = parseCookie(responseCookies);
    instance.cookie = {...instance.cookie, ...newCookie};

    const data = await response.json();

    return data;
};


async function post(url, body, instance, headers = null, retriesLeft = 5) {
    const options = JSON.parse(JSON.stringify(instance.options));
    options.headers = { ...options.headers, ...headers }; 
    options.method = 'POST';
    options.body = JSON.stringify(body);

    const cookies = serializeCookie(instance.cookie);
    if (cookies)
        options.headers.cookie = cookies;

    if (instance.proxy)
        options.dispatcher = await instance.dispatcher();

    let response;
    try {
        response = await fetch(url, options);

        if (instance.proxy)
            options.dispatcher = await instance.dispatcher();

        if (!response.ok)  
            throw new Error(`Fetcher: HTTP error! Status: ${response.status}`);
    } catch (error) {
        if (retriesLeft > 0) {
            log.debugDB(instance, "Fetcher.post", `Fetcher: retrying left ${retriesLeft}.\n` + error.message, error.stack);
            // options.dispatcher.close();
            await delay(getDelayTime(5 - retriesLeft));
            return post(url, body, instance, headers, retriesLeft - 1);
        } else {
            await log.errorDB(instance, "Fetcher.post", error.message, error.stack);
            // options.dispatcher.close();
            throw error;
        };
    };
    // options.dispatcher.close();

    const responseCookies = [];
        
    response.headers.forEach((value, name) => {
        if (name.toLowerCase() === 'set-cookie') responseCookies.push(value); 
    });

    const newCookie = parseCookie(responseCookies);
    instance.cookie = {...instance.cookie, ...newCookie};

    const data = await response.json();

    return data;
};

module.exports = {
    get,
    post,
};
