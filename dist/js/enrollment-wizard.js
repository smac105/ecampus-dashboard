// Enrollment Wizard JavaScript
(function() {
  'use strict';

  // State management
  const state = {
    currentStage: 1,
    totalStages: 4,
    enrollmentData: {
      profileVerified: false,
      documentsSubmitted: false,
      fundingSelected: false,
      confirmationChecked: false
    }
  };

  // DOM elements
  let enrollmentOverlay, enrollmentNextBtn, enrollmentBackBtn, enrollmentCompleteBtn, enrollmentCloseBtn;
  let launchEnrollmentWizardBtn, currentStageNum;

  // Initialize enrollment wizard
  function init() {
    // Get DOM elements
    enrollmentOverlay = document.getElementById('enrollmentWizardOverlay');
    enrollmentNextBtn = document.getElementById('enrollmentNextBtn');
    enrollmentBackBtn = document.getElementById('enrollmentBackBtn');
    enrollmentCompleteBtn = document.getElementById('enrollmentCompleteBtn');
    enrollmentCloseBtn = document.getElementById('enrollmentWizardCloseBtn');
    launchEnrollmentWizardBtn = document.getElementById('launchEnrollmentWizard');
    currentStageNum = document.getElementById('enrollmentCurrentStageNum');

    // Check if elements exist
    if (!enrollmentOverlay) {
      console.log('Enrollment wizard overlay not found on this page');
      return;
    }

    // Attach event listeners
    attachEventListeners();

    // Load saved state from localStorage
    loadStateFromStorage();
  }

  // Attach event listeners
  function attachEventListeners() {
    // Launch wizard button
    if (launchEnrollmentWizardBtn) {
      launchEnrollmentWizardBtn.addEventListener('click', openWizard);
    }

    // Navigation buttons
    if (enrollmentNextBtn) {
      enrollmentNextBtn.addEventListener('click', nextStage);
    }

    if (enrollmentBackBtn) {
      enrollmentBackBtn.addEventListener('click', previousStage);
    }

    if (enrollmentCompleteBtn) {
      enrollmentCompleteBtn.addEventListener('click', completeEnrollment);
    }

    // Close button
    if (enrollmentCloseBtn) {
      enrollmentCloseBtn.addEventListener('click', closeWizard);
    }

    // Close on overlay click
    if (enrollmentOverlay) {
      enrollmentOverlay.addEventListener('click', function(e) {
        if (e.target === enrollmentOverlay) {
          closeWizard();
        }
      });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && enrollmentOverlay && enrollmentOverlay.classList.contains('active')) {
        closeWizard();
      }
    });

    // Tab clicks for navigation
    const tabs = document.querySelectorAll('.enrollment-progress-tab');
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', function() {
        const targetStage = index + 1;
        // Only allow clicking on current or previous stages
        if (targetStage <= state.currentStage) {
          state.currentStage = targetStage;
          renderStage(targetStage);
          saveStateToStorage();
        }
      });
    });

    // Confirmation checkbox
    const confirmationCheckbox = document.getElementById('enrollmentConfirmation');
    if (confirmationCheckbox) {
      confirmationCheckbox.addEventListener('change', function(e) {
        state.enrollmentData.confirmationChecked = e.target.checked;
        saveStateToStorage();
      });
    }
  }

  // Open wizard
  function openWizard() {
    if (!enrollmentOverlay) return;

    // Show overlay
    enrollmentOverlay.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Render current stage
    renderStage(state.currentStage);
  }

  // Close wizard
  function closeWizard() {
    if (!enrollmentOverlay) return;

    enrollmentOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Next stage
  function nextStage() {
    // Validate current stage before proceeding
    if (!validateStage(state.currentStage)) {
      return;
    }

    if (state.currentStage < state.totalStages) {
      state.currentStage++;
      renderStage(state.currentStage);
      saveStateToStorage();
    }
  }

  // Previous stage
  function previousStage() {
    if (state.currentStage > 1) {
      state.currentStage--;
      renderStage(state.currentStage);
      saveStateToStorage();
    }
  }

  // Validate current stage
  function validateStage(stageNum) {
    // For now, basic validation
    // In a real app, you would check if required tasks are completed

    if (stageNum === 4) {
      // Check if confirmation checkbox is checked
      const confirmationCheckbox = document.getElementById('enrollmentConfirmation');
      if (!confirmationCheckbox || !confirmationCheckbox.checked) {
        alert('Please confirm that all information is accurate before proceeding.');
        return false;
      }
    }

    return true;
  }

  // Render specific stage
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

    // Scroll to top of content
    const wizardContent = document.querySelector('.enrollment-wizard-content');
    if (wizardContent) {
      wizardContent.scrollTop = 0;
    }
  }

  // Update progress tabs
  function updateProgressTabs(stageNum) {
    const tabs = document.querySelectorAll('.enrollment-progress-tab');

    tabs.forEach((tab, index) => {
      const tabStage = index + 1;

      // Remove all state classes
      tab.classList.remove('active', 'completed');

      // Add appropriate class
      if (tabStage === stageNum) {
        tab.classList.add('active');
      } else if (tabStage < stageNum) {
        tab.classList.add('completed');
      }
    });
  }

  // Update navigation buttons
  function updateNavigationButtons(stageNum) {
    // Back button
    if (enrollmentBackBtn) {
      if (stageNum === 1) {
        enrollmentBackBtn.style.display = 'none';
      } else {
        enrollmentBackBtn.style.display = 'inline-flex';
      }
    }

    // Next button
    if (enrollmentNextBtn) {
      if (stageNum === state.totalStages) {
        enrollmentNextBtn.style.display = 'none';
      } else {
        enrollmentNextBtn.style.display = 'inline-flex';
      }
    }

    // Complete button (only on last stage)
    if (enrollmentCompleteBtn) {
      if (stageNum === state.totalStages) {
        enrollmentCompleteBtn.style.display = 'inline-flex';
      } else {
        enrollmentCompleteBtn.style.display = 'none';
      }
    }
  }

  // Complete enrollment
  function completeEnrollment() {
    // Validate final stage
    if (!validateStage(state.currentStage)) {
      return;
    }

    // In a real app, you would submit data to server here
    console.log('Enrollment completed with data:', state.enrollmentData);

    // Show success message
    alert('Congratulations! Your enrollment has been completed successfully. You will receive a confirmation email shortly.');

    // Close wizard
    closeWizard();

    // Reset state
    state.currentStage = 1;
    state.enrollmentData = {
      profileVerified: false,
      documentsSubmitted: false,
      fundingSelected: false,
      confirmationChecked: false
    };

    // Clear saved state
    localStorage.removeItem('enrollmentWizardState');

    // Reload page to reflect changes
    // In a real app, you might update the UI instead
    // window.location.reload();
  }

  // Save state to localStorage
  function saveStateToStorage() {
    try {
      localStorage.setItem('enrollmentWizardState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save enrollment wizard state:', e);
    }
  }

  // Load state from localStorage
  function loadStateFromStorage() {
    try {
      const savedState = localStorage.getItem('enrollmentWizardState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(state, parsed);
      }
    } catch (e) {
      console.error('Failed to load enrollment wizard state:', e);
    }
  }

  // Reset wizard (for debugging)
  function resetWizard() {
    state.currentStage = 1;
    state.enrollmentData = {
      profileVerified: false,
      documentsSubmitted: false,
      fundingSelected: false,
      confirmationChecked: false
    };
    localStorage.removeItem('enrollmentWizardState');
    renderStage(1);
  }

  // Expose reset function for debugging
  window.resetEnrollmentWizard = resetWizard;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
