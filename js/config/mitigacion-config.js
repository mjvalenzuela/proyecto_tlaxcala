/**
 * Configuración para la sección de Mitigación
 * Inventario de Emisiones de Gases de Efecto Invernadero
 */

/**
 * Obtiene URL del proxy según entorno
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
    "Entorno desconocido - Usando conexión directa (puede tener problemas CORS)"
  );
  return "https://api.cambioclimaticotlaxcala.mx/geoserver";
};

// Definición de simbologías extraídas de SLD de GeoServer
const simbologias = {
  "SEICCT:Fuentes_Agricolas": {
    titulo: "Fuentes Agrícolas (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0 - 2", color: "#f1fffa", stroke: "#96a89a" },
      { label: "2 - 4", color: "#d3e0d6", stroke: "#96a89a" },
      { label: "4 - 8", color: "#b6c2b2", stroke: "#96a89a" },
      { label: "8 - 16", color: "#98a38d", stroke: "#96a89a" },
      { label: "16 - 28", color: "#7b8569", stroke: "#96a89a" }
    ]
  },
  "SEICCT:Fuentes_Entericas": {
    titulo: "Fuentes Entéricas (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0.03 - 0.04", color: "#00204d", stroke: "#ffffff" },
      { label: "0.04 - 0.05", color: "#414d6b", stroke: "#ffffff" },
      { label: "0.05 - 0.09", color: "#7d7c78", stroke: "#ffffff" },
      { label: "0.09 - 0.15", color: "#beaf6f", stroke: "#ffffff" },
      { label: "0.15 - 1.3", color: "#ffea46", stroke: "#ffffff" }
    ]
  },
  "SEICCT:Fuentes_Industriales": {
    titulo: "Emisiones Industriales (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0 - 1", color: "#e4e4e4", stroke: "#ffffff" },
      { label: "1 - 10", color: "#c6bfbf", stroke: "#ffffff" },
      { label: "10 - 25", color: "#a89a9a", stroke: "#ffffff" },
      { label: "25 - 50", color: "#897474", stroke: "#ffffff" },
      { label: "50 - 138", color: "#6b4f4f", stroke: "#ffffff" }
    ]
  },
  "SEICCT:Fuentes_Moviles": {
    titulo: "Emisiones Móviles (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "6.5 - 15.2", color: "#e6e4e8", stroke: "#ffffff" },
      { label: "15.2 - 22.7", color: "#c1b1cb", stroke: "#ffffff" },
      { label: "22.7 - 39.4", color: "#9c7dae", stroke: "#ffffff" },
      { label: "39.4 - 102.5", color: "#774a91", stroke: "#ffffff" },
      { label: "102.5 - 333.9", color: "#511675", stroke: "#ffffff" }
    ]
  },
  "SEICCT:Fuentes_Residuos": {
    titulo: "Fuentes por Residuos (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0 - 1", color: "#fff5f0", stroke: "#c1b5b5" },
      { label: "1 - 2", color: "#fcbea5", stroke: "#c1b5b5" },
      { label: "2 - 4", color: "#fb7050", stroke: "#c1b5b5" },
      { label: "4 - 8", color: "#d32020", stroke: "#c1b5b5" },
      { label: "8 - 16", color: "#67000d", stroke: "#c1b5b5" }
    ]
  },
  "SEICCT:Fuentes_Tierras": {
    titulo: "Fuentes por Tierras (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0 - 1", color: "#e0e0e0", stroke: "#ffffff" },
      { label: "1 - 2", color: "#cfc5c0", stroke: "#ffffff" },
      { label: "2 - 4", color: "#bdab9f", stroke: "#ffffff" },
      { label: "4 - 7", color: "#ab907f", stroke: "#ffffff" },
      { label: "7 - 14", color: "#796558", stroke: "#ffffff" }
    ]
  },
  "SEICCT:Fuentes_Totales": {
    titulo: "Emisiones Totales (Gg CO2eq)",
    tipo: "polygon",
    categorias: [
      { label: "0 - 20", color: "#fcfbfd", stroke: "#e6e4e8" },
      { label: "20 - 40", color: "#dcdbec", stroke: "#ffffff" },
      { label: "40 - 80", color: "#a39fcb", stroke: "#ffffff" },
      { label: "80 - 160", color: "#9283b5", stroke: "#ffffff" },
      { label: "160 - 340", color: "#674785", stroke: "#ffffff" }
    ]
  }
};

export const mitigacionConfig = {
  id: "mitigacion",
  titulo: "Mitigación - Inventario de Emisiones",
  descripcion:
    "Inventario de Emisiones de Gases de Efecto Invernadero en Tlaxcala",

  proxyUrl: getProxyUrl(),
  simbologias: simbologias,

  mapa: {
    centro: [-98.16560203447955, 19.42964878131165],
    zoom: 10.5,
    capas: [
      { tipo: "subtitulo", titulo: "Fuentes de Emisión" },
      {
        nombre: "Emisiones Totales",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Totales",
        opacity: 1,
        zIndex: 1,
        leyenda: true,
        visible: true,
      },
      {
        nombre: "Fuentes Agrícolas",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Agricolas",
        opacity: 1,
        zIndex: 2,
        leyenda: true,
        visible: false,
      },
      {
        nombre: "Fuentes Entéricas",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Entericas",
        opacity: 1,
        zIndex: 3,
        leyenda: true,
        visible: false,
      },
      {
        nombre: "Emisiones Industriales",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Industriales",
        opacity: 1,
        zIndex: 4,
        leyenda: true,
        visible: false,
      },
      {
        nombre: "Emisiones Móviles",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Moviles",
        opacity: 1,
        zIndex: 5,
        leyenda: true,
        visible: false,
      },
      {
        nombre: "Fuentes por Residuos",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Residuos",
        opacity: 1,
        zIndex: 6,
        leyenda: true,
        visible: false,
      },
      {
        nombre: "Fuentes por Tierras",
        tipo: "wms",
        layer: "SEICCT:Fuentes_Tierras",
        opacity: 1,
        zIndex: 7,
        leyenda: true,
        visible: false,
      },
    ],
  },
};
