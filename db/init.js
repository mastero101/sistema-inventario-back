const db = require('./index');

const createTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(100) NOT NULL,
        marca VARCHAR(100) NOT NULL,
        modelo VARCHAR(100) NOT NULL,
        serial VARCHAR(100) UNIQUE NOT NULL,
        estado VARCHAR(50) NOT NULL,
        asignado_a VARCHAR(100),
        ubicacion VARCHAR(100) NOT NULL,
        fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
        ultimo_mantenimiento DATE,
        departamento VARCHAR(100),
        imagen VARCHAR(255),
        imagen_thumbnail VARCHAR(255),
        imagen_delete_url VARCHAR(255)
      )
    `);
    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

// Execute if this file is run directly
if (require.main === module) {
  createTables()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = createTables;