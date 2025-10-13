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
    console.log('📦 Inicializando todos los capítulos...');
    
    // Inicializar cada capítulo
    for (let i = 1; i <= this.totalCapitulos; i++) {
      await this.inicializarCapitulo(i);
    }
    
    console.log(`✅ ${this.totalCapitulos} capítulos inicializados`);
  }


  /**
   * Inicializa todos los capítulos (mapas y gráficos)
   */
   async inicializarCapitulo(numero) {
    const capitulo = this.config.capitulos.find(cap => cap.numero === numero);
    if (!capitulo) {
      console.warn(`⚠️ Capítulo ${numero} no encontrado en configuración`);
      return;
    }

    const mapElementId = `map-${numero}`;

    try {
      console.log(`📦 Inicializando capítulo ${numero}...`);

      // ✅ Crear mapa usando el método correcto
      this.mapManager.inicializarMapaCapitulo(
        mapElementId,
        capitulo,
        numero
      );

      // ⬇️ Verificar si el capítulo tiene swipe habilitado
      if (capitulo.mapa.swipe && capitulo.mapa.swipe.enabled) {
        console.log(`🔀 Configurando swipe para capítulo ${numero}`);
        
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
            console.log(`✅ Swipe activado: ${capaIzquierda} ↔ ${capaDerecha}`);
          } else {
            console.warn(`⚠️ No se pudo configurar swipe para capítulo ${numero}`);
          }
        }, 500);
      }

      // Crear gráfico para el capítulo
    const chartElementId = `chart-${numero}`;
    
    // ✅ AHORA PASAMOS LOS PARÁMETROS CORRECTOS:
    // - canvasId: el ID del elemento canvas en el DOM
    // - graficoConfig: el objeto completo capitulo.grafico
    // - numeroCapitulo: el número del capítulo
    await this.chartManager.crearGrafico(
      chartElementId,      // ID del canvas
      capitulo.grafico,    // ✅ OBJETO COMPLETO (contiene tipo, datos, config)
      numero               // Número del capítulo
    );

      console.log(`✅ Capítulo ${numero} inicializado correctamente`);
    } catch (error) {
      console.error(`❌ Error al inicializar capítulo ${numero}:`, error);
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
    const chapters = document.querySelectorAll('.chapter');
    const containerRect = this.elementos.chaptersContainer.getBoundingClientRect();
    
    chapters.forEach((chapter, index) => {
      const chapterRect = chapter.getBoundingClientRect();
      const chapterTop = chapterRect.top - containerRect.top;
      const chapterBottom = chapterRect.bottom - containerRect.top;
      
      // Si el capítulo está más del 50% visible
      if (chapterTop < containerRect.height / 2 && chapterBottom > containerRect.height / 2) {
        const numeroCapitulo = index + 1;
        if (numeroCapitulo !== this.capituloActual) {
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