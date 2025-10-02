#!/bin/bash

# Script para crear la estructura del proyecto Story Maps Tlaxcala
echo "🚀 Creando estructura del proyecto Story Maps Tlaxcala..."
echo ""

# Crear directorios principales
echo "📁 Creando directorios..."
mkdir -p proxy-server
mkdir -p css
mkdir -p js/config
mkdir -p js/managers
mkdir -p js/utils
mkdir -p data

# Crear archivos HTML
echo "📄 Creando archivos HTML..."
touch index.html
touch vulnerabilidad.html
touch riesgo.html
touch amenazas.html
touch impactos.html

# Crear archivos CSS
echo "🎨 Creando archivos CSS..."
touch css/variables.css
touch css/main.css
touch css/navbar.css
touch css/story-map.css
touch css/responsive.css

# Crear archivos JavaScript - Config
echo "⚙️  Creando archivos de configuración..."
touch js/config/vulnerabilidad-config.js
touch js/config/riesgo-config.js
touch js/config/amenazas-config.js
touch js/config/impactos-config.js

# Crear archivos JavaScript - Managers
echo "🔧 Creando managers..."
touch js/managers/MapManager.js
touch js/managers/ChartManager.js
touch js/managers/ScrollHandler.js
touch js/managers/NavigationManager.js

# Crear archivos JavaScript - Utils y Main
echo "🛠️  Creando utilidades..."
touch js/utils/proxy-helper.js
touch js/main.js

# Crear archivos de datos
echo "📊 Creando archivos de datos..."
touch data/municipios.csv
touch data/temperatura.csv
touch data/categorias.csv

# Crear archivos del proxy
echo "🌐 Creando archivos del proxy..."
touch proxy-server/server.js
touch proxy-server/config.js
touch proxy-server/package.json

# Crear README
echo "📝 Creando README..."
touch README.md

echo ""
echo "✅ ¡Estructura creada exitosamente!"
echo ""
echo "📂 Estructura del proyecto:"
echo ""
echo "proyecto/"
echo "├── proxy-server/"
echo "│   ├── server.js"
echo "│   ├── config.js"
echo "│   └── package.json"
echo "├── css/"
echo "│   ├── variables.css"
echo "│   ├── main.css"
echo "│   ├── navbar.css"
echo "│   ├── story-map.css"
echo "│   └── responsive.css"
echo "├── js/"
echo "│   ├── config/"
echo "│   │   ├── vulnerabilidad-config.js"
echo "│   │   ├── riesgo-config.js"
echo "│   │   ├── amenazas-config.js"
echo "│   │   └── impactos-config.js"
echo "│   ├── managers/"
echo "│   │   ├── MapManager.js"
echo "│   │   ├── ChartManager.js"
echo "│   │   ├── ScrollHandler.js"
echo "│   │   └── NavigationManager.js"
echo "│   ├── utils/"
echo "│   │   └── proxy-helper.js"
echo "│   └── main.js"
echo "├── data/"
echo "│   ├── municipios.csv"
echo "│   ├── temperatura.csv"
echo "│   └── categorias.csv"
echo "├── index.html"
echo "├── vulnerabilidad.html"
echo "├── riesgo.html"
echo "├── amenazas.html"
echo "├── impactos.html"
echo "└── README.md"
echo ""
echo "🎯 Siguiente paso:"
echo "   Los archivos están listos para ser poblados con código"
echo ""