import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ productos, loading, title, onProductClick, compact = false }) => {
  if (loading) {
    return (
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 ${compact ? 'md:gap-4' : 'md:gap-6'}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="glass-panel rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square w-full bg-white/5"></div>
            <div className="p-3 space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
              <div className="h-6 bg-white/10 rounded w-full mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-6">
        <h2 className="text-xl text-muted">No se encontraron productos</h2>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-white mb-4 ${compact ? 'pl-1' : 'mb-6'}`}>
          {title}
        </h2>
      )}
      <div className={`grid ${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 ${compact ? 'md:gap-4' : 'md:gap-6'}`}>
        {productos.map((producto) => (
          <ProductCard 
            key={producto._id || producto.id} 
            producto={producto} 
            onClick={() => onProductClick && onProductClick(producto)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList; 