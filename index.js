const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
console.log(URL, TELEGRAM_API_TOKEN, PASSWORD, PORT);
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
const localStorage = require('./modules/localStorage')();

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http),
      routes = require('./routes/index');

let users = [];

app.use(express.json())
   .use(express.urlencoded({ extended: true }))
   .use(express.static('static'))
   .use('/api', routes)
   .use('/index.html', (req, res) => {
     res.sendFile(__dirname + '/index.html');
   })
   .get('/', (req, res) => { res.send('Тестовый сайт на node js') });

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

io.on('connection', socket => {
  //Ищем пользователя по socketId в массиве users
  let user = users.find(item => item.socketId === socket.id);
  // Добавить пользователя в массив 
  if(user === undefined) users.push({socketId: socket.id, name: '', email: ''});
  console.log('A user connected');
  socket.on('new message', data => {
    //Ищем пользователя по socketId в массиве users
    let user = users.find(item => item.socketId === socket.id);
    //Если пользователь предтставился указываем его имя, в противном случае идентификатор сокета
    let name = (user === undefined && user.name !== undefined && user.name !== '') ? user.name : 'user unknown\n[socketId' + socket.id + ']';
    localStorage.setItem('socketId', socket.id);
    const chatId = localStorage.getItem('bot_chat_id');
    if(chatId === null) return console.log('Manager offline!')
    bot.sendMessage(chatId, name + '\n' + data.message);
  });
  socket.on('disconnect', () => {
    //Ищем пользователя по socketId в массиве users
    let user = users.find(item => item.socketId === socket.id);
    //Определям индекс пользователя
    let index = users.indexOf(user);
    //Удаляем пользователя из массива
    users.splice(1, index);
    console.log('A user disconnected')
  });
});
bot.on('message', (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  localStorage.setItem('bot_chat_id', id);
  const socketId = localStorage.getItem('socketId');
  io.to(socketId).emit('new message', text);
});
