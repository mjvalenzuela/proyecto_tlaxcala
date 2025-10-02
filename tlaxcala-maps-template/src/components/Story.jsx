import React from 'react';

const Story = ({ selectedFeature, viewTitle, viewDescription }) => {
  return (
    <div className="story-container">
      {/* Título dinámico según la vista activa */}
      <h1>{viewTitle} - Cambio Climático en Tlaxcala</h1>

      {/* Descripción estática de la vista */}
      <p>{viewDescription}</p>

      {/* Texto dinámico según feature seleccionado */}
      {selectedFeature ? (
        <div className="feature-info">
          <h3>{selectedFeature.nombre}</h3>
          <p>
            Has seleccionado el municipio de <strong>{selectedFeature.nombre}</strong>. 
            Los gráficos se han actualizado para mostrar los datos específicos de esta región.
            Aquí puedes analizar las tendencias históricas y comprender mejor el comportamiento
            de los indicadores de <strong>{viewTitle.toLowerCase()}</strong> en esta área.
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