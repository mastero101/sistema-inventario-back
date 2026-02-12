const ExcelJS = require('exceljs');
const db = require('../db');

exports.exportToExcel = async (req, res) => {
  try {
    // Obtener todos los items o filtrar según los parámetros
    const { estado, departamento, searchTerm } = req.query;

    let query = 'SELECT * FROM inventory_items';
    const queryParams = [];
    const conditions = [];

    if (estado && estado !== 'todos') {
      conditions.push(`estado = $${queryParams.length + 1}`);
      queryParams.push(estado);
    }

    if (departamento && departamento !== 'todos') {
      conditions.push(`departamento = $${queryParams.length + 1}`);
      queryParams.push(departamento);
    }

    if (searchTerm) {
      conditions.push(`(marca ILIKE $${queryParams.length + 1} OR modelo ILIKE $${queryParams.length + 1} OR serial ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${searchTerm}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY fecha_registro DESC';

    const result = await db.query(query, queryParams);
    const items = result.rows;

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    // Definir las columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Marca', key: 'marca', width: 15 },
      { header: 'Modelo', key: 'modelo', width: 20 },
      { header: 'Serial', key: 'serial', width: 20 },
      { header: 'No. Inventario', key: 'inventory_number', width: 20 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Origen', key: 'source', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Asignado a', key: 'asignado_a', width: 20 },
      { header: 'Sub Área', key: 'assigned_sub_area', width: 20 },
      { header: 'Ubicación', key: 'ubicacion', width: 20 },
      { header: 'Fecha de Registro', key: 'fecha_registro', width: 15 },
      { header: 'Último Mantenimiento', key: 'ultimo_mantenimiento', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 15 }
    ];

    // Estilo para el encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    // Agregar los datos
    items.forEach(item => {
      worksheet.addRow({
        id: item.id,
        tipo: item.tipo,
        marca: item.marca,
        modelo: item.modelo,
        serial: item.serial,
        inventory_number: item.inventory_number,
        description: item.description,
        source: item.source,
        estado: item.estado,
        asignado_a: item.asignado_a,
        assigned_sub_area: item.assigned_sub_area,
        ubicacion: item.ubicacion,
        fecha_registro: item.fecha_registro ? item.fecha_registro.toISOString().split('T')[0] : '',
        ultimo_mantenimiento: item.ultimo_mantenimiento ? item.ultimo_mantenimiento.toISOString().split('T')[0] : '',
        departamento: item.departamento
      });
    });

    // Configurar la respuesta
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Inventario.xlsx');

    // Escribir el archivo y enviarlo como respuesta
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    res.status(500).json({ error: 'Error al exportar el inventario a Excel' });
  }
};