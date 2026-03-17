# Aboss Fitness Store 🏋️

> **Pure HTML · CSS · Vanilla JS — No frameworks, no build tools, no server required.**

Open any `.html` file directly in a browser and it works immediately.

---

## 📁 Project Structure

```
aboss-store/
│
├── images/                        ✅ DONE – All product/hero images
│   ├── hero_athlete.png
│   ├── kangoo_shoes.png
│   ├── dumbbells_cycling.png
│   ├── product_dumbbell.png
│   ├── product_sneaker.png
│   └── product_jump_rope.png
│
├── index.html                     ✅ DONE – Home page (full)
├── home.css                       ✅ DONE – Home page styles
├── home.js                        ✅ DONE – Home page interactivity
│
├── login.html                     ✅ DONE – Login page
├── login.js                       ✅ DONE – Login logic
├── login.css                      ⬜ EMPTY – Not needed (uses auth.css)
│
├── register.html                  ✅ DONE – Register page
├── register.js                    ✅ DONE – Register logic
├── register.css                   ⬜ EMPTY – Not needed (uses auth.css)
│
├── auth.css                       ✅ DONE – Shared styles for login + register
├── auth.js                        ✅ DONE – Shared auth logic (localStorage DB)
│
├── logout.html                    🔲 TODO – Logout page
├── logout.js                      🔲 TODO – Logout logic
├── logout.css                     🔲 TODO – Logout styles (can reuse auth.css)
│
├── product-listing.html           ✅ DONE – Shop / all products page
├── product-listing.js             ✅ DONE – Filter, sort, grid logic
├── product-listing.css            ✅ DONE – Product listing styles
│
├── product-detail.html            🔲 TODO – Single product detail page
├── product-detail.js              🔲 TODO – Add to cart, image gallery logic
├── product-detail.css             🔲 TODO – Product detail styles
│
├── cart.html                      ✅ DONE – Shopping cart page
├── cart.js                        ✅ DONE – Cart CRUD, quantity, totals logic
├── cart.css                       ✅ DONE – Cart styles
│
└── checkout.html                  🔲 TODO – Checkout / order form page
    checkout.js                    🔲 TODO – Form validation, order summary
    checkout.css                   🔲 TODO – Checkout styles
```

---

## ✅ What Is Already Done

### 🏠 Home Page (`index.html` + `home.css` + `home.js`)

* **Navbar** – Fixed top bar with brand logo, nav links, search/wishlist/cart icons
* **Hero Section** – Full-screen slider with floating animated geometric shapes, athlete image, headline, and CTA button

  * Parallax mouse effect on shapes
  * Auto-advancing slide dots (every 5 s), prev/next arrows
  * Ripple click effect on CTA button
* **Promo Banners** – Two side-by-side cards (Kangoo Jumps & Road Cycling) with images and BUY NOW buttons
* **Featured Products Grid** – 4-column grid with product cards

  * NEW / discount badges
  * Hover reveals QUICK VIEW + ADD TO CART buttons
  * ADD TO CART bumps navbar cart counter and shows green feedback
* **Footer** – Dark multi-column footer with:

  * Brand logo + tagline + social icons
  * Shop / Account / Info link columns
  * Newsletter email subscribe form (client-side validation)
  * Copyright bar with policy links
* **Auth-aware Navbar** – Shows logged-in user chip (click to sign out) OR a LOGIN link

### 🔐 Auth System (`auth.js` + `login.html` + `register.html`)

* **Storage** – `localStorage` key `aboss_users` (JSON array, no server needed)
* **Session** – `localStorage` (remember me) or `sessionStorage` (tab-only)
* **Password** – Simple browser-side hash (not plaintext)
* **Login page** – Email + password, remember me checkbox, live validation, loading animation
* **Register page** – First/last name, email, phone (optional), password with strength meter, confirm, terms checkbox
* **Auto-redirect** – Already-logged-in users skip auth pages
* **Export** – Call `AuthLib.exportUsersJSON()` anywhere to download `aboss_users.json`

### 🛍 Product Listing (`product-listing.html` + `product-listing.js` + `product-listing.css`)

