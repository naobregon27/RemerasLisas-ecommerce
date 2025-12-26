import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const RegisterModal = ({ isOpen, onClose, onSuccess, onNeedsVerification }) => {
  const { tienda } = useSelector((state) => state.tienda);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (!tienda?._id) {
      setError('No se pudo identificar la tienda.');
      toast.error('No se pudo identificar la tienda.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = userData;
      const payload = {
        ...registerData,
        localId: tienda._id
      };
      const response = await authService.register(payload);
      
      // Verificar si requiere verificación de email
      if (response?.data?.requiresEmailVerification || response?.requiresEmailVerification) {
        toast.success('¡Registro exitoso! Te hemos enviado un código de verificación a tu email.');
        onClose(); // Cerrar el modal de registro
        // Notificar al padre para que abra el modal de verificación
        if (onNeedsVerification) {
          onNeedsVerification(userData.email);
        }
      } else {
        // Si no requiere verificación (retrocompatibilidad), proceder normalmente
        toast.success(`¡Te has registrado exitosamente en ${tienda.slug || 'la tienda'}!`);
        onSuccess(response);
        onClose();
      }
    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
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
            <h3 className="text-2xl font-bold text-white">Crear una cuenta</h3>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                required
                placeholder="Tu nombre y apellido"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                required
                placeholder="Repite tu contraseña"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Teléfono <span className="text-muted text-xs font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                placeholder="+54 9 11 1234-5678"
              />
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
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 