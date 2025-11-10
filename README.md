# Story Maps - Cambio Climático Tlaxcala

Aplicación web geográfica interactiva para visualizar y explicar el cambio climático en el estado de Tlaxcala mediante Story Maps.

## Descripción

Plataforma web que presenta diferentes story maps interactivos sobre cambio climático:

- **Vulnerabilidad** - Análisis de vulnerabilidad climática por municipio con modelos de ganancia/pérdida de especies
- **Riesgo** - Riesgo climático, eventos y declaratorias, atlas de riesgo municipal
- **Amenazas** - Amenazas climáticas y su impacto en el estado
- **Impactos** - Impactos del cambio climático en diferentes sectores
- **Acciones Climáticas** - Mapa interactivo de proyectos y programas de acción climática

Cada story map contiene capítulos navegables con mapas interactivos (OpenLayers/Leaflet), gráficos de datos (Chart.js) y narrativa explicativa.

## Estructura del Proyecto

```
proyecto_tlaxcala/
├── proxy-server/              # Servidor proxy para GeoServer y API de Proyectos
│   ├── server.js             # Servidor Express con proxy para evitar CORS
│   ├── config.js             # Configuración de entornos (desarrollo/producción)
│   └── package.json
│
├── css/                       # Estilos
│   ├── variables.css         # Variables CSS (colores, fuentes)
│   ├── main.css              # Estilos generales y story maps
│   ├── navbar.css            # Navbar contraído con hover
│   ├── landing.css           # Página de inicio
│   ├── riesgo.css            # Estilos específicos de riesgo.html
│   ├── acciones-climaticas.css        # Estilos de acciones climáticas
│   └── acciones-responsive.css        # Responsive para acciones
│
├── js/                        # JavaScript
│   ├── config/               # Configuraciones de story maps
│   │   ├── vulnerabilidad-config.js   # Capítulos y capas de vulnerabilidad
│   │   ├── riesgo-config.js           # Capítulos y capas de riesgo
│   │   └── riesgo-main.js             # Lógica principal de riesgo
│   │
│   ├── managers/             # Gestores globales
│   │   ├── MapManager.js     # Gestión de mapas OpenLayers (WMS/WFS)
│   │   ├── ChartManager.js   # Gestión de gráficos Chart.js
│   │   ├── ScrollManager.js  # Navegación por scroll
│   │   └── TimelineManager.js # Timeline de capítulos
│   │
│   ├── acciones/             # Módulos específicos de acciones climáticas
│   │   ├── config.js         # Configuración de mapa y APIs
│   │   ├── data.js           # DataManager para fetch y caché
│   │   ├── data-adapter.js   # Adaptador para API Real (transforma datos)
│   │   ├── map.js            # MapManager de Leaflet
│   │   ├── popup.js          # Generación de popups
│   │   └── main.js           # App principal
│   │
│   ├── utils/                # Utilidades
│   │   └── proxy-helper.js   # Helper para proxy
│   │
│   └── main.js               # Inicialización global
│
├── data/                      # Datos CSV
│   └── links.csv             # Links a atlas municipales de riesgo
│
├── index.html                # Landing page
├── vulnerabilidad.html       # Story map de vulnerabilidad
├── riesgo.html              # Story map de riesgo
├── amenazas.html            # Story map de amenazas
├── impactos.html            # Story map de impactos
└── acciones-climaticas.html # Mapa interactivo de acciones climáticas
```

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- GeoServer funcionando (local o remoto con capas SEICCT)
- API de Proyectos en `https://api.cambioclimaticotlaxcala.mx/api/v1/projects/`
- Navegador web moderno

### Paso 1: Instalar dependencias del proxy

```bash
cd proxy-server
npm install
```

### Paso 2: Configurar entornos

Edita `proxy-server/config.js` según tu entorno:

```javascript
desarrollo: {
  geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
  puerto: 3001
},
produccion: {
  geoserver: 'https://api.cambioclimaticotlaxcala.mx/geoserver',
  puerto: 3001
}
```

## Uso

### 1. Iniciar el servidor proxy

