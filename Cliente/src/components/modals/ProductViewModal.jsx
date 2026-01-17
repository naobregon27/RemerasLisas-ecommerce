import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { agregarAlCarrito, fetchCarrito } from '../../store/carritoSlice';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const ProductViewModal = ({ isOpen, onClose, producto, loading }) => {
  const [cantidad, setCantidad] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch();
  const { tienda } = useSelector(state => state.tienda);
  
  // Colores de la tienda para estilos personalizados
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#3b82f6';
  const colorSecundario = tienda?.configuracion?.colorSecundario || '#60a5fa';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  // Adaptar para respuesta anidada
  const prod = producto?.producto || producto;
  const relacionados = producto?.productosRelacionados || [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    setCantidad(1);
    setSelectedImage(0);
    setIsAddingToCart(false);
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, producto]);

  if (!isOpen || !prod) return null;

  const {
    nombre,
    descripcion,
    precio,
    precioAnterior,
    precioFinal,
    imagenes = [],
    stock,
    categoria,
    caracteristicas = [],
    etiquetas = [],
    variantes = [],
    destacado,
    enOferta,
    porcentajeDescuento,
    calificacion,
    numeroReviews,
    reviews = [],
  } = prod;

  const handleAddToCart = async () => {
    if (isAddingToCart) return;
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      toast.error('Necesitas iniciar sesión para agregar productos al carrito');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await dispatch(agregarAlCarrito({ producto: prod, cantidad })).unwrap();
      
      // Actualizar el carrito después de agregar el producto
      dispatch(fetchCarrito());
      
      toast.success(`${nombre} agregado al carrito`);
      onClose();
    } catch (error) {
      toast.error('Error al agregar el producto al carrito');
      console.error('Error al agregar al carrito:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const incrementCantidad = () => {
    if (cantidad < stock) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const descuento = precioAnterior && precioAnterior > precioFinal
    ? Math.round(((precioAnterior - precioFinal) / precioAnterior) * 100)
    : porcentajeDescuento || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 overflow-auto transition-all duration-300 animate-fadeIn" style={{ backdropFilter: 'blur(8px)' }}>
      <div 
        className="relative glass-panel rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto animate-scaleIn"
        style={{ scrollbarWidth: 'thin', scrollbarColor: `${colorPrimario} #1f2a3d` }}
      >
        {/* Botón de cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white bg-[var(--color-navy-800)] rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 z-10 cursor-pointer"
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading && (
          <div className="absolute inset-0 glass-panel bg-opacity-95 flex items-center justify-center z-5 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full animate-spin" 
                style={{ 
                  borderWidth: '3px', 
                  borderStyle: 'solid',
                  borderColor: `${colorPrimario} transparent ${colorPrimario} transparent`
                }}
              ></div>
              <p className="text-white mt-4 font-medium">Cargando detalles del producto...</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Imágenes del producto */}
          <div className="w-full md:w-1/2 p-6">
            <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-[var(--color-navy-800)] border border-subtle shadow-[0_10px_25px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_35px_-16px_rgba(0,0,0,0.5)] transition-all duration-300">
              {imagenes && imagenes.length > 0 ? (
                <img 
                  src={imagenes[selectedImage]?.url || imagenes[selectedImage] || 'https://via.placeholder.com/400x400?text=Sin+imagen'} 
                  alt={nombre}
                  className="w-full h-full object-contain p-2 cursor-pointer"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Sin+imagen';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--color-navy-800)]">
                  <span className="text-muted">Sin imagen disponible</span>
                </div>
              )}
            </div>
            
            {/* Miniaturas de imágenes */}
            {imagenes && imagenes.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin" 
                   style={{ scrollbarWidth: 'thin', scrollbarColor: `${colorPrimario} #f1f1f1` }}>
                {imagenes.map((img, index) => (
                  <button
                    key={index}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-0 transition-all duration-200 ${
                      index === selectedImage 
                        ? 'shadow-[0_5px_15px_-5px_rgba(0,0,0,0.3)] transform scale-105' 
                        : 'opacity-70 hover:opacity-100 shadow-sm hover:shadow'
                    }`}
                    style={{ 
                      borderColor: index === selectedImage ? colorPrimario : 'transparent',
                      boxShadow: index === selectedImage ? `0 0 0 2px ${colorPrimario}` : ''
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={img.url || img} 
                      alt={`${nombre} - imagen ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="w-full md:w-1/2 p-6">
            {/* Título y categoría */}
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">{nombre}</h2>
              {categoria && (
                <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-navy-800)] text-white border border-subtle">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {categoria.nombre}
                </div>
              )}
            </div>

            {/* Precio */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: colorPrimario }}>{formatPrice(precioFinal || precio)}</span>
                {precioAnterior > 0 && precioAnterior > (precioFinal || precio) && (
                  <>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(precioAnterior)}</span>
                    <span className="text-sm font-medium text-white px-2 py-1 rounded-md ml-2" 
                          style={{ backgroundColor: '#e53e3e' }}>
                      {descuento}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="mb-6 flex items-center">
              {stock > 0 ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  <span className="font-medium text-green-700">
                    En stock <span className="text-gray-600 font-normal">({stock} disponibles)</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
                  <span className="font-medium text-red-600">Agotado</span>
                </>
              )}
            </div>

            {/* Descripción */}
            {descripcion && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Descripción
                </h3>
                <p className="text-muted leading-relaxed">{descripcion}</p>
              </div>
            )}

            {/* Características */}
            {caracteristicas && caracteristicas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Características
                </h3>
                <div className="bg-[var(--color-navy-800)] rounded-lg p-3 border border-subtle">
                  <ul className="space-y-1 text-muted">
                    {caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex items-start py-1">
                        <span className="text-xs bg-[var(--color-green-700)] text-white rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                        <span><span className="font-medium text-white">{caracteristica.nombre}:</span> {caracteristica.valor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Etiquetas */}
            {etiquetas && etiquetas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Etiquetas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {etiquetas.map((etiqueta, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-navy-800)] text-white border border-subtle">
                      {etiqueta}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Controles de cantidad y botón para agregar al carrito */}
            {stock > 0 && (
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-4">
                  <div className="flex items-center">
                    <span className="mr-4 text-white font-medium">Cantidad:</span>
                    <div className="flex items-center border border-subtle rounded-lg overflow-hidden shadow-sm bg-[var(--color-navy-800)]">
                      <button 
                        onClick={decrementCantidad}
                        disabled={cantidad <= 1}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-[var(--color-navy-700)] disabled:opacity-50 disabled:hover:bg-[var(--color-navy-800)] transition-colors cursor-pointer text-lg font-medium"
                        aria-label="Disminuir cantidad"
                      >
                        −
                      </button>
                      <span className="w-12 text-center font-medium text-white">{cantidad}</span>
                      <button 
                        onClick={incrementCantidad}
                        disabled={cantidad >= stock}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-[var(--color-navy-700)] disabled:opacity-50 disabled:hover:bg-[var(--color-navy-800)] transition-colors cursor-pointer text-lg font-medium"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted">
                    {stock > 10 ? 'Más de 10 disponibles' : `${stock} disponibles`}
                  </div>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-4 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer transform hover:translate-y-[-2px]"
                  style={{ 
                    backgroundColor: colorPrimario, 
                    color: colorTexto,
                    boxShadow: isAddingToCart ? 'none' : `0 4px 6px rgba(${parseInt(colorPrimario.slice(1, 3), 16)}, ${parseInt(colorPrimario.slice(3, 5), 16)}, ${parseInt(colorPrimario.slice(5, 7), 16)}, 0.25)`
                  }}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-3"></div>
                      Agregando al carrito...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        {relacionados && relacionados.length > 0 && (
          <div className="border-t border-subtle pt-6 px-6 pb-8 bg-[var(--color-navy-800)]">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Productos relacionados
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((relacionado, index) => (
                <div 
                  key={index} 
                  className="glass-panel rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:translate-y-[-5px]"
                >
                  <div className="aspect-square bg-[var(--color-navy-900)] relative overflow-hidden">
                    <img 
                      src={relacionado.imagenes?.[0]?.url || relacionado.imagenes?.[0] || relacionado.imagen || 'https://via.placeholder.com/200x200?text=Sin+imagen'} 
                      alt={relacionado.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-pointer"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200?text=Sin+imagen';
                      }}
                    />
                    {relacionado.porcentajeDescuento > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                        -{relacionado.porcentajeDescuento}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-white text-sm line-clamp-2 h-10">{relacionado.nombre}</h4>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="font-semibold" style={{ color: colorPrimario }}>{formatPrice(relacionado.precioFinal || relacionado.precio)}</p>
                      <button 
                        className="p-1.5 rounded-full bg-[var(--color-navy-700)] hover:bg-[var(--color-navy-600)] transition-colors cursor-pointer"
                        aria-label="Ver producto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estilos para animaciones y scroll */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: ${colorPrimario};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ProductViewModal;