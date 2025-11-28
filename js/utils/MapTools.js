/**
 * Herramienta de medición de distancias y áreas en el mapa.
 */
export class MeasurementTool {
  constructor(map) {
    this.map = map;
    this.measureLayer = null;
    this.measureSource = null;
    this.draw = null;
    this.measureTooltipElement = null;
    this.measureTooltip = null;
    this.currentMeasureType = null;

    this.inicializar();
  }

  inicializar() {
    this.measureSource = new ol.source.Vector();

    this.measureLayer = new ol.layer.Vector({
      source: this.measureSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 140, 0, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ff8c00',
          width: 3,
          lineDash: [10, 5]
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: '#ff8c00',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 140, 0, 0.4)'
          })
        })
      }),
      zIndex: 1000
    });

    this.map.addLayer(this.measureLayer);
  }

  medirDistancia() {
    this.limpiar();
    this.currentMeasureType = 'LineString';
    this.iniciarDibujo();
  }

  medirArea() {
    this.limpiar();
    this.currentMeasureType = 'Polygon';
    this.iniciarDibujo();
  }

  /**
   * Configura la interacción de dibujo para medición.
   */
  iniciarDibujo() {
    const type = this.currentMeasureType;

    this.draw = new ol.interaction.Draw({
      source: this.measureSource,
      type: type,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 140, 0, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ff8c00',
          lineDash: [10, 5],
          width: 3
        }),
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({
            color: '#ff8c00'
          })
        })
      })
    });

    this.map.addInteraction(this.draw);

    this.crearTooltipMedicion();

    let listener;
    this.draw.on('drawstart', (evt) => {
      const sketch = evt.feature;

      listener = sketch.getGeometry().on('change', (evt) => {
        const geom = evt.target;
        let output;
        if (geom instanceof ol.geom.Polygon) {
          output = this.formatearArea(geom);
        } else if (geom instanceof ol.geom.LineString) {
          output = this.formatearLongitud(geom);
        }

        const tooltipCoord = geom.getLastCoordinate();
        this.measureTooltipElement.innerHTML = output;
        this.measureTooltip.setPosition(tooltipCoord);
      });
    });

    this.draw.on('drawend', () => {
      this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      this.measureTooltip.setOffset([0, -7]);

      this.measureTooltipElement = null;
      this.crearTooltipMedicion();

      ol.Observable.unByKey(listener);
    });
  }

  crearTooltipMedicion() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
    }

    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';

    this.measureTooltip = new ol.Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false,
      insertFirst: false
    });

    this.map.addOverlay(this.measureTooltip);
  }

  formatearLongitud(line) {
    const length = ol.sphere.getLength(line);
    let output;

    if (length > 1000) {
      output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
      output = Math.round(length * 100) / 100 + ' m';
    }

    return output;
  }

  formatearArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;

    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + ' km²';
    } else {
      output = Math.round(area * 100) / 100 + ' m²';
    }

    return output;
  }

  limpiar() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = null;
    }

    if (this.measureSource) {
      this.measureSource.clear();
    }

    const tooltips = document.querySelectorAll('.ol-tooltip');
    tooltips.forEach(tooltip => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    });

    this.measureTooltipElement = null;
    this.currentMeasureType = null;
  }

  detener() {
    if (this.draw) {
      this.map.removeInteraction(this.draw);
      this.draw = null;
    }
  }

  destruir() {
    this.limpiar();
    if (this.measureLayer) {
      this.map.removeLayer(this.measureLayer);
    }
  }
}

/**
 * Herramienta para exportar el mapa como imagen PNG.
 */
export class ExportTool {
  constructor(map) {
    this.map = map;
  }

  exportarPNG(filename = 'mapa') {
    this.map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas');
      const size = this.map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');

      const canvases = this.map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer');

      Array.prototype.forEach.call(canvases, (canvas) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

          let matrix;
          const transform = canvas.style.transform;

          if (transform) {
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0
            ];
          }

          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );

          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }

          mapContext.drawImage(canvas, 0, 0);
        }
      });

      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = mapCanvas.toDataURL();
      link.click();
    });

    this.map.renderSync();
  }

  exportarConDimensiones(width, height, filename = 'mapa') {
    const size = this.map.getSize();
    const viewResolution = this.map.getView().getResolution();

    this.map.setSize([width, height]);
    this.map.getView().setResolution(viewResolution);

    this.map.once('rendercomplete', () => {
      this.exportarPNG(filename);
      this.map.setSize(size);
    });

    this.map.renderSync();
  }
}

/**
 * Herramienta de comparación de capas con slider deslizable.
 */
export class LayerSwipeTool {
  constructor(map, capaIzquierda, capaDerecha) {
    this.map = map;
    this.capaIzquierda = capaIzquierda;
    this.capaDerecha = capaDerecha;
    this.swipeElement = null;
    this.swipeValue = 50;
    this.activo = false;
  }

  activar() {
    if (this.activo) return;

    this.crearControlSwipe();
    this.aplicarClip(this.swipeValue);

    this.capaIzquierda.on('prerender', this.precomposeIzquierda.bind(this));
    this.capaIzquierda.on('postrender', this.postcomposeIzquierda.bind(this));

    this.capaDerecha.on('prerender', this.precomposeDerecha.bind(this));
    this.capaDerecha.on('postrender', this.postcomposeDerecha.bind(this));

    this.activo = true;
    this.map.render();
  }

