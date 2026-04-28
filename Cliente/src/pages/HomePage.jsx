import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Banner from '../components/ui/Banner';
import BannerGallery from '../components/ui/BannerGallery';
import SeccionesPersonalizadas from '../components/ui/SeccionesPersonalizadas';
import VideoSection from '../components/ui/VideoSection';
import ProductList from '../components/product/ProductList';
import ProductCarousel from '../components/product/ProductCarousel';
import Loader from '../components/ui/Loader';
import { fetchDestacados, fetchProductosEnOferta } from '../store/tiendaSlice';
import CategoryModal from './CategoryModal';
import ProductViewModal from '../components/modals/ProductViewModal';
import { productoService } from '../services/productoService';
import { tiendaService } from '../services/tiendaService';
import { agregarAlCarrito } from '../store/carritoSlice';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

/* ── Banda de confianza ─────────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    title: 'Compra segura', sub: 'Tus datos siempre protegidos', color: 'var(--success)',
  },
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
    title: 'Envíos a todo el país', sub: 'Rápido y confiable', color: 'var(--accent)',
  },
  {
    icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
    title: 'Soporte 24/7', sub: 'Estamos para ayudarte', color: '#A855F7',
  },
];

/* ── Cabecera de sección CLARA ────────────────────────────────────── */
const SectionHeaderLight = ({ title, subtitle, accent = 'var(--accent)' }) => (
  <div className="mb-8">
    <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text-on-light)' }}>
      {title}
    </h2>
    {subtitle && <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted-on-light)' }}>{subtitle}</p>}
    <div className="mt-3 h-1 w-10 rounded-full" style={{ background: accent }} />
  </div>
);

