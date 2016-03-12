var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("music.db");

var createRecomendations = `create table if not exists recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  likes INTEGER NOT NULL DEFAULT 1);`

db.serialize(function() {
  db.run(createRecomendations);
});