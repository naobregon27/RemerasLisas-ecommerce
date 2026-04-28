import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Header from './Header';
import Footer from './Footer';
import CategoriasNav from './CategoriasNav';
import { fetchTienda, fetchCategorias, fetchConfiguracionPublica, limpiarEstado } from '../../store/tiendaSlice';
import { inicializarCarrito } from '../../store/carritoSlice';

const Layout = ({ children }) => {
  const params = useParams();
  const tiendaSlug = params?.tiendaSlug || '';
  const dispatch = useDispatch();

  useEffect(() => {
    if (!tiendaSlug || tiendaSlug === 'undefined') return;

    dispatch(limpiarEstado());

    // ── Una sola ronda de peticiones en paralelo ──
    dispatch(fetchTienda(tiendaSlug));
    dispatch(fetchCategorias(tiendaSlug));
    // configuracionPublica carga banner, carrusel, secciones, videos, logo y colores
    // Todos los componentes leen de Redux → cero llamadas duplicadas
    dispatch(fetchConfiguracionPublica(tiendaSlug));
    dispatch(inicializarCarrito());

    // Actualizar título de pestaña según la config una vez que llegue
    // (se maneja en el efecto interno del selector en Header)
  }, [dispatch, tiendaSlug]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg)' }}>
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
