/**
 * Gestor de datos del API
 * Maneja fetch, caché y procesamiento de datos
 */
class DataManager {
  constructor() {
    this.data = null;
    this.config = window.AccionesConfig;
    this.dataSource = this.getDataSource();
  }

  getDataSource() {
    return "api";
  }

  /**
   * Obtiene datos del API o caché
   * @returns {Promise<Object>} Datos de acciones climáticas
   */
  async fetchData() {
    try {
      if (this.config.CACHE.enabled) {
        const cachedData = this.getCachedData();
        if (cachedData) {
          this.data = cachedData;
          return cachedData;
        }
      }

      const data = await this.fetchFromAPIReal();

      if (this.config.CACHE.enabled) {
        this.setCachedData(data);
      }

      this.data = data;
      return data;
    } catch (error) {
      console.error("Error al cargar datos:", error);
      throw error;
    }
  }

  /**
   * Obtiene datos de la API usando DataAdapter
   * @returns {Promise<Object>} Datos transformados y agrupados
   */
  async fetchFromAPIReal() {
    if (!window.DataAdapter) {
      throw new Error(
        "DataAdapter no está cargado. Verifica que data-adapter.js esté incluido."
      );
    }

    const adapter = new window.DataAdapter();
    const data = await adapter.obtenerDatosAPI();

    return data;
  }

  /**
   * Obtiene datos ESTATALES del API
   * @returns {Promise<Object>} Datos de acciones estatales
   */
  async fetchDataEstatal() {
    try {
      if (!window.DataAdapter) {
        throw new Error(
          "DataAdapter no está cargado. Verifica que data-adapter.js esté incluido."
        );
      }

      const adapter = new window.DataAdapter();
      const data = await adapter.obtenerDatosEstatalesAPI();

      return data;
    } catch (error) {
      console.error("Error al cargar datos estatales:", error);
      throw error;
    }
  }

  /**
   * Procesa acciones estatales para el mapa
   * @param {Object} data - Datos de acciones estatales
   * @returns {Array} Array de markers para el mapa
   */
  processAccionesEstatalesForMap(data) {
    if (!data || !data.acciones) return [];

    const markers = [];

    data.acciones.forEach((accion) => {
      if (!accion.ubicaciones || !Array.isArray(accion.ubicaciones)) {
        return;
      }

      accion.ubicaciones.forEach((ubicacion, idx) => {
        if (!this.isValidCoordinate(ubicacion.lat, ubicacion.lng)) {
          console.warn(`Coordenadas inválidas para: ${accion.nombre_proyecto}`);
          return;
        }

        markers.push({
          ...accion,
          currentUbicacion: ubicacion,
          currentUbicacionIdx: idx,
          lat: ubicacion.lat,
          lng: ubicacion.lng,
        });
      });
    });

    return markers;
  }

