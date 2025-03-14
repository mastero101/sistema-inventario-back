const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Obtener todos los items del inventario
exports.getAllItems = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inventory_items ORDER BY fecha_registro DESC');
    
    // Transformar los nombres de columnas de snake_case a camelCase para el frontend
    const items = result.rows.map(item => ({
      id: item.id,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      serial: item.serial,
      estado: item.estado,
      asignadoA: item.asignado_a,
      ubicacion: item.ubicacion,
      fechaRegistro: item.fecha_registro.toISOString().split('T')[0],
      ultimoMantenimiento: item.ultimo_mantenimiento ? item.ultimo_mantenimiento.toISOString().split('T')[0] : null,
      departamento: item.departamento,
      imagen: item.imagen
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Error al obtener items:', error);
    res.status(500).json({ error: 'Error al obtener los items del inventario' });
  }
};

// Obtener un item por ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    const item = result.rows[0];
    
    // Transformar a camelCase
    res.json({
      id: item.id,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      serial: item.serial,
      estado: item.estado,
      asignadoA: item.asignado_a,
      ubicacion: item.ubicacion,
      fechaRegistro: item.fecha_registro.toISOString().split('T')[0],
      ultimoMantenimiento: item.ultimo_mantenimiento ? item.ultimo_mantenimiento.toISOString().split('T')[0] : null,
      departamento: item.departamento,
      imagen: item.imagen
    });
  } catch (error) {
    console.error('Error al obtener item por ID:', error);
    res.status(500).json({ error: 'Error al obtener el item del inventario' });
  }
};

// Crear un nuevo item
exports.createItem = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Image data:', req.imageData);

    const {
      tipo,
      marca,
      modelo,
      serial,
      estado,
      asignadoA,
      ubicacion,
      fechaRegistro,
      ultimoMantenimiento,
      departamento
    } = req.body;

    const itemData = {
      ...req.body,
      imagen: req.imageData ? req.imageData.url : null,
      imagen_thumbnail: req.imageData ? req.imageData.thumbnailUrl : null,
      imagen_delete_url: req.imageData ? req.imageData.deleteUrl : null
    };

    console.log('Final item data:', itemData);

    const result = await db.query(
      `INSERT INTO inventory_items (
        tipo, marca, modelo, serial, estado, asignado_a, 
        ubicacion, fecha_registro, ultimo_mantenimiento, 
        departamento, imagen, imagen_thumbnail, imagen_delete_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        tipo,
        marca,
        modelo,
        serial,
        estado,
        asignadoA,
        ubicacion,
        fechaRegistro || new Date(),
        ultimoMantenimiento,
        departamento,
        itemData.imagen,
        itemData.imagen_thumbnail,
        itemData.imagen_delete_url
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear item:', error);
    res.status(500).json({ error: 'Error al crear el item en el inventario' });
  }
};

// Eliminar un item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el item existe y obtener la imagen si tiene
    const checkResult = await db.query('SELECT imagen FROM inventory_items WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    // Eliminar la imagen si existe
    const imagenPath = checkResult.rows[0].imagen;
    if (imagenPath) {
      const fullImagePath = path.join(__dirname, '..', imagenPath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
    }
    
    // Eliminar el item de la base de datos
    await db.query('DELETE FROM inventory_items WHERE id = $1', [id]);
    
    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ error: 'Error al eliminar el item del inventario' });
  }
};

// Añadir este método al controlador existente
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo,
      marca,
      modelo,
      serial,
      estado,
      asignadoA,
      ubicacion,
      fechaRegistro,
      ultimoMantenimiento,
      departamento
    } = req.body;

    // Verificar si el item existe
    const checkResult = await db.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Prepare image data if a new image is uploaded
    const itemData = {
      imagen: req.imageData ? req.imageData.url : checkResult.rows[0].imagen,
      imagen_thumbnail: req.imageData ? req.imageData.thumbnailUrl : checkResult.rows[0].imagen_thumbnail,
      imagen_delete_url: req.imageData ? req.imageData.deleteUrl : checkResult.rows[0].imagen_delete_url
    };

    const result = await db.query(
      `UPDATE inventory_items 
       SET tipo = $1, marca = $2, modelo = $3, serial = $4, estado = $5, 
           asignado_a = $6, ubicacion = $7, fecha_registro = $8, 
           ultimo_mantenimiento = $9, departamento = $10, 
           imagen = $11, imagen_thumbnail = $12, imagen_delete_url = $13
       WHERE id = $14
       RETURNING *`,
      [
        tipo,
        marca,
        modelo,
        serial,
        estado,
        asignadoA,
        ubicacion,
        fechaRegistro || checkResult.rows[0].fecha_registro,
        ultimoMantenimiento,
        departamento,
        itemData.imagen,
        itemData.imagen_thumbnail,
        itemData.imagen_delete_url,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar item:', error);
    res.status(500).json({ error: 'Error al actualizar el item en el inventario' });
  }
};

// Búsqueda avanzada
exports.searchItems = async (req, res) => {
  try {
    const { 
      searchTerm, 
      estado, 
      departamento, 
      fechaDesde, 
      fechaHasta 
    } = req.query;
    
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const queryParams = [];
    
    if (searchTerm) {
      query += ` AND (
        tipo ILIKE $${queryParams.length + 1} OR 
        marca ILIKE $${queryParams.length + 1} OR 
        modelo ILIKE $${queryParams.length + 1} OR 
        serial ILIKE $${queryParams.length + 1} OR
        asignado_a ILIKE $${queryParams.length + 1} OR
        ubicacion ILIKE $${queryParams.length + 1}
      )`;
      queryParams.push(`%${searchTerm}%`);
    }
    
    if (estado && estado !== 'todos') {
      query += ` AND estado = $${queryParams.length + 1}`;
      queryParams.push(estado);
    }
    
    if (departamento && departamento !== 'todos') {
      query += ` AND departamento = $${queryParams.length + 1}`;
      queryParams.push(departamento);
    }
    
    if (fechaDesde) {
      query += ` AND fecha_registro >= $${queryParams.length + 1}`;
      queryParams.push(fechaDesde);
    }
    
    if (fechaHasta) {
      query += ` AND fecha_registro <= $${queryParams.length + 1}`;
      queryParams.push(fechaHasta);
    }
    
    query += ' ORDER BY fecha_registro DESC';
    
    const result = await db.query(query, queryParams);
    
    // Transformar los nombres de columnas de snake_case a camelCase para el frontend
    const items = result.rows.map(item => ({
      id: item.id,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      serial: item.serial,
      estado: item.estado,
      asignadoA: item.asignado_a,
      ubicacion: item.ubicacion,
      fechaRegistro: item.fecha_registro.toISOString().split('T')[0],
      ultimoMantenimiento: item.ultimo_mantenimiento ? item.ultimo_mantenimiento.toISOString().split('T')[0] : null,
      departamento: item.departamento,
      imagen: item.imagen
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Error en la búsqueda avanzada:', error);
    res.status(500).json({ error: 'Error al realizar la búsqueda en el inventario' });
  }
};