El proxy es necesario para evitar errores de CORS al conectar con GeoServer y la API de Proyectos.

**En desarrollo:**
```bash
cd proxy-server
npm start
```

El proxy estará disponible en `http://localhost:3001`

**Endpoints disponibles:**
- `/geoserver/*` - Proxy para GeoServer WMS/WFS
- `/api/*` - Proxy para API de Proyectos
- `/health` - Health check del proxy

**En producción:**
```bash
cd proxy-server
npm run prod
```

### 2. Abrir la aplicación

Abre `index.html` con:

**Live Server (extensión de VS Code):**
- Click derecho en `index.html` > "Open with Live Server"
- La aplicación estará en `http://localhost:5500`

**Servidor HTTP simple:**
```bash
# Python 3
python -m http.server 5500

# Node.js (http-server)
npx http-server -p 5500
```

### 3. Verificar funcionamiento

1. **Verifica el proxy:** `http://localhost:3001/health`
   - Debe retornar JSON con status "ok"

2. **Abre la aplicación:** `http://localhost:5500`
   - Navega por las diferentes cards de la landing page

3. **Prueba los story maps:**
   - Vulnerabilidad: Scroll por capítulos, comparaciones de mapas
   - Riesgo: Timeline de capítulos, popups en atlas municipal
   - Acciones Climáticas: Mapa con markers clusterizados

## Funcionalidades por Story Map

### Vulnerabilidad (vulnerabilidad.html)

**Capítulos:**
1. Contexto del Estado
2. Temperatura promedio 2010-2024
3. Índice de vulnerabilidad por municipio
4. Modelos climáticos (6 subcapítulos: Encinos, Pinos, Oyameles, Abetos, Murciélagos, Áreas de Interés)

**Características:**
- Mapas OpenLayers con capas WMS de GeoServer
- Selector de modelos climáticos (ganancia/pérdida)
- Comparación de mapas: Split vertical, Área de interés, Rayos X
- Hover sobre municipios con información
- Gráficos Chart.js con datos CSV

### Riesgo (riesgo.html)

**Capítulos:**
1. Riesgo climático por municipio
2. Eventos por año y declaratorias (gráficos)
3. Atlas de Riesgo Municipal (mapa interactivo)

**Características:**
- Mapas OpenLayers con WMS/WFS
- Popup al hacer click en municipios con atlas
- Links a PDF de atlas municipales
- Timeline de navegación entre capítulos
- Hover sobre municipios

### Acciones Climáticas (acciones-climaticas.html)

**🎯 ACTUALIZACIÓN NOVIEMBRE 2025: API Nativa Implementada**

**Características:**
- Mapa Leaflet con clustering de markers
- **API Nativa** exclusiva: `https://api.cambioclimaticotlaxcala.mx/api/v1/surveys-geoserver/`
- Agrupación inteligente: Múltiples actividades se agrupan por proyecto (email + nombre + objetivo)
- **Popup complejo tipo formulario** con todos los campos disponibles
- Filtrado por dependencia
- Estadísticas en header (proyectos, ubicaciones, dependencias)
- Sistema de caché optimizado (localStorage, 5 min TTL)
- Validación de coordenadas dentro de Tlaxcala

**Popup complejo (tipo formulario):**
- **Header coloreado:** Dependencia + Nombre del programa (color sólido por dependencia, SIN degradados)
- **Body con campos estructurados:**
  - Tipo (Proyecto/Programa) y Estado (badges)
  - **Sección multi-ubicación colapsable:**
    - 📌 Chip naranja clickeable muestra número de ubicaciones
    - Click en el chip expande/contrae la lista de ubicaciones
    - Flecha animada indica estado (▼ contraído, ▲ expandido)
    - Ahorra espacio en el popup cuando está contraído
  - Ubicación con coordenadas
  - Fecha de inicio y Temporalidad
  - Actividad (campo grande)
  - Objetivo del programa (campo grande)
  - Población Objetivo (campo grande)
- **Footer con botones:** PDF, Fotos, Videos (funcionalidad futura)
- **Ancho optimizado:** max-width 300px (evita scroll horizontal)

