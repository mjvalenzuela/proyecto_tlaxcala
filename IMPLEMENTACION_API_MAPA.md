# 🗺️ IMPLEMENTACIÓN: Consumo de API para Mapa Interactivo

**Proyecto:** Mapa de Acciones Climáticas - Tlaxcala  
**Versión:** 1.0  
**Fecha:** Noviembre 2025

---

## 📋 RESUMEN EJECUTIVO

Integrar la API existente `https://api.cambioclimaticotlaxcala.mx/api/v1/projects/` con el mapa interactivo usando Leaflet.js, transformando los datos del formulario en markers georreferenciados.

**Tiempo estimado:** 2 días  
**Complejidad:** Media  
**Dependencias externas:** Solo Leaflet.js

---

## 🎯 OBJETIVO

Transformar esto (API actual):
```json
{
  "id": 14,
  "dependency": 1,
  "answers": [
    {"question_title": "Nombre del programa", "display_value": "LIMPIEZA"},
    {"question_title": "Actividades principales", 
     "display_value": "Actividad 1. LIMPIEZA — Tipo: Local — Lat: 19.56704, Lon: -98.59764 — Lugar: Calpulalpan"}
  ]
}
```

En esto (para el mapa):
```javascript
{
  id: 14,
  lat: 19.56704,
  lng: -98.59764,
  nombre: "LIMPIEZA",
  dependencia: "Comisión del Agua",
  color: "#2196F3"
}
```

---

## ⚙️ ARQUITECTURA

```
┌──────────────────┐
│   API Backend    │  GET /api/v1/projects/
│   (Ya existe)    │
└────────┬─────────┘
         │ JSON
         ▼
┌──────────────────┐
│  data-adapter.js │  Transforma datos
│   (Nuevo)        │  - Parse coordenadas
└────────┬─────────┘  - Mapea dependencias
         │ Array simple
         ▼
┌──────────────────┐
│    map.js        │  Dibuja markers
│  (Leaflet.js)    │  con Leaflet
└──────────────────┘
```

---

## ✅ CAMPOS NECESARIOS

### Obligatorios (sin estos NO funciona):
| Campo | Fuente en API | Cómo obtenerlo |
|-------|---------------|----------------|
| **id** | `id` | Directo |
| **lat** | `answers` → "Actividades principales" | Regex: `/Lat:\s*([\d.-]+)/` |
| **lng** | `answers` → "Actividades principales" | Regex: `/Lon:\s*([\d.-]+)/` |

### Recomendados (mejoran la UX):
| Campo | Fuente en API | Cómo obtenerlo |
|-------|---------------|----------------|
| **nombre** | `answers` → "Nombre del programa" | `find()` en array answers |
| **dependencia** | `dependency` (ID) | Mapeo manual: `1` → "Comisión del Agua" |
| **color** | `dependency` (ID) | Mapeo manual: `1` → "#2196F3" |

---

## 🔧 COMPONENTES A DESARROLLAR

### 1. data-adapter.js (Nuevo archivo)

**Responsabilidad:** Consumir API y transformar datos

**Funciones principales:**

```javascript
// Obtiene todos los proyectos de todas las páginas
async function obtenerAccionesClimaticas() {
  // 1. Fetch a API con paginación
  // 2. Filtrar solo status === "approved"
  // 3. Transformar cada proyecto
  // 4. Retornar array listo para el mapa
}

// Transforma un proyecto del formato API al formato mapa
function transformarProyecto(proyecto) {
  // 1. Extraer nombre de answers[]
  // 2. Parsear coordenadas de "Actividades principales"
  // 3. Mapear dependency ID → nombre y color
  // 4. Retornar objeto simple
}

// Extrae coordenadas del string de actividades
function parsearUbicaciones(actividadesStr) {
  // Regex para extraer lat/lng
  // Retorna array de ubicaciones
}
```

