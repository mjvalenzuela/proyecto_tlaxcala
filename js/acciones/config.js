/**
 * Configuración general del mapa de Acciones Climáticas
 */

const CONFIG = {
  // URL del API de Google Apps Script
  API_URL: 'https://script.google.com/macros/s/AKfycbwiTxbC89VgotyF_s_dgRnrA16-AfovMV7PRWfOj5oL8-QFO76n6FSXko0_JnJx8abV1A/exec',

  // Coordenadas del centro de Tlaxcala
  CENTER: {
    lat: 19.318,
    lng: -98.237
  },

  // Configuración del mapa
  MAP: {
    zoom: 10,
    minZoom: 8,
    maxZoom: 18,
    scrollWheelZoom: true,
    zoomControl: true
  },

  // Configuración de clusters
  CLUSTER: {
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 15
  },

  // Colores por dependencia (paleta del proyecto Tlaxcala)
  COLORS: {
    'Comisión Estatal del Agua y Saneamiento': '#4A90E2',      // Azul
    'Secretaría de Medio Ambiente y Recursos Naturales': '#76BC21', // Verde
    'Secretaría de Desarrollo Rural': '#8B6F47',               // Café tierra
    'Secretaría de Obras Públicas, Desarrollo Urbano y Vivienda': '#D0B787', // Beige
    'Secretaría de Desarrollo Económico': '#A21A5C',           // Magenta
    // Color por defecto
    'default': '#582574'  // Morado principal del proyecto
  },

  // Íconos personalizados por tipo
  ICONS: {
    proyecto: {
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4A90E2">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    },
    programa: {
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#76BC21">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      `),
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    }
  },

  // Tiles del mapa base
  TILES: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },

  // Cache
  CACHE: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutos en milisegundos
    key: 'acciones_climaticas_data'
  },

  // Timeout para la carga del API
  API_TIMEOUT: 10000, // 10 segundos

  // Mensajes
  MESSAGES: {
    loading: 'Cargando acciones climáticas...',
    error: 'Error al cargar los datos. Por favor, intenta nuevamente.',
    noData: 'No se encontraron acciones climáticas.',
    apiTimeout: 'La carga de datos está tomando más tiempo del esperado. Por favor, espera...'
  }
};

// Hacer CONFIG disponible globalmente
if (typeof window !== 'undefined') {
  window.AccionesConfig = CONFIG;
}
