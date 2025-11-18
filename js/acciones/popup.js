/**
 * Generación de popups para los markers
 * Popup complejo con estructura de formulario
 */

class PopupGenerator {
  constructor() {
    this.config = window.AccionesConfig;
  }

  /**
   * Almacena las acciones globalmente para acceso desde botones
   */
  static setAccionesData(acciones) {
    window.__accionesData = acciones;
  }

  /**
   * Obtiene una acción por ID
   */
  static getAccionById(accionId) {
    return window.__accionesData?.find(a => a.id === accionId) || null;
  }

  /**
   * Genera el HTML del popup para una acción
   * Siempre usa el popup complejo
   */
  generatePopup(accion) {
    const ubicacion = accion.currentUbicacion || accion.ubicaciones[0];
    const esMultiUbicacion = accion.es_multiubicacion;
    const esEstatal = ubicacion?.es_estatal || false;

    // Determinar el índice de la ubicación actual
    const ubicacionIdx = accion.currentUbicacionIdx !== undefined
      ? accion.currentUbicacionIdx
      : 0;

    return `
      <div class="popup-formulario">
        ${this.generateHeader(accion)}
        ${this.generateBody(accion, ubicacion, esMultiUbicacion, esEstatal)}
        ${this.generateFooter(accion, ubicacionIdx, esMultiUbicacion)}
      </div>
    `;
  }

  // ============================================
  // HEADER
  // ============================================

  generateHeader(accion) {
    return `
      <div class="popup-header" style="background-color: ${accion.color}">
        <div class="popup-header-field">
          <label>Dependencia</label>
          <div class="header-value">${this.truncate(
            accion.dependencia,
            60
          )}</div>
        </div>
        <div class="popup-header-field">
          <label>Nombre del programa o proyecto</label>
          <div class="header-value header-title">${this.truncate(
            accion.nombre_proyecto,
            80
          )}</div>
        </div>
      </div>
    `;
  }

  // ============================================
  // BODY
  // ============================================

