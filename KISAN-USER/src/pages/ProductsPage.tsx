import { useEffect, useState, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  Filter,
  ShoppingCart,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Leaf,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal as Sliders,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface ProductsPageProps {
  onNavigate: (page: string) => void;
  onBuyProduct: (product: Product, quantity: number) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

type SortOption = 'newest' | 'name' | 'price-low' | 'price-high' | 'rating';
type ViewMode = 'grid' | 'list';

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  /* ── Base ── */
  .pp-root { font-family: 'DM Sans', system-ui, sans-serif; min-height: 100vh; background: #f9fafb; }

  /* ── Page hero ── */
  .pp-hero {
    background: linear-gradient(135deg, #14532d 0%, #166534 55%, #1a4731 100%);
    padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem clamp(2rem, 5vw, 3.5rem);
    text-align: center; position: relative; overflow: hidden;
  }
  .pp-hero::before {
    content: ''; position: absolute; inset: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(255,255,255,.04) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255,255,255,.04) 0%, transparent 40%);
  }
  .pp-hero-badge {
    display: inline-flex; align-items: center; gap: .4rem;
    background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
    color: #bbf7d0; font-size: .78rem; font-weight: 700;
    letter-spacing: .06em; text-transform: uppercase;
    padding: .38rem 1rem; border-radius: 9999px; margin-bottom: 1.1rem;
    backdrop-filter: blur(6px);
  }
  .pp-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 6vw, 3.5rem);
    color: #fff; line-height: 1.1; margin-bottom: .85rem;
    position: relative; z-index: 1;
  }
  .pp-hero-sub { color: #86efac; font-size: clamp(.9rem, 2vw, 1.1rem); max-width: 520px; margin: 0 auto; line-height: 1.65; position: relative; z-index: 1; }

  /* ── Stats ribbon ── */
  .pp-stats {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 1rem; padding: 1.25rem;
    max-width: 1260px; margin: 0 auto;
  }
  @media (min-width: 640px) { .pp-stats { grid-template-columns: repeat(4, 1fr); } }
  .pp-stat-card {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 16px;
    padding: 1.1rem 1rem; display: flex; align-items: center; gap: .85rem;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
    transition: box-shadow .2s, transform .2s;
  }
  .pp-stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.09); transform: translateY(-2px); }
  .pp-stat-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pp-stat-num { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 900; color: #111827; line-height: 1; }
  .pp-stat-label { font-size: .78rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; margin-top: .15rem; }

  /* ── Main layout ── */
  .pp-body { max-width: 1260px; margin: 0 auto; padding: 1.25rem; display: flex; gap: 1.5rem; align-items: flex-start; }
  @media (max-width: 1023px) { .pp-body { flex-direction: column; } }

  /* ── Sidebar filters ── */
  .pp-sidebar {
    width: 260px; flex-shrink: 0;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 18px;
    padding: 1.5rem; position: sticky; top: 80px;
    box-shadow: 0 2px 12px rgba(0,0,0,.05);
  }
  @media (max-width: 1023px) { .pp-sidebar { width: 100%; position: static; } }
  .pp-sidebar-title {
    display: flex; align-items: center; gap: .5rem;
    font-weight: 700; font-size: .95rem; color: #111827;
    margin-bottom: 1.25rem; padding-bottom: .75rem;
    border-bottom: 1px solid #f3f4f6;
  }
  .pp-filter-section { margin-bottom: 1.5rem; }
  .pp-filter-label { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; margin-bottom: .65rem; }
  .pp-cat-btn {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: .55rem .75rem; border-radius: 10px;
    font-size: .875rem; font-weight: 500; color: #4b5563;
    background: none; border: none; cursor: pointer; font-family: inherit;
    transition: background .15s, color .15s; margin-bottom: .25rem; text-align: left;
  }
  .pp-cat-btn:hover { background: #f0fdf4; color: #16a34a; }
  .pp-cat-btn.active { background: #16a34a; color: #fff; font-weight: 700; }
  .pp-cat-btn.active .pp-cat-count { background: rgba(255,255,255,.25); color: #fff; }
  .pp-cat-count {
    background: #f3f4f6; color: #6b7280;
    font-size: .7rem; font-weight: 700;
    padding: .15rem .5rem; border-radius: 9999px; flex-shrink: 0;
  }

  /* Price range */
  .pp-price-display {
    display: flex; justify-content: space-between;
    font-size: .82rem; font-weight: 600; color: #16a34a; margin-bottom: .6rem;
  }
  .pp-range {
    width: 100%; height: 4px; border-radius: 4px;
    background: #dcfce7; accent-color: #16a34a; cursor: pointer;
  }
  .pp-range::-webkit-slider-thumb { width: 18px; height: 18px; border-radius: 50%; background: #16a34a; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(22,163,74,.4); }

  /* ── Mobile filter drawer trigger ── */
  .pp-mobile-filter-bar {
    display: none;
    align-items: center; justify-content: space-between;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
    padding: .75rem 1rem; margin-bottom: 1rem;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
  }
  @media (max-width: 1023px) { .pp-mobile-filter-bar { display: flex; } }
  .pp-filter-trigger {
    display: flex; align-items: center; gap: .5rem;
    font-weight: 600; font-size: .9rem; color: #374151;
    background: none; border: none; cursor: pointer; font-family: inherit;
  }
  .pp-filter-badge { background: #16a34a; color: #fff; font-size: .65rem; font-weight: 700; padding: .15rem .4rem; border-radius: 9999px; }

  /* Mobile filter drawer */
  .pp-filter-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 5000; backdrop-filter: blur(2px); animation: pp-overlay-in .18s ease; }
  @keyframes pp-overlay-in { from { opacity:0; } to { opacity:1; } }
  .pp-filter-sheet {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #fff; border-radius: 24px 24px 0 0; z-index: 5001;
    padding: 1.5rem 1.25rem 2rem; max-height: 85vh; overflow-y: auto;
    animation: pp-sheet-in .28s cubic-bezier(.22,.68,0,1.1);
  }
  @keyframes pp-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
  .pp-sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: #e5e7eb; margin: 0 auto 1.25rem; }

  /* ── Main content area ── */
  .pp-content { flex: 1; min-width: 0; }

  /* ── Toolbar ── */
  .pp-toolbar {
    display: flex; align-items: center; gap: .75rem;
    background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
    padding: .75rem 1rem; margin-bottom: 1rem;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
    flex-wrap: wrap;
  }
  .pp-search-wrap { flex: 1; min-width: 160px; position: relative; }
  .pp-search-wrap input {
    width: 100%; padding: .55rem .85rem .55rem 2.25rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: .875rem; font-family: inherit; background: #f9fafb;
    outline: none; color: #111827; transition: border-color .2s, box-shadow .2s;
    box-sizing: border-box;
  }
  .pp-search-wrap input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.1); background: #fff; }
  .pp-search-icon { position: absolute; left: .65rem; top: 50%; transform: translateY(-50%); color: #9ca3af; width: 15px; height: 15px; pointer-events: none; }
  .pp-search-clear {
    position: absolute; right: .65rem; top: 50%; transform: translateY(-50%);
    background: #e5e7eb; border: none; border-radius: 50%; width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280;
    transition: background .15s;
  }
  .pp-search-clear:hover { background: #d1d5db; }

  .pp-sort-select {
    padding: .55rem .85rem; border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: .875rem; font-family: inherit; background: #f9fafb; color: #374151;
    outline: none; cursor: pointer; transition: border-color .2s;
    flex-shrink: 0;
  }
  .pp-sort-select:focus { border-color: #16a34a; }

  .pp-view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; flex-shrink: 0; }
  .pp-view-btn {
    width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #9ca3af; background: transparent; transition: background .15s, color .15s;
  }
  .pp-view-btn.active { background: #fff; color: #16a34a; box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  /* ── Results info bar ── */
  .pp-results-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: .85rem; flex-wrap: wrap; gap: .5rem;
  }
  .pp-results-text { font-size: .875rem; color: #6b7280; }
  .pp-results-text strong { color: #111827; font-weight: 700; }
  .pp-fresh-tag { display: flex; align-items: center; gap: .35rem; font-size: .78rem; color: #16a34a; font-weight: 600; }

  /* ── Active filters chips ── */
  .pp-active-filters { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .85rem; }
  .pp-filter-chip {
    display: inline-flex; align-items: center; gap: .4rem;
    background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;
    font-size: .78rem; font-weight: 600; padding: .28rem .65rem; border-radius: 9999px;
  }
  .pp-chip-remove { background: none; border: none; cursor: pointer; color: #16a34a; padding: 0; display: flex; line-height: 1; }

  /* ── Products grid ── */
  .pp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; }
  .pp-list { display: flex; flex-direction: column; gap: 1rem; }
  .pp-card-wrap { transition: transform .25s; }
  .pp-card-wrap:hover { transform: translateY(-4px); }

  /* ── Loading ── */
  .pp-loading { text-align: center; padding: 5rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; }
  @keyframes pp-spin { to { transform: rotate(360deg); } }
  .pp-spinner { animation: pp-spin .85s linear infinite; display: inline-block; }

  /* ── Empty state ── */
  .pp-empty { text-align: center; padding: 4rem 1.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 18px; }

  /* ── Responsive tweaks ── */
  @media (max-width: 640px) {
    .pp-grid { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: .85rem; }
    .pp-toolbar { padding: .6rem .75rem; gap: .5rem; }
    .pp-sort-select { font-size: .8rem; padding: .5rem .6rem; }
    .pp-hero { padding: 2rem 1rem 1.75rem; }
  }
  @media (max-width: 380px) {
    .pp-grid { grid-template-columns: 1fr 1fr; gap: .65rem; }
  }

  /* ── Sidebar desktop only ── */
  @media (max-width: 1023px) { .pp-sidebar { display: none; } }
  @media (min-width: 1024px) { .pp-mobile-filter-bar { display: none !important; } }

  /* ── Buttons ── */
  .pp-btn-primary {
    display: inline-flex; align-items: center; gap: .5rem;
    background: #16a34a; color: #fff; font-weight: 700; font-family: inherit;
    padding: .7rem 1.5rem; border-radius: 12px; border: none; cursor: pointer;
    font-size: .9rem; transition: background .2s, transform .15s;
  }
  .pp-btn-primary:hover { background: #15803d; transform: translateY(-1px); }
  .pp-btn-outline {
    display: inline-flex; align-items: center; gap: .5rem;
    background: transparent; color: #16a34a; font-weight: 700; font-family: inherit;
    padding: .7rem 1.5rem; border-radius: 12px; border: 2px solid #16a34a; cursor: pointer;
    font-size: .9rem; transition: background .2s;
  }
  .pp-btn-outline:hover { background: #f0fdf4; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ProductsPage({ onNavigate, onBuyProduct, onAddToCart }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [absoluteMax, setAbsoluteMax] = useState(10000);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  /* Inject CSS */
  useEffect(() => {
    if (document.getElementById('pp-styles')) return;
    const s = document.createElement('style');
    s.id = 'pp-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  /* Lock body scroll when mobile filter open */
  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filterOpen]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(API_ENDPOINTS.PRODUCTS);
      if (!res.ok) throw new Error('Failed to load');
      const data: Product[] = await res.json();
      setProducts(data);
      const uniqueCats = Array.from(new Set(data.map(p => p.category))).filter(Boolean).sort() as string[];
      setCategories(uniqueCats);
      const prices = data.map(p => p.price);
      const mx = Math.ceil(Math.max(...prices, 10000));
      setAbsoluteMax(mx);
      setMaxPrice(mx);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    let f = [...products];
    if (selectedCategory !== 'all') f = f.filter(p => p.category === selectedCategory);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    f = f.filter(p => p.price <= maxPrice);
    f.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    setFilteredProducts(f);
  }, [products, selectedCategory, searchTerm, sortBy, maxPrice]);

  const handleBuy = (p: Product, q: number) => { if (!isAuthenticated) { onNavigate('signin'); return; } onBuyProduct(p, q); };
  const handleAddToCart = (p: Product, q: number) => { if (!isAuthenticated) { onNavigate('signin'); return; } onAddToCart?.(p, q); };
  const clearAll = () => { setSearchTerm(''); setSelectedCategory('all'); setMaxPrice(absoluteMax); };

  const stats = {
    total: products.length,
    categoriesCount: categories.length,
    organicCount: products.filter(p => p.isOrganic).length,
    avgRating: (products.reduce((s, p) => s + (p.rating || 0), 0) / (products.length || 1)).toFixed(1),
  };

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (maxPrice < absoluteMax ? 1 : 0);

  /* ── Sidebar/Sheet filter panel (shared between desktop sidebar & mobile sheet) ── */
  const FilterPanel = () => (
    <>
      <div className="pp-filter-section">
        <div className="pp-filter-label">Category</div>
        <button className={`pp-cat-btn${selectedCategory === 'all' ? ' active' : ''}`} onClick={() => setSelectedCategory('all')}>
          <span>All Products</span>
          <span className="pp-cat-count">{products.length}</span>
        </button>
        {categories.map(cat => (
          <button key={cat} className={`pp-cat-btn${selectedCategory === cat ? ' active' : ''}`} onClick={() => setSelectedCategory(cat)}>
            <span style={{ textTransform: 'capitalize' }}>{cat}</span>
            <span className="pp-cat-count">{products.filter(p => p.category === cat).length}</span>
          </button>
        ))}
      </div>

      <div className="pp-filter-section">
        <div className="pp-filter-label">Max Price</div>
        <div className="pp-price-display">
          <span>₹0</span>
          <span>up to ₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range" className="pp-range"
          min={0} max={absoluteMax} step={100}
          value={maxPrice}
          onChange={e => setMaxPrice(parseInt(e.target.value))}
        />
      </div>

      {(selectedCategory !== 'all' || maxPrice < absoluteMax) && (
        <button className="pp-btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '.82rem', padding: '.55rem' }} onClick={clearAll}>
          <X style={{ width: 14, height: 14 }} /> Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="pp-root">

      {/* ── Hero ── */}
      <div className="pp-hero">
        <div className="pp-hero-badge">
          <Leaf style={{ width: 12, height: 12 }} />
          Farm Fresh Marketplace
        </div>
        <h1 className="pp-hero-title">Farm Fresh Products</h1>
        <p className="pp-hero-sub">Discover organic produce directly from local farmers — quality you can trust, delivered fresh.</p>
      </div>

      {/* ── Stats ── */}
      <div className="pp-stats">
        {[
          { label: 'Total Products', value: stats.total, icon: <ShoppingCart style={{ width: 18, height: 18 }} />, bg: '#eff6ff', color: '#2563eb' },
          { label: 'Categories', value: stats.categoriesCount, icon: <Grid3X3 style={{ width: 18, height: 18 }} />, bg: '#f0fdf4', color: '#16a34a' },
          { label: 'Organic Items', value: stats.organicCount, icon: <Sparkles style={{ width: 18, height: 18 }} />, bg: '#ecfdf5', color: '#059669' },
          { label: 'Avg Rating', value: stats.avgRating, icon: <Star style={{ width: 18, height: 18 }} />, bg: '#fffbeb', color: '#d97706' },
        ].map((s, i) => (
          <div key={i} className="pp-stat-card">
            <div className="pp-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="pp-stat-num">{s.value}</div>
              <div className="pp-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="pp-body">

        {/* Desktop Sidebar */}
        <aside className="pp-sidebar">
          <div className="pp-sidebar-title">
            <Filter style={{ width: 16, height: 16, color: '#16a34a' }} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#16a34a', color: '#fff', fontSize: '.65rem', fontWeight: 700, padding: '.15rem .45rem', borderRadius: 9999 }}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <FilterPanel />
        </aside>

        {/* Content */}
        <div className="pp-content">

          {/* Mobile filter trigger bar */}
          <div className="pp-mobile-filter-bar">
            <button className="pp-filter-trigger" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal style={{ width: 16, height: 16, color: '#16a34a' }} />
              Filters
              {activeFilterCount > 0 && <span className="pp-filter-badge">{activeFilterCount}</span>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <select className="pp-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
                <option value="newest">Newest</option>
                <option value="name">A–Z</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="pp-view-toggle">
                <button className={`pp-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 style={{ width: 15, height: 15 }} /></button>
                <button className={`pp-view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}><List style={{ width: 15, height: 15 }} /></button>
              </div>
            </div>
          </div>

          {/* Desktop Toolbar */}
          <div className="pp-toolbar" style={{ display: 'none' }} id="pp-desktop-toolbar">
            <div className="pp-search-wrap">
              <Search className="pp-search-icon" />
              <input type="text" placeholder="Search products, categories…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              {searchTerm && <button className="pp-search-clear" onClick={() => setSearchTerm('')}><X style={{ width: 10, height: 10 }} /></button>}
            </div>
            <select className="pp-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}>
              <option value="newest">Newest First</option>
              <option value="name">Name A–Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <div className="pp-view-toggle">
              <button className={`pp-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}><Grid3X3 style={{ width: 15, height: 15 }} /></button>
              <button className={`pp-view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')}><List style={{ width: 15, height: 15 }} /></button>
            </div>
          </div>

          {/* Unified toolbar (visible on all sizes, but adapts) */}
          <style>{`
            @media (min-width: 1024px) {
              #pp-desktop-toolbar { display: flex !important; }
              .pp-mobile-filter-bar { display: none !important; }
            }
            @media (min-width: 1024px) {
              .pp-search-mobile { display: none !important; }
            }
          `}</style>

          {/* Mobile search (below filter bar) */}
          <div className="pp-search-mobile" style={{ marginBottom: '.85rem', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '.7rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '.6rem .85rem .6rem 2.15rem', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: '.875rem', fontFamily: 'inherit', background: '#fff', outline: 'none', boxSizing: 'border-box', color: '#111827' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '.7rem', top: '50%', transform: 'translateY(-50%)', background: '#e5e7eb', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: 10, height: 10, color: '#6b7280' }} />
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {(selectedCategory !== 'all' || maxPrice < absoluteMax || searchTerm) && (
            <div className="pp-active-filters">
              {searchTerm && (
                <span className="pp-filter-chip">
                  Search: "{searchTerm}"
                  <button className="pp-chip-remove" onClick={() => setSearchTerm('')}><X style={{ width: 11, height: 11 }} /></button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="pp-filter-chip">
                  {selectedCategory}
                  <button className="pp-chip-remove" onClick={() => setSelectedCategory('all')}><X style={{ width: 11, height: 11 }} /></button>
                </span>
              )}
              {maxPrice < absoluteMax && (
                <span className="pp-filter-chip">
                  Max ₹{maxPrice.toLocaleString()}
                  <button className="pp-chip-remove" onClick={() => setMaxPrice(absoluteMax)}><X style={{ width: 11, height: 11 }} /></button>
                </span>
              )}
              <button className="pp-chip-remove" style={{ fontSize: '.78rem', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '.28rem .65rem', borderRadius: 9999 }} onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          {/* Results bar */}
          <div className="pp-results-bar">
            <p className="pp-results-text">
              Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              {selectedCategory !== 'all' && <> in <strong style={{ color: '#16a34a' }}>{selectedCategory}</strong></>}
            </p>
            <span className="pp-fresh-tag">
              <TrendingUp style={{ width: 13, height: 13 }} />
              Fresh from local farms
            </span>
          </div>

          {/* Products */}
          {loading ? (
            <div className="pp-loading">
              <svg className="pp-spinner" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="22" stroke="#dcfce7" strokeWidth="4" />
                <path d="M26 4a22 22 0 0 1 22 22" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 500 }}>Loading fresh produce…</p>
              <p style={{ marginTop: '.35rem', color: '#9ca3af', fontSize: '.875rem' }}>Gathering the best from our partner farms</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid' ? 'pp-grid' : 'pp-list'}>
              {filteredProducts.map(product => (
                <div key={product._id} className="pp-card-wrap">
                  <ProductCard product={product} onBuy={handleBuy} onAddToCart={handleAddToCart} viewMode={viewMode} />
                </div>
              ))}
            </div>
          ) : (
            <div className="pp-empty">
              <div style={{ width: 64, height: 64, background: '#f3f4f6', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Search style={{ width: 28, height: 28, color: '#9ca3af' }} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#111827', marginBottom: '.5rem' }}>No products found</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '.95rem', maxWidth: 380, margin: '0 auto 1.5rem', lineHeight: 1.65 }}>
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No products available right now. Check back soon!'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', justifyContent: 'center' }}>
                <button className="pp-btn-primary" onClick={clearAll}>Clear Filters</button>
                <button className="pp-btn-outline" onClick={() => onNavigate('home')}>Back to Home</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Bottom Sheet ── */}
      {filterOpen && (
        <>
          <div className="pp-filter-overlay" onClick={() => setFilterOpen(false)} />
          <div className="pp-filter-sheet">
            <div className="pp-sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 700, fontSize: '1rem', color: '#111827' }}>
                <Filter style={{ width: 16, height: 16, color: '#16a34a' }} />
                Filters
              </div>
              <button onClick={() => setFilterOpen(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#374151' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <FilterPanel />
            <button
              className="pp-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}
              onClick={() => setFilterOpen(false)}
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </>
      )}
    </div>
  );
}
