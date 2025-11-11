/**
 * Sistema de línea de tiempo (Timeline)
 * Permite filtrar proyectos por rango de fechas
 */

class TimelineManager {
  constructor(filterManager, data) {
    this.filterManager = filterManager;
    this.data = data;
    this.minYear = null;
    this.maxYear = null;
    this.selectedStartYear = null;
    this.selectedEndYear = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de timeline
   */
  init(markersData) {
    try {
      // Calcular rango de años desde los datos
      this.calculateYearRange(markersData);

      // Si no hay rango válido, ocultar timeline
      if (!this.minYear || !this.maxYear) {
        this.hideTimeline();
        return;
      }

      // Configurar los controles
      this.setupTimelineControls();

      // Configurar event listeners
      this.setupEventListeners();

      this.isInitialized = true;
    } catch (error) {
      console.error('Error al inicializar timeline:', error);
      this.hideTimeline();
    }
  }

  /**
   * Calcula el rango de años desde los datos de los proyectos
   */
  calculateYearRange(markersData) {
    if (!markersData || markersData.length === 0) {
      return;
    }

    let minDate = null;
    let maxDate = null;

    markersData.forEach(marker => {
      const fechaInicio = marker.fecha_inicio || marker.created_at;
      if (fechaInicio) {
        const date = new Date(fechaInicio);
        if (!isNaN(date.getTime())) {
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

      // Si todos los proyectos son del mismo año, expandir el rango
      if (this.minYear === this.maxYear) {
        this.minYear = this.minYear - 1;
        this.maxYear = this.maxYear + 1;
      }

      this.selectedStartYear = this.minYear;
      this.selectedEndYear = this.maxYear;
    }
  }

  /**
   * Configura los controles del timeline
   */
  setupTimelineControls() {
    const startInput = document.getElementById('timelineStart');
    const endInput = document.getElementById('timelineEnd');
    const rangeDisplay = document.getElementById('timelineRange');

    if (startInput && endInput && rangeDisplay) {
      // Configurar atributos de los inputs
      startInput.min = this.minYear;
      startInput.max = this.maxYear;
      startInput.value = this.minYear;
      startInput.disabled = false;

      endInput.min = this.minYear;
      endInput.max = this.maxYear;
      endInput.value = this.maxYear;
      endInput.disabled = false;

      // Actualizar display del rango
      rangeDisplay.textContent = `${this.minYear} - ${this.maxYear}`;
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    const startInput = document.getElementById('timelineStart');
    const endInput = document.getElementById('timelineEnd');

    if (startInput) {
      startInput.addEventListener('input', (e) => {
        this.handleStartChange(parseInt(e.target.value));
      });
    }

    if (endInput) {
      endInput.addEventListener('input', (e) => {
        this.handleEndChange(parseInt(e.target.value));
      });
    }
  }

  /**
   * Maneja el cambio del slider de inicio
   */
  handleStartChange(newStartYear) {
    const endInput = document.getElementById('timelineEnd');
    const rangeDisplay = document.getElementById('timelineRange');

    // Asegurar que el inicio no sea mayor que el fin
    if (newStartYear > this.selectedEndYear) {
      newStartYear = this.selectedEndYear;
      document.getElementById('timelineStart').value = newStartYear;
    }

    this.selectedStartYear = newStartYear;

    // Actualizar display
    if (rangeDisplay) {
      rangeDisplay.textContent = `${this.selectedStartYear} - ${this.selectedEndYear}`;
    }

    // Aplicar filtros
    this.applyTimelineFilter();
  }

  /**
   * Maneja el cambio del slider de fin
   */
  handleEndChange(newEndYear) {
    const startInput = document.getElementById('timelineStart');
    const rangeDisplay = document.getElementById('timelineRange');

    // Asegurar que el fin no sea menor que el inicio
    if (newEndYear < this.selectedStartYear) {
      newEndYear = this.selectedStartYear;
      document.getElementById('timelineEnd').value = newEndYear;
    }

    this.selectedEndYear = newEndYear;

    // Actualizar display
    if (rangeDisplay) {
      rangeDisplay.textContent = `${this.selectedStartYear} - ${this.selectedEndYear}`;
    }

    // Aplicar filtros
    this.applyTimelineFilter();
  }

  /**
   * Aplica el filtro de timeline
   */
  applyTimelineFilter() {
    if (!this.filterManager || !this.filterManager.isInitialized) {
      return;
    }

    // Notificar al FilterManager que aplique filtros con el rango de fechas
    this.filterManager.setTimelineRange(this.selectedStartYear, this.selectedEndYear);
    this.filterManager.applyFilters();
  }

  /**
   * Resetea el timeline a valores por defecto
   */
  reset() {
    const startInput = document.getElementById('timelineStart');
    const endInput = document.getElementById('timelineEnd');
    const rangeDisplay = document.getElementById('timelineRange');

    if (startInput && endInput) {
      startInput.value = this.minYear;
      endInput.value = this.maxYear;
      this.selectedStartYear = this.minYear;
      this.selectedEndYear = this.maxYear;

      if (rangeDisplay) {
        rangeDisplay.textContent = `${this.minYear} - ${this.maxYear}`;
      }
    }
  }

  /**
   * Oculta el timeline si no hay datos válidos
   */
  hideTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.style.display = 'none';
    }
  }

  /**
   * Verifica si un marker pasa el filtro de timeline
   */
  passesTimelineFilter(marker) {
    if (!this.isInitialized || !this.selectedStartYear || !this.selectedEndYear) {
      return true; // Si timeline no está inicializado, mostrar todos
    }

    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) {
      return true; // Si no tiene fecha, mostrar por defecto
    }

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) {
      return true; // Si la fecha es inválida, mostrar por defecto
    }

    const year = date.getFullYear();
    return year >= this.selectedStartYear && year <= this.selectedEndYear;
  }

  /**
   * Limpia recursos (cleanup)
   */
  destroy() {
    this.filterManager = null;
    this.data = null;
    this.isInitialized = false;
  }
}

// Hacer TimelineManager disponible globalmente
if (typeof window !== 'undefined') {
  window.TimelineManager = TimelineManager;
}
