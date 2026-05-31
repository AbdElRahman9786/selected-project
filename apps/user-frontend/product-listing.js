'use strict';

const API = 'http://localhost:5000';

const state = {
  products: [],
  filtered: [],
  currentPage: 1,
  perPage: 9,
  viewMode: 'grid',
  sort: 'featured',
  search: '',
  filters: {
    categories: [],
    priceMin: 0,
    priceMax: 300,
    availability: [],
    ratings: [],
  },
  modalProduct: null,
  modalQty: 1,
};

/* ----------------------------------------------------------
   DOM refs
   ---------------------------------------------------------- */
const grid          = document.getElementById('products-grid');
const emptyState    = document.getElementById('empty-state');
const resultsCount  = document.getElementById('results-count');
const sortSelect    = document.getElementById('sort-select');
const cartCount     = document.getElementById('cart-count');
const toast         = document.getElementById('toast');

const catAll        = document.getElementById('cat-all');
const catCheckboxes = document.querySelectorAll('input[name="category"]:not(#cat-all)');
const priceMinInput = document.getElementById('price-min');
const priceMaxInput = document.getElementById('price-max');
const priceMinLabel = document.getElementById('price-min-label');
const priceMaxLabel = document.getElementById('price-max-label');
const rangeFill     = document.getElementById('range-fill');
const availInputs   = document.querySelectorAll('input[name="availability"]');
const ratingInputs  = document.querySelectorAll('input[name="rating"]');

const activeFiltersWrap = document.getElementById('active-filters');
const activeFilterTags  = document.getElementById('active-filter-tags');
const clearAllBtn       = document.getElementById('clear-all-btn');
const filterCountBadge  = document.getElementById('filter-count-badge');

const pagePrev    = document.getElementById('page-prev');
const pageNext    = document.getElementById('page-next');
const pageNumbers = document.getElementById('page-numbers');

const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

const modalOverlay    = document.getElementById('modal-overlay');
const modalClose      = document.getElementById('modal-close');
const modalImg        = document.getElementById('modal-img');
const modalThumbs     = document.getElementById('modal-thumbs');
const modalBadges     = document.getElementById('modal-badges');
const modalName       = document.getElementById('modal-product-name');
const modalRating     = document.getElementById('modal-rating');
const modalPrice      = document.getElementById('modal-price');
const modalPriceOld   = document.getElementById('modal-price-old');
const modalDesc       = document.getElementById('modal-desc');
const modalSizesWrap  = document.getElementById('modal-sizes-wrap');
const modalSizes      = document.getElementById('modal-sizes');
const modalColorsWrap = document.getElementById('modal-colors-wrap');
const modalColors     = document.getElementById('modal-colors');
const modalQtyEl      = document.getElementById('modal-qty');
const modalQtyMinus   = document.getElementById('modal-qty-minus');
const modalQtyPlus    = document.getElementById('modal-qty-plus');
const modalAddCart    = document.getElementById('modal-add-cart-btn');
const modalFullLink   = document.getElementById('modal-full-link');

const searchBtn     = document.getElementById('search-btn');
const searchOverlay = document.getElementById('search-overlay');
const searchClose   = document.getElementById('search-close');
const searchInput   = document.getElementById('search-input');
const searchClear   = document.getElementById('search-clear');
const searchHint    = document.getElementById('search-hint');

const filterToggleMobile = document.getElementById('filter-toggle-mobile');
const sidebarInner       = document.getElementById('sidebar-inner');

/* ----------------------------------------------------------
   FETCH PRODUCTS FROM API
   ---------------------------------------------------------- */
