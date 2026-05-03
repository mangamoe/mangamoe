/* ============================================
   MANGA MOE — SCRIPT.JS
   ============================================ */

const STATE = {
  news: [],
  currentPage: 1,
  itemsPerPage: 8,
  heroCurrent: 0,
};

async function fetchNews() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    STATE.news = data.sort((a, b) => b.id - a.id);
    return STATE.news;
  } catch (err) {
    console.error('JSON fetch hatası:', err);
    return [];
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── HERO SLIDER — KART TASARIMI ── */
function initSlider(news) {
  const wrapper = document.getElementById('hero-slider-inner');
  const dotsEl = document.getElementById('hero-dots');
  if (!wrapper) return;

  const items = news.slice(0, 5);

  wrapper.innerHTML = items.map((item) => `
    <a href="haber-detay.html?id=${item.id}" class="hero-card">
      <div class="hero-card-img" style="background-image:url('${item.image}')"></div>
      <div class="hero-card-overlay"></div>
      <div class="hero-card-content">
        <div class="hero-card-tag">Haberler</div>
        <h2 class="hero-card-title">${item.title}</h2>
        <p class="hero-card-desc">${item.desc}</p>
        <div class="hero-card-btn">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          Haberi Oku
        </div>
      </div>
    </a>
  `).join('');

  /* Dots */
  if (dotsEl) {
    dotsEl.innerHTML = items.map((_, i) =>
      `<div class="hero-dot ${i === 0 ? 'active' : ''}" data-i="${i}"></div>`
    ).join('');

    dotsEl.querySelectorAll('.hero-dot').forEach(d => {
      d.addEventListener('click', () => scrollToCard(parseInt(d.dataset.i)));
    });
  }

  /* Scroll → dot sync */
  wrapper.addEventListener('scroll', () => {
    const cardW = wrapper.querySelector('.hero-card')?.offsetWidth + 14 || 1;
    const idx = Math.round(wrapper.scrollLeft / cardW);
    updateDots(idx);
  }, { passive: true });

  /* Drag-to-scroll (masaüstü) */
  let isDown = false, startX, scrollL;
  wrapper.addEventListener('mousedown', e => {
    isDown = true; wrapper.classList.add('grabbing');
    startX = e.pageX - wrapper.offsetLeft; scrollL = wrapper.scrollLeft;
  });
  wrapper.addEventListener('mouseleave', () => { isDown = false; wrapper.classList.remove('grabbing'); });
  wrapper.addEventListener('mouseup', () => { isDown = false; wrapper.classList.remove('grabbing'); });
  wrapper.addEventListener('mousemove', e => {
    if (!isDown) return; e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    wrapper.scrollLeft = scrollL - (x - startX) * 1.5;
  });
}

function scrollToCard(i) {
  const wrapper = document.getElementById('hero-slider-inner');
  if (!wrapper) return;
  const card = wrapper.querySelectorAll('.hero-card')[i];
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  updateDots(i);
}

function updateDots(i) {
  document.querySelectorAll('.hero-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === i);
  });
}

/* ── HABERLER SAYFASI ── */
function renderNews(news, page = 1) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const start = (page - 1) * STATE.itemsPerPage;
  const pageItems = news.slice(start, start + STATE.itemsPerPage);

  grid.innerHTML = '';
  pageItems.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'news-card animate-in';
    card.style.animationDelay = `${i * 0.06}s`;
    card.style.opacity = '0';
    card.innerHTML = `
      <div class="card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="card-image-overlay"></div>
        <div class="card-date-badge">${formatDate(item.date)}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-desc">${item.desc}</p>
        <div class="card-footer">
          <span class="card-date">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            ${formatDate(item.date)}
          </span>
          <a href="haber-detay.html?id=${item.id}" class="btn-card">Detay Gör</a>
        </div>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-card')) window.location.href = `haber-detay.html?id=${item.id}`;
    });
    grid.appendChild(card);
  });

  const countEl = document.getElementById('news-count');
  if (countEl) countEl.innerHTML = `<strong>${news.length}</strong> haber`;

  renderPagination(news.length, page);
}

function renderPagination(total, current) {
  const wrapper = document.getElementById('pagination');
  if (!wrapper) return;
  const pages = Math.ceil(total / STATE.itemsPerPage);
  if (pages <= 1) { wrapper.innerHTML = ''; return; }

  let html = `<button class="page-btn" id="prev-page" ${current===1?'disabled':''}>
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
  </button>`;

  for (let i = 1; i <= pages; i++) {
    if (i===1 || i===pages || (i>=current-1 && i<=current+1)) {
      html += `<button class="page-btn ${i===current?'active':''}" data-page="${i}">${i}</button>`;
    } else if (i===current-2 || i===current+2) {
      html += `<span style="color:var(--white-muted);padding:0 4px;line-height:40px">···</span>`;
    }
  }

  html += `<button class="page-btn" id="next-page" ${current===pages?'disabled':''}>
    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  </button>`;

  wrapper.innerHTML = html;

  wrapper.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.currentPage = parseInt(btn.dataset.page);
      renderNews(STATE.news, STATE.currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (STATE.currentPage > 1) { STATE.currentPage--; renderNews(STATE.news, STATE.currentPage); window.scrollTo({top:0,behavior:'smooth'}); }
  });
  document.getElementById('next-page')?.addEventListener('click', () => {
    if (STATE.currentPage < pages) { STATE.currentPage++; renderNews(STATE.news, STATE.currentPage); window.scrollTo({top:0,behavior:'smooth'}); }
  });
}

function showSkeleton() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = Array(8).fill('').map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>
  `).join('');
}

