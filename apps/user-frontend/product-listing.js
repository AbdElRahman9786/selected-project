/* ============================================================
   ABOSS – Product Listing JS
   Filter · Sort · Search · Quick View · Add to Cart
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   PRODUCTS DATA
   Replace image paths with your real images.
   Add/remove products freely – keep this structure.
   ---------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 1,
    name: 'Adjustable Dumbbell Set',
    category: 'equipment',
    price: 49.99,
    oldPrice: 69.99,
    image: 'images/product_dumbbell.png',
    images: [
      'images/product_dumbbell.png',
      'images/dumbbells_cycling.png'
    ],
    badge: 'sale',
    badgeText: 'SALE',
    rating: 4.7,
    reviews: 128,
    description:
      'Professional-grade adjustable dumbbells with quick-lock mechanism. Perfect for home gym workouts. Weight range: 5–52.5 lbs.',
    sizes: [],
    colors: ['#111', '#888', '#c8a020'],
    colorNames: ['Black', 'Silver', 'Gold'],
    inStock: true,
    isNew: false,
    featured: true,
  },

  {
    id: 2,
    name: 'Pro Athletic Sneaker',
    category: 'shoes',
    price: 89.99,
    oldPrice: null,
    image: 'images/product_sneaker.png',
    images: ['images/product_sneaker.png'],
    badge: 'new',
    badgeText: 'NEW',
    rating: 4.5,
    reviews: 64,
    description:
      'Lightweight, responsive running shoes engineered for maximum performance. Breathable mesh upper with energy-return foam midsole.',
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: ['#111', '#e53935', '#1565c0'],
    colorNames: ['Black', 'Red', 'Blue'],
    inStock: true,
    isNew: true,
    featured: true,
  },

  {
    id: 3,
    name: 'Speed Jump Rope',
    category: 'equipment',
    price: 19.99,
    oldPrice: null,
    image: 'images/product_jump_rope.png',
    images: [
      'images/product_jump_rope.png',
      'images/product_jump_rope 1.jpeg',
      'images/product_jump_rope2.jpeg'
    ],
    badge: 'new',
    badgeText: 'NEW',
    rating: 4.8,
    reviews: 213,
    description:
      'Competition-grade speed rope with ball-bearing swivel handles and 3mm PVC cable. Ideal for double-unders and HIIT.',
    sizes: [],
    colors: ['#111', '#e53935', '#7bc040'],
    colorNames: ['Black', 'Red', 'Green'],
    inStock: true,
    isNew: true,
    featured: false,
  },

  {
    id: 4,
    name: 'Kangoo Jump Shoes',
    category: 'shoes',
    price: 129.99,
    oldPrice: 159.99,
    image: 'images/kangoo_shoes.png',
    images: ['images/kangoo_shoes.png'],
    badge: 'hot',
    badgeText: 'HOT',
    rating: 4.6,
    reviews: 87,
    description:
      'Reduce impact by up to 80%. These revolutionary rebound shoes protect joints while delivering an intense cardio workout.',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['#111', '#c8a020'],
    colorNames: ['Black', 'Gold'],
    inStock: true,
    isNew: false,
    featured: true,
  },

  {
    id: 5,
    name: 'Resistance Band Kit',
    category: 'equipment',
    price: 34.99,
    oldPrice: null,
    image: 'images/Resistance Band Kit.jpeg',
    images: ['images/Resistance Band Kit.jpeg'],
    badge: 'new',
    badgeText: 'NEW',
    rating: 4.4,
    reviews: 156,
    description:
      'Set of 5 resistance bands ranging from 10 to 50 lbs. Latex-free, odorless, and durable. Includes carry bag and exercise guide.',
    sizes: [],
    colors: ['#e53935', '#1565c0', '#7bc040', '#f5a623', '#111'],
    colorNames: ['Red', 'Blue', 'Green', 'Orange', 'Black'],
    inStock: true,
    isNew: true,
    featured: false,
  },

  {
    id: 6,
    name: "Men's Training Tee",
    category: 'men',
    price: 29.99,
    oldPrice: 39.99,
    image: 'images/training_shirt.jpeg',
    images: ['images/training_shirt.jpeg'],
    badge: 'sale',
    badgeText: 'SALE',
    rating: 4.3,
    reviews: 92,
    description:
      'Moisture-wicking performance shirt for intense training sessions. 4-way stretch fabric keeps you cool and comfortable.',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#111', '#fff', '#1565c0', '#e53935'],
    colorNames: ['Black', 'White', 'Navy', 'Red'],
    inStock: true,
    isNew: false,
    featured: false,
  },

  {
    id: 7,
    name: 'Boxing Gloves Pro',
    category: 'equipment',
    price: 54.99,
    oldPrice: 69.99,
    image: 'images/Boxing_gloves1.jpeg',
    images: [
      'images/Boxing_gloves1.jpeg',
      'images/Boxing_gloves2.jpg'
    ],
    badge: 'new',
    badgeText: 'NEW',
    rating: 4.7,
    reviews: 112,
    description:
      'High-quality boxing gloves designed for training and sparring. Durable synthetic leather with shock-absorbing foam padding.',
    sizes: ['10oz', '12oz', '14oz', '16oz'],
    colors: ['#111', '#e53935'],
    colorNames: ['Black', 'Red'],
    inStock: true,
    isNew: true,
    featured: false,
  },

  {
    id: 8,
    name: 'Foam Roller Pro',
    category: 'equipment',
    price: 24.99,
    oldPrice: null,
    image: 'images/Foam Roller Pro.jpg',
    images: ['images/Foam Roller Pro.jpg'],
    badge: null,
    badgeText: null,
    rating: 4.5,
    reviews: 77,
    description:
      'High-density EVA foam roller for deep-tissue muscle recovery. Textured surface for trigger-point relief.',
    sizes: [],
    colors: ['#111', '#e53935', '#1565c0'],
    colorNames: ['Black', 'Red', 'Blue'],
    inStock: true,
    isNew: false,
    featured: false,
  },

  {
    id: 9,
    name: "Men's Running Shorts",
    category: 'men',
    price: 39.99,
    oldPrice: 49.99,
    image: 'images/men_short.webp',
    images: ['images/men_short.webp'],
    badge: 'sale',
    badgeText: 'SALE',
    rating: 4.2,
    reviews: 43,
    description:
      'Lightweight running shorts with built-in liner and zippered pocket. Reflective details for low-light visibility.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#111', '#546e7a', '#e53935'],
    colorNames: ['Black', 'Slate', 'Red'],
    inStock: true,
    isNew: false,
    featured: false,
  },

  {
    id: 10,
    name: "Women's Leggings",
    category: 'women',
    price: 64.99,
    oldPrice: 79.99,
    image: 'images/women_leggings.jpeg',
    images: ['images/women_leggings.jpeg'],
    badge: 'sale',
    badgeText: 'SALE',
    rating: 4.8,
    reviews: 318,
    description:
      'Squat-proof 7/8 length leggings with hidden waistband pocket. Four-way stretch for unrestricted movement.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#111', '#424242', '#e91e63', '#1a237e'],
    colorNames: ['Black', 'Charcoal', 'Mauve', 'Navy'],
    inStock: true,
    isNew: false,
    featured: true,
  },

  {
    id: 11,
    name: 'Pull-Up Bar',
    category: 'equipment',
    price: 59.99,
    oldPrice: null,
    image: 'images/weight-training-door-pull-up-bar.avif',
    images: ['images/weight-training-door-pull-up-bar.avif'],
    badge: null,
    badgeText: null,
    rating: 4.6,
    reviews: 55,
    description:
      'Doorframe pull-up bar with multi-grip positions. No screws required. Supports up to 150kg. Foam-padded handles.',
    sizes: [],
    colors: ['#111'],
    colorNames: ['Black'],
    inStock: true,
    isNew: false,
    featured: false,
  },

  {
    id: 12,
    name: 'Yoga Mat Premium',
    category: 'equipment',
    price: 49.99,
    oldPrice: null,
    image: 'images/yoga_mat.jpeg',
    images: ['images/yoga_mat.jpeg'],
    badge: 'new',
    badgeText: 'NEW',
    rating: 4.7,
    reviews: 182,
    description:
      '6mm thick non-slip yoga mat with alignment lines. Eco-friendly TPE material. Includes carrying strap.',
    sizes: [],
    colors: ['#7bc040', '#e91e63', '#5c6bc0', '#111'],
    colorNames: ['Green', 'Pink', 'Purple', 'Black'],
    inStock: true,
    isNew: true,
    featured: false,
  }
];

/* ----------------------------------------------------------
   STATE
   ---------------------------------------------------------- */
