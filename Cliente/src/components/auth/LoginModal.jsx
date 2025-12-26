import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginModal = ({ isOpen, onClose, onSuccess, onNeedsVerification }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(credentials);
      toast.success(`¡Bienvenido! Has iniciado sesión correctamente`);
      onSuccess(response);
      onClose();
    } catch (error) {
      const errorMsg = error.message || 'Error al iniciar sesión';
      
      // Verificar si el error es por email no verificado
      if (error.requiresEmailVerification) {
        setError('Debes verificar tu email antes de iniciar sesión');
        toast.warning('Por favor verifica tu email antes de iniciar sesión');
        onClose(); // Cerrar el modal de login
        // Notificar al padre para que abra el modal de verificación
        if (onNeedsVerification) {
          onNeedsVerification(credentials.email);
        }
      } else {
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    onClose(); // Cerrar el modal de login
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
            <h3 className="text-2xl font-bold text-white">Iniciar Sesión</h3>
            <button 
              onClick={onClose}
              className="text-muted hover:text-white focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 mb-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                placeholder="Tu contraseña"
              />
            </div>

            {/* Enlace de olvidé mi contraseña */}
            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-[var(--color-green-500)] hover:text-[var(--color-green-400)] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-subtle bg-[var(--color-navy-800)] text-white hover:bg-[var(--color-navy-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto btn-primary px-4 py-2 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de olvidé mi contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginModal; 