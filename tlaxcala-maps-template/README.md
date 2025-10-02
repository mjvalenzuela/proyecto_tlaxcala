# Template: React + OpenLayers + Geoserver

Guía Aplicación web interactiva con mapas, gráficos dinámicos y storytelling.

## Requisitos previos

Antes de empezar, asegurarse tener instalado:

- **Node.js** versión 16 o superior
- **Visual Studio Code** recomendado como editor
- Acceso a un servidor **Geoserver** con capas WMS publicadas

---

## Pasos para crear el proyecto

### Paso 1: Verificar instalación de Node.js

Abrir la terminal de Windows (cmd o PowerShell) o la terminal integrada de VS Code (Ctrl + ñ) y ejecutar:

```bash
node --version
npm --version
```

Ver las versiones instaladas. Si no, instalar Node.js primero.

---

### Paso 2: Crear el proyecto React

1. Navegar a la carpeta donde se quiere crear el proyecto
2. Ejecutar el siguiente comando para crear el proyecto:

```bash
npx create-react-app tlaxcala-maps-template
```

3. Esperar a que se instalen todas las dependencias
4. Entrar a la carpeta del proyecto:

```bash
cd tlaxcala-maps-template
```

---

### Paso 3: Instalar las librerías necesarias

Dentro de la carpeta del proyecto, instalar las dependencias adicionales:

```bash
npm install ol recharts papaparse
```

**¿Qué se instala?**
- `ol` → OpenLayers para los mapas interactivos
- `recharts` → Para crear gráficos (barras, líneas, tortas)
- `papaparse` → Para leer y procesar archivos CSV

---

### Paso 4: Crear la estructura de carpetas

Dentro de la carpeta `src/`, crear estas carpetas y archivos:

**Carpetas a crear:**
```
src/
└── components/
    ├── Map.jsx
    ├── Charts.jsx
    └── Story.jsx
```

**En la carpeta `public/`:**
```
public/
└── data/
    └── ejemplo.csv
```

---

### Paso 5: Crear los archivos de componentes

Crear estos tres archivos vacíos dentro de `src/components/`:

1. **Map.jsx** → Contendrá el mapa con OpenLayers
2. **Charts.jsx** → Contendrá los gráficos dinámicos
3. **Story.jsx** → Contendrá el texto narrativo (storytelling)

Luego, copiar el código correspondiente a cada archivo.

---

### Paso 6: Ejecutar la aplicación

En la terminal, dentro de la carpeta del proyecto, ejecutar:

```bash
npm start
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`

---

## Verificar que todo funciona

Cuando la aplicación cargue, deberá mostrar:

1. **Un título** y texto descriptivo en la parte superior
2. **Un mapa** con tu capa WMS de Geoserver
3. **Dos gráficos** (barras y líneas) con los datos del CSV
4. Al hacer **clic en el mapa**, el texto dinámico y los gráficos deben actualizarse

---

## Comandos útiles

- **Iniciar el servidor de desarrollo:**
  ```bash
  npm start
  ```

- **Detener el servidor:**
  Presiona `Ctrl + C` en la terminal

- **Construir para producción:**
  ```bash
  npm run build
  ```

- **Instalar una librería adicional:**
  ```bash
  npm install nombre-libreria
  ```

---