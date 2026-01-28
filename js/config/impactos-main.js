/**
 * Script principal para impactos.html
 * Maneja mapas, capas y navegación
 * Capítulo 1: Layout mapa + texto (60%-40%)
 */

// ============================================================
// CONFIGURACION
// ============================================================

/**
 * Obtiene URL del proxy según entorno
 * @returns {string} URL del proxy
 */
const getProxyUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3011/geoserver";
  }

  if (hostname.includes("vercel.app")) {
    return "/api/proxy?path=";
  }

  console.warn(
    "Entorno desconocido - Usando conexión directa (puede tener problemas CORS)"
  );
  return "https://api.cambioclimaticotlaxcala.mx/geoserver";
};

// Simbologías para las capas de impactos
const simbologias = {
  'SEICCT:impactos_agricultura': {
    titulo: 'Impactos en Agricultura',
    tipo: 'polygon',
    categorias: [
      { label: 'Bajo', color: '#ffffcc', stroke: '#232323' },
      { label: 'Medio', color: '#a1dab4', stroke: '#232323' },
      { label: 'Alto', color: '#41b6c4', stroke: '#232323' },
      { label: 'Muy Alto', color: '#225ea8', stroke: '#232323' }
    ]
  },
  'SEICCT:impactos_salud': {
    titulo: 'Impactos en Salud',
    tipo: 'polygon',
    categorias: [
      { label: 'Bajo', color: '#fee5d9', stroke: '#232323' },
      { label: 'Medio', color: '#fcae91', stroke: '#232323' },
      { label: 'Alto', color: '#fb6a4a', stroke: '#232323' },
      { label: 'Muy Alto', color: '#cb181d', stroke: '#232323' }
    ]
  }
};

// Configuración de capas para el capítulo 1
const capasCapitulo1 = [
  { tipo: 'subtitulo', titulo: 'Capas Base' },
  {
    nombre: 'Límite Estatal',
    tipo: 'wms',
    layer: 'SEICCT:Limite',
    opacity: 1,
    visible: true,
    zIndex: 1,
    leyenda: false,
  },
  {
    nombre: 'Municipios',
    tipo: 'wms',
    layer: 'SEICCT:municipios_ganaperd',
    opacity: 0.7,
    visible: true,
    zIndex: 2,
    leyenda: false,
  },
  {
    nombre: 'Municipios (interacción)',
    tipo: 'wfs',
    layers: 'SEICCT:municipios_ganaperd',
    visible: true,
    leyenda: false,
  }
];

const proxyUrl = getProxyUrl();
const isVercelProxy = proxyUrl.includes('proxy?path=');

