class DataAdapter {
  constructor() {
    this.config = window.AccionesConfig;
  }

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  static CACHE_KEY = "acciones_climaticas_cache";
  static CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  static API_TIMEOUT = 15000; // 15 segundos
  static MAX_RETRIES = 3; // Número máximo de reintentos

  // Coordenadas del centro de Tlaxcala (para proyectos estatales)
  static TLAXCALA_CENTER = {
    lat: 19.318154,
    lng: -98.237232,
  };

  // Mapeo de IDs de dependencias
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

  // ============================================
  // FUNCIÓN PRINCIPAL
  // ============================================

  /**
   * Obtiene todas las acciones climáticas desde la API
   * @returns {Promise<Object>} Objeto con acciones agrupadas y metadata
   */
  async obtenerDatosAPI() {
    try {
      // 1. Verificar caché válido
      const cached = this.getCache();
      if (cached) {
        return cached;
      }

      // 2. Intentar fetch con retry logic
      let lastError = null;
      for (let attempt = 1; attempt <= DataAdapter.MAX_RETRIES; attempt++) {
        try {
          const actividades = await this.fetchConTimeout(
            this.config.API_REAL_URL,
            DataAdapter.API_TIMEOUT
          );

          // 3. Filtrar solo aprobadas
          const aprobadas = actividades.filter((a) => a.status === "approved");

          // 4. Agrupar actividades por proyecto
          const proyectos = this.agruparActividadesPorProyecto(aprobadas);

          // 5. Calcular metadata
          const metadata = this.calcularMetadata(proyectos);

          const resultado = {
            acciones: proyectos,
            total: proyectos.length,
            metadata: metadata,
          };

          // 6. Guardar en caché
          this.setCache(resultado);

          return resultado;

        } catch (error) {
          lastError = error;

          // Esperar antes de reintentar (exponential backoff)
          if (attempt < DataAdapter.MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await this.sleep(delay);
          }
        }
      }

      // 7. Si todos los intentos fallaron, intentar usar caché expirado como fallback
      const expiredCache = this.getCacheIgnoreExpiry();
      if (expiredCache) {
        console.warn('Usando cache expirado como fallback');
        return expiredCache;
      }

      // 8. Si no hay caché, lanzar el último error
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
   * Fetch con timeout
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

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // AGRUPACIÓN DE ACTIVIDADES
  // ============================================

  /**
   * Agrupa actividades por proyecto usando email + nombre + objetivo
   * @param {Array} actividades - Array de actividades de la API
   * @returns {Array} Array de proyectos con sus ubicaciones
   */
  agruparActividadesPorProyecto(actividades) {
    const proyectosMap = new Map();

    actividades.forEach((actividadData) => {
      try {
        // 1. Extraer datos básicos del proyecto
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

        // 2. Crear clave única para agrupar
        // Usamos email + nombre + objetivo (NO created_at)
        const claveProyecto = `${actividadData.email}|${nombreProyecto}|${objetivo}`;

        // 3. Extraer ubicación de esta actividad
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
          return; // No es una ubicación válida
        }

        // 3.5 Extraer evidencias (question_id 25: "Se cuenta con evidencias")
        const evidenciasAnswer = actividadData.answers.find(
          (a) => a.question_title === "Se cuenta con evidencias"
        );

        // Agregar evidencias a la ubicación
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

        // 4. Si el proyecto ya existe, agregar ubicación
        if (proyectosMap.has(claveProyecto)) {
          const proyecto = proyectosMap.get(claveProyecto);
          proyecto.ubicaciones.push(ubicacion);
        } else {
          // 5. Si es nuevo, crear proyecto

          // Usar dependency_name del API directamente
          const dependenciaNombre = actividadData.dependency_name || `Dependencia ${actividadData.dependency}`;

          // Asignar color según mapeo o usar default
          const depInfo = DataAdapter.DEPENDENCIAS[actividadData.dependency] || { color: "#582574" };

          // Extraer tipo de proyecto/programa (question_id 3)
          const tipoAnswer = actividadData.answers.find(
            (a) => a.question_title === "Programa o proyecto"
          );
          const tipoProyecto = tipoAnswer ? tipoAnswer.display_value : this.determinarTipo(nombreProyecto);

          // Extraer fecha de inicio (question_id 7)
          const fechaInicioAnswer = actividadData.answers.find(
            (a) => a.question_title === "Fecha de inicio de la actividad o proyecto"
          );
          const fechaInicio = fechaInicioAnswer ? fechaInicioAnswer.display_value : actividadData.created_at;

          // Extraer temporalidad (question_id 8)
          const temporalidadAnswer = actividadData.answers.find(
            (a) => a.question_title === "Temporalidad (seleccione una opción)"
          );
          const temporalidad = temporalidadAnswer ? temporalidadAnswer.display_value : null;

          // Extraer población objetivo (question_id 16)
          const poblacionAnswer = actividadData.answers.find(
            (a) => a.question_title === "Población objetivo"
          );
          const poblacionObjetivo = poblacionAnswer ? poblacionAnswer.display_value : "";

          // Extraer alineación PACCET (question_id 31)
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

    // 6. Convertir Map a Array y actualizar flags
    const proyectosArray = Array.from(proyectosMap.values());

    proyectosArray.forEach((proyecto) => {
      proyecto.total_ubicaciones = proyecto.ubicaciones.length;
      proyecto.es_multiubicacion = proyecto.ubicaciones.length > 1;
    });

    return proyectosArray;
  }

  // ============================================
  // PROCESAMIENTO DE UBICACIONES
  // ============================================

  /**
   * Procesa una ubicación individual
   * @param {Object} actividadData - Objeto de actividad del API
   * @returns {Object|null} Ubicación procesada o null
   */
  procesarUbicacion(actividadData) {
    try {
      const { activity, type, latitude, longitude, place } = actividadData;

      // Caso 1: Tipo Local con coordenadas
      if (type === "Local" && latitude !== null && longitude !== null) {
        // Validar rango de coordenadas
        if (!this.validarCoordenadasTlaxcala(latitude, longitude)) {
          console.warn("Coordenadas fuera de rango, usando centro de Tlaxcala:", latitude, longitude);
          // Usar coordenadas de fallback en lugar de descartar el registro
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

      // Caso 2: Tipo Estatal (sin coordenadas)
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

      // Caso 3: Tipo Local sin coordenadas (error de datos)
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
   * Valida que las coordenadas estén dentro del rango de Tlaxcala
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

  /**
   * Determina el tipo (proyecto o programa) basado en el nombre
   */
  determinarTipo(nombre) {
    if (!nombre) return "Proyecto";

    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes("programa")) return "Programa";
    return "Proyecto";
  }

  // ============================================
  // METADATA
  // ============================================

  /**
   * Calcula metadata a partir de las acciones transformadas
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

  // ============================================
  // SISTEMA DE CACHÉ
  // ============================================

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

// Hacer DataAdapter disponible globalmente
if (typeof window !== "undefined") {
  window.DataAdapter = DataAdapter;
}
