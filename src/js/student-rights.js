console.log('Student Orientation JS loaded!');

const ORIENTATION_STORAGE_KEY = 'apusStudentOrientationState';

let orientationState = {
  currentStep: 1,
  totalSteps: 5,
  completedSteps: [],
  acknowledged: false,
  completionDate: null,
  checklistItems: {
    'check-responsibilities': false,
    'check-tuition': false,
    'check-census': false,
    'check-profile': false,
    'check-info': false,
    'check-agreement': false,
    'check-ecampus': false
  }
};

// Load saved state on page load
document.addEventListener('DOMContentLoaded', function() {
  loadOrientationState();
  initializeOrientationFlow();
  initializeChecklist();
});

function loadOrientationState() {
  const savedState = localStorage.getItem(ORIENTATION_STORAGE_KEY);
  if (savedState) {
    orientationState = JSON.parse(savedState);

    // If already completed, show confirmation
    if (orientationState.acknowledged) {
      goToOrientationStep(6, false); // Go to confirmation page
      displayCompletionInfo();
    } else {
      goToOrientationStep(orientationState.currentStep, false);
    }
  }
}

function saveOrientationState() {
  localStorage.setItem(ORIENTATION_STORAGE_KEY, JSON.stringify(orientationState));
}

function initializeOrientationFlow() {
  const nextBtn = document.getElementById('rightsNextBtn');
  const backBtn = document.getElementById('rightsBackBtn');
  const downloadBtn = document.getElementById('downloadReceipt');
  const resetBtn = document.getElementById('resetOrientationBtn');
  const beginBtn = document.getElementById('beginOrientationBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', handleNextClick);
  }

  if (backBtn) {
    backBtn.addEventListener('click', handleBackClick);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadAcknowledgmentReceipt);
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetOrientation);
  }

  if (beginBtn) {
    beginBtn.addEventListener('click', function() {
      goToOrientationStep(2);
    });
  }

  // Update initial state
  updateProgressTracker(orientationState.currentStep);
  updateNavigationButtons(orientationState.currentStep);
}

function initializeChecklist() {
  const checkboxes = document.querySelectorAll('.task-checkbox');

  checkboxes.forEach(checkbox => {
    // Restore saved state - programmatically check disabled checkboxes
    if (orientationState.checklistItems[checkbox.id]) {
      checkbox.checked = true;

      // Also restore task-completed class
      const taskItem = document.querySelector(`[data-task-id="${checkbox.id}"]`);
      if (taskItem) {
        taskItem.classList.add('task-completed');
      }
    }
  });

  // Update progress on load
  updateChecklistProgress();

  // TODO: Connect checklist completion to actual task events
  // Example: When user completes a specific action, call:
  // completeChecklistItem('check-responsibilities');

  // For demo purposes, you can manually trigger completion like this:
  // setTimeout(() => completeChecklistItem('check-responsibilities'), 2000);
}

function completeChecklistItem(checkboxId) {
  // Mark item as complete in state
  orientationState.checklistItems[checkboxId] = true;

  // Find the task item by data-task-id
  const taskItem = document.querySelector(`[data-task-id="${checkboxId}"]`);
  const checkbox = document.getElementById(checkboxId);

  if (taskItem && checkbox) {
    // Add task-completed class to match applicant.njk styling
    taskItem.classList.add('task-completed');

    // Programmatically check the disabled checkbox
    checkbox.checked = true;
  }

  // Update progress bar
  updateChecklistProgress();

  // Save state
  saveOrientationState();
}

function updateChecklistProgress() {
  const totalItems = Object.keys(orientationState.checklistItems).length;
  const checkedItems = Object.values(orientationState.checklistItems).filter(val => val === true).length;

  const progressText = document.getElementById('checklistProgress');
  const progressBar = document.getElementById('checklistProgressBar');

  if (progressText) {
    progressText.textContent = `${checkedItems} of ${totalItems}`;
  }

  if (progressBar) {
    const percentage = (checkedItems / totalItems) * 100;
    progressBar.style.width = `${percentage}%`;
  }
}

function isChecklistComplete() {
  return Object.values(orientationState.checklistItems).every(val => val === true);
}

function resetOrientation() {
  if (confirm('Are you sure you want to reset your orientation progress? This will clear all your progress and start over.')) {
    localStorage.removeItem(ORIENTATION_STORAGE_KEY);
    location.reload();
  }
}

function handleNextClick() {
  const currentStep = orientationState.currentStep;

  // Validate checklist on step 1
  if (currentStep === 1 && !isChecklistComplete()) {
    alert('Please complete all checklist items before proceeding to the next step.');
    return;
  }

  // Validate current step before proceeding
  if (currentStep === 5) {
    // Validate acknowledgment form
    if (!validateAcknowledgmentForm()) {
      return;
    }

    // Mark as completed
    completeAcknowledgment();
    goToOrientationStep(6); // Go to confirmation
  } else {
    // Move to next step
    goToOrientationStep(currentStep + 1);
  }
}

function handleBackClick() {
  const currentStep = orientationState.currentStep;
  if (currentStep > 1) {
    goToOrientationStep(currentStep - 1);
  }
}

