/* ============================================
   MANGA MOE — SCRIPT.JS
   ============================================ */

// ── STATE ──
const STATE = {
  news: [],
  currentSlide: 0,
  sliderInterval: null,
  currentPage: 1,
  itemsPerPage: 8,
};

// ── FETCH JSON ──
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

// ── FORMAT DATE ──
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── HERO SLIDER ──
function initSlider(news) {
  const sliderEl = document.getElementById('hero-slider');
  if (!sliderEl) return;

  const slides = news.slice(0, 3);
  const slidesWrapper = document.getElementById('slides-wrapper');
  const dotsWrapper = document.getElementById('slider-dots');
  const totalEl = document.getElementById('slide-total');

  if (!slidesWrapper) return;
  if (totalEl) totalEl.textContent = slides.length;

  // Render slides
  slidesWrapper.innerHTML = slides.map((item, i) => `
    <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div class="slide-bg" style="background-image: url('${item.image}')"></div>
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <div class="slide-badge">Öne Çıkan Haber</div>
        <h2 class="slide-title">${item.title}</h2>
        <p class="slide-desc">${item.desc}</p>
        <div class="slide-actions">
          <a href="haber-detay.html?id=${item.id}" class="btn-slide-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            Haberi Oku
          </a>
        </div>
      </div>
    </div>
  `).join('');

  // Render dots
  if (dotsWrapper) {
    dotsWrapper.innerHTML = slides.map((_, i) => `
      <div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
    `).join('');

    dotsWrapper.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index));
        resetAutoplay();
      });
    });
  }

  updateSliderCounter(0, slides.length);
  startAutoplay(slides.length);

  // Touch/swipe desteği
  initSliderTouch(sliderEl);
}

// ── TOUCH SWIPE ──
function initSliderTouch(el) {
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  el.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    // Yatay swipe mı dikey scroll mu anla
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        goToSlide(STATE.currentSlide + 1);
      } else {
        goToSlide(STATE.currentSlide - 1);
      }
      resetAutoplay();
    }
  }, { passive: true });
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slides[STATE.currentSlide].classList.remove('active');
  dots[STATE.currentSlide]?.classList.remove('active');

  STATE.currentSlide = (index + slides.length) % slides.length;

  slides[STATE.currentSlide].classList.add('active');
  dots[STATE.currentSlide]?.classList.add('active');
  updateSliderCounter(STATE.currentSlide, slides.length);
}

function updateSliderCounter(current, total) {
  const el = document.getElementById('slide-current');
  if (el) el.textContent = current + 1;
}

function startAutoplay(total) {
  clearInterval(STATE.sliderInterval);
  STATE.sliderInterval = setInterval(() => {
    goToSlide(STATE.currentSlide + 1);
  }, 4000);
}

function resetAutoplay() {
  const slides = document.querySelectorAll('.slide');
  clearInterval(STATE.sliderInterval);
  startAutoplay(slides.length);
}

function initSliderButtons() {
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');

  prevBtn?.addEventListener('click', () => {
    goToSlide(STATE.currentSlide - 1);
    resetAutoplay();
  });
  nextBtn?.addEventListener('click', () => {
    goToSlide(STATE.currentSlide + 1);
    resetAutoplay();
  });
}

// ── NEWS RENDER (haberler.html) ──
function renderNews(news, page = 1) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  const start = (page - 1) * STATE.itemsPerPage;
  const end = start + STATE.itemsPerPage;
  const pageItems = news.slice(start, end);

  grid.innerHTML = '';

  pageItems.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'news-card animate-in';
    card.style.animationDelay = `${i * 0.07}s`;
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
      if (!e.target.closest('.btn-card')) {
        window.location.href = `haber-detay.html?id=${item.id}`;
      }
    });

    grid.appendChild(card);
  });

  const countEl = document.getElementById('news-count');
  if (countEl) {
    countEl.innerHTML = `<strong>${news.length}</strong> haber`;
  }

  renderPagination(news.length, page);
}

