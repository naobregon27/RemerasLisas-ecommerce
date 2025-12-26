/**
 * Utilidad para depurar la estructura de datos de productos
 */

/**
 * Registra en consola la estructura de un producto para facilitar la depuración
 * @param {Object} producto - Producto a depurar
 */
export const debugProducto = (producto) => {
  if (!producto) {
    console.log('⚠️ Producto no válido (null o undefined)');
    return;
  }
  
  console.group('📌 DEBUG PRODUCTO');
  console.log('ID:', producto._id || producto.id);
  console.log('Nombre:', producto.nombre);
  console.log('Slug:', producto.slug);
  console.log('Precio:', producto.precio);
  
  // Depurar imágenes
  console.group('🖼️ Imágenes');
  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    console.log(`Cantidad: ${producto.imagenes.length}`);
    producto.imagenes.forEach((img, index) => {
      console.log(`[${index}]:`, img);
    });
  } else {
    console.log('❌ No hay imágenes o no es un array:', producto.imagenes);
  }
  console.groupEnd();
  
  console.log('Stock:', producto.stock);
  console.log('Destacado:', producto.destacado ? '✅' : '❌');
  console.log('Descuento:', producto.descuento || 'Sin descuento');
  console.groupEnd();
};

/**
 * Habilita el modo debug global para mostrar información detallada en consola
 */
export const enableDebugMode = () => {
  window.debugProducto = debugProducto;
  console.log('🧪 Modo debug habilitado. Usa window.debugProducto(producto) para depurar un producto.');
}; 