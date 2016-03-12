'use strict';

var express = require('express');
var router = express.Router();
var dB = require("../db");
var Promise = require("bluebird");

var findSong = dB.prepare("SELECT id, name, year FROM songs WHERE id = ?");
var likeSong = dB.prepare("UPDATE recommendations SET likes = ? WHERE song_id = ? AND user_id = ?");

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
    return res.render("song", { title: `Song | ${song.name}`, song: song })
  }).catch(err => next(err));
});

router.get('/:id/add', (req, res, next) => {
  dB.getAsync(`select * from recommendations where song_id = ? and user_id = ?`, req.params.id, req.user.id)
    .then(song => {
      if(!song) {
        dB.run(`insert into recommendations (song_id, user_id) values ($songId, $userId)`, {
          $songId: req.params.id,
          $userId: req.user.id
        });
      } else {
        likeSong.run(Number(song.likes) + 1, req.params.id, req.user.id);
      }
    }).then(() => {
      return dB.getAsync(`select * from recommendations where song_id = ? and user_id = ?`, req.params.id, req.user.id)
    }).then(data => {
      res.json(data);
    }).catch(err => next(err));
});

router.get('/:id/recommendations', function (req, res, next) {
  dB.allAsync(`select user_id, song_id, likes from recommendations where user_id in (select user_id from recommendations where song_id = $songId)`, {
    $songId: req.params.id
  }).then(data => { 
    let userArray = data.filter(d => d.user_id == req.user.id);

    let others = data
                  .filter(d => d.user_id != req.user.id)
                  .groupBy(d => d.user_id);

    let results = Object.keys(others)
                    .map((key) => ({ id: key, value: calculateJaccardCoeff(userArray, others[key]) }))
                    .flatMap(r => others[r.id].map(s => ({ songId: s.song_id, similarity: s.likes *  r.value })))
                    .sort((p, n) => n.similarity - p.similarity);

    return Promise.all(results.map(r => findAsync(findSong, r.songId)))
  }).then(data => res.send(data))
    .catch(err => next(err))
});


function calculateJaccardCoeff(array_1, array_2) {
  let similar = 1;

  similar += array_1.reduce((acc, v) => {
    if(array_2.find(a => a.song_id == v.song_id)) acc += 1;
    return acc;
  }, 0);

  return similar / (array_1.length + array_2.length - similar);
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