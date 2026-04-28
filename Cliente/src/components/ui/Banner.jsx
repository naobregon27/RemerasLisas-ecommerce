import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

/* Convierte rutas relativas o data URLs a URL usable */
const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return `https://e-commerce-backend-flmk.onrender.com/${url.replace(/^\//, '')}`;
};

const Banner = () => {
  const { tiendaSlug } = useParams();
  const { tienda, configuracionPublica, loadingConfig } = useSelector((state) => state.tienda);

  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const config = configuracionPublica;
  const carouselImages = config?.carrusel?.length ? config.carrusel : [];

  const colorPrimario   = config?.colorPrimario   || '#3B80F8';
  const colorSecundario = config?.colorSecundario  || '#2563EB';
  const colorTexto      = config?.colorTexto       || '#FFFFFF';

  // Auto-avance del carrusel
  useEffect(() => {
    if (carouselImages.length <= 1) return;
    setCurrentSlide(0);
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselImages.length);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, [carouselImages.length]);

  // ── Skeleton ──
  if (loadingConfig) {
    return (
      <div
        className="py-16 md:py-24 animate-pulse"
        style={{ background: 'var(--color-nav)' }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-white/10 rounded-lg w-2/3" />
            <div className="h-5 bg-white/10 rounded w-full" />
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 bg-white/10 rounded-lg w-36" />
              <div className="h-11 bg-white/10 rounded-lg w-36" />
            </div>
          </div>
          <div className="flex-1 h-72 bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  const hasCarousel = carouselImages.length > 0;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colorPrimario}22 0%, var(--color-bg) 40%, var(--color-nav) 100%)`,
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${colorPrimario}18 0%, transparent 60%)`,
        }}
      />

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* ── Texto izquierda ── */}
          <div className="w-full md:w-1/2 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: `${colorPrimario}20`, color: colorPrimario, border: `1px solid ${colorPrimario}40` }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colorPrimario }} />
              Tienda oficial
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
              style={{ color: colorTexto, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              {config?.mensaje || tienda?.titulo || 'La mejor tienda'}
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {tienda?.subtitulo || 'Descubrí los mejores productos al mejor precio'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/${tiendaSlug}/productos`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
                  boxShadow: `0 4px 20px -6px ${colorPrimario}80`,
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                Ver Productos
              </Link>

              {tienda?.categoriaDestacada && (
                <Link
                  to={`/${tiendaSlug}/categoria/${tienda.categoriaDestacada._id}`}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95 border"
                  style={{ color: colorPrimario, borderColor: `${colorPrimario}50` }}
                >
                  {`Ver ${tienda.categoriaDestacada.nombre}`}
                </Link>
              )}
            </div>
          </div>

          {/* ── Carrusel derecha ── */}
          <div className="w-full md:w-1/2">
            {hasCarousel ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: `0 25px 60px -15px ${colorPrimario}40` }}>
                {/* Slides */}
                <div
                  ref={carouselRef}
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {carouselImages.map((slide, idx) => (
                    <div key={idx} className="relative min-w-full">
                      <img
                        src={resolveUrl(slide.url)}
                        alt={slide.alt || `Slide ${idx + 1}`}
                        className="w-full h-72 md:h-96 object-contain bg-white/5"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                      {slide.titulo && (
                        <div
                          className="absolute top-4 left-4 px-4 py-1.5 rounded-lg text-sm font-bold text-white shadow"
                          style={{ background: colorPrimario }}
                        >
                          {slide.titulo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Indicadores */}
                {carouselImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {carouselImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: idx === currentSlide ? 24 : 8,
                          height: 8,
                          background: idx === currentSlide ? colorPrimario : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Flechas */}
                {carouselImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide(p => (p === 0 ? carouselImages.length - 1 : p - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentSlide(p => (p === carouselImages.length - 1 ? 0 : p + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Placeholder si no hay imágenes cargadas aún */
              <div
                className="w-full h-72 md:h-96 rounded-2xl flex items-center justify-center"
                style={{ background: `${colorPrimario}10`, border: `1px dashed ${colorPrimario}30` }}
              >
                <div className="text-center" style={{ color: `${colorPrimario}60` }}>
                  <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm">Subí imágenes desde el panel admin</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Banner;
