import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tiendaService } from '../../services/tiendaService';

const BannerGallery = () => {
  const { tiendaSlug } = useParams();
  const [configuracion, setConfiguracion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  
  // Cargar configuración de la tienda
  useEffect(() => {
    const cargarConfiguracion = async () => {
      setCargando(true);
      try {
        const config = await tiendaService.obtenerConfiguracionPublica(tiendaSlug);
        console.log('Configuración para galería cargada:', config);
        setConfiguracion(config);
        setError(null);
      } catch (err) {
        console.error('Error al cargar configuración para galería:', err);
        setError(err.message || 'Error al cargar la configuración de la tienda');
      } finally {
        setCargando(false);
      }
    };
    
    if (tiendaSlug) {
      cargarConfiguracion();
    }
  }, [tiendaSlug]);
  
  // Construir la URL completa para las imágenes
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl) return 'https://via.placeholder.com/800x400?text=Sin+imagen';
    
    // Si ya es una URL completa o base64, retornarla directamente
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    
    // Si es base64, devolverlo directamente
    if (relativeUrl.startsWith('data:')) {
      return relativeUrl;
    }
    
    // Construir URL completa
    const baseURL = 'https://e-commerce-backend-flmk.onrender.com';
    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
    return `${baseURL}/${cleanPath}`;
  };
  
  // Abrir modal al hacer clic en una imagen
  const abrirModal = (imagen) => {
    setImagenSeleccionada(imagen);
    setModalAbierto(true);
  };
  
  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setImagenSeleccionada(null);
  };
  
  // Si está cargando, mostrar un esqueleto
  if (cargando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Galería de Banners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/5 rounded-lg overflow-hidden aspect-[16/9] animate-pulse shadow-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-panel border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
          <p className="font-bold text-white">Error</p>
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }
  
  // Obtener imágenes del banner principal
  const imagenes = Array.isArray(configuracion?.bannerPrincipal) 
    ? configuracion.bannerPrincipal 
    : [];
  
  // Limitar a máximo 5 imágenes (si se necesita)
  const imagenesMostradas = imagenes.slice(0, 5);
  
  // Color para el borde, usando el color primario de la configuración
  const colorBorde = configuracion?.colorPrimario || '#335cff';
  
  // Si no hay imágenes para mostrar
  if (imagenesMostradas.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Galería de Banners</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {imagenesMostradas.map((imagen, index) => (
          <div 
            key={imagen._id || index} 
            className="rounded-lg overflow-hidden shadow-xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl group glass-panel"
            style={{ 
              border: `3px solid ${colorBorde}`,
              boxShadow: `0 10px 25px -5px ${colorBorde}30`,
            }}
            onClick={() => abrirModal(imagen)}
          >
            <div className="aspect-[16/9] relative">
              <img 
                src={getImageUrl(imagen.url)} 
                alt={imagen.alt || `Banner ${index + 1}`} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-110"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Error+al+cargar';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                <span className="text-white font-medium text-base mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {imagen.alt || `Banner ${index + 1}`}
                </span>
                <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-medium inline-block transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100 border border-white/15">
                  Ver detalle
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal para ver imagen ampliada - con animaciones mejoradas */}
      {modalAbierto && imagenSeleccionada && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-0 animate-fadeIn" 
          onClick={cerrarModal}
          style={{animation: 'fadeIn 0.3s ease forwards'}}
        >
          <div 
            className="relative max-w-5xl w-full scale-95 opacity-0 animate-zoomIn" 
            onClick={e => e.stopPropagation()}
            style={{animation: 'zoomIn 0.4s ease-out 0.1s forwards'}}
          >
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
              <div className="relative">
                <img 
                  src={getImageUrl(imagenSeleccionada.url)} 
                  alt={imagenSeleccionada.alt || 'Imagen de banner'} 
                  className="w-full object-contain max-h-[80vh]"
                />
                <button 
                  className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/20 transition-all duration-300 border border-white/15 text-white"
                  onClick={cerrarModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {imagenSeleccionada.alt && (
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white">{imagenSeleccionada.alt}</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos CSS para las animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { background-color: rgba(0, 0, 0, 0); }
          to { background-color: rgba(0, 0, 0, 0.8); }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.4s ease-out 0.1s forwards;
        }
      `}</style>
    </div>
  );
};

export default BannerGallery; 