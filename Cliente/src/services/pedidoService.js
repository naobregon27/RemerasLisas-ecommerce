import api from './api';

export const pedidoService = {
  /**
   * Crea un nuevo pedido
   * @param {Object} pedidoData - Datos del pedido a crear
   * @returns {Promise<Object>} Los datos del pedido creado
   */
  crearPedido: async (pedidoData) => {
    try {
      const response = await api.post('/api/pedidos', pedidoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene los pedidos del usuario
   * @returns {Promise<Array>} Lista de pedidos del usuario
   */
  obtenerPedidos: async () => {
    try {
      const response = await api.get('/api/pedidos');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  /**
   * Obtiene los pedidos actuales del usuario autenticado
   * @returns {Promise<Array>} Lista de pedidos en curso del usuario
   */
  obtenerMisPedidos: async () => {
    try {
      const response = await api.get('/api/pedidos/mispedidos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis pedidos:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtiene un pedido específico por ID
   * @param {string} pedidoId - ID del pedido a obtener
   * @returns {Promise<Object>} Datos del pedido
   */
  obtenerPedidoPorId: async (pedidoId) => {
    try {
      const response = await api.get(`/api/pedidos/${pedidoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default pedidoService; 