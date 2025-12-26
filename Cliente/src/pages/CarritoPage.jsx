import { useDispatch, useSelector } from 'react-redux';
import { fetchCarrito, actualizarCantidad, eliminarDelCarrito, logCarritoState } from '../store/carritoSlice';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { pedidoService } from '../services';

const CarritoPage = () => {
  const dispatch = useDispatch();
  const carrito = useSelector((state) => state.carrito || {});
  const { items = [], total = 0, loading, error } = carrito;
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  // Estado local para manejar cantidades sin actualizar el servidor inmediatamente
  const [cantidadesLocales, setCantidadesLocales] = useState({});
  // Referencia para manejar actualizaciones pendientes
  const actualizacionesPendientes = useRef({});
  // Estado para controlar los items que están actualizando actualmente
  const [itemsActualizando, setItemsActualizando] = useState({});
  // Referencia para almacenar el intervalo de actualización
  const intervaloActualizacion = useRef(null);
  
  // Estados para el modal de confirmación de pedido
  const [showModal, setShowModal] = useState(false);
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [formData, setFormData] = useState({
    direccionEnvio: {
      nombre: '',
      direccion: '',
      ciudad: '',
      codigoPostal: '',
      pais: 'Argentina',
      telefono: ''
    },
    metodoPago: 'mercadopago',
    notas: ''
  });
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [erroresCampos, setErroresCampos] = useState({});

  // Obtener configuración de la tienda
  const { tienda } = useSelector((state) => state.tienda);
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#335cff';
  const colorSecundario = tienda?.configuracion?.colorSecundario || '#3b82f6';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  // Calcular el total basado en las cantidades locales
  const calcularTotal = () => {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((sum, item) => {
      if (!item.producto) return sum;
      
      const productoId = item.producto._id || item.producto.id;
      const precio = item.producto.precio || item.precioUnitario || 0;
      const cantidad = cantidadesLocales[productoId] !== undefined 
        ? cantidadesLocales[productoId] 
        : item.cantidad;
        
      return sum + (precio * cantidad);
    }, 0).toFixed(2);
  };

  // Sincronizar todas las actualizaciones pendientes con el servidor
  const sincronizarActualizaciones = async () => {
    const idsConActualizaciones = Object.keys(actualizacionesPendientes.current);
    if (idsConActualizaciones.length === 0) return;
    
    // Marcar todos los items como actualizando
    const enActualizacion = {};
    idsConActualizaciones.forEach(id => {
      enActualizacion[id] = true;
    });
    setItemsActualizando(prev => ({...prev, ...enActualizacion}));
    
    // Procesar cada actualización
    for (const productoId of idsConActualizaciones) {
      const nuevaCantidad = actualizacionesPendientes.current[productoId];
      
      try {
        await dispatch(actualizarCantidad({ 
          productoId, 
          cantidad: nuevaCantidad 
        })).unwrap();
      } catch (error) {
        console.error(`Error al actualizar cantidad para producto ${productoId}:`, error);
        toast.error(`Error al actualizar la cantidad: ${error.message || 'Error desconocido'}`);
        
        // Revertir este item a su valor original
        const item = items.find(i => (i.producto._id || i.producto.id) === productoId);
        setCantidadesLocales(prev => ({
          ...prev,
          [productoId]: item ? item.cantidad : 1
        }));
      } finally {
        // Limpiar la actualización pendiente
        delete actualizacionesPendientes.current[productoId];
        
        // Quitar la marca de actualizando
        setItemsActualizando(prev => {
          const newState = {...prev};
          delete newState[productoId];
          return newState;
        });
      }
    }
    
    // Solo mostrar un mensaje si hubo actualizaciones exitosas
    if (idsConActualizaciones.length > 0) {
      toast.success('Cantidades actualizadas');
    }
  };

  // Cargar el carrito una vez al inicio y configurar el intervalo de actualización
  useEffect(() => {
    const cargarCarrito = async () => {
      setIsLoading(true);
      try {
        const resultado = await dispatch(fetchCarrito()).unwrap();
        console.log("Carrito cargado con éxito:", resultado);
        // Inicializar cantidades locales con las del carrito
        if (resultado && resultado.items) {
          const cantidadesIniciales = {};
          resultado.items.forEach(item => {
            if (item.producto && (item.producto._id || item.producto.id)) {
              const id = item.producto._id || item.producto.id;
              cantidadesIniciales[id] = item.cantidad;
            }
          });
          setCantidadesLocales(cantidadesIniciales);
        }
        // Depurar el estado del carrito
        dispatch(logCarritoState());
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Cargar el carrito solo una vez al inicio
    cargarCarrito();
    
    // Sincronizar actualizaciones pendientes al desmontar
    return () => {
      if (Object.keys(actualizacionesPendientes.current).length > 0) {
        sincronizarActualizaciones();
      }
    };
  }, []); // Solo ejecutar una vez al montar el componente

  // Actualiza la cantidad solo localmente de forma inmediata
  const handleCantidadChange = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    
    // Actualizar la cantidad localmente de inmediato
    setCantidadesLocales(prev => ({
      ...prev,
      [productoId]: nuevaCantidad
    }));
    
    // Registrar la actualización pendiente
    actualizacionesPendientes.current[productoId] = nuevaCantidad;
  };

  const handleEliminarProducto = async (productoId) => {
    // Si hay actualizaciones pendientes para este producto, eliminarlas
    if (actualizacionesPendientes.current[productoId]) {
      delete actualizacionesPendientes.current[productoId];
    }
    
    try {
      setItemsActualizando(prev => ({...prev, [productoId]: true}));
      console.log(`Eliminando producto ${productoId} del carrito`);
      await dispatch(eliminarDelCarrito(productoId)).unwrap();
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setItemsActualizando(prev => {
        const newState = {...prev};
        delete newState[productoId];
        return newState;
      });
    }
  };

  // Sincronizar al salir de la página o antes de hacer checkout
  const handleCheckout = async () => {
    if (Object.keys(actualizacionesPendientes.current).length > 0) {
      await sincronizarActualizaciones();
    }
    // Abrir el modal en lugar de navegar a checkout
    setShowModal(true);
  };

  // Función para manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si el campo pertenece a la dirección de envío
    if (name.includes('direccionEnvio.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        direccionEnvio: {
          ...formData.direccionEnvio,
          [field]: value
        }
      });
    } else {
      // Para otros campos como metodoPago o notas
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar error de este campo si existe
    if (erroresCampos[name]) {
      setErroresCampos({
        ...erroresCampos,
        [name]: ''
      });
    }
  };
  
  // Validar formulario antes de enviar
  const validarFormulario = () => {
    const errores = {};
    const { direccionEnvio, metodoPago } = formData;
    
    // Validar campos de dirección
    if (!direccionEnvio.nombre.trim()) 
      errores['direccionEnvio.nombre'] = 'El nombre es obligatorio';
      
    if (!direccionEnvio.direccion.trim()) 
      errores['direccionEnvio.direccion'] = 'La dirección es obligatoria';
      
    if (!direccionEnvio.ciudad.trim()) 
      errores['direccionEnvio.ciudad'] = 'La ciudad es obligatoria';
      
    if (!direccionEnvio.codigoPostal.trim()) 
      errores['direccionEnvio.codigoPostal'] = 'El código postal es obligatorio';
      
    if (!direccionEnvio.telefono.trim()) 
      errores['direccionEnvio.telefono'] = 'El teléfono es obligatorio';
      
    // Validar método de pago
    if (!metodoPago) 
      errores['metodoPago'] = 'Seleccione un método de pago';
    
    setErroresCampos(errores);
    return Object.keys(errores).length === 0;
  };

  // Enviar pedido al backend
  const enviarPedido = async () => {
    if (!validarFormulario()) {
      toast.error('Por favor complete todos los campos obligatorios');
      return;
    }
    
    setEnviandoPedido(true);
    
    try {
      // IMPORTANTE: Sincronizar actualizaciones pendientes antes de crear el pedido
      if (Object.keys(actualizacionesPendientes.current).length > 0) {
        console.log('Sincronizando actualizaciones pendientes antes de crear pedido...');
        await sincronizarActualizaciones();
        // Esperar un momento para que el backend actualice el carrito
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Verificar que el carrito tenga items
      if (!items || items.length === 0) {
        toast.error('El carrito está vacío');
        setEnviandoPedido(false);
        return;
      }
      
      // Calcular el total y otros valores
      const subtotal = Number(calcularTotal());
      const impuestos = Number((subtotal * 0.10).toFixed(2)); // 10% de impuestos
      const costoEnvio = 0.00; // Envío gratuito
      const descuento = 0.00; // Sin descuentos por ahora
      const total = Number((subtotal + impuestos + costoEnvio - descuento).toFixed(2));
      
      // Crear objeto de pedido según el formato de la guía de Mercado Pago
      // El backend obtiene los productos automáticamente del carrito del usuario
      // Pero enviamos los totales calculados para validación y consistencia
      const pedidoData = {
        direccionEnvio: formData.direccionEnvio,
        metodoPago: formData.metodoPago,
        subtotal,
        impuestos,
        costoEnvio,
        descuento,
        total,
        notas: formData.notas || ''
      };
      
      console.log('Enviando pedido con datos:', pedidoData);
      
      // Enviar al servidor
      const resultado = await pedidoService.crearPedido(pedidoData);
      
      // Log para debugging
      console.log('Respuesta completa del backend:', resultado);
      console.log('Datos de Mercado Pago:', resultado.mercadopago);
      
      // Si es Mercado Pago, redirigir al init_point
      if (formData.metodoPago === 'mercadopago') {
        // Verificar que la respuesta tenga la estructura correcta
        if (resultado.mercadopago) {
          // Verificar si hay error en la creación de la preferencia (según documentación)
          if (resultado.mercadopago.error) {
            // Hay un error específico de Mercado Pago
            const errorMessage = resultado.mercadopago.message || resultado.mercadopago.error;
            toast.error(errorMessage || 'Error al configurar el pago con Mercado Pago');
            setEnviandoPedido(false);
            return;
          }
          
          // Obtener la URL de pago (el backend devuelve initPoint para producción o sandboxInitPoint para test)
          // Según la documentación: usar initPoint || sandboxInitPoint
          const urlPago = resultado.mercadopago.initPoint || resultado.mercadopago.sandboxInitPoint;
          
          if (urlPago) {
            // Todo bien, redirigir a Mercado Pago
            localStorage.setItem('pedidoId', resultado._id);
            
            // Mostrar mensaje de redirección
            toast.info('Redirigiendo a Mercado Pago...');
            
            // Redirigir a Mercado Pago
            setTimeout(() => {
              window.location.href = urlPago;
            }, 1000);
            return;
          }
        }
        
        // Si llegamos aquí, el pedido se creó pero Mercado Pago falló
        // El backend devolvió 201 pero no pudo crear la preferencia o no hay URL de pago
        console.warn('Pedido creado pero Mercado Pago no está disponible o no se obtuvo la URL de pago. Pedido ID:', resultado._id);
        console.warn('Datos de Mercado Pago recibidos:', resultado.mercadopago);
        
        // Calcular el total final
        const totalFinal = resultado.total || Number((Number(calcularTotal()) * 1.10).toFixed(2));
        
        // Guardar el pedido con flag de error de Mercado Pago
        setPedidoConfirmado({
          ...resultado,
          metodoPago: 'mercadopago',
          total: totalFinal,
          mercadopagoError: true // Flag para mostrar mensaje especial
        });
        
        // Mostrar mensaje informativo
        toast.warning('Tu pedido fue registrado, pero hubo un problema técnico con Mercado Pago. Te contactaremos pronto.');
        
        // Cerrar modal de checkout y mostrar confirmación
        setShowModal(false);
        setShowConfirmacionModal(true);
        setEnviandoPedido(false);
        return;
      }
      
      // Para otros métodos de pago, guardar el pedido confirmado
      const totalFinal = resultado.total || Number((Number(calcularTotal()) * 1.10).toFixed(2));
      setPedidoConfirmado({
        ...resultado,
        metodoPago: formData.metodoPago,
        total: totalFinal
      });
      
      // Mostrar el modal de confirmación según el método de pago
      setShowModal(false);
      setShowConfirmacionModal(true);
      
      // Solo redirigir después de que el usuario cierre el modal de confirmación
      // La redirección se hará en el botón de "Continuar" del modal de confirmación
    } catch (error) {
      toast.error(`Error al crear el pedido: ${error.message || 'Hubo un problema al procesar su pedido'}`);
      console.error('Error al crear pedido:', error);
    } finally {
      setEnviandoPedido(false);
    }
  };

  // Función para continuar después de la confirmación
  const handleContinuarDespuesDeConfirmacion = () => {
    setShowConfirmacionModal(false);
    // Redirigir a la página de mis pedidos
    navigate(`/${tiendaSlug}/mis-pedidos`);
  };

  const contenidoCarrito = () => {
    // Verificar si está cargando
    if (isLoading || loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrimario }}></div>
          <p className="text-gray-600 font-medium">Cargando tu carrito...</p>
        </div>
      );
    }
    
    // Verificar si hay error
    if (error) {
      return (
        <div className="text-center py-12 max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <p className="font-bold text-lg mb-1">No pudimos cargar tu carrito</p>
            <p className="text-red-600">{error}</p>
          </div>
          <button 
            onClick={() => dispatch(fetchCarrito())}
            className="mt-6 px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: colorPrimario, color: colorTexto }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    // Calcular total local
    const totalLocal = calcularTotal();

    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold mb-3 text-white tracking-tight">Carrito de Compras</h1>
          <p className="text-muted text-lg">Revisa tus productos y completa tu compra</p>
        </div>
        
        {!items || items.length === 0 ? (
          <div className="glass-panel rounded-xl shadow-2xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[var(--color-green-500)]/20 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[var(--color-green-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-white text-2xl font-semibold mb-2">Tu carrito está vacío</p>
            <p className="text-muted mb-8">Comienza a agregar productos para realizar tu compra</p>
            <Link
              to={`/${tiendaSlug || ''}/productos`}
              className="inline-block btn-primary px-8 py-3.5 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(actualizacionesPendientes.current).length > 0 && (
              <div className="glass-panel p-4 rounded-lg flex justify-between items-center border-l-4 border-[var(--color-green-500)]">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[var(--color-green-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-white font-medium">Tienes cambios sin guardar en el carrito.</p>
                </div>
                <button 
                  onClick={sincronizarActualizaciones}
                  className="btn-primary px-5 py-2.5 rounded-lg font-medium transition-all shadow hover:shadow-md cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            )}

            <div className="glass-panel rounded-xl shadow-2xl overflow-hidden">
            {items.map((item, index) => {
              // Verificar que item.producto exista
              if (!item.producto) {
                console.error(`Producto no encontrado en item ${index}:`, item);
                return null;
              }

              const productoId = item.producto._id || item.producto.id;
              const precio = item.producto.precio || item.precioUnitario || 0;
              // Usar la cantidad local si está disponible, de lo contrario usar la del item
              const cantidadActual = cantidadesLocales[productoId] !== undefined 
                ? cantidadesLocales[productoId] 
                : item.cantidad;
              const isUpdating = itemsActualizando[productoId] || false;
              const tieneCambios = actualizacionesPendientes.current[productoId] !== undefined;
              
              return (
                  <div key={productoId || index} className={`flex flex-col md:flex-row items-center justify-between p-6 ${index !== 0 ? 'border-t border-subtle' : ''} hover:bg-[var(--color-navy-700)]/30 transition-all`}>
                  <div className="flex items-center space-x-6 w-full md:w-auto">
                      <div className="relative">
                    <img 
                      src={(() => {
                        // Verificar si el producto tiene imágenes como array
                        if (item.producto.imagenes && Array.isArray(item.producto.imagenes) && item.producto.imagenes.length > 0) {
                          const imagen = item.producto.imagenes[0];
                          // Si es un objeto con url
                          if (typeof imagen === 'object' && imagen.url) {
                            return imagen.url;
                          }
                          // Si es un string
                          if (typeof imagen === 'string') {
                            return imagen;
                          }
                        }
                        
                        // Si hay una propiedad imagen directa en el producto
                        if (item.producto.imagen) {
                          // Si es un string
                          if (typeof item.producto.imagen === 'string') {
                            // Si es base64 o url completa
                            if (item.producto.imagen.startsWith('data:') || item.producto.imagen.startsWith('http')) {
                              return item.producto.imagen;
                            }
                            // Si es ruta relativa
                            return `${import.meta.env.VITE_API_URL}/uploads/${item.producto.imagen}`;
                          }
                        }
                        
                        // Si no hay imagen válida
                        return 'https://via.placeholder.com/400?text=Sin+imagen';
                      })()} 
                      alt={item.producto.nombre} 
                          className="w-28 h-28 object-cover rounded-xl border-2 border-subtle shadow-lg" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400?text=Sin+imagen';
                      }}
                      loading="lazy"
                    />
                      {tieneCambios && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--color-green-500)] flex items-center justify-center text-xs text-white shadow-lg">
                            ✓
                          </div>
                      )}
                    </div>
                      <div>
                        <h3 className="font-bold text-xl text-white mb-2">{item.producto.nombre}</h3>
                        <p className="text-[var(--color-green-500)] font-bold text-lg">${precio.toFixed(2)}</p>
                        <p className="text-muted text-sm mt-1">Subtotal: ${(precio * cantidadActual).toFixed(2)}</p>
                  </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div className="flex items-center space-x-2 bg-[var(--color-navy-700)] px-3 py-2 rounded-lg border border-subtle">
                      <button
                        onClick={() => handleCantidadChange(productoId, Math.max(1, cantidadActual - 1))}
                          className="w-9 h-9 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all disabled:opacity-50"
                          style={{ 
                            backgroundColor: cantidadActual <= 1 ? 'var(--color-navy-600)' : 'var(--color-green-500)',  
                            color: 'white'
                          }}
                        disabled={cantidadActual <= 1 || isUpdating}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-lg font-bold text-white">
                        {isUpdating ? 
                            <span className="inline-block w-5 h-5 border-t-2 border-r-2 border-[var(--color-green-500)] rounded-full animate-spin"></span> 
                          : cantidadActual}
                      </span>
                      <button
                        onClick={() => handleCantidadChange(productoId, cantidadActual + 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all disabled:opacity-50"
                          style={{ backgroundColor: 'var(--color-green-500)', color: 'white' }}
                        disabled={isUpdating}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleEliminarProducto(productoId)}
                        className="text-red-400 hover:text-red-300 ml-2 p-2 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer group"
                      disabled={isUpdating}
                        aria-label="Eliminar producto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
            
            <div className="glass-panel p-8 rounded-xl shadow-2xl border-l-4 border-[var(--color-green-500)]">
              <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
                  <span className="text-xl font-semibold text-muted">Total a pagar:</span>
                  <span className="text-5xl font-extrabold mt-2 text-[var(--color-green-500)]">${totalLocal}</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleCheckout}
                    className="btn-primary px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                >
                    Finalizar compra
                </button>
                <Link
                  to={`/${tiendaSlug || ''}/productos`}
                    className="px-8 py-4 rounded-lg text-lg font-semibold border-2 border-[var(--color-green-500)] text-[var(--color-green-500)] hover:bg-[var(--color-green-500)] hover:text-white shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
                >
                  Seguir comprando
                </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de confirmación de pedido */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-sm">
            <div className="glass-panel rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar transform transition-all">
              <div className="px-6 py-5 flex justify-between items-center sticky top-0 z-10 border-b border-subtle backdrop-blur-md bg-[var(--color-navy-800)]/80">
                <h2 className="text-2xl font-bold text-white">Finalizar tu compra</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-muted hover:text-white focus:outline-none transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Método de pago con diseño mejorado */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-5 text-white text-xl">Método de pago</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.metodoPago === 'mercadopago' ? 'border-[var(--color-green-500)] bg-[var(--color-green-500)]/10' : 'border-subtle bg-[var(--color-navy-800)]/50 hover:border-[var(--color-green-500)]/50'}`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        value="mercadopago"
                        checked={formData.metodoPago === 'mercadopago'}
                        onChange={handleInputChange}
                        className="mr-4 cursor-pointer h-5 w-5 accent-[var(--color-green-500)]"
                      />
                      <div className="flex flex-1 items-center">
                        <div className="h-12 w-12 rounded-full bg-[#009EE3]/20 flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#009EE3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-white text-base">💳 Mercado Pago</span>
                          <p className="text-sm text-muted">Tarjeta, efectivo, débito y más</p>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.metodoPago === 'efectivo' ? 'border-[var(--color-green-500)] bg-[var(--color-green-500)]/10' : 'border-subtle bg-[var(--color-navy-800)]/50 hover:border-[var(--color-green-500)]/50'}`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        value="efectivo"
                        checked={formData.metodoPago === 'efectivo'}
                        onChange={handleInputChange}
                        className="mr-4 cursor-pointer h-5 w-5 accent-[var(--color-green-500)]"
                      />
                      <div className="flex flex-1 items-center">
                        <div className="h-12 w-12 rounded-full bg-[var(--color-green-500)]/20 flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-green-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-white text-base">Efectivo</span>
                          <p className="text-sm text-muted">Paga cuando recibas tu compra</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.metodoPago === 'transferencia' ? 'border-[var(--color-green-500)] bg-[var(--color-green-500)]/10' : 'border-subtle bg-[var(--color-navy-800)]/50 hover:border-[var(--color-green-500)]/50'}`}>
                      <input
                        type="radio"
                        name="metodoPago"
                        value="transferencia"
                        checked={formData.metodoPago === 'transferencia'}
                        onChange={handleInputChange}
                        className="mr-4 cursor-pointer h-5 w-5 accent-[var(--color-green-500)]"
                      />
                      <div className="flex flex-1 items-center">
                        <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-white text-base">Transferencia bancaria</span>
                          <p className="text-sm text-muted">Transferencia directa a nuestra cuenta</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  {erroresCampos['metodoPago'] && (
                    <p className="text-red-400 text-sm mt-2 ml-1">{erroresCampos['metodoPago']}</p>
                  )}
                </div>
                
                {/* Datos de envío */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-5 text-white text-xl pb-3 border-b border-subtle">Datos de envío</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Nombre completo <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="direccionEnvio.nombre"
                          value={formData.direccionEnvio.nombre}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 ${erroresCampos['direccionEnvio.nombre'] ? 'border-red-500' : 'border-subtle'} rounded-lg cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all`}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      {erroresCampos['direccionEnvio.nombre'] && (
                        <p className="text-red-400 text-sm mt-1">{erroresCampos['direccionEnvio.nombre']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Teléfono <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="direccionEnvio.telefono"
                          value={formData.direccionEnvio.telefono}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 ${erroresCampos['direccionEnvio.telefono'] ? 'border-red-500' : 'border-subtle'} rounded-lg cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all`}
                          placeholder="3454123456"
                        />
                      </div>
                      {erroresCampos['direccionEnvio.telefono'] && (
                        <p className="text-red-400 text-sm mt-1">{erroresCampos['direccionEnvio.telefono']}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white text-sm font-semibold mb-2">
                        Dirección <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="direccionEnvio.direccion"
                          value={formData.direccionEnvio.direccion}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 ${erroresCampos['direccionEnvio.direccion'] ? 'border-red-500' : 'border-subtle'} rounded-lg cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all`}
                          placeholder="Av. Cauzu 123"
                        />
                      </div>
                      {erroresCampos['direccionEnvio.direccion'] && (
                        <p className="text-red-400 text-sm mt-1">{erroresCampos['direccionEnvio.direccion']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Ciudad <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="direccionEnvio.ciudad"
                          value={formData.direccionEnvio.ciudad}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 ${erroresCampos['direccionEnvio.ciudad'] ? 'border-red-500' : 'border-subtle'} rounded-lg cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all`}
                          placeholder="Goya, Corrientes"
                        />
                      </div>
                      {erroresCampos['direccionEnvio.ciudad'] && (
                        <p className="text-red-400 text-sm mt-1">{erroresCampos['direccionEnvio.ciudad']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-semibold mb-2">
                        Código Postal <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="direccionEnvio.codigoPostal"
                          value={formData.direccionEnvio.codigoPostal}
                          onChange={handleInputChange}
                          className={`w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 ${erroresCampos['direccionEnvio.codigoPostal'] ? 'border-red-500' : 'border-subtle'} rounded-lg cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all`}
                          placeholder="3450"
                        />
                      </div>
                      {erroresCampos['direccionEnvio.codigoPostal'] && (
                        <p className="text-red-400 text-sm mt-1">{erroresCampos['direccionEnvio.codigoPostal']}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Notas adicionales */}
                <div className="mb-8">
                  <label className="block text-white text-sm font-semibold mb-2">
                    Notas adicionales <span className="text-muted text-xs font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      placeholder="Instrucciones especiales para la entrega"
                      className="w-full pl-10 px-4 py-3 bg-[var(--color-navy-800)] border-2 border-subtle rounded-lg resize-none min-h-[100px] cursor-text focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white placeholder-muted transition-all"
                    ></textarea>
                  </div>
                </div>
                
                {/* Resumen del pedido */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-5 text-white text-xl pb-3 border-b border-subtle">Resumen del pedido</h3>
                  <div className="bg-[var(--color-navy-800)]/50 rounded-lg p-5 border border-subtle">
                    <div className="space-y-3">
                      {items.map((item, index) => {
                        if (!item.producto) return null;
                        
                        const productoId = item.producto._id || item.producto.id;
                        const precio = item.producto.precio || item.precioUnitario || 0;
                        const cantidad = cantidadesLocales[productoId] !== undefined 
                          ? cantidadesLocales[productoId] 
                          : item.cantidad;
                          
                        return (
                          <div key={index} className="flex justify-between items-center py-3 border-b border-subtle last:border-0">
                            <div className="flex items-start">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-navy-700)] mr-3 flex-shrink-0 border border-subtle">
                                <img 
                                  src={(() => {
                                    if (item.producto.imagenes && Array.isArray(item.producto.imagenes) && item.producto.imagenes.length > 0) {
                                      return typeof item.producto.imagenes[0] === 'object' ? item.producto.imagenes[0].url : item.producto.imagenes[0];
                                    }
                                    if (item.producto.imagen) {
                                      return item.producto.imagen;
                                    }
                                    return 'https://via.placeholder.com/400?text=Producto';
                                  })()}
                                  alt={item.producto.nombre}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400?text=Producto';
                                  }}
                                />
                              </div>
                              <div>
                                <span className="text-white font-semibold text-sm">{item.producto.nombre}</span>
                                <span className="text-muted text-xs block mt-1">Cantidad: {cantidad}</span>
                              </div>
                            </div>
                            <span className="font-bold text-white">${(precio * cantidad).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-5 pt-4 space-y-3 border-t border-subtle">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Subtotal:</span>
                        <span className="font-semibold text-white">${calcularTotal()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Impuestos (10%):</span>
                        <span className="font-semibold text-white">${(calcularTotal() * 0.10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Envío:</span>
                        <span className="font-semibold text-[var(--color-green-500)]">GRATIS</span>
                      </div>
                      <div className="flex justify-between font-bold text-xl pt-4 border-t border-subtle mt-3">
                        <span className="text-white">Total:</span>
                        <span className="text-[var(--color-green-500)]">${(Number(calcularTotal()) + Number(calcularTotal()) * 0.10).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-subtle p-5 flex justify-between sticky bottom-0 backdrop-blur-md bg-[var(--color-navy-800)]/80 z-10">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[var(--color-navy-700)] text-white rounded-lg hover:bg-[var(--color-navy-600)] border border-subtle transition font-semibold cursor-pointer flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al carrito
                </button>
                <button
                  onClick={enviarPedido}
                  disabled={enviandoPedido}
                  className="btn-primary px-10 py-3 rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-70 cursor-pointer flex items-center font-bold"
                >
                  {enviandoPedido ? (
                    <span className="flex items-center">
                      <span className="inline-block w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></span>
                      Procesando...
                    </span>
                  ) : (
                    <>
                      <span>Confirmar pedido</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación según método de pago */}
        {showConfirmacionModal && pedidoConfirmado && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center overflow-y-auto pt-10 pb-10 backdrop-blur-sm">
            <div className="glass-panel rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all border border-subtle">
              <div className="p-6 text-center">
                {pedidoConfirmado.metodoPago === 'efectivo' ? (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                         style={{ backgroundColor: `${colorPrimario}25` }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4"
                           style={{ borderColor: colorPrimario }}>
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                             style={{ color: colorPrimario }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Pedido Realizado!</h2>
                    <p className="text-lg text-muted mb-6">
                      Su pedido ha sido confirmado con éxito. Pronto nos pondremos en contacto con usted.
                    </p>
                    <div className="rounded-lg text-center mb-8 p-6 bg-[var(--color-navy-800)] border border-subtle">
                      <p className="font-medium mb-2 text-sm text-muted">Número de pedido:</p>
                      <p className="text-xl font-mono font-semibold tracking-wide"
                         style={{ color: colorPrimario }}>{pedidoConfirmado._id}</p>
                      <div className="mt-4 pt-4 border-t border-subtle">
                        <p className="text-sm text-muted">Guarde este número para cualquier consulta</p>
                      </div>
                    </div>
                    <button
                      onClick={handleContinuarDespuesDeConfirmacion}
                      className="w-full py-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      style={{ backgroundColor: colorPrimario, color: colorTexto }}
                    >
                      Continuar
                    </button>
                  </>
                ) : pedidoConfirmado.metodoPago === 'transferencia' ? (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                         style={{ backgroundColor: `${colorPrimario}25` }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4"
                           style={{ borderColor: colorPrimario }}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                             style={{ color: colorPrimario }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Pedido Confirmado!</h2>
                    <p className="text-lg text-muted mb-6">
                      Su pedido ha sido registrado con éxito. Para completar el proceso, debe realizar la transferencia.
                    </p>
                    <div className="rounded-lg bg-[var(--color-navy-800)] border border-subtle mb-6 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-[var(--color-navy-700)] border-b border-subtle">
                        <h3 className="font-semibold" style={{ color: colorPrimario }}>Datos para la transferencia:</h3>
                      </div>
                      <div className="p-5">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted mb-1">CVU/CBU:</p>
                            <div className="flex items-center">
                              <span className="font-mono text-white text-lg tracking-wide select-all">0000003100066274168247</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('0000003100066274168247');
                                  toast.success('Número copiado al portapapeles');
                                }}
                                className="ml-2 text-muted hover:text-white cursor-pointer"
                                title="Copiar al portapapeles"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted mb-1">Alias:</p>
                            <div className="flex items-center">
                              <span className="font-mono text-white text-lg select-all">tienda.pagos</span>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText('tienda.pagos');
                                  toast.success('Alias copiado al portapapeles');
                                }}
                                className="ml-2 text-muted hover:text-white cursor-pointer"
                                title="Copiar al portapapeles"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted mb-1">Monto a transferir:</p>
                            <span className="font-bold text-xl" style={{ color: colorPrimario }}>${pedidoConfirmado.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-subtle">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-muted">Una vez realizada la transferencia, envíanos el comprobante por WhatsApp para agilizar la entrega.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleContinuarDespuesDeConfirmacion}
                      className="w-full py-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      style={{ backgroundColor: colorPrimario, color: colorTexto }}
                    >
                      Entendido
                    </button>
                  </>
                ) : pedidoConfirmado.mercadopagoError ? (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                         style={{ backgroundColor: `${colorPrimario}25` }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4 border-yellow-500">
                        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">⚠️ Pedido Registrado</h2>
                    <p className="text-lg text-muted mb-6">
                      Tu pedido fue registrado correctamente, pero hubo un problema técnico con Mercado Pago.
                    </p>
                    
                    {/* Alerta de problema técnico */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <svg className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-white font-semibold mb-1">Atención: Problema con Mercado Pago</p>
                          <p className="text-muted text-sm">
                            Nos pondremos en contacto contigo pronto para coordinar el pago. 
                            Puedes usar otro método de pago o esperar a que te contactemos.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-lg text-center mb-8 p-6 bg-[var(--color-navy-800)] border border-subtle">
                      <p className="font-medium mb-2 text-sm text-muted">Número de pedido:</p>
                      <p className="text-xl font-mono font-semibold tracking-wide"
                         style={{ color: colorPrimario }}>{pedidoConfirmado._id}</p>
                      <div className="mt-4 pt-4 border-t border-subtle">
                        <p className="text-sm text-muted">Total: <span className="font-semibold text-white">${pedidoConfirmado.total?.toFixed(2)}</span></p>
                        <p className="text-xs text-muted mt-2">Guarde este número para cualquier consulta</p>
                      </div>
                    </div>
                    <button
                      onClick={handleContinuarDespuesDeConfirmacion}
                      className="w-full py-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      style={{ backgroundColor: colorPrimario, color: colorTexto }}
                    >
                      Entendido
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                         style={{ backgroundColor: `${colorPrimario}25` }}>
                      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4"
                           style={{ borderColor: colorPrimario }}>
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                             style={{ color: colorPrimario }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Pedido Realizado!</h2>
                    <p className="text-lg text-muted mb-6">
                      Su pedido ha sido confirmado con éxito. Procesaremos el pago por tarjeta y pronto recibirá una confirmación.
                    </p>
                    <div className="rounded-lg text-center mb-8 p-6 bg-[var(--color-navy-800)] border border-subtle">
                      <p className="font-medium mb-2 text-sm text-muted">Número de pedido:</p>
                      <p className="text-xl font-mono font-semibold tracking-wide"
                         style={{ color: colorPrimario }}>{pedidoConfirmado._id}</p>
                      <div className="mt-4 pt-4 border-t border-subtle">
                        <p className="text-sm text-muted">Hemos enviado un correo con los detalles del pedido</p>
                      </div>
                    </div>
                    <button
                      onClick={handleContinuarDespuesDeConfirmacion}
                      className="w-full py-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg cursor-pointer"
                      style={{ backgroundColor: colorPrimario, color: colorTexto }}
                    >
                      Continuar
                    </button>
                  </>
                )}
              </div>
              <div className="border-t border-subtle px-6 py-4 bg-[var(--color-navy-700)] flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     style={{ color: colorPrimario }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-muted text-sm">
                  <span>¿Preguntas? Contáctanos al </span>
                  <a href="tel:+5493777123456" className="font-medium text-white" style={{ color: colorPrimario }}>3777-123456</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      {contenidoCarrito()}
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Layout>
  );
};

export default CarritoPage; 