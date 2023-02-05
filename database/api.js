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
    firsDatabaseInitialization: () => {
        return Promise.all([
            // таблица пользователей
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `socketId` TEXT, `name` TEXT, `email` TEXT, `phone` TEXT)"),
            // таблица сообщений
            query('logs.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `socketId` TEXT,, `message_id` TEXT, `text` TEXT, `time`  INTEGER)"),
        ])
    },
    addUser: (user_id, first_name, last_name, access) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
    addMessage: (user_id, first_name, last_name, access) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
    findUser: (user) => {
        return query('data.db3', 'all', 'SELECT * FROM users WHERE content LIKE ?', ['%' + str + '%'])
            .then(res=>{ return res });
    },
    messagesLogging: ({id, first_name, last_name, username, date, text}) => {
        return query('logs.db3', 'run', "INSERT INTO `messages` (`user_id`, `first_name`, `last_name`, `username`, `date`, `text`) VALUES('"+
                id +"', '"+ first_name +"', '"+ last_name +"', '"+ username +"', '"+ date +"', '"+ text +"')");
    },
    eventsLogging: ({id, first_name, last_name, username, date, text}) => {
        return query('logs.db3', 'run', "INSERT INTO `events` (`name`, `status`, `result` TEXT, `date`) VALUES('"+
                id +"', '"+ first_name +"', '"+ last_name +"', '"+ username +"', '"+ date +"', '"+ text +"')");
    },
    latestUpdateTime: (material, updateTime) => {
        return query('data.db3', 'get', 'SELECT time FROM updates WHERE  id = (SELECT MAX(id) FROM updates WHERE material = "' + material + '")', [])
            .then(res=>{
                if(res === undefined || new Date().getTime() - parseInt(res.time) > updateTime) return false;
                return true;
            });
    },
    updateTime: (material) => {
        const time = new Date().getTime();
        return query('data.db3', 'get', "INSERT INTO `updates`  (`material`, `time`) VALUES('"+ material +"', '"+ time +"')", [])
            .then(res=>{ return true });
    },
    
    findMaterials: (str) => {
        //!'Badroom'.toLowerCase() === 'Badroom' ВОЗМОЖНО ПЕРЕДЕЛАТЬ ФУНКЦИЮ С ДОБАВЛЕНИЕМ ВТОРОГО ЗАПРОСА, УЧИТЫВАЮЩЕГО РЕГИСТР
        return query('data.db3', 'all', 'SELECT * FROM extremist_materials WHERE content LIKE ?', ['%' + str + '%'])
            .then(res=>{ return res });
    },
    authorization: (user_id) => {
        return query('data.db3', 'get', 'SELECT * FROM users WHERE  user_id = "' + user_id + '"', [])
            .then(res=>{ return res });
    },
    addUser: (user_id, first_name, last_name, access) => {
        return query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name,access) values ("' +
            user_id + '","' + first_name + '","' + last_name + '",' + access + ')', []);
    },
    getAccess: (user_id) => {
        return query('data.db3', 'run', 'UPDATE users SET access=? WHERE user_id=?', [1, user_id]);
    },
    // delAccess: (user_id) => {
    //     return query('data.db3', 'run', 'DELETE FROM users WHERE user_id = "' + user_id + '"', [])
    // },
    findExtremistOrganizations: (str) => {
        return query('data.db3', 'all', 'SELECT * FROM extremist_organizations WHERE content LIKE ?', ['%' + str + '%']);
    },
    findUnwanted_organizations: (str) => {
        return query('data.db3', 'all', 'SELECT * FROM unwanted_organizations WHERE content LIKE ?', ['%' + str + '%']);
    },
}
