import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CategoryModal from '../../pages/CategoryModal';

// ── Redes sociales por defecto de la tienda ──────────────────────────────────
// Si el admin configuró los links en piePagina, se usan esos.
// Si no, se usan estos valores por defecto.
const RRSS_DEFAULT = {
  facebook:  'https://www.facebook.com/MayoristaOnli',
  instagram: 'https://instagram.com/misterelee',
  whatsapp:  '5491123535218',   // sin + y sin espacios para wa.me
};
const WA_MENSAJE = 'Hola! Quería consultar sobre sus productos.';

// ── Íconos SVG ───────────────────────────────────────────────────────────────
const IconFB = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
  </svg>
);
const IconIG = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const IconWA = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Componente ───────────────────────────────────────────────────────────────
const Footer = () => {
  const { tiendaSlug } = useParams();
  const { tienda, categorias } = useSelector((state) => state.tienda);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (cat, e) => {
    e.preventDefault();
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const year = new Date().getFullYear();

  // ── Resolver links de redes sociales ────────────────────────────────────
  // Prioridad: piePagina del backend → defaults hardcodeados
  const pie = tienda?.piePagina || tienda?.configuracion?.piePagina || {};
  const rs  = pie?.redesSociales || pie || {};

  const fbUrl  = rs?.facebook  || RRSS_DEFAULT.facebook;
  const igUrl  = rs?.instagram || RRSS_DEFAULT.instagram;
  const waNum  = (rs?.whatsapp || tienda?.telefono || RRSS_DEFAULT.whatsapp)
                   .replace(/[^0-9]/g, '');
  const waLink = `https://wa.me/${waNum}?text=${encodeURIComponent(WA_MENSAJE)}`;

  return (
    <>
      <footer
        className="border-t text-white"
        style={{ background: 'var(--color-nav)', borderColor: 'var(--color-border)' }}
      >
        {/* ── Cuerpo ── */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {/* Columna 1 — Marca + RRSS */}
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{tienda?.nombre || 'Tienda Online'}</h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {tienda?.descripcion || 'Tu tienda online de confianza'}
                </p>
              </div>

              {/* Íconos de redes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Seguinos
                </p>
                <div className="flex items-center gap-3">
                  {/* Facebook */}
                  <a
                    href={fbUrl.startsWith('http') ? fbUrl : `https://facebook.com/${fbUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook — Mayorista Onli"
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    style={{ background: '#1877F2', boxShadow: '0 2px 10px rgba(24,119,242,0.35)' }}
                  >
                    <IconFB />
                  </a>

                  {/* Instagram */}
                  <a
                    href={igUrl.startsWith('http') ? igUrl : `https://instagram.com/${igUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Instagram — @misterelee"
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    style={{
                      background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                      boxShadow: '0 2px 10px rgba(214,36,159,0.35)',
                    }}
                  >
                    <IconIG />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    style={{ background: '#25D366', boxShadow: '0 2px 10px rgba(37,211,102,0.35)' }}
                  >
                    <IconWA />
                  </a>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.4)' }}
              >
                <IconWA />
                Escribinos por WhatsApp
              </a>
            </div>

            {/* Columna 2 — Categorías */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Categorías
              </h2>
              <ul className="space-y-2.5">
                {categorias?.length ? (
                  categorias.slice(0, 7).map((cat) => (
                    <li key={cat._id}>
                      <a
                        href="#"
                        onClick={(e) => handleCategoryClick(cat, e)}
                        className="text-sm flex items-center gap-2.5 group transition-colors duration-200 hover:text-white"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-150"
                          style={{ background: 'var(--color-accent)' }}
                        />
                        {cat.nombre}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin categorías</li>
                )}
              </ul>
            </div>

            {/* Columna 3 — Navegación */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Navegación
              </h2>
              <ul className="space-y-2.5">
                {[
                  { to: `/${tiendaSlug}`,            label: 'Inicio' },
                  { to: `/${tiendaSlug}/productos`,  label: 'Productos' },
                  { to: `/${tiendaSlug}/carrito`,    label: 'Mi carrito' },
                  { to: `/${tiendaSlug}/mis-pedidos`,label: 'Mis pedidos' },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm flex items-center gap-2.5 group transition-colors duration-200 hover:text-white"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-150"
                        style={{ background: 'var(--color-accent)' }}
                      />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Barra inferior ── */}
        <div className="border-t py-5 px-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              &copy; {year}{' '}
              <span className="text-white font-medium">{tienda?.nombre || 'Tienda Online'}</span>.
              {' '}Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-5">
              <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <svg className="w-4 h-4" style={{ color: '#22C55E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Compra segura
              </span>
              <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--color-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                Envíos a todo el país
              </span>
            </div>
          </div>
        </div>
      </footer>

      {selectedCategory && (
        <CategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoriaId={selectedCategory._id}
          categoriaNombre={selectedCategory.nombre}
        />
      )}
    </>
  );
};

export default Footer;
