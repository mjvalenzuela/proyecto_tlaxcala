export const storyMapConfig = {
  id: "vulnerabilidad",
  titulo: "Vulnerabilidad Climática en Tlaxcala",
  descripcion:
    "Análisis detallado de la vulnerabilidad climática en los municipios de Tlaxcala",

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
        url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
        layers: "SEICCT:Municipios", // ✅ CORREGIDO
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
    // CAPÍTULO 1: CONTEXTO MUNICIPAL
    // ==========================================
    {
      id: "cap-1",
      numero: 1,
      titulo: "Índice de vulnerabilidad al CC por municipio",
      etiqueta: "Contexto",

      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          }, 
          {
            nombre: "Vulnerabilidad por Municipio",
            tipo: "wfs", // WFS para permitir interacción con popup
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82Vulnerabilidad", 
            visible: true,
            leyenda: true,
            /* estilo: {
              fillColor: "rgba(162, 26, 92, 0.3)",
              strokeColor: "#A21A5C",
              strokeWidth: 2,
            }, */
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

      /*       grafico: {
        tipo: "bar",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {          
          ejeX: "municipio",
          ejeY: "vulnerabilidad",
          etiquetaY: "Índice de Vulnerabilidad",
          color: "rgba(239, 68, 68, 0.8)",
          colorBorde: "rgba(239, 68, 68, 1)",
          mostrarLeyenda: false,
        },
      }, */
    },

    // ==========================================
    // CAPÍTULO 2: COMPARACIÓN TEMPORAL
    // ==========================================
    {
      id: "cap-2",
      numero: 2,
      titulo: "Comparación Temporal de Vulnerabilidad",
      etiqueta: "Comparación",

      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          // Capa izquierda del swipe (si está habilitado)
          {
            nombre: "Municipios",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Municipios", // ✅ CORREGIDO
            visible: true,
            leyenda: true,
          },
          // Capa derecha del swipe (si está habilitado)
          {
            nombre: "Localidades",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Localidades",
            visible: true,
            leyenda: true,
          },
        ],

        swipe: {
          enabled: true,
          capaIzquierda: "Municipios",
          capaDerecha: "Localidades",
        },
      },

      grafico: {
        tipo: "line",
        datos: "data/temperatura.csv",
        config: {
          titulo: "Evolución Temporal de Vulnerabilidad",
          ejeX: "año",
          datasets: [
            {
              label: "Temperatura Promedio (°C)",
              dato: "temperatura_promedio",
              color: "rgba(162, 26, 92, 0.3)",
              borderColor: "#A21A5C",
            },
            {
              label: "Días Calurosos",
              dato: "dias_calurosos",
              color: "rgba(239, 68, 68, 0.3)",
              borderColor: "#EF4444",
            },
          ],
          mostrarLeyenda: true,
          mostrarPuntos: true,
        },
      },
    },

    // ==========================================
    // CAPÍTULO 3: DISTRIBUCIÓN DE VULNERABILIDAD
    // ==========================================
    {
      id: "cap-3",
      numero: 3,
      titulo: "Distribución de Vulnerabilidad",
      etiqueta: "Distribución",

      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          /*           {
            nombre: 'Índice de Vulnerabilidad',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Municipios',  // ✅ CORREGIDO
            visible: true,
            leyenda: true
          }, */
          {
            nombre: "Localidades",
            tipo: "wfs",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Localidades", // ✅ CORREGIDO
            visible: true,
            leyenda: false,
            opacity: 0.6, // Semi-transparente para ver ambas capas
          },
        ],
      },

      grafico: {
        tipo: "pie",
        datos: "data/categorias.csv",
        config: {
          titulo: "Categorías de Vulnerabilidad",
          etiqueta: "categoria",
          valor: "porcentaje",
          colores: [
            "rgba(239, 68, 68, 0.8)", // Muy Alto - Rojo
            "rgba(245, 158, 11, 0.8)", // Alto - Naranja
            "rgba(234, 179, 8, 0.8)", // Medio - Amarillo
            "rgba(34, 197, 94, 0.8)", // Bajo - Verde
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: true,
        },
      },
    },
  ],

  // ==========================================
  // CONFIGURACIÓN DE LA CAPA BASE
  // ==========================================
  mapaBase: {
    tipo: "esri",
    nombre: "World Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },

  // ==========================================
  // CONFIGURACIÓN DEL PROXYlkjsk
  // ==========================================
  proxy: {
    url: (() => {
      const hostname = window.location.hostname;

      // ==========================================
      // ENTORNO LOCAL (Live Server, http-server, etc.)
      // ==========================================
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        // console.log("🏠 Entorno: LOCAL - Usando proxy Node.js local");
        return "http://localhost:3001/geoserver";
      }

      // ==========================================
      // ENTORNO VERCEL (Producción)
      // ==========================================
      if (hostname.includes("vercel.app")) {
        // console.log("☁️ Entorno: VERCEL - Usando proxy serverless");
        return "/api/proxy?path=";
      }

      // ==========================================
      // FALLBACK: Conexión directa
      // ==========================================
      // console.log("🌐 Entorno: OTRO - Conexión directa a GeoServer");
      // console.warn("⚠️ ADVERTENCIA: Conexión directa puede fallar por CORS");
      return "https://api.cambioclimaticotlaxcala.mx/geoserver";
    })(),
  },
};