/* ── DETAY SAYFASI ── */
async function initDetailPage() {
  const section = document.getElementById('detail-section');
  if (!section) return;
  const id = parseInt(new URLSearchParams(window.location.search).get('id'));
  if (!id) { section.innerHTML = '<div class="detail-error"><p>Haber bulunamadı.</p><a href="haberler.html" class="btn-primary" style="display:inline-flex;margin-top:16px">Haberlere Dön</a></div>'; return; }

  try {
    const data = (await (await fetch('data.json')).json()).sort((a,b) => b.id - a.id);
    const item = data.find(n => n.id === id);
    if (!item) { section.innerHTML = '<div class="detail-error"><p>Haber bulunamadı.</p></div>'; return; }

    document.title = `${item.title} — Manga Moe`;
    const idx = data.findIndex(n => n.id === id);
    const prev = data[idx+1] || null;
    const next = data[idx-1] || null;
    const related = data.filter(n => n.id !== id).slice(0, 3);

    section.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-img" style="background-image:url('${item.image}')"></div>
        <div class="detail-hero-overlay"></div>
        <div class="detail-hero-content">
          <div class="container">
            <div class="detail-breadcrumb">
              <a href="index.html">Ana Sayfa</a>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <a href="haberler.html">Haberler</a>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span>${item.title.substring(0,30)}...</span>
            </div>
            <div class="detail-badge">✦ Haber</div>
            <h1 class="detail-title">${item.title}</h1>
            <div class="detail-meta">
              <span class="detail-date">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                ${formatDate(item.date)}
              </span>
              <span class="detail-id">ID: #${item.id}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="detail-layout">
          <article class="detail-article">
            <div class="detail-desc-box"><p class="detail-desc">${item.desc}</p></div>
            <div class="detail-content"><p>${item.content}</p></div>
            <div class="detail-nav">
              ${prev ? `<a href="haber-detay.html?id=${prev.id}" class="detail-nav-btn detail-nav-prev">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                <div><span class="detail-nav-label">Önceki Haber</span><span class="detail-nav-title">${prev.title.substring(0,50)}...</span></div>
              </a>` : '<div></div>'}
              ${next ? `<a href="haber-detay.html?id=${next.id}" class="detail-nav-btn detail-nav-next">
                <div><span class="detail-nav-label">Sonraki Haber</span><span class="detail-nav-title">${next.title.substring(0,50)}...</span></div>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </a>` : '<div></div>'}
            </div>
          </article>
          <aside class="detail-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-label">İlgili Haberler</div>
              <div class="sidebar-list">
                ${related.map(r => `
                  <a href="haber-detay.html?id=${r.id}" class="sidebar-item">
                    <img src="${r.image}" alt="${r.title}" loading="lazy">
                    <div class="sidebar-item-info">
                      <p class="sidebar-item-title">${r.title}</p>
                      <span class="sidebar-item-date">${formatDate(r.date)}</span>
                    </div>
                  </a>`).join('')}
              </div>
            </div>
            <div class="sidebar-section">
              <a href="haberler.html" class="btn-all-news">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                Tüm Haberleri Gör
              </a>
            </div>
          </aside>
        </div>
      </div>`;
  } catch(e) {
    section.innerHTML = '<div class="detail-error"><p>Yüklenirken hata oluştu.</p></div>';
  }
}

/* ── MODAL ── */
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const open = () => { overlay.classList.add('open'); document.body.style.overflow='hidden'; };
  const close = () => { overlay.classList.remove('open'); document.body.style.overflow=''; };
  document.querySelectorAll('.modal-trigger').forEach(b => b.addEventListener('click', open));
  document.getElementById('modal-close')?.addEventListener('click', close);
  document.getElementById('modal-close-footer')?.addEventListener('click', close);
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
}

/* ── DRAWER ── */
function initDrawer() {
  const ham = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');
  if (!ham || !drawer) return;
  const open = () => { drawer.classList.add('open'); overlay?.classList.add('open'); ham.classList.add('active'); document.body.style.overflow='hidden'; };
  const close = () => { drawer.classList.remove('open'); overlay?.classList.remove('open'); ham.classList.remove('active'); document.body.style.overflow=''; };
  ham.addEventListener('click', open);
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
}

/* ── MOBİL ARAMA ── */
function initMobileSearch() {
  const btn = document.getElementById('nav-search-btn');
  const panel = document.getElementById('nav-search-mobile');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) panel.querySelector('input')?.focus();
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', async () => {
  initModal();
  initDrawer();
  initMobileSearch();
  initMobileSearch();

  const isNews = !!document.getElementById('news-grid');
  const isHome = !!document.getElementById('hero-slider');
  const isDetail = !!document.getElementById('detail-section');

  if (isDetail) { await initDetailPage(); return; }
  if (isNews) showSkeleton();

  const news = await fetchNews();
  if (isHome) initSlider(news);
  if (isNews) renderNews(news, 1);
});

// ── MOBİL ARAMA BUTONU ──
function initMobileSearch() {
  const btn = document.getElementById('nav-search-btn');
  const panel = document.getElementById('nav-search-mobile');
  const input = document.getElementById('mobile-search-input');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      input?.focus();
    }
  });
}
