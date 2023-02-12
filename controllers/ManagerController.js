const { 
  updateManagerAccest, 
  addManager, 
  findManager,
 } = require('../database/api');

class ManagerController {
  async accest(id) {
    await updateManagerAccest(id);
    console.log('Доступ открыт!');
  }
  async add(id){
    await addManager(id);
    console.log('Менеджер добавлен!');
  }
  get(id){
    console.log('Получаем менеджера!');
    return findManager(id);
  }
}

module.exports = new ManagerController()