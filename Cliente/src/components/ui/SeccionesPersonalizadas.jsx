import React from 'react';
import { useSelector } from 'react-redux';

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return `https://e-commerce-backend-flmk.onrender.com/${url.replace(/^\//, '')}`;
};

const SeccionesPersonalizadas = () => {
  const { configuracionPublica, loadingConfig } = useSelector((state) => state.tienda);

  const colorPrimario   = configuracionPublica?.colorPrimario   || '#3B80F8';
  const colorSecundario = configuracionPublica?.colorSecundario || '#2563EB';

  const secciones = (configuracionPublica?.secciones || [])
    .filter(s => s && (s.titulo || s.contenido || s.imagen))
    .sort((a, b) => (a.orden || 0) - (b.orden || 0));

  if (loadingConfig) {
    return (
      <div className="container mx-auto px-4 py-4 space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="rounded-xl p-6 animate-pulse"
            style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)' }}>
            <div className="h-5 rounded w-1/3 mb-3" style={{ background: '#E2E8F0' }} />
            <div className="h-3 rounded w-full mb-2" style={{ background: '#EEF2F7' }} />
            <div className="h-3 rounded w-2/3" style={{ background: '#EEF2F7' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!secciones.length) return null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-5">
      {secciones.map((sec, idx) => {
        const imgUrl = resolveUrl(sec.imagen);
        const esPar = idx % 2 === 0;
        return (
          <div
            key={sec._id || idx}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'var(--bg-white)',
              border: `1px solid var(--border-light)`,
              borderLeft: `3px solid ${colorPrimario}`,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className={`flex flex-col ${esPar ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
              {imgUrl && (
                <div className="lg:w-2/5 w-full">
                  <img
                    src={imgUrl}
                    alt={sec.titulo || `Sección ${idx + 1}`}
                    className="w-full h-48 lg:h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                </div>
              )}
              <div className={`${imgUrl ? 'lg:w-3/5' : 'w-full'} p-5 lg:p-7 flex flex-col justify-center`}>
                {sec.titulo && (
                    <h3 className="text-lg lg:text-xl font-semibold mb-2" style={{ color: 'var(--text-on-light)' }}>
                      {sec.titulo}
                    </h3>
                  )}
                  {sec.contenido && (
                    <p className="text-sm lg:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted-on-light)' }}>
                      {sec.contenido}
                    </p>
                  )}
                  {sec.titulo && (
                    <div className="mt-4 h-1 w-10 rounded-full" style={{ background: colorPrimario }} />
                  )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeccionesPersonalizadas;
