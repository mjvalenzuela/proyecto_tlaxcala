export default async function handler(req, res) {
  // ==========================================
  // 1. CONFIGURAR CORS
  // ==========================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ==========================================
  // 2. PARSEAR URL CORRECTAMENTE
  // ==========================================
  try {
    // Obtener la URL completa de la petición
    const fullUrl = new URL(req.url, `https://${req.headers.host}`);
    
    // Extraer el parámetro 'path' usando URLSearchParams
    const searchParams = fullUrl.searchParams;
    const pathParam = searchParams.get('path');
    
    // Validar que existe el parámetro path
    if (!pathParam) {
      return res.status(400).json({ 
        error: 'Falta el parámetro "path"',
        uso: '/api/proxy?path=/geoserver/SEICCT/wms?SERVICE=WMS&VERSION=1.3.0&...',
        recibido: req.url,
        ayuda: 'El parámetro path debe contener la ruta completa a GeoServer'
      });
    }

    // ==========================================
    // 3. CONSTRUIR URL A GEOSERVER
    // ==========================================
    const geoserverBaseUrl = 'https://api.cambioclimaticotlaxcala.mx';
    
    // El pathParam ya contiene toda la query string de GeoServer
    // Ejemplo: /geoserver/SEICCT/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&...
    const targetUrl = `${geoserverBaseUrl}${pathParam}`;
    
    //console.log('🔄 Proxy Vercel:');
    //console.log('   Origen:', req.url);
    //console.log('   Destino:', targetUrl);

    // ==========================================
    // 4. HACER PETICIÓN A GEOSERVER
    // ==========================================
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Vercel-Serverless-Proxy/2.0',
        // No enviar cookies ni auth headers por seguridad
      },
      // Timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });

    // ==========================================
    // 5. VERIFICAR RESPUESTA
    // ==========================================
    if (!response.ok) {
      console.error(`❌ GeoServer respondió: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: 'Error en GeoServer',
        status: response.status,
        statusText: response.statusText,
        url: targetUrl
      });
    }

    // ==========================================
    // 6. OBTENER CONTENT-TYPE
    // ==========================================
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Copiar otros headers útiles
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // ==========================================
    // 7. ENVIAR RESPUESTA SEGÚN TIPO
    // ==========================================
    
    // Si es imagen (PNG, JPEG, GIF, etc.)
    if (contentType.includes('image')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      //console.log(`✅ Imagen servida: ${buffer.length} bytes`);
      return res.status(200).send(buffer);
    }
    
    // Si es XML (WMS GetCapabilities, GetFeatureInfo, etc.)
    if (contentType.includes('xml')) {
      const text = await response.text();
      //console.log(`✅ XML servido: ${text.length} caracteres`);
      return res.status(200).send(text);
    }
    
    // Si es JSON (WFS, algunos formatos)
    if (contentType.includes('json')) {
      const text = await response.text();
      //console.log(`✅ JSON servido: ${text.length} caracteres`);
      return res.status(200).send(text);
    }
    
    // Cualquier otro tipo de contenido (text/plain, application/octet-stream, etc.)
    const text = await response.text();
   // console.log(`✅ Contenido servido (${contentType}): ${text.length} caracteres`);
    return res.status(200).send(text);

  } catch (error) {
    // ==========================================
    // 8. MANEJO DE ERRORES
    // ==========================================
    console.error('❌ Error en proxy:', error.message);
    
    // Error de timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Timeout al conectar con GeoServer',
        mensaje: 'El servidor no respondió en 30 segundos',
        ayuda: 'Verifica que GeoServer esté funcionando correctamente'
      });
    }
    
    // Error de red
    if (error.message.includes('fetch')) {
      return res.status(502).json({ 
        error: 'Error de red al conectar con GeoServer',
        mensaje: error.message,
        ayuda: 'Verifica la URL de GeoServer y la conectividad'
      });
    }
    
    // Error genérico
    return res.status(500).json({ 
      error: 'Error interno del proxy',
      mensaje: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}