CREATE DATABASE IF NOT EXISTS shop_db;
USE shop_db;

-- ─── USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          ENUM('customer','admin') DEFAULT 'customer',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRODUCTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255)  NOT NULL,
    category    VARCHAR(50)   NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    old_price   DECIMAL(10,2) DEFAULT NULL,
    image       VARCHAR(500)  DEFAULT NULL,
    images      JSON          DEFAULT NULL,
    badge       VARCHAR(20)   DEFAULT NULL,
    badge_text  VARCHAR(20)   DEFAULT NULL,
    rating      DECIMAL(3,1)  DEFAULT 0,
    reviews     INT           DEFAULT 0,
    description TEXT,
    sizes       JSON          DEFAULT NULL,
    colors      JSON          DEFAULT NULL,
    color_names JSON          DEFAULT NULL,
    in_stock    BOOLEAN       DEFAULT TRUE,
    is_new      BOOLEAN       DEFAULT FALSE,
    featured    BOOLEAN       DEFAULT FALSE,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─── CART ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    quantity   INT          DEFAULT 1,
    size       VARCHAR(20)  DEFAULT NULL,
    color      VARCHAR(30)  DEFAULT NULL,
    added_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    user_id          INT           DEFAULT NULL,
    session_id       VARCHAR(100)  DEFAULT NULL,
    first_name       VARCHAR(50)   NOT NULL,
    last_name        VARCHAR(50)   NOT NULL,
    address          TEXT          NOT NULL,
    shipping_address VARCHAR(500)  DEFAULT NULL,
    city             VARCHAR(100)  DEFAULT NULL,
    phone            VARCHAR(20)   NOT NULL,
    subtotal         DECIMAL(10,2) NOT NULL,
    shipping         DECIMAL(10,2) NOT NULL,
    tax              DECIMAL(10,2) NOT NULL,
    total            DECIMAL(10,2) NOT NULL,
    total_amount     DECIMAL(10,2) DEFAULT NULL,
    coupon_code      VARCHAR(50)   DEFAULT NULL,
    discount         DECIMAL(10,2) DEFAULT 0,
    status           ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── ORDER ITEMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id                INT PRIMARY KEY AUTO_INCREMENT,
    order_id          INT NOT NULL,
    product_id        INT NOT NULL,
    product_name      VARCHAR(255)  NOT NULL,
    quantity          INT           NOT NULL,
    price             DECIMAL(10,2) NOT NULL,
    price_at_purchase DECIMAL(10,2) DEFAULT NULL,
    size              VARCHAR(20)   DEFAULT NULL,
    color             VARCHAR(30)   DEFAULT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- ─── PAYMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id               INT PRIMARY KEY AUTO_INCREMENT,
    order_id         INT NOT NULL,
    payment_provider ENUM('stripe','paypal','square','cash_on_delivery') NOT NULL,
    transaction_id   VARCHAR(255) DEFAULT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    status           ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ─── NEWSLETTER ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    email      VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── COUPONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    code         VARCHAR(50) UNIQUE NOT NULL,
    discount_pct INT     NOT NULL,
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════
--  SEED DATA
-- ═══════════════════════════════════════════════════════

-- ─── COUPON ──────────────────────────────────────────────
INSERT IGNORE INTO coupons (code, discount_pct) VALUES ('ABOSS10', 10);

-- ─── PRODUCTS ────────────────────────────────────────────
INSERT INTO products
(name, category, price, old_price, image, images, badge, badge_text, rating, reviews, description, sizes, colors, color_names, in_stock, is_new, featured)
VALUES
('Adjustable Dumbbell Set','equipment',49.99,69.99,
 'images/product_dumbbell.png',
 '["images/product_dumbbell.png","images/dumbbells_cycling.png"]',
 'sale','SALE',4.7,128,
 'Professional-grade adjustable dumbbells with quick-lock mechanism. Perfect for home gym workouts. Weight range: 5-52.5 lbs.',
 '[]','["#111","#888","#c8a020"]','["Black","Silver","Gold"]',TRUE,FALSE,TRUE),

('Pro Athletic Sneaker','shoes',89.99,NULL,
 'images/product_sneaker.png','["images/product_sneaker.png"]',
 'new','NEW',4.5,64,
 'Lightweight, responsive running shoes engineered for maximum performance.',
 '["38","39","40","41","42","43","44","45"]',
 '["#111","#e53935","#1565c0"]','["Black","Red","Blue"]',TRUE,TRUE,TRUE),

