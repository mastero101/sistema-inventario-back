const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const inventoryController = require('../controllers/inventoryController');

// Configuración de multer para memoria en lugar de disco
const storage = multer.memoryStorage();
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

// Middleware para subir imagen a ImgBB
const uploadToImgBB = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Convertir la imagen a base64
    const base64Image = req.file.buffer.toString('base64');

    // Crear el form data
    const formData = new FormData();
    formData.append('image', base64Image);

    // Subir imagen a ImgBB
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: process.env.IMGBB_API_KEY
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Agregar la URL de la imagen al request
    req.imageData = {
      url: response.data.data.url,
      deleteUrl: response.data.data.delete_url,
      thumbnailUrl: response.data.data.thumb?.url
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Rutas
router.get('/', inventoryController.getAllItems);
router.get('/search', inventoryController.searchItems);
router.get('/:id', inventoryController.getItemById);
router.post('/', upload.single('imagen'), uploadToImgBB, inventoryController.createItem);
router.put('/:id', upload.single('imagen'), uploadToImgBB, inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;