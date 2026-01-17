import React, { useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryModal from '../../pages/CategoryModal';

const CategoriasNav = () => {
  const { tiendaSlug, categoriaId } = useParams();
  const location = useLocation();
  const { categorias, configuracion } = useSelector((state) => state.tienda);
  const [categoriaHover, setCategoriaHover] = useState(null);

  // Obtener color primario de la tienda o fallback
  const colorPrimario = configuracion?.colorPrimario || '#335cff';

  // Detectar si estamos en la página de productos
  const esPaginaProductos = location.pathname === `/${tiendaSlug}/productos`;
  
  // Detectar la categoría seleccionada según la URL
  const categoriaSeleccionada = categoriaId 
    ? categorias?.find(cat => cat._id === categoriaId)
    : null;

  // Hover handlers
  const handleCategoriaHover = (categoria) => setCategoriaHover(categoria);
  const handleMouseLeave = () => setCategoriaHover(null);

  // Estado para controlar el modal de categoría
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Manejador para abrir el modal al hacer clic en una categoría
  const handleCategoryClick = (categoria, e) => {
    e.preventDefault(); // Prevenir la navegación
    setSelectedCategory(categoria);
    setModalOpen(true);
    console.log('Categoría seleccionada:', categoria.nombre, categoria._id);
  };

  if (!categorias || categorias.length === 0) {
    return null;
  }

  return (
    <>
      <nav className="glass-panel border-b border-subtle shadow-lg">
        <div className="container mx-auto px-4">
          <div className="relative">
            <ul className="flex space-x-1 py-3">
              {/* Enlace a Todos los Productos */}
              <li
                className="relative"
                onMouseEnter={() => handleCategoriaHover(null)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={`/${tiendaSlug}/productos`}
                  className={`px-5 py-2 rounded-lg font-medium text-white transition-all duration-200 border-2 ${
                    esPaginaProductos || (categoriaHover === null && !categoriaSeleccionada)
                      ? ''
                      : 'border-transparent'
                  }`}
                  style={
                    esPaginaProductos || (categoriaHover === null && !categoriaSeleccionada)
                      ? {
                          borderColor: colorPrimario,
                          background: colorPrimario + '10',
                          color: colorPrimario,
                          boxShadow: `0 2px 8px 0 ${colorPrimario}22`,
                        }
                      : {}
                  }
                >
                  Productos
                </Link>
              </li>
              
              {categorias.map((categoria) => {
                const esCategoriaSeleccionada = categoriaSeleccionada?._id === categoria._id;
                const esCategoriaHover = categoriaHover?._id === categoria._id;
                const mostrarEstiloActivo = esCategoriaSeleccionada || esCategoriaHover;
                
                return (
                <li
                  key={categoria._id}
                  className="relative"
                  onMouseEnter={() => handleCategoriaHover(categoria)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={`/${tiendaSlug}/categoria/${categoria._id}`}
                    className={`px-5 py-2 rounded-lg font-medium text-white transition-all duration-200 border-2 ${
                        mostrarEstiloActivo
                          ? ''
                          : 'border-transparent'
                      }`}
                      style={
                        mostrarEstiloActivo
                          ? {
                              borderColor: colorPrimario,
                              background: colorPrimario + '10',
                              color: colorPrimario,
                              boxShadow: `0 2px 8px 0 ${colorPrimario}22`,
                            }
                          : {}
                      }
                  >
                    {categoria.nombre}
                  </Link>

                  {/* Menú desplegable de categoría */}
                  <AnimatePresence>
                    {esCategoriaHover && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 glass-panel rounded-xl shadow-2xl z-50 border"
                        style={{
                          borderTop: `4px solid ${colorPrimario}`,
                          borderColor: `${colorPrimario}33`,
                          boxShadow: `0 8px 32px 0 ${colorPrimario}22`,
                        }}
                      >
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-3 text-center">
                            {categoria.nombre}
                          </h3>
                          {/* Lista de productos destacados */}
                          <div className="space-y-2 mb-4">
                            {categoria.productos?.slice(0, 3).map((producto) => (
                              <Link
                                key={producto._id}
                                to={`/${tiendaSlug}/producto/${producto._id}`}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                              >
                                <img
                                  src={producto.imagenes?.[0] || '/placeholder.png'}
                                  alt={producto.nombre}
                                  className="w-12 h-12 object-cover rounded-lg border border-subtle"
                                />
                                <div>
                                  <p className="text-sm font-medium text-white">{producto.nombre}</p>
                                  <p className="text-sm" style={{ color: colorPrimario }}>${producto.precio}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          {/* Subcategorías si existen */}
                          {categoria.subcategorias?.length > 0 && (
                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium text-muted mb-2">Subcategorías</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {categoria.subcategorias.map((subcategoria) => (
                                  <Link
                                    key={subcategoria._id}
                                    to={`/${tiendaSlug}/categoria/${subcategoria._id}`}
                                    className="text-sm text-muted hover:text-white transition-colors duration-200"
                                  >
                                    {subcategoria.nombre}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Ver todos los productos */}
                          <Link
                            to={`/${tiendaSlug}/categoria/${categoria._id}`}
                            className="mt-3 block text-center text-sm font-medium"
                            style={{ color: colorPrimario }}
                          >
                            Ver todos los productos →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
              })}
            </ul>
          </div>
        </div>
      </nav>

      {/* Modal de categoría */}
      {selectedCategory && (
        <CategoryModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoriaId={selectedCategory._id}
          categoriaNombre={selectedCategory.nombre}
        />
      )}
    </>
  );
};

export default CategoriasNav; 