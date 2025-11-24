/**
 * Adaptador de datos para acciones climáticas
 * Transforma datos del API y gestiona caché
 */
class DataAdapter {
  constructor() {
    this.config = window.AccionesConfig;
  }

  static CACHE_KEY = "acciones_climaticas_cache";
  static CACHE_TTL = 5 * 60 * 1000;
  static API_TIMEOUT = 15000;
  static MAX_RETRIES = 3;

  static TLAXCALA_CENTER = {
    lat: 19.318154,
    lng: -98.237232,
  };

  static DEPENDENCIAS = {
    1: { nombre: "Comisión Estatal del Agua y Saneamiento", color: "#4A90E2" },
    2: {
      nombre: "Secretaría de Medio Ambiente y Recursos Naturales",
      color: "#76BC21",
    },
    3: { nombre: "Secretaría de Desarrollo Rural", color: "#8B6F47" },
    4: {
      nombre: "Secretaría de Obras Públicas, Desarrollo Urbano y Vivienda",
      color: "#D0B787",
    },
    5: { nombre: "Secretaría de Desarrollo Económico", color: "#A21A5C" },
  };

  /**
   * Obtiene todas las acciones climáticas desde la API
   * @returns {Promise<Object>} Acciones agrupadas con metadata
   */
  async obtenerDatosAPI() {
    try {
      const cached = this.getCache();
      if (cached) {
        return cached;
      }

      let lastError = null;
      for (let attempt = 1; attempt <= DataAdapter.MAX_RETRIES; attempt++) {
        try {
          const actividades = await this.fetchConTimeout(
            this.config.API_REAL_URL,
            DataAdapter.API_TIMEOUT
          );

          const aprobadas = actividades.filter((a) => a.status === "approved");

          const proyectos = this.agruparActividadesPorProyecto(aprobadas);

          const metadata = this.calcularMetadata(proyectos);

          const resultado = {
            acciones: proyectos,
            total: proyectos.length,
            metadata: metadata,
          };

          this.setCache(resultado);

          return resultado;

        } catch (error) {
          lastError = error;

          if (attempt < DataAdapter.MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await this.sleep(delay);
          }
        }
      }

      const expiredCache = this.getCacheIgnoreExpiry();
      if (expiredCache) {
        console.warn('Usando cache expirado como fallback');
        return expiredCache;
      }

      throw new Error(
        `No se pudo conectar con el servidor después de ${DataAdapter.MAX_RETRIES} intentos. ${
          lastError?.message || 'Error desconocido'
        }`
      );

    } catch (error) {
      console.error("Error al obtener acciones:", error);
      throw error;
    }
  }

