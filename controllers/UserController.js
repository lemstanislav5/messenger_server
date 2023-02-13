const { 
  databaseInitialization, 
  addUser, 
  findUser, 
  addMessage, 
  updateSocketId, 
  addManager, 
  findManager, 
  updateManagerAccest,
  getIdManager, 
  setCurrentUser,
  getCurrentUser,
  getAllUsers,
  delCurrentUser,
} = require('../database/api');



class UsersController {
  async addOrUpdateUser(socket, chatId) {
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
  async setCurrent(chatId, required){
    const users = await getCurrentUser();
    console.log('users', users)
    console.log(users.length, required)
    if(users.length === 0 || required === 1) {
      await setCurrentUser(chatId);
      console.log('Текущим пользователем выбран: ' + chatId);
    } 
  }
  async delCurrent(chatId){
    await delCurrentUser(chatId);
    console.log('Статус "текущий" у пользователя ' + chatId + ' удален в разъединением связи!');
  }
  getCurrent(){
    return getCurrentUser();
  }
  getSocketCurrentUser(chatId){
    console.log('Получаем пользовтаеля!');
    const user = findUser(chatId);
    if (user.length === 0) return false;
    return user[0].socketId;
  }
}

module.exports = new UsersController();
