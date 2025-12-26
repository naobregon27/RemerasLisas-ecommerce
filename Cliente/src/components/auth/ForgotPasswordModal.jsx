import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import ResetPasswordModal from './ResetPasswordModal';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      toast.success('Si el email existe, recibirás un código de recuperación');
      setEmailForReset(email);
      setShowResetModal(true);
      onClose(); // Cerrar este modal
    } catch (error) {
      const errorMsg = error.message || 'Error al solicitar código de recuperación';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8" style={{ alignItems: 'center' }}>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Modal centrado */}
      <div className="relative glass-panel rounded-xl shadow-2xl w-full max-w-md z-10 max-h-[85vh] overflow-y-auto my-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Recuperar Contraseña</h3>
            <button 
              onClick={handleClose}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-muted text-sm">
              Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 mb-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
                disabled={loading}
              />
              <p className="text-xs text-muted mt-2">
                Te enviaremos un código de verificación a este correo
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-subtle bg-[var(--color-navy-800)] text-white hover:bg-[var(--color-navy-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto btn-primary px-4 py-2 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de restablecer contraseña */}
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        email={emailForReset}
      />
    </div>
  );
};

export default ForgotPasswordModal;

