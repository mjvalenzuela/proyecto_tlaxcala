/**
 * Configuración de capítulos para riesgo.html
 * Define mapas, capas WMS y timeline de riesgo climático
 */

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
    titulo: "Contingencia Climática",
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
    titulo: "Desastres",
    tipo: "polygon",
    categorias: [
      { label: "1", color: "#ffea46", stroke: "#232323" },
      { label: "2", color: "#beaf6f", stroke: "#232323" },
      { label: "3", color: "#7d7c78", stroke: "#232323" },
      { label: "4", color: "#414d6b", stroke: "#232323" }
    ]
  },
  "SEICCT:emergencias": {
    titulo: "Emergencias",
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
  }
};

const RiesgoConfig = {
  simbologias: simbologias,

  proxy: {
    url: (() => {
      const hostname = window.location.hostname;

      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001/geoserver";
      }

      if (hostname.includes("vercel.app")) {
        return "/api/proxy?path=";
      }

      console.warn(
        "Entorno desconocido - Usando conexión directa (puede tener problemas CORS)"
      );
      return "https://api.cambioclimaticotlaxcala.mx/geoserver";
    })(),
  },

  defaultCenter: [-98.16560203447955, 19.42964878131165],
  defaultZoom: 9.5,

  capitulos: [
    {
      id: 1,
      titulo: "Riesgo climático por municipio",
      label: "Riesgo climático",
      mapId: "map-1",
      capas: [
        { tipo: "subtitulo", titulo: "Mapas" },
        {
          nombre: "Municipios con Atlas de riesgo",
          tipo: "wms",
          layer: "SEICCT:municipios_con_atlas_riesgo",
          opacity: 1,
          visible: true,
          zIndex: 1,
          leyenda: true,
        },
        { tipo: "subtitulo", titulo: "Declaratorias" },
        {
          nombre: "Total de Declaratorias",
          tipo: "wms",
          layer: "SEICCT:total_de_declaratorias",
          opacity: 1,
          visible: false,
          zIndex: 2,
          leyenda: true,
        },
        {
          nombre: "Contingencia Climática",
          tipo: "wms",
          layer: "SEICCT:contingencia_climatica",
          opacity: 1,
          visible: false,
          zIndex: 3,
          leyenda: true,
        },
        {
          nombre: "Desastres",
          tipo: "wms",
          layer: "SEICCT:desastres",
          opacity: 1,
          visible: false,
          zIndex: 4,
          leyenda: true,
        },
        {
          nombre: "Emergencias",
          tipo: "wms",
          layer: "SEICCT:emergencias",
          opacity: 1,
          visible: false,
          zIndex: 5,
          leyenda: true,
        },
      ],
    },
    {
      id: 2,
      titulo: "Eventos por año y declaratorias",
      label: "Eventos y Declaratorias",
      mapId: "map-2",
      capas: [
        { tipo: "subtitulo", titulo: "Mapas" },
        {
          nombre: "Municipios con Atlas de riesgo",
          tipo: "wms",
          layer: "SEICCT:municipios_con_atlas_riesgo",
          opacity: 1,
          visible: true,
          zIndex: 1,
          leyenda: true,
        },
        { tipo: "subtitulo", titulo: "Declaratorias" },
        {
          nombre: "Total de Declaratorias",
          tipo: "wms",
          layer: "SEICCT:total_de_declaratorias",
          opacity: 1,
          visible: false,
          zIndex: 2,
          leyenda: true,
        },
        {
          nombre: "Contingencia Climática",
          tipo: "wms",
          layer: "SEICCT:contingencia_climatica",
          opacity: 1,
          visible: false,
          zIndex: 3,
          leyenda: true,
        },
        {
          nombre: "Desastres",
          tipo: "wms",
          layer: "SEICCT:desastres",
          opacity: 1,
          visible: false,
          zIndex: 4,
          leyenda: true,
        },
        {
          nombre: "Emergencias",
          tipo: "wms",
          layer: "SEICCT:emergencias",
          opacity: 1,
          visible: false,
          zIndex: 5,
          leyenda: true,
        },
      ],
    },
    {
      id: 3,
      titulo: "Atlas de Riesgo Municipal",
      label: "Atlas Municipales",
      mapId: "map-3",
      atlasCSV: "links.csv",
      capas: [
        {
          nombre: "Limite",
          tipo: "wms",
          layer: "SEICCT:Limite",
          opacity: 1,
          zIndex: 1,
        },
        {
          nombre: "Municipios",
          tipo: "wms",
          layer: "SEICCT:municipios_ganaperd",
          opacity: 1,
          zIndex: 2,
        },
      ],
    },
  ],

  timeline: {
    totalChapters: 3,
  },

  links: {
    atlasEstatal:
      "http://rmgir.proyectomesoamerica.org/PDFAtlasEstatales/TLAXCALA_2006.pdf",
  },
};

if (typeof window !== "undefined") {
  window.RiesgoConfig = RiesgoConfig;
}
