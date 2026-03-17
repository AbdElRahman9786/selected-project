/* ============================================================
   ABOSS – Product Detail Page JS
   Reads product ID from URL, renders product, handles cart
   ============================================================ */

'use strict';

/* ----------------------------------------------------------
   PRODUCTS DATA
   This is the SAME array used in product-listing.js.
   Keep both in sync whenever you add/edit products.
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
    description: 'Professional-grade adjustable dumbbells with quick-lock mechanism. Perfect for home gym workouts. Weight range: 5–52.5 lbs.',
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
    description: 'Lightweight, responsive running shoes engineered for maximum performance. Breathable mesh upper with energy-return foam midsole.',
    sizes: ['38','39','40','41','42','43','44','45'],
    colors: ['#111','#e53935','#1565c0'],
    colorNames: ['Black','Red','Blue'],
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
    description: 'Competition-grade speed rope with ball-bearing swivel handles and 3mm PVC cable. Ideal for double-unders and HIIT.',
    sizes: [],
    colors: ['#111','#e53935','#7bc040'],
    colorNames: ['Black','Red','Green'],
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
    description: 'Reduce impact by up to 80%. These revolutionary rebound shoes protect joints while delivering an intense cardio workout.',
    sizes: ['36','37','38','39','40','41','42','43'],
    colors: ['#111','#c8a020'],
    colorNames: ['Black','Gold'],
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
    description: 'Set of 5 resistance bands ranging from 10 to 50 lbs.',
    sizes: [],
    colors: ['#e53935','#1565c0','#7bc040','#f5a623','#111'],
    colorNames: ['Red','Blue','Green','Orange','Black'],
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
    description: 'Moisture-wicking performance shirt for intense training sessions.',
    sizes: ['XS','S','M','L','XL','XXL'],
    colors: ['#111','#fff','#1565c0','#e53935'],
    colorNames: ['Black','White','Navy','Red'],
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
    description: 'High-quality boxing gloves designed for training and sparring.',
    sizes: ['10oz','12oz','14oz','16oz'],
    colors: ['#111','#e53935'],
    colorNames: ['Black','Red'],
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
    description: 'High-density foam roller for muscle recovery.',
    sizes: [],
    colors: ['#111','#e53935','#1565c0'],
    colorNames: ['Black','Red','Blue'],
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
    description: 'Lightweight running shorts with built-in liner.',
    sizes: ['S','M','L','XL','XXL'],
    colors: ['#111','#546e7a','#e53935'],
    colorNames: ['Black','Slate','Red'],
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
    description: 'Squat-proof leggings with hidden pocket.',
    sizes: ['XS','S','M','L','XL'],
    colors: ['#111','#424242','#e91e63','#1a237e'],
    colorNames: ['Black','Charcoal','Mauve','Navy'],
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
    description: 'Doorframe pull-up bar with multi-grip positions.',
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
    description: '6mm thick non-slip yoga mat with alignment lines.',
    sizes: [],
    colors: ['#7bc040','#e91e63','#5c6bc0','#111'],
    colorNames: ['Green','Pink','Purple','Black'],
    inStock: true,
    isNew: true,
    featured: false,
  }
];

/* ----------------------------------------------------------
   STATE
   Tracks quantity and selected options for the current product
   ---------------------------------------------------------- */
const state = {
  product: null,     // The current product object
  qty: 1,            // Selected quantity
  selectedSize: null,  // Selected size string
  selectedColor: null, // Selected color hex
};

/* ----------------------------------------------------------
   DOM REFS
   ---------------------------------------------------------- */
const pdLayout      = document.getElementById('pd-layout');
const pdNotFound    = document.getElementById('pd-not-found');
const pdRelated     = document.getElementById('pd-related');

// Breadcrumb
const breadcrumbName = document.getElementById('breadcrumb-name');

// Gallery
const pdMainImg       = document.getElementById('pd-main-img');
const pdImgPlaceholder = document.getElementById('pd-img-placeholder');
const pdThumbs        = document.getElementById('pd-thumbs');
const pdImgBadges     = document.getElementById('pd-img-badges');
const pdWishlistBtn   = document.getElementById('pd-wishlist-btn');

