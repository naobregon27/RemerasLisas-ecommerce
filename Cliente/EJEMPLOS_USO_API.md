# Ejemplos de Uso - API de Tienda Pública

## 🚀 Ejemplos Prácticos con `tiendaService.js`

### 1. Obtener Información de la Tienda

```javascript
import { tiendaService } from '../services';

// Obtener información completa de la tienda
const tienda = await tiendaService.obtenerTienda('mi-tienda-online');

console.log(tienda.nombre); // "Mi Tienda Online"
console.log(tienda.direccion); // "Av. Principal 123"
console.log(tienda.configuracionTienda.colorPrimario); // "#3498db"
```

### 2. Obtener Configuración Visual

```javascript
// Obtener solo la configuración visual/pública
const config = await tiendaService.obtenerConfiguracionPublica('mi-tienda-online');

console.log(config.colorPrimario); // "#3498db"
console.log(config.logo.url); // URL del logo
console.log(config.carrusel); // Array de slides del carrusel
```

### 3. Obtener Productos Destacados

```javascript
// Obtener productos marcados como destacados
const destacados = await tiendaService.obtenerDestacados('mi-tienda-online');

console.log(destacados); // Array de productos destacados
destacados.forEach(producto => {
  console.log(producto.nombre, producto.precio);
});
```

### 4. Obtener Categorías

```javascript
// Obtener todas las categorías de la tienda
const categorias = await tiendaService.obtenerCategorias('mi-tienda-online');

categorias.forEach(categoria => {
  console.log(categoria.nombre, categoria.slug);
});
```

### 5. Obtener Productos por Categoría (CON PAGINACIÓN)

```javascript
// Obtener productos de una categoría específica
const resultado = await tiendaService.obtenerProductosPorCategoria(
  'mi-tienda-online',
  'remeras',
  { page: 1, limit: 12 }
);

console.log(resultado.productos); // Array de productos
console.log(resultado.paginacion.total); // Total de productos en la categoría
console.log(resultado.paginacion.paginas); // Número total de páginas
console.log(resultado.paginacion.paginaActual); // Página actual
console.log(resultado.paginacion.porPagina); // Productos por página
```

### 6. Buscar Productos (CON PAGINACIÓN)

```javascript
// Buscar productos por término
const resultado = await tiendaService.buscarProductos(
  'mi-tienda-online',
  'remera blanca',
  { page: 1, limit: 12 }
);

console.log(resultado.productos); // Productos encontrados
console.log(resultado.paginacion.total); // Total de resultados
```

### 7. Obtener Detalle de Producto

```javascript
// Obtener detalle completo de un producto
const detalle = await tiendaService.obtenerDetalleProducto(
  'mi-tienda-online',
  'remera-lisa-blanca'
);

console.log(detalle.producto); // Producto con todos sus detalles
console.log(detalle.productosRelacionados); // Array de productos similares
```

### 8. Obtener Todos los Productos (CON PAGINACIÓN Y ORDENAMIENTO)

```javascript
// Obtener todos los productos con opciones de ordenamiento
const resultado = await tiendaService.obtenerTodosLosProductos(
  'mi-tienda-online',
  {
    page: 1,
    limit: 12,
    ordenar: 'precio-asc' // Opciones: 'precio-asc', 'precio-desc', 'recientes'
  }
);

console.log(resultado.productos); // Array de productos ordenados
console.log(resultado.paginacion); // Info de paginación
```

## 🔄 Ejemplo con React Component

### Componente con Paginación

```javascript
import React, { useState, useEffect } from 'react';
import { tiendaService } from '../services';

const ProductosPorCategoria = ({ tiendaSlug, categoriaSlug }) => {
  const [productos, setProductos] = useState([]);
  const [paginacion, setPaginacion] = useState({});
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    cargarProductos();
  }, [paginaActual, categoriaSlug]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const resultado = await tiendaService.obtenerProductosPorCategoria(
        tiendaSlug,
        categoriaSlug,
        { page: paginaActual, limit: 12 }
      );
      
      setProductos(resultado.productos);
      setPaginacion(resultado.paginacion);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const irAPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Productos - Página {paginacion.paginaActual} de {paginacion.paginas}</h2>
      
      <div className="productos-grid">
        {productos.map(producto => (
          <div key={producto._id}>
            <h3>{producto.nombre}</h3>
            <p>${producto.precio}</p>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="paginacion">
        <button 
          disabled={paginaActual === 1}
          onClick={() => irAPagina(paginaActual - 1)}
        >
          Anterior
        </button>
        
        <span>
          Mostrando {productos.length} de {paginacion.total} productos
        </span>
        
        <button 
          disabled={paginaActual === paginacion.paginas}
          onClick={() => irAPagina(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ProductosPorCategoria;
```

