const request = require('supertest');
const { app, server, closeServer } = require('../server');
const db = require('../db');

// Setup and teardown
beforeAll(async () => {
  // Ensure database connection is ready
  await new Promise(resolve => setTimeout(resolve, 500));
});

afterAll(async () => {
  if (db.pool) {
    await db.pool.end();
  }
  await closeServer();
});

describe('Server Endpoints', () => {
  it('should return health check page', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /html/)
      .expect(200);
    
    expect(res.text).toContain('Sistema de Inventario - Estado del Servidor');
  });

  it('should return 404 for non-existent route', async () => {
    const res = await request(app)
      .get('/non-existent-route')
      .expect(404);
  });

  describe('API Routes', () => {
    it('should get inventory items', async () => {
      const res = await request(app)
        .get('/api/inventory')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should get stats', async () => {
      const res = await request(app)
        .get('/api/stats/general')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('total');
    });
  });
});