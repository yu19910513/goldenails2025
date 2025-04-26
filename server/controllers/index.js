/**
 * Main router for the application.
 * 
 * - Applies basic authentication middleware to all `/api` routes.
 * - Delegates `/api` requests to the `api` router.
 * 
 * @module router
 */
const router = require('express').Router();
const api = require('./api');
const { basic_auth } = require('../utils/authentication');

router.use('/api', basic_auth, api);

module.exports = router;
