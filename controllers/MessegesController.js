const { 
  addMessage, 
  getIdManager,
  findUser,
} = require('../database/api');



class MessegesController {
  async addMessage(chatId, socketId, messageId, text, time) {
    await addMessage(chatId, socketId, messageId, text, time);
    console.log('Сообщение добавлено в базу.');
  }
  async sendMessegesToBot(bot, io, message){
    const manager = await getIdManager();
    const userData = await findUser(chatId);
    const userName = (userData[0].name === null)? 'user['+userData[0].id+']' : '['+userData[0].id+']';
    if (manager.length !== 0) {
      bot.sendMessage(manager[0].managerId, userName + '\n' + message.text);
      console.log('Сообщение добавлено в базу.');
    } else {
      //! Впоследствии заменить на "notification"  с разработкой функционала отображения на стороне клиента шапке окна
      io.to(socket.id).emit('new message', 'Менеджер offline!');
      console.log('Пользователю сообщил, что менеджера нет в сети.');
    }
  }
}

module.exports = new MessegesController();