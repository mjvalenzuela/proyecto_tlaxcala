import React from 'react';
import './Navbar.css';

const Navbar = ({ activeView, onViewChange, onToggleSidebar }) => {
  const menuItems = [
    { id: 'vulnerabilidad', label: 'Vulnerabilidad' },
    { id: 'riesgo', label: 'Riesgo' },
    { id: 'amenazas', label: 'Amenazas' },
    { id: 'impactos', label: 'Impactos' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Botón Hamburguesa para Sidebar */}
        <button 
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Logo/Título */}
        <div className="navbar-brand">
          <h2>Adaptación al Cambio Climático</h2>
        </div>

        {/* Menú de Navegación */}
        <ul className="navbar-menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                className={`navbar-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => onViewChange(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;