**Markers diferenciados:**
- 🛡️ **Proyectos:** Forma de escudo
- ⭕ **Programas:** Forma circular
- **Colores por dependencia:** Cada dependencia tiene su color único
- **Badge numérico naranja:** Muestra número de ubicaciones en proyectos multi-ubicación
- **Anillo naranja:** Rodea markers multi-ubicación para mayor visibilidad
- 🏛️ **Indicador morado:** Marca proyectos de nivel estatal

**Estructura de datos:**
- Cada elemento del array JSON = 1 ACTIVIDAD (no 1 proyecto completo)
- Los proyectos se agrupan automáticamente por: `email + nombre del programa + objetivo`
- Un mismo proyecto puede tener múltiples ubicaciones (Local y Estatal)

## Configuración de Story Maps

Los story maps se configuran mediante archivos JavaScript en `js/config/`:

### Ejemplo: vulnerabilidad-config.js

```javascript
const VulnerabilidadConfig = {
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
    })()
  },
  capitulos: [
    {
      id: 1,
      titulo: 'Contexto del Estado',
      mapId: 'map-1',
      chartId: 'chart-1',
      capas: [
        {
          nombre: 'Limite',
          tipo: 'wms',
          layer: 'SEICCT:Limite',
          opacity: 1,
          zIndex: 1
        }
      ]
    }
    // Más capítulos...
  ]
};
```

### Ejemplo: acciones/config.js

```javascript
const CONFIG = {
  // API Nativa (sin parámetros - retorna todas las actividades)
  API_REAL_URL: (() => {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3001/api/v1/surveys-geoserver/";
    }
    if (hostname.includes("vercel.app")) {
      return "/api/proxy?path=api/v1/surveys-geoserver/";
    }
    return "https://api.cambioclimaticotlaxcala.mx/api/v1/surveys-geoserver/";
  })(),

  COLORS: {
    'Comisión Estatal del Agua y Saneamiento': '#4A90E2',
    'Secretaría de Medio Ambiente y Recursos Naturales': '#76BC21',
    // Más dependencias...
  },

  CACHE: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos (optimizado)
    key: 'acciones_climaticas_cache'
  }
};
```

## Tecnologías Utilizadas

### Frontend
- **OpenLayers 9.x** - Mapas interactivos con WMS/WFS de GeoServer
- **Leaflet 1.9.x** - Mapas ligeros para acciones climáticas
- **Leaflet.markercluster** - Clustering de markers
- **Chart.js 4.x** - Gráficos interactivos (barras, líneas, pie)
- **Papa Parse 5.x** - Lectura de archivos CSV
- **CSS Grid/Flexbox** - Layouts responsivos
- **CSS Variables** - Paleta de colores centralizada

### Backend
- **Express.js** - Servidor proxy para CORS
- **http-proxy-middleware** - Proxy para GeoServer y API
- **Node.js** - Runtime del servidor

### APIs y Datos
- **GeoServer** - Capas WMS/WFS (workspace: SEICCT)
- **API de Acciones Climáticas** - `https://api.cambioclimaticotlaxcala.mx/api/v1/surveys-geoserver/`
- **DataAdapter** - Capa de transformación y agrupación de actividades

## Personalización

### Colores

Edita `css/variables.css`:

```css
:root {
  --primary-color: #582574;
  --secondary-color: #A21A5C;
  --accent-color: #D0B787;
  --success-color: #76BC21;
  --info-color: #4A90E2;
}
```

### Capas de GeoServer

Las capas se configuran en los archivos de configuración:

```javascript
capas: [
  {
    nombre: 'Municipios',
    tipo: 'wms',
    layer: 'SEICCT:municipios_ganaperd',
    opacity: 1,
    zIndex: 2
  }
]
```

**Capas disponibles:**
- `SEICCT:Limite` - Límite estatal
- `SEICCT:municipios_ganaperd` - Municipios con datos de ganancia/pérdida
- `SEICCT:encinos_ganancia` / `SEICCT:encinos_perdida`
- `SEICCT:pinos_ganancia` / `SEICCT:pinos_perdida`
- Etc.

### Dependencias en Acciones Climáticas

