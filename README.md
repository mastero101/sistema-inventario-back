# Sistema de Inventario - Backend
Backend para un sistema de gestión de inventario desarrollado con Node.js, Express y PostgreSQL (Neon). Sistema robusto para el control y seguimiento de equipos e inventario.

## 🚀 Características
- Gestión completa de inventario (CRUD)
- Exportación a Excel
- Subida de imágenes
- Estadísticas en tiempo real
- Seguimiento de mantenimiento
- API RESTful
- Interfaz de monitoreo de salud del sistema
## 📋 Requisitos Previos
- Node.js (v14 o superior)
- PostgreSQL (o una cuenta en Neon.tech )
- npm (incluido con Node.js)
## 🛠️ Instalación
1. **Clonar el repositorio:**
```bash
git clone https://github.com/mastero101/sistema-inventario-back.git
cd sistema-inventario-back
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo .env en la raíz del proyecto:
```bash
DATABASE_URL=<URL_DE_NEON>
PORT=3005
NODE_ENV=development
```

4. Inicializar la base de datos:
```bash
npm run init-db
```

## 🚀 Uso
### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Pruebas
```bash
npm test
```

## 📚 API Endpoints
### Inventario
- GET /api/inventory - Obtener todos los items
- GET /api/inventory/:id - Obtener item específico
- POST /api/inventory - Crear nuevo item
- PUT /api/inventory/:id - Actualizar item
- DELETE /api/inventory/:id - Eliminar item
### Estadísticas
- GET /api/stats/general - Estadísticas generales
- GET /api/stats/by-type - Estadísticas por tipo
### Exportación
- GET /api/export/excel - Exportar inventario a Excel
### Monitoreo
- GET /health - Estado del sistema
## 🔧 Configuración
### Base de Datos
El sistema utiliza PostgreSQL a través de Neon.tech. Asegúrate de tener las credenciales correctas en tu archivo .env .

### Almacenamiento de Imágenes
Las imágenes se almacenan localmente en la carpeta uploads/ . Asegúrate de que esta carpeta tenga los permisos correctos.

## 🧪 Testing
El proyecto incluye pruebas automatizadas:

# Ejecutar todas las pruebas
```bash
npm test
```

# Ejecutar pruebas con coverage
```bash
npm run test:coverage
```

# Ejecutar pruebas en modo watch
```bash
npm run test:watch
```

## 📦 Despliegue
El backend está configurado para desplegarse en Vercel:

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Desplegar:
```bash
vercel
```

## 🛡️ Variables de Entorno Variable Descripción Requerida DATABASE_URL

URL de conexión a PostgreSQL

Sí PORT

Puerto del servidor

No (default: 3005) NODE_ENV

Entorno de ejecución

No (default: development)
## 🤝 Contribuir
1. Fork el proyecto
2. Crea tu Feature Branch ( git checkout -b feature/AmazingFeature )
3. Commit tus cambios ( git commit -m 'Add some AmazingFeature' )
4. Push al Branch ( git push origin feature/AmazingFeature )
5. Abre un Pull Request
## 📝 Licencia
Este proyecto está bajo la Licencia ISC. Ver el archivo LICENSE para más detalles.

## 📞 Soporte
Si encuentras un bug o tienes una sugerencia, por favor abre un issue en GitHub.

## 🛠️ Stack Tecnológico
- Backend: Node.js, Express
- Base de Datos: PostgreSQL (Neon)
- Testing: Jest, Supertest
- Documentación: Swagger/OpenAPI
- Despliegue: Vercel
- CI/CD: GitHub Actions
## 📊 Estructura del Proyecto
sistema-inventario-back/
├── __tests__/           # Pruebas unitarias
├── config/             # Configuración
├── controllers/        # Controladores
├── db/                # Configuración de base de datos
├── middleware/        # Middleware personalizado
├── routes/            # Rutas de la API
├── uploads/           # Almacenamiento de imágenes
├── utils/             # Utilidades
├── .env               # Variables de entorno
├── .gitignore        # Archivos ignorados por git
├── package.json      # Dependencias y scripts
├── README.md         # Documentación
└── server.js         # Punto de entrada