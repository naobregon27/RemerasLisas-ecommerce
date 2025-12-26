import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tiendaService } from '../services';
import { productoService } from '../services';

// Thunks
export const fetchTienda = createAsyncThunk(
  'tienda/fetchTienda',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerTienda(slug);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener la tienda'
      );
    }
  }
);

export const fetchCategorias = createAsyncThunk(
  'tienda/fetchCategorias',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerCategorias(slug);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener categorías'
      );
    }
  }
);

export const fetchDestacados = createAsyncThunk(
  'tienda/fetchDestacados',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerDestacados(slug);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener productos destacados'
      );
    }
  }
);

export const fetchProductosEnOferta = createAsyncThunk(
  'tienda/fetchProductosEnOferta',
  async (slug, { rejectWithValue }) => {
    try {
      return await productoService.obtenerProductosEnOferta(slug);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Error al obtener productos en oferta'
      );
    }
  }
);

const tiendaSlice = createSlice({
  name: 'tienda',
  initialState: {
    tienda: null,
    categorias: [],
    destacados: [],
    productosEnOferta: [],
    loading: false,
    loadingOfertas: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Tienda
      .addCase(fetchTienda.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTienda.fulfilled, (state, action) => {
        state.tienda = action.payload;
        state.loading = false;
      })
      .addCase(fetchTienda.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener la tienda' };
      })
      
      // Categorías
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener categorías' };
      })
      
      // Destacados
      .addCase(fetchDestacados.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestacados.fulfilled, (state, action) => {
        state.destacados = action.payload;
        state.loading = false;
      })
      .addCase(fetchDestacados.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: 'Error al obtener productos destacados' };
      })
      
      // Productos en oferta
      .addCase(fetchProductosEnOferta.pending, (state) => {
        state.loadingOfertas = true;
        state.error = null;
      })
      .addCase(fetchProductosEnOferta.fulfilled, (state, action) => {
        state.productosEnOferta = action.payload;
        state.loadingOfertas = false;
      })
      .addCase(fetchProductosEnOferta.rejected, (state, action) => {
        state.loadingOfertas = false;
        state.error = action.payload;
      });
  },
});

export default tiendaSlice.reducer; 