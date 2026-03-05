console.log('Enrollment Tasks JS loaded!');

// Task completion order
const TASK_ORDER = [
  'app-submitted',
  'student-orientation',
  'id-verification',
  'transfer-credit',
  'enroll-classes'
];

document.addEventListener('DOMContentLoaded', function() {
  initializeEnrollmentTasks();
});

function initializeEnrollmentTasks() {
  // Only run on pages with the applicant task list
  const taskList = document.querySelector('.applicant-sequential-list');
  if (!taskList) {
    return;
  }

  // Load task states and update UI
  updateTaskStates();

  // Add event listeners to checkboxes
  const checkboxes = taskList.querySelectorAll('.task-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleTaskCheckboxChange);
  });
}

function updateTaskStates() {
  const enrollmentTasks = JSON.parse(localStorage.getItem('enrollmentTasksState') || '{}');
  const taskItems = document.querySelectorAll('.applicant-sequential-list .task-item');

  let nextTaskFound = false;

  TASK_ORDER.forEach((taskId, index) => {
    const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!taskItem) return;

    const checkbox = taskItem.querySelector('.task-checkbox');
    const taskBtn = taskItem.querySelector('.task-btn');
    const isCompleted = enrollmentTasks[taskId]?.completed || false;

    // Check if this is the first task (app-submitted) - always completed
    if (taskId === 'app-submitted') {
      taskItem.classList.add('task-completed');
      taskItem.classList.remove('task-next-step', 'task-locked');
      if (checkbox) {
        checkbox.checked = true;
        checkbox.disabled = true;
      }
      if (taskBtn) {
        taskBtn.classList.remove('task-btn-disabled');
        taskBtn.removeAttribute('disabled');
      }
      return;
    }

    // Check if previous task is completed
    const previousTaskId = TASK_ORDER[index - 1];
    const previousTaskCompleted = previousTaskId === 'app-submitted' || enrollmentTasks[previousTaskId]?.completed || false;

    if (isCompleted) {
      // Task is completed
      taskItem.classList.add('task-completed');
      taskItem.classList.remove('task-next-step', 'task-locked');
      if (checkbox) {
        checkbox.checked = true;
        checkbox.disabled = true;
      }
      if (taskBtn) {
        taskBtn.classList.remove('task-btn-disabled');
        taskBtn.removeAttribute('disabled');
        // Change button text to indicate completion
        if (taskId === 'student-orientation') {
          taskBtn.textContent = 'View Orientation';
        } else if (taskId === 'id-verification') {
          taskBtn.textContent = 'Verified';
        } else if (taskId === 'transfer-credit') {
          taskBtn.textContent = 'View Evaluation';
        }
      }
    } else if (previousTaskCompleted && !nextTaskFound) {
      // This is the next task to complete
      taskItem.classList.add('task-next-step');
      taskItem.classList.remove('task-completed', 'task-locked');
      if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = false;
      }
      if (taskBtn) {
        taskBtn.classList.remove('task-btn-disabled');
        taskBtn.removeAttribute('disabled');
      }

      // Add or update "NEXT STEP" badge
      let badge = taskItem.querySelector('.next-step-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'next-step-badge';
        badge.textContent = 'NEXT STEP';
        taskItem.insertBefore(badge, taskItem.firstChild);
      }

      nextTaskFound = true;
    } else {
      // Task is locked
      taskItem.classList.add('task-locked');
      taskItem.classList.remove('task-completed', 'task-next-step');
      if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = true;
      }
      if (taskBtn) {
        taskBtn.classList.add('task-btn-disabled');
        taskBtn.setAttribute('disabled', 'disabled');
      }

      // Remove "NEXT STEP" badge if it exists
      const badge = taskItem.querySelector('.next-step-badge');
      if (badge) {
        badge.remove();
      }
    }
  });
}

function handleTaskCheckboxChange(event) {
  const checkbox = event.target;
  const taskItem = checkbox.closest('.task-item');
  const taskId = taskItem.getAttribute('data-task-id');

  if (checkbox.checked) {
    // Mark task as completed
    markTaskCompleted(taskId);
  } else {
    // Unmark task (for testing purposes)
    markTaskIncomplete(taskId);
  }

  // Update all task states
  updateTaskStates();
}

function markTaskCompleted(taskId) {
  const enrollmentTasks = JSON.parse(localStorage.getItem('enrollmentTasksState') || '{}');
  enrollmentTasks[taskId] = {
    completed: true,
    completedDate: new Date().toISOString()
  };
  localStorage.setItem('enrollmentTasksState', JSON.stringify(enrollmentTasks));
}

function markTaskIncomplete(taskId) {
  const enrollmentTasks = JSON.parse(localStorage.getItem('enrollmentTasksState') || '{}');
  delete enrollmentTasks[taskId];
  localStorage.setItem('enrollmentTasksState', JSON.stringify(enrollmentTasks));
}

// Check for completion from other flows
function checkExternalTaskCompletion() {
  // Check if student orientation was completed
  const orientationState = JSON.parse(localStorage.getItem('apusStudentOrientationState') || '{}');
  if (orientationState.acknowledged) {
    markTaskCompleted('student-orientation');
  }

  // Update the UI
  updateTaskStates();
}

// Run external check on page load
document.addEventListener('DOMContentLoaded', function() {
  checkExternalTaskCompletion();
});
