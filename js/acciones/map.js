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
    this.connectionLines = null;
    this.municipioLabels = [];
    // Umbrales de zoom para mostrar labels según tamaño del municipio
    this.ZOOM_LABELS_LARGE = 10;    // Municipios grandes
    this.ZOOM_LABELS_MEDIUM = 11;   // Municipios medianos
    this.ZOOM_LABELS_SMALL = 12;    // Municipios pequeños
  }

  /**
   * Trunca texto a una longitud máxima
   * @param {string} text - Texto a truncar
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Texto truncado
   */
  truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
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

      const tooltipText = this.truncateText(data.nombre_proyecto, 50);
      marker.bindTooltip(tooltipText, {
        direction: "top",
        offset: [0, -20],
      });

      marker.accionData = data;

      // Eventos para resaltar marcadores del mismo proyecto (solo si tiene 2+ municipios en total)
      if (data.total_municipios_registro >= 2) {
        marker.on('mouseover', () => this.highlightProyecto(data.id, true));
        marker.on('mouseout', () => this.highlightProyecto(data.id, false));
      }

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

    // Calcular total de municipios de la ubicación actual (no de todas las ubicaciones)
    let totalMunicipios = 0;
    const ubicacionActual = data.currentUbicacion;
    if (ubicacionActual && ubicacionActual.mun_id) {
      const ids = Array.isArray(ubicacionActual.mun_id) ? ubicacionActual.mun_id : [ubicacionActual.mun_id];
      totalMunicipios = ids.filter(id => id).length;
    }

    const esMultiMunicipio = totalMunicipios > 1;

    const svgIcon = this.generateSVGIcon(
      shape,
      color,
      esMultiMunicipio,
      totalMunicipios,
      data.currentUbicacion?.es_estatal || false,
      data.numero_proyecto || 0
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
   * @param {boolean} isMulti - Si es multi-municipio
   * @param {number} totalMunicipios - Total de municipios de esta ubicación
   * @param {boolean} isEstatal - Si es de nivel estatal
   * @param {number} numeroProyecto - Número identificador del proyecto
   * @returns {string} SVG como string
   */
  generateSVGIcon(shape, color, isMulti, totalMunicipios, isEstatal, numeroProyecto) {
    // Badge de municipios (arriba derecha - naranja) - SIEMPRE mostrar cuando hay municipios
    const badgeMunicipios = totalMunicipios > 0
        ? `
      <circle cx="28" cy="8" r="8" fill="#FF9800" stroke="white" stroke-width="2.5"/>
      <text x="28" y="11.5" font-size="9" fill="white" text-anchor="middle" font-weight="bold">${totalMunicipios}</text>
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
          ${badgeMunicipios}
        </svg>
      `;
    } else {
      return `
        <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          ${ringMulti}
          <circle cx="18" cy="18" r="13" fill="${color}" stroke="white" stroke-width="2.5"/>
          <path d="M18 31 Q18 42, 18 42 Q18 42, 18 31" fill="${color}" stroke="white" stroke-width="2.5"/>
          ${estatalIcon}
          ${badgeMunicipios}
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

  /**
   * Resalta o quita resaltado de todos los marcadores del mismo proyecto
   * @param {string} proyectoId - ID del proyecto
   * @param {boolean} highlight - true para resaltar, false para quitar
   */
  highlightProyecto(proyectoId, highlight) {
    // Resaltar marcadores
    this.markers.forEach((marker) => {
      if (marker.accionData && marker.accionData.id === proyectoId) {
        const container = marker.getElement();
        if (container) {
          if (highlight) {
            container.classList.add('marker-highlighted');
          } else {
            container.classList.remove('marker-highlighted');
          }
        }
      }
    });

    // Dibujar o quitar líneas de conexión
    if (highlight) {
      this.drawConnectionLines(proyectoId);
    } else {
      this.removeConnectionLines();
    }
  }

  /**
   * Dibuja líneas conectando todos los marcadores del mismo proyecto
   * @param {string} proyectoId - ID del proyecto
   */
  drawConnectionLines(proyectoId) {
    // Eliminar líneas anteriores si existen
    this.removeConnectionLines();

    // Obtener coordenadas de todos los marcadores del proyecto
    const markersDelProyecto = this.markers.filter(
      (marker) => marker.accionData && marker.accionData.id === proyectoId
    );

    if (markersDelProyecto.length < 2) return;

    // Crear array de coordenadas
    const latlngs = markersDelProyecto.map(marker => marker.getLatLng());

    // Dibujar línea conectando todos los puntos
    this.connectionLines = L.polyline(latlngs, {
      color: '#FF9800',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 10',
      className: 'connection-line'
    }).addTo(this.map);
  }

  /**
   * Elimina las líneas de conexión del mapa
   */
  removeConnectionLines() {
    if (this.connectionLines) {
      this.map.removeLayer(this.connectionLines);
      this.connectionLines = null;
    }
  }

  /**
   * Hace zoom para mostrar todos los marcadores del mismo proyecto
   * @param {string} proyectoId - ID del proyecto
   */
  zoomToProyecto(proyectoId) {
    const markersDelProyecto = this.markers.filter(
      (marker) => marker.accionData && marker.accionData.id === proyectoId
    );

    if (markersDelProyecto.length > 1) {
      const group = L.featureGroup(markersDelProyecto);
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 14,
          animate: true
        });
      }
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

      // Configurar listener de zoom para labels
      this.setupZoomListener();

      // Actualizar labels según zoom actual
      this.updateMunicipioLabels();

      //console.log('Municipios GeoJSON cargados correctamente');
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

    // Calcular área aproximada del municipio para determinar cuándo mostrar label
    const bounds = layer.getBounds();
    const area = (bounds.getNorth() - bounds.getSouth()) * (bounds.getEast() - bounds.getWest());

    // Crear label permanente en el centro del municipio
    const center = bounds.getCenter();
    const label = L.marker(center, {
      icon: L.divIcon({
        className: 'municipio-label',
        html: `<span class="municipio-label-text">${munNombre}</span>`,
        iconSize: [100, 20],
        iconAnchor: [50, 10]
      }),
      interactive: false
    });
    label.munId = munId;
    label.area = area;
    this.municipioLabels.push(label);

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
   * Configura el listener de zoom para mostrar/ocultar labels progresivamente
   */
  setupZoomListener() {
    this.map.on('zoomend', () => {
      this.updateMunicipioLabels();
    });
  }

  /**
   * Actualiza la visibilidad de labels según el zoom actual
   */
  updateMunicipioLabels() {
    const currentZoom = this.map.getZoom();

    // Calcular percentiles de área para clasificar municipios
    if (!this.areaThresholds) {
      this.calculateAreaThresholds();
    }

    this.municipioLabels.forEach(label => {
      const shouldShow = this.shouldShowLabel(label.area, currentZoom);
      const isOnMap = this.map.hasLayer(label);

      if (shouldShow && !isOnMap) {
        label.addTo(this.map);
      } else if (!shouldShow && isOnMap) {
        this.map.removeLayer(label);
      }
    });
  }

  /**
   * Calcula los umbrales de área para clasificar municipios
   */
  calculateAreaThresholds() {
    const areas = this.municipioLabels.map(l => l.area).sort((a, b) => b - a);
    const count = areas.length;

    // Dividir en tercios: grandes (top 33%), medianos (medio 33%), pequeños (bottom 33%)
    this.areaThresholds = {
      large: areas[Math.floor(count * 0.33)] || 0,
      medium: areas[Math.floor(count * 0.66)] || 0
    };
  }

  /**
   * Determina si un label debe mostrarse según su área y el zoom actual
   * @param {number} area - Área del municipio
   * @param {number} zoom - Nivel de zoom actual
   * @returns {boolean}
   */
  shouldShowLabel(area, zoom) {
    // Municipios grandes: mostrar desde zoom 10
    if (area >= this.areaThresholds.large) {
      return zoom >= this.ZOOM_LABELS_LARGE;
    }
    // Municipios medianos: mostrar desde zoom 11
    if (area >= this.areaThresholds.medium) {
      return zoom >= this.ZOOM_LABELS_MEDIUM;
    }
    // Municipios pequeños: mostrar desde zoom 12
    return zoom >= this.ZOOM_LABELS_SMALL;
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
