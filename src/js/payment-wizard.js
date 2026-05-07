/**
 * Payment Wizard - Full-Screen Takeover
 */

document.addEventListener('DOMContentLoaded', function() {
  const openWizardBtn = document.getElementById('openPaymentWizardBtn');
  const closeWizardBtn = document.getElementById('closePaymentWizard');
  const wizardOverlay = document.getElementById('paymentWizardOverlay');
  const wizardTabs = document.querySelectorAll('.payment-wizard-tab');
  const selectionBanner = document.getElementById('paymentSelectionBanner');
  const selectedOptionText = document.getElementById('selectedFinancingOption');
  const confirmBtn = document.getElementById('confirmSelectionBtn');
  const changeBtn = document.getElementById('changeSelectionBtn');
  const radioButtons = document.querySelectorAll('input[name="financingOption"]');
  const financingSidebar = document.getElementById('financingSelectionSidebar');
  const sidebarOptionText = document.getElementById('sidebarFinancingOption');
  const editSidebarBtn = document.getElementById('editFinancingSidebarBtn');

  // Open wizard
  if (openWizardBtn && wizardOverlay) {
    openWizardBtn.addEventListener('click', function() {
      wizardOverlay.style.display = 'block';
    });
  }

  // Close wizard
  if (closeWizardBtn && wizardOverlay) {
    closeWizardBtn.addEventListener('click', function() {
      wizardOverlay.style.display = 'none';
    });
  }

  // Tab switching
  wizardTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const paymentType = this.getAttribute('data-payment');

      // Update active tab
      wizardTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Update active content
      const allContent = document.querySelectorAll('.payment-content');
      allContent.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });

      const activeContent = document.getElementById(`content-${paymentType}`);
      if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
      }
    });
  });

  // Radio button selection
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const selectedValue = this.value;
        if (selectedOptionText) {
          selectedOptionText.textContent = selectedValue;
        }
        if (selectionBanner) {
          selectionBanner.style.display = 'block';
        }
      }
    });
  });

  // Confirm selection and close
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function() {
      const selectedRadio = document.querySelector('input[name="financingOption"]:checked');
      if (selectedRadio && wizardOverlay) {
        const selectedValue = selectedRadio.value;

        // Update sidebar module
        if (sidebarOptionText) {
          sidebarOptionText.textContent = selectedValue;
        }
        if (financingSidebar) {
          financingSidebar.style.display = 'block';
        }

        // Close the wizard overlay
        wizardOverlay.style.display = 'none';

        // Hide the alert (if it exists)
        const paymentWizardAlert = document.getElementById('paymentWizardAlert');
        if (paymentWizardAlert) {
          paymentWizardAlert.style.opacity = '0';
          paymentWizardAlert.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            paymentWizardAlert.style.display = 'none';
          }, 300);
        }

        console.log('Selected financing option:', selectedValue);
      }
    });
  }

  // Change selection - hide banner
  if (changeBtn) {
    changeBtn.addEventListener('click', function() {
      if (selectionBanner) {
        selectionBanner.style.display = 'none';
      }
      // Uncheck all radio buttons
      radioButtons.forEach(radio => {
        radio.checked = false;
      });
    });
  }

  // Edit financing selection from sidebar
  if (editSidebarBtn) {
    editSidebarBtn.addEventListener('click', function() {
      // Open the wizard overlay
      if (wizardOverlay) {
        wizardOverlay.style.display = 'block';
      }

      // Hide the selection banner if it's showing
      if (selectionBanner) {
        selectionBanner.style.display = 'none';
      }

      // Optionally uncheck the current selection to allow user to reselect
      // radioButtons.forEach(radio => {
      //   radio.checked = false;
      // });
    });
  }
});