**Mapeo de dependencias:**
```javascript
const DEPENDENCIAS = {
  1: { nombre: 'Comisión del Agua', color: '#2196F3' },
  2: { nombre: 'Medio Ambiente', color: '#4CAF50' },
  3: { nombre: 'Desarrollo Rural', color: '#795548' },
  4: { nombre: 'Obras Públicas', color: '#FF9800' },
  5: { nombre: 'Desarrollo Económico', color: '#9C27B0' }
};
```

---

### 2. map.js (Modificar existente)

**Responsabilidad:** Dibujar markers en el mapa

**Cambios necesarios:**

```javascript
// ANTES (con Google Sheets):
const data = await fetchGoogleSheets();

// DESPUÉS (con API):
import { obtenerAccionesClimaticas } from './data-adapter.js';
const acciones = await obtenerAccionesClimaticas();

// Crear markers
acciones.forEach(accion => {
  accion.ubicaciones.forEach(ubicacion => {
    // Crear icono con color de dependencia
    const icon = L.divIcon({
      html: `<div style="background: ${accion.color}"></div>`
    });
    
    // Agregar marker al mapa
    L.marker([ubicacion.lat, ubicacion.lng], { icon })
      .bindPopup(`<b>${accion.nombre}</b><br>${accion.dependencia}`)
      .addTo(map);
  });
});
```

---

## 🔍 PARSER DE COORDENADAS

**Input (de la API):**
```
"Actividad 1. LIMPIEZA — Tipo: Local — Lat: 19.56704, Lon: -98.59764 — Lugar: Calpulalpan"
```

**Regex:**
```javascript
const regex = /Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/;
const match = texto.match(regex);

const lat = parseFloat(match[1]);  // 19.56704
const lng = parseFloat(match[2]);  // -98.59764
```

**Output:**
```javascript
{ lat: 19.56704, lng: -98.59764 }
```

---

## 🎨 CASOS ESPECIALES

### 1. Proyectos Multi-ubicación

**Input:**
```
"Actividad 1. X — Lat: 19.5, Lon: -98.5 | Actividad 2. Y — Tipo: Estatal"
```

**Solución:**
```javascript
const actividades = texto.split(' | ');
// Procesar cada actividad por separado
```

### 2. Proyectos Estatales (sin coordenadas)

**Input:**
```
"Actividad 1. LIMPIEZA — Tipo: Estatal"
```

**Solución:**
```javascript
if (texto.includes('Tipo: Estatal')) {
  lat = 19.318154;  // Centro de Tlaxcala
  lng = -98.237232;
  es_estatal = true;
}
```

### 3. Coordenadas inválidas

**Validación:**
```javascript
if (lat < 19.0 || lat > 19.8 || lng < -98.8 || lng > -97.5) {
  console.warn('Coordenadas fuera de rango:', lat, lng);
  return null; // Omitir esta ubicación
}
```

---

## 📦 ESTRUCTURA DE ARCHIVOS

