console.log('Application JS loaded!');

// Application State Management
const APPLICATION_STORAGE_KEY = 'apusApplicationState';

// Initialize application state
let applicationState = {
  currentStep: 1,
  totalSteps: 5,
  personalInfo: {},
  education: {},
  military: {},
  documents: {
    transcript: null,
    id: null,
    additional: []
  },
  program: '',
  startTerm: '',
  completedSteps: []
};

// Load saved state from localStorage on page load
function loadApplicationState() {
  const savedState = localStorage.getItem(APPLICATION_STORAGE_KEY);
  if (savedState) {
    applicationState = JSON.parse(savedState);
    console.log('Loaded application state:', applicationState);

    // Restore current step
    goToAppStep(applicationState.currentStep, false);

    // Populate form fields with saved data
    populateFormFields();
  }
}

// Save state to localStorage
function saveApplicationState() {
  localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(applicationState));
  console.log('Saved application state:', applicationState);
}

// Navigate to specific step
function goToAppStep(stepNumber, saveData = true) {
  // Save current step data before navigating
  if (saveData) {
    saveCurrentStepData();
  }

  // Hide all steps
  for (let i = 1; i <= applicationState.totalSteps; i++) {
    const stepElement = document.getElementById(`appStep${i}`);
    if (stepElement) {
      stepElement.style.display = 'none';
    }
  }

  // Show target step
  const targetStep = document.getElementById(`appStep${stepNumber}`);
  if (targetStep) {
    targetStep.style.display = 'block';
    applicationState.currentStep = stepNumber;
    saveApplicationState();
  }

  // Update progress tracker
  updateProgressTracker(stepNumber);

  // Update navigation buttons
  updateNavigationButtons(stepNumber);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Save current step data
function saveCurrentStepData() {
  const currentStep = applicationState.currentStep;

  switch(currentStep) {
    case 1: // Personal Info
      const personalForm = document.getElementById('personalInfoForm');
      if (personalForm) {
        const formData = new FormData(personalForm);
        applicationState.personalInfo = Object.fromEntries(formData);
      }
      break;

    case 2: // Education
      const educationForm = document.getElementById('educationForm');
      if (educationForm) {
        const formData = new FormData(educationForm);
        applicationState.education = Object.fromEntries(formData);

        // Save college attendance status
        const attendedCollege = document.querySelector('input[name="attendedCollege"]:checked');
        if (attendedCollege) {
          applicationState.education.attendedCollege = attendedCollege.value;
        }
      }
      break;

    case 3: // Military Background
      const militaryForm = document.getElementById('militaryForm');
      if (militaryForm) {
        const formData = new FormData(militaryForm);
        applicationState.military = Object.fromEntries(formData);
      }
      break;

    case 4: // Documents - save bypass state
      const transcriptBypass = document.getElementById('transcriptBypass');
      if (transcriptBypass) {
        applicationState.documents.transcriptBypass = transcriptBypass.checked;
      }
      break;

    case 5: // Review & Submit
      const programSelect = document.getElementById('programSelect');
      const startTerm = document.getElementById('startTerm');

      if (programSelect) {
        applicationState.program = programSelect.value;
      }
      if (startTerm) {
        applicationState.startTerm = startTerm.value;
      }
      break;
  }

  saveApplicationState();
}

// Populate form fields with saved data
function populateFormFields() {
  // Personal Info
  if (applicationState.personalInfo) {
    Object.keys(applicationState.personalInfo).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        field.value = applicationState.personalInfo[key];
      }
    });
  }

  // Education
  if (applicationState.education) {
    Object.keys(applicationState.education).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        field.value = applicationState.education[key];
      }
    });

    // Set college attendance radio
    if (applicationState.education.attendedCollege) {
      const radio = document.getElementById(
        applicationState.education.attendedCollege === 'yes' ? 'attendedYes' : 'attendedNo'
      );
      if (radio) {
        radio.checked = true;
        toggleCollegeDetails();
      }
    }
  }

  // Military Background
  if (applicationState.military) {
    Object.keys(applicationState.military).forEach(key => {
      const field = document.getElementById(key);
      if (field) {
        if (field.type === 'radio') {
          if (field.value === applicationState.military[key]) {
            field.checked = true;
          }
        } else {
          field.value = applicationState.military[key];
        }
      }
    });

    // Trigger conditional display after restoring values
    setTimeout(() => {
      if (applicationState.military.militaryAffiliation) {
        handleMilitaryAffiliationChange();
      }
    }, 100);
  }

  // Documents - restore bypass checkbox state
  if (applicationState.documents && applicationState.documents.transcriptBypass) {
    const transcriptBypass = document.getElementById('transcriptBypass');
    if (transcriptBypass) {
      transcriptBypass.checked = applicationState.documents.transcriptBypass;
    }
  }

  // Program selection
  if (applicationState.program) {
    const programSelect = document.getElementById('programSelect');
    if (programSelect) {
      programSelect.value = applicationState.program;
    }
  }

  if (applicationState.startTerm) {
    const startTerm = document.getElementById('startTerm');
    if (startTerm) {
      startTerm.value = applicationState.startTerm;
    }
  }
}

