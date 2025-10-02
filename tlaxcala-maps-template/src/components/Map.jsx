import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import MapPopup from './MapPopup';

const Map = ({ onFeatureClick, layerName }) => {
  const mapRef = useRef();
  const popupRef = useRef();
  const mapInstanceRef = useRef();
  const overlayRef = useRef();
  const [popupFeature, setPopupFeature] = useState(null);

  useEffect(() => {
    // Capa base OpenStreetMap
    const baseLayer = new TileLayer({
      source: new OSM()
    });

    // Capa WMS desde tu Geoserver con layer dinámico
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Tlaxcala/wms',
        params: {
          'LAYERS': layerName,
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0
      })
    });

    // Crear overlay para el popup
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    });
    overlayRef.current = overlay;

    // Crear el mapa centrado en Tlaxcala
    const map = new OLMap({
      target: mapRef.current,
      layers: [baseLayer, wmsLayer],
      overlays: [overlay],
      view: new View({
        center: fromLonLat([-98.2375, 19.3182]), // Coordenadas de Tlaxcala
        zoom: 10
      })
    });

    // Detectar clicks en el mapa
    map.on('singleclick', async (evt) => {
      const viewResolution = map.getView().getResolution();
      const url = wmsLayer.getSource().getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        { 'INFO_FORMAT': 'application/json' }
      );

      if (url) {
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const properties = data.features[0].properties;
            
            // Actualizar el popup
            setPopupFeature(properties);
            overlay.setPosition(evt.coordinate);
            
            // Enviar al componente padre
            onFeatureClick(properties);
          } else {
            // No hay features, cerrar popup
            setPopupFeature(null);
            overlay.setPosition(undefined);
          }
        } catch (error) {
          console.error('Error al obtener info del feature:', error);
          setPopupFeature(null);
          overlay.setPosition(undefined);
        }
      }
    });

    mapInstanceRef.current = map;

    return () => map.setTarget(undefined);
  }, [onFeatureClick, layerName]);

  const handleClosePopup = () => {
    setPopupFeature(null);
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }} 
      />
      
      {/* Popup container */}
      <div ref={popupRef}>
        <MapPopup 
          feature={popupFeature} 
          onClose={handleClosePopup}
        />
      </div>
    </div>
  );
};

export default Map;