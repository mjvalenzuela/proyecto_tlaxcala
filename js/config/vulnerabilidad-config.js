export const storyMapConfig = {
  id: "vulnerabilidad",
  titulo: "Vulnerabilidad Climática en Tlaxcala",
  descripcion:
    "Análisis detallado de la vulnerabilidad climática en los municipios de Tlaxcala",

  // ==========================================
  // MAPA INICIAL (PORTADA)
  // ==========================================
  mapaInicial: {
    centro: [-98.2377, 19.3138],
    zoom: 10,
    capas: [
      {
        nombre: "Municipios de Tlaxcala",
        tipo: "wms",
        url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
        layers: "SEICCT:Municipios", // ✅ CORREGIDO
        visible: true,
        leyenda: false,
      },
    ],
  },

  // ==========================================
  // DEFINICIÓN DE LOS CAPÍTULOS
  // ==========================================
  capitulos: [
    // ==========================================
    // CAPÍTULO 1: CONTEXTO MUNICIPAL
    // ==========================================
    {
      id: "cap-1",
      numero: 1,
      titulo: "Índice de vulnerabilidad al CC por municipio",
      etiqueta: "Contexto",

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Vulnerabilidad por Municipio",
            tipo: "wms", // WMS para mostrar estilos SLD de GeoServer
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
          },
          {
            nombre: "Vulnerabilidad por Municipio (Interacción)",
            tipo: "wfs", // WFS transparente solo para clicks
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
            transparente: true, // Marca para aplicar estilo transparente
          },
        ],
      },

      grafico: {
        tipo: "pie",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {
          etiqueta: "categoria",
          valor: "poblacion",
          colores: [
            "#78020e", // Muy Alto - Rojo oscuro
            "#9a3c43", // Alto - Rojo medio
            "#bc7678", // Medio - Rosa medio
            "#ddb0ae", // Bajo - Rosa claro
            "#ffeae3", // Muy Bajo - Rosa muy claro
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: false,
          mostrarValoresEnTorta: false, // No mostrar valores en la torta
        },
      },

      /*       grafico: {
        tipo: "bar",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {          
          ejeX: "municipio",
          ejeY: "vulnerabilidad",
          etiquetaY: "Índice de Vulnerabilidad",
          color: "rgba(239, 68, 68, 0.8)",
          colorBorde: "rgba(239, 68, 68, 1)",
          mostrarLeyenda: false,
        },
      }, */
    },

        // ==========================================
    // CAPÍTULO 2: CONTEXTO MUNICIPAL
    // ==========================================
    {
      id: "cap-2",
      numero: 2,
      titulo: "Índice de vulnerabilidad al CC por municipio",
      etiqueta: "Contexto",

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          }, 
          {
            nombre: "Vulnerabilidad por Municipio",
            tipo: "wms", // WFS para permitir interacción con popup
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC", 
            visible: true,
            leyenda: true,
            /* estilo: {
              fillColor: "rgba(162, 26, 92, 0.3)",
              strokeColor: "#A21A5C",
              strokeWidth: 2,
            }, */
          },
        ],
      },

