import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productoService } from '../services';

// Thunks
export const fetchProductos = createAsyncThunk(
  'productos/fetchProductos',
  async (slug, { rejectWithValue }) => {
    try {
      return await productoService.obtenerProductos(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error al obtener productos' });
    }
  }
);

export const fetchProducto = createAsyncThunk(
  'productos/fetchProducto',
  async ({ slug, productoId }, { rejectWithValue }) => {
    try {
      return await productoService.obtenerProducto(slug, productoId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error al obtener el producto' });
    }
  }
);

export const fetchProductosPorCategoria = createAsyncThunk(
  'productos/fetchProductosPorCategoria',
  async ({ slug, categoriaId }, { rejectWithValue }) => {
    try {
      return await productoService.obtenerProductosPorCategoria(slug, categoriaId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error al obtener productos por categoría' });
    }
  }
);

export const buscarProductos = createAsyncThunk(
  'productos/buscarProductos',
  async ({ slug, query }, { rejectWithValue }) => {
    try {
      return await productoService.buscarProductos(slug, query);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Error al buscar productos' });
    }
  }
);

// Initial state
const initialState = {
  lista: [],
  productoActual: null,
  resultadosBusqueda: [],
  productosPorCategoria: [],
  categoriaActual: null,
  loading: false,
  error: null,
};

// Slice
const productoSlice = createSlice({
  name: 'productos',
  initialState,
  reducers: {
    limpiarProductoActual: (state) => {
      state.productoActual = null;
    },
    limpiarResultadosBusqueda: (state) => {
      state.resultadosBusqueda = [];
    },
    limpiarProductosPorCategoria: (state) => {
      state.productosPorCategoria = [];
      state.categoriaActual = null;
    }
  },
  extraReducers: (builder) => {
    // fetchProductos
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener productos' };
      });

    // fetchProducto
    builder
      .addCase(fetchProducto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducto.fulfilled, (state, action) => {
        state.loading = false;
        state.productoActual = action.payload;
      })
      .addCase(fetchProducto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener el producto' };
      });

    // fetchProductosPorCategoria
    builder
      .addCase(fetchProductosPorCategoria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductosPorCategoria.fulfilled, (state, action) => {
        state.loading = false;
        state.productosPorCategoria = action.payload;
        state.categoriaActual = action.meta.arg.categoriaId;
      })
      .addCase(fetchProductosPorCategoria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener productos por categoría' };
      });

    // buscarProductos
    builder
      .addCase(buscarProductos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buscarProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.resultadosBusqueda = action.payload;
      })
      .addCase(buscarProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al buscar productos' };
      });
  },
});

export const { limpiarProductoActual, limpiarResultadosBusqueda, limpiarProductosPorCategoria } = productoSlice.actions;
export default productoSlice.reducer; 