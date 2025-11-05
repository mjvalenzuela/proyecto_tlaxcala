/**
 * Adaptador de datos para la API Real
 * Transforma el formato de la API de proyectos al formato esperado por el mapa
 *
 * API REAL: { data: [], pagination: {} }
 * FORMATO ESPERADO: { acciones: [], metadata: {} }
 */

class DataAdapter {
  constructor() {
    this.config = window.AccionesConfig;
  }

  /**
   * MAPEO DE DEPENDENCIAS
   * Convierte ID numérico a nombre completo y color
   */
  static DEPENDENCIAS = {
    1: {
      nombre: 'Comisión Estatal del Agua y Saneamiento',
      color: '#4A90E2'
    },
    2: {
      nombre: 'Secretaría de Medio Ambiente y Recursos Naturales',
      color: '#76BC21'
    },
    3: {
      nombre: 'Secretaría de Desarrollo Rural',
      color: '#8B6F47'
    },
    4: {
      nombre: 'Secretaría de Obras Públicas, Desarrollo Urbano y Vivienda',
      color: '#D0B787'
    },
    5: {
      nombre: 'Secretaría de Desarrollo Económico',
      color: '#A21A5C'
    }
  };

  /**
   * Obtiene datos de la API real con paginación
   */
  async obtenerDatosAPI() {
    try {
      console.log('🔄 Cargando datos desde API Real...');

      let todosLosProyectos = [];
      let paginaActual = 1;
      let tieneMasPaginas = true;

      // Obtener todas las páginas
      while (tieneMasPaginas) {
        const url = `${this.config.API_REAL_URL}?page=${paginaActual}`;
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultado = await response.json();

        // Agregar proyectos de esta página
        if (resultado.data && Array.isArray(resultado.data)) {
          todosLosProyectos = todosLosProyectos.concat(resultado.data);
        }

        // Verificar si hay más páginas
        if (resultado.pagination && resultado.pagination.current_page < resultado.pagination.total_pages) {
          paginaActual++;
        } else {
          tieneMasPaginas = false;
        }
      }

      console.log(`✅ ${todosLosProyectos.length} proyectos cargados desde API Real`);

      // Transformar al formato esperado
      return this.transformarDatos(todosLosProyectos);

    } catch (error) {
      console.error('❌ Error al obtener datos de API Real:', error);
      throw error;
    }
  }

  /**
   * Transforma los datos de la API al formato esperado por el mapa
   */
  transformarDatos(proyectos) {
    // Filtrar solo proyectos aprobados
    const proyectosAprobados = proyectos.filter(p => p.status === 'approved');

    console.log(`📊 ${proyectosAprobados.length} proyectos aprobados de ${proyectos.length} totales`);

    // Transformar cada proyecto
    const acciones = proyectosAprobados
      .map(proyecto => this.transformarProyecto(proyecto))
      .filter(accion => accion !== null); // Eliminar proyectos inválidos

    // Calcular metadata
    const metadata = this.calcularMetadata(acciones);

    return {
      acciones: acciones,
      total: acciones.length,
      metadata: metadata
    };
  }

  /**
   * Transforma un proyecto individual
   */
  transformarProyecto(proyecto) {
    try {
      // Extraer información de answers
      const nombre = this.extraerRespuesta(proyecto.answers, 'Nombre del programa o proyecto');
      const objetivos = this.extraerRespuesta(proyecto.answers, 'Objetivo del programa o proyecto');
      const actividadesStr = this.extraerRespuesta(proyecto.answers, 'Actividades principales');
      const alineacion = this.extraerRespuesta(proyecto.answers, '¿Cuáles son los ejes y medidas a los que abona este proyecto/programa al PACCET 2023-2030?');

      // Debug: mostrar datos extraídos
      console.log(`📝 Proyecto ${proyecto.id}:`, {
        nombre,
        actividadesStr: actividadesStr?.substring(0, 100) + '...'
      });

      // Parsear ubicaciones del string de actividades
      const ubicaciones = this.parsearUbicaciones(actividadesStr);

      console.log(`📍 Proyecto ${proyecto.id} - Ubicaciones encontradas:`, ubicaciones.length);

      // Si no hay ubicaciones válidas, omitir este proyecto
      if (!ubicaciones || ubicaciones.length === 0) {
        console.warn(`⚠️ Proyecto ${proyecto.id} sin ubicaciones válidas`);
        return null;
      }

      // Obtener información de dependencia
      const dependenciaInfo = DataAdapter.DEPENDENCIAS[proyecto.dependency] || {
        nombre: 'Dependencia Desconocida',
        color: '#582574'
      };

      return {
        id: proyecto.id,
        nombre_proyecto: nombre || 'Sin nombre',
        objetivos: objetivos || '',
        actividades: actividadesStr || '',
        alineacion: alineacion || '',
        dependencia: dependenciaInfo.nombre,
        color: dependenciaInfo.color,
        ubicaciones: ubicaciones,
        tipo: this.determinarTipo(nombre),
        estado: 'activo', // Por defecto, ya que status === 'approved'
        created_at: proyecto.created_at,
        updated_at: proyecto.updated_at
      };

    } catch (error) {
      console.error(`❌ Error al transformar proyecto ${proyecto.id}:`, error);
      return null;
    }
  }

