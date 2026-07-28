/* ════════════════════════════════════════════
   Beancraft — script.js
   Vanilla JS: Cart · Modal · Nav · Accessibility
   ════════════════════════════════════════════ */

'use strict';

/* ── Product Data ────────────────────────────── */
const PRODUCTS = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 280,
    img: 'images/espresso.jpg',
    shortDesc: 'Bold, concentrated shot of pure Arabica.',
    fullDesc: 'A bold, concentrated shot of coffee brewed under high pressure — pure, intense, and satisfying. Made from our dark-roast single-origin Arabica beans sourced from the highlands of Ethiopia. The purest ritual start.',
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 380,
    img: 'images/cappuccino.jpg',
    shortDesc: 'Espresso, steamed milk, and thick airy foam.',
    fullDesc: 'Equal parts rich espresso, velvety steamed milk, and a thick layer of airy foam — a classic balanced brew dusted with fine cocoa powder. Our most-ordered morning companion.',
  },
  {
    id: 'latte',
    name: 'Latte',
    price: 420,
    img: 'images/latte.jpg',
    shortDesc: 'Creamy espresso softened by silky steamed milk.',
    fullDesc: 'A gentle, creamy coffee drink with a double shot of espresso softened by silky steamed milk and a thin layer of microfoam. Available on request with oat, almond, or whole milk.',
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    price: 450,
    img: 'images/cold-brew.jpg',
    shortDesc: 'Slow-steeped 18 hours. Smooth, bold, naturally sweet.',
    fullDesc: 'Slow-steeped for 18 hours in cold water to produce a smooth, low-acid concentrate served over hand-cut ice. Bold, refreshing, and naturally sweet — without any added sugar. The perfect afternoon reset.',
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: 480,
    img: 'images/mocha.jpg',
    shortDesc: 'Espresso, dark chocolate sauce, and whipped cream.',
    fullDesc: "Espresso meets rich dark chocolate sauce and steamed milk, finished with a generous swirl of fresh whipped cream. A coffee lover's dessert in a cup — indulgent, warm, and deeply satisfying.",
  },
  {
    id: 'croissant',
    name: 'Croissant',
    price: 320,
    img: 'images/croissant.jpg',
    shortDesc: 'Buttery, flaky puff pastry, fresh from the oven.',
    fullDesc: 'Freshly baked every morning using slow-proofed French butter puff pastry — golden and shatteringly flaky on the outside, pillowy soft inside. The perfect complement to any hot drink.',
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake',
    price: 450,
    img: 'images/cheesecake.jpg',
    shortDesc: 'Creamy New York-style slice with berry compote.',
    fullDesc: 'A generous slice of our signature New York-style cheesecake — dense, creamy, and set on a buttery graham cracker base. Finished with a wild berry compote drizzle. Served chilled.',
  },
  {
    id: 'cookie',
    name: 'Chocolate Cookie',
    price: 180,
    img: 'images/cookie.jpg',
    shortDesc: 'Double-chocolate chip. Crisp edges, molten centre.',
    fullDesc: 'Thick, chewy double-chocolate chip cookie baked fresh daily in small batches. Crisp and caramelised on the edges, perfectly molten in the centre, loaded with dark and milk chocolate chips.',
  },
  {
    id: 'muffin',
    name: 'Blueberry Muffin',
    price: 220,
    img: 'images/muffin.jpg',
    shortDesc: 'Light dome bursting with fresh blueberries.',
    fullDesc: 'Light, sky-high muffin bursting with fresh blueberries and a crunch-top demerara sugar crust. Baked in small batches every morning. Best enjoyed warm, straight from the oven.',
  },
];

/* ── State ───────────────────────────────────── */
let cart                = [];   // [{ id, qty }]
let currentProductId    = null;
let currentQty          = 1;
let lastFocusedElement  = null;

/* ── DOM Refs ────────────────────────────────── */
const $ = id => document.getElementById(id);

const cartBtn      = $('cart-btn');
const cartCount    = $('cart-count');
const cartDrawer   = $('cart-drawer');
const cartOverlay  = $('cart-overlay');
const cartClose    = $('cart-close');
const cartItemsEl  = $('cart-items');
const cartTotal    = $('cart-total');
const checkoutBtn  = $('checkout-btn');

const modal        = $('product-modal');
const modalOverlay = $('modal-overlay');
const modalClose   = $('modal-close');
const modalImg     = $('modal-img');
const modalTitle   = $('modal-title');
const modalDesc    = $('modal-desc');
const modalPrice   = $('modal-price');
const qtyVal       = $('qty-val');
const qtyMinus     = $('qty-minus');
const qtyPlus      = $('qty-plus');
const modalAddBtn  = $('modal-add-btn');

const hamburger    = $('hamburger');
const navMenu      = $('nav-menu');

/* ── Helpers ─────────────────────────────────── */
function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
}

function formatPrice(n) {
  return 'Rs.\u00a0' + n.toLocaleString('en-PK');
}

