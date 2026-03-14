
const PRODUCTS_DB = [
  { id: 1, name: 'Adjustable Dumbbell',  price: 49.99,  oldPrice: null,  image: 'images/product_dumbbell.png',      category: 'Equipment' },
  { id: 2, name: 'Pro Athletic Sneaker', price: 89.99,  oldPrice: 94.99, image: 'images/product_sneaker.png',       category: 'Shoes'     },
  { id: 3, name: 'Speed Jump Rope',      price: 19.99,  oldPrice: 24.99, image: 'images/product_jump_rope.png',   category: 'Equipment' },
  { id: 4, name: 'Kangoo Jump Shoes',    price: 129.99, oldPrice: null,  image: 'images/kangoo_shoes.png',         category: 'Shoes'     },
];


const FREE_SHIPPING_THRESHOLD = 150;
const TAX_RATE                = 0.14;
const VALID_COUPON            = { code: 'ABOSS10', pct: 10 };


let cart = JSON.parse(localStorage.getItem('aboss_cart') || 'null');

if (!cart) cart = [];


let couponApplied = false;
let discountPct   = 0;


function saveCart() {
  localStorage.setItem('aboss_cart', JSON.stringify(cart));
}

function subtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}


function renderItems() {
  const list      = document.getElementById('cart-items-list');
  const emptyEl   = document.getElementById('empty-cart');
  const couponRow = document.getElementById('coupon-row');

  list.innerHTML = '';

  if (cart.length === 0) {
    emptyEl.style.display   = 'block';
    couponRow.style.display = 'none';
    renderSummary();
    return;
  }

  emptyEl.style.display   = 'none';
  couponRow.style.display = 'flex';

  cart.forEach((item, idx) => {
    const lineTotal = item.price * item.qty;
    const product   = PRODUCTS_DB.find(p => p.id === item.productId) || {};
    const hasOld    = !!product.oldPrice;

    const row = document.createElement('div');
    row.className   = 'cart-item';
    row.dataset.idx = idx;

    row.innerHTML = `
      <div class="item-info">
        <div class="item-img-wrap">
          <img src="${item.image}" alt="${item.name}" class="item-img" onerror="this.style.opacity=0.3" />
          <span class="item-color-dot" style="background:${product.color || '#aaa'}"></span>
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-meta">
            <span class="item-meta-tag">${product.size || ''}</span>
            <span>${product.category || ''}</span>
          </div>
        </div>
      </div>
      <div class="item-price">
        ${hasOld ? `<span class="item-price-old">$${product.oldPrice.toFixed(2)}</span>` : ''}
        $${item.price.toFixed(2)}
      </div>
      <div class="qty-stepper">
        <button class="qty-btn qty-minus" data-idx="${idx}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn qty-plus" data-idx="${idx}">+</button>
      </div>
      <div class="item-total ${hasOld ? 'discounted' : ''}">$${lineTotal.toFixed(2)}</div>
      <button class="remove-btn" data-idx="${idx}" aria-label="Remove item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    list.appendChild(row);
  });

  renderSummary();
  attachItemEvents();
}


function attachItemEvents() {
  document.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.currentTarget.dataset.idx;
      if (cart[idx].qty > 1) {
        cart[idx].qty--;
        saveCart();
        renderItems();
        showToast('Quantity updated');
      }
    });
  });

  document.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = +e.currentTarget.dataset.idx;
      cart[idx].qty++;
      saveCart();
      renderItems();
      showToast('Quantity updated');
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx  = +e.currentTarget.dataset.idx;
      const row  = e.currentTarget.closest('.cart-item');
      const name = cart[idx].name;
      row.classList.add('removing');
      setTimeout(() => {
        cart.splice(idx, 1);
        saveCart();
        renderItems();
        showToast(`"${name}" removed`);
      }, 380);
    });
  });
}


document.getElementById('clear-all-btn').addEventListener('click', () => {
  if (!cart.length) return;
  cart = [];
  saveCart();
  renderItems();
  showToast('Cart cleared');
});

function renderSummary() {
  const sub       = subtotal();
  const discount  = couponApplied ? sub * (discountPct / 100) : 0;
  const afterDisc = sub - discount;
  const shipping  = afterDisc >= FREE_SHIPPING_THRESHOLD ? 0 : 8.99;
  const tax       = afterDisc * TAX_RATE;
  const total     = afterDisc + shipping + tax;

  document.getElementById('s-subtotal').textContent = `$${sub.toFixed(2)}`;
  document.getElementById('s-tax').textContent      = `$${tax.toFixed(2)}`;
  document.getElementById('s-total').textContent    = total.toFixed(2);

  const shippingEl      = document.getElementById('s-shipping');
  shippingEl.textContent = shipping === 0 ? 'FREE ' : `$${shipping.toFixed(2)}`;
  shippingEl.className   = 'summary-value' + (shipping === 0 ? ' free' : '');

  const discountRow = document.getElementById('s-discount-row');
  if (couponApplied) {
    discountRow.style.display = '';
    document.getElementById('s-discount').textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow.style.display = 'none';
  }

  const progress = Math.min((afterDisc / FREE_SHIPPING_THRESHOLD) * 100, 100);
  document.getElementById('shipping-fill').style.width = progress + '%';

  if (afterDisc >= FREE_SHIPPING_THRESHOLD) {
    document.getElementById('shipping-msg').innerHTML = ' You\'ve unlocked <strong>FREE Shipping!</strong>';
  } else {
    const remain = (FREE_SHIPPING_THRESHOLD - afterDisc).toFixed(2);
    document.getElementById('shipping-msg').innerHTML = `Add <strong>$${remain}</strong> more for free shipping!`;
  }

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = totalQty;
  const heroCount = document.getElementById('hero-item-count');
  if (heroCount) heroCount.textContent = totalQty;
}


document.getElementById('coupon-apply').addEventListener('click', () => {
  const val      = document.getElementById('coupon-input').value.trim().toUpperCase();
  const feedback = document.getElementById('coupon-feedback');

  if (val === VALID_COUPON.code) {
    couponApplied = true;
    discountPct   = VALID_COUPON.pct;
    feedback.textContent = `✓ ${VALID_COUPON.pct}% off applied!`;
    feedback.className   = 'coupon-feedback ok';
    renderSummary();
    showToast('Coupon applied! ');
  } else {
    feedback.textContent = 'Invalid coupon code.';
    feedback.className   = 'coupon-feedback err';
  }
  setTimeout(() => { feedback.textContent = ''; feedback.className = 'coupon-feedback'; }, 3500);
});


(function initAuthNavbar() {
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
      chip.href      = '#';
      chip.title     = 'Click to sign out';
      chip.style.cssText = 'font-size:12px;font-weight:600;color:#111;text-decoration:none;padding:6px 14px;background:rgba(0,0,0,0.07);border-radius:40px;display:flex;align-items:center;gap:6px;transition:background 0.2s;';
      chip.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${session.firstname}`;
      chip.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('aboss_session');
        sessionStorage.removeItem('aboss_session');
        location.reload();
      });
      navRight.prepend(chip);
    } else if (!session && navLeft) {
      const loginLink = document.createElement('a');
      loginLink.href       = 'login.html';
      loginLink.className  = 'nav-link';
      loginLink.textContent = 'LOGIN';
      navLeft.appendChild(loginLink);
    }
  } catch (e) {}
})();


(function initNewsletter() {
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
    setTimeout(() => { fb.textContent = ''; fb.className = 'newsletter-feedback'; }, 4000);
  });
})();


document.addEventListener('DOMContentLoaded', () => {

  renderItems();

  setTimeout(() => {
    const progress = Math.min((subtotal() / FREE_SHIPPING_THRESHOLD) * 100, 100);
    document.getElementById('shipping-fill').style.width = progress + '%';
  }, 600);

});