// ============================================================
// INICIALIZACION PRINCIPAL
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  // Objeto para almacenar todos los mapas
  const mapas = {};

  // Almacenar referencias a las capas
  const capasWMS = [];

  // ============================================================
  // CAPITULO 1 - MAPA DE IMPACTOS
  // ============================================================
  const map1 = new ol.Map({
    target: 'map-1',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
        zIndex: 0,
      }),
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
      zoom: 9.5,
    }),
    controls: ol.control.defaults.defaults({
      zoom: true,
      attribution: false,
    }),
  });

  mapas['map-1'] = map1;

  // Agregar capas WMS
  capasCapitulo1.forEach((capaConfig, index) => {
    if (capaConfig.tipo === 'subtitulo') {
      capasWMS.push(null);
      return;
    }

    if (capaConfig.tipo === 'wms') {
      const workspace = 'SEICCT';
      let wmsSource;

      if (isVercelProxy) {
        const basePath = `/geoserver/${workspace}/wms`;
        wmsSource = new ol.source.TileWMS({
          url: proxyUrl.replace('?path=', ''),
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'VERSION': '1.1.0',
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
          tileLoadFunction: function(imageTile, src) {
            const url = new URL(src, window.location.origin);
            const params = url.searchParams.toString();
            const fullPath = `${basePath}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer = new ol.layer.Tile({
        source: wmsSource,
        visible: capaConfig.visible || false,
        opacity: capaConfig.opacity || 1,
        zIndex: capaConfig.zIndex || index,
      });
      wmsLayer.set('name', capaConfig.nombre);
      map1.addLayer(wmsLayer);
      capasWMS.push(wmsLayer);
    }

    if (capaConfig.tipo === 'wfs') {
      const typeName = capaConfig.layers;
      const layerParts = typeName.split(':');
      const workspace = layerParts.length > 1 ? layerParts[0] : 'SEICCT';

      const vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: function(extent) {
          const params = new URLSearchParams({
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: typeName,
            outputFormat: 'application/json',
            srsname: 'EPSG:3857',
            bbox: `${extent.join(',')},EPSG:3857`
          });

          if (isVercelProxy) {
            const wfsPath = `/geoserver/${workspace}/ows?${params.toString()}`;
            const encodedPath = encodeURIComponent(wfsPath);
            return `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
          } else {
            return `${proxyUrl}/${workspace}/ows?${params.toString()}`;
          }
        },
        strategy: ol.loadingstrategy.bbox
      });

      const transparentStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0)',
          width: 0
        }),
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 0, 0)'
        })
      });

      const wfsLayer = new ol.layer.Vector({
        source: vectorSource,
        style: transparentStyle,
        visible: true,
        zIndex: 999
      });
      wfsLayer.set('name', capaConfig.nombre);
      wfsLayer.set('tipo', 'wfs');
      map1.addLayer(wfsLayer);

      configurarHoverMunicipios(map1);

      capasWMS.push(null);
    }
  });

  // Generar controles de capas
  generarControlesCapas(capasCapitulo1, capasWMS);

  /**
   * Configura el hover sobre municipios para mostrar tooltip
   * @param {ol.Map} mapa - Instancia del mapa de OpenLayers
   */
  function configurarHoverMunicipios(mapa) {
    const mapElement = document.getElementById('map-1');
    if (!mapElement) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'municipio-hover-tooltip';
    tooltip.style.display = 'none';
    mapElement.appendChild(tooltip);

    let currentFeature = null;
    let defaultStyle = null;

    const hoverStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#A21A5C',
        width: 3
      }),
      fill: new ol.style.Fill({
        color: 'rgba(162, 26, 92, 0.2)'
      })
    });

    mapa.on('pointermove', (evt) => {
      const pixel = mapa.getEventPixel(evt.originalEvent);

      if (currentFeature) {
        currentFeature.setStyle(defaultStyle);
        currentFeature = null;
        tooltip.style.display = 'none';
      }

      mapa.forEachFeatureAtPixel(pixel, (feature, layer) => {
        if (layer && layer.get('tipo') === 'wfs') {
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
            'Municipio';

          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = 'block';
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;

          return true;
        }
      });
    });
  }

  /**
   * Genera el panel de control de capas con checkboxes
   * @param {Array} capasConfig - Configuración de capas
   * @param {Array} capasWMS - Array de capas WMS de OpenLayers
   */
  function generarControlesCapas(capasConfig, capasWMS) {
    const mapContainer = document.getElementById('map-1');
    if (!mapContainer || !mapContainer.parentElement) return;

    let controlsContainer = mapContainer.parentElement.querySelector('.map-controls');
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'map-controls';
      mapContainer.parentElement.appendChild(controlsContainer);
    }

    controlsContainer.innerHTML = `
      <div class="map-controls-header">
        <div class="map-controls-title">Capas</div>
        <button class="map-controls-toggle" title="Ocultar/Mostrar capas">−</button>
      </div>
      <div class="map-controls-content"></div>
    `;

    const contentContainer = controlsContainer.querySelector('.map-controls-content');

    const toggleBtn = controlsContainer.querySelector('.map-controls-toggle');
    toggleBtn.addEventListener('click', () => {
      controlsContainer.classList.toggle('collapsed');
      toggleBtn.textContent = controlsContainer.classList.contains('collapsed') ? '+' : '−';
    });

    capasConfig.forEach((capaConfig, index) => {
      if (capaConfig.tipo === 'subtitulo') {
        const subtitulo = document.createElement('div');
        subtitulo.className = 'layer-group-title';
        subtitulo.textContent = capaConfig.titulo;
        contentContainer.appendChild(subtitulo);
        return;
      }

      if (capaConfig.nombre && capaConfig.nombre.includes('interacción')) {
        return;
      }

      if (capaConfig.leyenda === false) {
        return;
      }

      const checkboxId = `layer-${index}`;
      const isVisible = capaConfig.visible || false;
      const layerControl = document.createElement('div');
      layerControl.className = 'layer-control';
      layerControl.innerHTML = `
        <input type="checkbox" id="${checkboxId}" ${isVisible ? 'checked' : ''} />
        <label for="${checkboxId}">${capaConfig.nombre}</label>
      `;
      contentContainer.appendChild(layerControl);

      const checkbox = layerControl.querySelector(`#${checkboxId}`);
      if (checkbox && capasWMS[index]) {
        checkbox.addEventListener('change', (e) => {
          capasWMS[index].setVisible(e.target.checked);
          actualizarPanelLeyendas(capasConfig, capasWMS);
        });
      }
    });

    crearPanelLeyendas(mapContainer.parentElement);
    actualizarPanelLeyendas(capasConfig, capasWMS);
  }

  /**
   * Crea el panel de leyendas en el mapa
   * @param {HTMLElement} mapParent - Elemento padre donde se agregará el panel
   */
  function crearPanelLeyendas(mapParent) {
    let legendsContainer = mapParent.querySelector('.map-legends');
    if (!legendsContainer) {
      legendsContainer = document.createElement('div');
      legendsContainer.className = 'map-legends';
      legendsContainer.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyendas</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyendas">−</button>
        </div>
        <div class="map-legends-content"></div>
      `;
      mapParent.appendChild(legendsContainer);

      const toggleBtn = legendsContainer.querySelector('.map-legends-toggle');
      toggleBtn.addEventListener('click', () => {
        legendsContainer.classList.toggle('collapsed');
        toggleBtn.textContent = legendsContainer.classList.contains('collapsed') ? '+' : '−';
      });
    }
  }

  /**
   * Genera HTML de simbología manual desde configuración
   * @param {Object} simbologia - Configuración de simbología
   * @returns {string} HTML de la simbología
   */
  function generarSimbologiaHTML(simbologia) {
    let html = '<div class="legend-simbologia">';
    simbologia.categorias.forEach(cat => {
      html += `
        <div class="legend-categoria">
          <span class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke || '#333'};"></span>
          <span class="legend-label">${cat.label}</span>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  /**
   * Actualiza el panel de leyendas mostrando solo las capas activas
   * @param {Array} capasConfig - Configuración de capas
   * @param {Array} capasWMS - Array de capas WMS
   */
  function actualizarPanelLeyendas(capasConfig, capasWMS) {
    const legendsContent = document.querySelector('.map-legends-content');
    if (!legendsContent) return;

    legendsContent.innerHTML = '';
    let capasActivas = 0;

    capasConfig.forEach((capaConfig, index) => {
      if (capaConfig.tipo !== 'wms' || capaConfig.leyenda === false) return;
      if (capaConfig.nombre && capaConfig.nombre.includes('interacción')) return;

      const capa = capasWMS[index];
      if (capa && capa.getVisible()) {
        capasActivas++;

        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const legendTitle = document.createElement('div');
        legendTitle.className = 'legend-item-title';
        legendTitle.textContent = capaConfig.nombre;
        legendItem.appendChild(legendTitle);

        // Verificar si hay simbología manual definida
        const simbologia = simbologias[capaConfig.layer];
        if (simbologia) {
          const simbologiaContainer = document.createElement('div');
          simbologiaContainer.innerHTML = generarSimbologiaHTML(simbologia);
          legendItem.appendChild(simbologiaContainer.firstElementChild);
        } else {
          const legendImage = document.createElement('img');
          legendImage.className = 'legend-item-image';

          let legendUrl;
          const legendParams = `REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=${capaConfig.layer}&WIDTH=15&HEIGHT=15&LEGEND_OPTIONS=fontAntiAliasing:true;fontSize:11;dpi:96;forceLabels:on;fontName:Sans-Serif`;

          if (isVercelProxy) {
            const legendPath = `/geoserver/SEICCT/wms?${legendParams}`;
            const encodedLegendPath = encodeURIComponent(legendPath);
            legendUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedLegendPath}`;
          } else {
            legendUrl = `${proxyUrl}/SEICCT/wms?${legendParams}`;
          }

          legendImage.src = legendUrl;
          legendImage.alt = `Leyenda de ${capaConfig.nombre}`;
          legendItem.appendChild(legendImage);
        }

        legendsContent.appendChild(legendItem);
      }
    });

    if (capasActivas === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'map-legends-empty';
      emptyMessage.textContent = 'No hay capas activas';
      legendsContent.appendChild(emptyMessage);
    }
  }

  // ============================================================
  // NAVEGACION ENTRE CAPITULOS
  // ============================================================
  const chaptersContainer = document.getElementById("chaptersContainer");
  const timelineItems = document.querySelectorAll(".timeline-item");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  let currentChapter = 1;
  const totalChapters = 7;

  /**
   * Navega a un capítulo específico con scroll suave
   * @param {number} chapterNum - Número del capítulo
   */
  function goToChapter(chapterNum) {
    if (chapterNum < 1 || chapterNum > totalChapters) {
      return;
    }

    currentChapter = chapterNum;

    timelineItems.forEach(item => {
      const itemChapter = parseInt(item.dataset.chapter);
      if (itemChapter === currentChapter) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const targetChapter = document.getElementById(`chapter-${chapterNum}`);
    if (targetChapter) {
      targetChapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  timelineItems.forEach(item => {
    item.addEventListener("click", () => {
      const chapterNum = parseInt(item.dataset.chapter);
      goToChapter(chapterNum);
    });
  });

  btnPrev.addEventListener("click", () => {
    goToChapter(currentChapter - 1);
  });

  btnNext.addEventListener("click", () => {
    goToChapter(currentChapter + 1);
  });

  // Inicializar en capítulo 1
  goToChapter(1);

  // ============================================================
  // CAPITULO 4 - GRÁFICA DE INCENDIOS FORESTALES
  // ============================================================
  const ctxIncendios = document.getElementById('chart-incendios');
  if (ctxIncendios) {
    // Años desde 1970 hasta 2022
    const aniosIncendios = [];
    for (let y = 1970; y <= 2022; y++) {
      aniosIncendios.push(y);
    }

    // Datos de Superficie Quemada (ha) - barras naranjas
    const superficieQuemada = [
      5200, 2800, 3600, 1100, 2700, 2000, 1200, 4000, 2200, 2500, // 1970-1979
      800, 2400, 700, 7000, 4000, 2900, 5200, 2200, 2500, 4700,   // 1980-1989
      2300, 400, 300, 600, 800, 800, 400, 600, 8800, 300,         // 1990-1999
      1700, 400, 6200, 600, 4600, 800, 4500, 1300, 400, 7200,     // 2000-2009
      1300, 6600, 3200, 7200, 3000, 8000, 8000, 5200, 3500, 5900, // 2010-2019
      3200, 1200, 1200                                             // 2020-2022
    ];

    // Datos de Cantidad de Incendios Forestales - línea azul
    const cantidadIncendios = [
      150, 190, 175, 130, 145, 100, 60, 200, 145, 130,   // 1970-1979
      55, 115, 35, 200, 150, 120, 260, 115, 125, 240,    // 1980-1989
      115, 25, 20, 25, 40, 45, 25, 150, 440, 200,        // 1990-1999
      90, 155, 310, 120, 230, 220, 230, 355, 255, 400,   // 2000-2009
      310, 350, 405, 355, 155, 405, 405, 310, 260, 300,  // 2010-2019
      190, 135, 120                                       // 2020-2022
    ];

    new Chart(ctxIncendios.getContext('2d'), {
      type: 'bar',
      data: {
        labels: aniosIncendios,
        datasets: [
          {
            type: 'bar',
            label: 'Superficie Quemada (ha)',
            data: superficieQuemada,
            backgroundColor: 'rgba(255, 152, 0, 0.8)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 1,
            yAxisID: 'y',
            order: 2
          },
          {
            type: 'line',
            label: 'Cantidad de Incendios Forestales',
            data: cantidadIncendios,
            borderColor: 'rgba(33, 150, 243, 1)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            pointBorderColor: 'rgba(33, 150, 243, 1)',
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.1,
            fill: false,
            yAxisID: 'y1',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: false
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 }
            }
          },
          datalabels: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.dataset.yAxisID === 'y') {
                  return 'Superficie: ' + context.parsed.y.toLocaleString() + ' ha';
                } else {
                  return 'Incendios: ' + context.parsed.y;
                }
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: false
            },
            ticks: {
              maxRotation: 90,
              minRotation: 90,
              autoSkip: false,
              font: { size: 8 }
            },
            grid: {
              display: false
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            max: 10000,
            title: {
              display: true,
              text: 'Superficie Quemada (ha)',
              color: '#ff9800',
              font: { size: 11, weight: 'bold' }
            },
            ticks: {
              color: '#ff9800',
              stepSize: 2000,
              callback: function(value) {
                return value.toLocaleString();
              }
            },
            grid: {
              display: true,
              color: '#e0e0e0'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 500,
            title: {
              display: true,
              text: 'Número de Incendios',
              color: '#2196f3',
              font: { size: 11, weight: 'bold' }
            },
            ticks: {
              color: '#2196f3',
              stepSize: 100
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }
});
