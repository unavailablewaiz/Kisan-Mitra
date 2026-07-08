import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import FarmerDashboard from "./components/FarmerDashboard";
import SubsidyCalculator from "./components/SubsidyCalculator";
import ProductsManager from "./components/ProductsManager";
import ProductUpload from "./components/ProductUpload";
import Marketplace from "./components/Marketplace";
import AISchemes from "./components/AISchemes";
import Modal from "./components/Modal";
import { User, ModalContent } from "./types";
import "./App.css";

/* ═══════════════════════════════════════════════════════════
   DESIGN SYSTEM STYLES — exact port of the HTML design
═══════════════════════════════════════════════════════════ */
const DESIGN_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --g900: #0a3d1c; --g800: #0f4d23; --g700: #155f2c; --g600: #1e7a39;
    --g500: #2a9648; --g400: #45b060; --g300: #7dcf97; --g200: #b3e8c3;
    --g100: #e6f5ec; --g50:  #f2faf5;
    --gold: #b8861e; --gold-light: #d4a43a;
    --radius-sm: 6px; --radius-md: 12px; --radius-lg: 18px;
    --radius-xl: 24px; --radius-2xl: 32px;
    --shadow-green: 0 6px 20px rgba(21,95,44,.2);
    --shadow-xl: 0 20px 60px rgba(0,0,0,.1), 0 6px 16px rgba(0,0,0,.06);
    --font-display: 'Playfair Display', serif;
    --font-body: 'DM Sans', sans-serif;
  }

  [data-km-theme="light"] {
    --bg:#ffffff; --bg-alt:#f8faf8; --bg-alt2:#f2f4f2;
    --surface:#ffffff; --surface2:#f2faf5;
    --border:#e4e8e4; --border-green:#b3e8c3;
    --text-primary:#111d14; --text-secondary:#3d5243; --text-muted:#8aa08f;
    --nav-bg:rgba(255,255,255,0.97);
    --shadow-sm:0 1px 3px rgba(0,0,0,.05);
    --shadow-md:0 4px 16px rgba(0,0,0,.07);
    --shadow-lg:0 10px 36px rgba(0,0,0,.09);
    --card-hover:#f0faf3; --chip-bg:#f0faf3; --chip-color:#155f2c;
    --logo-name:#0f4d23; --arch-bg:#f8faf8;
    --ghost-border:#d0d8d0; --ghost-color:#3d5243;
    --hero-overlay:linear-gradient(120deg,#ffffff 0%,#f2faf5 50%,#e2f5eb 100%);
  }
  [data-km-theme="dark"] {
    --bg:#080f0a; --bg-alt:#0d1810; --bg-alt2:#111d14;
    --surface:#0f1d12; --surface2:#152019;
    --border:#1e3022; --border-green:#1e4025;
    --text-primary:#e8f5ec; --text-secondary:#8ab898; --text-muted:#4a7255;
    --nav-bg:rgba(8,15,10,0.97);
    --shadow-sm:0 1px 3px rgba(0,0,0,.4);
    --shadow-md:0 4px 16px rgba(0,0,0,.5);
    --shadow-lg:0 10px 36px rgba(0,0,0,.6);
    --card-hover:#152019; --chip-bg:#152019; --chip-color:#7dcf97;
    --logo-name:#7dcf97; --arch-bg:#0d1810;
    --ghost-border:#1e3022; --ghost-color:#8ab898;
    --hero-overlay:linear-gradient(120deg,#080f0a 0%,#0d1810 50%,#0f2014 100%);
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior:smooth; font-size:16px; }
  body {
    font-family:var(--font-body); background:var(--bg); color:var(--text-primary);
    overflow-x:hidden; line-height:1.65; transition:background .35s,color .35s;
  }
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:var(--bg-alt)}
  ::-webkit-scrollbar-thumb{background:var(--g400);border-radius:4px}

  /* ── PARTICLES ── */
  #km-particles{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .km-particle{
    position:absolute;border-radius:50%;
    background:radial-gradient(circle,var(--g300) 0%,transparent 70%);
    opacity:.12;animation:km-float 8s ease-in-out infinite;
  }
  @keyframes km-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.1)}}

  /* ── LOADING ── */
  .km-loading{
    position:fixed;inset:0;z-index:9999;background:var(--bg);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;
  }
  .km-loading-logo{
    width:64px;height:64px;border-radius:16px;overflow:hidden;box-shadow:var(--shadow-green);
    animation:km-pulse-logo 1.8s ease-in-out infinite;
  }
  .km-loading-logo img{width:100%;height:100%;object-fit:cover}
  @keyframes km-pulse-logo{
    0%,100%{transform:scale(1);box-shadow:var(--shadow-green)}
    50%{transform:scale(1.06);box-shadow:0 12px 32px rgba(21,95,44,.35)}
  }
  .km-loading-text{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:var(--text-primary);letter-spacing:-.02em}
  .km-loading-sub{font-size:.8rem;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase}
  .km-loading-bar{width:180px;height:3px;background:var(--border);border-radius:100px;overflow:hidden;margin-top:8px}
  .km-loading-fill{height:100%;background:linear-gradient(90deg,var(--g700),var(--g400));border-radius:100px;animation:km-bar 1.8s ease-in-out infinite}
  @keyframes km-bar{0%{width:0;margin-left:0}50%{width:80%;margin-left:0}100%{width:0;margin-left:100%}}

  /* ── THEME TOGGLE ── */
  .km-theme-toggle{
    width:52px;height:28px;background:var(--border);border-radius:100px;
    border:none;cursor:pointer;display:flex;align-items:center;padding:3px;
    transition:background .3s;flex-shrink:0;
  }
  .km-toggle-thumb{
    width:22px;height:22px;border-radius:50%;
    background:linear-gradient(135deg,var(--g700),var(--g400));
    transition:transform .3s cubic-bezier(.4,0,.2,1);
    display:flex;align-items:center;justify-content:center;font-size:.62rem;color:#fff;
  }
  [data-km-theme="dark"] .km-toggle-thumb{transform:translateX(24px)}
  [data-km-theme="dark"] .km-theme-toggle{background:var(--g800)}

  /* ── NAV ── */
  .km-nav{
    position:fixed;top:0;left:0;right:0;z-index:1000;
    background:var(--nav-bg);backdrop-filter:blur(16px);
    border-bottom:1px solid var(--border);
    height:68px;display:flex;align-items:center;padding:0 4%;
    transition:box-shadow .3s,background .35s,border-color .35s;
  }
  .km-nav.scrolled{box-shadow:var(--shadow-md)}
  .km-nav-inner{width:100%;max-width:1300px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
  .km-nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;cursor:pointer;background:none;border:none}
  .km-logo-mark{
    width:40px;height:40px;border-radius:10px;overflow:hidden;
    background:linear-gradient(135deg,var(--g700),var(--g500));box-shadow:var(--shadow-green);flex-shrink:0;
  }
  .km-logo-mark img{width:100%;height:100%;object-fit:cover;border-radius:10px}
  .km-logo-name{font-family:var(--font-display);font-size:1.15rem;font-weight:700;color:var(--logo-name);display:block;line-height:1}
  .km-logo-tag{font-size:.58rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.14em;font-weight:500}
  .km-nav-links{display:flex;align-items:center;gap:2px}
  .km-nav-links a{text-decoration:none;color:var(--text-secondary);font-size:.81rem;font-weight:500;padding:6px 12px;border-radius:6px;transition:all .2s;letter-spacing:.01em}
  .km-nav-links a:hover{background:var(--surface2);color:var(--g700)}
  .km-nav-cta{display:flex;align-items:center;gap:8px}
  .km-btn-ghost{
    padding:7px 16px;border:1px solid var(--ghost-border);border-radius:var(--radius-sm);
    background:transparent;color:var(--ghost-color);font-size:.8rem;font-weight:600;
    cursor:pointer;font-family:var(--font-body);transition:all .2s;
  }
  .km-btn-ghost:hover{border-color:var(--g500);color:var(--g600);background:var(--surface2)}
  .km-btn-nav-cta{
    padding:7px 16px;border:none;border-radius:var(--radius-sm);
    background:var(--g700);color:#fff;font-size:.8rem;font-weight:600;
    cursor:pointer;font-family:var(--font-body);transition:all .2s;display:flex;align-items:center;gap:6px;
  }
  .km-btn-nav-cta:hover{background:var(--g800);box-shadow:var(--shadow-green)}
  .km-ham{
    display:none;width:36px;height:36px;border-radius:7px;
    border:1px solid var(--border);background:var(--surface);
    cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:4px;
  }
  .km-ham span{display:block;width:16px;height:1.5px;background:var(--text-secondary);border-radius:2px;transition:all .3s}

  /* ── MOBILE DRAWER ── */
  .km-drawer{
    display:none;position:fixed;top:68px;left:0;right:0;bottom:0;z-index:999;
    background:var(--bg);padding:24px 6% 40px;
    flex-direction:column;gap:2px;border-top:1px solid var(--border);overflow-y:auto;
  }
  .km-drawer.open{display:flex}
  .km-drawer a{text-decoration:none;color:var(--text-secondary);font-size:.95rem;font-weight:500;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer}
  .km-drawer-btns{display:flex;gap:10px;margin-top:20px}
  .km-drawer-btns button{flex:1;padding:12px;border-radius:8px;font-size:.88rem;font-weight:600;font-family:var(--font-body);cursor:pointer}
  .km-drawer-btn1{border:1px solid var(--g500);background:transparent;color:var(--g700)}
  .km-drawer-btn2{border:none;background:var(--g700);color:#fff}

  /* ── HERO ── */
  .km-hero{
    min-height:100vh;padding:100px 4% 80px;
    display:flex;align-items:center;background:var(--bg);position:relative;overflow:hidden;
  }
  .km-hero-bg-shape{
    position:absolute;top:0;right:0;width:52%;height:100%;
    background:var(--hero-overlay);
    clip-path:polygon(14% 0,100% 0,100% 100%,0 100%);z-index:0;transition:background .35s;
  }
  .km-hero-dots{
    position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;
    background-image:radial-gradient(circle,var(--border) 1px,transparent 1px);
    background-size:32px 32px;opacity:.5;
  }
  .km-hero-inner{
    max-width:1300px;margin:0 auto;width:100%;
    display:grid;grid-template-columns:1fr 1fr;gap:64px;
    align-items:center;z-index:1;position:relative;
  }
  .km-hero-badge{
    display:inline-flex;align-items:center;gap:7px;
    background:var(--surface2);border:1px solid var(--border-green);
    border-radius:100px;padding:5px 14px 5px 10px;
    font-size:.7rem;font-weight:600;color:var(--g600);
    letter-spacing:.07em;text-transform:uppercase;margin-bottom:24px;
  }
  .km-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--g500);animation:km-pulse-dot 2s ease-in-out infinite}
  @keyframes km-pulse-dot{0%,100%{opacity:1}50%{opacity:.4}}
  .km-hero-title{
    font-family:var(--font-display);
    font-size:clamp(2.8rem,4.5vw,4.4rem);
    font-weight:900;line-height:1.05;color:var(--text-primary);
    margin-bottom:8px;letter-spacing:-.03em;
  }
  .km-hero-title .accent{color:var(--g600)}
  .km-hero-title em{font-style:italic}
  .km-hero-sub{font-size:.95rem;color:var(--text-secondary);line-height:1.8;max-width:480px;margin-bottom:36px;font-weight:400}
  .km-hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px}
  .km-btn-primary{
    padding:13px 28px;background:var(--g700);color:#fff;border:none;border-radius:var(--radius-sm);
    font-size:.86rem;font-weight:600;cursor:pointer;font-family:var(--font-body);
    display:flex;align-items:center;gap:8px;transition:all .25s;box-shadow:var(--shadow-green);
  }
  .km-btn-primary:hover{background:var(--g800);transform:translateY(-2px);box-shadow:0 12px 28px rgba(21,95,44,.28)}
  .km-btn-secondary{
    padding:13px 28px;background:transparent;color:var(--text-primary);
    border:1px solid var(--border);border-radius:var(--radius-sm);
    font-size:.86rem;font-weight:600;cursor:pointer;font-family:var(--font-body);
    display:flex;align-items:center;gap:8px;transition:all .25s;
  }
  .km-btn-secondary:hover{border-color:var(--g400);color:var(--g600);background:var(--surface2)}
  .km-hero-stats{display:flex;gap:0}
  .km-hs{padding:0 28px}
  .km-hs:first-child{padding-left:0}
  .km-hs+.km-hs{border-left:1px solid var(--border)}
  .km-hs-num{font-family:var(--font-display);font-size:2.1rem;font-weight:700;color:var(--g600);line-height:1}
  .km-hs-label{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;margin-top:3px}

  /* FARMER GRID */
  .km-farmer-grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:230px 190px;gap:10px}
  .km-farmer-img{position:relative;overflow:hidden;border-radius:var(--radius-lg)}
  .km-farmer-img.main{grid-column:1/-1;border-radius:var(--radius-xl)}
  .km-farmer-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
  .km-farmer-img:hover img{transform:scale(1.04)}
  .km-farmer-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,20,12,.55) 0%,transparent 55%)}
  .km-farmer-tag{
    position:absolute;bottom:10px;left:12px;
    background:rgba(255,255,255,.15);backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,.22);border-radius:100px;
    padding:3px 10px;font-size:.64rem;font-weight:700;color:#fff;
    letter-spacing:.08em;text-transform:uppercase;
  }

  /* FLOAT BADGES */
  .km-float-badge{
    position:absolute;background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius-md);padding:11px 15px;
    box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:10px;z-index:10;
  }
  .km-float-badge.b1{bottom:-16px;left:-20px}
  .km-float-badge.b2{top:-12px;right:-16px}
  .km-fb-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.85rem;color:#fff;flex-shrink:0}
  .km-fb-icon.green{background:linear-gradient(135deg,var(--g700),var(--g400))}
  .km-fb-icon.gold{background:linear-gradient(135deg,var(--gold),var(--gold-light))}
  .km-fb-text strong{display:block;font-size:.73rem;font-weight:700;color:var(--text-primary)}
  .km-fb-text span{font-size:.63rem;color:var(--text-muted)}

  /* ── TRUST BAR ── */
  .km-trust-bar{background:var(--surface2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:18px 4%}
  .km-trust-inner{max-width:1300px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:44px;flex-wrap:wrap}
  .km-trust-item{display:flex;align-items:center;gap:8px;color:var(--text-secondary);font-size:.78rem;font-weight:600}
  .km-trust-item i{color:var(--g500);font-size:.85rem}

  /* ── SECTIONS ── */
  .km-section{padding:96px 4%}
  .km-container{max-width:1300px;margin:0 auto}
  .km-sec-label{
    display:inline-block;background:var(--surface2);border:1px solid var(--border-green);
    color:var(--g600);font-size:.66rem;font-weight:700;text-transform:uppercase;
    letter-spacing:.13em;padding:4px 12px;border-radius:100px;margin-bottom:14px;
  }
  .km-sec-title{
    font-family:var(--font-display);
    font-size:clamp(1.9rem,3vw,2.75rem);
    font-weight:700;color:var(--text-primary);line-height:1.12;letter-spacing:-.025em;
  }
  .km-sec-title .accent{color:var(--g600)}
  .km-sec-title em{font-style:italic}
  .km-sec-sub{color:var(--text-secondary);font-size:.9rem;margin-top:12px;max-width:520px;line-height:1.8}
  .km-sec-header{text-align:center;margin-bottom:60px}
  .km-sec-header .km-sec-sub{margin-left:auto;margin-right:auto}

  /* ── PROBLEMS ── */
  .km-problems{background:var(--bg-alt)}
  .km-problems-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .km-prob-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
    padding:28px;transition:all .3s;position:relative;overflow:hidden;
  }
  .km-prob-card-accent{
    position:absolute;bottom:0;left:0;right:0;height:2px;
    background:linear-gradient(90deg,var(--g700),var(--g300));
    transform:scaleX(0);transform-origin:left;transition:transform .35s;
  }
  .km-prob-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg);border-color:var(--border-green)}
  .km-prob-card:hover .km-prob-card-accent{transform:scaleX(1)}
  .km-prob-icon{
    width:44px;height:44px;border-radius:10px;background:var(--surface2);
    border:1px solid var(--border);display:flex;align-items:center;justify-content:center;
    color:var(--g600);font-size:1rem;margin-bottom:16px;
  }
  .km-prob-card h3{font-size:.88rem;font-weight:600;color:var(--text-primary);margin-bottom:7px}
  .km-prob-card p{font-size:.78rem;color:var(--text-secondary);line-height:1.7}

  /* ── SOLUTION ── */
  .km-sol-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .km-sol-feats{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .km-sol-card{
    background:var(--bg-alt);border:1px solid var(--border);
    border-radius:var(--radius-md);padding:20px;transition:all .25s;
  }
  .km-sol-card:hover{background:var(--card-hover);border-color:var(--border-green)}
  .km-sol-icon{width:38px;height:38px;border-radius:9px;background:var(--g700);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.85rem;margin-bottom:12px}
  .km-sol-card h4{font-size:.83rem;font-weight:600;color:var(--text-primary);margin-bottom:5px}
  .km-sol-card p{font-size:.74rem;color:var(--text-secondary);line-height:1.65}
  .km-arch-box{background:var(--arch-bg);border:1px solid var(--border);border-radius:var(--radius-xl);padding:32px;box-shadow:var(--shadow-md)}
  .km-arch-top{text-align:center;padding-bottom:24px;margin-bottom:24px;border-bottom:1px solid var(--border)}
  .km-arch-logo-mark{width:68px;height:68px;border-radius:16px;overflow:hidden;margin:0 auto 10px;box-shadow:var(--shadow-green)}
  .km-arch-logo-mark img{width:100%;height:100%;object-fit:cover;border-radius:16px}
  .km-arch-top h3{font-family:var(--font-display);font-size:1.25rem;color:var(--text-primary);font-weight:700}
  .km-arch-top p{font-size:.72rem;color:var(--text-muted);margin-top:2px}
  .km-arch-items{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .km-arch-item{
    background:var(--surface);border:1px solid var(--border);border-radius:8px;
    padding:10px 12px;display:flex;align-items:center;gap:8px;
    font-size:.74rem;color:var(--text-secondary);font-weight:500;transition:all .2s;
  }
  .km-arch-item:hover{border-color:var(--border-green);color:var(--g600)}
  .km-arch-item i{color:var(--g500);font-size:.76rem;width:12px;text-align:center}

  /* ── PPT CAROUSEL ── */
  .km-ppt-section{background:var(--bg-alt)}
  .km-ppt-wrap{position:relative;max-width:980px;margin:0 auto}
  .km-ppt-frame{border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-xl);background:var(--surface);border:1px solid var(--border)}
  .km-ppt-aspect{aspect-ratio:16/9;position:relative;overflow:hidden}
  .km-ppt-track{display:flex;height:100%;transition:transform .55s cubic-bezier(.4,0,.2,1)}
  .km-ppt-slide{min-width:100%;height:100%;position:relative;flex-shrink:0}
  .km-ppt-slide img{width:100%;height:100%;object-fit:cover;display:block}
  .km-ppt-slide-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,18,10,.78) 0%,transparent 55%)}
  .km-ppt-caption{position:absolute;bottom:0;left:0;right:0;padding:28px 32px}
  .km-ppt-caption-num{
    display:inline-block;background:var(--g700);color:#fff;
    font-size:.65rem;font-weight:700;padding:3px 11px;border-radius:100px;
    letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px;
  }
  .km-ppt-caption h3{font-family:var(--font-display);font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:4px;line-height:1.2}
  .km-ppt-caption p{font-size:.78rem;color:rgba(255,255,255,.75);max-width:520px}
  .km-ppt-controls{
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 20px;background:var(--surface);border-top:1px solid var(--border);
  }
  .km-ppt-ctrl-left{display:flex;gap:6px}
  .km-ppt-ctrl-right{display:flex;align-items:center;gap:10px}
  .km-ppt-btn{
    width:34px;height:34px;border-radius:50%;background:var(--bg-alt);
    border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:.72rem;transition:all .2s;
  }
  .km-ppt-btn:hover{background:var(--g700);color:#fff;border-color:var(--g700)}
  .km-ppt-counter{font-family:var(--font-display);font-size:.95rem;color:var(--text-muted);font-weight:600}
  .km-ppt-dots{display:flex;gap:5px;flex-wrap:wrap;max-width:240px}
  .km-ppt-dot{
    width:6px;height:6px;border-radius:50%;background:var(--border);
    border:none;cursor:pointer;transition:all .25s;padding:0;
  }
  .km-ppt-dot.active{background:var(--g600);transform:scale(1.35)}
  .km-ppt-thumbs{display:grid;grid-template-columns:repeat(8,1fr);gap:7px;margin-top:14px;overflow-x:auto}
  .km-ppt-thumb{
    aspect-ratio:16/9;border-radius:6px;overflow:hidden;
    border:2px solid var(--border);cursor:pointer;transition:all .2s;opacity:.55;
  }
  .km-ppt-thumb:hover{opacity:.9;border-color:var(--g400)}
  .km-ppt-thumb.active{border-color:var(--g600);opacity:1}
  .km-ppt-thumb img{width:100%;height:100%;object-fit:cover;display:block}

  /* ── TECH STACK ── */
  .km-tech-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:12px}
  .km-tech-card{
    background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-md);
    padding:18px 10px;text-align:center;transition:all .25s;
    display:flex;flex-direction:column;align-items:center;gap:9px;
  }
  .km-tech-card:hover{border-color:var(--g400);box-shadow:var(--shadow-md);transform:translateY(-2px)}
  .km-tech-card img{width:36px;height:36px;object-fit:contain}
  .km-tech-card span{font-size:.68rem;font-weight:600;color:var(--text-muted);line-height:1.2}

  /* ── FEATURES ── */
  .km-feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .km-feat-card{
    background:var(--bg-alt);border:1px solid var(--border);
    border-radius:var(--radius-lg);padding:28px;transition:all .3s;
    display:flex;gap:18px;align-items:flex-start;
  }
  .km-feat-card:hover{border-color:var(--border-green);background:var(--card-hover);box-shadow:var(--shadow-md)}
  .km-feat-num{
    width:40px;height:40px;border-radius:10px;flex-shrink:0;
    background:var(--g700);color:#fff;
    font-family:var(--font-display);font-size:1rem;font-weight:700;
    display:flex;align-items:center;justify-content:center;
  }
  .km-feat-body h3{font-size:.88rem;font-weight:600;color:var(--text-primary);margin-bottom:6px}
  .km-feat-body p{font-size:.78rem;color:var(--text-secondary);line-height:1.7}

  /* ── IoT ── */
  .km-iot-section{background:var(--surface2)}
  .km-iot-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
  .km-iot-imgs{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .km-iot-img-main{grid-column:1/-1;border-radius:var(--radius-lg);overflow:hidden;height:200px}
  .km-iot-img-main img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
  .km-iot-img-main:hover img{transform:scale(1.03)}
  .km-iot-img-sm{border-radius:var(--radius-md);overflow:hidden;height:148px}
  .km-iot-img-sm img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
  .km-iot-img-sm:hover img{transform:scale(1.04)}
  .km-iot-spec{
    display:flex;gap:14px;align-items:flex-start;
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius-md);padding:16px;transition:all .2s;margin-top:12px;
  }
  .km-iot-spec:first-of-type{margin-top:16px}
  .km-iot-spec:hover{border-color:var(--border-green)}
  .km-iot-spec-icon{width:36px;height:36px;border-radius:8px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--g600);font-size:.86rem;flex-shrink:0}
  .km-iot-spec h4{font-size:.82rem;font-weight:600;color:var(--text-primary);margin-bottom:3px}
  .km-iot-spec p{font-size:.73rem;color:var(--text-secondary);line-height:1.55}

  /* ── IMPACT ── */
  .km-impact{
    background:linear-gradient(140deg,var(--g900) 0%,var(--g700) 100%);
    position:relative;overflow:hidden;
  }
  .km-impact::before{content:'';position:absolute;top:-30%;right:-10%;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.04);pointer-events:none}
  .km-impact::after{content:'';position:absolute;bottom:-20%;left:-5%;width:350px;height:350px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none}
  .km-impact .km-sec-label{background:rgba(255,255,255,.1);color:rgba(255,255,255,.9);border-color:rgba(255,255,255,.18)}
  .km-impact .km-sec-title{color:#fff}
  .km-impact .km-sec-sub{color:rgba(255,255,255,.6)}
  .km-impact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;position:relative;z-index:1}
  .km-impact-card{
    background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
    border-radius:var(--radius-lg);padding:28px;backdrop-filter:blur(8px);transition:all .3s;
  }
  .km-impact-card:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2);transform:translateY(-2px)}
  .km-impact-icon{font-size:1.5rem;margin-bottom:12px;display:block}
  .km-impact-card h3{font-size:.86rem;font-weight:600;color:#fff;margin-bottom:7px}
  .km-impact-card p{font-size:.77rem;color:rgba(255,255,255,.62);line-height:1.7}

  /* ── WORKFLOW ── */
  .km-wf-steps{max-width:720px;margin:0 auto}
  .km-wf-step{display:flex;gap:20px;padding:24px 0;border-bottom:1px solid var(--border);align-items:flex-start}
  .km-wf-step:last-child{border-bottom:none}
  .km-wf-left{display:flex;flex-direction:column;align-items:center}
  .km-wf-circle{
    width:44px;height:44px;border-radius:50%;background:var(--g700);color:#fff;
    flex-shrink:0;font-family:var(--font-display);font-size:1rem;font-weight:700;
    display:flex;align-items:center;justify-content:center;
  }
  .km-wf-line{width:1px;flex:1;min-height:20px;background:var(--border);margin-top:8px}
  .km-wf-body{padding-top:8px}
  .km-wf-body h3{font-size:.88rem;font-weight:600;color:var(--text-primary);margin-bottom:5px}
  .km-wf-body p{font-size:.78rem;color:var(--text-secondary);line-height:1.7}
  .km-wf-chip{
    display:inline-block;background:var(--surface2);border:1px solid var(--border-green);
    color:var(--chip-color);font-size:.63rem;font-weight:700;padding:3px 10px;
    border-radius:100px;margin-top:8px;text-transform:uppercase;letter-spacing:.07em;
  }

  /* ── FUTURE ROADMAP ── */
  .km-future{background:var(--bg-alt)}
  .km-future-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .km-future-card{
    background:var(--surface);border:1px solid var(--border);
    border-radius:var(--radius-lg);padding:28px;
    transition:all .3s;display:flex;flex-direction:column;gap:12px;
  }
  .km-future-card:hover{border-color:var(--border-green);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
  .km-future-card-top{display:flex;align-items:flex-start;justify-content:space-between}
  .km-future-icon{width:42px;height:42px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--g600);font-size:.95rem}
  .km-future-num{font-family:var(--font-display);font-size:2rem;font-weight:700;color:var(--border-green);line-height:1}
  .km-future-card h3{font-size:.86rem;font-weight:600;color:var(--text-primary)}
  .km-future-card p{font-size:.77rem;color:var(--text-secondary);line-height:1.7}

  /* ── TESTIMONIALS ── */
  .km-testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .km-testi-card{
    background:var(--bg-alt);border:1px solid var(--border);
    border-radius:var(--radius-xl);padding:32px;transition:all .3s;
  }
  .km-testi-card:hover{border-color:var(--border-green);box-shadow:var(--shadow-md)}
  .km-tq{font-family:var(--font-display);font-size:2.8rem;color:var(--g300);line-height:1;margin-bottom:12px}
  .km-testi-text{font-size:.88rem;color:var(--text-secondary);line-height:1.85;font-style:italic;margin-bottom:22px}
  .km-testi-author{display:flex;align-items:center;gap:12px}
  .km-t-avatar{
    width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,var(--g700),var(--g400));
    color:#fff;display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:.95rem;flex-shrink:0;
  }
  .km-t-name strong{display:block;font-size:.82rem;color:var(--text-primary)}
  .km-t-name span{font-size:.72rem;color:var(--text-muted)}

  /* ── CTA ── */
  .km-cta-section{background:var(--bg-alt)}
  .km-cta-box{
    background:linear-gradient(140deg,var(--g800) 0%,var(--g600) 100%);
    border-radius:var(--radius-2xl);padding:80px 48px;text-align:center;
    position:relative;overflow:hidden;box-shadow:var(--shadow-xl);
  }
  .km-cta-box::before{content:'';position:absolute;top:-40%;right:-5%;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,.04)}
  .km-cta-box h2{font-family:var(--font-display);font-size:clamp(2rem,3.5vw,2.8rem);color:#fff;font-weight:700;margin-bottom:14px;letter-spacing:-.02em}
  .km-cta-box p{color:rgba(255,255,255,.68);font-size:.93rem;margin-bottom:32px;max-width:440px;margin-left:auto;margin-right:auto;line-height:1.75}
  .km-cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .km-btn-cta-w{padding:13px 28px;background:#fff;color:var(--g800);border:none;border-radius:var(--radius-sm);font-size:.86rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:all .25s;display:flex;align-items:center;gap:8px}
  .km-btn-cta-w:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.18)}
  .km-btn-cta-o{padding:13px 28px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:var(--radius-sm);font-size:.86rem;font-weight:600;cursor:pointer;font-family:var(--font-body);transition:all .25s;display:flex;align-items:center;gap:8px}
  .km-btn-cta-o:hover{border-color:rgba(255,255,255,.75);background:rgba(255,255,255,.08)}

  /* ── FOOTER ── */
  .km-footer{background:var(--g900);padding:64px 4% 28px}
  .km-footer-top{max-width:1300px;margin:0 auto;display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
  .km-footer-brand-desc{color:rgba(255,255,255,.4);font-size:.78rem;line-height:1.8;margin-top:14px;max-width:270px}
  .km-footer-socials{display:flex;gap:7px;margin-top:18px}
  .km-fsoc{width:32px;height:32px;border-radius:7px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.45);display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:.78rem;transition:all .2s}
  .km-fsoc:hover{background:var(--g600);border-color:var(--g500);color:#fff}
  .km-footer-col h4{font-size:.76rem;font-weight:700;color:rgba(255,255,255,.85);margin-bottom:16px;text-transform:uppercase;letter-spacing:.09em}
  .km-footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
  .km-footer-col ul li a{text-decoration:none;color:rgba(255,255,255,.38);font-size:.77rem;transition:color .2s}
  .km-footer-col ul li a:hover{color:var(--g300)}
  .km-footer-bottom{max-width:1300px;margin:0 auto;border-top:1px solid rgba(255,255,255,.07);padding-top:22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
  .km-footer-bottom p,.km-footer-bottom span{font-size:.72rem;color:rgba(255,255,255,.28)}
  .km-footer-bottom strong{color:var(--g400)}
  .km-f-logo{display:flex;align-items:center;gap:9px;text-decoration:none}
  .km-f-logo-mark{width:36px;height:36px;border-radius:8px;overflow:hidden}
  .km-f-logo-mark img{width:100%;height:100%;object-fit:cover}
  .km-f-logo-name{font-family:var(--font-display);font-size:1.05rem;font-weight:700;color:#fff}

  /* ── REVEAL ANIMATION ── */
  .km-reveal{opacity:0;transform:translateY(24px);transition:opacity .65s ease,transform .65s ease}
  .km-reveal.visible{opacity:1;transform:none}
  .km-reveal.d1{transition-delay:.1s}
  .km-reveal.d2{transition-delay:.2s}
  .km-reveal.d3{transition-delay:.3s}

  /* ── DASHBOARD APP WRAPPER ── */
  .km-app{min-height:100vh;background:var(--bg);position:relative;font-family:var(--font-body)}
  .km-main{position:relative;z-index:1}

  /* ── RESPONSIVE ── */
  @media(max-width:1100px){
    .km-tech-grid{grid-template-columns:repeat(6,1fr)}
    .km-ppt-thumbs{grid-template-columns:repeat(8,1fr)}
  }
  @media(max-width:900px){
    .km-hero-inner{grid-template-columns:1fr;gap:44px}
    .km-hero-bg-shape{display:none}
    .km-hero-right{max-width:520px;margin:0 auto;width:100%}
    .km-sol-grid,.km-iot-grid{grid-template-columns:1fr;gap:40px}
    .km-problems-grid,.km-impact-grid,.km-future-grid{grid-template-columns:repeat(2,1fr)}
    .km-feat-grid{grid-template-columns:1fr}
    .km-footer-top{grid-template-columns:1fr 1fr;gap:28px}
    .km-tech-grid{grid-template-columns:repeat(4,1fr)}
    .km-testi-grid{grid-template-columns:1fr;max-width:580px;margin:0 auto}
    .km-nav-links{display:none}
    .km-nav-cta .km-btn-ghost,.km-nav-cta .km-btn-nav-cta{display:none}
    .km-ham{display:flex}
  }
  @media(max-width:640px){
    .km-section{padding:64px 5%}
    .km-hero{padding:90px 5% 52px}
    .km-hero-actions{flex-direction:column}
    .km-btn-primary,.km-btn-secondary{justify-content:center}
    .km-problems-grid,.km-future-grid,.km-impact-grid{grid-template-columns:1fr}
    .km-tech-grid{grid-template-columns:repeat(3,1fr)}
    .km-sol-feats{grid-template-columns:1fr}
    .km-cta-box{padding:44px 22px}
    .km-cta-btns{flex-direction:column}
    .km-btn-cta-w,.km-btn-cta-o{justify-content:center}
    .km-footer-top{grid-template-columns:1fr}
    .km-footer-bottom{flex-direction:column;text-align:center}
    .km-float-badge{display:none}
    .km-arch-items{grid-template-columns:1fr}
    .km-iot-imgs{grid-template-columns:1fr}
    .km-iot-img-main{grid-column:1}
    .km-trust-inner{gap:20px}
    .km-ppt-thumbs{grid-template-columns:repeat(4,1fr)}
    .km-farmer-grid{grid-template-rows:180px 140px}
    .km-hero-stats{gap:0}
    .km-hs{padding:0 16px}
    .km-ppt-caption h3{font-size:1.1rem}
    .km-ppt-caption p{display:none}
    .km-ham{display:flex}
    .km-nav-cta .km-theme-toggle{display:flex}
  }
`;

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const PPT_SLIDES = [
  { img: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=85", num: "Slide 01 — Introduction",    title: "Kisan Mitra Platform Overview",          desc: "Bridging the gap between Indian farmers and modern technology with 5G + AI + IoT." },
  { img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=85", num: "Slide 02 — Problem Statement",title: "The Farmer's Daily Struggle",             desc: "143 million Indian farmers lack access to real-time data, fair markets, and financial support." },
  { img: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=85", num: "Slide 03 — Disease Detection", title: "AI-Powered Leaf Disease Detection",        desc: "CNN model trained on 50,000+ leaf images for instant disease identification and treatment." },
  { img: "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=1200&q=85", num: "Slide 04 — IoT Hardware",      title: "ESP-32 Smart Sensor Network",            desc: "NPK + pH + moisture + temperature sensors with LoRa 15km+ transmission range." },
  { img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=85", num: "Slide 05 — Marketplace",       title: "Zero Middlemen Direct Market",           desc: "Farmers earn 3x more by connecting directly to consumers and businesses." },
  { img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=85", num: "Slide 06 — Farm to Table",     title: "Fresh Produce Supply Chain",             desc: "Traceable, certified produce from registered farms reaching consumers within 24 hours." },
  { img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=85", num: "Slide 07 — Sustainability",    title: "Climate-Smart Farming Goals",            desc: "Data-driven decisions reduce chemical usage by 35% and increase water efficiency." },
  { img: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1200&q=85", num: "Slide 08 — 5G Connectivity",   title: "Rural 5G Network Deployment",            desc: "Ultra-low latency rural hotspots enabling real-time sensor data and AI processing." },
  { img: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1200&q=85", num: "Slide 09 — Tech Architecture", title: "System Architecture Deep Dive",          desc: "React + Node.js + Python AI + MongoDB + Socket.IO — a full-stack agri-tech system." },
  { img: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&q=85", num: "Slide 10 — Subsidy Module",    title: "Digital Subsidy Verification System",    desc: "Step-by-step guided workflow with photo proof verification and instant e-certificates." },
  { img: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1200&q=85", num: "Slide 11 — AI Models",         title: "XGBoost + Random Forest Models",         desc: "92.4% accuracy in crop recommendation using soil & climate parameters." },
  { img: "https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=1200&q=85", num: "Slide 12 — Drone Integration", title: "Aerial Crop Monitoring Network",         desc: "Drone-based field analysis for large farms — NDVI mapping and aerial disease scouting." },
  { img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200&q=85", num: "Slide 13 — Multi-Crop Support",title: "All Crops, All Seasons",                 desc: "Covers 60+ crops — from rice, wheat, cotton to spices and vegetables." },
  { img: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&q=85", num: "Slide 14 — Rural Impact",       title: "Transforming 600,000 Villages",          desc: "Target: 10 million farmers onboarded across India by 2028 with measurable income uplift." },
  { img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=85", num: "Slide 15 — Future Roadmap",    title: "Blockchain + Satellite + AI Scale",      desc: "Phase 2: Autonomous farming, cold storage network, agri-finance, and blockchain supply chain." },
  { img: "https://images.unsplash.com/photo-1439127989242-c3749a012eac?w=1200&q=85", num: "Slide 16 — Vision 2030",       title: "Tomorrow's Agriculture, Today",          desc: "Where 5,000 years of Indian farming tradition meets the intelligence of tomorrow." },
];

const THUMB_IMGS = PPT_SLIDES.map(s => s.img.replace("w=1200", "w=200").replace("q=85", "q=70"));

/* ═══════════════════════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════════════════════ */
const LoadingScreen: React.FC = () => (
  <div className="km-loading">
    <div className="km-loading-logo">
      <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&q=90" alt="Kisan Mitra" />
    </div>
    <div className="km-loading-text">Kisan Mitra</div>
    <div className="km-loading-sub">Loading your farm dashboard…</div>
    <div className="km-loading-bar"><div className="km-loading-fill" /></div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   PPT CAROUSEL
═══════════════════════════════════════════════════════════ */
const PPTCarousel: React.FC = () => {
  const [cur, setCur] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total = PPT_SLIDES.length;

  const goTo = useCallback((n: number) => {
    const next = ((n % total) + total) % total;
    setCur(next);
    setTimeout(() => {
      const el = thumbsRef.current?.children[next] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }, 50);
  }, [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(cur + 1);
      if (e.key === "ArrowLeft")  goTo(cur - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cur, goTo]);

  const slide = PPT_SLIDES[cur];

  return (
    <div className="km-ppt-wrap km-reveal">
      <div className="km-ppt-frame">
        <div className="km-ppt-aspect">
          <div className="km-ppt-track" style={{ transform: `translateX(-${cur * 100}%)` }}>
            {PPT_SLIDES.map((s, i) => (
              <div key={i} className="km-ppt-slide">
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="km-ppt-slide-overlay" />
                <div className="km-ppt-caption">
                  <div className="km-ppt-caption-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="km-ppt-controls">
          <div className="km-ppt-ctrl-left">
            <button className="km-ppt-btn" onClick={() => goTo(cur - 1)} title="Previous">
              <i className="fas fa-chevron-left" />
            </button>
            <button className="km-ppt-btn" onClick={() => goTo(cur + 1)} title="Next">
              <i className="fas fa-chevron-right" />
            </button>
          </div>
          <div className="km-ppt-dots">
            {PPT_SLIDES.map((_, i) => (
              <button key={i} className={`km-ppt-dot${i === cur ? " active" : ""}`} onClick={() => goTo(i)} />
            ))}
          </div>
          <div className="km-ppt-ctrl-right">
            <span className="km-ppt-counter">
              {String(cur + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
      <div className="km-ppt-thumbs" ref={thumbsRef}>
        {THUMB_IMGS.map((src, i) => (
          <div key={i} className={`km-ppt-thumb${i === cur ? " active" : ""}`} onClick={() => goTo(i)}>
            <img src={src} alt={`Slide ${i + 1}`} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
interface HomePageProps { theme: string; onToggleTheme: () => void; }

const HomePage: React.FC<HomePageProps> = ({ theme, onToggleTheme }) => {
  const navRef = useRef<HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Nav scroll shadow
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".km-reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setDrawerOpen(false);
  };

  const navLinks = [
    { href: "problems",     label: "Problem" },
    { href: "solution",     label: "Solution" },
    { href: "features",     label: "Features" },
    { href: "ppt-slides",   label: "Our Idea" },
    { href: "iot",          label: "IoT Stack" },
    { href: "impact",       label: "Impact" },
    { href: "future",       label: "Future" },
  ];

  return (
    <>
      {/* NAV */}
      <nav className="km-nav" ref={navRef} id="mainNav">
        <div className="km-nav-inner">
          <button className="km-nav-logo" onClick={() => scrollTo("home")}>
            <div className="km-logo-mark">
              <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100&q=90" alt="Kisan Mitra Logo" />
            </div>
            <div className="km-logo-text">
              <span className="km-logo-name">Kisan Mitra</span>
              <span className="km-logo-tag">For Farmer Development</span>
            </div>
          </button>

          <div className="km-nav-links">
            {navLinks.map((l) => (
              <a key={l.href} onClick={() => scrollTo(l.href)} style={{ cursor: "pointer" }}>{l.label}</a>
            ))}
          </div>

          <div className="km-nav-cta">
            <button className="km-theme-toggle" onClick={onToggleTheme} title="Toggle theme">
              <div className="km-toggle-thumb">
                <i className={`fas ${theme === "dark" ? "fa-moon" : "fa-sun"}`} />
              </div>
            </button>
            <button className="km-btn-ghost" onClick={() => location.href = "./login.html"}>Login</button>
            <button className="km-btn-nav-cta" onClick={() => location.href = "./login.html"}>
              <i className="fas fa-leaf" /> Get Started
            </button>
            <button className="km-ham" onClick={() => setDrawerOpen((o) => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`km-drawer${drawerOpen ? " open" : ""}`}>
        {navLinks.map((l) => (
          <a key={l.href} onClick={() => scrollTo(l.href)}>{l.label === "ppt-slides" ? "Our Idea (PPT)" : l.label}</a>
        ))}
        <div className="km-drawer-btns">
          <button className="km-drawer-btn1" onClick={() => location.href = "./login.html"}>Login</button>
          <button className="km-drawer-btn2" onClick={() => location.href = "./login.html"}>Register Free</button>
        </div>
      </div>

      {/* HERO */}
      <section className="km-hero" id="home">
        <div className="km-hero-bg-shape" />
        <div className="km-hero-dots" />
        <div className="km-hero-inner">
          {/* LEFT */}
          <div className="km-reveal">
            <div className="km-hero-badge"><div className="km-badge-dot" />&nbsp;5G + AI + IoT Platform</div>
            <h1 className="km-hero-title">
              Smart Farming<br />for Every <span className="accent"><em>Kisan</em></span>
            </h1>
            <p className="km-hero-sub">
              An integrated platform combining 5G connectivity, AI intelligence, and IoT sensors —
              empowering Indian farmers with real-time soil insights, disease detection, direct
              market access, and hassle-free subsidies.
            </p>
            <div className="km-hero-actions">
              <button className="km-btn-primary" onClick={() => location.href = "./login.html"}>
                <i className="fas fa-seedling" /> Start Farming Smart
              </button>
              <button className="km-btn-secondary" onClick={() => scrollTo("solution")}>
                <i className="fas fa-play-circle" /> See How It Works
              </button>
            </div>
            <div className="km-hero-stats">
              {[
                { num: "5+", label: "Core Modules" },
                { num: "AI", label: "Powered Engine" },
                { num: "5G", label: "Real-Time Data" },
                { num: "∞",  label: "Scalable" },
              ].map((s) => (
                <div key={s.num} className="km-hs">
                  <div className="km-hs-num">{s.num}</div>
                  <div className="km-hs-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="km-hero-right km-reveal d2" style={{ position: "relative" }}>
            <div className="km-farmer-grid">
              <div className="km-farmer-img main">
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=85" alt="Indian farmer in field" />
                <div className="km-farmer-overlay" />
                <div className="km-farmer-tag">🌾 Farmer First</div>
              </div>
              <div className="km-farmer-img">
                <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=85" alt="Smart farming" />
                <div className="km-farmer-overlay" />
                <div className="km-farmer-tag">🤖 AI Smart</div>
              </div>
              <div className="km-farmer-img">
                <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=85" alt="Crop health" />
                <div className="km-farmer-overlay" />
                <div className="km-farmer-tag">🔬 Crop Health</div>
              </div>
              <div className="km-farmer-img">
                <img src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=85" alt="Farm to market" />
                <div className="km-farmer-overlay" />
                <div className="km-farmer-tag">🏪 Direct Market</div>
              </div>
            </div>
            <div className="km-float-badge b1">
              <div className="km-fb-icon green"><i className="fas fa-microscope" /></div>
              <div className="km-fb-text"><strong>Disease Detected</strong><span>Cercospora Leaf Spot — treated</span></div>
            </div>
            <div className="km-float-badge b2">
              <div className="km-fb-icon gold"><i className="fas fa-chart-line" /></div>
              <div className="km-fb-text"><strong>Yield +32%</strong><span>AI-optimized crop planning</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="km-trust-bar">
        <div className="km-trust-inner">
          {[
            { icon: "fa-shield-alt",     label: "Government Certified" },
            { icon: "fa-satellite-dish", label: "5G Enabled" },
            { icon: "fa-brain",          label: "AI-Powered Engine" },
            { icon: "fa-language",       label: "12+ Indian Languages" },
            { icon: "fa-lock",           label: "Secure & Private" },
            { icon: "fa-mobile-alt",     label: "Works Offline Too" },
          ].map((t) => (
            <div key={t.icon} className="km-trust-item"><i className={`fas ${t.icon}`} /> {t.label}</div>
          ))}
        </div>
      </div>

      {/* PROBLEMS */}
      <section className="km-section km-problems" id="problems">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">The Challenge</span>
            <h2 className="km-sec-title">Multiple Challenges,<br /><span className="accent">No Unified Solution</span></h2>
            <p className="km-sec-sub">Indian farmers face fragmented systems, late disease detection, exploitative middlemen and complex subsidies — all at once.</p>
          </div>
          <div className="km-problems-grid">
            {[
              { icon: "fa-question-circle", title: "Guess-Based Cultivation",    desc: "Most farmers rely on tradition instead of real-time soil and climate data, leading to low productivity and poor crop planning.", delay: "" },
              { icon: "fa-bug",             title: "Late Disease Detection",      desc: "Diseases are identified only after visible damage, causing huge yield loss and increased pesticide costs across seasons.", delay: "d1" },
              { icon: "fa-handshake-slash", title: "Middlemen Exploitation",      desc: "Farmers sell through intermediaries at very low prices while consumers pay high retail rates — profits lost in transit.", delay: "d2" },
              { icon: "fa-file-alt",        title: "Complex Subsidy System",      desc: "Government schemes exist but farmers face paperwork, lack of awareness, and delays — leading to low adoption and misuse.", delay: "" },
              { icon: "fa-puzzle-piece",    title: "No Unified Platform",         desc: "Data, guidance, disease support, subsidies, and market access exist in silos — making farming inefficient and fragmented.", delay: "d1" },
              { icon: "fa-wifi",            title: "Rural Digital Divide",        desc: "Limited internet connectivity and low digital literacy keep millions of farmers out of the modern agricultural ecosystem.", delay: "d2" },
            ].map((c, i) => (
              <div key={i} className={`km-prob-card km-reveal ${c.delay}`}>
                <div className="km-prob-icon"><i className={`fas ${c.icon}`} /></div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="km-prob-card-accent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="km-section" id="solution" style={{ background: "var(--bg)" }}>
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Our Solution</span>
            <h2 className="km-sec-title">Everything In One<br /><span className="accent">Unified Platform</span></h2>
            <p className="km-sec-sub">5G + AI + IoT — marketplace and subsidy support all working together seamlessly for the Indian farmer.</p>
          </div>
          <div className="km-sol-grid">
            <div className="km-sol-feats km-reveal">
              {[
                { icon: "fa-brain",          title: "AI Smart Cultivation",  desc: "IoT sensors detect soil NPK, pH, moisture & weather. AI recommends optimal crop, timing, and soil treatment." },
                { icon: "fa-camera",         title: "AI Disease Detection",  desc: "Upload leaf images for real-time CNN-based disease diagnosis and treatment suggestions." },
                { icon: "fa-store",          title: "Direct Marketplace",    desc: "Built-in farmer-to-consumer marketplace eliminates middlemen and maximizes profit margins." },
                { icon: "fa-money-check-alt",title: "Guided Subsidies",      desc: "Step-by-step AI guidance with digital POC verification for transparent and hassle-free subsidy claims." },
                { icon: "fa-language",       title: "Multilingual AI Bot",   desc: "Voice/text support in local languages helps low-digital-literacy farmers access guidance." },
                { icon: "fa-truck",          title: "Flexible Logistics",    desc: "Self-pickup or home delivery options ensure smooth last-mile connectivity within the farmer ecosystem." },
              ].map((s, i) => (
                <div key={i} className="km-sol-card">
                  <div className="km-sol-icon"><i className={`fas ${s.icon}`} /></div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="km-reveal d2">
              <div className="km-arch-box">
                <div className="km-arch-top">
                  <div className="km-arch-logo-mark">
                    <img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&q=90" alt="Kisan Mitra" />
                  </div>
                  <h3>Kisan Mitra</h3>
                  <p>Soil → Sale Ecosystem</p>
                </div>
                <div className="km-arch-items">
                  {[
                    { icon: "fa-microchip",      label: "IoT Sensors" },
                    { icon: "fa-cloud",           label: "AI Cloud Engine" },
                    { icon: "fa-broadcast-tower", label: "5G + LoRa" },
                    { icon: "fa-database",        label: "MongoDB Atlas" },
                    { icon: "fa-mobile-alt",      label: "React Frontend" },
                    { icon: "fa-shield-alt",      label: "Subsidy POC" },
                    { icon: "fa-robot",           label: "Bhashini NLP" },
                    { icon: "fa-exchange-alt",    label: "REST + Socket.IO" },
                  ].map((a) => (
                    <div key={a.label} className="km-arch-item"><i className={`fas ${a.icon}`} /> {a.label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PPT SLIDES */}
      <section className="km-section km-ppt-section" id="ppt-slides">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Our Idea</span>
            <h2 className="km-sec-title">Kisan Mitra Vision<br /><span className="accent">Slide by Slide</span></h2>
            <p className="km-sec-sub">Explore all 16 key concepts behind our smart agriculture platform — from problem to prototype.</p>
          </div>
          <PPTCarousel />
        </div>
      </section>

      {/* FEATURES */}
      <section className="km-section" id="features" style={{ background: "var(--bg)" }}>
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Key Features</span>
            <h2 className="km-sec-title">Reimagining Farming with<br /><span className="accent">Intelligent Solutions</span></h2>
          </div>
          <div className="km-feat-grid">
            {[
              { num: "01", title: "AI-Powered Smart Cultivation",        desc: "IoT sensor data and ML models (XGBoost + Random Forest) recommend the right crop, optimal conditions, and soil improvements — increasing yield and reducing risk.", delay: "" },
              { num: "02", title: "Real-Time Crop Health Monitoring",    desc: "Upload images for instant CNN-based disease detection and treatment suggestions, ensuring early intervention and minimizing crop losses.", delay: "d1" },
              { num: "03", title: "Guided Farming & Subsidy Integration",desc: "Step-by-step cultivation guidance aligned with government schemes, along with digital proof verification for transparent subsidy access.", delay: "" },
              { num: "04", title: "Direct Marketplace with Logistics",   desc: "Connects farmers directly to consumers and businesses, eliminating middlemen, with flexible delivery options to maximize farmer profits.", delay: "d1" },
              { num: "05", title: "Multilingual & Data-Driven Support",  desc: "Multilingual AI assistant and insights dashboard, making the platform accessible while helping farmers make informed, data-driven decisions.", delay: "" },
              { num: "06", title: "Integrated Financial & Advisory",     desc: "Connects farmers with loans, insurance, and expert guidance based on their verified farming data, improving financial access and reducing risk.", delay: "d1" },
            ].map((f) => (
              <div key={f.num} className={`km-feat-card km-reveal ${f.delay}`}>
                <div className="km-feat-num">{f.num}</div>
                <div className="km-feat-body"><h3>{f.title}</h3><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IOT */}
      <section className="km-section km-iot-section" id="iot">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">IoT Hardware Stack</span>
            <h2 className="km-sec-title">Physical Intelligence<br /><span className="accent">In Your Field</span></h2>
            <p className="km-sec-sub">Smart sensors gather soil and climate data 24/7, transmitted via 5G and LoRa to our AI cloud for instant analysis.</p>
          </div>
          <div className="km-iot-grid">
            <div className="km-iot-imgs km-reveal">
              <div className="km-iot-img-main"><img src="https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?w=900&q=80" alt="IoT sensors" /></div>
              <div className="km-iot-img-sm"><img src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=500&q=80" alt="Sensor board" /></div>
              <div className="km-iot-img-sm"><img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80" alt="Smart agri" /></div>
            </div>
            <div className="km-reveal d2">
              <span className="km-sec-label">Sensor Specifications</span>
              <h2 className="km-sec-title" style={{ fontSize: "1.85rem" }}>ESP-32 + LoRa<br /><span className="accent">Sensor Platform</span></h2>
              <p className="km-sec-sub" style={{ marginLeft: 0 }}>Military-grade sensors collect hyper-local soil intelligence and stream it to the Kisan Mitra cloud in real-time.</p>
              {[
                { icon: "fa-vial",              title: "NPK Soil Sensor",                    desc: "Measures Nitrogen, Phosphorus & Potassium levels with ±2% accuracy for precision fertilizer recommendations." },
                { icon: "fa-tint",              title: "Moisture & pH Sensor",               desc: "Real-time soil moisture and pH monitoring to optimize irrigation schedules and detect soil imbalances." },
                { icon: "fa-thermometer-half",  title: "Temperature & Humidity DHT22",       desc: "Hyper-local microclimate data collection for weather-aware crop planning and disease risk assessment." },
                { icon: "fa-broadcast-tower",   title: "LoRa Long Range Transmission",       desc: "15km+ range data transmission with ultra-low power consumption — works even without mobile network." },
              ].map((s) => (
                <div key={s.title} className="km-iot-spec">
                  <div className="km-iot-spec-icon"><i className={`fas ${s.icon}`} /></div>
                  <div><h4>{s.title}</h4><p>{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="km-section km-problems" id="tech">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Tech Stack</span>
            <h2 className="km-sec-title">The Digital Backbone of<br /><span className="accent">Smart Agriculture</span></h2>
          </div>
          <div className="km-tech-grid km-reveal">
            {[
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",          label: "React JS" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",          label: "HTML5 / CSS3" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg",            label: "Tailwind CSS" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",        label: "Node.js" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",      label: "Express JS", style: { filter: "invert(0.4) sepia(1) saturate(2) hue-rotate(90deg)" } },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg",    label: "Socket.IO" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",      label: "MongoDB" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",        label: "Python" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",      label: "Random Forest" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/6/69/XGBoost_logo.png",                 label: "XGBoost" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",label: "CNN / TF" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",        label: "Docker" },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",        label: "Google Translate" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Espressif_Systems_logo.svg/320px-Espressif_Systems_logo.svg.png", label: "ESP-32 IoT", style: { width: 60, height: 28, objectFit: "contain" as const } },
              { src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",        label: "GitHub" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Vercel_logo_black.svg/512px-Vercel_logo_black.svg.png", label: "Vercel", style: { filter: "invert(0.5) sepia(1) saturate(3) hue-rotate(90deg)" } },
            ].map((t) => (
              <div key={t.label} className="km-tech-card">
                <img src={t.src} alt={t.label} style={t.style} />
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="km-section km-impact" id="impact">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Impact</span>
            <h2 className="km-sec-title">Creating Sustainable Impact<br />Across Rural Communities</h2>
            <p className="km-sec-sub">Kisan Mitra drives both societal transformation and industry-level innovation.</p>
          </div>
          <div className="km-impact-grid km-reveal">
            {[
              { icon: "📢", title: "Farmer Empowerment",           desc: "Real-time info on government schemes, subsidies, and deadlines — reducing dependency on middlemen." },
              { icon: "📉", title: "Reduction in Farmer Distress", desc: "Timely insights on crops, pricing, and financial support help lower debt burden and prevent extreme situations." },
              { icon: "🌐", title: "Bridging Rural Digital Divide", desc: "Rural hotspot creation and 5G-enabled connectivity bring remote farmers into the digital ecosystem." },
              { icon: "📈", title: "Boost to Agri-Tech Industry",  desc: "Encourages innovation in IoT devices, AI-based agriculture tools, and smart farming solutions nationwide." },
              { icon: "📶", title: "Telecom Industry Expansion",   desc: "Increased demand for rural connectivity drives growth in 5G infrastructure and network services." },
              { icon: "🚚", title: "Supply Chain Optimization",    desc: "Digital tracking and direct farmer-to-market linkage improve efficiency and reduce logistics costs." },
            ].map((c) => (
              <div key={c.title} className="km-impact-card">
                <span className="km-impact-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="km-section" id="workflow" style={{ background: "var(--bg)" }}>
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">System Workflow</span>
            <h2 className="km-sec-title">End-to-End Smart<br /><span className="accent">Agriculture Journey</span></h2>
          </div>
          <div className="km-wf-steps km-reveal">
            {[
              { n: "1", title: "Register & Deploy Sensors",              desc: "Farmer registers on the platform, deploys IoT soil sensors (NPK, pH, moisture, temperature) and receives an AI-based crop recommendation.", chip: "Farmer Onboarding", last: false },
              { n: "2", title: "AI Cultivation & Disease Monitoring",    desc: "Real-time soil telemetry analyzed by XGBoost + Neural Network models. Leaf images processed by CNN for disease diagnosis and treatment suggestions.", chip: "Smart Farming", last: false },
              { n: "3", title: "Subsidy Application & Verification",     desc: "Farmers follow guided steps, upload proof-of-steps photos. Admin validates data and issues the digital subsidy certificate seamlessly.", chip: "Government Schemes", last: false },
              { n: "4", title: "List Products on Marketplace",           desc: "Farmers upload harvested products with region-wise pricing data. Consumers browse and buy directly from nearby farms at fair prices.", chip: "Direct Market", last: false },
              { n: "5", title: "Delivery & Revenue Tracking",            desc: "Flexible doorstep or self-pickup delivery options. Farmers track revenue, orders, and growth through their personal dashboard.", chip: "Last Mile & Analytics", last: true },
            ].map((s) => (
              <div key={s.n} className="km-wf-step">
                <div className="km-wf-left">
                  <div className="km-wf-circle">{s.n}</div>
                  {!s.last && <div className="km-wf-line" />}
                </div>
                <div className="km-wf-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="km-wf-chip">{s.chip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE ROADMAP */}
      <section className="km-section km-future" id="future">
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Future Roadmap</span>
            <h2 className="km-sec-title">Building the Future of<br /><span className="accent">Scalable Agriculture</span></h2>
          </div>
          <div className="km-future-grid km-reveal">
            {[
              { icon: "fa-robot",    num: "01", title: "Autonomous Farming Systems",     desc: "Deploy smart tractors, robotic weeders, and automated harvesters controlled via 5G-enabled networks for precision agriculture." },
              { icon: "fa-snowflake",num: "02", title: "Decentralized Cold Storage",     desc: "Low-cost, solar-powered micro cold storage units at village level to solve food preservation and reduce post-harvest losses." },
              { icon: "fa-university",num:"03", title: "Agri-Finance Integration",       desc: "Collaborate with banks and agri-companies for farmers to access loans and buy essentials on one platform." },
              { icon: "fa-link",     num: "04", title: "Blockchain Supply Chain",        desc: "Ensure transparency and fair pricing by tracking produce from farm to market, reducing middlemen dependency permanently." },
              { icon: "fa-chart-bar",num: "05", title: "Smart Market Intelligence",      desc: "Real-time price prediction and demand analysis to help farmers decide the best time and place to sell crops profitably." },
              { icon: "fa-satellite",num: "06", title: "Satellite + IoT + 5G",           desc: "Combine satellite imagery with IoT sensor data for large-scale monitoring, soil mapping, and regional climate analysis." },
            ].map((c) => (
              <div key={c.num} className="km-future-card">
                <div className="km-future-card-top">
                  <div className="km-future-icon"><i className={`fas ${c.icon}`} /></div>
                  <div className="km-future-num">{c.num}</div>
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="km-section" id="testimonials" style={{ background: "var(--bg)" }}>
        <div className="km-container">
          <div className="km-sec-header km-reveal">
            <span className="km-sec-label">Farmer Stories</span>
            <h2 className="km-sec-title">Voices from the <span className="accent">Field</span></h2>
          </div>
          <div className="km-testi-grid km-reveal">
            {[
              { initial: "R", name: "Ramesh Patel",  location: "Tomato Farmer, Gujarat",        text: "Kisan Mitra changed everything for me. The soil sensor told me my land needed potassium, and after following the AI recommendation, my tomato yield increased by 40%. I no longer have to guess what to plant." },
              { initial: "S", name: "Sunita Devi",   location: "Onion Farmer, Maharashtra",     text: "Before, I used to sell onions to a middleman for ₹8/kg. Now through Kisan Mitra's marketplace, I sell directly for ₹22/kg. My family income has nearly tripled in just one season." },
              { initial: "M", name: "Mahesh Singh",  location: "Corn Farmer, Uttar Pradesh",    text: "The disease detection feature is incredible. I uploaded a photo of my corn leaves and within seconds the app told me it was Gray Leaf Spot and suggested Antracol fungicide. Saved my entire harvest!" },
            ].map((t) => (
              <div key={t.name} className="km-testi-card">
                <div className="km-tq">"</div>
                <p className="km-testi-text">{t.text}</p>
                <div className="km-testi-author">
                  <div className="km-t-avatar">{t.initial}</div>
                  <div className="km-t-name"><strong>{t.name}</strong><span>{t.location}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="km-section km-cta-section">
        <div className="km-container">
          <div className="km-cta-box km-reveal">
            <h2>Ready to Transform Your Farm?</h2>
            <p>Join thousands of farmers already using Kisan Mitra to grow smarter, earn more, and farm sustainably with 5G + AI + IoT.</p>
            <div className="km-cta-btns">
              <button className="km-btn-cta-w" onClick={() => location.href = "./login.html"}>
                <i className="fas fa-seedling" /> Register as Farmer
              </button>
              <button className="km-btn-cta-o" onClick={() => location.href = "./login.html"}>
                <i className="fas fa-shopping-cart" /> Join as Consumer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="km-footer">
        <div className="km-footer-top">
          <div>
            <a className="km-f-logo" href="#">
              <div className="km-f-logo-mark"><img src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100&q=90" alt="Kisan Mitra Logo" /></div>
              <span className="km-f-logo-name">Kisan Mitra</span>
            </a>
            <p className="km-footer-brand-desc">An integrated 5G + AI + IoT platform empowering Indian farmers with smart cultivation, disease detection, direct market access, and hassle-free subsidies.</p>
            <div className="km-footer-socials">
              {["fa-twitter","fa-facebook-f","fa-instagram","fa-youtube","fa-whatsapp"].map((ic) => (
                <a key={ic} href="#" className="km-fsoc"><i className={`fab ${ic}`} /></a>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: ["Soil Analytics","Disease Detection","Marketplace","Subsidy Guide","AI Chatbot"] },
            { title: "Company",  links: ["About Us","Team Agro Visionaries","Hackathon 2026","Research","Careers"] },
            { title: "Support",  links: ["Help Center","Farmer Helpline","Privacy Policy","Terms of Service","Contact"] },
          ].map((col) => (
            <div key={col.title} className="km-footer-col">
              <h4>{col.title}</h4>
              <ul>{col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="km-footer-bottom">
          <p>© 2026 Kisan Mitra Platform. All Rights Reserved.</p>
          <span>Developed by <strong>Team Agro Visionaries</strong> 🌱</span>
        </div>
      </footer>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("kisan-theme") || "light");

  // Inject design styles once
  useEffect(() => {
    if (!document.getElementById("km-design-styles")) {
      const tag = document.createElement("style");
      tag.id = "km-design-styles";
      tag.textContent = DESIGN_STYLES;
      document.head.appendChild(tag);
    }
    // Font Awesome
    if (!document.getElementById("km-fa")) {
      const fa = document.createElement("link");
      fa.id = "km-fa";
      fa.rel = "stylesheet";
      fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
      document.head.appendChild(fa);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-km-theme", theme);
    localStorage.setItem("kisan-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // Auth check
  useEffect(() => { checkAuthStatus(); }, []);

  // Particles for dashboard
  useEffect(() => { if (isAuthenticated) createParticles(); }, [isAuthenticated]);

  const checkAuthStatus = () => {
    try {
      const farmerName = sessionStorage.getItem("farmerName");
      const farmerData = sessionStorage.getItem("farmerData");
      const aadhaar    = sessionStorage.getItem("aadhaars");

      if (farmerName && aadhaar) {
        const userData: User = farmerData
          ? JSON.parse(farmerData)
          : { name: farmerName, landSize: 3.2, annualIncome: 250000, cropType: "wheat", aadhaar };
        setCurrentUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem("farmerAadhaar", aadhaar);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setCurrentUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const createParticles = () => {
    const container = document.getElementById("km-particles");
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "km-particle";
      p.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        width:${Math.random() * 10 + 5}px;
        height:${Math.random() * 10 + 5}px;
        animation-delay:${Math.random() * 6}s;
        animation-duration:${Math.random() * 3 + 3}s;
      `;
      container.appendChild(p);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.clear();
      localStorage.removeItem("farmerAadhaar");
      setCurrentUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login.html";
    }
  };

  const renderTabContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case "dashboard":      return <Dashboard currentUser={currentUser} />;
      case "orders-revenue": return <FarmerDashboard />;
      case "subsidy":        return <SubsidyCalculator currentUser={currentUser} showModal={setModalContent} />;
      case "products":       return <ProductsManager currentUser={currentUser} showModal={setModalContent} />;
      case "upload":         return <ProductUpload currentUser={currentUser} onSuccess={() => setActiveTab("products")} />;
      case "marketplace":    return <Marketplace showModal={setModalContent} />;
      case "ai-schemes":     return <AISchemes currentUser={currentUser} />;
      default:               return <Dashboard currentUser={currentUser} />;
    }
  };

  // ── Loading ──
  if (isLoading) return <LoadingScreen />;

  // ── Public homepage ──
  if (!isAuthenticated) {
    return <HomePage theme={theme} onToggleTheme={toggleTheme} />;
  }

  // ── Authenticated dashboard ──
  return (
    <div className="km-app">
      <div id="km-particles" />
      {currentUser && <Header currentUser={currentUser} onLogout={handleLogout} />}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} currentUser={currentUser} />
      <main className="km-main">{renderTabContent()}</main>
      {modalContent && <Modal content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
}

export default App;
