# E-Commerce Project Setup & Run Instructions

## Running with Docker (Recommended)

This project has been containerized and includes 3 main applications and a MySQL database orchestration via Docker Compose.

1. Ensure you have **Docker** and **Docker Compose** installed.
2. In the root directory of this project (where `docker-compose.yml` is located), run the following command:
   ```bash
   docker-compose up -d --build
   ```
Once the containers are built and started, you can access the applications in your browser:
   * **User Frontend:** [http://localhost:8082](http://localhost:8082) (default; port 8080 is often in use on Windows)
   * **Admin Frontend:** [http://localhost:8081](http://localhost:8081)
   admin email: admin@example.com
   password: Admin123!
   * **Flask Backend (Health Check & Endpoints):** [http://localhost:5000/](http://localhost:5000/)
   * **MySQL Database:** localhost:3307

To use host port 8080 for the user frontend instead, set `USER_FRONTEND_PORT=8080` in `.env` or your shell before `docker compose up`.

Paymob checkout is configured through these `.env` values:

* `PAYMOB_API_KEY`
* `PAYMOB_INTEGRATION_ID`
* `PAYMOB_IFRAME_ID`
* `PAYMOB_REDIRECT_URL`
* `PAYMOB_CURRENCY`

When the user places an order, the backend creates the order first, then sends the browser to Paymob. After payment, Paymob returns the user to the redirect page inside this site.

To shut down the containers, run:
```bash
docker-compose down
```

## Running Locally (Frontend Only)

If you only want to view the HTML/CSS/JS files without running the backend container:
1. Navigate to the `apps/user-frontend` or `apps/admin-frontend` directory.
2. Double-click on index.html to open it directly in your web browser, or use a local dev server (like VS Code Live Server).

---
# Aboss Fitness Store ðŸ‹ï¸

> **Pure HTML Â· CSS Â· Vanilla JS â€” No frameworks, no build tools, no server required.**

Open any `.html` file directly in a browser and it works immediately.

---

## ðŸ“ Project Structure

```
aboss-store/
â”‚
â”œâ”€â”€ images/                        âœ… DONE â€“ All product/hero images
â”‚   â”œâ”€â”€ hero_athlete.png
â”‚   â”œâ”€â”€ kangoo_shoes.png
â”‚   â”œâ”€â”€ dumbbells_cycling.png
â”‚   â”œâ”€â”€ product_dumbbell.png
â”‚   â”œâ”€â”€ product_sneaker.png
â”‚   â””â”€â”€ product_jump_rope.png
â”‚
â”œâ”€â”€ index.html                     âœ… DONE â€“ Home page (full)
â”œâ”€â”€ home.css                       âœ… DONE â€“ Home page styles
â”œâ”€â”€ home.js                        âœ… DONE â€“ Home page interactivity
â”‚
â”œâ”€â”€ login.html                     âœ… DONE â€“ Login page
â”œâ”€â”€ login.js                       âœ… DONE â€“ Login logic
â”œâ”€â”€ login.css                      â¬œ EMPTY â€“ Not needed (uses auth.css)
â”‚
â”œâ”€â”€ register.html                  âœ… DONE â€“ Register page
â”œâ”€â”€ register.js                    âœ… DONE â€“ Register logic
â”œâ”€â”€ register.css                   â¬œ EMPTY â€“ Not needed (uses auth.css)
â”‚
â”œâ”€â”€ auth.css                       âœ… DONE â€“ Shared styles for login + register
â”œâ”€â”€ auth.js                        âœ… DONE â€“ Shared auth logic (localStorage DB)
â”‚
â”œâ”€â”€ logout.html                    ðŸ”² TODO â€“ Logout page
â”œâ”€â”€ logout.js                      ðŸ”² TODO â€“ Logout logic
â”œâ”€â”€ logout.css                     ðŸ”² TODO â€“ Logout styles (can reuse auth.css)
â”‚
â”œâ”€â”€ product-listing.html           ðŸ”² TODO â€“ Shop / all products page
â”œâ”€â”€ product-listing.js             ðŸ”² TODO â€“ Filter, sort, grid logic
â”œâ”€â”€ product-listing.css            ðŸ”² TODO â€“ Product listing styles
â”‚
â”œâ”€â”€ product-detail.html            ðŸ”² TODO â€“ Single product detail page
â”œâ”€â”€ product-detail.js              ðŸ”² TODO â€“ Add to cart, image gallery logic
â”œâ”€â”€ product-detail.css             ðŸ”² TODO â€“ Product detail styles
â”‚
â”œâ”€â”€ cart.html                      ðŸ”² TODO â€“ Shopping cart page
â”œâ”€â”€ cart.js                        ðŸ”² TODO â€“ Cart CRUD, quantity, totals logic
â”œâ”€â”€ cart.css                       ðŸ”² TODO â€“ Cart styles
â”‚
â””â”€â”€ checkout.html                  ðŸ”² TODO â€“ Checkout / order form page
    checkout.js                    ðŸ”² TODO â€“ Form validation, order summary
    checkout.css                   ðŸ”² TODO â€“ Checkout styles
```

---

## âœ… What Is Already Done

### ðŸ  Home Page (`index.html` + `home.css` + `home.js`)
- **Navbar** â€“ Fixed top bar with brand logo, nav links, search/wishlist/cart icons
- **Hero Section** â€“ Full-screen slider with floating animated geometric shapes, athlete image, headline, and CTA button
  - Parallax mouse effect on shapes
  - Auto-advancing slide dots (every 5 s), prev/next arrows
  - Ripple click effect on CTA button
- **Promo Banners** â€“ Two side-by-side cards (Kangoo Jumps & Road Cycling) with images and BUY NOW buttons
- **Featured Products Grid** â€“ 4-column grid with product cards
  - NEW / discount badges
  - Hover reveals QUICK VIEW + ADD TO CART buttons
  - ADD TO CART bumps navbar cart counter and shows green feedback
- **Footer** â€“ Dark multi-column footer with:
  - Brand logo + tagline + social icons
  - Shop / Account / Info link columns
  - Newsletter email subscribe form (client-side validation)
  - Copyright bar with policy links
- **Auth-aware Navbar** â€“ Shows logged-in user chip (click to sign out) OR a LOGIN link

### ðŸ” Auth System (`auth.js` + `login.html` + `register.html`)
- **Storage** â€“ `localStorage` key `aboss_users` (JSON array, no server needed)
- **Session** â€“ `localStorage` (remember me) or `sessionStorage` (tab-only)
- **Password** â€“ Simple browser-side hash (not plaintext)
- **Login page** â€“ Email + password, remember me checkbox, live validation, loading animation
- **Register page** â€“ First/last name, email, phone (optional), password with strength meter, confirm, terms checkbox
- **Auto-redirect** â€“ Already-logged-in users skip auth pages
- **Export** â€“ Call `AuthLib.exportUsersJSON()` anywhere to download `aboss_users.json`

---

## ðŸ”² What Needs To Be Built

> Each page file is already created as a blank stub. Just fill it in.

### 1. `logout.html / logout.js` â€” Logout Page
- Call `AuthLib.clearSession()` (already exists in `auth.js`)
- Show a brief "You've been signed out" message
- Redirect to `index.html` after 2 seconds
- **Tip:** Can be a tiny one-screen page, reuse `auth.css` for the layout

### 2. `product-listing.html / .js / .css` â€” Shop Page
- Display a grid of all products (you can hardcode them in a JS array for now)
- **Filters** by category (Women / Men / Equipment / Shoes)
- **Sort** by price, name, newest
- **Each product card** should link to `product-detail.html?id=XXX`
- **Tip:** Store products as a JS array/object in a `products-data.js` file and `<script>` include it

### 3. `product-detail.html / .js / .css` â€” Product Detail Page
- Read `?id=XXX` from the URL with `new URLSearchParams(window.location.search)`
- Show: image gallery, name, price, description, size/color selector
- **ADD TO CART** button â†’ saves to `localStorage` key `aboss_cart`
- **Tip:** Reuse the same product data file from product-listing

### 4. `cart.html / .js / .css` â€” Cart Page
- Read `aboss_cart` from localStorage
- List items with quantity +/âˆ’ controls and remove button
- Show subtotal, shipping estimate, total
- **PROCEED TO CHECKOUT** button â†’ links to `checkout.html`
- **Tip:** Update the navbar cart count badge using the same `aboss_cart` array length

### 5. `checkout.html / .js / .css` â€” Checkout Page
- Shipping address form (name, address, city, postal code, country)
- Payment method selector (card / cash on delivery)
- Order summary sidebar (items from cart)
- On submit â†’ clear `aboss_cart`, save order to `localStorage` key `aboss_orders`, show success screen

---

## ðŸ—„ï¸ localStorage Keys Reference

| Key | Content | Used By |
|-----|---------|---------|
| `aboss_users` | `[ { id, firstname, lastname, email, phone, passwordHash, createdAt, role } ]` | auth.js |
| `aboss_session` | `{ id, firstname, lastname, email, role }` | auth.js, home.js |
| `aboss_cart` | `[ { productId, name, price, qty, image } ]` | cart.js (TODO) |
| `aboss_orders` | `[ { orderId, items, total, address, createdAt } ]` | checkout.js (TODO) |

---

## ðŸŽ¨ Design System

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

**Google Fonts** already loaded in every page head â€” use `Barlow Condensed` (headings) and `Inter` (body text).

---

## ðŸ”— Page Navigation Map

```
index.html  â”€â”€â†’  login.html      (navbar LOGIN link / footer)
            â”€â”€â†’  register.html   (footer / login page link)
            â”€â”€â†’  product-listing.html  (nav SHOP / footer)
            â”€â”€â†’  cart.html       (navbar cart icon)

login.html  â”€â”€â†’  index.html      (on success)
            â”€â”€â†’  register.html   (switch link)

register.html â”€â”€â†’ index.html     (on success)
              â”€â”€â†’ login.html     (switch link)

product-listing.html â”€â”€â†’ product-detail.html?id=xxx

product-detail.html  â”€â”€â†’ cart.html   (after ADD TO CART)

cart.html    â”€â”€â†’ checkout.html

checkout.html â”€â”€â†’ index.html     (order success â†’ back to store)
```

---

## âš¡ Quick Tips for Teammates

1. **No npm, no build step** â€” just edit files and refresh the browser.
2. **Shared auth functions** â†’ always use `window.AuthLib.*` from `auth.js` (already loaded in login/register pages).
3. **Check localStorage** in DevTools â†’ Application â†’ Local Storage â†’ `localhost` to see stored users, sessions, and cart.
4. **Images** all live in `/images/` folder â€” always use `images/filename.png` as the src path.
5. **Consistent style** â€” copy the card/button patterns from `index.html` for new pages.
6. **Footer & Navbar** â€” once product pages are built, consider extracting the navbar + footer into a shared HTML snippet loaded via JS `fetch` + `innerHTML`, to avoid copy-paste across every page.

