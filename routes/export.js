const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

router.get('/excel', exportController.exportToExcel);

module.exports = router;