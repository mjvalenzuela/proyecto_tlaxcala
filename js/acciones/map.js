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
        zoomControl: this.config.MAP.zoomControl
      });

      // Agregar capa de tiles
      L.tileLayer(this.config.TILES.url, {
        attribution: this.config.TILES.attribution,
        maxZoom: this.config.MAP.maxZoom
      }).addTo(this.map);

      // Inicializar capa de markers con clustering
      this.markersLayer = L.markerClusterGroup(this.config.CLUSTER);
      this.map.addLayer(this.markersLayer);

      // Agregar control de escala
      L.control.scale({ position: 'bottomleft', imperial: false }).addTo(this.map);

      //console.log('Mapa inicializado correctamente');
      return true;

    } catch (error) {
      console.error('Error al inicializar mapa:', error);
      return false;
    }
  }

  /**
   * Agrega markers al mapa
   */
  addMarkers(markersData) {
    if (!this.map || !this.markersLayer) {
      console.error('Mapa no inicializado');
      return;
    }

    if (!markersData || markersData.length === 0) {
      console.warn('No hay markers para agregar');
      return;
    }

    // Limpiar markers existentes
    this.clearMarkers();

    // Crear markers
    markersData.forEach(data => {
      try {
        const marker = this.createMarker(data);
        if (marker) {
          this.markersLayer.addLayer(marker);
          this.markers.push(marker);
        }
      } catch (error) {
        console.error('Error al crear marker:', error, data);
      }
    });

    //console.log(`${this.markers.length} markers agregados al mapa`);
  }

  /**
   * Crea un marker individual
   */
  createMarker(data) {
    try {
      // Validar coordenadas
      if (!data.lat || !data.lng) {
        console.warn('Marker sin coordenadas:', data.nombre_proyecto);
        return null;
      }

      // Obtener color según dependencia
      const color = this.config.COLORS[data.dependencia] || this.config.COLORS.default;

      // Crear ícono personalizado
      const icon = this.createCustomIcon(data, color);

      // Crear marker
      const marker = L.marker([data.lat, data.lng], {
        icon: icon,
        title: data.nombre_proyecto
      });

      // Agregar popup
      const popupContent = this.popupGenerator.generatePopup(data);
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        minWidth: 250,
        className: 'custom-popup'
      });

      // Agregar tooltip (hover)
      marker.bindTooltip(data.nombre_proyecto, {
        direction: 'top',
        offset: [0, -20]
      });

      // Guardar referencia a los datos
      marker.accionData = data;

      return marker;

    } catch (error) {
      console.error('Error al crear marker:', error);
      return null;
    }
  }

  /**
   * Crea un ícono personalizado para el marker
   */
  createCustomIcon(data, color) {
    // Determinar forma según tipo
    const isProyecto = data.tipo === 'Proyecto';
    const shape = isProyecto ? 'shield' : 'circle';

    // SVG del ícono
    const svgIcon = this.generateSVGIcon(shape, color, data.es_multiubicacion);

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40]
    });
  }

  /**
   * Genera el SVG para el ícono del marker
   */
  generateSVGIcon(shape, color, isMulti) {
    const badge = isMulti ? `
      <circle cx="24" cy="8" r="6" fill="#9C27B0" stroke="white" stroke-width="2"/>
      <text x="24" y="11" font-size="8" fill="white" text-anchor="middle" font-weight="bold">M</text>
    ` : '';

    if (shape === 'shield') {
      return `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2 L4 8 L4 18 C4 28 16 38 16 38 C16 38 28 28 28 18 L28 8 Z"
                fill="${color}" stroke="white" stroke-width="2"/>
          ${badge}
        </svg>
      `;
    } else {
      return `
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="12" fill="${color}" stroke="white" stroke-width="2"/>
          <path d="M16 32 Q16 40, 16 40 Q16 40, 16 32" fill="${color}" stroke="white" stroke-width="2"/>
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
if (typeof window !== 'undefined') {
  window.MapManager = MapManager;
}
