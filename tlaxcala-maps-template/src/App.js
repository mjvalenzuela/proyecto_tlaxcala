import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Charts from './components/Charts';
import Story from './components/Story';
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [activeView, setActiveView] = useState('vulnerabilidad');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Configuración de las vistas
  const viewsConfig = {
    vulnerabilidad: {
      title: 'Vulnerabilidad',
      layer: 'Tlaxcala:Municipios',
      description: 'Identifica las zonas del estado más expuestas a los efectos del cambio climático.'
    },
    riesgo: {
      title: 'Riesgo',
      layer: 'Tlaxcala:Municipios',
      description: 'Analiza el nivel de riesgo que enfrentan diferentes regiones y sectores.'
    },
    amenazas: {
      title: 'Amenazas',
      layer: 'Tlaxcala:Municipios',
      description: 'Conoce las principales amenazas climáticas que afectan al estado.'
    },
    impactos: {
      title: 'Impactos',
      layer: 'Tlaxcala:Municipios',
      description: 'Evalúa los impactos y diagnósticos del cambio climático en la región.'
    }
  };

  useEffect(() => {
    // Cargar el CSV
    fetch('/data/ejemplo.csv')
      .then(response => response.text())
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setCsvData(results.data);
          }
        });
      });
  }, []);

  const handleFeatureClick = (properties) => {
    setSelectedFeature(properties);
  };

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    setSelectedFeature(null); // Reset al cambiar de vista
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentView = viewsConfig[activeView];

  return (
    <div className="App">
      {/* Navbar Superior */}
      <Navbar 
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleSidebar={toggleSidebar}
      />

      {/* Sidebar Izquierdo */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenido Principal */}
      <div className="main-content">
        <Story 
          selectedFeature={selectedFeature}
          viewTitle={currentView.title}
          viewDescription={currentView.description}
        />
        
        <div className="content-grid">
          <div className="map-container">
            <Map 
              onFeatureClick={handleFeatureClick}
              layerName={currentView.layer}
            />
          </div>
          
          <div className="charts-container">
            <Charts 
              data={csvData} 
              selectedFeature={selectedFeature} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;