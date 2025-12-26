import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const VerifyEmailModal = ({ isOpen, onClose, onSuccess, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef([]);

  // Efecto para el countdown del reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset al abrir/cerrar modal
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError('');
      setLoading(false);
      // Focus en el primer input
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Mover al siguiente input si hay un valor
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Mover al input anterior con Backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    // Mover al siguiente con flecha derecha
    if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    // Mover al anterior con flecha izquierda
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Verificar que sean 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      // Focus en el último input
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      toast.error('Por favor ingresa el código completo');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyEmail({
        email,
        code: verificationCode
      });
      toast.success('¡Email verificado exitosamente! Ya puedes iniciar sesión.');
      onSuccess(response);
      onClose();
    } catch (error) {
      const errorMsg = error.message || 'Código de verificación incorrecto';
      setError(errorMsg);
      toast.error(errorMsg);
      // Limpiar el código para intentar de nuevo
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError('');

    try {
      await authService.resendVerificationCode(email);
      toast.success('Se ha enviado un nuevo código a tu email');
      setCountdown(60); // 60 segundos de espera
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch (error) {
      toast.error(error.message || 'Error al reenviar el código');
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ alignItems: 'center' }}>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal centrado */}
      <div className="relative glass-panel rounded-xl shadow-2xl w-full max-w-md z-10 max-h-[85vh] overflow-y-auto my-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Verificar Email</h3>
            <button 
              onClick={onClose}
              className="text-muted hover:text-white focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Icono y mensaje */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-green-500)]/20 mb-4">
              <svg className="w-8 h-8 text-[var(--color-green-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white text-sm mb-2">
              Hemos enviado un código de 6 dígitos a:
            </p>
            <p className="text-[var(--color-green-500)] font-semibold mb-4">
              {email}
            </p>
            <p className="text-muted text-xs">
              Por favor ingresa el código para verificar tu cuenta
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 mb-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Input de código de 6 dígitos */}
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="w-12 h-14 text-center text-2xl font-bold bg-[var(--color-navy-800)] border-2 border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white transition-all"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Botón reenviar código */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || resending}
                  className="text-sm text-[var(--color-green-500)] hover:text-[var(--color-green-400)] disabled:text-muted disabled:cursor-not-allowed transition-colors"
                >
                  {resending ? (
                    'Reenviando...'
                  ) : countdown > 0 ? (
                    `Reenviar código en ${countdown}s`
                  ) : (
                    '¿No recibiste el código? Reenviar'
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-subtle bg-[var(--color-navy-800)] text-white hover:bg-[var(--color-navy-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || code.some(digit => !digit)}
                className="w-full sm:w-auto btn-primary px-4 py-2 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailModal;

