const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const localStorage = require('./modules/localStorage')();
const { 
  databaseInitialization, 
  addUser, findUser, 
  addMessage, 
  updateSocketId, 
  addManager, 
  findManager, 
  updateManagerAccest,
  getIdManager, 
} = require('./database/api');
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
  socket.on('new message', async message => {
    const { id, text, chatId } = message;
    // Ищем пользователя по chatId в базе users
    const user = await findUser(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    if(user.length === 0) {
      await addUser(chatId, socket.id);
      console.log('Пользователь добавлен.');
    } else if(user.length > 0 && user.socketId !== socket.id){
      await updateSocketId(chatId, socket.id);
      console.log('Сокет обновлен.', user.socketId, socket.id);
    } else {
      console.log('Сокет не изменен.');
    }
    await addMessage(chatId, socket.id, id, text, new Date().getTime());
    console.log('Сообщение добавлено в базу.');
    const manager = await getIdManager();
    const userData = await findUser(chatId);
    const userName = (userData.name === null)? 'user['+user.id+']' : '['+user.id+']';
    if (manager.length !== 0) 
      return bot.sendMessage(manager[0].manager, userName + '\n' + message.text);

    // console.log(managerId)
    // bot.sendMessage(res[0].manager, name + '\n' + message.text);
    // if(managerId)
    // let user = users.find(item => item.socketId === socket.id);
    // console.log(user, message);
    // let name = (user === undefined || user.name !== undefined || user.name !== '') ? 'USER [' + users.indexOf(user) + ']' : user.name;
    // localStorage.setItem('socketId', socket.id);
    // const chat_id = localStorage.getItem('bot_chat_id');
    // if(chatId === null) return console.log('Manager offline!')
    // bot.sendMessage(chat_id, name + '\n' + message.text);


    // findUser(chatId)
    //   .then(res => {
    //     console.log('findUser:', res);
    //     if(res.length === 0) {
    //       // Если пользователя нет добавляем
    //       console.log('addUser');
    //       return addUser(chatId, socket.id);
    //     } else {
    //       if(res.socketId === socket.id) return console.log('Сокет не изменен!')
    //       console.log(res.socketId, socket.id);
    //       // Если пользователь есть меням socketId
    //       console.log('updateSocketId');
    //       return updateSocketId(chatId, socket.id);
    //     }
    //   }).then(res => {
    //     console.log('addMessage');
    //     return addMessage(chatId, socket.id, id, text, new Date().getTime())
    //   }).then(res => {
    //     console.log(res);
    //   })
    //   .catch(err =>  console.log(err));
      
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

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = await findManager(id);
  if(manager.length === 0) {
    addManager(id)
      .then(() => console.log('Add manager'))
      .catch(err => console.log(err));
  }
  if(text === '/start'){
    console.log('Выдать меню и показать список активных чатов с возможность выбора переписки');
    // |U1 ON: 2| |U2 OFF:12| |U3 ON: 2| |Viktor3 OFF:12|
  } else if(text === PASSWORD) {
    console.log('Доступ открыт!');
    updateManagerAccest(id);
  } else {
    console.log('----------', manager.accest, id);
    if(manager.accest === 0) return bot.sendMessage(id, 'Введите пароль:');
  }
  localStorage.setItem('bot_chat_id', id);
  // const socketId = localStorage.getItem('socketId');
  // io.to(socketId).emit('new message', text);
});
//! bot.sendPhoto(msg.chat.id,"https://www.somesite.com/image.jpg" );
//! bot.sendAudio(msg.chat.id, 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg');
