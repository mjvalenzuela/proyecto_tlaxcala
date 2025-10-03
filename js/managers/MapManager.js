/**
 * MapManager - Gestor de mapas con OpenLayers
 * Maneja la creación, actualización y control de mapas interactivos
 */

export class MapManager {
  constructor(config) {
    this.config = config;
    this.mapas = {}; // Almacena las instancias de mapas
    this.capas = {}; // Almacena las capas por mapa
    this.overlays = {}; // Almacena los overlays (popups)
  }

  /**
   * Inicializa el mapa inicial (portada)
   */
  inicializarMapaIntro(containerId) {
    const mapaConfig = this.config.mapaInicial;
    
    // Crear capa base
    const capaBase = this.crearCapaBase();
    
    // Crear capas WMS
    const capasWMS = mapaConfig.capas.map(capaConfig => 
      this.crearCapaWMS(capaConfig)
    );

    // Crear vista del mapa
    const vista = new ol.View({
      center: ol.proj.fromLonLat(mapaConfig.centro),
      zoom: mapaConfig.zoom,
      maxZoom: 18,
      minZoom: 8
    });

    // Crear mapa
    const mapa = new ol.Map({
      target: containerId,
      layers: [capaBase, ...capasWMS],
      view: vista,
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: true
      })
    });

    this.mapas['intro'] = mapa;
    
    return mapa;
  }

  /**
   * Inicializa un mapa para un capítulo específico
   */
  inicializarMapaCapitulo(containerId, capituloConfig, numeroCapitulo) {
    const mapaConfig = capituloConfig.mapa;
    
    // Crear capa base
    const capaBase = this.crearCapaBase();
    
    // Crear capas WMS
    const capasWMS = mapaConfig.capas.map(capaConfig => 
      this.crearCapaWMS(capaConfig)
    );

    // Crear vista del mapa
    const vista = new ol.View({
      center: ol.proj.fromLonLat(mapaConfig.centro),
      zoom: mapaConfig.zoom,
      maxZoom: 18,
      minZoom: 8
    });

    // Crear overlay para popup
    const popupElement = document.createElement('div');
    popupElement.className = 'ol-popup';
    popupElement.innerHTML = `
      <div class="ol-popup-closer" data-chapter="${numeroCapitulo}"></div>
      <div class="ol-popup-content"></div>
    `;

    const overlay = new ol.Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250
        }
      }
    });

    // Crear mapa
    const mapa = new ol.Map({
      target: containerId,
      layers: [capaBase, ...capasWMS],
      view: vista,
      overlays: [overlay],
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: true,
        rotate: false
      })
    });

    // Almacenar referencias
    const mapaId = `cap-${numeroCapitulo}`;
    this.mapas[mapaId] = mapa;
    this.capas[mapaId] = capasWMS;
    this.overlays[mapaId] = overlay;

    // Configurar interacción de click para popup
    this.configurarClickPopup(mapa, overlay, capasWMS);

    // Configurar controles de capas
    this.configurarControlesCapas(numeroCapitulo, capasWMS);

    return mapa;
  }

  /**
   * Crea la capa base de ESRI
   */
  crearCapaBase() {
    const url = this.config.mapaBase.url;
    
    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: url,
        attributions: '© Esri'
      }),
      zIndex: 0
    });
  }

  /**
   * Crea una capa WMS desde GeoServer
   */
  crearCapaWMS(capaConfig) {
    // Usar el proxy configurado
    const proxyUrl = this.config.proxy.url;
    const wmsUrl = `${proxyUrl}/Tlaxcala/wms`;

    const capa = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: wmsUrl,
        params: {
          'LAYERS': capaConfig.layers,
          'TILED': true,
          'VERSION': '1.1.0',
          'FORMAT': 'image/png',
          'TRANSPARENT': true
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
      }),
      visible: capaConfig.visible,
      zIndex: 1,
      opacity: 0.8
    });

    // Agregar metadata a la capa
    capa.set('nombre', capaConfig.nombre);
    capa.set('layers', capaConfig.layers);

    return capa;
  }

  /**
   * Configura el click en el mapa para mostrar popup con datos
   */
  configurarClickPopup(mapa, overlay, capas) {
    mapa.on('singleclick', async (evt) => {
      const viewResolution = mapa.getView().getResolution();
      
      // Obtener información de la primera capa visible
      const capaVisible = capas.find(capa => capa.getVisible());
      
      if (!capaVisible) return;

      const source = capaVisible.getSource();
      const url = source.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {
          'INFO_FORMAT': 'application/json',
          'FEATURE_COUNT': 1
        }
      );

      if (url) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const properties = data.features[0].properties;
            
            // Construir contenido del popup
            let contenido = '<div class="popup-info">';
            for (const [key, value] of Object.entries(properties)) {
              if (value !== null && value !== '') {
                contenido += `<p><strong>${key}:</strong> ${value}</p>`;
              }
            }
            contenido += '</div>';

            // Mostrar popup
            const popupContent = overlay.getElement().querySelector('.ol-popup-content');
            popupContent.innerHTML = contenido;
            overlay.setPosition(evt.coordinate);
            
            // Agregar estilos al popup si no existen
            this.agregarEstilosPopup();
          }
        } catch (error) {
          console.error('Error al obtener información de la capa:', error);
        }
      }
    });

    // Cerrar popup al hacer click en el botón cerrar
    overlay.getElement().querySelector('.ol-popup-closer').addEventListener('click', () => {
      overlay.setPosition(undefined);
    });

    // Cambiar cursor al pasar sobre features
    mapa.on('pointermove', (evt) => {
      const pixel = mapa.getEventPixel(evt.originalEvent);
      const hit = mapa.hasFeatureAtPixel(pixel);
      mapa.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });
  }

  /**
   * Configura los controles de visibilidad de capas
   */
  configurarControlesCapas(numeroCapitulo, capas) {
    capas.forEach((capa, index) => {
      const checkboxId = `layer-municipios-${numeroCapitulo}`;
      const checkbox = document.getElementById(checkboxId);
      
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          capa.setVisible(e.target.checked);
        });
      }
    });
  }

  /**
   * Actualiza el centro y zoom de un mapa
   */
  actualizarVistaMapa(mapaId, centro, zoom, duracion = 1000) {
    const mapa = this.mapas[mapaId];
    if (!mapa) return;

    const vista = mapa.getView();
    vista.animate({
      center: ol.proj.fromLonLat(centro),
      zoom: zoom,
      duration: duracion
    });
  }

  /**
   * Cambia la visibilidad de una capa
   */
  toggleCapa(mapaId, nombreCapa, visible) {
    const capas = this.capas[mapaId];
    if (!capas) return;

    const capa = capas.find(c => c.get('nombre') === nombreCapa);
    if (capa) {
      capa.setVisible(visible);
    }
  }

  /**
   * Actualiza el tamaño del mapa (útil al cambiar de capítulo)
   */
  actualizarTamano(mapaId) {
    const mapa = this.mapas[mapaId];
    if (mapa) {
      setTimeout(() => {
        mapa.updateSize();
      }, 100);
    }
  }

  /**
   * Limpia un mapa específico
   */
  limpiarMapa(mapaId) {
    const mapa = this.mapas[mapaId];
    if (mapa) {
      mapa.setTarget(null);
      delete this.mapas[mapaId];
      delete this.capas[mapaId];
      delete this.overlays[mapaId];
    }
  }

  /**
   * Agrega estilos CSS para el popup (se ejecuta una sola vez)
   */
  agregarEstilosPopup() {
    if (document.getElementById('popup-styles')) return;

    const style = document.createElement('style');
    style.id = 'popup-styles';
    style.textContent = `
      .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #ccc;
        bottom: 12px;
        left: -50px;
        min-width: 200px;
        max-width: 300px;
        z-index: 1000;
      }
      
      .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      
      .ol-popup:before {
        border-top-color: #ccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
      
      .ol-popup-closer {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        cursor: pointer;
      }
      
      .ol-popup-closer:after {
        content: "✕";
        font-size: 16px;
        color: #666;
      }
      
      .ol-popup-closer:hover:after {
        color: #333;
      }
      
      .popup-info p {
        margin: 5px 0;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .popup-info strong {
        color: var(--color-primary, #2563eb);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Obtiene un mapa por su ID
   */
  obtenerMapa(mapaId) {
    return this.mapas[mapaId];
  }
}