import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import CategoriasNav from './CategoriasNav';
import { fetchTienda, fetchCategorias } from '../../store/tiendaSlice';
import { inicializarCarrito } from '../../store/carritoSlice';
import { tiendaService } from '../../services/tiendaService';

const Layout = ({ children }) => {
  const params = useParams();
  const tiendaSlug = params?.tiendaSlug || '';
  const dispatch = useDispatch();

  // Función para obtener la URL completa del logo
  const getImageUrl = (logoObj) => {
    if (!logoObj) return null;
    
    // Si es un objeto con URL
    if (typeof logoObj === 'object' && logoObj.url) {
      const logoUrl = logoObj.url;
      
      // Si ya es una URL completa o base64, retornarla directamente
      if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://') || logoUrl.startsWith('data:')) {
        return logoUrl;
      }
      
      // Construir URL completa
      const baseURL = 'https://e-commerce-backend-flmk.onrender.com';
      const cleanPath = logoUrl.startsWith('/') ? logoUrl.substring(1) : logoUrl;
      return `${baseURL}/${cleanPath}`;
    }
    
    // Si es un string directo
    if (typeof logoObj === 'string') {
      if (logoObj.startsWith('http://') || logoObj.startsWith('https://') || logoObj.startsWith('data:')) {
        return logoObj;
      }
      
      const baseURL = 'https://e-commerce-backend-flmk.onrender.com';
      const cleanPath = logoObj.startsWith('/') ? logoObj.substring(1) : logoObj;
      return `${baseURL}/${cleanPath}`;
    }
    
    return null;
  };

  useEffect(() => {
    if (tiendaSlug && tiendaSlug !== 'undefined') {
      dispatch(fetchTienda(tiendaSlug));
      dispatch(fetchCategorias(tiendaSlug));
      dispatch(inicializarCarrito());
      
      // Cargar configuración de la tienda para actualizar título e icono
      const loadTiendaConfig = async () => {
        try {
          const config = await tiendaService.obtenerConfiguracionPublica(tiendaSlug);
          console.log('Configuración cargada para favicon:', config);
          
          // Procesar la URL del logo
          const logoUrl = getImageUrl(config?.logo);
          console.log('URL del logo para favicon:', logoUrl);
          
          // Verificar si existe la función global y llamarla con los datos
          if (window.updateTitleAndFavicon && typeof window.updateTitleAndFavicon === 'function') {
            window.updateTitleAndFavicon(tiendaSlug, logoUrl);
          }
        } catch (error) {
          console.error('Error al cargar configuración para título/favicon:', error);
        }
      };
      
      loadTiendaConfig();
    }
  }, [dispatch, tiendaSlug]);

  return (
    <div className="flex flex-col min-h-screen text-white">
      <Header />
      {tiendaSlug && tiendaSlug !== 'undefined' && <CategoriasNav />}
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 