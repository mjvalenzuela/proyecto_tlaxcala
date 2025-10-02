import React from 'react';

const Story = ({ selectedFeature }) => {
  return (
    <div style={{ 
      padding: '30px', 
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      {/* Título fijo */}
      <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
        Incendios Forestales en Tlaxcala
      </h1>

      {/* Texto estático */}
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
        Los incendios forestales representan una amenaza significativa para los 
        ecosistemas de Tlaxcala. Este análisis presenta datos históricos sobre 
        la frecuencia y el impacto de estos eventos en diferentes municipios.
      </p>

      {/* Texto dinámico */}
      {selectedFeature ? (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff',
          borderLeft: '4px solid #ff6b35',
          borderRadius: '4px'
        }}>
          <h3 style={{ color: '#ff6b35', marginBottom: '10px' }}>
            {selectedFeature.nombre}
          </h3>
          <p style={{ fontSize: '15px', color: '#333' }}>
            Has seleccionado el municipio de <strong>{selectedFeature.nombre}</strong>. 
            Los gráficos se han actualizado para mostrar los datos específicos de esta región.
            Aquí puedes analizar las tendencias históricas y comprender mejor el comportamiento
            de los incendios forestales en esta área.
          </p>
        </div>
      ) : (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e8f4f8',
          borderRadius: '4px'
        }}>
          <p style={{ fontSize: '15px', color: '#555', fontStyle: 'italic' }}>
            👆 Haz clic en cualquier municipio del mapa para ver sus datos específicos
          </p>
        </div>
      )}
    </div>
  );
};

export default Story;