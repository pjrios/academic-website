
// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'programming-basics';
};

const SIMULATOR_NAME = getSimulatorName();
const TAB_STORAGE_KEY = `tabState_${SIMULATOR_NAME}`;

// Save tab state to localStorage
function saveTabState(tabId) {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, tabId);
  } catch (e) {
    console.warn('Failed to save tab state:', e);
  }
}

// Restore tab state from localStorage
function restoreTabState() {
  try {
    const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab) {
      const tabButton = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
      const tabContent = document.getElementById(savedTab);
      
      if (tabButton && tabContent) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        tabButton.classList.add('active');
        tabContent.classList.add('active');
        return savedTab;
      }
    }
  } catch (e) {
    console.warn('Failed to restore tab state:', e);
  }
  return null;
}

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    
    // Save tab state
    saveTabState(targetTab);
  });
});

// Restore tab state on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    restoreTabState();
  });
} else {
  restoreTabState();
}

// Progress Tracking
const PROGRESS_STORAGE_KEY = 'programmingBasicsProgress';
let progress = {
  completed: new Set(),
  byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
  byCategory: { sequence: 0, variables: 0, loops: 0, challenges: 0 }
};

function loadProgress() {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      progress.completed = new Set(data.completed || []);
      progress.byDifficulty = data.byDifficulty || { beginner: 0, intermediate: 0, advanced: 0 };
      progress.byCategory = data.byCategory || { sequence: 0, variables: 0, loops: 0, challenges: 0 };
    }
  } catch (e) {
    console.error('Error loading progress:', e);
  }
}

function updateProgressDisplay() {
  const totalEl = document.getElementById('totalCompleted');
  const seqEl = document.getElementById('sequenceCompleted');
  const varEl = document.getElementById('variablesCompleted');
  const loopsEl = document.getElementById('loopsCompleted');
  const challEl = document.getElementById('challengesCompleted');
  const begEl = document.getElementById('beginnerCount');
  const intEl = document.getElementById('intermediateCount');
  const advEl = document.getElementById('advancedCount');
  
  if (totalEl) totalEl.textContent = progress.completed.size;
  if (seqEl) seqEl.textContent = progress.byCategory.sequence;
  if (varEl) varEl.textContent = progress.byCategory.variables;
  if (loopsEl) loopsEl.textContent = progress.byCategory.loops;
  if (challEl) challEl.textContent = progress.byCategory.challenges;
  if (begEl) begEl.textContent = progress.byDifficulty.beginner;
  if (intEl) intEl.textContent = progress.byDifficulty.intermediate;
  if (advEl) advEl.textContent = progress.byDifficulty.advanced;
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
      completed: Array.from(progress.completed),
      byDifficulty: progress.byDifficulty,
      byCategory: progress.byCategory
    }));
    // Only update display if elements exist (progress tab might not be loaded yet)
    if (document.getElementById('totalCompleted')) {
      updateProgressDisplay();
    }
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

function markCompleted(category, exerciseId, difficulty) {
  const key = `${category}-${exerciseId}`;
  if (!progress.completed.has(key)) {
    progress.completed.add(key);
    if (difficulty) {
      progress.byDifficulty[difficulty]++;
    }
    progress.byCategory[category]++;
    saveProgress();
  }
}

loadProgress();