// ==========================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ==========================================

/**
 * Valida que la configuración sea correcta
 */
export function validarConfiguracion(config) {
  // console.log("🔍 Validando configuración del Story Map...");

  // Validar que hay capítulos
  if (!config.capitulos || config.capitulos.length === 0) {
    throw new Error("La configuración debe tener al menos un capítulo");
  }

  // Validar cada capítulo
  config.capitulos.forEach((cap, index) => {
    // Validar estructura básica
    if (!cap.mapa || !cap.grafico) {
      throw new Error(
        `El capítulo ${index + 1} debe tener configuración de mapa y gráfico`
      );
    }

    // Validar que las capas existen
    if (!cap.mapa.capas || cap.mapa.capas.length === 0) {
      throw new Error(
        `El capítulo ${index + 1} debe tener al menos una capa de mapa`
      );
    }

    // Validar capas WMS/WFS
    cap.mapa.capas.forEach((capa, capaIndex) => {
      if (!capa.layers || !capa.layers.includes("SEICCT:")) {
        // console.warn(`⚠️ Capítulo ${index + 1}, Capa ${capaIndex + 1}: No tiene el formato correcto SEICCT:NombreCapa`);
      }

      // Validar que el nombre de la capa es válido
      const capasValidas = [
        "SEICCT:Limite",
        "SEICCT:Localidades",
        "SEICCT:Municipios",
      ];
      if (!capasValidas.includes(capa.layers)) {
        // console.warn(`⚠️ Capítulo ${index + 1}: Capa "${capa.layers}" puede no existir en GeoServer`);
        // console.warn(`   Capas válidas: ${capasValidas.join(", ")}`);
      }
    });

    // Validar swipe si está habilitado
    if (cap.mapa.swipe?.enabled) {
      if (!cap.mapa.swipe.capaIzquierda || !cap.mapa.swipe.capaDerecha) {
        throw new Error(
          `El capítulo ${index + 1} tiene swipe habilitado pero faltan capas`
        );
      }

      // Verificar que las capas existen
      const nombreCapas = cap.mapa.capas.map((c) => c.nombre);
      if (!nombreCapas.includes(cap.mapa.swipe.capaIzquierda)) {
        throw new Error(
          `Capa izquierda del swipe no encontrada: ${cap.mapa.swipe.capaIzquierda}`
        );
      }
      if (!nombreCapas.includes(cap.mapa.swipe.capaDerecha)) {
        throw new Error(
          `Capa derecha del swipe no encontrada: ${cap.mapa.swipe.capaDerecha}`
        );
      }
    }

    // Validar configuración del gráfico
    if (!cap.grafico.tipo || !cap.grafico.datos || !cap.grafico.config) {
      throw new Error(
        `El capítulo ${index + 1} tiene configuración incompleta del gráfico`
      );
    }
  });

  // console.log("✅ Configuración validada correctamente");
  return true;
}

/**
 * Obtiene un capítulo por su número
 */
export function obtenerCapituloPorNumero(numero) {
  return storyMapConfig.capitulos.find((cap) => cap.numero === numero);
}

/**
 * Obtiene el total de capítulos
 */
export function obtenerTotalCapitulos() {
  return storyMapConfig.capitulos.length;
}

/**
 * Obtiene los capítulos que tienen swipe habilitado
 */
export function obtenerCapitulosConSwipe() {
  return storyMapConfig.capitulos.filter((cap) => cap.mapa.swipe?.enabled);
}

/**
 * Verifica si un capítulo tiene swipe habilitado
 */
export function tieneSwipe(numeroCapitulo) {
  const capitulo = obtenerCapituloPorNumero(numeroCapitulo);
  return capitulo?.mapa?.swipe?.enabled || false;
}

/**
 * Obtiene información del proxy según el entorno
 */
export function obtenerInfoProxy() {
  return {
    url: storyMapConfig.proxy.url,
    esLocal: storyMapConfig.proxy.url.includes("localhost"),
    esVercel: storyMapConfig.proxy.url.includes("/api/proxy"),
    esDirecto: storyMapConfig.proxy.url.includes("cambioclimaticotlaxcala.mx"),
  };
}

/**
 * Lista todas las capas únicas usadas en la configuración
 */
export function listarCapasUnicas() {
  const capasSet = new Set();

  // Capas del mapa inicial
  if (storyMapConfig.mapaInicial?.capas) {
    storyMapConfig.mapaInicial.capas.forEach((capa) => {
      capasSet.add(capa.layers);
    });
  }

  // Capas de cada capítulo
  storyMapConfig.capitulos.forEach((cap) => {
    if (cap.mapa?.capas) {
      cap.mapa.capas.forEach((capa) => {
        capasSet.add(capa.layers);
      });
    }
  });

  return Array.from(capasSet);
}

// ==========================================
// VALIDACIÓN AUTOMÁTICA AL CARGAR
// ==========================================
try {
  validarConfiguracion(storyMapConfig);

  // console.log("📊 Resumen de configuración:");
  // console.log(`   - Capítulos: ${obtenerTotalCapitulos()}`);
  // console.log(`   - Capas únicas: ${listarCapasUnicas().join(", ")}`);
  // console.log(`   - Proxy: ${obtenerInfoProxy().url}`);
} catch (error) {
  console.error("❌ Error en la configuración:", error.message);
  throw error;
}