  /**
   * Extrae una respuesta específica del array de answers
   */
  extraerRespuesta(answers, questionTitle) {
    if (!answers || !Array.isArray(answers)) return null;

    const respuesta = answers.find(a => a.question_title === questionTitle);
    return respuesta ? respuesta.display_value : null;
  }

  /**
   * Parsea ubicaciones del string de actividades
   * Input: "Actividad 1. LIMPIEZA — Tipo: Local — Lat: 19.56704, Lon: -98.59764 — Lugar: Calpulalpan"
   * Output: [{ lat: 19.56704, lng: -98.59764, lugar: 'Calpulalpan', tipo: 'Local' }]
   */
  parsearUbicaciones(actividadesStr) {
    if (!actividadesStr) return [];

    const ubicaciones = [];

    // Separar por | para multi-ubicación
    const actividades = actividadesStr.split('|').map(a => a.trim());

    actividades.forEach(actividad => {
      // Regex para coordenadas
      const coordRegex = /Lat:\s*([\d.-]+),?\s*Lon:\s*([\d.-]+)/i;
      const coordMatch = actividad.match(coordRegex);

      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);

        // Validar coordenadas dentro de Tlaxcala
        if (this.validarCoordenadas(lat, lng)) {
          // Extraer lugar
          const lugarRegex = /Lugar:\s*([^—|]+)/i;
          const lugarMatch = actividad.match(lugarRegex);
          const lugar = lugarMatch ? lugarMatch[1].trim() : 'Sin especificar';

          // Extraer tipo
          const tipoRegex = /Tipo:\s*([^—|]+)/i;
          const tipoMatch = actividad.match(tipoRegex);
          const tipo = tipoMatch ? tipoMatch[1].trim() : 'Local';

          ubicaciones.push({
            lat: lat,
            lng: lng,
            lugar: lugar,
            tipo: tipo
          });
        } else {
          console.warn(`⚠️ Coordenadas fuera de rango: lat=${lat}, lng=${lng}`);
        }
      } else if (actividad.toLowerCase().includes('tipo: estatal')) {
        // Proyecto estatal sin coordenadas específicas
        ubicaciones.push({
          lat: 19.318154,  // Centro de Tlaxcala
          lng: -98.237232,
          lugar: 'Tlaxcala (Estatal)',
          tipo: 'Estatal'
        });
      }
    });

    return ubicaciones;
  }

  /**
   * Valida que las coordenadas estén dentro de Tlaxcala
   */
  validarCoordenadas(lat, lng) {
    // Límites aproximados de Tlaxcala
    const limites = {
      latMin: 19.0,
      latMax: 19.8,
      lngMin: -98.8,
      lngMax: -97.5
    };

    return (
      lat >= limites.latMin &&
      lat <= limites.latMax &&
      lng >= limites.lngMin &&
      lng <= limites.lngMax
    );
  }

  /**
   * Determina el tipo (proyecto o programa) basado en el nombre
   */
  determinarTipo(nombre) {
    if (!nombre) return 'proyecto';

    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('programa')) return 'programa';
    return 'proyecto';
  }

  /**
   * Calcula metadata a partir de las acciones transformadas
   */
  calcularMetadata(acciones) {
    const dependenciasSet = new Set();
    let totalUbicaciones = 0;
    let tiposCount = { proyectos: 0, programas: 0 };
    let estadosCount = { activos: 0, concluidos: 0, planeados: 0 };

    acciones.forEach(accion => {
      dependenciasSet.add(accion.dependencia);
      totalUbicaciones += accion.ubicaciones.length;

      if (accion.tipo === 'programa') {
        tiposCount.programas++;
      } else {
        tiposCount.proyectos++;
      }

      if (accion.estado === 'activo') {
        estadosCount.activos++;
      } else if (accion.estado === 'concluido') {
        estadosCount.concluidos++;
      } else if (accion.estado === 'planeado') {
        estadosCount.planeados++;
      }
    });

    return {
      total_ubicaciones: totalUbicaciones,
      dependencias: Array.from(dependenciasSet),
      tipos: tiposCount,
      estados: estadosCount
    };
  }
}

// Hacer DataAdapter disponible globalmente
if (typeof window !== 'undefined') {
  window.DataAdapter = DataAdapter;
}
