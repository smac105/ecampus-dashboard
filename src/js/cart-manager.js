// Registration Cart Manager
(function() {
  'use strict';

  const CART_KEY = 'registrationCart';

  // Get cart from localStorage
  function getCart() {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : null;
    } catch (error) {
      console.error('Error reading cart:', error);
      return null;
    }
  }

  // Save cart to localStorage
  function saveCart(cartData) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartData));
      updateCartBadge();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Clear cart
  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
  }

  // Update cart badge count
  function updateCartBadge() {
    const cart = getCart();
    const badge = document.querySelector('[data-cart-badge]');

    if (badge) {
      if (cart && cart.selectedCourses && cart.selectedCourses.length > 0) {
        badge.textContent = cart.selectedCourses.length;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Load cart modal content
  function loadCartModal() {
    const cart = getCart();
    const emptyState = document.getElementById('emptyCartState');
    const pendingState = document.getElementById('pendingCartState');

    if (!emptyState || !pendingState) return;

    if (!cart || !cart.selectedCourses || cart.selectedCourses.length === 0) {
      // Show empty state
      emptyState.style.display = 'block';
      pendingState.style.display = 'none';
    } else {
      // Show pending registration
      emptyState.style.display = 'none';
      pendingState.style.display = 'block';

      // Load courses data if available
      if (cart.coursesData && cart.coursesData.availableCourses) {
        const selectedCourses = cart.selectedCourses.map(id =>
          cart.coursesData.availableCourses.find(c => c.id === id)
        ).filter(Boolean);

        // Render course list
        const cartList = document.getElementById('cartCourseList');
        if (cartList && selectedCourses.length > 0) {
          cartList.innerHTML = selectedCourses.map(course => `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3" style="border-bottom: 1px solid #d9d9d9;">
              <div>
                <p class="h4 mb-1">${course.code} - ${course.name}</p>
                <p class="small-title gray-60 mb-0">${course.credits} credits • $${course.tuition.toLocaleString()}</p>
              </div>
            </div>
          `).join('');
        }

        // Update counts
        const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
        const totalAmount = selectedCourses.reduce((sum, c) => sum + c.tuition, 0);

        const coursesCountEl = document.getElementById('cartCoursesCount');
        const creditsCountEl = document.getElementById('cartCreditsCount');
        const totalAmountEl = document.getElementById('cartTotalAmount');

        if (coursesCountEl) coursesCountEl.textContent = selectedCourses.length;
        if (creditsCountEl) creditsCountEl.textContent = totalCredits;
        if (totalAmountEl) totalAmountEl.textContent = `$${totalAmount.toLocaleString()}`;
      }
    }
  }

  // Initialize cart on page load
  function init() {
    // Update badge on page load
    updateCartBadge();

    // Add cart icon click handler
    const cartIcon = document.querySelector('[href="#"][data-slug="cart"]');
    if (cartIcon) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('registrationCartModal'));
        loadCartModal();
        modal.show();
      });
    }

    // Add clear cart button handler
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your registration cart? This will remove all selected courses.')) {
          clearCart();
          loadCartModal();
        }
      });
    }

    // Listen for modal show event to refresh content
    const cartModal = document.getElementById('registrationCartModal');
    if (cartModal) {
      cartModal.addEventListener('show.bs.modal', loadCartModal);
    }
  }

  // Export functions for use by registration.js
  window.CartManager = {
    getCart,
    saveCart,
    clearCart,
    updateCartBadge
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
