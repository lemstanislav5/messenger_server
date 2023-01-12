const express = require('express'),
  router = express.Router(),
  usersRoutes = require('./authentication')

router.use('/authentication', usersRoutes)
//router.use('/users', usersRoutes)


module.exports = router
