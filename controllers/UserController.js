const { 
  databaseInitialization, 
  addUser, findUser, 
  addMessage, 
  updateSocketId, 
  addManager, 
  findManager, 
  updateManagerAccest,
  getIdManager, 
  setCurrentUser,
  getCurrentUser,
  getUsers,
} = require('../database/api');



class UsersController {
  async addOrUpdateUser(user, socket, chatId) {
    if (user.length === 0) {
      await addUser(chatId, socket.id);
      console.log('Пользователь добавлен.');
    } else if (user.length > 0 && user[0].socketId !== socket.id) {
      await updateSocketId(chatId, socket.id); 
      console.log('Сокет обновлен.');
    } else {
      console.log('Сокет не нуждается в обновлении.');
    }
  }
}

module.exports = new UsersController()