// Update progress tracker visual state
function updateProgressTracker(currentStep) {
  const stepIndicators = document.querySelectorAll('.step-indicator');

  stepIndicators.forEach((indicator, index) => {
    const stepNum = index + 1;
    const circle = indicator.querySelector('.step-circle');
    const number = indicator.querySelector('.step-number');
    const check = indicator.querySelector('.step-check');
    const label = indicator.querySelector('.step-label');
    const line = indicator.querySelector('.step-line');

    // Reset classes
    circle.classList.remove('active', 'completed');
    label.classList.remove('active');

    if (stepNum < currentStep) {
      // Completed steps
      circle.classList.add('completed');
      if (number) number.classList.add('hidden');
      if (check) check.classList.remove('hidden');
      if (line) line.classList.add('completed');
    } else if (stepNum === currentStep) {
      // Current step
      circle.classList.add('active');
      label.classList.add('active');
      if (number) number.classList.remove('hidden');
      if (check) check.classList.add('hidden');
    } else {
      // Future steps
      if (number) number.classList.remove('hidden');
      if (check) check.classList.add('hidden');
      if (line) line.classList.remove('completed');
    }
  });
}

// Update navigation buttons
function updateNavigationButtons(currentStep) {
  const backBtn = document.getElementById('appBackBtn');
  const nextBtn = document.getElementById('appNextBtn');

  // Back button
  if (currentStep === 1) {
    backBtn.style.display = 'none';
  } else {
    backBtn.style.display = 'block';
  }

  // Next button - always shown (will be hidden after submission via submitApplication())
  if (currentStep === 5) {
    nextBtn.textContent = 'Submit Application';
    nextBtn.style.display = 'block';
  } else {
    nextBtn.textContent = 'Next';
    nextBtn.style.display = 'block';
  }
}

// Validate current step
function validateCurrentStep() {
  const currentStep = applicationState.currentStep;

  switch(currentStep) {
    case 1: // Personal Info
      const personalForm = document.getElementById('personalInfoForm');
      if (!personalForm.checkValidity()) {
        personalForm.reportValidity();
        return false;
      }
      return true;

    case 2: // Education
      const educationForm = document.getElementById('educationForm');
      if (!educationForm.checkValidity()) {
        educationForm.reportValidity();
        return false;
      }
      return true;

    case 3: // Military Background
      const militaryForm = document.getElementById('militaryForm');
      if (!militaryForm) {
        return true;
      }
      if (!militaryForm.checkValidity()) {
        militaryForm.reportValidity();
        return false;
      }
      return true;

    case 4: // Documents
      const transcriptBypass = document.getElementById('transcriptBypass');

      // Check if required documents are uploaded OR bypass is checked
      if (!applicationState.documents.transcript && !(transcriptBypass && transcriptBypass.checked)) {
        alert('Please upload official transcripts or check the bypass option to proceed');
        return false;
      }
      if (!applicationState.documents.id) {
        alert('Please upload a government-issued photo ID');
        return false;
      }
      return true;

    case 5: // Review & Submit
      const programSelect = document.getElementById('programSelect');
      const startTerm = document.getElementById('startTerm');
      const certifyAccurate = document.getElementById('certifyAccurate');
      const agreeTerms = document.getElementById('agreeTerms');
      const authorizeRecords = document.getElementById('authorizeRecords');

      if (!programSelect.value) {
        alert('Please select a program');
        return false;
      }
      if (!startTerm.value) {
        alert('Please select a start term');
        return false;
      }
      if (!certifyAccurate.checked || !agreeTerms.checked || !authorizeRecords.checked) {
        alert('Please agree to all certifications and agreements');
        return false;
      }
      return true;

    default:
      return true;
  }
}

