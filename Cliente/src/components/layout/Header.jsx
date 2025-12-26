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
import { tiendaService } from '../../services/tiendaService';

const Header = () => {
  const params = useParams();
  const tiendaSlug = params?.tiendaSlug || ''; // Usar string vacío en lugar de undefined
  const esRutaTienda = tiendaSlug && tiendaSlug !== 'undefined';
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { tienda } = useSelector((state) => state.tienda);
  
  // Estado para la configuración de la tienda
  const [configuracion, setConfiguracion] = useState(null);
  
  // Seleccionar explícitamente los items del carrito para forzar la actualización
  const { items = [], loading: carritoLoading } = useSelector((state) => state.carrito || { items: [] });
  
  // Calcular la cantidad de items
  const itemCount = items.reduce((total, item) => total + (item?.cantidad || 0), 0);
  
  // Estado para los modales
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [carritoModalOpen, setCarritoModalOpen] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  
  // Estado para el menú desplegable del usuario
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cargar configuración de la tienda
  useEffect(() => {
    const cargarConfiguracion = async () => {
      if (esRutaTienda) {
        try {
          const config = await tiendaService.obtenerConfiguracionPublica(tiendaSlug);
          setConfiguracion(config);
        } catch (err) {
          console.error('Error al cargar configuración para header:', err);
        }
      }
    };
    
    cargarConfiguracion();
  }, [tiendaSlug, esRutaTienda]);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
      setIsAuthenticated(authService.isAuthenticated());
      // Actualizar carrito cuando cambia el estado de autenticación
      dispatch(fetchCarrito());
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('auth-error', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('auth-error', handleAuthChange);
    };
  }, [dispatch]);

  // Cargar carrito cuando el componente se monta
  useEffect(() => {
    // Cargar carrito solo si el usuario está autenticado
    if (isAuthenticated) {
      dispatch(fetchCarrito());
      
      // Eliminamos el intervalo de actualización automática
      // Comentado para prevenir actualizaciones frecuentes que afecten la experiencia del usuario
      /*
      const interval = setInterval(() => {
        if (authService.isAuthenticated()) {
          dispatch(fetchCarrito());
        }
      }, 30000); // Cambiado de 5000 a 30000 (30 segundos)
      
      return () => clearInterval(interval);
      */
    }
  }, [dispatch, isAuthenticated]);

  // Escucha de eventos para detectar cambios en el carrito desde otras partes de la aplicación
  useEffect(() => {
    const handleStorageChange = () => {
      if (authService.isAuthenticated()) {
        dispatch(fetchCarrito());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() && esRutaTienda) {
      // Disparar la acción de búsqueda sin esperarla
      dispatch(buscarProductos({ slug: tiendaSlug, query: searchTerm }));
      // Navegar a la página de resultados de búsqueda
      navigate(`/${tiendaSlug}/buscar?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.info('Has cerrado sesión correctamente');
  };

  // Navegar a la página del carrito
  const handleCarritoClick = () => {
    navigate(`/${tiendaSlug}/carrito`);
  };

  // Abrir el modal del carrito para vista rápida
  const handleQuickViewCarrito = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    
    dispatch(fetchCarrito());
    setCarritoModalOpen(true);
  };

  // Manejar clic en el icono del carrito
  const handleIconoCarritoClick = (e) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    
    handleCarritoClick();
  };

  // Determinar el enlace del logo según si estamos en la página principal o una tienda específica
  const homeLink = esRutaTienda ? `/${tiendaSlug}` : '/';

  // Manejar el éxito de inicio de sesión o registro
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setLoginOpen(false);
    setRegisterOpen(false);
    // Cargar carrito después de inicio de sesión exitoso
    dispatch(fetchCarrito());
    // Mostrar mensaje de bienvenida con el nombre del usuario
    toast.success(`¡Bienvenido ${userData.nombre || userData.email}!`);
  };

  // Determinar si mostrar los botones del carrito
  const mostrarBotonesCarrito = itemCount > 0 && isAuthenticated;

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuUsuarioAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => {
      document.removeEventListener('mousedown', handleClickFuera);
    };
  }, []);

  // Abrir/cerrar el menú de usuario
  const toggleMenuUsuario = () => {
    setMenuUsuarioAbierto(!menuUsuarioAbierto);
  };

  // Navegar a mis pedidos
  const irAMisPedidos = () => {
    setMenuUsuarioAbierto(false);
    navigate(`/${tiendaSlug}/mis-pedidos`);
  };

  // Navegar a configuraciones (cuando se implemente)
  const irAConfiguraciones = () => {
    setMenuUsuarioAbierto(false);
    toast.info('Próximamente: Configuraciones de usuario');
  };

  // Obtener la URL completa del logo
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

  // Obtener estilos para el color primario y secundario
  const getColorPrimario = () => configuracion?.colorPrimario || '#335cff';
  const getColorSecundario = () => configuracion?.colorSecundario || '#33b1ff';

  return (
    <header className="glass-panel border-b border-subtle shadow-lg backdrop-blur supports-[backdrop-filter]:backdrop-blur-lg sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo y nombre */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link to={homeLink} className="flex items-center group">
              <div className="relative">
                {configuracion?.logo?.url ? (
                  <div className="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                    <img 
                      src={getImageUrl(configuracion.logo.url)} 
                      alt={configuracion.logo.alt || 'Logo de la tienda'} 
                      className="w-24 h-24 object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-white/20 group-hover:to-transparent transition-all duration-300"></div>
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-4xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl" 
                    style={{ 
                      background: `linear-gradient(135deg, ${getColorPrimario()}, ${getColorSecundario()})`,
                      boxShadow: `0 4px 15px -3px ${getColorPrimario()}40`
                    }}
                  >
                    {tienda?.nombre?.charAt(0) || 'T'}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold tracking-wide text-white" style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  letterSpacing: '0.05em',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600
                }}>
                  {tienda?.nombre || 'Tienda Online'}
                </h1>
                <p className="text-sm font-normal mt-1 tracking-wider" style={{
                  color: getColorSecundario(),
                  letterSpacing: '0.1em',
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 300
                }}>
                  Tu experiencia de compra favorita
                </p>
              </div>
            </Link>
          </div>
          
          {/* Búsqueda */}
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-[#0f1629] text-white border border-subtle focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-green-500)]"
                style={{ boxShadow: '0 15px 40px -25px rgba(0,0,0,0.6)', borderColor: 'var(--color-border)' }}
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 h-full px-5 focus:outline-none text-white"
                style={{ color: getColorSecundario() }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          
          {/* Enlaces y autenticación */}
          <div className="flex items-center space-x-4">
            <Link 
              to={`/${tiendaSlug}/productos`} 
              style={{ color: getColorSecundario() }}
              className="hover:opacity-90 transition-opacity font-semibold text-sm"
            >
              Productos
            </Link>
            
            <div className="flex items-center space-x-2">
              {mostrarBotonesCarrito && (
                <div className="flex space-x-1">
                  <button
                    onClick={handleCarritoClick}
                    className="px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-colors duration-300 font-medium flex items-center cursor-pointer"
                    style={{ backgroundColor: getColorPrimario() }}
                    disabled={carritoLoading}
                  >
                    <span className="mr-1">Ver carrito</span>
                    <span className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold" style={{ color: getColorPrimario() }}>
                      {itemCount}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleQuickViewCarrito}
                    className="px-3 py-1.5 rounded-md transition-colors duration-300 font-medium cursor-pointer bg-white/5 border border-subtle hover:border-white/30"
                    style={{ 
                      color: getColorPrimario(),
                      border: `1px solid ${getColorSecundario()}33` 
                    }}
                    title="Vista rápida del carrito"
                    disabled={carritoLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div 
                className="relative cursor-pointer" 
                onClick={handleIconoCarritoClick}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 hover:opacity-80 transition-opacity" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ color: getColorPrimario() }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && isAuthenticated && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
            </div>
            
            {/* Botones de autenticación */}
            {user ? (
              <div className="flex items-center ml-2 relative" ref={menuRef}>
                <div 
                  className="flex items-center space-x-2 py-2 px-4 rounded-lg text-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ 
                    background: `linear-gradient(to right, ${getColorPrimario()}, ${getColorSecundario()})`,
                    border: `2px solid ${getColorSecundario()}`
                  }}
                  onClick={toggleMenuUsuario}
                >
                  {/* Avatar con inicial del usuario */}
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-sm shadow-inner" style={{ color: getColorPrimario() }}>
                    {((user.name || user.nombre || user.email || 'U').charAt(0).toUpperCase())}
                  </div>
                  
                  <span className="font-semibold tracking-wide">{user.name || user.nombre || (user.email ? user.email.split('@')[0] : 'Usuario')}</span>
                  
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 text-white transition-transform duration-200 ${menuUsuarioAbierto ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Menú desplegable */}
                {menuUsuarioAbierto && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-2xl z-50 py-2" style={{ border: `1px solid ${getColorSecundario()}33` }}>
                    <div 
                      className="px-4 py-3 border-b border-subtle flex items-center cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: `${getColorSecundario()}40` }}
                      onClick={irAMisPedidos}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: getColorPrimario() }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      <span className="font-medium">Mis Pedidos</span>
                    </div>
                    
                    <div 
                      className="px-4 py-3 border-b border-subtle flex items-center cursor-pointer hover:bg-white/5 transition-colors"
                      style={{ borderColor: `${getColorSecundario()}40` }}
                      onClick={irAConfiguraciones}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: getColorSecundario() }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="font-medium">Configuraciones</span>
                    </div>
                    
                    <div 
                      className="px-4 py-3 flex items-center cursor-pointer hover:bg-white/5 text-red-400 transition-colors"
                      onClick={handleLogout}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span className="font-medium">Cerrar sesión</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-4 py-1.5 text-white rounded-md hover:opacity-95 transition-colors duration-300 font-medium cursor-pointer shadow-lg"
                  style={{ background: `linear-gradient(120deg, ${getColorPrimario()}, ${getColorSecundario()})` }}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="px-4 py-1.5 rounded-md transition-colors duration-300 font-medium cursor-pointer border border-subtle bg-white/5 hover:border-white/30"
                  style={{ 
                    color: getColorPrimario(),
                    border: `1px solid ${getColorSecundario()}33` 
                  }}
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
        onNeedsVerification={(email) => {
          setEmailToVerify(email);
          setVerifyEmailOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={handleAuthSuccess}
        onNeedsVerification={(email) => {
          setEmailToVerify(email);
          setVerifyEmailOpen(true);
        }}
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