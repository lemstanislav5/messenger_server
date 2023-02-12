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
  async get(id){
    await findManager(id);
    console.log('Ищем менеджера!')
  }
}

module.exports = new ManagerController()