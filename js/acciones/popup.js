/**
 * Generación de popups para los markers
 * Popup complejo con estructura de formulario
 */

class PopupGenerator {
  constructor() {
    this.config = window.AccionesConfig;
  }

  /**
   * Genera el HTML del popup para una acción
   * Siempre usa el popup complejo
   */
  generatePopup(accion) {
    const ubicacion = accion.currentUbicacion || accion.ubicaciones[0];
    const esMultiUbicacion = accion.es_multiubicacion;
    const esEstatal = ubicacion?.es_estatal || false;

    return `
      <div class="popup-formulario">
        ${this.generateHeader(accion)}
        ${this.generateBody(accion, ubicacion, esMultiUbicacion, esEstatal)}
        ${this.generateFooter(accion)}
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

        <!-- Fecha de creación y Temporalidad -->
        <div class="popup-row">
          <div class="popup-field popup-field-half">
            <label>Fecha de inicio</label>
            <div class="field-value">${this.formatDate(accion.created_at)}</div>
          </div>
          <div class="popup-field popup-field-half">
            <label>Temporalidad</label>
            <div class="field-value">${this.calcularTemporalidad(accion)}</div>
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
          accion.alineacion
            ? `
          <div class="popup-field popup-field-full">
            <label>Población Objetivo</label>
            <div class="field-value field-value-textarea">
              ${this.truncate(accion.alineacion, 250)}
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

  generateFooter(accion) {
    return `
      <div class="popup-footer">
        <button class="popup-btn popup-btn-primary" onclick="verDetallePDF('${accion.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          PDF
        </button>
        <button class="popup-btn popup-btn-secondary" onclick="verFotos('${accion.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Fotos
        </button>
        <button class="popup-btn popup-btn-secondary" onclick="verVideos('${accion.id}')">
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
    if (!accion.created_at) return "N/A";

    try {
      const inicio = new Date(accion.created_at);
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
 */
function verDetallePDF(accionId) {}

/**
 * Muestra fotos de una acción
 */
function verFotos(accionId) {}

/**
 * Muestra videos de una acción
 */
function verVideos(accionId) {}

/**
 * Muestra todas las ubicaciones de un proyecto multi-ubicación
 */
function verTodasUbicaciones(accionId) {}

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