  crearControlSwipe() {
    const container = document.createElement('div');
    container.className = 'layer-swipe-container';
    container.innerHTML = `
      <input
        type="range"
        class="layer-swipe-range"
        min="0"
        max="100"
        value="50"
        step="1"
      >
      <div class="layer-swipe-line"></div>
      <div class="layer-swipe-labels">
        <span class="swipe-label-left">Capa A</span>
        <span class="swipe-label-right">Capa B</span>
      </div>
    `;

    const viewport = this.map.getViewport();
    viewport.appendChild(container);

    const range = container.querySelector('.layer-swipe-range');
    const line = container.querySelector('.layer-swipe-line');

    range.addEventListener('input', (e) => {
      this.swipeValue = parseInt(e.target.value);
      this.aplicarClip(this.swipeValue);

      line.style.left = `${this.swipeValue}%`;

      this.map.render();
    });

    this.swipeElement = container;
  }

  aplicarClip(percentage) {
    this.swipePercentage = percentage / 100;
  }

  precomposeIzquierda(event) {
    const ctx = event.context;
    const width = ctx.canvas.width * this.swipePercentage;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, ctx.canvas.height);
    ctx.clip();
  }

  postcomposeIzquierda(event) {
    const ctx = event.context;
    ctx.restore();
  }

  precomposeDerecha(event) {
    const ctx = event.context;
    const width = ctx.canvas.width * this.swipePercentage;

    ctx.save();
    ctx.beginPath();
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
    ctx.clip();
  }

  postcomposeDerecha(event) {
    const ctx = event.context;
    ctx.restore();
  }

  desactivar() {
    if (!this.activo) return;

    this.capaIzquierda.un('prerender', this.precomposeIzquierda);
    this.capaIzquierda.un('postrender', this.postcomposeIzquierda);
    this.capaDerecha.un('prerender', this.precomposeDerecha);
    this.capaDerecha.un('postrender', this.postcomposeDerecha);

    if (this.swipeElement && this.swipeElement.parentNode) {
      this.swipeElement.parentNode.removeChild(this.swipeElement);
    }

    this.activo = false;
    this.map.render();
  }

  cambiarCapas(capaIzquierda, capaDerecha) {
    const estabaActivo = this.activo;

    if (estabaActivo) {
      this.desactivar();
    }

    this.capaIzquierda = capaIzquierda;
    this.capaDerecha = capaDerecha;

    if (estabaActivo) {
      this.activar();
    }
  }
}

/**
 * Herramienta de animaciones para navegación en el mapa.
 */
export class AnimationTool {
  constructor(map) {
    this.map = map;
    this.view = map.getView();
  }

  volarHacia(centro, zoom, duracion = 1000) {
    const coordenadas = ol.proj.fromLonLat(centro);

    this.view.animate({
      center: coordenadas,
      zoom: zoom,
      duration: duracion,
      easing: ol.easing.easeInOut
    });
  }

  volarConBounce(centro, zoom, duracion = 1000) {
    const coordenadas = ol.proj.fromLonLat(centro);

    this.view.animate(
      {
        center: coordenadas,
        duration: duracion * 0.8,
        easing: ol.easing.easeIn
      },
      {
        zoom: zoom - 1,
        duration: duracion * 0.1,
        easing: ol.easing.easeOut
      },
      {
        zoom: zoom,
        duration: duracion * 0.1,
        easing: ol.easing.easeOut
      }
    );
  }

  rotar(angulo, duracion = 1000) {
    this.view.animate({
      rotation: angulo * (Math.PI / 180),
      duration: duracion,
      easing: ol.easing.easeInOut
    });
  }

  zoomAnimado(nivelZoom, duracion = 500) {
    this.view.animate({
      zoom: nivelZoom,
      duration: duracion,
      easing: ol.easing.easeInOut
    });
  }

  espiralHacia(centro, zoom, duracion = 2000) {
    const coordenadas = ol.proj.fromLonLat(centro);
    const rotation = this.view.getRotation();

    this.view.animate(
      {
        rotation: rotation + Math.PI,
        duration: duracion / 2,
        easing: ol.easing.easeIn
      },
      {
        center: coordenadas,
        zoom: zoom,
        rotation: rotation + Math.PI * 2,
        duration: duracion / 2,
        easing: ol.easing.easeOut
      }
    );
  }

  resetearRotacion(duracion = 500) {
    this.view.animate({
      rotation: 0,
      duration: duracion,
      easing: ol.easing.easeInOut
    });
  }

  async recorridoPorPuntos(puntos, zoomPorPunto, duracionPorPunto = 1500, pausaEntrePuntos = 500) {
    for (const punto of puntos) {
      await new Promise(resolve => {
        this.volarHacia(punto.centro, punto.zoom || zoomPorPunto, duracionPorPunto);

        setTimeout(() => {
          resolve();
        }, duracionPorPunto + pausaEntrePuntos);
      });
    }
  }
}

export default {
  MeasurementTool,
  ExportTool,
  LayerSwipeTool,
  AnimationTool
};
