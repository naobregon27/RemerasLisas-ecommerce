import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { pedidoService } from '../services';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const PedidoPendiente = () => {
  const [searchParams] = useSearchParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();

  // Obtener configuración de la tienda
  const { tienda } = useSelector((state) => state.tienda);
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#335cff';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  const paymentType = searchParams.get('payment_type');

  useEffect(() => {
    const verificarPago = async () => {
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
          {/* Header con ícono de pendiente */}
          <div className="p-8 text-center bg-gradient-to-b from-[var(--color-navy-700)] to-[var(--color-navy-800)]">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-yellow-500/20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4 border-yellow-500">
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3">⏳ Pago Pendiente</h1>
            <p className="text-lg text-muted">Tu pago está siendo procesado</p>
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
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-400">
                    {pedido?.estadoPago || 'Pendiente'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted">Estado del pedido:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400">
                    {pedido?.estadoPedido || 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje informativo según el tipo de pago */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5 mb-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-semibold mb-2">¿Qué significa esto?</p>
                  
                  {paymentType === 'ticket' && (
                    <div className="text-muted text-sm space-y-2">
                      <p>Tu pago en efectivo está pendiente de acreditación.</p>
                      <p>Una vez que se acredite el pago, recibirás un email de confirmación y comenzaremos a procesar tu pedido.</p>
                    </div>
                  )}
                  
                  {paymentType === 'bank_transfer' && (
                    <div className="text-muted text-sm space-y-2">
                      <p>Tu transferencia está siendo procesada.</p>
                      <p>Esto puede tomar hasta 48 horas hábiles. Te notificaremos por email cuando se confirme el pago.</p>
                    </div>
                  )}

                  {paymentType === 'atm' && (
                    <div className="text-muted text-sm space-y-2">
                      <p>Tu pago en cajero automático está pendiente de confirmación.</p>
                      <p>Una vez que se acredite, recibirás un email de confirmación.</p>
                    </div>
                  )}

                  {!paymentType || (paymentType !== 'ticket' && paymentType !== 'bank_transfer' && paymentType !== 'atm') && (
                    <div className="text-muted text-sm space-y-2">
                      <p>Tu pago está siendo procesado por Mercado Pago.</p>
                      <p>Esto puede tomar algunos minutos. Te notificaremos por email cuando se confirme el pago.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-white font-semibold mb-1">Puedes cerrar esta ventana</p>
                  <p className="text-muted text-sm">
                    Te enviaremos un correo electrónico cuando se confirme tu pago. 
                    También puedes verificar el estado de tu pedido en la sección "Mis Pedidos".
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

export default PedidoPendiente;

