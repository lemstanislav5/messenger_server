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

module.exports = {
    databaseInitialization: () => {
        return Promise.all([
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT, `socketId` TEXT, `name` TEXT, `email` TEXT, `phone` TEXT)"),
            query('logs.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `messageId` TEXT, `text` TEXT, `time`  INTEGER)"),
        ])
    },
    // БЕЗ IP-адреса и времени соединения
    addUser: (chatId, socketId) => {
        return query('data.db3', 'run', 'INSERT INTO users (chatId, socketId) values ("' + chatId + '","' + socketId + '")', []);
    },
    addMessage: (chatId, socketId, messageId, text, time) => {
        return query('data.db3', 'run', 'INSERT INTO users (chatId, socketId, messageId, text, time) values ("' +
        chatId + '","' + socketId + '","' + messageId + '","' + text + '","' + time + '")', []);
    },
    findUser: (chatId) => {
        return query('data.db3', 'all', 'SELECT * FROM users WHERE WHERE chatId = "' + chatId + '"', [])
            .then(res=>{ return res });
    }
}
