const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
let SOCKET = null;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
const localStorage = require('./modules/localStorage')();
const { databaseInitialization, addUser, findUser } = require('./database/api');
databaseInitialization()
  .then(res => console.log('databse is created'))
  .catch(err =>  console.log(err));

const dateMessage = () => {
  let date = new Date();
  return date.getDate() +'-'+ date.getMonth() +'-'+ date.getFullYear() +','+ date.getHours()+':'+date.getMinutes();
} 

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
    findUser(chatId)
      .then(res => {
        console.log(res);
        if(res.length === 0) return addUser(chatId, socket.id)
      }).then(res => {
        console.log(res);
      })
      .catch(err =>  console.log(err));
    //!Ищем пользователя по socketId в массиве users
    // let user = users.find(item => item.socketId === socket.id);
    // console.log(user, message);
    // let name = (user === undefined || user.name !== undefined || user.name !== '') ? 'USER\n[' + users.indexOf(user) + ']' : user.name;
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
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  localStorage.setItem('bot_chat_id', id);
  const socketId = localStorage.getItem('socketId');
  io.to(socketId).emit('new message', text);
});
//! bot.sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg" );
//! bot.sendAudio(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');