import React from 'react';

const Loader = ({ size = 'medium', color = 'blue', fullScreen = false }) => {
  // Define tamaños
  const sizeClass = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  // Define colores
  const colorClass = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
  };

  // Componente base del spinner
  const Spinner = () => (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${sizeClass[size]} ${colorClass[color]}`} role="status">
      <span className="sr-only">Cargando...</span>
    </div>
  );

  // Si es pantalla completa, centrar en toda la pantalla
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <Spinner />
      </div>
    );
  }

  // Si no, sólo mostrar el spinner
  return <Spinner />;
};

export default Loader; 