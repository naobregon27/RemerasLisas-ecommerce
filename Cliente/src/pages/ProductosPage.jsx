import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import ProductList from '../components/product/ProductList';
import Loader from '../components/ui/Loader';
import { fetchProductos } from '../store/productoSlice';
import { agregarAlCarrito } from '../store/carritoSlice';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import ProductViewModal from '../components/modals/ProductViewModal';
import { productoService } from '../services/productoService';

const ProductosPage = () => {
  const { tiendaSlug } = useParams();
  const dispatch = useDispatch();
  const { lista: productos, loading, error } = useSelector((state) => state.productos);
  const { tienda } = useSelector((state) => state.tienda);
  
  // Estados para filtrado
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [filtros, setFiltros] = useState({
    precio: {
      min: 0,
      max: 9999999
    },
    ordenarPor: 'relevancia',
    mostrarAgotados: true
  });
  
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

  useEffect(() => {
    if (tiendaSlug) {
      dispatch(fetchProductos(tiendaSlug));
    }
  }, [dispatch, tiendaSlug]);

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

  // Efecto para aplicar filtros cuando cambien los productos o los filtros
  useEffect(() => {
    if (productos) {
      let filtrados = [...productos];
      
      // Filtrar por precio
      filtrados = filtrados.filter(producto => 
        producto.precio >= filtros.precio.min && 
        producto.precio <= filtros.precio.max
      );
      
      // Filtrar por stock
      if (!filtros.mostrarAgotados) {
        filtrados = filtrados.filter(producto => producto.stock > 0);
      }
      
      // Ordenar
      switch (filtros.ordenarPor) {
        case 'precioAsc':
          filtrados.sort((a, b) => a.precio - b.precio);
          break;
        case 'precioDesc':
          filtrados.sort((a, b) => b.precio - a.precio);
          break;
        case 'nombre':
          filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        default:
          // Por relevancia (asumiendo que el backend ya los entrega así)
          break;
      }
      
      setFilteredProductos(filtrados);
      
      // Calcular el número total de páginas
      const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);
      setPaginasTotal(totalPaginas);
      
      // Si la página actual es mayor que el total de páginas, regresar a la primera página
      if (paginaActual > totalPaginas && totalPaginas > 0) {
        setPaginaActual(1);
      }
    }
  }, [productos, filtros]);
  
  // Efecto para actualizar los productos visibles cuando cambie la página o los filtrados
  useEffect(() => {
    if (filteredProductos.length > 0) {
      const indexInicial = (paginaActual - 1) * productosPorPagina;
      const indexFinal = indexInicial + productosPorPagina;
      setProductosVisibles(filteredProductos.slice(indexInicial, indexFinal));
    } else {
      setProductosVisibles([]);
    }
  }, [filteredProductos, paginaActual, productosPorPagina]);

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('precio.')) {
      const precioKey = name.split('.')[1]; // min o max
      setFiltros({
        ...filtros,
        precio: {
          ...filtros.precio,
          [precioKey]: value ? Number(value) : (precioKey === 'min' ? 0 : 9999999)
        }
      });
    } else if (type === 'checkbox') {
      setFiltros({
        ...filtros,
        [name]: checked
      });
    } else {
      setFiltros({
        ...filtros,
        [name]: value
      });
    }
    
    // Volver a la primera página cuando se cambia un filtro
    setPaginaActual(1);
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
            <p className="text-muted">{error.message || 'Hubo un problema al obtener los productos.'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-[var(--color-navy-900)] via-[#0f1b33] to-[var(--color-green-700)] py-8 relative overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: 0.15 }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ backgroundColor: colorPrimario }}></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full" style={{ backgroundColor: colorSecundario }}></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Todos los Productos</h1>
          <p className="text-muted">Encuentra lo que buscas en nuestra selección</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filtros */}
          <div className="w-full md:w-1/4">
            <div className="glass-panel p-6 rounded-xl transition-all hover:shadow-2xl border border-subtle">
              <div className="flex items-center mb-6">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3 shadow-sm"
                  style={{ backgroundColor: `${colorPrimario}20` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={colorPrimario}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Filtros</h2>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rango de Precio
                </h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="precio.min"
                    placeholder="Mínimo"
                    value={filtros.precio.min}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-green-500)] bg-[#0f1629] text-white placeholder:text-muted transition-all cursor-pointer"
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    name="precio.max"
                    placeholder="Máximo"
                    value={filtros.precio.max}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-green-500)] bg-[#0f1629] text-white placeholder:text-muted transition-all cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-white mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Ordenar por
                </h3>
                <select
                  name="ordenarPor"
                  value={filtros.ordenarPor}
                  onChange={handleFiltroChange}
                  className="w-full px-3 py-2 border border-subtle rounded-md bg-[#0f1629] text-white focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-[var(--color-green-500)] transition-all cursor-pointer appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e5edf7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5em 1.5em'
                  }}
                >
                  <option value="relevancia">Relevancia</option>
                  <option value="precioAsc">Precio: Menor a Mayor</option>
                  <option value="precioDesc">Precio: Mayor a Menor</option>
                  <option value="nombre">Nombre</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="mostrarAgotados"
                      checked={filtros.mostrarAgotados}
                      onChange={handleFiltroChange}
                      className="sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-subtle rounded group-hover:border-white/40 transition-all bg-[#0f1629]"></div>
                    {filtros.mostrarAgotados && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center" 
                        style={{ color: colorPrimario }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-white group-hover:text-muted transition-all">Mostrar productos agotados</span>
                </label>
              </div>

              {/* Botón para aplicar filtros (opcional) */}
              <div className="mt-8">
                <button 
                  className="w-full py-2 px-4 rounded-lg shadow-sm font-medium transition-all transform hover:scale-[1.02] hover:shadow-2xl cursor-pointer btn-primary border border-subtle"
                  style={{ 
                    background: `linear-gradient(to right, ${colorPrimario}, ${colorSecundario})`,
                    color: colorTexto
                  }}
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de productos */}
          <div className="w-full md:w-3/4">
            <div className="glass-panel p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
              <div className="flex items-center text-muted text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span><strong>{filteredProductos.length}</strong> productos encontrados</span>
              </div>
              <div className="text-sm text-muted">
                {filtros.ordenarPor !== 'relevancia' && (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    Ordenado por: 
                    <span className="font-medium ml-1">
                      {filtros.ordenarPor === 'precioAsc' && 'Precio: Menor a Mayor'}
                      {filtros.ordenarPor === 'precioDesc' && 'Precio: Mayor a Menor'}
                      {filtros.ordenarPor === 'nombre' && 'Nombre'}
                    </span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Mostrar productos con paginación */}
            <ProductList 
              productos={productosVisibles} 
              loading={loading} 
              onProductClick={handleProductClick} 
              onAgregarAlCarrito={handleAgregarAlCarrito}
              compact={true}
            />
            
            {/* Paginación */}
            {paginasTotal > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-2xl -space-x-px" aria-label="Paginación">
                  {/* Botón para página anterior */}
                  <button
                    onClick={irAPaginaAnterior}
                    disabled={paginaActual === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                      paginaActual === 1 
                        ? 'border-subtle bg-white/5 text-muted cursor-not-allowed' 
                        : 'border-subtle bg-white/5 text-white hover:bg-white/10 cursor-pointer'
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
                        className="relative inline-flex items-center px-4 py-2 border border-subtle bg-white/5 text-muted"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${pagina}`}
                        onClick={() => irAPagina(pagina)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          paginaActual === pagina
                            ? 'z-10 border-subtle text-white transition-colors cursor-pointer bg-[var(--color-green-700)]'
                            : 'border-subtle bg-white/5 text-muted hover:bg-white/10 cursor-pointer'
                        }`}
                        style={paginaActual === pagina ? {backgroundColor: colorPrimario, color: '#e8f5ff'} : {}}
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
                        ? 'border-subtle bg-white/5 text-muted cursor-not-allowed' 
                        : 'border-subtle bg-white/5 text-white hover:bg-white/10 cursor-pointer'
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
                ({productosVisibles.length} de {filteredProductos.length} productos)
              </div>
            )}
          </div>
        </div>
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

export default ProductosPage; 