// Sequence Exercises with difficulty levels
const sequenceExercises = [
  // Beginner
  {
    task: "Order the steps to make a sandwich",
    difficulty: "beginner",
    steps: [
      "Get bread",
      "Spread butter",
      "Add filling",
      "Close sandwich",
      "Cut in half"
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hint: "Start by getting the bread, then add butter and filling before closing."
  },
  {
    task: "Order the steps to send an email",
    difficulty: "beginner",
    steps: [
      "Open email app",
      "Click compose",
      "Type message",
      "Enter recipient",
      "Click send"
    ],
    correctOrder: [0, 1, 3, 2, 4],
    hint: "Open the app first, then compose. Enter recipient before typing the message."
  },
  {
    task: "Order the steps to log in",
    difficulty: "beginner",
    steps: [
      "Enter password",
      "Open website",
      "Click login",
      "Enter username",
      "Click submit"
    ],
    correctOrder: [1, 2, 3, 0, 4],
    hint: "Open the website first, then click login. Username comes before password."
  },
  {
    task: "Order the steps to make coffee",
    difficulty: "beginner",
    steps: [
      "Boil water",
      "Add coffee grounds",
      "Pour hot water",
      "Wait for brewing",
      "Pour coffee"
    ],
    correctOrder: [0, 1, 2, 3, 4],
    hint: "Boil water first, then add coffee grounds before pouring water."
  },
  // Intermediate
  {
    task: "Order the steps to calculate average",
    difficulty: "intermediate",
    steps: [
      "Add all numbers",
      "Count the numbers",
      "Divide sum by count",
      "Get the numbers"
    ],
    correctOrder: [3, 0, 1, 2],
    hint: "You need the numbers first before you can add or count them."
  },
  {
    task: "Order the steps to find maximum value",
    difficulty: "intermediate",
    steps: [
      "Compare current with max",
      "Get list of numbers",
      "Set max to first number",
      "Update max if larger",
      "Return max value"
    ],
    correctOrder: [1, 2, 0, 3, 4],
    hint: "Get the list first, initialize max, then compare and update."
  },
  {
    task: "Order the steps to sort a list",
    difficulty: "intermediate",
    steps: [
      "Compare adjacent elements",
      "Get unsorted list",
      "Swap if out of order",
      "Repeat until sorted",
      "Return sorted list"
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: "Start with the list, then compare and swap elements."
  },
  {
    task: "Order the steps to search for an item",
    difficulty: "intermediate",
    steps: [
      "Check if item matches",
      "Get list and target item",
      "Move to next item",
      "Return position if found",
      "Return not found if end"
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: "Get the list first, then check each item until found or end."
  },
  // Advanced
  {
    task: "Order the steps to implement binary search",
    difficulty: "advanced",
    steps: [
      "Calculate middle index",
      "Get sorted list and target",
      "Compare target with middle",
      "Search left or right half",
      "Return index or not found"
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: "Binary search requires a sorted list. Find middle, compare, then search the appropriate half."
  },
  {
    task: "Order the steps to reverse a linked list",
    difficulty: "advanced",
    steps: [
      "Store next node",
      "Get linked list head",
      "Point current to previous",
      "Move to next node",
      "Return new head"
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: "Start at head, save next, reverse pointer, then move forward."
  },
  {
    task: "Order the steps to validate parentheses",
    difficulty: "advanced",
    steps: [
      "Check if stack is empty",
      "Get string with parentheses",
      "Push opening, pop on closing",
      "Return true if balanced",
      "Return false if unmatched"
    ],
    correctOrder: [1, 2, 0, 3, 4],
    hint: "Use a stack: push opening brackets, pop on closing. Check if stack is empty at the end."
  },
  {
    task: "Order the steps to merge two sorted arrays",
    difficulty: "advanced",
    steps: [
      "Compare elements from both",
      "Get two sorted arrays",
      "Add smaller to result",
      "Add remaining elements",
      "Return merged array"
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: "Compare elements from both arrays, add the smaller one, then handle remaining elements."
  }
];

let currentSequenceExercise = null;
let draggedElement = null;

const newSequenceBtn = document.getElementById('newSequenceBtn');
const checkSequenceBtn = document.getElementById('checkSequenceBtn');
const resetSequenceBtn = document.getElementById('resetSequenceBtn');
const availableSteps = document.getElementById('availableSteps');
const orderedSteps = document.getElementById('orderedSteps');
const sequenceFeedback = document.getElementById('sequenceFeedback');
const sequenceTask = document.getElementById('sequenceTask');

function loadSequenceExercise() {
  currentSequenceExercise = sequenceExercises[Math.floor(Math.random() * sequenceExercises.length)];
  sequenceTask.textContent = currentSequenceExercise.task;
  
  availableSteps.innerHTML = '';
  orderedSteps.innerHTML = '<div class="drop-zone">Drop steps here in order</div>';
  
  // Clear any incorrect position markings
  orderedSteps.querySelectorAll('.ordered-step').forEach(step => {
    step.classList.remove('incorrect-position');
  });
  
  currentSequenceExercise.steps.forEach((step, index) => {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.textContent = step;
    stepItem.draggable = true;
    stepItem.dataset.index = index;
    
    stepItem.addEventListener('dragstart', (e) => {
      draggedElement = stepItem;
      e.dataTransfer.effectAllowed = 'move';
      stepItem.classList.add('dragging');
    });
    
    stepItem.addEventListener('dragend', () => {
      stepItem.classList.remove('dragging');
      draggedElement = null;
    });
    
    availableSteps.appendChild(stepItem);
  });
  
  sequenceFeedback.style.display = 'none';
}

function checkSequenceAnswer() {
  const ordered = Array.from(orderedSteps.querySelectorAll('.ordered-step'));
  const userOrder = ordered.map(step => parseInt(step.dataset.index));
  
  // Clear previous incorrect markings
  ordered.forEach(step => {
    step.classList.remove('incorrect-position');
  });
  
  if (userOrder.length !== currentSequenceExercise.correctOrder.length) {
    sequenceFeedback.className = 'sequence-feedback incorrect';
    sequenceFeedback.innerHTML = '<strong>Incomplete:</strong> Please order all steps.';
    sequenceFeedback.style.display = 'block';
    return;
  }
  
  const isCorrect = JSON.stringify(userOrder) === JSON.stringify(currentSequenceExercise.correctOrder);
  
  if (isCorrect) {
    sequenceFeedback.className = 'sequence-feedback correct';
    sequenceFeedback.innerHTML = '<strong>✓ Correct!</strong> The steps are in the right order.';
    markCompleted('sequence', currentSequenceExercise.task, currentSequenceExercise.difficulty);
  } else {
    // Find which steps are out of order and mark them
    const incorrectSteps = [];
    const correctSteps = currentSequenceExercise.correctOrder.map(idx => currentSequenceExercise.steps[idx]);
    const userSteps = userOrder.map(idx => currentSequenceExercise.steps[idx]);
    
    userOrder.forEach((stepIndex, position) => {
      const correctPosition = currentSequenceExercise.correctOrder.indexOf(stepIndex);
      if (correctPosition !== position) {
        incorrectSteps.push({
          step: currentSequenceExercise.steps[stepIndex],
          currentPos: position + 1,
          correctPos: correctPosition + 1,
          stepElement: ordered[position]
        });
        // Mark the step as incorrect
        ordered[position].classList.add('incorrect-position');
      }
    });
    
    let feedbackHTML = '<strong>✗ Not quite right.</strong><br><br>';
    
    if (incorrectSteps.length > 0) {
      feedbackHTML += '<strong>Steps out of order:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
      incorrectSteps.forEach(({ step, currentPos, correctPos }) => {
        feedbackHTML += `<li>"${step}" is at position ${currentPos}, but should be at position ${correctPos}</li>`;
      });
      feedbackHTML += '</ul>';
    }
    
    let hintText = '';
    if (currentSequenceExercise.hint) {
      hintText = `<br><small>💡 Hint: ${currentSequenceExercise.hint}</small>`;
    }
    sequenceFeedback.className = 'sequence-feedback incorrect';
    sequenceFeedback.innerHTML = feedbackHTML + hintText;
  }
  sequenceFeedback.style.display = 'block';
}

newSequenceBtn.addEventListener('click', loadSequenceExercise);
checkSequenceBtn.addEventListener('click', checkSequenceAnswer);
resetSequenceBtn.addEventListener('click', loadSequenceExercise);

// Drag and drop for sequence
orderedSteps.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const dropZone = orderedSteps.querySelector('.drop-zone');
  if (dropZone) {
    dropZone.classList.add('drag-over');
  }
});

orderedSteps.addEventListener('dragleave', () => {
  const dropZone = orderedSteps.querySelector('.drop-zone');
  if (dropZone) {
    dropZone.classList.remove('drag-over');
  }
});

orderedSteps.addEventListener('drop', (e) => {
  e.preventDefault();
  const dropZone = orderedSteps.querySelector('.drop-zone');
  if (dropZone) {
    dropZone.remove();
  }
  
  if (draggedElement && draggedElement.parentNode === availableSteps) {
    const stepNumber = orderedSteps.querySelectorAll('.ordered-step').length + 1;
    const orderedStep = document.createElement('div');
    orderedStep.className = 'ordered-step';
    orderedStep.dataset.index = draggedElement.dataset.index;
    
    const stepControls = document.createElement('div');
    stepControls.className = 'step-controls';
    
    const upBtn = document.createElement('button');
    upBtn.className = 'step-move-btn step-up';
    upBtn.innerHTML = '↑';
    upBtn.title = 'Move up';
    upBtn.type = 'button';
    upBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prev = orderedStep.previousElementSibling;
      if (prev && prev.classList.contains('ordered-step')) {
        prev.parentNode.insertBefore(orderedStep, prev);
        updateStepNumbers();
      }
    });
    
    const downBtn = document.createElement('button');
    downBtn.className = 'step-move-btn step-down';
    downBtn.innerHTML = '↓';
    downBtn.title = 'Move down';
    downBtn.type = 'button';
    downBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = orderedStep.nextElementSibling;
      if (next && next.classList.contains('ordered-step')) {
        next.parentNode.insertBefore(orderedStep, next.nextSibling);
        updateStepNumbers();
      }
    });
    
    stepControls.appendChild(upBtn);
    stepControls.appendChild(downBtn);
    
    const stepNum = document.createElement('div');
    stepNum.className = 'step-number';
    stepNum.textContent = stepNumber;
    
    const stepText = document.createElement('div');
    stepText.className = 'step-text';
    stepText.textContent = draggedElement.textContent;
    
    orderedStep.appendChild(stepControls);
    orderedStep.appendChild(stepNum);
    orderedStep.appendChild(stepText);
    
    orderedStep.draggable = true;
    orderedStep.addEventListener('dragstart', (e) => {
      // Don't start drag if clicking on buttons
      if (e.target.classList.contains('step-move-btn') || e.target.closest('.step-controls')) {
        e.preventDefault();
        return false;
      }
      draggedElement = orderedStep;
      e.dataTransfer.effectAllowed = 'move';
      orderedStep.classList.add('dragging');
    });
    
    orderedStep.addEventListener('dragend', () => {
      orderedStep.classList.remove('dragging');
      draggedElement = null;
    });
    
    // Prevent drag when clicking buttons
    stepControls.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    
    orderedSteps.appendChild(orderedStep);
    draggedElement.remove();
    
    // Update step numbers
    updateStepNumbers();
  }
});

// Allow reordering in ordered steps by dragging
orderedSteps.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const dragging = document.querySelector('.ordered-step.dragging');
  if (!dragging) return;
  
  const afterElement = getDragAfterElement(orderedSteps, e.clientY);
  if (afterElement == null) {
    // Only append to end if we're actually at the bottom
    const rect = orderedSteps.getBoundingClientRect();
    if (e.clientY > rect.bottom - 20) {
      if (dragging.nextSibling || dragging.parentNode !== orderedSteps) {
        orderedSteps.appendChild(dragging);
      }
    }
  } else if (afterElement && afterElement !== dragging) {
    // Insert before the element we found
    orderedSteps.insertBefore(dragging, afterElement);
  }
  updateStepNumbers();
});

