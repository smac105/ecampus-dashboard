// Registration Flow JavaScript
// Place this file in: src/js/registration-flow.js

(function() {
  'use strict';

  // State Management
  const state = {
    currentStep: 1,
    selectedCourses: [],
    intendedPayment: null,
    cartCourses: [],
    completedSteps: [],
    userData: {
      address: {
        street: '123 Main Street',
        city: 'Boston',
        state: 'MA',
        zip: '02115'
      }
    }
  };

  // Sample Course Data
  const coursesData = [
    {
      id: 'CS101',
      code: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 3,
      description: 'Fundamental concepts of computer science and programming',
      prerequisites: 'None',
      available: true
    },
    {
      id: 'MATH201',
      code: 'MATH201',
      title: 'Calculus I',
      credits: 4,
      description: 'Limits, derivatives, and integrals',
      prerequisites: 'High School Algebra',
      available: true
    },
    {
      id: 'ENG102',
      code: 'ENG102',
      title: 'English Composition',
      credits: 3,
      description: 'Academic writing and research skills',
      prerequisites: 'None',
      available: true
    },
    {
      id: 'HIST150',
      code: 'HIST150',
      title: 'World History',
      credits: 3,
      description: 'Survey of world civilizations',
      prerequisites: 'None',
      available: true
    }
  ];

  // Initialize
  function init() {
    renderAcademicPlan();
    setupEventListeners();
    loadSavedAddress();
  }

  // Render Academic Plan (Step 1)
  function renderAcademicPlan() {
    const container = document.getElementById('academicPlanCourses');
    if (!container) return;

    container.innerHTML = coursesData.map(course => `
      <div class="course-card" data-course-id="${course.id}">
        <div class="course-card__header">
          <div>
            <div class="course-card__code">${course.code}</div>
            <h3 class="course-card__title">${course.title}</h3>
          </div>
          <input type="checkbox" class="course-card__checkbox" />
        </div>
        <p>${course.description}</p>
        <div class="course-card__details">
          <div class="course-card__detail">
            <strong>Credits:</strong> ${course.credits}
          </div>
          <div class="course-card__detail">
            <strong>Prerequisites:</strong> ${course.prerequisites}
          </div>
        </div>
        <div class="course-card__actions">
          <button class="btn btn--secondary" onclick="showCourseModal('${course.id}')">View Details</button>
        </div>
      </div>
    `).join('');

    // Add click handlers for course cards
    container.querySelectorAll('.course-card').forEach(card => {
      const checkbox = card.querySelector('.course-card__checkbox');
      
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn')) return;
        checkbox.checked = !checkbox.checked;
        toggleCourseSelection(card, checkbox.checked);
      });

      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCourseSelection(card, checkbox.checked);
      });
    });
  }

  // Toggle Course Selection
  function toggleCourseSelection(card, isSelected) {
    const courseId = card.dataset.courseId;
    
    if (isSelected) {
      card.classList.add('selected');
      if (!state.selectedCourses.includes(courseId)) {
        state.selectedCourses.push(courseId);
      }
    } else {
      card.classList.remove('selected');
      state.selectedCourses = state.selectedCourses.filter(id => id !== courseId);
    }

    updateBeginRegistrationButton();
  }

  // Update Begin Registration Button
  function updateBeginRegistrationButton() {
    const btn = document.getElementById('beginRegistration');
    if (btn) {
      btn.disabled = state.selectedCourses.length === 0;
    }
  }

  // Navigate to Step
  window.navigateToStep = function(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.reg-step').forEach(step => {
      step.style.display = 'none';
    });

    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
      targetStep.style.display = 'block';
    }

    // Update progress tracker visibility (show from step 4 onwards)
    const progressTracker = document.getElementById('progressTracker');
    if (progressTracker) {
      progressTracker.style.display = stepNumber >= 4 ? 'block' : 'none';
    }

    // Update progress
    updateProgress(stepNumber);

    // Mark previous step as completed
    if (stepNumber > state.currentStep && !state.completedSteps.includes(state.currentStep)) {
      state.completedSteps.push(state.currentStep);
    }

    state.currentStep = stepNumber;

    // Execute step-specific logic
    switch(stepNumber) {
      case 2:
        renderSelectedCoursesSummary();
        break;
      case 3:
        renderAcademicPlanDetailed();
        break;
      case 4:
        renderCartCourses();
        renderCalendar();
        break;
      case 5:
        renderCartReview();
        checkB2BStatus();
        break;
      case 6:
        setupDisclosures();
        break;
      case 7:
        setupPaymentAccordion();
        break;
      case 8:
        displayCurrentAddress();
        break;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update Progress Tracker
  function updateProgress(stepNumber) {
    if (stepNumber < 4) return;

    const steps = document.querySelectorAll('.progress-step');
    const progressBar = document.getElementById('progressBar');

    steps.forEach(step => {
      const stepNum = parseInt(step.dataset.step);
      step.classList.remove('active', 'completed');

      if (stepNum < stepNumber) {
        step.classList.add('completed');
      } else if (stepNum === stepNumber) {
        step.classList.add('active');
      }
    });

    // Update progress bar
    const progress = ((stepNumber - 4) / 4) * 100;
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  // Render Selected Courses Summary (Step 2)
  function renderSelectedCoursesSummary() {
    const container = document.getElementById('selectedCoursesList');
    if (!container) return;

    const selectedCourses = coursesData.filter(c => state.selectedCourses.includes(c.id));

    container.innerHTML = selectedCourses.map(course => `
      <div class="course-card">
        <div class="course-card__code">${course.code}</div>
        <h4 class="course-card__title">${course.title}</h4>
        <div class="course-card__details">
          <div class="course-card__detail">
            <strong>Credits:</strong> ${course.credits}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Academic Plan Detailed (Step 3)
  function renderAcademicPlanDetailed() {
    const container = document.getElementById('academicPlanDetailed');
    if (!container) return;

    const selectedCourses = coursesData.filter(c => state.selectedCourses.includes(c.id));

    container.innerHTML = selectedCourses.map(course => `
      <div class="course-card selected">
        <div class="course-card__header">
          <div>
            <div class="course-card__code">${course.code}</div>
            <h3 class="course-card__title">${course.title}</h3>
          </div>
        </div>
        <p>${course.description}</p>
        <div class="course-card__details">
          <div class="course-card__detail">
            <strong>Credits:</strong> ${course.credits}
          </div>
          <div class="course-card__detail">
            <strong>Prerequisites:</strong> ${course.prerequisites}
          </div>
        </div>
        <div class="course-card__actions">
          <button class="btn btn--secondary" onclick="showCourseModal('${course.id}')">View Details</button>
        </div>
      </div>
    `).join('');
  }

  // Render Cart Courses (Step 4)
  function renderCartCourses() {
    const container = document.getElementById('cartCoursesList');
    if (!container) return;

    const selectedCourses = coursesData.filter(c => state.selectedCourses.includes(c.id));
    state.cartCourses = selectedCourses.map(c => ({ ...c, startDate: null }));

    container.innerHTML = state.cartCourses.map(course => `
      <div class="cart-item" data-course-id="${course.id}">
        <div class="cart-item__header">
          <h4 class="cart-item__title">${course.code} - ${course.title}</h4>
          <button class="cart-item__remove" onclick="removeCourseFromCart('${course.id}')">Remove</button>
        </div>
        <div class="cart-item__details">
          <div>Credits: ${course.credits}</div>
          <div id="date-${course.id}">Start Date: <span class="text-muted">Not selected</span></div>
        </div>
      </div>
    `).join('');
  }

  // Remove Course from Cart
  window.removeCourseFromCart = function(courseId) {
    state.cartCourses = state.cartCourses.filter(c => c.id !== courseId);
    state.selectedCourses = state.selectedCourses.filter(id => id !== courseId);
    renderCartCourses();
    
    if (state.cartCourses.length === 0) {
      alert('Your cart is empty. Please select courses to continue.');
      navigateToStep(1);
    }
  };

  // Render Calendar (Simplified)
  function renderCalendar() {
    const container = document.getElementById('courseCalendar');
    if (!container) return;

    const startDates = [
      '2025-01-15',
      '2025-02-01',
      '2025-03-01',
      '2025-04-01'
    ];

    container.innerHTML = `
      <div class="date-options">
        ${startDates.map(date => `
          <button class="btn btn--secondary" style="width: 100%; margin-bottom: 0.5rem;" onclick="selectStartDate('${date}')">
            ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </button>
        `).join('')}
      </div>
    `;
  }

  // Select Start Date
  window.selectStartDate = function(date) {
    // For simplicity, apply to first course without date
    const courseWithoutDate = state.cartCourses.find(c => !c.startDate);
    if (courseWithoutDate) {
      courseWithoutDate.startDate = date;
      const dateEl = document.getElementById(`date-${courseWithoutDate.id}`);
      if (dateEl) {
        dateEl.innerHTML = `Start Date: <strong>${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>`;
      }
    }
  };

  // Render Cart Review (Step 5)
  function renderCartReview() {
    const container = document.getElementById('cartReviewList');
    if (!container) return;

    container.innerHTML = state.cartCourses.map(course => `
      <div class="cart-item">
        <div class="cart-item__header">
          <h4 class="cart-item__title">${course.code} - ${course.title}</h4>
        </div>
        <div class="cart-item__details">
          <div>Credits: ${course.credits}</div>
          <div>Start Date: ${course.startDate ? new Date(course.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not selected'}</div>
        </div>
      </div>
    `).join('');
  }

  // Check B2B Status
  function checkB2BStatus() {
    // Show B2B disclosures if payment method is employer
    const b2bSection = document.getElementById('b2bDisclosures');
    if (b2bSection) {
      b2bSection.style.display = state.intendedPayment === 'employer' ? 'block' : 'none';
    }
  }

  // Setup Disclosures (Step 6)
  function setupDisclosures() {
    const checkboxes = document.querySelectorAll('.disclosure-checkbox input[type="checkbox"]');
    const agreeBtn = document.getElementById('agreeAndContinue');

    function checkAllAgreed() {
      const allChecked = Array.from(checkboxes).every(cb => cb.checked || cb.closest('.disclosure-document').style.display === 'none');
      if (agreeBtn) {
        agreeBtn.disabled = !allChecked;
      }
    }

    checkboxes.forEach(cb => {
      cb.addEventListener('change', checkAllAgreed);
    });

    // Show dynamic disclosure based on payment method
    const dynamicDisclosure = document.getElementById('dynamicDisclosure');
    if (dynamicDisclosure && state.intendedPayment === 'employer') {
      dynamicDisclosure.style.display = 'block';
    }

    checkAllAgreed();
  }

  // Setup Payment Accordion (Step 7)
  function setupPaymentAccordion() {
    const accordionItems = document.querySelectorAll('.payment-accordion__item');
    
    // Open the intended payment method by default
    accordionItems.forEach(item => {
      const header = item.querySelector('.payment-accordion__header');
      const content = item.querySelector('.payment-accordion__content');
      
      // Check if this matches intended payment
      if (state.intendedPayment && item.dataset.payment === state.intendedPayment) {
        item.classList.add('active');
        content.classList.add('active');
      }

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all
        accordionItems.forEach(i => {
          i.classList.remove('active');
          i.querySelector('.payment-accordion__content').classList.remove('active');
        });

        // Open clicked if wasn't active
        if (!isActive) {
          item.classList.add('active');
          content.classList.add('active');
        }
      });
    });

    // Show APEI section if applicable
    const apeiSection = document.getElementById('apeiSection');
    if (apeiSection) {
      // Check if user is APEI employee (this would be from user data)
      apeiSection.style.display = 'none'; // Change based on actual user data
    }

    // Setup payment confirmation validation
    setupPaymentValidation();
  }

  // Setup Payment Validation
  function setupPaymentValidation() {
    const confirmBtn = document.getElementById('confirmPayment');
    const paymentCheckboxes = document.querySelectorAll('.payment-checklist input[type="checkbox"]');
    const paymentRadios = document.querySelectorAll('input[name="b2bPaymentType"], input[name="selfPayMethod"]');

    function validatePayment() {
      const activeAccordion = document.querySelector('.payment-accordion__item.active');
      if (!activeAccordion) {
        if (confirmBtn) confirmBtn.disabled = true;
        return;
      }

      const checkboxes = activeAccordion.querySelectorAll('.payment-checklist input[type="checkbox"]');
      const radios = activeAccordion.querySelectorAll('input[type="radio"]');

      const allCheckboxesChecked = Array.from(checkboxes).every(cb => cb.checked);
      const hasRadios = radios.length > 0;
      const radioSelected = hasRadios ? Array.from(radios).some(r => r.checked) : true;

      if (confirmBtn) {
        confirmBtn.disabled = !(allCheckboxesChecked && radioSelected);
      }
    }

    paymentCheckboxes.forEach(cb => cb.addEventListener('change', validatePayment));
    paymentRadios.forEach(r => r.addEventListener('change', validatePayment));

    validatePayment();
  }

  // Display Current Address (Step 8)
  function displayCurrentAddress() {
    const addressEl = document.getElementById('currentAddress');
    if (addressEl) {
      addressEl.innerHTML = `
        ${state.userData.address.street}<br>
        ${state.userData.address.city}, ${state.userData.address.state} ${state.userData.address.zip}
      `;
    }
  }

  // Load Saved Address
  function loadSavedAddress() {
    const form = document.getElementById('shippingAddressForm');
    if (form) {
      form.streetAddress.value = state.userData.address.street;
      form.city.value = state.userData.address.city;
      form.state.value = state.userData.address.state;
      form.zipCode.value = state.userData.address.zip;
    }
  }

  // Submit Registration
  window.submitRegistration = function() {
    // Update address if form exists
    const form = document.getElementById('shippingAddressForm');
    if (form) {
      state.userData.address = {
        street: form.streetAddress.value,
        city: form.city.value,
        state: form.state.value,
        zip: form.zipCode.value
      };
    }

    // Show confirmation
    navigateToStep(9);

    // Display confirmation with conditional instructions
    displayConfirmation();
  };

  // Display Confirmation
  function displayConfirmation() {
    const instructionsEl = document.getElementById('conditionalInstructions');
    if (!instructionsEl) return;

    let instructions = '<ul>';
    instructions += '<li>Check your email for registration confirmation</li>';
    instructions += '<li>Course materials will be shipped to your confirmed address</li>';
    instructions += `<li>Access your courses in the student portal on ${state.cartCourses[0]?.startDate ? new Date(state.cartCourses[0].startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'your course start date'}</li>`;

    if (state.intendedPayment === 'financial-aid') {
      instructions += '<li>Your financial aid will be applied to your account within 3-5 business days</li>';
    } else if (state.intendedPayment === 'employer') {
      instructions += '<li>Your employer will be billed according to your company agreement</li>';
    }

    instructions += '</ul>';
    instructionsEl.innerHTML = instructions;
  }

  // Show Course Modal
  window.showCourseModal = function(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    const modal = document.getElementById('courseModal');
    const modalBody = document.getElementById('courseModalBody');

    if (modal && modalBody) {
      modalBody.innerHTML = `
        <h3>${course.code} - ${course.title}</h3>
        <p><strong>Credits:</strong> ${course.credits}</p>
        <p><strong>Prerequisites:</strong> ${course.prerequisites}</p>
        <p><strong>Description:</strong></p>
        <p>${course.description}</p>
        <p>This course covers fundamental concepts and provides hands-on experience with real-world applications.</p>
      `;

      modal.classList.add('active');
    }
  };

  // Close Modal
  function closeModal() {
    const modal = document.getElementById('courseModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Begin Registration
    const beginBtn = document.getElementById('beginRegistration');
    if (beginBtn) {
      beginBtn.addEventListener('click', () => navigateToStep(2));
    }

    // Intended Payment Selection
    const paymentRadios = document.querySelectorAll('input[name="intendedPayment"]');
    const addToCartBtn = document.getElementById('addToCartStep2');
    
    paymentRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        state.intendedPayment = radio.value;
        if (addToCartBtn) {
          addToCartBtn.disabled = false;
        }
      });
    });

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => navigateToStep(3));
    }

    // Agree and Continue
    const agreeBtn = document.getElementById('agreeAndContinue');
    if (agreeBtn) {
      agreeBtn.addEventListener('click', () => navigateToStep(7));
    }

    // Confirm Payment
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener('click', () => navigateToStep(8));
    }

    // Modal close
    const modalClose = document.querySelector('.modal__close');
    const modalOverlay = document.querySelector('.modal__overlay');
    
    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
      modalOverlay.addEventListener('click', closeModal);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();