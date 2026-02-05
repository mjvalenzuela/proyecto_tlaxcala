/**
 * impactos-main.js - Script principal para impactos.html
 * Funciones principales:
 *   - getProxyUrl(): Obtiene URL del proxy según entorno (local/vercel)
 *   - configurarHoverMunicipios(mapa): Activa tooltip al pasar sobre municipios
 *   - generarControlesCapas(config, capas): Crea panel de checkboxes para capas
 *   - crearPanelLeyendas(parent): Crea contenedor de leyendas
 *   - actualizarPanelLeyendas(config, capas): Actualiza leyendas visibles
 *   - goToChapter(num): Navega al capítulo indicado
 */

// CONFIGURACION
const getProxyUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3011/geoserver";
  }
  if (hostname.includes("vercel.app")) {
    return "/api/proxy?path=";
  }
  console.warn("Entorno desconocido - Usando conexión directa (puede tener problemas CORS)");
  return "https://api.cambioclimaticotlaxcala.mx/geoserver";
};

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
  },
  'SEICCT:Acuiferos': {
    titulo: 'Acuíferos',
    tipo: 'polygon',
    categorias: [
      { label: 'Alto Atoyac', color: '#1068cb', stroke: '#232323' },
      { label: 'Emiliano Zapata', color: '#e2484a', stroke: '#232323' },
      { label: 'Huamantla', color: '#deb47f', stroke: '#232323' },
      { label: 'Soltepec', color: '#dcf2b4', stroke: '#232323' }
    ]
  },
  'SEICCT:Cuerpos_Agua': {
    titulo: 'Cuerpos de Agua',
    tipo: 'polygon',
    categorias: [
      { label: 'Cuerpo de Agua', color: '#50e4f5', stroke: '#2d59e0' }
    ]
  },
  'SEICCT:Escurrimientos': {
    titulo: 'Escurrimientos',
    tipo: 'line',
    categorias: [
      { label: 'Orden 1', color: '#c9f3f8', stroke: '#c9f3f8' },
      { label: 'Orden 2', color: '#a1c9d5', stroke: '#a1c9d5' },
      { label: 'Orden 3', color: '#799eb2', stroke: '#799eb2' },
      { label: 'Orden 4', color: '#51738f', stroke: '#51738f' },
      { label: 'Orden 5', color: '#28486c', stroke: '#28486c' },
      { label: 'Orden 6', color: '#001d49', stroke: '#001d49' }
    ]
  },
  'SEICCT:rendimiento_hidrico_anual': {
    titulo: 'Rendimiento Hídrico Anual',
    tipo: 'polygon',
    categorias: [
      { label: '117 - 300 mm', color: '#673321', stroke: '#232323' },
      { label: '300 - 450 mm', color: '#cb9531', stroke: '#232323' },
      { label: '450 - 600 mm', color: '#fdf141', stroke: '#232323' },
      { label: '600 - 800 mm', color: '#89fa67', stroke: '#232323' },
      { label: '800 - 1058 mm', color: '#143180', stroke: '#232323' }
    ]
  },
  'SEICCT:rendimiento_hidrico_anual_cuenca': {
    titulo: 'Rendimiento Hídrico por Cuenca',
    tipo: 'polygon',
    categorias: [
      { label: '20 - 90', color: '#703101', stroke: '#232323' },
      { label: '90 - 110', color: '#b17003', stroke: '#232323' },
      { label: '110 - 120', color: '#f3af06', stroke: '#232323' },
      { label: '120 - 130', color: '#ffd404', stroke: '#232323' },
      { label: '130 - 140', color: '#fef301', stroke: '#232323' },
      { label: '140 - 160', color: '#c2ff00', stroke: '#232323' },
      { label: '160 - 190', color: '#63ff00', stroke: '#232323' },
      { label: '190 - 210', color: '#33c71d', stroke: '#232323' },
      { label: '210 - 240', color: '#276350', stroke: '#232323' },
      { label: '240 - 520', color: '#1b0082', stroke: '#232323' }
    ]
  },
  'SEICCT:cambio_rendimiento_hidrico_anual': {
    titulo: 'Cambio Rendimiento Hídrico',
    tipo: 'polygon',
    categorias: [
      { label: '-56 a -12', color: '#77382a', stroke: '#232323' },
      { label: '-12 a -6', color: '#cb9531', stroke: '#232323' },
      { label: '-6 a -4', color: '#efda3b', stroke: '#232323' },
      { label: '-4 a -2', color: '#89fa67', stroke: '#232323' },
      { label: '-2 a 0', color: '#4a815f', stroke: '#232323' },
      { label: '0 a 25', color: '#2b3758', stroke: '#232323' }
    ]
  },
  'SEICCT:concesiones_agua_superficiales': {
    titulo: 'Concesiones Agua Superficiales',
    tipo: 'point',
    categorias: [
      { label: '55 - 200,000 m³', color: '#dbb9ed', stroke: '#b261e0' },
      { label: '200,000 - 600,000 m³', color: '#cc96ea', stroke: '#b261e0' },
      { label: '600,000 - 1,500,000 m³', color: '#b261e0', stroke: '#8c4bb1' },
      { label: '1,500,000 - 2,940,000 m³', color: '#8c4bb1', stroke: '#6a3585' }
    ]
  },
  'SEICCT:concesiones_agua_subterraneas': {
    titulo: 'Concesiones Agua Subterráneas',
    tipo: 'point',
    categorias: [
      { label: '68 - 200,000 m³', color: '#7fb9f6', stroke: '#3e89d8' },
      { label: '200,000 - 600,000 m³', color: '#3e89d8', stroke: '#0357af' },
      { label: '600,000 - 1,500,000 m³', color: '#0357af', stroke: '#346293' },
      { label: '1,500,000 - 3,500,000 m³', color: '#346293', stroke: '#173b61' },
      { label: '3,500,000 - 7,446,640 m³', color: '#173b61', stroke: '#0d2240' }
    ]
  },
  'SEICCT:uso_de_suelo': {
    titulo: 'Uso de Suelo',
    tipo: 'polygon',
    categorias: [
      { label: 'Agricultura de temporal', color: '#c8c9be', stroke: '#232323' },
      { label: 'Cuerpo de agua', color: '#00dfff', stroke: '#232323' },
      { label: 'Pastizal halófilo', color: '#8deed7', stroke: '#232323' },
      { label: 'Sin vegetación aparente', color: '#d0d0d0', stroke: '#232323' },
      { label: 'Pastizal inducido', color: '#ece9b6', stroke: '#232323' },
      { label: 'Bosque cultivado', color: '#ff0600', stroke: '#232323' },
      { label: 'Matorral desértico rosétofilo', color: '#e1c0dd', stroke: '#232323' },
      { label: 'Matorral crasicaule', color: '#fa4fc1', stroke: '#232323' },
      { label: 'Bosque de táscate', color: '#dba46c', stroke: '#232323' },
      { label: 'Bosque de oyamel', color: '#e5d742', stroke: '#232323' },
      { label: 'Bosque de encino', color: '#abd143', stroke: '#232323' },
      { label: 'Bosque de encino pino', color: '#438a40', stroke: '#232323' },
      { label: 'Bosque de pino', color: '#3be131', stroke: '#232323' },
      { label: 'Bosque de pino encino', color: '#efb0bd', stroke: '#232323' },
      { label: 'Pradera de alta montaña', color: '#f7cdb6', stroke: '#232323' },
      { label: 'Zona urbana', color: '#000000', stroke: '#232323' }
    ]
  },
  'SEICCT:incendios_2011': { titulo: 'Áreas Quemadas 2011', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#ebe501', stroke: '#ebe501' }] },
  'SEICCT:incendios_2012': { titulo: 'Áreas Quemadas 2012', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#ff9c00', stroke: '#ff9c00' }] },
  'SEICCT:incendios_2013': { titulo: 'Áreas Quemadas 2013', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#ff5700', stroke: '#ff5700' }] },
  'SEICCT:incendios_2015': { titulo: 'Áreas Quemadas 2015', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#e53935', stroke: '#e53935' }] },
  'SEICCT:incendios_2016': { titulo: 'Áreas Quemadas 2016', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#d81b60', stroke: '#d81b60' }] },
  'SEICCT:incendios_2017': { titulo: 'Áreas Quemadas 2017', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#8e24aa', stroke: '#8e24aa' }] },
  'SEICCT:incendios_2018': { titulo: 'Áreas Quemadas 2018', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#5e35b1', stroke: '#5e35b1' }] },
  'SEICCT:incendios_2019': { titulo: 'Áreas Quemadas 2019', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#3949ab', stroke: '#3949ab' }] },
  'SEICCT:incendios_2020': { titulo: 'Áreas Quemadas 2020', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#1e88e5', stroke: '#1e88e5' }] },
  'SEICCT:incendios_2021': { titulo: 'Áreas Quemadas 2021', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#00897b', stroke: '#00897b' }] },
  'SEICCT:incendios_2022': { titulo: 'Áreas Quemadas 2022', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#43a047', stroke: '#43a047' }] },
  'SEICCT:incendios_2023': { titulo: 'Áreas Quemadas 2023', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#7cb342', stroke: '#7cb342' }] },
  'SEICCT:incendios_2024': { titulo: 'Áreas Quemadas 2024', tipo: 'polygon', categorias: [{ label: 'Área quemada', color: '#c0ca33', stroke: '#c0ca33' }] },
  'SEICCT:riesgo_descortezadores': {
    titulo: 'Riesgo de Descortezadores',
    tipo: 'polygon',
    categorias: [
      { label: 'Moderado', color: '#ffed00', stroke: '#232323' },
      { label: 'Alto', color: '#ff9900', stroke: '#232323' },
      { label: 'Muy Alto', color: '#c72225', stroke: '#232323' }
    ]
  },
  'SEICCT:riesgo_plantas_parasitas': {
    titulo: 'Riesgo de Plantas Parásitas',
    tipo: 'polygon',
    categorias: [
      { label: 'Bajo', color: '#00721e', stroke: '#232323' },
      { label: 'Moderado', color: '#ffed00', stroke: '#232323' },
      { label: 'Alto', color: '#ff9900', stroke: '#232323' },
      { label: 'Muy Alto', color: '#c72225', stroke: '#232323' }
    ]
  },
  'SEICCT:causas_degradacion': {
    titulo: 'Causas de Degradación',
    tipo: 'polygon',
    categorias: [
      { label: 'Actividades agrícolas', color: '#FFCCA7', stroke: '#232323' },
      { label: 'Actividades agrícolas / Sobrepastoreo', color: '#F1B661', stroke: '#232323' },
      { label: 'Actividades agrícolas / Sobrexplotación de la vegetación', color: '#CC9E89', stroke: '#232323' },
      { label: 'Deforestación y remoción de la vegetación', color: '#ED5B41', stroke: '#232323' },
      { label: 'Sobrepastoreo', color: '#9E7FA3', stroke: '#232323' },
      { label: 'Sobrepastoreo / Actividades agrícolas', color: '#DE9AE7', stroke: '#232323' },
      { label: 'Sobrepastoreo / Sobrexplotación de la vegetación', color: '#BBADBF', stroke: '#232323' }
    ]
  },
  'SEICCT:tipo_degradacion': {
    titulo: 'Tipo de Degradación',
    tipo: 'polygon',
    categorias: [
      { label: 'Degradación física por compactación', color: '#E565E5', stroke: '#232323' },
      { label: 'Degradación química por declinación de la fertilidad', color: '#BAEA77', stroke: '#232323' },
      { label: 'Erosión eólica con pérdida del suelo superficial', color: '#647ADD', stroke: '#232323' },
      { label: 'Erosión hídrica con deformación del terreno', color: '#E9461D', stroke: '#232323' },
      { label: 'Erosión hídrica con pérdida del suelo superficial', color: '#1DCD8A', stroke: '#232323' }
    ]
  },
  'SEICCT:grado_degradacion': {
    titulo: 'Grado de Degradación',
    tipo: 'polygon',
    categorias: [
      { label: 'Ligero', color: '#E1B66A', stroke: '#232323' },
      { label: 'Moderado', color: '#C07A29', stroke: '#232323' }
    ]
  }
};

const capasCapitulo1 = [
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
    nombre: 'Uso de Suelo',
    tipo: 'wms',
    layer: 'SEICCT:uso_de_suelo',
    opacity: 1,
    visible: true,
    zIndex: 3,
    leyenda: true,
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

// INICIALIZACION
window.addEventListener('DOMContentLoaded', () => {
  const mapas = {};
  const capasWMS = [];

  // CAPITULO 1 - MAPA
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
      zoom: 10.5,
    }),
    controls: ol.control.defaults.defaults({
      zoom: true,
      attribution: false,
    }),
  });

  mapas['map-1'] = map1;

  // Agregar capas WMS/WFS
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
        stroke: new ol.style.Stroke({ color: 'rgba(0, 0, 0, 0)', width: 0 }),
        fill: new ol.style.Fill({ color: 'rgba(0, 0, 0, 0)' })
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

  generarControlesCapas(capasCapitulo1, capasWMS);

  // Configura tooltip hover sobre municipios
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
      stroke: new ol.style.Stroke({ color: '#A21A5C', width: 3 }),
      fill: new ol.style.Fill({ color: 'rgba(162, 26, 92, 0.2)' })
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
            properties.Municipio || properties.MUNICIPIO || properties.municipio ||
            properties.nombre || properties.NOMBRE || properties.NOM_MUN ||
            properties.nom_mun || properties.NOMGEO || properties.nomgeo || 'Municipio';

          tooltip.textContent = nombreMunicipio;
          tooltip.style.display = 'block';
          tooltip.style.left = `${evt.originalEvent.offsetX + 15}px`;
          tooltip.style.top = `${evt.originalEvent.offsetY + 15}px`;
          return true;
        }
      });
    });
  }

  // Genera panel de control con checkboxes para capas
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

      if (capaConfig.nombre && capaConfig.nombre.includes('interacción')) return;
      if (capaConfig.leyenda === false) return;

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

  // Crea contenedor de leyendas
  function crearPanelLeyendas(mapParent) {
    let legendsContainer = mapParent.querySelector('.map-legends');
    if (!legendsContainer) {
      legendsContainer = document.createElement('div');
      legendsContainer.className = 'map-legends';
      legendsContainer.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
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

  // Genera HTML de simbología
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

  // Actualiza leyendas mostrando solo capas activas
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

  // CAPITULO 3 - MAPA DE HIDROLOGÍA
  const map3Container = document.getElementById('map-3');
  if (map3Container) {
    const map3 = new ol.Map({
      target: 'map-3',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10.5,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    // Configuración de capas para el mapa 3 - Hidrología
    const capasHidrologia = [
      { nombre: 'Acuíferos', layer: 'SEICCT:Acuiferos', visible: true, zIndex: 1, leyenda: true },
      { nombre: 'Cuerpos de Agua', layer: 'SEICCT:Cuerpos_Agua', visible: false, zIndex: 2, leyenda: true },
      { nombre: 'Escurrimientos', layer: 'SEICCT:Escurrimientos', visible: false, zIndex: 3, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual', layer: 'SEICCT:rendimiento_hidrico_anual', visible: false, zIndex: 4, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual por Cuenca', layer: 'SEICCT:rendimiento_hidrico_anual_cuenca', visible: false, zIndex: 5, leyenda: true },
      { nombre: 'Cambio Rendimiento Hídrico Anual', layer: 'SEICCT:cambio_rendimiento_hidrico_anual', visible: false, zIndex: 6, leyenda: true },
      { nombre: 'Concesiones Agua Superficiales', layer: 'SEICCT:concesiones_agua_superficiales', visible: false, zIndex: 7, leyenda: true },
      { nombre: 'Concesiones Agua Subterráneas', layer: 'SEICCT:concesiones_agua_subterraneas', visible: false, zIndex: 8, leyenda: true },
    ];

    const capasWMS3 = [];
    const workspace3 = 'SEICCT';

    // Crear capas WMS
    capasHidrologia.forEach((capaConfig) => {
      let wmsSource3;

      if (isVercelProxy) {
        const basePath3 = `/geoserver/${workspace3}/wms`;
        wmsSource3 = new ol.source.TileWMS({
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
            const fullPath = `${basePath3}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource3 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer3 = new ol.layer.Tile({
        source: wmsSource3,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer3.set('name', capaConfig.nombre);
      wmsLayer3.set('layerName', capaConfig.layer);
      map3.addLayer(wmsLayer3);
      capasWMS3.push(wmsLayer3);
    });

    // Crear control de capas para mapa 3
    const mapElement3 = document.getElementById('map-3');
    if (mapElement3) {
      let controlsContainer3 = document.createElement('div');
      controlsContainer3.className = 'map-controls';
      controlsContainer3.id = 'map-controls-3';
      mapElement3.appendChild(controlsContainer3);

      controlsContainer3.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer3 = controlsContainer3.querySelector('.map-controls-content');
      const toggleBtn3 = controlsContainer3.querySelector('.map-controls-toggle');

      toggleBtn3.addEventListener('click', () => {
        controlsContainer3.classList.toggle('collapsed');
        toggleBtn3.textContent = controlsContainer3.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer3 = document.createElement('div');
      legendsContainer3.className = 'map-legends';
      legendsContainer3.id = 'map-legends-3';
      mapElement3.appendChild(legendsContainer3);

      legendsContainer3.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent3 = legendsContainer3.querySelector('.map-legends-content');
      const legendsToggleBtn3 = legendsContainer3.querySelector('.map-legends-toggle');

      legendsToggleBtn3.addEventListener('click', () => {
        legendsContainer3.classList.toggle('collapsed');
        legendsToggleBtn3.textContent = legendsContainer3.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Función para actualizar leyendas usando simbologías
      function actualizarLeyendas3() {
        legendsContent3.innerHTML = '';
        capasHidrologia.forEach((capaConfig, index) => {
          const layer = capasWMS3[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-3-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';

                if (simbologia.tipo === 'line') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-line" style="background-color: ${cat.color};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else if (simbologia.tipo === 'point') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-point" style="background-color: ${cat.color}; border: 2px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else {
                  categoria.innerHTML = `
                    <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                }
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent3.appendChild(legendItem);
            }
          }
        });

        if (legendsContent3.children.length === 0) {
          legendsContent3.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      // Crear checkboxes para cada capa
      capasHidrologia.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-3-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer3.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS3[index].setVisible(e.target.checked);
          actualizarLeyendas3();
        });
      });

      // Inicializar leyendas
      actualizarLeyendas3();
    }

    mapas['map-3'] = map3;
  }

  // CAPITULO 4 - MAPA DE HIDROLOGÍA 2
  const map4Container = document.getElementById('map-4');
  if (map4Container) {
    const map4 = new ol.Map({
      target: 'map-4',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10.5,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    // Configuración de capas para el mapa 4 - Hidrología 2
    const capasHidrologia4 = [
      { nombre: 'Acuíferos', layer: 'SEICCT:Acuiferos', visible: true, zIndex: 1, leyenda: true },
      { nombre: 'Cuerpos de Agua', layer: 'SEICCT:Cuerpos_Agua', visible: false, zIndex: 2, leyenda: true },
      { nombre: 'Escurrimientos', layer: 'SEICCT:Escurrimientos', visible: false, zIndex: 3, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual', layer: 'SEICCT:rendimiento_hidrico_anual', visible: false, zIndex: 4, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual por Cuenca', layer: 'SEICCT:rendimiento_hidrico_anual_cuenca', visible: false, zIndex: 5, leyenda: true },
      { nombre: 'Cambio Rendimiento Hídrico Anual', layer: 'SEICCT:cambio_rendimiento_hidrico_anual', visible: false, zIndex: 6, leyenda: true },
      { nombre: 'Concesiones Agua Superficiales', layer: 'SEICCT:concesiones_agua_superficiales', visible: false, zIndex: 7, leyenda: true },
      { nombre: 'Concesiones Agua Subterráneas', layer: 'SEICCT:concesiones_agua_subterraneas', visible: false, zIndex: 8, leyenda: true },
    ];

    const capasWMS4 = [];
    const workspace4 = 'SEICCT';

    // Crear capas WMS
    capasHidrologia4.forEach((capaConfig) => {
      let wmsSource4;

      if (isVercelProxy) {
        const basePath4 = `/geoserver/${workspace4}/wms`;
        wmsSource4 = new ol.source.TileWMS({
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
            const fullPath = `${basePath4}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource4 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer4 = new ol.layer.Tile({
        source: wmsSource4,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer4.set('name', capaConfig.nombre);
      wmsLayer4.set('layerName', capaConfig.layer);
      map4.addLayer(wmsLayer4);
      capasWMS4.push(wmsLayer4);
    });

    // Crear control de capas para mapa 4
    const mapElement4 = document.getElementById('map-4');
    if (mapElement4) {
      let controlsContainer4 = document.createElement('div');
      controlsContainer4.className = 'map-controls';
      controlsContainer4.id = 'map-controls-4';
      mapElement4.appendChild(controlsContainer4);

      controlsContainer4.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer4 = controlsContainer4.querySelector('.map-controls-content');
      const toggleBtn4 = controlsContainer4.querySelector('.map-controls-toggle');

      toggleBtn4.addEventListener('click', () => {
        controlsContainer4.classList.toggle('collapsed');
        toggleBtn4.textContent = controlsContainer4.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer4 = document.createElement('div');
      legendsContainer4.className = 'map-legends';
      legendsContainer4.id = 'map-legends-4';
      mapElement4.appendChild(legendsContainer4);

      legendsContainer4.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent4 = legendsContainer4.querySelector('.map-legends-content');
      const legendsToggleBtn4 = legendsContainer4.querySelector('.map-legends-toggle');

      legendsToggleBtn4.addEventListener('click', () => {
        legendsContainer4.classList.toggle('collapsed');
        legendsToggleBtn4.textContent = legendsContainer4.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Función para actualizar leyendas usando simbologías
      function actualizarLeyendas4() {
        legendsContent4.innerHTML = '';
        capasHidrologia4.forEach((capaConfig, index) => {
          const layer = capasWMS4[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-4-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';

                if (simbologia.tipo === 'line') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-line" style="background-color: ${cat.color};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else if (simbologia.tipo === 'point') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-point" style="background-color: ${cat.color}; border: 2px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else {
                  categoria.innerHTML = `
                    <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                }
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent4.appendChild(legendItem);
            }
          }
        });

        if (legendsContent4.children.length === 0) {
          legendsContent4.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      // Crear checkboxes para cada capa
      capasHidrologia4.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-4-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer4.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS4[index].setVisible(e.target.checked);
          actualizarLeyendas4();
        });
      });

      // Inicializar leyendas
      actualizarLeyendas4();
    }

    mapas['map-4'] = map4;
  }

  // CAPITULO 5 - MAPA DE HIDROLOGÍA 3
  const map5Container = document.getElementById('map-5');
  if (map5Container) {
    const map5 = new ol.Map({
      target: 'map-5',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10.5,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    // Configuración de capas para el mapa 5 - Hidrología 3
    const capasHidrologia5 = [
      { nombre: 'Acuíferos', layer: 'SEICCT:Acuiferos', visible: false, zIndex: 1, leyenda: true },
      { nombre: 'Cuerpos de Agua', layer: 'SEICCT:Cuerpos_Agua', visible: false, zIndex: 2, leyenda: true },
      { nombre: 'Escurrimientos', layer: 'SEICCT:Escurrimientos', visible: false, zIndex: 3, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual', layer: 'SEICCT:rendimiento_hidrico_anual', visible: false, zIndex: 4, leyenda: true },
      { nombre: 'Rendimiento Hídrico Anual por Cuenca', layer: 'SEICCT:rendimiento_hidrico_anual_cuenca', visible: false, zIndex: 5, leyenda: true },
      { nombre: 'Cambio Rendimiento Hídrico Anual', layer: 'SEICCT:cambio_rendimiento_hidrico_anual', visible: true, zIndex: 6, leyenda: true },
      { nombre: 'Concesiones Agua Superficiales', layer: 'SEICCT:concesiones_agua_superficiales', visible: false, zIndex: 7, leyenda: true },
      { nombre: 'Concesiones Agua Subterráneas', layer: 'SEICCT:concesiones_agua_subterraneas', visible: false, zIndex: 8, leyenda: true },
    ];

    const capasWMS5 = [];
    const workspace5 = 'SEICCT';

    // Crear capas WMS
    capasHidrologia5.forEach((capaConfig) => {
      let wmsSource5;

      if (isVercelProxy) {
        const basePath5 = `/geoserver/${workspace5}/wms`;
        wmsSource5 = new ol.source.TileWMS({
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
            const fullPath = `${basePath5}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource5 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer5 = new ol.layer.Tile({
        source: wmsSource5,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer5.set('name', capaConfig.nombre);
      wmsLayer5.set('layerName', capaConfig.layer);
      map5.addLayer(wmsLayer5);
      capasWMS5.push(wmsLayer5);
    });

    // Crear control de capas para mapa 5
    const mapElement5 = document.getElementById('map-5');
    if (mapElement5) {
      let controlsContainer5 = document.createElement('div');
      controlsContainer5.className = 'map-controls';
      controlsContainer5.id = 'map-controls-5';
      mapElement5.appendChild(controlsContainer5);

      controlsContainer5.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer5 = controlsContainer5.querySelector('.map-controls-content');
      const toggleBtn5 = controlsContainer5.querySelector('.map-controls-toggle');

      toggleBtn5.addEventListener('click', () => {
        controlsContainer5.classList.toggle('collapsed');
        toggleBtn5.textContent = controlsContainer5.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer5 = document.createElement('div');
      legendsContainer5.className = 'map-legends';
      legendsContainer5.id = 'map-legends-5';
      mapElement5.appendChild(legendsContainer5);

      legendsContainer5.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent5 = legendsContainer5.querySelector('.map-legends-content');
      const legendsToggleBtn5 = legendsContainer5.querySelector('.map-legends-toggle');

      legendsToggleBtn5.addEventListener('click', () => {
        legendsContainer5.classList.toggle('collapsed');
        legendsToggleBtn5.textContent = legendsContainer5.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Función para actualizar leyendas usando simbologías
      function actualizarLeyendas5() {
        legendsContent5.innerHTML = '';
        capasHidrologia5.forEach((capaConfig, index) => {
          const layer = capasWMS5[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-5-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';

                if (simbologia.tipo === 'line') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-line" style="background-color: ${cat.color};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else if (simbologia.tipo === 'point') {
                  categoria.innerHTML = `
                    <div class="legend-simbolo legend-point" style="background-color: ${cat.color}; border: 2px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                } else {
                  categoria.innerHTML = `
                    <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                    <span class="legend-label">${cat.label}</span>
                  `;
                }
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent5.appendChild(legendItem);
            }
          }
        });

        if (legendsContent5.children.length === 0) {
          legendsContent5.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      // Crear checkboxes para cada capa
      capasHidrologia5.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-5-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer5.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS5[index].setVisible(e.target.checked);
          actualizarLeyendas5();
        });
      });

      // Inicializar leyendas
      actualizarLeyendas5();
    }

    mapas['map-5'] = map5;
  }

  // CAPITULO 5 - GRÁFICA DE DEMANDA DE AGUA (Hidrología 3)
  const ctxDemandaAgua = document.getElementById('chart-demanda-agua');
  if (ctxDemandaAgua) {
    // Plugin para dibujar líneas divisorias punteadas entre categorías
    const verticalLinesPlugin = {
      id: 'verticalLines',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const yAxis = chart.scales.y;

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;

        // Dibujar líneas entre cada categoría
        const ticksCount = xAxis.ticks.length;
        for (let i = 0; i < ticksCount - 1; i++) {
          const x1 = xAxis.getPixelForTick(i);
          const x2 = xAxis.getPixelForTick(i + 1);
          const xMid = (x1 + x2) / 2;

          ctx.beginPath();
          ctx.moveTo(xMid, yAxis.top);
          ctx.lineTo(xMid, yAxis.bottom);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    new Chart(ctxDemandaAgua.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [
          ['Público urbano', 'y doméstico'],
          'Agrícola',
          'Industrial',
          'Servicios'
        ],
        datasets: [
          {
            label: '2023',
            data: [92330299, 138990063, 166283339.52, 1411405.40],
            backgroundColor: '#e68a00',
            borderColor: '#cc7a00',
            borderWidth: 0
          },
          {
            label: '2060',
            data: [115003091, 199450000, 30987176, 1750714],
            backgroundColor: '#f5b84a',
            borderColor: '#e0a63d',
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: { size: 11, weight: 'bold' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15
            }
          },
          datalabels: {
            display: true,
            color: '#333',
            font: { size: 9, weight: 'bold' },
            rotation: -90,
            anchor: function(context) {
              const value = context.dataset.data[context.dataIndex];
              // Barras pequeñas (Servicios y Industrial 2060) muestran valor arriba
              if (value < 50000000) {
                return 'end';
              }
              return 'center';
            },
            align: function(context) {
              const value = context.dataset.data[context.dataIndex];
              // Barras pequeñas alinean arriba (fuera de la barra)
              if (value < 50000000) {
                return 'end';
              }
              return 'center';
            },
            offset: function(context) {
              const value = context.dataset.data[context.dataIndex];
              if (value < 50000000) {
                return 4;
              }
              return 0;
            },
            formatter: (value) => {
              // Formatear números con separador de miles
              if (value >= 1000000) {
                return Math.round(value).toLocaleString('es-MX');
              }
              return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} m³`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#333',
              font: { size: 10, weight: 'bold' },
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            }
          },
          y: {
            beginAtZero: true,
            max: 200000000,
            grid: { color: 'rgba(0,0,0,0.15)' },
            ticks: {
              color: '#333',
              font: { size: 10 },
              stepSize: 40000000,
              callback: (value) => {
                if (value === 0) return '0';
                return (value / 1000000) + 'M';
              }
            }
          }
        }
      },
      plugins: [ChartDataLabels, verticalLinesPlugin]
    });
  }

  // CAPITULO 6 - MAPA DE INCENDIOS FORESTALES
  const map6Container = document.getElementById('map-6');
  if (map6Container) {
    const map6 = new ol.Map({
      target: 'map-6',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          }),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    const capasIncendios = [
      { nombre: 'Límite Municipal', layer: 'SEICCT:Limite', visible: true, zIndex: 15, leyenda: false },
      { nombre: 'Uso de Suelo', layer: 'SEICCT:uso_de_suelo', visible: true, zIndex: 1, leyenda: true },
      { nombre: 'Áreas Quemadas 2011', layer: 'SEICCT:incendios_2011', visible: false, zIndex: 2, leyenda: true },
      { nombre: 'Áreas Quemadas 2012', layer: 'SEICCT:incendios_2012', visible: false, zIndex: 3, leyenda: true },
      { nombre: 'Áreas Quemadas 2013', layer: 'SEICCT:incendios_2013', visible: false, zIndex: 4, leyenda: true },
      { nombre: 'Áreas Quemadas 2015', layer: 'SEICCT:incendios_2015', visible: false, zIndex: 5, leyenda: true },
      { nombre: 'Áreas Quemadas 2016', layer: 'SEICCT:incendios_2016', visible: false, zIndex: 6, leyenda: true },
      { nombre: 'Áreas Quemadas 2017', layer: 'SEICCT:incendios_2017', visible: false, zIndex: 7, leyenda: true },
      { nombre: 'Áreas Quemadas 2018', layer: 'SEICCT:incendios_2018', visible: false, zIndex: 8, leyenda: true },
      { nombre: 'Áreas Quemadas 2019', layer: 'SEICCT:incendios_2019', visible: false, zIndex: 9, leyenda: true },
      { nombre: 'Áreas Quemadas 2020', layer: 'SEICCT:incendios_2020', visible: false, zIndex: 10, leyenda: true },
      { nombre: 'Áreas Quemadas 2021', layer: 'SEICCT:incendios_2021', visible: false, zIndex: 11, leyenda: true },
      { nombre: 'Áreas Quemadas 2022', layer: 'SEICCT:incendios_2022', visible: false, zIndex: 12, leyenda: true },
      { nombre: 'Áreas Quemadas 2023', layer: 'SEICCT:incendios_2023', visible: false, zIndex: 13, leyenda: true },
      { nombre: 'Áreas Quemadas 2024', layer: 'SEICCT:incendios_2024', visible: false, zIndex: 14, leyenda: true },
    ];

    const capasWMS6 = [];
    const workspace6 = 'SEICCT';

    capasIncendios.forEach((capaConfig) => {
      let wmsSource6;

      // Las capas de incendios tienen CRS nativo EPSG:404000 (indefinido)
      // y GeoServer no puede reproyectarlas a EPSG:3857.
      // Se solicitan en EPSG:4326 y OpenLayers reproyecta del lado del cliente.
      const esCapaIncendio = capaConfig.layer.includes('incendios_');
      const sourceProjection = esCapaIncendio ? 'EPSG:4326' : undefined;

      if (isVercelProxy) {
        const basePath6 = `/geoserver/${workspace6}/wms`;
        wmsSource6 = new ol.source.TileWMS({
          url: proxyUrl.replace('?path=', ''),
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'VERSION': '1.1.0',
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          projection: sourceProjection,
          serverType: 'geoserver',
          crossOrigin: 'anonymous',
          tileLoadFunction: function(imageTile, src) {
            const url = new URL(src, window.location.origin);
            const params = url.searchParams.toString();
            const fullPath = `${basePath6}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource6 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          projection: sourceProjection,
          serverType: 'geoserver',
        });
      }

      const wmsLayer6 = new ol.layer.Tile({
        source: wmsSource6,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer6.set('name', capaConfig.nombre);
      wmsLayer6.set('layerName', capaConfig.layer);
      map6.addLayer(wmsLayer6);
      capasWMS6.push(wmsLayer6);
    });

    // Crear control de capas para mapa 6
    const mapElement6 = document.getElementById('map-6');
    if (mapElement6) {
      let controlsContainer6 = document.createElement('div');
      controlsContainer6.className = 'map-controls';
      controlsContainer6.id = 'map-controls-6';
      mapElement6.appendChild(controlsContainer6);

      controlsContainer6.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer6 = controlsContainer6.querySelector('.map-controls-content');
      const toggleBtn6 = controlsContainer6.querySelector('.map-controls-toggle');

      toggleBtn6.addEventListener('click', () => {
        controlsContainer6.classList.toggle('collapsed');
        toggleBtn6.textContent = controlsContainer6.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer6 = document.createElement('div');
      legendsContainer6.className = 'map-legends';
      legendsContainer6.id = 'map-legends-6';
      mapElement6.appendChild(legendsContainer6);

      legendsContainer6.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent6 = legendsContainer6.querySelector('.map-legends-content');
      const legendsToggleBtn6 = legendsContainer6.querySelector('.map-legends-toggle');

      legendsToggleBtn6.addEventListener('click', () => {
        legendsContainer6.classList.toggle('collapsed');
        legendsToggleBtn6.textContent = legendsContainer6.classList.contains('collapsed') ? '▼' : '▲';
      });

      function actualizarLeyendas6() {
        legendsContent6.innerHTML = '';
        capasIncendios.forEach((capaConfig, index) => {
          const layer = capasWMS6[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-6-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';
                categoria.innerHTML = `
                  <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                  <span class="legend-label">${cat.label}</span>
                `;
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent6.appendChild(legendItem);
            }
          }
        });

        if (legendsContent6.children.length === 0) {
          legendsContent6.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      capasIncendios.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-6-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer6.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS6[index].setVisible(e.target.checked);
          actualizarLeyendas6();
        });
      });

      actualizarLeyendas6();
    }

    mapas['map-6'] = map6;
  }

  // ============================================================
  // CAPITULO 7 - MAPA DE PLAGAS Y ENFERMEDADES FORESTALES
  // ============================================================
  const map7Container = document.getElementById('map-7');
  if (map7Container) {
    const map7 = new ol.Map({
      target: 'map-7',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          }),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    const capasPlagas = [
      { nombre: 'Límite Municipal', layer: 'SEICCT:Limite', visible: true, zIndex: 15, leyenda: false },
      { nombre: 'Uso de Suelo', layer: 'SEICCT:uso_de_suelo', visible: true, zIndex: 1, leyenda: true },
      { nombre: 'Riesgo de Descortezadores', layer: 'SEICCT:riesgo_descortezadores', visible: false, zIndex: 2, leyenda: true },
      { nombre: 'Riesgo de Plantas Parásitas', layer: 'SEICCT:riesgo_plantas_parasitas', visible: false, zIndex: 3, leyenda: true },
    ];

    const capasWMS7 = [];
    const workspace7 = 'SEICCT';

    capasPlagas.forEach((capaConfig) => {
      let wmsSource7;

      if (isVercelProxy) {
        const basePath7 = `/geoserver/${workspace7}/wms`;
        wmsSource7 = new ol.source.TileWMS({
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
            const fullPath = `${basePath7}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource7 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer7 = new ol.layer.Tile({
        source: wmsSource7,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer7.set('name', capaConfig.nombre);
      wmsLayer7.set('layerName', capaConfig.layer);
      map7.addLayer(wmsLayer7);
      capasWMS7.push(wmsLayer7);
    });

    // Crear control de capas para mapa 7
    const mapElement7 = document.getElementById('map-7');
    if (mapElement7) {
      let controlsContainer7 = document.createElement('div');
      controlsContainer7.className = 'map-controls';
      controlsContainer7.id = 'map-controls-7';
      mapElement7.appendChild(controlsContainer7);

      controlsContainer7.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer7 = controlsContainer7.querySelector('.map-controls-content');
      const toggleBtn7 = controlsContainer7.querySelector('.map-controls-toggle');

      toggleBtn7.addEventListener('click', () => {
        controlsContainer7.classList.toggle('collapsed');
        toggleBtn7.textContent = controlsContainer7.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer7 = document.createElement('div');
      legendsContainer7.className = 'map-legends';
      legendsContainer7.id = 'map-legends-7';
      mapElement7.appendChild(legendsContainer7);

      legendsContainer7.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent7 = legendsContainer7.querySelector('.map-legends-content');
      const legendsToggleBtn7 = legendsContainer7.querySelector('.map-legends-toggle');

      legendsToggleBtn7.addEventListener('click', () => {
        legendsContainer7.classList.toggle('collapsed');
        legendsToggleBtn7.textContent = legendsContainer7.classList.contains('collapsed') ? '▼' : '▲';
      });

      function actualizarLeyendas7() {
        legendsContent7.innerHTML = '';
        capasPlagas.forEach((capaConfig, index) => {
          const layer = capasWMS7[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-7-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';
                categoria.innerHTML = `
                  <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                  <span class="legend-label">${cat.label}</span>
                `;
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent7.appendChild(legendItem);
            }
          }
        });

        if (legendsContent7.children.length === 0) {
          legendsContent7.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      capasPlagas.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-7-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer7.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS7[index].setVisible(e.target.checked);
          actualizarLeyendas7();
        });
      });

      actualizarLeyendas7();
    }

    mapas['map-7'] = map7;
  }

  // ============================================================
  // CAPITULO 8 - MAPA DE DEGRADACIÓN DEL SUELO
  // ============================================================
  const map8Container = document.getElementById('map-8');
  if (map8Container) {
    const map8 = new ol.Map({
      target: 'map-8',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          }),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-98.16560203447955, 19.42964878131165]),
        zoom: 10,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    const capasMap8 = [
      { nombre: 'Límite Municipal', layer: 'SEICCT:Limite', visible: true, zIndex: 1, leyenda: false },
      { nombre: 'Causas de Degradación', layer: 'SEICCT:causas_degradacion', visible: true, zIndex: 2, leyenda: true },
      { nombre: 'Tipo de Degradación', layer: 'SEICCT:tipo_degradacion', visible: false, zIndex: 3, leyenda: true },
      { nombre: 'Grado de Degradación', layer: 'SEICCT:grado_degradacion', visible: false, zIndex: 4, leyenda: true },
    ];

    const capasWMS8 = [];

    capasMap8.forEach((capaConfig) => {
      let wmsSource8;

      if (isVercelProxy) {
        const basePath8 = '/geoserver/SEICCT/wms';
        wmsSource8 = new ol.source.TileWMS({
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
            const fullPath = `${basePath8}?${params}`;
            const encodedPath = encodeURIComponent(fullPath);
            const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
            imageTile.getImage().src = finalUrl;
          },
        });
      } else {
        wmsSource8 = new ol.source.TileWMS({
          url: proxyUrl + '/SEICCT/wms',
          params: {
            'LAYERS': capaConfig.layer,
            'TILED': true,
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
          },
          serverType: 'geoserver',
        });
      }

      const wmsLayer8 = new ol.layer.Tile({
        source: wmsSource8,
        opacity: 1,
        zIndex: capaConfig.zIndex,
        visible: capaConfig.visible,
      });
      wmsLayer8.set('name', capaConfig.nombre);
      wmsLayer8.set('layerName', capaConfig.layer);
      map8.addLayer(wmsLayer8);
      capasWMS8.push(wmsLayer8);
    });

    // Crear control de capas para mapa 8
    const mapElement8 = document.getElementById('map-8');
    if (mapElement8) {
      let controlsContainer8 = document.createElement('div');
      controlsContainer8.className = 'map-controls';
      controlsContainer8.id = 'map-controls-8';
      mapElement8.appendChild(controlsContainer8);

      controlsContainer8.innerHTML = `
        <div class="map-controls-header">
          <div class="map-controls-title">Capas</div>
          <button class="map-controls-toggle" title="Ocultar/Mostrar capas">▲</button>
        </div>
        <div class="map-controls-content"></div>
      `;

      const contentContainer8 = controlsContainer8.querySelector('.map-controls-content');
      const toggleBtn8 = controlsContainer8.querySelector('.map-controls-toggle');

      toggleBtn8.addEventListener('click', () => {
        controlsContainer8.classList.toggle('collapsed');
        toggleBtn8.textContent = controlsContainer8.classList.contains('collapsed') ? '▼' : '▲';
      });

      // Crear panel de leyendas
      let legendsContainer8 = document.createElement('div');
      legendsContainer8.className = 'map-legends';
      legendsContainer8.id = 'map-legends-8';
      mapElement8.appendChild(legendsContainer8);

      legendsContainer8.innerHTML = `
        <div class="map-legends-header">
          <div class="map-legends-title">Leyenda</div>
          <button class="map-legends-toggle" title="Ocultar/Mostrar leyenda">▲</button>
        </div>
        <div class="map-legends-content"></div>
      `;

      const legendsContent8 = legendsContainer8.querySelector('.map-legends-content');
      const legendsToggleBtn8 = legendsContainer8.querySelector('.map-legends-toggle');

      legendsToggleBtn8.addEventListener('click', () => {
        legendsContainer8.classList.toggle('collapsed');
        legendsToggleBtn8.textContent = legendsContainer8.classList.contains('collapsed') ? '▼' : '▲';
      });

      function actualizarLeyendas8() {
        legendsContent8.innerHTML = '';
        capasMap8.forEach((capaConfig, index) => {
          const layer = capasWMS8[index];
          if (layer.getVisible() && capaConfig.leyenda) {
            const simbologia = simbologias[capaConfig.layer];
            if (simbologia) {
              const legendItem = document.createElement('div');
              legendItem.className = 'legend-item';
              legendItem.id = `legend-8-${index}`;
              legendItem.innerHTML = `<div class="legend-item-title">${simbologia.titulo}</div>`;

              const simbologiaContainer = document.createElement('div');
              simbologiaContainer.className = 'legend-simbologia';

              simbologia.categorias.forEach(cat => {
                const categoria = document.createElement('div');
                categoria.className = 'legend-categoria';
                categoria.innerHTML = `
                  <div class="legend-simbolo" style="background-color: ${cat.color}; border: 1px solid ${cat.stroke};"></div>
                  <span class="legend-label">${cat.label}</span>
                `;
                simbologiaContainer.appendChild(categoria);
              });

              legendItem.appendChild(simbologiaContainer);
              legendsContent8.appendChild(legendItem);
            }
          }
        });

        if (legendsContent8.children.length === 0) {
          legendsContent8.innerHTML = '<div class="map-legends-empty">Seleccione una capa para ver su leyenda</div>';
        }
      }

      capasMap8.forEach((capaConfig, index) => {
        const layerControl = document.createElement('div');
        layerControl.className = 'layer-control';
        const checkboxId = `layer-8-${index}`;
        layerControl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" ${capaConfig.visible ? 'checked' : ''} />
          <label for="${checkboxId}">${capaConfig.nombre}</label>
        `;
        contentContainer8.appendChild(layerControl);

        const checkbox = layerControl.querySelector(`#${checkboxId}`);
        checkbox.addEventListener('change', (e) => {
          capasWMS8[index].setVisible(e.target.checked);
          actualizarLeyendas8();
        });
      });

      actualizarLeyendas8();
    }

    mapas['map-8'] = map8;
  }

  // CAPITULO 4 - GRÁFICAS DE HIDROLOGÍA 2
  // Gráfica de dona - Aprovechamiento del agua
  const ctxAprovechamiento = document.getElementById('chart-aprovechamiento-agua');
  if (ctxAprovechamiento) {
    new Chart(ctxAprovechamiento.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Agrícola', 'Público urbano', 'Industrial', 'Diferentes usos', 'Servicios', 'Pecuario', 'Acuacultura', 'Doméstico'],
        datasets: [{
          data: [47.55, 39.81, 7.84, 4.15, 0.61, 0.02, 0.01, 0.00],
          backgroundColor: [
            '#7b2d8e',  // Agrícola - morado
            '#f5a623',  // Público urbano - naranja
            '#8b7355',  // Industrial - marrón
            '#c9b896',  // Diferentes usos - beige
            '#a0a0a0',  // Servicios - gris
            '#d4a574',  // Pecuario - marrón claro
            '#5fb3b3',  // Acuacultura - turquesa
            '#e8d4a8'   // Doméstico - crema
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            color: '#333',
            font: { size: 9, weight: 'bold' },
            formatter: (value, ctx) => {
              if (value < 1) return '';
              return ctx.chart.data.labels[ctx.dataIndex] + '\n' + value + '%';
            },
            textAlign: 'center',
            anchor: 'end',
            align: 'end',
            offset: 5
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  // Gráfica de líneas - Proyección acuíferos
  const ctxProyeccion = document.getElementById('chart-proyeccion-acuiferos');
  if (ctxProyeccion) {
    new Chart(ctxProyeccion.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['2014', '2020', '2023', '2030', '2040', '2050', '2060'],
        datasets: [
          {
            label: 'Alto Atoyac',
            data: [40, 28, 22, 14, -5, -38, -65],
            borderColor: '#00bcd4',
            backgroundColor: '#00bcd4',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#00bcd4',
            pointBorderWidth: 2,
            tension: 0.3
          },
          {
            label: 'Soltepec',
            data: [28, 22, 18, 12, 2, -12, -25],
            borderColor: '#8bc34a',
            backgroundColor: '#8bc34a',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#8bc34a',
            pointBorderWidth: 2,
            tension: 0.3
          },
          {
            label: 'Huamantla',
            data: [18, 14, 12, 8, -2, -15, -25],
            borderColor: '#ff9800',
            backgroundColor: '#ff9800',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#ff9800',
            pointBorderWidth: 2,
            tension: 0.3
          },
          {
            label: 'Emiliano Zapata',
            data: [-5, -6, -6, -8, -10, -12, -15],
            borderColor: '#f44336',
            backgroundColor: '#f44336',
            borderWidth: 2,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#f44336',
            pointBorderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: { size: 10 },
              usePointStyle: true,
              padding: 10
            }
          },
          datalabels: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#333', font: { size: 10 } }
          },
          y: {
            min: -70,
            max: 50,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              color: '#333',
              font: { size: 10 },
              stepSize: 20
            }
          }
        }
      }
    });
  }

  // NAVEGACION ENTRE CAPITULOS
  const chaptersContainer = document.getElementById("chaptersContainer");
  const timelineItems = document.querySelectorAll(".timeline-item");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  let currentChapter = 1;
  const totalChapters = 8;

  // Navega al capítulo indicado con scroll suave
  function goToChapter(chapterNum) {
    if (chapterNum < 1 || chapterNum > totalChapters) return;

    currentChapter = chapterNum;

    timelineItems.forEach(item => {
      const itemChapter = parseInt(item.dataset.chapter);
      item.classList.toggle("active", itemChapter === currentChapter);
    });

    const targetChapter = document.getElementById(`chapter-${chapterNum}`);
    if (targetChapter) {
      targetChapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Actualizar tamaño de mapas tras la navegación
    setTimeout(() => {
      Object.values(mapas).forEach(mapa => mapa.updateSize());
    }, 400);
  }

  timelineItems.forEach(item => {
    item.addEventListener("click", () => {
      const chapterNum = parseInt(item.dataset.chapter);
      goToChapter(chapterNum);
    });
  });

  btnPrev.addEventListener("click", () => goToChapter(currentChapter - 1));
  btnNext.addEventListener("click", () => goToChapter(currentChapter + 1));

  goToChapter(1);

  // CAPITULO 4 - GRAFICA DE INCENDIOS FORESTALES
  const ctxIncendios = document.getElementById('chart-incendios');
  if (ctxIncendios) {
    const aniosIncendios = [];
    for (let y = 1970; y <= 2022; y++) aniosIncendios.push(y);

    const superficieQuemada = [
      5200, 2800, 3600, 1100, 2700, 2000, 1200, 4000, 2200, 2500,
      800, 2400, 700, 7000, 4000, 2900, 5200, 2200, 2500, 4700,
      2300, 400, 300, 600, 800, 800, 400, 600, 8800, 300,
      1700, 400, 6200, 600, 4600, 800, 4500, 1300, 400, 7200,
      1300, 6600, 3200, 7200, 3000, 8000, 8000, 5200, 3500, 5900,
      3200, 1200, 1200
    ];

    const cantidadIncendios = [
      150, 190, 175, 130, 145, 100, 60, 200, 145, 130,
      55, 115, 35, 200, 150, 120, 260, 115, 125, 240,
      115, 25, 20, 25, 40, 45, 25, 150, 440, 200,
      90, 155, 310, 120, 230, 220, 230, 355, 255, 400,
      310, 350, 405, 355, 155, 405, 405, 310, 260, 300,
      190, 135, 120
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
        interaction: { mode: 'index', intersect: false },
        plugins: {
          title: { display: false },
          legend: {
            display: true,
            position: 'bottom',
            labels: { usePointStyle: true, padding: 15, font: { size: 11 } }
          },
          datalabels: { display: false },
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
            title: { display: false },
            ticks: { maxRotation: 90, minRotation: 90, autoSkip: false, font: { size: 8 } },
            grid: { display: false }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            max: 10000,
            title: { display: true, text: 'Superficie Quemada (ha)', color: '#ff9800', font: { size: 11, weight: 'bold' } },
            ticks: { color: '#ff9800', stepSize: 2000, callback: (value) => value.toLocaleString() },
            grid: { display: true, color: '#e0e0e0' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            max: 500,
            title: { display: true, text: 'Número de Incendios', color: '#2196f3', font: { size: 11, weight: 'bold' } },
            ticks: { color: '#2196f3', stepSize: 100 },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
  }
});
