// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Errores de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
    });
  }
  
  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      error: 'Solo se permiten archivos de imagen (jpeg, jpg, png, gif)'
    });
  }
  
  // Error genérico
  res.status(500).json({
    error: 'Ha ocurrido un error en el servidor'
  });
};

module.exports = errorHandler;