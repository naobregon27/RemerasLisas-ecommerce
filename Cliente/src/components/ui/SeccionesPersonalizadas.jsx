import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tiendaService } from '../../services/tiendaService';

const SeccionesPersonalizadas = () => {
  const { tiendaSlug } = useParams();
  const [configuracion, setConfiguracion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar configuración de la tienda
  useEffect(() => {
    const cargarConfiguracion = async () => {
      setCargando(true);
      try {
        const config = await tiendaService.obtenerConfiguracionPublica(tiendaSlug);
        console.log('Configuración para secciones cargada:', config);
        setConfiguracion(config);
        setError(null);
      } catch (err) {
        console.error('Error al cargar configuración para secciones:', err);
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
    if (!relativeUrl) return null;
    
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
  
  // Si está cargando, mostrar un esqueleto
  if (cargando) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="glass-panel rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Si hay error, no mostrar nada (silencioso)
  if (error) {
    return null;
  }
  
  // Obtener secciones de la configuración
  // Las secciones pueden estar directamente en configuracion o en configuracion.secciones
  const secciones = Array.isArray(configuracion?.secciones) 
    ? configuracion.secciones
        .filter(sec => sec && (sec.titulo || sec.contenido || sec.imagen)) // Filtrar secciones vacías
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    : [];
  
  // Color para los bordes, usando el color primario de la configuración
  const colorPrimario = configuracion?.colorPrimario || '#335cff';
  const colorSecundario = configuracion?.colorSecundario || '#60a5fa';
  
  // Si no hay secciones para mostrar
  if (secciones.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {secciones.map((seccion, index) => {
          const imagenUrl = getImageUrl(seccion.imagen);
          const esPar = index % 2 === 0;
          
          return (
            <div 
              key={seccion._id || index}
              className="glass-panel rounded-lg overflow-hidden shadow-lg border border-white/10"
              style={{ 
                borderLeft: `3px solid ${colorPrimario}`,
              }}
            >
              <div className={`flex flex-col ${esPar ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                {/* Imagen */}
                {imagenUrl && (
                  <div className="lg:w-2/5 w-full">
                    <div className="relative h-48 lg:h-56 overflow-hidden">
                      <img 
                        src={imagenUrl} 
                        alt={seccion.titulo || `Sección ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/800x400?text=Error+al+cargar';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>
                )}
                
                {/* Contenido */}
                <div className={`${imagenUrl ? 'lg:w-3/5' : 'w-full'} w-full p-5 lg:p-6 flex flex-col justify-center`}>
                  {seccion.titulo && (
                    <h3 
                      className="text-xl lg:text-2xl font-semibold mb-3"
                      style={{ color: colorSecundario }}
                    >
                      {seccion.titulo}
                    </h3>
                  )}
                  
                  {seccion.contenido && (
                    <div 
                      className="text-sm lg:text-base text-muted leading-relaxed whitespace-pre-line"
                      style={{ 
                        color: '#d1d5db',
                        lineHeight: '1.6'
                      }}
                    >
                      {seccion.contenido}
                    </div>
                  )}
                  
                  {/* Decoración sutil */}
                  {seccion.titulo && (
                    <div className="mt-4">
                      <div 
                        className="h-0.5 w-12 rounded-full"
                        style={{ backgroundColor: `${colorPrimario}50` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeccionesPersonalizadas;

