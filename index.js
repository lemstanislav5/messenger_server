const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
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
app.use(express.urlencoded({ extended: true }))
app.use(express.static('static'));

app.use('/api', routes);
app.use('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
app.get('/', (req, res) => { res.send('Тестовый сайт на node js') });

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

io.on('connection', socket => {
  let user = users.find(item => item.socketId === socket);
  if(user === undefined) [...users, {socketId: socket.id, name: '', email: ''}];
  console.log('A user connected');
  socket.on('new message', data => {
    let user = users.find(item => item.socketId === socket);
        debugger
    let name = (user.name === '') ? 'user[' + users.indexOf(res) + 1 + ']: ' : user.name;
    localStorage.setItem('socketId', socket.id);
    const chatId = localStorage.getItem('bot_chat_id');
    if(chatId === null) return console.log('Manager offline!')
    bot.sendMessage(chatId, name + '\n' + data.message);
  });
  socket.on('disconnect', () => console.log('A user disconnected'));
});
bot.on('message', (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  localStorage.setItem('bot_chat_id', id);
  const socketId = localStorage.getItem('socketId');
  io.to(socketId).emit('new message', text);
});
