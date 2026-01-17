import React from 'react';
import { Link } from 'react-router-dom';
import { formatearPrecio } from '../../utils/formatters';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

const ProductCard = ({ producto, tiendaSlug }) => {
  // Extraer datos del producto con valores por defecto
  const { 
    _id, 
    nombre = "Producto sin nombre", 
    precio = 0, 
    precioAnterior = 0,
    descuento = 0,
    imagenes = [],
    slug = "",
    destacado = false
  } = producto || {};

  // Obtener la primera imagen o usar una imagen por defecto
  const imagenPrincipal = imagenes && imagenes.length > 0 
    ? imagenes[0] 
    : 'https://placehold.co/300x300/e2e8f0/1e293b?text=Producto';

  // URL del producto
  const productoUrl = `/tienda/${tiendaSlug}/producto/${slug}`;

  return (
    <div className="glass-panel rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Badge de descuento si existe */}
      {descuento > 0 && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
          -{descuento}%
        </div>
      )}
      
      {/* Badge de destacado si aplica */}
      {destacado && (
        <div className="absolute top-0 left-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10 flex items-center">
          <FaStar className="mr-1" /> Destacado
        </div>
      )}
      
      {/* Imagen del producto */}
      <Link to={productoUrl} className="block relative overflow-hidden group">
        <div className="aspect-square">
          <img 
            src={imagenPrincipal} 
            alt={nombre} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </div>
      </Link>
      
      {/* Información del producto */}
      <div className="p-4">
        <Link to={productoUrl} className="block">
          <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">{nombre}</h3>
        </Link>
        
        <div className="mt-2 flex justify-between items-end">
          <div>
            {/* Mostrar precio anterior si hay descuento */}
            {precioAnterior > 0 && descuento > 0 && (
              <span className="text-muted line-through text-sm mr-2">
                {formatearPrecio(precioAnterior)}
              </span>
            )}
            
            {/* Precio actual */}
            <span className="text-xl font-bold text-white">
              {formatearPrecio(precio)}
            </span>
          </div>
          
          {/* Botón de agregar al carrito */}
          <button 
            className="btn-primary rounded-full p-2 transition-colors duration-300 border border-subtle"
            aria-label="Añadir al carrito"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 