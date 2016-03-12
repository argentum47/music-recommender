var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("music.db");

var createRecomendations = `create table if not exists recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  coefficient REAL NOT NULL DEFAULT 0);`

db.serialize(function() {
  db.run(createRecomendations);

  var stmt = db.prepare(`insert into recommendations(song_id, coefficient) VALUES (?,?)`);

  // select all songs, compare with the others in list and insrt record

  db.all(`select songs.id, songs.album_id, songs.year, albums.id from songs inner join albums on albums.id = songs.album_id`, function(err, rows) {
    for(var i = 0; i < rows.length; i++) {
      stmt.run(rows[i].id, (function() {
        return rows.filter(r => r.id != rows[i].id).reduce(function(acc, row) {
          if(Math.abs(row.year - rows[i].year) <= 4) {
            acc += 0.5;
          }

          if(row.album_id == rows[i].album_id) {
            acc += 1;
          }
          return acc;
        }, 0);
      })());
    }
  });
});