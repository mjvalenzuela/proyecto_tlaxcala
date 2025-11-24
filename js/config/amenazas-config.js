// Función para obtener la URL del proxy según el entorno
const getProxyUrl = () => {
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
};

export const storyMapConfig = {
  id: "amenazas",
  titulo: "Amenazas Climáticas en Tlaxcala",
  descripcion:
    "Análisis detallado de las amenazas climáticas en los municipios de Tlaxcala",

  // URL del proxy
  proxyUrl: getProxyUrl(),

  // ==========================================
  // MAPA INICIAL (PORTADA)
  // ==========================================
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

  // ==========================================
  // DEFINICIÓN DE LOS CAPÍTULOS
  // ==========================================
  capitulos: [
    // ==========================================
    // CAPÍTULO 1: AMENAZAS CLIMÁTICAS
    // ==========================================
    {
      id: "cap-1",
      numero: 1,
      titulo: "Amenazas climáticas por municipio",
      etiqueta: "Amenazas",

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          // Grupo 1 de capas: Mapas
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
          // Grupo 2 de capas: Declaratorias
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
          // Grupo 3 de capas: Fenómenos
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
            nombre: "Actividad Volcánica",
            tipo: "wms",
            layer: "SEICCT:actividad_volcanica",
            opacity: 1,
            zIndex: 7,
            leyenda: true,
          },
          {
            nombre: "Bajas Temperaturas",
            tipo: "wms",
            layer: "SEICCT:bajas_temperaturas",
            opacity: 1,
            zIndex: 8,
            leyenda: true,
          },
          {
            nombre: "Ciclones",
            tipo: "wms",
            layer: "SEICCT:ciclones",
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
            nombre: "Lluvias",
            tipo: "wms",
            layer: "SEICCT:lluvias",
            opacity: 1,
            zIndex: 11,
            leyenda: true,
          },
          {
            nombre: "Nevadas-Helada-Granizo",
            tipo: "wms",
            layer: "SEICCT:nevadas_helada_granizo",
            opacity: 1,
            zIndex: 12,
            leyenda: true,
          },
          {
            nombre: "Sequia",
            tipo: "wms",
            layer: "SEICCT:sequia",
            opacity: 1,
            zIndex: 13,
            leyenda: true,
          },
          {
            nombre: "Sismos",
            tipo: "wms",
            layer: "SEICCT:sismos",
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
            "#78020e", // Muy Alto - Rojo oscuro
            "#9a3c43", // Alto - Rojo medio
            "#bc7678", // Medio - Rosa medio
            "#ddb0ae", // Bajo - Rosa claro
            "#ffeae3", // Muy Bajo - Rosa muy claro
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: false,
          mostrarValoresEnTorta: false, // No mostrar valores en la torta
        },
      },
    },

    // ==========================================
    // CAPÍTULO 2: ANÁLISIS Y TENDENCIAS
    // ==========================================
    {
      id: "cap-2",
      numero: 2,
      titulo: "Análisis de Amenazas Climáticas",
      etiqueta: "Análisis y Tendencias",
      // Este capítulo solo tiene gráficos, no tiene mapa
    },

    // ==========================================
    // CAPÍTULO 3: IMPACTO TERRITORIAL
    // ==========================================
    {
      id: "cap-3",
      numero: 3,
      titulo: "Impacto territorial de amenazas climáticas",
      etiqueta: "Impacto Territorial",

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          // Grupo 1 de capas: Mapas
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
          // Grupo 2 de capas: Declaratorias
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
          // Grupo 3 de capas: Fenómenos
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
            nombre: "Actividad Volcánica",
            tipo: "wms",
            layer: "SEICCT:actividad_volcanica",
            opacity: 1,
            zIndex: 7,
            leyenda: true,
          },
          {
            nombre: "Bajas Temperaturas",
            tipo: "wms",
            layer: "SEICCT:bajas_temperaturas",
            opacity: 1,
            zIndex: 8,
            leyenda: true,
          },
          {
            nombre: "Ciclones",
            tipo: "wms",
            layer: "SEICCT:ciclones",
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
            nombre: "Lluvias",
            tipo: "wms",
            layer: "SEICCT:lluvias",
            opacity: 1,
            zIndex: 11,
            leyenda: true,
          },
          {
            nombre: "Nevadas-Helada-Granizo",
            tipo: "wms",
            layer: "SEICCT:nevadas_helada_granizo",
            opacity: 1,
            zIndex: 12,
            leyenda: true,
          },
          {
            nombre: "Sequia",
            tipo: "wms",
            layer: "SEICCT:sequia",
            opacity: 1,
            zIndex: 13,
            leyenda: true,
          },
          {
            nombre: "Sismos",
            tipo: "wms",
            layer: "SEICCT:sismos",
            opacity: 1,
            zIndex: 14,
            leyenda: true,
          },
        ],
      },
    },
  ],
};