orderedSteps.addEventListener('drop', (e) => {
  e.preventDefault();
  const dragging = document.querySelector('.ordered-step.dragging');
  if (dragging) {
    dragging.classList.remove('dragging');
    updateStepNumbers();
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.ordered-step:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateStepNumbers() {
  const steps = Array.from(orderedSteps.querySelectorAll('.ordered-step'));
  steps.forEach((step, index) => {
    // Update step number
    const stepNum = step.querySelector('.step-number');
    if (stepNum) {
      stepNum.textContent = index + 1;
    }
    
    // Add up/down buttons if they don't exist
    if (!step.querySelector('.step-controls')) {
      const stepControls = document.createElement('div');
      stepControls.className = 'step-controls';
      
      const upBtn = document.createElement('button');
      upBtn.className = 'step-move-btn step-up';
      upBtn.innerHTML = '↑';
      upBtn.title = 'Move up';
      upBtn.type = 'button';
      upBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prev = step.previousElementSibling;
        if (prev && prev.classList.contains('ordered-step')) {
          prev.parentNode.insertBefore(step, prev);
          updateStepNumbers();
        }
      });
      
      const downBtn = document.createElement('button');
      downBtn.className = 'step-move-btn step-down';
      downBtn.innerHTML = '↓';
      downBtn.title = 'Move down';
      downBtn.type = 'button';
      downBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = step.nextElementSibling;
        if (next && next.classList.contains('ordered-step')) {
          next.parentNode.insertBefore(step, next.nextSibling);
          updateStepNumbers();
        }
      });
      
      stepControls.appendChild(upBtn);
      stepControls.appendChild(downBtn);
      
      // Insert controls before step number
      const stepNumEl = step.querySelector('.step-number');
      if (stepNumEl) {
        step.insertBefore(stepControls, stepNumEl);
      } else {
        step.insertBefore(stepControls, step.firstChild);
      }
      
      // Wrap step text if needed
      const stepText = step.querySelector('.step-text');
      if (!stepText) {
        const textContent = step.textContent.trim();
        const textNodes = Array.from(step.childNodes).filter(node => 
          node.nodeType === Node.TEXT_NODE || 
          (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('step-controls') && !node.classList.contains('step-number'))
        );
        if (textNodes.length > 0 || textContent) {
          const textWrapper = document.createElement('div');
          textWrapper.className = 'step-text';
          if (textContent) {
            textWrapper.textContent = textContent;
          } else {
            textNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                textWrapper.textContent = node.textContent;
              } else {
                textWrapper.appendChild(node);
              }
            });
          }
          step.appendChild(textWrapper);
        }
      }
    }
    
    // Update button states (disable up for first, down for last)
    const upBtn = step.querySelector('.step-up');
    const downBtn = step.querySelector('.step-down');
    if (upBtn) {
      upBtn.disabled = index === 0;
      upBtn.style.opacity = index === 0 ? '0.5' : '1';
      upBtn.style.cursor = index === 0 ? 'not-allowed' : 'pointer';
    }
    if (downBtn) {
      downBtn.disabled = index === steps.length - 1;
      downBtn.style.opacity = index === steps.length - 1 ? '0.5' : '1';
      downBtn.style.cursor = index === steps.length - 1 ? 'not-allowed' : 'pointer';
    }
  });
}

// Variable Tracing with difficulty levels
const variableExercises = [
  // Beginner
  {
    difficulty: "beginner",
    code: [
      { line: 1, text: 'x = 5', vars: { x: 5 } },
      { line: 2, text: 'y = 10', vars: { x: 5, y: 10 } },
      { line: 3, text: 'x = x + y', vars: { x: 15, y: 10 } },
      { line: 4, text: 'print(x)', vars: { x: 15, y: 10 } }
    ]
  },
  {
    difficulty: "beginner",
    code: [
      { line: 1, text: 'a = 3', vars: { a: 3 } },
      { line: 2, text: 'b = 7', vars: { a: 3, b: 7 } },
      { line: 3, text: 'c = a * b', vars: { a: 3, b: 7, c: 21 } },
      { line: 4, text: 'print(c)', vars: { a: 3, b: 7, c: 21 } }
    ]
  },
  {
    difficulty: "beginner",
    code: [
      { line: 1, text: 'name = "Alice"', vars: { name: 'Alice' } },
      { line: 2, text: 'age = 25', vars: { name: 'Alice', age: 25 } },
      { line: 3, text: 'message = name + " is " + str(age)', vars: { name: 'Alice', age: 25, message: 'Alice is 25' } },
      { line: 4, text: 'print(message)', vars: { name: 'Alice', age: 25, message: 'Alice is 25' } }
    ]
  },
  {
    difficulty: "beginner",
    code: [
      { line: 1, text: 'count = 0', vars: { count: 0 } },
      { line: 2, text: 'count = count + 1', vars: { count: 1 } },
      { line: 3, text: 'count = count + 1', vars: { count: 2 } },
      { line: 4, text: 'total = count * 5', vars: { count: 2, total: 10 } }
    ]
  },
  // Intermediate
  {
    difficulty: "intermediate",
    code: [
      { line: 1, text: 'a = 3', vars: { a: 3 } },
      { line: 2, text: 'b = 7', vars: { a: 3, b: 7 } },
      { line: 3, text: 'c = a * b', vars: { a: 3, b: 7, c: 21 } },
      { line: 4, text: 'a = c - a', vars: { a: 18, b: 7, c: 21 } },
      { line: 5, text: 'result = a + b + c', vars: { a: 18, b: 7, c: 21, result: 46 } }
    ]
  },
  {
    difficulty: "intermediate",
    code: [
      { line: 1, text: 'x = 10', vars: { x: 10 } },
      { line: 2, text: 'y = 5', vars: { x: 10, y: 5 } },
      { line: 3, text: 'temp = x', vars: { x: 10, y: 5, temp: 10 } },
      { line: 4, text: 'x = y', vars: { x: 5, y: 5, temp: 10 } },
      { line: 5, text: 'y = temp', vars: { x: 5, y: 10, temp: 10 } }
    ]
  },
  {
    difficulty: "intermediate",
    code: [
      { line: 1, text: 'sum = 0', vars: { sum: 0 } },
      { line: 2, text: 'sum = sum + 5', vars: { sum: 5 } },
      { line: 3, text: 'sum = sum + 10', vars: { sum: 15 } },
      { line: 4, text: 'sum = sum + 15', vars: { sum: 30 } },
      { line: 5, text: 'average = sum / 3', vars: { sum: 30, average: 10 } }
    ]
  },
  {
    difficulty: "intermediate",
    code: [
      { line: 1, text: 'price = 100', vars: { price: 100 } },
      { line: 2, text: 'discount = 0.2', vars: { price: 100, discount: 0.2 } },
      { line: 3, text: 'savings = price * discount', vars: { price: 100, discount: 0.2, savings: 20 } },
      { line: 4, text: 'final_price = price - savings', vars: { price: 100, discount: 0.2, savings: 20, final_price: 80 } }
    ]
  },
  // Advanced
  {
    difficulty: "advanced",
    code: [
      { line: 1, text: 'a = 5', vars: { a: 5 } },
      { line: 2, text: 'b = 10', vars: { a: 5, b: 10 } },
      { line: 3, text: 'a = a + b', vars: { a: 15, b: 10 } },
      { line: 4, text: 'b = a - b', vars: { a: 15, b: 5 } },
      { line: 5, text: 'a = a - b', vars: { a: 10, b: 5 } },
      { line: 6, text: 'result = a * b', vars: { a: 10, b: 5, result: 50 } }
    ]
  },
  {
    difficulty: "advanced",
    code: [
      { line: 1, text: 'x = 2', vars: { x: 2 } },
      { line: 2, text: 'y = 3', vars: { x: 2, y: 3 } },
      { line: 3, text: 'x = x ** y', vars: { x: 8, y: 3 } },
      { line: 4, text: 'y = x // y', vars: { x: 8, y: 2 } },
      { line: 5, text: 'z = x % y', vars: { x: 8, y: 2, z: 0 } }
    ]
  },
  {
    difficulty: "advanced",
    code: [
      { line: 1, text: 'a = 1', vars: { a: 1 } },
      { line: 2, text: 'b = 1', vars: { a: 1, b: 1 } },
      { line: 3, text: 'c = a + b', vars: { a: 1, b: 1, c: 2 } },
      { line: 4, text: 'a = b', vars: { a: 1, b: 1, c: 2 } },
      { line: 5, text: 'b = c', vars: { a: 1, b: 2, c: 2 } },
      { line: 6, text: 'c = a + b', vars: { a: 1, b: 2, c: 3 } }
    ]
  }
];