/* ── Cabecera de sección OSCURA ───────────────────────────────────── */
const SectionHeaderDark = ({ title, subtitle, accent = 'var(--accent)' }) => (
  <div className="mb-8">
    <h2 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h2>
    {subtitle && <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    <div className="mt-3 h-1 w-10 rounded-full" style={{ background: accent }} />
  </div>
);

/* ── HomePage ─────────────────────────────────────────────────────── */
const HomePage = () => {
  const { tiendaSlug } = useParams();
  const dispatch = useDispatch();
  const {
    tienda,
    destacados,
    productosEnOferta,
    configuracionPublica,
    loading,
    loadingOfertas,
    error,
  } = useSelector((state) => state.tienda);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(false);

  const colorPrimario = configuracionPublica?.colorPrimario || 'var(--accent)';

  useEffect(() => {
    if (!tiendaSlug) return;
    setTodosLosProductos([]);
    dispatch(fetchDestacados(tiendaSlug));
    dispatch(fetchProductosEnOferta(tiendaSlug));
    setLoadingTodos(true);
    tiendaService.obtenerTodosLosProductos(tiendaSlug, { page: 1, limit: 80 })
      .then(d => setTodosLosProductos(d.productos || []))
      .catch(() => {})
      .finally(() => setLoadingTodos(false));
  }, [dispatch, tiendaSlug]);

  const handleCategoryClick = (cat, e) => {
    e.preventDefault();
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const handleProductClick = async (p) => {
    setSelectedProduct(p);
    setProductModalOpen(true);
    setLoadingProduct(true);
    try {
      const d = await productoService.obtenerProducto(tiendaSlug, p.slug);
      setSelectedProduct(d);
    } catch { /* mantener datos básicos */ }
    finally { setLoadingProduct(false); }
  };

  if (loading && !tienda) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="light-panel px-10 py-8 rounded-2xl text-center">
            <Loader size="large" />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted-on-light)' }}>Cargando tienda...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !loading && !tienda) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="light-panel px-8 py-6 rounded-2xl text-center max-w-sm">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--danger)' }}>Error al cargar</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted-on-light)' }}>{error.message || 'Hubo un problema. Intentá de nuevo.'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      {/* ═══ 1. HERO (OSCURO) ════════════════════════════════════════ */}
      <Banner />

      {/* ═══ 2. BANDA DE CONFIANZA (CLARA) ══════════════════════════ */}
      <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {TRUST_ITEMS.map(({ icon, title, sub, color }) => (
              <div key={title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-on-light)' }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted-on-light)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 3. GALERÍA DE BANNERS (CLARA) ══════════════════════════ */}
      <div style={{ background: 'var(--bg)' }}>
        <BannerGallery />
      </div>

      {/* ═══ 4. SECCIONES PERSONALIZADAS (CLARA) ════════════════════ */}
      <div style={{ background: 'var(--bg)' }}>
        <SeccionesPersonalizadas />
      </div>

      {/* ═══ 5. CARRUSEL TODOS LOS PRODUCTOS (CLARA) ════════════════ */}
      {(todosLosProductos.length > 0 || loadingTodos) && (
        <div className="py-8" style={{ background: 'var(--bg-soft)' }}>
          <div className="container mx-auto px-4">
            <ProductCarousel
              productos={todosLosProductos}
              loading={loadingTodos}
              onProductClick={handleProductClick}
              colorPrimario={colorPrimario}
            />
          </div>
        </div>
      )}

      {/* ═══ 6. VIDEOS (OSCURO) ══════════════════════════════════════ */}
      <VideoSection />

      {/* ═══ 7. PRODUCTOS DESTACADOS (CLARA) ════════════════════════ */}
      <section className="py-14" style={{ background: 'var(--bg-white)' }}>
        <div className="container mx-auto px-4">
          <SectionHeaderLight
            title="Productos Destacados"
            subtitle="Encontrá calidad y las mejores ofertas en un solo lugar."
          />
          <ProductList
            productos={destacados}
            loading={loading}
            title=""
            onProductClick={handleProductClick}
            compact={false}
            darkMode={false}
          />
        </div>
      </section>

      {/* ═══ 8. OFERTAS ESPECIALES (OSCURO / AZUL) ══════════════════ */}
      {productosEnOferta?.length > 0 && (
        <section
          className="py-14 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0b2d3a 50%, #0F172A 100%)' }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.06] -mr-24 -mt-24"
            style={{ background: 'var(--success)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.06] -ml-16 -mb-16"
            style={{ background: 'var(--accent)' }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex items-center gap-4 mb-8 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white tracking-wider uppercase"
                    style={{ background: 'var(--success)', boxShadow: '0 2px 12px rgba(34,197,94,0.4)' }}
                  >
                    🔥 Oferta
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Ofertas Especiales</h2>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aprovechá antes que se agoten</p>
                <div className="mt-3 h-1 w-10 rounded-full" style={{ background: 'var(--success)' }} />
              </div>
            </div>

            <ProductList
              productos={productosEnOferta}
              loading={loadingOfertas}
              title=""
              onProductClick={handleProductClick}
              compact={false}
              showDiscount
              darkMode
            />
          </div>
        </section>
      )}

      {/* ═══ 9. CATEGORÍAS POPULARES (CLARA) ════════════════════════ */}
      {tienda?.categoriasPopulares?.length > 0 && (
        <section className="py-14" style={{ background: 'var(--bg-soft)' }}>
          <div className="container mx-auto px-4">
            <SectionHeaderLight title="Categorías Populares" subtitle="Explorá lo que tenemos para vos" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tienda.categoriasPopulares.map((cat) => (
                <button
                  key={cat._id}
                  onClick={(e) => handleCategoryClick(cat, e)}
                  className="p-5 rounded-2xl text-center transition-all duration-200 hover:scale-105 border"
                  style={{
                    background: 'var(--bg-white)',
                    borderColor: 'var(--border-light)',
                    borderTop: `3px solid var(--accent)`,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-on-light)' }}>{cat.nombre}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted-on-light)' }}>
                    {cat.descripcion || 'Ver productos'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 10. SOBRE NOSOTROS (OSCURO) ════════════════════════════ */}
      {tienda?.descripcionExtendida && (
        <section className="py-14" style={{ background: 'var(--dark-2)' }}>
          <div className="container mx-auto px-4 max-w-2xl">
            <SectionHeaderDark title="Sobre Nosotros" />
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {tienda.descripcionExtendida}
            </p>
          </div>
        </section>
      )}

      {/* ── Modales ── */}
      {selectedCategory && (
        <CategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoriaId={selectedCategory._id}
          categoriaNombre={selectedCategory.nombre}
        />
      )}
      <ProductViewModal
        isOpen={productModalOpen}
        onClose={() => { setProductModalOpen(false); setSelectedProduct(null); }}
        producto={selectedProduct}
        loading={loadingProduct}
      />
    </Layout>
  );
};

export default HomePage;
