/**
 * Simplified Enrollment Wizard - 3 Stage Flow
 * Stages: Profile Verification (completed), Document Submission (active), Funding and Financial
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get all stage tabs
  const stageTabs = document.querySelectorAll('.enrollment-progress-tab');
  const stageContent = document.querySelectorAll('.enrollment-wizard-stage');

  let currentStage = 2; // Start at stage 2 (Document Submission) since stage 1 is completed

  // Initialize the wizard
  initializeWizard();

  function initializeWizard() {
    // Set initial state
    updateWizardDisplay();

    // Check on load if all tabs are completed
    checkAllTabsCompleted();

    // Add click handlers to tabs - All tabs are clickable
    stageTabs.forEach((tab, index) => {
      tab.addEventListener('click', function() {
        const stage = parseInt(this.getAttribute('data-stage'));
        navigateToStage(stage);
      });
    });

    // Handle demo checkbox on Document Submission stage
    const demoCompleteCheckbox = document.getElementById('demoCompleteDocuments');
    if (demoCompleteCheckbox) {
      demoCompleteCheckbox.addEventListener('change', function() {
        if (this.checked) {
          markStageAsCompleted(2);
          // Auto-navigate to next stage after a brief delay
          setTimeout(() => {
            navigateToStage(3);
          }, 500);
        }
      });
    }

    // Handle "Complete This Phase" button in modal
    const completePhaseBtn = document.getElementById('completePhaseBtn');
    if (completePhaseBtn) {
      completePhaseBtn.addEventListener('click', function() {
        // Redirect to the applicant-simplified-demo page
        window.location.href = '/applicant-simplified-demo.html';
      });
    }

    // Handle "Complete This Phase" button in sidebar
    const completePhaseBtnSidebar = document.getElementById('completePhaseBtnSidebar');
    if (completePhaseBtnSidebar) {
      completePhaseBtnSidebar.addEventListener('click', function() {
        // Redirect to the applicant-simplified-demo page
        window.location.href = '/applicant-simplified-demo.html';
      });
    }

    // Handle modal close button
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalOverlay = document.getElementById('closeModalOverlay');
    const completionModal = document.getElementById('enrollmentCompletionModal');

    if (closeModalBtn && completionModal) {
      closeModalBtn.addEventListener('click', function() {
        closeModal();
      });
    }

    if (closeModalOverlay && completionModal) {
      closeModalOverlay.addEventListener('click', function() {
        closeModal();
      });
    }

    function closeModal() {
      const modal = document.getElementById('enrollmentCompletionModal');
      if (modal) {
        modal.style.display = 'none';
      }
    }

    // Payment option selection
    let selectedPayment = '';
    const paymentBtns = document.querySelectorAll('.payment-option-btn');
    const savePaymentBtn = document.getElementById('savePaymentBtn');

    paymentBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remove selected state from all buttons
        paymentBtns.forEach(b => b.classList.remove('selected'));
        // Add selected state to clicked button
        this.classList.add('selected');

        // Store selected payment type
        selectedPayment = this.getAttribute('data-payment');

        // Show save button
        if (savePaymentBtn) {
          savePaymentBtn.style.display = 'inline-block';
        }
      });
    });

    // Handle Save and Continue button
    if (savePaymentBtn) {
      savePaymentBtn.addEventListener('click', function() {
        if (selectedPayment) {
          showPaymentConfirmation(selectedPayment);
        }
      });
    }

    // Handle Edit Payment Type link
    const editPaymentBtn = document.getElementById('editPaymentBtn');
    if (editPaymentBtn) {
      editPaymentBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showPaymentSelection();
      });
    }
  }

  function showPaymentConfirmation(paymentType) {
    const selectionWidget = document.getElementById('paymentSelectionWidget');
    const confirmationWidget = document.getElementById('paymentConfirmationWidget');
    const selectedPaymentTypeEl = document.getElementById('selectedPaymentType');
    const selectedPaymentDescriptionEl = document.getElementById('selectedPaymentDescription');

    if (selectionWidget && confirmationWidget && selectedPaymentTypeEl) {
      // Hide selection widget
      selectionWidget.style.display = 'none';

      // Show confirmation widget with selected payment
      selectedPaymentTypeEl.textContent = paymentType;

      // Get and display payment description
      const description = getPaymentDescription(paymentType);
      if (selectedPaymentDescriptionEl) {
        selectedPaymentDescriptionEl.innerHTML = description;
      }

      confirmationWidget.style.display = 'block';

      // Mark stage as completed
      markStageAsCompleted(3);
      checkAllTabsCompleted();
    }
  }

  function getPaymentDescription(paymentType) {
    const descriptions = {
      'Military TA': 'Military Tuition Assistance is a branch-managed education benefit for eligible service members. You will need to follow your branch\'s TA process and request TA through the appropriate military education portal.',
      'Federal Student Aid': 'Federal Student Aid may help eligible students pay for school through federal grants and loans. Grants usually do not need to be repaid, while loans must be repaid with interest. To apply, complete the FAFSA each award year and include the APUS school code 038193-00.',
      'GI Bill® Benefits': 'GI Bill® benefits may help eligible Veterans, service members, and family members pay for education. Eligibility, benefit type, and coverage amounts are determined by the U.S. Department of Veterans Affairs.',
      'Self-Payment': 'Self-Payment means you plan to pay tuition and fees out of pocket. Tuition and fees are due at the time of course registration unless you use an eligible payment schedule.<br><br><strong>Payment types offered:</strong><ul><li>Credit Cards: MasterCard®, Visa®, and Discover®</li><li>Digital Payments: Apple Pay®, Google Pay™, and PayPal®</li><li>E-Checks: Online payment from a U.S.-based bank account using a routing and checking account number</li><li>Automatic Debit Plan: Scheduled credit card payments over time for eligible credit-bearing courses</li></ul>',
      'Employer Benefits': 'Employer Benefits may include tuition grants, reimbursement, direct billing, or other education assistance from your employer or professional organization. Confirm eligibility and payment requirements with your employer before registration.',
      'VR&E': 'Veteran Readiness and Employment, also known as VR&E or Chapter 31, may help eligible Veterans cover tuition, fees, and related education expenses connected to career goals. Eligibility is determined by the VA, and an assigned VR&E counselor.',
      'MyCAA': 'MyCAA is a scholarship program that provides tuition assistance for eligible military spouses pursuing approved education or training. Funding must be approved through the MyCAA process before it can be used for courses.',
      'Scholarship': 'Scholarships are gift funds that generally do not need to be repaid and may help pay for tuition and fees. APUs does not directly offer university scholarships, but students can search for private scholarships or use the APUS Scholarship Portal.',
      'Private Loan': 'Private loans are credit-based, non-federal education loans offered by private lenders. Students should review all other funding options, including Federal Student Aid, scholarships, and other funding options before considering a private loan.'
    };

    return descriptions[paymentType] || '';
  }

  function showPaymentSelection() {
    const selectionWidget = document.getElementById('paymentSelectionWidget');
    const confirmationWidget = document.getElementById('paymentConfirmationWidget');
    const savePaymentBtn = document.getElementById('savePaymentBtn');

    if (selectionWidget && confirmationWidget) {
      // Show selection widget
      selectionWidget.style.display = 'block';

      // Hide confirmation widget
      confirmationWidget.style.display = 'none';

      // Hide save button until new selection
      if (savePaymentBtn) {
        savePaymentBtn.style.display = 'none';
      }

      // Clear previous selections
      const paymentBtns = document.querySelectorAll('.payment-option-btn');
      paymentBtns.forEach(b => b.classList.remove('selected'));
    }
  }

  function navigateToStage(stageNum) {
    currentStage = stageNum;
    updateWizardDisplay();
  }

  function markStageAsCompleted(stageNum) {
    const tab = document.querySelector(`.enrollment-progress-tab[data-stage="${stageNum}"]`);
    if (tab) {
      tab.classList.add('completed');
    }
  }

  function checkAllTabsCompleted() {
    const allCompleted = Array.from(stageTabs).every(tab => tab.classList.contains('completed'));

    const completionModal = document.getElementById('enrollmentCompletionModal');
    const completionBoxSidebar = document.getElementById('enrollmentCompletionBoxSidebar');

    if (allCompleted) {
      // Show modal with a slight delay for effect
      if (completionModal) {
        setTimeout(() => {
          completionModal.style.display = 'flex';
        }, 300);
      }

      // Also show sidebar box
      if (completionBoxSidebar) {
        completionBoxSidebar.style.display = 'block';
      }

      // Hide all alerts
      const alertBox = document.querySelector('.alert-box-hp');
      if (alertBox) {
        alertBox.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        alertBox.style.opacity = '0';
        alertBox.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          alertBox.style.display = 'none';
        }, 300);
      }
    }
  }

  function updateWizardDisplay() {
    // Update tabs
    stageTabs.forEach((tab, index) => {
      const stage = parseInt(tab.getAttribute('data-stage'));

      tab.classList.remove('active');
      // Don't remove 'completed' class - preserve it

      if (stage === currentStage) {
        tab.classList.add('active');
      }
    });

    // Update content
    stageContent.forEach((content, index) => {
      const stage = index + 1;
      content.classList.remove('active');

      if (stage === currentStage) {
        content.classList.add('active');
      }
    });
  }

  function completeEnrollment() {
    // Hide wizard content
    const wizardContent = document.querySelector('.enrollment-wizard-content');
    const successState = document.getElementById('enrollmentSuccessState');

    if (wizardContent && successState) {
      wizardContent.style.display = 'none';
      successState.style.display = 'block';

      // Trigger confetti
      if (typeof launchConfetti === 'function') {
        setTimeout(() => {
          launchConfetti();
        }, 300);
      }
    }
  }
});
