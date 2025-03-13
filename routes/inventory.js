const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const inventoryController = require('../controllers/inventoryController');

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
  }
});

// Rutas
router.get('/', inventoryController.getAllItems);
router.get('/:id', inventoryController.getItemById);
router.post('/', upload.single('imagen'), inventoryController.createItem);
router.put('/:id', upload.single('imagen'), inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

// Añadir esta ruta al archivo existente, justo antes de module.exports = router;

// Ruta para búsqueda avanzada
router.get('/search', inventoryController.searchItems);

module.exports = router;