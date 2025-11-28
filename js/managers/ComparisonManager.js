/**
 * Gestor de comparación de capas
 * Maneja 3 modos de comparación: Split, Rayos X, y Área de Interés
 */

export class ComparisonManager {
  constructor(mapa, capaA, capaB, containerId) {
    this.mapa = mapa;
    this.capaA = capaA;
    this.capaB = capaB;
    this.containerId = containerId;
    this.modoActual = null;
    this.controlElement = null;

    this.splitBar = null;
    this.splitLabels = { left: null, right: null };
    this.splitListeners = { prerender: null, postrender: null };

    this.xrayCircle = null;
    this.xrayListeners = { mousemove: null, prerender: null, postrender: null };

    this.areaInteraction = null;
    this.drawLayer = null;
    this.areaListeners = { prerender: null, postrender: null };

    this.inicializar();
  }

  /**
   * Inicializa el control de comparación
   */
  inicializar() {
    this.crearControlUI();
  }

  /**
   * Crea la interfaz del control de comparación
   */
  crearControlUI() {
    const mapContainer = document.getElementById(this.containerId);
    if (!mapContainer) return;

    const controlDiv = document.createElement("div");
    controlDiv.className = "comparison-control";
    controlDiv.innerHTML = `
      <button class="comparison-toggle-btn" title="Comparar capas">
        <span class="comparison-icon">🔍</span>
        <span class="comparison-label">Comparar</span>
      </button>
      <div class="comparison-menu" style="display: none;">
        <button class="comparison-mode-btn" data-mode="split">
          <span class="mode-icon">⚡</span>
          <span class="mode-label">Split Vertical</span>
        </button>
        <button class="comparison-mode-btn" data-mode="xray">
          <span class="mode-icon">👁️</span>
          <span class="mode-label">Rayos X</span>
        </button>
        <button class="comparison-mode-btn" data-mode="area">
          <span class="mode-icon">📍</span>
          <span class="mode-label">Área de Interés</span>
        </button>
        <button class="comparison-mode-btn comparison-mode-close" data-mode="none">
          <span class="mode-icon">✕</span>
          <span class="mode-label">Cerrar</span>
        </button>
      </div>
    `;

    mapContainer.appendChild(controlDiv);
    this.controlElement = controlDiv;

    const toggleBtn = controlDiv.querySelector(".comparison-toggle-btn");
    const menu = controlDiv.querySelector(".comparison-menu");
    const modeButtons = controlDiv.querySelectorAll(".comparison-mode-btn");

    toggleBtn.addEventListener("click", () => {
      const isVisible = menu.style.display !== "none";
      menu.style.display = isVisible ? "none" : "block";
    });

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        this.activarModo(mode);
        menu.style.display = "none";

        if (mode !== "none") {
          toggleBtn.classList.add("active");
        } else {
          toggleBtn.classList.remove("active");
        }
      });
    });
  }

  /**
   * Activa un modo de comparación
   * @param {string} modo - Modo a activar (split, xray, area, none)
   */
  activarModo(modo) {
    this.desactivarModoActual();

    switch (modo) {
      case "split":
        this.activarSplitMode();
        break;
      case "xray":
        this.activarXRayMode();
        break;
      case "area":
        this.activarAreaMode();
        break;
      case "none":
        break;
    }

    this.modoActual = modo;
  }

  desactivarModoActual() {
    if (!this.modoActual) return;

    switch (this.modoActual) {
      case "split":
        this.desactivarSplitMode();
        break;
      case "xray":
        this.desactivarXRayMode();
        break;
      case "area":
        this.desactivarAreaMode();
        break;
    }

    this.capaA.setVisible(true);
    this.capaB.setVisible(true);
  }

  /**
   * Activa modo Split Vertical
   */
  activarSplitMode() {
    const mapContainer = document.getElementById(this.containerId);
    const mapElement = this.mapa.getTargetElement();

    const splitBar = document.createElement("div");
    splitBar.className = "comparison-split-bar";
    splitBar.style.left = "50%";
    mapContainer.appendChild(splitBar);
    this.splitBar = splitBar;

    const labelLeft = document.createElement("div");
    labelLeft.className = "comparison-split-label comparison-split-label-left";
    labelLeft.textContent = this.capaA.get("nombre") || "Capa A";
    mapContainer.appendChild(labelLeft);
    this.splitLabels.left = labelLeft;

    const labelRight = document.createElement("div");
    labelRight.className =
      "comparison-split-label comparison-split-label-right";
    labelRight.textContent = this.capaB.get("nombre") || "Capa B";
    mapContainer.appendChild(labelRight);
    this.splitLabels.right = labelRight;

    let isDragging = false;
    let currentPosition = 0.5;

    const prerenderFn = (event) => {
      const ctx = event.context;
      const width = ctx.canvas.width;
      const clipWidth = width * currentPosition;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipWidth, 0, width - clipWidth, ctx.canvas.height);
      ctx.clip();
    };

    const postrenderFn = (event) => {
      event.context.restore();
    };

    this.splitListeners.prerender = prerenderFn;
    this.splitListeners.postrender = postrenderFn;

    this.capaB.on("prerender", prerenderFn);
    this.capaB.on("postrender", postrenderFn);

    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      currentPosition = Math.max(0, Math.min(1, x / rect.width));

      splitBar.style.left = `${currentPosition * 100}%`;
      this.mapa.render();
    };

    const onMouseUp = (e) => {
      e.preventDefault();
      isDragging = false;
    };

    splitBar.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    this.splitBar._listeners = { onMouseDown, onMouseMove, onMouseUp };

    this.mapa.render();
  }

  desactivarSplitMode() {
    if (this.splitBar) {
      const { onMouseDown, onMouseMove, onMouseUp } = this.splitBar._listeners;
      this.splitBar.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      this.splitBar.remove();
      this.splitBar = null;
    }

    if (this.splitLabels.left) {
      this.splitLabels.left.remove();
      this.splitLabels.left = null;
    }
    if (this.splitLabels.right) {
      this.splitLabels.right.remove();
      this.splitLabels.right = null;
    }

    if (this.splitListeners.prerender) {
      this.capaB.un("prerender", this.splitListeners.prerender);
      this.splitListeners.prerender = null;
    }
    if (this.splitListeners.postrender) {
      this.capaB.un("postrender", this.splitListeners.postrender);
      this.splitListeners.postrender = null;
    }

    this.mapa.render();
  }

  /**
   * Activa modo Rayos X (Lupa)
   */
  activarXRayMode() {
    const mapContainer = document.getElementById(this.containerId);
    const radioLupa = 100;

    const xrayCircle = document.createElement("div");
    xrayCircle.className = "comparison-xray-circle";
    xrayCircle.style.display = "none";
    mapContainer.appendChild(xrayCircle);
    this.xrayCircle = xrayCircle;

    let mouseX = 0;
    let mouseY = 0;

    const prerenderFn = (event) => {
      const ctx = event.context;
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, radioLupa, 0, 2 * Math.PI);
      ctx.clip();
    };

    const postrenderFn = (event) => {
      event.context.restore();
    };

    this.xrayListeners.prerender = prerenderFn;
    this.xrayListeners.postrender = postrenderFn;

    this.capaB.on("prerender", prerenderFn);
    this.capaB.on("postrender", postrenderFn);

    const onMouseMove = (e) => {
      const rect = mapContainer.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      xrayCircle.style.display = "block";
      xrayCircle.style.left = `${mouseX - radioLupa}px`;
      xrayCircle.style.top = `${mouseY - radioLupa}px`;

      this.mapa.render();
    };

    this.xrayListeners.mousemove = onMouseMove;
    mapContainer.addEventListener("mousemove", onMouseMove);

    this.capaA.setVisible(true);
    this.capaB.setVisible(true);
  }

  desactivarXRayMode() {
    if (this.xrayCircle) {
      const mapContainer = document.getElementById(this.containerId);
      if (this.xrayListeners.mousemove) {
        mapContainer.removeEventListener(
          "mousemove",
          this.xrayListeners.mousemove
        );
        this.xrayListeners.mousemove = null;
      }
      this.xrayCircle.remove();
      this.xrayCircle = null;
    }

    if (this.xrayListeners.prerender) {
      this.capaB.un("prerender", this.xrayListeners.prerender);
      this.xrayListeners.prerender = null;
    }
    if (this.xrayListeners.postrender) {
      this.capaB.un("postrender", this.xrayListeners.postrender);
      this.xrayListeners.postrender = null;
    }

    this.mapa.render();
  }

  /**
   * Activa modo Área de Interés
   */
  activarAreaMode() {
    if (typeof ol === "undefined") {
      console.error("OpenLayers (ol) no está disponible");
      return;
    }

    const source = new ol.source.Vector();
    this.drawLayer = new ol.layer.Vector({
      source: source,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 255, 255, 0.1)",
        }),
        stroke: new ol.style.Stroke({
          color: "#3399CC",
          width: 2,
          lineDash: [5, 5],
        }),
      }),
      zIndex: 1000,
    });

    this.mapa.addLayer(this.drawLayer);

    this.areaInteraction = new ol.interaction.Draw({
      source: source,
      type: "Circle",
    });

    this.mapa.addInteraction(this.areaInteraction);

    this.areaInteraction.on("drawend", (event) => {
      const geometry = event.feature.getGeometry();
      const center = geometry.getCenter();
      const radius = geometry.getRadius();

      const prerenderFn = (evt) => {
        const ctx = evt.context;
        const pixel = this.mapa.getPixelFromCoordinate(center);
        const radiusPixels = radius / this.mapa.getView().getResolution();

        ctx.save();
        ctx.beginPath();
        ctx.arc(pixel[0], pixel[1], radiusPixels, 0, 2 * Math.PI);
        ctx.clip();
      };

      const postrenderFn = (evt) => {
        evt.context.restore();
      };

      this.areaListeners.prerender = prerenderFn;
      this.areaListeners.postrender = postrenderFn;

      this.capaB.on("prerender", prerenderFn);
      this.capaB.on("postrender", postrenderFn);

      this.mapa.render();

      this.mapa.removeInteraction(this.areaInteraction);
      this.areaInteraction = null;
    });
  }

  desactivarAreaMode() {
    if (this.areaInteraction) {
      this.mapa.removeInteraction(this.areaInteraction);
      this.areaInteraction = null;
    }

    if (this.drawLayer) {
      this.mapa.removeLayer(this.drawLayer);
      this.drawLayer = null;
    }

    if (this.areaListeners.prerender) {
      this.capaB.un("prerender", this.areaListeners.prerender);
      this.areaListeners.prerender = null;
    }
    if (this.areaListeners.postrender) {
      this.capaB.un("postrender", this.areaListeners.postrender);
      this.areaListeners.postrender = null;
    }

    this.mapa.render();
  }

  /**
   * Destruye el ComparisonManager y limpia recursos
   */
  destruir() {
    this.desactivarModoActual();

    if (this.controlElement) {
      this.controlElement.remove();
      this.controlElement = null;
    }
  }
}
