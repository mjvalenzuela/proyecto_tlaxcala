/**
 * Sistema de filtros compactos con dropdowns y búsqueda
 */

class FilterManager {
  constructor(mapManager, allData) {
    this.mapManager = mapManager;
    this.allData = allData;
    this.allMarkers = [];
    this.activeFilters = {
      tipo: '',
      dependencia: '',
      estado: ''
    };
    this.searchTerm = '';
    this.timelineStartYear = null;
    this.timelineEndYear = null;
    this.timelineStartDate = null; // Rango de fechas completo
    this.timelineEndDate = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de filtros
   */
  init(markersData) {
    this.allMarkers = markersData;
    this.setupFilterListeners();
    this.setupSearchListeners();
    this.isInitialized = true;
  }

  /**
   * Configura los listeners de los dropdowns
   */
  setupFilterListeners() {
    // Filtro Tipo
    const tipoSelect = document.getElementById('filterTipo');
    if (tipoSelect) {
      tipoSelect.addEventListener('change', (e) => {
        this.activeFilters.tipo = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro Dependencia
    const dependenciaSelect = document.getElementById('filterDependencia');
    if (dependenciaSelect) {
      dependenciaSelect.addEventListener('change', (e) => {
        this.activeFilters.dependencia = e.target.value;
        this.applyFilters();
      });
    }

    // Filtro Estado
    const estadoSelect = document.getElementById('filterEstado');
    if (estadoSelect) {
      estadoSelect.addEventListener('change', (e) => {
        this.activeFilters.estado = e.target.value;
        this.applyFilters();
      });
    }

    // Botón limpiar filtros
    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }

  /**
   * Configura los listeners del buscador
   */
  setupSearchListeners() {
    const searchInput = document.getElementById('mapSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      // Búsqueda en tiempo real con debounce
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.trim();

          // Mostrar/ocultar botón de limpiar
          if (clearSearchBtn) {
            clearSearchBtn.style.display = this.searchTerm ? 'flex' : 'none';
          }

          // Solo buscar si hay 3 o más caracteres, o si está vacío
          if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
            this.applyFilters();
          }
        }, 300);
      });
    }

