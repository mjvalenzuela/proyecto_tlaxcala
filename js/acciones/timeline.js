/**
 * Sistema de línea de tiempo interactiva
 * Filtra proyectos por año o rango de fechas
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

      this.generateYearMarkers();

      this.setupEventListeners();

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
    if (!markersData || markersData.length === 0) {
      return;
    }

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

          if (!minDate || date < minDate) {
            minDate = date;
          }
          if (!maxDate || date > maxDate) {
            maxDate = date;
          }
        }
      }
    });

    if (minDate && maxDate) {
      this.minYear = minDate.getFullYear();
      this.maxYear = maxDate.getFullYear();
      this.actionsByYear = yearCounts;

      if (this.minYear === this.maxYear) {
        this.minYear = this.minYear - 1;
        this.maxYear = this.maxYear + 1;
      }
    }
  }

  /**
   * Genera marcadores visuales para cada año
   */
  generateYearMarkers() {
    const markersContainer = document.getElementById('timelineMarkers');
    if (!markersContainer) return;

    markersContainer.innerHTML = '';

    for (let year = this.minYear; year <= this.maxYear; year++) {
      const count = this.actionsByYear[year] || 0;

      const marker = document.createElement('div');
      marker.className = 'timeline-year-marker';
      marker.dataset.year = year;

      const dot = document.createElement('div');
      dot.className = 'timeline-marker-dot';

      const yearLabel = document.createElement('div');
      yearLabel.className = 'timeline-marker-year';
      yearLabel.textContent = year;

      const countBadge = document.createElement('div');
      countBadge.className = 'timeline-marker-count';
      countBadge.textContent = `${count} ${count === 1 ? 'acción' : 'acciones'}`;

      marker.appendChild(countBadge);
      marker.appendChild(dot);
      marker.appendChild(yearLabel);

      markersContainer.appendChild(marker);
    }
  }

  /**
   * Configura event listeners del timeline
   */
  setupEventListeners() {
    const markersContainer = document.getElementById('timelineMarkers');
    if (!markersContainer) return;

    markersContainer.addEventListener('click', (e) => {
      const marker = e.target.closest('.timeline-year-marker');
      if (marker) {
        const year = parseInt(marker.dataset.year);
        this.handleYearClick(year);
      }
    });

    this.setupDateRangeModal();
  }

  /**
   * Configura modal de rango de fechas
   */
  setupDateRangeModal() {
    const calendarIcon = document.querySelector('.timeline-calendar-icon');
    const modal = document.getElementById('dateRangeModal');
    const closeBtn = document.getElementById('closeDateModal');
    const applyBtn = document.getElementById('applyDateRange');
    const clearBtn = document.getElementById('clearDateRange');

    if (calendarIcon) {
      calendarIcon.addEventListener('click', () => {
        this.openDateRangeModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDateRangeModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeDateRangeModal();
        }
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyDateRange();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearDateRange();
      });
    }
  }

  openDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (modal) {
      if (this.selectedStartDate) {
        startDateInput.value = this.selectedStartDate;
      }
      if (this.selectedEndDate) {
        endDateInput.value = this.selectedEndDate;
      }

      modal.style.display = 'flex';
    }
  }

  closeDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Aplica filtro por rango de fechas
   */
  applyDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

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
    this.clearYearSelection();

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
   * Maneja click en marcador de año
   * @param {number} year - Año seleccionado
   */
  handleYearClick(year) {
    if (this.selectedYear === year) {
      this.selectedYear = null;
      this.clearYearSelection();
    } else {
      this.selectedYear = year;
      this.setYearSelection(year);
    }

    this.applyTimelineFilter();
  }

  setYearSelection(year) {
    const markers = document.querySelectorAll('.timeline-year-marker');
    markers.forEach(marker => {
      if (parseInt(marker.dataset.year) === year) {
        marker.classList.add('active');
      } else {
        marker.classList.remove('active');
      }
    });
  }

  clearYearSelection() {
    const markers = document.querySelectorAll('.timeline-year-marker');
    markers.forEach(marker => {
      marker.classList.remove('active');
    });
  }

  /**
   * Aplica filtro de timeline al FilterManager
   */
  applyTimelineFilter() {
    if (!this.filterManager || !this.filterManager.isInitialized) {
      return;
    }

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
   * Resetea timeline a valores por defecto
   */
  reset() {
    this.selectedYear = null;
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.clearYearSelection();

    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
  }

  hideTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.style.display = 'none';
    }
  }

  /**
   * Verifica si marker pasa filtro de timeline
   * @param {Object} marker - Marker a verificar
   * @returns {boolean}
   */
  passesTimelineFilter(marker) {
    if (!this.isInitialized) {
      return true;
    }

    if (!this.selectedYear && !this.selectedStartDate && !this.selectedEndDate) {
      return true;
    }

    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) {
      return true;
    }

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) {
      return true;
    }

    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);
      endDate.setHours(23, 59, 59, 999);

      return date >= startDate && date <= endDate;
    }

    if (this.selectedYear) {
      const year = date.getFullYear();
      return year === this.selectedYear;
    }

    return true;
  }

  destroy() {
    this.filterManager = null;
    this.data = null;
    this.actionsByYear = {};
    this.isInitialized = false;
  }
}

if (typeof window !== 'undefined') {
  window.TimelineManager = TimelineManager;
}
