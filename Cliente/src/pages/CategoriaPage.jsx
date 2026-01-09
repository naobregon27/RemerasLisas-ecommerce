import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import ProductList from '../components/product/ProductList';
import Loader from '../components/ui/Loader';
import { fetchProductosPorCategoria } from '../store/productoSlice';
import { agregarAlCarrito } from '../store/carritoSlice';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import ProductViewModal from '../components/modals/ProductViewModal';
import { productoService } from '../services/productoService';

const CategoriaPage = () => {
  const { tiendaSlug, categoriaId } = useParams();
  const dispatch = useDispatch();
  const { productosPorCategoria, loading, error } = useSelector((state) => state.productos);
  const { categorias, tienda } = useSelector((state) => state.tienda);
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 12;
  const [paginasTotal, setPaginasTotal] = useState(1);
  const [productosVisibles, setProductosVisibles] = useState([]);
  
  // Estados para el modal de producto
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  
  // Colores de la tienda para estilos personalizados
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#3b82f6';
  const colorSecundario = tienda?.configuracion?.colorSecundario || '#60a5fa';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';
  
  // Encontrar la categoría por ID para obtener su nombre
  const categoriaActual = categorias?.find(cat => cat._id === categoriaId);
  const categoriaNombre = categoriaActual?.nombre || categoriaId; // Usar ID como fallback
  
  useEffect(() => {
    if (tiendaSlug && categoriaId) {
      // Usar el ID de la categoría directamente (el backend espera el ID, no el nombre)
      dispatch(fetchProductosPorCategoria({ 
        slug: tiendaSlug, 
        categoriaId: categoriaId // Usar el ID directamente
      }));
    }
  }, [dispatch, tiendaSlug, categoriaId]);
  
  // Efecto para actualizar la paginación cuando cambian los productos
  useEffect(() => {
    // Asegurar que productosPorCategoria sea un array
    const productos = Array.isArray(productosPorCategoria) ? productosPorCategoria : [];
    
    if (productos.length > 0) {
      // Calcular el número total de páginas
      const totalPaginas = Math.ceil(productos.length / productosPorPagina);
      setPaginasTotal(totalPaginas);
      
      // Si la página actual es mayor que el total de páginas, regresar a la primera página
      if (paginaActual > totalPaginas && totalPaginas > 0) {
        setPaginaActual(1);
      }
    } else {
      setPaginasTotal(0);
      setPaginaActual(1);
    }
  }, [productosPorCategoria, paginaActual]);
  
  // Efecto para actualizar los productos visibles
  useEffect(() => {
    // Asegurar que productosPorCategoria sea un array
    const productos = Array.isArray(productosPorCategoria) ? productosPorCategoria : [];
    
    if (productos.length > 0) {
      const indexInicial = (paginaActual - 1) * productosPorPagina;
      const indexFinal = indexInicial + productosPorPagina;
      setProductosVisibles(productos.slice(indexInicial, indexFinal));
    } else {
      setProductosVisibles([]);
    }
  }, [productosPorCategoria, paginaActual, productosPorPagina]);
  
  // Método para agregar productos al carrito
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
  
  // Controladores para la paginación
  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
      // Scroll al inicio de la lista de productos
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const irAPaginaSiguiente = () => {
    if (paginaActual < paginasTotal) {
      setPaginaActual(paginaActual + 1);
      // Scroll al inicio de la lista de productos
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    // Scroll al inicio de la lista de productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Crear un array con los números de página para mostrar (para navegación)
  const obtenerBotonesPaginacion = () => {
    const botones = [];
    
    // Si hay pocas páginas, mostrar todas
    if (paginasTotal <= 5) {
      for (let i = 1; i <= paginasTotal; i++) {
        botones.push(i);
      }
      return botones;
    }
    
    // Si estamos en las primeras páginas
    if (paginaActual <= 3) {
      return [1, 2, 3, 4, '...', paginasTotal];
    }
    
    // Si estamos en las últimas páginas
    if (paginaActual >= paginasTotal - 2) {
      return [1, '...', paginasTotal - 3, paginasTotal - 2, paginasTotal - 1, paginasTotal];
    }
    
    // Si estamos en medio
    return [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', paginasTotal];
  };
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="glass-panel inline-block px-6 py-4 rounded-xl">
            <h2 className="text-2xl text-red-300 mb-4">Error al cargar los productos</h2>
            <p className="text-muted">{error.message || 'Hubo un problema al obtener los productos de esta categoría.'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-[var(--color-navy-900)] to-[var(--color-navy-800)] py-8 relative overflow-hidden border-b border-subtle">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: colorPrimario }}></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full" style={{ backgroundColor: colorSecundario }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{categoriaNombre}</h1>
          <p className="text-muted">Explora nuestra selección de productos en esta categoría</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="large" />
          </div>
        ) : (
          <div>
            {Array.isArray(productosPorCategoria) && productosPorCategoria.length > 0 ? (
              <>
                <div className="glass-panel p-4 rounded-lg shadow-lg mb-6 flex justify-between items-center border border-subtle">
                  <div className="flex items-center text-white text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>{productosPorCategoria.length}</strong> productos encontrados en <span className="font-medium">{categoriaNombre}</span></span>
                  </div>
                </div>
                
                <ProductList 
                  productos={productosVisibles} 
                  loading={false} 
                  onProductClick={handleProductClick} 
                  onAgregarAlCarrito={handleAgregarAlCarrito}
                  compact={true}
                />
              </>
            ) : (
              <div className="glass-panel p-8 rounded-lg shadow-lg text-center">
                <div className="text-muted mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-xl font-semibold text-white mb-2">No se encontraron productos</p>
                  <p className="text-muted">No hay productos disponibles en la categoría "{categoriaNombre}" en este momento.</p>
                </div>
              </div>
            )}
            
            {/* Paginación */}
            {paginasTotal > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
                  {/* Botón para página anterior */}
                  <button
                    onClick={irAPaginaAnterior}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      paginaActual === 1 
                        ? 'border-subtle bg-[var(--color-navy-800)] text-muted cursor-not-allowed' 
                        : 'border-subtle bg-[var(--color-navy-700)] text-white hover:bg-[var(--color-navy-600)] cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Números de página */}
                  {obtenerBotonesPaginacion().map((pagina, index) => (
                    pagina === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="relative inline-flex items-center px-4 py-2 border border-subtle bg-[var(--color-navy-700)] text-white"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${pagina}`}
                        onClick={() => irAPagina(pagina)}
                        className={`relative inline-flex items-center px-4 py-2 border transition-colors cursor-pointer ${
                          paginaActual === pagina
                            ? 'z-10 border-transparent text-white'
                            : 'border-subtle bg-[var(--color-navy-700)] text-white hover:bg-[var(--color-navy-600)]'
                        }`}
                        style={paginaActual === pagina ? {backgroundColor: colorPrimario} : {}}
                        aria-current={paginaActual === pagina ? 'page' : undefined}
                      >
                        {pagina}
                      </button>
                    )
                  ))}
                  
                  {/* Botón para página siguiente */}
                  <button
                    onClick={irAPaginaSiguiente}
                    disabled={paginaActual === paginasTotal}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                      paginaActual === paginasTotal 
                        ? 'border-subtle bg-[var(--color-navy-800)] text-muted cursor-not-allowed' 
                        : 'border-subtle bg-[var(--color-navy-700)] text-white hover:bg-[var(--color-navy-600)] cursor-pointer'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
            
            {/* Información de paginación */}
            {paginasTotal > 0 && (
              <div className="mt-3 text-center text-sm text-muted">
                Mostrando página {paginaActual} de {paginasTotal} 
                ({productosVisibles.length} de {productosPorCategoria.length} productos)
              </div>
            )}
          </div>
        )}
      </div>
      
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

export default CategoriaPage; 