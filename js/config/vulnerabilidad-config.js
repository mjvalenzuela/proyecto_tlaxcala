/**
 * vulnerabilidad-config.js - Configuración del Story Map de Vulnerabilidad
 * ACTUALIZADO: Incluye ejemplo de Layer Swipe para comparar capas temporales
 */

export const storyMapConfig = {
  id: 'vulnerabilidad',
  titulo: 'Vulnerabilidad Climática en Tlaxcala',
  descripcion: 'Análisis detallado de la vulnerabilidad climática en los municipios de Tlaxcala',
  
  // Configuración del mapa inicial (portada)
  mapaInicial: {
    centro: [-98.2377, 19.3138],
    zoom: 10,
    capas: [
      {
        nombre: 'Municipios',
        tipo: 'wms',
        url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
        layers: 'SEICCT:Municipios',
        visible: true
      }
    ]
  },

  // Definición de los capítulos
  capitulos: [
    // ==================== CAPÍTULO 1 ====================
    {
      id: 'cap-1',
      numero: 1,
      titulo: 'Contexto Municipal',
      etiqueta: 'Contexto',
      
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Limite',
            tipo: 'wfs',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true,
            estilo: {
              fillColor: 'rgba(80, 180, 152, 0.3)',
              strokeColor: '#50B498',
              strokeWidth: 2
            }
          }
        ]
      },

      grafico: {
        tipo: 'bar',
        datos: 'data/municipios.csv',
        config: {
          titulo: 'Vulnerabilidad por Municipio',
          ejeX: 'municipio',
          ejeY: 'vulnerabilidad',
          color: 'rgba(239, 68, 68, 0.8)',
          mostrarLeyenda: false
        }
      }
    },

    // ==================== CAPÍTULO 2 - CON LAYER SWIPE ====================
    {
      id: 'cap-2',
      numero: 2,
      titulo: 'Comparación Temporal de Vulnerabilidad',
      etiqueta: 'Comparación',
      
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          // ⬇️ Capa de vulnerabilidad 2020 (izquierda del swipe)
          {
            nombre: 'Vulnerabilidad 2020',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Municipios',
            visible: true,
            leyenda: true
          },
          // ⬇️ Capa de vulnerabilidad 2024 (derecha del swipe)
          {
            nombre: 'Vulnerabilidad 2024',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Localidades',
            visible: true,
            leyenda: true
          }
        ],
        
        // ⬇️ NUEVO: Configuración de Layer Swipe
        swipe: {
          enabled: true,
          capaIzquierda: 'Vulnerabilidad 2020',
          capaDerecha: 'Vulnerabilidad 2024'
        }
      },

      grafico: {
        tipo: 'line',
        datos: 'data/temperatura.csv',
        config: {
          titulo: 'Evolución Temporal de Vulnerabilidad',
          ejeX: 'año',
          datasets: [
            {
              label: 'Índice Promedio',
              dato: 'promedio',
              color: 'rgba(244, 121, 33, 0.8)',
              borderColor: '#F47921'
            }
          ],
          mostrarLeyenda: true,
          mostrarPuntos: true
        }
      }
    },

    // ==================== CAPÍTULO 3 ====================
    {
      id: 'cap-3',
      numero: 3,
      titulo: 'Distribución de Vulnerabilidad',
      etiqueta: 'Distribución',
      
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Índice de Vulnerabilidad',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Localidades',
            visible: true,
            leyenda: true
          }
        ]
      },

      grafico: {
        tipo: 'pie',
        datos: 'data/categorias.csv',
        config: {
          titulo: 'Categorías de Vulnerabilidad',
          etiqueta: 'categoria',
          valor: 'porcentaje',
          colores: [
            'rgba(239, 68, 68, 0.8)',   // Muy Alto - Rojo
            'rgba(245, 158, 11, 0.8)',  // Alto - Naranja
            'rgba(234, 179, 8, 0.8)',   // Medio - Amarillo
            'rgba(34, 197, 94, 0.8)'    // Bajo - Verde
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: true
        }
      }
    }
  ],

  // Configuración de la capa base
  mapaBase: {
    tipo: 'esri',
    nombre: 'World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
  },

  // Configuración del proxy
  proxy: {
    url: (() => {
      const hostname = window.location.hostname;
      
      // LOCAL: Usando Live Server (puerto 5500 o 127.0.0.1)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('🏠 Entorno: LOCAL - Usando proxy Node.js');
        return 'http://localhost:3001/geoserver';
      }
      
      // VERCEL PRODUCCIÓN
      if (hostname.includes('vercel.app')) {
        console.log('☁️ Entorno: VERCEL - Usando proxy serverless');
        return '/api/proxy?path=';
      }
      
      // FALLBACK: Conexión directa (si tienes dominio propio)
      console.log('🌐 Entorno: OTRO - Conexión directa');
      return 'https://api.cambioclimaticotlaxcala.mx/geoserver';
    })()
  }
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Valida que la configuración sea correcta
 */
export function validarConfiguracion(config) {
  if (!config.capitulos || config.capitulos.length === 0) {
    throw new Error('La configuración debe tener al menos un capítulo');
  }

  config.capitulos.forEach((cap, index) => {
    if (!cap.mapa || !cap.grafico) {
      throw new Error(`El capítulo ${index + 1} debe tener configuración de mapa y gráfico`);
    }

    // Validar swipe si está habilitado
    if (cap.mapa.swipe?.enabled) {
      if (!cap.mapa.swipe.capaIzquierda || !cap.mapa.swipe.capaDerecha) {
        throw new Error(`El capítulo ${index + 1} tiene swipe habilitado pero faltan capas`);
      }

      // Verificar que las capas existen
      const nombreCapas = cap.mapa.capas.map(c => c.nombre);
      if (!nombreCapas.includes(cap.mapa.swipe.capaIzquierda)) {
        throw new Error(`Capa izquierda del swipe no encontrada: ${cap.mapa.swipe.capaIzquierda}`);
      }
      if (!nombreCapas.includes(cap.mapa.swipe.capaDerecha)) {
        throw new Error(`Capa derecha del swipe no encontrada: ${cap.mapa.swipe.capaDerecha}`);
      }
    }
  });

  return true;
}

/**
 * Obtiene un capítulo por su número
 */
export function obtenerCapituloPorNumero(numero) {
  return storyMapConfig.capitulos.find(cap => cap.numero === numero);
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
  return storyMapConfig.capitulos.filter(cap => cap.mapa.swipe?.enabled);
}

/**
 * Verifica si un capítulo tiene swipe habilitado
 */
export function tieneSwipe(numeroCapitulo) {
  const capitulo = obtenerCapituloPorNumero(numeroCapitulo);
  return capitulo?.mapa?.swipe?.enabled || false;
}