import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Charts = ({ data, selectedFeature }) => {
  // Filtrar datos según el feature seleccionado
  const filteredData = selectedFeature 
    ? data.filter(item => item.municipio === selectedFeature.nombre)
    : data;

  return (
    <div style={{ padding: '20px' }}>
      <h3>Gráficos Dinámicos</h3>
      
      {selectedFeature && (
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Mostrando datos de: <strong>{selectedFeature.nombre}</strong>
        </p>
      )}

      {/* Gráfico de Barras */}
      <div style={{ marginBottom: '40px' }}>
        <h4>Cantidad de Incendios por Año</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="año" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="incendios" fill="#ff6b35" name="Incendios" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Líneas */}
      <div>
        <h4>Superficie Afectada (hectáreas)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="año" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="hectareas" 
              stroke="#4ecdc4" 
              strokeWidth={2}
              name="Hectáreas quemadas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;