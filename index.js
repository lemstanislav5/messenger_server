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

let users = [];
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
  //Ищем пользователя по socketId в массиве users
  let user = users.find(item => item.socketId === socket.id);
  // Добавить пользователя в массив
  if(user === undefined) users.push({socketId: socket.id, name: '', email: ''});
  console.log('A user connected');
  console.log(user);
  socket.on('new message', data => {
    let user = users.find(item => item.socketId === socket.id);
    console.log(user);
    let name = (user === undefined && user.name !== undefined && user.name !== '') ? user.name : 'USER\n[' + users.indexOf(user) + ']';
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
    

})

bot.on('message', (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  localStorage.setItem('bot_chat_id', id);
  const socketId = localStorage.getItem('socketId');
  io.to(socketId).emit('new message', text);
});