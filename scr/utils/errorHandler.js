const log = require('./logger');
const config = require('../../input/config');
const TelegramBot = require('node-telegram-bot-api');

async function sendTelegramAlert(error) {
    try {
        if (!config.TGbot || !config.TGbot.token) return;
        const bot = new TelegramBot(config.TGbot.token, { polling: false });
        const allowedUsers = config.TGbot.allowedUsers;
        let message = "⛔️ Project: " + config.mongoDB.project_name + ". ‼️ FATAL ERROR: " + error.message;
        for (let chatId of allowedUsers) await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    } catch (error) {
        log.errorDB({}, "sendTelegramAlert", 'Error sending alert in Telegram: ' + error.message, error.stack);
    };
};

class ErrorHandler {
    constructor() {
        process.on('uncaughtException', async (error) => {
            this.handleFatalError('uncaughtException', error);
        });

        process.on('unhandledRejection', async (reason, promise) => {
            this.handleFatalError('unhandledRejection', reason);
        });
    }

    async handleFatalError(type, error) {
        await log.fatalDB({}, type, error.message || '', error.stack || '');
        await sendTelegramAlert(error);
        process.exit(1);
    };
};

module.exports = new ErrorHandler();
