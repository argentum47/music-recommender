var express = require('express');
var router = express.Router();
var dB = require("../db");

var findSong = dB.prepare("SELECT id, name, year, listened FROM songs WHERE id = ?");
var insertSong = dB.prepare("UPDATE songs SET listened = (?) WHERE id = (?)");

router.get('/', function (req, res) {
  dB.allAsync("SELECT * FROM songs").then((songs) => {
    if(songs) {
      res.render("songs", { songs: songs });
    } else {
      next();
    }
  });
});

router.get('/:id', function (req, res, next) {
  var results = {};

  findAsync(findSong, req.params.id).then(data => {
    results.song = data;
    insertSong.run(data.listened + 1, data.id);
  }).then(() => {
    res.render("song", { song: results.song });
  }).catch(err => next(err));
});

router.get('/:id/recommendations', function (req, res, next) {
  var matrix = {};
  var data;
  var limit = req.query.perPage || 10;

  findAsync(findSong, req.params.id).then(song => {
    data = song;
    return dB.getAsync("SELECT listened FROM songs ORDER BY listened LIMIT 1");
  }).then(song => {
    var query = "SELECT id, name, listened FROM songs ORDER BY listened ";
    query += (data.listened < song.listened / 2) ? "ASC" : "DESC";
    
    return dB.allAsync(query)
  }).then(songs => {
    return songs.filter(song => song.id != data.id).sort((p, n) => n.listened - p.listened).slice(0, limit);
  }).then(songs => res.json(songs))
    .catch(err => next(err));
});

function insertAsync (stmt, values) {
  return new Promise((res, rej) => {
    stmt.run(values, (err) => {
      if(err) rej(err);
      else res(true);
    });
  });
}

function findAsync(stmt, values) {
  return new Promise((res, rej) => {
    stmt.get(values, function(err, row) {
      if(err || !row) rej(err || "NOT_FOUND");
      else res(row);
    });
  });
}

module.exports = router;