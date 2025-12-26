import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductosPage from './pages/ProductosPage';
import CategoriaPage from './pages/CategoriaPage';
import BusquedaPage from './pages/BusquedaPage';
import CarritoPage from './pages/CarritoPage';
import MisPedidosPage from './pages/MisPedidosPage';
import PedidoExitoso from './pages/PedidoExitoso';
import PedidoPendiente from './pages/PedidoPendiente';
import PedidoFallido from './pages/PedidoFallido';

// Tienda predeterminada a la que se redirigirá al entrar a la aplicación
const TIENDA_PREDETERMINADA = "concordia";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Routes>
          {/* Redirección automática a la tienda predeterminada */}
          <Route path="/" element={<Navigate to={`/${TIENDA_PREDETERMINADA}`} replace />} />
          
          {/* Rutas de tienda */}
          <Route path="/:tiendaSlug" element={<HomePage />} />
          <Route path="/:tiendaSlug/productos" element={<ProductosPage />} />
          
          {/* Ruta de categoría */}
          <Route path="/:tiendaSlug/categoria/:categoriaId" element={<CategoriaPage />} />
          
          {/* Ruta de búsqueda */}
          <Route path="/:tiendaSlug/buscar" element={<BusquedaPage />} />
          
          {/* Ruta del carrito */}
          <Route path="/:tiendaSlug/carrito" element={<CarritoPage />} />
          
          {/* Ruta de mis pedidos */}
          <Route path="/:tiendaSlug/mis-pedidos" element={<MisPedidosPage />} />
          
          {/* Rutas de callbacks de Mercado Pago */}
          <Route path="/:tiendaSlug/pedido/exitoso" element={<PedidoExitoso />} />
          <Route path="/:tiendaSlug/pedido/pendiente" element={<PedidoPendiente />} />
          <Route path="/:tiendaSlug/pedido/fallido" element={<PedidoFallido />} />
          
          {/* Agregar más rutas para las otras páginas cuando se creen */}
          {/* <Route path="/:tiendaSlug/producto/:productoId" element={<ProductoDetallePage />} /> */}
          {/* <Route path="/:tiendaSlug/checkout" element={<CheckoutPage />} /> */}
          
          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-navy-900)]">
              <div className="text-center p-8 glass-panel rounded-lg shadow-2xl">
                <h1 className="text-4xl font-bold text-red-400 mb-4">404</h1>
                <p className="text-xl mb-4 text-white">Página no encontrada</p>
                <p className="mb-6 text-muted">La página que estás buscando no existe o ha sido movida.</p>
                <a href="/" className="btn-primary px-4 py-2 rounded hover:opacity-95 transition-colors inline-block">
                  Volver al inicio
                </a>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;