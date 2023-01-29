const sqlite3 = require('sqlite3').verbose();
const query = (file, req, sql, params, callback) => {
    const db = new sqlite3.Database(file, (err) => {
        if (err) console.error(err.message);
    });
    try {
        db.serialize(() => db[req](sql, params, callback));  
    } catch (error) {
        console.log(`Error With Select ALL(): \r\n ${error}`)
    }
    db.close((err) => {
        if (err) return console.error(err.message);
    });
}
//! ошибка:  Error: SQLITE_BUSY: database is locked
//? При использовании функции "query" в цикле "forEach" возникает указанная ошибка поътому в функциях "addOrganizations" и "addExtremistMaterial" осталась старая реализация

module.exports = {
    firsDatabaseInitialization: () => {    
        // основные таблицы материалов
        query('data.db3', 'run', "CREATE TABLE if not exists `extremist_materials` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `title` TEXT, `link` TEXT, `pubDate` TEXT, `content` TEXT, `contentSnippet` TEXT, `guid` TEXT, `isoDate` TEXT)");
        query('data.db3', 'run', "CREATE TABLE if not exists `extremist_organizations` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `content` TEXT)");
        query('data.db3', 'run', "CREATE TABLE if not exists `unwanted_organizations` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `content` TEXT)");
        query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` TEXT, `first_name` TEXT, `last_name` TEXT, `authorized` TEXT, `ban` TEXT)");
        //таблица обновления материалов
        query('data.db3', 'run', "CREATE TABLE if not exists `updates` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `material` TEXT, `time` INTEGER)");

        // таблица логирования сообщений
        query('logs.db3', 'run', "CREATE TABLE if not exists `messages` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_id` TEXT, `first_name` TEXT, `last_name` TEXT, `username` TEXT, `date` INTEGER, `text` TEXT)");
        // таблица логирования событий
        query('logs.db3', 'run', "CREATE TABLE if not exists `events` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `status` TEXT, `result` TEXT, `date` INTEGER)")

    },
    messagesLogging: ({id, first_name, last_name, username, date, text}) => {  
        query('logs.db3', 'run', "INSERT INTO `messages` (`user_id`, `first_name`, `last_name`, `username`, `date`, `text`) VALUES('"+ 
                id +"', '"+ first_name +"', '"+ last_name +"', '"+ username +"', '"+ date +"', '"+ text +"')");
    },
    //! ИЗМЕНИТЬ ДАННЫЕ ФУНКЦИИ eventsLogging она скопирована с messagesLogging без изменения параметров
    eventsLogging: ({id, first_name, last_name, username, date, text}) => { 
        query('logs.db3', 'run', "INSERT INTO `events` (`id`, `first_name`, `last_name`, `username`, `date`, `text`) VALUES('"+ 
                id +"', '"+ first_name +"', '"+ last_name +"', '"+ username +"', '"+ date +"', '"+ text +"')");
    },
    latestUpdateTime: (material, updateTime) => {
        return new Promise((resolve, reject) => {
            query('data.db3', 'get', 'SELECT time FROM updates WHERE  id = (SELECT MAX(id) FROM updates WHERE material = "' + material + '")', [], 
                (err,res) => {
                    if(err) reject(console.log(`Error With Select ALL(): \r\n ${err}`));
                    if(res === undefined || new Date().getTime() - parseInt(res.time) < updateTime) return resolve(false);
                    resolve(true);
                }
            );
        })
    },
    updateTime: (material) => {
        const time = new Date().getTime();
        return new Promise((resolve, reject) => {
            query('data.db3', 'get', "INSERT INTO `updates`  (`material`, `time`) VALUES('"+ material +"', '"+ time +"')", [], 
                (err,res) => {
                    if(err) {
                        console.log(`Error With Select ALL(): \r\n ${error}`)
                        reject();
                    }
                    console.log('update time add ' + material)
                    resolve(true);
                }
            );
        });
    },
    addExtremistMaterial: (items) => {
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
                console.log(`Error With Select ALL(): \r\n ${error}`)
                reject();
            }
        });
    },
    findMaterials: (str) => { 
        query('data.db3', 'get', 'SELECT * FROM extremist_materials WHERE content LIKE ?', ['%' + str + '%'], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },
    authorization: (user_id) => { 
        query('data.db3', 'get', 'SELECT * FROM users WHERE  user_id = "' + user_id + '"', [], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },//   authorization: (user_id) => connection.query('SELECT * FROM users WHERE  user_id = "' + user_id + '"'),
    addUser: (user_id, first_name, last_name, authorized, ban) => { 
        query('data.db3', 'run', 'INSERT INTO users (user_id, first_name, last_name, authorized, ban) values ("' + user_id + '","' + first_name + '","' + last_name + '",' + authorized + ',' + ban + ')', [], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },//   addUser: (user_id, first_name, last_name, authorized, ban) => connection.query('INSERT INTO users (user_id, first_name, last_name, authorized, ban) values ("' + user_id + '","' + first_name + '","' + last_name + '",' + authorized + ',' + ban + ')'),
    deleteUser: (user_id) => { 
        query('data.db3', 'run', 'DELETE FROM users WHERE user_id = "' + user_id + '"', [], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },//   deleteUser: (user_id) => connection.query('DELETE FROM users WHERE user_id = "' + user_id + '"'),
    findExtremistOrganizations: (str) => { 
        query('data.db3', 'get', 'SELECT * FROM extremist_organizations WHERE content LIKE ?', ['%' + str + '%'], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },//   findExtremistOrganizations: (str) => connection.query('SELECT * FROM extremist_organizations WHERE content LIKE "%' + str + '%"'),
    findUnwanted_organizations: (str) => { 
        query('data.db3', 'get', 'SELECT * FROM unwanted_organizations WHERE content LIKE ?', ['%' + str + '%'], 
            (error,rows) => { 
                if(error) console.log(error);
                if(rows) console.log(rows)
            })
    },//   findUnwanted_organizations: (str) => connection.query('SELECT * FROM unwanted_organizations WHERE content LIKE "%' + str + '%"'),
}

// mysql> SHOW COLUMNS FROM extremist_materials;
// +----------------+--------------+------+-----+---------+----------------+
// | Field          | Type         | Null | Key | Default | Extra          |
// +----------------+--------------+------+-----+---------+----------------+
// | id             | bigint(200)  | NO   | PRI | NULL    | auto_increment |
// | link           | varchar(100) | NO   |     | NULL    |                |
// | pubDate        | varchar(100) | NO   |     | NULL    |                |
// | content        | text         | YES  |     | NULL    |                |
// | contentSnippet | text         | YES  |     | NULL    |                |
// | guid           | varchar(100) | NO   |     | NULL    |                |
// | isoDate        | varchar(100) | NO   |     | NULL    |                |
// +----------------+--------------+------+-----+---------+----------------+

// mysql> SHOW COLUMNS FROM extremist_organizations;
// +---------+---------+------+-----+---------+----------------+
// | Field   | Type    | Null | Key | Default | Extra          |
// +---------+---------+------+-----+---------+----------------+
// | id      | int(11) | NO   | PRI | NULL    | auto_increment |
// | content | text    | YES  |     | NULL    |                |
// +---------+---------+------+-----+---------+----------------+

// mysql> SHOW COLUMNS FROM unwanted_organizations;
// +---------+---------+------+-----+---------+----------------+
// | Field   | Type    | Null | Key | Default | Extra          |
// +---------+---------+------+-----+---------+----------------+
// | id      | int(11) | NO   | PRI | NULL    | auto_increment |
// | content | text    | YES  |     | NULL    |                |
// +---------+---------+------+-----+---------+----------------+

// mysql> SHOW COLUMNS FROM  users;
// +------------+-------------+------+-----+---------+----------------+
// | Field      | Type        | Null | Key | Default | Extra          |
// +------------+-------------+------+-----+---------+----------------+
// | id         | int(11)     | NO   | PRI | NULL    | auto_increment |
// | user_id    | varchar(20) | NO   |     | NULL    |                |
// | first_name | varchar(20) | NO   |     | NULL    |                |
// | last_name  | varchar(20) | NO   |     | NULL    |                |
// | authorized | tinyint(1)  | YES  |     | NULL    |                |
// | ban        | tinyint(1)  | YES  |     | NULL    |                |
// +------------+-------------+------+-----+---------+----------------+