async function fetchProducts() {
  const params = new URLSearchParams();

  if (state.filters.categories.length > 0) {
    params.append('category', state.filters.categories.join(','));
  }
  params.append('min_price', state.filters.priceMin);
  params.append('max_price', state.filters.priceMax);

  if (state.filters.availability.length > 0) {
    params.append('availability', state.filters.availability.join(','));
  }
  if (state.filters.ratings.length > 0) {
    params.append('rating', Math.min(...state.filters.ratings));
  }
  if (state.search) {
    params.append('search', state.search);
  }
  params.append('sort', state.sort);

  try {
    const res  = await fetch(`${API}/api/products?${params}`);
    const data = await res.json();
    state.products = data.products || [];
    state.filtered = [...state.products];
  } catch (e) {
    console.error('Failed to fetch products:', e);
    state.products = [];
    state.filtered = [];
  }
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
  updateCartBadge();
  initAuthNavbar();
  bindEvents();
  initPriceRange();
  initFilterSectionToggles();
  initSearchFromURL();
  await applyFiltersAndRender();
  updateCategoryCounts();
});
/* ----------------------------------------------------------
   APPLY FILTERS AND RENDER
   ---------------------------------------------------------- */
async function applyFiltersAndRender() {
  grid.classList.add('loading');
  await fetchProducts();
  state.currentPage = 1;
  renderProducts();
  renderActiveFilters();
  grid.classList.remove('loading');
}

/* ----------------------------------------------------------
   RENDER PRODUCTS
   ---------------------------------------------------------- */
