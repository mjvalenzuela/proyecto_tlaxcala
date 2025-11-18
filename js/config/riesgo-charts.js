/**
 * Configuración y creación de gráficas para riesgo.html
 * - Capítulo 1: Card 3 (torta declaratorias) y Card 4 (líneas declaratorias)
 * - Capítulo 2: Card 3 (torta clasificaciones) y Card 4 (líneas clasificaciones)
 */

class RiesgoCharts {
  constructor() {
    this.csvPath = 'data/declaratorias1.csv';
    this.csvPath2 = 'data/declaratorias2.csv';
    this.donutChart = null;
    this.lineChart = null;
    this.donutChart2 = null;
    this.lineChart2 = null;
    this.data = null;
    this.data2 = null;
  }

  /**
   * Inicializa todas las gráficas
   */
  async init() {
    try {
      // Cargar datos de ambos CSVs
      await this.loadCSVData();
      await this.loadCSVData2();

      // Crear gráficas del Capítulo 1
      this.createDonutChart();
      this.createLineChart();

      // Crear gráficas del Capítulo 2
      this.createDonutChart2();
      this.createLineChart2();
    } catch (error) {
      console.error('Error al inicializar gráficas:', error);
    }
  }

  /**
   * Carga y parsea el CSV del Capítulo 1 usando Papa Parse
   */
  async loadCSVData() {
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV Capítulo 1 cargado:', results.data);
          this.data = results.data;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar CSV Capítulo 1:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Carga y parsea el CSV del Capítulo 2 usando Papa Parse
   */
  async loadCSVData2() {
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath2, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('CSV Capítulo 2 cargado:', results.data);
          this.data2 = results.data;
          resolve();
        },
        error: (error) => {
          console.error('Error al cargar CSV Capítulo 2:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Crea la gráfica de torta (Card 3) con total_por_declaratoria
   */
  createDonutChart() {
    if (!this.data) {
      console.error('No hay datos para crear la gráfica de dona');
      return;
    }

    // Filtrar solo las filas con datos de declaratorias (excluir "total_por_año")
    const declaratorias = this.data.filter(row =>
      row.Declaratoria && row.Declaratoria !== 'total_por_año'
    );

    // Extraer labels y valores
    const labels = declaratorias.map(row => row.Declaratoria);
    const valores = declaratorias.map(row => row.total_por_declaratoria || 0);

    // Colores para las categorías
    const colors = [
      'rgba(255, 193, 7, 0.8)',    // Amarillo para Contingencia Climatológica
      'rgba(244, 67, 54, 0.8)',    // Rojo para Desastre
      'rgba(76, 175, 80, 0.8)'     // Verde para Emergencia
    ];

    const borderColors = [
      'rgba(255, 193, 7, 1)',
      'rgba(244, 67, 54, 1)',
      'rgba(76, 175, 80, 1)'
    ];

    // Crear la gráfica
    const ctx = document.getElementById('donutChart').getContext('2d');
    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
          }
        },
        plugins: {
          legend: {
            display: false // Ocultamos la leyenda default de Chart.js
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Crear leyenda personalizada
    this.createCustomLegend(labels, valores, colors);
  }

  /**
   * Crea una leyenda personalizada para la gráfica de dona
   */
  createCustomLegend(labels, valores, colors) {
    const legendContainer = document.getElementById('donutLegend');
    legendContainer.innerHTML = '';

    const total = valores.reduce((a, b) => a + b, 0);

    labels.forEach((label, index) => {
      const value = valores[index];
      const percentage = ((value / total) * 100).toFixed(1);

      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';

      legendItem.innerHTML = `
        <div class="legend-color" style="background-color: ${colors[index]}"></div>
        <div class="legend-label">${label}</div>
        <div class="legend-value">${value} (${percentage}%)</div>
      `;

      legendContainer.appendChild(legendItem);
    });
  }

  /**
   * Crea la gráfica de líneas (Card 4) con declaratorias por año
   */
  createLineChart() {
    if (!this.data) {
      console.error('No hay datos para crear la gráfica de líneas');
      return;
    }

    // Obtener años (columnas excepto 'Declaratoria' y 'total_por_declaratoria')
    const years = Object.keys(this.data[0]).filter(key =>
      key !== 'Declaratoria' && key !== 'total_por_declaratoria' && !isNaN(key)
    ).sort();

    // Filtrar solo las filas con datos de declaratorias (excluir "total_por_año")
    const declaratorias = this.data.filter(row =>
      row.Declaratoria && row.Declaratoria !== 'total_por_año'
    );

    // Crear datasets para cada tipo de declaratoria
    const datasets = declaratorias.map((row, index) => {
      const data = years.map(year => row[year] || 0);

      const colors = [
        { bg: 'rgba(255, 193, 7, 0.2)', border: 'rgba(255, 193, 7, 1)' },  // Amarillo
        { bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 1)' },  // Rojo
        { bg: 'rgba(76, 175, 80, 0.2)', border: 'rgba(76, 175, 80, 1)' }   // Verde
      ];

      return {
        label: row.Declaratoria,
        data: data,
        backgroundColor: colors[index].bg,
        borderColor: colors[index].border,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    // Crear la gráfica
    const ctx = document.getElementById('linesChart').getContext('2d');
    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 3,
        layout: {
          padding: {
            left: 10,
            right: 20,
            top: 5,
            bottom: 5
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 15,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Año',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0,
              font: {
                size: 10
              },
              padding: 5
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Declaratorias',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              stepSize: 10,
              padding: 5
            }
          }
        }
      }
    });
  }

  /**
   * Crea la gráfica de torta del Capítulo 2 (Card 3) con total_por_clasificacion
   */
  createDonutChart2() {
    if (!this.data2) {
      console.error('No hay datos para crear la gráfica de dona del Capítulo 2');
      return;
    }

    // Filtrar las clasificaciones (Geológico y Hidrometeorológico)
    const clasificaciones = this.data2.filter(row =>
      row.clasificacion && row.clasificacion !== 'total_por_año'
    );

    // Extraer labels y valores
    const labels = clasificaciones.map(row => row.clasificacion);
    const valores = clasificaciones.map(row => row.total_por_clasificacion || 0);

    // Colores para las clasificaciones
    const colors = [
      'rgba(33, 150, 243, 0.8)',    // Azul para Geológico
      'rgba(255, 152, 0, 0.8)'      // Naranja para Hidrometeorológico
    ];

    const borderColors = [
      'rgba(33, 150, 243, 1)',
      'rgba(255, 152, 0, 1)'
    ];

    // Crear la gráfica
    const ctx = document.getElementById('donutChart2').getContext('2d');
    this.donutChart2 = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5
          }
        },
        plugins: {
          legend: {
            display: false // Ocultamos la leyenda default de Chart.js
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Crear leyenda personalizada
    this.createCustomLegend2(labels, valores, colors);
  }

  /**
   * Crea una leyenda personalizada para la gráfica de dona del Capítulo 2
   */
  createCustomLegend2(labels, valores, colors) {
    const legendContainer = document.getElementById('donutLegend2');
    legendContainer.innerHTML = '';

    const total = valores.reduce((a, b) => a + b, 0);

    labels.forEach((label, index) => {
      const value = valores[index];
      const percentage = ((value / total) * 100).toFixed(1);

      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';

      legendItem.innerHTML = `
        <div class="legend-color" style="background-color: ${colors[index]}"></div>
        <div class="legend-label">${label}</div>
        <div class="legend-value">${value} (${percentage}%)</div>
      `;

      legendContainer.appendChild(legendItem);
    });
  }

  /**
   * Crea la gráfica de líneas del Capítulo 2 (Card 4) con clasificaciones por año
   */
  createLineChart2() {
    if (!this.data2) {
      console.error('No hay datos para crear la gráfica de líneas del Capítulo 2');
      return;
    }

    // Obtener años (columnas excepto 'clasificacion' y 'total_por_clasificacion')
    const years = Object.keys(this.data2[0]).filter(key =>
      key !== 'clasificacion' && key !== 'total_por_clasificacion' && !isNaN(key)
    ).sort();

    // Filtrar las clasificaciones
    const clasificaciones = this.data2.filter(row =>
      row.clasificacion && row.clasificacion !== 'total_por_año'
    );

    // Crear datasets para cada clasificación
    const datasets = clasificaciones.map((row, index) => {
      const data = years.map(year => row[year] || 0);

      const colors = [
        { bg: 'rgba(33, 150, 243, 0.2)', border: 'rgba(33, 150, 243, 1)' },  // Azul
        { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 1)' }     // Naranja
      ];

      return {
        label: row.clasificacion,
        data: data,
        backgroundColor: colors[index].bg,
        borderColor: colors[index].border,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    // Crear la gráfica
    const ctx = document.getElementById('linesChart2').getContext('2d');
    this.lineChart2 = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 3,
        layout: {
          padding: {
            left: 10,
            right: 20,
            top: 5,
            bottom: 5
          }
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 15,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Año',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 0,
              font: {
                size: 10
              },
              padding: 5
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Eventos',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              stepSize: 10,
              padding: 5
            }
          }
        }
      }
    });
  }

  /**
   * Destruye las gráficas (útil para cleanup)
   */
  destroy() {
    if (this.donutChart) {
      this.donutChart.destroy();
    }
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.donutChart2) {
      this.donutChart2.destroy();
    }
    if (this.lineChart2) {
      this.lineChart2.destroy();
    }
  }
}

// Inicializar gráficas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const charts = new RiesgoCharts();
  charts.init();

  // Hacer disponible globalmente para debugging
  window.RiesgoCharts = charts;
});
