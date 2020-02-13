const express = require('express');
const router = express.Router();
const config = require('config');
const c_api = config.get('Api');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.send('');
});

router.post('/hooks/' + c_api.Key, function (req, res, next) {
    req.bot.processingUpdate(req.body);
    res.send('True');
});

module.exports = router;
