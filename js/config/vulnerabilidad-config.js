/**
 * Configuración de capítulos para vulnerabilidad.html
 * Define mapas WMS/WFS, modelos climáticos y capas por capítulo
 */
export const storyMapConfig = {
  id: "vulnerabilidad",
  titulo: "Vulnerabilidad Climática en Tlaxcala",
  descripcion:
    "Análisis detallado de la vulnerabilidad climática en los municipios de Tlaxcala",
  mapaInicial: {
    centro: [-98.2377, 19.3138],
    zoom: 10,
    capas: [
      {
        nombre: "Municipios de Tlaxcala",
        tipo: "wms",
        url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
        layers: "SEICCT:Municipios",
        visible: true,
        leyenda: false,
      },
    ],
  },
  capitulos: [
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
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
          {
            nombre: "Vulnerabilidad por Municipio",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
          },
          {
            nombre: "Vulnerabilidad por Municipio (Interacción)",
            tipo: "wfs",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: false,
            transparente: true,
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
            "#78020e",
            "#9a3c43",
            "#bc7678",
            "#ddb0ae",
            "#ffeae3",
          ],
          mostrarLeyenda: true,
          mostrarPorcentaje: false,
          mostrarValoresEnTorta: false,
        },
      },
      
    },
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
            nombre: "Límite",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:Limite",
            visible: true,
            leyenda: true,
          },
          {
            nombre: "Vulnerabilidad por Municipio",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:M82_Vulnerabilidad_CC",
            visible: true,
            leyenda: true,
            
          },
        ],
      },
      
      
    },
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
            nombre: "Riqueza de Abejas",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_abejas",
            visible: true,
            leyenda: true,
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
            nombre: "Riqueza de Agaves",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_agaves",
            visible: true,
            leyenda: true,
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
            nombre: "Riqueza de Hongos",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_hongos",
            visible: true,
            leyenda: true,
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
            nombre: "Riqueza de Polillas",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_polillas",
            visible: true,
            leyenda: true,
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
            nombre: "Riqueza de Murciélagos",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_murcielagos",
            visible: true,
            leyenda: true,
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
            nombre: "Especies de Interés",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_interes",
            visible: true,
            leyenda: true,
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
            nombre: "Especies en Riesgo/Prioritarias",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_riesgo",
            visible: true,
            leyenda: true,
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
            nombre: "Subespecies",
            tipo: "wms",
            url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
            layers: "SEICCT:riqueza_subespecies",
            visible: true,
            leyenda: true,
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
    {
      id: "cap-3",
      numero: 3,
      titulo: "Vulnerabilidad de la biodiversidad - Ganancia",
      etiqueta: "Ganancia/Pérdida",
      tieneImagen: true,
      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [],
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_abejas_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:ganancia_agaves_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:ganancia_agaves_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:ganancia_agaves_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_agaves_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_hongos_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_polillas_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_polillas_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_murcielagos_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_murcielagos_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_murcielagos_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_murcielagos_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_murcielagos_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_interes_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_interes_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_interes_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:ganancia_interes_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_interes_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_rpc_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:ganancia_spp_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
    {
      id: "cap-4",
      numero: 4,
      titulo: "Vulnerabilidad de la biodiversidad - Pérdida de Idoneidad",
      etiqueta: "Pérdida de Idoneidad",
      tieneImagen: true,
      mapa: {
        centro: [-98.16560203447955, 19.42964878131165],
        zoom: 10,
        capas: [],
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_abejas_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:perdida_agaves_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:perdida_agaves_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "	SEICCT:perdida_agaves_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_agaves_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_hongos_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_polillas_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_polillas_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers:
                "SEICCT:perdida_murcielagos_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_murcielagos_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_murcielagos_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_murcielagos_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_murcielagos_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_interes_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_rpc_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
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
        capas: [],
      },
      modelosClimaticos: {
        "HadGEM3.GC31.LL_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "HadGEM3.GC31.LL_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_HadGEM3.GC31.LL_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp245": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        "MPI.ESM1.2.HR_ssp585": {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MPI.ESM1.2.HR_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp245: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MIROC6_ssp245_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MIROC6_ssp245_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
        MIROC6_ssp585: {
          capas: [
            {
              nombre: "2021.2040",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MIROC6_ssp585_2021.2040",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "2041.2060",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:perdida_spp_MIROC6_ssp585_2041.2060",
              visible: true,
              leyenda: true,
            },
            {
              nombre: "Municipios",
              tipo: "wms",
              url: "https://api.cambioclimaticotlaxcala.mx/geoserver/SEICCT/ows",
              layers: "SEICCT:municipios_ganaperd",
              visible: true,
              leyenda: true,
            },
          ],
        },
      },
    },
    
  ],
  mapaBase: {
    tipo: "esri",
    nombre: "World Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  proxy: {
    url: (() => {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001/geoserver";
      }
      if (hostname.includes("vercel.app")) {
        return "/api/proxy?path=";
      }
      return "https://api.cambioclimaticotlaxcala.mx/geoserver";
    })(),
  },
};

