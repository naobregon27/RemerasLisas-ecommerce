import api from './api';

export const tiendaService = {
  /**
   * Obtiene la información de una tienda por su slug
   * @param {string} slug - Slug de la tienda
   */
  obtenerTienda: async (slug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}`);
      return tiendaService.normalizarTienda(response.data);
    } catch (error) {
      console.error('Error al obtener la tienda:', error);
      throw error;
    }
  },

  /**
   * Obtiene la configuración pública de una tienda
   * @param {string} slug - Slug de la tienda
   */
  obtenerConfiguracionPublica: async (slug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}/configuracion/publica`);
      console.log('Configuración de tienda recibida:', response.data);
      return response.data.configuracionTienda;
    } catch (error) {
      console.error('Error al obtener configuración de la tienda:', error);
      throw error;
    }
  },

  /**
   * Obtiene los productos destacados de una tienda
   * @param {string} slug - Slug de la tienda
   */
  obtenerDestacados: async (slug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}/destacados`);
      
      // Normalizar los productos destacados
      const productosNormalizados = Array.isArray(response.data) 
        ? response.data.map(producto => tiendaService.normalizarProducto(producto))
        : [];
        
      return productosNormalizados;
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las categorías de una tienda
   * @param {string} slug - Slug de la tienda
   */
  obtenerCategorias: async (slug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}/categorias`);
      
      // Normalizar las categorías
      const categoriasNormalizadas = Array.isArray(response.data)
        ? response.data.map(categoria => tiendaService.normalizarCategoria(categoria))
        : [];
        
      return categoriasNormalizadas;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },
  
  /**
   * Normaliza los datos de un producto
   * @param {Object} producto - Producto a normalizar
   * @returns {Object} Producto normalizado
   */
  normalizarProducto: (producto) => {
    if (!producto) return null;
    
    // Asegurarnos de que imagenes siempre sea un array de strings válidos o objetos con url
    let imagenes = [];
    if (producto.imagenes) {
      if (Array.isArray(producto.imagenes)) {
        // Mantener el array de imágenes tal como está, ya que los componentes ahora pueden manejar
        // tanto strings como objetos con propiedad url
        imagenes = producto.imagenes;
      } else if (typeof producto.imagenes === 'string') {
        // Si es una única cadena, convertirla en array
        imagenes = [producto.imagenes];
      } else if (typeof producto.imagenes === 'object' && producto.imagenes.url) {
        // Si es un objeto único con url, convertirlo en array
        imagenes = [producto.imagenes];
      }
    }
    
    return {
      ...producto,
      imagenes: imagenes,
      precio: producto.precio || 0,
      stock: typeof producto.stock === 'number' ? producto.stock : 0,
      descuento: producto.descuento || 0,
      precioAnterior: producto.precioAnterior || 0
    };
  },
  
  /**
   * Normaliza los datos de una categoría
   * @param {Object} categoria - Categoría a normalizar
   * @returns {Object} Categoría normalizada
   */
  normalizarCategoria: (categoria) => {
    if (!categoria) return null;
    
    return {
      ...categoria,
      nombre: categoria.nombre || 'Categoría sin nombre',
      descripcion: categoria.descripcion || '',
      _id: categoria._id || `cat-${Math.random().toString(36).substr(2, 9)}`
    };
  },
  
  /**
   * Obtiene productos por categoría con paginación
   * @param {string} slug - Slug de la tienda
   * @param {string} categoriaSlug - Slug de la categoría
   * @param {Object} params - Parámetros de paginación (page, limit)
   * @returns {Object} Objeto con productos y paginación
   */
  obtenerProductosPorCategoria: async (slug, categoriaSlug, params = {}) => {
    try {
      const { page = 1, limit = 12 } = params;
      const response = await api.get(
        `/api/tiendas/${slug}/categorias/${categoriaSlug}?page=${page}&limit=${limit}`
      );
      
      // La respuesta debe tener estructura { productos: [], paginacion: {} }
      const data = response.data;
      
      return {
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => tiendaService.normalizarProducto(p))
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
   * Busca productos en la tienda con paginación
   * @param {string} slug - Slug de la tienda
   * @param {string} query - Término de búsqueda
   * @param {Object} params - Parámetros de paginación (page, limit)
   * @returns {Object} Objeto con productos encontrados y paginación
   */
  buscarProductos: async (slug, query, params = {}) => {
    try {
      const { page = 1, limit = 12 } = params;
      const response = await api.get(
        `/api/tiendas/${slug}/buscar?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      
      const data = response.data;
      
      return {
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => tiendaService.normalizarProducto(p))
          : [],
        paginacion: data.paginacion || {
          total: 0,
          paginas: 0,
          paginaActual: page,
          porPagina: limit
        }
      };
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  },

  /**
   * Obtiene el detalle completo de un producto
   * @param {string} slug - Slug de la tienda
   * @param {string} productoSlug - Slug del producto
   * @returns {Object} Objeto con el producto y productos relacionados
   */
  obtenerDetalleProducto: async (slug, productoSlug) => {
    try {
      const response = await api.get(`/api/tiendas/${slug}/productos/${productoSlug}`);
      
      const data = response.data;
      
      return {
        producto: data.producto 
          ? tiendaService.normalizarProducto(data.producto)
          : null,
        productosRelacionados: Array.isArray(data.productosRelacionados)
          ? data.productosRelacionados.map(p => tiendaService.normalizarProducto(p))
          : []
      };
    } catch (error) {
      console.error('Error al obtener detalle del producto:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los productos de la tienda con paginación y ordenamiento
   * @param {string} slug - Slug de la tienda
   * @param {Object} params - Parámetros (page, limit, ordenar)
   * @returns {Object} Objeto con productos y paginación
   */
  obtenerTodosLosProductos: async (slug, params = {}) => {
    try {
      const { page = 1, limit = 12, ordenar = '' } = params;
      
      let url = `/api/tiendas/${slug}/productos?page=${page}&limit=${limit}`;
      if (ordenar) {
        url += `&ordenar=${ordenar}`;
      }
      
      const response = await api.get(url);
      
      const data = response.data;
      
      return {
        productos: Array.isArray(data.productos)
          ? data.productos.map(p => tiendaService.normalizarProducto(p))
          : [],
        paginacion: data.paginacion || {
          total: 0,
          paginas: 0,
          paginaActual: page,
          porPagina: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener todos los productos:', error);
      throw error;
    }
  },
  
  /**
   * Normaliza los datos de una tienda
   * @param {Object} tienda - Tienda a normalizar
   * @returns {Object} Tienda normalizada
   */
  normalizarTienda: (tienda) => {
    if (!tienda) return null;
    
    return {
      ...tienda,
      nombre: tienda.nombre || 'Tienda Online',
      descripcion: tienda.descripcion || 'Tu tienda online de confianza',
      logo: tienda.logo || '',
      imagenBanner: tienda.imagenBanner || '',
      colorPrimario: tienda.colorPrimario || 'bg-blue-600',
      colorSecundario: tienda.colorSecundario || 'bg-blue-700',
      colorTexto: tienda.colorTexto || 'text-white',
      categorias: Array.isArray(tienda.categorias) 
        ? tienda.categorias.map(c => tiendaService.normalizarCategoria(c))
        : []
    };
  }
}; 