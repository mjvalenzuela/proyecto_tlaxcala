/**
 * Gestor del mapa Leaflet
 * Maneja inicialización, markers y clustering
 */
class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.markersLayerEstatal = null; // Capa para marcadores estatales
    this.municipiosLayer = null;
    this.estadoLayer = null; // Capa para el polígono del estado completo
    this.config = window.AccionesConfig;
    this.popupGenerator = new PopupGenerator();
    this.markers = [];
    this.markersEstatal = []; // Marcadores estatales
    this.conteoMunicipios = {};
    this.conteoEstatal = 0; // Cantidad de proyectos estatales
    this.connectionLines = null;
    this.municipioLabels = [];
    this.municipioCentroids = {}; // Mapeo mun_id -> {lat, lng} para centroides
    this.geojsonData = null; // Almacenar datos GeoJSON para reutilizar
    // Umbrales de zoom para mostrar labels según tamaño del municipio
    this.ZOOM_LABELS_LARGE = 10;    // Municipios grandes
    this.ZOOM_LABELS_MEDIUM = 11;   // Municipios medianos
    this.ZOOM_LABELS_SMALL = 12;    // Municipios pequeños
    // Estado de visibilidad
    this.showLocal = true;
    this.showEstatal = false;
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

      // Capa para marcadores estatales con clustering por dependencia
      this.markersLayerEstatal = L.markerClusterGroup({
        ...this.config.CLUSTER,
        maxClusterRadius: 80, // Radio para agrupar marcadores de la misma zona/dependencia
        disableClusteringAtZoom: 13,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        iconCreateFunction: (cluster) => this.createDependenciaClusterIcon(cluster)
      });

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

    // Si es un marcador expandido, mostrar 1 pero indicar que pertenece a un grupo
    const esExpandido = ubicacionActual && ubicacionActual.es_marcador_expandido;
    const esMultiMunicipio = esExpandido ? true : totalMunicipios > 1;

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

  /**
   * Obtiene los centroides de todos los municipios
   * @returns {Object} Mapeo mun_id -> {lat, lng, nombre}
   */
  getMunicipioCentroids() {
    return this.municipioCentroids;
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
      this.geojsonData = geojsonData; // Guardar para reutilizar

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

    // Guardar centroide del municipio para usarlo en marcadores expandidos
    this.municipioCentroids[munId] = {
      lat: center.lat,
      lng: center.lng,
      nombre: munNombre
    };
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
   * Agrega las leyendas al mapa (acciones y dependencias)
   */
  agregarLeyenda() {
    // Leyenda de acciones (para vista Local)
    this.legendAcciones = L.control({ position: 'bottomright' });
    this.legendAcciones.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend acciones-legend legend-acciones');
      let html = '<h4>Total de Acciones</h4>';
      html += `<div class="legend-item">
        <span class="legend-color" style="background:${this.config.COLOR_SIN_ACCIONES}"></span>
        <span class="legend-label">Sin acciones</span>
      </div>`;
      this.config.RANGOS_ACCIONES.forEach((rango) => {
        html += `<div class="legend-item">
          <span class="legend-color" style="background:${rango.color}"></span>
          <span class="legend-label">${rango.label}</span>
        </div>`;
      });
      div.innerHTML = html;
      return div;
    };

    // Leyenda de dependencias (para vista Estatal)
    this.legendDependencias = L.control({ position: 'bottomright' });
    this.legendDependencias.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend acciones-legend legend-dependencias');
      let html = '<h4>Dependencias</h4>';

      // Agrupar por tipo
      const secretarias = [
        'Secretaría de Medio Ambiente',
        'Secretaría de Gobernación',
        'Secretaría de Finanzas',
        'Secretaría de Salud',
        'Secretaría de Impulso Agropecuario',
        'Secretaría de Educación Pública',
        'Secretaría de Movilidad y Transporte',
        'Secretaría de Turismo',
        'Secretaría de Seguridad Ciudadana',
        'Secretaría de Ordenamiento Territorial y Vivienda',
        'Secretaría de Bienestar',
        'Secretaría de Infraestructura',
        'Secretaría de Desarrollo Económico'
      ];

      const otras = [
        'Comisión Estatal del Agua y Saneamiento',
        'Coordinación General de Planeación e Inversión',
        'Procuraduría de Protección al Ambiente'
      ];

      const regiones = [
        'Region Calpulalpan',
        'Region Tlaxco',
        'Region Apizaco',
        'Region Huamantla',
        'Region Chiautempan',
        'Region Tlaxcala',
        'Region Zacatelco',
        'Region San Pablo del Monte'
      ];

      // Secretarías
      html += '<div class="legend-group"><span class="legend-group-title">Secretarías</span>';
      secretarias.forEach((dep) => {
        const color = this.config.COLORS[dep] || this.config.COLORS.default;
        const nombreCorto = this.abreviarDependencia(dep);
        html += `<div class="legend-item">
          <span class="legend-color" style="background:${color}"></span>
          <span class="legend-label">${nombreCorto}</span>
        </div>`;
      });
      html += '</div>';

      // Otras dependencias
      html += '<div class="legend-group"><span class="legend-group-title">Otras</span>';
      otras.forEach((dep) => {
        const color = this.config.COLORS[dep] || this.config.COLORS.default;
        const nombreCorto = this.abreviarDependencia(dep);
        html += `<div class="legend-item">
          <span class="legend-color" style="background:${color}"></span>
          <span class="legend-label">${nombreCorto}</span>
        </div>`;
      });
      html += '</div>';

      // Regiones
      html += '<div class="legend-group"><span class="legend-group-title">Regiones</span>';
      regiones.forEach((dep) => {
        const color = this.config.COLORS[dep] || this.config.COLORS.default;
        const nombreCorto = dep.replace('Region ', 'R. ');
        html += `<div class="legend-item">
          <span class="legend-color" style="background:${color}"></span>
          <span class="legend-label">${nombreCorto}</span>
        </div>`;
      });
      html += '</div>';

      div.innerHTML = html;
      return div;
    };

    // Inicialmente solo mostrar leyenda de acciones (Local está activo por defecto)
    this.legendAcciones.addTo(this.map);
  }

  /**
   * Actualiza las leyendas según el estado de los toggles
   * @param {boolean} showLocal - Si está activo Local
   * @param {boolean} showEstatal - Si está activo Estatal
   */
  actualizarLeyendas(showLocal, showEstatal) {
    // Remover ambas leyendas primero (usando try-catch por si no están agregadas)
    try {
      if (this.legendAcciones) {
        this.map.removeControl(this.legendAcciones);
      }
    } catch (e) { /* No estaba en el mapa */ }

    try {
      if (this.legendDependencias) {
        this.map.removeControl(this.legendDependencias);
      }
    } catch (e) { /* No estaba en el mapa */ }

    // Agregar según los toggles activos
    if (showLocal && showEstatal) {
      // Ambos activos: mostrar ambas leyendas
      this.legendAcciones.addTo(this.map);
      this.legendDependencias.addTo(this.map);
    } else if (showLocal) {
      // Solo Local: mostrar leyenda de acciones
      this.legendAcciones.addTo(this.map);
    } else if (showEstatal) {
      // Solo Estatal: mostrar leyenda de dependencias
      this.legendDependencias.addTo(this.map);
    }
    // Si ninguno está activo, no mostrar ninguna leyenda
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

  /**
   * Establece el conteo de proyectos estatales
   * @param {number} conteo - Cantidad de proyectos estatales
   */
  setConteoEstatal(conteo) {
    this.conteoEstatal = conteo || 0;
  }

  /**
   * Crea la capa del estado completo para proyectos estatales
   * Colorea todo el estado según la cantidad de proyectos
   */
  crearCapaEstado() {
    if (!this.geojsonData) {
      console.warn('GeoJSON no cargado aún');
      return;
    }

    // Remover capa anterior si existe
    if (this.estadoLayer) {
      this.map.removeLayer(this.estadoLayer);
    }

    // Obtener color según cantidad de proyectos estatales
    const color = this.getColorPorCantidad(this.conteoEstatal);

    // Crear capa que une todos los municipios visualmente
    this.estadoLayer = L.geoJSON(this.geojsonData, {
      style: () => ({
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: '#5e3b8c',
        fillOpacity: 0.6
      }),
      onEachFeature: (feature, layer) => {
        // Solo tooltip al pasar el mouse
        layer.on({
          mouseover: (e) => {
            const layer = e.target;
            layer.setStyle({
              weight: 3,
              color: '#333',
              fillOpacity: 0.75
            });
          },
          mouseout: (e) => {
            this.estadoLayer.resetStyle(e.target);
          }
        });
      }
    });
  }

  /**
   * Muestra la capa del estado para proyectos estatales
   * Solo se usa cuando ÚNICAMENTE estatal está activo
   */
  mostrarCapaEstado() {
    if (!this.estadoLayer) {
      this.crearCapaEstado();
    }
    if (this.estadoLayer && !this.map.hasLayer(this.estadoLayer)) {
      this.estadoLayer.addTo(this.map);
      this.estadoLayer.bringToBack();
    }
    // Ocultar capa de municipios cuando se muestra solo estatal
    if (this.municipiosLayer && this.map.hasLayer(this.municipiosLayer)) {
      this.map.removeLayer(this.municipiosLayer);
    }
    // Ocultar labels de municipios
    this.municipioLabels.forEach(label => {
      if (this.map.hasLayer(label)) {
        this.map.removeLayer(label);
      }
    });
  }

  /**
   * Oculta la capa del estado
   */
  ocultarCapaEstado() {
    if (this.estadoLayer && this.map.hasLayer(this.estadoLayer)) {
      this.map.removeLayer(this.estadoLayer);
    }
  }

  /**
   * Muestra la capa de municipios (proyectos locales)
   */
  mostrarCapaMunicipios() {
    if (this.municipiosLayer && !this.map.hasLayer(this.municipiosLayer)) {
      this.municipiosLayer.addTo(this.map);
      this.municipiosLayer.bringToBack();
    }
    // Actualizar labels según zoom
    this.updateMunicipioLabels();
  }

  /**
   * Oculta la capa de municipios
   */
  ocultarCapaMunicipios() {
    if (this.municipiosLayer && this.map.hasLayer(this.municipiosLayer)) {
      this.map.removeLayer(this.municipiosLayer);
    }
    // Ocultar labels
    this.municipioLabels.forEach(label => {
      if (this.map.hasLayer(label)) {
        this.map.removeLayer(label);
      }
    });
  }

  /**
   * Agrega marcadores estatales al mapa
   * @param {Array} markersData - Array de datos de markers estatales
   */
  addMarkersEstatal(markersData) {
    if (!this.map || !this.markersLayerEstatal) {
      console.error("Mapa no inicializado");
      return;
    }

    this.clearMarkersEstatal();

    if (!markersData || markersData.length === 0) {
      console.warn("No hay markers estatales para agregar");
      return;
    }

    markersData.forEach((data) => {
      try {
        const marker = this.createMarkerEstatal(data);
        if (marker) {
          this.markersLayerEstatal.addLayer(marker);
          this.markersEstatal.push(marker);
        }
      } catch (error) {
        console.error("Error al crear marker estatal:", error, data);
      }
    });
  }

  /**
   * Crea un marker estatal individual
   * @param {Object} data - Datos del marker
   * @returns {L.Marker|null} Marker de Leaflet
   */
  createMarkerEstatal(data) {
    try {
      if (!data.lat || !data.lng) {
        console.warn("Marker estatal sin coordenadas:", data.nombre_proyecto);
        return null;
      }

      const color =
        this.config.COLORS[data.dependencia] || this.config.COLORS.default;

      const icon = this.createCustomIconEstatal(data, color);

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

      return marker;
    } catch (error) {
      console.error("Error al crear marker estatal:", error);
      return null;
    }
  }

  /**
   * Crea ícono personalizado para marker estatal
   * @param {Object} data - Datos del marker
   * @param {string} color - Color del ícono
   * @returns {L.DivIcon} Ícono de Leaflet
   */
  createCustomIconEstatal(data, color) {
    const isProyecto = data.tipo === "Proyecto";
    const shape = isProyecto ? "shield" : "circle";

    const svgIcon = this.generateSVGIconEstatal(shape, color);

    return L.divIcon({
      html: svgIcon,
      className: "custom-marker-icon marker-estatal",
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
    });
  }

  /**
   * Crea un ícono de cluster personalizado que muestra la dependencia
   * @param {Object} cluster - Cluster de Leaflet
   * @returns {L.DivIcon} Ícono del cluster
   */
  createDependenciaClusterIcon(cluster) {
    const markers = cluster.getAllChildMarkers();
    const count = markers.length;

    // Contar marcadores por dependencia para determinar la predominante
    const dependenciaCount = {};
    markers.forEach(marker => {
      if (marker.accionData) {
        const dep = marker.accionData.dependencia || 'Sin dependencia';
        dependenciaCount[dep] = (dependenciaCount[dep] || 0) + 1;
      }
    });

    // Encontrar la dependencia predominante
    let dependenciaPredominante = 'Sin dependencia';
    let maxCount = 0;
    Object.entries(dependenciaCount).forEach(([dep, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        dependenciaPredominante = dep;
      }
    });

    // Obtener color de la dependencia
    const color = this.config.COLORS[dependenciaPredominante] || this.config.COLORS.default;

    // Abreviar nombre de la dependencia para el cluster
    const nombreCorto = this.abreviarDependencia(dependenciaPredominante);

    // Determinar tamaño según cantidad de marcadores
    let size = 'small';
    let radius = 30;
    if (count > 10) {
      size = 'large';
      radius = 45;
    } else if (count > 5) {
      size = 'medium';
      radius = 38;
    }

    const html = `
      <div class="cluster-dependencia cluster-${size}" style="background-color: ${color};">
        <span class="cluster-count">${count}</span>
        <span class="cluster-nombre">${nombreCorto}</span>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'marker-cluster-dependencia',
      iconSize: [radius * 2, radius * 2 + 20],
      iconAnchor: [radius, radius + 10]
    });
  }

  /**
   * Abrevia el nombre de una dependencia para mostrar en el cluster
   * @param {string} nombre - Nombre completo de la dependencia
   * @returns {string} Nombre abreviado
   */
  abreviarDependencia(nombre) {
    const abreviaciones = {
      'Secretaría de Medio Ambiente': 'Medio Ambiente',
      'Secretaría de Gobernación': 'Gobernación',
      'Secretaría de Finanzas': 'Finanzas',
      'Secretaría de Salud': 'Salud',
      'Secretaría de Impulso Agropecuario': 'Agropecuario',
      'Secretaría de Educación Pública': 'Educación',
      'Secretaría de Movilidad y Transporte': 'Movilidad',
      'Secretaría de Turismo': 'Turismo',
      'Secretaría de Seguridad Ciudadana': 'Seguridad',
      'Secretaría de Ordenamiento Territorial y Vivienda': 'Ord. Territorial',
      'Secretaría de Bienestar': 'Bienestar',
      'Secretaría de Infraestructura': 'Infraestructura',
      'Secretaría de Desarrollo Económico': 'Des. Económico',
      'Comisión Estatal del Agua y Saneamiento': 'CEAS',
      'Coordinación General de Planeación e Inversión': 'Planeación',
      'Procuraduría de Protección al Ambiente': 'Procuraduría Amb.',
      'Region Calpulalpan': 'R. Calpulalpan',
      'Region Tlaxco': 'R. Tlaxco',
      'Region Apizaco': 'R. Apizaco',
      'Region Huamantla': 'R. Huamantla',
      'Region Chiautempan': 'R. Chiautempan',
      'Region Tlaxcala': 'R. Tlaxcala',
      'Region Zacatelco': 'R. Zacatelco',
      'Region San Pablo del Monte': 'R. San Pablo'
    };

    return abreviaciones[nombre] || nombre.substring(0, 15);
  }

  /**
   * Genera SVG del ícono del marker estatal
   * @param {string} shape - Forma del marker
   * @param {string} color - Color del marker
   * @returns {string} SVG como string
   */
  generateSVGIconEstatal(shape, color) {
    // Badge de estatal (ícono de edificio)
    const estatalBadge = `
      <circle cx="28" cy="8" r="8" fill="#5e3b8c" stroke="white" stroke-width="2.5"/>
      <text x="28" y="12" font-size="10" fill="white" text-anchor="middle">🏛</text>
    `;

    if (shape === "shield") {
      return `
        <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 4 L6 10 L6 20 C6 30 18 40 18 40 C18 40 30 30 30 20 L30 10 Z"
                fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          ${estatalBadge}
        </svg>
      `;
    } else {
      return `
        <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="13" fill="${color}" stroke="white" stroke-width="2.5"/>
          <path d="M18 31 Q18 42, 18 42 Q18 42, 18 31" fill="${color}" stroke="white" stroke-width="2.5"/>
          ${estatalBadge}
        </svg>
      `;
    }
  }

  /**
   * Limpia los marcadores estatales
   */
  clearMarkersEstatal() {
    if (this.markersLayerEstatal) {
      this.markersLayerEstatal.clearLayers();
      this.markersEstatal = [];
    }
  }

  /**
   * Muestra los marcadores estatales
   */
  mostrarMarkersEstatal() {
    if (this.markersLayerEstatal && !this.map.hasLayer(this.markersLayerEstatal)) {
      this.map.addLayer(this.markersLayerEstatal);
    }
  }

  /**
   * Oculta los marcadores estatales
   */
  ocultarMarkersEstatal() {
    if (this.markersLayerEstatal && this.map.hasLayer(this.markersLayerEstatal)) {
      this.map.removeLayer(this.markersLayerEstatal);
    }
  }

  /**
   * Muestra los marcadores locales
   */
  mostrarMarkersLocal() {
    if (this.markersLayer && !this.map.hasLayer(this.markersLayer)) {
      this.map.addLayer(this.markersLayer);
    }
  }

  /**
   * Oculta los marcadores locales
   */
  ocultarMarkersLocal() {
    if (this.markersLayer && this.map.hasLayer(this.markersLayer)) {
      this.map.removeLayer(this.markersLayer);
    }
  }

  /**
   * Actualiza la visualización según el estado de los toggles
   * @param {boolean} showLocal - Mostrar proyectos locales
   * @param {boolean} showEstatal - Mostrar proyectos estatales
   */
  actualizarVisualizacion(showLocal, showEstatal) {
    this.showLocal = showLocal;
    this.showEstatal = showEstatal;

    // Manejar marcadores
    if (showLocal) {
      this.mostrarMarkersLocal();
    } else {
      this.ocultarMarkersLocal();
    }

    if (showEstatal) {
      this.mostrarMarkersEstatal();
    } else {
      this.ocultarMarkersEstatal();
    }

    // Manejar capas de fondo
    // Solo mostrar capa uniforme del estado cuando ÚNICAMENTE estatal está activo
    if (showEstatal && !showLocal) {
      this.mostrarCapaEstado();
    } else {
      // En cualquier otro caso, mostrar capa de municipios con colores por cantidad
      this.ocultarCapaEstado();
      this.mostrarCapaMunicipios();
    }

    // Actualizar leyendas según los toggles activos
    this.actualizarLeyendas(showLocal, showEstatal);
  }

  /**
   * Obtiene todos los marcadores (locales + estatales)
   * @returns {Array} Array de marcadores
   */
  getAllMarkers() {
    return [...this.markers, ...this.markersEstatal];
  }

  getMarkersEstatal() {
    return this.markersEstatal;
  }
}

if (typeof window !== "undefined") {
  window.MapManager = MapManager;
}