function goToOrientationStep(stepNumber, saveData = true) {
  // Hide all steps
  for (let i = 1; i <= orientationState.totalSteps; i++) {
    const stepElement = document.getElementById(`rightsStep${i}`);
    if (stepElement) {
      stepElement.style.display = 'none';
    }
  }

  // Hide confirmation page
  const confirmationElement = document.getElementById('rightsConfirmation');
  if (confirmationElement) {
    confirmationElement.style.display = 'none';
  }

  // Show target step
  if (stepNumber === 6) {
    // Show confirmation page
    if (confirmationElement) {
      confirmationElement.style.display = 'block';
    }
  } else {
    const targetStep = document.getElementById(`rightsStep${stepNumber}`);
    if (targetStep) {
      targetStep.style.display = 'block';
      orientationState.currentStep = stepNumber;

      if (saveData) {
        saveOrientationState();
      }
    }
  }

  updateProgressTracker(stepNumber);
  updateNavigationButtons(stepNumber);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressTracker(currentStep) {
  const steps = document.querySelectorAll('.step-indicator');

  steps.forEach((step, index) => {
    const stepNum = index + 1;
    const circle = step.querySelector('.step-circle');
    const stepNumber = step.querySelector('.step-number');
    const stepCheck = step.querySelector('.step-check');

    if (stepNum < currentStep) {
      // Completed step
      circle.classList.add('completed');
      circle.classList.remove('active');
      if (stepNumber) stepNumber.classList.add('hidden');
      if (stepCheck) stepCheck.classList.remove('hidden');
    } else if (stepNum === currentStep) {
      // Active step
      circle.classList.add('active');
      circle.classList.remove('completed');
      if (stepNumber) stepNumber.classList.remove('hidden');
      if (stepCheck) stepCheck.classList.add('hidden');
    } else {
      // Future step
      circle.classList.remove('active', 'completed');
      if (stepNumber) stepNumber.classList.remove('hidden');
      if (stepCheck) stepCheck.classList.add('hidden');
    }
  });
}

function updateNavigationButtons(currentStep) {
  const nextBtn = document.getElementById('rightsNextBtn');
  const backBtn = document.getElementById('rightsBackBtn');

  if (backBtn) {
    if (currentStep === 1) {
      backBtn.style.visibility = 'hidden';
    } else if (currentStep === 6) {
      backBtn.style.display = 'none';
    } else {
      backBtn.style.visibility = 'visible';
      backBtn.style.display = 'block';
    }
  }

  if (nextBtn) {
    if (currentStep === 5) {
      nextBtn.textContent = 'Submit Acknowledgment';
      nextBtn.classList.add('btn-main');
    } else if (currentStep === 6) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.textContent = 'Next';
      nextBtn.classList.add('btn-main');
    }
  }
}

function validateAcknowledgmentForm() {
  const form = document.getElementById('rightsAcknowledgmentForm');

  if (!form) {
    return false;
  }

  if (!form.checkValidity()) {
    // Show which checkboxes are not checked
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    let uncheckedItems = [];

    checkboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        const label = form.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
          uncheckedItems.push(label.textContent.split(':')[0]);
        }
      }
    });

    if (uncheckedItems.length > 0) {
      alert(`Please acknowledge the following items:\n\n${uncheckedItems.join('\n')}`);
    }

    return false;
  }

  return true;
}

function completeAcknowledgment() {
  const now = new Date();

  orientationState.acknowledged = true;
  orientationState.completionDate = now.toISOString();
  orientationState.completedSteps = [1, 2, 3, 4, 5];

  saveOrientationState();

  // Mark the task as completed in the enrollment to-do list
  markEnrollmentTaskComplete('student-orientation');
}

function displayCompletionInfo() {
  const completionDateElement = document.getElementById('completionDate');
  const completionTimeElement = document.getElementById('completionTime');

  if (orientationState.completionDate) {
    const date = new Date(orientationState.completionDate);

    if (completionDateElement) {
      completionDateElement.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (completionTimeElement) {
      completionTimeElement.textContent = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
}

function downloadAcknowledgmentReceipt() {
  // Create a simple text receipt
  const date = new Date(orientationState.completionDate);
  const receiptContent = `
AMERICAN PUBLIC UNIVERSITY SYSTEM
Student Rights and Responsibilities Acknowledgment Receipt

Date: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}

This receipt confirms that the student has reviewed and acknowledged the following:

✓ Academic Policies
  - Academic Integrity Standards
  - Grading and Assessment Policies
  - Attendance and Participation Requirements

✓ Student Code of Conduct
  - Community Standards
  - Prohibited Conduct
  - Disciplinary Procedures

✓ Privacy Rights (FERPA)
  - Rights under FERPA
  - Directory Information
  - Disclosure Policies

✓ Personal Responsibility
  - Understanding and Compliance with University Policies

Status: ACKNOWLEDGED

This acknowledgment has been recorded in the student's official record.

---
American Public University System
${new Date().getFullYear()}
`;

  // Create and download the file
  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `APUS_Student_Rights_Acknowledgment_${date.toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function markEnrollmentTaskComplete(taskId) {
  // Save completion to localStorage so the dashboard can check it
  const enrollmentTasks = JSON.parse(localStorage.getItem('enrollmentTasksState') || '{}');
  enrollmentTasks[taskId] = {
    completed: true,
    completedDate: new Date().toISOString()
  };
  localStorage.setItem('enrollmentTasksState', JSON.stringify(enrollmentTasks));
}
