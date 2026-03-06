console.log("Main JS loaded!");

// DYNAMIC SEARCH
$(document).ready(function(){ 
    $('.search-icon').click(function(){
        $('.dynamic-search').toggleClass('active')
    })
});

// const mobileScreen = window.matchMedia("(max-width: 990px )");
// $(document).ready(function () {
//     $(".dashboard-nav-dropdown-toggle").click(function () {
//         $(this).closest(".dashboard-nav-dropdown")
//             .toggleClass("show")
//             .find(".dashboard-nav-dropdown")
//             .removeClass("show");
//         $(this).parent()
//             .siblings()
//             .removeClass("show");
//     });
//     $(".menu-toggle").click(function () {
//         if (mobileScreen.matches) {
//             $(".dashboard-nav").toggleClass("mobile-show");
//         } else {
//             $(".dashboard").toggleClass("dashboard-compact");
//         }
//     });
// });

function openNav() {
  document.getElementById("mySidebar").style.width = "300px";
  document.getElementById("main").style.marginLeft = "300px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "60px";
  document.getElementById("main").style.marginLeft= "60px";
}

const offcanvasElementList = document.querySelectorAll('.offcanvas')
const offcanvasList = [...offcanvasElementList].map(offcanvasEl => new bootstrap.Offcanvas(offcanvasEl))

// Handle mutually exclusive collapse elements in top navigation
document.addEventListener('DOMContentLoaded', function() {
  const collapseProfile = document.getElementById('collapseProfile');
  const collapseExample = document.getElementById('collapseExample');

  if (collapseProfile && collapseExample) {
    // When Profile collapse is shown, hide the other one
    collapseProfile.addEventListener('show.bs.collapse', function() {
      const exampleCollapse = bootstrap.Collapse.getInstance(collapseExample);
      if (exampleCollapse) {
        exampleCollapse.hide();
      }
    });

    // When Example collapse is shown, hide the other one
    collapseExample.addEventListener('show.bs.collapse', function() {
      const profileCollapse = bootstrap.Collapse.getInstance(collapseProfile);
      if (profileCollapse) {
        profileCollapse.hide();
      }
    });
  }

  // Task List Filtering
  const taskFilterButtons = document.querySelectorAll('.task-filter-btn');
  const taskItems = document.querySelectorAll('.task-item');

  taskFilterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');

      // Update active button
      taskFilterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter tasks
      taskItems.forEach(item => {
        const category = item.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // Initialize Bootstrap Popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

  // Student Journey Stage Switcher
  const stageSwitcher = document.getElementById('stageSwitcher');

  if (stageSwitcher) {
    // Function to update navigation based on stage
    function updateNavigationForStage(stage) {
      const navItems = document.querySelectorAll('.nav-item-stage');

      navItems.forEach(item => {
        const hideForStages = item.getAttribute('data-hide-for-stages');

        if (hideForStages) {
          const hiddenStages = hideForStages.split(',');

          if (hiddenStages.includes(stage)) {
            item.style.display = 'none';
          } else {
            item.style.display = '';
          }
        }
      });
    }

    // Function to update stage content visibility
    function updateStageContent(selectedStage) {
      // Get all stage-specific content elements
      const stageContents = document.querySelectorAll('.stage-content');

      // Hide all stage content
      stageContents.forEach(content => {
        content.style.display = 'none';
      });

      // Show only content for selected stage
      const selectedStageContent = document.querySelectorAll(`.stage-content[data-stage="${selectedStage}"]`);
      selectedStageContent.forEach(content => {
        content.style.display = 'block';
      });
    }

    stageSwitcher.addEventListener('change', function() {
      const selectedStage = this.value;

      // Update stage content visibility
      updateStageContent(selectedStage);

      // Update navigation visibility
      updateNavigationForStage(selectedStage);

      console.log(`Switched to ${selectedStage} stage view`);
    });

    // Initialize on page load based on current selection
    const initialStage = stageSwitcher.value;
    updateStageContent(initialStage);
    updateNavigationForStage(initialStage);

    // Trigger confetti for applicant stage on page load (only once)
    if (initialStage === 'applicant' && typeof celebrateWithConfetti === 'function') {
      // Check if confetti has already been shown
      const confettiShown = localStorage.getItem('applicantConfettiShown');

      if (!confettiShown) {
        setTimeout(() => {
          celebrateWithConfetti();
          // Mark confetti as shown
          localStorage.setItem('applicantConfettiShown', 'true');
        }, 500); // Small delay to ensure page is fully loaded
      }
    }
  }
});
// Stage Switcher for Demo
document.addEventListener('DOMContentLoaded', function() {
  const stageSwitcher = document.getElementById('stageSwitcher');

  if (stageSwitcher) {
    // Function to toggle navigation based on stage
    function toggleNavigationForStage(stage) {
      const defaultNav = document.getElementById('overlay-nav-default');
      const applicantNav = document.getElementById('overlay-nav-applicant');

      if (stage === 'applicant') {
        // Show applicant nav, hide default nav
        if (defaultNav) defaultNav.style.display = 'none';
        if (applicantNav) applicantNav.style.display = 'block';
      } else {
        // Show default nav, hide applicant nav
        if (defaultNav) defaultNav.style.display = 'block';
        if (applicantNav) applicantNav.style.display = 'none';
      }
    }

    stageSwitcher.addEventListener('change', function() {
      const selectedStage = this.value;

      // Hide all stage containers
      document.querySelectorAll('.stage-container').forEach(container => {
        container.classList.remove('active');
      });

      // Show the selected stage container
      const activeContainer = document.querySelector(`.stage-container[data-stage="${selectedStage}"]`);
      if (activeContainer) {
        activeContainer.classList.add('active');
      }

      // Toggle navigation based on stage
      toggleNavigationForStage(selectedStage);

      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initialize navigation on page load based on current stage
    const initialStage = stageSwitcher.value;
    toggleNavigationForStage(initialStage);
  }
});
