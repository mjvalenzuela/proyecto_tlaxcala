/**
 * Obtiene URL del proxy según entorno
 * @returns {string} URL del proxy
 */
const getProxyUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3011/geoserver";
  }

  if (hostname.includes("vercel.app")) {
    return "/api/proxy?path=";
  }

  console.warn(
    "Entorno desconocido - Usando conexión directa (puede tener problemas CORS)"
  );
  return "https://api.cambioclimaticotlaxcala.mx/geoserver";
};

// Definición de simbologías extraídas de SLD de GeoServer
const simbologias = {
  "SEICCT:municipios_con_atlas_riesgo": {
    titulo: "Municipios con Atlas de riesgo",
    tipo: "polygon",
    categorias: [
      { label: "Sí", color: "#699063", stroke: "#232323" },
      { label: "No", color: "#e1e1e1", stroke: "#232323" }
    ]
  },
  "SEICCT:total_de_declaratorias": {
    titulo: "Total de Declaratorias",
    tipo: "polygon",
    categorias: [
      { label: "4 - 6", color: "#c40000", stroke: "#232323" },
      { label: "6 - 8", color: "#e27c00", stroke: "#232323" },
      { label: "8 - 10", color: "#fff700", stroke: "#232323" },
      { label: "10 - 14", color: "#86a603", stroke: "#232323" },
      { label: "14 - 20", color: "#0c5406", stroke: "#232323" }
    ]
  },
  "SEICCT:contingencia_climatica": {
    titulo: "# Contingencia Climática",
    tipo: "polygon",
    categorias: [
      { label: "0", color: "#fcfdbf", stroke: "#232323" },
      { label: "1", color: "#fec98d", stroke: "#232323" },
      { label: "2", color: "#fd9567", stroke: "#232323" },
      { label: "3", color: "#f1605d", stroke: "#232323" },
      { label: "4", color: "#cd3f71", stroke: "#232323" },
      { label: "5", color: "#9e2f7f", stroke: "#232323" },
      { label: "6", color: "#721f81", stroke: "#232323" },
      { label: "7", color: "#450f76", stroke: "#232323" },
      { label: "8", color: "#180f3e", stroke: "#232323" }
    ]
  },
  "SEICCT:desastres": {
    titulo: "# Desastres",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#ffea46", stroke: "#232323" },
      { label: "2", color: "#beaf6f", stroke: "#232323" },
      { label: "3", color: "#7d7c78", stroke: "#232323" },
      { label: "4", color: "#414d6b", stroke: "#232323" }
    ]
  },
  "SEICCT:emergencias": {
    titulo: "# Emergencias",
    tipo: "polygon",
    categorias: [
      { label: "2", color: "#def5e5", stroke: "#232323" },
      { label: "3", color: "#aae1bd", stroke: "#232323" },
      { label: "4", color: "#62cfac", stroke: "#232323" },
      { label: "5", color: "#3eb4ad", stroke: "#232323" },
      { label: "6", color: "#3498a9", stroke: "#232323" },
      { label: "7", color: "#357ba3", stroke: "#232323" },
      { label: "8", color: "#395d9c", stroke: "#232323" },
      { label: "9", color: "#414082", stroke: "#232323" },
      { label: "10", color: "#382a54", stroke: "#232323" },
      { label: "11", color: "#26172a", stroke: "#232323" }
    ]
  },
  "SEICCT:total_fenomenos": {
    titulo: "Total de Fenómenos",
    tipo: "polygon",
    categorias: [
      { label: "4 - 6", color: "#0c5406", stroke: "#232323" },
      { label: "6 - 8", color: "#85a503", stroke: "#232323" },
      { label: "8 - 10", color: "#fff700", stroke: "#232323" },
      { label: "10 - 14", color: "#e27c00", stroke: "#232323" },
      { label: "14 - 20", color: "#c40000", stroke: "#232323" }
    ]
  },
  "SEICCT:actividad_volcanica": {
    titulo: "Actividad Volcánica",
    tipo: "polygon",
    categorias: [
      { label: "Sí", color: "#fc9ca1", stroke: "#232323" },
      { label: "No", color: "#cecece", stroke: "#232323" }
    ]
  },
  "SEICCT:bajas_temperaturas": {
    titulo: "Bajas Temperaturas",
    tipo: "polygon",
    categorias: [
      { label: "Sí", color: "#9178cd", stroke: "#232323" },
      { label: "No", color: "#d2d2d2", stroke: "#232323" }
    ]
  },
  "SEICCT:ciclones": {
    titulo: "Ciclones",
    tipo: "polygon",
    categorias: [
      { label: "Sí", color: "#5dc178", stroke: "#232323" },
      { label: "No", color: "#d7d7d7", stroke: "#232323" }
    ]
  },
  "SEICCT:heladas": {
    titulo: "Heladas",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#fc7b5c", stroke: "#232323" },
      { label: "2", color: "#ffc750", stroke: "#232323" },
      { label: "3", color: "#494489", stroke: "#232323" },
      { label: "No", color: "#dadada", stroke: "#232323" }
    ]
  },
  "SEICCT:lluvias": {
    titulo: "Lluvias",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#fffee3", stroke: "#232323" },
      { label: "2", color: "#f8ff9a", stroke: "#232323" },
      { label: "3", color: "#b2ed61", stroke: "#232323" },
      { label: "4", color: "#2fc838", stroke: "#232323" },
      { label: "5", color: "#22576b", stroke: "#232323" },
      { label: "6", color: "#2f1475", stroke: "#232323" },
      { label: "No", color: "#dbdbdb", stroke: "#232323" }
    ]
  },
  "SEICCT:nevadas_helada_granizo": {
    titulo: "Nevadas-Helada-Granizo",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#0c5406", stroke: "#232323" },
      { label: "2", color: "#3d7632", stroke: "#232323" },
      { label: "3", color: "#6d985e", stroke: "#232323" },
      { label: "4", color: "#9eba89", stroke: "#232323" },
      { label: "5", color: "#cedcb5", stroke: "#232323" },
      { label: "6", color: "#fffee1", stroke: "#232323" },
      { label: "7", color: "#d8cbc0", stroke: "#232323" },
      { label: "8", color: "#b1989f", stroke: "#232323" },
      { label: "9", color: "#8a667f", stroke: "#232323" },
      { label: "10", color: "#63335e", stroke: "#232323" },
      { label: "No", color: "#cec7ce", stroke: "#232323" }
    ]
  },
  "SEICCT:sequia": {
    titulo: "Sequía",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#faea92", stroke: "#232323" },
      { label: "2", color: "#cc9f35", stroke: "#232323" },
      { label: "No", color: "#d5d5d5", stroke: "#232323" }
    ]
  },
  "SEICCT:sismos": {
    titulo: "Sismos",
    tipo: "polygon",
    categorias: [
      { label: "Sí", color: "#86607c", stroke: "#232323" },
      { label: "No", color: "#d7dad8", stroke: "#232323" }
    ]
  },
  "SEICCT:numero_dias_secos": {
    titulo: "Número de Días Secos",
    tipo: "polygon",
    categorias: [
      { label: "50 - 55", color: "#af3129", stroke: "#232323" },
      { label: "55 - 60", color: "#fd9e75", stroke: "#232323" },
      { label: "60 - 65", color: "#ead891", stroke: "#232323" },
      { label: "65 - 70", color: "#bdf09f", stroke: "#232323" },
      { label: "70 - 75", color: "#75be7b", stroke: "#232323" },
      { label: "75 - 80", color: "#25781a", stroke: "#232323" }
    ]
  },
  "SEICCT:numero_dias_heladas": {
    titulo: "Número de Días de Heladas",
    tipo: "polygon",
    categorias: [
      { label: "5 - 10", color: "#f4f5da", stroke: "#232323" },
      { label: "10 - 15", color: "#c8cfcb", stroke: "#232323" },
      { label: "15 - 20", color: "#9caabd", stroke: "#232323" },
      { label: "20 - 25", color: "#7184ae", stroke: "#232323" },
      { label: "25 - 30", color: "#455fa0", stroke: "#232323" }
    ]
  },
  "SEICCT:uso_de_suelo": {
    titulo: "Uso de Suelo",
    tipo: "polygon",
    categorias: [
      { label: "Agricultura de temporal", color: "#c8c9be", stroke: "#232323" },
      { label: "Cuerpo de agua", color: "#00dfff", stroke: "#232323" },
      { label: "Pastizal halófilo", color: "#8deed7", stroke: "#232323" },
      { label: "Sin vegetación aparente", color: "#d0d0d0", stroke: "#232323" },
      { label: "Pastizal inducido", color: "#ece9b6", stroke: "#232323" },
      { label: "Bosque cultivado", color: "#ff0600", stroke: "#232323" },
      { label: "Matorral desértico rosétofilo", color: "#e1c0dd", stroke: "#232323" },
      { label: "Matorral crasicaule", color: "#fa4fc1", stroke: "#232323" },
      { label: "Bosque de táscate", color: "#dba46c", stroke: "#232323" },
      { label: "Bosque de oyamel", color: "#e5d742", stroke: "#232323" },
      { label: "Bosque de encino", color: "#abd143", stroke: "#232323" },
      { label: "Bosque de encino pino", color: "#438a40", stroke: "#232323" },
      { label: "Bosque de pino", color: "#3be131", stroke: "#232323" },
      { label: "Bosque de pino encino", color: "#efb0bd", stroke: "#232323" },
      { label: "Pradera de alta montaña", color: "#f7cdb6", stroke: "#232323" },
      { label: "Zona urbana", color: "#000000", stroke: "#232323" }
    ]
  }
};