export function validarConfiguracion(config) {
  if (!config.capitulos || config.capitulos.length === 0) {
    throw new Error("La configuración debe tener al menos un capítulo");
  }
  config.capitulos.forEach((cap, index) => {
    if (!cap.mapa) {
      throw new Error(
        `El capítulo ${index + 1} debe tener configuración de mapa`
      );
    }
    if (cap.grafico) {
      if (!cap.grafico.tipo || !cap.grafico.datos || !cap.grafico.config) {
        throw new Error(
          `El capítulo ${index + 1} tiene configuración incompleta del gráfico`
        );
      }
    }
    if (!cap.mapa.capas || cap.mapa.capas.length === 0) {
      if (!cap.modelosClimaticos && !cap.tieneImagen) {
        throw new Error(
          `El capítulo ${
            index + 1
          } debe tener al menos una capa de mapa o configuración de modelos climáticos`
        );
      }
    }
    cap.mapa.capas.forEach((capa, capaIndex) => {
      if (!capa.layers || !capa.layers.includes("SEICCT:")) {
      }
      const capasValidas = [
        "SEICCT:Limite",
        "SEICCT:Localidades",
        "SEICCT:Municipios",
      ];
      if (!capasValidas.includes(capa.layers)) {
      }
    });
    if (cap.mapa.swipe?.enabled) {
      if (!cap.mapa.swipe.capaIzquierda || !cap.mapa.swipe.capaDerecha) {
        throw new Error(
          `El capítulo ${index + 1} tiene swipe habilitado pero faltan capas`
        );
      }
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
  return true;
}

export function obtenerCapituloPorNumero(numero) {
  return storyMapConfig.capitulos.find((cap) => cap.numero === numero);
}

export function obtenerTotalCapitulos() {
  return storyMapConfig.capitulos.length;
}

export function obtenerCapitulosConSwipe() {
  return storyMapConfig.capitulos.filter((cap) => cap.mapa.swipe?.enabled);
}

export function tieneSwipe(numeroCapitulo) {
  const capitulo = obtenerCapituloPorNumero(numeroCapitulo);
  return capitulo?.mapa?.swipe?.enabled || false;
}

export function obtenerInfoProxy() {
  return {
    url: storyMapConfig.proxy.url,
    esLocal: storyMapConfig.proxy.url.includes("localhost"),
    esVercel: storyMapConfig.proxy.url.includes("/api/proxy"),
    esDirecto: storyMapConfig.proxy.url.includes("cambioclimaticotlaxcala.mx"),
  };
}

export function listarCapasUnicas() {
  const capasSet = new Set();
  if (storyMapConfig.mapaInicial?.capas) {
    storyMapConfig.mapaInicial.capas.forEach((capa) => {
      capasSet.add(capa.layers);
    });
  }
  storyMapConfig.capitulos.forEach((cap) => {
    if (cap.mapa?.capas) {
      cap.mapa.capas.forEach((capa) => {
        capasSet.add(capa.layers);
      });
    }
  });
  return Array.from(capasSet);
}
try {
  validarConfiguracion(storyMapConfig);
} catch (error) {
  console.error("Error en la configuración:", error.message);
  throw error;
}