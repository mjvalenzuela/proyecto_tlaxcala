// Configuración del proxy para diferentes entornos
module.exports = {
  // Configuración para desarrollo local
  desarrollo: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3001,  // Puerto estándar para desarrollo local
    ambiente: 'desarrollo'
  },

  // Configuración para producción
  produccion: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3000,  // Puerto estándar para producción
    ambiente: 'produccion'
  }
};

// Determinar qué configuración usar según NODE_ENV
const ambiente = process.env.NODE_ENV === 'production' ? 'produccion' : 'desarrollo';
module.exports.actual = module.exports[ambiente];