let currentVariableExercise = null;
let currentStep = -1;

const newVariableBtn = document.getElementById('newVariableBtn');
const stepForwardBtn = document.getElementById('stepForwardBtn');
const stepBackBtn = document.getElementById('stepBackBtn');
const resetVariableBtn = document.getElementById('resetVariableBtn');
const codeDisplay = document.getElementById('codeDisplay');
const variablesTable = document.getElementById('variablesTable');
const traceSteps = document.getElementById('traceSteps');

function loadVariableExercise() {
  currentVariableExercise = variableExercises[Math.floor(Math.random() * variableExercises.length)];
  currentStep = -1;
  
  codeDisplay.innerHTML = currentVariableExercise.code.map(line => 
    `<div class="code-line" data-line="${line.line}">${line.text}</div>`
  ).join('');
  
  updateVariableDisplay();
}

function updateVariableDisplay() {
  // Update code highlighting
  codeDisplay.querySelectorAll('.code-line').forEach((line, index) => {
    line.classList.remove('current', 'executed');
    if (index === currentStep) {
      line.classList.add('current');
    } else if (index < currentStep) {
      line.classList.add('executed');
    }
  });
  
  // Update variables table
  if (currentStep >= 0) {
    const vars = currentVariableExercise.code[currentStep].vars;
    variablesTable.innerHTML = Object.entries(vars).map(([name, value]) => `
      <div class="variable-row">
        <div class="variable-name">${name}</div>
        <div class="variable-value">${value}</div>
      </div>
    `).join('');
  } else {
    variablesTable.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px;">Click "Step Forward" to start</div>';
  }
  
  // Update trace
  traceSteps.innerHTML = currentVariableExercise.code.slice(0, currentStep + 1).map((line, index) => `
    <div class="trace-step">
      <strong>Step ${index + 1}:</strong> ${line.text} → Variables: ${JSON.stringify(line.vars)}
    </div>
  `).join('');
  
  // Update buttons
  stepForwardBtn.disabled = currentStep >= currentVariableExercise.code.length - 1;
  stepBackBtn.disabled = currentStep < 0;
}

newVariableBtn.addEventListener('click', loadVariableExercise);
stepForwardBtn.addEventListener('click', () => {
  if (currentStep < currentVariableExercise.code.length - 1) {
    currentStep++;
    updateVariableDisplay();
  }
});
stepBackBtn.addEventListener('click', () => {
  if (currentStep >= 0) {
    currentStep--;
    updateVariableDisplay();
  }
});
resetVariableBtn.addEventListener('click', () => {
  currentStep = -1;
  updateVariableDisplay();
});

// Operators - Multiple Conditions Builder
const conditionsContainer = document.getElementById('conditionsContainer');
const conditionText = document.getElementById('conditionText');
const conditionResult = document.getElementById('conditionResult');
const addConditionBtn = document.getElementById('addConditionBtn');
const clearConditionsBtn = document.getElementById('clearConditionsBtn');

let conditions = [];

function createConditionElement(index = null) {
  const conditionIndex = index !== null ? index : conditions.length;
  const condition = {
    operand1: 5,
    operator: '>',
    operand2: 3,
    not: false, // NOT operator applied to this condition
    connector: null // 'AND' or 'OR' for connecting to next condition
  };
  
  if (index !== null) {
    conditions.splice(index, 0, condition);
  } else {
    conditions.push(condition);
  }
  
  const conditionDiv = document.createElement('div');
  conditionDiv.className = 'condition-group';
  conditionDiv.dataset.index = conditionIndex;
  
  conditionDiv.innerHTML = `
    <div class="condition-input-group">
      <button class="btn-not-operator ${condition.not ? 'active' : ''}" title="Apply NOT operator" data-index="${conditionIndex}">
        NOT
      </button>
      <input type="number" class="condition-operand" data-field="operand1" placeholder="Value 1" value="${condition.operand1}" />
      <select class="condition-operator" data-field="operator">
        <option value=">">Greater Than (>)</option>
        <option value="<">Less Than (<)</option>
        <option value="==">Equal To (==)</option>
        <option value=">=">Greater or Equal (>=)</option>
        <option value="<=">Less or Equal (<=)</option>
        <option value="!=">Not Equal (!=)</option>
      </select>
      <input type="number" class="condition-operand" data-field="operand2" placeholder="Value 2" value="${condition.operand2}" />
      <button class="btn-remove-condition" title="Remove condition">×</button>
    </div>
  `;
  
  // Event listeners
  conditionDiv.querySelectorAll('.condition-operand, .condition-operator').forEach(input => {
    input.addEventListener('input', () => {
      const field = input.dataset.field;
      conditions[conditionIndex][field] = input.type === 'number' ? parseFloat(input.value) : input.value;
      updateConnectors();
      evaluateAllConditions();
    });
  });
  
  // NOT operator button
  const notBtn = conditionDiv.querySelector('.btn-not-operator');
  if (notBtn) {
    notBtn.addEventListener('click', () => {
      conditions[conditionIndex].not = !conditions[conditionIndex].not;
      notBtn.classList.toggle('active', conditions[conditionIndex].not);
      evaluateAllConditions();
    });
  }
  
  const removeBtn = conditionDiv.querySelector('.btn-remove-condition');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeCondition(conditionIndex);
    });
  }
  
  return conditionDiv;
}

function updateConnectors() {
  // Update all connectors based on current conditions
  conditions.forEach((condition, index) => {
    if (index < conditions.length - 1) {
      condition.connector = condition.connector || 'AND';
    } else {
      condition.connector = null;
    }
  });
  
  // Re-render connectors
  conditionsContainer.querySelectorAll('.condition-connector').forEach(connector => {
    connector.remove();
  });
  
  conditions.forEach((condition, index) => {
    if (index < conditions.length - 1) {
      const group = conditionsContainer.querySelector(`.condition-group[data-index="${index}"]`);
      if (group) {
        const connectorDiv = document.createElement('div');
        connectorDiv.className = 'condition-connector';
        connectorDiv.innerHTML = `
          <select class="connector-select" data-field="connector">
            <option value="AND" ${condition.connector === 'AND' ? 'selected' : ''}>AND</option>
            <option value="OR" ${condition.connector === 'OR' ? 'selected' : ''}>OR</option>
          </select>
        `;
        const connectorSelect = connectorDiv.querySelector('.connector-select');
        connectorSelect.addEventListener('change', () => {
          conditions[index].connector = connectorSelect.value;
          evaluateAllConditions();
        });
        group.appendChild(connectorDiv);
      }
    }
  });
}

function removeCondition(index) {
  conditions.splice(index, 1);
  renderConditions();
  evaluateAllConditions();
}

