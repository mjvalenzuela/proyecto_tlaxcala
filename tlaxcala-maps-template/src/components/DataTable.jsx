import React, { useState, useMemo } from 'react';
import './DataTable.css';

const DataTable = ({ data, selectedFeature }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Filas por página

  // Filtrar datos según el municipio seleccionado
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (selectedFeature && selectedFeature.nombre) {
      return data.filter(row => 
        row.municipio?.toLowerCase() === selectedFeature.nombre.toLowerCase()
      );
    }
    
    return data;
  }, [data, selectedFeature]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Obtener columnas dinámicamente del CSV
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Handlers para paginación
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Reset página cuando cambian los datos filtrados
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedFeature]);

  if (!data || data.length === 0) {
    return (
      <div className="data-table-container">
        <div className="table-empty-state">
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {/* Header con información */}
      <div className="table-header">
        <h4>Datos del Municipio</h4>
        <span className="table-info">
          {selectedFeature 
            ? `Mostrando datos de: ${selectedFeature.nombre}`
            : `Total de registros: ${filteredData.length}`
          }
        </span>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>
                  {column.charAt(0).toUpperCase() + column.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      {row[column] !== null && row[column] !== undefined 
                        ? row[column] 
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No hay datos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Página {currentPage} de {totalPages} 
            <span className="separator">•</span>
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredData.length)} de {filteredData.length}
          </div>
          
          <div className="pagination-controls">
            <button 
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Primera página"
            >
              «
            </button>
            
            <button 
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Página anterior"
            >
              ‹
            </button>

            {/* Números de página */}
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                // Mostrar solo algunas páginas alrededor de la actual
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="pagination-ellipsis">...</span>;
                }
                return null;
              })}
            </div>
            
            <button 
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Página siguiente"
            >
              ›
            </button>
            
            <button 
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Última página"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;