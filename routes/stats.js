const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/general', statsController.getGeneralStats);
router.get('/recent', statsController.getRecentChanges);

module.exports = router;