import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ productos, loading, title, onProductClick, compact = false, darkMode = false }) => {
  const gridCols = compact
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  const gap = compact ? 'gap-3 md:gap-4' : 'gap-4 md:gap-6';

  if (loading) {
    return (
      <div className={`grid ${gridCols} ${gap}`}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              boxShadow: darkMode ? 'none' : '0 2px 10px rgba(15,23,42,0.07)',
            }}
          >
            {/* Imagen placeholder */}
            <div
              className="aspect-square w-full"
              style={{
                background: darkMode
                  ? 'linear-gradient(90deg,rgba(255,255,255,0.05) 25%,rgba(255,255,255,0.10) 50%,rgba(255,255,255,0.05) 75%)'
                  : 'linear-gradient(90deg,#E8EDF5 25%,#F0F4FA 50%,#E8EDF5 75%)',
                backgroundSize: '600px 100%',
                animation: 'shimmer 1.4s infinite',
              }}
            />
            {/* Texto placeholder */}
            <div className="p-4 space-y-2.5">
              <div
                className="h-3.5 rounded-lg"
                style={{
                  width: '70%',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                }}
              />
              <div
                className="h-3 rounded-lg"
                style={{
                  width: '45%',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#EEF2F7',
                }}
              />
              <div
                className="h-9 rounded-xl mt-3"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="w-14 h-14 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: darkMode ? 'rgba(255,255,255,0.2)' : '#CBD5E1' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p className="text-base font-medium"
          style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : '#94A3B8' }}>
          No se encontraron productos
        </p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2
          className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mb-6`}
          style={{ color: darkMode ? '#FFFFFF' : 'var(--text-on-light)' }}
        >
          {title}
        </h2>
      )}
      <div className={`grid ${gridCols} ${gap}`}>
        {productos.map((producto) => (
          <ProductCard
            key={producto._id || producto.id}
            producto={producto}
            onClick={() => onProductClick?.(producto)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
