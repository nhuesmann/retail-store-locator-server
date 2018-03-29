const router = require('express').Router();

router.use('/retailers', require('./retailers'));

module.exports = router;
