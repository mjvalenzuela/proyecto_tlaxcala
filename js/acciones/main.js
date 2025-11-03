/**
 * Archivo principal - Inicialización y orquestación
 */

class AccionesClimaticasApp {
  constructor() {
    this.dataManager = null;
    this.mapManager = null;
    this.data = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa la aplicación
   */
  async init() {
    try {
      //console.log('Iniciando aplicación Acciones Climáticas...');

      // Inicializar managers
      this.dataManager = new DataManager();
      this.mapManager = new MapManager('map');

      // Inicializar el mapa
      const mapInitialized = this.mapManager.initMap();
      if (!mapInitialized) {
        throw new Error('Error al inicializar el mapa');
      }

      // Cargar datos
      await this.loadData();

      // Configurar event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      //console.log('Aplicación inicializada correctamente');

    } catch (error) {
      console.error('Error al inicializar aplicación:', error);
      this.showError(error.message);
    }
  }

  /**
   * Carga los datos del API
   */
  async loadData() {
    try {
      this.showLoading(true);

      // Fetch datos
      this.data = await this.dataManager.fetchData();

      if (!this.data || !this.data.acciones) {
        throw new Error('No se pudieron cargar los datos');
      }

      //console.log(`${this.data.total} acciones cargadas`);

      // Actualizar estadísticas en el header
      this.updateStats(this.data);

      // Procesar y agregar markers al mapa
      const markers = this.dataManager.processAccionesForMap(this.data);
      this.mapManager.addMarkers(markers);

      // Ajustar vista para mostrar todos los markers
      setTimeout(() => {
        this.mapManager.fitBounds();
      }, 300);

      this.showLoading(false);

    } catch (error) {
      this.showLoading(false);
      throw error;
    }
  }

  /**
   * Actualiza las estadísticas en el header
   */
  updateStats(data) {
    const stats = this.dataManager.getStats(data);

    if (stats) {
      this.updateStatElement('statTotal', stats.total);
      this.updateStatElement('statUbicaciones', stats.ubicaciones);
      this.updateStatElement('statDependencias', stats.dependencias);
    }
  }

  /**
   * Actualiza un elemento de estadística
   */
  updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      // Animación de conteo
      this.animateValue(element, 0, value, 1000);
    }
  }

  /**
   * Anima el valor de un contador
   */
  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
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
   * Configura event listeners
   */
  setupEventListeners() {
    // Botón de centrar mapa
    const centerBtn = document.getElementById('centerMapBtn');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        this.mapManager.centerMap();
      });
    }

    // Detectar cambios en el tamaño de la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.mapManager && this.mapManager.map) {
          this.mapManager.map.invalidateSize();
        }
      }, 250);
    });
  }

  /**
   * Muestra u oculta el loading overlay
   */
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      if (show) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    }
  }

  /**
   * Muestra un mensaje de error
   */
  showError(message) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#F44336" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="margin: 1rem 0 0.5rem 0; color: #F44336; font-family: 'Montserrat', sans-serif;">
            Error al cargar datos
          </h3>
          <p style="margin: 0; color: #666; font-family: 'Open Sans', sans-serif;">
            ${message}
          </p>
          <button onclick="location.reload()"
                  style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #5e3b8c; color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Montserrat', sans-serif; font-weight: 600;">
            Reintentar
          </button>
        </div>
      `;
      overlay.classList.remove('hidden');
    }
  }

  /**
   * Limpia recursos (cleanup)
   */
  destroy() {
    if (this.mapManager) {
      this.mapManager.destroy();
    }
    this.dataManager = null;
    this.data = null;
    this.isInitialized = false;
  }
}

// Inicializar la aplicación cuando el DOM esté listo
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new AccionesClimaticasApp();
  app.init();
});

// Cleanup al salir de la página
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});

// Hacer la app disponible globalmente para debugging
if (typeof window !== 'undefined') {
  window.AccionesApp = app;
}