// Populate review section
function populateReviewSection() {
  // Personal Info
  const fullName = `${applicationState.personalInfo.firstName || ''} ${applicationState.personalInfo.middleName || ''} ${applicationState.personalInfo.lastName || ''}`.trim();
  document.getElementById('reviewName').textContent = fullName || '-';
  document.getElementById('reviewEmail').textContent = applicationState.personalInfo.email || '-';
  document.getElementById('reviewPhone').textContent = applicationState.personalInfo.phone || '-';
  document.getElementById('reviewDOB').textContent = applicationState.personalInfo.dateOfBirth || '-';

  const address = [
    applicationState.personalInfo.address1,
    applicationState.personalInfo.address2,
    applicationState.personalInfo.city,
    applicationState.personalInfo.state,
    applicationState.personalInfo.zipCode
  ].filter(Boolean).join(', ');
  document.getElementById('reviewAddress').textContent = address || '-';

  // Education
  const highSchool = `${applicationState.education.highSchoolName || '-'}, ${applicationState.education.highSchoolCity || ''} ${applicationState.education.highSchoolState || ''}`.trim();
  document.getElementById('reviewHighSchool').textContent = highSchool;
  document.getElementById('reviewGradYear').textContent = applicationState.education.graduationYear || '-';

  // College info
  if (applicationState.education.attendedCollege === 'yes') {
    const collegeSection = document.getElementById('reviewCollegeSection');
    collegeSection.style.display = 'block';

    const college = `${applicationState.education.collegeName || '-'}, ${applicationState.education.collegeCity || ''} ${applicationState.education.collegeState || ''}`.trim();
    document.getElementById('reviewCollege').textContent = college;
  }

  // Military Background
  const militaryAffiliationMap = {
    'none': 'No Military Affiliation',
    'active-duty': 'Active Duty',
    'veteran': 'Veteran',
    'reserve': 'Reserve',
    'national-guard': 'National Guard',
    'spouse': 'Military Spouse',
    'dependent': 'Military Dependent'
  };

  const affiliationText = militaryAffiliationMap[applicationState.military.militaryAffiliation] || '-';
  document.getElementById('reviewMilitaryAffiliation').textContent = affiliationText;

  if (applicationState.military.branchOfService) {
    const branchSection = document.getElementById('reviewBranchSection');
    if (branchSection) {
      branchSection.style.display = 'block';
      const branchMap = {
        'army': 'Army',
        'navy': 'Navy',
        'air-force': 'Air Force',
        'marines': 'Marines',
        'coast-guard': 'Coast Guard',
        'space-force': 'Space Force'
      };
      document.getElementById('reviewBranch').textContent = branchMap[applicationState.military.branchOfService] || '-';
    }
  }

  // Documents
  const documentsDiv = document.getElementById('reviewDocuments');
  let docsHTML = '';

  if (applicationState.documents.transcript) {
    docsHTML += '<p class="mb-1"><i class="fas fa-file-pdf text-primary"></i> Official Transcripts</p>';
  } else if (applicationState.documents.transcriptBypass) {
    docsHTML += '<p class="mb-1 text-warning"><i class="fas fa-exclamation-triangle"></i> Official Transcripts - Will upload later</p>';
  }
  if (applicationState.documents.id) {
    docsHTML += '<p class="mb-1"><i class="fas fa-file-pdf text-primary"></i> Government ID</p>';
  }
  if (applicationState.documents.additional.length > 0) {
    docsHTML += `<p class="mb-1"><i class="fas fa-file-pdf text-primary"></i> Additional Documents (${applicationState.documents.additional.length})</p>`;
  }

  if (docsHTML) {
    documentsDiv.innerHTML = docsHTML;
  }
}

