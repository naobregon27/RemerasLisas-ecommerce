import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/layout/Layout';
import { pedidoService } from '../services';

const MisPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tiendaSlug } = useParams();

  useEffect(() => {
    const cargarPedidos = async () => {
      setIsLoading(true);
      try {
        const data = await pedidoService.obtenerMisPedidos();
        setPedidos(data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
        setError('No se pudieron cargar los pedidos. Por favor, intenta de nuevo más tarde.');
        toast.error('Error al cargar tus pedidos');
      } finally {
        setIsLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  // Función para obtener el color según el estado del pedido
  const getColorEstado = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'procesando':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'enviado':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
      case 'entregado':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'cancelado':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  // Función para obtener el color según el estado del pago
  const getColorPago = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'pagado':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'rechazado':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  // Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Renderizar el contenido de la página
  const renderContenido = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-green-500)]"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass-panel border-l-4 border-red-500 text-red-300 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition cursor-pointer"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    if (pedidos.length === 0) {
      return (
        <div className="text-center py-16 glass-panel rounded-xl shadow-lg">
          <div className="w-20 h-20 mx-auto bg-[var(--color-green-500)]/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-green-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">No tienes pedidos en curso</h2>
          <p className="mt-2 text-muted">¡Haz tu primer pedido ahora!</p>
          <Link
            to={`/${tiendaSlug}/productos`}
            className="mt-6 inline-block px-6 py-3 btn-primary font-semibold rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
          >
            Ver productos
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {pedidos.map((pedido) => (
          <div key={pedido._id} className="glass-panel rounded-xl shadow-lg overflow-hidden border border-subtle hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-[var(--color-green-700)] to-[#10336a] px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold text-lg">Pedido #{pedido._id.substring(pedido._id.length - 8)}</h3>
                <p className="text-blue-100 text-sm">Realizado el {formatearFecha(pedido.createdAt)}</p>
              </div>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorEstado(pedido.estadoPedido)}`}>
                  {pedido.estadoPedido.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getColorPago(pedido.estadoPago)}`}>
                  Pago: {pedido.estadoPago.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {/* Información del envío */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Envío a:</h4>
                <div className="bg-[var(--color-navy-800)] p-4 rounded-lg border border-subtle">
                  <p className="text-white mb-1"><span className="font-medium text-[var(--color-green-500)]">Nombre:</span> {pedido.direccionEnvio.nombre}</p>
                  <p className="text-white mb-1"><span className="font-medium text-[var(--color-green-500)]">Dirección:</span> {pedido.direccionEnvio.direccion}</p>
                  <p className="text-white mb-1"><span className="font-medium text-[var(--color-green-500)]">Ciudad:</span> {pedido.direccionEnvio.ciudad}, {pedido.direccionEnvio.codigoPostal}</p>
                  <p className="text-white"><span className="font-medium text-[var(--color-green-500)]">Teléfono:</span> {pedido.direccionEnvio.telefono}</p>
                </div>
              </div>
              
              {/* Productos */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">Productos:</h4>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {pedido.productos.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b border-subtle pb-3">
                      <img 
                        src={item.producto?.imagenes?.[0]?.url || 'https://via.placeholder.com/80?text=Sin+imagen'} 
                        alt={item.producto?.nombre || 'Producto'} 
                        className="w-16 h-16 object-cover rounded-md border border-subtle shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://via.placeholder.com/80?text=Sin+imagen';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{item.producto?.nombre || 'Producto'}</h5>
                        <div className="flex justify-between text-sm text-muted">
                          <span>Cantidad: {item.cantidad}</span>
                          <span>${item.precio} c/u</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumen financiero */}
              <div className="border-t border-subtle pt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted">Subtotal:</span>
                  <span className="text-white">${pedido.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted">Impuestos:</span>
                  <span className="text-white">${pedido.impuestos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted">Envío:</span>
                  <span className="text-white">${pedido.costoEnvio.toFixed(2)}</span>
                </div>
                {pedido.descuento > 0 && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted">Descuento:</span>
                    <span className="text-green-400">-${pedido.descuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg mt-2 pt-2 border-t border-subtle">
                  <span className="text-white">Total:</span>
                  <span className="text-[var(--color-green-500)]">${pedido.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[var(--color-navy-800)] rounded-lg border border-subtle">
                  <p className="font-medium text-[var(--color-green-500)]">Método de pago:</p>
                  <p className="capitalize text-white">{pedido.metodoPago}</p>
                </div>
                <div className="p-3 bg-[var(--color-navy-800)] rounded-lg border border-subtle">
                  <p className="font-medium text-[var(--color-green-500)]">Tienda:</p>
                  <p className="text-white">{pedido.local?.nombre || 'No especificada'}</p>
                </div>
              </div>
              
              {pedido.notas && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="font-medium text-yellow-300">Notas:</p>
                  <p className="text-muted">{pedido.notas}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white tracking-tight">
          <span className="text-[var(--color-green-500)]">Mis</span> Pedidos en Curso
        </h1>
        
        {renderContenido()}
        
        <div className="mt-8 text-center">
          <Link 
            to={`/${tiendaSlug}/productos`}
            className="px-6 py-3 bg-[var(--color-navy-700)] text-white rounded-full hover:bg-[var(--color-navy-600)] transition font-bold shadow-md inline-block cursor-pointer border border-subtle"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default MisPedidosPage; 