/*       grafico: {
        tipo: "pie",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {
          etiqueta: "categoria",
          valor: "poblacion",
          colores: [
            "#78020e", // Muy Alto - Rojo oscuro
            "#9a3c43", // Alto - Rojo medio
            "#bc7678", // Medio - Rosa medio
            "#ddb0ae", // Bajo - Rosa claro
            "#ffeae3", // Muy Bajo - Rosa muy claro
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: false,
          mostrarValoresEnTorta: false, // No mostrar valores en la torta
        },
      }, */

      /*       grafico: {
        tipo: "bar",
        datos: "data/cp1_poblacion_vulnerable.csv",
        config: {          
          ejeX: "municipio",
          ejeY: "vulnerabilidad",
          etiquetaY: "Índice de Vulnerabilidad",
          color: "rgba(239, 68, 68, 0.8)",
          colorBorde: "rgba(239, 68, 68, 1)",
          mostrarLeyenda: false,
        },
      }, */
    },

    // ==========================================
    // SUB-CAPÍTULOS DE BIODIVERSIDAD (2.1 - 2.8)
    // ==========================================
    // SUB-CAPÍTULO 2.1: ABEJAS
    {
      id: "cap-2-1",
      numero: 2.1,
      titulo: "Abejas",
      etiqueta: "Abejas",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Riqueza de Abejas',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_abejas',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.2: AGAVES
    {
      id: "cap-2-2",
      numero: 2.2,
      titulo: "Agaves",
      etiqueta: "Agaves",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Riqueza de Agaves',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_agaves',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.3: HONGOS
    {
      id: "cap-2-3",
      numero: 2.3,
      titulo: "Hongos",
      etiqueta: "Hongos",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
           {
            nombre: 'Riqueza de Hongos',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_hongos',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.4: POLILLAS
    {
      id: "cap-2-4",
      numero: 2.4,
      titulo: "Polillas",
      etiqueta: "Polillas",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
            {
            nombre: 'Riqueza de Polillas',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_polillas',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.5: MURCIÉLAGOS
    {
      id: "cap-2-5",
      numero: 2.5,
      titulo: "Murciélagos",
      etiqueta: "Murciélagos",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
            {
            nombre: 'Riqueza de Murciélagos',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_murcielagos',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.6: ESPECIES DE INTERÉS
    {
      id: "cap-2-6",
      numero: 2.6,
      titulo: "Especies de Interés",
      etiqueta: "Especies de Interés",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
            {
            nombre: 'Especies de Interés',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_interes',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.7: ESPECIES EN RIESGO/PRIORITARIAS
    {
      id: "cap-2-7",
      numero: 2.7,
      titulo: "Especies en Riesgo/Prioritarias",
      etiqueta: "En Riesgo",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
            {
            nombre: 'Especies en Riesgo/Prioritarias',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_riesgo',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 2.8: SUBESPECIES
    {
      id: "cap-2-8",
      numero: 2.8,
      titulo: "Subespecies",
      etiqueta: "Subespecies",
      esSubcapitulo: true,
      capituloPadre: 2,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
            {
            nombre: 'Subespecies',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:riqueza_subespecies',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // ==========================================
    // CAPÍTULO 3: GANANCIA/PÉRDIDA DE IDONEIDAD
    // ==========================================
    {
      id: "cap-3",
      numero: 3,
      titulo: "Vulnerabilidad de la biodiversidad - Ganancia",
      etiqueta: "Ganancia/Pérdida",

      // Este capítulo muestra una imagen estática en lugar de un mapa interactivo
      tieneImagen: true,
      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Sin capas - se muestra imagen estática
      },
    },

    // ==========================================
    // SUB-CAPÍTULOS DEL CAPÍTULO 3 (3.1 - 3.9)
    // ==========================================
    // SUB-CAPÍTULO 3.1: ABEJAS
    {
      id: "cap-3-1",
      numero: 3.1,
      titulo: "Abejas",
      etiqueta: "Abejas",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
             {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_abejas_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 3.2: AGAVES
    {
      id: "cap-3-2",
      numero: 3.2,
      titulo: "Agaves",
      etiqueta: "Agaves",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:ganancia_agaves_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:ganancia_agaves_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 3.3: HONGOS
    {
      id: "cap-3-3",
      numero: 3.3,
      titulo: "Hongos",
      etiqueta: "Hongos",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_hongos_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 3.4: POLILLAS
    {
      id: "cap-3-4",
      numero: 3.4,
      titulo: "Polillas",
      etiqueta: "Polillas",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_polillas_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 3.5: MURCIÉLAGOS
    {
      id: "cap-3-5",
      numero: 3.5,
      titulo: "Murciélagos",
      etiqueta: "Murciélagos",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Murciélagos - Pérdida/Ganancia",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82Vulnerabilidad",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 3.6: ESPECIES DE INTERÉS
    {
      id: "cap-3-6",
      numero: 3.6,
      titulo: "Especies de Interés",
      etiqueta: "Especies de Interés",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Especies de Interés - Pérdida/Ganancia",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82Vulnerabilidad",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 3.7: ESPECIES EN RIESGO/PRIORITARIAS
    {
      id: "cap-3-7",
      numero: 3.7,
      titulo: "Especies en Riesgo/Prioritarias",
      etiqueta: "En Riesgo",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_rpc_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 3.8: SUBESPECIES
    {
      id: "cap-3-8",
      numero: 3.8,
      titulo: "Subespecies",
      etiqueta: "Subespecies",
      esSubcapitulo: true,
      capituloPadre: 3,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:ganancia_spp_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // ==========================================
    // CAPÍTULO 4: PÉRDIDA DE IDONEIDAD
    // ==========================================
    {
      id: "cap-4",
      numero: 4,
      titulo: "Vulnerabilidad de la biodiversidad - Pérdida de Idoneidad",
      etiqueta: "Pérdida de Idoneidad",

      // Este capítulo muestra una imagen estática en lugar de un mapa interactivo
      tieneImagen: true,
      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Sin capas - se muestra imagen estática
      },
    },

    // ==========================================
    // SUB-CAPÍTULOS DEL CAPÍTULO 4 (4.1 - 4.8)
    // ==========================================
    // SUB-CAPÍTULO 4.1: ABEJAS
    {
      id: "cap-4-1",
      numero: 4.1,
      titulo: "Abejas",
      etiqueta: "Abejas",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
             {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
                        {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_abejas_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 4.2: AGAVES
    {
      id: "cap-4-2",
      numero: 4.2,
      titulo: "Agaves",
      etiqueta: "Agaves",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:perdida_agaves_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: '	SEICCT:perdida_agaves_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 4.3: HONGOS
    {
      id: "cap-4-3",
      numero: 4.3,
      titulo: "Hongos",
      etiqueta: "Hongos",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_hongos_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 4.4: POLILLAS
    {
      id: "cap-4-4",
      numero: 4.4,
      titulo: "Polillas",
      etiqueta: "Polillas",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_polillas_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 4.5: MURCIÉLAGOS
    {
      id: "cap-4-5",
      numero: 4.5,
      titulo: "Murciélagos",
      etiqueta: "Murciélagos",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Murciélagos - Pérdida/Ganancia",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82Vulnerabilidad",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 4.6: ESPECIES DE INTERÉS
    {
      id: "cap-4-6",
      numero: 4.6,
      titulo: "Especies de Interés",
      etiqueta: "Especies de Interés",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [
          {
            nombre: 'Límite',
            tipo: 'wms',
            url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
            layers: 'SEICCT:Limite',
            visible: true,
            leyenda: true
          },
          {
            nombre: "Especies de Interés - Pérdida/Ganancia",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82Vulnerabilidad",
            visible: true,
            leyenda: true,
          },
        ],
      },
    },

    // SUB-CAPÍTULO 4.7: ESPECIES EN RIESGO/PRIORITARIAS
    {
      id: "cap-4-7",
      numero: 4.7,
      titulo: "Especies en Riesgo/Prioritarias",
      etiqueta: "En Riesgo",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_rpc_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // SUB-CAPÍTULO 4.8: SUBESPECIES
    {
      id: "cap-4-8",
      numero: 4.8,
      titulo: "Subespecies",
      etiqueta: "Subespecies",
      esSubcapitulo: true,
      capituloPadre: 4,

      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [], // Inicia sin capas - se cargan al seleccionar modelo climático
      },

      // Configuración de capas por modelo climático
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MIROC6_ssp245_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MIROC6_ssp245_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        },
        "MIROC6_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MIROC6_ssp585_2021.2040',
              visible: true,
              leyenda: true
            },
            {
              nombre: "2041.2060",
              tipo: 'wms',
              url: 'https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows',
              layers: 'SEICCT:perdida_spp_MIROC6_ssp585_2041.2060',
              visible: true,
              leyenda: true
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ]
        }
      }
    },

    // ==========================================
    // CAPÍTULO 4: DISTRIBUCIÓN DE VULNERABILIDAD
    // ==========================================
    /* {
      id: "cap-4",
      numero: 4,
      titulo: "Distribución de Vulnerabilidad",
      etiqueta: "Distribución",

      mapa: {
        centro: [-98.2377, 19.3138],
        zoom: 10,
        capas: [
          {
            nombre: "Localidades",
            tipo: "wfs",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Localidades", // ✅ CORREGIDO
            visible: true,
            leyenda: false,
            opacity: 0.6, // Semi-transparente para ver ambas capas
          },
        ],
      },

      grafico: {
        tipo: "pie",
        datos: "data/categorias.csv",
        config: {
          titulo: "Categorías de Vulnerabilidad",
          etiqueta: "categoria",
          valor: "porcentaje",
          colores: [
            "rgba(239, 68, 68, 0.8)", // Muy Alto - Rojo
            "rgba(245, 158, 11, 0.8)", // Alto - Naranja
            "rgba(234, 179, 8, 0.8)", // Medio - Amarillo
            "rgba(34, 197, 94, 0.8)", // Bajo - Verde
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: true,
        },
      },
    }, */
  ],

  // ==========================================
  // CONFIGURACIÓN DE LA CAPA BASE
  // ==========================================
  mapaBase: {
    tipo: "esri",
    nombre: "World Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },

  // ==========================================
  // CONFIGURACIÓN DEL PROXYlkjsk
  // ==========================================
  proxy: {
    url: (() => {
      const hostname = window.location.hostname;

      // ==========================================
      // ENTORNO LOCAL (Live Server, http-server, etc.)
      // ==========================================
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        // console.log("🏠 Entorno: LOCAL - Usando proxy Node.js local");
        return "http://localhost:3001/geoserver";
      }

      // ==========================================
      // ENTORNO VERCEL (Producción)
      // ==========================================
      if (hostname.includes("vercel.app")) {
        // console.log("☁️ Entorno: VERCEL - Usando proxy serverless");
        return "/api/proxy?path=";
      }

      // ==========================================
      // FALLBACK: Conexión directa
      // ==========================================
      // console.log("🌐 Entorno: OTRO - Conexión directa a GeoServer");
      // console.warn("⚠️ ADVERTENCIA: Conexión directa puede fallar por CORS");
      return "https://api.cambioclimaticotlaxcala.mx/geoserver";
    })(),
  },
};

// ==========================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ==========================================

/**
 * Valida que la configuración sea correcta
 */
export function validarConfiguracion(config) {
  // console.log("🔍 Validando configuración del Story Map...");

  // Validar que hay capítulos
  if (!config.capitulos || config.capitulos.length === 0) {
    throw new Error("La configuración debe tener al menos un capítulo");
  }

  // Validar cada capítulo
  config.capitulos.forEach((cap, index) => {
    // Validar que tenga al menos el mapa
    if (!cap.mapa) {
      throw new Error(
        `El capítulo ${index + 1} debe tener configuración de mapa`
      );
    }

    // El gráfico es opcional, solo validar si existe
    if (cap.grafico) {
      // Validar configuración del gráfico
      if (!cap.grafico.tipo || !cap.grafico.datos || !cap.grafico.config) {
        throw new Error(
          `El capítulo ${index + 1} tiene configuración incompleta del gráfico`
        );
      }
    }

    // Validar que las capas existen (excepto si tiene modelos climáticos configurados o usa imagen estática)
    if (!cap.mapa.capas || cap.mapa.capas.length === 0) {
      // Si el capítulo tiene modelos climáticos, las capas se cargan dinámicamente
      // Si el capítulo tiene tieneImagen=true, muestra imagen estática en lugar de mapa
      if (!cap.modelosClimaticos && !cap.tieneImagen) {
        throw new Error(
          `El capítulo ${index + 1} debe tener al menos una capa de mapa o configuración de modelos climáticos`
        );
      }
    }

    // Validar capas WMS/WFS
    cap.mapa.capas.forEach((capa, capaIndex) => {
      if (!capa.layers || !capa.layers.includes("SEICCT:")) {
        // console.warn(`⚠️ Capítulo ${index + 1}, Capa ${capaIndex + 1}: No tiene el formato correcto SEICCT:NombreCapa`);
      }

      // Validar que el nombre de la capa es válido
      const capasValidas = [
        "SEICCT:Limite",
        "SEICCT:Localidades",
        "SEICCT:Municipios",
      ];
      if (!capasValidas.includes(capa.layers)) {
        // console.warn(`⚠️ Capítulo ${index + 1}: Capa "${capa.layers}" puede no existir en GeoServer`);
        // console.warn(`   Capas válidas: ${capasValidas.join(", ")}`);
      }
    });

    // Validar swipe si está habilitado
    if (cap.mapa.swipe?.enabled) {
      if (!cap.mapa.swipe.capaIzquierda || !cap.mapa.swipe.capaDerecha) {
        throw new Error(
          `El capítulo ${index + 1} tiene swipe habilitado pero faltan capas`
        );
      }

      // Verificar que las capas existen
      const nombreCapas = cap.mapa.capas.map((c) => c.nombre);
      if (!nombreCapas.includes(cap.mapa.swipe.capaIzquierda)) {
        throw new Error(
          `Capa izquierda del swipe no encontrada: ${cap.mapa.swipe.capaIzquierda}`
        );
      }
      if (!nombreCapas.includes(cap.mapa.swipe.capaDerecha)) {
        throw new Error(
          `Capa derecha del swipe no encontrada: ${cap.mapa.swipe.capaDerecha}`
        );
      }
    }
  });

  // console.log("✅ Configuración validada correctamente");
  return true;
}

/**
 * Obtiene un capítulo por su número
 */
export function obtenerCapituloPorNumero(numero) {
  return storyMapConfig.capitulos.find((cap) => cap.numero === numero);
}

/**
 * Obtiene el total de capítulos
 */
export function obtenerTotalCapitulos() {
  return storyMapConfig.capitulos.length;
}

/**
 * Obtiene los capítulos que tienen swipe habilitado
 */
export function obtenerCapitulosConSwipe() {
  return storyMapConfig.capitulos.filter((cap) => cap.mapa.swipe?.enabled);
}

/**
 * Verifica si un capítulo tiene swipe habilitado
 */
export function tieneSwipe(numeroCapitulo) {
  const capitulo = obtenerCapituloPorNumero(numeroCapitulo);
  return capitulo?.mapa?.swipe?.enabled || false;
}

/**
 * Obtiene información del proxy según el entorno
 */
export function obtenerInfoProxy() {
  return {
    url: storyMapConfig.proxy.url,
    esLocal: storyMapConfig.proxy.url.includes("localhost"),
    esVercel: storyMapConfig.proxy.url.includes("/api/proxy"),
    esDirecto: storyMapConfig.proxy.url.includes("cambioclimaticotlaxcala.mx"),
  };
}

/**
 * Lista todas las capas únicas usadas en la configuración
 */
export function listarCapasUnicas() {
  const capasSet = new Set();

  // Capas del mapa inicial
  if (storyMapConfig.mapaInicial?.capas) {
    storyMapConfig.mapaInicial.capas.forEach((capa) => {
      capasSet.add(capa.layers);
    });
  }

  // Capas de cada capítulo
  storyMapConfig.capitulos.forEach((cap) => {
    if (cap.mapa?.capas) {
      cap.mapa.capas.forEach((capa) => {
        capasSet.add(capa.layers);
      });
    }
  });

  return Array.from(capasSet);
}

// ==========================================
// VALIDACIÓN AUTOMÁTICA AL CARGAR
// ==========================================
try {
  validarConfiguracion(storyMapConfig);

  // console.log("📊 Resumen de configuración:");
  // console.log(`   - Capítulos: ${obtenerTotalCapitulos()}`);
  // console.log(`   - Capas únicas: ${listarCapasUnicas().join(", ")}`);
  // console.log(`   - Proxy: ${obtenerInfoProxy().url}`);
} catch (error) {
  console.error("❌ Error en la configuración:", error.message);
  throw error;
}
