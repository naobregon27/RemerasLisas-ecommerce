import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCarrito, inicializarCarrito } from '../store/carritoSlice';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { loading, error } = useSelector((state) => state.carrito);

  // Cargar el carrito solo cuando cambia el usuario (login/logout)
  useEffect(() => {
    // Comprobamos si el usuario existe antes de cargar el carrito
    if (user) {
      console.log('Layout: Usuario autenticado, cargando carrito...');
      dispatch(fetchCarrito());
    } else {
      console.log('Layout: Usuario no autenticado, inicializando carrito vacío...');
      dispatch(inicializarCarrito());
    }
  }, [dispatch, user]); // Solo se ejecuta cuando cambia el usuario

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout; 