/**
 * Sistema de filtros para acciones climáticas
 * Gestiona filtros por dropdown, búsqueda y timeline
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
    this.timelineStartDate = null;
    this.timelineEndDate = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de filtros
   * @param {Array} markersData - Array de markers
   */
  init(markersData) {
    this.allMarkers = markersData;
    this.setupFilterListeners();
    this.setupSearchListeners();
    this.isInitialized = true;
  }

  /**
   * Configura listeners de los dropdowns
   */
  setupFilterListeners() {
    const tipoSelect = document.getElementById('filterTipo');
    if (tipoSelect) {
      tipoSelect.addEventListener('change', (e) => {
        this.activeFilters.tipo = e.target.value;
        this.applyFilters();
      });
    }

    const dependenciaSelect = document.getElementById('filterDependencia');
    if (dependenciaSelect) {
      dependenciaSelect.addEventListener('change', (e) => {
        this.activeFilters.dependencia = e.target.value;
        this.applyFilters();
      });
    }

    const estadoSelect = document.getElementById('filterEstado');
    if (estadoSelect) {
      estadoSelect.addEventListener('change', (e) => {
        this.activeFilters.estado = e.target.value;
        this.applyFilters();
      });
    }

    const clearBtn = document.getElementById('clearFiltersBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }

  /**
   * Configura listeners del buscador
   */
  setupSearchListeners() {
    const searchInput = document.getElementById('mapSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchTerm = e.target.value.trim();

          if (clearSearchBtn) {
            clearSearchBtn.style.display = this.searchTerm ? 'flex' : 'none';
          }

          if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
            this.applyFilters();
          }
        }, 300);
      });
    }

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
   * Aplica todos los filtros activos
   */
  applyFilters() {
    const filteredMarkers = this.allMarkers.filter(marker => {
      return this.passesDropdownFilters(marker) &&
             this.passesSearchFilter(marker) &&
             this.passesTimelineFilter(marker);
    });

    this.mapManager.clearMarkers();
    this.mapManager.addMarkers(filteredMarkers);

    this.updateResultsCount(filteredMarkers.length);
  }

  /**
   * Verifica si marker pasa filtros de dropdown
   * @param {Object} marker - Marker a verificar
   * @returns {boolean}
   */
  passesDropdownFilters(marker) {
    if (this.activeFilters.tipo && marker.tipo !== this.activeFilters.tipo) {
      return false;
    }

    if (this.activeFilters.dependencia && marker.dependencia !== this.activeFilters.dependencia) {
      return false;
    }

    if (this.activeFilters.estado && marker.estado !== this.activeFilters.estado) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si marker pasa filtro de búsqueda
   * @param {Object} marker - Marker a verificar
   * @returns {boolean}
   */
  passesSearchFilter(marker) {
    if (!this.searchTerm || this.searchTerm.length < 3) {
      return true;
    }

    const searchLower = this.searchTerm.toLowerCase();

    if (marker.nombre_proyecto && marker.nombre_proyecto.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (marker.dependencia && marker.dependencia.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (marker.objetivos && marker.objetivos.toLowerCase().includes(searchLower)) {
      return true;
    }

    if (marker.ubicaciones && Array.isArray(marker.ubicaciones)) {
      for (const ubicacion of marker.ubicaciones) {
        if (ubicacion.lugar && ubicacion.lugar.toLowerCase().includes(searchLower)) {
          return true;
        }
        if (ubicacion.activity && ubicacion.activity.toLowerCase().includes(searchLower)) {
          return true;
        }
      }
    }

    if (marker.currentUbicacion) {
      if (marker.currentUbicacion.lugar && marker.currentUbicacion.lugar.toLowerCase().includes(searchLower)) {
        return true;
      }
      if (marker.currentUbicacion.activity && marker.currentUbicacion.activity.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    if (marker.actividades && marker.actividades.toLowerCase().includes(searchLower)) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si marker pasa filtro de timeline
   * @param {Object} marker - Marker a verificar
   * @returns {boolean}
   */
  passesTimelineFilter(marker) {
    const fechaInicio = marker.fecha_inicio || marker.created_at;
    if (!fechaInicio) {
      return true;
    }

    const date = new Date(fechaInicio);
    if (isNaN(date.getTime())) {
      return true;
    }

    if (this.timelineStartDate && this.timelineEndDate) {
      const startDate = new Date(this.timelineStartDate);
      const endDate = new Date(this.timelineEndDate);
      endDate.setHours(23, 59, 59, 999);

      return date >= startDate && date <= endDate;
    }

    if (this.timelineStartYear && this.timelineEndYear) {
      const year = date.getFullYear();
      return year >= this.timelineStartYear && year <= this.timelineEndYear;
    }

    return true;
  }

  setTimelineRange(startYear, endYear) {
    this.timelineStartYear = startYear;
    this.timelineEndYear = endYear;
  }

  setTimelineDateRange(startDate, endDate) {
    this.timelineStartDate = startDate;
    this.timelineEndDate = endDate;
  }

  /**
   * Limpia todos los filtros activos
   */
  clearAllFilters() {
    this.activeFilters = {
      tipo: '',
      dependencia: '',
      estado: ''
    };

    const tipoSelect = document.getElementById('filterTipo');
    const dependenciaSelect = document.getElementById('filterDependencia');
    const estadoSelect = document.getElementById('filterEstado');

    if (tipoSelect) tipoSelect.value = '';
    if (dependenciaSelect) dependenciaSelect.value = '';
    if (estadoSelect) estadoSelect.value = '';

    const searchInput = document.getElementById('mapSearchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.value = '';
      this.searchTerm = '';
    }

    if (clearSearchBtn) {
      clearSearchBtn.style.display = 'none';
    }

    this.timelineStartYear = null;
    this.timelineEndYear = null;
    this.timelineStartDate = null;
    this.timelineEndDate = null;
    if (window.timelineManager && window.timelineManager.isInitialized) {
      window.timelineManager.reset();
    }

    this.mapManager.clearMarkers();
    this.mapManager.addMarkers(this.allMarkers);

    this.updateResultsCount(this.allMarkers.length);
  }

  updateResultsCount(count) {
    const counter = document.getElementById('filterResultsCount');
    if (counter) {
      counter.textContent = count;
    }
  }

  /**
   * Obtiene estadísticas para generar opciones
   * @param {Object} data - Datos de acciones
   * @returns {Object} Estadísticas de filtros
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
   * @param {Object} stats - Estadísticas de filtros
   * @returns {Object} Opciones para dropdowns
   */
  static generateDropdownOptions(stats) {
    return {
      tipos: Array.from(stats.tipos).sort(),
      dependencias: Array.from(stats.dependencias).sort(),
      estados: Array.from(stats.estados).map(estado => ({
        value: estado,
        label: estado === 'activo' ? 'En Proceso' : 'Concluido'
      }))
    };
  }

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

if (typeof window !== 'undefined') {
  window.FilterManager = FilterManager;
}
