/**
 * Gestor de controles UI para herramientas de mapa
 * Maneja medición, exportar PNG, layer swipe y animaciones
 */

import {
  MeasurementTool,
  ExportTool,
  LayerSwipeTool,
  AnimationTool,
} from "../utils/MapTools.js";

export class MapControlsManager {
  constructor(map, mapId) {
    this.map = map;
    this.mapId = mapId;

    this.measurementTool = new MeasurementTool(map);
    this.exportTool = new ExportTool(map);
    this.animationTool = new AnimationTool(map);
    this.layerSwipeTool = null;

    this.herramientaActiva = null;
    this.modoMedicion = null;

    this.toolbar = null;
    this.botones = {};

    this.inicializar();
  }

  /**
   * Inicializa la barra de herramientas
   */
  inicializar() {
    this.crearToolbar();
    this.configurarMapControls();
    this.agregarEstilos();
  }

  /**
   * Crea la barra de herramientas en el mapa
   */
  crearToolbar() {
    const toolbarWrapper = document.createElement("div");
    toolbarWrapper.className = "map-toolbar-wrapper";
    toolbarWrapper.id = `toolbar-wrapper-${this.mapId}`;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toolbar-toggle-btn";
    toggleBtn.id = `toolbar-toggle-${this.mapId}`;
    toggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="12" cy="5" r="1"/>
        <circle cx="12" cy="19" r="1"/>
      </svg>
    `;
    toggleBtn.title = "Mostrar/ocultar herramientas";

    this.toolbar = document.createElement("div");
    this.toolbar.className = "map-toolbar";
    this.toolbar.id = `toolbar-${this.mapId}`;

    this.toolbar.innerHTML = `
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          id="btn-measure-distance-${this.mapId}"
          data-tool="measure-distance"
          title="Medir distancia">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21l18-18M9 21L21 9M15 6l3 3M6 15l3 3"/>
          </svg>
          <span class="toolbar-label">Distancia</span>
        </button>

        <button
          class="toolbar-btn"
          id="btn-measure-area-${this.mapId}"
          data-tool="measure-area"
          title="Medir área">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
          </svg>
          <span class="toolbar-label">Área</span>
        </button>

        <button
          class="toolbar-btn"
          id="btn-clear-measure-${this.mapId}"
          data-tool="clear-measure"
          title="Limpiar mediciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
          </svg>
          <span class="toolbar-label">Limpiar</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          id="btn-export-${this.mapId}"
          data-tool="export"
          title="Exportar como imagen"
          style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          <span class="toolbar-label">Exportar</span>
        </button>

        <button
          class="toolbar-btn"
          id="btn-swipe-${this.mapId}"
          data-tool="swipe"
          title="Comparar capas"
          style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          <span class="toolbar-label">Comparar</span>
        </button>
      </div>
    `;

    toolbarWrapper.appendChild(toggleBtn);
    toolbarWrapper.appendChild(this.toolbar);

    const viewport = this.map.getTargetElement();
    viewport.appendChild(toolbarWrapper);

    this.configurarEventos();
    this.configurarToggle(toggleBtn);
  }

  /**
   * Configura el botón de toggle para mostrar/ocultar toolbar
   */
  configurarToggle(toggleBtn) {
    let toolbarVisible = false;
    this.toolbar.classList.add("toolbar-hidden");
    toggleBtn.classList.add("toolbar-collapsed");

    toggleBtn.addEventListener("click", () => {
      toolbarVisible = !toolbarVisible;

      if (toolbarVisible) {
        this.toolbar.classList.remove("toolbar-hidden");
        toggleBtn.classList.remove("toolbar-collapsed");
      } else {
        this.toolbar.classList.add("toolbar-hidden");
        toggleBtn.classList.add("toolbar-collapsed");
      }
    });
  }

  /**
   * Configura el toggle para los controles de mapa existentes (.map-controls)
   */
  configurarMapControls() {
    const viewport = this.map.getTargetElement();
    const mapControls = viewport.querySelector(".map-controls");

    if (!mapControls) {
      return;
    }

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "map-controls-toggle-btn";
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    `;
    toggleBtn.title = "Ocultar controles de capas";

    mapControls.insertBefore(toggleBtn, mapControls.firstChild);

    let controlsVisible = true;

    toggleBtn.addEventListener("click", () => {
      controlsVisible = !controlsVisible;

      if (controlsVisible) {
        mapControls.classList.remove("map-controls-hidden");
        toggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        `;
        toggleBtn.title = "Ocultar controles de capas";
      } else {
        mapControls.classList.add("map-controls-hidden");
        toggleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z"/>
            <path d="M9 9h6v6H9z"/>
          </svg>
        `;
        toggleBtn.title = "Mostrar controles de capas";
      }
    });
  }

