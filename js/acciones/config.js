/**
 * Configuración del mapa de Acciones Climáticas
 */

const CONFIG = {
  API_REAL_URL: (() => {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3001/api/v1/surveys-geoserver/?type=Local";
    }

    if (hostname.includes("vercel.app")) {
      return "/api/proxy?path=/api/v1/surveys-geoserver/?type=Local";
    }

    return "https://api.cambioclimaticotlaxcala.mx/api/v1/surveys-geoserver/?type=Local";
  })(),

  CENTER: {
    lat: 19.42964878131165,
    lng: -98.16560203447955
  },

  MAP: {
    zoom: 10,
    minZoom: 9,
    maxZoom: 18,
    scrollWheelZoom: true,
    zoomControl: true
  },

  CLUSTER: {
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 15
  },

  COLORS: {
    'Comisión Estatal del Agua y Saneamiento': '#4A90E2',
    'Secretaría de Medio Ambiente y Recursos Naturales': '#76BC21',
    'Secretaría de Desarrollo Rural': '#8B6F47',
    'Secretaría de Obras Públicas, Desarrollo Urbano y Vivienda': '#D0B787',
    'Secretaría de Desarrollo Económico': '#A21A5C',
    'default': '#582574'
  },

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

  TILES: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },

  WMS_LAYERS: {
    municipios: {
      nombre: "Municipios de Tlaxcala",
      tipo: "wms",
      url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
      layers: "SEICCT:municipios_ganaperd",
      format: "image/png",
      transparent: true,
      attribution: "GeoServer - SEICCT",
      opacity: 0.6,
      visible: true
    }
  },

  CACHE: {
    enabled: true,
    ttl: 5 * 60 * 1000,
    key: 'acciones_climaticas_cache'
  },

  // Configuración para capa de municipios con colores por cantidad de acciones
  MUNICIPIOS_WFS: {
    url: (() => {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001/geoserver/SEICCT/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SEICCT:municipios_ganaperd&outputFormat=application/json";
      }
      if (hostname.includes("vercel.app")) {
        return "/api/proxy?path=" + encodeURIComponent("/geoserver/SEICCT/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SEICCT:municipios_ganaperd&outputFormat=application/json");
      }
      return "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=SEICCT:municipios_ganaperd&outputFormat=application/json";
    })(),
    campoId: 'CVE_MUN',
    campoNombre: 'NOM_MUN'
  },

  RANGOS_ACCIONES: [
    { min: 1, max: 2, color: '#FFEB3B', label: '1-2 acciones' },
    { min: 3, max: 5, color: '#FFB74D', label: '3-5 acciones' },
    { min: 6, max: 10, color: '#FF9800', label: '6-10 acciones' },
    { min: 11, max: 20, color: '#EF5350', label: '11-20 acciones' },
    { min: 21, max: Infinity, color: '#B71C1C', label: '20+ acciones' }
  ],

  COLOR_SIN_ACCIONES: '#E0E0E0',

  API_TIMEOUT: 10000,

  MESSAGES: {
    loading: 'Cargando acciones climáticas...',
    error: 'Error al cargar los datos. Por favor, intenta nuevamente.',
    noData: 'No se encontraron acciones climáticas.',
    apiTimeout: 'La carga de datos está tomando más tiempo del esperado. Por favor, espera...'
  }
};

if (typeof window !== 'undefined') {
  window.AccionesConfig = CONFIG;
}
