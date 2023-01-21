const { getUsersService, addUserService, updateUserService, conformCodeAuthentication } = require('../services/database')
const getRandomInt = (min, max) => {
  return  Math.floor(Math.random() * (max - min)) + min;
}
class UsersController {
  getUsers(req, res) {
    console.log(req.body)
    if(req.body !== undefined && req.body.type  === 'authentication'){
      getUsersService(req.body.phone)
        .then(result => {
          let code = 1000;// getRandomInt(1000, 9999);
          if(result === undefined){
            return addUserService(req.body.phone, code);
          } else {
            return updateUserService(req.body.phone, code);
          }
        })
        .then(result => {
          return res
            .status(200)
            .send({ type: 'authentication', status: 'enter_code' })
        })
        .catch(err => {
          console.log(err);
          return res
            .status(404)
            .send({ type:"error" })
        })
    } else if(req.body !== undefined && req.body.type  === 'conform'){
      conformCodeAuthentication(req.body.phone, req.body.code)
        .then(result => {
          return res
            .status(200)
            .send({ type: 'conform', status: 'ok' })
        })
        .catch(err => {
          console.log(err);
          return res
            .status(404)
            .send({ type:"error" })
        })
    }
    
    // if (req.query.id) {
    //   if (req.users.hasOwnProperty(req.query.id))
    //     return res
    //       .status(200)
    //       .send({ data: req.users[req.query.id] })
    //   else
    //     return res
    //       .status(404)
    //       .send({ message: 'User not found.' })
    // } else if (!req.users)
    //   return res
    //     .status(404)
    //     .send({ message: 'Users not found.' })

    // return res.status(200).send({ data: req.users })
  }

  // async createUser(req, res) {
  //   if (req.body.user && req.body.user.id) {
  //     if (req.users.hasOwnProperty(req.body.user.id))
  //       return res
  //         .status(409)
  //         .send({ message: 'User already exists.' })

  //     req.users[req.body.user.id] = req.body.user

  //     let result = await UsersService.createUser(req.users)

  //     if (result) return res.status(200).send(result)
  //     else
  //       return res
  //         .status(500)
  //         .send({ message: 'Unable create user.' })
  //   } else
  //     return res
  //       .status(400)
  //       .send({ message: 'Bad request.' })
  // }

  // async updateUser(req, res) {
  //   if (req.body.user && req.body.user.id) {
  //     if (!req.users.hasOwnProperty(req.body.user.id))
  //       return res
  //         .status(404)
  //         .send({ message: 'User not found.' })

  //     req.users[req.body.user.id] = req.body.user

  //     let result = await UsersService.updateUser(req.users)

  //     if (result) return res.status(200).send(result)
  //     else
  //       return res
  //         .status(500)
  //         .send({ message: 'Unable update user.' })
  //   } else
  //     return res
  //       .status(400)
  //       .send({ message: 'Bad request.' })
  // }

  // async deleteUser(req, res) {
  //   if (req.query.id) {
  //     if (req.users.hasOwnProperty(req.query.id)) {
  //       delete req.users[req.query.id]

  //       let result = await UsersService.deleteUser(
  //         req.users
  //       )

  //       if (result) return res.status(200).send(result)
  //       else
  //         return res
  //           .status(500)
  //           .send({ message: 'Unable delete user.' })
  //     } else
  //       return res
  //         .status(404)
  //         .send({ message: 'User not found.' })
  //   } else
  //     return res
  //       .status(400)
  //       .send({ message: 'Bad request.' })
  // }
}

module.exports = new UsersController()
