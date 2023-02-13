const { 
  updateManagerAccest, 
  addManager, 
  findManager,
  getManager,
 } = require('../services/api');

class ManagerController {
  async accest(id) {
    await updateManagerAccest(id);
    console.log('Доступ открыт!');
  }
  async add(id){
    await addManager(id);
    console.log('Менеджер добавлен!');
  }
  find(id){
    console.log('Получаем менеджера!');
    return findManager(id);
  }
  get(){
    console.log('Получаем менеджера!');
    return getManager();
  }
}

module.exports = new ManagerController()