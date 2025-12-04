/**
 * Configuracion de capitulos para clima.html
 * Define mapas, capas WMS y graficos de clima
 */

/**
 * Obtiene URL del proxy segun entorno
 * @returns {string} URL del proxy
 */
const getProxyUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3001/geoserver";
  }

  if (hostname.includes("vercel.app")) {
    return "/api/proxy?path=";
  }

  console.warn(
    "Entorno desconocido - Usando conexion directa (puede tener problemas CORS)"
  );
  return "https://api.cambioclimaticotlaxcala.mx/geoserver";
};

// Definicion de simbologias para capas climaticas
const simbologias = {
  "SEICCT:clima_actual": {
    titulo: "Clima Actual",
    tipo: "polygon",
    categorias: [
      { label: "Templado subhumedo", color: "#4a90d9", stroke: "#232323" },
      { label: "Semifrio subhumedo", color: "#7cb5ec", stroke: "#232323" },
      { label: "Frio", color: "#a8d4f0", stroke: "#232323" }
    ]
  },
  "SEICCT:temperatura_media": {
    titulo: "Temperatura Media Anual",
    tipo: "polygon",
    categorias: [
      { label: "< 12 C", color: "#2166ac", stroke: "#232323" },
      { label: "12 - 14 C", color: "#67a9cf", stroke: "#232323" },
      { label: "14 - 16 C", color: "#d1e5f0", stroke: "#232323" },
      { label: "16 - 18 C", color: "#fddbc7", stroke: "#232323" },
      { label: "> 18 C", color: "#ef8a62", stroke: "#232323" }
    ]
  },
  "SEICCT:precipitacion": {
    titulo: "Precipitacion Anual",
    tipo: "polygon",
    categorias: [
      { label: "< 600 mm", color: "#ffffcc", stroke: "#232323" },
      { label: "600 - 800 mm", color: "#a1dab4", stroke: "#232323" },
      { label: "800 - 1000 mm", color: "#41b6c4", stroke: "#232323" },
      { label: "> 1000 mm", color: "#225ea8", stroke: "#232323" }
    ]
  }
};

export const climaConfig = {
  id: "clima",
  titulo: "Clima en Tlaxcala",
  descripcion: "Analisis del clima actual y proyecciones climaticas en Tlaxcala",

  proxyUrl: getProxyUrl(),
  simbologias: simbologias,

  defaultCenter: [-98.16560203447955, 19.42964878131165],
  defaultZoom: 9.5,

  capitulos: [
    {
      id: 1,
      titulo: "Clima actual en Tlaxcala",
      label: "Clima Actual",
      mapId: "map-1",
      capas: [
        { tipo: "subtitulo", titulo: "Capas Base" },
        {
          nombre: "Limite Estatal",
          tipo: "wms",
          layer: "SEICCT:Limite",
          opacity: 1,
          visible: true,
          zIndex: 1,
          leyenda: false,
        },
        {
          nombre: "Municipios",
          tipo: "wms",
          layer: "SEICCT:municipios_ganaperd",
          opacity: 0.7,
          visible: true,
          zIndex: 2,
          leyenda: false,
        },
      ],
      grafico: {
        tipo: "line",
        titulo: "Temperatura promedio anual",
        datos: [
          { anio: "2000", valor: 14.2 },
          { anio: "2005", valor: 14.5 },
          { anio: "2010", valor: 14.8 },
          { anio: "2015", valor: 15.1 },
          { anio: "2020", valor: 15.4 },
        ],
      },
    },
    {
      id: 2,
      titulo: "Proyecciones climaticas",
      label: "Proyecciones",
      mapId: "map-2",
      capas: [
        { tipo: "subtitulo", titulo: "Capas Base" },
        {
          nombre: "Limite Estatal",
          tipo: "wms",
          layer: "SEICCT:Limite",
          opacity: 1,
          visible: true,
          zIndex: 1,
          leyenda: false,
        },
        {
          nombre: "Municipios",
          tipo: "wms",
          layer: "SEICCT:municipios_ganaperd",
          opacity: 0.7,
          visible: true,
          zIndex: 2,
          leyenda: false,
        },
      ],
      grafico: {
        tipo: "bar",
        titulo: "Precipitacion proyectada",
        datos: [
          { periodo: "Historico", valor: 850 },
          { periodo: "2030", valor: 820 },
          { periodo: "2050", valor: 780 },
          { periodo: "2070", valor: 750 },
        ],
      },
    },
    {
      id: 3,
      titulo: "Variabilidad climatica",
      label: "Variabilidad",
      mapId: "map-3",
      capas: [
        { tipo: "subtitulo", titulo: "Capas Base" },
        {
          nombre: "Limite Estatal",
          tipo: "wms",
          layer: "SEICCT:Limite",
          opacity: 1,
          visible: true,
          zIndex: 1,
          leyenda: false,
        },
        {
          nombre: "Municipios",
          tipo: "wms",
          layer: "SEICCT:municipios_ganaperd",
          opacity: 0.7,
          visible: true,
          zIndex: 2,
          leyenda: false,
        },
      ],
      grafico: {
        tipo: "bar",
        titulo: "Frecuencia de eventos extremos",
        datos: [
          { evento: "Heladas", valor: 45 },
          { evento: "Granizadas", valor: 28 },
          { evento: "Sequias", valor: 12 },
          { evento: "Lluvias intensas", valor: 35 },
        ],
      },
    },
  ],

  timeline: {
    totalChapters: 3,
  },
};

if (typeof window !== "undefined") {
  window.climaConfig = climaConfig;
}
