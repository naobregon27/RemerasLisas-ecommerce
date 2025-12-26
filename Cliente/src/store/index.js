import { configureStore } from '@reduxjs/toolkit';
import tiendaReducer from './tiendaSlice';
import productoReducer from './productoSlice';
import carritoReducer from './carritoSlice';

const store = configureStore({
  reducer: {
    tienda: tiendaReducer,
    productos: productoReducer,
    carrito: carritoReducer
  }
});

export default store; 