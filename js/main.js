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
      storyIntro: document.getElementById('storyIntro'),
      chaptersContainer: document.getElementById('chaptersContainer'),
      timeline: document.getElementById('timeline'),
      navButtonsLeft: document.getElementById('navButtonsLeft'),
      navButtonsRight: document.getElementById('navButtonsRight'),
      btnStart: document.getElementById('btnStart'),
      btnPrev: document.getElementById('btnPrev'),
      btnNext: document.getElementById('btnNext')
    };

    this.inicializar();
  }

  /**
   * Inicializa la aplicación
   */
  async inicializar() {
    console.log('🚀 Iniciando Story Map:', this.config.titulo);

    try {
      // Inicializar mapa de intro
      await this.inicializarMapaIntro();

      // Configurar eventos
      this.configurarEventos();

      console.log('✅ Story Map inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Story Map:', error);
    }
  }

  /**
   * Inicializa el mapa de la pantalla inicial
   */
  async inicializarMapaIntro() {
    try {
      this.mapManager.inicializarMapaIntro('introMap');
      console.log('📍 Mapa de introducción creado');
    } catch (error) {
      console.error('Error al crear mapa de intro:', error);
    }
  }

  /**
   * Configura todos los event listeners
   */
  configurarEventos() {
    // Botón Iniciar
    this.elementos.btnStart.addEventListener('click', () => {
      this.iniciarStoryMap();
    });

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
   * Inicia el Story Map (oculta intro, muestra capítulos)
   */
  async iniciarStoryMap() {
    console.log('▶️ Iniciando navegación de capítulos');

    // Ocultar intro
    this.elementos.storyIntro.style.display = 'none';

    // Mostrar contenedor de capítulos
    this.elementos.chaptersContainer.style.display = 'block';

    // Mostrar timeline y botones
    this.elementos.timeline.style.display = 'flex';
    this.elementos.navButtonsLeft.style.display = 'flex';
    this.elementos.navButtonsRight.style.display = 'flex';

    // Ya no estamos en intro
    this.enIntro = false;

    // Inicializar todos los capítulos
    await this.inicializarCapitulos();

    // Activar primer capítulo
    this.activarCapitulo(1);
  }

  /**
   * Inicializa todos los capítulos (mapas y gráficos)
   */
  async inicializarCapitulos() {
    console.log('📚 Inicializando capítulos...');

    const promesas = this.config.capitulos.map(async (capitulo, index) => {
      const numeroCapitulo = index + 1;
      
      try {
        // Inicializar mapa del capítulo
        const mapContainerId = `map-${numeroCapitulo}`;
        this.mapManager.inicializarMapaCapitulo(
          mapContainerId, 
          capitulo, 
          numeroCapitulo
        );
        
        console.log(`✅ Mapa capítulo ${numeroCapitulo} creado`);

        // Inicializar gráfico del capítulo
        const chartCanvasId = `chart-${numeroCapitulo}`;
        await this.chartManager.crearGrafico(
          chartCanvasId, 
          capitulo.grafico, 
          numeroCapitulo
        );
        
        console.log(`📊 Gráfico capítulo ${numeroCapitulo} creado`);
      } catch (error) {
        console.error(`Error al inicializar capítulo ${numeroCapitulo}:`, error);
      }
    });

    await Promise.all(promesas);
    console.log('✅ Todos los capítulos inicializados');
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

    console.log(`📍 Capítulo ${numeroCapitulo} activado`);
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
    console.log('🧹 Limpiando recursos...');
    
    // Destruir gráficos
    this.chartManager.destruirTodos();
    
    // Limpiar mapas
    Object.keys(this.mapManager.mapas).forEach(mapaId => {
      this.mapManager.limpiarMapa(mapaId);
    });

    console.log('✅ Recursos limpiados');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌍 Iniciando aplicación Story Map');
  
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