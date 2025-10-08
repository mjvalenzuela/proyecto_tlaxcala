/**
 * Proxy serverless para Vercel
 * Maneja peticiones a GeoServer y resuelve CORS
 */

export default async function handler(req, res) {
  // Configurar CORS para permitir cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Obtener el path de la query string
  const { path } = req.query;
  
  if (!path) {
    return res.status(400).json({ 
      error: 'Falta el parámetro "path"',
      uso: '/api/proxy?path=/geoserver/SEICCT/wms?SERVICE=WMS...',
      ejemplo: '/api/proxy?path=/geoserver/SEICCT/wms?SERVICE=WMS&REQUEST=GetCapabilities'
    });
  }

  // Construir URL completa a GeoServer
  const geoserverBaseUrl = 'https://api.cambioclimaticotlaxcala.mx';
  const fullUrl = `${geoserverBaseUrl}${path}`;
  
  console.log(`🔄 Proxy Vercel → ${fullUrl}`);

  try {
    // Hacer petición a GeoServer
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Vercel-Serverless-Proxy/1.0'
      }
    });

    // Obtener el tipo de contenido
    const contentType = response.headers.get('content-type') || 'text/plain';
    
    // Copiar header de content-type
    res.setHeader('Content-Type', contentType);

    // Si es imagen, enviar como buffer
    if (contentType.includes('image')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return res.status(response.status).send(buffer);
    }
    
    // Si es texto/JSON/XML, enviar como string
    const text = await response.text();
    return res.status(response.status).send(text);

  } catch (error) {
    console.error('❌ Error en proxy:', error.message);
    
    return res.status(500).json({ 
      error: 'Error al conectar con GeoServer',
      mensaje: error.message,
      url: fullUrl
    });
  }
}