/**
 * ChartManager - Gestor de gráficos con Chart.js
 * Maneja la creación, actualización y destrucción de gráficos interactivos
 */

export class ChartManager {
  constructor() {
    this.graficos = {}; // Almacena las instancias de Chart.js
    this.datos = {}; // Cache de datos CSV cargados
  }

  /**
   * Carga un archivo CSV usando Papa Parse
   */
  async cargarCSV(ruta) {
    // Si ya está en cache, retornarlo
    if (this.datos[ruta]) {
      return this.datos[ruta];
    }

    return new Promise((resolve, reject) => {
      Papa.parse(ruta, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Limpiar headers (remover espacios)
          const datosLimpios = results.data.map(row => {
            const nuevaFila = {};
            for (const [key, value] of Object.entries(row)) {
              nuevaFila[key.trim()] = value;
            }
            return nuevaFila;
          });

          this.datos[ruta] = datosLimpios;
          resolve(datosLimpios);
        },
        error: (error) => {
          console.error(`Error al cargar CSV ${ruta}:`, error);
          reject(error);
        }
      });
    });
  }

  /**
   * Crea un gráfico según la configuración
   */
  async crearGrafico(canvasId, graficoConfig, numeroCapitulo) {
    try {
      // Cargar datos del CSV
      const datos = await this.cargarCSV(graficoConfig.datos);

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

      return grafico;
    } catch (error) {
      console.error('Error al crear gráfico:', error);
      throw error;
    }
  }

  /**
   * Crea un gráfico de barras
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
          label: config.etiquetaY,
          data: values,
          backgroundColor: config.color,
          borderColor: config.colorBorde,
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
            display: config.mostrarLeyenda,
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
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return `${config.etiquetaY}: ${context.parsed.y.toFixed(1)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45,
              minRotation: 45
            },
            title: {
              display: true,
              text: config.etiquetaX,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              }
            },
            title: {
              display: true,
              text: config.etiquetaY,
              font: {
                size: 12,
                weight: 'bold'
              }
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
   * Crea un gráfico de líneas (puede ser multieje)
   */
  crearGraficoLineas(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = datos.map(row => row[config.ejeX]);
    
    // Crear datasets según configuración
    const datasets = config.datasets.map(datasetConfig => ({
      label: datasetConfig.label,
      data: datos.map(row => row[datasetConfig.dato]),
      backgroundColor: datasetConfig.color,
      borderColor: datasetConfig.colorBorde,
      borderWidth: 3,
      tension: 0.4, // Curva suave
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: datasetConfig.colorBorde,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      yAxisID: datasetConfig.yAxisID
    }));

    // Configurar escalas
    const scales = {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: config.etiquetaX,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    };

    // Si es multieje, configurar ambos ejes Y
    if (config.multieje) {
      scales.y = {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(239, 68, 68, 0.1)'
        },
        ticks: {
          color: 'rgba(239, 68, 68, 1)',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: config.datasets[0].label,
          color: 'rgba(239, 68, 68, 1)',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      };

      scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'rgba(59, 130, 246, 1)',
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: config.datasets[1].label,
          color: 'rgba(59, 130, 246, 1)',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      };
    } else {
      scales.y = {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      };
    }

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
            display: config.mostrarLeyenda,
            position: 'top',
            labels: {
              font: {
                size: 12,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: scales,
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  /**
   * Crea un gráfico de torta
   */
  crearGraficoTorta(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = datos.map(row => row[config.etiqueta]);
    const values = datos.map(row => row[config.valor]);

    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: config.colores,
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda,
            position: 'bottom',
            labels: {
              font: {
                size: 12,
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    return {
                      text: `${label}: ${value}%`,
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
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Actualiza los datos de un gráfico existente
   */
  async actualizarGrafico(graficoId, nuevaRutaCSV, config) {
    const grafico = this.graficos[graficoId];
    if (!grafico) return;

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
    } catch (error) {
      console.error('Error al actualizar gráfico:', error);
    }
  }

  /**
   * Destruye un gráfico específico
   */
  destruirGrafico(graficoId) {
    const grafico = this.graficos[graficoId];
    if (grafico) {
      grafico.destroy();
      delete this.graficos[graficoId];
    }
  }

  /**
   * Destruye todos los gráficos
   */
  destruirTodos() {
    Object.keys(this.graficos).forEach(id => {
      this.destruirGrafico(id);
    });
  }

  /**
   * Obtiene un gráfico por su ID
   */
  obtenerGrafico(graficoId) {
    return this.graficos[graficoId];
  }

  /**
   * Limpia el cache de datos CSV
   */
  limpiarCache() {
    this.datos = {};
  }
}