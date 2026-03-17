const FREE_SHIPPING_THRESHOLD = 150;
const TAX_RATE = 0.14;

let cart = JSON.parse(localStorage.getItem('aboss_cart') || '[]');

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function renderCheckoutSummary() {
    const previewEl = document.getElementById('checkout-items-preview');
    const subtotalEl = document.getElementById('c-subtotal');
    const shippingEl = document.getElementById('c-shipping');
    const taxEl = document.getElementById('c-tax');
    const totalEl = document.getElementById('c-total');
    const cartCount = document.getElementById('cart-count');

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    let sub = 0;
    previewEl.innerHTML = '';

    cart.forEach(item => {
        sub += item.price * item.qty;
        previewEl.innerHTML += `
            <div class="preview-item">
                <span>${item.name} <strong>x${item.qty}</strong></span>
                <span>$${(item.price * item.qty).toFixed(2)}</span>
            </div>
        `;
    });

    const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : 8.99;
    const tax = sub * TAX_RATE;
    const total = sub + shipping + tax;

    subtotalEl.textContent = `$${sub.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = total.toFixed(2);
    
    if(cartCount) {
        cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
    }
}
 
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


document.addEventListener('DOMContentLoaded', () => {
   
    const { getSession } = window.AuthLib;

    const checkoutForm = document.getElementById('checkout-form');

    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', function (e) {
    e.preventDefault();

   
    const session = JSON.parse(localStorage.getItem('aboss_session') || 'null'); 

    if (!session) {
        alert("You must login first to place an order!");
        window.location.href = 'login.html';
        return; 
    }

    const firstName = document.getElementById('billing-fname').value;
    const lastName  = document.getElementById('billing-lname').value;
    const address   = document.getElementById('billing-address').value;
    const phone     = document.getElementById('billing-phone').value;
    const totalAmount = document.getElementById('c-total').textContent;


    if (phone.length < 11) {
        alert("Please enter a valid 11-digit phone number.");
        return;
    }

    const modal = document.getElementById('order-success-modal');
    
    if (modal) {
        document.getElementById('res-name').innerText = firstName + " " + lastName;
        document.getElementById('res-address').innerText = address;
        document.getElementById('res-phone').innerText = phone;
        
        document.getElementById('res-total').innerText = "$" + totalAmount;

        modal.style.display = 'flex';

        localStorage.removeItem('aboss_cart');
    }
});
});
document.addEventListener('DOMContentLoaded', renderCheckoutSummary);
