/**
 * main.js - Punto de entrada principal de la aplicación
 * Inicializa y orquesta todos los componentes del Story Map
 */

import { storyMapConfig } from './config/vulnerabilidad-config.js';
import { MapManager } from './managers/MapManager.js';
import { ChartManager } from './managers/ChartManager.js';

class StoryMapApp {
  constructor(config) {
    this.config = config;
    this.mapManager = new MapManager(config);
    this.chartManager = new ChartManager();
    this.capituloActual = 1;
    this.totalCapitulos = config.capitulos.length;
    this.enIntro = true;
    
    // Referencias a elementos del DOM
    this.elementos = {
      chaptersContainer: document.getElementById('chaptersContainer'),
      timeline: document.getElementById('timeline'),
      navButtonsLeft: document.getElementById('navButtonsLeft'),
      navButtonsRight: document.getElementById('navButtonsRight'),
      btnPrev: document.getElementById('btnPrev'),
      btnNext: document.getElementById('btnNext')
    };

    this.inicializar();
  }

  /**
   * Inicializa la aplicación
   */
  async inicializar() {
    ////console.log('🚀 Iniciando Story Map:', this.config.titulo);

    try {
      // Configurar eventos
      this.configurarEventos();

      // Iniciar directamente los capítulos sin pantalla de intro
      await this.iniciarStoryMapDirecto();

      ////console.log('✅ Story Map inicializado correctamente');
    } catch (error) {
      //console.error('❌ Error al inicializar Story Map:', error);
    }
  }

  /**
   * Configura todos los event listeners
   */
  configurarEventos() {
    // Botones de navegación
    this.elementos.btnPrev.addEventListener('click', () => {
      this.navegarCapitulo(this.capituloActual - 1);
    });

    this.elementos.btnNext.addEventListener('click', () => {
      this.navegarCapitulo(this.capituloActual + 1);
    });

    // Timeline - clicks en círculos
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      item.addEventListener('click', () => {
        const numeroCapitulo = parseInt(item.dataset.chapter);
        this.navegarCapitulo(numeroCapitulo);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.enIntro) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.navegarCapitulo(this.capituloActual - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.navegarCapitulo(this.capituloActual + 1);
      }
    });

    // Detectar scroll para actualizar capítulo actual
    this.elementos.chaptersContainer.addEventListener('scroll', () => {
      this.detectarCapituloVisible();
    });

    // Intersection Observer para capítulos
    this.configurarIntersectionObserver();

