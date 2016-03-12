var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var dB = require("../db");

var insertUser = dB.prepare("INSERT INTO users (name, hash) VALUES (?, ?)");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/new', (req, res, next) => {
  if(!req.user) {
    res.render('new', { title: "Signup" });
  }
});

router.get('/login', (req, res, next) => {
  if(!req.user) {
    res.render('login', { title: "Login" });
  }
});

router.post('/create', function(req, res, next) {
  var name = req.body.name;
  var password = req.body.password;

  insertUser.run(name, createPassword(password), (err) => {
    if(err) {
      res.render("new", { error: "NAME_EXISTS" });
    } else {
      dB.getAsync("SELECT id, name FROM users WHERE name = ?", name)
      .then(user => {
        req.logIn(user, (err) => {
          if(!err)
            res.redirect('/')
          else res.render("new", { error: "INTERNAL_ERROR" })
        });
      }).catch(e => next(e));
    }
  });
});

router.post('/login', (req, res, next) => {
  var name = req.body.name;
  var password = req.body.password;
  
  dB.getAsync("SELECT id, name, hash FROM users where name = ?", name).then(user => {
    if(comparePassword(user.hash, password)) {
      req.logIn(user, (err) => {
        if(!err) {
          res.redirect('/');
        } else res.render("login", { error: "UNAUTHORIZED" })
      })
    }
  })
});


function createPassword(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function comparePassword(hash, text) {
  return crypto.createHash('sha256').update(text).digest('hex') == hash;
}
module.exports = router;
