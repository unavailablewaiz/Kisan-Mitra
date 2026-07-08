import { ShoppingCart, MapPin, Star, Heart, TrendingUp, Truck, Home, X, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { useState, useEffect } from 'react';
import QuantitySelector from './QuantitySelector';

/* ─────────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .pc-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    overflow: hidden;
    transition: box-shadow .25s, border-color .25s, transform .25s;
    display: flex; flex-direction: column;
    height: 100%;
    position: relative;
  }
  .pc-root:hover { box-shadow: 0 12px 36px rgba(0,0,0,.1); border-color: #bbf7d0; }

  /* ── Image ── */
  .pc-img-wrap {
    position: relative;
    height: 180px; flex-shrink: 0;
    background: #f3f4f6; overflow: hidden;
  }
  @media (max-width: 400px) { .pc-img-wrap { height: 150px; } }
  .pc-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .4s ease;
  }
  .pc-root:hover .pc-img { transform: scale(1.06); }

  /* badges */
  .pc-badge {
    position: absolute; top: 8px; left: 8px;
    font-size: .68rem; font-weight: 800; letter-spacing: .04em;
    padding: .28rem .6rem; border-radius: 8px;
    display: flex; align-items: center; gap: .25rem;
    pointer-events: none;
  }
  .pc-badge-discount { background: #dc2626; color: #fff; }
  .pc-badge-trending { background: #f97316; color: #fff; }

  /* wishlist */
  .pc-wishlist {
    position: absolute; top: 8px; right: 8px;
    width: 34px; height: 34px; border-radius: 50%;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .2s;
    background: rgba(255,255,255,.92); backdrop-filter: blur(4px);
    color: #9ca3af;
  }
  .pc-wishlist:hover { transform: scale(1.12); color: #ef4444; }
  .pc-wishlist.active { background: #ef4444; color: #fff; }
  .pc-wishlist:disabled { opacity: .45; cursor: not-allowed; }

  /* ── Body ── */
  .pc-body { padding: 1rem; display: flex; flex-direction: column; flex: 1; gap: .65rem; }
  @media (max-width: 400px) { .pc-body { padding: .75rem; gap: .5rem; } }

  /* category chip */
  .pc-cat {
    display: inline-flex; align-items: center;
    background: #f0fdf4; color: #15803d;
    font-size: .7rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
    padding: .22rem .65rem; border-radius: 9999px;
    border: 1px solid #bbf7d0; align-self: flex-start;
  }

  /* name */
  .pc-name {
    font-size: .975rem; font-weight: 700; color: #111827; line-height: 1.3;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    transition: color .2s;
  }
  .pc-root:hover .pc-name { color: #16a34a; }

  /* description */
  .pc-desc {
    font-size: .82rem; color: #6b7280; line-height: 1.55;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  /* rating row */
  .pc-meta { display: flex; align-items: center; justify-content: space-between; }
  .pc-stars { display: flex; align-items: center; gap: 2px; }
  .pc-rating-count { font-size: .72rem; color: #9ca3af; margin-left: .25rem; }
  .pc-stock-in  { font-size: .72rem; font-weight: 700; color: #16a34a; }
  .pc-stock-low { font-size: .72rem; font-weight: 700; color: #f59e0b; }
  .pc-stock-out { font-size: .72rem; font-weight: 700; color: #dc2626; }

  /* farmer strip */
  .pc-farmer {
    display: flex; align-items: center; gap: .6rem;
    background: #f9fafb; border: 1px solid #f3f4f6;
    border-radius: 10px; padding: .55rem .7rem;
  }
  .pc-farmer-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: #dcfce7; display: flex; align-items: center; justify-content: center;
    font-size: .75rem; font-weight: 800; color: #16a34a; flex-shrink: 0;
  }
  .pc-farmer-name { font-size: .8rem; font-weight: 700; color: #111827; line-height: 1.2; }
  .pc-farmer-loc { font-size: .72rem; color: #9ca3af; display: flex; align-items: center; gap: 2px; }

  /* ── Price + actions row ── */
  .pc-footer { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
  .pc-price-wrap { display: flex; align-items: baseline; flex-wrap: wrap; gap: .3rem; }
  .pc-price { font-size: 1.2rem; font-weight: 800; color: #16a34a; }
  .pc-price-orig { font-size: .8rem; color: #9ca3af; text-decoration: line-through; }
  .pc-unit { font-size: .72rem; color: #9ca3af; }
  .pc-actions { display: flex; gap: .4rem; flex-shrink: 0; }

  .pc-btn-cart {
    width: 36px; height: 36px; border-radius: 10px;
    background: #f3f4f6; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6b7280; transition: background .2s, color .2s;
    flex-shrink: 0;
  }
  .pc-btn-cart:hover { background: #dcfce7; color: #16a34a; }
  .pc-btn-cart:disabled { opacity: .4; cursor: not-allowed; }

  .pc-btn-buy {
    height: 36px; padding: 0 .9rem; border-radius: 10px; border: none; cursor: pointer;
    font-family: inherit; font-size: .82rem; font-weight: 700;
    display: flex; align-items: center; gap: .3rem;
    transition: background .2s, transform .15s; white-space: nowrap;
  }
  .pc-btn-buy.default { background: #16a34a; color: #fff; }
  .pc-btn-buy.default:hover { background: #15803d; }
  .pc-btn-buy.confirm { background: #f97316; color: #fff; }
  .pc-btn-buy.confirm:hover { background: #ea580c; }
  .pc-btn-buy:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; transform: none; }
  .pc-btn-buy:not(:disabled):active { transform: scale(.97); }

  /* ── Options panel ── */
  .pc-options {
    background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px;
    padding: .85rem; display: flex; flex-direction: column; gap: .75rem;
    animation: pc-slide-in .2s ease;
  }
  @keyframes pc-slide-in { from { opacity:0; transform: translateY(-6px); } to { opacity:1; transform: none; } }

  .pc-opt-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; }

  /* delivery toggle */
  .pc-delivery-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
  .pc-delivery-btn {
    display: flex; flex-direction: column; align-items: center; gap: .3rem;
    padding: .6rem .4rem; border-radius: 11px; border: 1.5px solid #e5e7eb;
    background: #fff; cursor: pointer; font-family: inherit;
    font-size: .78rem; font-weight: 600; color: #6b7280;
    transition: border-color .2s, background .2s, color .2s;
  }
  @media (max-width: 360px) {
    .pc-delivery-btn { font-size: .7rem; padding: .5rem .3rem; }
  }
  .pc-delivery-btn.active { border-color: #16a34a; background: #fff; color: #16a34a; }
  .pc-delivery-btn:hover:not(.active) { border-color: #d1d5db; background: #f9fafb; }
  .pc-delivery-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: #f3f4f6; transition: background .2s;
  }
  .pc-delivery-btn.active .pc-delivery-icon { background: #dcfce7; }

  /* location banner */
  .pc-location-banner {
    display: flex; align-items: flex-start; gap: .4rem;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 10px; padding: .5rem .65rem;
    font-size: .75rem; color: #1d4ed8; line-height: 1.45;
  }
  .pc-location-banner svg { flex-shrink: 0; margin-top: 1px; }

  /* price breakdown */
  .pc-breakdown {
    background: #fff; border: 1px solid #e5e7eb; border-radius: 11px; padding: .65rem .75rem;
  }
  .pc-breakdown-row { display: flex; justify-content: space-between; font-size: .8rem; color: #6b7280; margin-bottom: .3rem; }
  .pc-breakdown-row:last-child { margin-bottom: 0; padding-top: .35rem; border-top: 1px solid #f3f4f6; font-weight: 700; font-size: .875rem; color: #111827; }
  .pc-breakdown-total { color: #16a34a; }

  /* cancel */
  .pc-cancel {
    background: none; border: none; cursor: pointer; font-family: inherit;
    font-size: .78rem; color: #9ca3af; text-decoration: underline; padding: 0;
    display: flex; align-items: center; gap: .25rem; justify-content: center;
    transition: color .15s;
  }
  .pc-cancel:hover { color: #6b7280; }
`;

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface ProductCardProps {
  product: Product;
  onBuy: (product: Product, quantity: number, deliveryType: 'pickup' | 'home_delivery', location?: { lat: number; lng: number; address: string }) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onAddToWishlist?: (product: Product) => void;
  viewMode?: 'grid' | 'list';
}

const PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzllYTBhNiIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function ProductCard({ product, onBuy, onAddToCart, onAddToWishlist, viewMode = 'grid' }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showOptions, setShowOptions] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  /* Inject CSS once */
  useEffect(() => {
    if (document.getElementById('pc-styles')) return;
    const s = document.createElement('style');
    s.id = 'pc-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  const isOutOfStock = product.quantity === 0;

  /* ── Helpers ── */
  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalPrice = () => {
    const base = product.price * quantity;
    return deliveryType === 'home_delivery' ? base * 1.03 : base;
  };

  const getLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude, address: `Lat: ${coords.latitude.toFixed(5)}, Lng: ${coords.longitude.toFixed(5)}` });
      },
      () => alert('Unable to get location. Please enable location services.')
    );
  };

  const handleBuyClick = () => {
    if (!showOptions) { setShowOptions(true); return; }
    onBuy(product, quantity, deliveryType, deliveryType === 'home_delivery' ? userLocation ?? undefined : undefined);
    setShowOptions(false);
    setQuantity(1);
  };

  const handleCart = () => { onAddToCart?.(product, quantity); setShowOptions(false); setQuantity(1); };
  const handleCancel = () => { setShowOptions(false); setQuantity(1); setDeliveryType('pickup'); };

  const StockBadge = () => {
    if (product.quantity === 0) return <span className="pc-stock-out">Out of Stock</span>;
    if (product.quantity < 10) return <span className="pc-stock-low">Only {product.quantity} left</span>;
    return <span className="pc-stock-in">In Stock</span>;
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="pc-stars">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} style={{ width: 12, height: 12, fill: s <= rating ? '#fbbf24' : 'none', color: s <= rating ? '#fbbf24' : '#d1d5db' }} />
      ))}
      <span className="pc-rating-count">({rating})</span>
    </div>
  );

  /* ── List mode layout ── */
  if (viewMode === 'list') {
    return (
      <div className="pc-root" style={{ flexDirection: 'row', height: 'auto', borderRadius: 16 }}>
        {/* Image */}
        <div className="pc-img-wrap" style={{ width: 120, height: 'auto', minHeight: 120, flexShrink: 0, borderRadius: 0 }}>
          <img src={imageError ? PLACEHOLDER : product.image} alt={product.name} className="pc-img" onError={() => setImageError(true)} style={{ height: '100%' }} />
          {discountPct > 0 && <span className="pc-badge pc-badge-discount">{discountPct}%</span>}
        </div>
        {/* Content */}
        <div className="pc-body" style={{ gap: '.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="pc-cat">{product.category}</span>
            <StockBadge />
          </div>
          <h3 className="pc-name">{product.name}</h3>
          <p className="pc-desc" style={{ WebkitLineClamp: 1 }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem', marginTop: 'auto' }}>
            <div className="pc-price-wrap">
              <span className="pc-price">₹{product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && <span className="pc-price-orig">₹{product.originalPrice}</span>}
              <span className="pc-unit">/{product.unit}</span>
            </div>
            <div className="pc-actions">
              {onAddToCart && (
                <button className="pc-btn-cart" onClick={handleCart} disabled={isOutOfStock} title="Add to Cart">
                  <ShoppingCart style={{ width: 16, height: 16 }} />
                </button>
              )}
              <button className={`pc-btn-buy ${showOptions ? 'confirm' : 'default'}`} onClick={handleBuyClick} disabled={isOutOfStock}>
                {showOptions ? <><CheckCircle style={{ width: 14, height: 14 }} />Confirm</> : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Grid mode (default) ── */
  return (
    <div className="pc-root">

      {/* Image */}
      <div className="pc-img-wrap">
        <img
          src={imageError ? PLACEHOLDER : product.image}
          alt={product.name}
          className="pc-img"
          onError={() => setImageError(true)}
        />

        {/* Badges — only one at a time, trending takes priority */}
        {product.isTrending
          ? <span className="pc-badge pc-badge-trending"><TrendingUp style={{ width: 10, height: 10 }} />Trending</span>
          : discountPct > 0 && <span className="pc-badge pc-badge-discount">{discountPct}% OFF</span>
        }

        {/* Wishlist */}
        <button
          className={`pc-wishlist${isWishlisted ? ' active' : ''}`}
          onClick={() => { setIsWishlisted(p => !p); onAddToWishlist?.(product); }}
          disabled={isOutOfStock}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart style={{ width: 15, height: 15, fill: isWishlisted ? '#fff' : 'none' }} />
        </button>
      </div>

      {/* Body */}
      <div className="pc-body">
        <span className="pc-cat">{product.category}</span>
        <h3 className="pc-name">{product.name}</h3>
        <p className="pc-desc">{product.description}</p>

        {/* Rating + stock */}
        <div className="pc-meta">
          <Stars rating={product.rating || 4.2} />
          <StockBadge />
        </div>

        {/* Farmer */}
        <div className="pc-farmer">
          <div className="pc-farmer-avatar">{(product.farmerName?.[0] || 'F').toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="pc-farmer-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.farmerName}</div>
            <div className="pc-farmer-loc">
              <MapPin style={{ width: 10, height: 10 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.location}</span>
            </div>
          </div>
        </div>

        {/* ── Options panel ── */}
        {showOptions && (
          <div className="pc-options">
            {/* Quantity */}
            <div>
              <div className="pc-opt-label" style={{ marginBottom: '.4rem' }}>Quantity</div>
              <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} max={product.quantity} disabled={isOutOfStock} />
            </div>

            {/* Delivery type */}
            <div>
              <div className="pc-opt-label" style={{ marginBottom: '.4rem' }}>Delivery Option</div>
              <div className="pc-delivery-grid">
                <button
                  className={`pc-delivery-btn${deliveryType === 'pickup' ? ' active' : ''}`}
                  onClick={() => setDeliveryType('pickup')}
                >
                  <div className="pc-delivery-icon"><Truck style={{ width: 14, height: 14 }} /></div>
                  Self Pickup
                </button>
                <button
                  className={`pc-delivery-btn${deliveryType === 'home_delivery' ? ' active' : ''}`}
                  onClick={() => { setDeliveryType('home_delivery'); if (!userLocation) getLocation(); }}
                >
                  <div className="pc-delivery-icon"><Home style={{ width: 14, height: 14 }} /></div>
                  Home Delivery
                </button>
              </div>
            </div>

            {/* Location */}
            {deliveryType === 'home_delivery' && userLocation && (
              <div className="pc-location-banner">
                <MapPin style={{ width: 12, height: 12 }} />
                <span>Delivering to: {userLocation.address}</span>
              </div>
            )}

            {/* Price breakdown */}
            <div className="pc-breakdown">
              <div className="pc-breakdown-row">
                <span>Base ({quantity} × ₹{product.price})</span>
                <span>₹{(product.price * quantity).toFixed(2)}</span>
              </div>
              {deliveryType === 'home_delivery' && (
                <div className="pc-breakdown-row">
                  <span>Delivery charge (3%)</span>
                  <span>₹{(product.price * quantity * 0.03).toFixed(2)}</span>
                </div>
              )}
              <div className="pc-breakdown-row">
                <span>Total</span>
                <span className="pc-breakdown-total">₹{totalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer: price + actions */}
        <div className="pc-footer">
          <div className="pc-price-wrap">
            <span className="pc-price">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="pc-price-orig">₹{product.originalPrice}</span>
            )}
            <span className="pc-unit">/{product.unit}</span>
          </div>

          <div className="pc-actions">
            {onAddToCart && (
              <button className="pc-btn-cart" onClick={handleCart} disabled={isOutOfStock} title="Add to Cart">
                <ShoppingCart style={{ width: 15, height: 15 }} />
              </button>
            )}
            <button
              className={`pc-btn-buy ${showOptions ? 'confirm' : 'default'}`}
              onClick={handleBuyClick}
              disabled={isOutOfStock}
            >
              {showOptions
                ? <><CheckCircle style={{ width: 13, height: 13 }} />Confirm</>
                : isOutOfStock ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Cancel */}
        {showOptions && (
          <button className="pc-cancel" onClick={handleCancel}>
            <X style={{ width: 12, height: 12 }} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}
