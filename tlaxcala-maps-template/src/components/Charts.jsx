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
    <div style={{ padding: '20px' }}>
      <h3 style={{ 
        color: 'var(--color-title-purple)',
        marginBottom: 'var(--spacing-md)',
        fontSize: '1.5rem'
      }}>
        Gráficos Dinámicos
      </h3>
      
      {selectedFeature && (
        <p style={{ 
          color: 'var(--color-text-gray)', 
          marginBottom: 'var(--spacing-lg)',
          padding: 'var(--spacing-sm)',
          backgroundColor: 'var(--color-bg-gray-light)',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--color-accent-green)'
        }}>
          Mostrando datos de: <strong style={{ color: 'var(--color-primary-orange)' }}>
            {selectedFeature.nombre}
          </strong>
        </p>
      )}

      {/* Gráfico de Barras */}
      <div style={{ marginBottom: '40px' }}>
        <h4 style={{ 
          color: 'var(--color-text-dark)',
          marginBottom: 'var(--spacing-md)',
          fontSize: '1.1rem'
        }}>
          Cantidad de Incendios por Año
        </h4>
        <div style={{
          backgroundColor: 'var(--color-bg-white)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-light)'
        }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="año" 
                stroke="var(--color-text-gray)"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="var(--color-text-gray)"
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-bg-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 8px var(--color-shadow-md)'
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '0.9rem',
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
      </div>

      {/* Gráfico de Líneas */}
      <div>
        <h4 style={{ 
          color: 'var(--color-text-dark)',
          marginBottom: 'var(--spacing-md)',
          fontSize: '1.1rem'
        }}>
          Superficie Afectada (hectáreas)
        </h4>
        <div style={{
          backgroundColor: 'var(--color-bg-white)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border-light)'
        }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="año"
                stroke="var(--color-text-gray)"
                style={{ fontSize: '0.875rem' }}
              />
              <YAxis 
                stroke="var(--color-text-gray)"
                style={{ fontSize: '0.875rem' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-bg-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 2px 8px var(--color-shadow-md)'
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '0.9rem',
                  color: 'var(--color-text-gray)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hectareas" 
                stroke={colors.secondary}
                strokeWidth={3}
                name="Hectáreas quemadas"
                dot={{ fill: colors.secondary, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;