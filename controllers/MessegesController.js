const { 
  addMessage, 
  getIdManager,
  findUser,
  getUsers,
  getMesseges,
} = require('../database/api');



class MessegesController {
  async addMessage(chatId, socketId, messageId, text, time) {
    await addMessage(chatId, socketId, messageId, text, time);
    console.log('Сообщение добавлено в базу.');
  }
  async sendMessegesToBot(bot, io, text, chatId, socket){
    const manager = await getIdManager();
    const userData = await findUser(chatId);
    const userName = (userData[0].name === null)? 'user['+userData[0].id+']' : userData[0].name + '['+userData[0].id+']';
    if (manager.length !== 0) {
      bot.sendMessage(manager[0].managerId, userName + '\n' + text);
      console.log('Отправлено в бот.');
      // Статус сообщение устанавливается как отправленное 
      // Клиенту сообщается об отправке сообщения
    } else {
      //! Впоследствии заменить на "notification"  с разработкой функционала отображения на стороне клиента шапке окна
      io.to(socket.id).emit('new message', 'Менеджер offline!');
      console.log('Пользователю сообщил, что менеджера нет в сети.');
    }
  }
  // |U1 ON: 2| |U2 OFF:12| |U3 ON: 2| |Viktor3 OFF:12|
  async sendListMailsToBot(bot, id){
    const users = await getUsers();
    const messages = await getMesseges();
    const arr = users.map(current => {
      let name = (current.name === null)? 'U['+current.id+']' : current.name + '['+current.id+']';
      let status = (current.online === 0)? 'OFF' : 'ON';
      console.log(current.chatId);
      let userMesseges = messages.reduce((result, message) => {
        if(messages.chatId === current.chatId){
          return [...result, message]
        }
        
      }, [])
      console.log(userMesseges)
      // console.log({ text: name + ' ' + status + ': ' + messeges.length, callback_data: '/' + current.chatId })
      // return [{ text: name + ' ' + status + ': ' + messeges.length, callback_data: '/' + current.chatId }];
    })
    console.log(arr)
    // const sections = {
    //   reply_markup: JSON.stringify({ inline_keyboard: arr })
    // }
    // bot.sendMessage(id, 'Выберите раздел: ', sections);
  }
}

module.exports = new MessegesController();
// const users = [
//   { id: '123', name: 'John' },
//   { id: '345', name: 'Anna' },
//   { id: '567', name: 'Kate' },
//   { id: '789', name: 'Jane' }
// ]

// function groupNameById(result, user) {
//   return {
//     ...result,
//     [user.id]: user.name
//   }
// }