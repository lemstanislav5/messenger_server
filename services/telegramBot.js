const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
module.exports = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});