const state = {
  products: [...PRODUCTS],
  filtered: [...PRODUCTS],
  currentPage: 1,
  perPage: 9,
  viewMode: 'grid',           // 'grid' | 'list'
  sort: 'featured',
  search: '',
  filters: {
    categories: [],           // empty = all
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
const grid         = document.getElementById('products-grid');
const emptyState   = document.getElementById('empty-state');
const resultsCount = document.getElementById('results-count');
const sortSelect   = document.getElementById('sort-select');
const cartCount    = document.getElementById('cart-count');
const toast        = document.getElementById('toast');

// Filters
const catAll       = document.getElementById('cat-all');
const catCheckboxes = document.querySelectorAll('input[name="category"]:not(#cat-all)');
const priceMinInput = document.getElementById('price-min');
const priceMaxInput = document.getElementById('price-max');
const priceMinLabel = document.getElementById('price-min-label');
const priceMaxLabel = document.getElementById('price-max-label');
const rangeFill    = document.getElementById('range-fill');
const availInputs  = document.querySelectorAll('input[name="availability"]');
const ratingInputs = document.querySelectorAll('input[name="rating"]');

// Active filters display
const activeFiltersWrap = document.getElementById('active-filters');
const activeFilterTags  = document.getElementById('active-filter-tags');
const clearAllBtn       = document.getElementById('clear-all-btn');
const filterCountBadge  = document.getElementById('filter-count-badge');

// Pagination
const pagePrev    = document.getElementById('page-prev');
const pageNext    = document.getElementById('page-next');
const pageNumbers = document.getElementById('page-numbers');

// View toggle
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');

// Modal
const modalOverlay   = document.getElementById('modal-overlay');
const modalClose     = document.getElementById('modal-close');
const modalImg       = document.getElementById('modal-img');
const modalThumbs    = document.getElementById('modal-thumbs');
const modalBadges    = document.getElementById('modal-badges');
const modalName      = document.getElementById('modal-product-name');
const modalRating    = document.getElementById('modal-rating');
const modalPrice     = document.getElementById('modal-price');
const modalPriceOld  = document.getElementById('modal-price-old');
const modalDesc      = document.getElementById('modal-desc');
const modalSizesWrap = document.getElementById('modal-sizes-wrap');
const modalSizes     = document.getElementById('modal-sizes');
const modalColorsWrap = document.getElementById('modal-colors-wrap');
const modalColors    = document.getElementById('modal-colors');
const modalQtyEl     = document.getElementById('modal-qty');
const modalQtyMinus  = document.getElementById('modal-qty-minus');
const modalQtyPlus   = document.getElementById('modal-qty-plus');
const modalAddCart   = document.getElementById('modal-add-cart-btn');
const modalFullLink  = document.getElementById('modal-full-link');

// Search
const searchBtn     = document.getElementById('search-btn');
const searchOverlay = document.getElementById('search-overlay');
const searchClose   = document.getElementById('search-close');
const searchInput   = document.getElementById('search-input');
const searchClear   = document.getElementById('search-clear');
const searchHint    = document.getElementById('search-hint');

// Sidebar mobile toggle
const filterToggleMobile = document.getElementById('filter-toggle-mobile');
const sidebarInner       = document.getElementById('sidebar-inner');

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateCategoryCounts();
  bindEvents();
  initPriceRange();
  initAuthNavbar();
  initNewsletter();
  initFilterSectionToggles();
  initSearchFromURL();
  applyFiltersAndRender();
});

