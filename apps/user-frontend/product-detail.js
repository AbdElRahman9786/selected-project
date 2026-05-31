'use strict';

const API = 'http://localhost:5000';

const state = {
  product: null,
  qty: 1,
  selectedSize: null,
  selectedColor: null,
};

const pdLayout       = document.getElementById('pd-layout');
const pdNotFound     = document.getElementById('pd-not-found');
const pdRelated      = document.getElementById('pd-related');
const breadcrumbName = document.getElementById('breadcrumb-name');
const pdMainImg      = document.getElementById('pd-main-img');
const pdImgPlaceholder = document.getElementById('pd-img-placeholder');
const pdThumbs       = document.getElementById('pd-thumbs');
const pdImgBadges    = document.getElementById('pd-img-badges');
const pdWishlistBtn  = document.getElementById('pd-wishlist-btn');
const pdCategory     = document.getElementById('pd-category');
const pdName         = document.getElementById('pd-name');
const pdStars        = document.getElementById('pd-stars');
const pdReviewCount  = document.getElementById('pd-review-count');
const pdInStock      = document.getElementById('pd-in-stock');
const pdPrice        = document.getElementById('pd-price');
const pdPriceOld     = document.getElementById('pd-price-old');
const pdDiscountBadge = document.getElementById('pd-discount-badge');
const pdDescription  = document.getElementById('pd-description');
const pdSizesWrap    = document.getElementById('pd-sizes-wrap');
const pdSizes        = document.getElementById('pd-sizes');
const pdSelectedSize = document.getElementById('pd-selected-size');
const pdColorsWrap   = document.getElementById('pd-colors-wrap');
const pdColors       = document.getElementById('pd-colors');
const pdSelectedColorName = document.getElementById('pd-selected-color-name');
const pdQtyNum       = document.getElementById('pd-qty-num');
const pdQtyMinus     = document.getElementById('pd-qty-minus');
const pdQtyPlus      = document.getElementById('pd-qty-plus');
const pdAddCartBtn   = document.getElementById('pd-add-cart-btn');
const pdBuyNowBtn    = document.getElementById('pd-buy-now-btn');
const pdRelatedGrid  = document.getElementById('pd-related-grid');
const toast          = document.getElementById('toast');
const cartCount      = document.getElementById('cart-count');

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', async () => {
   initAuthNavbar();  
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'));

  if (!id) { showNotFound(); return; }

  try {
    
    const res  = await fetch(`${API}/api/products/${id}`);
    if (!res.ok) { showNotFound(); return; }
    const product = await res.json();

    state.product = product;
    renderProduct(product);
    bindEvents();
    updateCartBadge();
    initNewsletter();
    document.title = `${product.name} – Aboss`;

   
    const relRes  = await fetch(`${API}/api/products/${id}/related`);
    const relData = await relRes.json();
    renderRelated(relData.related || []);

  } catch (e) {
    console.error(e);
    showNotFound();
  }
});

/* ----------------------------------------------------------
   SHOW NOT FOUND
   ---------------------------------------------------------- */
function showNotFound() {
  pdNotFound.style.display = 'block';
  pdLayout.style.display   = 'none';
  document.title = 'Product Not Found – Aboss';
}

/* ----------------------------------------------------------
   RENDER PRODUCT
   ---------------------------------------------------------- */
