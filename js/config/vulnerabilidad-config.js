// Configuración del Story Map de Vulnerabilidad Climática
export const storyMapConfig = {
  id: 'vulnerabilidad',
  titulo: 'Vulnerabilidad Climática en Tlaxcala',
  descripcion: 'Análisis detallado de la vulnerabilidad climática en los municipios de Tlaxcala',
  
  // Configuración del mapa inicial (portada)
  mapaInicial: {
    centro: [-98.2377, 19.3138], // Coordenadas de Tlaxcala [longitud, latitud]
    zoom: 10,
    capas: [
      {
        nombre: 'Municipios',
        tipo: 'wms',
        url: 'http://localhost:3001/geoserver/Tlaxcala/wms',
        layers: 'Tlaxcala:Municipios',
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
      
      // Configuración del mapa para este capítulo
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Municipios',
            tipo: 'wms',
            url: 'http://localhost:3001/geoserver/Tlaxcala/wms',
            layers: 'Tlaxcala:Municipios',
            visible: true,
            leyenda: true
          }
        ]
      },

      // Configuración del gráfico
      grafico: {
        tipo: 'bar', // Tipo: bar, line, pie
        datos: 'data/municipios.csv',
        config: {
          titulo: 'Vulnerabilidad por Municipio',
          ejeX: 'municipio',
          ejeY: 'vulnerabilidad',
          etiquetaX: 'Municipio',
          etiquetaY: 'Índice de Vulnerabilidad',
          color: 'rgba(239, 68, 68, 0.7)', // Color rojo para vulnerabilidad
          colorBorde: 'rgba(239, 68, 68, 1)',
          mostrarLeyenda: false
        }
      }
    },

    // ==================== CAPÍTULO 2 ====================
    {
      id: 'cap-2',
      numero: 2,
      titulo: 'Tendencias Climáticas',
      etiqueta: 'Tendencias',
      
      // Configuración del mapa para este capítulo
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Municipios',
            tipo: 'wms',
            url: 'http://localhost:3001/geoserver/Tlaxcala/wms',
            layers: 'Tlaxcala:Municipios',
            visible: true,
            leyenda: true
          }
        ]
      },

      // Configuración del gráfico - Serie temporal con múltiples líneas
      grafico: {
        tipo: 'line',
        datos: 'data/temperatura.csv',
        config: {
          titulo: 'Evolución Climática 2010-2024',
          ejeX: 'año',
          datasets: [
            {
              label: 'Temperatura Promedio (°C)',
              dato: 'temperatura_promedio',
              color: 'rgba(239, 68, 68, 0.7)',
              colorBorde: 'rgba(239, 68, 68, 1)',
              yAxisID: 'y'
            },
            {
              label: 'Precipitación (mm)',
              dato: 'precipitacion_mm',
              color: 'rgba(59, 130, 246, 0.7)',
              colorBorde: 'rgba(59, 130, 246, 1)',
              yAxisID: 'y1'
            }
          ],
          etiquetaX: 'Año',
          multieje: true, // Indica que tiene dos ejes Y
          mostrarLeyenda: true
        }
      }
    },

    // ==================== CAPÍTULO 3 ====================
    {
      id: 'cap-3',
      numero: 3,
      titulo: 'Distribución de Vulnerabilidad',
      etiqueta: 'Distribución',
      
      // Configuración del mapa para este capítulo
      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: 'Municipios',
            tipo: 'wms',
            url: 'http://localhost:3001/geoserver/Tlaxcala/wms',
            layers: 'Tlaxcala:Municipios',
            visible: true,
            leyenda: true
          }
        ]
      },

      // Configuración del gráfico - Gráfico de torta
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

  // Configuración de la capa base (mapa base de ESRI)
  mapaBase: {
    tipo: 'esri',
    nombre: 'World Street Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
  },

  // Configuración del proxy para GeoServer
  proxy: {
    url: 'http://localhost:3001/geoserver'
  }
};

// Exportar también funciones auxiliares para validación
export function validarConfiguracion(config) {
  if (!config.capitulos || config.capitulos.length === 0) {
    throw new Error('La configuración debe tener al menos un capítulo');
  }

  config.capitulos.forEach((cap, index) => {
    if (!cap.mapa || !cap.grafico) {
      throw new Error(`El capítulo ${index + 1} debe tener configuración de mapa y gráfico`);
    }
  });

  return true;
}

export function obtenerCapituloPorNumero(numero) {
  return storyMapConfig.capitulos.find(cap => cap.numero === numero);
}

export function obtenerTotalCapitulos() {
  return storyMapConfig.capitulos.length;
}