// Handle file upload
function setupFileUploads() {
  // Transcript upload
  const transcriptUpload = document.getElementById('transcriptUpload');
  const transcriptFile = document.getElementById('transcriptFile');

  if (transcriptUpload && transcriptFile) {
    transcriptUpload.addEventListener('click', () => transcriptFile.click());
    transcriptFile.addEventListener('change', (e) => handleFileUpload(e, 'transcript'));
  }

  // ID upload
  const idUpload = document.getElementById('idUpload');
  const idFile = document.getElementById('idFile');

  if (idUpload && idFile) {
    idUpload.addEventListener('click', () => idFile.click());
    idFile.addEventListener('change', (e) => handleFileUpload(e, 'id'));
  }

  // Additional documents upload
  const additionalUpload = document.getElementById('additionalUpload');
  const additionalFile = document.getElementById('additionalFile');

  if (additionalUpload && additionalFile) {
    additionalUpload.addEventListener('click', () => additionalFile.click());
    additionalFile.addEventListener('change', (e) => handleFileUpload(e, 'additional'));
  }
}

// Handle file upload
function handleFileUpload(event, type) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const file = files[0];

  // Store file info (in real app, would upload to server)
  if (type === 'transcript') {
    applicationState.documents.transcript = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    displayUploadedFile(file, 'transcriptFileList', type);
  } else if (type === 'id') {
    applicationState.documents.id = {
      name: file.name,
      size: file.size,
      type: file.type
    };
    displayUploadedFile(file, 'idFileList', type);
  } else if (type === 'additional') {
    applicationState.documents.additional.push({
      name: file.name,
      size: file.size,
      type: file.type
    });
    displayUploadedFile(file, 'additionalFileList', type);
  }

  saveApplicationState();
}

// Display uploaded file
function displayUploadedFile(file, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fileItem = document.createElement('div');
  fileItem.className = 'file-item';
  fileItem.innerHTML = `
    <div class="file-item-info">
      <i class="fas fa-file-pdf file-item-icon"></i>
      <div>
        <div class="file-item-name">${file.name}</div>
        <div class="file-item-size">${formatFileSize(file.size)}</div>
      </div>
    </div>
    <button class="file-item-remove" onclick="removeFile('${type}', '${file.name}')">
      <i class="fas fa-times"></i> Remove
    </button>
  `;

  if (type === 'additional') {
    container.appendChild(fileItem);
  } else {
    container.innerHTML = '';
    container.appendChild(fileItem);
  }
}