export const storyMapConfig = {
  id: "amenazas",
  titulo: "Amenazas Climáticas en Tlaxcala",
  descripcion:
    "Análisis detallado de las amenazas climáticas en los municipios de Tlaxcala",

  proxyUrl: getProxyUrl(),
  simbologias: simbologias,

  mapaInicial: {
    centro: [-98.2377, 19.3138],
    zoom: 10,
    capas: [
      {
        nombre: "Municipios de Tlaxcala",
        tipo: "wms",
        url: getProxyUrl() + "/SEICCT/ows",
        layers: "SEICCT:Municipios",
        visible: true,
        leyenda: false,
      },
    ],
  },

  capitulos: [
    {
      id: "cap-1",
      numero: 1,
      titulo: "Amenazas climáticas por municipio",
      etiqueta: "Amenazas",

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          { tipo: "subtitulo", titulo: "Mapas" },
          {
            nombre: "Municipios con Atlas de riesgo",
            tipo: "wms",
            layer: "SEICCT:municipios_con_atlas_riesgo",
            opacity: 1,
            zIndex: 1,
            leyenda: true,
            visible: true,
          },
          {
            nombre: "Municipios (Interacción)",
            tipo: "wfs",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
            transparente: true,
          },
          { tipo: "subtitulo", titulo: "Declaratorias" },
          {
            nombre: "Total de Declaratorias",
            tipo: "wms",
            layer: "SEICCT:total_de_declaratorias",
            opacity: 1,
            zIndex: 2,
            leyenda: true,
          },
          {
            nombre: "# Contingencia Climática",
            tipo: "wms",
            layer: "SEICCT:contingencia_climatica",
            opacity: 1,
            zIndex: 3,
            leyenda: true,
          },
          {
            nombre: "# Desastres",
            tipo: "wms",
            layer: "SEICCT:desastres",
            opacity: 1,
            zIndex: 4,
            leyenda: true,
          },
          {
            nombre: "# Emergencias",
            tipo: "wms",
            layer: "SEICCT:emergencias",
            opacity: 1,
            zIndex: 5,
            leyenda: true,
          },
          { tipo: "subtitulo", titulo: "Fenómenos" },
          {
            nombre: "Total de Fenómenos",
            tipo: "wms",
            layer: "SEICCT:total_fenomenos",
            opacity: 1,
            zIndex: 6,
            leyenda: true,
          },
          {
            nombre: "Sequía",
            tipo: "wms",
            layer: "SEICCT:sequia",
            opacity: 1,
            zIndex: 7,
            leyenda: true,
          },
          {
            nombre: "Lluvias",
            tipo: "wms",
            layer: "SEICCT:lluvias",
            opacity: 1,
            zIndex: 8,
            leyenda: true,
          },
          {
            nombre: "Bajas Temperaturas",
            tipo: "wms",
            layer: "SEICCT:bajas_temperaturas",
            opacity: 1,
            zIndex: 9,
            leyenda: true,
          },
          {
            nombre: "Heladas",
            tipo: "wms",
            layer: "SEICCT:heladas",
            opacity: 1,
            zIndex: 10,
            leyenda: true,
          },
          {
            nombre: "Nevadas-Helada-Granizo",
            tipo: "wms",
            layer: "SEICCT:nevadas_helada_granizo",
            opacity: 1,
            zIndex: 11,
            leyenda: true,
          },
          {
            nombre: "Ciclones",
            tipo: "wms",
            layer: "SEICCT:ciclones",
            opacity: 1,
            zIndex: 12,
            leyenda: true,
          },
          {
            nombre: "Sismos",
            tipo: "wms",
            layer: "SEICCT:sismos",
            opacity: 1,
            zIndex: 13,
            leyenda: true,
          },
          {
            nombre: "Actividad Volcánica",
            tipo: "wms",
            layer: "SEICCT:actividad_volcanica",
            opacity: 1,
            zIndex: 14,
            leyenda: true,
          },
        ],
      },

      grafico: {
        tipo: "pie",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {
          etiqueta: "categoria",
          valor: "poblacion",
          colores: [
            "#78020e",
            "#9a3c43",
            "#bc7678",
            "#ddb0ae",
            "#ffeae3",
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: false,
          mostrarValoresEnTorta: false,
        },
      },
    },

    {
      id: "cap-2",
      numero: 2,
      titulo: "Análisis de Amenazas Climáticas",
      etiqueta: "Análisis y Tendencias",
    },

    {
      id: "cap-3",
      numero: 3,
      titulo: "Amenazas al sector agrícola: Sequía",
      etiqueta: "Amenazas: Sequía",
    },

    {
      id: "cap-4",
      numero: 4,
      titulo: "Amenazas al sector agrícola: Heladas",
      etiqueta: "Amenazas: Heladas",
    },
  ],
};
