const db = require('../db');

// Obtener estadísticas generales
exports.getGeneralStats = async (req, res) => {
  try {
    // Total de items
    const totalResult = await db.query('SELECT COUNT(*) FROM inventory_items');
    const total = parseInt(totalResult.rows[0].count);
    
    // Items por estado
    const estadosResult = await db.query(`
      SELECT estado, COUNT(*) 
      FROM inventory_items 
      GROUP BY estado
    `);
    
    const estadosStats = {};
    estadosResult.rows.forEach(row => {
      estadosStats[row.estado] = parseInt(row.count);
    });
    
    // Items por departamento
    const departamentosResult = await db.query(`
      SELECT departamento, COUNT(*) 
      FROM inventory_items 
      WHERE departamento IS NOT NULL
      GROUP BY departamento
    `);
    
    const departamentosStats = {};
    departamentosResult.rows.forEach(row => {
      departamentosStats[row.departamento] = parseInt(row.count);
    });
    
    // Items por tipo
    const tiposResult = await db.query(`
      SELECT tipo, COUNT(*) 
      FROM inventory_items 
      GROUP BY tipo
    `);
    
    const tiposStats = {};
    tiposResult.rows.forEach(row => {
      tiposStats[row.tipo] = parseInt(row.count);
    });
    
    // Items que necesitan mantenimiento (último mantenimiento hace más de 6 meses)
    const mantenimientoResult = await db.query(`
      SELECT COUNT(*) 
      FROM inventory_items 
      WHERE ultimo_mantenimiento IS NOT NULL 
      AND ultimo_mantenimiento < CURRENT_DATE - INTERVAL '6 months'
    `);
    
    const necesitanMantenimiento = parseInt(mantenimientoResult.rows[0].count);
    
    res.json({
      total,
      porEstado: estadosStats,
      porDepartamento: departamentosStats,
      porTipo: tiposStats,
      necesitanMantenimiento
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas del inventario' });
  }
};

// Obtener historial de cambios recientes
exports.getRecentChanges = async (req, res) => {
  try {
    // Aquí normalmente usaríamos una tabla de historial
    // Como no la tenemos, simplemente devolvemos los últimos items añadidos/modificados
    const result = await db.query(`
      SELECT * FROM inventory_items
      ORDER BY fecha_registro DESC
      LIMIT 10
    `);
    
    const recentItems = result.rows.map(item => ({
      id: item.id,
      tipo: item.tipo,
      marca: item.marca,
      modelo: item.modelo,
      estado: item.estado,
      fechaRegistro: item.fecha_registro.toISOString().split('T')[0]
    }));
    
    res.json(recentItems);
  } catch (error) {
    console.error('Error al obtener cambios recientes:', error);
    res.status(500).json({ error: 'Error al obtener el historial de cambios recientes' });
  }
};