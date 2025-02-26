const router = require('express').Router();
const api = require('./api');
const { basic_auth } = require('../utils/authentication');

router.use('/api', basic_auth, api);

module.exports = router;
