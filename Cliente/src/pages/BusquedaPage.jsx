import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import ProductList from '../components/product/ProductList';
import Loader from '../components/ui/Loader';
import { buscarProductos, limpiarResultadosBusqueda } from '../store/productoSlice';

const BusquedaPage = () => {
  const { tiendaSlug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { resultadosBusqueda, loading, error } = useSelector((state) => state.productos);
  
  // Obtener el término de búsqueda de la URL
  const query = new URLSearchParams(location.search).get('q');
  
  useEffect(() => {
    if (tiendaSlug && query) {
      dispatch(buscarProductos({ slug: tiendaSlug, query }));
    }
    
    // Limpiar resultados al desmontar componente
    return () => {
      dispatch(limpiarResultadosBusqueda());
    };
  }, [dispatch, tiendaSlug, query]);
  
  return (
    <Layout>
      <div className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Resultados de búsqueda</h1>
          <p className="text-gray-600">
            {query ? `Mostrando resultados para: "${query}"` : 'Ingresa un término de búsqueda'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl text-red-600 mb-4">Error al buscar productos</h2>
            <p className="text-gray-700">{error.message || 'Hubo un problema al realizar la búsqueda.'}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader size="large" />
          </div>
        ) : (
          <div>
            {resultadosBusqueda.length > 0 ? (
              <ProductList 
                productos={resultadosBusqueda} 
                loading={false} 
                title={`${resultadosBusqueda.length} productos encontrados`} 
              />
            ) : query ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h2 className="text-xl text-gray-800 mb-4">No se encontraron productos</h2>
                <p className="text-gray-600">No hay productos que coincidan con "{query}".</p>
                <p className="text-gray-600 mt-2">Intenta con otras palabras o revisa nuestra sección de productos destacados.</p>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h2 className="text-xl text-gray-800 mb-4">Realiza una búsqueda</h2>
                <p className="text-gray-600">Utiliza la barra de búsqueda para encontrar productos.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BusquedaPage; 