const router = require('express').Router();
const userRoutes = require('./UserRoutes');

router.use('/user', userRoutes);
module.exports = router;