function renderConditions() {
  conditionsContainer.innerHTML = '';
  conditions.forEach((condition, index) => {
    const conditionDiv = createConditionElement(index);
    conditionsContainer.appendChild(conditionDiv);
    
    // Update values
    conditionDiv.querySelector('[data-field="operand1"]').value = condition.operand1;
    conditionDiv.querySelector('[data-field="operator"]').value = condition.operator;
    conditionDiv.querySelector('[data-field="operand2"]').value = condition.operand2;
    
    // Update NOT button state
    const notBtn = conditionDiv.querySelector('.btn-not-operator');
    if (notBtn) {
      notBtn.classList.toggle('active', condition.not || false);
    }
  });
  updateConnectors();
}

function evaluateCondition(condition) {
  const { operand1, operator, operand2, not } = condition;
  
  if (isNaN(operand1) || isNaN(operand2)) {
    return null;
  }
  
  let result;
  switch(operator) {
    case '>': result = operand1 > operand2; break;
    case '<': result = operand1 < operand2; break;
    case '==': result = operand1 === operand2; break;
    case '>=': result = operand1 >= operand2; break;
    case '<=': result = operand1 <= operand2; break;
    case '!=': result = operand1 !== operand2; break;
    default: result = false;
  }
  
  // Apply NOT operator if enabled
  if (not) {
    result = !result;
  }
  
  return result;
}

function evaluateAllConditions() {
  if (conditions.length === 0) {
    conditionText.textContent = 'Add a condition to start';
    conditionResult.textContent = '—';
    conditionResult.className = 'result-value';
    return;
  }
  
  let result = null;
  let conditionString = '';
  
  conditions.forEach((condition, index) => {
    const conditionResultValue = evaluateCondition(condition);
    
    if (conditionResultValue === null) {
      conditionText.textContent = 'Please enter valid numbers';
      conditionResult.textContent = '—';
      conditionResult.className = 'result-value';
      return;
    }
    
    const notPrefix = condition.not ? 'NOT ' : '';
    const conditionTextPart = `${notPrefix}(${condition.operand1} ${condition.operator} ${condition.operand2})`;
    
    if (index === 0) {
      result = conditionResultValue;
      conditionString = conditionTextPart;
    } else {
      const connector = conditions[index - 1].connector || 'AND';
      conditionString += ` ${connector} ${conditionTextPart}`;
      
      if (connector === 'AND') {
        result = result && conditionResultValue;
      } else if (connector === 'OR') {
        result = result || conditionResultValue;
      }
    }
  });
  
  conditionText.textContent = conditionString;
  conditionResult.textContent = result ? 'true' : 'false';
  conditionResult.className = `result-value ${result}`;
}

if (addConditionBtn) {
  addConditionBtn.addEventListener('click', () => {
    const conditionDiv = createConditionElement();
    conditionsContainer.appendChild(conditionDiv);
    updateConnectors();
    evaluateAllConditions();
  });
}

if (clearConditionsBtn) {
  clearConditionsBtn.addEventListener('click', () => {
    conditions = [];
    renderConditions();
    // Add one default condition
    const conditionDiv = createConditionElement();
    conditionsContainer.appendChild(conditionDiv);
    evaluateAllConditions();
  });
}

// Initialize with one condition
if (conditionsContainer) {
  const conditionDiv = createConditionElement();
  conditionsContainer.appendChild(conditionDiv);
  evaluateAllConditions();
}

const operatorExamples = [
  { expr: '5 > 3', result: true },
  { expr: '10 < 5', result: false },
  { expr: '7 == 7', result: true },
  { expr: '4 >= 4', result: true },
  { expr: '3 <= 2', result: false },
  { expr: '5 != 3', result: true },
  { expr: '8 > 5 AND 3 < 7', result: true },
  { expr: '2 > 5 OR 10 > 8', result: true },
  { expr: 'NOT (5 > 10)', result: true }
];

// Load operator examples
const examplesGrid = document.getElementById('operatorExamples');
if (examplesGrid) {
  operatorExamples.forEach(example => {
    const card = document.createElement('div');
    card.className = 'example-card';
    card.innerHTML = `
      <div class="example-expression">${example.expr}</div>
      <div class="example-result">Result: <strong>${example.result}</strong></div>
    `;
    card.addEventListener('click', () => {
      // Parse and set values if possible
      const match = example.expr.match(/(\d+)\s*([><=!]+)\s*(\d+)/);
      if (match && conditions.length > 0) {
        conditions[0].operand1 = parseFloat(match[1]);
        conditions[0].operand2 = parseFloat(match[3]);
        const opMap = { '>': '>', '<': '<', '==': '==', '>=': '>=', '<=': '<=', '!=': '!=' };
        conditions[0].operator = opMap[match[2]] || '>';
        renderConditions();
        evaluateAllConditions();
      }
    });
    examplesGrid.appendChild(card);
  });
}

// Loops
const loopExercises = [
  {
    code: 'for i in range(5):',
    body: ['print(i)', 'total = total + i'],
    iterations: 5,
    initialVars: { total: 0 }
  },
  {
    code: 'for i in range(3):',
    body: ['count = count + 1', 'print(count)'],
    iterations: 3,
    initialVars: { count: 0 }
  },
  {
    code: 'for i in range(1, 6):',
    body: ['sum = sum + i', 'print(f"Adding {i}")'],
    iterations: 5,
    initialVars: { sum: 0 }
  }
];

let currentLoopExercise = null;
let loopStep = -1;
let loopVariables = {};
let loopOutput = [];

const newLoopBtn = document.getElementById('newLoopBtn');
const runLoopBtn = document.getElementById('runLoopBtn');
const stepLoopBtn = document.getElementById('stepLoopBtn');
const resetLoopBtn = document.getElementById('resetLoopBtn');
const loopCode = document.getElementById('loopCode');
const timelineBody = document.getElementById('timelineBody');
const outputConsole = document.getElementById('outputConsole');

function loadLoopExercise() {
  currentLoopExercise = loopExercises[Math.floor(Math.random() * loopExercises.length)];
  loopStep = -1;
  loopVariables = { ...currentLoopExercise.initialVars };
  loopOutput = [];
  
  loopCode.innerHTML = `
    <div class="code-block">
      <div class="code-line">${currentLoopExercise.code}</div>
      ${currentLoopExercise.body.map(line => `<div class="code-line indent">${line}</div>`).join('')}
    </div>
    ${currentLoopExercise.description ? `<div class="loop-description">${currentLoopExercise.description}</div>` : ''}
  `;
  
  timelineBody.innerHTML = '';
  outputConsole.textContent = '';
  
  markCompleted('loops', `exercise-${Date.now()}`, currentLoopExercise.difficulty);
}

function executeLoopStep() {
  if (loopStep >= currentLoopExercise.iterations - 1) {
    return;
  }
  
  loopStep++;
  const i = loopStep;
  
  // Execute loop body
  const actions = [];
  currentLoopExercise.body.forEach(line => {
    if (line.includes('print')) {
      const output = line.replace('print(', '').replace(')', '').replace(/f"/g, '').replace(/"/g, '');
      let outputText = output;
      if (output.includes('{i}')) {
        outputText = output.replace('{i}', i);
      }
      if (output.includes('i')) {
        outputText = i;
      }
      loopOutput.push(outputText);
      actions.push(`Printed: ${outputText}`);
    } else if (line.includes('=')) {
      const [varName, expr] = line.split('=').map(s => s.trim());
      let value = 0;
      if (expr.includes('+')) {
        const parts = expr.split('+').map(s => s.trim());
        value = parts.reduce((sum, part) => {
          if (part === varName) return sum + loopVariables[varName] || 0;
          if (part === 'i') return sum + i;
          return sum + parseFloat(part) || 0;
        }, 0);
      } else if (expr.includes('i')) {
        value = i;
      }
      loopVariables[varName] = value;
      actions.push(`${varName} = ${value}`);
    }
  });
  
  // Add timeline row
  const row = document.createElement('div');
  row.className = 'timeline-row';
  row.innerHTML = `
    <div class="timeline-col">${loopStep + 1}</div>
    <div class="timeline-col">${i}</div>
    <div class="timeline-col">${actions.join(', ')}</div>
    <div class="timeline-col">${JSON.stringify(loopVariables)}</div>
  `;
  timelineBody.appendChild(row);
  
  // Update output
  outputConsole.textContent = loopOutput.join('\n');
  
  // Scroll to active row
  setTimeout(() => {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('active');
    setTimeout(() => row.classList.remove('active'), 1000);
  }, 100);
}

