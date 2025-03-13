const db = require('./index');

const createTables = async () => {
  try {
    // Crear tabla de inventario
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id VARCHAR(10) PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        marca VARCHAR(50) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        serial VARCHAR(50) UNIQUE NOT NULL,
        estado VARCHAR(20) NOT NULL CHECK (estado IN ('Disponible', 'Asignado', 'Mantenimiento', 'Dañado')),
        asignado_a VARCHAR(100),
        ubicacion VARCHAR(100) NOT NULL,
        fecha_registro DATE NOT NULL,
        ultimo_mantenimiento DATE,
        departamento VARCHAR(50),
        imagen VARCHAR(255)
      );
    `);

    console.log('Tablas creadas correctamente');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  }
};

createTables();