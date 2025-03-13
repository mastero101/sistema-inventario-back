const db = require('../db');

class InventoryService {
  // Obtener todos los items
  async getAllItems() {
    const result = await db.query('SELECT * FROM inventory_items ORDER BY fecha_registro DESC');
    return result.rows;
  }
  
  // Obtener un item por ID
  async getItemById(id) {
    const result = await db.query('SELECT * FROM inventory_items WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  // Crear un nuevo item
  async createItem(itemData) {
    // Generar ID único (formato: EQ + 3 números)
    const countResult = await db.query('SELECT COUNT(*) FROM inventory_items');
    const count = parseInt(countResult.rows[0].count) + 1;
    const id = `EQ${count.toString().padStart(3, '0')}`;
    
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
      departamento,
      imagen
    } = itemData;
    
    const result = await db.query(
      `INSERT INTO inventory_items 
       (id, tipo, marca, modelo, serial, estado, asignado_a, ubicacion, fecha_registro, ultimo_mantenimiento, departamento, imagen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [id, tipo, marca, modelo, serial, estado, asignadoA, ubicacion, fechaRegistro, ultimoMantenimiento, departamento, imagen]
    );
    
    return result.rows[0];
  }
  
  // Actualizar un item
  async updateItem(id, itemData) {
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
      departamento,
      imagen
    } = itemData;
    
    const result = await db.query(
      `UPDATE inventory_items 
       SET tipo = $1, marca = $2, modelo = $3, serial = $4, estado = $5, 
           asignado_a = $6, ubicacion = $7, fecha_registro = $8, 
           ultimo_mantenimiento = $9, departamento = $10, imagen = $11
       WHERE id = $12
       RETURNING *`,
      [tipo, marca, modelo, serial, estado, asignadoA, ubicacion, fechaRegistro, 
       ultimoMantenimiento, departamento, imagen, id]
    );
    
    return result.rows[0];
  }
  
  // Eliminar un item
  async deleteItem(id) {
    await db.query('DELETE FROM inventory_items WHERE id = $1', [id]);
    return { success: true };
  }
  
  // Buscar items con filtros
  async searchItems(filters) {
    const { searchTerm, estado, departamento, fechaDesde, fechaHasta } = filters;
    
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
    return result.rows;
  }
}

module.exports = new InventoryService();