### Componente de Búsqueda

```javascript
import React, { useState } from 'react';
import { tiendaService } from '../services';

const BuscadorProductos = ({ tiendaSlug }) => {
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [paginacion, setPaginacion] = useState({});
  const [loading, setLoading] = useState(false);

  const buscar = async (page = 1) => {
    if (!termino.trim()) return;
    
    setLoading(true);
    try {
      const resultado = await tiendaService.buscarProductos(
        tiendaSlug,
        termino,
        { page, limit: 12 }
      );
      
      setResultados(resultado.productos);
      setPaginacion(resultado.paginacion);
    } catch (error) {
      console.error('Error al buscar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    buscar(1);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          placeholder="Buscar productos..."
        />
        <button type="submit">Buscar</button>
      </form>

      {loading && <div>Buscando...</div>}

      {resultados.length > 0 && (
        <div>
          <p>Se encontraron {paginacion.total} resultados</p>
          <div className="resultados">
            {resultados.map(producto => (
              <div key={producto._id}>
                <h3>{producto.nombre}</h3>
                <p>${producto.precio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorProductos;
```

### Componente de Detalle de Producto

```javascript
import React, { useState, useEffect } from 'react';
import { tiendaService } from '../services';

const DetalleProducto = ({ tiendaSlug, productoSlug }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDetalle();
  }, [productoSlug]);

  const cargarDetalle = async () => {
    setLoading(true);
    try {
      const resultado = await tiendaService.obtenerDetalleProducto(
        tiendaSlug,
        productoSlug
      );
      
      setDetalle(resultado);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!detalle) return <div>Producto no encontrado</div>;

  const { producto, productosRelacionados } = detalle;

  return (
    <div>
      <div className="producto-principal">
        <h1>{producto.nombre}</h1>
        <p>{producto.descripcion}</p>
        <p className="precio">${producto.precio}</p>
        
        {producto.imagenes?.map((img, index) => (
          <img key={index} src={img} alt={producto.nombre} />
        ))}
        
        <button>Agregar al Carrito</button>
      </div>

      {productosRelacionados.length > 0 && (
        <div className="productos-relacionados">
          <h2>Productos Relacionados</h2>
          <div className="grid">
            {productosRelacionados.map(prod => (
              <div key={prod._id}>
                <h3>{prod.nombre}</h3>
                <p>${prod.precio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;
```

## 🔧 Uso en Redux Thunks

### Ejemplo de Thunk Actualizado

```javascript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { tiendaService } from '../services';

// Thunk para obtener productos con paginación
export const fetchProductosPaginados = createAsyncThunk(
  'productos/fetchPaginados',
  async ({ slug, page = 1, limit = 12, ordenar = '' }, { rejectWithValue }) => {
    try {
      const resultado = await tiendaService.obtenerTodosLosProductos(slug, {
        page,
        limit,
        ordenar
      });
      
      // Retornar tanto productos como paginación
      return resultado;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Error al obtener productos' }
      );
    }
  }
);

// En el reducer
extraReducers: (builder) => {
  builder
    .addCase(fetchProductosPaginados.fulfilled, (state, action) => {
      state.productos = action.payload.productos;
      state.paginacion = action.payload.paginacion;
      state.loading = false;
    });
}
```

## 📌 Notas Importantes

1. **Todos los métodos con paginación retornan un objeto** con `{productos: [], paginacion: {}}`
2. **Los productos siempre están normalizados** con valores por defecto seguros
3. **Las URLs de imágenes son procesadas automáticamente** por el interceptor en `api.js`
4. **Use `encodeURIComponent()` para términos de búsqueda** (ya incluido en los servicios)
5. **Los slugs deben coincidir exactamente** con los registrados en la base de datos

