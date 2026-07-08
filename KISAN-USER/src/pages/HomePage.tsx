import { useEffect, useState, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Sparkles,
  Shield,
  Truck,
  Leaf,
  Star,
  Users,
  MapPin,
  CheckCircle,
  TrendingUp,
  Clock,
  ShoppingBag,
  ChevronDown,
  Quote,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────────────────────── */
interface HomePageProps {
  onNavigate: (page: string) => void;
  onBuyProduct: (product: Product, quantity: number) => void;
}

const FEATURED_PRODUCTS_COUNT = 6;

const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

const CAROUSEL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'Fresh Farm Produce',
    description: 'Straight from soil to your table — zero middlemen, maximum freshness.',
    tag: 'From Field to Fork',
  },
  {
    url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'Organic Farming',
    description: '100% natural, chemical-free produce for a healthier you and planet.',
    tag: 'Certified Organic',
  },
  {
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    title: 'Support Local Farmers',
    description: 'Empowering Indian farming communities with fair trade and fair prices.',
    tag: 'Fair Trade Pledge',
  },
  {
    url: 'https://static.investindia.gov.in/s3fs-public/2019-02/Blog%20Image.jpg',
    title: 'Seasonal Harvest',
    description: 'Peak-season fruits and vegetables bursting with flavor and nutrition.',
    tag: 'Seasonal Specials',
  },
];

const FEATURES = [
  { icon: <Truck className="h-6 w-6" />, title: 'Farm-Direct Delivery', description: 'Zero middlemen — what farmers earn, they keep. What you get is fresher.' },
  { icon: <Sparkles className="h-6 w-6" />, title: 'Fair Pricing', description: 'Transparent pricing with guaranteed fair compensation for every farmer.' },
  { icon: <Leaf className="h-6 w-6" />, title: 'Organic & Fresh', description: 'Harvested at peak ripeness, packed with care, delivered with speed.' },
  { icon: <Clock className="h-6 w-6" />, title: 'Fast Logistics', description: 'Our cold-chain network keeps produce farm-fresh until it reaches you.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Quality Assured', description: 'Every batch passes rigorous quality checks before shipping.' },
  { icon: <CheckCircle className="h-6 w-6" />, title: 'Secure Payments', description: '256-bit encrypted transactions you can trust every single time.' },
];

const STATS = [
  { number: '500+', label: 'Verified Farmers', icon: <Users className="h-5 w-5" /> },
  { number: '10K+', label: 'Products Delivered', icon: <ShoppingBag className="h-5 w-5" /> },
  { number: '50+', label: 'Cities Served', icon: <MapPin className="h-5 w-5" /> },
  { number: '98%', label: 'Satisfaction Rate', icon: <Star className="h-5 w-5" /> },
];

const FARMER_TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Organic Farmer · Punjab',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'Kisan Mitra helped me reach customers directly. My income has grown 40% since joining — I finally get what my produce is truly worth.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Fruit Grower · Maharashtra',
    image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    quote: 'My organic fruits now reach customers across India. This platform transformed my small farm into a nationwide business.',
    rating: 5,
  },
];

