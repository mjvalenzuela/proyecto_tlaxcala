import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import Charts from './components/Charts';
import Story from './components/Story';
import DataTable from './components/DataTable';
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

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

  // Detectar vista activa desde la URL
  const getActiveView = () => {
    const path = location.pathname.replace('/', '');
    return viewsConfig[path] ? path : 'vulnerabilidad';
  };

  const activeView = getActiveView();
  const currentView = viewsConfig[activeView];

  // Cargar CSV al montar el componente
  useEffect(() => {
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
      })
      .catch(error => console.error('Error cargando CSV:', error));
  }, []);

  const handleFeatureClick = (properties) => {
    setSelectedFeature(properties);
  };

  const handleViewChange = (viewId) => {
    navigate(`/${viewId}`);
    setSelectedFeature(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

      {/* Contenido Principal con Rutas */}
      <Routes>
        <Route path="/" element={
          <DashboardView 
            currentView={currentView}
            csvData={csvData}
            selectedFeature={selectedFeature}
            handleFeatureClick={handleFeatureClick}
          />
        } />
        <Route path="/vulnerabilidad" element={
          <DashboardView 
            currentView={currentView}
            csvData={csvData}
            selectedFeature={selectedFeature}
            handleFeatureClick={handleFeatureClick}
          />
        } />
        <Route path="/riesgo" element={
          <DashboardView 
            currentView={currentView}
            csvData={csvData}
            selectedFeature={selectedFeature}
            handleFeatureClick={handleFeatureClick}
          />
        } />
        <Route path="/amenazas" element={
          <DashboardView 
            currentView={currentView}
            csvData={csvData}
            selectedFeature={selectedFeature}
            handleFeatureClick={handleFeatureClick}
          />
        } />
        <Route path="/impactos" element={
          <DashboardView 
            currentView={currentView}
            csvData={csvData}
            selectedFeature={selectedFeature}
            handleFeatureClick={handleFeatureClick}
          />
        } />
      </Routes>
    </div>
  );
}

// Componente para el Dashboard (layout principal)
const DashboardView = ({ currentView, csvData, selectedFeature, handleFeatureClick }) => {
  return (
    <div className="main-content">
      {/* Header con título y descripción */}
      <div className="dashboard-header">
        <h1>{currentView.title} - Cambio Climático en Tlaxcala</h1>
        <p className="dashboard-description">{currentView.description}</p>
      </div>

      {/* Grid principal del dashboard */}
      <div className="dashboard-grid">
        {/* Columna Izquierda: Gráficos + Texto */}
        <div className="left-column">
          <div className="charts-section">
            <Charts 
              data={csvData} 
              selectedFeature={selectedFeature} 
            />
          </div>
          
          <div className="story-section">
            <Story 
              selectedFeature={selectedFeature}
              viewTitle={currentView.title}
              viewDescription={currentView.description}
            />
          </div>
        </div>

        {/* Columna Derecha: Mapa + Tabla */}
        <div className="right-column">
          <div className="map-section">
            <Map 
              onFeatureClick={handleFeatureClick}
              layerName={currentView.layer}
            />
          </div>
          
          <div className="table-section">
            <DataTable 
              data={csvData}
              selectedFeature={selectedFeature}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;