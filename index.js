const process = require('process');
console.log(process.pid);
const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const UsersController = require('./controllers/UserController');
const MessegesController = require('./controllers/MessegesController');
const InitializationController = require('./controllers/InitializationController');
const ManagerController = require('./controllers/ManagerController');

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http);

http.listen(PORT, () => console.log('listening on *:' + PORT));
InitializationController.initialization();

io.on('connection', socket => {
  console.log('Пользователь подключился!');
  socket.on('new message', async message => {
    const { id, text, chatId } = message;
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.setCurrent(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
    MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
    const manager = await ManagerController.get(id);
    console.log('UsersController.get', manager);
    // Сообщаем пользователю об отсутствии менеджера
    if (manager.length === 0 || manager[0].accest === 0)
      return io.to(socket.id).emit('new message', 'Менеджер offline!');
    //! Передаем сообщение боту read = 1
    MessegesController.sendMessegesToBot(bot, io, text, chatId, socket);

  });
  socket.on('disconnect', () => {
    UsersController.delCurrent();
    console.log('Пользователь отсоединился!')
  });
})

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = await ManagerController.find(id);
  if (manager.length === 0) {
    // Менеджер добавляется один раз, при условии, что запись в базе отсутствует
    ManagerController.add(id);
    return MessegesController.sendBotNotification(bot, id, 'Введите пароль:');
  } else {
    if (manager[0].accest === 0) {
      if (text === PASSWORD) {
        ManagerController.accest(id);
        return MessegesController.sendBotNotification(bot, id, 'Доступ получен!');
      } else {
        return MessegesController.sendBotNotification(bot, id, 'Введите пароль:');
      }
    } else if (manager[0].accest === 1) {
      console.log(manager)
      if (text === '/start') {
        MessegesController.sendListMailsToBot(bot, id);
      } else {
        let currentUser = await UsersController.getCurrent();
        if (currentUser.length === 0) {
          return MessegesController.sendBotNotification(bot, id, 'Адресат вашего сообщения не выбран!');
        } else {
          const socketId = await UsersController.getSocketCurrentUser(currentUser[0].chatId);
          if (!socketId) return MessegesController.sendBotNotification(bot, id, 'Адресат не найден в базе!');
          io.to(socketId).emit('new message', text);
          //! Проверка доставки сообщения
          let idMessage = 9999999999 - Math.round(0 - 0.5 + Math.random() * (8999999999 - 0 + 1));
          MessegesController.add(id, socketId, idMessage, text, new Date().getTime(), 'to', read = 0);
        }
      }
    }

  }
});

bot.on('callback_query', async msg => {
  const chatId = msg.data;
  //! При выводе сообщений подьзователя обновляю данные сообщения как прочитанные
  //! MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', delivered = 1, read = 0);
  UsersController.setCurrent(chatId, 1);
});
//! bot.sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg" );
//! bot.sendAudio(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');
