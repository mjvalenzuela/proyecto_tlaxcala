/**
 * Sistema de notificaciones Toast
 * Muestra notificaciones elegantes en lugar de alerts
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.init();
  }

  /**
   * Inicializa el contenedor de toasts
   */
  init() {
    // Crear contenedor si no existe
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  /**
   * Muestra un toast
   * @param {Object} options - Opciones del toast
   * @param {string} options.title - Título del toast
   * @param {string} options.message - Mensaje del toast
   * @param {string} options.type - Tipo: 'info', 'success', 'warning', 'error', 'default'
   * @param {number} options.duration - Duración en ms (0 = infinito)
   * @param {boolean} options.closeable - Si se puede cerrar manualmente
   */
  show({
    title = '',
    message = '',
    type = 'default',
    duration = 4000,
    closeable = true
  }) {
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Generar ID único
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    toast.id = toastId;

    // Ícono según tipo
    const icon = this.getIcon(type);

    // Construir HTML
    toast.innerHTML = `
      ${icon}
      <div class="toast-content">
        ${title ? `<p class="toast-title">${title}</p>` : ''}
        ${message ? `<p class="toast-message">${message}</p>` : ''}
      </div>
      ${closeable ? `
        <button class="toast-close" aria-label="Cerrar notificación">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ` : ''}
      ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
    `;

    // Agregar al contenedor
    this.container.appendChild(toast);

    // Configurar botón de cerrar
    if (closeable) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn.addEventListener('click', () => {
        this.remove(toastId);
      });
    }

    // Configurar auto-close con barra de progreso
    if (duration > 0) {
      const progressBar = toast.querySelector('.toast-progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = `${duration}ms`;

        // Animar barra de progreso
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 10);
      }

      // Auto-cerrar
      setTimeout(() => {
        this.remove(toastId);
      }, duration);
    }

    // Guardar referencia
    this.toasts.push({
      id: toastId,
      element: toast
    });

    return toastId;
  }

  /**
   * Remueve un toast
   */
  remove(toastId) {
    const toastData = this.toasts.find(t => t.id === toastId);
    if (!toastData) return;

    const toast = toastData.element;

    // Agregar animación de salida
    toast.classList.add('toast-exit');

    // Remover del DOM después de la animación
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      // Remover de la lista
      this.toasts = this.toasts.filter(t => t.id !== toastId);
    }, 300);
  }

  /**
   * Remueve todos los toasts
   */
  removeAll() {
    this.toasts.forEach(toastData => {
      this.remove(toastData.id);
    });
  }

  /**
   * Obtiene el ícono según el tipo de toast
   */
  getIcon(type) {
    const icons = {
      info: `
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
      `,
      success: `
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="9 12 11 14 15 10"></polyline>
          </svg>
        </div>
      `,
      warning: `
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      `,
      error: `
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
      `,
      default: `
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
      `
    };

    return icons[type] || icons.default;
  }

  // Métodos de conveniencia
  info(title, message, duration = 4000) {
    return this.show({ title, message, type: 'info', duration });
  }

  success(title, message, duration = 4000) {
    return this.show({ title, message, type: 'success', duration });
  }

  warning(title, message, duration = 5000) {
    return this.show({ title, message, type: 'warning', duration });
  }

  error(title, message, duration = 6000) {
    return this.show({ title, message, type: 'error', duration });
  }
}

// Crear instancia global
const toast = new ToastManager();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.toast = toast;
}
