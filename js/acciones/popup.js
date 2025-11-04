/**
 * Generación de popups para los markers
 */

class PopupGenerator {
  constructor() {
    this.config = window.AccionesConfig;
  }

  /**
   * Genera el HTML del popup para una acción
   */
  generatePopup(accion) {
    const ubicacion = accion.currentUbicacion;
    const color = this.config.COLORS[accion.dependencia] || this.config.COLORS.default;

    return `
      <div class="popup-container">
        <div class="popup-header" style="background: linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, -20)} 100%);">
          <div class="popup-header-icon">
            ${this.getIconForTipo(accion.tipo)}
          </div>
          <div class="popup-header-content">
            <p class="popup-dependencia">${this.truncate(accion.dependencia, 50)}</p>
            <h3 class="popup-title">${this.truncate(accion.nombre_proyecto, 70)}</h3>
          </div>
        </div>
        <div class="popup-body">
          ${this.generateBadges(accion)}
          ${this.generateLocation(ubicacion)}
          ${this.generateMeta(accion)}
          ${this.generateDescription(accion)}
          ${this.generatePopulation(accion)}
          ${this.generateFooter(accion)}
        </div>
      </div>
    `;
  }

  /**
   * Genera la sección de ubicación
   */
  generateLocation(ubicacion) {
    return `
      <div class="popup-section popup-location">
        <div class="popup-section-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="popup-section-content">
          <span class="popup-location-text">${ubicacion.localidad || 'Tlaxcala'}</span>
        </div>
      </div>
    `;
  }

  /**
   * Genera la sección de metadatos
   */
  generateMeta(accion) {
    const fechaInicio = this.formatDate(accion.fecha_inicio);
    const fechaFin = accion.fecha_fin ? this.formatDate(accion.fecha_fin) : 'En curso';

    return `
      <div class="popup-section popup-meta">
        <div class="popup-section-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="popup-section-content">
          <div class="popup-meta-grid">
            <div class="popup-meta-item">
              <span class="popup-meta-label">Inicio</span>
              <span class="popup-meta-value">${fechaInicio}</span>
            </div>
            ${accion.fecha_fin ? `
              <div class="popup-meta-item">
                <span class="popup-meta-label">Fin</span>
                <span class="popup-meta-value">${fechaFin}</span>
              </div>
            ` : ''}
            <div class="popup-meta-item">
              <span class="popup-meta-label">Temporalidad</span>
              <span class="popup-meta-value">${accion.temporalidad || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Genera la descripción
   */
  generateDescription(accion) {
    if (!accion.descripcion_corta) return '';

    return `
      <div class="popup-section popup-description">
        <div class="popup-section-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="popup-section-content">
          <p class="popup-description-text">${this.truncate(accion.descripcion_corta, 180)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Genera la sección de población objetivo
   */
  generatePopulation(accion) {
    if (!accion.poblacion_objetivo) return '';

    return `
      <div class="popup-section popup-population">
        <div class="popup-section-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="popup-section-content">
          <div class="popup-population-label">Población objetivo</div>
          <p class="popup-population-value">${this.truncate(accion.poblacion_objetivo, 100)}</p>
        </div>
      </div>
    `;
  }

  /**
   * Genera los badges (tipo y estado)
   */
  generateBadges(accion) {
    const tipoBadge = this.generateTipoBadge(accion.tipo);
    const estadoBadge = this.generateEstadoBadge(accion.estado);
    const multiUbicacionBadge = accion.es_multiubicacion ? this.generateMultiUbicacionBadge(accion.total_ubicaciones) : '';

    return `
      <div class="popup-badges">
        ${tipoBadge}
        ${estadoBadge}
        ${multiUbicacionBadge}
      </div>
    `;
  }

  /**
   * Genera badge de tipo
   */
  generateTipoBadge(tipo) {
    const clase = tipo === 'Proyecto' ? 'tipo-proyecto' : 'tipo-programa';
    return `<span class="popup-badge ${clase}">${tipo}</span>`;
  }

  /**
   * Genera badge de estado
   */
  generateEstadoBadge(estado) {
    const clase = estado === 'Activo' ? 'estado-activo' : 'estado-concluido';
    return `<span class="popup-badge ${clase}">${estado}</span>`;
  }

  /**
   * Genera badge de multi-ubicación
   */
  generateMultiUbicacionBadge(totalUbicaciones) {
    return `
      <span class="popup-badge popup-badge-multi">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${totalUbicaciones} ubicaciones
      </span>
    `;
  }

  /**
   * Genera el ícono para el tipo de acción en el header
   */
  getIconForTipo(tipo) {
    if (tipo === 'Proyecto') {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
        </svg>
      `;
    } else {
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    }
  }

  /**
   * Genera el footer del popup con 3 botones
   */
  generateFooter(accion) {
    return `
      <div class="popup-footer">
        <button class="popup-btn popup-btn-pdf" onclick="console.log('Ver PDF:', ${accion.id})" title="Ver documento PDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
          PDF
        </button>
        <button class="popup-btn popup-btn-fotos" onclick="console.log('Ver Fotos:', ${accion.id})" title="Ver galería de fotos">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Fotos
        </button>
        <button class="popup-btn popup-btn-videos" onclick="console.log('Ver Videos:', ${accion.id})" title="Ver videos">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          Videos
        </button>
      </div>
    `;
  }

  /**
   * Formatea una fecha
   */
  formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('es-MX', options);
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Trunca un texto a un máximo de caracteres
   */
  truncate(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Ajusta el brillo de un color hexadecimal
   */
  adjustColor(color, percent) {
    // Convertir hex a RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);

    // Ajustar brillo
    r = Math.max(0, Math.min(255, r + (r * percent / 100)));
    g = Math.max(0, Math.min(255, g + (g * percent / 100)));
    b = Math.max(0, Math.min(255, b + (b * percent / 100)));

    // Convertir de vuelta a hex
    const rHex = Math.round(r).toString(16).padStart(2, '0');
    const gHex = Math.round(g).toString(16).padStart(2, '0');
    const bHex = Math.round(b).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }
}

// Hacer PopupGenerator disponible globalmente
if (typeof window !== 'undefined') {
  window.PopupGenerator = PopupGenerator;
}
