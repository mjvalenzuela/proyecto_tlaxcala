import React from 'react';
import './MapPopup.css';

const MapPopup = ({ feature, onClose }) => {
  if (!feature) return null;

  // Filtrar propiedades que no queremos mostrar
  const excludeKeys = ['geometry', 'bbox', 'id', 'type'];
  
  const properties = Object.entries(feature)
    .filter(([key]) => !excludeKeys.includes(key))
    .filter(([, value]) => value !== null && value !== undefined && value !== '');

  return (
    <div className="map-popup">
      <div className="popup-header">
        <h4>{feature.nombre || feature.NOMBRE || 'Información'}</h4>
        <button 
          className="popup-close"
          onClick={onClose}
          aria-label="Cerrar popup"
        >
          ✕
        </button>
      </div>
      
      <div className="popup-content">
        {properties.length > 0 ? (
          <table className="popup-table">
            <tbody>
              {properties.map(([key, value]) => (
                <tr key={key}>
                  <td className="popup-key">{key}:</td>
                  <td className="popup-value">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="popup-empty">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default MapPopup;