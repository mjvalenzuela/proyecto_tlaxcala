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
    this.markersData = null;
    this.isInitialized = false;
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

      this.data = await this.dataManager.fetchData();

      if (!this.data || !this.data.acciones) {
        throw new Error("No se pudieron cargar los datos");
      }

      this.updateStats(this.data);

      PopupGenerator.setAccionesData(this.data.acciones);

      this.markersData = this.dataManager.processAccionesForMap(this.data);
      this.mapManager.addMarkers(this.markersData);

      this.initFilters();

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
      const stats = FilterManager.getFilterStats(this.data);
      const options = FilterManager.generateDropdownOptions(stats);

      this.populateDropdown('filterTipo', options.tipos);
      this.populateDropdown('filterDependencia', options.dependencias);
      this.populateDropdownWithLabels('filterEstado', options.estados);

      this.filterManager = new FilterManager(this.mapManager, this.data);
      this.filterManager.init(this.markersData);

      this.timelineManager = new TimelineManager(this.filterManager, this.data);
      this.timelineManager.init(this.markersData);

      window.timelineManager = this.timelineManager;

      this.filterManager.updateResultsCount(this.markersData.length);
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
