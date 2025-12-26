import { useDispatch, useSelector } from 'react-redux';
import { actualizarCantidad, eliminarDelCarrito, logCarritoState } from '../../store/carritoSlice';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const ModalCarrito = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { items = [], total = 0, loading } = useSelector((state) => state.carrito);
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();

  // Verificar la estructura solo al abrirse el modal, no en cada render
  useEffect(() => {
    if (isOpen && items.length > 0) {
      console.log('Modal carrito abierto con items:', items.length);
      // Solo activar log en desarrollo si es necesario
      // dispatch(logCarritoState());
    }
  }, [isOpen, items.length, dispatch]);

  const handleActualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    try {
      await dispatch(actualizarCantidad({ productoId, cantidad: nuevaCantidad })).unwrap();
      toast.success('Cantidad actualizada');
    } catch (error) {
      console.error('Error al actualizar la cantidad:', error);
      toast.error('Error al actualizar la cantidad');
    }
  };

  const handleEliminarProducto = async (productoId) => {
    try {
      await dispatch(eliminarDelCarrito(productoId)).unwrap();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" style={{ alignItems: 'center' }}>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal centrado */}
      <div className="relative glass-panel rounded-xl shadow-2xl w-full max-w-2xl z-10 max-h-[90vh] overflow-hidden my-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Carrito de Compras</h3>
            <button 
              onClick={onClose}
              className="text-muted hover:text-white focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-green-500)]/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-[var(--color-green-500)] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white mt-4">Cargando tu carrito...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-green-500)]/20 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[var(--color-green-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-white text-lg mb-2">Tu carrito está vacío</p>
              <p className="text-muted mb-6">Agrega productos para comenzar tu compra</p>
              <Link 
                to={`/${tiendaSlug}/productos`} 
                onClick={onClose}
                className="btn-primary px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all inline-block"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => {
                if (!item.producto) {
                  console.error(`Producto no encontrado en item:`, item);
                  return null;
                }
                
                const productoId = item.producto._id || item.producto.id;
                const precio = item.producto.precio || item.precioUnitario || 0;
                const cantidad = item.cantidad;

                return (
                  <div
                    key={productoId}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-[var(--color-navy-800)]/50 backdrop-blur-sm border border-subtle hover:border-[var(--color-green-500)]/30 transition-all"
                  >
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-navy-700)]">
                        <img
                          src={(() => {
                            // Verificar si el producto tiene imágenes como array
                            if (item.producto.imagenes && Array.isArray(item.producto.imagenes) && item.producto.imagenes.length > 0) {
                              const imagen = item.producto.imagenes[0];
                              // Si es un objeto con url
                              if (typeof imagen === 'object' && imagen.url) {
                                return imagen.url;
                              }
                              // Si es un string
                              if (typeof imagen === 'string') {
                                return imagen;
                              }
                            }
                            
                            // Si hay una propiedad imagen directa en el producto
                            if (item.producto.imagen) {
                              // Si es un string
                              if (typeof item.producto.imagen === 'string') {
                                // Si es base64 o url completa
                                if (item.producto.imagen.startsWith('data:') || item.producto.imagen.startsWith('http')) {
                                  return item.producto.imagen;
                                }
                                // Si es ruta relativa
                                return `${import.meta.env.VITE_API_URL}/uploads/${item.producto.imagen}`;
                              }
                            }
                            
                            // Si no hay imagen válida
                            return 'https://via.placeholder.com/400?text=Sin+imagen';
                          })()}
                          alt={item.producto.nombre}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen';
                          }}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white line-clamp-1 mb-1">{item.producto.nombre}</h4>
                        <p className="text-[var(--color-green-500)] font-bold">${parseFloat(precio).toLocaleString('es-AR')}</p>
                        <div className="flex items-center mt-3 space-x-2">
                          <button
                            className="w-8 h-8 rounded-lg bg-[var(--color-navy-700)] hover:bg-[var(--color-navy-600)] border border-subtle flex items-center justify-center transition-all"
                            onClick={() => handleActualizarCantidad(productoId, cantidad - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-sm font-bold text-white w-8 text-center">{cantidad}</span>
                          <button
                            className="w-8 h-8 rounded-lg bg-[var(--color-green-500)] hover:bg-[var(--color-green-400)] flex items-center justify-center transition-all"
                            onClick={() => handleActualizarCantidad(productoId, cantidad + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-lg font-bold text-white">
                          ${parseFloat(precio * cantidad).toLocaleString('es-AR')}
                        </span>
                        <button
                          className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 transition-colors group"
                          onClick={() => handleEliminarProducto(productoId)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-subtle">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-muted">Total:</span>
                  <span className="text-3xl font-bold text-[var(--color-green-500)]">${total}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      navigate(`/${tiendaSlug}/carrito`);
                      onClose();
                    }}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[var(--color-green-500)] text-[var(--color-green-500)] font-semibold hover:bg-[var(--color-green-500)] hover:text-white transition-all"
                  >
                    Ver carrito completo
                  </button>
                  <Link
                    to={`/${tiendaSlug}/carrito`}
                    onClick={onClose}
                    className="w-full flex justify-center items-center px-4 py-3 rounded-lg bg-[var(--color-green-500)] text-white font-semibold hover:bg-[var(--color-green-400)] transition-all"
                  >
                    Finalizar compra
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ModalCarrito; 