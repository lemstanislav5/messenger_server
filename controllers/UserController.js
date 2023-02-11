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
  delCurrentUser,
} = require('../database/api');



class UsersController {
  async addOrUpdateUser(socket, chatId) {
    // Ищем пользователя по chatId в базе users
    const user = await findUser(chatId);
    console.log(user)
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
  async currentUser(chatId, required){
    const users = await getUsers();
    console.log(users)
    if(users.length === 0 || required === 1) {
      await setCurrentUser(chatId);
      console.log('Текущим пользователем выбран: ' + chatId);
    } else {
      await delCurrentUser(chatId);
      console.log('Статус "текущий" у пользователя ' + chatId + ' удален в разъединением связи!');
    }
  }
}

module.exports = new UsersController();
