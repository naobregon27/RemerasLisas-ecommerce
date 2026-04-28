import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { agregarAlCarrito, fetchCarrito } from '../../store/carritoSlice';
import { formatPrice } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

const ProductCard = ({ producto, onClick, compact = false }) => {
  const { tiendaSlug } = useParams();
  const dispatch = useDispatch();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!producto) return null;

  const {
    nombre = 'Producto sin nombre',
    precio = 0,
    precioAnterior = 0,
    descuento = 0,
    porcentajeDescuento = 0,
    enOferta = false,
    imagenes = [],
    stock = 0,
    descripcion = '',
  } = producto;

  // Calcular descuento y precio final
  let pct = 0;
  let precioFinal = precio;

  if (enOferta) {
    if (porcentajeDescuento > 0) {
      pct = porcentajeDescuento;
      precioFinal = precio * (1 - pct / 100);
    } else if (precioAnterior > precio && precioAnterior > 0) {
      pct = Math.round(((precioAnterior - precio) / precioAnterior) * 100);
    } else if (descuento > 0) {
      pct = descuento;
      precioFinal = precio * (1 - pct / 100);
    }
  } else if (precioAnterior > precio && precioAnterior > 0) {
    pct = Math.round(((precioAnterior - precio) / precioAnterior) * 100);
  }

  const tieneDescuento = pct > 0;
  const agotado = stock === 0;
  const pocasUnidades = stock > 0 && stock < 5;

  const imagen = imagenes?.length
    ? (typeof imagenes[0] === 'string' ? imagenes[0] : (imagenes[0]?.url || '/placeholder.png'))
    : '/placeholder.png';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart || agotado) return;

    if (!authService.isAuthenticated()) {
      toast.error('Iniciá sesión para agregar al carrito');
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(agregarAlCarrito({ producto, cantidad: 1 })).unwrap();
      dispatch(fetchCarrito());
      toast.success(`${nombre} agregado al carrito ✓`);
    } catch {
      toast.error('Error al agregar al carrito');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div
      className="product-card flex flex-col cursor-pointer select-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      {/* ── Imagen ── */}
      <div
        className="relative overflow-hidden rounded-t-2xl flex-shrink-0"
        style={{ aspectRatio: '1/1', background: '#F8FAFC' }}
      >
        <img
          src={imagen}
          alt={nombre}
          loading="lazy"
          className="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-108"
          style={{ transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)' }}
          onError={(e) => { e.target.src = '/placeholder.png'; }}
        />

        {/* Overlay agotado */}
        {agotado && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-bold tracking-widest uppercase text-gray-500">Agotado</span>
          </div>
        )}

        {/* Badges — solo uno a la vez para no acumular */}
        {!agotado && tieneDescuento && (
          <span className="badge-discount absolute top-2.5 left-2.5 shadow-sm">
            -{pct}%
          </span>
        )}
        {!agotado && enOferta && !tieneDescuento && (
          <span className="badge-offer absolute top-2.5 left-2.5 shadow-sm">Oferta</span>
        )}
        {!agotado && pocasUnidades && (
          <span
            className="absolute bottom-2.5 left-2.5 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow"
            style={{ background: 'var(--warning)' }}
          >
            ¡Últimas!
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-4 gap-1.5">
        <h3
          className={`font-semibold leading-snug line-clamp-2 ${compact ? 'text-sm' : 'text-sm md:text-base'}`}
          style={{ color: '#1E293B' }}
        >
          {nombre}
        </h3>

        {descripcion && !compact && (
          <p className="text-xs line-clamp-1" style={{ color: '#94A3B8' }}>
            {descripcion}
          </p>
        )}

        {/* Precios */}
        <div className="mt-auto pt-1">
          {tieneDescuento && (
            <p className="text-xs line-through" style={{ color: '#94A3B8' }}>
              {formatPrice(precioAnterior > 0 ? precioAnterior : precio)}
            </p>
          )}
          <p
            className={`font-extrabold ${compact ? 'text-base' : 'text-lg'}`}
            style={{ color: '#0F172A' }}
          >
            {formatPrice(precioFinal)}
          </p>
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          disabled={agotado || isAddingToCart}
          className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-95"
          style={{
            background: agotado
              ? '#E2E8F0'
              : 'var(--accent)',
            color: agotado ? '#94A3B8' : '#fff',
            cursor: agotado ? 'not-allowed' : 'pointer',
            boxShadow: agotado ? 'none' : '0 3px 12px rgba(59,128,248,0.35)',
          }}
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Agregando...
            </span>
          ) : agotado ? 'Agotado' : 'Ver producto'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