const SEASONAL_PRODUCTS = [
  { name: 'Mangoes', season: 'Summer', icon: '🥭', bg: '#FEF3C7', accent: '#D97706' },
  { name: 'Apples', season: 'Winter', icon: '🍎', bg: '#FEE2E2', accent: '#DC2626' },
  { name: 'Tomatoes', season: 'All Year', icon: '🍅', bg: '#FEE2E2', accent: '#B91C1C' },
  { name: 'Potatoes', season: 'All Year', icon: '🥔', bg: '#FEF3C7', accent: '#92400E' },
  { name: 'Wheat', season: 'Rabi', icon: '🌾', bg: '#FFFBEB', accent: '#B45309' },
  { name: 'Rice', season: 'Kharif', icon: '🍚', bg: '#F0FDF4', accent: '#15803D' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Farmers List Products', description: 'Verified farmers upload fresh produce with transparent pricing and quality details.', icon: <Leaf className="h-5 w-5" /> },
  { step: '02', title: 'Browse & Order', description: 'Discover seasonal specials and order seamlessly with real-time availability updates.', icon: <ShoppingBag className="h-5 w-5" /> },
  { step: '03', title: 'Delivered Fresh', description: 'Our cold-chain logistics network ensures farm-fresh delivery to your doorstep.', icon: <Truck className="h-5 w-5" /> },
];

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES (injected once as a <style> tag via a small helper)
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --green-50:  #f0fdf4;
    --green-100: #dcfce7;
    --green-500: #22c55e;
    --green-600: #16a34a;
    --green-700: #15803d;
    --green-800: #166534;
    --green-900: #14532d;
    --amber-400: #fbbf24;
    --amber-500: #f59e0b;
    --gray-50:   #f9fafb;
    --gray-100:  #f3f4f6;
    --gray-600:  #4b5563;
    --gray-700:  #374151;
    --gray-900:  #111827;
  }

  .km-font-display { font-family: 'Playfair Display', Georgia, serif; }
  .km-font-body    { font-family: 'DM Sans', system-ui, sans-serif; }

  /* ── Carousel fade ── */
  .km-slide { position: absolute; inset: 0; transition: opacity 1s ease, transform 1s ease; }
  .km-slide-active  { opacity: 1;  transform: scale(1); z-index: 1; }
  .km-slide-hidden  { opacity: 0;  transform: scale(1.04); z-index: 0; }

  /* ── Dot indicator ── */
  .km-dot { width: 8px; height: 8px; border-radius: 9999px; background: rgba(255,255,255,0.45); transition: all .3s; cursor: pointer; border: none; }
  .km-dot-active { width: 28px; background: #fff; }

  /* ── Feature card ── */
  .km-feat-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 2rem;
    transition: box-shadow .3s, transform .3s;
  }
  .km-feat-card:hover { box-shadow: 0 20px 50px rgba(0,0,0,.09); transform: translateY(-6px); }

  /* ── Icon bubble ── */
  .km-icon-bubble {
    width: 52px; height: 52px;
    background: var(--green-50);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    color: var(--green-700);
    margin-bottom: 1.25rem;
    transition: background .3s, color .3s, transform .3s;
  }
  .km-feat-card:hover .km-icon-bubble { background: var(--green-700); color: #fff; transform: scale(1.08); }

  /* ── Stat pill ── */
  .km-stat-pill {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    padding: 1.75rem 1.25rem;
    text-align: center;
    transition: box-shadow .3s, transform .3s;
  }
  .km-stat-pill:hover { box-shadow: 0 16px 40px rgba(0,0,0,.08); transform: translateY(-4px); }

  /* ── Seasonal card ── */
  .km-season-card {
    border-radius: 18px;
    padding: 1.5rem 1rem;
    text-align: center;
    border: 1px solid rgba(0,0,0,.06);
    background: #fff;
    transition: transform .3s, box-shadow .3s;
    cursor: default;
  }
  .km-season-card:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(0,0,0,.08); }

  /* ── Testimonial card ── */
  .km-testi-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 2rem;
    transition: box-shadow .3s, transform .3s;
  }
  .km-testi-card:hover { box-shadow: 0 22px 56px rgba(0,0,0,.09); transform: translateY(-5px); }

  /* ── Process step ── */
  .km-step-card {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 22px;
    padding: 2rem 1.75rem;
    transition: background .3s, transform .3s, border-color .3s;
    text-align: center;
  }
  .km-step-card:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.22); transform: translateY(-6px); }

  /* ── CTA buttons ── */
  .km-btn-primary {
    display: inline-flex; align-items: center; gap: .6rem;
    background: var(--green-600);
    color: #fff;
    font-weight: 700;
    padding: .875rem 2rem;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    transition: background .25s, transform .2s, box-shadow .25s;
    text-decoration: none;
  }
  .km-btn-primary:hover { background: var(--green-700); transform: translateY(-2px); box-shadow: 0 10px 30px rgba(22,163,74,.35); }

  .km-btn-outline {
    display: inline-flex; align-items: center; gap: .6rem;
    background: transparent;
    color: #fff;
    font-weight: 700;
    padding: .875rem 2rem;
    border-radius: 14px;
    border: 2px solid rgba(255,255,255,.55);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    transition: background .25s, border-color .25s, transform .2s;
    backdrop-filter: blur(6px);
  }
  .km-btn-outline:hover { background: rgba(255,255,255,.15); border-color: #fff; transform: translateY(-2px); }

  .km-btn-white {
    display: inline-flex; align-items: center; gap: .6rem;
    background: #fff;
    color: var(--green-700);
    font-weight: 700;
    padding: 1rem 2.25rem;
    border-radius: 14px;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 1.05rem;
    transition: background .25s, transform .2s, box-shadow .25s;
  }
  .km-btn-white:hover { background: var(--green-50); transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,.15); }

  /* ── Divider ornament ── */
  .km-leaf-divider {
    display: flex; align-items: center; justify-content: center; gap: 1rem;
    margin: 0 auto 1.5rem;
    color: var(--green-500);
    font-size: 1.25rem;
  }
  .km-leaf-divider::before, .km-leaf-divider::after {
    content: '';
    flex: 1; max-width: 60px;
    height: 1px;
    background: var(--green-200, #bbf7d0);
  }

  /* ── Section label chip ── */
  .km-chip {
    display: inline-flex; align-items: center; gap: .4rem;
    background: var(--green-50);
    color: var(--green-700);
    font-size: .8rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    padding: .4rem 1rem;
    border-radius: 9999px;
    border: 1px solid var(--green-100, #dcfce7);
    margin-bottom: 1rem;
  }
  .km-chip-amber {
    background: #fffbeb; color: #92400e;
    border-color: #fde68a;
  }
  .km-chip-white {
    background: rgba(255,255,255,.12);
    color: #fff;
    border-color: rgba(255,255,255,.22);
  }

  /* ── Arrow icon animation ── */
  .km-arrow-hover { transition: transform .25s; }
  button:hover .km-arrow-hover, a:hover .km-arrow-hover { transform: translateX(4px); }

  /* ── Scroll indicator bounce ── */
  @keyframes km-bounce { 0%,100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(8px) translateX(-50%); } }
  .km-scroll-indicator { animation: km-bounce 1.8s ease-in-out infinite; }

  /* ── Fade-up on load ── */
  @keyframes km-fadeup { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }
  .km-fadeup { animation: km-fadeup .8s ease both; }
  .km-fadeup-1 { animation-delay: .1s; }
  .km-fadeup-2 { animation-delay: .25s; }
  .km-fadeup-3 { animation-delay: .42s; }
  .km-fadeup-4 { animation-delay: .58s; }

  /* ── Grid backgrounds ── */
  .km-grid-bg {
    background-image: linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* ── Error/Empty state ── */
  .km-state-box {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 24px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 520px;
    margin: 0 auto;
  }

  /* ── Loading spinner ── */
  @keyframes km-spin { to { transform: rotate(360deg); } }
  .km-spinner { animation: km-spin .9s linear infinite; }

  /* ── Mobile nav helper ── */
  @media (max-width: 640px) {
    .km-hero-title { font-size: 3.25rem !important; line-height: 1.1 !important; }
    .km-hero-desc  { font-size: 1.05rem !important; }
    .km-section-title { font-size: 2.25rem !important; }
    .km-btn-primary, .km-btn-outline, .km-btn-white { padding: .8rem 1.5rem !important; font-size: .95rem !important; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function HomePage({ onNavigate, onBuyProduct }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingState, setLoadingState] = useState<typeof LOADING_STATES[keyof typeof LOADING_STATES]>(LOADING_STATES.IDLE);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { isAuthenticated } = useAuth();

  /* Inject CSS once */
  useEffect(() => {
    if (document.getElementById('km-styles')) return;
    const s = document.createElement('style');
    s.id = 'km-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  /* Carousel auto-advance */
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % CAROUSEL_IMAGES.length), 5500);
    return () => clearInterval(id);
  }, [isPlaying]);

  /* Fetch products */
  const loadProducts = useCallback(async () => {
    try {
      setLoadingState(LOADING_STATES.LOADING);
      setError('');
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(API_ENDPOINTS.PRODUCTS, { signal: ctrl.signal });
      clearTimeout(tid);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: Product[] = await res.json();
      setFeaturedProducts(
        data.filter(p => p.isActive !== false)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, FEATURED_PRODUCTS_COUNT)
      );
      setLoadingState(LOADING_STATES.SUCCESS);
    } catch (e: any) {
      setError(e.name === 'AbortError' ? 'Request timed out. Please check your connection.' : e.message || 'Failed to load products.');
      setLoadingState(LOADING_STATES.ERROR);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleBuy = useCallback((p: Product, q: number) => {
    if (!isAuthenticated) { onNavigate('signin'); return; }
    onBuyProduct(p, q);
  }, [isAuthenticated, onNavigate, onBuyProduct]);

  /* ── Render helpers ── */
  const Stars = ({ n }: { n: number }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} style={{ width: 14, height: 14, fill: i < n ? '#fbbf24' : 'none', color: i < n ? '#fbbf24' : '#d1d5db' }} />
      ))}
    </div>
  );

  const LoadingUI = () => (
    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
        <svg className="km-spinner" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="24" stroke="#dcfce7" strokeWidth="5" />
          <path d="M28 4a24 24 0 0 1 24 24" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <Leaf style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 20, height: 20, color: '#16a34a' }} />
      </div>
      <p className="km-font-body" style={{ color: '#4b5563', fontSize: '1.05rem' }}>Loading fresh produce…</p>
    </div>
  );

  const ErrorUI = () => (
    <div className="km-state-box">
      <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
        <svg width="28" height="28" fill="none" stroke="#dc2626" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <h3 className="km-font-display" style={{ fontSize: '1.5rem', marginBottom: '.5rem', color: '#111827' }}>Couldn't Load Products</h3>
      <p className="km-font-body" style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
      <button className="km-btn-primary" onClick={loadProducts}>Try Again</button>
    </div>
  );

  const EmptyUI = () => (
    <div className="km-state-box">
      <ShoppingBag style={{ width: 48, height: 48, color: '#9ca3af', margin: '0 auto 1rem' }} />
      <h3 className="km-font-display" style={{ fontSize: '1.5rem', marginBottom: '.5rem', color: '#111827' }}>No Products Yet</h3>
      <p className="km-font-body" style={{ color: '#6b7280' }}>Our farmers are preparing the next harvest — check back soon!</p>
    </div>
  );

  /* ── Carousel helpers ── */
  const prev = () => setCurrentSlide(p => (p - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  const next = () => setCurrentSlide(p => (p + 1) % CAROUSEL_IMAGES.length);

  /* ────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="km-font-body" style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ══════════════════════════════════════════════════════
          HERO / CAROUSEL
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 560, overflow: 'hidden' }}>
        {/* Slides */}
        {CAROUSEL_IMAGES.map((img, i) => (
          <div key={i} className={`km-slide ${i === currentSlide ? 'km-slide-active' : 'km-slide-hidden'}`}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            {/* Dark overlay — stronger at bottom & left */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.38) 60%, rgba(0,0,0,.15) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,.55), transparent)' }} />
          </div>
        ))}

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '0 clamp(1.25rem, 6vw, 6rem)' }}>
          <div className="km-fadeup km-fadeup-1">
            <span className="km-chip km-chip-white" style={{ marginBottom: '1.25rem' }}>
              <Sparkles style={{ width: 13, height: 13 }} />
              {CAROUSEL_IMAGES[currentSlide].tag}
            </span>
          </div>

          <h1 className="km-font-display km-hero-title km-fadeup km-fadeup-2"
            style={{ fontSize: 'clamp(3.25rem, 8vw, 6.5rem)', color: '#fff', lineHeight: 1.08, marginBottom: '1rem', maxWidth: 800 }}>
            Kisan<br />
            <span style={{ WebkitTextStroke: '2px rgba(255,255,255,.55)', color: 'transparent' }}>Mitra</span>
          </h1>

          <p className="km-hero-desc km-fadeup km-fadeup-3"
            style={{ fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', color: 'rgba(255,255,255,.88)', maxWidth: 560, lineHeight: 1.65, marginBottom: '2.25rem' }}>
            {CAROUSEL_IMAGES[currentSlide].description}
          </p>

          <div className="km-fadeup km-fadeup-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <button className="km-btn-primary" style={{ padding: '.95rem 2.1rem', fontSize: '1rem' }} onClick={() => onNavigate('products')}>
              <ShoppingBag style={{ width: 18, height: 18 }} />
              Shop Fresh Now
              <ArrowRight className="km-arrow-hover" style={{ width: 17, height: 17 }} />
            </button>
            <button className="km-btn-outline" onClick={() => onNavigate('signup')}>
              <Leaf style={{ width: 17, height: 17 }} />
              Sell on Kisan Mitra
            </button>
          </div>
        </div>

        {/* Controls bar */}
        <div style={{ position: 'absolute', zIndex: 20, bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={prev} style={{ background: 'rgba(255,255,255,.18)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}>
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>

          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 6 }}>
            {CAROUSEL_IMAGES.map((_, i) => (
              <button key={i} className={`km-dot ${i === currentSlide ? 'km-dot-active' : ''}`} onClick={() => setCurrentSlide(i)} />
            ))}
          </div>

          <button onClick={() => setIsPlaying(p => !p)}
            style={{ background: 'rgba(255,255,255,.18)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}>
            {isPlaying ? <Pause style={{ width: 17, height: 17 }} /> : <Play style={{ width: 17, height: 17 }} />}
          </button>

          <button onClick={next} style={{ background: 'rgba(255,255,255,.18)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,.18)')}>
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Scroll hint */}
        <div className="km-scroll-indicator" style={{ position: 'absolute', zIndex: 20, bottom: '1rem', left: '50%' }}>
          <ChevronDown style={{ width: 22, height: 22, color: 'rgba(255,255,255,.5)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS RIBBON
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#f0fdf4', borderTop: '1px solid #dcfce7', borderBottom: '1px solid #dcfce7', padding: '3rem 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {STATS.map((s, i) => (
            <div key={i} className="km-stat-pill">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem', marginBottom: '.75rem', color: '#16a34a' }}>
                {s.icon}
              </div>
              <div className="km-font-display" style={{ fontSize: '2.1rem', fontWeight: 900, color: '#14532d', lineHeight: 1.1, marginBottom: '.3rem' }}>{s.number}</div>
              <div style={{ color: '#4b5563', fontSize: '.9rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 0', background: '#fff' }} className="km-grid-bg">
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="km-chip"><Sparkles style={{ width: 13, height: 13 }} />Why Kisan Mitra?</div>
            <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#111827', marginBottom: '.75rem' }}>
              Revolutionizing Agriculture
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              Technology that bridges the gap between hardworking farmers and conscious consumers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="km-feat-card">
                <div className="km-icon-bubble">{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', marginBottom: '.5rem' }}>{f.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '.95rem' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SEASONAL SPECIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '5.5rem 0', background: '#fafaf9' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="km-chip km-chip-amber"><TrendingUp style={{ width: 13, height: 13 }} />Seasonal Specials</div>
            <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#111827' }}>
              Fresh From the Season
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {SEASONAL_PRODUCTS.map((p, i) => (
              <div key={i} className="km-season-card" style={{ background: p.bg }}>
                <div style={{ fontSize: '2.6rem', marginBottom: '.6rem', lineHeight: 1 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, color: p.accent, fontSize: '1rem', marginBottom: '.3rem' }}>{p.name}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 600, background: 'rgba(255,255,255,.7)', color: p.accent, padding: '.25rem .65rem', borderRadius: 999, display: 'inline-block' }}>{p.season}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 0', background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          {/* Section header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', gap: '1.5rem' }}>
            <div>
              <div className="km-chip"><Star style={{ width: 13, height: 13 }} />Featured Products</div>
              <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#111827', marginBottom: '.5rem' }}>
                Handpicked Freshness
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>Premium produce from our verified partner farms</p>
            </div>
            {featuredProducts.length > 0 && (
              <button className="km-btn-primary" onClick={() => onNavigate('products')}>
                All Products
                <ArrowRight className="km-arrow-hover" style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          {/* States */}
          {loadingState === LOADING_STATES.LOADING && <LoadingUI />}
          {loadingState === LOADING_STATES.ERROR && <ErrorUI />}
          {loadingState === LOADING_STATES.SUCCESS && (
            featuredProducts.length > 0
              ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {featuredProducts.map((p, idx) => (
                    <div key={p._id} style={{ transition: 'transform .3s', animationDelay: `${idx * 80}ms` }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-6px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                      <ProductCard product={p} onBuy={handleBuy} />
                    </div>
                  ))}
                </div>
              )
              : <EmptyUI />
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 0', background: '#f0fdf4' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="km-chip"><Users style={{ width: 13, height: 13 }} />Farmer Stories</div>
            <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#111827', marginBottom: '.6rem' }}>
              Voices from Our Fields
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Real success stories from farmers who've transformed their livelihoods.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {FARMER_TESTIMONIALS.map((t, i) => (
              <div key={i} className="km-testi-card">
                {/* Quote icon */}
                <Quote style={{ width: 30, height: 30, color: '#86efac', marginBottom: '1rem', transform: 'scaleX(-1)' }} />
                <p style={{ color: '#374151', lineHeight: 1.75, fontSize: '1rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <img src={t.image} alt={t.name} style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{t.name}</div>
                    <div style={{ color: '#16a34a', fontSize: '.85rem', fontWeight: 500, marginBottom: '.25rem' }}>{t.role}</div>
                    <Stars n={t.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #1e3a5f 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="km-chip km-chip-white"><Sparkles style={{ width: 13, height: 13 }} />Simple Process</div>
            <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', marginBottom: '.6rem' }}>
              How Kisan Mitra Works
            </h2>
            <p style={{ color: '#86efac', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto' }}>
              Three simple steps. Infinite freshness.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {PROCESS_STEPS.map((step, i) => (
              <div key={i} className="km-step-card">
                {/* Step number badge */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', fontWeight: 900, color: 'rgba(255,255,255,.15)', lineHeight: 1 }}>{step.step}</span>
                  <div style={{ width: 42, height: 42, background: '#16a34a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff', marginBottom: '.6rem' }}>{step.title}</h3>
                <p style={{ color: '#86efac', lineHeight: 1.7, fontSize: '.95rem' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 1.25rem', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {/* Leaf ornament */}
          <div className="km-leaf-divider"><Leaf style={{ width: 22, height: 22 }} /></div>

          <h2 className="km-font-display km-section-title" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: '#111827', marginBottom: '1rem', lineHeight: 1.15 }}>
            Ready to Taste the<br />
            <span style={{ color: '#16a34a' }}>Difference?</span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            Join thousands of customers who get farm-fresh produce delivered right to their door — and farmers who finally earn what they deserve.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.9rem', justifyContent: 'center' }}>
            <button className="km-btn-white" style={{ background: '#16a34a', color: '#fff' }} onClick={() => onNavigate('products')}>
              <ShoppingBag style={{ width: 18, height: 18 }} />
              Start Shopping
              <ArrowRight className="km-arrow-hover" style={{ width: 17, height: 17 }} />
            </button>
            <button className="km-btn-primary" style={{ background: 'transparent', border: '2px solid #16a34a', color: '#16a34a' }}
              onClick={() => onNavigate('signup')}
              onMouseEnter={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#16a34a'; }}>
              <Leaf style={{ width: 17, height: 17 }} />
              Join as Farmer
            </button>
          </div>

          <p style={{ marginTop: '2rem', color: '#9ca3af', fontSize: '.9rem' }}>
            Already have an account?{' '}
            <button onClick={() => onNavigate('signin')}
              style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 'inherit' }}>
              Sign in here
            </button>
          </p>
        </div>
      </section>

    </div>
  );
}