  generateBody(accion, ubicacion, esMultiUbicacion, esEstatal) {
    return `
      <div class="popup-body">
        <!-- Fila 1: Tipo y Estado -->
        <div class="popup-row">
          <div class="popup-field popup-field-half">           
            <div class="field-value">
              <span class="badge badge-tipo ${
                accion.tipo === "Proyecto" ? "badge-proyecto" : "badge-programa"
              }">
                ${accion.tipo}
              </span>
            </div>
          </div>
          <div class="popup-field popup-field-half">     
            <div class="field-value">
              <span class="badge badge-estado ${
                accion.estado === "activo" ? "badge-activo" : "badge-concluido"
              }">
                ${accion.estado === "activo" ? "Activo" : "Concluido"}
              </span>
            </div>
          </div>
        </div>

        <!-- Multi-ubicación (destacado) -->
        ${esMultiUbicacion ? this.generateMultiUbicacionSection(accion) : ""}

        <!-- Ubicación actual -->
        ${this.generateUbicacionSection(ubicacion, esEstatal)}

        <!-- Fecha de inicio y Temporalidad -->
        <div class="popup-row">
          <div class="popup-field popup-field-half">
            <label>Fecha de inicio</label>
            <div class="field-value">${this.formatDate(accion.fecha_inicio || accion.created_at)}</div>
          </div>
          <div class="popup-field popup-field-half">
            <label>Temporalidad</label>
            <div class="field-value">${accion.temporalidad || "N/A"}</div>
          </div>
        </div>

        <!-- Actividad (campo grande) -->
        <div class="popup-field popup-field-full">
          <label>Actividad</label>
          <div class="field-value field-value-textarea">
            ${ubicacion?.activity || accion.actividades || "Sin especificar"}
          </div>
        </div>

        <!-- Objetivo (campo grande) -->
        ${
          accion.objetivos
            ? `
          <div class="popup-field popup-field-full">
            <label>Objetivo del programa o proyecto</label>
            <div class="field-value field-value-textarea">
              ${this.truncate(accion.objetivos, 300)}
            </div>
          </div>
        `
            : ""
        }

        <!-- Población Objetivo (campo grande) -->
        ${
          accion.poblacion_objetivo
            ? `
          <div class="popup-field popup-field-full">
            <label>Población Objetivo</label>
            <div class="field-value field-value-textarea">
              ${this.truncate(accion.poblacion_objetivo, 250)}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  // ============================================
  // SECCIÓN MULTI-UBICACIÓN (DESTACADA)
  // ============================================

  generateMultiUbicacionSection(accion) {
    // Generar ID único para este popup
    const uniqueId = `ubicaciones-${accion.id.replace(/[^a-zA-Z0-9]/g, "-")}`;

    return `
      <div class="popup-field popup-field-full popup-field-destacado">
        <label>
          <span class="badge badge-count badge-clickeable"
                id="chip-${uniqueId}"
                onclick="toggleUbicaciones('${uniqueId}')"
                title="Click para ver/ocultar ubicaciones">
             ${accion.total_ubicaciones} ubicaciones
            <svg class="badge-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="2 4 6 8 10 4"></polyline>
            </svg>
          </span>
        </label>
        <div class="field-value">
          <div class="ubicaciones-mini-list collapsed" id="list-${uniqueId}">
            ${accion.ubicaciones
              .slice(0, 3)
              .map(
                (ub) => `
              <div class="ubicacion-mini-item">
                📌 ${ub.lugar}${
                  ub.activity ? ` - ${this.truncate(ub.activity, 30)}` : ""
                }
              </div>
            `
              )
              .join("")}
            ${
              accion.total_ubicaciones > 3
                ? `
              <div class="ubicacion-mini-item more">
                ... y ${accion.total_ubicaciones - 3} ubicaciones más
              </div>
            `
                : ""
            }
          </div>
          <button class="btn-ver-ubicaciones" id="btn-${uniqueId}" style="display: none;" onclick="verTodasUbicaciones('${
      accion.id
    }')">
            Ver todas las ubicaciones
          </button>
        </div>
      </div>
    `;
  }

  // ============================================
  // SECCIÓN UBICACIÓN
  // ============================================

  generateUbicacionSection(ubicacion, esEstatal) {
    const icono = esEstatal ? "🏛️" : "📍";
    const tipoTexto = esEstatal ? "Nivel Estatal" : "Ubicación específica";

    return `
      <div class="popup-field popup-field-full">
        <label>
          ${icono} Ubicación
          ${esEstatal ? '<span class="badge badge-estatal">Estatal</span>' : ""}
        </label>
        <div class="field-value">
          <strong>${ubicacion?.lugar || "Sin especificar"}</strong>
          ${
            esEstatal
              ? '<div class="ubicacion-alcance">Alcance: Todo el Estado de Tlaxcala</div>'
              : ""
          }
          ${
            ubicacion?.lat && ubicacion?.lng && !esEstatal
              ? `
            <div class="ubicacion-coords">
              Coordenadas: ${ubicacion.lat.toFixed(5)}, ${ubicacion.lng.toFixed(
                  5
                )}
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  // ============================================
  // FOOTER
  // ============================================

  generateFooter(accion, ubicacionIdx = 0, esMultiUbicacion = false) {
    // Si es multiubicación, no mostrar botones de evidencias
    // (se mostrarán en el modal "Ver todas las ubicaciones")
    if (esMultiUbicacion) {
      return ''; // No generar footer con botones
    }

    // Para ubicaciones únicas, mostrar los 3 botones normalmente
    return `
      <div class="popup-footer">
        <button class="popup-btn popup-btn-primary" onclick="verDetallePDF('${accion.id}', ${ubicacionIdx})">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          PDF
        </button>
        <button class="popup-btn popup-btn-secondary" onclick="verFotos('${accion.id}', ${ubicacionIdx})">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Fotos
        </button>
        <button class="popup-btn popup-btn-secondary" onclick="verVideos('${accion.id}', ${ubicacionIdx})">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          Videos
        </button>
      </div>
    `;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatea una fecha ISO a formato legible
   */
  formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
      // Si la fecha viene en formato YYYY-MM-DD (sin hora), parsearla manualmente
      // para evitar problemas de zona horaria
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // mes es 0-indexed
        const options = { year: "numeric", month: "short", day: "numeric" };
        return date.toLocaleDateString("es-MX", options);
      }

      // Para fechas con hora (ISO completo), usar el método normal
      const date = new Date(dateString);
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString("es-MX", options);
    } catch (error) {
      return "N/A";
    }
  }

  /**
   * Calcula la temporalidad del proyecto
   */
  calcularTemporalidad(accion) {
    const fechaBase = accion.fecha_inicio || accion.created_at;
    if (!fechaBase) return "N/A";

    try {
      const inicio = new Date(fechaBase);
      const ahora = new Date();
      const diffTime = Math.abs(ahora - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) return `${diffDays} días`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
      return `${Math.floor(diffDays / 365)} años`;
    } catch (error) {
      return "N/A";
    }
  }

  /**
   * Trunca un texto a un máximo de caracteres
   */
  truncate(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }
}

// ============================================
// FUNCIONES GLOBALES PARA BOTONES
// ============================================

/**
 * Muestra el detalle PDF de una acción
 * Abre el Drive con los PDFs correspondientes al survey_id
 */
function verDetallePDF(accionId, ubicacionIdx = 0) {
  const accion = PopupGenerator.getAccionById(accionId);
  if (!accion || !accion.ubicaciones[ubicacionIdx]) {
    console.warn('Acción o ubicación no encontrada');
    return;
  }

  const ubicacion = accion.ubicaciones[ubicacionIdx];

  // Verificar que existe el survey_id
  if (!ubicacion.survey_id) {
    toast.warning('PDF no disponible', 'No se encontró el ID del survey para esta ubicación.');
    return;
  }

  // Construir URL dinámica con el survey_id
  const pdfUrl = `https://api.cambioclimaticotlaxcala.mx/api/v1/surveys/${ubicacion.survey_id}/pdf/`;

  // Abrir la URL en una nueva pestaña
  window.open(pdfUrl, '_blank');
}

