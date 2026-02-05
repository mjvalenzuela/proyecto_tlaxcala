/**
 * Sistema de línea de tiempo interactiva con Chart.js
 * Muestra gráfica de línea con acciones por año y permite filtrar por click
 */
class TimelineManager {
  constructor(filterManager, data) {
    this.filterManager = filterManager;
    this.data = data;
    this.minYear = null;
    this.maxYear = null;
    this.selectedYear = null;
    this.actionsByYear = {};
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.isInitialized = false;
    this.chart = null;
    this.years = [];
    this.counts = [];
  }

  /**
   * Inicializa el sistema de timeline
   * @param {Array} markersData - Array de markers con fechas
   */
  init(markersData) {
    try {
      this.calculateActionsByYear(markersData);

      if (!this.minYear || !this.maxYear) {
        this.hideTimeline();
        return;
      }

      this.createChart();
      this.setupDateRangeModal();

      this.isInitialized = true;
    } catch (error) {
      console.error('Error al inicializar timeline:', error);
      this.hideTimeline();
    }
  }

  /**
   * Calcula cantidad de acciones por año
   * @param {Array} markersData - Array de markers
   */
  calculateActionsByYear(markersData) {
    if (!markersData || markersData.length === 0) return;

    const yearCounts = {};
    let minDate = null;
    let maxDate = null;

    markersData.forEach(marker => {
      const fechaInicio = marker.fecha_inicio || marker.created_at;
      if (fechaInicio) {
        const date = new Date(fechaInicio);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          yearCounts[year] = (yearCounts[year] || 0) + 1;
          if (!minDate || date < minDate) minDate = date;
          if (!maxDate || date > maxDate) maxDate = date;
        }
      }
    });

