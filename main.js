// Theme Toggle Functionality
function initializeTheme() {
  const body = document.body;
  const isDark = localStorage.getItem('theme') === 'dark';
  body.classList.toggle('dark-theme', isDark);
}

function toggleTheme() {
  const body = document.body;
  const isDark = body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Navigation Active State
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === currentPage);
  });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      message: document.getElementById('message').value
    };
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
  });
}

// Shop Functionality
class ShopManager {
  constructor() {
    this.initializeFilters();
    this.initializeCart();
  }

  initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortButtons = document.querySelectorAll('.sort-button');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterProducts(categoryFilter.value));
    }

    sortButtons.forEach(button => {
      button.addEventListener('click', () => {
        sortButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.sortProducts(button.dataset.sort);
      });
    });
  }

  filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
      const shouldShow = category === 'all' || product.dataset.category === category;
      product.style.opacity = '0';
      setTimeout(() => {
        product.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) {
          product.style.opacity = '1';
        }
      }, 300);
    });
  }

  sortProducts(sortType) {
    const productsGrid = document.querySelector('.shop-grid');
    if (!productsGrid) return;

    const products = Array.from(document.querySelectorAll('.product-card'));
    products.forEach(product => product.style.opacity = '0');

    setTimeout(() => {
      products.sort((a, b) => {
        const priceA = parseFloat(a.dataset.price);
        const priceB = parseFloat(b.dataset.price);
        return sortType === 'price-asc' ? priceA - priceB : priceB - priceA;
      });

      products.forEach(product => productsGrid.appendChild(product));

      setTimeout(() => {
        products.forEach(product => product.style.opacity = '1');
      }, 50);
    }, 300);
  }

  initializeCart() {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.updateCartDisplay();

    // Cart Icon Click
    const cartIcon = document.querySelector('.cart-icon');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCart = document.querySelector('.close-cart');

    if (cartIcon && cartSidebar) {
      cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeCart && cartSidebar) {
      closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    // Add to Cart Buttons
    document.querySelectorAll('.shop-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
          this.addToCart({
            id: productCard.dataset.id,
            name: productCard.querySelector('h3').textContent,
            price: parseFloat(productCard.dataset.price),
            image: productCard.querySelector('img').src
          });
        }
      });
    });
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }
    this.updateCart();
    this.showToast(`${product.name} added to cart`);
  }

  updateCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartDisplay();
  }

  updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const totalAmount = document.querySelector('.total-amount');

    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
    }

    if (cartItems) {
      if (this.cart.length === 0) {
        cartItems.innerHTML = `
          <div class="empty-cart">
            <i class="fas fa-shopping-basket"></i>
            <p>Your cart is empty</p>
            <span>Add items to get started</span>
          </div>
        `;
      } else {
        cartItems.innerHTML = this.cart.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-price">$${((item.price * item.quantity) / 100).toFixed(2)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn minus" onclick="shopManager.updateQuantity('${item.id}', -1)">
                  <i class="fas fa-minus"></i>
                </button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" onclick="shopManager.updateQuantity('${item.id}', 1)">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <button class="remove-item" onclick="shopManager.removeItem('${item.id}')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('');
      }
    }

    if (totalAmount) {
      const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalAmount.textContent = `$${(total / 100).toFixed(2)}`;
    }
  }

  updateQuantity(productId, delta) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeItem(productId);
      } else {
        this.updateCart();
      }
    }
  }

  removeItem(productId) {
    const index = this.cart.findIndex(item => item.id === productId);
    if (index > -1) {
      const removedItem = this.cart[index];
      this.cart.splice(index, 1);
      this.updateCart();
      this.showToast(`${removedItem.name} removed from cart`, 'error');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    const container = document.querySelector('.toast-container') || (() => {
      const cont = document.createElement('div');
      cont.className = 'toast-container';
      document.body.appendChild(cont);
      return cont;
    })();

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  setActiveNavLink();

  // Initialize shop functionality if on shop page
  if (window.location.pathname.includes('shop')) {
    window.shopManager = new ShopManager();
  }

  // Apply buttons in careers page
  const applyButtons = document.querySelectorAll('.apply-button');
  applyButtons.forEach(button => {
    button.addEventListener('click', () => {
      alert('Please send your resume to careers@logo.com');
    });
  });
});

// Add theme toggle button event listener
document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