// Info
const pdCategory         = document.getElementById('pd-category');
const pdName             = document.getElementById('pd-name');
const pdStars            = document.getElementById('pd-stars');
const pdReviewCount      = document.getElementById('pd-review-count');
const pdInStock          = document.getElementById('pd-in-stock');
const pdPrice            = document.getElementById('pd-price');
const pdPriceOld         = document.getElementById('pd-price-old');
const pdDiscountBadge    = document.getElementById('pd-discount-badge');
const pdDescription      = document.getElementById('pd-description');
const pdSizesWrap        = document.getElementById('pd-sizes-wrap');
const pdSizes            = document.getElementById('pd-sizes');
const pdSelectedSize     = document.getElementById('pd-selected-size');
const pdColorsWrap       = document.getElementById('pd-colors-wrap');
const pdColors           = document.getElementById('pd-colors');
const pdSelectedColorName = document.getElementById('pd-selected-color-name');
const pdQtyNum           = document.getElementById('pd-qty-num');
const pdQtyMinus         = document.getElementById('pd-qty-minus');
const pdQtyPlus          = document.getElementById('pd-qty-plus');
const pdAddCartBtn       = document.getElementById('pd-add-cart-btn');
const pdBuyNowBtn        = document.getElementById('pd-buy-now-btn');
const pdRelatedGrid      = document.getElementById('pd-related-grid');

// Toast
const toast = document.getElementById('toast');

/* ----------------------------------------------------------
   INIT – Runs when DOM is ready
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Step 1: Read the product ID from the URL query string
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  // Step 2: Find the product in our data
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    // Product not found — show error state
    showNotFound();
    return;
  }

  // Step 3: Render the product
  state.product = product;
  renderProduct(product);
  renderRelated(product);

  // Step 4: Set up interactive events
  bindEvents();

  // Step 5: Update cart badge count
  updateCartBadge();

  // Step 6: Auth-aware navbar
  initAuthNavbar();

  // Step 7: Newsletter
  initNewsletter();

  // Step 8: Update the page <title>
  document.title = `${product.name} – Aboss`;
});

/* ----------------------------------------------------------
   SHOW NOT FOUND
   Hides the product layout and shows the error state
   ---------------------------------------------------------- */
function showNotFound() {
  pdNotFound.style.display = 'block';
  pdLayout.style.display   = 'none';
  document.title = 'Product Not Found – Aboss';
}

/* ----------------------------------------------------------
   RENDER PRODUCT
   Fills all the product detail fields from the product object
   ---------------------------------------------------------- */
