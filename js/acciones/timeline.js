/**
 * Sistema de línea de tiempo (Timeline)
 * Permite filtrar proyectos por año usando una gráfica interactiva
 */

class TimelineManager {
  constructor(filterManager, data) {
    this.filterManager = filterManager;
    this.data = data;
    this.minYear = null;
    this.maxYear = null;
    this.selectedYear = null; // Año actualmente seleccionado (null = todos)
    this.actionsByYear = {}; // { year: count }
    this.selectedStartDate = null; // Rango de fechas personalizado
    this.selectedEndDate = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de timeline
   */
  init(markersData) {
    try {
      // Calcular acciones por año
      this.calculateActionsByYear(markersData);

      // Si no hay datos válidos, ocultar timeline
      if (!this.minYear || !this.maxYear) {
        this.hideTimeline();
        return;
      }

      // Generar los marcadores visuales
      this.generateYearMarkers();

      // Configurar event listeners
      this.setupEventListeners();

      this.isInitialized = true;
    } catch (error) {
      console.error('Error al inicializar timeline:', error);
      this.hideTimeline();
    }
  }

  /**
   * Calcula la cantidad de acciones por año
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

          // Contar acciones por año
          yearCounts[year] = (yearCounts[year] || 0) + 1;

          // Actualizar min/max
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

      // Si todos los proyectos son del mismo año, expandir el rango
      if (this.minYear === this.maxYear) {
        this.minYear = this.minYear - 1;
        this.maxYear = this.maxYear + 1;
      }
    }
  }

  /**
   * Genera los marcadores visuales para cada año
   */
  generateYearMarkers() {
    const markersContainer = document.getElementById('timelineMarkers');
    if (!markersContainer) return;

    // Limpiar marcadores existentes
    markersContainer.innerHTML = '';

    // Generar un marcador para cada año en el rango
    for (let year = this.minYear; year <= this.maxYear; year++) {
      const count = this.actionsByYear[year] || 0;

      // Crear elemento del marcador
      const marker = document.createElement('div');
      marker.className = 'timeline-year-marker';
      marker.dataset.year = year;

      // Crear el punto
      const dot = document.createElement('div');
      dot.className = 'timeline-marker-dot';

      // Crear el label del año
      const yearLabel = document.createElement('div');
      yearLabel.className = 'timeline-marker-year';
      yearLabel.textContent = year;

      // Crear el contador (se muestra en hover)
      const countBadge = document.createElement('div');
      countBadge.className = 'timeline-marker-count';
      countBadge.textContent = `${count} ${count === 1 ? 'acción' : 'acciones'}`;

      // Ensamblar el marcador
      marker.appendChild(countBadge);
      marker.appendChild(dot);
      marker.appendChild(yearLabel);

      // Agregar al contenedor
      markersContainer.appendChild(marker);
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    const markersContainer = document.getElementById('timelineMarkers');
    if (!markersContainer) return;

    // Delegación de eventos: escuchar clicks en el contenedor
    markersContainer.addEventListener('click', (e) => {
      const marker = e.target.closest('.timeline-year-marker');
      if (marker) {
        const year = parseInt(marker.dataset.year);
        this.handleYearClick(year);
      }
    });

    // Configurar el modal de rango de fechas
    this.setupDateRangeModal();
  }

  /**
   * Configura el modal de rango de fechas
   */
  setupDateRangeModal() {
    const calendarIcon = document.querySelector('.timeline-calendar-icon');
    const modal = document.getElementById('dateRangeModal');
    const closeBtn = document.getElementById('closeDateModal');
    const applyBtn = document.getElementById('applyDateRange');
    const clearBtn = document.getElementById('clearDateRange');

    // Abrir modal al hacer click en el ícono del calendario
    if (calendarIcon) {
      calendarIcon.addEventListener('click', () => {
        this.openDateRangeModal();
      });
    }

    // Cerrar modal con el botón X
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDateRangeModal();
      });
    }