/* ----------------------------------------------------------
   BIND EVENTS
   ---------------------------------------------------------- */
function bindEvents() {
  // Sort
  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.currentPage = 1;
    applyFiltersAndRender();
  });

  // Category checkboxes
  catAll.addEventListener('change', () => {
    if (catAll.checked) {
      catCheckboxes.forEach(cb => { cb.checked = false; });
      state.filters.categories = [];
    }
    state.currentPage = 1;
    applyFiltersAndRender();
  });

  catCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      catAll.checked = false;
      state.filters.categories = [...catCheckboxes]
        .filter(c => c.checked)
        .map(c => c.value);
      if (state.filters.categories.length === 0) catAll.checked = true;
      state.currentPage = 1;
      applyFiltersAndRender();
    });
  });

  // Availability
  availInputs.forEach(inp => {
    inp.addEventListener('change', () => {
      state.filters.availability = [...availInputs].filter(i => i.checked).map(i => i.value);
      state.currentPage = 1;
      applyFiltersAndRender();
    });
  });

  // Rating
  ratingInputs.forEach(inp => {
    inp.addEventListener('change', () => {
      state.filters.ratings = [...ratingInputs].filter(i => i.checked).map(i => parseFloat(i.value));
      state.currentPage = 1;
      applyFiltersAndRender();
    });
  });

  // Clear all
  clearAllBtn.addEventListener('click', resetFilters);
  document.getElementById('empty-reset-btn').addEventListener('click', resetFilters);

  // View mode
  viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  viewListBtn.addEventListener('click', () => setViewMode('list'));

  // Pagination
  pagePrev.addEventListener('click', () => {
    if (state.currentPage > 1) { state.currentPage--; renderProducts(); scrollToGrid(); }
  });
  pageNext.addEventListener('click', () => {
    const pages = Math.ceil(state.filtered.length / state.perPage);
    if (state.currentPage < pages) { state.currentPage++; renderProducts(); scrollToGrid(); }
  });

  // Modal
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

  // Search
  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    state.search = '';
    state.currentPage = 1;
    searchHint.textContent = 'Start typing to see results';
    applyFiltersAndRender();
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    searchClear.style.display = val ? 'block' : 'none';
    state.search = val.toLowerCase();
    state.currentPage = 1;
    const count = filterProducts().length;
    searchHint.textContent = val
      ? `${count} product${count !== 1 ? 's' : ''} match "${val}"`
      : 'Start typing to see results';
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      closeSearch();
      applyFiltersAndRender();
    }
  });

  // Mobile sidebar toggle
  filterToggleMobile.addEventListener('click', () => {
    sidebarInner.classList.toggle('open');
  });

  // Cart btn → go to cart
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
      const targetId = toggle.dataset.target;
      const target = document.getElementById(targetId);
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
    state.currentPage = 1;
    applyFiltersAndRender();
  }

  priceMinInput.addEventListener('input', updateRange);
  priceMaxInput.addEventListener('input', updateRange);
  updateRange();
}

