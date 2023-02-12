const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const { 
  addManager, 
  findManager, 
} = require('./database/api');
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
//------------------------------------------ ВЫДЕЛЕННЫЕ ФРАГМЕНТЫ ЗАМЕНИТЬ НА SQLITE 3
io.on('connection', socket => {
  console.log('Пользователь подключился!');
  socket.on('new message', async message => {
    const { id, text, chatId } = message;
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.currentUser(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
    //! Добавляем сообщения пользователя в базу to/from нужно добавить
    MessegesController.add(chatId, socket.id, id, text, new Date().getTime());
    // Передаем сообщение боту
    MessegesController.sendMessegesToBot(bot, io, text, chatId, socket); 
  });
  socket.on('disconnect', () => UsersController.currentUser(chatId, 0));
})

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = ManagerController.get(id);
  console.log(manager)
  if(manager.length === 0) ManagerController.add(id);
  // Выдатьсписок активных пользователей и число непрочитанных сообщений
  if(text === '/start') MessegesController.sendListMailsToBot(bot, id);
    MessegesController.sendListMailsToBot(bot, id)
  if(text === PASSWORD) {
    ManagerController.accest(id);
  } else {
    //! Добавляем сообщения в базу
    console.log('----------', manager.accest, id);
    if(manager.accest === 0) return bot.sendMessage(id, 'Введите пароль:');
  }
  // const socketId = localStorage.getItem('socketId');
  // io.to(socketId).emit('new message', text);
});
//! bot.sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg" );
//! bot.sendAudio(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');


// module.exports = {
//   sections: {
//      reply_markup: JSON.stringify({
//          inline_keyboard: [
//              [{text: 'Посетители онлайн', callback_data: '/online visitors'}],
//              [{text: 'Список чатов', callback_data: '/сhat List'}],
//              [{text: 'Настройки', callback_data: '/settings'}]
//          ]
//      })
//  }
// }