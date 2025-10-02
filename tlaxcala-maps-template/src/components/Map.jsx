import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map as OLMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

const Map = ({ onFeatureClick }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef();

  useEffect(() => {
    // Capa base OpenStreetMap
    const baseLayer = new TileLayer({
      source: new OSM()
    });

    // Capa WMS desde tu Geoserver
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/tlaxcala/wms',
        params: {
          'LAYERS': 'tlaxcala:municipios',
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0
      })
    });

    // Crear el mapa centrado en Tlaxcala
    const map = new OLMap({
      target: mapRef.current,
      layers: [baseLayer, wmsLayer],
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
            onFeatureClick(properties);
          }
        } catch (error) {
          console.error('Error al obtener info del feature:', error);
        }
      }
    });

    mapInstanceRef.current = map;

    return () => map.setTarget(undefined);
  }, [onFeatureClick]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '500px',
        border: '2px solid #ddd',
        borderRadius: '8px'
      }} 
    />
  );
};

export default Map;