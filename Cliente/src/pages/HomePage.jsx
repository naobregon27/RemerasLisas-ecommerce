import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Banner from '../components/ui/Banner';
import BannerGallery from '../components/ui/BannerGallery';
import SeccionesPersonalizadas from '../components/ui/SeccionesPersonalizadas';
import ProductList from '../components/product/ProductList';
import ProductCarousel from '../components/product/ProductCarousel';
import Loader from '../components/ui/Loader';
import { fetchDestacados, fetchProductosEnOferta } from '../store/tiendaSlice';
import CategoryModal from './CategoryModal';
import ProductViewModal from '../components/modals/ProductViewModal';
import { productoService } from '../services/productoService';
import { tiendaService } from '../services/tiendaService';
import { agregarAlCarrito } from '../store/carritoSlice';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const HomePage = () => {
  const { tiendaSlug } = useParams();
  const dispatch = useDispatch();
  const { 
    tienda, 
    destacados, 
    productosEnOferta,
    loading, 
    loadingOfertas,
    error 
  } = useSelector((state) => state.tienda);
  
  // Estado para controlar el modal de categoría
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Estado para el modal de detalles de producto
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Estado para todos los productos (para el carrusel)
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  
  // Colores de la tienda para estilos personalizados
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#3b82f6';
  const colorSecundario = tienda?.configuracion?.colorSecundario || '#60a5fa';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  useEffect(() => {
    if (tiendaSlug) {
      // Limpiar datos anteriores cuando cambia el slug
      setTodosLosProductos([]);
      
      console.log("Cargando productos destacados y en oferta para el slug:", tiendaSlug);
      dispatch(fetchDestacados(tiendaSlug));
      dispatch(fetchProductosEnOferta(tiendaSlug));
      
      // Cargar todos los productos para el carrusel
      setLoadingTodos(true);
      tiendaService.obtenerTodosLosProductos(tiendaSlug, { page: 1, limit: 100 })
        .then(data => {
          console.log('Productos cargados para carrusel:', data.productos?.length || 0);
          setTodosLosProductos(data.productos || []);
          setLoadingTodos(false);
        })
        .catch(error => {
          console.error('Error al cargar todos los productos:', error);
          setLoadingTodos(false);
        });
    }
  }, [dispatch, tiendaSlug]);

  // Efecto para depurar productos en oferta
  useEffect(() => {
    if (productosEnOferta) {
      console.log('Productos en oferta en HomePage:', productosEnOferta.length, productosEnOferta);
      if (productosEnOferta.length > 0) {
        console.log('Detalles de productos en oferta:', productosEnOferta.map(p => ({
          nombre: p.nombre,
          enOferta: p.enOferta,
          porcentajeDescuento: p.porcentajeDescuento,
          precioAnterior: p.precioAnterior,
          precio: p.precio
        })));
      } else {
        console.warn('No se encontraron productos en oferta');
      }
    } else {
      console.log('productosEnOferta es null o undefined');
    }
  }, [productosEnOferta]);

  // Manejador para abrir el modal al hacer clic en una categoría
  const handleCategoryClick = (categoria, e) => {
    e.preventDefault(); // Prevenir la navegación
    setSelectedCategory(categoria);
    setModalOpen(true);
  };

  // Función para abrir el modal de detalles de producto
  const handleProductClick = async (producto) => {
    // Mostrar el modal inmediatamente con los datos básicos que ya tenemos
    setSelectedProduct(producto);
    setProductModalOpen(true);
    
    // Cargar los detalles completos en segundo plano
    setLoadingProduct(true);
    try {
      const detalle = await productoService.obtenerProducto(tiendaSlug, producto.slug);
      // Actualizar con los detalles completos
      setSelectedProduct(detalle);
    } catch (e) {
      // Si hay error, mantener los datos básicos que ya teníamos
      console.error('Error al cargar detalles del producto:', e);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleAgregarAlCarrito = async (producto) => {
    // Verificar si el usuario está autenticado
    if (!authService.isAuthenticated()) {
      toast.error('Necesitas iniciar sesión para agregar productos al carrito');
      return;
    }
    
    try {
      await dispatch(agregarAlCarrito({ producto, cantidad: 1 })).unwrap();
      toast.success('Producto agregado al carrito');
    } catch (error) {
      toast.error('Error al agregar el producto al carrito');
    }
  };

  // Mostrar loader mientras está cargando la tienda inicial
  if (loading && !tienda) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="glass-panel inline-block px-6 py-4 rounded-xl">
            <Loader size="large" color="white" />
            <p className="text-muted mt-4">Cargando tienda...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Solo mostrar error si no está cargando y hay un error real
  if (error && !loading && !tienda) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="glass-panel inline-block px-6 py-4 rounded-xl">
            <h2 className="text-2xl text-red-300 mb-4">Error al cargar la tienda</h2>
            <p className="text-muted">{error.message || 'Hubo un problema al obtener los datos de la tienda.'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Banner />
      
      <BannerGallery />
      
      <SeccionesPersonalizadas />
      
      <div className="container mx-auto px-4 py-8">
        {/* Carrusel de todos los productos */}
        {(todosLosProductos && todosLosProductos.length > 0) || loadingTodos ? (
          <ProductCarousel 
            productos={todosLosProductos || []} 
            loading={loadingTodos}
            onProductClick={handleProductClick}
            colorPrimario={colorPrimario}
          />
        ) : null}
        
        {/* Sección de productos destacados */}
        <div className="mb-12 cursor-pointer">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
                style={{ backgroundColor: colorPrimario }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={colorTexto}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Productos Destacados</h2>
            </div>
            <div className="hidden md:block">
              <div 
                className="h-[2px] w-24 rounded-full"
                style={{ backgroundColor: `${colorPrimario}40` }}
              ></div>
            </div>
          </div>
          
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 opacity-5 -mr-10 -mt-10" style={{ color: colorPrimario }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <ProductList 
              productos={destacados} 
              loading={loading} 
              title="" 
              onProductClick={handleProductClick}
              compact={true}
            />
          </div>
        </div>
        
        {/* Sección de productos en oferta - Solo mostrar si realmente hay productos en oferta */}
        {productosEnOferta && Array.isArray(productosEnOferta) && productosEnOferta.length > 0 ? (
          <div className="mb-12 cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md bg-gradient-to-br from-red-500 to-orange-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Ofertas Especiales</h2>
              </div>
              <div className="hidden md:block">
                <div className="h-[2px] w-24 rounded-full bg-gradient-to-r from-[var(--color-green-700)] to-[var(--color-navy-700)]"></div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              {/* Fondo con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f1629] to-[#0b3d2e] opacity-90"></div>
              
              {/* Elementos decorativos */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full opacity-40"></div>
              <div className="absolute bottom-4 left-8 w-4 h-4 bg-white/15 rounded-full opacity-60"></div>
              <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-white/15 rounded-full opacity-40"></div>
              
              {/* Badge de Oferta */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-[var(--color-green-500)] to-[var(--color-navy-700)] text-white px-4 py-1 rounded-full font-bold text-sm shadow-md">
                OFERTA
              </div>
              
              {/* Contenido */}
              <div className="relative z-10 p-6">
                <ProductList 
                  productos={productosEnOferta} 
                  loading={loadingOfertas} 
                  title="" 
                  onProductClick={handleProductClick}
                  compact={false}
                  showDiscount={true}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* Secciones de categorías populares si están disponibles */}
        {tienda?.categoriasPopulares && tienda.categoriasPopulares.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-md" 
                  style={{ backgroundColor: colorSecundario }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke={colorTexto}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Categorías Populares</h2>
              </div>
              <div className="hidden md:block">
                <div 
                  className="h-[2px] w-24 rounded-full"
                  style={{ backgroundColor: `${colorSecundario}40` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tienda.categoriasPopulares.map((categoria) => (
                <div 
                  key={categoria._id}
                  className="glass-panel rounded-lg overflow-hidden shadow hover:shadow-2xl transition-all cursor-pointer transform hover:translate-y-[-2px]"
                  onClick={(e) => handleCategoryClick(categoria, e)}
                  style={{ borderTop: `3px solid ${colorSecundario}` }}
                >
                  <div className="block p-6 text-center cursor-pointer">
                    <h3 className="text-lg font-semibold text-white mb-2 cursor-pointer">{categoria.nombre}</h3>
                    <p className="text-sm text-muted cursor-pointer">{categoria.descripcion || `Ver productos de ${categoria.nombre}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional de la tienda */}
        {tienda?.descripcionExtendida && (
        <div className="mt-12 glass-panel rounded-lg shadow-md p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                style={{ backgroundColor: `${colorPrimario}20` }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={colorPrimario}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            <h2 className="text-2xl font-bold text-white cursor-pointer">Sobre Nosotros</h2>
            </div>
          <div className="prose max-w-none text-muted">
              <p>{tienda.descripcionExtendida}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de categoría */}
      {selectedCategory && (
        <CategoryModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoriaId={selectedCategory._id}
          categoriaNombre={selectedCategory.nombre}
        />
      )}

      {/* Modal de detalles de producto */}
      <ProductViewModal 
        isOpen={productModalOpen}
        onClose={() => { setProductModalOpen(false); setSelectedProduct(null); }}
        producto={selectedProduct}
        loading={loadingProduct}
      />
    </Layout>
  );
};

export default HomePage; 