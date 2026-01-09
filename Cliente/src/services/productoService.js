import api from './api';

export const productoService = {
  /**
   * Obtiene todos los productos de una tienda
   * NOTA: Este método mantiene compatibilidad con código legacy.
   * Para nuevos desarrollos, usar tiendaService.obtenerTodosLosProductos() que incluye paginación.
   * @param {string} slug - Slug de la tienda
   * @param {Object} params - Parámetros opcionales (page, limit, ordenar)
   */
  obtenerProductos: async (slug, params = {}) => {
    try {
      console.log(`Obteniendo productos para la tienda: ${slug}`);
      
      const { page = 1, limit = 12, ordenar = '' } = params;
      let url = `/api/tiendas/${slug}/productos?page=${page}&limit=${limit}`;
      if (ordenar) {
        url += `&ordenar=${ordenar}`;
      }
      
      const response = await api.get(url);
      
      // Log de depuración
      console.log('Respuesta de productos recibida:', {
        tipo: typeof response.data,
        esArray: Array.isArray(response.data),
        keys: typeof response.data === 'object' ? Object.keys(response.data) : null
      });
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data) {
        console.warn('La respuesta no contiene datos de productos');
        return [];
      }
      
      // La API debería retornar {productos: [...], paginacion: {...}}
      let productosData = response.data;
      
      // Si la respuesta es un objeto y tiene una propiedad 'productos', usamos esa
      if (!Array.isArray(response.data) && response.data.productos) {
        console.log('Usando datos desde response.data.productos');
        productosData = response.data.productos;
      }
      
      // Si la respuesta es un array directo (legacy)
      if (Array.isArray(response.data)) {
        console.log('Respuesta es array directo (modo legacy)');
        productosData = response.data;
      }
      
      // Si después de estas comprobaciones todavía no tenemos un array, devolvemos array vacío
      if (!Array.isArray(productosData)) {
        console.warn('Los datos de productos no son un array:', productosData);
        return [];
      }
      
      console.log(`Se encontraron ${productosData.length} productos`);
      
      // Asegurar que todos los productos tengan una propiedad de imagen válida
      const productos = productosData.map(productoService.normalizarProducto);
      return productos;
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  },

  /**
   * Obtiene un producto específico de una tienda
   * NOTA: Este método mantiene compatibilidad con código legacy.
   * Para nuevos desarrollos, usar tiendaService.obtenerDetalleProducto() que incluye productos relacionados.
   * @param {string} slug - Slug de la tienda
   * @param {string} productoSlug - Slug o ID del producto
   */
  obtenerProducto: async (slug, productoSlug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}/productos/${productoSlug}`);
      
      // La API puede retornar {producto: {...}, productosRelacionados: [...]}
      // o solo el producto directamente (legacy)
      if (response.data.producto) {
        // Nueva estructura de API con producto y relacionados
        return productoService.normalizarProducto(response.data.producto);
      }
      
      // Estructura legacy - producto directo
      return productoService.normalizarProducto(response.data);
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      throw error;
    }
  },

  /**
   * Obtiene productos por categoría
   * NOTA: Este método mantiene compatibilidad con código legacy.
   * Para nuevos desarrollos, usar tiendaService.obtenerProductosPorCategoria() que incluye paginación.
   * @param {string} slug - Slug de la tienda
   * @param {string} categoriaSlug - Slug o ID de la categoría
   * @param {Object} params - Parámetros opcionales (page, limit)
   */
  obtenerProductosPorCategoria: async (slug, categoriaSlug, params = {}) => {
    try {
      console.log(`Obteniendo productos por categoría: Slug=${slug}, Categoría=${categoriaSlug}`);
      
      const { page = 1, limit = 100 } = params; // Aumentar el límite para obtener todos los productos
      
      // Intentar primero con el endpoint de tienda
      let response;
      try {
        response = await api.get(
          `/api/tiendas/${slug}/categorias/${categoriaSlug}?page=${page}&limit=${limit}`
        );
      } catch (error) {
        // Si falla, intentar con el endpoint global de categorías
        console.log('Error con endpoint de tienda, intentando endpoint global:', error.message);
        try {
          response = await api.get(
            `/api/productos/categoria/${categoriaSlug}?page=${page}&limit=${limit}`
          );
        } catch (error2) {
          console.error('Error en ambos endpoints:', error2);
          throw error2;
        }
      }
      
      console.log('Respuesta de API recibida para categoría:', {
        tipo: typeof response.data,
        esArray: Array.isArray(response.data),
        keys: typeof response.data === 'object' ? Object.keys(response.data) : null,
        data: response.data
      });
      
      // La API debería retornar {productos: [...], paginacion: {...}}
      let productosData = response.data;
      
      // Intentar diferentes estructuras de respuesta
      if (!Array.isArray(response.data) && response.data.productos) {
        console.log('Usando datos desde response.data.productos');
        productosData = response.data.productos;
      } else if (!Array.isArray(response.data) && response.data.data) {
        console.log('Usando datos desde response.data.data');
        productosData = response.data.data;
      } else if (!Array.isArray(response.data) && response.data.items) {
        console.log('Usando datos desde response.data.items');
        productosData = response.data.items;
      }
      
      // Si la respuesta es un array directo (legacy)
      if (Array.isArray(response.data)) {
        console.log('Respuesta es array directo (modo legacy)');
        productosData = response.data;
      }
      
      if (!Array.isArray(productosData)) {
        console.warn('Los datos de productos por categoría no son un array:', productosData);
        return [];
      }
      
      console.log(`Se encontraron ${productosData.length} productos para la categoría ${categoriaSlug}`);
      
      // Normalizar productos y filtrar nulls
      const productos = productosData
        .map(productoService.normalizarProducto)
        .filter(p => p !== null);
      
      return productos;
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      // Retornar array vacío en lugar de lanzar error para que la UI pueda manejarlo
      if (error.response) {
        console.error('Error de respuesta:', error.response.status, error.response.data);
      }
      return [];
    }
  },

  /**
   * Busca productos por término de búsqueda
   * NOTA: Este método mantiene compatibilidad con código legacy.
   * Para nuevos desarrollos, usar tiendaService.buscarProductos() que incluye paginación.
   * @param {string} slug - Slug de la tienda
   * @param {string} query - Término de búsqueda
   * @param {Object} params - Parámetros opcionales (page, limit)
   */
  buscarProductos: async (slug, query, params = {}) => {
    try {
      const { page = 1, limit = 12 } = params;
      const response = await api.get(
        `/api/tiendas/${slug}/buscar?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      
      // La API debería retornar {productos: [...], paginacion: {...}}
      let productosData = response.data;
      
      if (!Array.isArray(response.data) && response.data.productos) {
        productosData = response.data.productos;
      }
      
      // Si la respuesta es un array directo (legacy)
      if (Array.isArray(response.data)) {
        productosData = response.data;
      }
      
      if (!Array.isArray(productosData)) {
        console.warn('Los datos de búsqueda no son un array:', productosData);
        return [];
      }
      
      // Normalizar productos
      const productos = productosData.map(productoService.normalizarProducto);
      return productos;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  },

  /**
   * Normaliza los datos de un producto para asegurar que tenga todas las propiedades necesarias
   * @param {Object} producto - Producto a normalizar
   * @returns {Object} Producto normalizado
   */
  normalizarProducto: (producto) => {
    if (!producto) return null;
    
    return {
      ...producto,
      // Asegurar que siempre hay un array de imágenes
      imagenes: producto.imagenes?.length ? producto.imagenes : [],
      // Asegurar que precio y stock tienen valores por defecto
      precio: producto.precio || 0,
      stock: typeof producto.stock === 'number' ? producto.stock : 0,
      // Preservar valores de descuento (no usar || 0 si el valor es 0 válido)
      descuento: producto.descuento !== undefined ? producto.descuento : 0,
      precioAnterior: producto.precioAnterior !== undefined ? producto.precioAnterior : 0,
      // Preservar el estado de oferta (puede ser boolean o string)
      enOferta: producto.enOferta === true || producto.enOferta === 'true' || producto.enOferta === 1,
      // Preservar porcentajeDescuento (no usar || 0 si el valor es 0 válido)
      porcentajeDescuento: producto.porcentajeDescuento !== undefined ? producto.porcentajeDescuento : 0,
      precioFinal: producto.precioFinal !== undefined ? producto.precioFinal : producto.precio || 0,
    };
  },

  // ============================================================================
  // ENDPOINTS GLOBALES DE PRODUCTOS (Sin contexto de tienda)
  // ============================================================================

  /**
   * Obtiene todos los productos del sistema (global)
   * @param {Object} params - Parámetros de consulta
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Productos por página
   * @param {string} params.sort - Ordenamiento
   * @param {boolean} params.destacado - Solo productos destacados
   * @param {boolean} params.enOferta - Solo productos en oferta
   * @param {string} params.search - Término de búsqueda
   * @returns {Object} Objeto con productos y paginación
   */
  obtenerTodosLosProductosGlobal: async (params = {}) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = '-createdAt',
        destacado,
        enOferta,
        search 
      } = params;
      
      let url = `/api/productos?page=${page}&limit=${limit}&sort=${sort}`;
      
      if (destacado !== undefined) {
        url += `&destacado=${destacado}`;
      }
      if (enOferta !== undefined) {
        url += `&enOferta=${enOferta}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await api.get(url);
      
      const data = response.data;
      
      return {
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => productoService.normalizarProducto(p))
          : [],
        paginacion: data.paginacion || {
          total: 0,
          paginas: 0,
          paginaActual: page,
          porPagina: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener productos globales:', error);
      throw error;
    }
  },

  /**
   * Obtiene un producto por su ID
   * @param {string} id - ID del producto
   * @returns {Object} Producto completo
   */
  obtenerProductoPorId: async (id) => {
    try {
      const response = await api.get(`/api/productos/${id}`);
      return productoService.normalizarProducto(response.data);
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }
  },

  /**
   * Obtiene productos por categoría (endpoint global)
   * @param {string} categoriaId - ID de la categoría
   * @param {Object} params - Parámetros de paginación
   * @returns {Object} Objeto con categoría, productos y paginación
   */
  obtenerProductosPorCategoriaGlobal: async (categoriaId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get(
        `/api/productos/categoria/${categoriaId}?page=${page}&limit=${limit}`
      );
      
      const data = response.data;
      
      return {
        categoria: data.categoria || '',
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => productoService.normalizarProducto(p))
          : [],
        paginacion: data.paginacion || {
          total: 0,
          paginas: 0,
          paginaActual: page,
          porPagina: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      throw error;
    }
  },

  /**
   * Obtiene productos por local/tienda
   * @param {string} localId - ID del local
   * @param {Object} params - Parámetros de paginación
   * @returns {Object} Objeto con local, productos y paginación
   */
  obtenerProductosPorLocal: async (localId, params = {}) => {
    try {
      const { page = 1, limit = 10 } = params;
      const response = await api.get(
        `/api/productos/local/${localId}?page=${page}&limit=${limit}`
      );
      
      const data = response.data;
      
      return {
        local: data.local || '',
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => productoService.normalizarProducto(p))
          : [],
        paginacion: data.paginacion || {
          total: 0,
          paginas: 0,
          paginaActual: page,
          porPagina: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener productos por local:', error);
      throw error;
    }
  },

  // ============================================================================
  // ENDPOINTS DE CATEGORÍAS
  // ============================================================================

  /**
   * Obtiene todas las categorías
   * @returns {Array} Array de categorías
   */
  obtenerCategorias: async () => {
    try {
      const response = await api.get('/api/categorias');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  /**
   * Obtiene una categoría por su ID
   * @param {string} id - ID de la categoría
   * @returns {Object} Categoría
   */
  obtenerCategoriaPorId: async (id) => {
    try {
      const response = await api.get(`/api/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error);
      throw error;
    }
  },

  /**
   * Obtiene las subcategorías de una categoría
   * @param {string} id - ID de la categoría padre
   * @returns {Array} Array de subcategorías
   */
  obtenerSubcategorias: async (id) => {
    try {
      const response = await api.get(`/api/categorias/${id}/subcategorias`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      throw error;
    }
  },

  /**
   * Obtiene categorías por local
   * @param {string} localId - ID del local
   * @returns {Array} Array de categorías
   */
  obtenerCategoriasPorLocal: async (localId) => {
    try {
      const response = await api.get(`/api/categorias/local/${localId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error al obtener categorías por local:', error);
      throw error;
    }
  },

  // ============================================================================
  // MÉTODO LEGACY (mantiene compatibilidad)
  // ============================================================================

  /**
   * Obtiene productos en oferta (con descuento) de una tienda
   * @param {string} slug - Slug de la tienda
   */
  obtenerProductosEnOferta: async (slug) => {
    try {
      console.log(`Obteniendo productos en oferta para la tienda: ${slug}`);
      
      // Paso 1: Obtener información de la tienda para obtener el localId
      // Según CORRECCION_FILTRO_LOCAL_OFERTAS.md, el localId puede estar en tienda._id o tienda.local._id
      let localId = null;
      try {
        const tiendaResponse = await api.get(`/api/tiendas/${slug}`);
        const tienda = tiendaResponse.data;
        
        // Intentar diferentes formas de obtener el localId
        if (tienda) {
          // Opción 1: localId está en tienda._id (si la tienda ES el local)
          if (tienda._id) {
            localId = tienda._id;
          }
          // Opción 2: localId está en tienda.local._id (si local es un objeto)
          if (tienda.local) {
            localId = tienda.local._id || tienda.local;
          }
          // Opción 3: localId está directamente en tienda.local (si es un string)
          if (!localId && typeof tienda.local === 'string') {
            localId = tienda.local;
          }
        }
        
        console.log('LocalId obtenido de la tienda:', localId);
        console.log('Estructura de tienda recibida:', {
          _id: tienda?._id,
          local: tienda?.local,
          localType: typeof tienda?.local
        });
      } catch (error) {
        console.error('Error al obtener el localId de la tienda:', error);
        // Si no podemos obtener el localId, lanzar error en lugar de continuar sin él
        throw new Error('No se pudo obtener el ID del local de la tienda');
      }
      
      // Paso 2: Validar que tenemos un localId
      if (!localId) {
        console.error('No se pudo obtener el localId de la tienda');
        throw new Error('No se pudo obtener el ID del local de la tienda');
      }
      
      // Paso 3: Usar el endpoint correcto según CORRECCION_FILTRO_LOCAL_OFERTAS.md
      // GET /api/productos?enOferta=true&local={localId}
      let response;
      try {
        response = await api.get(`/api/productos?enOferta=true&local=${localId}&page=1&limit=100`);
        console.log('✅ Usando endpoint con localId:', `/api/productos?enOferta=true&local=${localId}`);
      } catch (error) {
        // Manejar errores según el documento: 400 (ID inválido) y 404 (Local no encontrado)
        if (error.response?.status === 400) {
          console.error('❌ Error 400: ID de local inválido');
          throw new Error('ID de local inválido');
        } else if (error.response?.status === 404) {
          console.error('❌ Error 404: Local no encontrado');
          throw new Error('Local no encontrado');
        } else {
          console.error('❌ Error al obtener productos en oferta:', error);
          throw error;
        }
      }
      
      console.log('Respuesta completa del API:', response.data);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data) {
        console.warn('La respuesta no contiene datos de productos');
        return [];
      }
      
      // Según la especificación, el endpoint devuelve {productos: [...], paginacion: {...}}
      let productosData = [];
      
      if (response.data.productos && Array.isArray(response.data.productos)) {
        console.log('Usando datos desde response.data.productos, longitud:', response.data.productos.length);
        productosData = response.data.productos;
      } else if (Array.isArray(response.data)) {
        console.log('Respuesta es array directo, longitud:', response.data.length);
        productosData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Usando datos desde response.data.data, longitud:', response.data.data.length);
        productosData = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        console.log('Usando datos desde response.data.items, longitud:', response.data.items.length);
        productosData = response.data.items;
      }
      
      if (!Array.isArray(productosData) || productosData.length === 0) {
        console.warn('No se encontraron productos en oferta en la respuesta:', response.data);
        return [];
      }
      
      console.log(`Se encontraron ${productosData.length} productos en oferta desde el API`);
      
      // Verificar que todos los productos tienen enOferta === true (según la especificación)
      console.log('Verificando productos recibidos:');
      productosData.forEach((p, index) => {
        console.log(`Producto ${index + 1} (${p.nombre}):`, {
          enOferta: p.enOferta,
          porcentajeDescuento: p.porcentajeDescuento,
          precioAnterior: p.precioAnterior,
          precio: p.precio
        });
      });
      
      // El endpoint ya devuelve solo productos con enOferta=true, pero verificamos por seguridad
      // Normalizar los productos
      const productosEnOferta = productosData
        .map(productoService.normalizarProducto)
        .filter(p => p !== null && (p.enOferta === true || p.enOferta === 'true' || p.enOferta === 1));
      
      console.log(`Se encontraron ${productosEnOferta.length} productos en oferta después de normalizar:`, 
        productosEnOferta.map(p => ({
          id: p._id,
          nombre: p.nombre,
          enOferta: p.enOferta,
          porcentajeDescuento: p.porcentajeDescuento,
          descuento: p.descuento,
          precio: p.precio,
          precioAnterior: p.precioAnterior,
          precioFinal: p.precioFinal
        }))
      );
      
      return productosEnOferta;
    } catch (error) {
      console.error('Error al obtener productos en oferta:', error);
      throw error;
    }
  },
}; 