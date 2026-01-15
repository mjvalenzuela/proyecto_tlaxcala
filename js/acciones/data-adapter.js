/**
 * Adaptador de datos para acciones climáticas
 * Transforma datos del API y gestiona caché
 */
class DataAdapter {
  constructor() {
    this.config = window.AccionesConfig;
  }

  static CACHE_KEY = "acciones_climaticas_cache";
  static CACHE_KEY_ESTATAL = "acciones_climaticas_estatal_cache";
  static CACHE_TTL = 5 * 60 * 1000;
  static API_TIMEOUT = 15000;
  static MAX_RETRIES = 3;

  static TLAXCALA_CENTER = {
    lat: 19.318154,
    lng: -98.237232,
  };

  static DEPENDENCIAS = {
    // Secretarías (13)
    1: { nombre: "Secretaría de Medio Ambiente", color: "#76BC21" },
    2: { nombre: "Secretaría de Gobernación", color: "#1E3A5F" },
    3: { nombre: "Secretaría de Finanzas", color: "#2E7D32" },
    4: { nombre: "Secretaría de Salud", color: "#E53935" },
    5: { nombre: "Secretaría de Impulso Agropecuario", color: "#8B6F47" },
    6: { nombre: "Secretaría de Educación Pública", color: "#7B1FA2" },
    7: { nombre: "Secretaría de Movilidad y Transporte", color: "#00ACC1" },
    8: { nombre: "Secretaría de Turismo", color: "#FF6F00" },
    9: { nombre: "Secretaría de Seguridad Ciudadana", color: "#37474F" },
    10: { nombre: "Secretaría de Ordenamiento Territorial y Vivienda", color: "#D0B787" },
    11: { nombre: "Secretaría de Bienestar", color: "#EC407A" },
    12: { nombre: "Secretaría de Infraestructura", color: "#5D4037" },
    13: { nombre: "Secretaría de Desarrollo Económico", color: "#A21A5C" },
    // Otras dependencias (3)
    14: { nombre: "Comisión Estatal del Agua y Saneamiento", color: "#4A90E2" },
    15: { nombre: "Coordinación General de Planeación e Inversión", color: "#9C27B0" },
    16: { nombre: "Procuraduría de Protección al Ambiente", color: "#43A047" },
    // Regiones (8)
    17: { nombre: "Region Calpulalpan", color: "#FF7043" },
    18: { nombre: "Region Tlaxco", color: "#26A69A" },
    19: { nombre: "Region Apizaco", color: "#5C6BC0" },
    20: { nombre: "Region Huamantla", color: "#AB47BC" },
    21: { nombre: "Region Chiautempan", color: "#42A5F5" },
    22: { nombre: "Region Tlaxcala", color: "#66BB6A" },
    23: { nombre: "Region Zacatelco", color: "#FFA726" },
    24: { nombre: "Region San Pablo del Monte", color: "#EF5350" }
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

    proyectosArray.forEach((proyecto, index) => {
      proyecto.total_ubicaciones = proyecto.ubicaciones.length;
      proyecto.es_multiubicacion = proyecto.ubicaciones.length > 1;
      // Asignar número de proyecto (1, 2, 3, ...) para identificación visual
      proyecto.numero_proyecto = index + 1;

      // Calcular total de municipios ÚNICOS del registro (sumando todas las ubicaciones)
      const municipiosUnicos = new Set();
      proyecto.ubicaciones.forEach(ub => {
        if (ub.mun_id) {
          const ids = Array.isArray(ub.mun_id) ? ub.mun_id : [ub.mun_id];
          ids.forEach(id => {
            if (id) municipiosUnicos.add(id);
          });
        }
      });
      proyecto.total_municipios_registro = municipiosUnicos.size;
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

      // Procesar mun_id y mun_name (pueden ser arrays o strings)
      const munId = actividadData.mun_id || null;
      const munName = actividadData.mun_name || null;

      // Calcular cantidad de municipios donde aplica esta acción
      let totalMunicipios = 0;
      if (Array.isArray(munId)) {
        totalMunicipios = munId.length;
      } else if (munId) {
        totalMunicipios = 1;
      }

      // Verificar si tiene múltiples municipios
      const esMultiMunicipio = totalMunicipios > 1;

      if (type === "Local" && latitude !== null && longitude !== null) {
        if (!this.validarCoordenadasTlaxcala(latitude, longitude)) {
          console.warn("Coordenadas fuera de rango, usando centro de Tlaxcala:", latitude, longitude);
          return {
            activity: activity || "Actividad sin nombre",
            lat: DataAdapter.TLAXCALA_CENTER.lat,
            lng: DataAdapter.TLAXCALA_CENTER.lng,
            lugar: place || "Ubicación sin especificar",
            mun_id: munId,
            mun_name: munName,
            total_municipios: totalMunicipios,
            es_multi_municipio: esMultiMunicipio,
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
          mun_id: munId,
          mun_name: munName,
          total_municipios: totalMunicipios,
          es_multi_municipio: esMultiMunicipio,
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
          mun_id: null,
          mun_name: null,
          total_municipios: 60, // Todos los municipios del estado
          es_multi_municipio: true,
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
          mun_id: munId,
          mun_name: munName,
          total_municipios: totalMunicipios,
          es_multi_municipio: esMultiMunicipio,
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
    let totalAccionesMunicipios = 0; // Suma de municipios de todas las acciones
    let tiposCount = { proyectos: 0, programas: 0 };
    let estadosCount = { activos: 0, concluidos: 0, planeados: 0 };

    acciones.forEach((accion) => {
      dependenciasSet.add(accion.dependencia);
      totalUbicaciones += accion.ubicaciones.length;

      // Sumar los municipios de cada ubicación/acción
      accion.ubicaciones.forEach((ubicacion) => {
        totalAccionesMunicipios += ubicacion.total_municipios || 0;
      });

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
      total_ubicaciones: totalAccionesMunicipios, // Ahora es la suma de municipios
      total_registros: totalUbicaciones, // Cantidad de registros/marcadores
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

  /**
   * Obtiene todas las acciones climáticas ESTATALES desde la API
   * @returns {Promise<Object>} Acciones agrupadas con metadata
   */
  async obtenerDatosEstatalesAPI() {
    try {
      const cached = this.getCacheEstatal();
      if (cached) {
        return cached;
      }

      let lastError = null;
      for (let attempt = 1; attempt <= DataAdapter.MAX_RETRIES; attempt++) {
        try {
          const actividades = await this.fetchConTimeout(
            this.config.API_ESTATAL_URL,
            DataAdapter.API_TIMEOUT
          );

          const aprobadas = actividades.filter((a) => a.status === "approved");

          const proyectos = this.agruparActividadesPorProyectoEstatal(aprobadas);

          const metadata = this.calcularMetadataEstatal(proyectos);

          const resultado = {
            acciones: proyectos,
            total: proyectos.length,
            metadata: metadata,
          };

          this.setCacheEstatal(resultado);

          return resultado;

        } catch (error) {
          lastError = error;

          if (attempt < DataAdapter.MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            await this.sleep(delay);
          }
        }
      }

      const expiredCache = this.getCacheEstatalIgnoreExpiry();
      if (expiredCache) {
        console.warn('Usando cache estatal expirado como fallback');
        return expiredCache;
      }

      throw new Error(
        `No se pudo conectar con el servidor después de ${DataAdapter.MAX_RETRIES} intentos. ${
          lastError?.message || 'Error desconocido'
        }`
      );

    } catch (error) {
      console.error("Error al obtener acciones estatales:", error);
      throw error;
    }
  }

  /**
   * Agrupa actividades estatales por proyecto
   * @param {Array} actividades - Actividades del API
   * @returns {Array} Proyectos agrupados
   */
  agruparActividadesPorProyectoEstatal(actividades) {
    const proyectosMap = new Map();
    // Contador global de ubicaciones para dispersión única de cada marcador
    let ubicacionIndex = 0;

    actividades.forEach((actividadData) => {
      try {
        const nombreAnswer = actividadData.answers.find(
          (a) => a.question_title === "Nombre del programa o proyecto"
        );

        const objetivoAnswer = actividadData.answers.find(
          (a) => a.question_title === "Objetivo del programa o proyecto"
        );

        if (!nombreAnswer) {
          console.warn("Actividad estatal sin nombre de proyecto, omitiendo");
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
          console.warn("Actividad estatal sin datos válidos");
          return;
        }

        const dependenciaNombre = actividadData.dependency_name || `Dependencia ${actividadData.dependency}`;
        const ubicacion = this.procesarUbicacionEstatal(actividadAnswer.display_value, actividadData.id, ubicacionIndex++, dependenciaNombre);

        if (!ubicacion) {
          return;
        }

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
            es_estatal: true,
            created_at: actividadData.created_at,
            updated_at: actividadData.updated_at,
          });
        }
      } catch (error) {
        console.error("Error al procesar actividad estatal:", error);
      }
    });

    const proyectosArray = Array.from(proyectosMap.values());

    proyectosArray.forEach((proyecto, index) => {
      proyecto.total_ubicaciones = proyecto.ubicaciones.length;
      proyecto.es_multiubicacion = proyecto.ubicaciones.length > 1;
      proyecto.numero_proyecto = index + 1;
      proyecto.total_municipios_registro = 60; // Todos los municipios del estado
    });

    return proyectosArray;
  }

  /**
   * Procesa una ubicación estatal
   * @param {Object} actividadData - Datos de actividad
   * @param {number} surveyId - ID del survey
   * @param {number} index - Índice para dispersar si no hay coordenadas
   * @param {string} dependenciaNombre - Nombre de la dependencia para ubicar en su zona
   * @returns {Object|null} Ubicación procesada
   */
  procesarUbicacionEstatal(actividadData, surveyId, index = 0, dependenciaNombre = null) {
    try {
      const { activity, place } = actividadData;

      // Buscar zona de la dependencia con matching flexible
      const zonaInfo = this.buscarZonaDependencia(dependenciaNombre);

      let lat, lng;

      if (zonaInfo && zonaInfo.zona) {
        // Dispersar marcadores aleatoriamente dentro de la zona de la dependencia
        const coords = this.generarCoordenadasEnZona(zonaInfo.zona, index);
        lat = coords.lat;
        lng = coords.lng;
      } else {
        // Fallback: dispersar por todo el estado de forma distribuida
        // Usar diferentes zonas del estado según el índice
        const zonasDistribuidas = [
          { lat: 19.52, lng: -98.35 },  // Noroeste
          { lat: 19.55, lng: -98.15 },  // Norte
          { lat: 19.50, lng: -97.95 },  // Noreste
          { lat: 19.35, lng: -98.40 },  // Oeste
          { lat: 19.32, lng: -98.20 },  // Centro
          { lat: 19.35, lng: -98.00 },  // Este
          { lat: 19.22, lng: -98.35 },  // Suroeste
          { lat: 19.25, lng: -98.15 },  // Sur
          { lat: 19.28, lng: -97.95 }   // Sureste
        ];
        const zonaBase = zonasDistribuidas[index % zonasDistribuidas.length];
        const radio = 0.025;
        const angulo = (index * 137.5) * (Math.PI / 180);
        lat = zonaBase.lat + (radio * Math.cos(angulo));
        lng = zonaBase.lng + (radio * Math.sin(angulo));
      }

      return {
        activity: activity || "Actividad sin nombre",
        lat: lat,
        lng: lng,
        lugar: place || "Todo el Estado de Tlaxcala",
        mun_id: null,
        mun_name: null,
        total_municipios: 60,
        es_multi_municipio: true,
        tipo: "Estatal",
        es_estatal: true,
        survey_id: surveyId
      };
    } catch (error) {
      console.error("Error al procesar ubicación estatal:", error);
      return null;
    }
  }

  /**
   * Genera coordenadas dispersas dentro de una zona
   * @param {Object} zona - { lat, lng, radio }
   * @param {number} index - Índice para variar la posición
   * @returns {Object} { lat, lng }
   */
  generarCoordenadasEnZona(zona, index) {
    // Usar golden angle para distribución uniforme dentro del círculo
    const angulo = (index * 137.5) * (Math.PI / 180);
    // Radio variable para evitar que todos queden en el mismo círculo
    const radioFactor = 0.3 + (0.7 * ((index % 5) / 5));
    const radio = zona.radio * radioFactor;

    return {
      lat: zona.lat + (radio * Math.cos(angulo)),
      lng: zona.lng + (radio * Math.sin(angulo))
    };
  }

  /**
   * Busca la zona correspondiente a una dependencia con matching flexible
   * @param {string} nombreDependencia - Nombre de la dependencia
   * @returns {Object|null} Zona encontrada o null
   */
  buscarZonaDependencia(nombreDependencia) {
    if (!nombreDependencia) return null;

    const zonas = this.config.ZONAS_DEPENDENCIAS || {};
    const nombreLower = nombreDependencia.toLowerCase();

    // Primero buscar coincidencia exacta
    if (zonas[nombreDependencia]) {
      return { zona: zonas[nombreDependencia], nombre: nombreDependencia };
    }

    // Mapeo de palabras clave a nombres de zona
    const mapeoKeywords = {
      'medio ambiente': 'Secretaría de Medio Ambiente',
      'ambiente': 'Secretaría de Medio Ambiente',
      'gobernación': 'Secretaría de Gobernación',
      'finanzas': 'Secretaría de Finanzas',
      'salud': 'Secretaría de Salud',
      'agropecuario': 'Secretaría de Impulso Agropecuario',
      'impulso agropecuario': 'Secretaría de Impulso Agropecuario',
      'rural': 'Secretaría de Impulso Agropecuario',
      'desarrollo rural': 'Secretaría de Impulso Agropecuario',
      'educación': 'Secretaría de Educación Pública',
      'movilidad': 'Secretaría de Movilidad y Transporte',
      'transporte': 'Secretaría de Movilidad y Transporte',
      'turismo': 'Secretaría de Turismo',
      'seguridad': 'Secretaría de Seguridad Ciudadana',
      'ordenamiento': 'Secretaría de Ordenamiento Territorial y Vivienda',
      'territorial': 'Secretaría de Ordenamiento Territorial y Vivienda',
      'vivienda': 'Secretaría de Ordenamiento Territorial y Vivienda',
      'obras públicas': 'Secretaría de Ordenamiento Territorial y Vivienda',
      'bienestar': 'Secretaría de Bienestar',
      'infraestructura': 'Secretaría de Infraestructura',
      'desarrollo económico': 'Secretaría de Desarrollo Económico',
      'económico': 'Secretaría de Desarrollo Económico',
      'agua': 'Comisión Estatal del Agua y Saneamiento',
      'saneamiento': 'Comisión Estatal del Agua y Saneamiento',
      'ceas': 'Comisión Estatal del Agua y Saneamiento',
      'planeación': 'Coordinación General de Planeación e Inversión',
      'inversión': 'Coordinación General de Planeación e Inversión',
      'procuraduría': 'Procuraduría de Protección al Ambiente',
      'protección al ambiente': 'Procuraduría de Protección al Ambiente',
      'calpulalpan': 'Region Calpulalpan',
      'tlaxco': 'Region Tlaxco',
      'apizaco': 'Region Apizaco',
      'huamantla': 'Region Huamantla',
      'chiautempan': 'Region Chiautempan',
      'tlaxcala': 'Region Tlaxcala',
      'zacatelco': 'Region Zacatelco',
      'san pablo': 'Region San Pablo del Monte'
    };

    // Buscar por palabras clave
    for (const [keyword, zonaNombre] of Object.entries(mapeoKeywords)) {
      if (nombreLower.includes(keyword)) {
        if (zonas[zonaNombre]) {
          return { zona: zonas[zonaNombre], nombre: zonaNombre };
        }
      }
    }

    return null;
  }

  /**
   * Calcula metadata de las acciones estatales
   * @param {Array} acciones - Array de acciones
   * @returns {Object} Metadata calculada
   */
  calcularMetadataEstatal(acciones) {
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
      total_registros: totalUbicaciones,
      dependencias: Array.from(dependenciasSet),
      total_dependencias: dependenciasSet.size,
      tipos: tiposCount,
      estados: estadosCount,
    };
  }

  getCacheEstatal() {
    try {
      const cached = localStorage.getItem(DataAdapter.CACHE_KEY_ESTATAL);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > DataAdapter.CACHE_TTL) {
        localStorage.removeItem(DataAdapter.CACHE_KEY_ESTATAL);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error al leer caché estatal:", error);
      return null;
    }
  }

  getCacheEstatalIgnoreExpiry() {
    try {
      const cached = localStorage.getItem(DataAdapter.CACHE_KEY_ESTATAL);
      if (!cached) return null;

      const { data } = JSON.parse(cached);
      return data;
    } catch (error) {
      return null;
    }
  }

  setCacheEstatal(data) {
    try {
      const cache = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(DataAdapter.CACHE_KEY_ESTATAL, JSON.stringify(cache));
    } catch (error) {
      console.error("Error al guardar caché estatal:", error);
    }
  }
}

if (typeof window !== "undefined") {
  window.DataAdapter = DataAdapter;
}
