var express = require('express');
var router = express.Router();
var dB = require("../db");

var findSong = dB.prepare("SELECT id, name, year FROM songs WHERE id = ?");
//var insertSong = dB.prepare("UPDATE songs SET listened = (?) WHERE id = (?)");

router.get('/', function (req, res) {
  dB.allAsync("SELECT * FROM songs").then((songs) => {
    if(songs) {
      res.render("songs", { title: "Songs", songs: songs, user: req.user });
    } else {
      next();
    }
  });
});

router.get('/:id', function (req, res, next) {
  var results = {};

  findAsync(findSong, req.params.id).then((song) => {
    res.render("song", { title: `Song | ${song.name}`, song: song });
  }).catch(err => next(err));
});

router.get('/:id/recommendations', function (req, res, next) {
  var matrix = {};
  var limit = req.query.perPage || 10;

  var query = "SELECT id, name FROM songs";
    
  dB.allAsync(query).then(songs => {
    return songs.filter(song => song.id != req.params.id).sort((p, n) => n.listened - p.listened).slice(0, limit);
  }).then(songs => res.json(songs))
    .catch(err => next(err));
});


function findAsync(stmt, values) {
  return new Promise((res, rej) => {
    stmt.get(values, function(err, row) {
      if(err || !row) rej(err || "NOT_FOUND");
      else res(row);
    });
  });
}

module.exports = router;