const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const localStorage = require('./modules/localStorage')();
const { databaseInitialization, addUser, findUser, addMessage, updateSocketId, addManager } = require('./database/api');
databaseInitialization()
  .then(() => console.log('databse is created'))
  .catch(err =>  console.log(err));

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http);

let users = [];
http.listen(PORT, () => console.log('listening on *:' + PORT));
//------------------------------------------ ВЫДЕЛЕННЫЕ ФРАГМЕНТЫ ЗАМЕНИТЬ НА SQLITE 3
io.on('connection', socket => {
  // //!Ищем пользователя по socketId в массиве users
  // let user = users.find(item => item.socketId === socket.id);
  // //!Добавить пользователя в массив
  // if(user === undefined) users.push({socketId: socket.id, name: '', email: ''});
  console.log('A user connected');
  socket.on('new message', message => {
    const { id, text, chatId } = message;
    // Ищем пользователя по chatId в базе users
    findUser(chatId)
      .then(res => {
        console.log(res);
        if(res.length === 0) {
          // Если пользователя нет добавляем
          console.log('User added');
          return addUser(chatId, socket.id);
        } else {
          // Если пользователь есть меням socketId
          console.log('User socket changed');
          return updateSocketId(chatId, socket.id);
        }
      }).then(res => {
        console.log(res);
        return addMessage(chatId, socket.id, id, text, new Date().getTime())
      }).then(res => {
       
      })
      .catch(err =>  console.log(err));
    //!Ищем пользователя по socketId в массиве users
    // let user = users.find(item => item.socketId === socket.id);
    // console.log(user, message);
    // let name = (user === undefined || user.name !== undefined || user.name !== '') ? 'USER [' + users.indexOf(user) + ']' : user.name;
    // localStorage.setItem('socketId', socket.id);
    // // const chatId = localStorage.getItem('bot_chat_id');
    // if(chatId === null) return console.log('Manager offline!')
    // bot.sendMessage(chatId, name + '\n' + message.text);
  });
  socket.on('disconnect', () => {
    // //!Ищем пользователя по socketId в массиве users
    // let user = users.find(item => item.socketId === socket.id);
    // //!Определям индекс пользователя
    // let index = users.indexOf(user);
    // //!Удаляем пользователя из массива
    // users.splice(1, index);
    // console.log('A user disconnected')
  });
    

})

bot.on('message', (message) => {
  console.log(message)
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  if(text === '/start'){
    addManager(managerId = id)
      .then(() => console.log('Add manager'))
      .catch(err => console.log(err));
  }
  // localStorage.setItem('bot_chat_id', id);
  // const socketId = localStorage.getItem('socketId');
  // io.to(socketId).emit('new message', text);
});
//! bot.sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg" );
//! bot.sendAudio(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');