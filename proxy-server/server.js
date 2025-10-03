const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

const app = express();
const PORT = config.actual.puerto;
const GEOSERVER_URL = config.actual.geoserver;

// Habilitar CORS para todas las peticiones
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Configuración del proxy para GeoServer
const proxyOptions = {
  target: GEOSERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/geoserver': '' // Remueve /geoserver del path antes de enviar a GeoServer
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy → ${GEOSERVER_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Respuesta: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy:', err.message);
    res.status(500).json({ 
      error: 'Error al conectar con GeoServer',
      mensaje: err.message 
    });
  }
};

// Ruta del proxy - todas las peticiones a /geoserver/* se redirigen
app.use('/geoserver', createProxyMiddleware(proxyOptions));

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ambiente: config.actual.ambiente,
    geoserver: GEOSERVER_URL,
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz con información
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Proxy Server para GeoServer',
    ambiente: config.actual.ambiente,
    uso: {
      proxy: `http://localhost:${PORT}/geoserver/...`,
      ejemplo: `http://localhost:${PORT}/geoserver/Tlaxcala/wms`,
      health: `http://localhost:${PORT}/health`
    },
    geoserver_destino: GEOSERVER_URL
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🌍 Proxy Server GeoServer - ACTIVO          ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log(`\n✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📡 Redirigiendo a: ${GEOSERVER_URL}`);
  console.log(`\n📖 Uso:`);
  console.log(`   Frontend: http://localhost:${PORT}/geoserver/Tlaxcala/wms`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`\n💡 Para detener: Ctrl+C\n`);
});