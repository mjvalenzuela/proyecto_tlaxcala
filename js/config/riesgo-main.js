/**
 * Script principal para riesgo.html
 * Gestiona navegación, mapas OpenLayers y atlas municipales
 */

class RiesgoApp {
  constructor() {
    this.config = window.RiesgoConfig;
    this.currentChapter = 1;
    this.maps = {};
    this.atlasData = {};

    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.setupNavbar();
    this.setupNavigation();
    this.setupAtlasButton();
    this.setupObservers();
    this.activateChapter(1);
  }

  /**
   * Configura el navbar
   */
  setupNavbar() {
    const navbar = document.querySelector(".navbar");
    const navbarIndicator = document.getElementById("navbarIndicator");
    const navbarToggle = document.getElementById("navbarToggle");
    const navbarMenu = document.getElementById("navbarMenu");

    navbarIndicator.addEventListener("mouseenter", () => {
      navbar.classList.add("visible");
    });

    navbar.addEventListener("mouseenter", () => {
      navbar.classList.add("visible");
    });

    navbar.addEventListener("mouseleave", () => {
      navbar.classList.remove("visible");
    });

    navbarIndicator.addEventListener("click", () => {
      navbar.classList.toggle("visible");
    });

    navbarToggle.addEventListener("click", () => {
      navbarToggle.classList.toggle("active");
      navbarMenu.classList.toggle("active");
      navbar.classList.add("visible");
    });

    const navbarLinks = document.querySelectorAll(".navbar-link");
    navbarLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navbarToggle.classList.remove("active");
        navbarMenu.classList.remove("active");
      });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  /**
   * Configura navegación del story map
   */
  setupNavigation() {
    const chaptersContainer = document.getElementById("chaptersContainer");
    const timelineItems = document.querySelectorAll(".timeline-item");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    timelineItems.forEach((item) => {
      item.addEventListener("click", () => {
        const chapterNumber = parseInt(item.dataset.chapter);
        this.activateChapter(chapterNumber);
      });
    });

    btnPrev.addEventListener("click", () => {
      this.activateChapter(this.currentChapter - 1);
    });

    btnNext.addEventListener("click", () => {
      this.activateChapter(this.currentChapter + 1);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        this.activateChapter(this.currentChapter - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        this.activateChapter(this.currentChapter + 1);
      }
    });

    let scrollTimeout;
    chaptersContainer.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const chapters = document.querySelectorAll(".chapter");
        const containerRect = chaptersContainer.getBoundingClientRect();

        chapters.forEach((chapter) => {
          const chapterRect = chapter.getBoundingClientRect();
          const chapterNumber = parseInt(chapter.dataset.chapter);

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
   * Activa un capítulo
   * @param {number} chapterNumber - Número del capítulo
   */
  activateChapter(chapterNumber) {
    if (
      chapterNumber < 1 ||
      chapterNumber > this.config.timeline.totalChapters
    ) {
      return;
    }

    this.currentChapter = chapterNumber;

    const chapter = document.getElementById(`risk-chapter-${chapterNumber}`);
    if (chapter) {
      chapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    this.updateTimelineAndButtons();
  }

  updateTimelineAndButtons() {
    const timelineItems = document.querySelectorAll(".timeline-item");
    const btnPrev = document.getElementById("btnPrev");
    const btnNext = document.getElementById("btnNext");

    timelineItems.forEach((item) => {
      const itemChapter = parseInt(item.dataset.chapter);
      if (itemChapter === this.currentChapter) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    btnPrev.disabled = this.currentChapter === 1;
    btnNext.disabled =
      this.currentChapter === this.config.timeline.totalChapters;
  }

  setupAtlasButton() {
    const btnAtlasRiesgo = document.getElementById("btnAtlasRiesgo");
    if (btnAtlasRiesgo) {
      btnAtlasRiesgo.addEventListener("click", () => {
        window.open(this.config.links.atlasEstatal, "_blank");
      });
    }

    this.setupAtlasMunicipalesButtons();
  }

  /**
   * Configura botones de Atlas Municipales
   */
  setupAtlasMunicipalesButtons() {
    const atlasMunicipales = {
      "Apizaco2011": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2011/29005_APIZACO_2011.PDF",
      "Atlangatepec2016": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2016/29003_ATLANGATEPEC_2016.PDF",
      "Huamantla2016": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2016/29013_HUAMANTLA_TLAX_2016.PDF",
      "Natívitas2015": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2015/29023_NATIVITAS_2015.PDF",
      "Papalotla-de-Xicohténcatl2015": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2015/29041_PAPALOTLA_XICOHTENCATL_2015.PDF",
      "SanPablo-del-Monte_2015": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2015/29025_SAN_PABLO_2015.PDF",
      "Sanctórum-de-LázaroCárdenas2011": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2011/29020_SANCTORUM_2011.PDF",
      "Tlaxcala2018": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2018/29033_TLAXCALA_2018.PDF",
      "Xicohtzinco2014": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2014/29042_XICOHTZINCO_2014.PDF",
      "Zacatelco2018": "http://rmgir.proyectomesoamerica.org/AtlasMunPDF/2018/29044_ZACATELCO_2018.PDF"
    };

    const riskButtons = document.querySelectorAll(".risk-btn");

    if (riskButtons.length === 0) {
      console.warn("No se encontraron botones .risk-btn");
      return;
    }

    riskButtons.forEach((button, index) => {
      const riskType = button.getAttribute("data-risk");
      const pdfUrl = atlasMunicipales[riskType];

      if (pdfUrl) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(pdfUrl, "_blank");
        });

        button.style.cursor = "pointer";
      } else {
        console.warn(`No se encontró URL para el botón con data-risk="${riskType}"`);
      }
    });
  }

  /**
   * Configura Intersection Observers para lazy loading de mapas
   */
  setupObservers() {
    const observerOptions = { threshold: 0.1 };

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

    const observerCap2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === "risk-chapter-2") {
          this.initMap(2);
        }
      });
    }, observerOptions);

    const chapter2 = document.getElementById("risk-chapter-2");
    if (chapter2) {
      observerCap2.observe(chapter2);
    }

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
   * Inicializa mapa de un capítulo
   * @param {number} chapterNumber - Número del capítulo
   */
  initMap(chapterNumber) {
    const capitulo = this.config.capitulos.find((c) => c.id === chapterNumber);

    if (!capitulo || !capitulo.mapId) {
      console.warn(
        `No hay configuración de mapa para capítulo ${chapterNumber}`
      );
      return;
    }

    if (this.maps[capitulo.mapId]) {
      return;
    }

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

    if (capitulo.capas) {
      capitulo.capas.forEach((capaConfig) => {
        const layer = this.createLayer(capaConfig);
        if (layer) {
          map.addLayer(layer);
        }
      });
    }

    this.maps[capitulo.mapId] = {
      map: map,
      layers: {},
    };

    if (chapterNumber === 3) {
      this.maps[capitulo.mapId].municipiosLayer = map
        .getLayers()
        .getArray()
        .find((layer) => layer.get("name") === "Municipios");

      this.addInteractionLayer(map);
    } else if (chapterNumber === 1 || chapterNumber === 2) {
      this.addHoverOnlyLayer(map, capitulo.mapId);
      this.generarControlesCapas(capitulo.mapId, capitulo.capas, chapterNumber);
    }
  }

  /**
   * Crea una capa de OpenLayers según configuración
   * @param {Object} config - Configuración de la capa
   * @returns {ol.layer.Layer|null}
   */
  createLayer(config) {
    if (config.tipo === "wms") {
      const layerParts = config.layer.split(":");
      const workspace = layerParts.length > 1 ? layerParts[0] : "SEICCT";

      const proxyBase = this.config.proxy.url;
      const isVercelProxy = proxyBase.includes("proxy?path=");

      let wmsUrl;
      let tileLoadFunction = null;

      if (isVercelProxy) {
        wmsUrl = proxyBase.replace("?path=", "");

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

      layer.set("name", config.nombre);

      return layer;
    }

    console.warn("Tipo de capa no soportado:", config.tipo);
    return null;
  }

  /**
   * Carga CSV de atlas municipales
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

        this.setupAtlasUI();
      },
      error: (error) => {
        console.error("Error al cargar links.csv:", error);
      },
    });
  }

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
   * Agrega capa WFS solo para hover (capítulos 1 y 2)
   * @param {ol.Map} map - Mapa OpenLayers
   * @param {string} mapId - ID del contenedor del mapa
   */
  addHoverOnlyLayer(map, mapId) {
    const proxyBase = this.config.proxy.url;
    const workspace = "SEICCT";
    const typeName = "SEICCT:municipios_ganaperd";
    const isVercelProxy = proxyBase.includes("proxy?path=");

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
          color: "rgba(0, 0, 0, 0)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)",
          width: 0,
        }),
      }),
      zIndex: 100,
    });

    interactionLayer.set("name", "Municipios-Hover");
    interactionLayer.set("tipo", "wfs");
    map.addLayer(interactionLayer);

    this.setupMunicipiosHover(map, mapId);
  }

  /**
   * Agrega capa WFS transparente para interacción con click
   * @param {ol.Map} map - Mapa OpenLayers
   */
  addInteractionLayer(map) {
    const proxyBase = this.config.proxy.url;
    const workspace = "SEICCT";
    const typeName = "SEICCT:municipios_ganaperd";
    const isVercelProxy = proxyBase.includes("proxy?path=");

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

    vectorSource.on("featuresloaderror", (event) => {
      console.error("Error cargando features WFS:", event);
    });

    const interactionLayer = new ol.layer.Vector({
      source: vectorSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(0, 0, 0, 0)",
        }),
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0)",
          width: 0,
        }),
      }),
      zIndex: 100,
    });

    interactionLayer.set("name", "Municipios-Interaction");
    interactionLayer.set("tipo", "wfs");
    map.addLayer(interactionLayer);

    this.setupClickPopup(map, interactionLayer);
    this.setupMunicipiosHover(map, "map-3");
  }

  /**
   * Configura hover de municipios para resaltar
   * @param {ol.Map} map - Mapa OpenLayers
   * @param {string} containerId - ID del contenedor
   */
  setupMunicipiosHover(map, containerId) {
    const mapElement = document.getElementById(containerId);
    if (!mapElement) return;

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

    map.on("pointermove", (evt) => {
      const pixel = map.getEventPixel(evt.originalEvent);

      if (currentFeature) {
        currentFeature.setStyle(defaultStyle);
        currentFeature = null;
        tooltip.style.display = "none";
      }

      map.forEachFeatureAtPixel(pixel, (feature, layer) => {
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
            "Municipio";

          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = "block";
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;

          return true;
        }
      });
    });
  }

  /**
   * Configura popup de click en el mapa
   * @param {ol.Map} map - Mapa OpenLayers
   * @param {ol.layer.Vector} interactionLayer - Capa de interacción
   */
  setupClickPopup(map, interactionLayer) {
    const popupElement = document.createElement("div");
    popupElement.className = "ol-popup";
    popupElement.innerHTML = `
      <div class="ol-popup-closer" id="popup-closer"></div>
      <div class="ol-popup-content" id="popup-content"></div>
    `;

    const popup = new ol.Overlay({
      element: popupElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(popup);

    popupElement.querySelector("#popup-closer").onclick = () => {
      popup.setPosition(undefined);
      return false;
    };

    map.on("click", (evt) => {
      const coordinate = evt.coordinate;
      let found = false;

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
            const atlas = this.atlasData[nombreLower];

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
          }
        }
      });

      if (!found) {
        popup.setPosition(undefined);
      }
    });

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

  setupAtlasHover(map, municipiosLayer) {
    const atlasInfo = document.getElementById("atlas-info");
    if (!atlasInfo) {
      console.warn("No se encontró elemento #atlas-info");
      return;
    }

    const titleElement = atlasInfo.querySelector("h3");
    const descElement = atlasInfo.querySelector("p");

    const municipiosList = Object.values(this.atlasData)
      .map(
        (atlas) => `<li><strong>${atlas.nombre}</strong> (${atlas.anio})</li>`
      )
      .join("");

    const linkElement = atlasInfo.querySelector("a.btn-atlas");
    if (linkElement) {
      linkElement.style.display = "none";
    }

    atlasInfo.style.display = "block";

    this.addAtlasButtons(atlasInfo);
  }

  addAtlasButtons(atlasInfo) {
    let buttonsContainer = atlasInfo.querySelector(".atlas-buttons");
    if (!buttonsContainer) {
      buttonsContainer = document.createElement("div");
      buttonsContainer.className = "atlas-buttons";
      buttonsContainer.style.cssText =
        "display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; margin-top: 1rem;";
      atlasInfo.appendChild(buttonsContainer);
    }

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

  /**
   * Genera controles de capas (checkboxes para mostrar/ocultar capas)
   * @param {string} mapId - ID del mapa
   * @param {Array} capasConfig - Configuración de capas
   * @param {number} chapterNumber - Número del capítulo
   */
  generarControlesCapas(mapId, capasConfig, chapterNumber) {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer || !mapContainer.parentElement) {
      console.warn(`No se encontró el contenedor para generar controles: ${mapId}`);
      return;
    }

    let controlsContainer = mapContainer.parentElement.querySelector('.map-controls');

    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'map-controls';
      mapContainer.parentElement.appendChild(controlsContainer);
    }

    controlsContainer.innerHTML = '<div class="map-controls-title">Capas</div>';

    const mapData = this.maps[mapId];
    if (!mapData || !mapData.map) {
      console.warn(`No se encontró el mapa: ${mapId}`);
      return;
    }

    const map = mapData.map;
    const layers = map.getLayers().getArray();

    capasConfig.forEach((capaConfig, index) => {
      const nombreCapa = capaConfig.nombre;

      if (nombreCapa.includes('(Interacción)') || nombreCapa.includes('Interacción')) {
        return;
      }

      if (capaConfig.leyenda === false) {
        return;
      }

      const visible = capaConfig.opacity > 0;
      const checkboxId = `layer-${index}-${chapterNumber}`;

      const layerControl = document.createElement('div');
      layerControl.className = 'layer-control';
      layerControl.innerHTML = `
        <input type="checkbox" id="${checkboxId}" ${visible ? 'checked' : ''} />
        <label for="${checkboxId}">${nombreCapa}</label>
      `;

      controlsContainer.appendChild(layerControl);

      const checkbox = layerControl.querySelector(`#${checkboxId}`);
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          const targetLayer = layers.find(layer => layer.get('name') === nombreCapa);
          if (targetLayer) {
            targetLayer.setVisible(e.target.checked);
          }
        });
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new RiesgoApp();
  });
} else {
  new RiesgoApp();
}