function runFullLoop() {
  resetLoopBtn.click();
  for (let i = 0; i < currentLoopExercise.iterations; i++) {
    setTimeout(() => executeLoopStep(), i * 800);
  }
}

newLoopBtn.addEventListener('click', loadLoopExercise);
runLoopBtn.addEventListener('click', runFullLoop);
stepLoopBtn.addEventListener('click', executeLoopStep);
resetLoopBtn.addEventListener('click', () => {
  loopStep = -1;
  loopVariables = { ...currentLoopExercise.initialVars };
  loopOutput = [];
  timelineBody.innerHTML = '';
  outputConsole.textContent = '';
});

// Challenges
const challenges = [
  {
    id: 'challenge-1',
    difficulty: 'beginner',
    type: 'sequence',
    title: 'Calculate Sum',
    description: 'Order these steps to calculate the sum of numbers in a list:',
    steps: [
      'Initialize sum to 0',
      'Get list of numbers',
      'Add each number to sum',
      'Return the sum'
    ],
    correctOrder: [1, 0, 2, 3],
    hint: 'Start by getting the list, then initialize sum before adding numbers.'
  },
  {
    id: 'challenge-2',
    difficulty: 'intermediate',
    type: 'sequence',
    title: 'Find Maximum Value',
    description: 'Order these steps to find the maximum value in a list:',
    steps: [
      'Compare current with max',
      'Get list of numbers',
      'Set max to first number',
      'Update max if current is larger',
      'Return max value'
    ],
    correctOrder: [1, 2, 0, 3, 4],
    hint: 'Get the list first, initialize max, then compare and update.'
  },
  {
    id: 'challenge-3',
    difficulty: 'advanced',
    type: 'sequence',
    title: 'Binary Search',
    description: 'Order these steps to implement binary search:',
    steps: [
      'Calculate middle index',
      'Get sorted list and target',
      'Compare target with middle',
      'Search left or right half',
      'Return index or not found'
    ],
    correctOrder: [1, 0, 2, 3, 4],
    hint: 'Binary search requires sorted list. Find middle, compare, then search appropriate half.'
  },
  {
    id: 'challenge-4',
    difficulty: 'beginner',
    type: 'code',
    title: 'Variable Swap',
    description: 'Trace through this code that swaps two variables:',
    code: [
      { line: 1, text: 'a = 5', vars: { a: 5 } },
      { line: 2, text: 'b = 10', vars: { a: 5, b: 10 } },
      { line: 3, text: 'temp = a', vars: { a: 5, b: 10, temp: 5 } },
      { line: 4, text: 'a = b', vars: { a: 10, b: 10, temp: 5 } },
      { line: 5, text: 'b = temp', vars: { a: 10, b: 5, temp: 5 } }
    ],
    question: 'What is the value of a after line 5?',
    answer: '10',
    hint: 'Trace through each line. After line 5, a should be 10 and b should be 5.'
  },
  {
    id: 'challenge-5',
    difficulty: 'intermediate',
    type: 'code',
    title: 'Sum Calculation',
    description: 'Trace through this code that calculates a sum:',
    code: [
      { line: 1, text: 'sum = 0', vars: { sum: 0 } },
      { line: 2, text: 'for i in range(1, 4):', vars: { sum: 0 } },
      { line: 3, text: '    sum = sum + i', vars: { sum: 1 } },
      { line: 4, text: '    sum = sum + i', vars: { sum: 3 } },
      { line: 5, text: '    sum = sum + i', vars: { sum: 6 } },
      { line: 6, text: 'print(sum)', vars: { sum: 6 } }
    ],
    question: 'What is printed?',
    answer: '6',
    hint: 'The loop runs for i=1, i=2, i=3. Sum becomes 0+1=1, 1+2=3, 3+3=6.'
  }
];

let currentChallenge = null;
let challengeHintShown = false;

