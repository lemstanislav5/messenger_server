const express = require('express'),
  router = express.Router(),
  UserController = require('../controllers/UserController');
//require('../controllers/users.controller'),
const { firsDatabaseInitialization } = require('../services/database')
//controllers хранит классы, методы которого выступают обработчиками маршрутов
//services также находятся классы, но их методы отвечают за поставку данных контроллерам

router.use(async (req, res, next) => {
  firsDatabaseInitialization()
    .then(result => {
      console.log(1)
      //! УКАЗАТЬ ОПИСАНИЕ ФУНКЦИИ
      next()
    })
    .catch(err => {
      console.log(err)
      return res
        .status(500)
        .send({ message: 'Error while getting users' })
    })
})

router
  .route('/')
  // .get(UserController.getUsers)
  .post(UserController.getUsers)
  // .put(UserController.getUsers)
  // .delete(UserController.getUsers)

module.exports = router
