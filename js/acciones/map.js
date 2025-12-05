/**
 * Gestor del mapa Leaflet
 * Maneja inicialización, markers y clustering
 */
class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.municipiosLayer = null;
    this.config = window.AccionesConfig;
    this.popupGenerator = new PopupGenerator();
    this.markers = [];
    this.conteoMunicipios = {};
  }

  /**
   * Inicializa el mapa con capas base
   * @returns {boolean} true si se inicializa correctamente
   */
  initMap() {
    try {
      this.map = L.map(this.containerId, {
        center: [this.config.CENTER.lat, this.config.CENTER.lng],
        zoom: this.config.MAP.zoom,
        minZoom: this.config.MAP.minZoom,
        maxZoom: this.config.MAP.maxZoom,
        scrollWheelZoom: this.config.MAP.scrollWheelZoom,
        zoomControl: this.config.MAP.zoomControl,
      });

      L.tileLayer(this.config.TILES.url, {
        attribution: this.config.TILES.attribution,
        maxZoom: this.config.MAP.maxZoom,
      }).addTo(this.map);

      // La capa de municipios se cargará después con cargarMunicipiosGeoJSON()

      this.markersLayer = L.markerClusterGroup(this.config.CLUSTER);
      this.map.addLayer(this.markersLayer);

      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      // Agregar leyenda de colores
      this.agregarLeyenda();

      return true;
    } catch (error) {
      console.error("Error al inicializar mapa:", error);
      return false;
    }
  }

  /**
   * Agrega markers al mapa
   * @param {Array} markersData - Array de datos de markers
   */
  addMarkers(markersData) {
    if (!this.map || !this.markersLayer) {
      console.error("Mapa no inicializado");
      return;
    }

    if (!markersData || markersData.length === 0) {
      console.warn("No hay markers para agregar");
      return;
    }

    this.clearMarkers();

    markersData.forEach((data) => {
      try {
        const marker = this.createMarker(data);
        if (marker) {
          this.markersLayer.addLayer(marker);
          this.markers.push(marker);
        }
      } catch (error) {
        console.error("Error al crear marker:", error, data);
      }
    });
  }

  /**
   * Crea un marker individual
   * @param {Object} data - Datos del marker
   * @returns {L.Marker|null} Marker de Leaflet
   */
  createMarker(data) {
    try {
      if (!data.lat || !data.lng) {
        console.warn("Marker sin coordenadas:", data.nombre_proyecto);
        return null;
      }

      const color =
        this.config.COLORS[data.dependencia] || this.config.COLORS.default;

      const icon = this.createCustomIcon(data, color);

      const marker = L.marker([data.lat, data.lng], {
        icon: icon,
        title: data.nombre_proyecto,
      });

      const popupContent = this.popupGenerator.generatePopup(data);
      marker.bindPopup(popupContent, {
        maxWidth: 520,
        minWidth: 360,
        className: "custom-popup",
      });

      marker.bindTooltip(data.nombre_proyecto, {
        direction: "top",
        offset: [0, -20],
      });

      marker.accionData = data;

      return marker;
    } catch (error) {
      console.error("Error al crear marker:", error);
      return null;
    }
  }

  /**
   * Crea ícono personalizado para marker
   * @param {Object} data - Datos del marker
   * @param {string} color - Color del ícono
   * @returns {L.DivIcon} Ícono de Leaflet
   */
  createCustomIcon(data, color) {
    const isProyecto = data.tipo === "Proyecto";
    const shape = isProyecto ? "shield" : "circle";

    const svgIcon = this.generateSVGIcon(
      shape,
      color,
      data.es_multiubicacion,
      data.total_ubicaciones || 0,
      data.currentUbicacion?.es_estatal || false
    );

    return L.divIcon({
      html: svgIcon,
      className: "custom-marker-icon",
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });
  }

  /**
   * Genera SVG del ícono del marker
   * @param {string} shape - Forma del marker (shield o circle)
   * @param {string} color - Color del marker
   * @param {boolean} isMulti - Si es multi-ubicación
   * @param {number} totalUbicaciones - Total de ubicaciones
   * @param {boolean} isEstatal - Si es de nivel estatal
   * @returns {string} SVG como string
   */
  generateSVGIcon(shape, color, isMulti, totalUbicaciones, isEstatal) {
    const badge =
      isMulti && totalUbicaciones > 1
        ? `
      <circle cx="28" cy="8" r="8" fill="#FF9800" stroke="white" stroke-width="2.5"/>
      <text x="28" y="11.5" font-size="9" fill="white" text-anchor="middle" font-weight="bold">${totalUbicaciones}</text>
    `
        : "";

    const estatalIcon = isEstatal
      ? `
      <circle cx="6" cy="8" r="6" fill="#5e3b8c" stroke="white" stroke-width="2"/>
      <text x="6" y="11" font-size="10" fill="white" text-anchor="middle" font-weight="bold">🏛</text>
    `
      : "";

    const ringMulti = isMulti
      ? `
      <circle cx="18" cy="18" r="16" fill="none" stroke="#FF9800" stroke-width="2" opacity="0.6"/>
    `
      : "";

    if (shape === "shield") {
      return `
        <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          ${ringMulti}
          <path d="M18 4 L6 10 L6 20 C6 30 18 40 18 40 C18 40 30 30 30 20 L30 10 Z"
                fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          ${estatalIcon}
          ${badge}
        </svg>
      `;
    } else {
      return `
        <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          ${ringMulti}
          <circle cx="18" cy="18" r="13" fill="${color}" stroke="white" stroke-width="2.5"/>
          <path d="M18 31 Q18 42, 18 42 Q18 42, 18 31" fill="${color}" stroke="white" stroke-width="2.5"/>
          ${estatalIcon}
          ${badge}
        </svg>
      `;
    }
  }

  clearMarkers() {
    if (this.markersLayer) {
      this.markersLayer.clearLayers();
      this.markers = [];
    }
  }

  centerMap() {
    if (this.map) {
      this.map.setView(
        [this.config.CENTER.lat, this.config.CENTER.lng],
        this.config.MAP.zoom,
        { animate: true }
      );
    }
  }

  fitBounds() {
    if (this.markersLayer && this.markers.length > 0) {
      const bounds = this.markersLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  getMap() {
    return this.map;
  }

  getMarkers() {
    return this.markers;
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markersLayer = null;
      this.municipiosLayer = null;
      this.markers = [];
      this.conteoMunicipios = {};
    }
  }

  /**
   * Establece el conteo de acciones por municipio
   * @param {Object} conteo - Objeto con mun_id como clave y cantidad como valor
   */
  setConteoMunicipios(conteo) {
    this.conteoMunicipios = conteo || {};
  }

  /**
   * Carga los municipios como GeoJSON y aplica estilos según conteo de acciones
   * @returns {Promise<boolean>} true si se carga correctamente
   */
  async cargarMunicipiosGeoJSON() {
    try {
      const response = await fetch(this.config.MUNICIPIOS_WFS.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const geojsonData = await response.json();

      // Remover capa anterior si existe
      if (this.municipiosLayer) {
        this.map.removeLayer(this.municipiosLayer);
      }

      // Crear capa GeoJSON con estilos dinámicos
      this.municipiosLayer = L.geoJSON(geojsonData, {
        style: (feature) => this.getEstiloMunicipio(feature),
        onEachFeature: (feature, layer) => this.onEachMunicipio(feature, layer)
      });

      // Agregar al mapa debajo de los markers
      this.municipiosLayer.addTo(this.map);
      this.municipiosLayer.bringToBack();

      console.log('Municipios GeoJSON cargados correctamente');
      return true;

    } catch (error) {
      console.error('Error al cargar municipios GeoJSON:', error);
      return false;
    }
  }

  /**
   * Obtiene el estilo para un municipio según su conteo de acciones
   * @param {Object} feature - Feature GeoJSON del municipio
   * @returns {Object} Estilo de Leaflet
   */
  getEstiloMunicipio(feature) {
    const munId = feature.properties[this.config.MUNICIPIOS_WFS.campoId];
    const cantidad = this.conteoMunicipios[munId] || 0;
    const color = this.getColorPorCantidad(cantidad);

    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: '#666',
      fillOpacity: 0.7
    };
  }

  /**
   * Obtiene el color según la cantidad de acciones
   * @param {number} cantidad - Número de acciones
   * @returns {string} Color hexadecimal
   */
  getColorPorCantidad(cantidad) {
    if (!cantidad || cantidad === 0) {
      return this.config.COLOR_SIN_ACCIONES;
    }

    const rango = this.config.RANGOS_ACCIONES.find(
      (r) => cantidad >= r.min && cantidad <= r.max
    );

    return rango ? rango.color : this.config.COLOR_SIN_ACCIONES;
  }

  /**
   * Configura eventos para cada municipio
   * @param {Object} feature - Feature GeoJSON
   * @param {L.Layer} layer - Capa de Leaflet
   */
  onEachMunicipio(feature, layer) {
    const munId = feature.properties[this.config.MUNICIPIOS_WFS.campoId];
    // Usar mapeo de nombres para evitar problemas de encoding
    const munNombre = this.config.MUNICIPIOS_WFS.nombresMunicipios[munId] ||
                      feature.properties[this.config.MUNICIPIOS_WFS.campoNombre] ||
                      'Sin nombre';
    const cantidad = this.conteoMunicipios[munId] || 0;

    // Tooltip con información del municipio
    const tooltipContent = `
      <strong>${munNombre}</strong><br>
      Acciones: ${cantidad}
    `;

    layer.bindTooltip(tooltipContent, {
      permanent: false,
      direction: 'center',
      className: 'municipio-tooltip'
    });

    // Eventos de hover
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#333',
          fillOpacity: 0.85
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        this.municipiosLayer.resetStyle(e.target);
      }
    });
  }

  /**
   * Agrega la leyenda de colores al mapa
   */
  agregarLeyenda() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend acciones-legend');

      let html = '<h4>Acciones por Municipio</h4>';

      // Color sin acciones
      html += `<div class="legend-item">
        <span class="legend-color" style="background:${this.config.COLOR_SIN_ACCIONES}"></span>
        <span class="legend-label">Sin acciones</span>
      </div>`;

      // Rangos de colores
      this.config.RANGOS_ACCIONES.forEach((rango) => {
        html += `<div class="legend-item">
          <span class="legend-color" style="background:${rango.color}"></span>
          <span class="legend-label">${rango.label}</span>
        </div>`;
      });

      div.innerHTML = html;
      return div;
    };

    legend.addTo(this.map);
    this.legendControl = legend;
  }

  /**
   * Actualiza los estilos de los municipios (después de cambiar el conteo)
   */
  actualizarEstilosMunicipios() {
    if (this.municipiosLayer) {
      this.municipiosLayer.eachLayer((layer) => {
        const feature = layer.feature;
        layer.setStyle(this.getEstiloMunicipio(feature));
      });
    }
  }
}

if (typeof window !== "undefined") {
  window.MapManager = MapManager;
}
