/**
 * Manejo de datos del API - Fetch, caché y procesamiento
 */

class DataManager {
  constructor() {
    this.data = null;
    this.config = window.AccionesConfig;
    this.dataSource = this.getDataSource(); // Detecta fuente de datos desde URL
  }

  /**
   * Detecta la fuente de datos desde el parámetro URL
   * Por defecto: 'apps-script' (Google Apps Script)
   * Con ?source=api: 'api' (API Real)
   */
  getDataSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');

    if (source === 'api') {
      console.log('📡 Fuente de datos: API Real');
      return 'api';
    } else {
      console.log('📡 Fuente de datos: Google Apps Script');
      return 'apps-script';
    }
  }

  /**
   * Obtiene los datos del API o del caché
   */
  async fetchData() {
    try {
      // Verificar caché primero
      if (this.config.CACHE.enabled) {
        const cachedData = this.getCachedData();
        if (cachedData) {
          //console.log('Datos cargados desde caché');
          this.data = cachedData;
          return cachedData;
        }
      }

      // Obtener datos según la fuente configurada
      let data;
      if (this.dataSource === 'api') {
        // OPCIÓN 1: API Real (requiere transformación)
        data = await this.fetchFromAPIReal();
      } else {
        // OPCIÓN 2: Google Apps Script (formato directo)
        data = await this.fetchFromGoogleAppsScript();
      }

      // Guardar en caché
      if (this.config.CACHE.enabled) {
        this.setCachedData(data);
      }

      this.data = data;
      return data;

    } catch (error) {
      console.error('Error al cargar datos:', error);
      throw error;
    }
  }

  /**
   * OPCIÓN 1: Obtiene datos de Google Apps Script (fuente actual)
   * Retorna formato: { acciones: [], metadata: {} }
   */
  async fetchFromGoogleAppsScript() {
    console.log('🔄 Cargando desde Google Apps Script...');

    const response = await this.fetchWithTimeout(
      this.config.API_URL,
      this.config.API_TIMEOUT
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validar estructura de datos
    if (!data || !data.acciones || !Array.isArray(data.acciones)) {
      throw new Error('Estructura de datos inválida');
    }

    console.log(`✅ ${data.acciones.length} acciones cargadas desde Google Apps Script`);
    return data;
  }

  /**
   * OPCIÓN 2: Obtiene datos de la API Real (fuente alternativa)
   * Usa DataAdapter para transformar al formato esperado
   */
  async fetchFromAPIReal() {
    // Verificar que DataAdapter esté disponible
    if (!window.DataAdapter) {
      throw new Error('DataAdapter no está cargado. Verifica que data-adapter.js esté incluido.');
    }

    const adapter = new window.DataAdapter();
    const data = await adapter.obtenerDatosAPI();

    return data;
  }

  /**
   * Fetch con timeout
   */
  async fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('La solicitud excedió el tiempo límite');
      }
      throw error;
    }
  }

  /**
   * Obtiene datos del caché
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem(this.config.CACHE.key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Verificar si el caché ha expirado
      if (now - timestamp > this.config.CACHE.ttl) {
        localStorage.removeItem(this.config.CACHE.key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error al leer caché:', error);
      return null;
    }
  }

  /**
   * Guarda datos en caché
   */
  setCachedData(data) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.config.CACHE.key, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  }

  /**
   * Limpia el caché
   */
  clearCache() {
    try {
      localStorage.removeItem(this.config.CACHE.key);
      //console.log('Caché limpiado');
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }

  /**
   * Obtiene estadísticas de los datos
   */
  getStats(data) {
    if (!data || !data.acciones) return null;

    return {
      total: data.total || data.acciones.length,
      ubicaciones: data.metadata?.total_ubicaciones || 0,
      dependencias: data.metadata?.dependencias?.length || 0,
      proyectos: data.metadata?.tipos?.proyectos || 0,
      programas: data.metadata?.tipos?.programas || 0,
      activos: data.metadata?.estados?.activos || 0,
      concluidos: data.metadata?.estados?.concluidos || 0,
      planeados: data.metadata?.estados?.planeados || 0
    };
  }

  /**
   * Procesa las acciones para el mapa
   * Convierte acciones multi-ubicación en markers individuales
   */
  processAccionesForMap(data) {
    if (!data || !data.acciones) return [];

    const markers = [];

    data.acciones.forEach(accion => {
      // Verificar que la acción tenga ubicaciones válidas
      if (!accion.ubicaciones || !Array.isArray(accion.ubicaciones)) {
        return;
      }

      // Crear un marker por cada ubicación
      accion.ubicaciones.forEach(ubicacion => {
        // Validar coordenadas
        if (!this.isValidCoordinate(ubicacion.lat, ubicacion.lng)) {
          console.warn(`Coordenadas inválidas para: ${accion.nombre_proyecto}`);
          return;
        }

        markers.push({
          ...accion,
          currentUbicacion: ubicacion,
          lat: ubicacion.lat,
          lng: ubicacion.lng
        });
      });
    });

    return markers;
  }

  /**
   * Valida si una coordenada es válida
   */
  isValidCoordinate(lat, lng) {
    return (
      lat !== null &&
      lng !== null &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  }

  /**
   * Obtiene el color para una dependencia
   */
  getColorForDependencia(dependencia) {
    return this.config.COLORS[dependencia] || this.config.COLORS.default;
  }
}

// Hacer DataManager disponible globalmente
if (typeof window !== 'undefined') {
  window.DataManager = DataManager;
}
