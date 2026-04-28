import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const resolveUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return `https://e-commerce-backend-flmk.onrender.com/${url.replace(/^\//, '')}`;
};

const BannerGallery = () => {
  const { configuracionPublica, loadingConfig } = useSelector((state) => state.tienda);
  const [modalImg, setModalImg] = useState(null);

  const imagenes = configuracionPublica?.bannerPrincipal?.slice(0, 5) || [];
  const colorBorde = configuracionPublica?.colorPrimario || '#3B80F8';

  if (loadingConfig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/5 rounded-xl overflow-hidden aspect-video animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!imagenes.length) return null;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagenes.map((img, idx) => (
            <button
              key={img._id || idx}
              onClick={() => setModalImg(img)}
              className="group rounded-xl overflow-hidden relative aspect-video cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
              style={{ border: `2px solid ${colorBorde}30`, boxShadow: `0 4px 20px -8px ${colorBorde}20` }}
            >
              <img
                src={resolveUrl(img.url)}
                alt={img.alt || `Banner ${idx + 1}`}
                className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-110"
                onError={(e) => { e.target.src = '/placeholder.png'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <span className="text-white text-xs font-medium">{img.alt || `Ver imagen`}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal lightbox */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setModalImg(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={resolveUrl(modalImg.url)}
              alt={modalImg.alt}
              className="w-full object-contain max-h-[80vh]"
            />
            <button
              onClick={() => setModalImg(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BannerGallery;
