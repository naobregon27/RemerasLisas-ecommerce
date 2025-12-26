import axios from 'axios';

// URL base para la API
const baseURL = 'https://remeraslisas-backend.onrender.com';

// Crear una instancia de axios con configuración por defecto
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 segundos de timeout
});

// Interceptor de solicitud para agregar token si existe
api.interceptors.request.use(
  config => {
    // Agregar token desde localStorage si existe (útil para autenticación)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // Asegurarse de que el token sea visible en la consola para depuración
      console.log('🔑 Token incluido en la solicitud');
    } else {
      console.log('⚠️ No hay token de autenticación');
    }
    
    // Log de desarrollo
    console.log(`🚀 Enviando ${config.method.toUpperCase()} a ${config.url}`);
    
    return config;
  },
  error => {
    console.error('❌ Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores comunes
api.interceptors.response.use(
  response => {
    // Log de desarrollo
    console.log(`✅ Respuesta de ${response.config.url}:`, response.status);
    
    try {
      // Verificar si hay imágenes en la respuesta y preprocesarlas
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Si es un array, verificar cada objeto
          response.data = response.data.map(item => procesarImagenes(item));
        } else if (typeof response.data === 'object') {
          // Si es un objeto, procesarlo directamente
          response.data = procesarImagenes(response.data);
        }
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      // No interrumpimos el flujo, devolvemos la respuesta original
    }
    
    return response;
  },
  error => {
    // Extraer mensaje de error más útil
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Error en la solicitud';
    
    // Log de desarrollo
    console.error(`❌ Error ${error.response?.status || ''}: ${errorMessage}`);
    
    // Manejo de errores específicos por código
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Error de autenticación. El token puede haber expirado.');
          // Limpiar token solo si estamos seguros de que es un problema de autenticación
          localStorage.removeItem('token');
          // Disparar evento para que los componentes puedan reaccionar
          window.dispatchEvent(new Event('auth-error'));
          break;
        case 403:
          console.error('Acceso prohibido. No tienes permisos para este recurso.');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error del servidor');
          break;
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor, verifica tu conexión');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Función para procesar y validar URLs de imágenes en objetos
 * @param {Object} item - Objeto que puede contener imágenes
 * @returns {Object} - Objeto con URLs de imágenes procesadas
 */
function procesarImagenes(item) {
  if (!item) return item;
  
  // Copiar el objeto para no modificar el original
  const result = { ...item };
  
  // Procesar imagenes si existen
  if (result.imagenes && Array.isArray(result.imagenes)) {
    result.imagenes = result.imagenes.map(img => {
      // Verificar si la imagen es un objeto con propiedad url
      if (img && typeof img === 'object' && img.url) {
        // Usar la propiedad url del objeto
        if (img.url.startsWith('http://') || img.url.startsWith('https://')) {
          return img.url;
        }
        
        // Si es un base64, devolverlo tal cual
        if (img.url.startsWith('data:')) {
          return img.url;
        }
        
        // Si es una ruta relativa, completar con baseURL
        return `${baseURL}/${img.url.replace(/^\/+/, '')}`;
      }
      
      // Verificar que img sea una cadena de texto válida
      if (!img || typeof img !== 'string') {
        console.warn('Imagen inválida detectada:', img);
        return 'https://via.placeholder.com/400?text=Sin+imagen';
      }
      
      // Si la imagen ya es una URL completa, devolverla tal cual
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      
      // Si es un base64, devolverlo tal cual
      if (img.startsWith('data:')) {
        return img;
      }
      
      // Si no, es una ruta relativa, completar con baseURL
      // Remover barras duplicadas entre baseURL y la ruta de la imagen
      const url = `${baseURL}/${img.replace(/^\/+/, '')}`;
      
      return url;
    });
  }
  
  // Procesar imagen única si existe (como logo, banner, etc.)
  ['logo', 'imagenBanner', 'imagen', 'thumbnail'].forEach(prop => {
    if (result[prop]) {
      // Verificar si la imagen es un objeto con propiedad url
      if (typeof result[prop] === 'object' && result[prop].url) {
        // Usar la propiedad url del objeto
        if (result[prop].url.startsWith('http://') || result[prop].url.startsWith('https://')) {
          result[prop] = result[prop].url;
          return;
        }
        
        // Si es un base64, usarlo tal cual
        if (result[prop].url.startsWith('data:')) {
          result[prop] = result[prop].url;
          return;
        }
        
        // Si es una ruta relativa, completar con baseURL
        result[prop] = `${baseURL}/${result[prop].url.replace(/^\/+/, '')}`;
        return;
      }
      
      // Verificar que sea una cadena de texto válida
      if (typeof result[prop] !== 'string') {
        result[prop] = 'https://via.placeholder.com/400?text=Sin+imagen';
        return;
      }
      
      // Si la imagen ya es una URL completa, mantenerla
      if (result[prop].startsWith('http://') || result[prop].startsWith('https://')) {
        // No hacer nada, mantener la URL tal cual
      } else if (result[prop].startsWith('data:')) {
        // Si es un base64, mantenerlo tal cual
      } else {
        // Es una ruta relativa, completar con baseURL
        result[prop] = `${baseURL}/${result[prop].replace(/^\/+/, '')}`;
      }
    }
  });
  
  return result;
}

export default api; 