/* ----------------------------------------------------------
   FILTER + SORT LOGIC
   ---------------------------------------------------------- */
function filterProducts() {
  return PRODUCTS.filter(p => {
    // Search
    if (state.search) {
      const needle = state.search;
      if (
        !p.name.toLowerCase().includes(needle) &&
        !p.category.toLowerCase().includes(needle) &&
        !p.description.toLowerCase().includes(needle)
      ) return false;
    }

    // Category
    if (state.filters.categories.length > 0) {
      if (!state.filters.categories.includes(p.category)) return false;
    }

    // Price
    if (p.price < state.filters.priceMin || p.price > state.filters.priceMax) return false;

    // Availability
    if (state.filters.availability.length > 0) {
      const checks = state.filters.availability;
      if (checks.includes('instock') && !p.inStock) return false;
      if (checks.includes('sale') && !p.oldPrice) return false;
      if (checks.includes('new') && !p.isNew) return false;
    }

    // Rating
    if (state.filters.ratings.length > 0) {
      const minRating = Math.min(...state.filters.ratings);
      if (p.rating < minRating) return false;
    }

    return true;
  });
}

function sortProducts(arr) {
  const sorted = [...arr];
  switch (state.sort) {
    case 'price-asc':  sorted.sort((a, b) => a.price - b.price); break;
    case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
    case 'name-asc':   sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'newest':     sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    case 'rating':     sorted.sort((a, b) => b.rating - a.rating); break;
    case 'featured':
    default:           sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
  }
  return sorted;
}

function applyFiltersAndRender() {
  state.filtered = sortProducts(filterProducts());
  renderProducts();
  updateActiveFilters();
  updateCategoryCounts();
}

/* ----------------------------------------------------------
   RENDER PRODUCTS
   ---------------------------------------------------------- */