  async fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        throw new Error("La solicitud excedió el tiempo límite");
      }
      throw error;
    }
  }

  getCachedData() {
    try {
      const cached = localStorage.getItem(this.config.CACHE.key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.config.CACHE.ttl) {
        localStorage.removeItem(this.config.CACHE.key);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error al leer caché:", error);
      return null;
    }
  }

  setCachedData(data) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.config.CACHE.key, JSON.stringify(cacheObject));
    } catch (error) {
      console.error("Error al guardar en caché:", error);
    }
  }

  clearCache() {
    try {
      localStorage.removeItem(this.config.CACHE.key);
    } catch (error) {
      console.error("Error al limpiar caché:", error);
    }
  }

  /**
   * Calcula estadísticas de los datos
   * @param {Object} data - Datos de acciones
   * @returns {Object|null} Estadísticas calculadas
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
      planeados: data.metadata?.estados?.planeados || 0,
    };
  }

  /**
   * Procesa acciones para el mapa
   * Convierte acciones multi-ubicación en markers individuales
   * Si una ubicación tiene múltiples municipios, crea un marker por cada municipio
   * @param {Object} data - Datos de acciones
   * @param {Object} centroids - Mapeo mun_id -> {lat, lng, nombre} (opcional)
   * @returns {Array} Array de markers para el mapa
   */
  processAccionesForMap(data, centroids = {}) {
    if (!data || !data.acciones) return [];

    const markers = [];

    data.acciones.forEach((accion) => {
      if (!accion.ubicaciones || !Array.isArray(accion.ubicaciones)) {
        return;
      }

      accion.ubicaciones.forEach((ubicacion, idx) => {
        // Si es estatal o no tiene múltiples municipios, usar lógica original
        if (ubicacion.es_estatal) {
          if (!this.isValidCoordinate(ubicacion.lat, ubicacion.lng)) {
            console.warn(`Coordenadas inválidas para: ${accion.nombre_proyecto}`);
            return;
          }
          markers.push({
            ...accion,
            currentUbicacion: ubicacion,
            currentUbicacionIdx: idx,
            lat: ubicacion.lat,
            lng: ubicacion.lng,
          });
          return;
        }

        // Verificar si tiene múltiples municipios
        const munIds = ubicacion.mun_id;
        const munNames = ubicacion.mun_name;

        if (Array.isArray(munIds) && munIds.length > 1) {
          // Expandir: crear un marcador por cada municipio
          munIds.forEach((munId, munIdx) => {
            const centroid = centroids[munId];
            const munName = Array.isArray(munNames) ? munNames[munIdx] : munNames;

            // Usar centroide del municipio si está disponible, sino usar coordenadas originales
            const lat = centroid ? centroid.lat : ubicacion.lat;
            const lng = centroid ? centroid.lng : ubicacion.lng;

            if (!this.isValidCoordinate(lat, lng)) {
              console.warn(`Coordenadas inválidas para municipio ${munId}: ${accion.nombre_proyecto}`);
              return;
            }

            // Crear ubicación expandida con solo este municipio
            const ubicacionExpandida = {
              ...ubicacion,
              mun_id: munId,
              mun_name: munName || (centroid ? centroid.nombre : 'Sin nombre'),
              total_municipios: 1,
              es_multi_municipio: false,
              es_marcador_expandido: true,
              municipio_original_idx: munIdx,
              total_municipios_original: munIds.length
            };

            markers.push({
              ...accion,
              currentUbicacion: ubicacionExpandida,
              currentUbicacionIdx: idx,
              lat: lat,
              lng: lng,
            });
          });
        } else {
          // Un solo municipio o sin municipios, usar lógica original
          if (!this.isValidCoordinate(ubicacion.lat, ubicacion.lng)) {
            console.warn(`Coordenadas inválidas para: ${accion.nombre_proyecto}`);
            return;
          }

          markers.push({
            ...accion,
            currentUbicacion: ubicacion,
            currentUbicacionIdx: idx,
            lat: ubicacion.lat,
            lng: ubicacion.lng,
          });
        }
      });
    });

    return markers;
  }

  /**
   * Valida coordenadas geográficas
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {boolean} true si son válidas
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

  getColorForDependencia(dependencia) {
    return this.config.COLORS[dependencia] || this.config.COLORS.default;
  }

  /**
   * Cuenta las acciones por municipio
   * @param {Object} data - Datos de acciones
   * @returns {Object} Objeto con mun_id como clave y cantidad de acciones como valor
   */
  contarAccionesPorMunicipio(data) {
    if (!data || !data.acciones) return {};

    const conteo = {};

    data.acciones.forEach((accion) => {
      if (!accion.ubicaciones || !Array.isArray(accion.ubicaciones)) {
        return;
      }

      accion.ubicaciones.forEach((ubicacion) => {
        // Solo contar ubicaciones locales con mun_id
        if (ubicacion.mun_id && !ubicacion.es_estatal) {
          // Manejar mun_id como array (nuevo formato) o string (formato anterior)
          if (Array.isArray(ubicacion.mun_id)) {
            ubicacion.mun_id.forEach((munId) => {
              conteo[munId] = (conteo[munId] || 0) + 1;
            });
          } else {
            // Compatibilidad con formato anterior (string)
            const munId = ubicacion.mun_id;
            conteo[munId] = (conteo[munId] || 0) + 1;
          }
        }
      });
    });

    return conteo;
  }

  /**
   * Obtiene el total de acciones para colorear todos los municipios igual
   * Cada proyecto/programa suma +1 a todos los municipios del estado
   * @param {Object} data - Datos de acciones
   * @returns {number} Total de acciones
   */
  obtenerTotalAcciones(data) {
    if (!data || !data.acciones) return 0;
    return data.acciones.length;
  }

  /**
   * Genera un conteo uniforme para todos los municipios basado en el total de acciones
   * @param {Object} data - Datos de acciones
   * @param {Array} municipioIds - Array con los IDs de todos los municipios (001-060)
   * @returns {Object} Objeto con mun_id como clave y el total de acciones como valor
   */
  generarConteoUniforme(data, municipioIds = null) {
    const total = this.obtenerTotalAcciones(data);
    const conteo = {};

    // Si no se proporcionan IDs, usar los 60 municipios de Tlaxcala
    const ids = municipioIds || Array.from({ length: 60 }, (_, i) =>
      String(i + 1).padStart(3, '0')
    );

    ids.forEach(munId => {
      conteo[munId] = total;
    });

    return conteo;
  }

  /**
   * Obtiene el color según la cantidad de acciones
   * @param {number} cantidad - Número de acciones
   * @returns {string} Color hexadecimal
   */
  getColorPorCantidadAcciones(cantidad) {
    if (!cantidad || cantidad === 0) {
      return this.config.COLOR_SIN_ACCIONES;
    }

    const rango = this.config.RANGOS_ACCIONES.find(
      (r) => cantidad >= r.min && cantidad <= r.max
    );

    return rango ? rango.color : this.config.COLOR_SIN_ACCIONES;
  }
}

if (typeof window !== "undefined") {
  window.DataManager = DataManager;
}
