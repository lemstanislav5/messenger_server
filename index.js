const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
console.log(URL, TELEGRAM_API_TOKEN, PASSWORD, PORT);
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
const localStorage = require('./modules/localStorage')();

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http),
      routes = require('./routes/index'),
      users = [];

app.use(express.json())
   .use(express.urlencoded({ extended: true }))
   .use(express.static('static'))
   .use('/api', routes)
   .use('/index.html', (req, res) => {res.sendFile(__dirname + '/index.html')})
   .get('/', (req, res) => {res.send('<h2>Тестовый сайт на node js</h2>')});

http.listen(PORT, () => {console.log('listening on *:' + PORT)});

io.on('connection', socket => {
  let user = users.find(item => item.id === socket);
  if(user === undefined) [...users, {id:'test_hash', name: '', email: ''}];
  console.log('A user connected');
  socket.on('new message', data => {
    localStorage.setItem('socketId', socket.id);
    const chatId = localStorage.getItem('bot_chat_id');
    if(chatId === null) return console.log('Manager offline!')
    bot.sendMessage(chatId, data.message);
  });
  socket.on('disconnect', () => console.log('A user disconnected'));
});
bot.on('message', (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  localStorage.setItem('bot_chat_id', id);
  const socketId = localStorage.getItem('socketId');
  io.to(socketId).emit('new message', socketId + '\n' + text);
});