    // Navegación de sub-capítulos de biodiversidad
    this.configurarNavegacionSubcapitulos();
  }

  /**
   * Inicia el Story Map directamente sin pantalla de intro
   */
  async iniciarStoryMapDirecto() {
    //console.log('▶️ Iniciando navegación de capítulos directamente');

    // Ya no estamos en intro
    this.enIntro = false;

    // Inicializar todos los capítulos
    await this.inicializarCapitulos();

    // Activar primer capítulo
    this.activarCapitulo(1);
  }

  /**
   * Inicializa todos los capítulos (carga mapas y gráficos)
   */
  async inicializarCapitulos() {
    // console.log('📦 Inicializando todos los capítulos...');

    // Inicializar solo capítulos principales (no sub-capítulos)
    // Los sub-capítulos se inicializan dinámicamente cuando se visitan
    const capitulosPrincipales = this.config.capitulos.filter(cap => !cap.esSubcapitulo);

    for (const capitulo of capitulosPrincipales) {
      await this.inicializarCapitulo(capitulo.numero);
    }

    // console.log(`✅ ${capitulosPrincipales.length} capítulos principales inicializados`);
  }


  /**
   * Inicializa todos los capítulos (mapas y gráficos)
   */
   async inicializarCapitulo(numero) {
    const capitulo = this.config.capitulos.find(cap => cap.numero === numero);
    if (!capitulo) {
      // console.warn(`⚠️ Capítulo ${numero} no encontrado en configuración`);
      return;
    }

    const mapElementId = `map-${numero}`;

    try {
      // console.log(`📦 Inicializando capítulo ${numero}...`);

      // ✅ Crear mapa usando el método correcto
      this.mapManager.inicializarMapaCapitulo(
        mapElementId,
        capitulo,
        numero
      );

      // ✅ Configurar hover para municipios en capítulo 1
      if (numero === 1) {
        const mapaId = `cap-${numero}`;
        setTimeout(() => {
          this.mapManager.configurarHoverMunicipios(mapaId, mapElementId);
        }, 500);
      }

      // ⬇️ Verificar si el capítulo tiene swipe habilitado
      if (capitulo.mapa.swipe && capitulo.mapa.swipe.enabled) {
        // console.log(`🔀 Configurando swipe para capítulo ${numero}`);
        
        const capaIzquierda = capitulo.mapa.swipe.capaIzquierda;
        const capaDerecha = capitulo.mapa.swipe.capaDerecha;
        const mapaId = `cap-${numero}`;
        
        // Pequeño delay para que las capas se carguen antes de configurar swipe
        setTimeout(() => {
          const swipeConfigurado = this.mapManager.configurarSwipe(
            mapaId,
            capaIzquierda,
            capaDerecha
          );
          
          if (swipeConfigurado) {
            // console.log(`✅ Swipe activado: ${capaIzquierda} ↔ ${capaDerecha}`);
          } else {
            // console.warn(`⚠️ No se pudo configurar swipe para capítulo ${numero}`);
          }
        }, 500);
      }

      // Crear gráfico para el capítulo (solo si tiene configuración de gráfico)
      if (capitulo.grafico) {
        const chartElementId = `chart-${numero}`;

        // ✅ Callback para capítulo 1: resaltar municipios al hacer click en gráfico
        const onClickCallback = (numero === 1) ? (categoria) => {
          console.log(`📊 Click en gráfico - Categoría: "${categoria}"`);
          const mapaId = `cap-${numero}`;
          console.log(`🗺️ Llamando a resaltarMunicipiosPorCategoria con mapaId: ${mapaId}`);
          this.mapManager.resaltarMunicipiosPorCategoria(mapaId, categoria);
        } : null;

        // ✅ AHORA PASAMOS LOS PARÁMETROS CORRECTOS:
        // - canvasId: el ID del elemento canvas en el DOM
        // - graficoConfig: el objeto completo capitulo.grafico
        // - numeroCapitulo: el número del capítulo
        // - onClickCallback: función para manejar clicks (solo capítulo 1)
        await this.chartManager.crearGrafico(
          chartElementId,      // ID del canvas
          capitulo.grafico,    // ✅ OBJETO COMPLETO (contiene tipo, datos, config)
          numero,              // Número del capítulo
          onClickCallback      // Callback para click en gráfico
        );
      }

      // console.log(`✅ Capítulo ${numero} inicializado correctamente`);
    } catch (error) {
      console.error(`❌ Error al inicializar capítulo ${numero}:`, error);
    }
  }

  /**
   * Configura la navegación de sub-capítulos de biodiversidad
   */
  configurarNavegacionSubcapitulos() {
    // Botones del menú de biodiversidad (Capítulo 2)
    const menuCards = document.querySelectorAll('.biodiversity-menu .menu-card');
    menuCards.forEach(card => {
      card.addEventListener('click', () => {
        const subcapitulo = card.dataset.subcapitulo;
        this.mostrarSubcapitulo(subcapitulo);
      });
    });

    // Botones "Volver" en cada sub-capítulo
    const backButtons = document.querySelectorAll('.back-button[data-action="back-to-biodiversity"]');
    backButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Obtener el capítulo padre del botón (si existe)
        const parentChapter = button.dataset.parentChapter;
        if (parentChapter) {
          this.volverACapituloPadre(parseInt(parentChapter));
        } else {
          // Por defecto, volver al capítulo 2 (para compatibilidad)
          this.volverABiodiversidad();
        }
      });
    });

    // Navegación entre sub-capítulos (botones horizontales)
    const navItems = document.querySelectorAll('.subchapter-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const subcapitulo = item.dataset.subcapitulo;
        this.mostrarSubcapitulo(subcapitulo);
      });
    });

    // Event listeners para el menú de modelos climáticos (Capítulo 3)
    const modelItems = document.querySelectorAll('.model-item');
    modelItems.forEach(item => {
      item.addEventListener('click', () => {
        this.cambiarModeloClimatico(item);
      });
    });
  }

  /**
   * Muestra un sub-capítulo específico (2.1 - 2.8)
   */
  async mostrarSubcapitulo(subcapitulo) {
    //console.log(`🔍 Mostrando sub-capítulo: ${subcapitulo}`);

    // Convertir "2.1" a "2-1" para el ID del elemento
    const subcapituloId = subcapitulo.replace('.', '-');

    // Ocultar el Capítulo 2 principal
    const chapter2 = document.getElementById('chapter-2');
    if (chapter2) {
      chapter2.style.display = 'none';
    }

    // Ocultar todos los sub-capítulos
    const todosSubcapitulos = document.querySelectorAll('.subchapter-biodiversity');
    todosSubcapitulos.forEach(sub => {
      sub.style.display = 'none';
    });

    // Mostrar el sub-capítulo seleccionado
    const subcapituloElement = document.getElementById(`chapter-${subcapituloId}`);
    if (!subcapituloElement) {
      console.error(`❌ No se encontró el sub-capítulo: chapter-${subcapituloId}`);
      return;
    }

    subcapituloElement.style.display = 'grid';
    //console.log(`✅ Sub-capítulo ${subcapitulo} mostrado`);

    // Actualizar estado activo en los botones de navegación
    const navItems = subcapituloElement.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.subcapitulo === subcapitulo) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Inicializar el mapa del sub-capítulo si no está inicializado
    const numeroSubcapitulo = parseFloat(subcapitulo);
    const capitulo = this.config.capitulos.find(cap => cap.numero === numeroSubcapitulo);

    if (capitulo) {
      const mapElementId = `map-${subcapituloId}`;  // Usar ID con guion
      const mapaId = `cap-${subcapituloId}`;         // Usar ID con guion

      // Verificar si el mapa ya existe
      if (!this.mapManager.mapas[mapaId]) {
        //console.log(`📦 Inicializando mapa para sub-capítulo ${subcapitulo}`);
        // Inicializar el mapa del sub-capítulo
        this.mapManager.inicializarMapaCapitulo(
          mapElementId,
          capitulo,
          numeroSubcapitulo
        );

        // Actualizar tamaño del mapa después de un breve delay
        setTimeout(() => {
          this.mapManager.actualizarTamano(mapaId);
        }, 300);
      } else {
        // Si ya existe, solo actualizar tamaño
        setTimeout(() => {
          this.mapManager.actualizarTamano(mapaId);
        }, 100);
      }
    }

    // Scroll al inicio del sub-capítulo
    subcapituloElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /**
   * Vuelve al Capítulo 2 principal (Biodiversidad)
   */
  volverABiodiversidad() {
    // Ocultar todos los sub-capítulos
    const todosSubcapitulos = document.querySelectorAll('.subchapter-biodiversity');
    todosSubcapitulos.forEach(sub => {
      sub.style.display = 'none';
    });

    // Mostrar el Capítulo 2 principal
    const chapter2 = document.getElementById('chapter-2');
    if (chapter2) {
      chapter2.style.display = 'grid';

      // Scroll al Capítulo 2
      chapter2.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Actualizar el tamaño del mapa del Capítulo 2
      setTimeout(() => {
        this.mapManager.actualizarTamano('cap-2');
      }, 300);

      // Actualizar estado del capítulo actual
      this.capituloActual = 2;
      this.activarCapitulo(2);
    }
  }

  /**
   * Vuelve al capítulo padre especificado (genérico para capítulos 2, 3, 4, etc.)
   */
  volverACapituloPadre(numeroCapitulo) {
    // Ocultar todos los sub-capítulos
    const todosSubcapitulos = document.querySelectorAll('.subchapter-biodiversity');
    todosSubcapitulos.forEach(sub => {
      sub.style.display = 'none';
    });

    // Mostrar el capítulo padre especificado
    const chapterId = `chapter-${numeroCapitulo}`;
    const chapter = document.getElementById(chapterId);
    if (chapter) {
      chapter.style.display = 'grid';

      // Scroll al capítulo
      chapter.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      // Actualizar el tamaño del mapa si el capítulo tiene mapa
      setTimeout(() => {
        const mapaId = `cap-${numeroCapitulo}`;
        if (this.mapManager.mapas[mapaId]) {
          this.mapManager.actualizarTamano(mapaId);
        }
      }, 300);

      // Actualizar estado del capítulo actual
      this.capituloActual = numeroCapitulo;
      this.activarCapitulo(numeroCapitulo);
    }
  }

  /**
   * Cambia el modelo climático seleccionado y actualiza las capas del mapa
   */
  cambiarModeloClimatico(modelButton) {
    // Obtener el modelo y subcapítulo
    const modelo = modelButton.dataset.model;
    const subcapitulo = modelButton.dataset.subcapitulo;

    //console.log(`🌡️ Cambiando modelo climático: ${modelo} en subcapítulo ${subcapitulo}`);

    // Remover clase active de todos los modelos del mismo subcapítulo
    const todosModelos = modelButton.parentElement.querySelectorAll('.model-item');
    todosModelos.forEach(item => item.classList.remove('active'));

    // Agregar clase active al modelo seleccionado
    modelButton.classList.add('active');

    // Buscar la configuración del capítulo en el config
    const subcapituloId = subcapitulo.replace('.', '-');
    const capituloConfig = this.config.capitulos.find(cap => cap.id === `cap-${subcapituloId}`);

    if (!capituloConfig) {
      console.error(`❌ No se encontró configuración para subcapítulo: ${subcapitulo}`);
      return;
    }

    // Verificar si el capítulo tiene configuración de modelos climáticos
    if (!capituloConfig.modelosClimaticos || !capituloConfig.modelosClimaticos[modelo]) {
      console.warn(`⚠️ No hay configuración de capas para el modelo: ${modelo}`);
      return;
    }

    // Obtener las capas del modelo seleccionado
    const capasDelModelo = capituloConfig.modelosClimaticos[modelo].capas;

    if (!capasDelModelo || capasDelModelo.length === 0) {
      console.warn(`⚠️ El modelo ${modelo} no tiene capas configuradas`);
      return;
    }

    // Actualizar las capas del mapa
    const mapaId = `cap-${subcapituloId}`;
    const resultado = this.mapManager.actualizarCapasMapa(mapaId, capasDelModelo);

    if (resultado) {
      //console.log(`✅ Modelo ${modelo} activado con ${capasDelModelo.length} capas en subcapítulo ${subcapitulo}`);

      // Si estamos en un subcapítulo del Capítulo 3 o 4, inicializar comparación automáticamente
      const numeroCapitulo = Math.floor(parseFloat(subcapitulo));
      if (numeroCapitulo === 3 || numeroCapitulo === 4) {
        const mapElementId = `map-${subcapituloId}`;
        setTimeout(() => {
          const inicializado = this.mapManager.inicializarComparacion(mapaId, mapElementId);
          if (inicializado) {
            //console.log(`🔍 Control de comparación disponible para ${subcapitulo}`);
          }
        }, 500); // Pequeño delay para asegurar que las capas estén cargadas
      }
    } else {
      console.error(`❌ Error al actualizar capas del modelo ${modelo}`);
    }
  }

  /**
   * Navega a un capítulo específico
   */
  navegarCapitulo(numeroCapitulo) {
    // Validar rango
    if (numeroCapitulo < 1 || numeroCapitulo > this.totalCapitulos) {
      return;
    }

    // Si estamos navegando al Capítulo 2, asegurarse de que esté visible
    // (en caso de que estemos viendo un sub-capítulo)
    if (numeroCapitulo === 2) {
      this.volverABiodiversidad();
      return; // volverABiodiversidad() ya hace el scroll y actualiza el estado
    }

    // Para otros capítulos, ocultar sub-capítulos si están visibles
    if (numeroCapitulo !== 2) {
      const todosSubcapitulos = document.querySelectorAll('.subchapter-biodiversity');
      todosSubcapitulos.forEach(sub => {
        sub.style.display = 'none';
      });

      // Asegurarse de que el Capítulo 2 también esté oculto si navegamos a otro capítulo
      const chapter2 = document.getElementById('chapter-2');
      if (chapter2) {
        chapter2.style.display = 'grid';
      }
    }

    // Scroll suave al capítulo
    const capituloElement = document.getElementById(`chapter-${numeroCapitulo}`);
    if (capituloElement) {
      capituloElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    // Actualizar estado
    this.capituloActual = numeroCapitulo;
    this.activarCapitulo(numeroCapitulo);
  }

  /**
   * Activa visualmente un capítulo (timeline y botones)
   */
  activarCapitulo(numeroCapitulo) {
    // Actualizar timeline
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
      const itemNumero = parseInt(item.dataset.chapter);
      if (itemNumero === numeroCapitulo) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Actualizar botones de navegación
    this.elementos.btnPrev.disabled = (numeroCapitulo === 1);
    this.elementos.btnNext.disabled = (numeroCapitulo === this.totalCapitulos);

    // Actualizar tamaño de mapas (importante para renderizado correcto)
    setTimeout(() => {
      this.mapManager.actualizarTamano(`cap-${numeroCapitulo}`);
    }, 300);

    //console.log(`📍 Capítulo ${numeroCapitulo} activado`);
  }

  /**
   * Detecta qué capítulo está visible actualmente
   */
  detectarCapituloVisible() {
    // Solo considerar capítulos visibles (no ocultos con display: none)
    const chapters = document.querySelectorAll('.chapter');
    const containerRect = this.elementos.chaptersContainer.getBoundingClientRect();

    chapters.forEach((chapter) => {
      // Ignorar capítulos ocultos (sub-capítulos no activos)
      if (chapter.style.display === 'none') {
        return;
      }

      const chapterRect = chapter.getBoundingClientRect();
      const chapterTop = chapterRect.top - containerRect.top;
      const chapterBottom = chapterRect.bottom - containerRect.top;

      // Si el capítulo está más del 50% visible
      if (chapterTop < containerRect.height / 2 && chapterBottom > containerRect.height / 2) {
        const numeroCapituloStr = chapter.dataset.chapter;
        const numeroCapitulo = parseInt(numeroCapituloStr);

        // Solo actualizar si es un capítulo principal (número entero)
        if (Number.isInteger(numeroCapitulo) && numeroCapitulo !== this.capituloActual) {
          this.capituloActual = numeroCapitulo;
          this.activarCapitulo(numeroCapitulo);
        }
      }
    });
  }

  /**
   * Configura Intersection Observer para animaciones
   */
  configurarIntersectionObserver() {
    const observerOptions = {
      root: this.elementos.chaptersContainer,
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numeroCapitulo = parseInt(entry.target.dataset.chapter);
          
          // Actualizar tamaño del mapa cuando entra en vista
          this.mapManager.actualizarTamano(`cap-${numeroCapitulo}`);
        }
      });
    }, observerOptions);

    // Observar todos los capítulos
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach(chapter => observer.observe(chapter));
  }

  /**
   * Limpia recursos cuando se destruye la aplicación
   */
  destruir() {
    //console.log('🧹 Limpiando recursos...');
    
    // Destruir gráficos
    this.chartManager.destruirTodos();
    
    // Limpiar mapas
    Object.keys(this.mapManager.mapas).forEach(mapaId => {
      this.mapManager.limpiarMapa(mapaId);
    });

    //console.log('✅ Recursos limpiados');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  //console.log('🌍 Iniciando aplicación Story Map');
  
  try {
    // Crear instancia de la aplicación
    window.storyMapApp = new StoryMapApp(storyMapConfig);
  } catch (error) {
    console.error('❌ Error fatal al iniciar aplicación:', error);
    
    // Mostrar mensaje de error al usuario
    const container = document.querySelector('.story-map-container');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 2rem;
          text-align: center;
        ">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Error al cargar Story Map</h1>
          <p style="color: #666; max-width: 600px;">
            Ha ocurrido un error al inicializar la aplicación. 
            Por favor, verifica que el servidor proxy esté corriendo y que GeoServer esté disponible.
          </p>
          <button 
            onclick="location.reload()" 
            style="
              margin-top: 2rem;
              padding: 1rem 2rem;
              background-color: #2563eb;
              color: white;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Reintentar
          </button>
        </div>
      `;
    }
  }
});

// Limpiar recursos cuando se cierra la página
window.addEventListener('beforeunload', () => {
  if (window.storyMapApp) {
    window.storyMapApp.destruir();
  }
});