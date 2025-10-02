import React from 'react';

const Story = ({ selectedFeature, viewTitle }) => {
  return (
    <div className="story-content">
      {/* Texto dinámico según feature seleccionado */}
      {selectedFeature ? (
        <div className="feature-info">
          <h3>📍 {selectedFeature.nombre}</h3>
          <p>
            Has seleccionado el municipio de <strong>{selectedFeature.nombre}</strong>. 
            Los gráficos y la tabla se han actualizado para mostrar los datos específicos 
            de esta región. Aquí puedes analizar las tendencias históricas y comprender 
            mejor el comportamiento de los indicadores de <strong>{viewTitle.toLowerCase()}</strong> en esta área.
          </p>
          <p style={{ marginTop: '12px', fontSize: '0.85rem', opacity: 0.8 }}>
            💡 Explora diferentes municipios haciendo clic en el mapa para comparar datos.
          </p>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            👆 Haz clic en cualquier municipio del mapa para ver sus datos específicos
          </p>
        </div>
      )}
    </div>
  );
};

export default Story;