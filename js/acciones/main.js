/**
 * Aplicación principal de Acciones Climáticas
 * Orquesta inicialización y coordinación de módulos
 */
class AccionesClimaticasApp {
  constructor() {
    this.dataManager = null;
    this.mapManager = null;
    this.filterManager = null;
    this.timelineManager = null;
    this.data = null;
    this.dataEstatal = null;
    this.markersData = null;
    this.markersDataEstatal = null;
    this.isInitialized = false;
    // Estado de los toggles
    this.showLocal = true;
    this.showEstatal = false;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      this.dataManager = new DataManager();
      this.mapManager = new MapManager("map");

      const mapInitialized = this.mapManager.initMap();
      if (!mapInitialized) {
        throw new Error("Error al inicializar el mapa");
      }

      await this.loadData();

      this.setupEventListeners();

      this.isInitialized = true;
    } catch (error) {
      console.error("Error al inicializar aplicación:", error);
      this.showError(error.message);
    }
  }

  /**
   * Carga datos del API y configura el mapa
   */
  async loadData() {
    try {
      this.showLoading(true);

      // Cargar datos locales y estatales en paralelo
      const [dataLocal, dataEstatal] = await Promise.all([
        this.dataManager.fetchData(),
        this.dataManager.fetchDataEstatal().catch(err => {
          console.warn('No se pudieron cargar datos estatales:', err);
          return { acciones: [], total: 0, metadata: {} };
        })
      ]);

      this.data = dataLocal;
      this.dataEstatal = dataEstatal;

      if (!this.data || !this.data.acciones) {
        throw new Error("No se pudieron cargar los datos");
      }

      // Combinar acciones para el popup generator
      const todasLasAcciones = [
        ...this.data.acciones,
        ...(this.dataEstatal?.acciones || [])
      ];
      PopupGenerator.setAccionesData(todasLasAcciones);

      // Generar conteo uniforme: todos los municipios tienen el total de acciones
      // Esto hace que todos se pinten del mismo color basado en el total
      const conteoMunicipios = this.dataManager.generarConteoUniforme(this.data);
      this.mapManager.setConteoMunicipios(conteoMunicipios);

      // Establecer conteo estatal
      const conteoEstatal = this.dataEstatal?.total || 0;
      this.mapManager.setConteoEstatal(conteoEstatal);

      await this.mapManager.cargarMunicipiosGeoJSON();

      // Obtener centroides de municipios para expandir marcadores multi-municipio
      const centroids = this.mapManager.getMunicipioCentroids();
      this.markersData = this.dataManager.processAccionesForMap(this.data, centroids);
      this.mapManager.addMarkers(this.markersData);

      // Procesar marcadores estatales
      this.markersDataEstatal = this.dataManager.processAccionesEstatalesForMap(this.dataEstatal);
      this.mapManager.addMarkersEstatal(this.markersDataEstatal);

      // Actualizar estadísticas según toggles activos
      this.updateStatsFromToggles();

      this.initFilters();
      this.setupAlcanceToggle();

      this.showLoading(false);
    } catch (error) {
      this.showLoading(false);
      throw error;
    }
  }

  /**
   * Actualiza estadísticas en el header
   * @param {Object} data - Datos de acciones
   */
  updateStats(data) {
    const stats = this.dataManager.getStats(data);

    if (stats) {
      this.updateStatElement("statTotal", stats.total);
      this.updateStatElement("statUbicaciones", stats.ubicaciones);
      this.updateStatElement("statDependencias", stats.dependencias);
    }
  }

  updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      this.animateValue(element, 0, value, 1000);
    }
  }

  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }

  /**
   * Inicializa sistema de filtros y timeline
   */
  initFilters() {
    try {
      // Obtener estadísticas combinando datos locales y estatales
      const stats = FilterManager.getFilterStats(this.data, this.dataEstatal);
      const options = FilterManager.generateDropdownOptions(stats);

      this.populateDropdown('filterTipo', options.tipos);
      this.populateDropdown('filterDependencia', options.dependencias);
      this.populateDropdownWithLabels('filterEstado', options.estados);

      this.filterManager = new FilterManager(this.mapManager, this.data);
      // Inicializar con marcadores locales y estatales
      this.filterManager.init(this.markersData, this.markersDataEstatal);
      // Establecer estado inicial de toggles
      this.filterManager.setToggleState(this.showLocal, this.showEstatal);

      this.timelineManager = new TimelineManager(this.filterManager, this.data);
      this.timelineManager.init(this.markersData);

      window.timelineManager = this.timelineManager;

      // Calcular conteo inicial según toggles activos
      let initialCount = 0;
      if (this.showLocal) initialCount += this.markersData.length;
      if (this.showEstatal) initialCount += this.markersDataEstatal.length;
      this.filterManager.updateResultsCount(initialCount);
    } catch (error) {
      console.error("Error al inicializar filtros:", error);
    }
  }

  populateDropdown(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option;
      select.appendChild(optionElement);
    });
  }

  populateDropdownWithLabels(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });
  }

  /**
   * Configura event listeners globales
   */
  setupEventListeners() {
    const centerBtn = document.getElementById("centerMapBtn");
    if (centerBtn) {
      centerBtn.addEventListener("click", () => {
        this.mapManager.centerMap();
      });
    }

    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.mapManager && this.mapManager.map) {
          this.mapManager.map.invalidateSize();
        }
      }, 250);
    });
  }

  /**
   * Configura los toggles de alcance (Local/Estatal)
   */
  setupAlcanceToggle() {
    const toggleLocal = document.getElementById('toggleLocal');
    const toggleEstatal = document.getElementById('toggleEstatal');

    if (!toggleLocal || !toggleEstatal) {
      console.warn('Toggles de alcance no encontrados');
      return;
    }

    // Evento para toggle Local
    toggleLocal.addEventListener('click', () => {
      toggleLocal.classList.toggle('active');
      this.showLocal = toggleLocal.classList.contains('active');
      this.onAlcanceChange();
    });

    // Evento para toggle Estatal
    toggleEstatal.addEventListener('click', () => {
      toggleEstatal.classList.toggle('active');
      this.showEstatal = toggleEstatal.classList.contains('active');
      this.onAlcanceChange();
    });

    // Inicializar visualización
    this.mapManager.actualizarVisualizacion(this.showLocal, this.showEstatal);
  }

  /**
   * Manejador de cambio de alcance
   */
  onAlcanceChange() {
    // Actualizar estado de toggles en FilterManager primero
    if (this.filterManager) {
      this.filterManager.setToggleState(this.showLocal, this.showEstatal);
    }

    // Actualizar visualización del mapa (controla visibilidad de capas y leyendas)
    this.mapManager.actualizarVisualizacion(this.showLocal, this.showEstatal);

    // Actualizar estadísticas
    this.updateStatsFromToggles();

    // Actualizar conteo de resultados
    this.updateFilterResultsCount();
  }

  /**
   * Actualiza las estadísticas según los toggles activos
   */
  updateStatsFromToggles() {
    let totalProyectos = 0;
    let totalAcciones = 0;
    let dependenciasSet = new Set();

    if (this.showLocal && this.data) {
      totalProyectos += this.data.total || 0;
      totalAcciones += this.data.metadata?.total_ubicaciones || 0;
      (this.data.metadata?.dependencias || []).forEach(d => dependenciasSet.add(d));
    }

    if (this.showEstatal && this.dataEstatal) {
      totalProyectos += this.dataEstatal.total || 0;
      totalAcciones += this.dataEstatal.metadata?.total_ubicaciones || 0;
      (this.dataEstatal.metadata?.dependencias || []).forEach(d => dependenciasSet.add(d));
    }

    // Si ninguno está activo, mostrar 0
    if (!this.showLocal && !this.showEstatal) {
      totalProyectos = 0;
      totalAcciones = 0;
    }

    this.updateStatElement("statTotal", totalProyectos);
    this.updateStatElement("statUbicaciones", totalAcciones);
    this.updateStatElement("statDependencias", dependenciasSet.size);
  }

  /**
   * Actualiza el conteo de resultados en filtros
   */
  updateFilterResultsCount() {
    let count = 0;

    // Si hay filterManager, obtener el conteo de marcadores visibles en el mapa
    if (this.filterManager) {
      if (this.showLocal) {
        count += this.mapManager.markers?.length || 0;
      }
      if (this.showEstatal) {
        count += this.mapManager.markersEstatal?.length || 0;
      }
    } else {
      // Fallback: usar datos sin filtrar
      if (this.showLocal) {
        count += this.markersData?.length || 0;
      }
      if (this.showEstatal) {
        count += this.markersDataEstatal?.length || 0;
      }
    }

    const element = document.getElementById('filterResultsCount');
    if (element) {
      element.textContent = count;
    }
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      if (show) {
        overlay.classList.remove("hidden");
      } else {
        overlay.classList.add("hidden");
      }
    }
  }

  /**
   * Muestra mensaje de error personalizado
   * @param {string} message - Mensaje de error
   */
  showError(message) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      let errorTitle = "Error al cargar datos";
      let errorMessage = message;
      let errorDetails = "";

      if (message.includes("502") || message.includes("Bad Gateway")) {
        errorTitle = "Servidor no disponible";
        errorMessage = "El servidor de datos está temporalmente fuera de servicio.";
        errorDetails = "Por favor, intenta de nuevo en unos minutos.";
      } else if (message.includes("Timeout") || message.includes("tiempo")) {
        errorTitle = "Conexión lenta";
        errorMessage = "La conexión está tardando más de lo esperado.";
        errorDetails = "Verifica tu conexión a internet e intenta de nuevo.";
      } else if (message.includes("Network") || message.includes("Failed to fetch")) {
        errorTitle = "Sin conexión";
        errorMessage = "No se pudo conectar al servidor.";
        errorDetails = "Verifica tu conexión a internet.";
      }

      overlay.innerHTML = `
        <div style="text-align: center; padding: 2rem; max-width: 400px; margin: 0 auto;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="margin: 1rem 0 0.5rem 0; color: #F44336; font-family: 'Montserrat', sans-serif; font-size: 20px;">
            ${errorTitle}
          </h3>
          <p style="margin: 0 0 0.5rem 0; color: #333; font-family: 'Open Sans', sans-serif; font-size: 14px;">
            ${errorMessage}
          </p>
          ${errorDetails ? `
            <p style="margin: 0; color: #666; font-family: 'Open Sans', sans-serif; font-size: 13px;">
              ${errorDetails}
            </p>
          ` : ''}
          <button onclick="location.reload()"
                  style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #5e3b8c; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600; font-size: 14px;">
            Reintentar
          </button>
        </div>
      `;
      overlay.classList.remove("hidden");
    }
  }

  destroy() {
    if (this.mapManager) {
      this.mapManager.destroy();
    }
    if (this.filterManager) {
      this.filterManager.destroy();
    }
    if (this.timelineManager) {
      this.timelineManager.destroy();
    }
    this.dataManager = null;
    this.filterManager = null;
    this.timelineManager = null;
    this.data = null;
    this.markersData = null;
    this.isInitialized = false;
  }
}

let app;

document.addEventListener("DOMContentLoaded", () => {
  app = new AccionesClimaticasApp();
  app.init();
});

window.addEventListener("beforeunload", () => {
  if (app) {
    app.destroy();
  }
});

if (typeof window !== "undefined") {
  window.AccionesApp = app;
}