const challengeDifficulty = document.getElementById('challengeDifficulty');
const newChallengeBtn = document.getElementById('newChallengeBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const showHintBtn = document.getElementById('showHintBtn');
const checkChallengeBtn = document.getElementById('checkChallengeBtn');
const challengeDescription = document.getElementById('challengeDescription');
const challengeTask = document.getElementById('challengeTask');
const challengeHint = document.getElementById('challengeHint');
const challengeContent = document.getElementById('challengeContent');
const challengeFeedback = document.getElementById('challengeFeedback');

function loadChallenge() {
  if (!challengeDifficulty) return;
  
  const difficulty = challengeDifficulty.value;
  let availableChallenges = challenges;
  
  if (difficulty !== 'all') {
    availableChallenges = challenges.filter(c => c.difficulty === difficulty);
  }
  
  if (availableChallenges.length === 0) {
    if (challengeTask) challengeTask.textContent = 'No challenges available for this difficulty level.';
    if (challengeContent) challengeContent.innerHTML = '';
    return;
  }
  
  currentChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
  challengeHintShown = false;
  if (challengeHint) challengeHint.style.display = 'none';
  if (challengeFeedback) {
    challengeFeedback.style.display = 'none';
    challengeFeedback.className = '';
    challengeFeedback.innerHTML = '';
  }
  if (tryAgainBtn) tryAgainBtn.style.display = 'none';
  
  if (challengeDescription && challengeDescription.querySelector('h3')) {
    challengeDescription.querySelector('h3').textContent = currentChallenge.title;
  }
  if (challengeTask) challengeTask.textContent = currentChallenge.description;
  
  if (currentChallenge.type === 'sequence' && challengeContent) {
    challengeContent.innerHTML = `
      <div class="challenge-sequence">
        <div class="steps-area">
          <h4>Available Steps</h4>
          <div class="steps-list" id="challengeAvailableSteps"></div>
        </div>
        <div class="order-area">
          <h4>Your Order</h4>
          <div class="ordered-steps" id="challengeOrderedSteps">
            <div class="drop-zone">Drop steps here in order</div>
          </div>
        </div>
      </div>
    `;
    
    const challengeAvailableSteps = document.getElementById('challengeAvailableSteps');
    const challengeOrderedSteps = document.getElementById('challengeOrderedSteps');
    
    if (challengeAvailableSteps && challengeOrderedSteps) {
      // Clear any previous incorrect markings
      challengeOrderedSteps.querySelectorAll('.ordered-step').forEach(step => {
        step.classList.remove('incorrect-position');
      });
      
      challengeAvailableSteps.innerHTML = '';
      challengeOrderedSteps.innerHTML = '<div class="drop-zone">Drop steps here in order</div>';
      
      let challengeDraggedElement = null;
      
      // Create step items
      currentChallenge.steps.forEach((step, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.textContent = step;
        stepItem.draggable = true;
        stepItem.dataset.index = index;
        
        stepItem.addEventListener('dragstart', (e) => {
          challengeDraggedElement = stepItem;
          e.dataTransfer.effectAllowed = 'move';
          stepItem.classList.add('dragging');
        });
        
        stepItem.addEventListener('dragend', () => {
          stepItem.classList.remove('dragging');
          challengeDraggedElement = null;
        });
        
        challengeAvailableSteps.appendChild(stepItem);
      });
      
      // Drop handler for ordered steps
      challengeOrderedSteps.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropZone = challengeOrderedSteps.querySelector('.drop-zone');
        if (dropZone) {
          dropZone.remove();
        }
        
        if (challengeDraggedElement && challengeDraggedElement.parentNode === challengeAvailableSteps) {
          const stepNumber = challengeOrderedSteps.querySelectorAll('.ordered-step').length + 1;
          const orderedStep = document.createElement('div');
          orderedStep.className = 'ordered-step';
          orderedStep.dataset.index = challengeDraggedElement.dataset.index;
          
          const stepControls = document.createElement('div');
          stepControls.className = 'step-controls';
          
          const upBtn = document.createElement('button');
          upBtn.className = 'step-move-btn step-up';
          upBtn.innerHTML = '↑';
          upBtn.title = 'Move up';
          upBtn.type = 'button';
          upBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const prev = orderedStep.previousElementSibling;
            if (prev && prev.classList.contains('ordered-step')) {
              prev.parentNode.insertBefore(orderedStep, prev);
              updateChallengeStepNumbers();
            }
          });
          
          const downBtn = document.createElement('button');
          downBtn.className = 'step-move-btn step-down';
          downBtn.innerHTML = '↓';
          downBtn.title = 'Move down';
          downBtn.type = 'button';
          downBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const next = orderedStep.nextElementSibling;
            if (next && next.classList.contains('ordered-step')) {
              next.parentNode.insertBefore(orderedStep, next.nextSibling);
              updateChallengeStepNumbers();
            }
          });
          
          stepControls.appendChild(upBtn);
          stepControls.appendChild(downBtn);
          
          const stepNum = document.createElement('div');
          stepNum.className = 'step-number';
          stepNum.textContent = stepNumber;
          
          const stepText = document.createElement('div');
          stepText.className = 'step-text';
          stepText.textContent = challengeDraggedElement.textContent;
          
          orderedStep.appendChild(stepControls);
          orderedStep.appendChild(stepNum);
          orderedStep.appendChild(stepText);
          
          orderedStep.draggable = true;
          orderedStep.addEventListener('dragstart', (e) => {
            // Don't start drag if clicking on buttons
            if (e.target.classList.contains('step-move-btn') || e.target.closest('.step-controls')) {
              e.preventDefault();
              return false;
            }
            challengeDraggedElement = orderedStep;
            e.dataTransfer.effectAllowed = 'move';
            orderedStep.classList.add('dragging');
          });
          
          orderedStep.addEventListener('dragend', () => {
            orderedStep.classList.remove('dragging');
            challengeDraggedElement = null;
          });
          
          // Prevent drag when clicking buttons
          stepControls.addEventListener('mousedown', (e) => {
            e.stopPropagation();
          });
          
          challengeOrderedSteps.appendChild(orderedStep);
          challengeDraggedElement.remove();
          
          // Update step numbers
          updateChallengeStepNumbers();
        }
      });
      
      // Allow reordering in ordered steps by dragging
      challengeOrderedSteps.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const dropZone = challengeOrderedSteps.querySelector('.drop-zone');
        if (dropZone) {
          dropZone.classList.add('drag-over');
        }
        
        const dragging = challengeOrderedSteps.querySelector('.ordered-step.dragging');
        if (!dragging) return;
        
        const afterElement = getDragAfterElement(challengeOrderedSteps, e.clientY);
        if (afterElement == null) {
          // Only append to end if we're actually at the bottom
          const rect = challengeOrderedSteps.getBoundingClientRect();
          if (e.clientY > rect.bottom - 20) {
            if (dragging.nextSibling || dragging.parentNode !== challengeOrderedSteps) {
              challengeOrderedSteps.appendChild(dragging);
            }
          }
        } else if (afterElement && afterElement !== dragging) {
          // Insert before the element we found
          challengeOrderedSteps.insertBefore(dragging, afterElement);
        }
        updateChallengeStepNumbers();
      });
      
      challengeOrderedSteps.addEventListener('dragleave', () => {
        const dropZone = challengeOrderedSteps.querySelector('.drop-zone');
        if (dropZone) {
          dropZone.classList.remove('drag-over');
        }
      });
      
      challengeOrderedSteps.addEventListener('drop', (e) => {
        e.preventDefault();
        const dragging = challengeOrderedSteps.querySelector('.ordered-step.dragging');
        if (dragging) {
          dragging.classList.remove('dragging');
          updateChallengeStepNumbers();
        }
      });
      
      function updateChallengeStepNumbers() {
        const steps = Array.from(challengeOrderedSteps.querySelectorAll('.ordered-step'));
        steps.forEach((step, index) => {
          // Update step number
          const stepNum = step.querySelector('.step-number');
          if (stepNum) {
            stepNum.textContent = index + 1;
          }
          
          // Update button states
          const upBtn = step.querySelector('.step-up');
          const downBtn = step.querySelector('.step-down');
          if (upBtn) {
            upBtn.disabled = index === 0;
            upBtn.style.opacity = index === 0 ? '0.5' : '1';
            upBtn.style.cursor = index === 0 ? 'not-allowed' : 'pointer';
          }
          if (downBtn) {
            downBtn.disabled = index === steps.length - 1;
            downBtn.style.opacity = index === steps.length - 1 ? '0.5' : '1';
            downBtn.style.cursor = index === steps.length - 1 ? 'not-allowed' : 'pointer';
          }
        });
      }
    }
  } else if (currentChallenge.type === 'code' && challengeContent) {
    challengeContent.innerHTML = `
      <div class="challenge-code-trace">
        <div class="code-display" id="challengeCodeDisplay"></div>
        <div class="challenge-question">
          <h4>${currentChallenge.question}</h4>
          <input type="text" id="challengeAnswer" placeholder="Your answer" />
        </div>
      </div>
    `;
    
    const codeDisplay = document.getElementById('challengeCodeDisplay');
    if (codeDisplay) {
      codeDisplay.innerHTML = currentChallenge.code.map(line => 
        `<div class="code-line">${line.text}</div>`
      ).join('');
    }
  }
}

