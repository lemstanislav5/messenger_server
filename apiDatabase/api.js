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
        // основные таблицы материалов
            query('data.db3', 'run', "CREATE TABLE if not exists `extremist_materials` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `title` TEXT, `link` TEXT, `pubDate` TEXT, `content` TEXT, `contentSnippet` TEXT, `guid` TEXT, `isoDate` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `extremist_organizations` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `content` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `unwanted_organizations` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `content` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` TEXT, `first_name` TEXT, `last_name` TEXT, `access` INTEGER)"),
            //таблица обновления материалов
            query('data.db3', 'run', "CREATE TABLE if not exists `updates` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `material` TEXT, `time` INTEGER)"),

            // таблица логирования сообщений
            query('logs.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` TEXT, `first_name` TEXT, `last_name` TEXT, `username` TEXT, `date` INTEGER, `text` TEXT)"),
            // таблица логирования событий
            query('logs.db3', 'run', "CREATE TABLE if not exists `events` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `status` TEXT, `result` TEXT, `date` INTEGER)"),
        ])
    },
    messagesLogging: ({id, first_name, last_name, username, date, text}) => {  
        return query('logs.db3', 'run', "INSERT INTO `messages` (`user_id`, `first_name`, `last_name`, `username`, `date`, `text`) VALUES('"+ 
                id +"', '"+ first_name +"', '"+ last_name +"', '"+ username +"', '"+ date +"', '"+ text +"')");
    },
    //! ИЗМЕНИТЬ ДАННЫЕ ФУНКЦИИ eventsLogging она скопирована с messagesLogging без изменения параметров
    eventsLogging: ({id, first_name, last_name, username, date, text}) => { 
        return query('logs.db3', 'run', "INSERT INTO `events` (`name`, `status`              , `result` TEXT, `date`) VALUES('"+ 
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
    addExtremistMaterial: (items) => {
        //! Сократить функцию, убрать промис, задебажить ошибки
        const db = new sqlite3.Database('data.db3');
        return new Promise((resolve, reject) => {
            try {
                db.run('DELETE FROM `extremist_materials`', (err) => {
                    if(err) return;
                    console.log("DELETE FROM `extremist_materials`is done");

                    items.forEach((currentValue, index) => {
                        let { title, link, pubDate, content, contentSnippet, guid, isoDate } = currentValue;
                        db.run('INSERT INTO `extremist_materials` (`title`, `link`, `pubDate`, `content`, `contentSnippet`, `guid`, `isoDate`) VALUES (?,?,?,?,?,?,?)',
                          [
                            title === undefined? '' : title,
                            link === undefined? '' : link,
                            pubDate === undefined? '' : pubDate,
                            content === undefined? '' : content,
                            contentSnippet === undefined? '' : contentSnippet,
                            guid === undefined? '' : guid,
                            isoDate === undefined? '' : isoDate
                          ],
                          (err,results) => {
                            if (err) console.log('ошибка: ', err); 
                            if(index === items.length-1){
                                console.log(items.length + '/' + index);
                                resolve(true);
                            }
                          });
                      });  
                }); 
            } catch (error) {
                console.log(`Error With Select ALL(): \r\n ${error}`)
                reject();
            }
        });
    },
    addOrganizations: (items, organizations) => {
        //! Сократить функцию, убрать промис, задебажить ошибки
        const db = new sqlite3.Database('data.db3');
        return new Promise((resolve, reject) => {
            try {
                db.run('DELETE FROM `' + organizations + '`', (err) => {
                    if(err) return;
                    console.log('DELETE FROM `' + organizations + '`is done');
                    items.forEach((currentValue, index) => {
                        if(currentValue !== undefined){
                            db.run('INSERT INTO `' + organizations + '` (`content`) VALUES (?)',
                            [currentValue.replaceAll('&nbsp;', ' ').replaceAll('&laquo;', ' ').replaceAll('&raquo;', ' ')],
                            (err,results) => {
                                if (err) console.log('ошибка: ', err); 
                                if(index === items.length-1){
                                    console.log(items.length + '/' + index);
                                    resolve(true);
                                }
                            });
                        }
                      });  
                }); 
            } catch (error) {
                reject(console.log(`Error With Select ALL(): \r\n ${error}`));
            }
        });
    },
    findMaterials: (str) => { 
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
