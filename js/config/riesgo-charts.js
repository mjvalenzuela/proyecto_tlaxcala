/**
 * Gestor de gráficas para riesgo.html
 * Crea gráficas de torta y líneas para dos capítulos
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
      await this.loadCSVData();
      await this.loadCSVData2();

      this.createDonutChart();
      this.createLineChart();

      this.createDonutChart2();
      this.createLineChart2();
    } catch (error) {
      console.error('Error al inicializar gráficas:', error);
    }
  }

  /**
   * Carga CSV del Capítulo 1
   */
  async loadCSVData() {
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
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
   * Carga CSV del Capítulo 2
   */
  async loadCSVData2() {
    return new Promise((resolve, reject) => {
      Papa.parse(this.csvPath2, {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
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
   * Crea gráfica de torta del Capítulo 1
   */
  createDonutChart() {
    if (!this.data) {
      console.error('No hay datos para crear la gráfica de dona');
      return;
    }

    const declaratorias = this.data.filter(row =>
      row.Declaratoria && row.Declaratoria !== 'total_por_año'
    );

    const labels = declaratorias.map(row => row.Declaratoria);
    const valores = declaratorias.map(row => row.total_por_declaratoria || 0);

    const colors = [
      'rgba(255, 193, 7, 0.8)',
      'rgba(244, 67, 54, 0.8)',
      'rgba(76, 175, 80, 0.8)'
    ];

    const borderColors = [
      'rgba(255, 193, 7, 1)',
      'rgba(244, 67, 54, 1)',
      'rgba(76, 175, 80, 1)'
    ];

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
            display: false
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

    this.createCustomLegend(labels, valores, colors);
  }

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
   * Crea gráfica de líneas del Capítulo 1
   */
  createLineChart() {
    if (!this.data) {
      console.error('No hay datos para crear la gráfica de líneas');
      return;
    }

    const years = Object.keys(this.data[0]).filter(key =>
      key !== 'Declaratoria' && key !== 'total_por_declaratoria' && !isNaN(key)
    ).sort();

    const declaratorias = this.data.filter(row =>
      row.Declaratoria && row.Declaratoria !== 'total_por_año'
    );

    const datasets = declaratorias.map((row, index) => {
      const data = years.map(year => row[year] || 0);

      const colors = [
        { bg: 'rgba(255, 193, 7, 0.2)', border: 'rgba(255, 193, 7, 1)' },
        { bg: 'rgba(244, 67, 54, 0.2)', border: 'rgba(244, 67, 54, 1)' },
        { bg: 'rgba(76, 175, 80, 0.2)', border: 'rgba(76, 175, 80, 1)' }
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
   * Crea gráfica de torta del Capítulo 2
   */
  createDonutChart2() {
    if (!this.data2) {
      console.error('No hay datos para crear la gráfica de dona del Capítulo 2');
      return;
    }

    const clasificaciones = this.data2.filter(row =>
      row.clasificacion && row.clasificacion !== 'total_por_año'
    );

    const labels = clasificaciones.map(row => row.clasificacion);
    const valores = clasificaciones.map(row => row.total_por_clasificacion || 0);

    const colors = [
      'rgba(33, 150, 243, 0.8)',
      'rgba(255, 152, 0, 0.8)'
    ];

    const borderColors = [
      'rgba(33, 150, 243, 1)',
      'rgba(255, 152, 0, 1)'
    ];

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
            display: false
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

    this.createCustomLegend2(labels, valores, colors);
  }

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
   * Crea gráfica de líneas del Capítulo 2
   */
  createLineChart2() {
    if (!this.data2) {
      console.error('No hay datos para crear la gráfica de líneas del Capítulo 2');
      return;
    }

    const years = Object.keys(this.data2[0]).filter(key =>
      key !== 'clasificacion' && key !== 'total_por_clasificacion' && !isNaN(key)
    ).sort();

    const clasificaciones = this.data2.filter(row =>
      row.clasificacion && row.clasificacion !== 'total_por_año'
    );

    const datasets = clasificaciones.map((row, index) => {
      const data = years.map(year => row[year] || 0);

      const colors = [
        { bg: 'rgba(33, 150, 243, 0.2)', border: 'rgba(33, 150, 243, 1)' },
        { bg: 'rgba(255, 152, 0, 0.2)', border: 'rgba(255, 152, 0, 1)' }
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

document.addEventListener('DOMContentLoaded', () => {
  const charts = new RiesgoCharts();
  charts.init();

  window.RiesgoCharts = charts;
});
