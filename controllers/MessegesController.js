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
  async sendMessegesToBot(bot, message){
    const manager = await getIdManager();
    const userData = await findUser(chatId);
    const userName = (userData[0].name === null)? 'user['+userData[0].id+']' : '['+userData[0].id+']';
    if (manager.length !== 0) 
    return bot.sendMessage(manager[0].managerId, userName + '\n' + message.text);
    //! Впоследствии заменить на notification  с разработкой функционала отображения на стороне клиента шапке окна
    return io.to(socket.id).emit('new message', 'Менеджер offline!');
  }
}

module.exports = new MessegesController();