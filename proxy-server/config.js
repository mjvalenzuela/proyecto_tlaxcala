// Configuración del proxy para diferentes entornos
module.exports = {
  // Configuración para desarrollo local
  desarrollo: {
    geoserver: 'http://localhost:8080/geoserver',
    puerto: 3001,
    ambiente: 'desarrollo'
  },

  // Configuración para producción
  // Cambia esta URL cuando tengas el servidor final
  produccion: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3000,
    ambiente: 'produccion'
  }
};

// Determinar qué configuración usar según NODE_ENV
const ambiente = process.env.NODE_ENV === 'production' ? 'produccion' : 'desarrollo';
module.exports.actual = module.exports[ambiente];

// Mostrar configuración activa al iniciar
console.log(`\n🔧 Configuración activa: ${module.exports.actual.ambiente}`);
console.log(`📍 GeoServer URL: ${module.exports.actual.geoserver}`);
console.log(`🚀 Puerto del proxy: ${module.exports.actual.puerto}\n`);