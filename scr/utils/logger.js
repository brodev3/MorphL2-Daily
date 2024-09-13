const fs = require('fs');
const path = require("path")

const LOG_FILE = path.resolve(path.resolve(__dirname, '..'), '..') + "/output/log.txt";
const LOG_DIR = path.resolve(path.resolve(__dirname, '..'), '..') + "/output";

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

fs.appendFileSync(LOG_FILE, '----'.repeat(50) + '\n');

function getColor(priority) {
    switch (priority.toLowerCase()) {
        case 'success':
            return '\x1b[38;5;2m';
        case 'fail':
            return '\x1b[38;5;209m';
        case 'error':
            return '\x1b[38;5;1m';
        case 'warn':
            return '\x1b[33m';
        default:
            return '\x1b[37m';
    }
}

function formatLocalTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    const day = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    const hours = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
    const minutes = now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
    const seconds = now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function logMessage(priority, message) {
    const timestamp = formatLocalTime();
    const color = getColor(priority);
    const logEntry = `${timestamp} >>> ${priority.toUpperCase()} | ${message}`;

    if (priority.toLowerCase() !== 'debug') {
        console.log(color + logEntry + '\x1b[0m');
    }

    fs.appendFile(LOG_FILE, logEntry + '\n', (err) => {
        if (err) {
            console.error('Error writing to the log file:', err);
        }
    });
}

module.exports = {
    success: (message) => logMessage('success', message),
    info: (message) => logMessage('info', message),
    error: (message) => logMessage('error', message),
    debug: (message) => logMessage('debug', message),
    fail: (message) => logMessage('fail', message),
    warn: (message) => logMessage('warn', message)
};