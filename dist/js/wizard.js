// Wizard Component JavaScript
(function() {
  'use strict';

  // State management
  const state = {
    currentStage: 1,
    totalStages: 4,
    wizardData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emailNotif: true,
      smsNotif: false,
      pushNotif: true,
      timezone: 'EST',
      language: 'en',
      confirmAccuracy: false
    }
  };

  // DOM elements
  let wizardOverlay, wizardNextBtn, wizardBackBtn, wizardCompleteBtn, wizardCloseBtn;
  let launchWizardBtn, currentStepNum;

  // Initialize wizard
  function init() {
    // Get DOM elements
    wizardOverlay = document.getElementById('wizardOverlay');
    wizardNextBtn = document.getElementById('wizardNextBtn');
    wizardBackBtn = document.getElementById('wizardBackBtn');
    wizardCompleteBtn = document.getElementById('wizardCompleteBtn');
    wizardCloseBtn = document.getElementById('wizardCloseBtn');
    launchWizardBtn = document.getElementById('launchWizardBtn');
    currentStepNum = document.getElementById('currentStepNum');

    // Check if elements exist
    if (!wizardOverlay) {
      console.error('Wizard overlay element not found');
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
    if (launchWizardBtn) {
      launchWizardBtn.addEventListener('click', openWizard);
    }

    // Navigation buttons
    if (wizardNextBtn) {
      wizardNextBtn.addEventListener('click', nextStage);
    }

    if (wizardBackBtn) {
      wizardBackBtn.addEventListener('click', previousStage);
    }

    if (wizardCompleteBtn) {
      wizardCompleteBtn.addEventListener('click', completeWizard);
    }

    // Close button
    if (wizardCloseBtn) {
      wizardCloseBtn.addEventListener('click', closeWizard);
    }

    // Close on overlay click (outside wizard container)
    if (wizardOverlay) {
      wizardOverlay.addEventListener('click', function(e) {
        if (e.target === wizardOverlay) {
          closeWizard();
        }
      });
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && wizardOverlay.classList.contains('active')) {
        closeWizard();
      }
    });

    // Form input listeners to save data
    attachFormListeners();
  }

  // Attach form input listeners
  function attachFormListeners() {
    // Stage 1 inputs
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');

    if (firstName) firstName.addEventListener('input', (e) => saveFormData('firstName', e.target.value));
    if (lastName) lastName.addEventListener('input', (e) => saveFormData('lastName', e.target.value));
    if (email) email.addEventListener('input', (e) => saveFormData('email', e.target.value));
    if (phone) phone.addEventListener('input', (e) => saveFormData('phone', e.target.value));

    // Stage 2 inputs
    const emailNotif = document.getElementById('emailNotif');
    const smsNotif = document.getElementById('smsNotif');
    const pushNotif = document.getElementById('pushNotif');
    const timezone = document.getElementById('timezone');
    const language = document.getElementById('language');

    if (emailNotif) emailNotif.addEventListener('change', (e) => saveFormData('emailNotif', e.target.checked));
    if (smsNotif) smsNotif.addEventListener('change', (e) => saveFormData('smsNotif', e.target.checked));
    if (pushNotif) pushNotif.addEventListener('change', (e) => saveFormData('pushNotif', e.target.checked));
    if (timezone) timezone.addEventListener('change', (e) => saveFormData('timezone', e.target.value));
    if (language) language.addEventListener('change', (e) => saveFormData('language', e.target.value));

    // Stage 3 inputs
    const confirmAccuracy = document.getElementById('confirmAccuracy');
    if (confirmAccuracy) confirmAccuracy.addEventListener('change', (e) => saveFormData('confirmAccuracy', e.target.checked));
  }

  // Save form data to state
  function saveFormData(field, value) {
    state.wizardData[field] = value;
    saveStateToStorage();
  }

  // Open wizard
  function openWizard() {
    if (!wizardOverlay) return;

    // Reset to first stage
    state.currentStage = 1;
    renderStage(1);

    // Show overlay
    wizardOverlay.classList.add('active');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Populate form fields with saved data
    populateFormFields();
  }

  // Close wizard
  function closeWizard() {
    if (!wizardOverlay) return;

    wizardOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Next stage
  function nextStage() {
    // Validate current stage
    if (!validateStage(state.currentStage)) {
      return;
    }

    if (state.currentStage < state.totalStages) {
      state.currentStage++;
      renderStage(state.currentStage);
      saveStateToStorage();

      // If moving to stage 3, update the summary
      if (state.currentStage === 3) {
        updateVerificationSummary();
      }
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
    if (stageNum === 1) {
      // Validate personal info
      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const email = document.getElementById('email');

      if (!firstName || !firstName.value.trim()) {
        alert('Please enter your first name');
        firstName.focus();
        return false;
      }

      if (!lastName || !lastName.value.trim()) {
        alert('Please enter your last name');
        lastName.focus();
        return false;
      }

      if (!email || !email.value.trim()) {
        alert('Please enter your email address');
        email.focus();
        return false;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        alert('Please enter a valid email address');
        email.focus();
        return false;
      }
    }

    if (stageNum === 3) {
      // Validate confirmation checkbox
      const confirmAccuracy = document.getElementById('confirmAccuracy');
      if (!confirmAccuracy || !confirmAccuracy.checked) {
        alert('Please confirm that your information is accurate');
        if (confirmAccuracy) confirmAccuracy.focus();
        return false;
      }
    }

    return true;
  }

  // Render specific stage
  function renderStage(stageNum) {
    // Update stage visibility
    for (let i = 1; i <= state.totalStages; i++) {
      const stageDiv = document.getElementById(`wizardStage${i}`);
      if (stageDiv) {
        stageDiv.classList.remove('active');
      }
    }

    const currentStageDiv = document.getElementById(`wizardStage${stageNum}`);
    if (currentStageDiv) {
      currentStageDiv.classList.add('active');
    }

    // Update progress tabs
    updateProgressTabs(stageNum);

    // Update navigation buttons
    updateNavigationButtons(stageNum);

    // Update step indicator
    if (currentStepNum) {
      currentStepNum.textContent = stageNum;
    }

    // Scroll to top of content
    const wizardContent = document.querySelector('.wizard-content');
    if (wizardContent) {
      wizardContent.scrollTop = 0;
    }
  }

  // Update progress tabs
  function updateProgressTabs(stageNum) {
    const tabs = document.querySelectorAll('.wizard-tab');

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
    if (wizardBackBtn) {
      if (stageNum === 1) {
        wizardBackBtn.style.display = 'none';
      } else {
        wizardBackBtn.style.display = 'inline-flex';
      }
    }

    // Next button
    if (wizardNextBtn) {
      if (stageNum === state.totalStages) {
        wizardNextBtn.style.display = 'none';
      } else {
        wizardNextBtn.style.display = 'inline-flex';
      }
    }

    // Complete button (only on last stage)
    if (wizardCompleteBtn) {
      if (stageNum === state.totalStages) {
        wizardCompleteBtn.style.display = 'inline-flex';
      } else {
        wizardCompleteBtn.style.display = 'none';
      }
    }
  }

  // Update verification summary
  function updateVerificationSummary() {
    // Personal info
    const summaryName = document.getElementById('summaryName');
    const summaryEmail = document.getElementById('summaryEmail');
    const summaryPhone = document.getElementById('summaryPhone');

    if (summaryName) {
      summaryName.textContent = `${state.wizardData.firstName} ${state.wizardData.lastName}`;
    }

    if (summaryEmail) {
      summaryEmail.textContent = state.wizardData.email || '--';
    }

    if (summaryPhone) {
      summaryPhone.textContent = state.wizardData.phone || 'Not provided';
    }

    // Preferences
    const summaryNotifications = document.getElementById('summaryNotifications');
    const summaryTimezone = document.getElementById('summaryTimezone');
    const summaryLanguage = document.getElementById('summaryLanguage');

    if (summaryNotifications) {
      const notifs = [];
      if (state.wizardData.emailNotif) notifs.push('Email');
      if (state.wizardData.smsNotif) notifs.push('SMS');
      if (state.wizardData.pushNotif) notifs.push('Push');
      summaryNotifications.textContent = notifs.length > 0 ? notifs.join(', ') : 'None';
    }

    if (summaryTimezone) {
      summaryTimezone.textContent = state.wizardData.timezone || '--';
    }

    if (summaryLanguage) {
      const languageMap = { en: 'English', es: 'Spanish', fr: 'French' };
      summaryLanguage.textContent = languageMap[state.wizardData.language] || state.wizardData.language;
    }
  }

  // Complete wizard
  function completeWizard() {
    // Update confirmation email in final stage
    const confirmationEmail = document.getElementById('confirmationEmail');
    if (confirmationEmail) {
      confirmationEmail.textContent = state.wizardData.email;
    }

    // In a real app, you would send data to server here
    console.log('Wizard completed with data:', state.wizardData);

    // Show success message (already on stage 4)
    // Could add confetti or other celebration effects here

    // Clear saved state after successful completion
    // localStorage.removeItem('wizardState');

    // Optional: Auto-close after a few seconds
    // setTimeout(closeWizard, 5000);
  }

  // Populate form fields with saved data
  function populateFormFields() {
    // Stage 1
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');

    if (firstName) firstName.value = state.wizardData.firstName || '';
    if (lastName) lastName.value = state.wizardData.lastName || '';
    if (email) email.value = state.wizardData.email || '';
    if (phone) phone.value = state.wizardData.phone || '';

    // Stage 2
    const emailNotif = document.getElementById('emailNotif');
    const smsNotif = document.getElementById('smsNotif');
    const pushNotif = document.getElementById('pushNotif');
    const timezone = document.getElementById('timezone');
    const language = document.getElementById('language');

    if (emailNotif) emailNotif.checked = state.wizardData.emailNotif;
    if (smsNotif) smsNotif.checked = state.wizardData.smsNotif;
    if (pushNotif) pushNotif.checked = state.wizardData.pushNotif;
    if (timezone) timezone.value = state.wizardData.timezone || 'EST';
    if (language) language.value = state.wizardData.language || 'en';

    // Stage 3
    const confirmAccuracy = document.getElementById('confirmAccuracy');
    if (confirmAccuracy) confirmAccuracy.checked = state.wizardData.confirmAccuracy;
  }

  // Save state to localStorage
  function saveStateToStorage() {
    try {
      localStorage.setItem('wizardState', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save wizard state:', e);
    }
  }

  // Load state from localStorage
  function loadStateFromStorage() {
    try {
      const savedState = localStorage.getItem('wizardState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(state, parsed);
      }
    } catch (e) {
      console.error('Failed to load wizard state:', e);
    }
  }

  // Reset wizard (for testing)
  function resetWizard() {
    state.currentStage = 1;
    state.wizardData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emailNotif: true,
      smsNotif: false,
      pushNotif: true,
      timezone: 'EST',
      language: 'en',
      confirmAccuracy: false
    };
    localStorage.removeItem('wizardState');
    populateFormFields();
    renderStage(1);
  }

  // Expose reset function for debugging
  window.resetWizard = resetWizard;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
