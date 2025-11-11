/**
 * Manejo del mapa Leaflet y markers
 */

class MapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.config = window.AccionesConfig;
    this.popupGenerator = new PopupGenerator();
    this.markers = [];
  }

  /**
   * Inicializa el mapa
   */
  initMap() {
    try {
      // Crear el mapa centrado en Tlaxcala
      this.map = L.map(this.containerId, {
        center: [this.config.CENTER.lat, this.config.CENTER.lng],
        zoom: this.config.MAP.zoom,
        minZoom: this.config.MAP.minZoom,
        maxZoom: this.config.MAP.maxZoom,
        scrollWheelZoom: this.config.MAP.scrollWheelZoom,
        zoomControl: this.config.MAP.zoomControl,
      });

      // Agregar capa de tiles
      L.tileLayer(this.config.TILES.url, {
        attribution: this.config.TILES.attribution,
        maxZoom: this.config.MAP.maxZoom,
      }).addTo(this.map);

      // Agregar capa WMS de municipios de Tlaxcala
      const wmsConfig = this.config.WMS_LAYERS.municipios;
      if (wmsConfig.visible) {
        this.municipiosLayer = L.tileLayer
          .wms(wmsConfig.url, {
            layers: wmsConfig.layers,
            format: wmsConfig.format,
            transparent: wmsConfig.transparent,
            attribution: wmsConfig.attribution,
            opacity: wmsConfig.opacity,
          })
          .addTo(this.map);
      }

      // Inicializar capa de markers con clustering
      this.markersLayer = L.markerClusterGroup(this.config.CLUSTER);
      this.map.addLayer(this.markersLayer);

      // Agregar control de escala
      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      return true;
    } catch (error) {
      console.error("Error al inicializar mapa:", error);
      return false;
    }
  }

  /**
   * Agrega markers al mapa
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

    // Limpiar markers existentes
    this.clearMarkers();

    // Crear markers
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
   */
  createMarker(data) {
    try {
      // Validar coordenadas
      if (!data.lat || !data.lng) {
        console.warn("Marker sin coordenadas:", data.nombre_proyecto);
        return null;
      }

      // Obtener color según dependencia
      const color =
        this.config.COLORS[data.dependencia] || this.config.COLORS.default;

      // Crear ícono personalizado
      const icon = this.createCustomIcon(data, color);

      // Crear marker
      const marker = L.marker([data.lat, data.lng], {
        icon: icon,
        title: data.nombre_proyecto,
      });

      // Agregar popup
      const popupContent = this.popupGenerator.generatePopup(data);
      marker.bindPopup(popupContent, {
        maxWidth: 520,
        minWidth: 360,
        className: "custom-popup",
      });

      // Agregar tooltip (hover)
      marker.bindTooltip(data.nombre_proyecto, {
        direction: "top",
        offset: [0, -20],
      });

      // Guardar referencia a los datos
      marker.accionData = data;

      return marker;
    } catch (error) {
      console.error("Error al crear marker:", error);
      return null;
    }
  }

  /**
   * Crea un ícono personalizado para el marker
   */
  createCustomIcon(data, color) {
    // Determinar forma según tipo
    const isProyecto = data.tipo === "Proyecto";
    const shape = isProyecto ? "shield" : "circle";

    // SVG del ícono (con badge de multi-ubicación si aplica)
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
   * Genera el SVG para el ícono del marker
   * @param {string} shape - Forma del marker ('shield' o 'circle')
   * @param {string} color - Color del marker
   * @param {boolean} isMulti - Si es multi-ubicación
   * @param {number} totalUbicaciones - Total de ubicaciones (para badge)
   * @param {boolean} isEstatal - Si es de nivel estatal
   */
  generateSVGIcon(shape, color, isMulti, totalUbicaciones, isEstatal) {
    // Badge para multi-ubicación con número
    const badge =
      isMulti && totalUbicaciones > 1
        ? `
      <circle cx="28" cy="8" r="8" fill="#FF9800" stroke="white" stroke-width="2.5"/>
      <text x="28" y="11.5" font-size="9" fill="white" text-anchor="middle" font-weight="bold">${totalUbicaciones}</text>
    `
        : "";

    // Indicador estatal (pequeño ícono de edificio gubernamental)
    const estatalIcon = isEstatal
      ? `
      <circle cx="6" cy="8" r="6" fill="#5e3b8c" stroke="white" stroke-width="2"/>
      <text x="6" y="11" font-size="10" fill="white" text-anchor="middle" font-weight="bold">🏛</text>
    `
      : "";

    // Anillo exterior para multi-ubicación (hace más visible el marker)
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

  /**
   * Limpia todos los markers del mapa
   */
  clearMarkers() {
    if (this.markersLayer) {
      this.markersLayer.clearLayers();
      this.markers = [];
    }
  }

  /**
   * Centra el mapa en Tlaxcala
   */
  centerMap() {
    if (this.map) {
      this.map.setView(
        [this.config.CENTER.lat, this.config.CENTER.lng],
        this.config.MAP.zoom,
        { animate: true }
      );
    }
  }

  /**
   * Ajusta el zoom para mostrar todos los markers
   */
  fitBounds() {
    if (this.markersLayer && this.markers.length > 0) {
      const bounds = this.markersLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  /**
   * Obtiene el mapa
   */
  getMap() {
    return this.map;
  }

  /**
   * Obtiene los markers
   */
  getMarkers() {
    return this.markers;
  }

  /**
   * Destruye el mapa (cleanup)
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markersLayer = null;
      this.markers = [];
    }
  }
}

// Hacer MapManager disponible globalmente
if (typeof window !== "undefined") {
  window.MapManager = MapManager;
}
