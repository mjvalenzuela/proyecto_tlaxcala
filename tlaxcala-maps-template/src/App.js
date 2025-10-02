import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Map from './components/Map';
import Charts from './components/Charts';
import Story from './components/Story';
import './App.css';

function App() {
  const [csvData, setCsvData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

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

  return (
    <div className="App">
      <Story selectedFeature={selectedFeature} />
      
      <div className="content-grid">
        <div className="map-container">
          <Map onFeatureClick={handleFeatureClick} />
        </div>
        
        <div className="charts-container">
          <Charts data={csvData} selectedFeature={selectedFeature} />
        </div>
      </div>
    </div>
  );
}

export default App;