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
          {
            nombre: "Límite",
            tipo: "wms",
            url: getProxyUrl() + "/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
          {
            nombre: "Amenazas por Municipio",
            tipo: "wms",
            url: getProxyUrl() + "/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
          },
          {
            nombre: "Amenazas por Municipio (Interacción)",
            tipo: "wfs", // WFS transparente solo para clicks
            url: getProxyUrl() + "/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
            transparente: true, // Marca para aplicar estilo transparente
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
  ],
};
