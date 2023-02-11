const { databaseInitialization } = require('../database/api');

class InitializationController {
  async initialization() {
    await databaseInitialization();
    console.log('База данных создана.');
  }
}

module.exports = new InitializationController()