function renderProducts() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / state.perPage));
  if (state.currentPage > pages) state.currentPage = pages;

  const start = (state.currentPage - 1) * state.perPage;
  const end   = start + state.perPage;
  const page  = state.filtered.slice(start, end);

  // Results count
  resultsCount.innerHTML = total > 0
    ? `Showing <strong>${start + 1}–${Math.min(end, total)}</strong> of <strong>${total}</strong> products`
    : '0 products found';

  // Empty state
  emptyState.style.display = total === 0 ? 'block' : 'none';
  grid.style.display       = total === 0 ? 'none'  : '';

  grid.innerHTML = page.map(p => renderCard(p)).join('');

  // Bind card events
  grid.querySelectorAll('.action-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid = parseInt(btn.dataset.id);
      const product = PRODUCTS.find(p => p.id === pid);
      if (!product) return;
      addToCart(product, 1);
      const orig = btn.textContent;
      btn.textContent = 'ADDED ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('added');
      }, 1200);
    });
  });

  grid.querySelectorAll('.action-quick-view').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid = parseInt(btn.dataset.id);
      const product = PRODUCTS.find(p => p.id === pid);
      if (product) openModal(product);
    });
  });

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = parseInt(card.dataset.id);
      window.location.href = `product-detail.html?id=${pid}`;
    });
  });

  grid.querySelectorAll('.card-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('active');
      if (btn.classList.contains('active')) {
        showToast('Added to wishlist ♡', 'success');
      } else {
        showToast('Removed from wishlist');
      }
    });
  });

  renderPagination(total, pages);
}

/* ---- Card HTML ---- */
function renderCard(p) {
  const hasSale = p.oldPrice && p.oldPrice > p.price;
  const discountPct = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  const badgeHtml = p.badge
    ? `<span class="badge badge-${p.badge}">${p.badgeText || p.badge}</span>`
    : '';
  const saleHtml = hasSale
    ? `<span class="badge badge-sale">-${discountPct}%</span>`
    : '';

  const stars = renderStars(p.rating);

  const imageHtml = p.image
    ? `<img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" />`
    : `<div class="product-img-placeholder">
        <div class="placeholder-icon">🏋️</div>
        <p>Image coming soon</p>
      </div>`;

  return `
    <article class="product-card" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
      <div class="product-badges">${badgeHtml}${saleHtml}</div>
      <button class="card-wishlist-btn" aria-label="Add to wishlist" title="Wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <div class="product-img-wrap">${imageHtml}</div>
      <div class="product-actions">
        <button class="action-btn action-quick-view" data-id="${p.id}">QUICK VIEW</button>
        <button class="action-btn action-cart" data-id="${p.id}">ADD TO CART</button>
      </div>
      <div class="product-info">
        <p class="product-cat">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="review-count">(${p.reviews})</span>
        </div>
        <div class="product-price-wrap">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          ${p.oldPrice ? `<span class="product-price-old">$${p.oldPrice.toFixed(2)}</span>` : ''}
        </div>
      </div>
    </article>`;
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '★';
    else if (rating >= i - 0.5) html += '½';
    else html += '☆';
  }
  return html;
}

/* ----------------------------------------------------------
   PAGINATION
   ---------------------------------------------------------- */
function renderPagination(total, pages) {
  pagePrev.disabled = state.currentPage <= 1;
  pageNext.disabled = state.currentPage >= pages;

  pageNumbers.innerHTML = '';
  if (pages <= 1) return;

  const range = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - state.currentPage) <= 1) {
      range.push(i);
    } else if (range[range.length - 1] !== '…') {
      range.push('…');
    }
  }

  range.forEach(item => {
    if (item === '…') {
      const ellipsis = document.createElement('span');
      ellipsis.style.cssText = 'padding:0 6px;line-height:40px;color:#aaa;';
      ellipsis.textContent = '…';
      pageNumbers.appendChild(ellipsis);
    } else {
      const btn = document.createElement('button');
      btn.className = 'page-num' + (item === state.currentPage ? ' active' : '');
      btn.textContent = item;
      btn.addEventListener('click', () => {
        state.currentPage = item;
        renderProducts();
        scrollToGrid();
      });
      pageNumbers.appendChild(btn);
    }
  });
}

