const process = require('process');
const fs = require("fs");
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
console.log(process.pid);
const {URL, TELEGRAM_API_TOKEN, PASSWORD, PORT} = require('../config.js');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_API_TOKEN, {polling: true});
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const UsersController = require('./controllers/UserController');
const MessegesController = require('./controllers/MessegesController');
const InitializationController = require('./controllers/InitializationController');
const ManagerController = require('./controllers/ManagerController');

const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http);

app.use('/media/images/', express.static(__dirname + '/media/images/'));
app.use('/media/documents/', express.static(__dirname + '/media/documents/'));
app.use('/media/audio/', express.static(__dirname + '/media/audio/'));
app.use('/media/video/', express.static(__dirname + '/media/video/'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer({
  dest: path.join(__dirname, 'uploads')
});

app.post('/send',
  upload.fields([{name: 'fileEmailTo'}, {name: 'fileMessageTo'}]),
  (req, res) => {
    console.log(req.body);
    res.status(204).json({});
  }
);



http.listen(PORT, () => console.log('listening on *:' + PORT));
InitializationController.initialization();

io.on('connection', socket => {
  console.log('Пользователь подключился!');
  socket.on('newMessage', async (message, callback) => {
    let notification = {add: false, send: false}
    const { id, text, chatId } = message;
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.setCurrent(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);
    //! Если добавление успещшно message: { add: true, send: false}
    try {
      MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
      notification = {...notification, add: true};
    } catch (err) {
      console.error('MessegesController.add: ', err);
      return callback(true, notification);
    }

    const manager = await ManagerController.get(id);
    // Сообщаем пользователю об отсутствии менеджера
    if (manager.length === 0 || manager[0].accest === 0)
      return io.to(socket.id).emit('newMessage', 'Менеджер offline!');
    //! Если отправка успещшна message: { add: true, send: true}
    try {
      MessegesController.sendMessegesToBot(bot, io, text, chatId, socket);
      notification = {...notification, send: true};
      return callback(false, notification);
    } catch (err) {
      console.error('newMessage -> MessegesController.sendMessegesToBot: ', err);
      return callback(true, notification);
    }
  });

  socket.on('newNameAndEmail', async (message, callback) => {
    const { name, email, chatId } = message;
    let notification = {add: false, send: false}
    try {
      UsersController.setNameAndEmail(name, email, chatId);
      notification = {...notification, add: true};
    } catch (err) {
      console.error('UsersController.setUserNameAndEmail: ', err);
      return callback(true, notification);
    }
    try {
      MessegesController.sendMessegesToBot(bot, io, `Пользователь представился как: ${name} ${email}`, chatId, socket);
      notification = {...notification, send: true};
      return callback(false, notification);
    } catch (err) {
      console.error('newNameAndEmail -> MessegesController.sendMessegesToBot: ', err);
      return callback(true, notification);
    }
  });

  socket.on("upload", (file, type, callback) => {
    let section;
    if (type === 'jpeg' || type === 'jpg' || type === 'png') {
      section = 'images';
    } else if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') {
      section =  'documents';
    } else if (type === 'mp3' || type === 'mpeg') {
      section = 'audio';
      type = type === 'mpeg' &&  'mp4';
    } else if (type === 'mp4' || type ===  'wav') {
      section = 'video';
    }
    console.log(type);
    let dir = __dirname + '/media/' + section;
    console.log(dir);
    if (!fs.existsSync(dir)){
      fs.mkdir(dir, { recursive: true }, err => {
        if(err) throw err;
        console.log('Все папки успешно созданы!');
      });
    }
    const fileName = new Date().getTime();
    const pathFile = 'http://' + URL + '/media/' + section + '/' + fileName + '.' + type;
    console.log(pathFile);
    fs.writeFile(dir + '/' + fileName + '.' + type, file, (err) => {
      if (err) {
        callback({url: false});
        console.log(err);
      }
      MessegesController.sendFile(bot, pathFile, section, callback);
    });
  });

  socket.on('disconnect', () => {
    UsersController.delCurrent();
    console.log('Пользователь отсоединился!')
  });
})

bot.on('message', async (message) => {
  const {chat, date, text} = message;
  const {id, first_name, last_name, username}  = chat;
  const manager = await ManagerController.find(id);
  if (manager.length === 0) {
    // Менеджер добавляется один раз, при условии, что запись в базе отсутствует
    ManagerController.add(id);
    return MessegesController.sendBotNotification(bot, id, 'Введите пароль:');
  } else {
    if (manager[0].accest === 0) {
      if (text === PASSWORD) {
        ManagerController.accest(id);
        return MessegesController.sendBotNotification(bot, id, 'Доступ получен!');
      } else {
        return MessegesController.sendBotNotification(bot, id, 'Введите пароль:');
      }
    } else if (manager[0].accest === 1) {
      console.log(manager)
      if (text === '/start') {
        MessegesController.sendListMailsToBot(bot, id);
      } else {
        let currentUser = await UsersController.getCurrent();
        if (currentUser.length === 0) {
          return MessegesController.sendBotNotification(bot, id, 'Адресат вашего сообщения не выбран!');
        } else {
          const socketId = await UsersController.getSocketCurrentUser(currentUser[0].chatId);
          if (!socketId) return MessegesController.sendBotNotification(bot, id, 'Адресат не найден в базе!');
          io.to(socketId).emit('newMessage', text);
          //! Проверка доставки сообщения
          let idMessage = 9999999999 - Math.round(0 - 0.5 + Math.random() * (8999999999 - 0 + 1));
          MessegesController.add(id, socketId, idMessage, text, new Date().getTime(), 'to', read = 0);
        }
      }
    }

  }
});

bot.on('callback_query', async msg => {
  const chatId = msg.data;
  //! При выводе сообщений подьзователя обновляю данные сообщения как прочитанные
  //! MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', delivered = 1, read = 0);
  UsersController.setCurrent(chatId, 1);
});
