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
  // В зависимости от результата поиска добовляем или обновляем socketId
  async addOrUpdateUser(socket, chatId) {
    // Ищем пользователя по chatId в базе users
    const user = await findUser(chatId);
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
