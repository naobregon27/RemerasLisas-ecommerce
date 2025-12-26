/**
 * Funciones de utilidad para formatear datos en la aplicación
 */

/**
 * Función para formatear precios en formato de moneda colombiana
 * @param {number} precio - El precio a formatear
 * @param {string} moneda - El símbolo de la moneda ($ por defecto)
 * @returns {string} El precio formateado
 */
export const formatearPrecio = (precio, moneda = '$') => {
  // Convertir a número en caso de que se pase un string o valor null/undefined
  const valor = Number(precio) || 0;
  
  // Usar el API de Intl para formateo según locale
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
};

/**
 * Función para formatear fechas
 * @param {string|Date} fecha - La fecha a formatear
 * @returns {string} La fecha formateada
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  
  const fechaObj = new Date(fecha);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(fechaObj);
};

/**
 * Trunca un texto a una longitud máxima y añade puntos suspensivos
 * @param {string} texto - El texto a truncar
 * @param {number} longitudMaxima - Longitud máxima del texto
 * @returns {string} Texto truncado
 */
export const truncarTexto = (texto, longitudMaxima = 100) => {
  if (!texto || texto.length <= longitudMaxima) return texto || '';
  return texto.slice(0, longitudMaxima) + '...';
};

/**
 * Formatea un número a formato de moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (por defecto COP)
 * @returns {string} - Cantidad formateada como moneda
 */
export const formatPrice = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatea una fecha a formato localizado
 * @param {string|Date} date - Fecha a formatear
 * @param {object} options - Opciones de formato
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const dateToFormat = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateToFormat.getTime())) {
    return 'Fecha inválida';
  }
  
  return dateToFormat.toLocaleDateString('es-CO', { ...defaultOptions, ...options });
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatea un número a formato con separador de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-CO').format(number);
};

/**
 * Capitaliza la primera letra de cada palabra en un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto con la primera letra de cada palabra en mayúscula
 */
export const capitalizeText = (text) => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 