  /**
   * Fetch con timeout y control de aborto
   * @param {string} url - URL del API
   * @param {number} timeout - Tiempo límite en ms
   * @returns {Promise<Object>} Respuesta JSON
   */
  async fetchConTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Timeout: La solicitud tardó más de ${timeout / 1000} segundos`);
      }

      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Agrupa actividades por proyecto
   * @param {Array} actividades - Actividades del API
   * @returns {Array} Proyectos agrupados
   */
  agruparActividadesPorProyecto(actividades) {
    const proyectosMap = new Map();

    actividades.forEach((actividadData) => {
      try {
        const nombreAnswer = actividadData.answers.find(
          (a) => a.question_title === "Nombre del programa o proyecto"
        );

        const objetivoAnswer = actividadData.answers.find(
          (a) => a.question_title === "Objetivo del programa o proyecto"
        );

        if (!nombreAnswer) {
          console.warn("Actividad sin nombre de proyecto, omitiendo");
          return;
        }

        const nombreProyecto = nombreAnswer.display_value;
        const objetivo = objetivoAnswer ? objetivoAnswer.display_value : "";

        const claveProyecto = `${actividadData.email}|${nombreProyecto}|${objetivo}`;

        const actividadAnswer = actividadData.answers.find(
          (a) => a.question_title === "Actividades principales"
        );

        if (
          !actividadAnswer ||
          typeof actividadAnswer.display_value !== "object"
        ) {
          console.warn("Actividad sin ubicación válida");
          return;
        }

        const ubicacion = this.procesarUbicacion(actividadAnswer.display_value);

        if (!ubicacion) {
          return;
        }

        ubicacion.survey_id = actividadData.id;

        const evidenciasAnswer = actividadData.answers.find(
          (a) => a.question_title === "Se cuenta con evidencias"
        );

        if (evidenciasAnswer && evidenciasAnswer.display_value) {
          ubicacion.evidencias = {
            pdf: evidenciasAnswer.display_value.pdf || null,
            image: evidenciasAnswer.display_value.image || null,
            video: evidenciasAnswer.display_value.video || null
          };
        } else {
          ubicacion.evidencias = {
            pdf: null,
            image: null,
            video: null
          };
        }

        if (proyectosMap.has(claveProyecto)) {
          const proyecto = proyectosMap.get(claveProyecto);
          proyecto.ubicaciones.push(ubicacion);
        } else {
          const dependenciaNombre = actividadData.dependency_name || `Dependencia ${actividadData.dependency}`;

          const depInfo = DataAdapter.DEPENDENCIAS[actividadData.dependency] || { color: "#582574" };

          const tipoAnswer = actividadData.answers.find(
            (a) => a.question_title === "Programa o proyecto"
          );
          const tipoProyecto = tipoAnswer ? tipoAnswer.display_value : this.determinarTipo(nombreProyecto);

          const fechaInicioAnswer = actividadData.answers.find(
            (a) => a.question_title === "Fecha de inicio de la actividad o proyecto"
          );
          const fechaInicio = fechaInicioAnswer ? fechaInicioAnswer.display_value : actividadData.created_at;

          const temporalidadAnswer = actividadData.answers.find(
            (a) => a.question_title === "Temporalidad (seleccione una opción)"
          );
          const temporalidad = temporalidadAnswer ? temporalidadAnswer.display_value : null;

          const poblacionAnswer = actividadData.answers.find(
            (a) => a.question_title === "Población objetivo"
          );
          const poblacionObjetivo = poblacionAnswer ? poblacionAnswer.display_value : "";

          const alineacionAnswer = actividadData.answers.find(
            (a) =>
              a.question_title ===
              "¿Cuáles son los ejes y medidas a los que abona este proyecto/programa al PACCET 2023-2030?"
          );

          proyectosMap.set(claveProyecto, {
            id: claveProyecto,
            nombre_proyecto: nombreProyecto,
            objetivos: objetivo.substring(0, 500),
            actividades: actividadAnswer.display_value.activity || "",
            alineacion: alineacionAnswer ? alineacionAnswer.display_value : "",
            poblacion_objetivo: poblacionObjetivo,
            temporalidad: temporalidad,
            dependencia: dependenciaNombre,
            color: depInfo.color,
            dependencia_id: actividadData.dependency,
            tipo: tipoProyecto,
            estado: "activo",
            email: actividadData.email,
            fecha_inicio: fechaInicio,
            ubicaciones: [ubicacion],
            total_ubicaciones: 1,
            es_multiubicacion: false,
            created_at: actividadData.created_at,
            updated_at: actividadData.updated_at,
          });
        }
      } catch (error) {
        console.error("Error al procesar actividad:", error);
      }
    });

    const proyectosArray = Array.from(proyectosMap.values());

    proyectosArray.forEach((proyecto) => {
      proyecto.total_ubicaciones = proyecto.ubicaciones.length;
      proyecto.es_multiubicacion = proyecto.ubicaciones.length > 1;
    });

    return proyectosArray;
  }

  /**
   * Procesa una ubicación individual
   * @param {Object} actividadData - Datos de actividad
   * @returns {Object|null} Ubicación procesada
   */
  procesarUbicacion(actividadData) {
    try {
      const { activity, type, latitude, longitude, place } = actividadData;

      if (type === "Local" && latitude !== null && longitude !== null) {
        if (!this.validarCoordenadasTlaxcala(latitude, longitude)) {
          console.warn("Coordenadas fuera de rango, usando centro de Tlaxcala:", latitude, longitude);
          return {
            activity: activity || "Actividad sin nombre",
            lat: DataAdapter.TLAXCALA_CENTER.lat,
            lng: DataAdapter.TLAXCALA_CENTER.lng,
            lugar: place || "Ubicación sin especificar",
            tipo: "Local",
            es_estatal: false,
            coordenadas_fallback: true,
          };
        }

        return {
          activity: activity || "Actividad sin nombre",
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
          lugar: place || "Ubicación sin especificar",
          tipo: "Local",
          es_estatal: false,
        };
      }

      if (type === "Estatal") {
        return {
          activity: activity || "Actividad sin nombre",
          lat: DataAdapter.TLAXCALA_CENTER.lat,
          lng: DataAdapter.TLAXCALA_CENTER.lng,
          lugar: "Todo el Estado de Tlaxcala",
          tipo: "Estatal",
          es_estatal: true,
        };
      }

      if (type === "Local" && (latitude === null || longitude === null)) {
        console.warn(
          "Actividad Local sin coordenadas, usando centro de Tlaxcala"
        );
        return {
          activity: activity || "Actividad sin nombre",
          lat: DataAdapter.TLAXCALA_CENTER.lat,
          lng: DataAdapter.TLAXCALA_CENTER.lng,
          lugar: place || "Ubicación sin especificar",
          tipo: "Local",
          es_estatal: false,
          coordenadas_fallback: true,
        };
      }

      return null;
    } catch (error) {
      console.error("Error al procesar ubicación:", error);
      return null;
    }
  }

  /**
   * Valida coordenadas dentro del rango de Tlaxcala
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {boolean} true si son válidas
   */
  validarCoordenadasTlaxcala(lat, lng) {
    const LIMITES = {
      latMin: 19.0,
      latMax: 19.8,
      lngMin: -98.8,
      lngMax: -97.5,
    };

    return (
      lat >= LIMITES.latMin &&
      lat <= LIMITES.latMax &&
      lng >= LIMITES.lngMin &&
      lng <= LIMITES.lngMax
    );
  }

  determinarTipo(nombre) {
    if (!nombre) return "Proyecto";

    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes("programa")) return "Programa";
    return "Proyecto";
  }

  /**
   * Calcula metadata de las acciones
   * @param {Array} acciones - Array de acciones
   * @returns {Object} Metadata calculada
   */
  calcularMetadata(acciones) {
    const dependenciasSet = new Set();
    let totalUbicaciones = 0;
    let tiposCount = { proyectos: 0, programas: 0 };
    let estadosCount = { activos: 0, concluidos: 0, planeados: 0 };

    acciones.forEach((accion) => {
      dependenciasSet.add(accion.dependencia);
      totalUbicaciones += accion.ubicaciones.length;

      if (accion.tipo === "Programa") {
        tiposCount.programas++;
      } else {
        tiposCount.proyectos++;
      }

      if (accion.estado === "activo") {
        estadosCount.activos++;
      } else if (accion.estado === "concluido") {
        estadosCount.concluidos++;
      } else if (accion.estado === "planeado") {
        estadosCount.planeados++;
      }
    });

    return {
      total_ubicaciones: totalUbicaciones,
      dependencias: Array.from(dependenciasSet),
      total_dependencias: dependenciasSet.size,
      tipos: tiposCount,
      estados: estadosCount,
    };
  }

  getCache() {
    try {
      const cached = localStorage.getItem(DataAdapter.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > DataAdapter.CACHE_TTL) {
        localStorage.removeItem(DataAdapter.CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error al leer caché:", error);
      return null;
    }
  }

  getCacheIgnoreExpiry() {
    try {
      const cached = localStorage.getItem(DataAdapter.CACHE_KEY);
      if (!cached) return null;

      const { data } = JSON.parse(cached);
      return data;
    } catch (error) {
      return null;
    }
  }

  setCache(data) {
    try {
      const cache = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(DataAdapter.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error al guardar caché:", error);
    }
  }
}

if (typeof window !== "undefined") {
  window.DataAdapter = DataAdapter;
}
