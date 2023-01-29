const TelegramBot = require('node-telegram-bot-api');
const TELEGRAM_API_TOKEN = '5125888850:AAEmdLUNHNSFWahk6G1xZRuF1apv9lfcGIY';
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
const localStorage = require('./modules/localStorage')();
const PASSWORD = '555666';

const port = 4000;
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
    res.sendFile(__dirname + '/index.html');
})
app.get('/', (req, res) => {
  res.send('Тест');
});


io.on('connection', socket => {
  console.log('A user connected');
  socket.on('disconnect',  () => {
      console.log('A user disconnected');
  });
  socket.on('message', message => {
    console.log(message)
    console.log(socket.id)
    socket.send(socket.id, 'Sent a message 4seconds after connection!');
    socket.emit(`[${socket.id}]: ${message}`)
    socket.broadcast.emit(`[${socket.id}]: ${message}`)
  })
})

http.listen(port, () => {
  console.log('listening on *:' + port);
});

io.on('connection', socket => {
  console.log('A user connected');
//   setTimeout(function() {
//     //Sending an object when emmiting an event
//     socket.send('Sent a message 4seconds after connection!');
//  }, 4000);

  socket.on('disconnect', function () {
      console.log('A user disconnected');
  });
  socket.on('message', message => {
    console.log(message)
    console.log(socket.id)
    socket.send(socket.id, 'Sent a message 4seconds after connection!');
    socket.emit(`[${socket.id}]: ${message}`)
    socket.broadcast.emit(`[${socket.id}]: ${message}`)
  })
})