function scrollToGrid() {
  document.querySelector('.products-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ----------------------------------------------------------
   ACTIVE FILTERS UI
   ---------------------------------------------------------- */
function updateActiveFilters() {
  const tags = [];

  state.filters.categories.forEach(cat => {
    tags.push({ label: cat.charAt(0).toUpperCase() + cat.slice(1), action: () => {
      const cb = document.getElementById('cat-' + cat);
      if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change')); }
    }});
  });

  if (state.filters.availability.includes('instock')) {
    tags.push({ label: 'In Stock', action: () => {
      document.getElementById('avail-instock').checked = false;
      document.getElementById('avail-instock').dispatchEvent(new Event('change'));
    }});
  }
  if (state.filters.availability.includes('sale')) {
    tags.push({ label: 'On Sale', action: () => {
      document.getElementById('avail-sale').checked = false;
      document.getElementById('avail-sale').dispatchEvent(new Event('change'));
    }});
  }
  if (state.filters.availability.includes('new')) {
    tags.push({ label: 'New', action: () => {
      document.getElementById('avail-new').checked = false;
      document.getElementById('avail-new').dispatchEvent(new Event('change'));
    }});
  }

  if (state.filters.priceMin > 0 || state.filters.priceMax < 300) {
    tags.push({ label: `$${state.filters.priceMin}–$${state.filters.priceMax}`, action: () => {
      priceMinInput.value = 0;
      priceMaxInput.value = 300;
      priceMinInput.dispatchEvent(new Event('input'));
    }});
  }

  if (state.search) {
    tags.push({ label: `"${state.search}"`, action: () => {
      state.search = '';
      searchInput.value = '';
      state.currentPage = 1;
      applyFiltersAndRender();
    }});
  }

  const count = tags.length;
  activeFiltersWrap.style.display = count > 0 ? 'block' : 'none';

  // Update mobile badge
  filterCountBadge.textContent = count;
  filterCountBadge.style.display = count > 0 ? 'flex' : 'none';

  activeFilterTags.innerHTML = tags.map((tag, i) => `
    <span class="filter-tag" data-i="${i}">
      ${tag.label} <span class="filter-tag-x">✕</span>
    </span>`).join('');

  activeFilterTags.querySelectorAll('.filter-tag').forEach((el, i) => {
    el.addEventListener('click', () => { tags[i].action(); });
  });
}

function resetFilters() {
  state.filters.categories = [];
  state.filters.availability = [];
  state.filters.ratings = [];
  state.filters.priceMin = 0;
  state.filters.priceMax = 300;
  state.search = '';
  searchInput.value = '';

  catAll.checked = true;
  catCheckboxes.forEach(cb => { cb.checked = false; });
  availInputs.forEach(inp => { inp.checked = false; });
  ratingInputs.forEach(inp => { inp.checked = false; });
  priceMinInput.value = 0;
  priceMaxInput.value = 300;
  priceMinInput.dispatchEvent(new Event('input'));

  state.currentPage = 1;
  applyFiltersAndRender();
}

/* ----------------------------------------------------------
   CATEGORY COUNTS
   ---------------------------------------------------------- */
function updateCategoryCounts() {
  const visibleProducts = state.search
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(state.search) || p.category.toLowerCase().includes(state.search))
    : PRODUCTS;

  document.getElementById('count-all').textContent = visibleProducts.length;
  ['equipment', 'shoes', 'men', 'women'].forEach(cat => {
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = visibleProducts.filter(p => p.category === cat).length;
  });
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
   QUICK VIEW MODAL
   ---------------------------------------------------------- */
function openModal(product) {
  state.modalProduct = product;
  state.modalQty = 1;
  modalQtyEl.textContent = 1;

  // Image
  if (product.image) {
    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalImg.style.display = 'block';
  } else {
    modalImg.src = '';
    modalImg.alt = '';
    modalImg.style.display = 'none';
  }

  // Thumbs
  modalThumbs.innerHTML = product.images.map((src, i) => `
    <div class="modal-thumb${i === 0 ? ' active' : ''}">
      <img src="${src}" alt="${product.name} view ${i+1}" />
    </div>`).join('');
  modalThumbs.querySelectorAll('.modal-thumb').forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      modalImg.src = product.images[i];
      modalThumbs.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Badges
  const hasSale = product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasSale ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  modalBadges.innerHTML =
    (product.badge ? `<span class="badge badge-${product.badge}">${product.badgeText}</span>` : '') +
    (hasSale ? `<span class="badge badge-sale">-${discountPct}%</span>` : '');

  // Info
  modalName.textContent = product.name;
  modalRating.innerHTML = `<span class="stars">${renderStars(product.rating)}</span><span class="review-count">(${product.reviews} reviews)</span>`;
  modalPrice.textContent = '$' + product.price.toFixed(2);
  modalPriceOld.textContent = product.oldPrice ? '$' + product.oldPrice.toFixed(2) : '';
  modalDesc.textContent = product.description;

  // Sizes
  if (product.sizes.length > 0) {
    modalSizesWrap.style.display = 'block';
    modalSizes.innerHTML = product.sizes.map((s, i) =>
      `<button class="size-option${i === 0 ? ' selected' : ''}" data-size="${s}">${s}</button>`
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
  if (product.colors.length > 0) {
    modalColorsWrap.style.display = 'block';
    modalColors.innerHTML = product.colors.map((c, i) =>
      `<button class="color-option${i === 0 ? ' selected' : ''}" data-color="${c}" data-name="${product.colorNames[i]}"
        style="background:${c};border-color:${c === '#fff' ? '#ccc' : c};"
        title="${product.colorNames[i]}"
      ></button>`
    ).join('');
    modalColors.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        modalColors.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  } else {
    modalColorsWrap.style.display = 'none';
  }

  // Full link
  modalFullLink.href = `product-detail.html?id=${product.id}`;

  // Open
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  state.modalProduct = null;
}

/* ----------------------------------------------------------
   SEARCH OVERLAY
   ---------------------------------------------------------- */
function openSearch() {
  searchOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput.focus(), 100);
}

function closeSearch() {
  searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ----------------------------------------------------------
   ADD TO CART
   ---------------------------------------------------------- */
function addToCart(product, qty) {
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]'); } catch(e) {}

  const existing = cart.find(item => item.productId === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image || '',
      qty:       qty,
    });
  }

  localStorage.setItem('aboss_cart', JSON.stringify(cart));
  updateCartBadge();
  showToast(`"${product.name}" added to cart 🛒`, 'success');
}

function updateCartBadge() {
  try {
    const cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
    const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
    if (cartCount) {
      cartCount.textContent = total;
      cartCount.style.transform = 'scale(1.5)';
      setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 200);
    }
  } catch(e) {}
}

