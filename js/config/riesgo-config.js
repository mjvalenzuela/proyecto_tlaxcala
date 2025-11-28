/**
 * Configuración de capítulos para riesgo.html
 * Define mapas, capas WMS y timeline de riesgo climático
 */
const RiesgoConfig = {
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
        {
          nombre: "Municipios con Atlas de riesgo",
          tipo: "wms",
          layer: "SEICCT:municipios_con_atlas_riesgo",
          opacity: 1,
          zIndex: 1,
          leyenda: true,
        },
        {
          nombre: "Total de Declaratorias",
          tipo: "wms",
          layer: "SEICCT:total_de_declaratorias",
          opacity: 1,
          zIndex: 2,
          leyenda: true,
        },
        {
          nombre: "Contingencia Climática",
          tipo: "wms",
          layer: "SEICCT:contingencia_climatica",
          opacity: 1,
          zIndex: 3,
          leyenda: true,
        },
        {
          nombre: "Desastres",
          tipo: "wms",
          layer: "SEICCT:desastres",
          opacity: 1,
          zIndex: 4,
          leyenda: true,
        },
        {
          nombre: "Emergencias",
          tipo: "wms",
          layer: "SEICCT:emergencias",
          opacity: 1,
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
        {
          nombre: "Municipios con Atlas de riesgo",
          tipo: "wms",
          layer: "SEICCT:municipios_con_atlas_riesgo",
          opacity: 1,
          zIndex: 1,
          leyenda: true,
        },
        {
          nombre: "Total de Declaratorias",
          tipo: "wms",
          layer: "SEICCT:total_de_declaratorias",
          opacity: 1,
          zIndex: 2,
          leyenda: true,
        },
        {
          nombre: "Contingencia Climática",
          tipo: "wms",
          layer: "SEICCT:contingencia_climatica",
          opacity: 1,
          zIndex: 3,
          leyenda: true,
        },
        {
          nombre: "Desastres",
          tipo: "wms",
          layer: "SEICCT:desastres",
          opacity: 1,
          zIndex: 4,
          leyenda: true,
        },
        {
          nombre: "Emergencias",
          tipo: "wms",
          layer: "SEICCT:emergencias",
          opacity: 1,
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
