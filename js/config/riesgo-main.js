/**
 * Script principal para riesgo.html
 */

class RiesgoApp {
  constructor() {
    this.config = window.RiesgoConfig;
    this.currentChapter = 1;
    this.maps = {}; // Almacenar mapas por ID
    this.atlasData = {}; // Datos de atlas municipales

    this.init();
  }

  /**
   * Inicializar la aplicación
   */
  init() {
    this.setupNavbar();
    this.setupNavigation();
    this.setupAtlasButton();
    this.setupObservers();
    this.activateChapter(1);
  }

  /**
   * Configurar el navbar
   */
  setupNavbar() {
    const navbar = document.querySelector(".navbar");
    const navbarIndicator = document.getElementById("navbarIndicator");
    const navbarToggle = document.getElementById("navbarToggle");
    const navbarMenu = document.getElementById("navbarMenu");

    // Mostrar navbar al hacer hover sobre el indicador
    navbarIndicator.addEventListener("mouseenter", () => {
      navbar.classList.add("visible");
    });

    // Mantener navbar visible mientras el mouse está sobre él
    navbar.addEventListener("mouseenter", () => {
      navbar.classList.add("visible");
    });

    // Ocultar navbar cuando el mouse sale
    navbar.addEventListener("mouseleave", () => {
      navbar.classList.remove("visible");
    });

    // Click en indicador para toggle del navbar
    navbarIndicator.addEventListener("click", () => {
      navbar.classList.toggle("visible");
    });

    // Toggle del menú móvil
    navbarToggle.addEventListener("click", () => {
      navbarToggle.classList.toggle("active");
      navbarMenu.classList.toggle("active");
      navbar.classList.add("visible");
    });

    // Cerrar menú al hacer click en un link
    const navbarLinks = document.querySelectorAll(".navbar-link");
    navbarLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navbarToggle.classList.remove("active");
        navbarMenu.classList.remove("active");
      });
    });

    // Efecto scroll en navbar
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  /**
   * Configurar navegación del story map
   */
  setupNavigation() {
    const chaptersContainer = document.getElementById("chaptersContainer");
    const timelineItems = document.querySelectorAll(".timeline-item");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    // Click en timeline
    timelineItems.forEach((item) => {
      item.addEventListener("click", () => {
        const chapterNumber = parseInt(item.dataset.chapter);
        this.activateChapter(chapterNumber);
      });
    });

    // Botones de navegación
    btnPrev.addEventListener("click", () => {
      this.activateChapter(this.currentChapter - 1);
    });

    btnNext.addEventListener("click", () => {
      this.activateChapter(this.currentChapter + 1);
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        this.activateChapter(this.currentChapter - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        this.activateChapter(this.currentChapter + 1);
      }
    });

    // Detectar scroll y actualizar capítulo actual
    let scrollTimeout;
    chaptersContainer.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const chapters = document.querySelectorAll(".chapter");
        const containerRect = chaptersContainer.getBoundingClientRect();

        chapters.forEach((chapter) => {
          const chapterRect = chapter.getBoundingClientRect();
          const chapterNumber = parseInt(chapter.dataset.chapter);

          // Si el capítulo está visible en la mitad superior del viewport
          if (
            chapterRect.top >= containerRect.top &&
            chapterRect.top < containerRect.top + containerRect.height / 2
          ) {
            if (this.currentChapter !== chapterNumber) {
              this.currentChapter = chapterNumber;
              this.updateTimelineAndButtons();
            }
          }
        });
      }, 100);
    });
  }

  /**
   * Activar un capítulo
   */
  activateChapter(chapterNumber) {
    if (
      chapterNumber < 1 ||
      chapterNumber > this.config.timeline.totalChapters
    ) {
      return;
    }

    this.currentChapter = chapterNumber;

    // Hacer scroll al capítulo
    const chapter = document.getElementById(`risk-chapter-${chapterNumber}`);
    if (chapter) {
      chapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    this.updateTimelineAndButtons();
  }

  /**
   * Actualizar timeline y botones
   */
  updateTimelineAndButtons() {
    const timelineItems = document.querySelectorAll(".timeline-item");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    // Actualizar timeline
    timelineItems.forEach((item) => {
      const itemChapter = parseInt(item.dataset.chapter);
      if (itemChapter === this.currentChapter) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Actualizar botones de navegación
    btnPrev.disabled = this.currentChapter === 1;
    btnNext.disabled =
      this.currentChapter === this.config.timeline.totalChapters;
  }

  /**
   * Configurar botón de Atlas de Riesgo
   */
  setupAtlasButton() {
    const btnAtlasRiesgo = document.getElementById("btnAtlasRiesgo");
    if (btnAtlasRiesgo) {
      btnAtlasRiesgo.addEventListener("click", () => {
        window.open(this.config.links.atlasEstatal, "_blank");
      });
    }
  }

  /**
   * Configurar Intersection Observers para lazy loading de mapas
   */
  setupObservers() {
    const observerOptions = { threshold: 0.1 };

    // Observer para capítulo 1
    const observerCap1 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === "risk-chapter-1") {
          this.initMap(1);
        }
      });
    }, observerOptions);

    const chapter1 = document.getElementById("risk-chapter-1");
    if (chapter1) {
      observerCap1.observe(chapter1);
    }

    // Observer para capítulo 3
    const observerCap3 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === "risk-chapter-3") {
          this.initMap(3);
          this.loadAtlasCSV();
        }
      });
    }, observerOptions);

    const chapter3 = document.getElementById("risk-chapter-3");
    if (chapter3) {
      observerCap3.observe(chapter3);
    }
  }

  /**
   * Inicializar mapa de un capítulo
   */
  initMap(chapterNumber) {
    const capitulo = this.config.capitulos.find((c) => c.id === chapterNumber);

    if (!capitulo || !capitulo.mapId) {
      console.warn(
        `No hay configuración de mapa para capítulo ${chapterNumber}`
      );
      return;
    }

    // Verificar si el mapa ya existe
    if (this.maps[capitulo.mapId]) {
      return;
    }

    // Crear el mapa
    const map = new ol.Map({
      target: capitulo.mapId,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(this.config.defaultCenter),
        zoom: this.config.defaultZoom,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    // Agregar capas de GeoServer
    if (capitulo.capas) {
      capitulo.capas.forEach((capaConfig) => {
        const layer = this.createLayer(capaConfig);
        if (layer) {
          map.addLayer(layer);
        }
      });
    }

    // Guardar referencia del mapa
    this.maps[capitulo.mapId] = {
      map: map,
      layers: {},
    };

    // Si es el capítulo 3, guaregar referencia y agregar capa de interacción
    if (chapterNumber === 3) {
      this.maps[capitulo.mapId].municipiosLayer = map
        .getLayers()
        .getArray()
        .find((layer) => layer.get("name") === "Municipios");

      // Agregar capa WFS transparente para interacción (sin CORS)
      this.addInteractionLayer(map);
    } else if (chapterNumber === 1 || chapterNumber === 2) {
      // Para capítulos 1 y 2, agregar capa WFS solo para hover (sin popup)
      this.addHoverOnlyLayer(map, capitulo.mapId);
    }
  }

  /**
   * Crear una capa de OpenLayers según configuración
   */
  createLayer(config) {
    if (config.tipo === "wms") {
      // Extraer workspace de la capa (ej: "SEICCT:Municipios" -> "SEICCT")
      const layerParts = config.layer.split(":");
      const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

      // Obtener URL del proxy
      const proxyBase = this.config.proxy.url;
      const isVercelProxy = proxyBase.includes("proxy?path=");

      // Construir URL WMS según el tipo de proxy
      let wmsUrl;
      let tileLoadFunction = null;

      if (isVercelProxy) {
        // Para Vercel: usar loader personalizado
        wmsUrl = proxyBase.replace("?path=", "");

        // Loader personalizado para Vercel
        tileLoadFunction = function (imageTile, src) {
          const url = new URL(src, window.location.origin);
          const searchParams = url.searchParams;
          const queryString = searchParams.toString();
          const fullPath = `/geoserver/${workspace}/wms?${queryString}`;
          const encodedPath = encodeURIComponent(fullPath);
          const finalUrl = `${proxyBase.replace(
            "?path=",
            ""
          )}?path=${encodedPath}`;

          imageTile.getImage().src = finalUrl;
        };
      } else {
        // Para local: concatenar directamente
        wmsUrl = `${proxyBase}/${workspace}/wms`;
      }

      const wmsSource = new ol.source.TileWMS({
        url: wmsUrl,
        params: {
          LAYERS: config.layer,
          TILED: true,
          VERSION: "1.1.0",
          STYLES: config.style || "",
          FORMAT: "image/png",
          TRANSPARENT: true,
        },
        serverType: "geoserver",
        crossOrigin: "anonymous",
        ...(tileLoadFunction && { tileLoadFunction }),
      });

      // Manejar errores de carga de tiles
      wmsSource.on("tileloaderror", (event) => {
        const tile = event.tile;
        console.error(`Error cargando tile de capa ${config.nombre}`);
        console.error(
          `   URL que falló:`,
          tile.getImage ? tile.getImage().src : "URL no disponible"
        );
        console.error(`   Evento completo:`, event);
      });

      const layer = new ol.layer.Tile({
        source: wmsSource,
        opacity: config.opacity || 1,
        zIndex: config.zIndex || 0,
        visible: true,
      });

      // Guardar nombre para identificación
      layer.set("name", config.nombre);

      return layer;
    }

    console.warn("Tipo de capa no soportado:", config.tipo);
    return null;
  }

  /**
   * Cargar CSV de atlas municipales
   */
  loadAtlasCSV() {
    if (Object.keys(this.atlasData).length > 0) {
      this.setupAtlasUI();
      return;
    }

    const capitulo3 = this.config.capitulos.find((c) => c.id === 3);
    if (!capitulo3 || !capitulo3.atlasCSV) {
      console.warn("No hay configuración de atlas CSV");
      return;
    }

    Papa.parse(capitulo3.atlasCSV, {
      download: true,
      header: true,
      encoding: "UTF-8",
      skipEmptyLines: true,
      complete: (results) => {
        // Procesar los datos del CSV
        results.data.forEach((row) => {
          const municipio = row.Municipio ? row.Municipio.trim() : "";
          const anio =
            row["Año de publicación"] || row["Ano de publicacion"] || "";
          const link = row.Link ? row.Link.trim() : "";

          if (municipio && link) {
            this.atlasData[municipio.toLowerCase()] = {
              nombre: municipio,
              anio: anio,
              link: link,
            };
          }
        });

        // Una vez cargados los datos, configurar la UI
        this.setupAtlasUI();
      },
      error: (error) => {
        console.error("Error al cargar links.csv:", error);
      },
    });
  }

  /**
   * Configurar UI de atlas después de cargar datos
   */
  setupAtlasUI() {
    const mapData = this.maps["map-3"];
    if (mapData && mapData.map && mapData.municipiosLayer) {
      this.setupAtlasHover(mapData.map, mapData.municipiosLayer);
    } else {
      console.warn(
        "No se pudo configurar UI de atlas: mapa o capa no disponible"
      );
    }
  }

  /**
   * Agregar capa WFS solo para hover (capítulos 1 y 2)
   */
  addHoverOnlyLayer(map, mapId) {
    const proxyBase = this.config.proxy.url;
    const workspace = "SEICCT";
    const typeName = "SEICCT:municipios_ganaperd";
    const isVercelProxy = proxyBase.includes("proxy?path=");

    // Crear capa WFS
    const vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: (extent) => {
        const params = new URLSearchParams({
          service: "WFS",
          version: "1.1.0",
          request: "GetFeature",
          typename: typeName,
          outputFormat: "application/json",
          srsname: "EPSG:3857",
          bbox: `${extent.join(",")},EPSG:3857`,
        });

        // Construir URL según el tipo de proxy
        let finalUrl;
        if (isVercelProxy) {
          const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;
          const encodedPath = encodeURIComponent(wfsPath);
          finalUrl = `${proxyBase.replace("?path=", "")}?path=${encodedPath}`;
        } else {
          const wfsPath = `/${workspace}/ows?${params.toString()}`;
          finalUrl = `${proxyBase}${wfsPath}`;
        }

        return finalUrl;
      },
      strategy: ol.loadingstrategy.bbox,
    });

    const interactionLayer = new ol.layer.Vector({
      source: vectorSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 0, 0)", // Completamente transparente
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)",
          width: 0,
        }),
      }),
      zIndex: 100,
    });

    interactionLayer.set("name", "Municipios-Hover");
    interactionLayer.set("tipo", "wfs"); // Marcar como WFS para hover
    map.addLayer(interactionLayer);

    // Solo configurar hover (sin popup)
    this.setupMunicipiosHover(map, mapId);
  }

  /**
   * Agregar capa WFS transparente para interacción con click
   */
  addInteractionLayer(map) {
    const proxyBase = this.config.proxy.url;
    const workspace = "SEICCT";
    const typeName = "SEICCT:municipios_ganaperd"; // Usar la misma capa que funciona en vulnerabilidad
    const isVercelProxy = proxyBase.includes("proxy?path=");

    // Crear capa WFS
    const vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: (extent) => {
        const params = new URLSearchParams({
          service: "WFS",
          version: "1.1.0",
          request: "GetFeature",
          typename: typeName,
          outputFormat: "application/json",
          srsname: "EPSG:3857",
          bbox: `${extent.join(",")},EPSG:3857`,
        });

        // Construir URL según el tipo de proxy
        let finalUrl;
        if (isVercelProxy) {
          const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;
          const encodedPath = encodeURIComponent(wfsPath);
          finalUrl = `${proxyBase.replace("?path=", "")}?path=${encodedPath}`;
        } else {
          const wfsPath = `/${workspace}/ows?${params.toString()}`;
          finalUrl = `${proxyBase}${wfsPath}`;
        }

        return finalUrl;
      },
      strategy: ol.loadingstrategy.bbox,
    });

    // Manejar errores de carga WFS
    vectorSource.on("featuresloaderror", (event) => {
      console.error("Error cargando features WFS:", event);
    });

    const interactionLayer = new ol.layer.Vector({
      source: vectorSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 0, 0)", // Completamente transparente
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)",
          width: 0,
        }),
      }),
      zIndex: 100,
    });

    interactionLayer.set("name", "Municipios-Interaction");
    interactionLayer.set("tipo", "wfs"); // Marcar como WFS para hover
    map.addLayer(interactionLayer);

    // Crear popup overlay
    this.setupClickPopup(map, interactionLayer);

    // Configurar hover para resaltar municipios
    this.setupMunicipiosHover(map, "map-3");
  }

  /**
   * Configurar hover de municipios para resaltar
   */
  setupMunicipiosHover(map, containerId) {
    const mapElement = document.getElementById(containerId);
    if (!mapElement) return;

    // Crear tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "municipio-hover-tooltip";
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      pointer-events: none;
      z-index: 1000;
      display: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    `;
    mapElement.appendChild(tooltip);

    // Variable para almacenar el feature actualmente resaltado
    let currentFeature = null;
    let defaultStyle = null;

    // Estilo de hover (borde lila grueso)
    const hoverStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#A21A5C",
        width: 4,
      }),
      fill: new ol.style.Fill({
        color: "rgba(162, 26, 92, 0.2)",
      }),
    });

    // Listener de movimiento del mouse
    map.on("pointermove", (evt) => {
      const pixel = map.getEventPixel(evt.originalEvent);

      // Restaurar estilo del feature anterior
      if (currentFeature) {
        currentFeature.setStyle(defaultStyle);
        currentFeature = null;
        tooltip.style.display = "none";
      }

      // Buscar feature bajo el cursor (solo capas WFS)
      map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer && layer.get("tipo") === "wfs") {
          currentFeature = feature;
          defaultStyle = feature.getStyle() || layer.getStyle();

          // Aplicar estilo de hover
          feature.setStyle(hoverStyle);

          // Obtener nombre del municipio
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
            "Municipio";

          // Actualizar tooltip
          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = "block";
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;

          return true; // Detener búsqueda
        }
      });
    });
  }

  /**
   * Configurar popup de click en el mapa
   */
  setupClickPopup(map, interactionLayer) {
    // Crear elemento del popup
    const popupElement = document.createElement("div");
    popupElement.className = "ol-popup";
    popupElement.innerHTML = `
      <div class="ol-popup-closer" id="popup-closer"></div>
      <div class="ol-popup-content" id="popup-content"></div>
    `;

    // Crear overlay
    const popup = new ol.Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(popup);

    // Cerrar popup
    popupElement.querySelector("#popup-closer").onclick = () => {
      popup.setPosition(undefined);
      return false;
    };

    // Click en el mapa
    map.on("click", (evt) => {
      const coordinate = evt.coordinate;
      let found = false;

      // Buscar feature en la capa de interacción
      map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (layer === interactionLayer) {
          const properties = feature.getProperties();

          // Buscar nombre del municipio
          const nombreMunicipio =
            properties.Municipio ||
            properties.MUNICIPIO ||
            properties.municipio ||
            properties.NOMGEO ||
            properties.nomgeo ||
            properties.NOM_MUN ||
            properties.nom_mun ||
            properties.nombre ||
            properties.NOMBRE;

          if (nombreMunicipio) {
            const nombreLower = nombreMunicipio.toLowerCase();
            const atlas = this.atlasData[nombreLower];

            // Solo mostrar popup si el municipio tiene atlas
            if (atlas) {
              const content = popupElement.querySelector("#popup-content");
              content.innerHTML = `
                <div style="padding: 0.5rem;">
                  <h3 style="margin: 0 0 0.5rem 0; color: #582574; font-size: 1rem;">
                    ${atlas.nombre}
                  </h3>
                  <p style="margin: 0 0 0.75rem 0; color: #666; font-size: 0.875rem;">
                    Año de publicación: <strong>${atlas.anio}</strong>
                  </p>
                  <a href="${atlas.link}" target="_blank"
                     style="display: inline-block; padding: 0.5rem 1rem; background: #582574;
                            color: white; text-decoration: none; border-radius: 6px;
                            font-size: 0.875rem; font-weight: 600;">
                    Ver Atlas de Riesgo
                  </a>
                </div>
              `;
              popup.setPosition(coordinate);
              found = true;
              return true;
            }
            // Si no tiene atlas, no hacer nada (no mostrar popup)
          }
        }
      });

      // Si no se encontró nada, cerrar popup
      if (!found) {
        popup.setPosition(undefined);
      }
    });

    // Cambiar cursor al pasar sobre municipios con atlas
    map.on("pointermove", (evt) => {
      let hasAtlas = false;

      map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        if (layer === interactionLayer) {
          const properties = feature.getProperties();
          const nombreMunicipio =
            properties.Municipio ||
            properties.MUNICIPIO ||
            properties.municipio ||
            properties.NOMGEO ||
            properties.nomgeo ||
            properties.NOM_MUN ||
            properties.nom_mun ||
            properties.nombre ||
            properties.NOMBRE;

          if (nombreMunicipio) {
            const nombreLower = nombreMunicipio.toLowerCase();
            hasAtlas = !!this.atlasData[nombreLower];
          }
          return true;
        }
      });

      map.getTargetElement().style.cursor = hasAtlas ? "pointer" : "";
    });
  }

  /**
   * Configurar hover sobre municipios para mostrar atlas
   * NOTA: GetFeatureInfo tiene problemas CORS, así que por ahora esta funcionalidad
   * está deshabilitada. Los usuarios pueden ver la lista completa de municipios
   * con atlas en la información de la card.
   */
  setupAtlasHover(map, municipiosLayer) {
    const atlasInfo = document.getElementById("atlas-info");
    if (!atlasInfo) {
      console.warn("No se encontró elemento #atlas-info");
      return;
    }

    // Mostrar lista de municipios con atlas disponibles
    const titleElement = atlasInfo.querySelector("h3");
    const descElement = atlasInfo.querySelector("p");

    //titleElement.textContent = 'Municipios con Atlas disponibles:';

    // Crear lista de municipios
    const municipiosList = Object.values(this.atlasData)
      .map(
        (atlas) => `<li><strong>${atlas.nombre}</strong> (${atlas.anio})</li>`
      )
      .join("");

    /*     descElement.innerHTML = `
      <ul style="list-style: none; padding-left: 0; margin: 0.5rem 0;">
        ${municipiosList}
      </ul>
      <p style="font-size: 0.85rem; margin-top: 0.5rem; color: #666;">
        Haz clic en los enlaces abajo para ver cada atlas.
      </p>
    `; */

    // Ocultar el enlace individual del atlas
    const linkElement = atlasInfo.querySelector("a.btn-atlas");
    if (linkElement) {
      linkElement.style.display = "none";
    }

    // Mostrar la información
    atlasInfo.style.display = "block";

    // Agregar botones para cada municipio
    this.addAtlasButtons(atlasInfo);
  }

  /**
   * Agregar botones para ver cada atlas municipal
   */
  addAtlasButtons(atlasInfo) {
    // Crear contenedor de botones si no existe
    let buttonsContainer = atlasInfo.querySelector(".atlas-buttons");
    if (!buttonsContainer) {
      buttonsContainer = document.createElement("div");
      buttonsContainer.className = "atlas-buttons";
      buttonsContainer.style.cssText =
        "display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; margin-top: 1rem;";
      atlasInfo.appendChild(buttonsContainer);
    }

    // Crear un botón para cada municipio
    Object.values(this.atlasData).forEach((atlas) => {
      const button = document.createElement("button");
      button.className = "btn-atlas-mini";
      button.style.cssText = `
        padding: 0.5rem 0.75rem;
        background: #a21a5c;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        box-shadow: 0 2px 4px rgba(88, 37, 116, 0.2);
      `;
      //button.textContent = atlas.nombre;
      button.textContent = `${atlas.nombre} - ${atlas.anio}`;
      button.title = `Ver Atlas de Riesgo de ${atlas.nombre} (${atlas.anio})`;

      button.addEventListener("click", () => {
        window.open(atlas.link, "_blank");
      });

      button.addEventListener("mouseenter", () => {
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 4px 8px rgba(88, 37, 116, 0.3)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "0 2px 4px rgba(88, 37, 116, 0.2)";
      });

      buttonsContainer.appendChild(button);
    });
  }
}

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new RiesgoApp();
  });
} else {
  new RiesgoApp();
}
