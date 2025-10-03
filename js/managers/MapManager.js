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
    
    // Crear capas (WMS o WFS)
    const capas = mapaConfig.capas.map(capaConfig => {
      if (capaConfig.tipo === 'wfs') {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

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
      layers: [capaBase, ...capas],
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
    
    // Crear capas (WMS o WFS)
    const capas = mapaConfig.capas.map(capaConfig => {
      if (capaConfig.tipo === 'wfs') {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

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
      layers: [capaBase, ...capas],
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
    this.capas[mapaId] = capas;
    this.overlays[mapaId] = overlay;

    // Configurar interacción de click para popup (WFS)
    this.configurarClickPopupWFS(mapa, overlay, capas);

    // Configurar controles de capas
    this.configurarControlesCapas(numeroCapitulo, capas);

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
   * Crea una capa WFS desde GeoServer
   */
  crearCapaWFS(capaConfig) {
    const url = capaConfig.url;
    const typeName = capaConfig.layers;

    // Crear source WFS
    const vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function(extent) {
        return `${url}?service=WFS&version=1.1.0&request=GetFeature&typename=${typeName}&outputFormat=application/json&srsname=EPSG:3857&bbox=${extent.join(',')},EPSG:3857`;
      },
      strategy: ol.loadingstrategy.bbox
    });

    // Estilo por defecto o personalizado
    const estilo = capaConfig.estilo ? this.crearEstiloWFS(capaConfig.estilo) : new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(80, 180, 152, 0.3)'
      }),
      stroke: new ol.style.Stroke({
        color: '#50B498',
        width: 2
      }),
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: '#50B498'
        }),
        stroke: new ol.style.Stroke({
          color: '#fff',
          width: 2
        })
      })
    });

    // Crear capa vectorial
    const capa = new ol.layer.Vector({
      source: vectorSource,
      style: estilo,
      visible: capaConfig.visible,
      zIndex: 2
    });

    // Agregar metadata a la capa
    capa.set('nombre', capaConfig.nombre);
    capa.set('layers', capaConfig.layers);
    capa.set('tipo', 'wfs');

    return capa;
  }

  /**
   * Crea un estilo personalizado para WFS
   */
  crearEstiloWFS(estiloConfig) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: estiloConfig.fillColor || 'rgba(80, 180, 152, 0.3)'
      }),
      stroke: new ol.style.Stroke({
        color: estiloConfig.strokeColor || '#50B498',
        width: estiloConfig.strokeWidth || 2
      }),
      image: new ol.style.Circle({
        radius: estiloConfig.pointRadius || 6,
        fill: new ol.style.Fill({
          color: estiloConfig.pointFillColor || '#50B498'
        }),
        stroke: new ol.style.Stroke({
          color: estiloConfig.pointStrokeColor || '#fff',
          width: estiloConfig.pointStrokeWidth || 2
        })
      })
    });
  }
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
    capa.set('tipo', 'wms');

    return capa;
  }

  /**
   * Configura el click en el mapa para mostrar popup con datos WFS
   */
  configurarClickPopupWFS(mapa, overlay, capas) {
    mapa.on('singleclick', (evt) => {
      // Buscar features en el punto clicado
      const features = [];
      
      mapa.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        // Solo procesar capas WFS visibles
        if (layer && layer.get('tipo') === 'wfs' && layer.getVisible()) {
          features.push({
            feature: feature,
            layer: layer
          });
        }
      });

      if (features.length > 0) {
        // Tomar el primer feature encontrado
        const { feature, layer } = features[0];
        const properties = feature.getProperties();
        
        // Construir contenido del popup
        let contenido = '<div class="popup-info">';
        contenido += `<p class="popup-layer-name"><strong>${layer.get('nombre')}</strong></p>`;
        
        for (const [key, value] of Object.entries(properties)) {
          // Omitir la geometría y propiedades internas
          if (key !== 'geometry' && !key.startsWith('_') && value !== null && value !== '') {
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
      } else {
        // Si no hay features, ocultar popup
        overlay.setPosition(undefined);
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
      const checkboxId = `layer-${index}-${numeroCapitulo}`;
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
      
      .popup-layer-name {
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--color-accent-green, #50B498);
        font-size: 1rem;
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