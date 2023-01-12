const express = require('express'),
  router = express.Router(),
  UserController = require('../controllers/UserController');
//require('../controllers/users.controller'),
const { firsDatabaseInitialization } = require('../database/api')
//controllers хранит классы, методы которого выступают обработчиками маршрутов
//services также находятся классы, но их методы отвечают за поставку данных контроллерам

// router.use(async (req, res, next) => {
//   let data = false //await UsersService(req)

//   if (data) {
//     req.users = data
//     next()
//   } else
//     return res
//       .status(500)
//       .send({ message: 'Error while getting users' })
// })

router
  .route('/')
  // .get(UserController.getUsers)
  .post(UserController.getUsers)
  // .put(UserController.getUsers)
  // .delete(UserController.getUsers)

module.exports = router
