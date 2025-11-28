import { MapControlsManager } from "./MapControlsManager.js";
import { ComparisonManager } from "./ComparisonManager.js";

/**
 * Gestor central de mapas OpenLayers.
 * Maneja creación, capas WMS/WFS, popups, hover y comparaciones.
 */
export class MapManager {
  constructor(config) {
    this.config = config;
    this.mapas = {};
    this.capas = {};
    this.overlays = {};
    this.controlsManagers = {};
    this.comparisonManagers = {};
    this.hoverListeners = {};
  }

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
   * Inicializa un mapa para un capítulo con sus capas, popup y controles.
   */
  inicializarMapaCapitulo(containerId, capituloConfig, numeroCapitulo) {
    const mapaConfig = capituloConfig.mapa;

    const mapaId = `cap-${numeroCapitulo.toString().replace(".", "-")}`;

    const container = document.getElementById(containerId);
    if (!container) {
      return null;
    }

    if (
      (!mapaConfig.capas || mapaConfig.capas.length === 0) &&
      !capituloConfig.modelosClimaticos
    ) {
      return null;
    }

    if (this.mapas[mapaId]) {
      this.limpiarMapa(mapaId);
    }

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
      <a href="#" class="ol-popup-closer"></a>
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

    this.mapas[mapaId] = mapa;
    this.capas[mapaId] = capas;
    this.overlays[mapaId] = overlay;

    this.configurarClickPopupWFS(mapa, overlay, capas);

    this.generarLeyendaDinamica(containerId, capas, numeroCapitulo);

    this.configurarControlesCapas(numeroCapitulo, capas);

    this.inicializarControles(mapaId, mapa);

    return mapa;
  }

  inicializarControles(mapaId, mapa) {
    try {
      const controlsManager = new MapControlsManager(mapa, mapaId);
      this.controlsManagers[mapaId] = controlsManager;
    } catch (error) {
      console.error(`Error al inicializar controles para ${mapaId}:`, error);
    }
  }

