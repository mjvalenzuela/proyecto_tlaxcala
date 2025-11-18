const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const config = require("./config");

const app = express();
const PORT = config.actual.puerto;
const GEOSERVER_URL = config.actual.geoserver;
const API_PROJECTS_URL = "https://api.cambioclimaticotlaxcala.mx";

// Habilitar CORS para todas las peticiones
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware de logging para debugging
app.use((req, res, next) => {
  next();
});

// Configuración del proxy para GeoServer
const proxyOptions = {
  target: GEOSERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/geoserver": "", // Remover /geoserver del inicio
  },
  onProxyReq: (proxyReq, req, res) => {
    const targetUrl = `${GEOSERVER_URL}${req.url.replace(
      "/geoserver",
      "/geoserver"
    )}`;
  },
  onProxyRes: (proxyRes, req, res) => {},
  onError: (err, req, res) => {
    console.error("Error en proxy:", err.message);
    console.error("   URL que falló:", req.url);
    res.status(500).json({
      error: "Error al conectar con GeoServer",
      mensaje: err.message,
      url: req.url,
    });
  },
};

// Ruta del proxy - todas las peticiones a /geoserver/* se redirigen
app.use("/geoserver", createProxyMiddleware(proxyOptions));

// Configuración del proxy para API de Proyectos
const apiProxyOptions = {
  target: API_PROJECTS_URL,
  changeOrigin: true,
  // NO usar pathRewrite - la URL ya incluye /api en el destino
  onProxyReq: (proxyReq, req, res) => {
    const targetUrl = `${API_PROJECTS_URL}${req.url}`;
  },
  onProxyRes: (proxyRes, req, res) => {},
  onError: (err, req, res) => {
    console.error("Error en proxy API:", err.message);
    console.error("   URL que falló:", req.url);
    res.status(500).json({
      error: "Error al conectar con API de Proyectos",
      mensaje: err.message,
      url: req.url,
    });
  },
};

// Ruta del proxy para API de proyectos - todas las peticiones a /api/* se redirigen
app.use("/api", createProxyMiddleware(apiProxyOptions));

// Ruta de health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    ambiente: config.actual.ambiente,
    geoserver: GEOSERVER_URL,
    api_proyectos: API_PROJECTS_URL,
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz con información
app.get("/", (req, res) => {
  res.json({
    mensaje: "Proxy Server para GeoServer y API de Proyectos",
    ambiente: config.actual.ambiente,
    uso: {
      geoserver_proxy: `http://localhost:${PORT}/geoserver/...`,
      geoserver_ejemplo: `http://localhost:${PORT}/geoserver/Tlaxcala/wms`,
      api_proxy: `http://localhost:${PORT}/api/v1/projects/`,
      health: `http://localhost:${PORT}/health`,
    },
    destinos: {
      geoserver: GEOSERVER_URL,
      api_proyectos: API_PROJECTS_URL,
    },
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`✅ Proxy Server ejecutándose en http://localhost:${PORT}`);
  console.log(`📍 Ambiente: ${config.actual.ambiente}`);
  console.log(`🌐 GeoServer: ${GEOSERVER_URL}`);
  console.log(`🔗 API Proyectos: ${API_PROJECTS_URL}`);
  console.log(`\n📝 Endpoints disponibles:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/health`);
  console.log(`   - http://localhost:${PORT}/geoserver/*`);
  console.log(`   - http://localhost:${PORT}/api/*`);
});
