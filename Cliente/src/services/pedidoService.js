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
      
      // Validar que la respuesta tenga la estructura esperada
      if (response.data && response.data.metodoPago === 'mercadopago') {
        if (!response.data.mercadopago) {
          console.warn('Pedido creado pero sin datos de Mercado Pago');
        } else {
          // Verificar si hay error en la creación de la preferencia
          if (response.data.mercadopago.error) {
            console.error('Error en Mercado Pago:', response.data.mercadopago.message || response.data.mercadopago.error);
          }
          // Verificar que tengamos al menos una URL de pago (initPoint o sandboxInitPoint)
          else if (!response.data.mercadopago.initPoint && !response.data.mercadopago.sandboxInitPoint) {
            console.warn('Pedido creado pero no se obtuvo URL de pago (initPoint ni sandboxInitPoint). Mercado Pago puede no estar configurado correctamente.');
          } else {
            // Log para debugging: mostrar qué URL se usará
            const urlPago = response.data.mercadopago.initPoint || response.data.mercadopago.sandboxInitPoint;
            console.log('✅ URL de pago de Mercado Pago obtenida:', urlPago ? 'Sí' : 'No');
            if (urlPago) {
              console.log('Tipo de URL:', response.data.mercadopago.initPoint ? 'Producción (initPoint)' : 'Sandbox (sandboxInitPoint)');
            }
          }
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      
      // Si el error viene del servidor pero el pedido se creó (status 201)
      if (error.response?.status === 201 || error.response?.status === 200) {
        console.warn('El backend devolvió éxito pero puede haber errores en la respuesta');
        return error.response.data;
      }
      
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
  },

  /**
   * Verifica el estado de un pago de Mercado Pago
   * @param {string} pedidoId - ID del pedido
   * @returns {Promise<Object>} Estado del pago
   */
  verificarEstadoPago: async (pedidoId) => {
    try {
      const response = await api.get(`/api/mercadopago/pedido/${pedidoId}/estado`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar estado del pago:', error);
      throw error.response?.data || error;
    }
  }
};

export default pedidoService; 