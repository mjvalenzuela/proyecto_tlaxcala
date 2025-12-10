/**
 * Script principal para clima.html
 * Maneja mapas, graficos y navegacion
 * Capitulo 1: Layout especial con 4 mapas (Primavera, Primavera Q, Verano, Invierno)
 */

import { climaConfig } from './clima-config.js';

// ============================================================
// INICIALIZACION PRINCIPAL
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  const proxyUrl = climaConfig.proxyUrl;
  const isVercelProxy = proxyUrl.includes('proxy?path=');

  // Objeto para almacenar todos los mapas
  const mapas = {};

  // Almacenar geometria del limite para clipping
  let limiteGeometry = null;
  let limiteLoaded = false;

  // Almacenar referencias a las capas para el control
  const capasControladas = {};

  // Almacenar estado del split por mapa
  const splitState = {};
  let sincronizandoSplit = false;

  // ============================================================
  // SINCRONIZACION DE MAPAS DEL CAPITULO 1
  // ============================================================
  const mapasCapitulo1Ids = ['map-1-primavera', 'map-1-verano', 'map-1-otono', 'map-1-invierno'];
  let sincronizandoVista = false;
  let sincronizandoCapas = false;

  /**
   * Sincroniza la vista (zoom/pan) de todos los mapas del capítulo 1
   * @param {ol.Map} mapaOrigen - Mapa que originó el cambio
   */
  function sincronizarVista(mapaOrigen) {
    if (sincronizandoVista) return;
    sincronizandoVista = true;

    const vista = mapaOrigen.getView();
    const center = vista.getCenter();
    const zoom = vista.getZoom();

    mapasCapitulo1Ids.forEach(mapId => {
      const mapa = mapas[mapId];
      if (mapa && mapa !== mapaOrigen) {
        mapa.getView().setCenter(center);
        mapa.getView().setZoom(zoom);
      }
    });

    sincronizandoVista = false;
  }

  /**
   * Sincroniza el estado de las capas por índice en todos los mapas
   * @param {number} indice - Índice de la capa (0=Clim, 1=Q05, 2=Q95)
   * @param {boolean} visible - Estado de visibilidad
   * @param {string} mapaOrigenId - ID del mapa que originó el cambio
   */
  function sincronizarCapas(indice, visible, mapaOrigenId) {
    if (sincronizandoCapas) return;
    sincronizandoCapas = true;

    mapasCapitulo1Ids.forEach(mapId => {
      if (mapId === mapaOrigenId) return;

      const capas = capasControladas[mapId];
      if (!capas || !capas[indice]) return;

      // Actualizar la capa
      capas[indice].layer.setVisible(visible);
      capas[indice].visible = visible;

      // Actualizar el checkbox
      const checkbox = document.getElementById(`layer-${mapId}-${indice}`);
      if (checkbox) {
        checkbox.checked = visible;
      }

      // Actualizar leyenda
      actualizarLeyendas(mapId);
    });

    sincronizandoCapas = false;
  }

  // Simbologia de precipitacion basada en SLD - Anual
  const simbologiaPrecipitacion = {
    titulo: 'Precipitación Anual (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '0 mm', color: '#1a0a00' },
      { label: '100 mm', color: '#8b0000' },
      { label: '200 mm', color: '#ff0000' },
      { label: '300 mm', color: '#ff6600' },
      { label: '400 mm', color: '#ffa500' },
      { label: '500 mm', color: '#ffcc00' },
      { label: '600 mm', color: '#ffff00' },
      { label: '700 mm', color: '#ccff00' },
      { label: '800 mm', color: '#66ff00' },
      { label: '900 mm', color: '#00ff00' },
      { label: '1000 mm', color: '#00cc66' },
      { label: '1100 mm', color: '#00ddaa' },
      { label: '1200 mm', color: '#00ffff' },
      { label: '1300 mm', color: '#00aaff' },
      { label: '1500 mm', color: '#0066ff' },
      { label: '1700 mm', color: '#0000ff' },
      { label: '1900 mm', color: '#4400ff' },
      { label: '2000+ mm', color: '#6600ff' }
    ]
  };

  // Simbologia Primavera Climatología (134.84 - 418.54 mm)
  const simbologiaPriClim = {
    titulo: 'Precipitación Primavera (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '134.8 mm', color: '#FF412F' },
      { label: '158.5 mm', color: '#FF7214' },
      { label: '182.1 mm', color: '#FF9537' },
      { label: '205.8 mm', color: '#FAB96B' },
      { label: '229.4 mm', color: '#BFED8B' },
      { label: '253.1 mm', color: '#70EC85' },
      { label: '276.7 mm', color: '#11CA63' },
      { label: '300.3 mm', color: '#45A92A' },
      { label: '324.0 mm', color: '#69A469' },
      { label: '347.6 mm', color: '#66B0FF' },
      { label: '371.3 mm', color: '#426DF5' },
      { label: '394.9 mm', color: '#0F39E5' },
      { label: '418.5 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Primavera Q05 (67.98 - 225.87 mm)
  const simbologiaPriQ05 = {
    titulo: 'Precipitación Mínima Q05 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '68.0 mm', color: '#FF412F' },
      { label: '81.1 mm', color: '#FF7214' },
      { label: '94.3 mm', color: '#FF9537' },
      { label: '107.5 mm', color: '#FAB96B' },
      { label: '120.6 mm', color: '#BFED8B' },
      { label: '133.8 mm', color: '#70EC85' },
      { label: '146.9 mm', color: '#11CA63' },
      { label: '160.1 mm', color: '#45A92A' },
      { label: '173.2 mm', color: '#69A469' },
      { label: '186.4 mm', color: '#66B0FF' },
      { label: '199.6 mm', color: '#426DF5' },
      { label: '212.7 mm', color: '#0F39E5' },
      { label: '225.9 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Primavera Q95 (205.30 - 630.07 mm)
  const simbologiaPriQ95 = {
    titulo: 'Precipitación Máxima Q95 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '205.3 mm', color: '#FF412F' },
      { label: '240.7 mm', color: '#FF7214' },
      { label: '276.1 mm', color: '#FF9537' },
      { label: '311.5 mm', color: '#FAB96B' },
      { label: '346.9 mm', color: '#BFED8B' },
      { label: '382.3 mm', color: '#70EC85' },
      { label: '417.7 mm', color: '#11CA63' },
      { label: '453.1 mm', color: '#45A92A' },
      { label: '488.5 mm', color: '#69A469' },
      { label: '523.9 mm', color: '#66B0FF' },
      { label: '559.3 mm', color: '#426DF5' },
      { label: '594.7 mm', color: '#0F39E5' },
      { label: '630.1 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Verano Climatología (295.50 - 1070.97 mm)
  const simbologiaVerClim = {
    titulo: 'Precipitación Verano (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '295.5 mm', color: '#FF412F' },
      { label: '360.1 mm', color: '#FF7214' },
      { label: '424.7 mm', color: '#FF9537' },
      { label: '489.4 mm', color: '#FAB96B' },
      { label: '554.0 mm', color: '#BFED8B' },
      { label: '618.6 mm', color: '#70EC85' },
      { label: '683.2 mm', color: '#11CA63' },
      { label: '747.9 mm', color: '#45A92A' },
      { label: '812.5 mm', color: '#69A469' },
      { label: '877.1 mm', color: '#66B0FF' },
      { label: '941.7 mm', color: '#426DF5' },
      { label: '1006.3 mm', color: '#0F39E5' },
      { label: '1071.0 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Verano Q05 (157.50 - 623.04 mm)
  const simbologiaVerQ05 = {
    titulo: 'Precipitación Mínima Q05 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '157.5 mm', color: '#FF412F' },
      { label: '196.3 mm', color: '#FF7214' },
      { label: '235.1 mm', color: '#FF9537' },
      { label: '273.9 mm', color: '#FAB96B' },
      { label: '312.7 mm', color: '#BFED8B' },
      { label: '351.5 mm', color: '#70EC85' },
      { label: '390.3 mm', color: '#11CA63' },
      { label: '429.1 mm', color: '#45A92A' },
      { label: '467.9 mm', color: '#69A469' },
      { label: '506.7 mm', color: '#66B0FF' },
      { label: '545.4 mm', color: '#426DF5' },
      { label: '584.2 mm', color: '#0F39E5' },
      { label: '623.0 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Verano Q95 (411.84 - 1425.17 mm)
  const simbologiaVerQ95 = {
    titulo: 'Precipitación Máxima Q95 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '411.8 mm', color: '#FF412F' },
      { label: '496.3 mm', color: '#FF7214' },
      { label: '580.7 mm', color: '#FF9537' },
      { label: '665.2 mm', color: '#FAB96B' },
      { label: '749.6 mm', color: '#BFED8B' },
      { label: '834.1 mm', color: '#70EC85' },
      { label: '918.5 mm', color: '#11CA63' },
      { label: '1002.9 mm', color: '#45A92A' },
      { label: '1087.4 mm', color: '#69A469' },
      { label: '1171.8 mm', color: '#66B0FF' },
      { label: '1256.3 mm', color: '#426DF5' },
      { label: '1340.7 mm', color: '#0F39E5' },
      { label: '1425.2 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Invierno Climatología
  const simbologiaInvClim = {
    titulo: 'Precipitación Invierno (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '20 mm', color: '#FF412F' },
      { label: '30 mm', color: '#FF7214' },
      { label: '40 mm', color: '#FF9537' },
      { label: '50 mm', color: '#FAB96B' },
      { label: '60 mm', color: '#BFED8B' },
      { label: '70 mm', color: '#70EC85' },
      { label: '80 mm', color: '#11CA63' },
      { label: '90 mm', color: '#45A92A' },
      { label: '100 mm', color: '#69A469' },
      { label: '110 mm', color: '#66B0FF' },
      { label: '120 mm', color: '#426DF5' },
      { label: '130 mm', color: '#0F39E5' },
      { label: '140 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Invierno Q05
  const simbologiaInvQ05 = {
    titulo: 'Precipitación Mínima Q05 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '5 mm', color: '#FF412F' },
      { label: '10 mm', color: '#FF7214' },
      { label: '15 mm', color: '#FF9537' },
      { label: '20 mm', color: '#FAB96B' },
      { label: '25 mm', color: '#BFED8B' },
      { label: '30 mm', color: '#70EC85' },
      { label: '35 mm', color: '#11CA63' },
      { label: '40 mm', color: '#45A92A' },
      { label: '45 mm', color: '#69A469' },
      { label: '50 mm', color: '#66B0FF' },
      { label: '55 mm', color: '#426DF5' },
      { label: '60 mm', color: '#0F39E5' },
      { label: '65 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Invierno Q95
  const simbologiaInvQ95 = {
    titulo: 'Precipitación Máxima Q95 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '50 mm', color: '#FF412F' },
      { label: '70 mm', color: '#FF7214' },
      { label: '90 mm', color: '#FF9537' },
      { label: '110 mm', color: '#FAB96B' },
      { label: '130 mm', color: '#BFED8B' },
      { label: '150 mm', color: '#70EC85' },
      { label: '170 mm', color: '#11CA63' },
      { label: '190 mm', color: '#45A92A' },
      { label: '210 mm', color: '#69A469' },
      { label: '230 mm', color: '#66B0FF' },
      { label: '250 mm', color: '#426DF5' },
      { label: '270 mm', color: '#0F39E5' },
      { label: '290 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Otoño Climatología
  const simbologiaOtoClim = {
    titulo: 'Precipitación Otoño (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '80 mm', color: '#FF412F' },
      { label: '100 mm', color: '#FF7214' },
      { label: '120 mm', color: '#FF9537' },
      { label: '140 mm', color: '#FAB96B' },
      { label: '160 mm', color: '#BFED8B' },
      { label: '180 mm', color: '#70EC85' },
      { label: '200 mm', color: '#11CA63' },
      { label: '220 mm', color: '#45A92A' },
      { label: '240 mm', color: '#69A469' },
      { label: '260 mm', color: '#66B0FF' },
      { label: '280 mm', color: '#426DF5' },
      { label: '300 mm', color: '#0F39E5' },
      { label: '320 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Otoño Q05
  const simbologiaOtoQ05 = {
    titulo: 'Precipitación Mínima Q05 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '30 mm', color: '#FF412F' },
      { label: '45 mm', color: '#FF7214' },
      { label: '60 mm', color: '#FF9537' },
      { label: '75 mm', color: '#FAB96B' },
      { label: '90 mm', color: '#BFED8B' },
      { label: '105 mm', color: '#70EC85' },
      { label: '120 mm', color: '#11CA63' },
      { label: '135 mm', color: '#45A92A' },
      { label: '150 mm', color: '#69A469' },
      { label: '165 mm', color: '#66B0FF' },
      { label: '180 mm', color: '#426DF5' },
      { label: '195 mm', color: '#0F39E5' },
      { label: '210 mm', color: '#0105CC' }
    ]
  };

  // Simbologia Otoño Q95
  const simbologiaOtoQ95 = {
    titulo: 'Precipitación Máxima Q95 (mm)',
    tipo: 'ramp',
    categorias: [
      { label: '150 mm', color: '#FF412F' },
      { label: '180 mm', color: '#FF7214' },
      { label: '210 mm', color: '#FF9537' },
      { label: '240 mm', color: '#FAB96B' },
      { label: '270 mm', color: '#BFED8B' },
      { label: '300 mm', color: '#70EC85' },
      { label: '330 mm', color: '#11CA63' },
      { label: '360 mm', color: '#45A92A' },
      { label: '390 mm', color: '#69A469' },
      { label: '420 mm', color: '#66B0FF' },
      { label: '450 mm', color: '#426DF5' },
      { label: '480 mm', color: '#0F39E5' },
      { label: '510 mm', color: '#0105CC' }
    ]
  };

  // ============================================================
  // CONFIGURACION DE CAPAS POR MODELO Y PERIODO
  // ============================================================

  // Estado actual de selección
  let modeloActual = 'SSP245';
  let periodoActual = '2021-2040';

  // Configuración de nombres de capas por modelo/periodo/estación
  const capasConfig = {
    SSP245: {
      '2021-2040': {
        otono: {
          clim: 'SEICCT:Escenario_pr_Oto_Clim_2021-2040',
          q05: 'SEICCT:Escenario_pr_Oto_Q05_2021-2040',
          q95: 'SEICCT:Escenario_pr_Oto_Q95_2021-2040'
        },
        primavera: {
          clim: 'SEICCT:Escenario_pr_Pri_Clim_2021-2040',
          q05: 'SEICCT:Escenario_pr_Pri_Q05_2021-2040',
          q95: 'SEICCT:Escenario_pr_Pri_Q95_2021-2040'
        },
        verano: {
          clim: 'SEICCT:Escenario_pr_Ver_Clim_2021-2040',
          q05: 'SEICCT:Escenario_pr_Ver_Q05_2021-2040',
          q95: 'SEICCT:Escenario_pr_Ver_Q95_2021-2040'
        },
        invierno: {
          clim: 'SEICCT:Escenario_pr_Inv_Clim_2021-2040',
          q05: 'SEICCT:Escenario_pr_Inv_Q05_2021-2040',
          q95: 'SEICCT:Escenario_pr_Inv_Q95_2021-2040'
        }
      },
      '2041-2060': {
        otono: {
          clim: 'SEICCT:Escenario_pr_Oto_Clim_2041-2060',
          q05: 'SEICCT:Escenario_pr_Oto_Q05_2041-2060',
          q95: 'SEICCT:Escenario_pr_Oto_Q95_2041-2060'
        },
        primavera: {
          clim: 'SEICCT:Escenario_pr_Pri_Clim_2041-2060',
          q05: 'SEICCT:Escenario_pr_Pri_Q05_2041-2060',
          q95: 'SEICCT:Escenario_pr_Pri_Q95_2041-2060'
        },
        verano: {
          clim: 'SEICCT:Escenario_pr_Ver_Clim_2041-2060',
          q05: 'SEICCT:Escenario_pr_Ver_Q05_2041-2060',
          q95: 'SEICCT:Escenario_pr_Ver_Q95_2041-2060'
        },
        invierno: {
          clim: 'SEICCT:Escenario_pr_Inv_Clim_2041-2060',
          q05: 'SEICCT:Escenario_pr_Inv_Q05_2041-2060',
          q95: 'SEICCT:Escenario_pr_Inv_Q95_2041-2060'
        }
      }
    },
    SSP585: {
      '2021-2040': {
        otono: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Oto_Clim_2021-2040',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Oto_Q05_2021-2040',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Oto_Q95_2021-2040'
        },
        primavera: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Pri_Clim_2021-2040',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Pri_Q05_2021-2040',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Pri_Q95_2021-2040'
        },
        verano: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Ver_Clim_2021-2040',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Ver_Q05_2021-2040',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Ver_Q95_2021-2040'
        },
        invierno: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Inv_Clim_2021-2040',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Inv_Q05_2021-2040',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Inv_Q95_2021-2040'
        }
      },
      '2041-2060': {
        otono: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Oto_Clim_2041-2060',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Oto_Q05_2041-2060',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Oto_Q95_2041-2060'
        },
        primavera: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Pri_Clim_2041-2060',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Pri_Q05_2041-2060',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Pri_Q95_2041-2060'
        },
        verano: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Ver_Clim_2041-2060',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Ver_Q05_2041-2060',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Ver_Q95_2041-2060'
        },
        invierno: {
          clim: 'SEICCT:SSP585_zzEscenario_pr_Inv_Clim_2041-2060',
          q05: 'SEICCT:SSP585_zzEscenario_pr_Inv_Q05_2041-2060',
          q95: 'SEICCT:SSP585_zzEscenario_pr_Inv_Q95_2041-2060'
        }
      }
    }
  };

  /**
   * Obtiene el nombre de la capa según modelo, periodo, estación y tipo
   */
  function obtenerNombreCapa(estacion, tipo) {
    const config = capasConfig[modeloActual]?.[periodoActual]?.[estacion];
    if (!config) {
      console.warn(`No hay configuración para ${modeloActual}/${periodoActual}/${estacion}`);
      return null;
    }
    return config[tipo];
  }

  /**
   * Actualiza todas las capas de los 4 mapas según el modelo y periodo seleccionado
   */
  function actualizarCapasSegunSeleccion() {
    console.log(`Actualizando capas: Modelo=${modeloActual}, Periodo=${periodoActual}`);

    mapasCapitulo1Ids.forEach(mapId => {
      const capas = capasControladas[mapId];
      if (!capas) return;

      // Encontrar la estación de este mapa
      const mapaConfig = mapasCapitulo1.find(m => m.id === mapId);
      if (!mapaConfig) return;

      const estacion = mapaConfig.estacion;

      // Actualizar cada capa (Clim, Q05, Q95)
      capas.forEach((capaInfo, index) => {
        if (capaInfo.nombre === 'Límite Estatal') return;

        // Determinar el tipo de capa según el índice
        let tipo;
        if (index === 0) tipo = 'clim';
        else if (index === 1) tipo = 'q05';
        else if (index === 2) tipo = 'q95';
        else return;

        const nuevaCapa = obtenerNombreCapa(estacion, tipo);
        if (nuevaCapa) {
          // Actualizar la capa WMS
          const source = capaInfo.layer.getSource();
          source.updateParams({ 'LAYERS': nuevaCapa });
          capaInfo.layer.set('name', nuevaCapa);
          console.log(`  ${mapId}: ${capaInfo.nombre} -> ${nuevaCapa}`);
        }
      });
    });
  }

  // ============================================================
  // CAPITULO 1 - MAPAS DE ESCENARIOS CLIMATICOS (4 mapas)
  // Orden: Primavera, Verano (arriba) | Otoño, Invierno (abajo)
  // ============================================================
  const mapasCapitulo1 = [
    {
      id: 'map-1-primavera',
      titulo: 'Primavera',
      estacion: 'primavera',
      capasMultiples: [
        { nombre: 'Primavera', capa: 'SEICCT:Escenario_pr_Pri_Clim_2021-2040', visible: true, simbologia: 'priClim' },
        { nombre: 'Primavera Q05', capa: 'SEICCT:Escenario_pr_Pri_Q05_2021-2040', visible: false, simbologia: 'priQ05' },
        { nombre: 'Primavera Q95', capa: 'SEICCT:Escenario_pr_Pri_Q95_2021-2040', visible: false, simbologia: 'priQ95' }
      ]
    },
    {
      id: 'map-1-verano',
      titulo: 'Verano',
      estacion: 'verano',
      capasMultiples: [
        { nombre: 'Verano', capa: 'SEICCT:Escenario_pr_Ver_Clim_2021-2040', visible: true, simbologia: 'verClim' },
        { nombre: 'Verano Q05', capa: 'SEICCT:Escenario_pr_Ver_Q05_2021-2040', visible: false, simbologia: 'verQ05' },
        { nombre: 'Verano Q95', capa: 'SEICCT:Escenario_pr_Ver_Q95_2021-2040', visible: false, simbologia: 'verQ95' }
      ]
    },
    {
      id: 'map-1-otono',
      titulo: 'Otoño',
      estacion: 'otono',
      capasMultiples: [
        { nombre: 'Otoño', capa: 'SEICCT:Escenario_pr_Oto_Clim_2021-2040', visible: true, simbologia: 'otoClim' },
        { nombre: 'Otoño Q05', capa: 'SEICCT:Escenario_pr_Oto_Q05_2021-2040', visible: false, simbologia: 'otoQ05' },
        { nombre: 'Otoño Q95', capa: 'SEICCT:Escenario_pr_Oto_Q95_2021-2040', visible: false, simbologia: 'otoQ95' }
      ]
    },
    {
      id: 'map-1-invierno',
      titulo: 'Invierno',
      estacion: 'invierno',
      capasMultiples: [
        { nombre: 'Invierno', capa: 'SEICCT:Escenario_pr_Inv_Clim_2021-2040', visible: true, simbologia: 'invClim' },
        { nombre: 'Invierno Q05', capa: 'SEICCT:Escenario_pr_Inv_Q05_2021-2040', visible: false, simbologia: 'invQ05' },
        { nombre: 'Invierno Q95', capa: 'SEICCT:Escenario_pr_Inv_Q95_2021-2040', visible: false, simbologia: 'invQ95' }
      ]
    }
  ];

  mapasCapitulo1.forEach((mapaConfig) => {
    const mapContainer = document.getElementById(mapaConfig.id);
    if (!mapContainer) {
      console.warn(`No se encontro contenedor para ${mapaConfig.id}`);
      return;
    }

    // Crear mapa
    const map = new ol.Map({
      target: mapaConfig.id,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(climaConfig.defaultCenter),
        zoom: climaConfig.defaultZoom,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    mapas[mapaConfig.id] = map;
    capasControladas[mapaConfig.id] = [];

    // Agregar capa de escenario climatico (si tiene capa especifica)
    if (mapaConfig.capaEscenario) {
      // Usar clipping para recortar con el limite estatal
      const capaEscenario = agregarCapaWMSConClipping(map, mapaConfig.capaEscenario, 5, 0.7);
      capasControladas[mapaConfig.id].push({
        nombre: 'Precipitación Anual',
        layer: capaEscenario,
        visible: true,
        simbologia: simbologiaPrecipitacion
      });
    } else if (mapaConfig.capasMultiples) {
      // Mapa de simbologías
      const simbologias = {
        priClim: simbologiaPriClim,
        priQ05: simbologiaPriQ05,
        priQ95: simbologiaPriQ95,
        verClim: simbologiaVerClim,
        verQ05: simbologiaVerQ05,
        verQ95: simbologiaVerQ95,
        invClim: simbologiaInvClim,
        invQ05: simbologiaInvQ05,
        invQ95: simbologiaInvQ95,
        otoClim: simbologiaOtoClim,
        otoQ05: simbologiaOtoQ05,
        otoQ95: simbologiaOtoQ95
      };

      // Agregar múltiples capas con clipping
      mapaConfig.capasMultiples.forEach((capaInfo, index) => {
        const layer = agregarCapaWMSConClipping(map, capaInfo.capa, 5 + index, 0.7);
        layer.setVisible(capaInfo.visible);

        // Obtener simbología específica o usar la genérica
        const simbologia = capaInfo.simbologia ? simbologias[capaInfo.simbologia] : simbologiaPrecipitacion;

        capasControladas[mapaConfig.id].push({
          nombre: capaInfo.nombre,
          layer: layer,
          visible: capaInfo.visible,
          simbologia: simbologia
        });
      });
    } else {
      // Agregar capa placeholder para los otros mapas
      agregarCapaEscenario(map, mapaConfig);
    }

    // Agregar capa del limite estatal (siempre encima)
    const capaLimite = agregarCapaLimite(map, mapaConfig.id);
    capasControladas[mapaConfig.id].push({
      nombre: 'Límite Estatal',
      layer: capaLimite,
      visible: true,
      simbologia: null
    });

    // Crear controles para mapas con capas
    if (mapaConfig.id === 'map-1-primavera' || mapaConfig.id === 'map-1-verano' || mapaConfig.id === 'map-1-otono' || mapaConfig.id === 'map-1-invierno') {
      crearControlCapas(mapaConfig.id, mapContainer);
      crearPanelLeyendas(mapaConfig.id, mapContainer);
      crearBotonSplit(mapaConfig.id, mapContainer);

      // Agregar eventos de sincronización de vista (zoom/pan)
      map.getView().on('change:center', () => sincronizarVista(map));
      map.getView().on('change:resolution', () => sincronizarVista(map));
    }
  });

  /**
   * Agrega una capa WMS generica
   */
  function agregarCapaWMS(map, layerName, zIndex, opacity) {
    const workspace = 'SEICCT';
    let wmsSource;

    if (isVercelProxy) {
      const basePath = `/geoserver/${workspace}/wms`;
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl.replace('?path=', ''),
        params: {
          'LAYERS': layerName,
          'TILED': true,
          'VERSION': '1.1.0',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
        tileLoadFunction: function(imageTile, src) {
          const url = new URL(src, window.location.origin);
          const params = url.searchParams.toString();
          const fullPath = `${basePath}?${params}`;
          const encodedPath = encodeURIComponent(fullPath);
          const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
          imageTile.getImage().src = finalUrl;
        },
      });
    } else {
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl + '/SEICCT/wms',
        params: {
          'LAYERS': layerName,
          'TILED': true,
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
        },
        serverType: 'geoserver',
      });
    }

    const layer = new ol.layer.Tile({
      source: wmsSource,
      visible: true,
      opacity: opacity || 0.7,
      zIndex: zIndex || 1,
    });
    layer.set('name', layerName);
    map.addLayer(layer);

    return layer;
  }

  /**
   * Carga el limite estatal como GeoJSON para usar en clipping
   */
  function cargarLimiteParaClipping() {
    return new Promise((resolve, reject) => {
      if (limiteLoaded && limiteGeometry) {
        resolve(limiteGeometry);
        return;
      }

      // Construir URL del WFS
      let wfsUrl;
      const wfsParams = 'service=WFS&version=1.0.0&request=GetFeature&typeName=SEICCT:Limite&outputFormat=application/json';

      if (isVercelProxy) {
        const fullPath = `/geoserver/SEICCT/ows?${wfsParams}`;
        const encodedPath = encodeURIComponent(fullPath);
        wfsUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
      } else {
        wfsUrl = `${proxyUrl}/SEICCT/ows?${wfsParams}`;
      }

      fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const feature = new ol.format.GeoJSON().readFeatures(data, {
              featureProjection: 'EPSG:3857'
            })[0];
            limiteGeometry = feature.getGeometry();
            limiteLoaded = true;
            console.log('Limite cargado para clipping');
            resolve(limiteGeometry);
          } else {
            reject('No se encontraron features del limite');
          }
        })
        .catch(error => {
          console.error('Error cargando limite para clipping:', error);
          reject(error);
        });
    });
  }

  /**
   * Aplica canvas clipping a una capa usando la geometria del limite
   */
  function aplicarClipping(layer, map) {
    // Evento prerender: iniciar clip
    layer.on('prerender', function(event) {
      if (!limiteGeometry) return;

      const ctx = event.context;
      const mapState = event.frameState;

      ctx.save();
      ctx.beginPath();

      // Obtener coordenadas de la geometria
      const coordinates = limiteGeometry.getCoordinates();

      // Puede ser Polygon o MultiPolygon
      const rings = limiteGeometry.getType() === 'MultiPolygon'
        ? coordinates.flat()
        : coordinates;

      rings.forEach((ring, ringIndex) => {
        ring.forEach((coord, i) => {
          // Convertir coordenadas del mapa a pixeles
          const pixel = map.getPixelFromCoordinate(coord);
          if (pixel) {
            if (i === 0) {
              ctx.moveTo(pixel[0], pixel[1]);
            } else {
              ctx.lineTo(pixel[0], pixel[1]);
            }
          }
        });
        ctx.closePath();
      });

      ctx.clip();
    });

    // Evento postrender: restaurar contexto
    layer.on('postrender', function(event) {
      event.context.restore();
    });
  }

  /**
   * Agrega una capa WMS con clipping opcional
   */
  function agregarCapaWMSConClipping(map, layerName, zIndex, opacity) {
    const layer = agregarCapaWMS(map, layerName, zIndex, opacity);

    // Cargar limite y aplicar clipping
    cargarLimiteParaClipping()
      .then(() => {
        aplicarClipping(layer, map);
        map.render(); // Forzar re-render para aplicar el clip
      })
      .catch(err => {
        console.warn('No se pudo aplicar clipping:', err);
      });

    return layer;
  }

  /**
   * Agrega la capa del limite estatal a un mapa
   */
  function agregarCapaLimite(map, mapId) {
    const workspace = 'SEICCT';
    let wmsSource;

    if (isVercelProxy) {
      const basePath = `/geoserver/${workspace}/wms`;
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl.replace('?path=', ''),
        params: {
          'LAYERS': 'SEICCT:Limite',
          'TILED': true,
          'VERSION': '1.1.0',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
        tileLoadFunction: function(imageTile, src) {
          const url = new URL(src, window.location.origin);
          const params = url.searchParams.toString();
          const fullPath = `${basePath}?${params}`;
          const encodedPath = encodeURIComponent(fullPath);
          const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
          imageTile.getImage().src = finalUrl;
        },
      });
    } else {
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl + '/SEICCT/wms',
        params: {
          'LAYERS': 'SEICCT:Limite',
          'TILED': true,
        },
        serverType: 'geoserver',
      });
    }

    const limiteLayer = new ol.layer.Tile({
      source: wmsSource,
      visible: true,
      opacity: 1,
      zIndex: 10,
    });
    limiteLayer.set('name', 'Limite Estatal');
    map.addLayer(limiteLayer);
    return limiteLayer;
  }

  /**
   * Crea el control de capas para un mapa
   */
  function crearControlCapas(mapId, mapContainer) {
    const capas = capasControladas[mapId];
    if (!capas || capas.length === 0) return;

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'map-controls clima-map-controls';
    controlsContainer.innerHTML = `
      <div class="map-controls-header">
        <div class="map-controls-title">Capas</div>
        <button class="map-controls-toggle">−</button>
      </div>
      <div class="map-controls-content"></div>
    `;

    const contentContainer = controlsContainer.querySelector('.map-controls-content');
    const toggleBtn = controlsContainer.querySelector('.map-controls-toggle');

    toggleBtn.addEventListener('click', () => {
      controlsContainer.classList.toggle('collapsed');
      toggleBtn.textContent = controlsContainer.classList.contains('collapsed') ? '+' : '−';
    });

    capas.forEach((capaInfo, index) => {
      // Omitir Límite Estatal del control de capas
      if (capaInfo.nombre === 'Límite Estatal') return;

      const checkboxId = `layer-${mapId}-${index}`;
      const layerControl = document.createElement('div');
      layerControl.className = 'layer-control';
      layerControl.innerHTML = `
        <input type="checkbox" id="${checkboxId}" ${capaInfo.visible ? 'checked' : ''} />
        <label for="${checkboxId}">${capaInfo.nombre}</label>
      `;
      contentContainer.appendChild(layerControl);

      const checkbox = layerControl.querySelector(`#${checkboxId}`);
      checkbox.addEventListener('change', (e) => {
        capaInfo.layer.setVisible(e.target.checked);
        capaInfo.visible = e.target.checked;
        actualizarLeyendas(mapId);

        // Sincronizar capas en los otros mapas del capítulo 1
        if (mapasCapitulo1Ids.includes(mapId)) {
          sincronizarCapas(index, e.target.checked, mapId);
        }
      });
    });

    mapContainer.appendChild(controlsContainer);
  }

  /**
   * Crea el panel de leyendas para un mapa
   */
  function crearPanelLeyendas(mapId, mapContainer) {
    const legendsContainer = document.createElement('div');
    legendsContainer.className = 'map-legends clima-map-legends';
    legendsContainer.id = `legends-${mapId}`;
    legendsContainer.innerHTML = `
      <div class="map-legends-header">
        <div class="map-legends-title">Leyenda</div>
        <button class="map-legends-toggle">−</button>
      </div>
      <div class="map-legends-content"></div>
    `;

    const toggleBtn = legendsContainer.querySelector('.map-legends-toggle');
    toggleBtn.addEventListener('click', () => {
      legendsContainer.classList.toggle('collapsed');
      toggleBtn.textContent = legendsContainer.classList.contains('collapsed') ? '+' : '−';
    });

    mapContainer.appendChild(legendsContainer);
    actualizarLeyendas(mapId);
  }

  /**
   * Crea el botón de Split Vertical para comparar capas
   */
  function crearBotonSplit(mapId, mapContainer) {
    const map = mapas[mapId];
    const capas = capasControladas[mapId];
    if (!map || !capas || capas.length < 2) return;

    // Crear botón
    const splitBtn = document.createElement('button');
    splitBtn.className = 'clima-split-btn';
    splitBtn.id = `split-btn-${mapId}`;
    splitBtn.innerHTML = `
      <span class="split-icon">⚡</span>
      <span>Comparar</span>
    `;
    splitBtn.title = 'Comparar capas con Split Vertical';
    mapContainer.appendChild(splitBtn);

    // Inicializar estado
    splitState[mapId] = {
      activo: false,
      splitBar: null,
      labelLeft: null,
      labelRight: null,
      listeners: { prerender: null, postrender: null },
      position: 0.5,
      capaA: null,
      capaB: null
    };

    splitBtn.addEventListener('click', () => {
      if (splitState[mapId].activo) {
        // Desactivar split en todos los mapas
        sincronizarSplitDesactivar();
      } else {
        // Activar split en todos los mapas
        sincronizarSplitActivar(mapId);
      }
    });
  }

  /**
   * Sincroniza la activación del Split en todos los mapas del capítulo 1
   */
  function sincronizarSplitActivar(mapIdOrigen) {
    if (sincronizandoSplit) return;
    sincronizandoSplit = true;

    // Primero verificar que el mapa origen tenga 2 capas activas
    const capasOrigen = capasControladas[mapIdOrigen];
    const capasDisponibles = capasOrigen.filter(c => c.nombre !== 'Límite Estatal');
    const capasVisibles = capasDisponibles.filter(c => c.visible);

    if (capasVisibles.length < 2) {
      alert('Activa exactamente 2 capas para comparar con Split Vertical');
      sincronizandoSplit = false;
      return;
    }

    if (capasVisibles.length > 2) {
      alert('Desactiva capas hasta tener solo 2 activas para comparar');
      sincronizandoSplit = false;
      return;
    }

    // Activar split en todos los mapas
    mapasCapitulo1Ids.forEach(mapId => {
      const mapContainer = document.getElementById(mapId);
      const splitBtn = document.getElementById(`split-btn-${mapId}`);
      if (mapContainer && splitBtn && !splitState[mapId].activo) {
        activarSplit(mapId, mapContainer, splitBtn);
      }
    });

    sincronizandoSplit = false;
  }

  /**
   * Sincroniza la desactivación del Split en todos los mapas del capítulo 1
   */
  function sincronizarSplitDesactivar() {
    if (sincronizandoSplit) return;
    sincronizandoSplit = true;

    // Desactivar split en todos los mapas
    mapasCapitulo1Ids.forEach(mapId => {
      const mapContainer = document.getElementById(mapId);
      const splitBtn = document.getElementById(`split-btn-${mapId}`);
      if (mapContainer && splitBtn && splitState[mapId].activo) {
        desactivarSplit(mapId, mapContainer, splitBtn);
      }
    });

    sincronizandoSplit = false;
  }

  /**
   * Sincroniza la posición del Split en todos los mapas del capítulo 1
   */
  function sincronizarSplitPosicion(mapIdOrigen, position) {
    if (sincronizandoSplit) return;
    sincronizandoSplit = true;

    mapasCapitulo1Ids.forEach(mapId => {
      if (mapId !== mapIdOrigen && splitState[mapId].activo) {
        const state = splitState[mapId];
        state.position = position;
        if (state.splitBar) {
          state.splitBar.style.left = `${position * 100}%`;
        }
        mapas[mapId].render();
      }
    });

    sincronizandoSplit = false;
  }

  /**
   * Activa el modo Split Vertical
   */
  function activarSplit(mapId, mapContainer, splitBtn) {
    const map = mapas[mapId];
    const capas = capasControladas[mapId];
    const state = splitState[mapId];

    // Obtener las capas visibles (excluyendo Límite Estatal)
    const capasDisponibles = capas.filter(c => c.nombre !== 'Límite Estatal');
    const capasVisibles = capasDisponibles.filter(c => c.visible);

    // Si no hay exactamente 2 capas visibles, mostrar mensaje
    if (capasVisibles.length < 2) {
      alert('Activa exactamente 2 capas para comparar con Split Vertical');
      return;
    }

    if (capasVisibles.length > 2) {
      alert('Desactiva capas hasta tener solo 2 activas para comparar');
      return;
    }

    // Usar las dos capas que están visibles
    const capaA = capasVisibles[0];
    const capaB = capasVisibles[1];

    // Guardar referencia de las capas en el estado para poder limpiar después
    state.capaA = capaA;
    state.capaB = capaB;

    // Crear barra de split
    const splitBar = document.createElement('div');
    splitBar.className = 'clima-split-bar';
    splitBar.style.left = '50%';
    mapContainer.appendChild(splitBar);
    state.splitBar = splitBar;

    // Crear etiquetas
    const labelLeft = document.createElement('div');
    labelLeft.className = 'clima-split-label clima-split-label-left';
    labelLeft.textContent = capaA.nombre;
    mapContainer.appendChild(labelLeft);
    state.labelLeft = labelLeft;

    const labelRight = document.createElement('div');
    labelRight.className = 'clima-split-label clima-split-label-right';
    labelRight.textContent = capaB.nombre;
    mapContainer.appendChild(labelRight);
    state.labelRight = labelRight;

    // Configurar clipping
    let currentPosition = 0.5;

    const prerenderFn = (event) => {
      const ctx = event.context;
      const width = ctx.canvas.width;
      const clipWidth = width * currentPosition;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipWidth, 0, width - clipWidth, ctx.canvas.height);
      ctx.clip();
    };

    const postrenderFn = (event) => {
      event.context.restore();
    };

    state.listeners.prerender = prerenderFn;
    state.listeners.postrender = postrenderFn;

    capaB.layer.on('prerender', prerenderFn);
    capaB.layer.on('postrender', postrenderFn);

    // Drag de la barra
    let isDragging = false;

    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const rect = mapContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      currentPosition = Math.max(0.1, Math.min(0.9, x / rect.width));

      splitBar.style.left = `${currentPosition * 100}%`;
      state.position = currentPosition;
      map.render();

      // Sincronizar posición en los otros mapas
      sincronizarSplitPosicion(mapId, currentPosition);
    };

    const onMouseUp = (e) => {
      if (isDragging) {
        e.preventDefault();
        isDragging = false;
      }
    };

    splitBar.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Guardar listeners para limpieza
    splitBar._listeners = { onMouseDown, onMouseMove, onMouseUp };

    // Actualizar estado
    state.activo = true;
    splitBtn.classList.add('active');
    splitBtn.innerHTML = `<span class="split-icon">✕</span><span>Cerrar</span>`;

    map.render();
  }

  /**
   * Desactiva el modo Split Vertical
   */
  function desactivarSplit(mapId, mapContainer, splitBtn) {
    const map = mapas[mapId];
    const state = splitState[mapId];

    // Remover barra y etiquetas
    if (state.splitBar) {
      const { onMouseDown, onMouseMove, onMouseUp } = state.splitBar._listeners || {};
      if (onMouseDown) state.splitBar.removeEventListener('mousedown', onMouseDown);
      if (onMouseMove) document.removeEventListener('mousemove', onMouseMove);
      if (onMouseUp) document.removeEventListener('mouseup', onMouseUp);
      state.splitBar.remove();
      state.splitBar = null;
    }

    if (state.labelLeft) {
      state.labelLeft.remove();
      state.labelLeft = null;
    }

    if (state.labelRight) {
      state.labelRight.remove();
      state.labelRight = null;
    }

    // Remover listeners de clipping de la capa B guardada
    if (state.capaB) {
      if (state.listeners.prerender) {
        state.capaB.layer.un('prerender', state.listeners.prerender);
        state.listeners.prerender = null;
      }
      if (state.listeners.postrender) {
        state.capaB.layer.un('postrender', state.listeners.postrender);
        state.listeners.postrender = null;
      }
    }

    // Limpiar referencias de capas
    state.capaA = null;
    state.capaB = null;

    // Actualizar estado
    state.activo = false;
    state.position = 0.5;
    splitBtn.classList.remove('active');
    splitBtn.innerHTML = `<span class="split-icon">⚡</span><span>Comparar</span>`;

    map.render();
  }

  /**
   * Actualiza el panel de leyendas
   */
  function actualizarLeyendas(mapId) {
    const legendsContainer = document.getElementById(`legends-${mapId}`);
    if (!legendsContainer) return;

    const legendsContent = legendsContainer.querySelector('.map-legends-content');
    legendsContent.innerHTML = '';

    const capas = capasControladas[mapId];
    if (!capas) return;

    capas.forEach(capaInfo => {
      if (capaInfo.visible && capaInfo.simbologia) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        // Titulo de la leyenda
        const legendTitle = document.createElement('div');
        legendTitle.className = 'legend-item-title';
        legendTitle.textContent = capaInfo.simbologia.titulo;
        legendItem.appendChild(legendTitle);

        // Rampa de colores horizontal
        if (capaInfo.simbologia.tipo === 'ramp') {
          const rampContainer = document.createElement('div');
          rampContainer.className = 'legend-ramp-container';

          // Crear gradiente
          const rampBar = document.createElement('div');
          rampBar.className = 'legend-ramp-bar';
          const colors = capaInfo.simbologia.categorias.map(c => c.color);
          rampBar.style.background = `linear-gradient(to right, ${colors.join(', ')})`;
          rampContainer.appendChild(rampBar);

          // Etiquetas
          const labelsContainer = document.createElement('div');
          labelsContainer.className = 'legend-ramp-labels';

          // Solo mostrar algunas etiquetas para no saturar
          const indices = [0, Math.floor(capaInfo.simbologia.categorias.length / 2), capaInfo.simbologia.categorias.length - 1];
          indices.forEach(i => {
            const label = document.createElement('span');
            label.className = 'legend-ramp-label';
            label.textContent = capaInfo.simbologia.categorias[i].label;
            labelsContainer.appendChild(label);
          });
          rampContainer.appendChild(labelsContainer);

          legendItem.appendChild(rampContainer);
        }

        legendsContent.appendChild(legendItem);
      }
    });

    if (legendsContent.children.length === 0) {
      legendsContent.innerHTML = '<div class="map-legends-empty">Sin capas activas</div>';
    }
  }

  /**
   * Agrega capa de escenario climatico a un mapa
   */
  function agregarCapaEscenario(map, mapaConfig) {
    // Por ahora agregar municipios como placeholder
    // Aqui se agregaran las capas raster de escenarios climaticos
    const workspace = 'SEICCT';
    let wmsSource;

    if (isVercelProxy) {
      const basePath = `/geoserver/${workspace}/wms`;
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl.replace('?path=', ''),
        params: {
          'LAYERS': 'SEICCT:municipios_ganaperd',
          'TILED': true,
          'VERSION': '1.1.0',
          'FORMAT': 'image/png',
          'TRANSPARENT': true,
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous',
        tileLoadFunction: function(imageTile, src) {
          const url = new URL(src, window.location.origin);
          const params = url.searchParams.toString();
          const fullPath = `${basePath}?${params}`;
          const encodedPath = encodeURIComponent(fullPath);
          const finalUrl = `${proxyUrl.replace('?path=', '')}?path=${encodedPath}`;
          imageTile.getImage().src = finalUrl;
        },
      });
    } else {
      wmsSource = new ol.source.TileWMS({
        url: proxyUrl + '/SEICCT/wms',
        params: {
          'LAYERS': 'SEICCT:municipios_ganaperd',
          'TILED': true,
        },
        serverType: 'geoserver',
      });
    }

    const escenarioLayer = new ol.layer.Tile({
      source: wmsSource,
      visible: true,
      opacity: 0.7,
      zIndex: 5,
    });
    escenarioLayer.set('name', `Escenario ${mapaConfig.estacion}`);
    escenarioLayer.set('estacion', mapaConfig.estacion);
    map.addLayer(escenarioLayer);

    // Guardar referencia para cambiar percentiles
    if (mapaConfig.conPercentiles) {
      map.set('escenarioLayer', escenarioLayer);
    }
  }

  // ============================================================
  // SELECTORES DE MODELO Y PERIODO
  // ============================================================

  // Botones de modelo (SSP245, SSP585)
  const modeloBtns = document.querySelectorAll('.selector-btn[data-model]');
  modeloBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar estado activo solo en botones de modelo
      modeloBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Actualizar modelo actual
      modeloActual = btn.dataset.model;
      console.log(`Modelo seleccionado: ${modeloActual}`);

      // Actualizar capas
      actualizarCapasSegunSeleccion();
    });
  });

  // Botones de periodo (2021-2041, 2041-2060)
  const periodoBtns = document.querySelectorAll('.selector-btn[data-period]');
  periodoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar estado activo solo en botones de periodo
      periodoBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Actualizar periodo actual (convertir formato del botón al formato interno)
      const periodoBtn = btn.dataset.period;
      // Convertir "2021-2041" a "2021-2040" (el formato interno usa 2040)
      if (periodoBtn === '2021-2041') {
        periodoActual = '2021-2040';
      } else if (periodoBtn === '2041-2060') {
        periodoActual = '2041-2060';
      }
      console.log(`Periodo seleccionado: ${periodoActual}`);

      // Actualizar capas
      actualizarCapasSegunSeleccion();
    });
  });

  // ============================================================
  // CAPITULOS 2 y 3 - MAPAS SIMPLES
  // ============================================================
  ['map-2', 'map-3'].forEach((mapId) => {
    const mapContainer = document.getElementById(mapId);
    if (!mapContainer) return;

    const map = new ol.Map({
      target: mapId,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
          zIndex: 0,
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat(climaConfig.defaultCenter),
        zoom: climaConfig.defaultZoom,
      }),
      controls: ol.control.defaults.defaults({
        zoom: true,
        attribution: false,
      }),
    });

    mapas[mapId] = map;

    // Agregar capas base
    agregarCapaLimite(map, mapId);
  });

  // ============================================================
  // GRAFICOS PARA CAPITULOS 2 y 3
  // ============================================================

  // Grafico Capitulo 2 - Precipitacion proyectada
  const chart2Canvas = document.getElementById('chart-2');
  if (chart2Canvas) {
    new Chart(chart2Canvas, {
      type: 'bar',
      data: {
        labels: ['Historico', '2030', '2050', '2070'],
        datasets: [{
          label: 'Precipitacion (mm)',
          data: [850, 820, 780, 750],
          backgroundColor: [
            'rgba(74, 144, 217, 0.8)',
            'rgba(162, 26, 92, 0.6)',
            'rgba(162, 26, 92, 0.7)',
            'rgba(162, 26, 92, 0.8)',
          ],
          borderColor: [
            '#4a90d9',
            '#A21A5C',
            '#A21A5C',
            '#A21A5C',
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 700,
            title: {
              display: true,
              text: 'mm/anio'
            }
          }
        }
      }
    });
  }

  // Grafico Capitulo 3 - Eventos extremos
  const chart3Canvas = document.getElementById('chart-3');
  if (chart3Canvas) {
    new Chart(chart3Canvas, {
      type: 'bar',
      data: {
        labels: ['Heladas', 'Granizadas', 'Sequias', 'Lluvias intensas'],
        datasets: [{
          label: 'Frecuencia',
          data: [45, 28, 12, 35],
          backgroundColor: [
            'rgba(74, 144, 217, 0.8)',
            'rgba(162, 26, 92, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(76, 175, 80, 0.8)',
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Eventos/anio'
            }
          }
        }
      }
    });
  }

  // ============================================================
  // NAVEGACION ENTRE CAPITULOS
  // ============================================================
  const chaptersContainer = document.getElementById("chaptersContainer");
  const timelineItems = document.querySelectorAll(".timeline-item");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  let currentChapter = 1;
  const totalChapters = 3;

  function goToChapter(chapterNum) {
    if (chapterNum < 1 || chapterNum > totalChapters) {
      return;
    }

    currentChapter = chapterNum;

    timelineItems.forEach(item => {
      const itemChapter = parseInt(item.dataset.chapter);
      if (itemChapter === currentChapter) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const targetChapter = document.getElementById(`chapter-${chapterNum}`);
    if (targetChapter) {
      targetChapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Actualizar tamano de todos los mapas del capitulo
    setTimeout(() => {
      if (chapterNum === 1) {
        // Capitulo 1 tiene 4 mapas
        mapasCapitulo1.forEach(m => {
          if (mapas[m.id]) {
            mapas[m.id].updateSize();
          }
        });
      } else {
        // Capitulos 2 y 3 tienen un solo mapa
        const mapId = `map-${chapterNum}`;
        if (mapas[mapId]) {
          mapas[mapId].updateSize();
        }
      }
    }, 300);
  }

  timelineItems.forEach(item => {
    item.addEventListener("click", () => {
      const chapterNum = parseInt(item.dataset.chapter);
      goToChapter(chapterNum);
    });
  });

  btnPrev.addEventListener("click", () => {
    goToChapter(currentChapter - 1);
  });

  btnNext.addEventListener("click", () => {
    goToChapter(currentChapter + 1);
  });

  // Iniciar en el capitulo 1
  goToChapter(1);

  // Observador de interseccion para detectar capitulo visible
  const observerOptions = {
    root: chaptersContainer,
    rootMargin: '0px',
    threshold: 0.5
  };

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const chapterNum = parseInt(entry.target.dataset.chapter);
        if (chapterNum && chapterNum !== currentChapter) {
          currentChapter = chapterNum;
          timelineItems.forEach(item => {
            const itemChapter = parseInt(item.dataset.chapter);
            if (itemChapter === currentChapter) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });

          // Actualizar mapas
          setTimeout(() => {
            if (chapterNum === 1) {
              mapasCapitulo1.forEach(m => {
                if (mapas[m.id]) mapas[m.id].updateSize();
              });
            } else {
              const mapId = `map-${chapterNum}`;
              if (mapas[mapId]) mapas[mapId].updateSize();
            }
          }, 100);
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.chapter[data-chapter]').forEach(chapter => {
    chapterObserver.observe(chapter);
  });

  // Actualizar mapas del capitulo 1 despues de que el layout este listo
  setTimeout(() => {
    mapasCapitulo1.forEach(m => {
      if (mapas[m.id]) {
        mapas[m.id].updateSize();
      }
    });
  }, 500);
});