function renderProducts() {
  const start = (state.currentPage - 1) * state.perPage;
  const page  = state.filtered.slice(start, start + state.perPage);

  resultsCount.innerHTML = `Showing <strong>${state.filtered.length}</strong> products`;

  if (state.filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    document.getElementById('pagination').style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  document.getElementById('pagination').style.display = 'flex';

  grid.innerHTML = page.map((p, i) => {
    const hasSale    = p.oldPrice && p.oldPrice > p.price;
    const discPct    = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const imgHtml    = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />`
      : `<div class="product-img-placeholder"><div class="placeholder-icon">🏋️</div><p>No Image</p></div>`;

    return `
      <article class="product-card" data-id="${p.id}" style="animation-delay:${i * 0.05}s">
        <div class="product-badges">
          ${p.badge ? `<span class="badge badge-${p.badge}">${p.badgeText}</span>` : ''}
          ${hasSale  ? `<span class="badge badge-sale">-${discPct}%</span>` : ''}
        </div>
        <button class="card-wishlist-btn ${isWishlisted(p.id) ? 'active' : ''}" data-id="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="${isWishlisted(p.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="product-img-wrap">
          ${imgHtml}
          <div class="product-actions">
            <button class="action-btn quick-view-btn" data-id="${p.id}">QUICK VIEW</button>
            <button class="action-btn action-cart" data-id="${p.id}">ADD TO CART</button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-cat">${p.category}</p>
          <p class="product-name">${p.name}</p>
          <div class="product-price-wrap">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            ${p.oldPrice ? `<span class="product-price-old">$${p.oldPrice.toFixed(2)}</span>` : ''}
          </div>
        </div>
      </article>`;
  }).join('');

  // Events on cards
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.action-btn') || e.target.closest('.card-wishlist-btn')) return;
      window.location.href = `product-detail.html?id=${card.dataset.id}`;
    });
  });

  grid.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = state.products.find(x => x.id === parseInt(btn.dataset.id));
      if (p) openModal(p);
    });
  });

  grid.querySelectorAll('.action-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = state.products.find(x => x.id === parseInt(btn.dataset.id));
      if (!p) return;
      addToCart(p, 1);
      btn.textContent = 'ADDED ✓';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'ADD TO CART'; btn.classList.remove('added'); }, 1200);
    });
  });

  grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleWishlist(parseInt(btn.dataset.id));
      renderProducts();
    });
  });

  renderPagination();
}

/* ----------------------------------------------------------
   PAGINATION
   ---------------------------------------------------------- */
function renderPagination() {
  const total = Math.ceil(state.filtered.length / state.perPage);
  pagePrev.disabled = state.currentPage === 1;
  pageNext.disabled = state.currentPage === total;

  pageNumbers.innerHTML = Array.from({ length: total }, (_, i) => i + 1)
    .map(n => `<button class="page-num ${n === state.currentPage ? 'active' : ''}" data-page="${n}">${n}</button>`)
    .join('');

  pageNumbers.querySelectorAll('.page-num').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPage = parseInt(btn.dataset.page);
      renderProducts();
      scrollToGrid();
    });
  });
}

function scrollToGrid() {
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ----------------------------------------------------------
   ACTIVE FILTERS
   ---------------------------------------------------------- */
function renderActiveFilters() {
  const tags = [];
  if (state.filters.categories.length > 0) {
    state.filters.categories.forEach(c => tags.push({ label: c, type: 'category', value: c }));
  }
  if (state.filters.priceMin > 0 || state.filters.priceMax < 300) {
    tags.push({ label: `$${state.filters.priceMin}–$${state.filters.priceMax}`, type: 'price' });
  }
  state.filters.availability.forEach(a => tags.push({ label: a, type: 'availability', value: a }));
  state.filters.ratings.forEach(r => tags.push({ label: `${r}★ & up`, type: 'rating', value: r }));

  if (tags.length === 0) {
    activeFiltersWrap.style.display = 'none';
    filterCountBadge.style.display  = 'none';
    return;
  }

  activeFiltersWrap.style.display = 'block';
  filterCountBadge.style.display  = 'flex';
  filterCountBadge.textContent    = tags.length;

  activeFilterTags.innerHTML = tags.map(t =>
    `<span class="filter-tag" data-type="${t.type}" data-value="${t.value || ''}">
      ${t.label} <span class="filter-tag-x">×</span>
    </span>`
  ).join('');

  activeFilterTags.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      removeFilter(tag.dataset.type, tag.dataset.value);
    });
  });
}

function removeFilter(type, value) {
  if (type === 'category') {
    state.filters.categories = state.filters.categories.filter(c => c !== value);
    document.querySelector(`input[value="${value}"]`).checked = false;
    if (state.filters.categories.length === 0) catAll.checked = true;
  } else if (type === 'price') {
    state.filters.priceMin = 0;
    state.filters.priceMax = 300;
    priceMinInput.value = 0;
    priceMaxInput.value = 300;
  } else if (type === 'availability') {
    state.filters.availability = state.filters.availability.filter(a => a !== value);
    document.querySelector(`input[value="${value}"]`).checked = false;
  } else if (type === 'rating') {
    state.filters.ratings = state.filters.ratings.filter(r => r !== parseFloat(value));
    document.querySelector(`input[value="${value}"]`).checked = false;
  }
  applyFiltersAndRender();
}

/* ----------------------------------------------------------
   RESET FILTERS
   ---------------------------------------------------------- */
function resetFilters() {
  state.filters = { categories: [], priceMin: 0, priceMax: 300, availability: [], ratings: [] };
  state.search  = '';
  catAll.checked = true;
  catCheckboxes.forEach(cb => { cb.checked = false; });
  availInputs.forEach(i => { i.checked = false; });
  ratingInputs.forEach(i => { i.checked = false; });
  priceMinInput.value = 0;
  priceMaxInput.value = 300;
  priceMinLabel.textContent = '$0';
  priceMaxLabel.textContent = '$300';
  rangeFill.style.left  = '0%';
  rangeFill.style.width = '100%';
  applyFiltersAndRender();
}

/* ----------------------------------------------------------
   CATEGORY COUNTS
   ---------------------------------------------------------- */
function updateCategoryCounts() {
  const all = state.products;
  document.getElementById('count-all').textContent       = all.length;
  document.getElementById('count-equipment').textContent = all.filter(p => p.category === 'equipment').length;
  document.getElementById('count-shoes').textContent     = all.filter(p => p.category === 'shoes').length;
  document.getElementById('count-men').textContent       = all.filter(p => p.category === 'men').length;
  document.getElementById('count-women').textContent     = all.filter(p => p.category === 'women').length;
}

/* ----------------------------------------------------------
   VIEW MODE
   ---------------------------------------------------------- */
function setViewMode(mode) {
  state.viewMode = mode;
  grid.classList.toggle('list-view', mode === 'list');
  viewGridBtn.classList.toggle('active', mode === 'grid');
  viewListBtn.classList.toggle('active', mode === 'list');
}

/* ----------------------------------------------------------
   MODAL
   ---------------------------------------------------------- */
function openModal(p) {
  state.modalProduct = p;
  state.modalQty     = 1;
  modalQtyEl.textContent = 1;

  modalImg.src  = p.images[0] || p.image;
  modalImg.alt  = p.name;
  modalName.textContent = p.name;
  modalPrice.textContent    = '$' + p.price.toFixed(2);
  modalPriceOld.textContent = p.oldPrice ? '$' + p.oldPrice.toFixed(2) : '';
  modalDesc.textContent     = p.description;
  modalFullLink.href        = `product-detail.html?id=${p.id}`;

  modalBadges.innerHTML = p.badge
    ? `<span class="badge badge-${p.badge}">${p.badgeText}</span>` : '';

  modalRating.innerHTML = `
    <span style="color:#f5a623">${renderStars(p.rating)}</span>
    <span style="color:#aaa;font-size:13px">(${p.reviews} reviews)</span>`;

  // Thumbnails
  modalThumbs.innerHTML = p.images.length > 1
    ? p.images.map((src, i) =>
        `<img src="${src}" class="modal-thumb${i===0?' active':''}" data-i="${i}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer;border:2px solid ${i===0?'#111':'transparent'}" />`
      ).join('')
    : '';

  modalThumbs.querySelectorAll('.modal-thumb').forEach(th => {
    th.addEventListener('click', () => {
      modalImg.src = p.images[th.dataset.i];
      modalThumbs.querySelectorAll('.modal-thumb').forEach(t => t.style.borderColor = 'transparent');
      th.style.borderColor = '#111';
    });
  });

  // Sizes
  if (p.sizes && p.sizes.length > 0) {
    modalSizesWrap.style.display = 'block';
    modalSizes.innerHTML = p.sizes.map((s, i) =>
      `<button class="size-option${i===0?' selected':''}" data-size="${s}">${s}</button>`
    ).join('');
    modalSizes.querySelectorAll('.size-option').forEach(btn => {
      btn.addEventListener('click', () => {
        modalSizes.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  } else {
    modalSizesWrap.style.display = 'none';
  }

  // Colors
  if (p.colors && p.colors.length > 0) {
    modalColorsWrap.style.display = 'block';
    modalColors.innerHTML = p.colors.map((c, i) =>
      `<button class="color-option${i===0?' selected':''}"
        style="background:${c};width:28px;height:28px;border-radius:50%;border:2px solid ${i===0?'#111':'transparent'};cursor:pointer"
        data-color="${c}" title="${p.colorNames[i]}"></button>`
    ).join('');
    modalColors.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        modalColors.querySelectorAll('.color-option').forEach(b => b.style.borderColor = 'transparent');
        btn.style.borderColor = '#111';
      });
    });
  } else {
    modalColorsWrap.style.display = 'none';
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  state.modalProduct = null;
}

/* ----------------------------------------------------------
   SEARCH
   ---------------------------------------------------------- */
function openSearch()  { searchOverlay.classList.add('open'); searchInput.focus(); }
function closeSearch() { searchOverlay.classList.remove('open'); }

function initSearchFromURL() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || params.get('search');
  if (q) { state.search = q.toLowerCase(); searchInput.value = q; }

  const category = params.get('category');
  if (category) {
    state.filters.categories = [category];
    const cb = document.querySelector(`input[value="${category}"]`);
    if (cb) { cb.checked = true; catAll.checked = false; }
  }

  const availability = params.get('availability');
  if (availability) {
    state.filters.availability = [availability];
    const av = document.querySelector(`input[value="${availability}"]`);
    if (av) av.checked = true;
  }
}

/* ----------------------------------------------------------
   BIND EVENTS
   ---------------------------------------------------------- */
function bindEvents() {
  sortSelect.addEventListener('change', async () => {
    state.sort = sortSelect.value;
    await applyFiltersAndRender();
  });

  catAll.addEventListener('change', async () => {
    if (catAll.checked) {
      catCheckboxes.forEach(cb => { cb.checked = false; });
      state.filters.categories = [];
    }
    await applyFiltersAndRender();
  });

  catCheckboxes.forEach(cb => {
    cb.addEventListener('change', async () => {
      catAll.checked = false;
      state.filters.categories = [...catCheckboxes].filter(c => c.checked).map(c => c.value);
      if (state.filters.categories.length === 0) catAll.checked = true;
      await applyFiltersAndRender();
    });
  });

  availInputs.forEach(inp => {
    inp.addEventListener('change', async () => {
      state.filters.availability = [...availInputs].filter(i => i.checked).map(i => i.value);
      await applyFiltersAndRender();
    });
  });

  ratingInputs.forEach(inp => {
    inp.addEventListener('change', async () => {
      state.filters.ratings = [...ratingInputs].filter(i => i.checked).map(i => parseFloat(i.value));
      await applyFiltersAndRender();
    });
  });

  clearAllBtn.addEventListener('click', resetFilters);
  document.getElementById('empty-reset-btn').addEventListener('click', resetFilters);

  viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  viewListBtn.addEventListener('click', () => setViewMode('list'));

  pagePrev.addEventListener('click', () => {
    if (state.currentPage > 1) { state.currentPage--; renderProducts(); scrollToGrid(); }
  });
  pageNext.addEventListener('click', () => {
    const pages = Math.ceil(state.filtered.length / state.perPage);
    if (state.currentPage < pages) { state.currentPage++; renderProducts(); scrollToGrid(); }
  });

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeSearch(); } });

  modalQtyMinus.addEventListener('click', () => {
    if (state.modalQty > 1) { state.modalQty--; modalQtyEl.textContent = state.modalQty; }
  });
  modalQtyPlus.addEventListener('click', () => {
    state.modalQty++;
    modalQtyEl.textContent = state.modalQty;
  });

  modalAddCart.addEventListener('click', () => {
    if (!state.modalProduct) return;
    addToCart(state.modalProduct, state.modalQty);
    modalAddCart.textContent = 'ADDED ✓';
    modalAddCart.classList.add('added');
    setTimeout(() => {
      modalAddCart.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        ADD TO CART`;
      modalAddCart.classList.remove('added');
    }, 1400);
  });

  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchClear.addEventListener('click', async () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    state.search = '';
    searchHint.textContent = 'Start typing to see results';
    await applyFiltersAndRender();
  });

  searchInput.addEventListener('input', async () => {
    const val = searchInput.value.trim();
    searchClear.style.display = val ? 'block' : 'none';
    state.search = val.toLowerCase();
    const count = state.filtered.length;
    searchHint.textContent = val
      ? `${count} product${count !== 1 ? 's' : ''} match "${val}"`
      : 'Start typing to see results';
  });

  searchInput.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      closeSearch();
      await applyFiltersAndRender();
    }
  });

  filterToggleMobile.addEventListener('click', () => {
    sidebarInner.classList.toggle('open');
  });

  document.getElementById('cart-btn').addEventListener('click', () => {
    window.location.href = 'cart.html';
  });
}