```
proyecto/
├── js/
│   ├── data-adapter.js    ← NUEVO (consumo API)
│   ├── map.js              ← MODIFICAR (usar adaptador)
│   ├── main.js             ← MODIFICAR (importar adaptador)
│   └── config.js
├── index.html
└── css/
    └── styles.css
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Día 1: Adaptador de datos

**Mañana (4h):**
- [ ] Crear `data-adapter.js`
- [ ] Implementar función de fetch con paginación
- [ ] Implementar parser de coordenadas (regex)
- [ ] Implementar transformación de datos

**Tarde (4h):**
- [ ] Agregar mapeo de dependencias
- [ ] Implementar validación de coordenadas
- [ ] Agregar manejo de errores
- [ ] Agregar sistema de caché (5 min)

### Día 2: Integración con mapa

**Mañana (3h):**
- [ ] Modificar `map.js` para usar adaptador
- [ ] Actualizar `main.js`
- [ ] Probar con datos reales de API

**Tarde (5h):**
- [ ] Testing de casos edge (multi-ubicación, estatal, inválidos)
- [ ] Optimización de performance
- [ ] Ajustes finales
- [ ] Documentación

---

## 🧪 TESTING

### Test 1: Consumo básico
```javascript
const acciones = await obtenerAccionesClimaticas();
console.log(`✅ ${acciones.length} acciones cargadas`);
```

### Test 2: Parser de coordenadas
```javascript
const input = "Actividad 1. TEST — Lat: 19.5, Lon: -98.5";
const ubicaciones = parsearUbicaciones(input);
console.assert(ubicaciones[0].lat === 19.5);
```

### Test 3: Multi-ubicación
```javascript
const input = "Actividad 1. X — Lat: 19.5, Lon: -98.5 | Actividad 2. Y — Tipo: Estatal";
const ubicaciones = parsearUbicaciones(input);
console.assert(ubicaciones.length === 2);
```

---

## ⚠️ REQUERIMIENTOS DEL BACKEND

### Críticos:
- [x] **CORS habilitado** para peticiones desde el navegador
- [x] **Endpoint público** (sin autenticación para GET)
- [x] **Paginación funcional** (`?page=2` debe funcionar)

### Verificación:
```javascript
// Ejecutar en consola del navegador (F12):
fetch('https://api.cambioclimaticotlaxcala.mx/api/v1/projects/')
  .then(r => r.json())
  .then(d => console.log('✅ API funciona'))
  .catch(e => console.error('❌ Error:', e));
```

---

## 📊 MÉTRICAS DE ÉXITO

| Métrica | Objetivo |
|---------|----------|
| Tiempo de carga | < 3 segundos |
| Proyectos parseados correctamente | 100% |
| Coordenadas válidas | > 95% |
| Tasa de error | < 1% |

---

## 🔒 SEGURIDAD

- ✅ No se almacenan credenciales
- ✅ Validación de datos en cliente
- ✅ Sanitización de strings antes de mostrar en popups
- ✅ Timeout de 10 segundos en requests

---

## 💡 MEJORAS FUTURAS (OPCIONAL)

1. **Endpoint de dependencias** en backend
   ```
   GET /api/v1/dependencies/
   ```
   Para obtener dinámicamente nombres y colores

2. **Filtrado en backend**
   ```
   GET /api/v1/projects/?dependency=1&status=approved
   ```
   Para reducir tráfico

3. **WebSocket** para actualizaciones en tiempo real

---

## 📚 RECURSOS

**Documentación:**
- Leaflet.js: https://leafletjs.com/reference.html
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

**Archivos entregados:**
- `data-adapter.js` - Código completo del adaptador
- `prueba-api.html` - Demo funcional
- `CAMPOS_MINIMOS_MAPA.md` - Análisis de campos necesarios

---

## ✅ CHECKLIST FINAL

### Antes de empezar:
- [ ] Verificar que CORS está habilitado (prueba en consola)
- [ ] Confirmar estructura del JSON de la API
- [ ] Tener Leaflet.js instalado/importado

### Durante desarrollo:
- [ ] Parser de coordenadas funciona correctamente
- [ ] Mapeo de dependencias completo
- [ ] Manejo de errores implementado
- [ ] Testing de casos edge

### Antes de producción:
- [ ] Todos los proyectos se visualizan correctamente
- [ ] No hay errores en consola
- [ ] Performance < 3 segundos
- [ ] Funciona en Chrome, Firefox, Safari

---

## 🎯 RESULTADO ESPERADO

Al finalizar tendrás:
- ✅ Mapa cargando datos desde la API real
- ✅ Markers de colores según dependencia
- ✅ Popups con información del proyecto
- ✅ Soporte para proyectos multi-ubicación
- ✅ Manejo de errores robusto
- ✅ Caché para mejorar performance

---

**FIN DEL DOCUMENTO**

*Para dudas técnicas, revisar `data-adapter.js` (incluye comentarios detallados)*
