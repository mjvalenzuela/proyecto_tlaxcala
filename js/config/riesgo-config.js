// Configuración de capítulos para riesgo.html

const RiesgoConfig = {
  // Configuración del proxy (igual que en vulnerabilidad-config.js)
  proxy: {
    url: (() => {
      const hostname = window.location.hostname;

      // ENTORNO LOCAL (Live Server, http-server, etc.)
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001/geoserver";
      }

      // ENTORNO VERCEL (Producción)
      if (hostname.includes("vercel.app")) {
        return "/api/proxy?path=";
      }

      // Conexión directa
      console.warn(
        "Entorno desconocido - Usando conexión directa (puede tener problemas CORS)"
      );
      return "https://api.cambioclimaticotlaxcala.mx/geoserver";
    })(),
  },

  // Centro y zoom por defecto para Tlaxcala
  defaultCenter: [-98.16560203447955, 19.42964878131165],
  defaultZoom: 10,

  // Configuración de capítulos
  capitulos: [
    {
      id: 1,
      titulo: "Riesgo climático por municipio",
      label: "Riesgo climático",
      mapId: "map-1",
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
    {
      id: 2,
      titulo: "Eventos por año y declaratorias",
      label: "Eventos y Declaratorias",
      mapId: "map-2",
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

  // Configuración del timeline
  timeline: {
    totalChapters: 3,
  },

  // Enlaces externos
  links: {
    atlasEstatal:
      "http://rmgir.proyectomesoamerica.org/PDFAtlasEstatales/TLAXCALA_2006.pdf",
  },
};

// Hacer disponible globalmente
if (typeof window !== "undefined") {
  window.RiesgoConfig = RiesgoConfig;
}
