import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const ProductCarousel = ({ productos, loading, onProductClick, colorPrimario = '#3b82f6' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const productosPorVista = 5; // Mostrar 5 productos a la vez
  
  // Calcular el número total de grupos
  const totalGroups = Math.ceil(productos.length / productosPorVista);
  
  // Obtener los productos visibles actuales
  const productosVisibles = productos.slice(
    currentIndex * productosPorVista,
    (currentIndex + 1) * productosPorVista
  );
  
  // Función para avanzar al siguiente grupo
  const nextGroup = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= totalGroups - 1) {
        return 0; // Volver al principio
      }
      return prevIndex + 1;
    });
  };
  
  // Función para retroceder al grupo anterior
  const prevGroup = () => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return totalGroups - 1; // Ir al final
      }
      return prevIndex - 1;
    });
  };
  
  // Efecto para el desplazamiento automático
  useEffect(() => {
    if (productos.length === 0 || isPaused || totalGroups <= 1) {
      return;
    }
    
    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Crear nuevo intervalo
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= totalGroups - 1) {
          return 0; // Volver al principio
        }
        return prevIndex + 1;
      });
    }, 4000); // Cambiar cada 4 segundos
    
    // Limpiar al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [productos.length, isPaused, totalGroups]);
  
  if (loading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
              style={{ backgroundColor: colorPrimario }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Todos los Productos</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square w-full bg-white/5"></div>
              <div className="p-3 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!productos || productos.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
            style={{ backgroundColor: colorPrimario }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Todos los Productos</h2>
        </div>
        <div className="hidden md:block">
          <div 
            className="h-[2px] w-24 rounded-full"
            style={{ backgroundColor: `${colorPrimario}40` }}
          ></div>
        </div>
      </div>
      
      <div className="relative">
        {/* Botón anterior */}
        {totalGroups > 1 && (
          <button
            onClick={prevGroup}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all"
            style={{ color: colorPrimario }}
            aria-label="Productos anteriores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Contenedor del carrusel */}
        <div className="glass-panel rounded-xl p-4 md:p-6 relative overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {productosVisibles.map((producto) => (
              <ProductCard 
                key={producto._id || producto.id} 
                producto={producto} 
                onClick={() => onProductClick && onProductClick(producto)}
                compact={true}
              />
            ))}
          </div>
        </div>
        
        {/* Botón siguiente */}
        {totalGroups > 1 && (
          <button
            onClick={nextGroup}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all"
            style={{ color: colorPrimario }}
            aria-label="Siguientes productos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Indicadores de página */}
        {totalGroups > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalGroups }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8' : 'w-2'
                }`}
                style={{
                  backgroundColor: index === currentIndex ? colorPrimario : `${colorPrimario}40`
                }}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;