/* ----------------------------------------------------------
   TOAST
   ---------------------------------------------------------- */
let toastTimer;
function showToast(msg, type = '') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

/* ----------------------------------------------------------
   AUTH-AWARE NAVBAR
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
      const userChip = document.createElement('a');
      userChip.href = '#';
      userChip.title = 'Click to sign out';
      userChip.style.cssText = `
        font-size:12px;font-weight:600;color:#111;text-decoration:none;
        padding:6px 14px;background:rgba(0,0,0,0.07);border-radius:40px;
        display:flex;align-items:center;gap:6px;transition:background 0.2s;
      `;
      userChip.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        ${session.firstname}
      `;
      userChip.addEventListener('click', (e) => {
  e.preventDefault();
 
  try {
    const s = JSON.parse(localStorage.getItem('aboss_session') || 'null');
    if (s) localStorage.setItem('aboss_cart_' + s.id, localStorage.getItem('aboss_cart') || '[]');
    localStorage.removeItem('aboss_cart');
  } catch(e) {}
  
  localStorage.removeItem('aboss_session');
  sessionStorage.removeItem('aboss_session');
  window.location.reload();
});
      navRight.prepend(userChip);
    } else if (!session && navLeft) {
      const loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'nav-link';
      loginLink.textContent = 'LOGIN';
      navLeft.appendChild(loginLink);
    }
  } catch(e) { /* silently ignore */ }
}

/* ----------------------------------------------------------
   NEWSLETTER
   ---------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('footer-newsletter-form');
  const input = document.getElementById('newsletter-email');
  const fb = document.getElementById('newsletter-feedback');

  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fb.textContent = 'Please enter a valid email.';
      fb.className = 'newsletter-feedback error';
      return;
    }
    fb.textContent = "✓ You're subscribed! Welcome to the crew.";
    fb.className = 'newsletter-feedback success';
    input.value = '';
    setTimeout(() => { fb.textContent = ''; fb.className = 'newsletter-feedback'; }, 4000);
  });
}

/* ----------------------------------------------------------
   INIT SEARCH FROM URL
   ---------------------------------------------------------- */
function initSearchFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery) {
    state.search = searchQuery.toLowerCase();
    searchInput.value = searchQuery;
    searchClear.style.display = 'block';
  }
}
