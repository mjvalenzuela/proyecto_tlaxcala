// Configuración del proxy para diferentes entornos
module.exports = {
  // Configuración para desarrollo local
  desarrollo: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3000,  // ✅ Puerto estándar para desarrollo local
    ambiente: 'desarrollo'
  },

  // Configuración para producción
  produccion: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3000,  // ✅ Puerto estándar para producción
    ambiente: 'produccion'
  }
};

// Determinar qué configuración usar según NODE_ENV
const ambiente = process.env.NODE_ENV === 'production' ? 'produccion' : 'desarrollo';
module.exports.actual = module.exports[ambiente];

// Mostrar configuración activa al iniciar
//console.log(`\n🔧 Configuración activa: ${module.exports.actual.ambiente}`);
//console.log(`📍 GeoServer URL: ${module.exports.actual.geoserver}`);
//console.log(`🚀 Puerto del proxy: ${module.exports.actual.puerto}\n`);