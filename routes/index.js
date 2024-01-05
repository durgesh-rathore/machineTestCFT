var express = require('express');
var router = express.Router();
var checkUserStatus = require('../config/checkUserStatus')

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.send({massage:"Server working"});
});

module.exports = router;
