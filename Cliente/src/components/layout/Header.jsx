import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { buscarProductos } from '../../store/productoSlice';
import { fetchCarrito } from '../../store/carritoSlice';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import VerifyEmailModal from '../auth/VerifyEmailModal';
import { authService } from '../../services/authService';
import ModalCarrito from '../Carrito/ModalCarrito';
import { toast } from 'react-toastify';

const Header = () => {
  const params = useParams();
  const tiendaSlug = params?.tiendaSlug || '';
  const esRutaTienda = !!(tiendaSlug && tiendaSlug !== 'undefined');

  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const menuRef   = useRef(null);

  const [searchTerm, setSearchTerm]               = useState('');
  const [loginOpen, setLoginOpen]                 = useState(false);
  const [registerOpen, setRegisterOpen]           = useState(false);
  const [carritoModalOpen, setCarritoModalOpen]   = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen]     = useState(false);
  const [emailToVerify, setEmailToVerify]         = useState('');
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [user, setUser]             = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  // Lee la config pública desde Redux — ya la cargó Layout.jsx, sin llamada extra
  const { tienda, configuracionPublica: config } = useSelector((state) => state.tienda);
  const { items = [], loading: carritoLoading }  = useSelector((state) => state.carrito || { items: [] });
  const itemCount = items.reduce((t, i) => t + (i?.cantidad || 0), 0);

  const accentColor  = config?.colorPrimario   || 'var(--accent)';
  const accentColor2 = config?.colorSecundario || 'var(--accent-hover)';

  const getLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('data:') || url.startsWith('http')) return url;
    return `https://e-commerce-backend-flmk.onrender.com/${url.replace(/^\//, '')}`;
  };

  // Escuchar cambios de auth
  useEffect(() => {
    const sync = () => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
      dispatch(fetchCarrito());
    };
    window.addEventListener('auth-change', sync);
    window.addEventListener('auth-error', sync);
    return () => { window.removeEventListener('auth-change', sync); window.removeEventListener('auth-error', sync); };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCarrito());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const h = () => { if (authService.isAuthenticated()) dispatch(fetchCarrito()); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [dispatch]);

  // Cerrar menú usuario al click fuera
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuUsuarioAbierto(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && esRutaTienda) {
      dispatch(buscarProductos({ slug: tiendaSlug, query: searchTerm }));
      navigate(`/${tiendaSlug}/buscar?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setLoginOpen(false);
    setRegisterOpen(false);
    dispatch(fetchCarrito());
    toast.success(`¡Bienvenido ${userData.nombre || userData.email}!`);
  };

  const homeLink = esRutaTienda ? `/${tiendaSlug}` : '/';

  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{
        background: 'var(--nav)',
        borderColor: 'var(--border)',
        boxShadow: '0 1px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* ── Logo + nombre ── */}
          <Link to={homeLink} className="flex items-center gap-3 flex-shrink-0 group">
            {config?.logo?.url ? (
              <div
                className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white transition-all duration-200 group-hover:scale-105"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                <img
                  src={getLogoUrl(config.logo.url)}
                  alt={config.logo.alt || 'Logo'}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 transition-all duration-200 group-hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}
              >
                {tienda?.nombre?.charAt(0) || 'T'}
              </div>
            )}
            <div className="hidden sm:block leading-tight">
              <p className="text-base font-extrabold text-white tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {tienda?.nombre || 'Tienda Online'}
              </p>
              <p className="text-xs font-light tracking-wider" style={{ color: accentColor }}>
                Tu experiencia de compra favorita
              </p>
            </div>
          </Link>

          {/* ── Buscador (crece) ── */}
          <form onSubmit={handleSearch} className="flex-1 relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border)',
                focusRingColor: accentColor,
              }}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: accentColor }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* ── Acciones ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Link productos (solo md+) */}
            <Link
              to={`/${tiendaSlug}/productos`}
              className="hidden md:block text-sm font-medium transition-colors duration-200 hover:text-white px-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Productos
            </Link>

            {/* Carrito */}
            <div className="flex items-center gap-1">
              {itemCount > 0 && isAuthenticated && (
                <button
                  onClick={() => navigate(`/${tiendaSlug}/carrito`)}
                  disabled={carritoLoading}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: accentColor, boxShadow: '0 2px 12px var(--accent-glow)' }}
                >
                  Carrito
                  <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none" style={{ color: accentColor }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isAuthenticated) { setLoginOpen(true); return; }
                  navigate(`/${tiendaSlug}/carrito`);
                }}
                className="relative p-2 rounded-xl transition-colors duration-200 hover:bg-white/10"
                aria-label="Carrito"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Autenticación */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90"
                  style={{ background: `linear-gradient(120deg, ${accentColor}, ${accentColor2})`, boxShadow: '0 2px 10px var(--accent-glow)' }}
                >
                  <div
                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold leading-none flex-shrink-0"
                    style={{ color: accentColor }}
                  >
                    {(user.name || user.nombre || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">
                    {user.name || user.nombre || (user.email?.split('@')[0]) || 'Usuario'}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${menuUsuarioAbierto ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuUsuarioAbierto && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl z-50 py-2 overflow-hidden border"
                    style={{ background: 'var(--nav)', borderColor: 'var(--border)' }}
                  >
                    <button
                      className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm text-white hover:bg-white/5 transition-colors"
                      onClick={() => { setMenuUsuarioAbierto(false); navigate(`/${tiendaSlug}/mis-pedidos`); }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      Mis Pedidos
                    </button>
                    <div className="mx-3 border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm hover:bg-white/5 transition-colors"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => { authService.logout(); toast.info('Sesión cerrada'); }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{ background: accentColor, boxShadow: '0 2px 10px var(--accent-glow)' }}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="hidden sm:block px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/10 border"
                  style={{ color: accentColor, borderColor: `${accentColor}55` }}
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleAuthSuccess}
        onNeedsVerification={(email) => { setEmailToVerify(email); setVerifyEmailOpen(true); }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={handleAuthSuccess}
        onNeedsVerification={(email) => { setEmailToVerify(email); setVerifyEmailOpen(true); }}
      />
      <VerifyEmailModal
        isOpen={verifyEmailOpen}
        onClose={() => setVerifyEmailOpen(false)}
        onSuccess={handleAuthSuccess}
        email={emailToVerify}
      />
      <ModalCarrito
        isOpen={carritoModalOpen}
        onClose={() => setCarritoModalOpen(false)}
      />
    </header>
  );
};

export default Header;
