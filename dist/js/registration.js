// Registration Flow JavaScript
(function() {
  'use strict';

  // State management
  const state = {
    currentStep: 1,
    totalSteps: 5,
    cart: [],
    paymentMethod: 'financial-aid',
    selectedCourses: [],
    disclosuresAccepted: false
  };

  // Load courses data
  let coursesData = null;

  // Total number of steps (including confirmation)
  const TOTAL_STEPS = 5;

  // Initialize registration
  async function init() {
    loadStateFromStorage();
    await loadCoursesData();
    renderStep(state.currentStep);
    attachNavigationListeners();
    updateProgressTracker();
  }

  // Load state from localStorage
  function loadStateFromStorage() {
    const savedState = localStorage.getItem('registrationState');
    if (savedState) {
      Object.assign(state, JSON.parse(savedState));
    }
  }

  // Save state to localStorage
  function saveStateToStorage() {
    localStorage.setItem('registrationState', JSON.stringify(state));

    // Also save to cart if user has selected courses
    if (state.selectedCourses && state.selectedCourses.length > 0) {
      const cartData = {
        selectedCourses: state.selectedCourses,
        currentStep: state.currentStep,
        paymentMethod: state.paymentMethod,
        coursesData: coursesData,
        timestamp: new Date().toISOString()
      };

      if (window.CartManager) {
        window.CartManager.saveCart(cartData);
      } else {
        localStorage.setItem('registrationCart', JSON.stringify(cartData));
      }
    }
  }

  // Load courses data
  async function loadCoursesData() {
    try {
      console.log('Attempting to load courses from /html/data/courses.json');
      const response = await fetch('/html/data/courses.json');
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      coursesData = await response.json();
      console.log('Courses loaded successfully:', coursesData);
    } catch (error) {
      console.error('Failed to load courses data:', error);
      console.log('Using fallback course data');
      // Fallback data
      coursesData = {
        availableCourses: [
          { id: 'CS301', code: 'CS 301', name: 'Advanced Programming', credits: 3, tuition: 1200, prerequisites: [], status: 'available', instructor: 'Dr. Johnson', schedule: 'Mon/Wed 10:00 AM' },
          { id: 'MATH250', code: 'MATH 250', name: 'Calculus III', credits: 4, tuition: 1600, prerequisites: [], status: 'available', instructor: 'Prof. Williams', schedule: 'Tue/Thu 1:00 PM' },
          { id: 'ENGL202', code: 'ENGL 202', name: 'Technical Writing', credits: 3, tuition: 1200, prerequisites: [], status: 'available', instructor: 'Dr. Smith', schedule: 'Mon/Wed 2:00 PM' }
        ],
        completedCourses: [],
        inProgressCourses: []
      };
    }
  }

  // Render specific step
  function renderStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= 5; i++) {
      const stepDiv = document.getElementById(`step${i}`);
      if (stepDiv) {
        stepDiv.style.display = 'none';
      }
    }

    // Show current step
    const currentStepDiv = document.getElementById(`step${stepNumber}`);
    if (currentStepDiv) {
      currentStepDiv.style.display = 'block';
    }

    // Initialize step-specific functionality
    initializeStepContent(stepNumber);
    updateNavigationButtons(stepNumber);
    updateProgressTracker();
    saveStateToStorage();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Initialize step-specific content
  function initializeStepContent(stepNumber) {
    switch (stepNumber) {
      case 1:
        renderCourseList();
        break;
      case 2:
        renderCartItems();
        break;
      case 3:
        attachPaymentMethodListeners();
        attachDisclosureListeners();
        break;
      case 4:
        renderPaymentDetails();
        break;
      case 5:
        renderConfirmation();
        break;
    }
  }

  // Render course list (Step 1)
  function renderCourseList() {
    console.log('renderCourseList called', coursesData);

    if (!coursesData || !coursesData.availableCourses) {
      console.error('No courses data available');
      return;
    }

    const listDiv = document.getElementById('availableCoursesList');
    if (!listDiv) {
      console.error('availableCoursesList element not found');
      return;
    }

    // Render available courses
    const availableHtml = coursesData.availableCourses.map(course => {
      const isSelected = state.selectedCourses.includes(course.id);
      const typeLabel = course.type === 'core' ? 'Core' : 'Elective';
      const typeClass = course.type === 'core' ? 'course-type-core' : 'course-type-elective';
      return `
        <div class="class-card course-card ${isSelected ? 'selected-course' : ''}" data-type="${course.type}" data-status="available">
          <div>
            <input
              type="checkbox"
              id="course-${course.id}"
              data-course-id="${course.id}"
              class="course-checkbox"
              ${isSelected ? 'checked' : ''}
            >
          </div>
          <div>
            <p class="class-title">
              ${course.code} - ${course.name}
              <span class="credits">${course.credits} Credits</span>
              <span class="course-type-pill ${typeClass}">${typeLabel}</span>
            </p>
            <p class="mb-0">${course.instructor} • ${course.schedule}</p>
            ${course.prerequisites.length > 0 ? `
              <p class="mb-0" style="font-size: 1.2rem; color: #6d6d6d;">
                Prerequisites: ${course.prerequisites.join(', ')}
              </p>
            ` : ''}
          </div>
          <div class="open">
            <p class="white mb-0">Course Open</p>
          </div>
          <div class="btn-class-right">
            <p style="font-size: 1.4rem; font-weight: 600; margin-bottom: 0;">$${course.tuition.toLocaleString()}</p>
          </div>
        </div>
      `;
    }).join('');

    // Render completed courses
    const completedHtml = coursesData.completedCourses.map(course => {
      const typeLabel = course.type === 'core' ? 'Core' : 'Elective';
      const typeClass = course.type === 'core' ? 'course-type-core' : 'course-type-elective';
      return `
        <div class="class-card course-card" data-type="${course.type}" data-status="completed">
          <div>
            <input type="checkbox" disabled>
          </div>
          <div>
            <p class="class-title">
              ${course.code} - ${course.name}
              <span class="credits">${course.credits} Credits</span>
              <span class="course-type-pill ${typeClass}">${typeLabel}</span>
            </p>
            <p class="mb-0">${course.term} • Grade: ${course.grade}</p>
          </div>
          <div class="closed" style="background: #80c342;">
            <p class="white mb-0">Completed</p>
          </div>
          <div class="btn-class-right">
            <p style="font-size: 1.4rem; font-weight: 600; margin-bottom: 0; color: #6d6d6d;">—</p>
          </div>
        </div>
      `;
    }).join('');

    listDiv.innerHTML = availableHtml + completedHtml;

    // Attach listeners to checkboxes
    document.querySelectorAll('.course-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', handleCourseSelection);
    });

    // Attach listeners to filter buttons
    document.querySelectorAll('.course-filter-btn').forEach(button => {
      button.addEventListener('click', handleCourseFilter);
    });

    // Update summary
    updateCourseSummary();
  }

  // Handle course filtering
  function handleCourseFilter(event) {
    const filter = event.target.getAttribute('data-filter');

    // Update active button
    document.querySelectorAll('.course-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter courses
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
      const courseType = card.getAttribute('data-type');
      const courseStatus = card.getAttribute('data-status');

      if (filter === 'all') {
        // Show only available courses
        if (courseStatus === 'available') {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      } else if (filter === 'core') {
        // Show only core courses that are available
        if (courseType === 'core' && courseStatus === 'available') {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      } else if (filter === 'electives') {
        // Show only elective courses that are available
        if (courseType === 'elective' && courseStatus === 'available') {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      } else if (filter === 'completed') {
        // Show only completed courses
        if (courseStatus === 'completed') {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      }
    });
  }

  // Handle course selection
  function handleCourseSelection(event) {
    const courseId = event.target.dataset.courseId;

    if (event.target.checked) {
      if (!state.selectedCourses.includes(courseId)) {
        state.selectedCourses.push(courseId);
      }
    } else {
      state.selectedCourses = state.selectedCourses.filter(id => id !== courseId);
    }

    updateCourseSummary();
    saveStateToStorage();
  }

  // Update course summary
  function updateCourseSummary() {
    if (!coursesData) return;

    const selectedCourseObjects = state.selectedCourses.map(id =>
      coursesData.availableCourses.find(c => c.id === id)
    ).filter(Boolean);

    const totalCredits = selectedCourseObjects.reduce((sum, course) => sum + course.credits, 0);
    const coursesCount = selectedCourseObjects.length;
    const status = totalCredits >= 12 ? 'Full-Time' : 'Part-Time';

    const creditsEl = document.getElementById('totalCredits');
    const countEl = document.getElementById('coursesSelected');
    const statusEl = document.getElementById('enrollmentStatus');

    if (creditsEl) creditsEl.textContent = totalCredits;
    if (countEl) countEl.textContent = coursesCount;
    if (statusEl) statusEl.textContent = status;
  }

  // Attach payment method listeners (Step 2)
  function attachPaymentMethodListeners() {
    const radios = document.querySelectorAll('input[name="paymentMethod"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.paymentMethod = e.target.value;
        saveStateToStorage();
      });
    });
  }

  // Render cart items (Step 4)
  function renderCartItems() {
    if (!coursesData) return;

    const listDiv = document.getElementById('cartCoursesList');
    const totalEl = document.getElementById('cartTotal');
    if (!listDiv || !totalEl) return;

    const selectedCourseObjects = state.selectedCourses.map(id =>
      coursesData.availableCourses.find(c => c.id === id)
    ).filter(Boolean);

    const html = selectedCourseObjects.map(course => `
      <div class="white-box d-flex justify-content-between align-items-center mb-3" style="background: #f4f4f4;">
        <div>
          <p class="h4 mb-1">${course.code} - ${course.name}</p>
          <p class="small-title mb-0">${course.credits} credits</p>
        </div>
        <p class="h3 mb-0">$${course.tuition.toLocaleString()}</p>
      </div>
    `).join('');

    const total = selectedCourseObjects.reduce((sum, course) => sum + course.tuition, 0);

    listDiv.innerHTML = html || '<p class="text-gray-600">No courses selected</p>';
    totalEl.textContent = `$${total.toLocaleString()}.00`;
  }

  // Render review summary (Step 5)
  function renderReviewSummary() {
    if (!coursesData) return;

    const selectedCourseObjects = state.selectedCourses.map(id =>
      coursesData.availableCourses.find(c => c.id === id)
    ).filter(Boolean);

    const totalCredits = selectedCourseObjects.reduce((sum, course) => sum + course.credits, 0);
    const total = selectedCourseObjects.reduce((sum, course) => sum + course.tuition, 0);

    const countEl = document.getElementById('reviewCoursesCount');
    const creditsEl = document.getElementById('reviewCredits');
    const methodEl = document.getElementById('reviewPaymentMethod');
    const totalEl = document.getElementById('reviewTotal');

    if (countEl) countEl.textContent = `${selectedCourseObjects.length} courses`;
    if (creditsEl) creditsEl.textContent = totalCredits;
    if (methodEl) methodEl.textContent = formatPaymentMethod(state.paymentMethod);
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}.00`;
  }

  // Attach disclosure listeners (Step 6)
  function attachDisclosureListeners() {
    const checkboxes = document.querySelectorAll('#disclosure1, #disclosure2, #disclosure3, #disclosure4');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        state.disclosuresAccepted = allChecked;
        saveStateToStorage();
      });
    });
  }

  // Render payment details (Step 7)
  function renderPaymentDetails() {
    if (!coursesData) return;

    const selectedCourseObjects = state.selectedCourses.map(id =>
      coursesData.availableCourses.find(c => c.id === id)
    ).filter(Boolean);

    const total = selectedCourseObjects.reduce((sum, course) => sum + course.tuition, 0);
    const amountEl = document.getElementById('paymentAmount');
    if (amountEl) amountEl.textContent = `$${total.toLocaleString()}.00`;
  }

  // Render confirmation (Step 9)
  function renderConfirmation() {
    if (!coursesData) return;

    const selectedCourseObjects = state.selectedCourses.map(id =>
      coursesData.availableCourses.find(c => c.id === id)
    ).filter(Boolean);

    const totalCredits = selectedCourseObjects.reduce((sum, course) => sum + course.credits, 0);
    const total = selectedCourseObjects.reduce((sum, course) => sum + course.tuition, 0);

    const confirmationNumber = 'REG-2025-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    const numberEl = document.getElementById('confirmationNumber');
    const coursesEl = document.getElementById('confirmationCourses');
    const creditsEl = document.getElementById('confirmationCredits');
    const totalEl = document.getElementById('confirmationTotal');

    if (numberEl) numberEl.textContent = confirmationNumber;
    if (coursesEl) coursesEl.textContent = selectedCourseObjects.length;
    if (creditsEl) creditsEl.textContent = totalCredits;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}.00`;

    // Clear state and cart - registration complete!
    localStorage.removeItem('registrationState');
    if (window.CartManager) {
      window.CartManager.clearCart();
    }

    // Celebrate with confetti!
    setTimeout(() => {
      if (typeof celebrateWithConfetti === 'function') {
        celebrateWithConfetti();
      }
    }, 500);
  }

  // Update progress tracker
  function updateProgressTracker() {
    const currentStepEl = document.getElementById('currentStepNumber');
    const progressBar = document.getElementById('progressBar');

    if (currentStepEl) currentStepEl.textContent = state.currentStep;
    if (progressBar) {
      const percentage = (state.currentStep / state.totalSteps) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
      const stepNum = index + 1;
      const circle = indicator.querySelector('.step-circle');
      const number = indicator.querySelector('.step-number');
      const check = indicator.querySelector('.step-check');
      const label = indicator.querySelector('.step-label');
      const line = indicator.querySelector('.step-line');

      if (stepNum < state.currentStep) {
        // Completed
        circle.classList.remove('active');
        circle.classList.add('completed');
        if (number) number.classList.add('hidden');
        if (check) check.classList.remove('hidden');
        if (line) line.classList.add('completed');
      } else if (stepNum === state.currentStep) {
        // Current
        circle.classList.add('active');
        circle.classList.remove('completed');
        if (number) number.classList.remove('hidden');
        if (check) check.classList.add('hidden');
        if (label) label.classList.add('active');
        if (line) line.classList.remove('completed');
      } else {
        // Not started
        circle.classList.remove('active', 'completed');
        if (number) number.classList.remove('hidden');
        if (check) check.classList.add('hidden');
        if (label) label.classList.remove('active');
        if (line) line.classList.remove('completed');
      }
    });
  }

  // Update navigation buttons
  function updateNavigationButtons(stepNumber) {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');
    const navigation = document.getElementById('stepNavigation');

    if (stepNumber === 5) {
      // Hide navigation on confirmation but show the step in progress tracker
      if (navigation) navigation.style.display = 'none';
      return;
    }

    if (navigation) navigation.style.display = 'flex';

    if (backBtn) {
      backBtn.style.display = stepNumber > 1 ? 'block' : 'none';
    }

    if (nextBtn) {
      if (stepNumber === 4) {
        nextBtn.innerHTML = 'Complete Registration';
        nextBtn.classList.remove('btn-main');
        nextBtn.classList.add('btn-secondary');
      } else {
        nextBtn.innerHTML = 'Next';
        nextBtn.classList.add('btn-main');
        nextBtn.classList.remove('btn-secondary');
      }
    }
  }

  // Attach navigation listeners
  function attachNavigationListeners() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (backBtn) {
      backBtn.addEventListener('click', handleBack);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', handleNext);
    }
  }

  // Handle next button
  function handleNext() {
    if (!validateStep(state.currentStep)) {
      return;
    }

    if (state.currentStep < 5) {
      state.currentStep++;
      renderStep(state.currentStep);
    }
  }

  // Handle back button
  function handleBack() {
    if (state.currentStep > 1) {
      state.currentStep--;
      renderStep(state.currentStep);
    }
  }

  // Validate current step
  function validateStep(stepNumber) {
    switch (stepNumber) {
      case 1:
        if (state.selectedCourses.length === 0) {
          alert('Please select at least one course');
          return false;
        }
        break;
      case 3:
        if (!state.disclosuresAccepted) {
          alert('Please accept all disclosures to continue');
          return false;
        }
        break;
    }
    return true;
  }

  // Format payment method for display
  function formatPaymentMethod(method) {
    const methods = {
      'financial-aid': 'Financial Aid',
      'out-of-pocket': 'Out of Pocket',
      'employer': 'Employer Reimbursement',
      'payment-plan': 'Payment Plan'
    };
    return methods[method] || method;
  }

  // Reset registration (for development/testing)
  function resetRegistration() {
    if (confirm('Are you sure you want to reset the registration? This will clear all your selections and return to step 1.')) {
      localStorage.removeItem('registrationState');
      if (window.CartManager) {
        window.CartManager.clearCart();
      }
      state.currentStep = 1;
      state.selectedCourses = [];
      state.paymentMethod = 'financial-aid';
      state.disclosuresAccepted = false;
      renderStep(1);
    }
  }

  // Handle exit registration (save to cart)
  function handleExitRegistration(e) {
    e.preventDefault();

    // If user has selected courses and is in middle of registration, show modal
    if (state.currentStep > 1 && state.currentStep < 5) {
      const exitModal = new bootstrap.Modal(document.getElementById('exitConfirmationModal'));
      exitModal.show();
    } else {
      // Step 1 or 5, just navigate
      window.location.href = '/index.html';
    }
  }

  // Attach reset button listener
  function attachResetListener() {
    const resetBtn = document.getElementById('resetRegistrationBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetRegistration);
    }

    // Attach exit registration listener
    const exitBtn = document.getElementById('exitRegistration');
    if (exitBtn) {
      exitBtn.addEventListener('click', handleExitRegistration);
    }

    // Attach exit confirmation button listener
    const confirmExitBtn = document.getElementById('confirmExitBtn');
    if (confirmExitBtn) {
      confirmExitBtn.addEventListener('click', () => {
        window.location.href = '/index.html';
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      attachResetListener();
    });
  } else {
    init();
    attachResetListener();
  }

})();