/* ══════════════════════════════════════════════
   CART
   ══════════════════════════════════════════════ */
function updateCartCount() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = total;
  cartBtn.setAttribute('aria-label', `Open cart, ${total} item${total !== 1 ? 's' : ''}`);
}

function addToCart(id, qty = 1) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  updateCartCount();
  renderCart();
}

function changeItemQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  updateCartCount();
  renderCart();
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
        </svg>
        <p>Your cart is empty</p>
      </div>`;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    const subtotal = product.price * item.qty;
    total += subtotal;
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${product.img}" alt="${product.name}" width="60" height="60" loading="lazy" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatPrice(subtotal)}</div>
        </div>
        <div class="cart-item-qty">
          <button aria-label="Decrease ${product.name} quantity" data-action="dec" data-id="${item.id}">−</button>
          <span aria-label="${item.qty} in cart">${item.qty}</span>
          <button aria-label="Increase ${product.name} quantity" data-action="inc" data-id="${item.id}">+</button>
        </div>
      </div>`;
  }).join('');

  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartDrawer.removeAttribute('hidden');
  // allow paint before triggering transition
  requestAnimationFrame(() => {
    cartDrawer.classList.add('open');
    cartClose.focus();
  });
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.addEventListener('transitionend', () => {
    cartDrawer.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }, { once: true });
}

/* ══════════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════════ */
function openModal(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;

  currentProductId = id;
  currentQty       = 1;

  modalImg.src          = product.img;
  modalImg.alt          = product.name;
  modalTitle.textContent = product.name;
  modalDesc.textContent  = product.fullDesc;
  modalPrice.textContent = formatPrice(product.price);
  qtyVal.textContent     = '1';

  lastFocusedElement = document.activeElement;

  modal.removeAttribute('hidden');
  requestAnimationFrame(() => {
    modal.classList.add('open');
    modalClose.focus();
  });
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', handleModalKey);
}

function closeModal() {
  modal.classList.remove('open');
  modal.addEventListener('transitionend', () => {
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
    lastFocusedElement = null;
  }, { once: true });
  document.removeEventListener('keydown', handleModalKey);
}

function handleModalKey(e) {
  if (e.key === 'Escape') { closeModal(); return; }

  // Focus trap
  if (e.key === 'Tab') {
    const focusable = getFocusable(modal.querySelector('.modal-content'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
}

/* ══════════════════════════════════════════════
   MOBILE NAV
   ══════════════════════════════════════════════ */
function openNav() {
  navMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
}
function closeNav() {
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}
function toggleNav() {
  navMenu.classList.contains('open') ? closeNav() : openNav();
}

/* ══════════════════════════════════════════════
   EVENT LISTENERS
   ══════════════════════════════════════════════ */

/* Cart open / close */
cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* Escape closes cart drawer too */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
});

/* Cart qty changes (event delegation) */
cartItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, id } = btn.dataset;
  changeItemQty(id, action === 'inc' ? 1 : -1);
});

/* Checkout — no backend, show toast-style alert */
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) return;
  closeCart();
  setTimeout(() => {
    alert('🎉 Order placed! Thank you for choosing Beancraft. We\'ll have your order ready shortly.');
    cart = [];
    updateCartCount();
    renderCart();
  }, 400);
});

/* Modal open via card click or keyboard */
document.addEventListener('click', e => {
  const card = e.target.closest('[data-product-id]');
  if (card && !modal.classList.contains('open') && !cartDrawer.classList.contains('open')) {
    openModal(card.dataset.productId);
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('[data-product-id]');
  if (card) { e.preventDefault(); openModal(card.dataset.productId); }
});

/* Modal close */
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

/* Quantity selector */
qtyMinus.addEventListener('click', () => {
  if (currentQty > 1) { currentQty--; qtyVal.textContent = currentQty; }
});
qtyPlus.addEventListener('click', () => {
  currentQty++;
  qtyVal.textContent = currentQty;
});

/* Add to cart from modal */
modalAddBtn.addEventListener('click', () => {
  if (!currentProductId) return;
  addToCart(currentProductId, currentQty);
  closeModal();
  // Brief pulse on cart button to signal success
  cartBtn.style.transform = 'scale(1.15)';
  setTimeout(() => { cartBtn.style.transform = ''; }, 200);
});

/* Mobile nav */
hamburger.addEventListener('click', e => { e.stopPropagation(); toggleNav(); });

/* Close nav when a link is clicked */
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeNav);
});

/* Close nav on outside click */
document.addEventListener('click', e => {
  if (!e.target.closest('#main-nav')) closeNav();
});

/* Escape closes nav */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

/* ══════════════════════════════════════════════
   ACTIVE NAV (IntersectionObserver)
   ══════════════════════════════════════════════ */
const sections  = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

sections.forEach(s => navObserver.observe(s));

/* ── Init ────────────────────────────────────── */
renderCart();
updateCartCount();