    // Botón limpiar búsqueda
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          this.searchTerm = '';
          clearSearchBtn.style.display = 'none';
          this.applyFilters();
        }
      });
    }
  }

  /**
   * Aplica todos los filtros activos (dropdowns + búsqueda + timeline)
   */
  applyFilters() {
    // Filtrar markers según criterios activos
    const filteredMarkers = this.allMarkers.filter(marker => {
      return this.passesDropdownFilters(marker) &&
             this.passesSearchFilter(marker) &&
             this.passesTimelineFilter(marker);
    });

    // Actualizar mapa con markers filtrados
    this.mapManager.clearMarkers();
    this.mapManager.addMarkers(filteredMarkers);

    // Actualizar contador de resultados
    this.updateResultsCount(filteredMarkers.length);
  }

  /**
   * Verifica si un marker pasa los filtros de dropdown
   */
  passesDropdownFilters(marker) {
    // Filtro de tipo
    if (this.activeFilters.tipo && marker.tipo !== this.activeFilters.tipo) {
      return false;
    }

    // Filtro de dependencia
    if (this.activeFilters.dependencia && marker.dependencia !== this.activeFilters.dependencia) {
      return false;
    }

    // Filtro de estado
    if (this.activeFilters.estado && marker.estado !== this.activeFilters.estado) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si un marker pasa el filtro de búsqueda
   */
  passesSearchFilter(marker) {
    // Si no hay término de búsqueda, pasa el filtro
    if (!this.searchTerm || this.searchTerm.length < 3) {
      return true;
    }

    const searchLower = this.searchTerm.toLowerCase();

    // Buscar en nombre del proyecto
    if (marker.nombre_proyecto && marker.nombre_proyecto.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Buscar en dependencia
    if (marker.dependencia && marker.dependencia.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Buscar en objetivos
    if (marker.objetivos && marker.objetivos.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Buscar en ubicaciones (lugar y actividad)
    if (marker.ubicaciones && Array.isArray(marker.ubicaciones)) {
      for (const ubicacion of marker.ubicaciones) {
        // Buscar en lugar
        if (ubicacion.lugar && ubicacion.lugar.toLowerCase().includes(searchLower)) {
          return true;
        }
        // Buscar en actividad
        if (ubicacion.activity && ubicacion.activity.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }

    // Buscar en ubicación actual
    if (marker.currentUbicacion) {
      if (marker.currentUbicacion.lugar && marker.currentUbicacion.lugar.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (marker.currentUbicacion.activity && marker.currentUbicacion.activity.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    // Buscar en actividades (campo alternativo)
    if (marker.actividades && marker.actividades.toLowerCase().includes(searchLower)) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si un marker pasa el filtro de timeline (rango de fechas)
   */
  passesTimelineFilter(marker) {
    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) {
      return true; // Si no tiene fecha, mostrar por defecto
    }

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) {
      return true; // Si la fecha es inválida, mostrar por defecto
    }

    // Prioridad: filtro por rango de fechas completo
    if (this.timelineStartDate && this.timelineEndDate) {
      const startDate = new Date(this.timelineStartDate);
      const endDate = new Date(this.timelineEndDate);
      // Ajustar endDate al final del día
      endDate.setHours(23, 59, 59, 999);

      return date >= startDate && date <= endDate;
    }

    // Filtro por rango de años
    if (this.timelineStartYear && this.timelineEndYear) {
      const year = date.getFullYear();
      return year >= this.timelineStartYear && year <= this.timelineEndYear;
    }

    // Si no hay filtro activo, mostrar todos
    return true;
  }

  /**
   * Establece el rango de años del timeline
   */
  setTimelineRange(startYear, endYear) {
    this.timelineStartYear = startYear;
    this.timelineEndYear = endYear;
  }

  /**
   * Establece el rango de fechas completo del timeline
   */
  setTimelineDateRange(startDate, endDate) {
    this.timelineStartDate = startDate;
    this.timelineEndDate = endDate;
  }

  /**
   * Limpia todos los filtros activos
   */
  clearAllFilters() {
    // Limpiar filtros de dropdown
    this.activeFilters = {
      tipo: '',
      dependencia: '',
      estado: ''
    };

    // Resetear dropdowns
    const tipoSelect = document.getElementById('filterTipo');
    const dependenciaSelect = document.getElementById('filterDependencia');
    const estadoSelect = document.getElementById('filterEstado');

    if (tipoSelect) tipoSelect.value = '';
    if (dependenciaSelect) dependenciaSelect.value = '';
    if (estadoSelect) estadoSelect.value = '';

    // Limpiar búsqueda
    const searchInput = document.getElementById('mapSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.value = '';
      this.searchTerm = '';
    }

    if (clearSearchBtn) {
      clearSearchBtn.style.display = 'none';
    }

    // Resetear timeline si existe
    this.timelineStartYear = null;
    this.timelineEndYear = null;
    this.timelineStartDate = null;
    this.timelineEndDate = null;
    if (window.timelineManager && window.timelineManager.isInitialized) {
      window.timelineManager.reset();
    }

    // Mostrar todos los markers
    this.mapManager.clearMarkers();
    this.mapManager.addMarkers(this.allMarkers);

    // Actualizar contador
    this.updateResultsCount(this.allMarkers.length);
  }

  /**
   * Actualiza el contador de resultados
   */
  updateResultsCount(count) {
    const counter = document.getElementById('filterResultsCount');
    if (counter) {
      counter.textContent = count;
    }
  }

  /**
   * Obtiene estadísticas de los datos para generar opciones
   */
  static getFilterStats(data) {
    const stats = {
      tipos: new Set(),
      dependencias: new Set(),
      estados: new Set()
    };

    if (!data || !data.acciones) return stats;

    data.acciones.forEach((accion) => {
      if (accion.tipo) stats.tipos.add(accion.tipo);
      if (accion.dependencia) stats.dependencias.add(accion.dependencia);
      if (accion.estado) stats.estados.add(accion.estado);
    });

    return stats;
  }

  /**
   * Genera opciones para los dropdowns
   */
  static generateDropdownOptions(stats) {
    return {
      tipos: Array.from(stats.tipos).sort(),
      dependencias: Array.from(stats.dependencias).sort(),
      estados: Array.from(stats.estados).map(estado => ({
        value: estado,
        label: estado === 'activo' ? 'Activo' : 'Concluido'
      }))
    };
  }

  /**
   * Destruye el FilterManager (cleanup)
   */
  destroy() {
    this.activeFilters = {
      tipo: '',
      dependencia: '',
      estado: ''
    };
    this.searchTerm = '';
    this.timelineStartYear = null;
    this.timelineEndYear = null;
    this.timelineStartDate = null;
    this.timelineEndDate = null;
    this.allMarkers = [];
    this.allData = null;
    this.mapManager = null;
    this.isInitialized = false;
  }
}

// Hacer FilterManager disponible globalmente
if (typeof window !== 'undefined') {
  window.FilterManager = FilterManager;
}