function renderProduct(p) {
  pdLayout.style.display = 'grid';
  breadcrumbName.textContent = p.name;
  pdCategory.textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  pdName.textContent     = p.name;
  pdStars.innerHTML      = renderStars(p.rating);
  pdReviewCount.textContent = `(${p.reviews} reviews)`;

  if (!p.inStock) {
    pdInStock.textContent    = 'Out of Stock';
    pdInStock.style.color    = '#e53935';
    pdInStock.style.borderColor = '#e53935';
  }

  pdPrice.textContent = '$' + p.price.toFixed(2);
  if (p.oldPrice) {
    pdPriceOld.textContent    = '$' + p.oldPrice.toFixed(2);
    pdDiscountBadge.textContent = `-${Math.round((1 - p.price / p.oldPrice) * 100)}%`;
  } else {
    pdPriceOld.textContent    = '';
    pdDiscountBadge.textContent = '';
  }

  pdDescription.textContent = p.description;
  renderGallery(p);

  const hasSale = p.oldPrice && p.oldPrice > p.price;
  pdImgBadges.innerHTML =
    (p.badge ? `<span class="badge badge-${p.badge}">${p.badgeText}</span>` : '') +
    (hasSale  ? `<span class="badge badge-sale">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : '');

  // Sizes
  if (p.sizes && p.sizes.length > 0) {
    pdSizesWrap.style.display = 'block';
    pdSizes.innerHTML = p.sizes.map((s, i) =>
      `<button class="size-option${i===0?' selected':''}" data-size="${s}">${s}</button>`
    ).join('');
    state.selectedSize = p.sizes[0];
    pdSelectedSize.textContent = p.sizes[0];
    pdSizes.querySelectorAll('.size-option').forEach(btn => {
      btn.addEventListener('click', () => {
        pdSizes.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedSize = btn.dataset.size;
        pdSelectedSize.textContent = btn.dataset.size;
      });
    });
  } else {
    pdSizesWrap.style.display = 'none';
  }

  // Colors
  if (p.colors && p.colors.length > 0) {
    pdColorsWrap.style.display = 'block';
    pdColors.innerHTML = p.colors.map((c, i) =>
      `<button class="color-option${i===0?' selected':''}"
        data-color="${c}" data-name="${p.colorNames[i]}"
        style="background:${c};border-color:${c==='#fff'?'#ccc':c}"
        title="${p.colorNames[i]}" aria-label="${p.colorNames[i]}"></button>`
    ).join('');
    state.selectedColor = p.colors[0];
    pdSelectedColorName.textContent = p.colorNames[0];
    pdColors.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', () => {
        pdColors.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedColor = btn.dataset.color;
        pdSelectedColorName.textContent = btn.dataset.name;
      });
    });
  } else {
    pdColorsWrap.style.display = 'none';
  }
}

/* ----------------------------------------------------------
   RENDER GALLERY
   ---------------------------------------------------------- */
function renderGallery(p) {
  const hasImages = p.images && p.images.length > 0;
  if (hasImages) {
    pdMainImg.src   = p.images[0];
    pdMainImg.alt   = p.name;
    pdMainImg.style.display = 'block';
    pdImgPlaceholder.style.display = 'none';

    if (p.images.length > 1) {
      pdThumbs.innerHTML = p.images.map((src, i) =>
        `<div class="pd-thumb${i===0?' active':''}" data-i="${i}">
          <img src="${src}" alt="${p.name} view ${i+1}" loading="lazy" />
        </div>`
      ).join('');
      pdThumbs.querySelectorAll('.pd-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = parseInt(thumb.dataset.i);
          pdMainImg.style.opacity = '0';
          setTimeout(() => { pdMainImg.src = p.images[idx]; pdMainImg.style.opacity = '1'; }, 150);
          pdThumbs.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
      });
    }
  } else {
    pdMainImg.style.display = 'none';
    pdImgPlaceholder.style.display = 'flex';
    pdThumbs.innerHTML = '';
  }
}

/* ----------------------------------------------------------
   RENDER RELATED
   ---------------------------------------------------------- */
function renderRelated(related) {
  if (!related || related.length === 0) return;
  pdRelated.style.display = 'block';

  pdRelatedGrid.innerHTML = related.map(p => {
    const imgHtml = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="pd-rel-img" loading="lazy" />`
      : `<div class="pd-rel-placeholder">🏋️</div>`;
    return `
      <article class="pd-rel-card" data-id="${p.id}" tabindex="0">
        <div class="pd-rel-img-wrap">
          ${imgHtml}
          <button class="pd-rel-add-cart" data-id="${p.id}">ADD TO CART</button>
        </div>
        <div class="pd-rel-info">
          <p class="pd-rel-cat">${p.category}</p>
          <p class="pd-rel-name">${p.name}</p>
          <p class="pd-rel-price">$${p.price.toFixed(2)}</p>
        </div>
      </article>`;
  }).join('');

  pdRelatedGrid.querySelectorAll('.pd-rel-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('pd-rel-add-cart')) return;
      window.location.href = `product-detail.html?id=${card.dataset.id}`;
    });
  });

  pdRelatedGrid.querySelectorAll('.pd-rel-add-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const pid = parseInt(btn.dataset.id);
      const product = related.find(p => p.id === pid);
      if (!product) return;
      addToCart(product, 1);
      btn.textContent = 'ADDED ✓';
      setTimeout(() => { btn.textContent = 'ADD TO CART'; }, 1200);
    });
  });
}

/* ----------------------------------------------------------
   BIND EVENTS
   ---------------------------------------------------------- */
function bindEvents() {
  pdQtyMinus.addEventListener('click', () => {
    if (state.qty > 1) { state.qty--; pdQtyNum.textContent = state.qty; }
  });
  pdQtyPlus.addEventListener('click', () => {
    state.qty++;
    pdQtyNum.textContent = state.qty;
  });

  pdAddCartBtn.addEventListener('click', () => {
    if (!state.product) return;
    addToCart(state.product, state.qty);
    pdAddCartBtn.textContent = 'ADDED ✓';
    pdAddCartBtn.classList.add('added');
    setTimeout(() => {
      pdAddCartBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        ADD TO CART`;
      pdAddCartBtn.classList.remove('added');
    }, 1400);
  });

  pdBuyNowBtn.addEventListener('click', () => {
    if (!state.product) return;
    addToCart(state.product, state.qty);
    window.location.href = 'cart.html';
  });

  pdWishlistBtn.addEventListener('click', () => {
    if (!state.product) return;
    toggleWishlist(state.product.id);
    pdWishlistBtn.classList.toggle('active');
    showToast(isWishlisted(state.product.id) ? 'Added to wishlist!' : 'Removed from wishlist!');
  });
}

/* ----------------------------------------------------------
   CART
   ---------------------------------------------------------- */
function getSessionId() {
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

function addToCart(product, qty = 1) {
  const cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  const existing = cart.find(i => i.productId === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image,
      qty,
      size:      state.selectedSize  || null,
      color:     state.selectedColor || null,
    });
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
      quantity:   qty,
      size:       state.selectedSize,
      color:      state.selectedColor,
    })
  }).catch(e => console.error('Cart API error:', e));
}

function updateCartBadge() {
  const cart  = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  const total = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  if (cartCount) cartCount.textContent = total;
}


/* ----------------------------------------------------------
   WISHLIST
   ---------------------------------------------------------- */
function getWishlist()    { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
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