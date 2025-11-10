/**
 * Sistema de filtros para acciones climáticas
 */

class FilterManager {
  constructor(mapManager, allData) {
    this.mapManager = mapManager;
    this.allData = allData; // Todos los datos sin filtrar
    this.allMarkers = []; // Todos los markers procesados
    this.activeFilters = {
      dependencias: new Set(),
      tipos: new Set(),
      estados: new Set(),
    };
    this.isInitialized = false;
  }

  /**
   * Inicializa el sistema de filtros
   */
  init(markersData) {
    this.allMarkers = markersData;
    this.setupFilterListeners();
    this.isInitialized = true;
  }

  /**
   * Configura los listeners de los filtros
   */
  setupFilterListeners() {
    // Filtros de dependencia
    const dependenciaCheckboxes = document.querySelectorAll(
      'input[name="dependencia"]'
    );
    dependenciaCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleDependenciaChange(e.target);
      });
    });

    // Filtros de tipo
    const tipoCheckboxes = document.querySelectorAll('input[name="tipo"]');
    tipoCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleTipoChange(e.target);
      });
    });

    // Filtros de estado
    const estadoCheckboxes = document.querySelectorAll('input[name="estado"]');
    estadoCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleEstadoChange(e.target);
      });
    });

    // Botón limpiar filtros
    const clearBtn = document.getElementById("clearFiltersBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        this.clearAllFilters();
      });
    }

    // Botón toggle filtros (móvil)
    const toggleBtn = document.getElementById("toggleFiltersBtn");
    const filtersPanel = document.getElementById("filtersPanel");
    if (toggleBtn && filtersPanel) {
      toggleBtn.addEventListener("click", () => {
        filtersPanel.classList.toggle("active");
        toggleBtn.classList.toggle("active");
      });
    }
  }

  /**
   * Maneja cambios en filtro de dependencia
   */
  handleDependenciaChange(checkbox) {
    const value = checkbox.value;

    if (checkbox.checked) {
      this.activeFilters.dependencias.add(value);
    } else {
      this.activeFilters.dependencias.delete(value);
    }

    this.applyFilters();
  }

  /**
   * Maneja cambios en filtro de tipo
   */
  handleTipoChange(checkbox) {
    const value = checkbox.value;

    if (checkbox.checked) {
      this.activeFilters.tipos.add(value);
    } else {
      this.activeFilters.tipos.delete(value);
    }

    this.applyFilters();
  }

  /**
   * Maneja cambios en filtro de estado
   */
  handleEstadoChange(checkbox) {
    const value = checkbox.value;

    if (checkbox.checked) {
      this.activeFilters.estados.add(value);
    } else {
      this.activeFilters.estados.delete(value);
    }

    this.applyFilters();
  }

  /**
   * Aplica todos los filtros activos
   */
  applyFilters() {
    // Filtrar markers según criterios activos
    const filteredMarkers = this.allMarkers.filter((marker) => {
      return this.passesAllFilters(marker);
    });

    // Actualizar mapa con markers filtrados
    this.mapManager.clearMarkers();
    this.mapManager.addMarkers(filteredMarkers);

    // Actualizar contador de resultados
    this.updateResultsCount(filteredMarkers.length);
  }

  /**
   * Verifica si un marker pasa todos los filtros activos
   */
  passesAllFilters(marker) {
    // Filtro de dependencia
    if (this.activeFilters.dependencias.size > 0) {
      if (!this.activeFilters.dependencias.has(marker.dependencia)) {
        return false;
      }
    }

    // Filtro de tipo
    if (this.activeFilters.tipos.size > 0) {
      if (!this.activeFilters.tipos.has(marker.tipo)) {
        return false;
      }
    }

    // Filtro de estado
    if (this.activeFilters.estados.size > 0) {
      if (!this.activeFilters.estados.has(marker.estado)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Limpia todos los filtros activos
   */
  clearAllFilters() {
    // Limpiar sets
    this.activeFilters.dependencias.clear();
    this.activeFilters.tipos.clear();
    this.activeFilters.estados.clear();

    // Desmarcar todos los checkboxes
    const allCheckboxes = document.querySelectorAll(
      '.filter-checkbox input[type="checkbox"]'
    );
    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });

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
    const counter1 = document.getElementById("filterResultsCount");
    const counter2 = document.getElementById("filterResultsCount2");

    if (counter1) {
      counter1.textContent = count;
    }
    if (counter2) {
      counter2.textContent = count;
    }
  }

  /**
   * Obtiene estadísticas de los datos para generar filtros
   */
  static getFilterStats(data) {
    const stats = {
      dependencias: new Map(),
      tipos: new Map(),
      estados: new Map(),
    };

    if (!data || !data.acciones) return stats;

    data.acciones.forEach((accion) => {
      // Contar por dependencia
      const dep = accion.dependencia || "Sin especificar";
      stats.dependencias.set(dep, (stats.dependencias.get(dep) || 0) + 1);

      // Contar por tipo
      const tipo = accion.tipo || "Sin especificar";
      stats.tipos.set(tipo, (stats.tipos.get(tipo) || 0) + 1);

      // Contar por estado
      const estado = accion.estado || "activo";
      stats.estados.set(estado, (stats.estados.get(estado) || 0) + 1);
    });

    return stats;
  }

  /**
   * Genera HTML para opciones de filtro
   */
  static generateFilterOptions(stats) {
    return {
      dependencias: Array.from(stats.dependencias.entries()).map(
        ([nombre, count]) => ({
          value: nombre,
          label: nombre,
          count: count,
        })
      ),
      tipos: Array.from(stats.tipos.entries()).map(([nombre, count]) => ({
        value: nombre,
        label: nombre,
        count: count,
      })),
      estados: Array.from(stats.estados.entries()).map(([nombre, count]) => ({
        value: nombre,
        label: nombre === "activo" ? "Activo" : "Concluido",
        count: count,
      })),
    };
  }

  /**
   * Destruye el FilterManager (cleanup)
   */
  destroy() {
    this.activeFilters.dependencias.clear();
    this.activeFilters.tipos.clear();
    this.activeFilters.estados.clear();
    this.allMarkers = [];
    this.allData = null;
    this.mapManager = null;
    this.isInitialized = false;
  }
}

// Hacer FilterManager disponible globalmente
if (typeof window !== "undefined") {
  window.FilterManager = FilterManager;
}
