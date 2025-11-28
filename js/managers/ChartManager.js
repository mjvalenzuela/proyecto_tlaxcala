/**
 * Gestor de gráficas con Chart.js
 * Crea y gestiona gráficas de barras, líneas y tortas desde archivos CSV
 */
export class ChartManager {
  constructor() {
    this.graficos = {};
    this.datos = {};
  }

  /**
   * Carga y parsea un archivo CSV
   * @param {string} ruta - Ruta al archivo CSV
   * @returns {Promise<Array>} Datos parseados del CSV
   */
  async cargarCSV(ruta) {
    if (this.datos[ruta]) {
      return this.datos[ruta];
    }

    try {
      const response = await fetch(ruta);

      if (!response.ok) {
        throw new Error(
          `Error HTTP ${response.status}: ${response.statusText} al cargar ${ruta}`
        );
      }

      const csvText = await response.text();

      if (!csvText || csvText.trim().length === 0) {
        throw new Error(`El archivo CSV está vacío: ${ruta}`);
      }

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          delimiter: "",
          newline: "",
          complete: (results) => {
            if (!results.data || results.data.length === 0) {
              reject(new Error(`No se encontraron datos en: ${ruta}`));
              return;
            }

            if (
              !results.meta ||
              !results.meta.fields ||
              results.meta.fields.length === 0
            ) {
              reject(new Error(`No se encontraron headers en: ${ruta}`));
              return;
            }

            const datosLimpios = results.data.map((row) => {
              const nuevaFila = {};
              for (const [key, value] of Object.entries(row)) {
                const keyLimpio = key.trim();
                nuevaFila[keyLimpio] = value;
              }
              return nuevaFila;
            });

            const datosFiltrados = datosLimpios.filter((row) => {
              return Object.values(row).some(
                (val) => val !== null && val !== undefined && val !== ""
              );
            });

            this.datos[ruta] = datosFiltrados;
            resolve(datosFiltrados);
          },
          error: (error) => {
            console.error(`Error al parsear CSV ${ruta}:`, error);
            reject(new Error(`Error al parsear CSV: ${error.message}`));
          },
        });
      });
    } catch (error) {
      console.error(`Error al cargar CSV ${ruta}:`, error);

      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          `No se pudo cargar el archivo: ${ruta}. Verifica que el archivo existe y la ruta es correcta.`
        );
      }

      throw error;
    }
  }

  /**
   * Crea un gráfico según la configuración
   * @param {string} canvasId - ID del elemento canvas
   * @param {Object} graficoConfig - Configuración del gráfico
   * @param {number} numeroCapitulo - Número del capítulo
   * @param {Function} onClickCallback - Callback opcional para clicks
   * @returns {Promise<Chart>} Instancia del gráfico Chart.js
   */
  async crearGrafico(
    canvasId,
    graficoConfig,
    numeroCapitulo,
    onClickCallback = null
  ) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error(`No se encontró el canvas con id: ${canvasId}`);
      }

      const datos = await this.cargarCSV(graficoConfig.datos);

      this.validarConfiguracion(graficoConfig, datos);

      let grafico;
      switch (graficoConfig.tipo) {
        case "bar":
          grafico = this.crearGraficoBarras(
            canvasId,
            datos,
            graficoConfig.config
          );
          break;
        case "line":
          grafico = this.crearGraficoLineas(
            canvasId,
            datos,
            graficoConfig.config
          );
          break;
        case "pie":
          grafico = this.crearGraficoTorta(
            canvasId,
            datos,
            graficoConfig.config,
            onClickCallback
          );
          break;
        default:
          throw new Error(
            `Tipo de gráfico no soportado: ${graficoConfig.tipo}`
          );
      }

      const graficoId = `cap-${numeroCapitulo}`;
      this.graficos[graficoId] = grafico;

      return grafico;
    } catch (error) {
      console.error(`Error al crear gráfico:`, error);

      this.mostrarErrorEnCanvas(canvasId, error.message);
      throw error;
    }
  }

  validarConfiguracion(graficoConfig, datos) {
    const config = graficoConfig.config;
    const primeraFila = datos[0];

    if (graficoConfig.tipo === "bar") {
      if (!primeraFila.hasOwnProperty(config.ejeX)) {
        throw new Error(
          `Columna '${
            config.ejeX
          }' no encontrada en CSV. Columnas disponibles: ${Object.keys(
            primeraFila
          ).join(", ")}`
        );
      }
      if (!primeraFila.hasOwnProperty(config.ejeY)) {
        throw new Error(
          `Columna '${
            config.ejeY
          }' no encontrada en CSV. Columnas disponibles: ${Object.keys(
            primeraFila
          ).join(", ")}`
        );
      }
    }

    if (graficoConfig.tipo === "line") {
      if (!primeraFila.hasOwnProperty(config.ejeX)) {
        throw new Error(`Columna '${config.ejeX}' no encontrada en CSV`);
      }
      config.datasets.forEach((dataset) => {
        if (!primeraFila.hasOwnProperty(dataset.dato)) {
          throw new Error(`Columna '${dataset.dato}' no encontrada en CSV`);
        }
      });
    }

    if (graficoConfig.tipo === "pie") {
      if (!primeraFila.hasOwnProperty(config.etiqueta)) {
        throw new Error(`Columna '${config.etiqueta}' no encontrada en CSV`);
      }
      if (!primeraFila.hasOwnProperty(config.valor)) {
        throw new Error(`Columna '${config.valor}' no encontrada en CSV`);
      }
    }
  }

  mostrarErrorEnCanvas(canvasId, mensaje) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#fee";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#c00";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const palabras = mensaje.split(" ");
    const lineas = [];
    let lineaActual = "";

    palabras.forEach((palabra) => {
      const prueba = lineaActual + palabra + " ";
      if (ctx.measureText(prueba).width < width - 40) {
        lineaActual = prueba;
      } else {
        lineas.push(lineaActual);
        lineaActual = palabra + " ";
      }
    });
    lineas.push(lineaActual);

    const lineHeight = 20;
    const startY = (height - lineas.length * lineHeight) / 2;

    lineas.forEach((linea, i) => {
      ctx.fillText(linea, width / 2, startY + i * lineHeight);
    });
  }

  /**
   * Crea un gráfico de barras
   * @param {string} canvasId - ID del canvas
   * @param {Array} datos - Datos del CSV
   * @param {Object} config - Configuración del gráfico
   * @returns {Chart} Instancia del gráfico
   */
  crearGraficoBarras(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = datos.map((row) => row[config.ejeX]);
    const values = datos.map((row) => row[config.ejeY]);

    return new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: config.etiquetaY || config.ejeY,
            data: values,
            backgroundColor: config.color || "rgba(54, 162, 235, 0.8)",
            borderColor: config.colorBorde || "rgba(54, 162, 235, 1)",
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: "top",
            labels: {
              font: {
                size: 12,
                family:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              },
              padding: 15,
            },
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              label: function (context) {
                const label = config.etiquetaY || config.ejeY;
                return `${label}: ${context.parsed.y.toFixed(1)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
            },
            ticks: {
              font: { size: 11 },
              padding: 10,
            },
          },
        },
      },
    });
  }

  /**
   * Crea un gráfico de líneas
   * @param {string} canvasId - ID del canvas
   * @param {Array} datos - Datos del CSV
   * @param {Object} config - Configuración del gráfico
   * @returns {Chart} Instancia del gráfico
   */
  crearGraficoLineas(canvasId, datos, config) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = datos.map((row) => row[config.ejeX]);

    const datasets = config.datasets.map((datasetConfig) => ({
      label: datasetConfig.label,
      data: datos.map((row) => row[datasetConfig.dato]),
      backgroundColor: datasetConfig.color || "rgba(75, 192, 192, 0.2)",
      borderColor:
        datasetConfig.borderColor ||
        datasetConfig.color ||
        "rgba(75, 192, 192, 1)",
      borderWidth: 2,
      tension: 0.4,
      pointRadius: config.mostrarPuntos ? 4 : 0,
      pointHoverRadius: 6,
      fill: true,
    }));

    return new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: "top",
            labels: {
              font: { size: 12 },
              padding: 15,
              usePointStyle: true,
            },
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
              drawBorder: false,
            },
            ticks: {
              font: { size: 11 },
              padding: 10,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  /**
   * Crea un gráfico de torta
   * @param {string} canvasId - ID del canvas
   * @param {Array} datos - Datos del CSV
   * @param {Object} config - Configuración del gráfico
   * @param {Function} onClickCallback - Callback para clicks
   * @returns {Chart} Instancia del gráfico
   */
  crearGraficoTorta(canvasId, datos, config, onClickCallback = null) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    const labels = datos.map((row) => row[config.etiqueta]);
    const values = datos.map((row) => row[config.valor]);

    if (window.ChartDataLabels) {
      Chart.unregister(ChartDataLabels);
    }

    const chartConfig = {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: config.colores || [
              "rgba(255, 99, 132, 0.8)",
              "rgba(54, 162, 235, 0.8)",
              "rgba(255, 206, 86, 0.8)",
              "rgba(75, 192, 192, 0.8)",
            ],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 15,
            datalabels: config.mostrarValoresEnTorta
              ? {
                  color: "#ffffff",
                  font: {
                    weight: "bold",
                    size: 14,
                  },
                  formatter: (value, context) => {
                    return value.toLocaleString("es-MX");
                  },
                }
              : {
                  display: false,
                },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: onClickCallback
          ? (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                const categoria = labels[index];
                onClickCallback(categoria);
              }
            }
          : undefined,
        plugins: {
          legend: {
            display: config.mostrarLeyenda !== false,
            position: "bottom",
            labels: {
              font: { size: 10 },
              padding: 8,
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
              pointStyle: "circle",
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    return {
                      text: label,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
              onClick: onClickCallback
                ? (event, legendItem, legend) => {
                    const categoria = legendItem.text;
                    onClickCallback(categoria);
                  }
                : undefined,
            },
          },
          title: {
            display: !!config.titulo,
            text: config.titulo,
            font: { size: 16 },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            callbacks: {
              title: function () {
                return "";
              },
              label: function (context) {
                const value = context.parsed || 0;
                const valorFormateado = value.toLocaleString("es-MX");
                return valorFormateado;
              },
            },
          },
        },
      },
    };

    if (config.mostrarValoresEnTorta && window.ChartDataLabels) {
      chartConfig.plugins = [ChartDataLabels];
    }

    return new Chart(ctx, chartConfig);
  }

  /**
   * Actualiza los datos de un gráfico existente
   * @param {string} graficoId - ID del gráfico
   * @param {string} nuevaRutaCSV - Nueva ruta del CSV
   * @param {Object} config - Configuración
   */
  async actualizarGrafico(graficoId, nuevaRutaCSV, config) {
    const grafico = this.graficos[graficoId];
    if (!grafico) {
      return;
    }

    try {
      const datos = await this.cargarCSV(nuevaRutaCSV);

      if (grafico.config.type === "bar") {
        grafico.data.labels = datos.map((row) => row[config.ejeX]);
        grafico.data.datasets[0].data = datos.map((row) => row[config.ejeY]);
      } else if (grafico.config.type === "line") {
        grafico.data.labels = datos.map((row) => row[config.ejeX]);
        config.datasets.forEach((datasetConfig, index) => {
          grafico.data.datasets[index].data = datos.map(
            (row) => row[datasetConfig.dato]
          );
        });
      } else if (grafico.config.type === "pie") {
        grafico.data.labels = datos.map((row) => row[config.etiqueta]);
        grafico.data.datasets[0].data = datos.map((row) => row[config.valor]);
      }

      grafico.update();
    } catch (error) {
      console.error(`Error al actualizar gráfico ${graficoId}:`, error);
    }
  }

  destruirGrafico(graficoId) {
    const grafico = this.graficos[graficoId];
    if (grafico) {
      grafico.destroy();
      delete this.graficos[graficoId];
    }
  }

  destruirTodos() {
    Object.keys(this.graficos).forEach((id) => {
      this.destruirGrafico(id);
    });
  }

  obtenerGrafico(graficoId) {
    return this.graficos[graficoId];
  }

  limpiarCache() {
    this.datos = {};
  }
}
