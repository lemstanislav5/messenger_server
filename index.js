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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('static'));

app.use('/api', routes);
app.use('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');//!BUILD CLIENT
})
app.get('/', (req, res) => {
  res.send('<h2>Тестовый сайт на node js</h2>');
});

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

io.on('connection', socket => {
  console.log('A user connected');
  socket.on('message', data => {
      localStorage.setItem('current_visitor_id', socket.id);
      console.log(data)
      const chatId = localStorage.getItem('bot_chat_id');
      if(chatId === null) return console.log('Manager offline!')
      bot.sendMessage(chatId, data.message);
      // socket.emit(`[${socket.id}]: ${message}`) OR socket.broadcast.emit(`[${socket.id}]: ${message}`)
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  bot.on('message', (message) => {
    console.log(message)
    const {chat, date, text} = message;
    const {id, first_name, last_name, username}  = chat;
    localStorage.setItem('bot_chat_id', id);
    const current_visitor_id = localStorage.getItem('current_visitor_id');
    socket.send(current_visitor_id, text);
  })
})