* Displays a grid of all products
* **Filter by category** (Women / Men / Equipment / Shoes)
* **Sort** by price, name, newest
* Dynamic product rendering using JavaScript
* Each product links to:

```
product-detail.html?id=XXX
```

### 🛒 Cart System (`cart.html` + `cart.js` + `cart.css`)

* Reads items from `localStorage` key `aboss_cart`
* Displays cart items with image, name, price, and quantity
* **Quantity controls (+ / −)**
* **Remove item button**
* Automatic **subtotal and total calculation**
* **Proceed To Checkout button**
* Navbar cart counter updates automatically

---

## 🔲 What Needs To Be Built

> Each page file is already created as a blank stub. Just fill it in.

### 1. `logout.html / logout.js` — Logout Page

* Call `AuthLib.clearSession()` (already exists in `auth.js`)
* Show a brief "You've been signed out" message
* Redirect to `index.html` after 2 seconds
* **Tip:** Can be a tiny one-screen page, reuse `auth.css` for the layout

### 2. `product-detail.html / .js / .css` — Product Detail Page

* Read `?id=XXX` from the URL with `new URLSearchParams(window.location.search)`
* Show: image gallery, name, price, description, size/color selector
* **ADD TO CART** button → saves to `localStorage` key `aboss_cart`
* **Tip:** Reuse the same product data file from product-listing

### 3. `checkout.html / .js / .css` — Checkout Page

* Shipping address form (name, address, city, postal code, country)
* Payment method selector (card / cash on delivery)
* Order summary sidebar (items from cart)
* On submit → clear `aboss_cart`, save order to `localStorage` key `aboss_orders`, show success screen

---

## 🗄️ localStorage Keys Reference

| Key             | Content                                                                        | Used By            |
| --------------- | ------------------------------------------------------------------------------ | ------------------ |
| `aboss_users`   | `[ { id, firstname, lastname, email, phone, passwordHash, createdAt, role } ]` | auth.js            |
| `aboss_session` | `{ id, firstname, lastname, email, role }`                                     | auth.js, home.js   |
| `aboss_cart`    | `[ { productId, name, price, qty, image } ]`                                   | cart.js            |
| `aboss_orders`  | `[ { orderId, items, total, address, createdAt } ]`                            | checkout.js (TODO) |

---

## 🎨 Design System

All colors, fonts, and spacing use CSS custom properties defined at the top of `home.css`:

```css
:root {
  --black:        #111111;
  --white:        #ffffff;
  --gray-bg:      #f0f0f0;   /* page background */
  --gray-light:   #e8e8e8;
  --gray-mid:     #aaaaaa;
  --green:        #7bc040;   /* badges, success states */
  --font-heading: 'Barlow Condensed', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

**Google Fonts** already loaded in every page head — use `Barlow Condensed` (headings) and `Inter` (body text).

---

## 🔗 Page Navigation Map

```
index.html  ──→  login.html      (navbar LOGIN link / footer)
            ──→  register.html   (footer / login page link)
            ──→  product-listing.html  (nav SHOP / footer)
            ──→  cart.html       (navbar cart icon)

login.html  ──→  index.html      (on success)
            ──→  register.html   (switch link)

register.html ──→ index.html     (on success)
              ──→ login.html     (switch link)

product-listing.html ──→ product-detail.html?id=xxx

product-detail.html  ──→ cart.html   (after ADD TO CART)

cart.html    ──→ checkout.html

checkout.html ──→ index.html     (order success → back to store)
```

---

## ⚡ Quick Tips for Teammates

1. **No npm, no build step** — just edit files and refresh the browser.
2. **Shared auth functions** → always use `window.AuthLib.*` from `auth.js` (already loaded in login/register pages).
3. **Check localStorage** in DevTools → Application → Local Storage → `localhost` to see stored users, sessions, and cart.
4. **Images** all live in `/images/` folder — always use `images/filename.png` as the src path.
5. **Consistent style** — copy the card/button patterns from `index.html` for new pages.
6. **Footer & Navbar** — once product pages are built, consider extracting the navbar + footer into a shared HTML snippet loaded via JS `fetch` + `innerHTML`, to avoid copy-paste across every page.