function renderProduct(p) {
  // Show the layout
  pdLayout.style.display = 'grid';

  // --- Breadcrumb ---
  breadcrumbName.textContent = p.name;

  // --- Category ---
  pdCategory.textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);

  // --- Name ---
  pdName.textContent = p.name;

  // --- Rating ---
  pdStars.innerHTML = renderStars(p.rating);
  pdReviewCount.textContent = `(${p.reviews} reviews)`;
  if (!p.inStock) {
    pdInStock.textContent = 'Out of Stock';
    pdInStock.style.color = '#e53935';
    pdInStock.style.borderColor = '#e53935';
  }

  // --- Price ---
  pdPrice.textContent = '$' + p.price.toFixed(2);

  if (p.oldPrice) {
    pdPriceOld.textContent = '$' + p.oldPrice.toFixed(2);
    const discPct = Math.round((1 - p.price / p.oldPrice) * 100);
    pdDiscountBadge.textContent = `-${discPct}%`;
  } else {
    pdPriceOld.textContent = '';
    pdDiscountBadge.textContent = '';
  }

  // --- Description ---
  pdDescription.textContent = p.description;

  // --- Image Gallery ---
  renderGallery(p);

  // --- Badge overlays on image ---
  const hasSale = p.oldPrice && p.oldPrice > p.price;
  const discountPct = hasSale ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  pdImgBadges.innerHTML =
    (p.badge ? `<span class="badge badge-${p.badge}">${p.badgeText}</span>` : '') +
    (hasSale ? `<span class="badge badge-sale">-${discountPct}%</span>` : '');

  // --- Sizes ---
  if (p.sizes && p.sizes.length > 0) {
    pdSizesWrap.style.display = 'block';
    pdSizes.innerHTML = p.sizes.map((s, i) =>
      `<button class="size-option${i === 0 ? ' selected' : ''}" data-size="${s}">${s}</button>`
    ).join('');

    // Pre-select the first size
    state.selectedSize = p.sizes[0];
    pdSelectedSize.textContent = p.sizes[0];

    // Click handlers for size buttons
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

  // --- Colors ---
  if (p.colors && p.colors.length > 0) {
    pdColorsWrap.style.display = 'block';
    pdColors.innerHTML = p.colors.map((c, i) =>
      `<button
        class="color-option${i === 0 ? ' selected' : ''}"
        data-color="${c}"
        data-name="${p.colorNames[i]}"
        style="background:${c}; border-color:${c === '#fff' ? '#ccc' : c};"
        title="${p.colorNames[i]}"
        aria-label="${p.colorNames[i]}"
      ></button>`
    ).join('');

    // Pre-select the first color
    state.selectedColor = p.colors[0];
    pdSelectedColorName.textContent = p.colorNames[0];

    // Click handlers for color swatches
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
   Handles the main image + thumbnails strip
   ---------------------------------------------------------- */
function renderGallery(p) {
  const hasImages = p.images && p.images.length > 0 && p.image;

  if (hasImages) {
    // Show the main image
    pdMainImg.src    = p.images[0];
    pdMainImg.alt    = p.name;
    pdMainImg.style.display = 'block';
    pdImgPlaceholder.style.display = 'none';

    // Render thumbnails (only if there's more than 1 image)
    if (p.images.length > 1) {
      pdThumbs.innerHTML = p.images.map((src, i) =>
        `<div class="pd-thumb${i === 0 ? ' active' : ''}" data-i="${i}">
          <img src="${src}" alt="${p.name} view ${i + 1}" loading="lazy" />
        </div>`
      ).join('');

      // Thumbnail click → swap main image
      pdThumbs.querySelectorAll('.pd-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          const idx = parseInt(thumb.dataset.i);
          // Fade-swap the main image
          pdMainImg.style.opacity = '0';
          setTimeout(() => {
            pdMainImg.src = p.images[idx];
            pdMainImg.style.opacity = '1';
          }, 150);
          // Mark active thumb
          pdThumbs.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
      });
    }

  } else {
    // No image available — show placeholder
    pdMainImg.style.display = 'none';
    pdImgPlaceholder.style.display = 'flex';
    pdThumbs.innerHTML = '';
  }
}

/* ----------------------------------------------------------
   RENDER STAR RATING
   Returns HTML string of filled/half/empty stars
   ---------------------------------------------------------- */
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)       html += '★';
    else if (rating >= i - 0.5) html += '★'; // Simplified: treat .5 as full
    else                   html += '☆';
  }
  return html;
}

/* ----------------------------------------------------------
   RENDER RELATED PRODUCTS
   Shows up to 4 products from the same category
   (excluding the current product)
   ---------------------------------------------------------- */
function renderRelated(currentProduct) {
  const related = PRODUCTS
    .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) return;

  pdRelated.style.display = 'block';

  pdRelatedGrid.innerHTML = related.map(p => {
    const imgHtml = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="pd-rel-img" loading="lazy" />`
      : `<div class="pd-rel-placeholder">🏋️</div>`;

    return `
      <article class="pd-rel-card" data-id="${p.id}" tabindex="0" role="button" aria-label="View ${p.name}">
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

  // Click on related card → navigate to that product's detail page
  pdRelatedGrid.querySelectorAll('.pd-rel-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if the user clicked the "ADD TO CART" button inside
      if (e.target.classList.contains('pd-rel-add-cart')) return;
      const pid = card.dataset.id;
      window.location.href = `product-detail.html?id=${pid}`;
    });
  });

  // "Add to cart" on related product cards
  pdRelatedGrid.querySelectorAll('.pd-rel-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = parseInt(btn.dataset.id);
      const product = PRODUCTS.find(p => p.id === pid);
      if (!product) return;
      addToCart(product, 1);
      const orig = btn.textContent;
      btn.textContent = 'ADDED ✓';
      setTimeout(() => { btn.textContent = orig; }, 1200);
    });
  });
}

