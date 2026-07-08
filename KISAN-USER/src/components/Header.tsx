import { LogOut, User, ShoppingBag, Bell, Search, Menu, X, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemsCount?: number;
}

/* ─── Injected styles ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .km-header {
    position: sticky; top: 0; z-index: 9999;
    font-family: 'DM Sans', system-ui, sans-serif;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 12px rgba(0,0,0,.06);
    transition: box-shadow .3s;
  }
  .km-header.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,.10); }

  .km-header-inner {
    max-width: 1260px; margin: 0 auto;
    padding: 0 1.25rem;
    display: flex; align-items: center;
    height: 64px; gap: 1rem;
  }

  /* ── Logo ── */
  .km-logo { display: flex; align-items: center; gap: .65rem; cursor: pointer; flex-shrink: 0; text-decoration: none; }
  .km-logo-icon {
    width: 42px; height: 42px; border-radius: 50%;
    overflow: hidden; flex-shrink: 0;
    border: 2px solid #dcfce7;
    box-shadow: 0 2px 8px rgba(22,163,74,.18);
    transition: transform .2s, box-shadow .2s;
  }
  .km-logo-icon img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .km-logo:hover .km-logo-icon { transform: scale(1.07); box-shadow: 0 4px 16px rgba(22,163,74,.28); }
  .km-logo-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.35rem; font-weight: 700;
    color: #14532d; line-height: 1.1;
    white-space: nowrap;
  }
  .km-logo-sub { font-size: .68rem; color: #6b7280; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; }

  /* ── Search ── */
  .km-search-wrap {
    flex: 1; max-width: 480px;
    position: relative;
  }
  .km-search-wrap input {
    width: 100%; padding: .55rem 1rem .55rem 2.5rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: .9rem; font-family: inherit;
    color: #111827; background: #f9fafb;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .km-search-wrap input:focus {
    border-color: #16a34a; background: #fff;
    box-shadow: 0 0 0 3px rgba(22,163,74,.12);
  }
  .km-search-icon {
    position: absolute; left: .75rem; top: 50%; transform: translateY(-50%);
    color: #9ca3af; pointer-events: none; width: 16px; height: 16px;
  }

  /* ── Desktop nav ── */
  .km-nav { display: flex; align-items: center; gap: .25rem; }
  .km-nav-btn {
    padding: .45rem .85rem; border-radius: 9px;
    font-size: .875rem; font-weight: 500;
    color: #4b5563; background: transparent; border: none; cursor: pointer;
    font-family: inherit; transition: color .18s, background .18s;
    white-space: nowrap; position: relative;
  }
  .km-nav-btn:hover { color: #16a34a; background: #f0fdf4; }
  .km-nav-btn.active { color: #16a34a; font-weight: 700; background: #f0fdf4; }
  .km-nav-btn.active::after {
    content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 18px; height: 2px; border-radius: 2px; background: #16a34a;
  }
  .km-nav-cart { position: relative; }
  .km-cart-badge {
    position: absolute; top: -2px; right: -2px;
    background: #dc2626; color: #fff;
    font-size: .65rem; font-weight: 700;
    min-width: 18px; height: 18px;
    border-radius: 9px; padding: 0 4px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #fff;
  }

  /* ── Icon button ── */
  .km-icon-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: transparent; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #6b7280; transition: color .2s, background .2s;
    position: relative; flex-shrink: 0;
  }
  .km-icon-btn:hover { color: #16a34a; background: #f0fdf4; }

  /* ── Notification dot ── */
  .km-notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #16a34a; border: 1.5px solid #fff;
  }

  /* ── User chip ── */
  .km-user-chip {
    display: flex; align-items: center; gap: .5rem;
    padding: .35rem .75rem .35rem .4rem;
    border-radius: 10px; border: 1.5px solid #e5e7eb;
    background: #fff; cursor: pointer;
    transition: border-color .2s, background .2s, box-shadow .2s;
    font-family: inherit;
  }
  .km-user-chip:hover { border-color: #16a34a; background: #f0fdf4; box-shadow: 0 2px 8px rgba(22,163,74,.12); }
  .km-avatar {
    width: 28px; height: 28px; border-radius: 8px;
    background: #dcfce7; display: flex; align-items: center; justify-content: center;
    color: #16a34a; flex-shrink: 0;
  }
  .km-user-name { font-size: .85rem; font-weight: 600; color: #111827; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── Dropdown ── */
  .km-dropdown {
    position: absolute; right: 0; top: calc(100% + .5rem);
    min-width: 200px; background: #fff;
    border: 1px solid #e5e7eb; border-radius: 14px;
    box-shadow: 0 16px 48px rgba(0,0,0,.12);
    overflow: hidden; z-index: 1000;
    animation: km-dd-in .18s ease;
  }
  @keyframes km-dd-in { from { opacity:0; transform: translateY(-8px) scale(.97); } to { opacity:1; transform: none; } }
  .km-dd-header { padding: .75rem 1rem; border-bottom: 1px solid #f3f4f6; }
  .km-dd-role { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #9ca3af; }
  .km-dd-name { font-size: .95rem; font-weight: 700; color: #111827; }
  .km-dd-item {
    display: flex; align-items: center; gap: .65rem;
    width: 100%; padding: .65rem 1rem;
    font-size: .875rem; font-weight: 500; color: #374151;
    background: none; border: none; cursor: pointer; font-family: inherit;
    transition: background .15s, color .15s; text-align: left;
  }
  .km-dd-item:hover { background: #f9fafb; color: #16a34a; }
  .km-dd-item.danger { color: #dc2626; }
  .km-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }
  .km-dd-divider { height: 1px; background: #f3f4f6; margin: .25rem 0; }

  /* ── Auth buttons ── */
  .km-btn-signin {
    padding: .48rem 1.1rem; border-radius: 9px;
    font-size: .875rem; font-weight: 600; font-family: inherit;
    color: #16a34a; background: transparent;
    border: 1.5px solid #16a34a; cursor: pointer;
    transition: background .2s, color .2s;
    white-space: nowrap;
  }
  .km-btn-signin:hover { background: #f0fdf4; }
  .km-btn-signup {
    padding: .48rem 1.1rem; border-radius: 9px;
    font-size: .875rem; font-weight: 700; font-family: inherit;
    color: #fff; background: #16a34a; border: none; cursor: pointer;
    transition: background .2s, transform .15s, box-shadow .2s;
    white-space: nowrap;
  }
  .km-btn-signup:hover { background: #15803d; box-shadow: 0 4px 16px rgba(22,163,74,.3); transform: translateY(-1px); }

  /* ── Hamburger ── */
  .km-hamburger {
    width: 40px; height: 40px; border-radius: 10px;
    border: 1.5px solid #e5e7eb; background: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #374151; flex-shrink: 0; transition: border-color .2s, background .2s;
  }
  .km-hamburger:hover { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }

  /* ── Mobile drawer ── */
  .km-drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.45);
    z-index: 10000; backdrop-filter: blur(2px);
    animation: km-overlay-in .2s ease;
  }
  @keyframes km-overlay-in { from { opacity:0; } to { opacity:1; } }

  .km-drawer {
    position: fixed; top: 0; right: 0; bottom: 0;
    width: min(320px, 88vw);
    background: #fff; z-index: 10001;
    display: flex; flex-direction: column;
    box-shadow: -8px 0 48px rgba(0,0,0,.15);
    animation: km-drawer-in .28s cubic-bezier(.22,.68,0,1.2);
    overflow-y: auto;
  }
  @keyframes km-drawer-in { from { transform: translateX(100%); } to { transform: none; } }

  .km-drawer-header {
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid #f3f4f6;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }

  .km-drawer-nav { padding: .75rem; flex: 1; }
  .km-drawer-item {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: .8rem 1rem; border-radius: 12px;
    font-size: .95rem; font-weight: 500; color: #374151;
    background: none; border: none; cursor: pointer; font-family: inherit;
    transition: background .15s, color .15s; margin-bottom: .25rem;
    text-align: left;
  }
  .km-drawer-item:hover { background: #f0fdf4; color: #16a34a; }
  .km-drawer-item.active { background: #f0fdf4; color: #16a34a; font-weight: 700; }
  .km-drawer-item-left { display: flex; align-items: center; gap: .75rem; }

  .km-drawer-section-label {
    font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
    color: #9ca3af; padding: .75rem 1rem .35rem;
  }
  .km-drawer-divider { height: 1px; background: #f3f4f6; margin: .5rem .75rem; }

  .km-drawer-user {
    display: flex; align-items: center; gap: .75rem;
    padding: .9rem 1.25rem;
    border-top: 1px solid #f3f4f6; flex-shrink: 0;
    background: #fafafa;
  }
  .km-drawer-avatar {
    width: 42px; height: 42px; border-radius: 12px;
    background: #dcfce7; display: flex; align-items: center; justify-content: center;
    color: #16a34a; flex-shrink: 0;
  }

  .km-drawer-auth { padding: 1rem; display: flex; flex-direction: column; gap: .65rem; flex-shrink: 0; }
  .km-drawer-signin {
    padding: .75rem; border-radius: 12px;
    font-size: .95rem; font-weight: 600; font-family: inherit;
    color: #16a34a; background: #f0fdf4; border: 1.5px solid #dcfce7;
    cursor: pointer; transition: background .2s;
  }
  .km-drawer-signin:hover { background: #dcfce7; }
  .km-drawer-signup {
    padding: .75rem; border-radius: 12px;
    font-size: .95rem; font-weight: 700; font-family: inherit;
    color: #fff; background: #16a34a; border: none;
    cursor: pointer; transition: background .2s;
  }
  .km-drawer-signup:hover { background: #15803d; }

  /* ── Mobile search bar (below header) ── */
  .km-mobile-search {
    padding: .6rem 1rem;
    border-top: 1px solid #f3f4f6;
    background: rgba(255,255,255,.97);
  }
  .km-mobile-search input {
    width: 100%; padding: .55rem 1rem .55rem 2.4rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: .875rem; font-family: inherit;
    background: #f9fafb; outline: none; color: #111827;
    transition: border-color .2s, box-shadow .2s;
    box-sizing: border-box;
  }
  .km-mobile-search input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,.1); }
  .km-mobile-search-wrap { position: relative; }
  .km-mobile-search-icon {
    position: absolute; left: .75rem; top: 50%; transform: translateY(-50%);
    color: #9ca3af; width: 15px; height: 15px; pointer-events: none;
  }

  /* ── Responsive breakpoints ── */
  @media (max-width: 767px) {
    .km-desktop-nav { display: none !important; }
    .km-desktop-search { display: none !important; }
    .km-desktop-auth { display: none !important; }
    .km-desktop-user { display: none !important; }
    .km-desktop-notif { display: none !important; }
    .km-hamburger { display: flex !important; }
  }
  @media (min-width: 768px) {
    .km-hamburger { display: none !important; }
    .km-mobile-search { display: none !important; }
  }
  @media (max-width: 1023px) {
    .km-desktop-search { display: none !important; }
  }
`;

/* ─── Nav items config ─── */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: <Home style={{ width: 17, height: 17 }} /> },
  { id: 'products', label: 'Products', icon: <ShoppingBag style={{ width: 17, height: 17 }} /> },
];
const AUTH_NAV_ITEMS = [
  { id: 'orders', label: 'My Orders', icon: <ShoppingBag style={{ width: 17, height: 17 }} /> },
  { id: 'cart', label: 'Cart', icon: <ShoppingBag style={{ width: 17, height: 17 }} />, showBadge: true },
];

export default function Header({ currentPage, onNavigate, cartItemsCount = 0 }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Inject CSS */
  useEffect(() => {
    if (document.getElementById('km-header-styles')) return;
    const s = document.createElement('style');
    s.id = 'km-header-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  /* Scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setShowUserMenu(false);
    setDrawerOpen(false);
  };

  const nav = (page: string) => {
    onNavigate(page);
    setDrawerOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      <header className={`km-header${scrolled ? ' scrolled' : ''}`}>
        <div className="km-header-inner">

          {/* Logo */}
          <div className="km-logo" onClick={() => nav('home')}>
            <div className="km-logo-icon">
              <img src="./kisanlogo.png" alt="Kisan Mitra Logo" />
            </div>
            <div>
              <div className="km-logo-name">Kisan Mitra</div>
              <div className="km-logo-sub">Farm Fresh Direct</div>
            </div>
          </div>

          {/* Desktop search */}
          <div className="km-search-wrap km-desktop-search">
            <Search className="km-search-icon" />
            <input type="text" placeholder="Search vegetables, fruits, grains…" />
          </div>

          {/* Desktop nav */}
          <nav className="km-nav km-desktop-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.id} className={`km-nav-btn${currentPage === item.id ? ' active' : ''}`} onClick={() => nav(item.id)}>
                {item.label}
              </button>
            ))}
            {isAuthenticated && AUTH_NAV_ITEMS.map(item => (
              <button key={item.id} className={`km-nav-btn km-nav-cart${currentPage === item.id ? ' active' : ''}`} onClick={() => nav(item.id)}>
                {item.label}
                {item.showBadge && cartItemsCount > 0 && (
                  <span className="km-cart-badge">{cartItemsCount > 9 ? '9+' : cartItemsCount}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Desktop: notification + user OR auth */}
          {isAuthenticated ? (
            <div className="km-desktop-user" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              {/* Notifications */}
              <button className="km-icon-btn km-desktop-notif">
                <Bell style={{ width: 18, height: 18 }} />
                <span className="km-notif-dot" />
              </button>

              {/* Cart shortcut */}
              <button className="km-icon-btn km-nav-cart" onClick={() => nav('cart')} style={{ position: 'relative' }}>
                <ShoppingBag style={{ width: 18, height: 18 }} />
                {cartItemsCount > 0 && <span className="km-cart-badge">{cartItemsCount > 9 ? '9+' : cartItemsCount}</span>}
              </button>

              {/* User dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button className="km-user-chip" onClick={() => setShowUserMenu(p => !p)}>
                  <div className="km-avatar"><User style={{ width: 15, height: 15 }} /></div>
                  <span className="km-user-name">{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="km-dropdown">
                    <div className="km-dd-header">
                      <div className="km-dd-role">{user?.role || 'Member'}</div>
                      <div className="km-dd-name">{user?.name}</div>
                    </div>
                    <button className="km-dd-item" onClick={() => { nav('profile'); setShowUserMenu(false); }}>
                      <User style={{ width: 15, height: 15 }} /> My Profile
                    </button>
                    <button className="km-dd-item" onClick={() => { nav('orders'); setShowUserMenu(false); }}>
                      <ShoppingBag style={{ width: 15, height: 15 }} /> My Orders
                    </button>
                    <div className="km-dd-divider" />
                    <button className="km-dd-item danger" onClick={handleLogout}>
                      <LogOut style={{ width: 15, height: 15 }} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="km-desktop-auth" style={{ display: 'flex', gap: '.5rem' }}>
              <button className="km-btn-signin" onClick={() => nav('signin')}>Sign In</button>
              <button className="km-btn-signup" onClick={() => nav('signup')}>Get Started</button>
            </div>
          )}

          {/* Hamburger — mobile only */}
          <button className="km-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Menu style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Mobile search strip */}
        <div className="km-mobile-search">
          <div className="km-mobile-search-wrap">
            <Search className="km-mobile-search-icon" />
            <input type="text" placeholder="Search vegetables, fruits, grains…" />
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <>
          <div className="km-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="km-drawer">

            {/* Drawer header */}
            <div className="km-drawer-header">
              <div className="km-logo" onClick={() => nav('home')}>
                <div className="km-logo-icon" style={{ width: 36, height: 36 }}>
                  <img src="./kisanlogo.png" alt="Kisan Mitra Logo" />
                </div>
                <div>
                  <div className="km-logo-name" style={{ fontSize: '1.15rem' }}>Kisan Mitra</div>
                </div>
              </div>
              <button className="km-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="km-drawer-nav">
              <div className="km-drawer-section-label">Navigate</div>
              {NAV_ITEMS.map(item => (
                <button key={item.id} className={`km-drawer-item${currentPage === item.id ? ' active' : ''}`} onClick={() => nav(item.id)}>
                  <span className="km-drawer-item-left">{item.icon}{item.label}</span>
                  <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db' }} />
                </button>
              ))}

              {isAuthenticated && (
                <>
                  <div className="km-drawer-divider" />
                  <div className="km-drawer-section-label">My Account</div>
                  <button className={`km-drawer-item${currentPage === 'profile' ? ' active' : ''}`} onClick={() => nav('profile')}>
                    <span className="km-drawer-item-left"><User style={{ width: 17, height: 17 }} />My Profile</span>
                    <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db' }} />
                  </button>
                  <button className={`km-drawer-item${currentPage === 'orders' ? ' active' : ''}`} onClick={() => nav('orders')}>
                    <span className="km-drawer-item-left"><ShoppingBag style={{ width: 17, height: 17 }} />My Orders</span>
                    <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db' }} />
                  </button>
                  <button className={`km-drawer-item km-nav-cart${currentPage === 'cart' ? ' active' : ''}`} onClick={() => nav('cart')} style={{ position: 'relative' }}>
                    <span className="km-drawer-item-left">
                      <span style={{ position: 'relative' }}>
                        <ShoppingBag style={{ width: 17, height: 17 }} />
                        {cartItemsCount > 0 && (
                          <span style={{ position: 'absolute', top: -6, right: -8, background: '#dc2626', color: '#fff', fontSize: '.6rem', fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff' }}>
                            {cartItemsCount > 9 ? '9+' : cartItemsCount}
                          </span>
                        )}
                      </span>
                      Cart
                    </span>
                    <ChevronRight style={{ width: 15, height: 15, color: '#d1d5db' }} />
                  </button>
                  <div className="km-drawer-divider" />
                  <button className="km-drawer-item" onClick={handleLogout} style={{ color: '#dc2626' }}>
                    <span className="km-drawer-item-left"><LogOut style={{ width: 17, height: 17 }} />Sign Out</span>
                  </button>
                </>
              )}
            </div>

            {/* Drawer footer */}
            {isAuthenticated ? (
              <div className="km-drawer-user">
                <div className="km-drawer-avatar"><User style={{ width: 20, height: 20 }} /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: '#111827' }}>{user?.name}</div>
                  <div style={{ fontSize: '.75rem', color: '#6b7280', fontWeight: 500 }}>{user?.role || 'Member'}</div>
                </div>
              </div>
            ) : (
              <div className="km-drawer-auth">
                <button className="km-drawer-signin" onClick={() => nav('signin')}>Sign In</button>
                <button className="km-drawer-signup" onClick={() => nav('signup')}>Get Started — It's Free</button>
              </div>
            )}
          </aside>
        </>
      )}
    </>
  );
}
