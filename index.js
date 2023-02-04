const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
let SOCKET = null;
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
const localStorage = require('./modules/localStorage')();

const dateMessage = () => {
  let date = new Date();
  return date.getDate() +'-'+ date.getMonth() +'-'+ date.getFullYear() +','+ date.getHours()+':'+date.getMinutes();
} 

//localStorage.getItem(id)
// firsDatabaseInitialization()
//     .then(res => {
      
//     })

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
  res.send('Тест');
});

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

io.on('connection', socket => {
  SOCKET = socket;
  console.log('A user connected');
})

SOCKET.on('disconnect', function () {
  console.log('A user disconnected');
});
SOCKET.on('message', message => {
localStorage.setItem('current_visitor_id', socket.id);
console.log(message)
console.log(socket.id)
//!bot.sendMessage(chatId, 'Received your message'); откуда взять chatId??
// socket.send(socket.id, 'Sent a message 4seconds after connection!');
// socket.emit(`[${socket.id}]: ${message}`)
// socket.broadcast.emit(`[${socket.id}]: ${message}`)
})

bot.on('message', (message) => {
  const {chat, date, text} = message;
  const {first_name, last_name, username}  = chat;
  const id = localStorage.setItem('current_visitor_id');
  const messages = JSON.stringify({ id, type: 'to', text: message, date: dateMessage(), serverAccepted: false, botAccepted: false });
  SOCKET.send(id, messages);
})