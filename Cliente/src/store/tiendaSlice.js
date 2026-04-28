import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tiendaService } from '../services';
import { productoService } from '../services';

// ── Thunks ──────────────────────────────────────────────────────────────────

export const fetchTienda = createAsyncThunk(
  'tienda/fetchTienda',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerTienda(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener la tienda');
    }
  }
);

export const fetchCategorias = createAsyncThunk(
  'tienda/fetchCategorias',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerCategorias(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener categorías');
    }
  }
);

/**
 * Carga la configuración pública (banner, carrusel, secciones, videos, colores, logo).
 * Se despacha UNA SOLA VEZ desde Layout.jsx; todos los componentes leen el estado Redux.
 */
export const fetchConfiguracionPublica = createAsyncThunk(
  'tienda/fetchConfiguracionPublica',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerConfiguracionPublica(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener configuración');
    }
  }
);

export const fetchDestacados = createAsyncThunk(
  'tienda/fetchDestacados',
  async (slug, { rejectWithValue }) => {
    try {
      return await tiendaService.obtenerDestacados(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener productos destacados');
    }
  }
);

export const fetchProductosEnOferta = createAsyncThunk(
  'tienda/fetchProductosEnOferta',
  async (slug, { rejectWithValue }) => {
    try {
      return await productoService.obtenerProductosEnOferta(slug);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Error al obtener productos en oferta');
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const tiendaSlice = createSlice({
  name: 'tienda',
  initialState: {
    tienda: null,
    categorias: [],
    destacados: [],
    productosEnOferta: [],
    configuracionPublica: null,   // ← banner, carrusel, secciones, videos, colores, logo
    loading: false,
    loadingConfig: false,
    loadingOfertas: false,
    error: null,
  },
  reducers: {
    limpiarEstado: (state) => {
      state.tienda = null;
      state.categorias = [];
      state.destacados = [];
      state.productosEnOferta = [];
      state.configuracionPublica = null;
      state.loadingOfertas = false;
      state.loadingConfig = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Tienda ──
      .addCase(fetchTienda.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTienda.fulfilled, (state, action) => { state.tienda = action.payload; state.loading = false; })
      .addCase(fetchTienda.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Error'; })

      // ── Categorías ──
      .addCase(fetchCategorias.pending, (state) => { state.loading = true; })
      .addCase(fetchCategorias.fulfilled, (state, action) => { state.categorias = action.payload; state.loading = false; })
      .addCase(fetchCategorias.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Configuración pública (una sola llamada) ──
      .addCase(fetchConfiguracionPublica.pending, (state) => { state.loadingConfig = true; })
      .addCase(fetchConfiguracionPublica.fulfilled, (state, action) => {
        state.configuracionPublica = action.payload;
        state.loadingConfig = false;
      })
      .addCase(fetchConfiguracionPublica.rejected, (state) => { state.loadingConfig = false; })

      // ── Destacados ──
      .addCase(fetchDestacados.pending, (state) => { state.loading = true; })
      .addCase(fetchDestacados.fulfilled, (state, action) => { state.destacados = action.payload; state.loading = false; })
      .addCase(fetchDestacados.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Ofertas ──
      .addCase(fetchProductosEnOferta.pending, (state) => { state.loadingOfertas = true; })
      .addCase(fetchProductosEnOferta.fulfilled, (state, action) => { state.productosEnOferta = action.payload; state.loadingOfertas = false; })
      .addCase(fetchProductosEnOferta.rejected, (state, action) => { state.loadingOfertas = false; state.error = action.payload; });
  },
});

export const { limpiarEstado } = tiendaSlice.actions;
export default tiendaSlice.reducer;
