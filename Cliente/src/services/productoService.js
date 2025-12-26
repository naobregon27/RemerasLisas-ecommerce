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
      
      const { page = 1, limit = 12 } = params;
      const response = await api.get(
        `/api/tiendas/${slug}/categorias/${categoriaSlug}?page=${page}&limit=${limit}`
      );
      
      console.log('Respuesta de API recibida para categoría:', {
        tipo: typeof response.data,
        esArray: Array.isArray(response.data),
        keys: typeof response.data === 'object' ? Object.keys(response.data) : null
      });
      
      // La API debería retornar {productos: [...], paginacion: {...}}
      let productosData = response.data;
      
      if (!Array.isArray(response.data) && response.data.productos) {
        console.log('Usando datos desde response.data.productos');
        productosData = response.data.productos;
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
      
      // Normalizar productos
      const productos = productosData.map(productoService.normalizarProducto);
      return productos;
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      throw error;
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
      descuento: producto.descuento || 0,
      precioAnterior: producto.precioAnterior || 0,
      // Asegurar que los campos de oferta están definidos
      enOferta: producto.enOferta || false,
      porcentajeDescuento: producto.porcentajeDescuento || 0,
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
      // Primero obtenemos todos los productos
      const response = await api.get(`/api/tiendas/${slug}/productos`);
      
      console.log('Respuesta completa del API:', response.data);
      
      // Verificar que la respuesta tenga la estructura esperada
      if (!response.data) {
        console.warn('La respuesta no contiene datos de productos');
        return [];
      }
      
      // Extraer el array de productos
      let productosData = response.data;
      
      if (!Array.isArray(response.data) && response.data.productos) {
        console.log('Usando datos desde response.data.productos, longitud:', response.data.productos.length);
        productosData = response.data.productos;
      }
      
      if (!Array.isArray(response.data) && response.data.data) {
        console.log('Usando datos desde response.data.data, longitud:', response.data.data.length);
        productosData = response.data.data;
      }
      
      if (!Array.isArray(response.data) && response.data.items) {
        console.log('Usando datos desde response.data.items, longitud:', response.data.items.length);
        productosData = response.data.items;
      }
      
      if (!Array.isArray(productosData)) {
        console.warn('Los datos de productos no son un array:', productosData);
        return [];
      }
      
      console.log(`Se encontraron ${productosData.length} productos totales`);
      
      // Imprimir todos los campos de cada producto para encontrar los correctos
      console.log('TODOS LOS CAMPOS DE PRODUCTOS RECIBIDOS:');
      productosData.forEach((p, index) => {
        console.log(`Producto ${index + 1} (${p.nombre}):`);
        console.log('ID:', p._id);
        console.log('Campos de oferta:', {
          enOferta: p.enOferta,
          porcentajeDescuento: p.porcentajeDescuento,
          descuento: p.descuento,
          precioAnterior: p.precioAnterior,
          precio: p.precio,
          precioFinal: p.precioFinal
        });
        console.log('Todos los campos:', Object.keys(p));
      });
      
      // Normalizar todos los productos
      const productos = productosData.map(productoService.normalizarProducto);
      
      // Ahora probemos diferentes condiciones para encontrar productos en oferta
      console.log('PROBANDO DIFERENTES CONDICIONES:');
      
      const ofertasDirectas = productosData.filter(p => p.enOferta === true);
      console.log('Productos con enOferta === true:', ofertasDirectas.length);
      
      const ofertasPorcentaje = productosData.filter(p => p.porcentajeDescuento > 0);
      console.log('Productos con porcentajeDescuento > 0:', ofertasPorcentaje.length);
      
      const ofertasDescuento = productosData.filter(p => p.descuento > 0);
      console.log('Productos con descuento > 0:', ofertasDescuento.length);
      
      const ofertasPrecioAnterior = productosData.filter(p => p.precioAnterior && p.precioAnterior > p.precio);
      console.log('Productos con precioAnterior > precio:', ofertasPrecioAnterior.length);
      
      // Probar una condición más amplia
      const posiblesOfertas = productosData.filter(p => 
        p.enOferta === true || 
        (p.porcentajeDescuento && p.porcentajeDescuento > 0) || 
        (p.descuento && p.descuento > 0) || 
        (p.precioAnterior && p.precio && p.precioAnterior > p.precio) ||
        (p.precioFinal && p.precio && p.precioFinal < p.precio)
      );
      
      console.log('Posibles ofertas con condición ampliada:', posiblesOfertas.length);
      if (posiblesOfertas.length > 0) {
        console.log('Ejemplos de posibles ofertas:', posiblesOfertas.map(p => ({
          id: p._id,
          nombre: p.nombre,
          enOferta: p.enOferta,
          porcentajeDescuento: p.porcentajeDescuento,
          descuento: p.descuento,
          precio: p.precio,
          precioAnterior: p.precioAnterior,
          precioFinal: p.precioFinal
        })));
      }
      
      // Filtrar productos en oferta con criterio ampliado
      const productosEnOferta = productos.filter(p => 
        p.enOferta === true || 
        (p.porcentajeDescuento && p.porcentajeDescuento > 0) || 
        (p.descuento && p.descuento > 0) || 
        (p.precioAnterior && p.precio && p.precioAnterior > p.precio) ||
        (p.precioFinal && p.precio && p.precioFinal < p.precio)
      );
      
      console.log(`Se encontraron ${productosEnOferta.length} productos en oferta:`, 
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