  obtenerControles(mapaId) {
    return this.controlsManagers[mapaId];
  }

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
   * Crea una capa WFS vectorial desde GeoServer con soporte para proxy Vercel/local.
   */
  crearCapaWFS(capaConfig) {
    const proxyBase = this.config.proxy.url;
    const typeName = capaConfig.layers;

    const layerParts = typeName.split(":");
    const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

    const isVercelProxy = proxyBase.includes("proxy?path=");

    const vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function (extent) {
        const params = new URLSearchParams({
          service: "WFS",
          version: "1.0.0",
          request: "GetFeature",
          typeName: typeName,
          outputFormat: "application/json",
          srsname: "EPSG:3857",
          bbox: `${extent.join(",")},EPSG:3857`,
        });

        if (isVercelProxy) {
          const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;
          const encodedPath = encodeURIComponent(wfsPath);
          return `${proxyBase.replace("?path=", "")}?path=${encodedPath}`;
        } else {
          const wfsPath = `/${workspace}/ows?${params.toString()}`;
          return `${proxyBase}${wfsPath}`;
        }
      },
      strategy: ol.loadingstrategy.bbox,
    });

    let estilo;
    if (capaConfig.transparente) {
      estilo = new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 0, 0)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)",
          width: 0,
        }),
      });
    } else if (capaConfig.estilo) {
      estilo = this.crearEstiloWFS(capaConfig.estilo);
    } else {
      estilo = new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(162, 26, 92, 0.3)",
        }),
        stroke: new ol.style.Stroke({
          color: "#A21A5C",
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: "#A21A5C",
          }),
          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      });
    }

    const capa = new ol.layer.Vector({
      source: vectorSource,
      style: estilo,
      visible: capaConfig.visible,
      zIndex: 3,
    });

    capa.set("nombre", capaConfig.nombre);
    capa.set("layers", capaConfig.layers);
    capa.set("tipo", "wfs");

    return capa;
  }

  crearEstiloWFS(estiloConfig) {
    if (
      estiloConfig.tipo === "clasificado" &&
      estiloConfig.atributo &&
      estiloConfig.rangos
    ) {
      return (feature) => {
        const valor = feature.get(estiloConfig.atributo);

        let colorFill =
          estiloConfig.colorPorDefecto || "rgba(200, 200, 200, 0.5)";

        for (const rango of estiloConfig.rangos) {
          if (valor >= rango.min && valor <= rango.max) {
            colorFill = rango.color;
            break;
          }
        }

        return new ol.style.Style({
          fill: new ol.style.Fill({
            color: colorFill,
          }),
          stroke: new ol.style.Stroke({
            color: estiloConfig.strokeColor || "#333333",
            width: estiloConfig.strokeWidth || 1,
          }),
        });
      };
    }

    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: estiloConfig.fillColor || "rgba(162, 26, 92, 0.3)",
      }),
      stroke: new ol.style.Stroke({
        color: estiloConfig.strokeColor || "#A21A5C",
        width: estiloConfig.strokeWidth || 2,
      }),
      image: new ol.style.Circle({
        radius: estiloConfig.pointRadius || 6,
        fill: new ol.style.Fill({
          color: estiloConfig.pointFillColor || "#A21A5C",
        }),
        stroke: new ol.style.Stroke({
          color: estiloConfig.pointStrokeColor || "#fff",
          width: estiloConfig.pointStrokeWidth || 2,
        }),
      }),
    });
  }

  /**
   * Crea una capa WMS desde GeoServer con soporte para proxy Vercel/local.
   */
  crearCapaWMS(capaConfig) {
    const layerParts = capaConfig.layers.split(":");
    const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

    const proxyBase = this.config.proxy.url;
    const isVercelProxy = proxyBase.includes("proxy?path=");

    let wmsUrl;
    if (isVercelProxy) {
      const basePath = `/geoserver/${workspace}/wms`;

      const capa = new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: `${proxyBase.replace("?path=", "")}`,
          params: {
            LAYERS: capaConfig.layers,
            TILED: true,
            VERSION: "1.1.0",
            FORMAT: "image/png",
            TRANSPARENT: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
          tileLoadFunction: function (imageTile, src) {
            const url = new URL(src, window.location.origin);
            const params = url.searchParams.toString();

            const fullPath = `${basePath}?${params}`;

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
      wmsUrl = `${proxyBase}/${workspace}/wms`;

      const capa = new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: wmsUrl,
          params: {
            LAYERS: capaConfig.layers,
            TILED: true,
            VERSION: "1.1.0",
            FORMAT: "image/png",
            TRANSPARENT: true,
          },
          serverType: "geoserver",
          crossOrigin: "anonymous",
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
    }
  }

  /**
   * Configura click en capas WFS para mostrar popup con propiedades del feature.
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

        let nombreCapa = layer.get("nombre") || "Información";
        nombreCapa = nombreCapa.replace(/\s*\(Interacción\)\s*/gi, "").trim();

        let contenido = '<div class="popup-info">';
        contenido += `<p class="popup-layer-name"><strong>${nombreCapa}</strong></p>`;

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

    const popupCloser = overlay.getElement().querySelector(".ol-popup-closer");
    if (popupCloser) {
      popupCloser.addEventListener("click", (e) => {
        e.preventDefault();
        overlay.setPosition(undefined);
      });
    }

    mapa.on("pointermove", (evt) => {
      const pixel = mapa.getEventPixel(evt.originalEvent);
      const hit = mapa.hasFeatureAtPixel(pixel);
      mapa.getTargetElement().style.cursor = hit ? "pointer" : "";
    });
  }

  /**
   * Configura hover en municipios mostrando tooltip y resaltando el feature.
   */
  configurarHoverMunicipios(mapaId, containerId) {
    const mapa = this.mapas[mapaId];
    if (!mapa) return;

    const mapElement = document.getElementById(containerId);
    if (!mapElement) return;

    if (this.hoverListeners[mapaId]) {
      const prevData = this.hoverListeners[mapaId];

      if (prevData.currentFeature) {
        prevData.currentFeature.setStyle(prevData.defaultStyle);
      }

      if (prevData.tooltip && prevData.tooltip.parentNode) {
        prevData.tooltip.remove();
      }

      if (prevData.listener) {
        mapa.un("pointermove", prevData.listener);
      }

      delete this.hoverListeners[mapaId];
    }

    const tooltip = document.createElement("div");
    tooltip.className = "municipio-hover-tooltip";
    tooltip.style.display = "none";
    mapElement.appendChild(tooltip);

    let currentFeature = null;
    let defaultStyle = null;

    const hoverStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#A21A5C",
        width: 4,
      }),
      fill: new ol.style.Fill({
        color: "rgba(162, 26, 92, 0.2)",
      }),
    });

    const pointerMoveListener = (evt) => {
      if (this.tieneComparacionActiva(mapaId)) {
        if (currentFeature) {
          currentFeature.setStyle(defaultStyle);
          currentFeature = null;
          tooltip.style.display = "none";
        }
        return;
      }

      const pixel = mapa.getEventPixel(evt.originalEvent);

      if (currentFeature) {
        currentFeature.setStyle(defaultStyle);
        currentFeature = null;
        tooltip.style.display = "none";
      }

      mapa.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer && layer.get("tipo") === "wfs") {
          currentFeature = feature;
          defaultStyle = feature.getStyle() || layer.getStyle();

          feature.setStyle(hoverStyle);

          const properties = feature.getProperties();

          const nombreMunicipio =
            properties.Municipio ||
            properties.MUNICIPIO ||
            properties.municipio ||
            properties.nombre ||
            properties.NOMBRE ||
            properties.NOM_MUN ||
            properties.nom_mun ||
            properties.NOMGEO ||
            properties.nomgeo ||
            properties.CVE_MUN ||
            properties.cve_mun ||
            properties.nombre_municipio ||
            properties.NOMBRE_MUNICIPIO ||
            "Municipio";

          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = "block";
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;

          return true;
        }
      });

      this.hoverListeners[mapaId].currentFeature = currentFeature;
      this.hoverListeners[mapaId].defaultStyle = defaultStyle;
    };

    mapa.on("pointermove", pointerMoveListener);

    this.hoverListeners[mapaId] = {
      listener: pointerMoveListener,
      tooltip: tooltip,
      currentFeature: null,
      defaultStyle: null,
    };

    this.agregarEstilosHoverTooltip();
  }

  agregarEstilosHoverTooltip() {
    if (document.getElementById("hover-tooltip-styles")) return;

    const style = document.createElement("style");
    style.id = "hover-tooltip-styles";
    style.textContent = `
      .municipio-hover-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        pointer-events: none;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        white-space: nowrap;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Resalta municipios en el mapa según categoría de vulnerabilidad.
   */
  resaltarMunicipiosPorCategoria(mapaId, categoria) {
    const mapa = this.mapas[mapaId];
    if (!mapa) {
      console.error(`Mapa no encontrado: ${mapaId}`);
      return;
    }

    if (!this.featuresResaltados) {
      this.featuresResaltados = {};
    }

    if (this.featuresResaltados[mapaId]) {
      this.featuresResaltados[mapaId].forEach(({ feature, style }) => {
        feature.setStyle(style);
      });
      this.featuresResaltados[mapaId] = [];
    }

    if (!categoria) {
      return;
    }

    const capas = this.capas[mapaId];
    if (!capas) {
      console.error(`No hay capas para mapa: ${mapaId}`);
      return;
    }

    const capaWFS = capas.find((capa) => capa.get("tipo") === "wfs");
    if (!capaWFS) {
      console.error("No se encontró capa WFS");
      return;
    }

    const source = capaWFS.getSource();
    const features = source.getFeatures();

    const coloresPorCategoria = {
      "Muy Alto": "#78020e",
      Alto: "#9a3c43",
      Medio: "#bc7678",
      Bajo: "#ddb0ae",
      "Muy Bajo": "#ffeae3",
    };

    const colorCategoria = coloresPorCategoria[categoria] || "#FFD700";

    const resaltadoStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: colorCategoria,
        width: 5,
      }),
      fill: new ol.style.Fill({
        color: this.hexToRgba(colorCategoria, 0.5),
      }),
    });

    this.featuresResaltados[mapaId] = [];

    if (features.length > 0) {
      const primerasPropiedades = features[0].getProperties();
    }

    const mapeoCategoria = {
      "Muy Alto": ["Muy alta", "Muy Alto", "MUY ALTA", "MUY ALTO"],
      Alto: ["Alta", "Alto", "ALTA", "ALTO"],
      Medio: ["Media", "Medio", "MEDIA", "MEDIO"],
      Bajo: ["Baja", "Bajo", "BAJA", "BAJO"],
      "Muy Bajo": ["Muy baja", "Muy Bajo", "MUY BAJA", "MUY BAJO"],
    };

    const valoresEquivalentes = mapeoCategoria[categoria] || [categoria];

    let contadorCoincidencias = 0;

    features.forEach((feature, index) => {
      const properties = feature.getProperties();

      const vulnerabilidad =
        properties.grado ||
        properties.Grado ||
        properties.GRADO ||
        properties.Vulnerabilidad ||
        properties.VULNERABILIDAD ||
        properties.vulnerabilidad ||
        properties.Categoria ||
        properties.CATEGORIA ||
        properties.categoria ||
        properties.Nivel ||
        properties.nivel ||
        properties.Prioridad ||
        properties.PRIORIDAD ||
        properties.prioridad;

      if (
        vulnerabilidad &&
        valoresEquivalentes.includes(vulnerabilidad.trim())
      ) {
        contadorCoincidencias++;
        const estiloOriginal = feature.getStyle() || capaWFS.getStyle();
        this.featuresResaltados[mapaId].push({
          feature: feature,
          style: estiloOriginal,
        });
        feature.setStyle(resaltadoStyle);
      }
    });

    mapa.render();
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  generarLeyendaDinamica(containerId, capas, numeroCapitulo) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer || !mapContainer.parentElement) {
      return;
    }

    let controlsContainer =
      mapContainer.parentElement.querySelector(".map-controls");

    if (!controlsContainer) {
      controlsContainer = document.createElement("div");
      controlsContainer.className = "map-controls";
      mapContainer.parentElement.appendChild(controlsContainer);
    }

    controlsContainer.innerHTML = '<div class="map-controls-title">Capas</div>';

    capas.forEach((capa, index) => {
      const nombreCapa = capa.get("nombre") || `Capa ${index + 1}`;

      if (
        nombreCapa.includes("(Interacción)") ||
        nombreCapa.includes("Interacción")
      ) {
        return;
      }

      const visible = capa.getVisible();
      const checkboxId = `layer-${index}-${numeroCapitulo}`;

      const layerControl = document.createElement("div");
      layerControl.className = "layer-control";
      layerControl.innerHTML = `
        <input type="checkbox" id="${checkboxId}" ${visible ? "checked" : ""} />
        <label for="${checkboxId}">${nombreCapa}</label>
      `;

      controlsContainer.appendChild(layerControl);
    });
  }

  configurarControlesCapas(numeroCapitulo, capas) {
    if (!capas || capas.length === 0) {
      return;
    }

    let controlesConfigurados = 0;

    for (let i = 0; i < capas.length; i++) {
      const capa = capas[i];
      const checkboxId = `layer-${i}-${numeroCapitulo}`;
      const checkbox = document.getElementById(checkboxId);

      if (checkbox) {
        try {
          checkbox.addEventListener("change", (e) => {
            capa.setVisible(e.target.checked);
          });
          controlesConfigurados++;
        } catch (error) {
          console.error(`Error al configurar control para capa ${i}:`, error);
        }
      }
    }
  }

  actualizarVistaMapa(mapaId, centro, zoom, duracion = 1000) {
    const controlsManager = this.controlsManagers[mapaId];

    if (controlsManager) {
      controlsManager.animarHacia(centro, zoom, duracion);
    } else {
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
   * Reemplaza todas las capas de un mapa con nueva configuración.
   */
  actualizarCapasMapa(mapaId, nuevasCapasConfig) {
    const mapa = this.mapas[mapaId];
    if (!mapa) {
      console.error(`No se encontró el mapa: ${mapaId}`);
      return false;
    }

    const layers = mapa.getLayers();
    const capasActuales = layers.getArray().slice();

    for (let i = capasActuales.length - 1; i > 0; i--) {
      mapa.removeLayer(capasActuales[i]);
    }

    this.capas[mapaId] = [];

    const tieneMunicipiosWMS = nuevasCapasConfig.some(
      (capa) =>
        capa.layers &&
        capa.layers.includes("municipios_ganaperd") &&
        capa.tipo === "wms"
    );

    const nuevasCapas = nuevasCapasConfig.map((capaConfig) => {
      if (capaConfig.tipo === "wfs") {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

    if (tieneMunicipiosWMS) {
      const capaWFSMunicipios = this.crearCapaWFS({
        nombre: "Municipios (Interacción)",
        tipo: "wfs",
        url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
        layers: "SEICCT:municipios_ganaperd",
        visible: true,
        leyenda: false,
        transparente: true,
      });
      nuevasCapas.push(capaWFSMunicipios);
    }

    nuevasCapas.forEach((capa) => {
      mapa.addLayer(capa);
    });

    this.capas[mapaId] = nuevasCapas;

    const numeroCapitulo = parseFloat(
      mapaId.replace("cap-", "").replace("-", ".")
    );
    const containerId = `map-${mapaId.replace("cap-", "")}`;
    this.generarLeyendaDinamica(containerId, nuevasCapas, numeroCapitulo);
    this.configurarControlesCapas(numeroCapitulo, nuevasCapas);

    setTimeout(() => {
      mapa.updateSize();
    }, 100);

    return true;
  }

  actualizarTamano(mapaId) {
    const mapa = this.mapas[mapaId];
    if (mapa) {
      setTimeout(() => {
        mapa.updateSize();
      }, 100);
    }
  }

  limpiarMapa(mapaId) {
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
        border-bottom: 2px solid var(--color-accent-magenta, #A21A5C);
        font-size: 1rem;
      }

      .popup-info strong {
        color: var(--color-accent-magenta, #A21A5C);
      }
    `;
    document.head.appendChild(style);
  }

  obtenerMapa(mapaId) {
    return this.mapas[mapaId];
  }

  obtenerCapaPorNombre(mapaId, nombreCapa) {
    const capas = this.capas[mapaId];
    if (!capas) return null;

    return capas.find((capa) => capa.get("nombre") === nombreCapa);
  }

  configurarSwipe(mapaId, nombreCapaIzq, nombreCapaDer) {
    const controlsManager = this.controlsManagers[mapaId];
    if (!controlsManager) {
      return false;
    }

    const capaIzq = this.obtenerCapaPorNombre(mapaId, nombreCapaIzq);
    const capaDer = this.obtenerCapaPorNombre(mapaId, nombreCapaDer);

    if (!capaIzq || !capaDer) {
      return false;
    }

    controlsManager.configurarSwipe(capaIzq, capaDer);
    return true;
  }

  detectarCapasComparables(mapaId) {
    const capas = this.capas[mapaId];
    if (!capas || capas.length < 2) return null;

    let capa2021 = null;
    let capa2041 = null;

    capas.forEach((capa) => {
      const layers = capa.get("layers");
      if (!layers) return;

      if (layers.includes("2021.2040") || layers.includes("2021-2040")) {
        capa2021 = capa;
      } else if (layers.includes("2041.2060") || layers.includes("2041-2060")) {
        capa2041 = capa;
      }
    });

    if (capa2021 && capa2041) {
      return { capaA: capa2021, capaB: capa2041 };
    }

    return null;
  }

  /**
   * Inicializa el ComparisonManager para comparar dos capas temporales.
   */
  inicializarComparacion(mapaId, containerId) {
    const capasComparables = this.detectarCapasComparables(mapaId);

    if (!capasComparables) {
      return false;
    }

    const mapa = this.mapas[mapaId];
    if (!mapa) {
      console.error(`No se encontró el mapa: ${mapaId}`);
      return false;
    }

    if (this.comparisonManagers[mapaId]) {
      this.comparisonManagers[mapaId].destruir();
    }

    const comparisonManager = new ComparisonManager(
      mapa,
      capasComparables.capaA,
      capasComparables.capaB,
      containerId
    );

    this.comparisonManagers[mapaId] = comparisonManager;

    return true;
  }

  destruirComparacion(mapaId) {
    const comparisonManager = this.comparisonManagers[mapaId];
    if (comparisonManager) {
      comparisonManager.destruir();
      delete this.comparisonManagers[mapaId];
    }
  }

  tieneComparacionActiva(mapaId) {
    const comparisonManager = this.comparisonManagers[mapaId];
    if (!comparisonManager) {
      return false;
    }

    return (
      comparisonManager.modoActual && comparisonManager.modoActual !== "none"
    );
  }
}
