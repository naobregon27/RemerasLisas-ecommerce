import api from './api';

export const carritoService = {
  /**
   * Obtiene todos los items del carrito
   */
  obtenerCarrito: async () => {
    try {
      const response = await api.get('/api/carrito');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Agrega un producto al carrito
   * @param {Object|string} productoOId - Producto completo, ID del producto, u objeto con parámetros {productoId, cantidad, variante}
   * @param {number} cantidad - Cantidad a agregar (si primer parámetro no es objeto con productoId)
   * @param {Object} variante - Variante del producto (talle, color, etc.)
   */
  agregarAlCarrito: async (productoOId, cantidad = 1, variante = {}) => {
    try {
      let productoId, cant, var_;
      
      // Detectar la forma en que se está llamando al método
      if (typeof productoOId === 'object' && productoOId.productoId) {
        // Nueva forma: { productoId, cantidad, variante }
        productoId = productoOId.productoId;
        cant = productoOId.cantidad || 1;
        var_ = productoOId.variante || {};
      } else if (typeof productoOId === 'object' && productoOId._id) {
        // Forma antigua: (producto, cantidad, variante)
        productoId = productoOId._id;
        cant = cantidad;
        var_ = variante;
      } else if (typeof productoOId === 'string') {
        // Forma con ID directo: (id, cantidad, variante)
        productoId = productoOId;
        cant = cantidad;
        var_ = variante;
      } else {
        throw new Error('Formato de parámetros no válido');
      }
      
      const response = await api.post('/api/carrito', {
        productoId,
        cantidad: cant,
        variante: var_
      });
      return response.data;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {string} productoId - ID del producto
   * @param {number} cantidad - Nueva cantidad
   * @param {Object} variante - Variante del producto (talle, color, etc.)
   */
  actualizarCantidad: async (productoId, cantidad, variante = {}) => {
    try {
      const response = await api.put(`/api/carrito/${productoId}`, {
        cantidad,
        variante
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Elimina un producto del carrito
   * @param {string} productoId - ID del producto a eliminar
   * @param {Object} variante - Variante del producto (talle, color, etc.)
   */
  eliminarDelCarrito: async (productoId, variante = {}) => {
    try {
      const response = await api.delete(`/api/carrito/${productoId}`, {
        data: {
          variante
        }
      });
      
      if (response.status !== 200) {
        throw new Error(`Error al eliminar producto: ${response.statusText}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en eliminarDelCarrito:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Vacía el carrito
   */
  vaciarCarrito: async () => {
    try {
      const response = await api.delete('/api/carrito');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Calcula el total del carrito
   * @param {Array} items - Items del carrito
   */
  calcularTotal: (items) => {
    return items.reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad);
    }, 0);
  },

  /**
   * Guardar producto para después
   * @param {string} productoId - ID del producto
   * @param {Object} variante - Variante del producto (talle, color, etc.)
   */
  guardarParaDespues: async (productoId, variante = {}) => {
    try {
      const response = await api.post(`/api/carrito/guardar/${productoId}`, {
        variante
      });
      return response.data;
    } catch (error) {
      console.error('Error al guardar para después:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Mover producto de guardados al carrito
   * @param {string} productoId - ID del producto
   * @param {number} cantidad - Cantidad a agregar
   * @param {Object} variante - Variante del producto (talle, color, etc.)
   */
  moverACarrito: async (productoId, cantidad = 1, variante = {}) => {
    try {
      const response = await api.post(`/api/carrito/mover/${productoId}`, {
        variante,
        cantidad
      });
      return response.data;
    } catch (error) {
      console.error('Error al mover a carrito:', error);
      throw error.response?.data || error;
    }
  }
}; 