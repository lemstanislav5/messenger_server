const sqlite3 = require('sqlite3').verbose();
const query = (file, req, sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file, (err) => {
            if (err) console.error(err.message);
        });
        db.serialize(() => db[req](sql, params,
            (err,res) => {
                if(err) return reject(err);
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
            query('data.db3', 'run', "CREATE TABLE if not exists `manager` (`managerId` TEXT, `accest` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `messageId` TEXT, `text` TEXT, `time`  INTEGER)"),
        ])
    },
    addUser: (chatId, socketId) => (query('data.db3', 'run', 'INSERT INTO users (chatId, socketId) values ("' + chatId + '","' + socketId + '")', [])),
    addMessage: (chatId, socketId, messageId, text, time) => (query('data.db3', 'run', 'INSERT INTO messages (chatId, socketId, messageId, text, time) values ("' +
    chatId + '","' + socketId + '","' + messageId + '","' + text + '","' + time + '")', [])),
    findUser: (chatId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE chatId = "' + chatId + '"', [])),
    updateSocketId: (chatId, socketId) => (query('data.db3', 'run', 'UPDATE users SET socketId=? WHERE chatId=?', [socketId, chatId])),
    addManager: (managerId, accest = 0) => (query('data.db3', 'run', 'INSERT INTO manager (managerId, accest) values ("' + managerId + '","' + accest + '")', [])),
    findManager: (managerId) => (query('data.db3', 'all', 'SELECT * FROM manager WHERE managerId = "' + managerId + '"', [])),
    updateManagerAccest: (managerId, accest = 1) => (query('data.db3', 'run', 'UPDATE manager SET accest=? WHERE accest=?', [socketId, managerId])),
    getIdManager: () => (query('data.db3', 'all', 'SELECT * FROM manager', [])),
}
