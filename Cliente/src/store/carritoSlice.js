import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { carritoService } from '../services/carritoService';
import { authService } from '../services/authService';

// Thunks
export const fetchCarrito = createAsyncThunk(
  'carrito/fetchCarrito',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        console.log('⚠️ Usuario no autenticado para obtener carrito');
        return { items: [], total: 0 };
      }
      
      // Obtener IDs de productos eliminados (si hay alguno almacenado temporalmente)
      const currentState = getState().carrito;
      const deletedProductIds = currentState.deletedProductIds || [];
      
      const response = await carritoService.obtenerCarrito();
      console.log('📦 Carrito obtenido:', response);
      
      // Asegurarse de que la respuesta tenga la estructura correcta
      // Verificar la estructura de respuesta y transformarla si es necesario
      let items = [];
      if (response && response.productos && Array.isArray(response.productos)) {
        // Adaptar la estructura de la respuesta al formato esperado por el frontend
        items = response.productos
          .filter(item => !deletedProductIds.includes(item.producto._id) && !deletedProductIds.includes(item.producto.id))
          .map(item => ({
            producto: item.producto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario || item.producto.precio,
            subtotal: item.subtotal,
            _id: item._id
          }));
        // Reducir los logs de depuración para evitar sobrecarga en la consola
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 ${items.length} items procesados`);
        }
      } else if (response && response.items && Array.isArray(response.items)) {
        items = response.items.filter(item => 
          !deletedProductIds.includes(item.producto._id) && 
          !deletedProductIds.includes(item.producto.id)
        );
      } else {
        console.warn('⚠️ Estructura de respuesta del carrito inesperada:', response);
      }
      
      // Calcular el total manualmente para mayor seguridad
      const total = items.reduce((sum, item) => {
        const precio = item.precioUnitario || item.producto.precio || 0;
        return sum + (precio * item.cantidad);
      }, 0);
      
      return {
        items: items,
        total,
        deletedProductIds  // Mantener el registro de productos eliminados
      };
    } catch (error) {
      console.error('❌ Error al obtener carrito:', error);
      return rejectWithValue(error.message || 'Error al obtener el carrito');
    }
  }
);

export const agregarAlCarrito = createAsyncThunk(
  'carrito/agregarAlCarrito',
  async ({ producto, cantidad }, { rejectWithValue, dispatch }) => {
    try {
      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        return rejectWithValue('Debes iniciar sesión para agregar productos al carrito');
      }
      
      const response = await carritoService.agregarAlCarrito(producto, cantidad);
      
      // Actualizar el carrito después de agregar un producto
      setTimeout(() => {
        dispatch(fetchCarrito());
      }, 300);
      
      // Procesar la respuesta de manera similar a fetchCarrito
      let items = [];
      if (response && response.productos && Array.isArray(response.productos)) {
        items = response.productos.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario || item.producto.precio,
          subtotal: item.subtotal,
          _id: item._id
        }));
      } else if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
      }
      
      return {
        items: items,
        total: response.total || response.subtotal || 0
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al agregar al carrito');
    }
  }
);

export const actualizarCantidad = createAsyncThunk(
  'carrito/actualizarCantidad',
  async ({ productoId, cantidad }, { rejectWithValue, dispatch }) => {
    try {
      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        return rejectWithValue('Debes iniciar sesión para actualizar el carrito');
      }
      
      const response = await carritoService.actualizarCantidad(productoId, cantidad);
      
      // Actualizar el carrito después de modificar un producto
      setTimeout(() => {
        dispatch(fetchCarrito());
      }, 300);
      
      // Procesar la respuesta de manera similar a fetchCarrito
      let items = [];
      if (response && response.productos && Array.isArray(response.productos)) {
        items = response.productos.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario || item.producto.precio,
          subtotal: item.subtotal,
          _id: item._id
        }));
      } else if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
      }
      
      return {
        items: items,
        total: response.total || response.subtotal || 0
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Error al actualizar cantidad');
    }
  }
);

export const eliminarDelCarrito = createAsyncThunk(
  'carrito/eliminarDelCarrito',
  async (productoId, { rejectWithValue, dispatch, getState }) => {
    try {
      // Verificar si el usuario está autenticado
      if (!authService.isAuthenticated()) {
        return rejectWithValue('Debes iniciar sesión para eliminar productos del carrito');
      }
      
      console.log(`🗑️ Intentando eliminar producto con ID: ${productoId}...`);
      
      // Optimistic update: eliminar el producto del estado antes de la llamada API
      const currentState = getState().carrito;
      const updatedItems = currentState.items.filter(item => {
        const itemId = item.producto._id || item.producto.id;
        const matches = itemId === productoId;
        if (matches) {
          console.log(`🔍 Encontrado producto a eliminar: ${item.producto.nombre}`);
        }
        return !matches;
      });
      
      // Convertir a string para debug
      console.log(`📊 Productos en carrito antes: ${currentState.items.length}, después: ${updatedItems.length}`);
      
      // Llamada a la API
      const response = await carritoService.eliminarDelCarrito(productoId);
      console.log(`✅ Respuesta del servidor al eliminar:`, response);
      
      // Actualizar todo el carrito después de un breve retraso para dar tiempo al servidor
      setTimeout(() => {
        console.log(`🔄 Actualizando carrito completo desde servidor...`);
        dispatch(fetchCarrito());
      }, 500);
      
      // Procesar la respuesta
      let items = [];
      if (response && response.productos && Array.isArray(response.productos)) {
        items = response.productos.map(item => ({
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario || item.producto.precio,
          subtotal: item.subtotal,
          _id: item._id
        }));
        console.log(`📝 Items recibidos del servidor: ${items.length}`);
      } else if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
        console.log(`📝 Items recibidos del servidor (formato alternativo): ${items.length}`);
      } else {
        // Si no hay datos claros en la respuesta, usar los datos locales actualizados
        console.log(`⚠️ No se recibieron datos claros del servidor, usando actualización local`);
        items = updatedItems;
      }
      
      // Verificación extra para asegurar que el item eliminado no esté presente
      items = items.filter(item => {
        const itemId = item.producto._id || item.producto.id;
        return itemId !== productoId;
      });
      
      // Calcular total actualizado
      const total = items.reduce((sum, item) => {
        const precio = item.precioUnitario || item.producto.precio || 0;
        return sum + (precio * item.cantidad);
      }, 0);
      
      return {
        items,
        total
      };
    } catch (error) {
      console.error('❌ Error eliminando producto del carrito:', error);
      // Actualizar carrito de todas formas para sincronizar con el servidor
      setTimeout(() => {
        dispatch(fetchCarrito());
      }, 1000);
      return rejectWithValue(error.message || 'Error al eliminar del carrito');
    }
  }
);

// Initial state
const initialState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  deletedProductIds: [], // Para rastrear productos eliminados entre sesiones
};

// Slice
const carritoSlice = createSlice({
  name: 'carrito',
  initialState,
  reducers: {
    inicializarCarrito: (state) => {
      state.items = [];
      state.total = 0;
      state.loading = false;
      state.error = null;
      state.deletedProductIds = [];
    },
    // Acción para depurar el contenido del carrito
    logCarritoState: (state) => {
      console.log('Estado actual del carrito en Redux:', {
        items: state.items,
        total: state.total,
        loading: state.loading,
        error: state.error,
        deletedProductIds: state.deletedProductIds
      });
    },
    // Nueva acción para rastrear productos eliminados
    marcarProductoEliminado: (state, action) => {
      const productoId = action.payload;
      if (!state.deletedProductIds.includes(productoId)) {
        state.deletedProductIds.push(productoId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch carrito
      .addCase(fetchCarrito.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        // Log de depuración más reducido
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Carrito actualizado: ${state.items.length} items, total: ${state.total}`);
        }
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        console.error('❌ Error en fetchCarrito:', action.payload || action.error.message);
        
        // Si hay un error de autenticación, limpiar el carrito
        if (action.payload === 'No autorizado' || action.error?.message?.includes('401')) {
          state.items = [];
          state.total = 0;
        }
      })
      // Agregar al carrito
      .addCase(agregarAlCarrito.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(agregarAlCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(agregarAlCarrito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Actualizar cantidad
      .addCase(actualizarCantidad.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(actualizarCantidad.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
      })
      .addCase(actualizarCantidad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // Eliminar del carrito
      .addCase(eliminarDelCarrito.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Marcar el producto como eliminado inmediatamente (usando el payload de la acción)
        const productoId = action.meta.arg;
        if (!state.deletedProductIds.includes(productoId)) {
          state.deletedProductIds.push(productoId);
        }
        // Eliminar de los items localmente para actualización instantánea
        state.items = state.items.filter(item => 
          (item.producto._id !== productoId) && (item.producto.id !== productoId)
        );
      })
      .addCase(eliminarDelCarrito.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        // La lista de productos eliminados ya se actualizó en pending
      })
      .addCase(eliminarDelCarrito.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { inicializarCarrito, logCarritoState, marcarProductoEliminado } = carritoSlice.actions;
export default carritoSlice.reducer; 