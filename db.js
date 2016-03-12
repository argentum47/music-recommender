var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("music.db");

var Promise = require("bluebird");

db.allAsync = Promise.promisify(db.all);
db.getAsync = Promise.promisify(db.get);
db.eachAsync = Promise.promisify(db.each);
module.exports = db;