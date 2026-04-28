import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ productos, loading, onProductClick, colorPrimario = '#3b82f6' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const productosPorVista = 5;

  const totalGroups = Math.ceil(productos.length / productosPorVista);
  const productosVisibles = productos.slice(
    currentIndex * productosPorVista,
    (currentIndex + 1) * productosPorVista
  );

  const nextGroup = () =>
    setCurrentIndex((p) => (p >= totalGroups - 1 ? 0 : p + 1));
  const prevGroup = () =>
    setCurrentIndex((p) => (p <= 0 ? totalGroups - 1 : p - 1));

  useEffect(() => {
    if (!productos.length || isPaused || totalGroups <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextGroup, 4000);
    return () => clearInterval(intervalRef.current);
  }, [productos.length, isPaused, totalGroups]);

  /* ── Skeleton (fondo claro) ── */
  if (loading) {
    return (
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: colorPrimario }}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div className="h-6 w-40 rounded-lg skeleton-light" />
        </div>
        <div className="rounded-2xl p-4 md:p-5"
          style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div className="aspect-square w-full skeleton-light" />
                <div className="p-3 space-y-2">
                  <div className="h-3 skeleton-light w-3/4" />
                  <div className="h-3 skeleton-light w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!productos || productos.length === 0) return null;

  return (
    <div
      className="mb-2"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
            style={{ background: colorPrimario }}>
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          {/* Texto OSCURO para que se vea sobre el fondo claro */}
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-on-light)' }}>
            Todos los Productos
          </h2>
        </div>
        {totalGroups > 1 && (
          <span className="text-sm" style={{ color: 'var(--text-muted-on-light)' }}>
            {currentIndex + 1} / {totalGroups}
          </span>
        )}
      </div>

      <div className="relative">
        {/* Botón anterior */}
        {totalGroups > 1 && (
          <button
            onClick={prevGroup}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-light)',
              color: colorPrimario,
              boxShadow: 'var(--shadow-md)',
            }}
            aria-label="Anteriores"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Contenedor del carrusel — FONDO CLARO */}
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {productosVisibles.map((producto) => (
              <ProductCard
                key={producto._id || producto.id}
                producto={producto}
                onClick={() => onProductClick?.(producto)}
                compact={true}
              />
            ))}
          </div>
        </div>

        {/* Botón siguiente */}
        {totalGroups > 1 && (
          <button
            onClick={nextGroup}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-light)',
              color: colorPrimario,
              boxShadow: 'var(--shadow-md)',
            }}
            aria-label="Siguientes"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Indicadores */}
        {totalGroups > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalGroups }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8' : 'w-2'}`}
                style={{ background: i === currentIndex ? colorPrimario : `${colorPrimario}40` }}
                aria-label={`Página ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
