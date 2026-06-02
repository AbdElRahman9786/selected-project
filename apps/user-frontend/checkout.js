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
    const previewEl  = document.getElementById('checkout-items-preview');
    const subtotalEl = document.getElementById('c-subtotal');
    const shippingEl = document.getElementById('c-shipping');
    const taxEl      = document.getElementById('c-tax');
    const totalEl    = document.getElementById('c-total');
    const cartCount  = document.getElementById('cart-count');

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
    const tax      = sub * TAX_RATE;
    const total    = sub + shipping + tax;

    subtotalEl.textContent = `$${sub.toFixed(2)}`;
    shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxEl.textContent      = `$${tax.toFixed(2)}`;
    totalEl.textContent    = total.toFixed(2);

    if (cartCount) {
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
            loginLink.href        = 'login.html';
            loginLink.className   = 'nav-link';
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

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = input.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            fb.textContent = 'Please enter a valid email.';
            fb.className   = 'newsletter-feedback error';
            return;
        }
        try {
            const res  = await fetch('http://localhost:5000/api/newsletter', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email })
            });
            const data = await res.json();
            fb.textContent = res.ok ? '✓ Subscribed successfully!' : data.error;
            fb.className   = res.ok ? 'newsletter-feedback success' : 'newsletter-feedback error';
            if (res.ok) input.value = '';
        } catch {
            fb.textContent = 'Something went wrong.';
            fb.className   = 'newsletter-feedback error';
        }
        setTimeout(() => { fb.textContent = ''; fb.className = 'newsletter-feedback'; }, 4000);
    });
})();

document.addEventListener('DOMContentLoaded', () => {

    renderCheckoutSummary();

    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', async function (e) {
        e.preventDefault();

      const session = JSON.parse(
    localStorage.getItem('aboss_session') ||
    sessionStorage.getItem('aboss_session') ||
    'null'
);

        if (!session) {
            alert("You must login first to place an order!");
            window.location.href = 'login.html';
            return;
        }

        const firstName = document.getElementById('billing-fname').value.trim();
        const lastName  = document.getElementById('billing-lname').value.trim();
        const address   = document.getElementById('billing-address').value.trim();
        const city      = document.getElementById('billing-city').value.trim();
        const email     = document.getElementById('billing-email').value.trim();
        const phone     = document.getElementById('billing-phone').value.trim();

        if (!firstName || !lastName || !address || !city || !email || !phone) {
            alert('Please fill in all billing details before placing the order.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (phone.length < 11) {
            alert("Please enter a valid 11-digit phone number.");
            return;
        }

       
        const sub      = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const shipping = sub >= FREE_SHIPPING_THRESHOLD ? 0 : 8.99;
        const tax      = sub * TAX_RATE;
        const total    = sub + shipping + tax;

        
        const payload = {
            user_id: session?.id ?? session?.user_id ?? session?.userId ?? null,
            session_id: localStorage.getItem('aboss_session_id') || ('guest_' + Date.now()),
            first_name: firstName,
            last_name:  lastName,
            address,
            city,
            email,
            phone,
            subtotal: parseFloat(sub.toFixed(2)),
            shipping: parseFloat(shipping.toFixed(2)),
            tax:      parseFloat(tax.toFixed(2)),
            total:    parseFloat(total.toFixed(2)),
            items: cart.map(i => ({
                product_id: i.productId,
                name:       i.name,
                qty:        i.qty,
                price:      i.price,
                size:       i.size  || null,
                color:      i.color || null,
            }))
        };

        try {
            const res  = await fetch('http://localhost:5000/api/orders', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) {
                alert('Order error: ' + (data.error || 'Something went wrong'));
                return;
            }

            const orderId = data.order_id;

            // Show a loading indicator while setting up payment
            const btn = checkoutForm.querySelector('.checkout-btn') ||
                        document.querySelector('[type="submit"]');
            if (btn) {
                btn.disabled    = true;
                btn.textContent = 'Redirecting to payment...';
            }

            const paymobRes = await fetch('http://localhost:5000/api/paymob/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    email,
                    city,
                })
            });
            const paymobData = await paymobRes.json();

            console.log('[Paymob] session response:', paymobData);

            if (!paymobRes.ok) {
                const detail = paymobData.detail
                    ? JSON.stringify(paymobData.detail)
                    : '';
                alert(
                    'Payment setup error: ' +
                    (paymobData.error || 'Please try again') +
                    (detail ? '\n\nDetail: ' + detail : '')
                );
                if (btn) {
                    btn.disabled    = false;
                    btn.innerHTML   = 'PLACE ORDER <span class="checkout-btn-icon">→</span>';
                }
                return;
            }

            if (!paymobData.payment_url) {
                console.error('[Paymob] No payment_url in response:', paymobData);
                alert('Payment error: No redirect URL returned. Please contact support.');
                if (btn) {
                    btn.disabled    = false;
                    btn.innerHTML   = 'PLACE ORDER <span class="checkout-btn-icon">→</span>';
                }
                return;
            }

            // Clear cart and redirect to Paymob
            localStorage.removeItem('aboss_cart');
            window.location.href = paymobData.payment_url;

        } catch (err) {
            console.error('[Checkout] Network error:', err);
            alert('Network error: ' + err.message + '\nPlease check your connection and try again.');
        }
    });

});