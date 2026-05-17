/**
 * header.js — Shared hero header component
 * Injects topnav + hero into any page that has <div id="app-header"></div>
 *
 * Usage: <script src="/fitness/components/header.js"></script>
 * Config via window.HEADER_CONFIG before script loads:
 *   window.HEADER_CONFIG = {
 *     title: 'Workout Log',       // nav center text
 *     backLink: '/fitness/index.html',
 *     backLabel: '← Tracker',
 *     nextLink: '/fitness/plan.html',
 *     nextLabel: 'Plan →',
 *     tag: 'Lean Bulk · Workout Log',
 *     sub: 'PPL×2 Split · Indian Diet'
 *   }
 */

(function() {
  const cfg = window.HEADER_CONFIG || {};

  // Photo is fetched from log.json — fallback to placeholder
  const PHOTO_FALLBACK = '';

  function buildHeader(photoSrc) {
    const backLink  = cfg.backLink  || '/fitness/index.html';
    const backLabel = cfg.backLabel || '← Tracker';
    const nextLink  = cfg.nextLink  || '/fitness/plan.html';
    const nextLabel = cfg.nextLabel || 'Plan →';
    const title     = cfg.title     || 'Lean Bulk Program';
    const tag       = cfg.tag       || 'Lean Bulk · Progress Tracker';
    const sub       = cfg.sub       || 'PPL×2 Split · Indian Diet';

    return `
<nav class="topnav">
  <a class="nav-link" href="${backLink}">${backLabel}</a>
  <span class="nav-title">${title}</span>
  <a class="nav-link" href="${nextLink}">${nextLabel}</a>
</nav>

<div class="hero">
  ${photoSrc
    ? `<img class="hero-photo" src="${photoSrc}" alt="Rohit">`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#c9eeff,#84cdec);"></div>`
  }
  <div class="hero-overlay"></div>
  <div class="hero-card">
    <div class="hero-tag">${tag}</div>
    <div class="hero-name">ROHIT</div>
    <div class="hero-sub">${sub}</div>
    <div class="hero-chips" id="hero-chips"></div>
  </div>
</div>`;
  }

  function buildChips(meta) {
    if(!meta) return;
    const chips = [
      { label: `Age ${meta.age}` },
      { label: meta.height },
      { label: `Start ${meta.startWeight}kg` },
      { label: `BF ~${meta.bodyFat}%` },
      ...(meta.conditions || []).map(c => ({ label: c, cls: 'prediabetic' }))
    ];
    const el = document.getElementById('hero-chips');
    if(!el) return;
    el.innerHTML = chips.map(c =>
      `<span class="chip${c.cls ? ' '+c.cls : ''}">${c.label}</span>`
    ).join('');
  }

  async function init() {
    const container = document.getElementById('app-header');
    if(!container) return;

    // Inject placeholder header immediately (no photo yet)
    container.innerHTML = buildHeader('');

    // Then fetch log.json for photo + meta
    try {
      const r = await fetch('/fitness/data/log.json');
      if(!r.ok) throw new Error('log.json not found');
      const data = await r.json();

      // Photo stored separately in data/photo.txt (base64)
      // Try fetching it
      let photoSrc = '';
      try {
        const pr = await fetch('/fitness/data/photo.txt');
        if(pr.ok) photoSrc = await pr.text();
      } catch(e) {}

      // Re-inject with photo
      container.innerHTML = buildHeader(photoSrc.trim());
      buildChips(data.meta);

      // Dispatch event so page JS knows header is ready
      window.dispatchEvent(new CustomEvent('headerReady', { detail: data }));

    } catch(e) {
      console.warn('header.js: could not load log.json:', e.message);
      // Still build chips with fallback meta
      buildChips(window.HEADER_META || null);
      window.dispatchEvent(new CustomEvent('headerReady', { detail: null }));
    }
  }

  // Run after DOM is ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
