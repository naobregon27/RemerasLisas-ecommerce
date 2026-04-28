import React, { useState, useRef, useEffect, memo } from 'react';
import { useSelector } from 'react-redux';

/* ─────────────────────────────────────────────────────────────────
   El video se usa directamente como base64 (data URL).
   Estrategia de carga rápida:
   - preload="auto"  → el navegador carga el video en cuanto puede
   - El <video> se monta una sola vez con key=id para que React
     no recree el elemento al cambiar otros estados
   - Lazy-render: solo montamos el player cuando el usuario está
     cerca de la sección (IntersectionObserver)
───────────────────────────────────────────────────────────────── */

/* ── Íconos ── */
const PlayIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/* ── VideoPlayer: memo para evitar re-renders que reseteen el video ── */
const VideoPlayer = memo(({ src, colorPrimario }) => {
  return (
    <video
      className="w-full h-full object-contain"
      controls
      playsInline
      preload="auto"
    >
      <source src={src} />
      Tu navegador no soporta video.
    </video>
  );
}, (prev, next) => prev.src === next.src); // solo re-renderiza si cambia el src

/* ══════════════════════════════════════════════════════════════════
   VideoSection Component
   ══════════════════════════════════════════════════════════════════ */
const VideoSection = () => {
  const { configuracionPublica, loadingConfig } = useSelector((state) => state.tienda);
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const videos = (configuracionPublica?.videos || []).filter(v => v.activo !== false);
  const videoActivo = videos[activeIdx] || null;
  const colorPrimario = configuracionPublica?.colorPrimario || '#3B80F8';

  // Montar el player solo cuando la sección entra en el viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { rootMargin: '200px' } // empieza a cargar 200px antes de que sea visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Skeleton mientras carga Redux ── */
  if (loadingConfig) {
    return (
      <section className="py-12" style={{ background: 'var(--dark)' }}>
        <div className="container mx-auto px-4">
          <div className="h-5 w-32 rounded mb-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="w-full aspect-video rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </section>
    );
  }

  if (!videos.length) return null;

  return (
    <section ref={sectionRef} className="py-14" style={{ background: 'var(--dark)' }}>
      <div className="container mx-auto px-4">

        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: colorPrimario, boxShadow: `0 4px 16px ${colorPrimario}55` }}
          >
            <PlayIcon />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Videos</h2>
          <div className="flex-1 h-px hidden md:block" style={{ background: 'var(--border)' }} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Reproductor principal ── */}
          <div className="flex-1 min-w-0">
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: '16/9', boxShadow: `0 20px 60px -20px ${colorPrimario}40` }}
            >
              {/* Placeholder hasta que esté visible */}
              {!visible && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: `${colorPrimario}30`, border: `2px solid ${colorPrimario}60` }}
                  >
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {/* Video real - solo se monta cuando es visible */}
              {visible && videoActivo?.url && (
                <VideoPlayer
                  key={videoActivo._id || videoActivo.url?.slice(0, 30)}
                  src={videoActivo.url}
                  colorPrimario={colorPrimario}
                />
              )}

              {/* Gradient decorativo */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Info */}
            {(videoActivo?.titulo || videoActivo?.descripcion) && (
              <div className="mt-4 px-1">
                {videoActivo.titulo && (
                  <h3 className="text-base font-semibold text-white">{videoActivo.titulo}</h3>
                )}
                {videoActivo.descripcion && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {videoActivo.descripcion}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Lista lateral (cuando hay más de 1 video) ── */}
          {videos.length > 1 && (
            <div className="lg:w-72 flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
              {videos.map((v, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={v._id || idx}
                    onClick={() => setActiveIdx(idx)}
                    className="flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 border"
                    style={{
                      background: isActive ? `${colorPrimario}15` : 'rgba(255,255,255,0.04)',
                      borderColor: isActive ? colorPrimario : 'rgba(255,255,255,0.07)',
                    }}
                  >
                    <div
                      className="w-14 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: isActive ? colorPrimario : 'rgba(255,255,255,0.08)' }}
                    >
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                        {v.titulo || `Video ${idx + 1}`}
                      </p>
                      {v.descripcion && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {v.descripcion}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
