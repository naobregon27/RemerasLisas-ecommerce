import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const PedidoFallido = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tiendaSlug } = useParams();
  
  // Obtener configuración de la tienda
  const { tienda } = useSelector((state) => state.tienda);
  const colorPrimario = tienda?.configuracion?.colorPrimario || '#335cff';
  const colorTexto = tienda?.configuracion?.colorTexto || '#ffffff';

  const statusDetail = searchParams.get('status_detail');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Limpiar el pedidoId del localStorage ya que falló
    const pedidoId = localStorage.getItem('pedidoId');
    if (pedidoId) {
      // Guardar en sessionStorage por si el usuario quiere reintentar
      sessionStorage.setItem('ultimoPedidoFallido', pedidoId);
      localStorage.removeItem('pedidoId');
    }
  }, []);

  const handleReintentar = () => {
    // Redirigir al carrito para que el usuario pueda intentar de nuevo
    navigate(`/${tiendaSlug}/carrito`);
  };

  const getMensajeError = () => {
    switch (statusDetail) {
      case 'cc_rejected_insufficient_amount':
        return 'Tu tarjeta no tiene fondos suficientes.';
      case 'cc_rejected_bad_filled_security_code':
        return 'El código de seguridad de tu tarjeta es incorrecto.';
      case 'cc_rejected_bad_filled_date':
        return 'La fecha de vencimiento de tu tarjeta es incorrecta.';
      case 'cc_rejected_bad_filled_other':
        return 'Verifica los datos de tu tarjeta e intenta nuevamente.';
      case 'cc_rejected_call_for_authorize':
        return 'Debes autorizar este pago con tu banco.';
      case 'cc_rejected_card_disabled':
        return 'Tu tarjeta está deshabilitada. Contacta a tu banco.';
      case 'cc_rejected_duplicated_payment':
        return 'Ya realizaste un pago por este monto. Si necesitas volver a pagar, intenta en unos minutos.';
      case 'cc_rejected_high_risk':
        return 'Tu pago fue rechazado. Intenta con otro método de pago.';
      case 'cc_rejected_max_attempts':
        return 'Alcanzaste el límite de intentos permitidos. Intenta con otra tarjeta.';
      default:
        return 'No se pudo procesar tu pago. Por favor, intenta nuevamente.';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden">
          {/* Header con ícono de error */}
          <div className="p-8 text-center bg-gradient-to-b from-[var(--color-navy-700)] to-[var(--color-navy-800)]">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[var(--color-navy-800)] border-4 border-red-500">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-3">❌ Pago Rechazado</h1>
            <p className="text-lg text-muted">No se pudo procesar tu pago</p>
          </div>

          {/* Información del error */}
          <div className="p-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5 mb-6">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-white font-semibold mb-2">¿Qué pasó?</p>
                  <p className="text-muted text-sm mb-3">
                    {getMensajeError()}
                  </p>
                  {paymentId && (
                    <p className="text-muted text-xs">
                      ID de referencia: <span className="font-mono">{paymentId}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sugerencias */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Qué puedes hacer:
              </h3>
              <ul className="space-y-2 text-muted text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Verifica que los datos de tu tarjeta sean correctos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Asegúrate de tener fondos suficientes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Intenta con otro método de pago (efectivo, transferencia, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Contacta a tu banco si el problema persiste</span>
                </li>
              </ul>
            </div>

            {/* Información de contacto */}
            <div className="bg-[var(--color-navy-700)] rounded-lg p-5 mb-6 border border-subtle">
              <h3 className="text-white font-semibold mb-3">¿Necesitas ayuda?</h3>
              <p className="text-muted text-sm mb-3">
                Si el problema persiste o tienes alguna duda, no dudes en contactarnos:
              </p>
              <div className="flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: colorPrimario }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+5493777123456" className="text-white hover:underline font-medium" style={{ color: colorPrimario }}>
                  3777-123456
                </a>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReintentar}
                className="flex-1 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl cursor-pointer"
                style={{ backgroundColor: colorPrimario, color: colorTexto }}
              >
                Reintentar pago
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

export default PedidoFallido;

