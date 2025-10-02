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

  // Colores desde CSS variables
  const colors = {
    primary: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-chart-primary').trim() || '#FF6B35',
    secondary: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-chart-secondary').trim() || '#4ECDC4',
    orange: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary-orange').trim() || '#F47921',
    green: getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent-green').trim() || '#50B498'
  };

  return (
    <div className="charts-content">
      <h3>Gráficos Dinámicos</h3>
      
      {selectedFeature && (
        <p className="charts-info">
          Mostrando datos de: <strong>{selectedFeature.nombre}</strong>
        </p>
      )}

      {/* Gráfico de Barras */}
      <div className="chart-wrapper">
        <h4>Cantidad de Incendios por Año</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="año" 
              stroke="var(--color-text-gray)"
              style={{ fontSize: '0.8rem' }}
            />
            <YAxis 
              stroke="var(--color-text-gray)"
              style={{ fontSize: '0.8rem' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-bg-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 2px 8px var(--color-shadow-md)',
                fontSize: '0.85rem'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '0.85rem',
                color: 'var(--color-text-gray)'
              }}
            />
            <Bar 
              dataKey="incendios" 
              fill={colors.primary}
              name="Incendios" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Líneas */}
      <div className="chart-wrapper">
        <h4>Superficie Afectada (hectáreas)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="año"
              stroke="var(--color-text-gray)"
              style={{ fontSize: '0.8rem' }}
            />
            <YAxis 
              stroke="var(--color-text-gray)"
              style={{ fontSize: '0.8rem' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-bg-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 2px 8px var(--color-shadow-md)',
                fontSize: '0.85rem'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: '0.85rem',
                color: 'var(--color-text-gray)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="hectareas" 
              stroke={colors.secondary}
              strokeWidth={2}
              name="Hectáreas quemadas"
              dot={{ fill: colors.secondary, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;