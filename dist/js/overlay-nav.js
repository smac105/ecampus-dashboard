// Overlay Navigation Menu Toggle
// Handles opening/closing the full-screen overlay menu

(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('overlayMenuToggle');
    const overlayMenu = document.getElementById('overlayMenu');

    if (!menuToggle || !overlayMenu) {
      return; // Exit if elements don't exist (not using overlay nav)
    }

    // Toggle menu open/close
    menuToggle.addEventListener('click', function() {
      const isActive = overlayMenu.classList.contains('active');

      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking on a link (but not section titles)
    const menuLinks = overlayMenu.querySelectorAll('.overlay-menu-links a, .overlay-menu-item-single a, .overlay-sidebar-links a, .dropdown-overview-link');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlayMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Accordion functionality for menu sections (exclusive - only one open at a time)
    const sectionTitles = overlayMenu.querySelectorAll('.overlay-menu-title[data-section]');
    const menuSections = overlayMenu.querySelector('.overlay-menu-sections');
    const isMobile = function() {
      return window.innerWidth <= 768;
    };

    sectionTitles.forEach(function(title) {
      title.addEventListener('click', function() {
        const sectionName = this.getAttribute('data-section');
        const section = this.closest('.overlay-menu-section');
        const dropdown = overlayMenu.querySelector('.overlay-menu-dropdown[data-dropdown="' + sectionName + '"]');
        const isExpanded = section.classList.contains('expanded');
        const allSections = overlayMenu.querySelectorAll('.overlay-menu-section');
        const allDropdowns = overlayMenu.querySelectorAll('.overlay-menu-dropdown');

        if (isExpanded) {
          // Collapse this section
          section.classList.remove('expanded');
          if (dropdown) {
            dropdown.classList.remove('active');
          }
          this.setAttribute('aria-expanded', 'false');

          // Remove slide-left on mobile
          if (isMobile() && menuSections) {
            menuSections.classList.remove('slide-left');
          }

          // Remove inactive state from all sections when closing
          allSections.forEach(function(s) {
            s.classList.remove('inactive');
          });
        } else {
          // Close all other sections and mark them as inactive
          allSections.forEach(function(s) {
            if (s !== section) {
              s.classList.remove('expanded');
              s.classList.add('inactive');
              const t = s.querySelector('.overlay-menu-title[data-section]');
              if (t) {
                t.setAttribute('aria-expanded', 'false');
              }
            }
          });

          // Hide all other dropdowns
          allDropdowns.forEach(function(d) {
            d.classList.remove('active');
          });

          // Expand this section and show its dropdown
          section.classList.add('expanded');
          section.classList.remove('inactive');
          if (dropdown) {
            dropdown.classList.add('active');
          }
          this.setAttribute('aria-expanded', 'true');

          // Add slide-left on mobile
          if (isMobile() && menuSections) {
            menuSections.classList.add('slide-left');
          }
        }
      });

      // Set initial aria attributes
      title.setAttribute('aria-expanded', 'false');
    });

    // Back button functionality for mobile
    const backButtons = overlayMenu.querySelectorAll('.dropdown-back-button');
    backButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const dropdown = this.closest('.overlay-menu-dropdown');
        const dropdownName = dropdown.getAttribute('data-dropdown');
        const section = overlayMenu.querySelector('.overlay-menu-section[data-section="' + dropdownName + '"]');
        const title = section ? section.querySelector('.overlay-menu-title[data-section]') : null;

        // Remove expanded/active states
        if (section) {
          section.classList.remove('expanded');
        }
        dropdown.classList.remove('active');
        if (title) {
          title.setAttribute('aria-expanded', 'false');
        }

        // Slide main nav back in
        if (menuSections) {
          menuSections.classList.remove('slide-left');
        }

        // Remove inactive states
        const allSections = overlayMenu.querySelectorAll('.overlay-menu-section');
        allSections.forEach(function(s) {
          s.classList.remove('inactive');
        });
      });
    });

    // Prevent body scroll when menu is open
    function openMenu() {
      overlayMenu.classList.add('active');
      menuToggle.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Update button text
      const buttonText = menuToggle.querySelector('.menu-toggle-text');
      if (buttonText) {
        buttonText.textContent = 'Close';
      }

      // Update aria label
      menuToggle.setAttribute('aria-label', 'Close Menu');
    }

    function closeMenu() {
      overlayMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';

      // Update button text
      const buttonText = menuToggle.querySelector('.menu-toggle-text');
      if (buttonText) {
        buttonText.textContent = 'Menu';
      }

      // Update aria label
      menuToggle.setAttribute('aria-label', 'Open Menu');

      // Collapse all sections and hide all dropdowns when menu closes
      const allSections = overlayMenu.querySelectorAll('.overlay-menu-section.expanded');
      allSections.forEach(function(section) {
        section.classList.remove('expanded');
        const title = section.querySelector('.overlay-menu-title[data-section]');
        if (title) {
          title.setAttribute('aria-expanded', 'false');
        }
      });

      const allDropdowns = overlayMenu.querySelectorAll('.overlay-menu-dropdown');
      allDropdowns.forEach(function(dropdown) {
        dropdown.classList.remove('active');
      });

      // Remove slide-left state
      if (menuSections) {
        menuSections.classList.remove('slide-left');
      }
    }
  });
})();