    // Cerrar modal al hacer click fuera de él
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeDateRangeModal();
        }
      });
    }

    // Aplicar rango de fechas
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyDateRange();
      });
    }

    // Limpiar rango de fechas
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearDateRange();
      });
    }
  }

  /**
   * Abre el modal de rango de fechas
   */
  openDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (modal) {
      // Si ya hay un rango seleccionado, mostrarlo en el modal
      if (this.selectedStartDate) {
        startDateInput.value = this.selectedStartDate;
      }
      if (this.selectedEndDate) {
        endDateInput.value = this.selectedEndDate;
      }

      modal.style.display = 'flex';
    }
  }

  /**
   * Cierra el modal de rango de fechas
   */
  closeDateRangeModal() {
    const modal = document.getElementById('dateRangeModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Aplica el filtro por rango de fechas
   */
  applyDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    // Validar que ambas fechas estén seleccionadas
    if (!startDate || !endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (new Date(startDate) > new Date(endDate)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    // Guardar las fechas
    this.selectedStartDate = startDate;
    this.selectedEndDate = endDate;

    // Limpiar la selección de año (ya que ahora usamos rango de fechas)
    this.selectedYear = null;
    this.clearYearSelection();

    // Cerrar modal
    this.closeDateRangeModal();

    // Aplicar filtros
    this.applyTimelineFilter();
  }

  /**
   * Limpia el rango de fechas seleccionado
   */
  clearDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Limpiar inputs
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';

    // Limpiar fechas seleccionadas
    this.selectedStartDate = null;
    this.selectedEndDate = null;

    // Cerrar modal
    this.closeDateRangeModal();

    // Aplicar filtros (mostrará todos)
    this.applyTimelineFilter();
  }

  /**
   * Maneja el click en un marcador de año
   */
  handleYearClick(year) {
    // Si ya estaba seleccionado, deseleccionar (mostrar todos)
    if (this.selectedYear === year) {
      this.selectedYear = null;
      this.clearYearSelection();
    } else {
      // Seleccionar el nuevo año
      this.selectedYear = year;
      this.setYearSelection(year);
    }

    // Aplicar filtros
    this.applyTimelineFilter();
  }

  /**
   * Marca visualmente un año como seleccionado
   */
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

  /**
   * Limpia la selección visual de años
   */
  clearYearSelection() {
    const markers = document.querySelectorAll('.timeline-year-marker');
    markers.forEach(marker => {
      marker.classList.remove('active');
    });
  }

  /**
   * Aplica el filtro de timeline
   */
  applyTimelineFilter() {
    if (!this.filterManager || !this.filterManager.isInitialized) {
      return;
    }

    // Notificar al FilterManager
    if (this.selectedStartDate && this.selectedEndDate) {
      // Filtrar por rango de fechas personalizado
      this.filterManager.setTimelineDateRange(this.selectedStartDate, this.selectedEndDate);
    } else if (this.selectedYear) {
      // Filtrar por un año específico
      this.filterManager.setTimelineRange(this.selectedYear, this.selectedYear);
    } else {
      // Mostrar todos
      this.filterManager.setTimelineRange(null, null);
      this.filterManager.setTimelineDateRange(null, null);
    }

    this.filterManager.applyFilters();
  }

  /**
   * Resetea el timeline a valores por defecto
   */
  reset() {
    this.selectedYear = null;
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.clearYearSelection();

    // Limpiar también los inputs del modal
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
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
    if (!this.isInitialized) {
      return true;
    }

    // Si no hay filtro activo, mostrar todos
    if (!this.selectedYear && !this.selectedStartDate && !this.selectedEndDate) {
      return true;
    }

    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) {
      return true; // Si no tiene fecha, mostrar por defecto
    }

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) {
      return true; // Si la fecha es inválida, mostrar por defecto
    }

    // Filtro por rango de fechas completo (tiene prioridad)
    if (this.selectedStartDate && this.selectedEndDate) {
      const startDate = new Date(this.selectedStartDate);
      const endDate = new Date(this.selectedEndDate);
      // Ajustar endDate al final del día
      endDate.setHours(23, 59, 59, 999);

      return date >= startDate && date <= endDate;
    }

    // Filtro por año específico
    if (this.selectedYear) {
      const year = date.getFullYear();
      return year === this.selectedYear;
    }

    return true;
  }

  /**
   * Limpia recursos (cleanup)
   */
  destroy() {
    this.filterManager = null;
    this.data = null;
    this.actionsByYear = {};
    this.isInitialized = false;
  }
}

// Hacer TimelineManager disponible globalmente
if (typeof window !== 'undefined') {
  window.TimelineManager = TimelineManager;
}
