import React from 'react';

const Story = ({ selectedFeature }) => {
  return (
    <div className="story-container">
      {/* Título fijo */}
      <h1>Incendios Forestales en Tlaxcala</h1>

      {/* Texto estático */}
      <p>
        Los incendios forestales representan una amenaza significativa para los 
        ecosistemas de Tlaxcala. Este análisis presenta datos históricos sobre 
        la frecuencia y el impacto de estos eventos en diferentes municipios.
      </p>

      {/* Texto dinámico */}
      {selectedFeature ? (
        <div className="feature-info">
          <h3>{selectedFeature.nombre}</h3>
          <p>
            Has seleccionado el municipio de <strong>{selectedFeature.nombre}</strong>. 
            Los gráficos se han actualizado para mostrar los datos específicos de esta región.
            Aquí puedes analizar las tendencias históricas y comprender mejor el comportamiento
            de los incendios forestales en esta área.
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