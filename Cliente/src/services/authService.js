import api from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);
      // El registro ya no devuelve token directamente, requiere verificación de email
      // Solo guardamos el token si viene (retrocompatibilidad)
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        this._notifyAuthChange();
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async verifyEmail(data) {
    try {
      const response = await api.post('/api/auth/verify-email', data);
      // Después de verificar el email, guardamos el token y usuario
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        this._notifyAuthChange();
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async resendVerificationCode(email) {
    try {
      const response = await api.post('/api/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials);
      // Solo guardamos si el login fue exitoso y tenemos token
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        this._notifyAuthChange();
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async resetPassword(data) {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      // Después de resetear la contraseña, guardamos el token
      if (response.data?.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        this._notifyAuthChange();
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._notifyAuthChange();
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      localStorage.removeItem('user');
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  // Método privado para notificar cambios en autenticación
  _notifyAuthChange() {
    window.dispatchEvent(new Event('auth-change'));
  }
}; 