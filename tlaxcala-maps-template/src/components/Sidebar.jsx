import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay para cerrar al hacer click fuera */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Panel de Control</h3>
          <button 
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          <p className="sidebar-placeholder">
            Contenido Pendiente
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;