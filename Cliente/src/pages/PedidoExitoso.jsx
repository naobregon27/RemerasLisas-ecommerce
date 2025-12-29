import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { pedidoService } from '../services';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const PedidoExitoso = () => {
  const [searchParams] = useSearchParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();

  // Obtener configuración de la tienda
  const { tienda } = useSelector((state) => state.tienda);
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#335cff';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  useEffect(() => {
    const verificarPago = async () => {
      const paymentId = searchParams.get('payment_id');
      const externalReference = searchParams.get('external_reference');
      
      // Extraer ID del pedido
      const pedidoId = externalReference?.replace('PEDIDO-', '') || 
                       localStorage.getItem('pedidoId');

      if (!pedidoId) {
        toast.error('No se encontró el pedido');
        navigate(`/${tiendaSlug}`);
        return;
      }

      try {
        // Verificar estado del pedido en el backend
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Debes iniciar sesión para ver tu pedido');
          navigate(`/${tiendaSlug}`);
          return;
        }

        const data = await pedidoService.verificarEstadoPago(pedidoId);
        
        setPedido(data);
        setLoading(false);

        // Limpiar localStorage
        localStorage.removeItem('pedidoId');

      } catch (error) {
        console.error('Error verificando pago:', error);
        toast.error('Error al verificar el estado del pago');
        setLoading(false);
      }
    };

    verificarPago();
  }, [searchParams, navigate, tiendaSlug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="glass-panel rounded-xl shadow-2xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mb-4" style={{ borderColor: colorPrimario }}></div>
            <p className="text-white text-xl font-semibold">Verificando pago...</p>
            <p className="text-muted mt-2">Esto puede tomar unos momentos</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden">
          {/* Header con ícono de éxito */}
          <div className="p-8 text-center bg-gradient-to-b from-[var(--color-navy-700)] to-[var(--color-navy-800)]">
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
            <h1 className="text-4xl font-extrabold text-white mb-3">¡Pago Exitoso!</h1>
            <p className="text-lg text-muted">Tu pedido ha sido confirmado y procesado correctamente</p>
          </div>

          {/* Información del pedido */}
          <div className="p-8">
            <div className="bg-[var(--color-navy-700)] rounded-lg p-6 mb-6 border border-subtle">
              <h2 className="font-semibold text-white text-xl mb-4 pb-3 border-b border-subtle">
                Detalles del pedido
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Número de pedido:</span>
                  <span className="font-mono font-semibold text-white">{pedido?.pedidoId || 'Cargando...'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted">Estado del pago:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pedido?.estadoPago === 'completado' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pedido?.estadoPago === 'completado' ? '✓ Completado' : pedido?.estadoPago}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted">Estado del pedido:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pedido?.estadoPedido === 'pendiente' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {pedido?.estadoPedido}
                  </span>
                </div>

                {pedido?.datosTransaccion?.mercadopago && (
                  <>
                    <div className="flex justify-between items-center pt-3 border-t border-subtle">
                      <span className="text-muted">ID de transacción:</span>
                      <span className="font-mono text-sm text-white">
                        {pedido.datosTransaccion.mercadopago.paymentId}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted">Método de pago:</span>
                      <span className="text-white capitalize">
                        {pedido.datosTransaccion.mercadopago.paymentType?.replace('_', ' ')}
                      </span>
                    </div>

                    {pedido.datosTransaccion.mercadopago.installments > 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted">Cuotas:</span>
                        <span className="text-white">
                          {pedido.datosTransaccion.mercadopago.installments}x
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-semibold mb-1">¿Qué sigue ahora?</p>
                  <p className="text-muted text-sm">
                    Hemos recibido tu pago y estamos procesando tu pedido. 
                    Te enviaremos un correo electrónico con la información de seguimiento una vez que se envíe.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/${tiendaSlug}/mis-pedidos`)}
                className="flex-1 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                style={{ backgroundColor: colorPrimario, color: colorTexto }}
              >
                Ver mis pedidos
              </button>
              
              <button
                onClick={() => navigate(`/${tiendaSlug}`)}
                className="flex-1 py-4 rounded-lg font-semibold border-2 text-white hover:bg-white/10 transition-all cursor-pointer"
                style={{ borderColor: colorPrimario }}
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PedidoExitoso;


