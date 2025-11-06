# 🌍 Story Maps - Cambio Climático Tlaxcala

Aplicación web geográfica interactiva para explicar el cambio climático en el municipio de Tlaxcala mediante Story Maps.

## Descripción

Plataforma web que presenta diferentes story maps interactivos sobre:
- **Vulnerabilidad** climática
- **Riesgo** climático
- **Amenazas** climáticas
- **Impactos** del cambio climático

Cada story map contiene capítulos navegables con mapas interactivos, gráficos de datos y narrativa explicativa.

## Estructura del Proyecto

```
proyecto/
├── proxy-server/          # Servidor proxy para GeoServer
│   ├── server.js
│   ├── config.js
│   └── package.json
├── css/                   # Estilos
│   ├── variables.css      # Variables de colores
│   ├── main.css          # Estilos generales
│   ├── navbar.css        # Navbar
│   ├── story-map.css     # Story maps (pendiente)
│   └── responsive.css    # Media queries (pendiente)
├── js/                    # JavaScript
│   ├── config/           # Configuraciones de story maps
│   ├── managers/         # Gestores (Map, Chart, Scroll, etc.)
│   ├── utils/            # Utilidades
│   └── main.js
├── data/                  # Datos CSV
│   ├── municipios.csv
│   ├── temperatura.csv
│   └── categorias.csv
├── index.html            # Landing page
├── vulnerabilidad.html   # Story map vulnerabilidad
├── riesgo.html
├── amenazas.html
└── impactos.html
```

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- GeoServer funcionando (local o remoto)
- Navegador web moderno

### Paso 1: Instalar dependencias del proxy

```bash
cd proxy-server
npm install
```

### Paso 2: Configurar GeoServer

Edita `proxy-server/config.js` y actualiza las URLs de GeoServer:

```javascript
desarrollo: {
  geoserver: 'http://localhost:8080/geoserver',
  puerto: 3000
}
```

## 🎮 Uso

### 1. Iniciar el servidor proxy

**En desarrollo:**
```bash
cd proxy-server
npm start
```

El proxy estará disponible en `http://localhost:3000`

**En producción:**
```bash
cd proxy-server
npm run prod
```

### 2. Abrir la aplicación

Abre `index.html` con:
- **Live Server** (extensión de VS Code)
- **Servidor HTTP simple:**
  ```bash
  # Python 3
  python -m http.server 8000
  
  # Node.js (http-server)
  npx http-server -p 8000
  ```

### 3. Verificar funcionamiento

1. Verifica que el proxy funcione: `http://localhost:3000/health`
2. Abre la aplicación: `http://localhost:8000` (o el puerto que uses)
3. Navega por los story maps desde la landing page

## Configuración de Story Maps

Los story maps se configuran fácilmente mediante archivos JavaScript en `js/config/`:

```javascript
// Ejemplo: vulnerabilidad-config.js
export const storyMapConfig = {
  id: 'vulnerabilidad',
  titulo: 'Vulnerabilidad Climática',
  capitulos: [
    {
      id: 'cap-1',
      titulo: 'Contexto Municipal',
      contenido: 'Texto explicativo...',
      mapa: {
        capas: ['Tlaxcala:Municipios'],
        zoom: 11,
        centro: [-98.2377, 19.3138]
      },
      grafico: {
        tipo: 'bar',
        datos: 'data/municipios.csv'
      }
    }
    // Más capítulos...
  ]
};
```

## Datos

Los datos se almacenan en archivos CSV en la carpeta `data/`:

- **municipios.csv**: Datos por municipio (población, vulnerabilidad, superficie)
- **temperatura.csv**: Series temporales climáticas (2010-2024)
- **categorias.csv**: Distribución porcentual de categorías

## Tecnologías Utilizadas

- **OpenLayers**: Mapas interactivos con WMS de GeoServer
- **Chart.js**: Gráficos interactivos
- **Papa Parse**: Lectura de archivos CSV
- **Express.js**: Servidor proxy para CORS
- **CSS Grid/Flexbox**: Layouts responsivos
- **CSS Scroll Snap**: Navegación por capítulos

## Personalización

### Colores

Edita `css/variables.css` para cambiar la paleta de colores del proyecto.

### Capas del mapa

Las capas de GeoServer se configuran en los archivos de configuración de cada story map (`js/config/`).

### Gráficos

Los tipos de gráficos soportados:
- `bar`: Gráfico de barras
- `line`: Gráfico de líneas
- `pie`: Gráfico de torta

## Responsive

La aplicación es completamente responsive:
- **Desktop**: Layout de 3 columnas (mapa + 2 cards)
- **Tablet**: Layout optimizado
- **Mobile**: Cards apiladas verticalmente debajo del mapa

## Solución de Problemas

### El proxy no inicia
- Verifica que Node.js esté instalado: `node --version`
- Revisa que las dependencias estén instaladas: `npm install`
- Verifica que el puerto 3000 no esté ocupado

### Error de CORS
- Asegúrate de que el proxy esté corriendo
- Verifica que estés usando `http://localhost:3000/geoserver/...` en lugar de la URL directa de GeoServer

### GeoServer no responde
- Verifica que GeoServer esté corriendo
- Revisa la configuración en `proxy-server/config.js`
- Prueba la URL directamente: `http://localhost:3000/health`

## Roadmap

### Fase 1 - Completada ✅
- [x] Proxy Node.js con CORS
- [x] Estructura base del proyecto
- [x] Landing page
- [x] CSVs de prueba
- [x] CSS base

### Fase 2 - En progreso 🚧
- [ ] MapManager (OpenLayers + WMS)
- [ ] ChartManager (Chart.js + CSVs)
- [ ] Sistema de configuración modular

### Fase 3 - Pendiente 📋
- [ ] ScrollHandler (navegación híbrida)
- [ ] NavigationManager (botones + timeline)
- [ ] Sistema de capítulos completo

### Fase 4 - Pendiente 📋
- [ ] Responsive completo
- [ ] Animaciones en mapas
- [ ] Testing y optimización

## Licencia

Este proyecto está bajo la Licencia MIT.

## Contribución

Para agregar nuevos story maps:

1. Crea un nuevo archivo HTML (ej: `nuevo-tema.html`)
2. Crea su configuración en `js/config/nuevo-tema-config.js`
3. Agrega el link en el navbar de todos los archivos
4. Agrega una card en `index.html`

## Soporte

Para dudas o problemas, verifica primero:
1. El proxy esté corriendo
2. GeoServer esté activo
3. La consola del navegador no muestre errores

---