/**
 * Muestra fotos de una acción
 * Abre la imagen en una nueva ventana
 */
function verFotos(accionId, ubicacionIdx = 0) {
  const accion = PopupGenerator.getAccionById(accionId);
  if (!accion || !accion.ubicaciones[ubicacionIdx]) {
    console.warn('Acción o ubicación no encontrada');
    return;
  }

  const ubicacion = accion.ubicaciones[ubicacionIdx];
  const evidencias = ubicacion.evidencias;

  if (!evidencias || !evidencias.image) {
    toast.warning('Fotos no disponibles', 'No hay evidencia fotográfica disponible para esta ubicación.');
  } else {
    window.open(evidencias.image, '_blank');
  }
}

/**
 * Muestra videos de una acción
 * Abre el video en una nueva ventana
 */
function verVideos(accionId, ubicacionIdx = 0) {
  const accion = PopupGenerator.getAccionById(accionId);
  if (!accion || !accion.ubicaciones[ubicacionIdx]) {
    console.warn('Acción o ubicación no encontrada');
    return;
  }

  const ubicacion = accion.ubicaciones[ubicacionIdx];
  const evidencias = ubicacion.evidencias;

  if (!evidencias || !evidencias.video) {
    toast.warning('Videos no disponibles', 'No hay evidencia en video disponible para esta ubicación.');
  } else {
    window.open(evidencias.video, '_blank');
  }
}

/**
 * Muestra todas las ubicaciones de un proyecto multi-ubicación
 */
function verTodasUbicaciones(accionId) {
  const accion = PopupGenerator.getAccionById(accionId);
  if (!accion) {
    console.warn('Acción no encontrada');
    return;
  }

  // Elementos del modal
  const modal = document.getElementById('ubicacionesModal');
  const listContainer = document.getElementById('ubicacionesList');
  const closeBtn = document.getElementById('closeUbicacionesModal');

  // Generar HTML para todas las ubicaciones
  let html = '';

  accion.ubicaciones.forEach((ubicacion, idx) => {
    const icono = ubicacion.es_estatal ? '🏛️' : '📍';
    const evidencias = ubicacion.evidencias || {};
    const tienePDF = ubicacion.survey_id !== null && ubicacion.survey_id !== undefined;
    const tieneImagen = evidencias.image && evidencias.image !== null;
    const tieneVideo = evidencias.video && evidencias.video !== null;

    html += `
      <div class="ubicacion-item">
        <div class="ubicacion-item-header">
          <span class="ubicacion-item-icon">${icono}</span>
          <h4 class="ubicacion-item-lugar">${ubicacion.lugar}</h4>
        </div>
        <div class="ubicacion-item-actividad">
          <strong>Actividad:</strong> ${ubicacion.activity || 'No especificada'}
        </div>
        ${ubicacion.es_estatal ? '<div class="ubicacion-item-actividad"><em>Alcance: Todo el Estado de Tlaxcala</em></div>' : ''}
        <div class="ubicacion-item-evidencias">
          ${tienePDF ? `
            <button class="ubicacion-evidencia-btn" onclick="verDetallePDF('${accionId}', ${idx})">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              PDF
            </button>
          ` : ''}
          ${tieneImagen ? `
            <button class="ubicacion-evidencia-btn" onclick="verFotos('${accionId}', ${idx})">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Foto
            </button>
          ` : ''}
          ${tieneVideo ? `
            <button class="ubicacion-evidencia-btn" onclick="verVideos('${accionId}', ${idx})">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              Video
            </button>
          ` : ''}
          ${!tienePDF && !tieneImagen && !tieneVideo ? '<em style="color: #999; font-size: 0.85rem;">Sin evidencias</em>' : ''}
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;

  // Mostrar modal
  modal.style.display = 'flex';

  // Event listener para cerrar
  const closeModal = () => {
    modal.style.display = 'none';
  };

  closeBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

/**
 * Toggle para expandir/contraer la lista de ubicaciones
 */
function toggleUbicaciones(uniqueId) {
  const list = document.getElementById(`list-${uniqueId}`);
  const chip = document.getElementById(`chip-${uniqueId}`);
  const btn = document.getElementById(`btn-${uniqueId}`);

  if (!list || !chip) return;

  // Toggle clase collapsed
  list.classList.toggle("collapsed");
  chip.classList.toggle("expanded");

  // Controlar visibilidad del botón (sincronizado con la lista)
  const isExpanded = !list.classList.contains("collapsed");
  if (btn) {
    btn.style.display = isExpanded ? "block" : "none";
  }
}

// Hacer PopupGenerator disponible globalmente
if (typeof window !== "undefined") {
  window.PopupGenerator = PopupGenerator;
}
