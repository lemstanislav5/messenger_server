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
  // Устаналиваем chatId текущего пользователя если он не выбран
  UsersController.setCurrent(chatId);
  socket.on('new message', async message => {
    const { id, text, chatId } = message;
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
    //! Добавляем сообщения пользователя в базу to/from нужно добавить
    MessegesController.add(chatId, socket.id, id, text, new Date().getTime());
    // Передаем сообщение боту
    MessegesController.sendMessegesToBot(bot, io, text, chatId, socket); 
  });
  socket.on('disconnect', () => UsersController.setCurrent(chatId, 0));
})

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = await ManagerController.get(id);
  console.log(manager)
  // Если нет доступа введите пароль

  if(manager.length === 0) {
    ManagerController.add(id);
    return bot.sendMessage(id, 'Введите пароль:');
  } else {
    if(manager.accest === 0 && text !== PASSWORD) {
      return bot.sendMessage(id, 'Введите пароль:');
    } else if (text === PASSWORD) {
      ManagerController.accest(id)
    } else if (manager.accest === 1 && text === '/start') {
      //! Выдать список активных пользователей и число непрочитанных сообщений
      MessegesController.sendListMailsToBot(bot, id)
    } else {
      let currentUser = await UsersController.getCurrent();
      console.log('currentUser', currentUser);
      //! Добавляем сообщения пользователя в базу to/from нужно добавить
      // MessegesController.add(chatId, socket.id, id, text, new Date().getTime());
      // io.to(socketId).emit('new message', text);
    }
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