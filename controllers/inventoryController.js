const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Helper para mapear columnas de snake_case a camelCase
const mapToCamelCase = (item) => ({
  id: item.id,
  tipo: item.tipo,
  marca: item.marca,
  modelo: item.modelo,
  serial: item.serial,
  inventoryNumber: item.inventory_number,
  description: item.description,
  source: item.source,
  estado: item.estado,
  asignadoA: item.asignado_a,
  assignedSubArea: item.assigned_sub_area,
  ubicacion: item.ubicacion,
  fechaRegistro: item.fecha_registro ? item.fecha_registro.toISOString().split('T')[0] : null,
  ultimoMantenimiento: item.ultimo_mantenimiento ? item.ultimo_mantenimiento.toISOString().split('T')[0] : null,
  departamento: item.departamento,
  imagen: item.imagen,
  imagenThumbnail: item.imagen_thumbnail,
  imagenDeleteUrl: item.imagen_delete_url
});

// Obtener todos los items del inventario
exports.getAllItems = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inventory_items ORDER BY fecha_registro DESC');
    const items = result.rows.map(mapToCamelCase);
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
    res.json(mapToCamelCase(item));
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
      tipo, marca, modelo, serial, inventoryNumber, description, source,
      estado, asignadoA, assignedSubArea, ubicacion, fechaRegistro,
      ultimoMantenimiento, departamento
    } = req.body;

    const itemData = {
      ...req.body,
      imagen: req.imageData ? req.imageData.url : null,
      imagen_thumbnail: req.imageData ? req.imageData.thumbnailUrl : null,
      imagen_delete_url: req.imageData ? req.imageData.deleteUrl : null
    };

    const result = await db.query(
      `INSERT INTO inventory_items (
        tipo, marca, modelo, serial, inventory_number, description, source,
        estado, asignado_a, assigned_sub_area, ubicacion, fecha_registro, 
        ultimo_mantenimiento, departamento, imagen, imagen_thumbnail, imagen_delete_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING *`,
      [
        tipo, marca, modelo, serial, inventoryNumber, description, source,
        estado, asignadoA, assignedSubArea, ubicacion, fechaRegistro || new Date(),
        ultimoMantenimiento, departamento, itemData.imagen, itemData.imagen_thumbnail, itemData.imagen_delete_url
      ]
    );

    res.status(201).json(mapToCamelCase(result.rows[0]));
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
    const checkResult = await db.query('SELECT imagen, imagen_delete_url FROM inventory_items WHERE id = $1', [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Eliminar la imagen si existe y es local
    const imagenPath = checkResult.rows[0].imagen;
    if (imagenPath && !imagenPath.startsWith('http')) {
      const fullImagePath = path.join(__dirname, '..', imagenPath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }
    }

    // Nota: Si es una imagen de ImgBB, el cliente puede usar imagen_delete_url 
    // pero programáticamente ImgBB no ofrece una API simple de borrado sin API key 
    // y un proceso de scrap o sesión para esa URL específica. 
    // Por ahora simplemente borramos el registro.

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
      tipo, marca, modelo, serial, inventoryNumber, description, source,
      estado, asignadoA, assignedSubArea, ubicacion, fechaRegistro,
      ultimoMantenimiento, departamento
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
       SET tipo = $1, marca = $2, modelo = $3, serial = $4, inventory_number = $5,
           description = $6, source = $7, estado = $8, asignado_a = $9, 
           assigned_sub_area = $10, ubicacion = $11, fecha_registro = $12, 
           ultimo_mantenimiento = $13, departamento = $14, 
           imagen = $15, imagen_thumbnail = $16, imagen_delete_url = $17
       WHERE id = $18
       RETURNING *`,
      [
        tipo, marca, modelo, serial, inventoryNumber, description, source,
        estado, asignadoA, assignedSubArea, ubicacion,
        fechaRegistro || checkResult.rows[0].fecha_registro,
        ultimoMantenimiento, departamento,
        itemData.imagen, itemData.imagen_thumbnail, itemData.imagen_delete_url, id
      ]
    );

    res.json(mapToCamelCase(result.rows[0]));
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
    res.json(result.rows.map(mapToCamelCase));
  } catch (error) {
    console.error('Error en la búsqueda avanzada:', error);
    res.status(500).json({ error: 'Error al realizar la búsqueda en el inventario' });
  }
};