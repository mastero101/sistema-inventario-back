const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

// Rutas de reportes de mantenimiento
router.get('/item/:itemId', maintenanceController.getReportsByItemId);
router.get('/pdf/:itemId', maintenanceController.generatePDF);
router.post('/', maintenanceController.createReport);
router.delete('/:id', maintenanceController.deleteReport);

module.exports = router;
