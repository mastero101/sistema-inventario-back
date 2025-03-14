const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const createTables = require('./db/init');

// Importar rutas
const inventoryRoutes = require('./routes/inventory');
const exportRoutes = require('./routes/export');
const statsRoutes = require('./routes/stats');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Carpeta para imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/inventory', inventoryRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/stats', statsRoutes);

// Función para generar la página de estado del sistema
const generateHealthPage = (req, res) => {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const formattedUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100;
  
  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estado del Sistema de Inventario</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 20px;
        color: #333;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        animation: fadeIn 0.5s ease-in-out;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      h1 {
        color: #2c3e50;
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #eee;
        padding-bottom: 10px;
      }
      .status {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }
      .status-indicator {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #2ecc71;
        margin-right: 10px;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
      .status-text {
        font-size: 18px;
        font-weight: bold;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 30px;
      }
      .info-card {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;
      }
      .info-card:hover {
        transform: translateY(-5px);
      }
      .info-card h3 {
        margin-top: 0;
        color: #3498db;
        font-size: 16px;
      }
      .info-card p {
        margin-bottom: 0;
        font-size: 20px;
        font-weight: bold;
      }
      .memory-bar {
        height: 10px;
        background-color: #ecf0f1;
        border-radius: 5px;
        margin-top: 10px;
        overflow: hidden;
      }
      .memory-used {
        height: 100%;
        background-color: #3498db;
        width: ${Math.min(memoryUsedMB / 500 * 100, 100)}%;
        transition: width 0.5s ease;
      }
      .refresh-button {
        display: block;
        margin: 30px auto 0;
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease;
      }
      .refresh-button:hover {
        background-color: #2980b9;
      }
      .timestamp {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #7f8c8d;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Sistema de Inventario - Estado del Servidor</h1>
      
      <div class="status">
        <div class="status-indicator"></div>
        <div class="status-text">Sistema Operativo</div>
      </div>
      
      <div class="info-grid">
        <div class="info-card">
          <h3>Tiempo de Actividad</h3>
          <p>${formattedUptime}</p>
        </div>
        
        <div class="info-card">
          <h3>Memoria Utilizada</h3>
          <p>${memoryUsedMB} MB</p>
          <div class="memory-bar">
            <div class="memory-used"></div>
          </div>
        </div>
        
        <div class="info-card">
          <h3>Entorno</h3>
          <p>${process.env.NODE_ENV || 'development'}</p>
        </div>
        
        <div class="info-card">
          <h3>Puerto</h3>
          <p>${PORT}</p>
        </div>
      </div>
      
      <button class="refresh-button" onclick="location.reload()">Actualizar</button>
      
      <div class="timestamp">
        Última actualización: ${new Date().toLocaleString()}
      </div>
    </div>
    
    <script>
      // Auto-refresh every 30 seconds
      setTimeout(() => {
        location.reload();
      }, 30000);
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
};

// Usar la misma función para ambas rutas
app.get('/', generateHealthPage);
app.get('/health', generateHealthPage);

// Middleware de manejo de errores (debe estar después de las rutas)
app.use(errorHandler);

// Iniciar servidor
// Initialize database and create app
const initializeApp = async () => {
  try {
    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Initialize database and start server based on environment
if (process.env.NODE_ENV !== 'production') {
  // For local development
  startServer();
} else {
  // For production (Vercel)
  initializeApp();
}

// Modify the exports
module.exports = app;

// Keep startServer function for local development
async function startServer() {
  try {
    await createTables();
    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });

    return { app, server };
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
