/**
 * MapManager - Gestor de mapas con OpenLayers (ACTUALIZADO)
 * Maneja la creación, actualización y control de mapas interactivos
 * INCLUYE: Integración con MapControlsManager para herramientas
 * INCLUYE: Integración con ComparisonManager para comparar capas
 */

import { MapControlsManager } from "./MapControlsManager.js";
import { ComparisonManager } from "./ComparisonManager.js";

export class MapManager {
  constructor(config) {
    this.config = config;
    this.mapas = {};
    this.capas = {};
    this.overlays = {};
    this.controlsManagers = {}; // ← Gestores de controles de herramientas
    this.comparisonManagers = {}; // ← NUEVO: Gestores de comparación de capas
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
    // Convertir número a formato con guión (ej: 3.1 -> 3-1)
    const mapaId = `cap-${numeroCapitulo.toString().replace('.', '-')}`;

    // ✅ NUEVO: Limpiar mapa existente si ya existe
    if (this.mapas[mapaId]) {
      // console.log(`🧹 Limpiando mapa existente: ${mapaId}`);
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

    // ✅ MOVIDO: Asignar mapaId ANTES de guardar referencias
    this.mapas[mapaId] = mapa;
    this.capas[mapaId] = capas;
    this.overlays[mapaId] = overlay;

    this.configurarClickPopupWFS(mapa, overlay, capas);

    // ⬇️ NUEVO: Generar leyenda dinámica antes de configurar controles
    this.generarLeyendaDinamica(containerId, capas, numeroCapitulo);

    this.configurarControlesCapas(numeroCapitulo, capas);

    // ⬇️ NUEVO: Inicializar controles de herramientas
    this.inicializarControles(mapaId, mapa);

    // console.log(`✅ Mapa inicializado: ${mapaId}`);

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

    // console.log(`📍 Creando capa WFS: ${capaConfig.nombre}`);
    // console.log(`   - Workspace: ${workspace}`);
    // console.log(`   - TypeName: ${typeName}`);
    // console.log(
    //   `   - Proxy type: ${
    //     isVercelProxy ? "Vercel Serverless" : "Local/Directo"
    //   }`
    // );

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

        // Construir URL según el tipo de proxy
        if (isVercelProxy) {
          // Para Vercel: URL-encode todo el path
          const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;
          const encodedPath = encodeURIComponent(wfsPath);
          return `${proxyBase.replace("?path=", "")}?path=${encodedPath}`;
        } else {
          // Para local: NO incluir /geoserver porque proxyBase ya lo tiene
          const wfsPath = `/${workspace}/ows?${params.toString()}`;
          return `${proxyBase}${wfsPath}`;
        }
      },
      strategy: ol.loadingstrategy.bbox,
    });

    // Si la capa es transparente (para interacción solamente), usar estilo invisible
    let estilo;
    if (capaConfig.transparente) {
      estilo = new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 0, 0)", // Completamente transparente
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)", // Completamente transparente
          width: 0,
        }),
      });
    } else if (capaConfig.estilo) {
      estilo = this.crearEstiloWFS(capaConfig.estilo);
    } else {
      // Estilo por defecto
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
      zIndex: 3, // Mayor z-index para estar encima del WMS
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
    // Si el estilo tiene una función de clasificación por atributo
    if (estiloConfig.tipo === 'clasificado' && estiloConfig.atributo && estiloConfig.rangos) {
      return (feature) => {
        const valor = feature.get(estiloConfig.atributo);

        // Buscar el rango correspondiente
        let colorFill = estiloConfig.colorPorDefecto || "rgba(200, 200, 200, 0.5)";

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

    // Estilo simple (sin clasificación)
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

        // Limpiar el nombre de la capa (remover "(Interacción)" si existe)
        let nombreCapa = layer.get("nombre") || "Información";
        nombreCapa = nombreCapa.replace(/\s*\(Interacción\)\s*/gi, '').trim();

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

    // Configurar el botón de cierre del popup
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
   * Configura el hover de municipios para resaltar y mostrar tooltip
   */
  configurarHoverMunicipios(mapaId, containerId) {
    const mapa = this.mapas[mapaId];
    if (!mapa) return;

    const mapElement = document.getElementById(containerId);
    if (!mapElement) return;

    // Crear tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'municipio-hover-tooltip';
    tooltip.style.display = 'none';
    mapElement.appendChild(tooltip);

    // Variable para almacenar el feature actualmente resaltado
    let currentFeature = null;
    let defaultStyle = null;

    // Estilo de hover (borde amarillo grueso)
    const hoverStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#FFD700', // Dorado
        width: 4
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255, 215, 0, 0.2)' // Amarillo translúcido
      })
    });

    // Listener de movimiento del mouse
    mapa.on('pointermove', (evt) => {
      const pixel = mapa.getEventPixel(evt.originalEvent);

      // Restaurar estilo del feature anterior
      if (currentFeature) {
        currentFeature.setStyle(defaultStyle);
        currentFeature = null;
        tooltip.style.display = 'none';
      }

      // Buscar feature bajo el cursor (solo capas WFS)
      mapa.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer && layer.get('tipo') === 'wfs') {
          currentFeature = feature;
          defaultStyle = feature.getStyle() || layer.getStyle();

          // Aplicar estilo de hover
          feature.setStyle(hoverStyle);

          // Obtener nombre del municipio
          const properties = feature.getProperties();
          const nombreMunicipio = properties.Municipio || properties.MUNICIPIO || properties.nombre || properties.NOMBRE || 'Municipio';

          // Actualizar tooltip
          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = 'block';
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;

          return true; // Detener búsqueda
        }
      });
    });

    // Agregar estilos CSS para el tooltip
    this.agregarEstilosHoverTooltip();
  }

  /**
   * Agrega estilos CSS para el tooltip de hover
   */
  agregarEstilosHoverTooltip() {
    if (document.getElementById('hover-tooltip-styles')) return;

    const style = document.createElement('style');
    style.id = 'hover-tooltip-styles';
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
   * Resalta municipios en el mapa según una categoría de vulnerabilidad
   */
  resaltarMunicipiosPorCategoria(mapaId, categoria) {
    const mapa = this.mapas[mapaId];
    if (!mapa) return;

    // Guardar features resaltados para poder restaurarlos después
    if (!this.featuresResaltados) {
      this.featuresResaltados = {};
    }

    // Restaurar estilos anteriores
    if (this.featuresResaltados[mapaId]) {
      this.featuresResaltados[mapaId].forEach(({ feature, style }) => {
        feature.setStyle(style);
      });
      this.featuresResaltados[mapaId] = [];
    }

    // Si categoria es null, solo limpiar resaltados
    if (!categoria) {
      return;
    }

    // Buscar la capa WFS
    const capas = this.capas[mapaId];
    if (!capas) return;

    const capaWFS = capas.find(capa => capa.get('tipo') === 'wfs');
    if (!capaWFS) return;

    const source = capaWFS.getSource();
    const features = source.getFeatures();

    // Mapa de colores por categoría (mismo que el gráfico)
    const coloresPorCategoria = {
      'Muy Alto': '#78020e',
      'Alto': '#9a3c43',
      'Medio': '#bc7678',
      'Bajo': '#ddb0ae',
      'Muy Bajo': '#ffeae3'
    };

    const colorCategoria = coloresPorCategoria[categoria] || '#FFD700';

    // Estilo de resaltado
    const resaltadoStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: colorCategoria,
        width: 5
      }),
      fill: new ol.style.Fill({
        color: this.hexToRgba(colorCategoria, 0.5)
      })
    });

    this.featuresResaltados[mapaId] = [];

    // Resaltar features que coincidan con la categoría
    features.forEach(feature => {
      const properties = feature.getProperties();

      // Buscar el campo de vulnerabilidad (puede tener diferentes nombres)
      const vulnerabilidad = properties.Vulnerabilidad ||
                            properties.VULNERABILIDAD ||
                            properties.vulnerabilidad ||
                            properties.Categoria ||
                            properties.CATEGORIA ||
                            properties.categoria ||
                            properties.Nivel ||
                            properties.nivel;

      if (vulnerabilidad && vulnerabilidad.trim() === categoria) {
        const estiloOriginal = feature.getStyle() || capaWFS.getStyle();
        this.featuresResaltados[mapaId].push({
          feature: feature,
          style: estiloOriginal
        });
        feature.setStyle(resaltadoStyle);
      }
    });

    // Renderizar el mapa
    mapa.render();
  }

  /**
   * Convierte color hexadecimal a rgba
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * ⬇️ NUEVO: Genera la leyenda dinámica basada en las capas del mapa
   */
  generarLeyendaDinamica(containerId, capas, numeroCapitulo) {
    // Buscar el contenedor del mapa
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer || !mapContainer.parentElement) {
      // console.warn(`⚠️ No se encontró el contenedor para generar leyenda: ${containerId}`);
      return;
    }

    // Buscar o crear el contenedor de controles de capas
    let controlsContainer = mapContainer.parentElement.querySelector('.map-controls');

    if (!controlsContainer) {
      // Crear contenedor de controles si no existe
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'map-controls';
      mapContainer.parentElement.appendChild(controlsContainer);
    }

    // Limpiar contenido anterior
    controlsContainer.innerHTML = '<div class="map-controls-title">Capas</div>';

    // Generar controles para cada capa (excluyendo capas de interacción transparentes)
    capas.forEach((capa, index) => {
      const nombreCapa = capa.get('nombre') || `Capa ${index + 1}`;

      // No mostrar capas de interacción (transparentes) en el control
      if (nombreCapa.includes('(Interacción)') || nombreCapa.includes('Interacción')) {
        return; // Saltar esta capa
      }

      const visible = capa.getVisible();
      const checkboxId = `layer-${index}-${numeroCapitulo}`;

      const layerControl = document.createElement('div');
      layerControl.className = 'layer-control';
      layerControl.innerHTML = `
        <input type="checkbox" id="${checkboxId}" ${visible ? 'checked' : ''} />
        <label for="${checkboxId}">${nombreCapa}</label>
      `;

      controlsContainer.appendChild(layerControl);
    });

    // console.log(`✅ Leyenda dinámica generada para capítulo ${numeroCapitulo} con ${capas.length} capas`);
  }

  /**
   * Configura los controles de visibilidad de capas
   */
   configurarControlesCapas(numeroCapitulo, capas) {
    // ✅ Validar que tenemos capas para configurar
    if (!capas || capas.length === 0) {
      // console.warn(`⚠️ No hay capas para configurar controles en capítulo ${numeroCapitulo}`);
      return;
    }

    let controlesConfigurados = 0;

    for (let i = 0; i < capas.length; i++) {
      const capa = capas[i];
      const checkboxId = `layer-${i}-${numeroCapitulo}`;
      const checkbox = document.getElementById(checkboxId);

      // ✅ NUEVO: Solo configurar si el checkbox existe en el DOM
      if (checkbox) {
        try {
          checkbox.addEventListener("change", (e) => {
            capa.setVisible(e.target.checked);
            // console.log(`🔄 Capa "${capa.get('nombre')}" visibilidad: ${e.target.checked}`);
          });
          controlesConfigurados++;
        } catch (error) {
          console.error(`❌ Error al configurar control para capa ${i}:`, error);
        }
      } else {
        // ✅ NUEVO: Log informativo, NO error crítico
        // console.log(`ℹ️ Checkbox no encontrado: ${checkboxId} (opcional - UI sin controles de capa)`);
      }
    }

    // ✅ NUEVO: Log resumen de configuración
    // if (controlesConfigurados > 0) {
    //   console.log(`✅ ${controlesConfigurados} controles de capa configurados para capítulo ${numeroCapitulo}`);
    // } else {
    //   console.log(`ℹ️ Capítulo ${numeroCapitulo}: Sin controles de capa en UI (modo solo visualización)`);
    // }
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
   * Actualiza las capas de un mapa con nuevas configuraciones
   */
  actualizarCapasMapa(mapaId, nuevasCapasConfig) {
    const mapa = this.mapas[mapaId];
    if (!mapa) {
      console.error(`❌ No se encontró el mapa: ${mapaId}`);
      return false;
    }

    //console.log(`🔄 Actualizando capas del mapa: ${mapaId}`);

    // Obtener las capas actuales (excluyendo la capa base)
    const layers = mapa.getLayers();
    const capasActuales = layers.getArray().slice(); // Copiar array

    // Remover todas las capas excepto la primera (capa base)
    for (let i = capasActuales.length - 1; i > 0; i--) {
      mapa.removeLayer(capasActuales[i]);
    }

    // Limpiar referencia de capas antiguas
    this.capas[mapaId] = [];

    // Crear y agregar nuevas capas
    const nuevasCapas = nuevasCapasConfig.map((capaConfig) => {
      if (capaConfig.tipo === "wfs") {
        return this.crearCapaWFS(capaConfig);
      } else {
        return this.crearCapaWMS(capaConfig);
      }
    });

    // Agregar nuevas capas al mapa
    nuevasCapas.forEach(capa => {
      mapa.addLayer(capa);
    });

    // Guardar referencia de nuevas capas
    this.capas[mapaId] = nuevasCapas;

    // Regenerar controles de capas
    const numeroCapitulo = parseFloat(mapaId.replace('cap-', '').replace('-', '.'));
    const containerId = `map-${mapaId.replace('cap-', '')}`;
    this.generarLeyendaDinamica(containerId, nuevasCapas, numeroCapitulo);
    this.configurarControlesCapas(numeroCapitulo, nuevasCapas);

    // Actualizar tamaño del mapa
    setTimeout(() => {
      mapa.updateSize();
    }, 100);

    //console.log(`✅ Capas actualizadas: ${nuevasCapas.length} capas cargadas`);
    return true;
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
        border-bottom: 2px solid var(--color-accent-magenta, #A21A5C);
        font-size: 1rem;
      }

      .popup-info strong {
        color: var(--color-accent-magenta, #A21A5C);
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
      // console.warn(`⚠️ No hay controles inicializados para ${mapaId}`);
      return false;
    }

    const capaIzq = this.obtenerCapaPorNombre(mapaId, nombreCapaIzq);
    const capaDer = this.obtenerCapaPorNombre(mapaId, nombreCapaDer);

    if (!capaIzq || !capaDer) {
      // console.warn(
      //   `⚠️ No se encontraron las capas: ${nombreCapaIzq}, ${nombreCapaDer}`
      // );
      return false;
    }

    controlsManager.configurarSwipe(capaIzq, capaDer);
    return true;
  }

  /**
   * ⬇️ NUEVO: Detecta capas comparables (que terminan en 2021-2040 y 2041-2060)
   */
  detectarCapasComparables(mapaId) {
    const capas = this.capas[mapaId];
    if (!capas || capas.length < 2) return null;

    let capa2021 = null;
    let capa2041 = null;

    capas.forEach(capa => {
      const layers = capa.get('layers');
      if (!layers) return;

      if (layers.includes('2021.2040') || layers.includes('2021-2040')) {
        capa2021 = capa;
      } else if (layers.includes('2041.2060') || layers.includes('2041-2060')) {
        capa2041 = capa;
      }
    });

    if (capa2021 && capa2041) {
      return { capaA: capa2021, capaB: capa2041 };
    }

    return null;
  }

  /**
   * ⬇️ NUEVO: Inicializa el control de comparación de capas
   */
  inicializarComparacion(mapaId, containerId) {
    const capasComparables = this.detectarCapasComparables(mapaId);

    if (!capasComparables) {
      //console.log(`ℹ️ No hay capas comparables en ${mapaId}`);
      return false;
    }

    const mapa = this.mapas[mapaId];
    if (!mapa) {
      console.error(`❌ No se encontró el mapa: ${mapaId}`);
      return false;
    }

    // Destruir comparación anterior si existe
    if (this.comparisonManagers[mapaId]) {
      this.comparisonManagers[mapaId].destruir();
    }

    // Crear nuevo ComparisonManager
    const comparisonManager = new ComparisonManager(
      mapa,
      capasComparables.capaA,
      capasComparables.capaB,
      containerId
    );

    this.comparisonManagers[mapaId] = comparisonManager;

    //console.log(`✅ ComparisonManager inicializado para ${mapaId}`);
    return true;
  }

  /**
   * ⬇️ NUEVO: Destruye el control de comparación
   */
  destruirComparacion(mapaId) {
    const comparisonManager = this.comparisonManagers[mapaId];
    if (comparisonManager) {
      comparisonManager.destruir();
      delete this.comparisonManagers[mapaId];
      //console.log(`🧹 ComparisonManager destruido para ${mapaId}`);
    }
  }
}
