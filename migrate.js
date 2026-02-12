const db = require('./db');

async function migrate() {
    try {
        console.log('Iniciando migración de base de datos...');

        // Lista de columnas a añadir
        const columnas = [
            { nombre: 'inventory_number', tipo: 'VARCHAR(100)' },
            { nombre: 'description', tipo: 'TEXT' },
            { nombre: 'source', tipo: 'VARCHAR(100)' },
            { nombre: 'assigned_sub_area', tipo: 'VARCHAR(100)' }
        ];

        for (const col of columnas) {
            try {
                await db.query(`ALTER TABLE inventory_items ADD COLUMN ${col.nombre} ${col.tipo}`);
                console.log(`Columna añadida: ${col.nombre}`);
            } catch (err) {
                if (err.code === '42701') { // Códico de error para columna ya existe
                    console.log(`La columna ${col.nombre} ya existe.`);
                } else {
                    console.error(`Error al añadir columna ${col.nombre}:`, err.message);
                }
            }
        }

        console.log('Migración completada.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();