Edita `js/acciones/config.js` para agregar nuevas dependencias:

```javascript
COLORS: {
  'Nueva Dependencia': '#COLOR_HEX',
  // ...
}
```

Y en `js/acciones/data-adapter.js`:

```javascript
static DEPENDENCIAS = {
  6: {
    nombre: 'Nueva Dependencia',
    color: '#COLOR_HEX'
  }
};
```

## Responsive

La aplicación es completamente responsive:

### Desktop (> 1024px)
- Layout de 3 columnas en story maps
- Mapas y gráficos lado a lado
- Timeline horizontal

### Tablet (768px - 1023px)
- Layout de 2 columnas
- Mapas más anchos
- Timeline adaptado

### Mobile (< 767px)
- Layout vertical (1 columna)
- Cards apiladas
- Timeline vertical
- Navbar colapsable

## Solución de Problemas

### El proxy no inicia

```bash
# Verificar Node.js
node --version

# Reinstalar dependencias
cd proxy-server
rm -rf node_modules package-lock.json
npm install

# Verificar puerto
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac
```

### Error de CORS

- Asegúrate de que el proxy esté corriendo: `http://localhost:3001/health`
- Verifica que las URLs usen el proxy: `http://localhost:3001/geoserver/...`
- Revisa la consola del proxy para ver errores

### GeoServer no responde

1. Verifica que GeoServer esté activo
2. Prueba directamente: `https://api.cambioclimaticotlaxcala.mx/geoserver/web/`
3. Revisa la configuración en `proxy-server/config.js`
4. Verifica las capas: `http://localhost:3001/geoserver/SEICCT/wms?request=GetCapabilities`

### API de Acciones Climáticas retorna 404

1. Verifica que el servidor proxy esté corriendo
2. Prueba directamente: `http://localhost:3001/api/v1/surveys-geoserver/`
3. Verifica que la API real esté activa: `https://api.cambioclimaticotlaxcala.mx/api/v1/surveys-geoserver/`

### Acciones Climáticas no muestra datos

1. Verifica que el proxy esté corriendo: `http://localhost:3001/health`
2. Revisa la consola del navegador (F12) para ver logs:
   - `"📡 Fuente de datos: API Nativa"` - Indica que está usando la API correcta
   - `"🗂️ X proyectos agrupados"` - Indica que la agrupación funciona
3. Limpia el caché:
   ```javascript
   // En consola del navegador
   localStorage.removeItem('acciones_climaticas_cache');
   location.reload();
   ```
4. Verifica que hay actividades con `status: "approved"` en la API

### Mapas no se muestran

1. Verifica que el proxy esté corriendo
2. Revisa la consola del navegador (F12) para errores
3. Verifica que las capas existan en GeoServer
4. Comprueba que el workspace sea `SEICCT`

## Mantenimiento de Código

### Migración a API Nativa Completada (Noviembre 2025)

**Archivos actualizados:**
- `js/acciones/data-adapter.js` - Reescrito con lógica de agrupación por email+nombre+objetivo
- `js/acciones/config.js` - API nativa exclusiva, cache TTL optimizado (5 min)
- `js/acciones/popup.js` - **Popup complejo tipo formulario** + chip colapsable para multi-ubicación
- `css/popups.css` - **Estilos tipo formulario sin degradados** + animaciones de toggle
- `js/acciones/map.js` - Markers mejorados con badges numéricos y anillos para multi-ubicación
- `css/acciones-climaticas.css` - Estilos para markers personalizados y tooltips (sin degradados)

**Arquitectura actual:**
1. **API Backend** → Retorna array de actividades individuales
2. **DataAdapter** → Agrupa actividades por proyecto (email + nombre + objetivo)
3. **DataManager** → Gestiona caché y procesamiento para el mapa
4. **MapManager** → Renderiza markers con popups diferenciados

**Lógica de agrupación:**
- Clave de agrupación: `email|nombre_proyecto|objetivo`
- Cada proyecto puede tener múltiples ubicaciones
- Flags: `es_multiubicacion`, `es_estatal`, `coordenadas_fallback`


**Última actualización:** Noviembre 2025
