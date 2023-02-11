const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const localStorage = require('./modules/localStorage')();
const { 
  databaseInitialization, 
  findUser, 
  addManager, 
  findManager, 
  updateManagerAccest,
  getIdManager, 
} = require('./database/api');
const UsersController = require('./controllers/UserController');
const MessegesController = require('./controllers/MessegesController');
const InitializationController = require('./controllers/InitializationController');

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
  socket.on('disconnect', () => {
    // !Ищем пользователя по socketId в массиве users
    // let user = users.find(item => item.socketId === socket.id);
    // !Определям индекс пользователя
    // let index = users.indexOf(user);
    // !Удаляем пользователя из массива
    // users.splice(1, index);
    // console.log('A user disconnected')
  });
    

})

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = await findManager(id);
  if(manager.length === 0) {
    addManager(id)
      .then(() => console.log('Менеджер добавлен!'))
      .catch(err => console.log(err));
  }
  if(text === '/start'){
    // |U1 ON: 2| |U2 OFF:12| |U3 ON: 2| |Viktor3 OFF:12|
    MessegesController.sendListMailsToBot(bot, id)
    console.log('Выдать меню и показать список активных чатов с возможность выбора переписки');
  } else if(text === PASSWORD) {
    console.log('Доступ открыт!');
    updateManagerAccest(id);
  } else {
    //! Добавляем сообщения в базу
    console.log('----------', manager.accest, id);
    if(manager.accest === 0) return bot.sendMessage(id, 'Введите пароль:');
  }
  localStorage.setItem('bot_chat_id', id);
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