  /**
   * Configura los eventos de los botones
   */
  configurarEventos() {
    const btnDistance = document.getElementById(
      `btn-measure-distance-${this.mapId}`
    );
    btnDistance.addEventListener("click", () =>
      this.activarMedicionDistancia()
    );

    const btnArea = document.getElementById(`btn-measure-area-${this.mapId}`);
    btnArea.addEventListener("click", () => this.activarMedicionArea());

    const btnClear = document.getElementById(`btn-clear-measure-${this.mapId}`);
    btnClear.addEventListener("click", () => this.limpiarMediciones());

    const btnExport = document.getElementById(`btn-export-${this.mapId}`);
    btnExport.addEventListener("click", () => this.exportarMapa());

    const btnSwipe = document.getElementById(`btn-swipe-${this.mapId}`);
    if (btnSwipe) {
      btnSwipe.addEventListener("click", () => this.toggleSwipe());
    }

    this.botones = {
      distance: btnDistance,
      area: btnArea,
      clear: btnClear,
      export: btnExport,
      swipe: btnSwipe,
    };
  }

  /**
   * Activa medición de distancia
   */
  activarMedicionDistancia() {
    if (this.herramientaActiva === "measure-distance") {
      this.desactivarHerramienta();
      return;
    }

    this.desactivarHerramienta();

    this.measurementTool.medirDistancia();
    this.herramientaActiva = "measure-distance";
    this.modoMedicion = "distance";

    this.botones.distance.classList.add("active");
  }

  /**
   * Activa medición de área
   */
  activarMedicionArea() {
    if (this.herramientaActiva === "measure-area") {
      this.desactivarHerramienta();
      return;
    }

    this.desactivarHerramienta();

    this.measurementTool.medirArea();
    this.herramientaActiva = "measure-area";
    this.modoMedicion = "area";

    this.botones.area.classList.add("active");
  }

  limpiarMediciones() {
    this.measurementTool.limpiar();
    this.desactivarHerramienta();
  }

  /**
   * Exporta el mapa como PNG
   */
  exportarMapa() {
    const filename = `mapa-${this.mapId}-${Date.now()}`;

    this.botones.export.classList.add("loading");
    this.botones.export.disabled = true;

    this.mostrarNotificacion("Exportando mapa...", "info");

    this.exportTool.exportarPNG(filename);

    setTimeout(() => {
      this.botones.export.classList.remove("loading");
      this.botones.export.disabled = false;
      this.mostrarNotificacion("Mapa exportado correctamente", "success");
    }, 2000);
  }

  /**
   * Toggle del layer swipe
   */
  toggleSwipe() {
    if (!this.layerSwipeTool) {
      console.warn(
        "Layer Swipe no configurado. Usa configurarSwipe() primero."
      );
      return;
    }

    if (this.herramientaActiva === "swipe") {
      this.layerSwipeTool.desactivar();
      this.herramientaActiva = null;
      this.botones.swipe.classList.remove("active");
    } else {
      this.desactivarHerramienta();

      this.layerSwipeTool.activar();
      this.herramientaActiva = "swipe";
      this.botones.swipe.classList.add("active");
    }
  }

  /**
   * Configura el layer swipe con 2 capas
   * @param {ol.layer.Layer} capaIzquierda - Capa izquierda
   * @param {ol.layer.Layer} capaDerecha - Capa derecha
   */
  configurarSwipe(capaIzquierda, capaDerecha) {
    this.layerSwipeTool = new LayerSwipeTool(
      this.map,
      capaIzquierda,
      capaDerecha
    );

    if (this.botones.swipe) {
      this.botones.swipe.style.display = "flex";
    }
  }

  desactivarHerramienta() {
    if (!this.herramientaActiva) return;

    if (this.herramientaActiva.startsWith("measure")) {
      this.measurementTool.detener();
      this.botones.distance?.classList.remove("active");
      this.botones.area?.classList.remove("active");
    } else if (this.herramientaActiva === "swipe") {
      this.layerSwipeTool?.desactivar();
      this.botones.swipe?.classList.remove("active");
    }

    this.herramientaActiva = null;
    this.modoMedicion = null;
  }

