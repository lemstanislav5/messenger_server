const process = require('process');
const fs = require("fs");
const { createWriteStream } = require('fs');
const util = require('./utilities/utilities');
const path = require('path');
const {URL, PASSWORD, PORT} = require('../config.js');
const bot = require('./services/telegramBot');
bot.setMyCommands([ { command: '/start', description: 'Старт(меню)' }]);

const UsersController = require('./controllers/UserController');
const MessegesController = require('./controllers/MessegesController');
const InitializationController = require('./controllers/InitializationController');
const ManagerController = require('./controllers/ManagerController');


const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http, { maxHttpBufferSize: 1e8, pingTimeout: 60000 });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/media*', (req, res) => {
  try {
    if (fs.existsSync(path.join(__dirname, req.originalUrl))) {
      return res.status(200).sendFile(path.join(__dirname, req.originalUrl));
    } 
    return res.status(202).send();
  } catch(err) {
    console.error(err);
  }
});

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
      return io.to(socket.id).emit('notification', 'Менеджер offline!');
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
    console.log(type);
    let section;
    if (type === 'jpeg' || type === 'jpg' || type === 'png') {
      section = 'images';
    } else if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') {
      section =  'documents';
    } else if (type === 'mp3' || type === 'mpeg') {
      section = 'audio';
    } else if (type === 'mp4' || type ===  'wav') {
      section = 'video';
    }
    let dir = __dirname + '/media/' + section;
    checkDirectory(dir); //await
    const fileName = new Date().getTime();
    const pathFile = 'http://' + URL + '/media/' + section + '/' + fileName + '.' + type;
    console.log(pathFile);
    fs.writeFile(dir + '/' + fileName + '.' + type, file, (err) => {
      if (err) {
        callback({url: false});
        console.log(err);
      }
      MessegesController.sendFile(bot, io, pathFile, section, callback, socket);
    });
  });

  socket.on('disconnect', () => {
    UsersController.delCurrent();
    console.log('Пользователь отсоединился!')
  });
})

bot.on('message', async (message) => {
  const {chat, date, text, photo, document, video, audio} = message;
  let type = false;
  let dir = false;
  let data = false;
  if (photo !== undefined) {
    data = await bot.getFile(photo[0].file_id);
    type = util.ext(file_path);
    if ('jpeg' || type === 'jpg' || type === 'png') dir = __dirname + '/media/images/';
  }
  if(video !== undefined) {
    data = await bot.getFile(video[0].file_id);
    type = util.ext(video.file_name);
    if (type === 'mp4' || type ===  'wav') dir = __dirname + '/media/video/';
  }
  if(document !== undefined) {
    console.log(document)
    data = await bot.getFile(document.file_id);
    type = util.ext(document.file_name);
    if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') dir = __dirname + '/media/documents/';
  }
  if(audio !== undefined) {
    data = await bot.getFile(audio[0].file_id);
    type = util.ext(audio.file_name);
    if (type === 'mp3' || type === 'mpeg') dir = __dirname + '/media/audio/';
  }
  if(type && dir && data) {
    const { file_id } = data;
    console.log(type, dir, file_id);
    if (await util.checkDirectory(dir, fs)) {
      const stream = await bot.getFileStream(file_id);
      stream.pipe(createWriteStream(dir + util.fileName(type)));
      stream.on('finish', () => {
        console.log('dane');
      });
    } else {
      console.log('no dir')
    }
  }

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

