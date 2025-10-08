/**
 * MapManager - Gestor de mapas con OpenLayers (ACTUALIZADO)
 * Maneja la creación, actualización y control de mapas interactivos
 * INCLUYE: Integración con MapControlsManager para herramientas
 */

import { MapControlsManager } from "./MapControlsManager.js";

export class MapManager {
  constructor(config) {
    this.config = config;
    this.mapas = {};
    this.capas = {};
    this.overlays = {};
    this.controlsManagers = {}; // ← NUEVO: Gestores de controles de herramientas
  }

  /**
   * Inicializa el mapa inicial (portada)
   */
  inicializarMapaIntro(containerId) {
    const mapaConfig = this.config.mapaInicial;

    const capaBase = this.crearCapaBase();

    const capas = mapaConfig.capas.map((capaConfig) => {
      if (capaConfig.tipo === "wfs") {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

    const vista = new ol.View({
      center: ol.proj.fromLonLat(mapaConfig.centro),
      zoom: mapaConfig.zoom,
      maxZoom: 18,
      minZoom: 8,
    });

    const mapa = new ol.Map({
      target: containerId,
      layers: [capaBase, ...capas],
      view: vista,
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: true,
      }),
    });

    this.mapas["intro"] = mapa;

    return mapa;
  }

  /**
   * Inicializa un mapa para un capítulo específico
   */
  inicializarMapaCapitulo(containerId, capituloConfig, numeroCapitulo) {
    const mapaConfig = capituloConfig.mapa;

    const capaBase = this.crearCapaBase();

    const capas = mapaConfig.capas.map((capaConfig) => {
      if (capaConfig.tipo === "wfs") {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

    const vista = new ol.View({
      center: ol.proj.fromLonLat(mapaConfig.centro),
      zoom: mapaConfig.zoom,
      maxZoom: 18,
      minZoom: 8,
    });

    const popupElement = document.createElement("div");
    popupElement.className = "ol-popup";
    popupElement.innerHTML = `
      <div class="ol-popup-closer" data-chapter="${numeroCapitulo}"></div>
      <div class="ol-popup-content"></div>
    `;

    const overlay = new ol.Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    const mapa = new ol.Map({
      target: containerId,
      layers: [capaBase, ...capas],
      view: vista,
      overlays: [overlay],
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: true,
        rotate: false,
      }),
    });

    const mapaId = `cap-${numeroCapitulo}`;
    this.mapas[mapaId] = mapa;
    this.capas[mapaId] = capas;
    this.overlays[mapaId] = overlay;

    this.configurarClickPopupWFS(mapa, overlay, capas);
    this.configurarControlesCapas(numeroCapitulo, capas);

    // ⬇️ NUEVO: Inicializar controles de herramientas
    this.inicializarControles(mapaId, mapa);

    return mapa;
  }

  /**
   * ⬇️ NUEVO: Inicializa los controles de herramientas para un mapa
   */
  inicializarControles(mapaId, mapa) {
    try {
      const controlsManager = new MapControlsManager(mapa, mapaId);
      this.controlsManagers[mapaId] = controlsManager;

      //console.log(`🛠️ Controles de herramientas inicializados para ${mapaId}`);
    } catch (error) {
      console.error(`Error al inicializar controles para ${mapaId}:`, error);
    }
  }

  /**
   * ⬇️ NUEVO: Obtiene el gestor de controles de un mapa
   */
  obtenerControles(mapaId) {
    return this.controlsManagers[mapaId];
  }

  /**
   * Crea la capa base de ESRI
   */
  crearCapaBase() {
    const url = this.config.mapaBase.url;

    return new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: url,
        attributions: "© Esri",
      }),
      zIndex: 0,
    });
  }

  /**
   * Crea una capa WFS desde GeoServer
   */
  crearCapaWFS(capaConfig) {
    const proxyBase = this.config.proxy.url;
    const typeName = capaConfig.layers;

    // Extraer workspace
    const layerParts = typeName.split(":");
    const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

    // Detectar si estamos usando proxy de Vercel o proxy local
    const isVercelProxy = proxyBase.includes("proxy?path=");

    console.log(`📍 Creando capa WFS: ${capaConfig.nombre}`);
    console.log(`   - Workspace: ${workspace}`);
    console.log(`   - TypeName: ${typeName}`);
    console.log(
      `   - Proxy type: ${
        isVercelProxy ? "Vercel Serverless" : "Local/Directo"
      }`
    );

    const vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function (extent) {
        // Construir los parámetros WFS
        const params = new URLSearchParams({
          service: "WFS",
          version: "1.0.0", // ✅ Usar 1.0.0 como en las URLs de previsualización
          request: "GetFeature",
          typeName: typeName,
          outputFormat: "application/json",
          srsname: "EPSG:3857",
          bbox: `${extent.join(",")},EPSG:3857`,
        });

        const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;

        // Construir URL según el tipo de proxy
        if (isVercelProxy) {
          // Para Vercel: URL-encode todo el path
          const encodedPath = encodeURIComponent(wfsPath);
          return `${proxyBase.replace("?path=", "")}?path=${encodedPath}`;
        } else {
          // Para local: concatenar directamente
          return `${proxyBase}${wfsPath}`;
        }
      },
      strategy: ol.loadingstrategy.bbox,
    });

    const estilo = capaConfig.estilo
      ? this.crearEstiloWFS(capaConfig.estilo)
      : new ol.style.Style({
          fill: new ol.style.Fill({
            color: "rgba(80, 180, 152, 0.3)",
          }),
          stroke: new ol.style.Stroke({
            color: "#50B498",
            width: 2,
          }),
          image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
              color: "#50B498",
            }),
            stroke: new ol.style.Stroke({
              color: "#fff",
              width: 2,
            }),
          }),
        });

    const capa = new ol.layer.Vector({
      source: vectorSource,
      style: estilo,
      visible: capaConfig.visible,
      zIndex: 2,
    });

    capa.set("nombre", capaConfig.nombre);
    capa.set("layers", capaConfig.layers);
    capa.set("tipo", "wfs");

    return capa;
  }

  /**
   * Crea un estilo personalizado para WFS
   */
  crearEstiloWFS(estiloConfig) {
    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: estiloConfig.fillColor || "rgba(80, 180, 152, 0.3)",
      }),
      stroke: new ol.style.Stroke({
        color: estiloConfig.strokeColor || "#50B498",
        width: estiloConfig.strokeWidth || 2,
      }),
      image: new ol.style.Circle({
        radius: estiloConfig.pointRadius || 6,
        fill: new ol.style.Fill({
          color: estiloConfig.pointFillColor || "#50B498",
        }),
        stroke: new ol.style.Stroke({
          color: estiloConfig.pointStrokeColor || "#fff",
          width: estiloConfig.pointStrokeWidth || 2,
        }),
      }),
    });
  }

  /**
   * Crea una capa WMS desde GeoServer
   */
  crearCapaWMS(capaConfig) {
    // Extraer el workspace del layers (ej: "SEICCT:Limite" -> "SEICCT")
    const layerParts = capaConfig.layers.split(":");
    const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

    // Detectar si estamos usando proxy de Vercel o proxy local
    const proxyBase = this.config.proxy.url;
    const isVercelProxy = proxyBase.includes("proxy?path=");

    // Construir URL WMS según el tipo de proxy
    let wmsUrl;
    if (isVercelProxy) {
      // Para Vercel: necesitamos una función loader personalizada
      // porque OpenLayers no puede URL-encode automáticamente
      const basePath = `/geoserver/${workspace}/wms`;

      // WMS requiere un loader personalizado para Vercel
      const capa = new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: `${proxyBase.replace("?path=", "")}`, // Base del proxy sin ?path=
          params: {
            LAYERS: capaConfig.layers,
            TILED: true,
            VERSION: "1.1.0",
            FORMAT: "image/png",
            TRANSPARENT: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
          // ✅ Loader personalizado para construir URLs correctas
          tileLoadFunction: function (imageTile, src) {
            // Extraer solo los parámetros de la URL
            const url = new URL(src, window.location.origin);
            const params = url.searchParams.toString();

            // Construir path completo
            const fullPath = `${basePath}?${params}`;

            // URL-encode el path para Vercel
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyBase.replace(
              "?path=",
              ""
            )}?path=${encodedPath}`;

            imageTile.getImage().src = finalUrl;
          },
        }),
        visible: capaConfig.visible,
        zIndex: 1,
        opacity: 0.8,
      });

      capa.set("nombre", capaConfig.nombre);
      capa.set("layers", capaConfig.layers);
      capa.set("tipo", "wms");
      capa.set("workspace", workspace);

      return capa;
    } else {
      // Para local o directo: concatenar directamente
      wmsUrl = `${proxyBase}/${workspace}/wms`;
    }
  }

  /**
   * Configura el click en el mapa para mostrar popup con datos WFS
   */
  configurarClickPopupWFS(mapa, overlay, capas) {
    mapa.on("singleclick", (evt) => {
      const features = [];

      mapa.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (layer && layer.get("tipo") === "wfs" && layer.getVisible()) {
          features.push({
            feature: feature,
            layer: layer,
          });
        }
      });

      if (features.length > 0) {
        const firstItem = features[0];
        const feature = firstItem.feature;
        const layer = firstItem.layer;
        const properties = feature.getProperties();

        let contenido = '<div class="popup-info">';
        contenido += `<p class="popup-layer-name"><strong>${layer.get(
          "nombre"
        )}</strong></p>`;

        for (const key in properties) {
          const value = properties[key];
          if (
            key !== "geometry" &&
            !key.startsWith("_") &&
            value !== null &&
            value !== ""
          ) {
            contenido += `<p><strong>${key}:</strong> ${value}</p>`;
          }
        }
        contenido += "</div>";

        const popupContent = overlay
          .getElement()
          .querySelector(".ol-popup-content");
        popupContent.innerHTML = contenido;
        overlay.setPosition(evt.coordinate);

        this.agregarEstilosPopup();
      } else {
        overlay.setPosition(undefined);
      }
    });

    overlay
      .getElement()
      .querySelector(".ol-popup-closer")
      .addEventListener("click", () => {
        overlay.setPosition(undefined);
      });

    mapa.on("pointermove", (evt) => {
      const pixel = mapa.getEventPixel(evt.originalEvent);
      const hit = mapa.hasFeatureAtPixel(pixel);
      mapa.getTargetElement().style.cursor = hit ? "pointer" : "";
    });
  }

  /**
   * Configura los controles de visibilidad de capas
   */
  configurarControlesCapas(numeroCapitulo, capas) {
    for (let i = 0; i < capas.length; i++) {
      const capa = capas[i];
      const checkboxId = `layer-${i}-${numeroCapitulo}`;
      const checkbox = document.getElementById(checkboxId);

      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          capa.setVisible(e.target.checked);
        });
      }
    }
  }

  /**
   * Actualiza el centro y zoom de un mapa CON ANIMACIÓN
   * MODIFICADO: Ahora usa la herramienta de animación si está disponible
   */
  actualizarVistaMapa(mapaId, centro, zoom, duracion = 1000) {
    const controlsManager = this.controlsManagers[mapaId];

    if (controlsManager) {
      // ⬇️ NUEVO: Usar la herramienta de animación
      controlsManager.animarHacia(centro, zoom, duracion);
    } else {
      // Fallback al método anterior
      const mapa = this.mapas[mapaId];
      if (!mapa) return;

      const vista = mapa.getView();
      vista.animate({
        center: ol.proj.fromLonLat(centro),
        zoom: zoom,
        duration: duracion,
      });
    }
  }

  /**
   * Cambia la visibilidad de una capa
   */
  toggleCapa(mapaId, nombreCapa, visible) {
    const capas = this.capas[mapaId];
    if (!capas) return;

    for (let i = 0; i < capas.length; i++) {
      const capa = capas[i];
      if (capa.get("nombre") === nombreCapa) {
        capa.setVisible(visible);
        break;
      }
    }
  }

  /**
   * Actualiza el tamaño del mapa
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
   * MODIFICADO: Ahora también limpia los controles de herramientas
   */
  limpiarMapa(mapaId) {
    // ⬇️ NUEVO: Destruir controles antes de limpiar el mapa
    const controlsManager = this.controlsManagers[mapaId];
    if (controlsManager) {
      controlsManager.destruir();
      delete this.controlsManagers[mapaId];
    }

    const mapa = this.mapas[mapaId];
    if (mapa) {
      mapa.setTarget(null);
      delete this.mapas[mapaId];
      delete this.capas[mapaId];
      delete this.overlays[mapaId];
    }
  }

  /**
   * Agrega estilos CSS para el popup
   */
  agregarEstilosPopup() {
    if (document.getElementById("popup-styles")) return;

    const style = document.createElement("style");
    style.id = "popup-styles";
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
        color: var(--color-accent-green, #50B498);
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

  /**
   * ⬇️ NUEVO: Obtiene todas las capas de un mapa por nombre
   */
  obtenerCapaPorNombre(mapaId, nombreCapa) {
    const capas = this.capas[mapaId];
    if (!capas) return null;

    return capas.find((capa) => capa.get("nombre") === nombreCapa);
  }

  /**
   * ⬇️ NUEVO: Configura layer swipe para un mapa específico
   */
  configurarSwipe(mapaId, nombreCapaIzq, nombreCapaDer) {
    const controlsManager = this.controlsManagers[mapaId];
    if (!controlsManager) {
      console.warn(`⚠️ No hay controles inicializados para ${mapaId}`);
      return false;
    }

    const capaIzq = this.obtenerCapaPorNombre(mapaId, nombreCapaIzq);
    const capaDer = this.obtenerCapaPorNombre(mapaId, nombreCapaDer);

    if (!capaIzq || !capaDer) {
      console.warn(
        `⚠️ No se encontraron las capas: ${nombreCapaIzq}, ${nombreCapaDer}`
      );
      return false;
    }

    controlsManager.configurarSwipe(capaIzq, capaDer);
    return true;
  }
}
