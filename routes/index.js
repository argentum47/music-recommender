var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

router.get('/logout', (req, res, next) => {
  req.session.user = null;
  req.user = null;
  res.redirect("/")
})
module.exports = router;
