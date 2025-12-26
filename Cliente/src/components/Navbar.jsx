import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ModalCarrito from './ModalCarrito';

const Navbar = () => {
  const [isCarritoOpen, setIsCarritoOpen] = useState(false);
  const { items } = useSelector((state) => state.carrito);
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();

  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);

  const handleCarritoClick = () => {
    if (tiendaSlug) {
      navigate(`/${tiendaSlug}/carrito`);
    } else {
      navigate('/carrito');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Mi Tienda</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {totalItems > 0 && (
              <button
                onClick={handleCarritoClick}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Ver carrito
              </button>
            )}
            <button
              onClick={handleCarritoClick}
              className="relative p-2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            <ModalCarrito
              isOpen={isCarritoOpen}
              onClose={() => setIsCarritoOpen(false)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 