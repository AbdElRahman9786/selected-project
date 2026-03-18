/* ============================================================
   ABOSS – home.js
   Hero Section Interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     Nav link active state
  ---------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ----------------------------------------------------------
     Slide dots interaction
  ---------------------------------------------------------- */
  const dots = document.querySelectorAll('.dot-indicator');

  function setActiveDot(index) {
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => setActiveDot(i));
  });

  /* ----------------------------------------------------------
     Slider arrows – cycle through dots
  ---------------------------------------------------------- */
  const prevArrow = document.getElementById('prev-arrow');
  const nextArrow = document.getElementById('next-arrow');

  let currentDot = 0;

  function getCurrentDot() {
    for (let i = 0; i < dots.length; i++) {
      if (dots[i].classList.contains('active')) return i;
    }
    return 0;
  }

  prevArrow && prevArrow.addEventListener('click', () => {
    currentDot = (getCurrentDot() - 1 + dots.length) % dots.length;
    setActiveDot(currentDot);
    animateHeroContent();
  });

  nextArrow && nextArrow.addEventListener('click', () => {
    currentDot = (getCurrentDot() + 1) % dots.length;
    setActiveDot(currentDot);
    animateHeroContent();
  });

  /* ----------------------------------------------------------
     Re-trigger hero content animation on arrow click
  ---------------------------------------------------------- */
  function animateHeroContent() {
    const content = document.getElementById('hero-content');
    const imgWrap = document.getElementById('hero-image-wrap');

    if (content) {
      content.style.animation = 'none';
      content.offsetHeight; // reflow
      content.style.animation = '';
      content.style.opacity = '0';
      content.style.transform = 'translateX(-40px)';
      requestAnimationFrame(() => {
        content.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        content.style.opacity = '1';
        content.style.transform = 'translateX(0)';
      });
    }

    if (imgWrap) {
      imgWrap.style.opacity = '0';
      imgWrap.style.transform = 'scale(1.04) translateX(20px)';
      requestAnimationFrame(() => {
        imgWrap.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        imgWrap.style.opacity = '1';
        imgWrap.style.transform = 'scale(1) translateX(0)';
      });
    }
  }

  /* ----------------------------------------------------------
     Auto-advance slides every 5s
  ---------------------------------------------------------- */
  let autoSlide = setInterval(() => {
    currentDot = (getCurrentDot() + 1) % dots.length;
    setActiveDot(currentDot);
  }, 5000);

  // Pause auto-advance on user interaction
  [prevArrow, nextArrow, ...dots].forEach(el => {
    el && el.addEventListener('click', () => {
      clearInterval(autoSlide);
      autoSlide = setInterval(() => {
        currentDot = (getCurrentDot() + 1) % dots.length;
        setActiveDot(currentDot);
      }, 5000);
    });
  });

  /* ----------------------------------------------------------
     Parallax effect on mouse move (subtle geo shapes)
  ---------------------------------------------------------- */
  const hero = document.getElementById('hero');
  const geos = document.querySelectorAll('.geo');

  hero && hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (e.clientX - rect.left - cx) / cx;
    const dy = (e.clientY - rect.top  - cy) / cy;

    geos.forEach((geo, i) => {
      const factor = (i % 3 + 1) * 6;
      geo.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });

  hero && hero.addEventListener('mouseleave', () => {
    geos.forEach(geo => {
      geo.style.transform = 'translate(0, 0)';
      geo.style.transition = 'transform 1s ease';
    });
  });

  /* ----------------------------------------------------------
     Cart button micro-interaction
  ---------------------------------------------------------- */
 const cartBtn = document.getElementById('cart-btn');
  cartBtn && cartBtn.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  /* ----------------------------------------------------------
     CTA button ripple effect
  ---------------------------------------------------------- */
  const cta = document.getElementById('hero-cta');
  cta && cta.addEventListener('click', function (e) {
    
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      top: ${e.clientY - rect.top - size/2}px;
      left: ${e.clientX - rect.left - size/2}px;
      transform: scale(0);
      animation: ripple 0.6s linear forwards;
      pointer-events: none;
    `;
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = '@keyframes ripple { to { transform: scale(4); opacity: 0; } }';
      document.head.appendChild(style);
    }
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  /* ----------------------------------------------------------
     Scroll-reveal: promo banners & product cards
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.promo-card, .product-card, .featured-header');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.6s ${i * 0.08}s ease, transform 0.6s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1)`;
    revealObserver.observe(el);
  });

  /* ----------------------------------------------------------
     Add to Cart – bump counter
  ---------------------------------------------------------- */
  const addCartBtns = document.querySelectorAll('.action-cart');
  const cartCount = document.getElementById('cart-count');
  try {
  const cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');
  const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (cartCount) cartCount.textContent = totalQty;
} catch(e) {}

  addCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
  e.stopPropagation();

  const PRODUCTS_HOME = {
    'add-cart-1': { productId: 1, name: 'Adjustable Dumbbell',  price: 49.99,  image: 'images/product_dumbbell.png'  },
    'add-cart-2': { productId: 2, name: 'Pro Athletic Sneaker', price: 89.99,  image: 'images/product_sneaker.png'   },
    'add-cart-3': { productId: 3, name: 'Speed Jump Rope',      price: 19.99,  image: 'images/product_jump_rope.png' },
    'add-cart-4': { productId: 4, name: 'Kangoo Jump Shoes',    price: 129.99, image: 'images/kangoo_shoes.png'      },
  };

  const product = PRODUCTS_HOME[btn.id];
  if (!product) return;

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]'); } catch(err) {}

  const existing = cart.find(i => i.productId === product.productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem('aboss_cart', JSON.stringify(cart));

  const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (cartCount) {
    cartCount.textContent = totalQty;
    cartCount.style.transform = 'scale(1.6)';
    cartCount.style.transition = 'transform 0.2s ease';
    setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 220);
  }

  const orig = btn.textContent;
  btn.textContent = 'ADDED ✓';
  btn.style.background = '#7bc040';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
  }, 1200);
});
  });

  /* ----------------------------------------------------------
     Quick View – simple console log (extend as needed)
  ---------------------------------------------------------- */
  const quickViewBtns = document.querySelectorAll('[id^="quick-view-"]');
  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productIds = {
        'quick-view-1': 1,
        'quick-view-2': 2,
        'quick-view-3': 3,
        'quick-view-4': 4,
      };
      const id = productIds[btn.id];
      if (id) window.location.href = `product-detail.html?id=${id}`;
    });
  });
  /* ----------------------------------------------------------
     Promo BUY NOW ripple
  ---------------------------------------------------------- */
 document.querySelectorAll('.promo-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const PROMO_PRODUCTS = {
        'promo-btn-1': { productId: 4, name: 'Kangoo Jump Shoes',   price: 129.99, image: 'images/kangoo_shoes.png'     },
        'promo-btn-2': { productId: 1, name: 'Adjustable Dumbbell', price: 49.99,  image: 'images/product_dumbbell.png' },
      };

      const product = PROMO_PRODUCTS[btn.id];
      if (product) {
        let cart = [];
        try { cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]'); } catch(err) {}

        const existing = cart.find(i => i.productId === product.productId);
        if (existing) {
          existing.qty++;
        } else {
          cart.push({ ...product, qty: 1 });
        }

        localStorage.setItem('aboss_cart', JSON.stringify(cart));

        const totalQty = cart.reduce((s, i) => s + (i.qty || 1), 0);
        if (cartCount) {
          cartCount.textContent = totalQty;
          cartCount.style.transform = 'scale(1.6)';
          cartCount.style.transition = 'transform 0.2s ease';
          setTimeout(() => { cartCount.style.transform = 'scale(1)'; }, 220);
        }
      }

      window.location.href = 'cart.html';
    });
  });

  /* ----------------------------------------------------------
     Newsletter form
  ---------------------------------------------------------- */
  const newsletterForm  = document.getElementById('footer-newsletter-form');
  const newsletterInput = document.getElementById('newsletter-email');
  const newsletterFb    = document.getElementById('newsletter-feedback');

  newsletterForm && newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newsletterFb.textContent = 'Please enter a valid email.';
      newsletterFb.className = 'newsletter-feedback error';
      return;
    }
    newsletterFb.textContent = "✓ You're subscribed! Welcome to the crew.";
    newsletterFb.className = 'newsletter-feedback success';
    newsletterInput.value = '';
    setTimeout(() => {
      newsletterFb.textContent = '';
      newsletterFb.className = 'newsletter-feedback';
    }, 4000);
  });

  /* ----------------------------------------------------------
     Auth-aware navbar: show logged-in user chip or LOGIN link
  ---------------------------------------------------------- */
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
      userChip.id = 'user-chip';
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
      loginLink.id = 'nav-login';
      loginLink.className = 'nav-link';
      loginLink.textContent = 'LOGIN';
      navLeft.appendChild(loginLink);
    }
  } catch (e) { /* silently ignore */ }

  /* ----------------------------------------------------------
     Search overlay functionality
  ---------------------------------------------------------- */
  const searchBtn = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  // Open search overlay
  searchBtn && searchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 100);
  });

  // Close search overlay
  const closeSearch = () => {
    searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  searchClose && searchClose.addEventListener('click', closeSearch);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      closeSearch();
    }
  });

  // Close on overlay click (outside search box)
  searchOverlay && searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
      closeSearch();
    }
  });

  // Show/hide clear button
  searchInput && searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    if (searchClear) {
      searchClear.style.display = val ? 'block' : 'none';
    }
  });

  // Clear search input
  searchClear && searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    searchInput.focus();
  });

  // Handle search submission (Enter key)
  searchInput && searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        // Redirect to product listing page with search query
        window.location.href = `product-listing.html?search=${encodeURIComponent(searchTerm)}`;
      }
    }
  });

});