// ── PAGINATION ──
function renderPagination(totalItems, currentPage) {
  const wrapper = document.getElementById('pagination');
  if (!wrapper) return;

  const totalPages = Math.ceil(totalItems / STATE.itemsPerPage);
  if (totalPages <= 1) { wrapper.innerHTML = ''; return; }

  let html = '';

  html += `
    <button class="page-btn" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="color: var(--white-muted); padding: 0 4px; line-height: 40px;">···</span>`;
    }
  }

  html += `
    <button class="page-btn" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </button>
  `;

  wrapper.innerHTML = html;

  wrapper.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      STATE.currentPage = page;
      renderNews(STATE.news, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (STATE.currentPage > 1) {
      STATE.currentPage--;
      renderNews(STATE.news, STATE.currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.getElementById('next-page')?.addEventListener('click', () => {
    const totalPages = Math.ceil(STATE.news.length / STATE.itemsPerPage);
    if (STATE.currentPage < totalPages) {
      STATE.currentPage++;
      renderNews(STATE.news, STATE.currentPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// ── SKELETON LOADING ──
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
        <div class="skeleton skeleton-line"></div>
      </div>
    </div>
  `).join('');
}

// ── DETAIL PAGE ──
async function initDetailPage() {
  const detailSection = document.getElementById('detail-section');
  if (!detailSection) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) {
    detailSection.innerHTML = '<div class="detail-error"><p>Haber bulunamadı.</p><a href="haberler.html" class="btn-primary" style="display:inline-flex;margin-top:16px;">Haberlere Dön</a></div>';
    return;
  }

  try {
    const res = await fetch('data.json');
    const data = await res.json();
    const item = data.find(n => n.id === id);

    if (!item) {
      detailSection.innerHTML = '<div class="detail-error"><p>Haber bulunamadı.</p><a href="haberler.html" class="btn-primary" style="display:inline-flex;margin-top:16px;">Haberlere Dön</a></div>';
      return;
    }

    document.title = `${item.title} — Manga Moe`;

    const sorted = data.sort((a, b) => b.id - a.id);
    const currentIndex = sorted.findIndex(n => n.id === id);
    const prevItem = sorted[currentIndex + 1] || null;
    const nextItem = sorted[currentIndex - 1] || null;
    const related = sorted.filter(n => n.id !== id).slice(0, 3);

    detailSection.innerHTML = `
      <div class="detail-hero">
        <div class="detail-hero-img" style="background-image: url('${item.image}')"></div>
        <div class="detail-hero-overlay"></div>
        <div class="detail-hero-content">
          <div class="container">
            <div class="detail-breadcrumb">
              <a href="index.html">Ana Sayfa</a>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <a href="haberler.html">Haberler</a>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              <span>${item.title.substring(0, 30)}...</span>
            </div>
            <div class="detail-badge">✦ Haber</div>
            <h1 class="detail-title">${item.title}</h1>
            <div class="detail-meta">
              <span class="detail-date">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
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
            <div class="detail-desc-box">
              <p class="detail-desc">${item.desc}</p>
            </div>
            <div class="detail-content">
              <p>${item.content}</p>
            </div>

            <div class="detail-nav">
              ${prevItem ? `
                <a href="haber-detay.html?id=${prevItem.id}" class="detail-nav-btn detail-nav-prev">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <div>
                    <span class="detail-nav-label">Önceki Haber</span>
                    <span class="detail-nav-title">${prevItem.title.substring(0, 50)}${prevItem.title.length > 50 ? '...' : ''}</span>
                  </div>
                </a>
              ` : '<div></div>'}
              ${nextItem ? `
                <a href="haber-detay.html?id=${nextItem.id}" class="detail-nav-btn detail-nav-next">
                  <div>
                    <span class="detail-nav-label">Sonraki Haber</span>
                    <span class="detail-nav-title">${nextItem.title.substring(0, 50)}${nextItem.title.length > 50 ? '...' : ''}</span>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              ` : '<div></div>'}
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
                  </a>
                `).join('')}
              </div>
            </div>
            <div class="sidebar-section">
              <a href="haberler.html" class="btn-all-news">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
                Tüm Haberleri Gör
              </a>
            </div>
          </aside>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Detail fetch error:', err);
    detailSection.innerHTML = '<div class="detail-error"><p>Haber yüklenirken hata oluştu.</p></div>';
  }
}

// ── MODAL ──
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const triggers = document.querySelectorAll('.modal-trigger');
  const closeBtn = document.getElementById('modal-close');
  const closeFooter = document.getElementById('modal-close-footer');

  if (!overlay) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggers.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  closeFooter?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── DRAWER ──
function initDrawer() {
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay?.classList.add('open');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  overlay?.addEventListener('click', closeDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

// ── SEARCH ──
function initSearch() {
  const searchInput = document.querySelector('.nav-search input, .page-search input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!STATE.news.length) return;

    const filtered = q
      ? STATE.news.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.desc.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        )
      : STATE.news;

    STATE.currentPage = 1;
    renderNews(filtered, 1);
  });
}

// ── VIEWPORT HEIGHT FIX (iOS Safari) ──
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', async () => {
  // iOS Safari viewport yüksekliği düzeltmesi
  setVh();
  window.addEventListener('resize', setVh);
  // Orientation change için ekstra gecikme
  window.addEventListener('orientationchange', () => {
    setTimeout(setVh, 300);
  });

  initModal();
  initDrawer();
  initSliderButtons();

  const isNewsPage   = !!document.getElementById('news-grid');
  const isHomePage   = !!document.getElementById('hero-slider');
  const isDetailPage = !!document.getElementById('detail-section');

  if (isDetailPage) {
    await initDetailPage();
    return;
  }

  if (isNewsPage) showSkeleton();

  const news = await fetchNews();

  if (isHomePage) initSlider(news);
  if (isNewsPage) {
    renderNews(news, 1);
    initSearch();
  }
});
