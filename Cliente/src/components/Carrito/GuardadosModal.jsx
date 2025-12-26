import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { carritoService } from '../../services/carritoService';
import { toast } from 'react-toastify';

const GuardadosModal = ({ isOpen, onClose }) => {
  const [guardados, setGuardados] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      cargarGuardados();
    }
  }, [isOpen, isAuthenticated]);

  const cargarGuardados = async () => {
    try {
      setLoading(true);
      const data = await carritoService.obtenerCarrito();
      setGuardados(data.guardados || []);
    } catch (error) {
      toast.error('Error al cargar los productos guardados');
    } finally {
      setLoading(false);
    }
  };

  const handleMoverACarrito = async (productoId) => {
    try {
      await carritoService.moverACarrito(productoId);
      await cargarGuardados();
      toast.success('Producto movido al carrito');
    } catch (error) {
      toast.error('Error al mover el producto al carrito');
    }
  };

  const handleEliminarGuardado = async (productoId) => {
    try {
      await carritoService.eliminarProducto(productoId);
      await cargarGuardados();
      toast.success('Producto eliminado de guardados');
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Guardados para después</h2>
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
        ) : guardados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tienes productos guardados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guardados.map((item) => (
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMoverACarrito(item.producto._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Mover al carrito
                  </button>
                  <button
                    onClick={() => handleEliminarGuardado(item.producto._id)}
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
        )}
      </div>
    </div>
  );
};

export default GuardadosModal; 