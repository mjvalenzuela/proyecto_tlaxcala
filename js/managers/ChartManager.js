export class ChartManager {
  constructor() {
    this.graficos = {}; // Almacena las instancias de Chart.js
    this.datos = {}; // Cache de datos CSV cargados
  }

  /**
   * ==========================================
   * CARGA UN ARCHIVO CSV CON FETCH + PAPA PARSE
   * ==========================================
   * Método mejorado que primero descarga el archivo con fetch,
   * y luego lo parsea con Papa Parse
   */
  async cargarCSV(ruta) {
    // Si ya está en cache, retornarlo
    if (this.datos[ruta]) {
      // console.log(`📦 CSV en cache: ${ruta}`);
      return this.datos[ruta];
    }

    // console.log(`📥 Cargando CSV: ${ruta}`);

    try {
      // ==========================================
      // 1. DESCARGAR EL ARCHIVO CON FETCH
      // ==========================================
      const response = await fetch(ruta);
      
      // Verificar que la petición fue exitosa
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText} al cargar ${ruta}`);
      }

      // Obtener el texto del CSV
      const csvText = await response.text();
      
      // Validar que no está vacío
      if (!csvText || csvText.trim().length === 0) {
        throw new Error(`El archivo CSV está vacío: ${ruta}`);
      }

      // console.log(`✅ CSV descargado: ${csvText.length} caracteres`);

      // ==========================================
      // 2. PARSEAR EL CSV CON PAPA PARSE
      // ==========================================
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimiter: '',  // Auto-detectar delimitador
          newline: '',    // Auto-detectar saltos de línea
          complete: (results) => {
            // Validar que hay datos
            if (!results.data || results.data.length === 0) {
              reject(new Error(`No se encontraron datos en: ${ruta}`));
              return;
            }

            // Validar que hay campos (headers)
            if (!results.meta || !results.meta.fields || results.meta.fields.length === 0) {
              reject(new Error(`No se encontraron headers en: ${ruta}`));
              return;
            }

            // ==========================================
            // 3. LIMPIAR HEADERS (remover espacios)
            // ==========================================
            const datosLimpios = results.data.map(row => {
              const nuevaFila = {};
              for (const [key, value] of Object.entries(row)) {
                // Limpiar espacios del nombre de la columna
                const keyLimpio = key.trim();
                nuevaFila[keyLimpio] = value;
              }
              return nuevaFila;
            });

            // Filtrar filas completamente vacías
            const datosFiltrados = datosLimpios.filter(row => {
              return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
            });

            // console.log(`✅ CSV parseado: ${datosFiltrados.length} filas, ${results.meta.fields.length} columnas`);
            // console.log(`   Columnas: ${results.meta.fields.join(', ')}`);

            // Guardar en cache
            this.datos[ruta] = datosFiltrados;
            resolve(datosFiltrados);
          },
          error: (error) => {
            console.error(`❌ Error al parsear CSV ${ruta}:`, error);
            reject(new Error(`Error al parsear CSV: ${error.message}`));
          }
        });
      });

    } catch (error) {
      console.error(`❌ Error al cargar CSV ${ruta}:`, error);
      
      // Mensajes de error más descriptivos
      if (error.message.includes('Failed to fetch')) {
        throw new Error(`No se pudo cargar el archivo: ${ruta}. Verifica que el archivo existe y la ruta es correcta.`);
      }
      
      throw error;
    }
  }

  /**
   * ==========================================
   * CREA UN GRÁFICO SEGÚN LA CONFIGURACIÓN
   * ==========================================
   */
  async crearGrafico(canvasId, graficoConfig, numeroCapitulo) {
    try {
      // console.log(`📊 Creando gráfico ${graficoConfig.tipo} para capítulo ${numeroCapitulo}`);

      // Validar que el canvas existe
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error(`No se encontró el canvas con id: ${canvasId}`);
      }

      // Cargar datos del CSV
      const datos = await this.cargarCSV(graficoConfig.datos);

      // Validar configuración según tipo de gráfico
      this.validarConfiguracion(graficoConfig, datos);

      // Crear gráfico según tipo
      let grafico;
      switch (graficoConfig.tipo) {
        case 'bar':
          grafico = this.crearGraficoBarras(canvasId, datos, graficoConfig.config);
          break;
        case 'line':
          grafico = this.crearGraficoLineas(canvasId, datos, graficoConfig.config);
          break;
        case 'pie':
          grafico = this.crearGraficoTorta(canvasId, datos, graficoConfig.config);
          break;
        default:
          throw new Error(`Tipo de gráfico no soportado: ${graficoConfig.tipo}`);
      }

      // Almacenar referencia
      const graficoId = `cap-${numeroCapitulo}`;
      this.graficos[graficoId] = grafico;

      // console.log(`✅ Gráfico creado exitosamente: ${graficoId}`);
      return grafico;

    } catch (error) {
      console.error(`❌ Error al crear gráfico:`, error);
      
      // Mostrar error en el canvas
      this.mostrarErrorEnCanvas(canvasId, error.message);
      throw error;
    }
  }

  /**
   * ==========================================
   * VALIDA LA CONFIGURACIÓN DEL GRÁFICO
   * ==========================================
   */
  validarConfiguracion(graficoConfig, datos) {
    const config = graficoConfig.config;
    const primeraFila = datos[0];

    if (graficoConfig.tipo === 'bar') {
      if (!primeraFila.hasOwnProperty(config.ejeX)) {
        throw new Error(`Columna '${config.ejeX}' no encontrada en CSV. Columnas disponibles: ${Object.keys(primeraFila).join(', ')}`);
      }
      if (!primeraFila.hasOwnProperty(config.ejeY)) {
        throw new Error(`Columna '${config.ejeY}' no encontrada en CSV. Columnas disponibles: ${Object.keys(primeraFila).join(', ')}`);
      }
    }

    if (graficoConfig.tipo === 'line') {
      if (!primeraFila.hasOwnProperty(config.ejeX)) {
        throw new Error(`Columna '${config.ejeX}' no encontrada en CSV`);
      }
      config.datasets.forEach(dataset => {
        if (!primeraFila.hasOwnProperty(dataset.dato)) {
          throw new Error(`Columna '${dataset.dato}' no encontrada en CSV`);
        }
      });
    }

    if (graficoConfig.tipo === 'pie') {
      if (!primeraFila.hasOwnProperty(config.etiqueta)) {
        throw new Error(`Columna '${config.etiqueta}' no encontrada en CSV`);
      }
      if (!primeraFila.hasOwnProperty(config.valor)) {
        throw new Error(`Columna '${config.valor}' no encontrada en CSV`);
      }
    }
  }

  /**
   * ==========================================
   * MUESTRA ERROR EN EL CANVAS
   * ==========================================
   */
  mostrarErrorEnCanvas(canvasId, mensaje) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Configurar estilo
    ctx.fillStyle = '#fee';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#c00';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dividir mensaje en líneas
    const palabras = mensaje.split(' ');
    const lineas = [];
    let lineaActual = '';

    palabras.forEach(palabra => {
      const prueba = lineaActual + palabra + ' ';
      if (ctx.measureText(prueba).width < width - 40) {
        lineaActual = prueba;
      } else {
        lineas.push(lineaActual);
        lineaActual = palabra + ' ';
      }
    });
    lineas.push(lineaActual);

    // Dibujar líneas
    const lineHeight = 20;
    const startY = (height - (lineas.length * lineHeight)) / 2;
    
    lineas.forEach((linea, i) => {
      ctx.fillText(linea, width / 2, startY + (i * lineHeight));
    });
  }

  /**
   * ==========================================
   * CREA UN GRÁFICO DE BARRAS
   * ==========================================
   */
  crearGraficoBarras(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = datos.map(row => row[config.ejeX]);
    const values = datos.map(row => row[config.ejeY]);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: config.etiquetaY || config.ejeY,
          data: values,
          backgroundColor: config.color || 'rgba(54, 162, 235, 0.8)',
          borderColor: config.colorBorde || 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: 'top',
            labels: {
              font: {
                size: 12,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              padding: 15
            }
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              label: function(context) {
                const label = config.etiquetaY || config.ejeY;
                return `${label}: ${context.parsed.y.toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: { size: 11 },
              padding: 10
            }
          }
        }
      }
    });
  }

  /**
   * ==========================================
   * CREA UN GRÁFICO DE LÍNEAS
   * ==========================================
   */
  crearGraficoLineas(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = datos.map(row => row[config.ejeX]);
    
    const datasets = config.datasets.map(datasetConfig => ({
      label: datasetConfig.label,
      data: datos.map(row => row[datasetConfig.dato]),
      backgroundColor: datasetConfig.color || 'rgba(75, 192, 192, 0.2)',
      borderColor: datasetConfig.borderColor || datasetConfig.color || 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: config.mostrarPuntos ? 4 : 0,
      pointHoverRadius: 6,
      fill: true
    }));

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: 'top',
            labels: {
              font: { size: 12 },
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: { size: 11 },
              padding: 10
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /**
   * ==========================================
   * CREA UN GRÁFICO DE TORTA
   * ==========================================
   */
  crearGraficoTorta(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = datos.map(row => row[config.etiqueta]);
    const values = datos.map(row => row[config.valor]);

    // Desregistrar el plugin datalabels globalmente si existe
    if (window.ChartDataLabels) {
      Chart.unregister(ChartDataLabels);
    }

    const chartConfig = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: config.colores || [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 15,
          // Configurar datalabels a nivel de dataset
          datalabels: config.mostrarValoresEnTorta ? {
            color: '#ffffff',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: (value, context) => {
              // Formatear el valor con separador de miles
              return value.toLocaleString('es-MX');
            }
          } : {
            display: false
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: 'bottom',
            labels: {
              font: { size: 10 },
              padding: 8,
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    // Solo mostrar la categoría, sin valores
                    return {
                      text: label,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              // Eliminar el título del tooltip
              title: function() {
                return '';
              },
              // Mostrar el valor de población formateado (el color ya se muestra automáticamente)
              label: function(context) {
                const value = context.parsed || 0;
                const valorFormateado = value.toLocaleString('es-MX');
                return valorFormateado;
              }
            }
          }
        }
      }
    };

    // Si se debe mostrar valores en la torta, registrar el plugin solo para este gráfico
    if (config.mostrarValoresEnTorta && window.ChartDataLabels) {
      chartConfig.plugins = [ChartDataLabels];
    }

    return new Chart(ctx, chartConfig);
  }

  /**
   * ==========================================
   * ACTUALIZA LOS DATOS DE UN GRÁFICO
   * ==========================================
   */
  async actualizarGrafico(graficoId, nuevaRutaCSV, config) {
    const grafico = this.graficos[graficoId];
    if (!grafico) {
      // console.warn(`⚠️ Gráfico ${graficoId} no encontrado`);
      return;
    }

    try {
      const datos = await this.cargarCSV(nuevaRutaCSV);
      
      // Actualizar según el tipo
      if (grafico.config.type === 'bar') {
        grafico.data.labels = datos.map(row => row[config.ejeX]);
        grafico.data.datasets[0].data = datos.map(row => row[config.ejeY]);
      } else if (grafico.config.type === 'line') {
        grafico.data.labels = datos.map(row => row[config.ejeX]);
        config.datasets.forEach((datasetConfig, index) => {
          grafico.data.datasets[index].data = datos.map(row => row[datasetConfig.dato]);
        });
      } else if (grafico.config.type === 'pie') {
        grafico.data.labels = datos.map(row => row[config.etiqueta]);
        grafico.data.datasets[0].data = datos.map(row => row[config.valor]);
      }

      grafico.update();
      // console.log(`✅ Gráfico ${graficoId} actualizado`);
    } catch (error) {
      console.error(`❌ Error al actualizar gráfico ${graficoId}:`, error);
    }
  }

  /**
   * ==========================================
   * DESTRUYE UN GRÁFICO ESPECÍFICO
   * ==========================================
   */
  destruirGrafico(graficoId) {
    const grafico = this.graficos[graficoId];
    if (grafico) {
      grafico.destroy();
      delete this.graficos[graficoId];
      // console.log(`🗑️ Gráfico ${graficoId} destruido`);
    }
  }

  /**
   * ==========================================
   * DESTRUYE TODOS LOS GRÁFICOS
   * ==========================================
   */
  destruirTodos() {
    Object.keys(this.graficos).forEach(id => {
      this.destruirGrafico(id);
    });
    // console.log('🗑️ Todos los gráficos destruidos');
  }

  /**
   * ==========================================
   * OBTIENE UN GRÁFICO POR SU ID
   * ==========================================
   */
  obtenerGrafico(graficoId) {
    return this.graficos[graficoId];
  }

  /**
   * ==========================================
   * LIMPIA EL CACHE DE DATOS CSV
   * ==========================================
   */
  limpiarCache() {
    this.datos = {};
    // console.log('🧹 Cache de CSVs limpiado');
  }
}