/* ----------------------------------------------------------
   FILTER SECTION TOGGLES
   ---------------------------------------------------------- */
function initFilterSectionToggles() {
  document.querySelectorAll('.filter-section-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const target = document.getElementById(toggle.dataset.target);
      if (!target) return;
      const collapsed = target.classList.toggle('collapsed');
      toggle.classList.toggle('collapsed', collapsed);
    });
  });
}

/* ----------------------------------------------------------
   PRICE RANGE
   ---------------------------------------------------------- */
function initPriceRange() {
  function updateRange() {
    let min = parseInt(priceMinInput.value);
    let max = parseInt(priceMaxInput.value);
    if (min > max - 5) { min = max - 5; priceMinInput.value = min; }
    priceMinLabel.textContent = '$' + min;
    priceMaxLabel.textContent = '$' + max;
    const pct1 = (min / 300) * 100;
    const pct2 = (max / 300) * 100;
    rangeFill.style.left  = pct1 + '%';
    rangeFill.style.width = (pct2 - pct1) + '%';
    state.filters.priceMin = min;
    state.filters.priceMax = max;
  }
  priceMinInput.addEventListener('input', async () => { updateRange(); await applyFiltersAndRender(); });
  priceMaxInput.addEventListener('input', async () => { updateRange(); await applyFiltersAndRender(); });
  updateRange();
}