function checkChallenge() {
  if (!currentChallenge) return;
  
  if (challengeFeedback) challengeFeedback.style.display = 'block';
  
  if (currentChallenge.type === 'sequence') {
    const challengeOrderedSteps = document.getElementById('challengeOrderedSteps');
    if (!challengeOrderedSteps) return;
    
    const ordered = Array.from(challengeOrderedSteps.querySelectorAll('.ordered-step'));
    const userOrder = ordered.map(step => parseInt(step.dataset.index));
    
    // Clear previous incorrect markings
    ordered.forEach(step => {
      step.classList.remove('incorrect-position');
    });
    
    if (userOrder.length !== currentChallenge.correctOrder.length) {
      if (challengeFeedback) {
        challengeFeedback.className = 'challenge-feedback incorrect';
        challengeFeedback.innerHTML = '<strong>Incomplete:</strong> Please order all steps.';
        challengeFeedback.style.display = 'block';
      }
      if (tryAgainBtn) tryAgainBtn.style.display = 'inline-block';
      return;
    }
    
    const isCorrect = JSON.stringify(userOrder) === JSON.stringify(currentChallenge.correctOrder);
    
    if (challengeFeedback) {
      if (isCorrect) {
        challengeFeedback.className = 'challenge-feedback correct';
        challengeFeedback.innerHTML = '<strong>✓ Correct!</strong> You solved the challenge!';
        markCompleted('challenges', currentChallenge.id, currentChallenge.difficulty);
        if (tryAgainBtn) tryAgainBtn.style.display = 'none';
      } else {
        // Find which steps are out of order and mark them
        const incorrectSteps = [];
        userOrder.forEach((stepIndex, position) => {
          const correctPosition = currentChallenge.correctOrder.indexOf(stepIndex);
          if (correctPosition !== position) {
            incorrectSteps.push({
              step: currentChallenge.steps[stepIndex],
              currentPos: position + 1,
              correctPos: correctPosition + 1,
              stepElement: ordered[position]
            });
            // Mark the step as incorrect
            ordered[position].classList.add('incorrect-position');
          }
        });
        
        let feedbackHTML = '<strong>✗ Not quite right.</strong><br><br>';
        
        if (incorrectSteps.length > 0) {
          feedbackHTML += '<strong>Steps out of order:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
          incorrectSteps.forEach(({ step, currentPos, correctPos }) => {
            feedbackHTML += `<li>"${step}" is at position ${currentPos}, but should be at position ${correctPos}</li>`;
          });
          feedbackHTML += '</ul>';
        }
        
        let hintText = '';
        if (currentChallenge.hint) {
          hintText = `<br><small>💡 Hint: ${currentChallenge.hint}</small>`;
        }
        
        challengeFeedback.className = 'challenge-feedback incorrect';
        challengeFeedback.innerHTML = feedbackHTML + hintText;
        if (tryAgainBtn) tryAgainBtn.style.display = 'inline-block';
      }
    }
  } else if (currentChallenge.type === 'code') {
    const answerInput = document.getElementById('challengeAnswer');
    if (!answerInput) return;
    const answer = answerInput.value.trim();
    const isCorrect = answer.toLowerCase() === currentChallenge.answer.toLowerCase();
    
    if (challengeFeedback) {
      if (isCorrect) {
        challengeFeedback.className = 'challenge-feedback correct';
        challengeFeedback.innerHTML = '<strong>✓ Correct!</strong> You solved the challenge!';
        markCompleted('challenges', currentChallenge.id, currentChallenge.difficulty);
        if (tryAgainBtn) tryAgainBtn.style.display = 'none';
      } else {
        challengeFeedback.className = 'challenge-feedback incorrect';
        challengeFeedback.innerHTML = `<strong>✗ Incorrect.</strong> The answer is ${currentChallenge.answer}. Try again!`;
        if (tryAgainBtn) tryAgainBtn.style.display = 'inline-block';
      }
    }
  }
}

function tryAgainChallenge() {
  if (!currentChallenge) return;
  
  // Reset feedback
  if (challengeFeedback) {
    challengeFeedback.style.display = 'none';
    challengeFeedback.className = '';
    challengeFeedback.innerHTML = '';
  }
  
  if (challengeHint) challengeHint.style.display = 'none';
  if (tryAgainBtn) tryAgainBtn.style.display = 'none';
  
  // Reload the same challenge
  loadChallenge();
}

function showChallengeHint() {
  if (!currentChallenge || !currentChallenge.hint) return;
  
  challengeHintShown = true;
  if (challengeHint) {
    challengeHint.textContent = currentChallenge.hint;
    challengeHint.style.display = 'block';
  }
}

if (newChallengeBtn) {
  newChallengeBtn.addEventListener('click', () => {
    if (tryAgainBtn) tryAgainBtn.style.display = 'none';
    loadChallenge();
  });
}

if (tryAgainBtn) {
  tryAgainBtn.addEventListener('click', tryAgainChallenge);
}

if (showHintBtn) {
  showHintBtn.addEventListener('click', showChallengeHint);
}

if (checkChallengeBtn) {
  checkChallengeBtn.addEventListener('click', checkChallenge);
}

function generateProgressReport() {
  // Create a report container
  const reportContainer = document.createElement('div');
  reportContainer.id = 'progressReport';
  reportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 800px;
    background: #1a1a1a;
    color: #e5e7eb;
    padding: 40px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
  `;
  
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const totalCompleted = progress.completed.size;
  const totalExercises = sequenceExercises.length + variableExercises.length + loopExercises.length + challenges.length;
  const completionRate = totalCompleted > 0 ? 
    Math.round((totalCompleted / totalExercises) * 100) : 0;
  
  reportContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
      <h1 style="margin: 0 0 10px 0; font-size: 32px; color: #3b82f6;">Programming Basics Progress Report</h1>
      <p style="margin: 0; color: #9ca3af; font-size: 14px;">Generated on ${date}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
      <div style="background: #262626; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <div style="font-size: 36px; font-weight: bold; color: #3b82f6; margin-bottom: 5px;">${totalCompleted}</div>
        <div style="color: #9ca3af; font-size: 14px;">Total Exercises Completed</div>
      </div>
      <div style="background: #262626; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <div style="font-size: 36px; font-weight: bold; color: #22c55e; margin-bottom: 5px;">${completionRate}%</div>
        <div style="color: #9ca3af; font-size: 14px;">Completion Rate</div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #374151; padding-bottom: 10px;">By Category</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div style="background: #262626; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #fbbf24; margin-bottom: 5px;">${progress.byCategory.sequence}</div>
          <div style="color: #9ca3af; font-size: 14px;">Sequence Exercises</div>
        </div>
        <div style="background: #262626; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #a78bfa; margin-bottom: 5px;">${progress.byCategory.variables}</div>
          <div style="color: #9ca3af; font-size: 14px;">Variable Tracing</div>
        </div>
        <div style="background: #262626; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #fb7185; margin-bottom: 5px;">${progress.byCategory.loops}</div>
          <div style="color: #9ca3af; font-size: 14px;">Loop Exercises</div>
        </div>
        <div style="background: #262626; padding: 15px; border-radius: 8px;">
          <div style="font-size: 24px; font-weight: bold; color: #34d399; margin-bottom: 5px;">${progress.byCategory.challenges}</div>
          <div style="color: #9ca3af; font-size: 14px;">Challenges Solved</div>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h2 style="color: #3b82f6; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #374151; padding-bottom: 10px;">By Difficulty</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
        <div style="background: #262626; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #22c55e; margin-bottom: 5px;">${progress.byDifficulty.beginner}</div>
          <div style="color: #9ca3af; font-size: 14px;">Beginner</div>
        </div>
        <div style="background: #262626; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #fbbf24; margin-bottom: 5px;">${progress.byDifficulty.intermediate}</div>
          <div style="color: #9ca3af; font-size: 14px;">Intermediate</div>
        </div>
        <div style="background: #262626; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #ef4444; margin-bottom: 5px;">${progress.byDifficulty.advanced}</div>
          <div style="color: #9ca3af; font-size: 14px;">Advanced</div>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #374151; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>Keep practicing to improve your programming skills!</p>
    </div>
  `;
  
  document.body.appendChild(reportContainer);
  
  // Use html2canvas to capture the report
  if (typeof html2canvas !== 'undefined') {
    html2canvas(reportContainer, {
      backgroundColor: '#1a1a1a',
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      // Convert canvas to blob and download
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `programming-basics-progress-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
      
      // Remove the report container
      document.body.removeChild(reportContainer);
    }).catch(error => {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
      document.body.removeChild(reportContainer);
    });
  } else {
    alert('html2canvas library not loaded. Please refresh the page.');
    document.body.removeChild(reportContainer);
  }
}

const generateReportBtn = document.getElementById('generateReportBtn');
if (generateReportBtn) {
  generateReportBtn.addEventListener('click', generateProgressReport);
}

const resetProgressBtn = document.getElementById('resetProgressBtn');
if (resetProgressBtn) {
  resetProgressBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      progress = {
        completed: new Set(),
        byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
        byCategory: { sequence: 0, variables: 0, loops: 0, challenges: 0 }
      };
      saveProgress();
      updateProgressDisplay();
    }
  });
}

// Update progress display when switching to progress tab
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    if (targetTab === 'progress') {
      updateProgressDisplay();
    }
  });
});

// Initialize exercises when DOM is ready
function initializeExercises() {
  loadSequenceExercise();
  loadVariableExercise();
  loadLoopExercise();
  updateProgressDisplay();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExercises);
} else {
  initializeExercises();
}



