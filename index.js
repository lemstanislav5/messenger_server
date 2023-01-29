const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
console.log(URL, TELEGRAM_API_TOKEN, PASSWORD);

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
  res.send('Тест');
});

http.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});

io.on('connection', socket => {
  console.log('A user connected');
  socket.on('disconnect', function () {
      console.log('A user disconnected');
  });
  socket.on('message', message => {
    console.log(message)
    console.log(socket.id)
    // socket.send(socket.id, 'Sent a message 4seconds after connection!');
    // socket.emit(`[${socket.id}]: ${message}`)
    // socket.broadcast.emit(`[${socket.id}]: ${message}`)
  })
})
