import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CategoryModal from '../../pages/CategoryModal';

const Footer = () => {
  const { tiendaSlug } = useParams();
  const { tienda } = useSelector((state) => state.tienda);
  const { categorias } = useSelector((state) => state.tienda);
  
  // Estado para controlar el modal de categoría
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Manejador para abrir el modal al hacer clic en una categoría
  const handleCategoryClick = (categoria, e) => {
    e.preventDefault(); // Prevenir la navegación
    setSelectedCategory(categoria);
    setModalOpen(true);
    console.log('Categoría seleccionada en Footer:', categoria.nombre, categoria._id);
  };
  
  const year = new Date().getFullYear();

  return (
    <>
      <footer className="bg-[#0b1224] text-white border-t border-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de la tienda */}
            <div>
              <h2 className="text-xl font-bold mb-4">{tienda?.nombre || 'Tienda Online'}</h2>
              <p className="text-muted mb-2">{tienda?.descripcion || 'Tu tienda online de confianza'}</p>
              {tienda?.direccion && (
                <address className="text-muted not-italic mb-2">
                  <span>{tienda.direccion}</span>
                </address>
              )}
              {tienda?.telefono && (
                <p className="text-muted mb-2">
                  <span>Teléfono: {tienda.telefono}</span>
                </p>
              )}
              {tienda?.email && (
                <p className="text-muted mb-2">
                  <span>Email: {tienda.email}</span>
                </p>
              )}
            </div>

            {/* Categorías */}
            <div>
              <h2 className="text-xl font-bold mb-4">Categorías</h2>
              <ul className="space-y-2">
                {categorias && categorias.length > 0 ? (
                  categorias.slice(0, 6).map((categoria) => (
                    <li key={categoria._id}>
                      <a 
                        href="#"
                        onClick={(e) => handleCategoryClick(categoria, e)}
                        className="text-muted hover:text-white transition duration-300 cursor-pointer"
                      >
                        {categoria.nombre}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-muted">No hay categorías disponibles</li>
                )}
              </ul>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h2 className="text-xl font-bold mb-4">Enlaces Rápidos</h2>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to={`/${tiendaSlug}`}
                    className="text-muted hover:text-white transition duration-300"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/${tiendaSlug}/productos`}
                    className="text-muted hover:text-white transition duration-300"
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/${tiendaSlug}/carrito`}
                    className="text-muted hover:text-white transition duration-300"
                  >
                    Carrito
                  </Link>
                </li>
                {/* Añadir más enlaces según sea necesario */}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {year} {tienda?.nombre || 'Tienda Online'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

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

export default Footer; 