// Remove uploaded file
function removeFile(type, fileName) {
  if (type === 'transcript') {
    applicationState.documents.transcript = null;
    document.getElementById('transcriptFileList').innerHTML = '';
  } else if (type === 'id') {
    applicationState.documents.id = null;
    document.getElementById('idFileList').innerHTML = '';
  } else if (type === 'additional') {
    applicationState.documents.additional = applicationState.documents.additional.filter(
      doc => doc.name !== fileName
    );
    // Rebuild file list
    const container = document.getElementById('additionalFileList');
    container.innerHTML = '';
    applicationState.documents.additional.forEach(doc => {
      displayUploadedFile(doc, 'additionalFileList', 'additional');
    });
  }

  saveApplicationState();
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Toggle college details
function toggleCollegeDetails() {
  const attendedYes = document.getElementById('attendedYes');
  const collegeDetails = document.getElementById('collegeDetails');

  if (attendedYes && collegeDetails) {
    collegeDetails.style.display = attendedYes.checked ? 'block' : 'none';
  }
}

// Populate confirmation page
function populateConfirmation() {
  const today = new Date();
  document.getElementById('confirmSubmissionDate').textContent = today.toLocaleDateString();

  const programSelect = document.getElementById('programSelect');
  if (programSelect) {
    const selectedOption = programSelect.options[programSelect.selectedIndex];
    document.getElementById('confirmProgram').textContent = selectedOption.text;
  }

  const startTerm = document.getElementById('startTerm');
  if (startTerm) {
    const selectedTerm = startTerm.options[startTerm.selectedIndex];
    document.getElementById('confirmStartTerm').textContent = selectedTerm.text;
  }

  // Generate random application ID
  const appId = 'APP-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);
  document.getElementById('confirmApplicationId').textContent = appId;
}

// Submit application - show confirmation section
function submitApplication() {
  // Hide review section
  const reviewSection = document.getElementById('reviewSection');
  if (reviewSection) {
    reviewSection.style.display = 'none';
  }

  // Show confirmation section
  const confirmationSection = document.getElementById('confirmationSection');
  if (confirmationSection) {
    confirmationSection.style.display = 'block';
  }

  // Populate confirmation details
  populateConfirmation();

  // Hide navigation buttons
  const stepNavigation = document.getElementById('appStepNavigation');
  if (stepNavigation) {
    stepNavigation.style.display = 'none';
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Celebrate with confetti!
  setTimeout(() => {
    if (typeof celebrateWithConfetti === 'function') {
      celebrateWithConfetti();
    }
  }, 500);
}

// Handle military affiliation change
function handleMilitaryAffiliationChange() {
  const affiliation = document.getElementById('militaryAffiliation');
  if (!affiliation) return;

  const value = affiliation.value;

  const branchSection = document.getElementById('branchSection');
  const rankSection = document.getElementById('rankSection');
  const serviceDatesSection = document.getElementById('serviceDatesSection');
  const mosSection = document.getElementById('mosSection');
  const benefitsSection = document.getElementById('benefitsSection');
  const taSection = document.getElementById('taSection');

  // Show/hide sections based on affiliation
  const isServiceMember = ['active-duty', 'veteran', 'reserve', 'national-guard'].includes(value);
  const isActiveDuty = value === 'active-duty' || value === 'reserve' || value === 'national-guard';
  const hasService = isServiceMember || value === 'spouse' || value === 'dependent';

  if (branchSection) {
    branchSection.style.display = hasService ? 'block' : 'none';
    const branchSelect = document.getElementById('branchOfService');
    if (branchSelect) {
      branchSelect.required = hasService;
    }
  }

  if (rankSection) {
    rankSection.style.display = isServiceMember ? 'block' : 'none';
  }

  if (serviceDatesSection) {
    serviceDatesSection.style.display = isServiceMember ? 'block' : 'none';
  }

  if (mosSection) {
    mosSection.style.display = isServiceMember ? 'block' : 'none';
  }

  if (benefitsSection) {
    benefitsSection.style.display = (value === 'veteran') ? 'block' : 'none';
  }

  if (taSection) {
    taSection.style.display = isActiveDuty ? 'block' : 'none';
  }
}

// Reset application
function resetApplication() {
  if (confirm('Are you sure you want to reset your application? All data will be lost.')) {
    localStorage.removeItem(APPLICATION_STORAGE_KEY);
    location.reload();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load saved state
  loadApplicationState();

  // Setup event listeners
  const nextBtn = document.getElementById('appNextBtn');
  const backBtn = document.getElementById('appBackBtn');
  const resetBtn = document.getElementById('resetApplicationBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (validateCurrentStep()) {
        saveCurrentStepData();

        if (applicationState.currentStep === 4) {
          // Before going to review, populate it
          setTimeout(() => populateReviewSection(), 100);
        }

        if (applicationState.currentStep === 5) {
          // Submit application - show confirmation section
          submitApplication();
        } else {
          goToAppStep(applicationState.currentStep + 1);
        }
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function() {
      saveCurrentStepData();
      goToAppStep(applicationState.currentStep - 1);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetApplication);
  }

  // Setup college attendance toggle
  const attendedYes = document.getElementById('attendedYes');
  const attendedNo = document.getElementById('attendedNo');

  if (attendedYes && attendedNo) {
    attendedYes.addEventListener('change', toggleCollegeDetails);
    attendedNo.addEventListener('change', toggleCollegeDetails);
  }

  // Setup file uploads
  setupFileUploads();

  // If on review step, populate it
  if (applicationState.currentStep === 5) {
    populateReviewSection();
  }

  // Setup military affiliation change handler
  const militaryAffiliation = document.getElementById('militaryAffiliation');
  if (militaryAffiliation) {
    militaryAffiliation.addEventListener('change', handleMilitaryAffiliationChange);
  }
});
