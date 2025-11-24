
import { storyMapConfig } from "./config/vulnerabilidad-config.js";
import { MapManager } from "./managers/MapManager.js";
import { ChartManager } from "./managers/ChartManager.js";

/**
 * Aplicación principal del Story Map
 * Gestiona la navegación entre capítulos, mapas y gráficos
 */
class StoryMapApp {
  constructor(config) {
    this.config = config;
    this.mapManager = new MapManager(config);
    this.chartManager = new ChartManager();
    this.capituloActual = 1;
    this.totalCapitulos = config.capitulos.length;
    this.enIntro = true;

    this.elementos = {
      chaptersContainer: document.getElementById("chaptersContainer"),
      timeline: document.getElementById("timeline"),
      navButtonsLeft: document.getElementById("navButtonsLeft"),
      navButtonsRight: document.getElementById("navButtonsRight"),
      btnPrev: document.getElementById("btnPrev"),
      btnNext: document.getElementById("btnNext"),
    };

    this.inicializar();
  }

  /**
   * Inicializa la aplicación
   */
  async inicializar() {
    try {
      this.configurarEventos();

      await this.iniciarStoryMapDirecto();
    } catch (error) {
    }
  }

  /**
   * Configura los eventos de navegación y controles
   */
  configurarEventos() {
    this.elementos.btnPrev.addEventListener("click", () => {
      this.navegarCapitulo(this.capituloActual - 1);
    });

    this.elementos.btnNext.addEventListener("click", () => {
      this.navegarCapitulo(this.capituloActual + 1);
    });

    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => {
      item.addEventListener("click", () => {
        const numeroCapitulo = parseInt(item.dataset.chapter);
        this.navegarCapitulo(numeroCapitulo);
      });
    });

    document.addEventListener("keydown", (e) => {
      if (this.enIntro) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        this.navegarCapitulo(this.capituloActual - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        this.navegarCapitulo(this.capituloActual + 1);
      }
    });

    this.elementos.chaptersContainer.addEventListener("scroll", () => {
      this.detectarCapituloVisible();
    });

    this.configurarIntersectionObserver();