/* ----------------------------------------------------------
   CART
   ---------------------------------------------------------- */
function getSessionId() {
  let sid = localStorage.getItem('aboss_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('aboss_session_id', sid);
  }
  return sid;
}

function addToCart(product, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  const existing = cart.find(i => i.productId === product.id);
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({ productId: product.id, name: product.name, price: product.price, image: product.image, qty: quantity });
  }
  localStorage.setItem('aboss_cart', JSON.stringify(cart));
  updateCartBadge();
  showToast(`${product.name} added to cart!`, 'success');

 
  fetch(`${API}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: getSessionId(),
      product_id: product.id,
      quantity,
    })
  }).catch(e => console.error('Cart API error:', e));
}


function updateCartBadge() {
  const cart  = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  const total = cart.reduce((sum, i) => sum + (i.qty || i.quantity || 0), 0);
  if (cartCount) cartCount.textContent = total;
}

/* ----------------------------------------------------------
   WISHLIST
   ---------------------------------------------------------- */
function getWishlist() { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
function isWishlisted(id) { return getWishlist().includes(id); }
function toggleWishlist(id) {
  const list = getWishlist();
  const idx  = list.indexOf(id);
  if (idx > -1) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem('wishlist', JSON.stringify(list));
}

/* ----------------------------------------------------------
   TOAST
   ---------------------------------------------------------- */
function showToast(msg, type = '') {
  toast.textContent = msg;
  toast.className   = 'toast' + (type ? ' ' + type : '');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ----------------------------------------------------------
   STARS
   ---------------------------------------------------------- */
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += rating >= i ? '★' : '☆';
  }
  return html;
}

/* ----------------------------------------------------------
   NEWSLETTER
   ---------------------------------------------------------- */
function initAuthNavbar() {
  try {
    const session = JSON.parse(
      localStorage.getItem('aboss_session') ||
      sessionStorage.getItem('aboss_session') ||
      'null'
    );
    const navRight = document.querySelector('.nav-right');
    const navLeft  = document.querySelector('.nav-left');

    if (session && navRight) {
      const chip = document.createElement('a');
      chip.href  = '#';
      chip.title = 'Click to sign out';
      chip.style.cssText = 'font-size:12px;font-weight:600;color:#111;text-decoration:none;padding:6px 14px;background:rgba(0,0,0,0.07);border-radius:40px;display:flex;align-items:center;gap:6px;transition:background 0.2s;';
      chip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${session.firstname}`;
      chip.addEventListener('click', e => {
        e.preventDefault();
        try {
          const s = JSON.parse(localStorage.getItem('aboss_session') || 'null');
          if (s) localStorage.setItem('aboss_cart_' + s.id, localStorage.getItem('aboss_cart') || '[]');
          localStorage.removeItem('aboss_cart');
        } catch(err) {}
        localStorage.removeItem('aboss_session');
        sessionStorage.removeItem('aboss_session');
        location.reload();
      });
      navRight.prepend(chip);
    } else if (!session && navLeft) {
      const loginLink = document.createElement('a');
      loginLink.href        = 'login.html';
      loginLink.className   = 'nav-link';
      loginLink.textContent = 'LOGIN';
      navLeft.appendChild(loginLink);
    }
  } catch(e) {}
}

function initNewsletter() {
  const form     = document.getElementById('footer-newsletter-form');
  const feedback = document.getElementById('newsletter-feedback');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value.trim();
    if (!email) return;
    try {
      const res  = await fetch(`${API}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      feedback.textContent = res.ok ? '✓ Subscribed successfully!' : data.error;
      feedback.style.color = res.ok ? '#7bc040' : '#e53935';
    } catch {
      feedback.textContent = 'Something went wrong.';
      feedback.style.color = '#e53935';
    }
  });
}