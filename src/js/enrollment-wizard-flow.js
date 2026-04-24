// Enrollment Wizard Flow JavaScript
(function() {
  'use strict';

  // State management
  const state = {
    currentStage: 2,
    totalStages: 4
  };

  // DOM elements
  let enrollmentNextBtn, enrollmentBackBtn, enrollmentCompleteBtn, currentStageNum;

  // Initialize
  function init() {
    // Check if enrollment wizard tabs exist
    const wizardTabs = document.querySelectorAll('.enrollment-tab, .enrollment-progress-tab');
    if (wizardTabs.length === 0) {
      console.log('Enrollment wizard not found on this page');
      return;
    }

    // Get DOM elements (may not exist if footer is hidden)
    enrollmentNextBtn = document.getElementById('enrollmentNextBtn');
    enrollmentBackBtn = document.getElementById('enrollmentBackBtn');
    enrollmentCompleteBtn = document.getElementById('enrollmentCompleteBtn');
    currentStageNum = document.getElementById('enrollmentCurrentStageNum');

    // Attach event listeners
    attachEventListeners();

    // Load saved state
    loadStateFromStorage();

    // Update progress bars
    updateProgressBars();

    // Render current stage
    renderStage(state.currentStage);

    // Set initial button state
    updateCompleteButtonState();
  }

  // Attach event listeners
  function attachEventListeners() {
    if (enrollmentNextBtn) {
      enrollmentNextBtn.addEventListener('click', nextStage);
    }

    if (enrollmentBackBtn) {
      enrollmentBackBtn.addEventListener('click', previousStage);
    }

    if (enrollmentCompleteBtn) {
      enrollmentCompleteBtn.addEventListener('click', completeEnrollment);
    }

    // Tab clicks (support both .enrollment-tab and .enrollment-progress-tab)
    const tabs = document.querySelectorAll('.enrollment-tab, .enrollment-progress-tab');
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', function(e) {
        e.preventDefault();
        const targetStage = parseInt(tab.getAttribute('data-stage')) || (index + 1);

        // Special handling for Stage 4 - toggle completed state when clicked
        if (targetStage === 4) {
          if (!tab.classList.contains('completed')) {
            tab.classList.add('completed');
            tab.style.setProperty('--progress-width', '100%');
            tab.style.setProperty('--circle-progress', '100%');
          }
        }

        // Allow clicking on any stage
        state.currentStage = targetStage;
        renderStage(targetStage);
        saveStateToStorage();
      });
    });

    // Confirmation checkbox
    const confirmationCheckbox = document.getElementById('enrollmentConfirmation');
    if (confirmationCheckbox) {
      confirmationCheckbox.addEventListener('change', function() {
        saveStateToStorage();
        updateCompleteButtonState();
      });
    }
  }

  // Next stage
  function nextStage() {
    if (!validateStage(state.currentStage)) {
      return;
    }

    if (state.currentStage < state.totalStages) {
      state.currentStage++;
      renderStage(state.currentStage);
      saveStateToStorage();
      scrollToTop();
    }
  }

  // Previous stage
  function previousStage() {
    if (state.currentStage > 1) {
      state.currentStage--;
      renderStage(state.currentStage);
      saveStateToStorage();
      scrollToTop();
    }
  }

  // Validate stage
  function validateStage(stageNum) {
    // Stage 3: Funding and Financial
    if (stageNum === 3) {
      // Check if payment type is selected
      const selectedPayment = document.querySelector('.payment-option-btn.selected');
      if (!selectedPayment) {
        alert('Please select a payment type before proceeding.');
        return false;
      }

      // Check if Tuition Assistance question is answered
      const taYes = document.getElementById('taYes');
      const taNo = document.getElementById('taNo');
      if (taYes && taNo && !taYes.checked && !taNo.checked) {
        alert('Please indicate whether you intend to apply for Tuition Assistance.');
        return false;
      }

      // If Yes to TA, check if Begin Request was clicked or Decline checkbox is checked
      if (taYes && taYes.checked) {
        const taDeclineCheckbox = document.getElementById('taDeclineCheckbox');
        // For now, we just need them to make a choice - either click Begin Request or check Decline
        // We can track if they clicked Begin Request by checking if they unchecked the decline
        // Since we don't have a way to track "Begin Request" click yet, let's just ensure they acknowledged
        if (taDeclineCheckbox && !taDeclineCheckbox.checked) {
          // User said Yes to TA but hasn't taken action
          // You might want to add a flag when Begin Request is clicked
          // For now, let's allow proceeding if either action is taken
        }
      }
    }

    // Stage 4: Review & Submit
    if (stageNum === 4) {
      const confirmationCheckbox = document.getElementById('enrollmentConfirmation');
      if (!confirmationCheckbox || !confirmationCheckbox.checked) {
        alert('Please confirm that all information is accurate before proceeding.');
        return false;
      }
    }
    return true;
  }

  // Render stage
  function renderStage(stageNum) {
    // Update stage visibility
    for (let i = 1; i <= state.totalStages; i++) {
      const stageDiv = document.getElementById(`enrollmentStage${i}`);
      if (stageDiv) {
        stageDiv.classList.remove('active');
      }
    }

    const currentStageDiv = document.getElementById(`enrollmentStage${stageNum}`);
    if (currentStageDiv) {
      currentStageDiv.classList.add('active');
    }

    // Update progress tabs
    updateProgressTabs(stageNum);

    // Update navigation buttons
    updateNavigationButtons(stageNum);

    // Update step indicator
    if (currentStageNum) {
      currentStageNum.textContent = stageNum;
    }
  }

  // Update progress tabs
  function updateProgressTabs(stageNum) {
    // Get ALL progress tabs (both .enrollment-tab and .enrollment-progress-tab)
    const tabs = document.querySelectorAll('.enrollment-tab, .enrollment-progress-tab');

    tabs.forEach((tab) => {
      const tabStage = parseInt(tab.getAttribute('data-stage'));
      if (!tabStage) return;

      // Remove active class (but keep completed if it's there)
      tab.classList.remove('active');

      // Add appropriate class
      if (tabStage === stageNum) {
        tab.classList.add('active');
        // Keep completed class if stage is already completed (stage 1)
        if (tabStage === 1) {
          tab.classList.add('completed');
        }
      } else if (tabStage < stageNum) {
        tab.classList.add('completed');
      }
    });
  }

  // Update navigation buttons
  function updateNavigationButtons(stageNum) {
    // Back button
    if (enrollmentBackBtn) {
      enrollmentBackBtn.style.display = stageNum === 1 ? 'none' : 'block';
    }

    // Next button
    if (enrollmentNextBtn) {
      enrollmentNextBtn.style.display = stageNum === state.totalStages ? 'none' : 'block';
    }

    // Complete button
    if (enrollmentCompleteBtn) {
      enrollmentCompleteBtn.style.display = stageNum === state.totalStages ? 'block' : 'none';
      if (stageNum === state.totalStages) {
        updateCompleteButtonState();
      }
    }
  }

  // Update Complete button state based on checkbox
  function updateCompleteButtonState() {
    if (!enrollmentCompleteBtn) return;

    const confirmationCheckbox = document.getElementById('enrollmentConfirmation');
    if (confirmationCheckbox) {
      enrollmentCompleteBtn.disabled = !confirmationCheckbox.checked;
    }
  }

  // Complete enrollment
  function completeEnrollment() {
    if (!validateStage(state.currentStage)) {
      return;
    }

    // Hide wizard content
    const wizardProgress = document.querySelector('.enrollment-wizard-progress');
    const wizardContent = document.querySelector('.enrollment-wizard-content');

    if (wizardProgress) {
      wizardProgress.style.display = 'none';
    }
    if (wizardContent) {
      wizardContent.style.display = 'none';
    }

    // Change "Your Journey Status" to "Admissions"
    const journeyStatusTitle = document.querySelector('.student-status-module .small-title');
    if (journeyStatusTitle && journeyStatusTitle.textContent.includes('Your Journey Status')) {
      journeyStatusTitle.textContent = 'Admissions';
    }

    // Hide all alerts
    const alerts = document.querySelectorAll('.alert-alt, .alert-outage, .alert-toomany, .alert-box-hp');
    alerts.forEach(alert => {
      if (alert) {
        alert.style.display = 'none';
      }
    });

    // Hide intro box
    const introBox = document.querySelector('.intro-box');
    if (introBox) {
      introBox.style.display = 'none';
    }

    // Show success state
    const successState = document.getElementById('enrollmentSuccessState');
    if (successState) {
      successState.style.display = 'flex';
      successState.classList.add('active');
    }

    // Add My Documents widget to sidebar
    const sidebar = document.querySelector('.row-main-layout .mb-5:last-child');
    if (sidebar && !document.getElementById('myDocumentsWidget')) {
      const myDocsWidget = document.createElement('div');
      myDocsWidget.id = 'myDocumentsWidget';
      myDocsWidget.className = 'white-box mb-4';
      myDocsWidget.innerHTML = `
        <p class="small-title mb-3">My Documents</p>
        <p class="mb-3">You can view all of your submitted documents and items in the My Documents section.</p>
        <a href="/forms-and-documents.html" class="btn-main btn-sm">View My Documents</a>
      `;

      // Insert at the top of the sidebar
      sidebar.insertBefore(myDocsWidget, sidebar.firstChild);
    }

    // Trigger confetti animation
    if (typeof celebrateWithConfetti === 'function') {
      celebrateWithConfetti();
    }

    // Reset state
    state.currentStage = 1;
    localStorage.removeItem('enrollmentWizardFlowState');
  }

  // Scroll to top
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Save state to localStorage
  function saveStateToStorage() {
    try {
      localStorage.setItem('enrollmentWizardFlowState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  // Load state from localStorage
  function loadStateFromStorage() {
    try {
      const savedState = localStorage.getItem('enrollmentWizardFlowState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(state, parsed);
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }

  // Update progress bars based on completion percentage
  function updateProgressBars() {
    const tabs = document.querySelectorAll('.enrollment-progress-tab');
    let totalOverallItems = 0;
    let totalOverallCompleted = 0;
    let totalOverallPending = 0;

    tabs.forEach((tab, index) => {
      const totalItems = parseInt(tab.getAttribute('data-total-items')) || 0;
      const completedItems = parseInt(tab.getAttribute('data-completed-items')) || 0;
      const pendingItems = parseInt(tab.getAttribute('data-pending-items')) || 0;
      const isLastTab = index === tabs.length - 1;

      // Track overall progress (exclude last tab)
      if (!isLastTab) {
        totalOverallItems += totalItems;
        totalOverallCompleted += completedItems;
        totalOverallPending += pendingItems;
      }

      if (totalItems > 0) {
        // Completed items count as 100%, pending items count as 50%
        const weightedProgress = (completedItems * 1.0) + (pendingItems * 0.5);
        const percentage = (weightedProgress / totalItems) * 100;
        tab.style.setProperty('--progress-width', `${percentage}%`);

        // Update percentage text in the circle
        const progressPercent = tab.querySelector('.progress-percent');
        if (progressPercent && !isLastTab) {
          const roundedPercent = Math.round(percentage);
          progressPercent.textContent = roundedPercent > 0 ? `${roundedPercent}%` : '';
          progressPercent.setAttribute('data-percent', roundedPercent);
        }
      } else if (!isLastTab) {
        tab.style.setProperty('--progress-width', '0%');
      }
    });

    // Calculate overall progress for the last tab (Stage 4)
    if (totalOverallItems > 0) {
      const weightedOverallProgress = (totalOverallCompleted * 1.0) + (totalOverallPending * 0.5);
      const overallPercentage = (weightedOverallProgress / totalOverallItems) * 100;

      const lastTab = tabs[tabs.length - 1];

      // If overall progress is 100%, mark Stage 4 as completed
      if (overallPercentage >= 100) {
        lastTab.classList.add('completed');
        lastTab.style.setProperty('--progress-width', '100%');
        lastTab.style.setProperty('--circle-progress', '100%');
      } else {
        lastTab.classList.remove('completed');
        lastTab.style.setProperty('--progress-width', `${overallPercentage}%`);
        lastTab.style.setProperty('--circle-progress', `${overallPercentage}%`);
      }
    }
  }

  // Payment widget functionality
  function initPaymentWidget() {
    // Payment option buttons
    const paymentButtons = document.querySelectorAll('.payment-option-btn[data-payment]');
    paymentButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove selected class from all payment buttons
        paymentButtons.forEach(b => b.classList.remove('selected'));
        // Add selected class to clicked button
        this.classList.add('selected');
      });
    });

    // Tuition Assistance radio buttons
    const taYes = document.getElementById('taYes');
    const taNo = document.getElementById('taNo');
    const taActionButtons = document.getElementById('taActionButtons');

    if (taYes && taNo && taActionButtons) {
      taYes.addEventListener('change', function() {
        if (this.checked) {
          taActionButtons.style.display = 'block';
        }
      });

      taNo.addEventListener('change', function() {
        if (this.checked) {
          taActionButtons.style.display = 'none';
          // Clear decline checkbox if checked
          const taDeclineCheckbox = document.getElementById('taDeclineCheckbox');
          if (taDeclineCheckbox) {
            taDeclineCheckbox.checked = false;
          }
        }
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      init();
      initPaymentWidget();
    });
  } else {
    init();
    initPaymentWidget();
  }

})();
