# Atlas de Cambio Climático - Tlaxcala

Aplicación web interactiva para visualizar información sobre cambio climático en el estado de Tlaxcala mediante Story Maps navegables.

---

## Índice

1. [Descripción General](#descripción-general)
2. [Secciones de la Aplicación](#secciones-de-la-aplicación)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Guía: Agregar un Capítulo Nuevo](#guía-agregar-un-capítulo-nuevo)
5. [Guía: Agregar Capas desde GeoServer](#guía-agregar-capas-desde-geoserver)
6. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)
7. [Estructura de Archivos](#estructura-de-archivos)

---

## Descripción General

Esta plataforma presenta información sobre cambio climático en Tlaxcala a través de **Story Maps** (mapas narrativos). Cada sección contiene **capítulos** que combinan:

- **Mapas interactivos** - Visualización geográfica de datos
- **Gráficas** - Datos estadísticos y tendencias
- **Texto explicativo** - Información contextual
- **Tablas** - Datos numéricos organizados
- **Imágenes** - Mapas estáticos y fotografías

---

## Secciones de la Aplicación

| Sección | Archivo | Descripción | Capítulos |
|---------|---------|-------------|-----------|
| **Inicio** | `index.html` | Página principal con acceso a todas las secciones | - |
| **Vulnerabilidad** | `vulnerabilidad.html` | Índice de vulnerabilidad climática y biodiversidad | 4 |
| **Riesgo** | `riesgo.html` | Riesgo climático y eventos por año | 2 |
| **Amenazas** | `amenazas.html` | Amenazas climáticas (sequía, heladas) | 4 |
| **Impactos** | `impactos.html` | Impactos en agricultura, hidrología, bosques y suelo | 8 |
| **Clima** | `clima.html` | Datos climáticos históricos y tendencias | 6 |
| **Escenarios Climáticos** | `escenarios_clima.html` | Proyecciones de cambio climático | 6 |
| **Acciones Climáticas** | `acciones-climaticas.html` | Mapa de proyectos y programas | 1 (mapa interactivo) |
| **Mitigación** | `mitigacion.html` | Estrategias de mitigación | Variable |

### Descripción detallada de cada sección

#### Vulnerabilidad
- **Capítulo 1:** Índice de vulnerabilidad al cambio climático por municipio
- **Capítulo 2:** Vulnerabilidad de la biodiversidad - Riqueza de especies (9 subcapítulos por grupo taxonómico)
- **Capítulo 3:** Vulnerabilidad de la biodiversidad - Ganancia de idoneidad (8 subcapítulos)
- **Capítulo 4:** Vulnerabilidad de la biodiversidad - Pérdida de idoneidad (8 subcapítulos)

#### Riesgo
- **Capítulo 1:** Riesgo climático por municipio
- **Capítulo 2:** Eventos por año y declaratorias

#### Amenazas
- **Capítulo 1:** Amenazas climáticas por municipio
- **Capítulo 2:** Análisis de amenazas climáticas
- **Capítulo 3:** Amenazas al sector agrícola: Sequía
- **Capítulo 4:** Amenazas al sector agrícola: Helada

#### Impactos
- **Capítulo 1:** Impactos en el sector agrícola
- **Capítulo 2:** Superficie siniestrada por cultivo
- **Capítulo 3:** Hidrología (Adaptación al cambio climático)
- **Capítulo 4:** Hidrología 2
- **Capítulo 5:** Hidrología 3
- **Capítulo 6:** Incendios forestales
- **Capítulo 7:** Plagas y enfermedades forestales
- **Capítulo 8:** Degradación del suelo por erosión hídrica

#### Clima
- **Capítulo 1:** Análisis del clima en Tlaxcala
- **Capítulo 2:** Temperatura media por estación
- **Capítulo 3:** Precipitación total por estación
- **Capítulo 4:** Análisis histórico de temperatura por municipio
- **Capítulo 5:** Tendencias de temperatura
- **Capítulo 6:** Tendencias de precipitación

#### Escenarios Climáticos
- **Capítulo 1:** Clima y escenarios de cambio climático
- **Capítulo 2:** Variables climáticas
- **Capítulo 3:** Escenarios de cambio climático (comparativos)
- **Capítulo 4:** Comparativo de escenarios climáticos
- **Capítulo 5:** Modelos utilizados
- **Capítulo 6:** Otros datos

---

## Instalación y Configuración

### Requisitos

- **Node.js** versión 14 o superior
- **Navegador web** Chrome, Firefox, Edge
- **Editor de texto** Visual Studio Code

### Paso 1: Instalar dependencias

```bash
cd proxy-server
npm install
```

### Paso 2: Iniciar el servidor proxy

```bash
cd proxy-server
npm start
```

El servidor estará en `http://localhost:3011`

### Paso 3: Abrir la aplicación

Abrir `index.html` con Live Server (VS Code) o cualquier servidor web local.

---

## Guía: Agregar un Capítulo Nuevo

### Pasos generales (aplica a todas las secciones)

Agregar un capítulo nuevo requiere **3 pasos**:

1. **Agregar el HTML** del capítulo
2. **Agregar estilos CSS** (si es necesario)
3. **Actualizar el JavaScript** contador de capítulos y timeline

---

### Para: Impactos, Amenazas, Escenarios Climáticos

Estas secciones usan la misma estructura. Ejemplo para **impactos.html**:

#### Paso 1: Agregar HTML

Abrir `impactos.html` y buscar el último capítulo (ejemplo: `chapter-7`).

Agregar el nuevo capítulo **antes** de la etiqueta `</div>` que cierra `chapters-container`:

```html
<!-- CAPITULO 8 - NUEVO CAPITULO -->
<section class="chapter chapter-nuevo" id="chapter-8" data-chapter="8">
  <h2 class="map-title">Título del Nuevo Capítulo</h2>

  <div class="nuevo-content">
    <!-- Lado izquierdo: Mapa o imagen -->
    <div class="nuevo-map-container">
      <img src="images/mi-mapa.png" alt="Descripción" class="mapa-img">
    </div>

    <!-- Lado derecho: Texto explicativo -->
    <div class="nuevo-text-card">
      <h3 class="card-title">Subtítulo</h3>
      <div class="card-content">
        <p>Texto explicativo aquí...</p>
      </div>
    </div>
  </div>
</section>
```

#### Paso 2: Agregar al Timeline

Buscar la sección del timeline y agregar:

```html
<div class="timeline-item" data-chapter="8">
  <div class="timeline-circle">8</div>
  <div class="timeline-label">Nombre Corto</div>
</div>
```

#### Paso 3: Actualizar JavaScript

Abrir `js/config/impactos-main.js` y cambiar:

```javascript
// Antes
const totalChapters = 7;

// Después
const totalChapters = 8;
```

#### Paso 4: Agregar estilos CSS (si es necesario)

Abrir `css/impactos.css` y agregar estilos al final:

```css
/* CAPITULO 8 - NUEVO CAPITULO */
.chapter-nuevo {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 0.5rem;
  padding: 0.5rem;
  height: calc(100vh - 65px) !important;
}

.nuevo-content {
  display: grid;
  grid-template-columns: 65% 35%;
  gap: 0.8rem;
}

/* ... más estilos según necesidad */
```

---

### Para: Vulnerabilidad y Riesgo

Estas secciones usan **archivos de configuración** separados.

#### Paso 1: Agregar configuración de capas

Abrir `js/config/vulnerabilidad-config.js` o `js/config/riesgo-config.js`:

```javascript
capitulos: [
  // ... capítulos existentes ...

  // Nuevo capítulo
  {
    id: 5,
    titulo: 'Nuevo Capítulo',
    mapId: 'map-5',
    capas: [
      {
        nombre: 'Capa Principal',
        tipo: 'wms',
        layer: 'SEICCT:nombre_capa',
        opacity: 1,
        zIndex: 1
      }
    ]
  }
]
```

#### Paso 2: Agregar HTML

Agregar la sección HTML correspondiente con el `id="chapter-5"` y `id="map-5"`.

#### Paso 3: Actualizar contador

En el archivo JavaScript principal, actualizar `totalChapters`.

---

### Para: Acciones Climáticas

Esta sección es diferente. Usa un **mapa interactivo** con datos de una API.

Para modificar:
- **Filtros:** Editar `js/acciones/filters.js`
- **Popup:** Editar `js/acciones/popup.js`
- **Estilos de marcadores:** Editar `js/acciones/map.js`
- **Colores por dependencia:** Editar `js/acciones/config.js`

---

## Guía: Agregar Capas desde GeoServer

### ¿Qué es una capa de GeoServer?

Una **capa** es un conjunto de datos geográficos (municipios, ríos, temperaturas) almacenados en un servidor especializado llamado GeoServer.

### Requisitos previos

1. La capa debe estar publicada en GeoServer
2. Conocer el **nombre completo** de la capa (formato: `WORKSPACE:nombre_capa`)
3. El servidor proxy debe estar funcionando

### Paso 1: Identificar el nombre de la capa

Las capas de este proyecto están en el workspace `SEICCT`. Ejemplos:

| Nombre de capa | Descripción |
|----------------|-------------|
| `SEICCT:Limite` | Límite estatal de Tlaxcala |
| `SEICCT:municipios_ganaperd` | Municipios con datos |
| `SEICCT:temperatura_2020` | Temperatura del año 2020 |

### Paso 2: Agregar la capa al archivo de configuración

Abrir el archivo de configuración correspondiente (ejemplo: `vulnerabilidad-config.js`):

```javascript
capas: [
  // Capa existente
  {
    nombre: 'Límite Estatal',
    tipo: 'wms',
    layer: 'SEICCT:Limite',
    opacity: 1,
    zIndex: 1
  },

  // NUEVA CAPA
  {
    nombre: 'Mi Nueva Capa',      // Nombre para mostrar
    tipo: 'wms',                   // Tipo de servicio
    layer: 'SEICCT:mi_capa',      // Nombre en GeoServer
    opacity: 0.8,                  // Transparencia (0 a 1)
    zIndex: 2                      // Orden de apilamiento
  }
]

```

**Ver video explicativo:** https://youtu.be/mXJkK4rqxVU

### Parámetros de configuración

| Parámetro | Descripción | Valores |
|-----------|-------------|---------|
| `nombre` | Nombre visible para el usuario | Texto libre |
| `tipo` | Tipo de servicio | `wms` (imagen) o `wfs` (vectores) |
| `layer` | Nombre en GeoServer | `WORKSPACE:nombre` |
| `opacity` | Transparencia | `0` (invisible) a `1` (opaco) |
| `zIndex` | Orden de capas | Número mayor = más arriba |
| `visible` | Visibilidad inicial | `true` o `false` |

### Paso 3: Verificar que funciona

1. Guardar los cambios
2. Recargar la página en el navegador
3. Navegar al capítulo correspondiente
4. La capa debería aparecer en el mapa

### Solución de problemas comunes

**La capa no aparece:**
- Verificar que el nombre de la capa es correcto
- Verificar que el servidor proxy está funcionando (`http://localhost:3011/health`)
- Revisar la consola del navegador (F12) para ver errores

**La capa aparece en blanco:**
- Verificar que la capa tiene datos en la zona de Tlaxcala
- Ajustar el parámetro `opacity`

---

## Preguntas Frecuentes (FAQ)

### General

#### ¿Necesito saber programar para usar esta aplicación?
**Para ver la aplicación:** No, solo necesitas un navegador web.
**Para modificar contenido:** Conocimientos básicos de HTML ayudan, pero esta guía explica los pasos.
**Para agregar funcionalidades nuevas:** Sí, se requiere conocimiento de JavaScript y CSS.

#### ¿Por qué no se ven los mapas?
1. Verifica que el servidor proxy esté funcionando:
   - Abre una terminal en la carpeta `proxy-server`
   - Ejecuta `npm start`
   - Debe mostrar "Servidor proxy escuchando en puerto 3011"

2. Verifica la conexión:
   - Abre `http://localhost:3011/health` en el navegador
   - Debe mostrar `{"status":"ok"}`

#### ¿Puedo usar esta aplicación sin internet?
**Parcialmente.** Los mapas base (OpenStreetMap, satélite) requieren internet. Las capas de GeoServer y la API de acciones climáticas también requieren conexión al servidor.

---

### Sobre los capítulos

#### ¿Cuántos capítulos puedo agregar?
No hay límite técnico. Sin embargo, recomendamos no más de 10-12 capítulos por sección para mantener una buena experiencia de usuario.

#### ¿Puedo cambiar el orden de los capítulos?
Sí, pero requiere:
1. Renumerar los `id` y `data-chapter` en el HTML
2. Reorganizar el timeline
3. Actualizar las referencias en CSS y JavaScript

#### ¿Puedo eliminar un capítulo?
Sí:
1. Eliminar la sección HTML del capítulo
2. Eliminar el item del timeline
3. Reducir `totalChapters` en el JavaScript
4. Renumerar los capítulos restantes (recomendado)

#### ¿Por qué mi nuevo capítulo no aparece?
Verifica:
1. El HTML tiene el `id` correcto (`chapter-N`)
2. El `data-chapter` coincide con el número
3. El timeline tiene el item correspondiente
4. El `totalChapters` en JavaScript incluye el nuevo capítulo

---

### Sobre las imágenes

#### ¿Qué formato de imagen debo usar?
- **PNG:** Para mapas, gráficas y elementos con transparencia
- **JPG:** Para fotografías
- **Tamaño recomendado:** Máximo 2000px de ancho, optimizadas para web

#### ¿Dónde guardo las imágenes?
En la carpeta `images/` en la raíz del proyecto.

#### ¿Por qué mi imagen no se ve?
Verifica:
1. El archivo existe en la carpeta `images/`
2. El nombre del archivo es correcto (incluyendo mayúsculas/minúsculas)
3. La ruta en el HTML es correcta: `src="images/mi-imagen.png"`

---

### Sobre GeoServer

#### ¿Cómo sé qué capas están disponibles?
Contacta al administrador del servidor GeoServer o revisa la documentación del proyecto.

#### ¿Puedo crear nuevas capas?
Sí, pero requiere acceso de administrador al servidor GeoServer. Esto está fuera del alcance de esta guía.

#### ¿Por qué una capa se ve pixelada?
La capa puede tener baja resolución en GeoServer. Contacta al administrador para verificar la calidad de los datos originales.

---

### Sobre estilos y diseño

#### ¿Puedo cambiar los colores?
Sí. Los colores principales están en `css/variables.css`:

```css
:root {
  --color-primary: #582574;    /* Morado principal */
  --color-secondary: #A21A5C;  /* Rosa/magenta */
  --color-accent: #D0B787;     /* Dorado/beige */
}
```

#### ¿Por qué el texto se ve muy pequeño/grande?
Ajusta los valores de `font-size` en el archivo CSS correspondiente. Los valores usan `rem` (relativo al tamaño base):
- `0.8rem` = 80% del tamaño base
- `1rem` = 100% del tamaño base
- `1.2rem` = 120% del tamaño base

#### ¿Cómo hago que algo se vea en móviles?
Los estilos responsivos están al final de cada archivo CSS, dentro de `@media` queries:

```css
@media (max-width: 768px) {
  /* Estilos para pantallas pequeñas */
}
```

---

### Solución de problemas

#### Error: "Cannot read property of undefined"
- Verifica que todos los archivos JavaScript se cargan correctamente
- Revisa la consola del navegador (F12) para más detalles

#### La página se ve rota o sin estilos
- Verifica que los archivos CSS se cargan (revisa las rutas en el HTML)
- Limpia la caché del navegador (Ctrl+F5)

#### El timeline no funciona
- Verifica que `totalChapters` coincide con el número real de capítulos
- Verifica que cada capítulo tiene su item correspondiente en el timeline

---

## Estructura de Archivos

```
proyecto_tlaxcala/
│
├── index.html                    # Página principal
├── vulnerabilidad.html           # Sección vulnerabilidad
├── riesgo.html                   # Sección riesgo
├── amenazas.html                 # Sección amenazas
├── impactos.html                 # Sección impactos
├── clima.html                    # Sección clima
├── escenarios_clima.html         # Sección escenarios
├── acciones-climaticas.html      # Mapa de acciones
├── mitigacion.html               # Sección mitigación
│
├── css/                          # Estilos
│   ├── variables.css             # Colores y fuentes globales
│   ├── main.css                  # Estilos generales
│   ├── navbar.css                # Barra de navegación
│   ├── impactos.css              # Estilos de impactos
│   ├── amenazas.css              # Estilos de amenazas
│   ├── escenarios.css            # Estilos de escenarios
│   └── acciones-climaticas.css   # Estilos de acciones
│
├── js/                           # JavaScript
│   ├── config/                   # Configuraciones
│   │   ├── vulnerabilidad-config.js
│   │   ├── riesgo-config.js
│   │   ├── impactos-main.js
│   │   └── amenazas-main.js
│   │
│   ├── managers/                 # Gestores de funcionalidad
│   │   ├── MapManager.js
│   │   ├── ChartManager.js
│   │   └── ScrollManager.js
│   │
│   └── acciones/                 # Módulo de acciones climáticas
│       ├── config.js
│       ├── map.js
│       ├── data.js
│       └── main.js
│
├── images/                       # Imágenes
│   ├── mapa73.png
│   ├── mapa75.png
│   └── ...
│
├── data/                         # Datos CSV
│   └── links.csv
│
└── proxy-server/                 # Servidor proxy
    ├── server.js
    ├── config.js
    └── package.json
```

---

## Contacto y Soporte

Para dudas o problemas técnicos, revisar primero la sección de [Preguntas Frecuentes](#preguntas-frecuentes-faq).

---

## Documentación

Presentación: https://docs.google.com/presentation/d/1BtHFzTq2s1vKJBcjl-sx-5ogD50vI95qhVuJm6MI3ew/edit?usp=sharing

---

**Última actualización:** Febrero 2026