('Speed Jump Rope','equipment',19.99,NULL,
 'images/product_jump_rope.png',
 '["images/product_jump_rope.png","images/product_jump_rope 1.jpeg","images/product_jump_rope2.jpeg"]',
 'new','NEW',4.8,213,
 'Competition-grade speed rope with ball-bearing swivel handles.',
 '[]','["#111","#e53935","#7bc040"]','["Black","Red","Green"]',TRUE,TRUE,FALSE),

('Kangoo Jump Shoes','shoes',129.99,159.99,
 'images/kangoo_shoes.png','["images/kangoo_shoes.png"]',
 'hot','HOT',4.6,87,
 'Reduce impact by up to 80%. Protect joints while delivering intense cardio.',
 '["36","37","38","39","40","41","42","43"]',
 '["#111","#c8a020"]','["Black","Gold"]',TRUE,FALSE,TRUE),

('Resistance Band Kit','equipment',34.99,NULL,
 'images/Resistance Band Kit.jpeg','["images/Resistance Band Kit.jpeg"]',
 'new','NEW',4.4,156,
 'Set of 5 resistance bands ranging from 10 to 50 lbs.',
 '[]','["#e53935","#1565c0","#7bc040","#f5a623","#111"]',
 '["Red","Blue","Green","Orange","Black"]',TRUE,TRUE,FALSE),

("Men's Training Tee",'men',29.99,39.99,
 'images/training_shirt.jpeg','["images/training_shirt.jpeg"]',
 'sale','SALE',4.3,92,
 'Moisture-wicking performance shirt for intense training sessions.',
 '["XS","S","M","L","XL","XXL"]',
 '["#111","#fff","#1565c0","#e53935"]','["Black","White","Navy","Red"]',TRUE,FALSE,FALSE),

('Boxing Gloves Pro','equipment',54.99,69.99,
 'images/Boxing_gloves1.jpeg',
 '["images/Boxing_gloves1.jpeg","images/Boxing_gloves2.jpg"]',
 'new','NEW',4.7,112,
 'High-quality boxing gloves designed for training and sparring.',
 '["10oz","12oz","14oz","16oz"]',
 '["#111","#e53935"]','["Black","Red"]',TRUE,TRUE,FALSE),

('Foam Roller Pro','equipment',24.99,NULL,
 'images/Foam Roller Pro.jpg','["images/Foam Roller Pro.jpg"]',
 NULL,NULL,4.5,77,
 'High-density foam roller for muscle recovery.',
 '[]','["#111","#e53935","#1565c0"]','["Black","Red","Blue"]',TRUE,FALSE,FALSE),

("Men's Running Shorts",'men',39.99,49.99,
 'images/men_short.webp','["images/men_short.webp"]',
 'sale','SALE',4.2,43,
 'Lightweight running shorts with built-in liner.',
 '["S","M","L","XL","XXL"]',
 '["#111","#546e7a","#e53935"]','["Black","Slate","Red"]',TRUE,FALSE,FALSE),

("Women's Leggings",'women',64.99,79.99,
 'images/women_leggings.jpeg','["images/women_leggings.jpeg"]',
 'sale','SALE',4.8,318,
 'Squat-proof leggings with hidden pocket.',
 '["XS","S","M","L","XL"]',
 '["#111","#424242","#e91e63","#1a237e"]','["Black","Charcoal","Mauve","Navy"]',TRUE,FALSE,TRUE),

('Pull-Up Bar','equipment',59.99,NULL,
 'images/weight-training-door-pull-up-bar.avif',
 '["images/weight-training-door-pull-up-bar.avif"]',
 NULL,NULL,4.6,55,
 'Doorframe pull-up bar with multi-grip positions. No screws required.',
 '[]','["#111"]','["Black"]',TRUE,FALSE,FALSE),

('Yoga Mat Premium','equipment',49.99,NULL,
 'images/yoga_mat.jpeg','["images/yoga_mat.jpeg"]',
 'new','NEW',4.7,182,
 '6mm thick non-slip yoga mat with alignment lines.',
 '[]','["#7bc040","#e91e63","#5c6bc0","#111"]',
 '["Green","Pink","Purple","Black"]',TRUE,TRUE,FALSE);