import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { agregarAlCarrito, fetchCarrito } from '../../store/carritoSlice';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

const ProductCard = ({ producto, onClick, compact = false }) => {
  const { tiendaSlug } = useParams();
  const dispatch = useDispatch();
  const [hasValidImage, setHasValidImage] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Verificar que el producto tenga todas las propiedades necesarias
  if (!producto) return null;
  
  // Extraer las propiedades del producto con valores por defecto
  const {
    _id = '',
    nombre = 'Producto sin nombre',
    precio = 0,
    precioAnterior = 0,
    descuento = 0,
    porcentajeDescuento = 0,
    enOferta = false,
    imagenes = [],
    stock = 0,
    slug = '',
  } = producto;
  
  // Calcula el precio con descuento
  // Solo aplicar descuento si el producto está explícitamente en oferta o tiene precioAnterior
  let descuentoAplicable = 0;
  let precioFinal = precio;
  
  if (enOferta === true) {
    // Si está en oferta, usar porcentajeDescuento o calcular desde precioAnterior
    if (porcentajeDescuento > 0) {
      descuentoAplicable = porcentajeDescuento;
      precioFinal = precio * (1 - descuentoAplicable / 100);
    } else if (precioAnterior > 0 && precioAnterior > precio) {
      // Calcular descuento desde precioAnterior
      descuentoAplicable = Math.round(((precioAnterior - precio) / precioAnterior) * 100);
      precioFinal = precio;
    } else if (descuento > 0) {
      descuentoAplicable = descuento;
      precioFinal = precio * (1 - descuentoAplicable / 100);
    }
  } else if (precioAnterior > 0 && precioAnterior > precio) {
    // Si tiene precioAnterior mayor, calcular descuento
    descuentoAplicable = Math.round(((precioAnterior - precio) / precioAnterior) * 100);
    precioFinal = precio;
  }
  
  // Obtiene la URL de la primera imagen o usa un placeholder
  const imagen = imagenes && imagenes.length > 0 
    ? (typeof imagenes[0] === 'string' 
      ? imagenes[0] 
      : (imagenes[0].url || '/placeholder.png'))
    : '/placeholder.png';
  
  // Genera la URL para ver el detalle del producto
  const productoUrl = `/${tiendaSlug}/producto/${_id}`;
  
  // Verificamos si el producto tiene descuento - SOLO si realmente está en oferta o tiene precioAnterior
  const tieneDescuento = (enOferta === true && descuentoAplicable > 0) || (precioAnterior > 0 && precioAnterior > precio);
  
  // Manejar errores en la carga de imágenes
  const handleImageError = () => {
    setHasValidImage(false);
  };
  
  // Manejar agregar al carrito
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      toast.error('Por favor debe logearse para agregar productos al carrito');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await dispatch(agregarAlCarrito({ producto, cantidad: 1 })).unwrap();
      
      // Actualizar el carrito después de agregar el producto
      dispatch(fetchCarrito());
      
      toast.success(`${nombre} agregado al carrito`);
    } catch (error) {
      toast.error('Error al agregar el producto al carrito');
      console.error('Error al agregar al carrito:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div 
      className={`glass-panel rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ${compact ? 'text-sm' : 'text-base'}`}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={imagen} 
          alt={nombre} 
          className="w-full aspect-square object-cover"
          onError={(e) => { e.target.src = '/placeholder.png' }}
        />
        
        {/* Badge de descuento */}
        {tieneDescuento && (
          <div className={`absolute top-2 right-2 bg-red-500 text-white ${compact ? 'text-xs px-2 py-1' : 'px-2 py-1'} rounded-full font-bold`}>
            -{descuentoAplicable}%
          </div>
        )}
        
        {/* Badge de stock bajo */}
        {stock > 0 && stock < 5 && (
          <div className={`absolute bottom-2 left-2 bg-amber-500 text-white ${compact ? 'text-xs px-2 py-1' : 'px-2 py-1'} rounded-full font-medium`}>
            ¡Pocas unidades!
          </div>
        )}
        
        {/* Badge de sin stock */}
        {stock === 0 && (
          <div className={`absolute bottom-2 left-2 bg-red-500 text-white ${compact ? 'text-xs px-2 py-1' : 'px-2 py-1'} rounded-full font-medium`}>
            Agotado
          </div>
        )}
      </div>
      
      <div className={`p-${compact ? '2' : '4'}`}>
        <h3 className={`${compact ? 'text-sm font-medium mb-1 line-clamp-1' : 'text-lg font-semibold mb-2'} text-white`}>
          {nombre}
        </h3>
        
        <div className="flex flex-col">
          {tieneDescuento && (
            <div className="flex items-center">
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted line-through mr-2`}>
                {formatPrice(precio)}
              </span>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-red-400 font-medium`}>
                -{descuentoAplicable}%
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-1">
            <span className={`${compact ? 'text-base' : 'text-xl'} font-bold text-white`}>
              {formatPrice(precioFinal)}
            </span>
            
            {/* <Link 
              to={productoUrl} 
              className={`${compact ? 'text-xs' : 'text-sm'} text-blue-600 hover:underline`}
              onClick={(e) => e.stopPropagation()}
            >
              Ver más
            </Link> */}
          </div>
        </div>
      </div>
      
      {/* Botón agregar al carrito */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0 || isAddingToCart}
          className={`w-full py-2 rounded-md text-sm font-semibold cursor-pointer border transition-colors duration-300
            ${stock > 0 && !isAddingToCart
              ? 'btn-primary border-subtle' 
              : isAddingToCart 
                ? 'bg-white/5 text-white cursor-wait border-subtle'
                : 'bg-white/5 text-muted cursor-not-allowed border-subtle'
            }`}
        >
          {isAddingToCart ? 'Agregando...' : stock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 