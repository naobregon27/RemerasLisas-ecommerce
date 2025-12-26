import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tiendaService } from '../../services/tiendaService';

const Banner = () => {
  const { tiendaSlug } = useParams();
  const { tienda } = useSelector((state) => state.tienda);
  
  // Estados para la configuración de la tienda
  const [configuracion, setConfiguracion] = useState(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el carrusel
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  
  // Cargar la configuración pública de la tienda
  useEffect(() => {
    const cargarConfiguracion = async () => {
      setCargandoConfig(true);
      try {
        const config = await tiendaService.obtenerConfiguracionPublica(tiendaSlug);
        console.log('Configuración cargada:', config);
        
        // Verificar carrusel de imágenes
        if (config.carrusel && Array.isArray(config.carrusel)) {
          console.log('Imágenes de carrusel encontradas:', config.carrusel.length);
          config.carrusel.forEach((slide, index) => {
            console.log(`Slide ${index + 1}:`, slide);
          });
        } else {
          console.warn('No se encontraron imágenes en el carrusel o no es un array:', config.carrusel);
        }
        
        setConfiguracion(config);
        setError(null);
      } catch (err) {
        console.error('Error al cargar configuración:', err);
        setError(err.message || 'Error al cargar la configuración de la tienda');
      } finally {
        setCargandoConfig(false);
      }
    };
    
    if (tiendaSlug) {
      cargarConfiguracion();
    }
  }, [tiendaSlug]);
  
  // Preparar las imágenes del carrusel
  const carouselImages = useMemo(() => {
    // Usar solamente las imágenes del carrusel
    if (configuracion?.carrusel && Array.isArray(configuracion.carrusel) && configuracion.carrusel.length > 0) {
      console.log('Usando imágenes del carrusel:', configuracion.carrusel.length);
      return configuracion.carrusel;
    }
    
    console.warn('No se encontraron imágenes para el carrusel');
    return [];
  }, [configuracion]);
  
  // Convertir colores HEX a clases de Tailwind o estilos directos
  const getBackgroundStyle = (color) => {
    if (!color) return '';
    if (color.startsWith('#')) {
      return { backgroundColor: color };
    }
    return color;
  };
  
  const getTextStyle = (color) => {
    if (!color) return '';
    if (color.startsWith('#')) {
      return { color: color };
    }
    return color;
  };
  
  // Efecto para manejar la animación automática del carrusel
  useEffect(() => {
    // No configurar el intervalo si no hay imágenes o solo hay una
    if (!carouselImages || carouselImages.length <= 1) {
      console.log('No se configura intervalo: imágenes insuficientes');
      return;
    }
    
    console.log(`Configurando intervalo para ${carouselImages.length} imágenes`);
    
    // Resetear slide actual cuando cambian las imágenes
    setCurrentSlide(0);
    
    const interval = setInterval(() => {
      setCurrentSlide(prevSlide => {
        const nextSlide = (prevSlide + 1) % carouselImages.length;
        console.log(`Cambiando de slide ${prevSlide} a ${nextSlide}`);
        return nextSlide;
      });
    }, 7000);
    
    return () => {
      console.log('Limpiando intervalo del carrusel');
      clearInterval(interval);
    };
  }, [carouselImages]);

  // Efecto para actualizar manualmente la posición cuando cambia el slide
  useEffect(() => {
    if (carouselRef.current && carouselImages.length > 0) {
      console.log(`Actualizando posición del carrusel a slide: ${currentSlide}`);
    }
  }, [currentSlide, carouselImages.length]);

  // Construir la URL completa para las imágenes
  const getImageUrl = (relativeUrl) => {
    // Depuración
    console.log('Procesando URL de imagen:', relativeUrl);
    
    // Si no hay URL, devolver placeholder
    if (!relativeUrl) {
      console.warn('URL de imagen vacía, usando placeholder');
      return 'https://via.placeholder.com/800x400?text=Sin+imagen';
    }
    
    // Si ya es una URL completa, devolverla directamente
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      console.log('URL absoluta detectada, devolviendo sin cambios:', relativeUrl);
      return relativeUrl;
    }
    
    // Si es base64, devolverlo directamente
    if (relativeUrl.startsWith('data:')) {
      console.log('Imagen base64 detectada');
      return relativeUrl;
    }
    
    // Si comienza con "/uploads", construir URL completa con el dominio
    const baseURL = 'https://e-commerce-backend-flmk.onrender.com';
    // Asegurarse de no tener barras duplicadas
    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
    const fullUrl = `${baseURL}/${cleanPath}`;
    
    console.log('URL de imagen final construida:', fullUrl);
    return fullUrl;
  };
  
  // Mientras carga, mostrar un esqueleto
  if (cargandoConfig) {
    return (
      <div className="bg-gray-200 py-16 md:py-24 animate-pulse">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <div className="h-12 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-full mb-6"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="bg-gray-300 w-full h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si hay error, mostrar mensaje
  if (error) {
    return (
      <div className="bg-red-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar la configuración</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay imágenes en el carrusel, no renderizar el componente
  if (!carouselImages || carouselImages.length === 0) {
    return null;
  }

  // Contenido del banner con la configuración cargada
  return (
    <div 
      className="py-6 md:py-12 overflow-hidden relative bg-gradient-to-r" 
      style={{
        backgroundImage: `linear-gradient(135deg, ${configuracion?.colorPrimario || 'var(--color-navy-900)'}, ${configuracion?.colorSecundario || 'var(--color-green-700)'} 80%)`,
      }}
    >
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-30 rounded-l-full transform -translate-x-1/4"
           style={{ backgroundColor: configuracion?.colorSecundario || '#335cff' }}></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 opacity-20 rounded-full transform -translate-x-1/2 translate-y-1/4"
           style={{ backgroundColor: configuracion?.colorSecundario || '#335cff' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-shadow-sm"
              style={{
                color: configuracion?.colorTexto || '#e8f5ff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              {configuracion?.mensaje || tienda?.titulo || 'Bienvenidos a nuestra tienda en línea'}
            </h1>
            <p 
              className="text-lg md:text-2xl font-semibold mb-6 text-shadow-sm"
              style={{
                color: configuracion?.colorTexto || '#d5e4f7',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              {tienda?.subtitulo || 'Descubre los mejores productos al mejor precio'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/${tiendaSlug}/productos`}
                className="px-6 py-3 rounded-lg font-medium hover:opacity-95 transition-all duration-300 shadow-lg transform hover:scale-105"
                style={{
                  backgroundColor: configuracion?.colorSecundario || '#0f7a5f',
                  color: '#ffffff',
                  boxShadow: '0 18px 40px -24px rgba(0,0,0,0.65)'
                }}
              >
                Ver Productos
              </Link>
              {tienda?.categoriaDestacada && (
                <Link
                  to={`/${tiendaSlug}/categoria/${tienda.categoriaDestacada._id}`}
                  className="px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg transform hover:scale-105 glass-panel"
                  style={{ color: '#e8f5ff', borderColor: 'var(--color-border)' }}
                >
                  {`Ver ${tienda.categoriaDestacada.nombre}`}
                </Link>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            {/* Carrusel */}
            <div className="relative w-full overflow-hidden rounded-lg shadow-2xl">
              {/* Contenedor de slides con transición */}
              <div 
                ref={carouselRef}
                className="flex transition-all duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselImages.map((slide, index) => (
                  <div 
                    key={index} 
                    className="relative min-w-full w-full"
                  >
                    <img 
                      src={getImageUrl(slide.url)} 
                      alt={slide.alt || `Slide ${index + 1}`} 
                      className="w-full h-80 md:h-96 lg:h-[28rem] object-contain bg-transparent"
                      onLoad={() => console.log(`Imagen ${index + 1} cargada correctamente: ${slide.url}`)}
                      onError={(e) => {
                        console.error(`Error al cargar imagen: ${slide.url}`);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x400?text=Error+al+cargar';
                      }}
                    />
                    {/* Overlay para etiquetas */}
                    {slide.titulo && (
                      <div className="absolute top-6 left-6 px-4 py-2 rounded-lg shadow-md text-lg font-bold text-white"
                           style={{ backgroundColor: configuracion?.colorPrimario || '#335cff' }}>
                        {slide.titulo}
                      </div>
                    )}
                    {slide.subtitulo && (
                      <div className="absolute bottom-16 left-6 right-6 flex flex-col items-start">
                        <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-md shadow-lg text-lg mb-2">
                          {slide.subtitulo}
                        </div>
                      {slide.botonTexto && slide.botonUrl && (
                        <a 
                          href={slide.botonUrl} 
                            className="inline-block px-6 py-3 rounded-md font-bold transition-all duration-300 shadow-lg transform hover:translate-y-[-2px]"
                            style={{
                              backgroundColor: configuracion?.colorSecundario || '#335cff',
                              color: '#ffffff'
                            }}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {slide.botonTexto}
                        </a>
                      )}
                    </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Indicadores de slide */}
              {carouselImages.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none shadow-sm`}
                      style={{
                        backgroundColor: index === currentSlide ? 
                          (configuracion?.colorSecundario || '#335cff') : 
                          'rgba(255, 255, 255, 0.8)',
                        transform: index === currentSlide ? 'scale(1.25)' : 'scale(1)'
                      }}
                      aria-label={`Ver slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              
              {/* Botones de navegación */}
              {carouselImages.length > 1 && (
                <>
                  <button 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm text-gray-900 flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg"
                    onClick={() => setCurrentSlide(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm text-gray-900 flex items-center justify-center hover:bg-white transition-all duration-300 shadow-lg"
                    onClick={() => setCurrentSlide(prev => (prev === carouselImages.length - 1 ? 0 : prev + 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para las animaciones y efectos */}
      <style jsx>{`
        .text-shadow-sm {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Banner; 