    this.configurarNavegacionSubcapitulos();
  }

  /**
   * Inicia el Story Map en modo directo
   */
  async iniciarStoryMapDirecto() {
    this.enIntro = false;

    await this.inicializarCapitulos();

    this.activarCapitulo(1);
  }

  /**
   * Inicializa todos los capítulos principales
   */
  async inicializarCapitulos() {
    const capitulosPrincipales = this.config.capitulos.filter(
      (cap) => !cap.esSubcapitulo
    );

    for (const capitulo of capitulosPrincipales) {
      await this.inicializarCapitulo(capitulo.numero);
    }
  }

  /**
   * Inicializa un capítulo específico con su mapa y gráfico
   * @param {number} numero - Número del capítulo
   */
  async inicializarCapitulo(numero) {
    const capitulo = this.config.capitulos.find((cap) => cap.numero === numero);
    if (!capitulo) {
      return;
    }

    const mapElementId = `map-${numero}`;

    try {
      this.mapManager.inicializarMapaCapitulo(mapElementId, capitulo, numero);

      if (numero === 1) {
        const mapaId = `cap-${numero}`;
        setTimeout(() => {
          this.mapManager.configurarHoverMunicipios(mapaId, mapElementId);
        }, 500);
      }

      if (capitulo.mapa.swipe && capitulo.mapa.swipe.enabled) {
        const capaIzquierda = capitulo.mapa.swipe.capaIzquierda;
        const capaDerecha = capitulo.mapa.swipe.capaDerecha;
        const mapaId = `cap-${numero}`;

        setTimeout(() => {
          const swipeConfigurado = this.mapManager.configurarSwipe(
            mapaId,
            capaIzquierda,
            capaDerecha
          );
        }, 500);
      }

      if (capitulo.grafico) {
        const chartElementId = `chart-${numero}`;

        const onClickCallback =
          numero === 1
            ? (categoria) => {
                const mapaId = `cap-${numero}`;
                this.mapManager.resaltarMunicipiosPorCategoria(
                  mapaId,
                  categoria
                );
              }
            : null;

        await this.chartManager.crearGrafico(
          chartElementId,
          capitulo.grafico,
          numero,
          onClickCallback
        );
      }
    } catch (error) {
      console.error(`Error al inicializar capítulo ${numero}:`, error);
    }
  }

  /**
   * Configura la navegación de subcapítulos y modelos climáticos
   */
  configurarNavegacionSubcapitulos() {
    const menuCards = document.querySelectorAll(
      ".biodiversity-menu .menu-card"
    );
    menuCards.forEach((card) => {
      card.addEventListener("click", () => {
        const subcapitulo = card.dataset.subcapitulo;
        this.mostrarSubcapitulo(subcapitulo);
      });
    });

    const backButtons = document.querySelectorAll(
      '.back-button[data-action="back-to-biodiversity"]'
    );
    backButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const parentChapter = button.dataset.parentChapter;
        if (parentChapter) {
          this.volverACapituloPadre(parseInt(parentChapter));
        } else {
          this.volverABiodiversidad();
        }
      });
    });

    const navItems = document.querySelectorAll(".subchapter-nav .nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const subcapitulo = item.dataset.subcapitulo;
        this.mostrarSubcapitulo(subcapitulo);
      });
    });

    const modelItems = document.querySelectorAll(".model-item");
    modelItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.cambiarModeloClimatico(item);
      });
    });
  }

  /**
   * Muestra un subcapítulo específico
   * @param {string} subcapitulo - ID del subcapítulo
   */
  async mostrarSubcapitulo(subcapitulo) {
    const subcapituloId = subcapitulo.replace(".", "-");

    const chapter2 = document.getElementById("chapter-2");
    if (chapter2) {
      chapter2.style.display = "none";
    }

    const todosSubcapitulos = document.querySelectorAll(
      ".subchapter-biodiversity"
    );
    todosSubcapitulos.forEach((sub) => {
      sub.style.display = "none";
    });

    const subcapituloElement = document.getElementById(
      `chapter-${subcapituloId}`
    );
    if (!subcapituloElement) {
      console.error(`No se encontró el sub-capítulo: chapter-${subcapituloId}`);
      return;
    }

    subcapituloElement.style.display = "grid";

    const navItems = subcapituloElement.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      if (item.dataset.subcapitulo === subcapitulo) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    const numeroSubcapitulo = parseFloat(subcapitulo);
    const capitulo = this.config.capitulos.find(
      (cap) => cap.numero === numeroSubcapitulo
    );

    if (capitulo) {
      const mapElementId = `map-${subcapituloId}`;
      const mapaId = `cap-${subcapituloId}`;

      if (!this.mapManager.mapas[mapaId]) {
        this.mapManager.inicializarMapaCapitulo(
          mapElementId,
          capitulo,
          numeroSubcapitulo
        );

        setTimeout(() => {
          this.mapManager.actualizarTamano(mapaId);
        }, 300);
      } else {
        setTimeout(() => {
          this.mapManager.actualizarTamano(mapaId);
        }, 100);
      }
    }

    subcapituloElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /**
   * Regresa al capítulo principal de Biodiversidad
   */
  volverABiodiversidad() {
    const todosSubcapitulos = document.querySelectorAll(
      ".subchapter-biodiversity"
    );
    todosSubcapitulos.forEach((sub) => {
      sub.style.display = "none";
    });

    const chapter2 = document.getElementById("chapter-2");
    if (chapter2) {
      chapter2.style.display = "grid";

      chapter2.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        this.mapManager.actualizarTamano("cap-2");
      }, 300);

      this.capituloActual = 2;
      this.activarCapitulo(2);
    }
  }

  /**
   * Regresa al capítulo padre desde un subcapítulo
   * @param {number} numeroCapitulo - Número del capítulo padre
   */
  volverACapituloPadre(numeroCapitulo) {
    const todosSubcapitulos = document.querySelectorAll(
      ".subchapter-biodiversity"
    );
    todosSubcapitulos.forEach((sub) => {
      sub.style.display = "none";
    });

    const chapterId = `chapter-${numeroCapitulo}`;
    const chapter = document.getElementById(chapterId);
    if (chapter) {
      chapter.style.display = "grid";

      chapter.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        const mapaId = `cap-${numeroCapitulo}`;
        if (this.mapManager.mapas[mapaId]) {
          this.mapManager.actualizarTamano(mapaId);
        }
      }, 300);

      this.capituloActual = numeroCapitulo;
      this.activarCapitulo(numeroCapitulo);
    }
  }

  /**
   * Cambia el modelo climático en un subcapítulo
   * @param {HTMLElement} modelButton - Botón del modelo seleccionado
   */
  cambiarModeloClimatico(modelButton) {
    const modelo = modelButton.dataset.model;
    const subcapitulo = modelButton.dataset.subcapitulo;

    const todosModelos =
      modelButton.parentElement.querySelectorAll(".model-item");
    todosModelos.forEach((item) => item.classList.remove("active"));

    modelButton.classList.add("active");

    const subcapituloId = subcapitulo.replace(".", "-");
    const capituloConfig = this.config.capitulos.find(
      (cap) => cap.id === `cap-${subcapituloId}`
    );

    if (!capituloConfig) {
      console.error(
        `No se encontró configuración para subcapítulo: ${subcapitulo}`
      );
      return;
    }

    if (
      !capituloConfig.modelosClimaticos ||
      !capituloConfig.modelosClimaticos[modelo]
    ) {
      console.warn(`No hay configuración de capas para el modelo: ${modelo}`);
      return;
    }

    const capasDelModelo = capituloConfig.modelosClimaticos[modelo].capas;

    if (!capasDelModelo || capasDelModelo.length === 0) {
      console.warn(`El modelo ${modelo} no tiene capas configuradas`);
      return;
    }

    const mapaId = `cap-${subcapituloId}`;
    const resultado = this.mapManager.actualizarCapasMapa(
      mapaId,
      capasDelModelo
    );

    if (resultado) {
      const numeroCapitulo = Math.floor(parseFloat(subcapitulo));
      if (numeroCapitulo === 3 || numeroCapitulo === 4) {
        const mapElementId = `map-${subcapituloId}`;
        setTimeout(() => {
          const inicializado = this.mapManager.inicializarComparacion(
            mapaId,
            mapElementId
          );

          this.mapManager.configurarHoverMunicipios(mapaId, mapElementId);
        }, 500);
      }
    } else {
      console.error(`Error al actualizar capas del modelo ${modelo}`);
    }
  }

  /**
   * Navega a un capítulo específico
   * @param {number} numeroCapitulo - Número del capítulo
   */
  navegarCapitulo(numeroCapitulo) {
    if (numeroCapitulo < 1 || numeroCapitulo > this.totalCapitulos) {
      return;
    }

    if (numeroCapitulo === 2) {
      this.volverABiodiversidad();
      return;
    }

    if (numeroCapitulo !== 2) {
      const todosSubcapitulos = document.querySelectorAll(
        ".subchapter-biodiversity"
      );
      todosSubcapitulos.forEach((sub) => {
        sub.style.display = "none";
      });

      const chapter2 = document.getElementById("chapter-2");
      if (chapter2) {
        chapter2.style.display = "grid";
      }
    }

    const capituloElement = document.getElementById(
      `chapter-${numeroCapitulo}`
    );
    if (capituloElement) {
      capituloElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    this.capituloActual = numeroCapitulo;
    this.activarCapitulo(numeroCapitulo);
  }

  /**
   * Activa un capítulo en el timeline
   * @param {number} numeroCapitulo - Número del capítulo
   */
  activarCapitulo(numeroCapitulo) {
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => {
      const itemNumero = parseInt(item.dataset.chapter);
      if (itemNumero === numeroCapitulo) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    this.elementos.btnPrev.disabled = numeroCapitulo === 1;
    this.elementos.btnNext.disabled = numeroCapitulo === this.totalCapitulos;

    setTimeout(() => {
      this.mapManager.actualizarTamano(`cap-${numeroCapitulo}`);
    }, 300);
  }

  /**
   * Detecta qué capítulo está visible en el scroll
   */
  detectarCapituloVisible() {
    const chapters = document.querySelectorAll(".chapter");
    const containerRect =
      this.elementos.chaptersContainer.getBoundingClientRect();

    chapters.forEach((chapter) => {
      if (chapter.style.display === "none") {
        return;
      }

      const chapterRect = chapter.getBoundingClientRect();
      const chapterTop = chapterRect.top - containerRect.top;
      const chapterBottom = chapterRect.bottom - containerRect.top;

      if (
        chapterTop < containerRect.height / 2 &&
        chapterBottom > containerRect.height / 2
      ) {
        const numeroCapituloStr = chapter.dataset.chapter;
        const numeroCapitulo = parseInt(numeroCapituloStr);

        if (
          Number.isInteger(numeroCapitulo) &&
          numeroCapitulo !== this.capituloActual
        ) {
          this.capituloActual = numeroCapitulo;
          this.activarCapitulo(numeroCapitulo);
        }
      }
    });
  }

  /**
   * Configura el observer para actualizar mapas cuando están visibles
   */
  configurarIntersectionObserver() {
    const observerOptions = {
      root: this.elementos.chaptersContainer,
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const numeroCapitulo = parseInt(entry.target.dataset.chapter);

          this.mapManager.actualizarTamano(`cap-${numeroCapitulo}`);
        }
      });
    }, observerOptions);

    const chapters = document.querySelectorAll(".chapter");
    chapters.forEach((chapter) => observer.observe(chapter));
  }

  /**
   * Destruye la aplicación y libera recursos
   */
  destruir() {
    this.chartManager.destruirTodos();

    Object.keys(this.mapManager.mapas).forEach((mapaId) => {
      this.mapManager.limpiarMapa(mapaId);
    });
  }
}

// ============================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  try {
    window.storyMapApp = new StoryMapApp(storyMapConfig);
  } catch (error) {
    console.error("Error fatal al iniciar aplicación:", error);

    const container = document.querySelector(".story-map-container");
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

window.addEventListener("beforeunload", () => {
  if (window.storyMapApp) {
    window.storyMapApp.destruir();
  }
});
