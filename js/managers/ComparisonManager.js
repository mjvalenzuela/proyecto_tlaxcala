/**
 * ComparisonManager - Gestor de comparación de capas
 * Maneja 3 modos de comparación: Split, Rayos X, y Área de Interés
 */

export class ComparisonManager {
  constructor(mapa, capaA, capaB, containerId) {
    this.mapa = mapa;
    this.capaA = capaA; // Capa 2021-2040
    this.capaB = capaB; // Capa 2041-2060
    this.containerId = containerId;
    this.modoActual = null;
    this.controlElement = null;

    // Referencias a los modos y sus listeners
    this.splitBar = null;
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
    //console.log('🔍 ComparisonManager inicializado');
  }

  /**
   * Crea la interfaz del control de comparación
   */
  crearControlUI() {
    const mapContainer = document.getElementById(this.containerId);
    if (!mapContainer) return;

    // Crear contenedor del control
    const controlDiv = document.createElement('div');
    controlDiv.className = 'comparison-control';
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

    // Event listeners
    const toggleBtn = controlDiv.querySelector('.comparison-toggle-btn');
    const menu = controlDiv.querySelector('.comparison-menu');
    const modeButtons = controlDiv.querySelectorAll('.comparison-mode-btn');

    toggleBtn.addEventListener('click', () => {
      const isVisible = menu.style.display !== 'none';
      menu.style.display = isVisible ? 'none' : 'block';
    });

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.activarModo(mode);
        menu.style.display = 'none';

        // Actualizar estado visual del botón
        if (mode !== 'none') {
          toggleBtn.classList.add('active');
        } else {
          toggleBtn.classList.remove('active');
        }
      });
    });

    //console.log('✅ Control de comparación creado');
  }

  /**
   * Activa un modo de comparación
   */
  activarModo(modo) {
    // Desactivar modo anterior
    this.desactivarModoActual();

    switch (modo) {
      case 'split':
        this.activarSplitMode();
        break;
      case 'xray':
        this.activarXRayMode();
        break;
      case 'area':
        this.activarAreaMode();
        break;
      case 'none':
        // Solo desactivar, ya se hizo arriba
        break;
    }

    this.modoActual = modo;
    //console.log(`🔄 Modo activado: ${modo}`);
  }

  /**
   * Desactiva el modo actual
   */
  desactivarModoActual() {
    if (!this.modoActual) return;

    switch (this.modoActual) {
      case 'split':
        this.desactivarSplitMode();
        break;
      case 'xray':
        this.desactivarXRayMode();
        break;
      case 'area':
        this.desactivarAreaMode();
        break;
    }

    // Restaurar visibilidad completa de ambas capas
    this.capaA.setVisible(true);
    this.capaB.setVisible(true);
  }

  /**
   * MODO 1: Split Vertical
   */
  activarSplitMode() {
    const mapContainer = document.getElementById(this.containerId);
    const mapElement = this.mapa.getTargetElement();

    // Crear barra divisoria
    const splitBar = document.createElement('div');
    splitBar.className = 'comparison-split-bar';
    splitBar.style.left = '50%';
    mapContainer.appendChild(splitBar);
    this.splitBar = splitBar;

    let isDragging = false;
    let currentPosition = 0.5; // 50%

    // Función de prerender para aplicar clip
    const prerenderFn = (event) => {
      const ctx = event.context;
      const width = ctx.canvas.width;
      const clipWidth = width * currentPosition;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipWidth, 0, width - clipWidth, ctx.canvas.height);
      ctx.clip();
    };

    // Función de postrender para restaurar contexto
    const postrenderFn = (event) => {
      event.context.restore();
    };

    // Guardar referencias a las funciones
    this.splitListeners.prerender = prerenderFn;
    this.splitListeners.postrender = postrenderFn;

    // Aplicar listeners
    this.capaB.on('prerender', prerenderFn);
    this.capaB.on('postrender', postrenderFn);

    // Event listeners para arrastrar
    const onMouseDown = () => {
      isDragging = true;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      currentPosition = Math.max(0, Math.min(1, x / rect.width));

      splitBar.style.left = `${currentPosition * 100}%`;
      this.mapa.render();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    splitBar.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Guardar referencias para limpiar después
    this.splitBar._listeners = { onMouseDown, onMouseMove, onMouseUp };

    // Render inicial
    this.mapa.render();

    //console.log('⚡ Modo Split activado - Arrastra la barra para comparar');
  }

  desactivarSplitMode() {
    if (this.splitBar) {
      // Remover event listeners
      const { onMouseDown, onMouseMove, onMouseUp } = this.splitBar._listeners;
      this.splitBar.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Remover elemento
      this.splitBar.remove();
      this.splitBar = null;
    }

    // Limpiar listeners de OpenLayers
    if (this.splitListeners.prerender) {
      this.capaB.un('prerender', this.splitListeners.prerender);
      this.splitListeners.prerender = null;
    }
    if (this.splitListeners.postrender) {
      this.capaB.un('postrender', this.splitListeners.postrender);
      this.splitListeners.postrender = null;
    }

    this.mapa.render();
  }

  /**
   * MODO 2: Rayos X (Lupa)
   */
  activarXRayMode() {
    const mapContainer = document.getElementById(this.containerId);
    const radioLupa = 100; // píxeles

    // Crear círculo de rayos X
    const xrayCircle = document.createElement('div');
    xrayCircle.className = 'comparison-xray-circle';
    xrayCircle.style.display = 'none'; // Oculto hasta que se mueva el mouse
    mapContainer.appendChild(xrayCircle);
    this.xrayCircle = xrayCircle;

    let mouseX = 0;
    let mouseY = 0;

    // Función de prerender para aplicar clip circular
    const prerenderFn = (event) => {
      const ctx = event.context;
      ctx.save();
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, radioLupa, 0, 2 * Math.PI);
      ctx.clip();
    };

    // Función de postrender para restaurar contexto
    const postrenderFn = (event) => {
      event.context.restore();
    };

    // Guardar referencias
    this.xrayListeners.prerender = prerenderFn;
    this.xrayListeners.postrender = postrenderFn;

    // Aplicar listeners a la capa B
    this.capaB.on('prerender', prerenderFn);
    this.capaB.on('postrender', postrenderFn);

    // Listener de movimiento del mouse
    const onMouseMove = (e) => {
      const rect = mapContainer.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Posicionar círculo visual
      xrayCircle.style.display = 'block';
      xrayCircle.style.left = `${mouseX - radioLupa}px`;
      xrayCircle.style.top = `${mouseY - radioLupa}px`;

      // Renderizar mapa
      this.mapa.render();
    };

    this.xrayListeners.mousemove = onMouseMove;
    mapContainer.addEventListener('mousemove', onMouseMove);

    // Hacer solo la capa A visible inicialmente
    this.capaA.setVisible(true);
    this.capaB.setVisible(true);

    //console.log('👁️ Modo Rayos X activado - Mueve el cursor sobre el mapa');
  }

  desactivarXRayMode() {
    if (this.xrayCircle) {
      const mapContainer = document.getElementById(this.containerId);
      if (this.xrayListeners.mousemove) {
        mapContainer.removeEventListener('mousemove', this.xrayListeners.mousemove);
        this.xrayListeners.mousemove = null;
      }
      this.xrayCircle.remove();
      this.xrayCircle = null;
    }

    // Limpiar listeners de OpenLayers
    if (this.xrayListeners.prerender) {
      this.capaB.un('prerender', this.xrayListeners.prerender);
      this.xrayListeners.prerender = null;
    }
    if (this.xrayListeners.postrender) {
      this.capaB.un('postrender', this.xrayListeners.postrender);
      this.xrayListeners.postrender = null;
    }

    this.mapa.render();
  }

  /**
   * MODO 3: Área de Interés
   */
  activarAreaMode() {
    // Verificar que ol esté disponible
    if (typeof ol === 'undefined') {
      console.error('❌ OpenLayers (ol) no está disponible');
      return;
    }

    // Crear capa para dibujar
    const source = new ol.source.Vector();
    this.drawLayer = new ol.layer.Vector({
      source: source,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.1)'
        }),
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 2,
          lineDash: [5, 5]
        })
      }),
      zIndex: 1000
    });

    this.mapa.addLayer(this.drawLayer);

    // Crear interacción de dibujo (círculo)
    this.areaInteraction = new ol.interaction.Draw({
      source: source,
      type: 'Circle'
    });

    this.mapa.addInteraction(this.areaInteraction);

    // Al terminar de dibujar, aplicar clip
    this.areaInteraction.on('drawend', (event) => {
      const geometry = event.feature.getGeometry();
      const center = geometry.getCenter();
      const radius = geometry.getRadius();

      // Función de prerender para aplicar clip circular
      const prerenderFn = (evt) => {
        const ctx = evt.context;
        const pixel = this.mapa.getPixelFromCoordinate(center);
        const radiusPixels = radius / this.mapa.getView().getResolution();

        ctx.save();
        ctx.beginPath();
        ctx.arc(pixel[0], pixel[1], radiusPixels, 0, 2 * Math.PI);
        ctx.clip();
      };

      // Función de postrender para restaurar contexto
      const postrenderFn = (evt) => {
        evt.context.restore();
      };

      // Guardar referencias
      this.areaListeners.prerender = prerenderFn;
      this.areaListeners.postrender = postrenderFn;

      // Aplicar listeners
      this.capaB.on('prerender', prerenderFn);
      this.capaB.on('postrender', postrenderFn);

      this.mapa.render();

      // Remover interacción después de dibujar
      this.mapa.removeInteraction(this.areaInteraction);
      this.areaInteraction = null;

      //console.log('✅ Área de interés dibujada - Capa B visible dentro del área');
    });

    //console.log('📍 Modo Área de Interés activado - Haz click y arrastra para dibujar un círculo');
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

    // Limpiar listeners de OpenLayers
    if (this.areaListeners.prerender) {
      this.capaB.un('prerender', this.areaListeners.prerender);
      this.areaListeners.prerender = null;
    }
    if (this.areaListeners.postrender) {
      this.capaB.un('postrender', this.areaListeners.postrender);
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

    //console.log('🧹 ComparisonManager destruido');
  }
}
