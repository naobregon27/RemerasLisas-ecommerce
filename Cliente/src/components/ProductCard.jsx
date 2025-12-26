import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatearPrecio } from '../utils/formatters';
import { FaShoppingCart, FaTag, FaStar } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { agregarAlCarrito } from '../store/carritoSlice';
import toast from 'react-hot-toast';

/**
 * Componente de tarjeta de producto que muestra imagen, nombre, precio y botón de agregar al carrito
 */
const ProductCard = ({
  id,
  nombre = 'Producto sin nombre',
  precio = 0,
  precioAnterior = null,
  descuento = 0,
  imagenes = [],
  slug = '',
  destacado = false,
  onAddToCart = () => {}
}) => {
  const params = useParams();
  const tiendaSlug = params?.tiendaSlug || ''; // Usar string vacío en lugar de undefined
  const [imagenURL, setImagenURL] = useState('');
  const dispatch = useDispatch();
  
  // Configurar la URL de la imagen
  useEffect(() => {
    try {
      if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
        // Verificar cada imagen hasta encontrar una válida
        for (const img of imagenes) {
          // Verificar si la imagen es un objeto con propiedad url
          if (img && typeof img === 'object' && img.url) {
            setImagenURL(img.url);
            // Si encontramos una imagen válida, salimos del bucle
            return;
          }
          
          // Verificar si la imagen es una cadena de texto
          if (img && typeof img === 'string') {
            setImagenURL(img);
            // Si encontramos una imagen válida, salimos del bucle
            return;
          }
        }
        // Si llegamos aquí, no encontramos imágenes válidas
        setImagenURL('https://via.placeholder.com/300x300?text=Sin+imagen');
      } else {
        // No hay imágenes
        setImagenURL('https://via.placeholder.com/300x300?text=Sin+imagen');
      }
    } catch (error) {
      console.error('Error al procesar imagen del producto:', error);
      setImagenURL('https://via.placeholder.com/300x300?text=Sin+imagen');
    }

    // Debug para desarrollo
    if (typeof window.debugProducto === 'function' && process.env.NODE_ENV !== 'production') {
      window.debugProducto({
        id,
        nombre,
        precio,
        precioAnterior,
        descuento,
        imagenes,
        slug,
        destacado
      });
    }
  }, [id, imagenes]);

  // Calcular precio con descuento si aplica
  const precioFinal = descuento > 0 && precioAnterior 
    ? precioAnterior - (precioAnterior * (descuento / 100)) 
    : precio;
    
  // Construir la URL del producto basada en si tenemos tiendaSlug o no
  const productoUrl = tiendaSlug 
    ? `/${tiendaSlug}/producto/${slug}` 
    : `/producto/${slug}`;

  const handleImageError = () => {
    setImagenURL('https://via.placeholder.com/300x300?text=Sin+imagen');
  };

  const handleAddToCart = () => {
    dispatch(agregarAlCarrito({ producto: { id, nombre, precio, imagen: imagenURL, slug }, cantidad: 1 }))
      .unwrap()
      .then(() => toast.success('Producto agregado al carrito'))
      .catch(() => toast.error('Error al agregar el producto al carrito'));
  };

  return (
    <div className="producto-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl relative">
      {/* Badge de descuento */}
      {descuento > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center">
          <FaTag className="mr-1" /> -{descuento}%
        </div>
      )}
      
      {/* Badge de destacado */}
      {destacado && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center">
          <FaStar className="mr-1" /> Destacado
        </div>
      )}
      
      {/* Imagen del producto */}
      <Link to={productoUrl} className="block">
        <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
          {imagenURL ? (
            <img 
              src={imagenURL} 
              alt={nombre}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center p-4 text-gray-500">Sin imagen</div>
          )}
        </div>
      </Link>
      
      {/* Información del producto */}
      <div className="p-4">
        <Link to={productoUrl} className="block">
          <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-blue-600 transition-colors">{nombre}</h3>
        </Link>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-gray-900">{formatearPrecio(precioFinal)}</span>
            {precioAnterior && descuento > 0 && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatearPrecio(precioAnterior)}
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={`w-full py-2 rounded-md text-sm font-medium 
            ${stock > 0 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors duration-300`}
        >
          {stock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 