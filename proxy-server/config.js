module.exports = {
  desarrollo: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3001,
    ambiente: 'desarrollo'
  },

  produccion: {
    geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
    puerto: 3000,
    ambiente: 'produccion'
  }
};

const ambiente = process.env.NODE_ENV === 'production' ? 'produccion' : 'desarrollo';
module.exports.actual = module.exports[ambiente];
