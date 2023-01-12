const sqlite3 = require('sqlite3').verbose();
const query = (file, req, sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file, (err) => {
            if (err) console.error(err.message);
        });
        db.serialize(() => db[req](sql, params,
            (err,res) => {
                if(err) reject(err);
                resolve(res);
            }
        ));
        db.close((err) => {
            if (err) return console.error(err.message);
        });
    });
}
//! ошибка:  Error: SQLITE_BUSY: database is locked
//? При использовании функции "query" в цикле "forEach" возникает указанная ошибка поътому в функциях "addOrganizations" и "addExtremistMaterial" осталась старая реализация

module.exports = {
    firsDatabaseInitialization: () => {
        return Promise.all([
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `login` TEXT, `code` TEXT, `online` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `text` TEXT, `time` INTEGER, `user_id` INTEGER, `chat_id INTEGER)"),
            //Чат будет содержать как личные так и групповые сообщения. Возможно необходимо продумать функцию выдачи токенов конкретного чата.
            query('data.db3', 'run', "CREATE TABLE if not exists `chats` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `users_chat` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chat_id` INTEGER, `user_id` INTEGER,  `status` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `contacts` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` INTEGER, `contacts_id` INTEGER,  `contacts_name` TEXT)"),
        ])
    },
    checkFreeLogin:(login) => {
      return query('data.db3', 'get', 'SELECT * FROM users WHERE  login = "' + login + '"', [])
          .then(res=>{ return res });
          //return true or false
    },
    authorization: (user_id) => {
        return query('data.db3', 'get', 'SELECT * FROM users WHERE  user_id = "' + user_id + '"', [])
            .then(res=>{ return res });
    },
    addUser: (user_id, login, password) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
    getMessages: (user_id) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
    sendMessage: (user_id, login, password) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
}
