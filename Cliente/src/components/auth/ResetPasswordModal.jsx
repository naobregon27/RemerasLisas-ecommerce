import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

const ResetPasswordModal = ({ isOpen, onClose, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputsRef = useRef([]);

  // Reset al abrir/cerrar modal
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setPasswords({ password: '', confirmPassword: '' });
      setError('');
      setLoading(false);
      setShowPassword(false);
      // Focus en el primer input
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleCodeChange = (index, value) => {
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

    const resetCode = code.join('');
    
    if (resetCode.length !== 6) {
      setError('Por favor ingresa el código completo de 6 dígitos');
      toast.error('Por favor ingresa el código completo');
      return;
    }

    if (passwords.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        code: resetCode,
        password: passwords.password
      });
      toast.success('¡Contraseña restablecida exitosamente! Ahora puedes iniciar sesión.');
      onClose();
      // Aquí podrías redirigir al usuario o actualizar el estado de autenticación
    } catch (error) {
      const errorMsg = error.message || 'Error al restablecer la contraseña';
      setError(errorMsg);
      toast.error(errorMsg);
      // Limpiar el código para intentar de nuevo
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    setPasswords({ password: '', confirmPassword: '' });
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
            <h3 className="text-2xl font-bold text-white">Restablecer Contraseña</h3>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white text-sm mb-2">
              Hemos enviado un código de recuperación a:
            </p>
            <p className="text-[var(--color-green-500)] font-semibold mb-4">
              {email}
            </p>
            <p className="text-muted text-xs">
              Ingresa el código y tu nueva contraseña
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 mb-4 rounded">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input de código de 6 dígitos */}
            <div>
              <label className="block text-white text-sm font-bold mb-3">
                Código de Recuperación
              </label>
              <div className="flex justify-center gap-2 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    className="w-10 h-12 text-center text-xl font-bold bg-[var(--color-navy-800)] border-2 border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] focus:border-[var(--color-green-500)] text-white transition-all"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Nueva contraseña */}
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted pr-10"
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  required
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-white text-sm font-bold mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 bg-[var(--color-navy-800)] border border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] text-white placeholder-muted"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
                placeholder="Repite tu nueva contraseña"
                disabled={loading}
              />
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
                disabled={loading || code.some(digit => !digit)}
                className="w-full sm:w-auto btn-primary px-4 py-2 rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-500)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;

