import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { carritoService } from '../../services/carritoService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CarritoModal = ({ isOpen, onClose }) => {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      cargarCarrito();
    }
  }, [isOpen, isAuthenticated]);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const data = await carritoService.obtenerCarrito();
      setCarrito(data);
    } catch (error) {
      toast.error('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarCantidad = async (productoId, nuevaCantidad) => {
    try {
      await carritoService.actualizarCantidad(productoId, nuevaCantidad);
      await cargarCarrito();
      toast.success('Cantidad actualizada');
    } catch (error) {
      toast.error('Error al actualizar la cantidad');
    }
  };

  const handleEliminarProducto = async (productoId) => {
    try {
      await carritoService.eliminarDelCarrito(productoId);
      await cargarCarrito();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleGuardarParaDespues = async (productoId) => {
    try {
      await carritoService.guardarParaDespues(productoId);
      await cargarCarrito();
      toast.success('Producto guardado para después');
    } catch (error) {
      toast.error('Error al guardar el producto');
    }
  };

  const handleProcederPago = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Tu Carrito</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : carrito.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Tu carrito está vacío</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {carrito.items.map((item) => (
                <div key={item.producto._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={item.producto.imagen}
                    alt={item.producto.nombre}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.producto.nombre}</h3>
                    <p className="text-gray-600">${item.producto.precio}</p>
                    {item.variante && (
                      <p className="text-sm text-gray-500">
                        Variante: {Object.entries(item.variante).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleActualizarCantidad(item.producto._id, item.cantidad - 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>
                    <span>{item.cantidad}</span>
                    <button
                      onClick={() => handleActualizarCantidad(item.producto._id, item.cantidad + 1)}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGuardarParaDespues(item.producto._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEliminarProducto(item.producto._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold">${carrito.total}</span>
              </div>
              <button
                onClick={handleProcederPago}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Proceder al pago
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CarritoModal; 