    if (minDate && maxDate) {
      this.minYear = minDate.getFullYear();
      this.maxYear = maxDate.getFullYear();
      this.actionsByYear = yearCounts;
      if (this.maxYear < 2026) this.maxYear = 2026;
      if (this.minYear === this.maxYear) this.minYear = this.minYear - 1;
    }
  }

  /**
   * Obtiene el color según la cantidad de acciones usando RANGOS_ACCIONES
   * @param {number} count - Cantidad de acciones
   * @returns {string} Color hex
   */
  getColorForCount(count) {
    if (count === 0) return CONFIG.COLOR_SIN_ACCIONES;
    for (const rango of CONFIG.RANGOS_ACCIONES) {
      if (count >= rango.min && count <= rango.max) {
        return rango.color;
      }
    }
    return CONFIG.COLOR_SIN_ACCIONES;
  }

  /**
   * Convierte color hex a rgba
   * @param {string} hex - Color en formato hex
   * @param {number} alpha - Transparencia (0-1)
   * @returns {string} Color en formato rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Crea la gráfica Chart.js de línea de tiempo
   */
  createChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;

    this.years = [];
    this.counts = [];
    const pointColors = [];
    const pointBorderColors = [];
    const pointSizes = [];

    for (let year = this.minYear; year <= this.maxYear; year++) {
      this.years.push(year);
      const count = this.actionsByYear[year] || 0;
      this.counts.push(count);
      const color = this.getColorForCount(count);
      pointColors.push(color);
      pointBorderColors.push(color === CONFIG.COLOR_SIN_ACCIONES ? '#bbb' : color);
      pointSizes.push(count > 0 ? Math.max(5, Math.min(10, 3 + count * 0.3)) : 4);
    }

    const self = this;

    // Plugin: Etiquetas de conteo encima de cada punto
    const dataLabelsPlugin = {
      id: 'timelineDataLabels',
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((point, index) => {
          const count = chart.data.datasets[0].data[index];
          if (count > 0) {
            ctx.save();
            ctx.font = 'bold 12px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = self.getColorForCount(count);
            ctx.fillText(count, point.x, point.y - 10);
            ctx.restore();
          }
        });
      }
    };

    // Plugin: Resaltar año seleccionado con anillo
    const selectedHighlightPlugin = {
      id: 'selectedHighlight',
      afterDatasetsDraw(chart) {
        if (self.selectedYear === null) return;

        const yearIndex = self.years.indexOf(self.selectedYear);
        if (yearIndex === -1) return;

        const meta = chart.getDatasetMeta(0);
        const point = meta.data[yearIndex];
        if (!point) return;

        const ctx = chart.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 152, 0, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    };

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: this.years,
        datasets: [{
          data: this.counts,
          borderColor: '#C6A86A',
          backgroundColor: 'transparent',
          pointBackgroundColor: pointColors,
          pointBorderColor: pointBorderColors,
          pointBorderWidth: 1.5,
          pointRadius: pointSizes,
          pointHoverRadius: pointSizes.map(s => s + 3),
          borderWidth: 2.5,
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 22,
            right: 15,
            bottom: 2,
            left: 15
          }
        },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleFont: { family: 'Montserrat', size: 12, weight: '700' },
            bodyFont: { family: 'Open Sans', size: 11 },
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => {
                const count = item.raw;
                return count + (count === 1 ? ' acción' : ' acciones');
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { family: 'Montserrat', size: 10, weight: '600' },
              color: '#999',
              maxRotation: 0,
              autoSkip: false
            }
          },
          y: {
            display: false,
            beginAtZero: true
          }
        },
        onHover: (event, elements) => {
          const target = event.native?.target;
          if (target) {
            target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
          }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const year = self.years[index];
            self.handleYearClick(year);
          }
        }
      },
      plugins: [dataLabelsPlugin, selectedHighlightPlugin]
    });
  }

  /**
   * Maneja click en un punto del año
   * @param {number} year - Año seleccionado
   */
  handleYearClick(year) {
    if (this.selectedYear === year) {
      this.selectedYear = null;
    } else {
      this.selectedYear = year;
    }

    this.updateChartSelection();
    this.applyTimelineFilter();
  }

  /**
   * Actualiza la apariencia del chart según la selección activa
   */
  updateChartSelection() {
    if (!this.chart) return;

    const dataset = this.chart.data.datasets[0];
    const pointColors = [];
    const pointBorderColors = [];
    const pointSizes = [];

    this.years.forEach((year, index) => {
      const count = this.counts[index];
      const baseColor = this.getColorForCount(count);
      const baseBorder = baseColor === CONFIG.COLOR_SIN_ACCIONES ? '#bbb' : baseColor;
      const baseSize = count > 0 ? Math.max(5, Math.min(10, 3 + count * 0.3)) : 4;

      if (this.selectedYear !== null) {
        if (year === this.selectedYear) {
          pointColors.push(baseColor);
          pointBorderColors.push(baseBorder);
          pointSizes.push(baseSize + 3);
        } else {
          pointColors.push(this.hexToRgba(baseColor, 0.3));
          pointBorderColors.push(this.hexToRgba(baseColor, 0.3));
          pointSizes.push(baseSize);
        }
      } else {
        pointColors.push(baseColor);
        pointBorderColors.push(baseBorder);
        pointSizes.push(baseSize);
      }
    });

    dataset.pointBackgroundColor = pointColors;
    dataset.pointBorderColor = pointBorderColors;
    dataset.pointRadius = pointSizes;

    this.chart.update('none');
  }

  /**
   * Aplica filtro de timeline al FilterManager
   */
  applyTimelineFilter() {
    if (!this.filterManager || !this.filterManager.isInitialized) return;

    if (this.selectedStartDate && this.selectedEndDate) {
      this.filterManager.setTimelineDateRange(this.selectedStartDate, this.selectedEndDate);
    } else if (this.selectedYear) {
      this.filterManager.setTimelineRange(this.selectedYear, this.selectedYear);
    } else {
      this.filterManager.setTimelineRange(null, null);
      this.filterManager.setTimelineDateRange(null, null);
    }

    this.filterManager.applyFilters();
  }

  /**
   * Configura modal de rango de fechas
   */
  setupDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    const closeBtn = document.getElementById('closeDateModal');
    const applyBtn = document.getElementById('applyDateRange');
    const clearBtn = document.getElementById('clearDateRange');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDateRangeModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeDateRangeModal();
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyDateRange());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearDateRange());
    }
  }

  openDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    if (modal) {
      const startDateInput = document.getElementById('startDate');
      const endDateInput = document.getElementById('endDate');
      if (this.selectedStartDate && startDateInput) startDateInput.value = this.selectedStartDate;
      if (this.selectedEndDate && endDateInput) endDateInput.value = this.selectedEndDate;
      modal.style.display = 'flex';
    }
  }

  closeDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    if (modal) modal.style.display = 'none';
  }

  applyDateRange() {
    const startDate = document.getElementById('startDate')?.value;
    const endDate = document.getElementById('endDate')?.value;

    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;
    this.selectedYear = null;
    this.updateChartSelection();
    this.closeDateRangeModal();
    this.applyTimelineFilter();
  }

  clearDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';

    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.closeDateRangeModal();
    this.applyTimelineFilter();
  }

  /**
   * Resetea timeline a valores por defecto
   */
  reset() {
    this.selectedYear = null;
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.updateChartSelection();

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
  }

  hideTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.innerHTML = '<div class="timeline-wrapper" style="display:flex;align-items:center;justify-content:center;height:100%;"><span style="color: #999; font-size: 0.875rem;">Sin datos de fechas disponibles</span></div>';
    }
  }

  /**
   * Verifica si marker pasa filtro de timeline
   * @param {Object} marker - Marker a verificar
   * @returns {boolean}
   */
  passesTimelineFilter(marker) {
    if (!this.isInitialized) return true;

    if (!this.selectedYear && !this.selectedStartDate && !this.selectedEndDate) return true;

    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) return true;

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) return true;

    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);
      endDate.setHours(23, 59, 59, 999);
      return date >= startDate && date <= endDate;
    }

    if (this.selectedYear) {
      return date.getFullYear() === this.selectedYear;
    }

    return true;
  }

  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.filterManager = null;
    this.data = null;
    this.actionsByYear = {};
    this.years = [];
    this.counts = [];
    this.isInitialized = false;
  }
}

if (typeof window !== 'undefined') {
  window.TimelineManager = TimelineManager;
}