  /**
   * Muestra una notificación temporal
   * @param {string} mensaje - Mensaje a mostrar
   * @param {string} tipo - Tipo de notificación (info, success, error)
   */
  mostrarNotificacion(mensaje, tipo = "info") {
    const notif = document.createElement("div");
    notif.className = `map-notification map-notification-${tipo}`;
    notif.textContent = mensaje;

    const viewport = this.map.getTargetElement();
    viewport.appendChild(notif);

    setTimeout(() => notif.classList.add("show"), 10);

    setTimeout(() => {
      notif.classList.remove("show");
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  /**
   * Anima el mapa hacia una ubicación
   * @param {Array<number>} centro - Coordenadas del centro
   * @param {number} zoom - Nivel de zoom
   * @param {number} duracion - Duración de la animación en ms
   */
  animarHacia(centro, zoom, duracion = 1000) {
    this.animationTool.volarHacia(centro, zoom, duracion);
  }

  /**
   * Limpia todas las herramientas
   */
  destruir() {
    this.desactivarHerramienta();

    this.measurementTool?.destruir();
    this.layerSwipeTool?.desactivar();

    if (this.toolbar && this.toolbar.parentNode) {
      this.toolbar.parentNode.removeChild(this.toolbar);
    }
  }

  /**
   * Agrega estilos CSS para la toolbar
   */
  agregarEstilos() {
    if (document.getElementById("map-toolbar-styles")) return;

    const style = document.createElement("style");
    style.id = "map-toolbar-styles";
    style.textContent = `
      .map-toolbar-wrapper {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 500;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .toolbar-toggle-btn {
        width: 40px;
        height: 40px;
        background: white;
        border: none;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        color: #333;
      }

      .toolbar-toggle-btn:hover {
        background: #f5f5f5;
        transform: scale(1.05);
      }

      .toolbar-toggle-btn.toolbar-collapsed {
        background: #A21A5C;
        color: white;
      }

      .toolbar-toggle-btn.toolbar-collapsed:hover {
        background: #8A1650;
      }

      .map-toolbar {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        opacity: 1;
        transform: translateX(0);
        max-height: 500px;
        overflow: hidden;
      }

      .map-toolbar.toolbar-hidden {
        opacity: 0;
        transform: translateX(-10px);
        max-height: 0;
        padding: 0;
        margin: 0;
      }

      .toolbar-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .toolbar-divider {
        height: 1px;
        background: #e0e0e0;
        margin: 4px 0;
      }

      .toolbar-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.85rem;
        color: #333;
        min-width: 120px;
      }

      .toolbar-btn:hover {
        background: #f5f5f5;
        transform: translateX(2px);
      }

      .toolbar-btn.active {
        background: #A21A5C;
        color: white;
      }

      .toolbar-btn.active:hover {
        background: #8A1650;
      }

      .toolbar-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .toolbar-btn.loading {
        position: relative;
        pointer-events: none;
      }

      .toolbar-btn.loading::after {
        content: '';
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 12px;
        height: 12px;
        border: 2px solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to { transform: translateY(-50%) rotate(360deg); }
      }

      .toolbar-btn svg {
        flex-shrink: 0;
      }

      .toolbar-label {
        font-weight: 500;
      }

      .ol-tooltip {
        position: relative;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 4px;
        color: white;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        pointer-events: none;
      }

      .ol-tooltip-measure {
        opacity: 1;
        font-weight: bold;
      }

      .ol-tooltip-static {
        background-color: #A21A5C;
        color: white;
        border: 2px solid white;
      }

      .ol-tooltip-measure:before,
      .ol-tooltip-static:before {
        border-top: 6px solid rgba(0, 0, 0, 0.8);
        border-right: 6px solid transparent;
        border-left: 6px solid transparent;
        content: "";
        position: absolute;
        bottom: -6px;
        margin-left: -6px;
        left: 50%;
      }

      .ol-tooltip-static:before {
        border-top-color: #A21A5C;
      }

      .layer-swipe-container {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        max-width: 400px;
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
      }

      .layer-swipe-range {
        width: 100%;
        height: 4px;
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(to right, #A21A5C 0%, #A21A5C 50%, #582574 50%, #582574 100%);
        cursor: pointer;
      }

      .layer-swipe-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        border: 3px solid #A21A5C;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      .layer-swipe-range::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        border: 3px solid #A21A5C;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }

      .layer-swipe-line {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 3px;
        background: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 999;
        transition: left 0.1s ease;
      }

      .layer-swipe-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .swipe-label-left {
        color: #A21A5C;
      }

      .swipe-label-right {
        color: #582574;
      }

      .map-notification {
        position: absolute;
        top: 20px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        font-size: 0.9rem;
        font-weight: 500;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        z-index: 1001;
        max-width: 300px;
      }

      .map-notification.show {
        opacity: 1;
        transform: translateY(0);
      }

      .map-notification-success {
        border-left: 4px solid #4CAF50;
        color: #2E7D32;
      }

      .map-notification-error {
        border-left: 4px solid #F44336;
        color: #C62828;
      }

      .map-notification-info {
        border-left: 4px solid #2196F3;
        color: #1565C0;
      }

      .map-controls-toggle-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: #666;
        padding: 0;
        z-index: 10;
      }

      .map-controls-toggle-btn:hover {
        background: #f5f5f5;
        color: #A21A5C;
      }

      .map-controls.map-controls-hidden .map-controls-title,
      .map-controls.map-controls-hidden .layer-control {
        display: none;
      }

      .map-controls.map-controls-hidden {
        padding: 8px;
        min-width: auto;
        width: 44px;
        height: 44px;
      }

      @media (max-width: 768px) {
        .map-toolbar {
          flex-direction: row;
          top: auto;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
        }

        .toolbar-group {
          flex-direction: row;
        }

        .toolbar-divider {
          width: 1px;
          height: auto;
          margin: 0 4px;
        }

        .toolbar-btn {
          min-width: auto;
          padding: 10px;
        }

        .toolbar-label {
          display: none;
        }

        .layer-swipe-container {
          width: 90%;
          bottom: 140px;
        }

      }
    `;

    document.head.appendChild(style);
  }

  obtenerMeasurementTool() {
    return this.measurementTool;
  }

  obtenerExportTool() {
    return this.exportTool;
  }

  obtenerAnimationTool() {
    return this.animationTool;
  }

  obtenerSwipeTool() {
    return this.layerSwipeTool;
  }
}
