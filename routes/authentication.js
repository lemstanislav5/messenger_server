const express = require('express'),
  router = express.Router(),
  UserController = e => {
    return console.log(e);
  }
//require('../controllers/users.controller'),
  { firsDatabaseInitialization } = require('../database/api')
//controllers хранит классы, методы которого выступают обработчиками маршрутов
//services также находятся классы, но их методы отвечают за поставку данных контроллерам

router.use(async (req, res, next) => {
  let data = await UsersService(req)

  if (data) {
    req.users = data
    next()
  } else
    return res
      .status(500)
      .send({ message: 'Error while getting users' })
})

router
  .route('/')
  .get(UserController)
  .post(UserController)
  .put(UserController)
  .delete(UserController)

module.exports = router
