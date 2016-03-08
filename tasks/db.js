var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("music.db");

var createArtists = `create table if not exists artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(225) NOT NULL UNIQUE);`;

var createAlbums = `create table if not exists albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  FOREIGN KEY(artist_id) REFERENCES artists(id));`;

var createSongs = `create table if not exists songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL REFERENCES albums(id) ON UPDATE CASCADE ON DELETE CASCADE,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON UPDATE CASCADE ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  listened INTEGER NOT NULL);`;

db.serialize(function () {
  db.run(createArtists);
  db.run(createAlbums); 
  db.run(createSongs);

  var artistStmt = db.prepare("INSERT OR IGNORE INTO artists(name) VALUES(?)");
  var albumStmt  = db.prepare("INSERT OR IGNORE INTO albums(name, artist_id) VALUES(?, ?)");
  var songStmt   = db.prepare("INSERT OR IGNORE INTO songs(name, artist_id, album_id, year, listened) VALUES(?, ?, ?, ?, ?)");

  ["linkin park", "etherwood", "blackmill"].forEach(a => { artistStmt.run(a); });

  ["meteora", "hybrid theory", "living things"].forEach(al => { albumStmt.run(al, 1) });

  ["numb", "breaking the habit", "faint", "somewhere i belong"].forEach(song => songStmt.run(song, 1, 1, 2003, Math.floor(Math.random() * 100)));
  ["crawling", "in the end"].forEach(song => songStmt.run(song, 1, 2, 2000, Math.floor(Math.random() * 100)));
  ["lost in the echo", "burn it down"].forEach(song => songStmt.run(song, 1, 3, 2012, Math.floor(Math.random() * 100)));
});