/* ----------------------------------------------------------
   BIND EVENTS
   Wires up quantity, add to cart, buy now, wishlist
   ---------------------------------------------------------- */
function bindEvents() {
  // Quantity: decrease
  pdQtyMinus.addEventListener('click', () => {
    if (state.qty > 1) {
      state.qty--;
      pdQtyNum.textContent = state.qty;
    }
  });

  // Quantity: increase
  pdQtyPlus.addEventListener('click', () => {
    state.qty++;
    pdQtyNum.textContent = state.qty;
  });

  // Add to Cart
  pdAddCartBtn.addEventListener('click', () => {
    if (!state.product) return;
    addToCart(state.product, state.qty);

    // Animate button to green feedback, then restore
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

  // Buy Now → add to cart then redirect to cart page
  pdBuyNowBtn.addEventListener('click', () => {
    if (!state.product) return;
    addToCart(state.product, state.qty);
    window.location.href = 'cart.html';
  });

  // Wishlist toggle
  pdWishlistBtn.addEventListener('click', () => {
    pdWishlistBtn.classList.toggle('active');
    if (pdWishlistBtn.classList.contains('active')) {
      showToast('Added to wishlist ♡', 'success');
    } else {
      showToast('Removed from wishlist');
    }
  });

  // Cart icon in navbar → go to cart
  document.getElementById('cart-btn').addEventListener('click', () => {
    window.location.href = 'cart.html';
  });
}

/* ----------------------------------------------------------
   ADD TO CART
   Reads localStorage, updates quantity or inserts new item,
   then saves back and updates the navbar badge counter.
   ---------------------------------------------------------- */
function addToCart(product, qty) {
  // Load existing cart (default to empty array if none found)
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  } catch (e) {
    cart = [];
  }

  // Check if this product is already in the cart
  const existing = cart.find(item => item.productId === product.id);

  if (existing) {
    // Already in cart — just increase quantity
    existing.qty += qty;
  } else {
    // New item — push to cart array using the required schema
    cart.push({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      image:     product.image || '',
      qty:       qty,
    });
  }

  // Persist back to localStorage
  localStorage.setItem('aboss_cart', JSON.stringify(cart));

  // Update the cart badge in the navbar
  updateCartBadge();

  // Show a brief toast confirmation
  showToast(`"${product.name}" added to cart 🛒`, 'success');
}

/* ----------------------------------------------------------
   UPDATE CART BADGE
   Reads the cart and sums all quantities to show total count
   ---------------------------------------------------------- */
function updateCartBadge() {
  try {
    const cart  = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
    const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = total;
      // Bounce animation
      badge.style.transform = 'scale(1.5)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }
  } catch (e) { /* ignore */ }
}

/* ----------------------------------------------------------
   TOAST NOTIFICATION
   Shows a small floating message at the bottom of the screen
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
   Shows logged-in user chip, or LOGIN link if not logged in
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
      // User is logged in — show their name as a chip
      const userChip = document.createElement('a');
      userChip.href  = '#';
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
      // Not logged in — show LOGIN link
      const loginLink = document.createElement('a');
      loginLink.href       = 'login.html';
      loginLink.className  = 'nav-link';
      loginLink.textContent = 'LOGIN';
      navLeft.appendChild(loginLink);
    }
  } catch (e) { /* silently ignore any errors */ }
}

/* ----------------------------------------------------------
   NEWSLETTER FORM
   Footer email subscription with basic validation
   ---------------------------------------------------------- */
function initNewsletter() {
  const form  = document.getElementById('footer-newsletter-form');
  const input = document.getElementById('newsletter-email');
  const fb    = document.getElementById('newsletter-feedback');

  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = input.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fb.textContent = 'Please enter a valid email.';
      fb.className   = 'newsletter-feedback error';
      return;
    }

    fb.textContent = "✓ You're subscribed! Welcome to the crew.";
    fb.className   = 'newsletter-feedback success';
    input.value    = '';

    setTimeout(() => {
      fb.textContent = '';
      fb.className   = 'newsletter-feedback';
    }, 4000);
  });
}
