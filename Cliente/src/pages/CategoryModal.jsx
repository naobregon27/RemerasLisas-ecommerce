import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import ProductList from '../components/product/ProductList';
import { fetchProductosPorCategoria, limpiarProductosPorCategoria } from '../store/productoSlice';
import { agregarAlCarrito } from '../store/carritoSlice';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const CategoryModal = ({ isOpen, onClose, categoriaId, categoriaNombre }) => {
  const dispatch = useDispatch();
  const { tiendaSlug } = useParams();
  const { productosPorCategoria, loading, error } = useSelector((state) => state.productos);

  useEffect(() => {
    if (isOpen && categoriaNombre && tiendaSlug) {
      dispatch(fetchProductosPorCategoria({ 
        slug: tiendaSlug, 
        categoriaId: categoriaNombre
      }));
    }
  }, [dispatch, isOpen, categoriaNombre, tiendaSlug]);

  // Limpiar los productos por categoría al cerrar el modal
  const handleClose = () => {
    dispatch(limpiarProductosPorCategoria());
    onClose();
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={categoriaNombre || 'Productos por Categoría'}
    >
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-500">{error.message || 'Error al cargar los productos'}</p>
        </div>
      ) : (
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : (
            <ProductList
              productos={productosPorCategoria}
              loading={loading}
              title={`${productosPorCategoria.length} productos encontrados`}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default CategoryModal; 