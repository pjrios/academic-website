// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'algorithm-debugging';
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
        // Remove active from all
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate saved tab
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
  // DOM already loaded
  restoreTabState();
}

// ==================== EXPLORATION TAB ====================

const algorithms = {
  'linear-search': {
    name: 'Linear Search',
    description: 'Linear search checks each element in the array sequentially until it finds the target or reaches the end. Time complexity: O(n).',
    code: `def linear_search(arr, target):
    """
    Search for target in array using linear search.
    Returns the index if found, -1 otherwise.
    """
    # Loop through all elements in the array
    for i in range(len(arr)):
        # Check if current element matches target
        if arr[i] == target:
            return i  # Found! Return the index
    return -1  # Not found, return -1`,
    complexity: 'O(n)',
    category: 'search',
    sampleInput: { arr: [1, 2, 3, 4, 5], target: 3 }
  },
  'binary-search': {
    name: 'Binary Search',
    description: 'Binary search works on sorted arrays by repeatedly dividing the search space in half. Much faster than linear search! ⚠️ Requires sorted data. Time complexity: O(log n).',
    code: `def binary_search(arr, target):
    """
    Binary search in a sorted array.
    Returns index if found, -1 otherwise.
    """
    left = 0
    right = len(arr) - 1  # Set search boundaries
    
    while left <= right:  # Continue while search space is valid
        mid = (left + right) // 2  # Find middle index
        
        if arr[mid] == target:
            return mid  # Found! Return the index
        elif arr[mid] < target:
            left = mid + 1  # Target is in right half, adjust left boundary
        else:
            right = mid - 1  # Target is in left half, adjust right boundary
    
    return -1  # Not found, return -1`,
    complexity: 'O(log n)',
    category: 'search',
    sampleInput: { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 7 }
  },
  'bubble-sort': {
    name: 'Bubble Sort',
    description: 'Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The largest elements "bubble up" to the end. Time complexity: O(n²).',
    code: `def bubble_sort(arr):
    """
    Sort array using bubble sort algorithm.
    Compares adjacent elements and swaps if needed.
    """
    # Outer loop: n-1 passes needed
    for i in range(len(arr) - 1):
        # Inner loop: compare adjacent pairs
        # Skip already sorted elements at the end
        for j in range(len(arr) - 1 - i):
            if arr[j] > arr[j + 1]:
                # Swap if out of order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    complexity: 'O(n²)',
    category: 'sort',
    sampleInput: { arr: [64, 34, 25, 12, 22, 11, 90] }
  },
  'selection-sort': {
    name: 'Selection Sort',
    description: 'Selection sort finds the minimum element in the unsorted portion and places it at the beginning. It maintains two subarrays: sorted and unsorted. Time complexity: O(n²).',
    code: `def selection_sort(arr):
    """
    Sort array by finding minimum element and placing at beginning.
    """
    # Loop through array (last element is automatically sorted)
    for i in range(len(arr) - 1):
        min_index = i  # Assume current position has minimum
        # Find minimum element in remaining unsorted portion
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j  # Update minimum index
        # Swap minimum with current position
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr`,
    complexity: 'O(n²)',
    category: 'sort',
    sampleInput: { arr: [64, 25, 12, 22, 11] }
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    description: 'Insertion sort builds the sorted array one element at a time by inserting each element into its correct position. Like sorting playing cards in your hand. Time complexity: O(n²).',
    code: `def insertion_sort(arr):
    """
    Sort array using insertion sort algorithm.
    """
    # Start from second element (index 1)
    for i in range(1, len(arr)):
        key = arr[i]  # Element to insert
        j = i - 1  # Start comparing with previous element
        
        # Move elements greater than key one position ahead
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        # Insert key in correct position
        arr[j + 1] = key
    return arr`,
    complexity: 'O(n²)',
    category: 'sort',
    sampleInput: { arr: [64, 34, 25, 12, 22, 11, 90] }
  },
  'factorial': {
    name: 'Factorial',
    description: 'Factorial calculates n! = n × (n-1) × ... × 1. This recursive implementation demonstrates how recursion works with a base case. Time complexity: O(n).',
    code: `def factorial(n):
    """
    Calculate factorial of n recursively.
    n! = n × (n-1) × ... × 1
    """
    # Base case: 0! and 1! both equal 1
    if n == 0 or n == 1:
        return 1
    # Recursive case: n! = n × (n-1)!
    return n * factorial(n - 1)`,
    complexity: 'O(n)',
    category: 'math',
    sampleInput: { n: 5 }
  },
  'fibonacci': {
    name: 'Fibonacci',
    description: 'Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, ... Each number is the sum of the two preceding ones. This recursive implementation shows the power (and cost) of recursion. Time complexity: O(2ⁿ).',
    code: `def fibonacci(n):
    """
    Calculate nth Fibonacci number recursively.
    F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
    """
    # Base cases: F(0) = 0, F(1) = 1
    if n <= 1:
        return n
    # Recursive case: F(n) = F(n-1) + F(n-2)
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    complexity: 'O(2ⁿ)',
    category: 'math',
    sampleInput: { n: 7 }
  }
};

// ==================== EXPLORATION TAB STATE ====================
let explorationAlgorithm = null;
let explorationCode = '';
let explorationSteps = [];
let explorationStepIndex = 0;
let explorationOperationCount = 0;
let explorationInput = null;
let explorationAutoStepInterval = null;

const algorithmSelect = document.getElementById('algorithmSelect');
const algorithmInfo = document.getElementById('algorithmInfo');
const reloadDataBtn = document.getElementById('reloadDataBtn');
const targetSelect = document.getElementById('targetSelect');
const runExplorationBtn = document.getElementById('runExplorationBtn');
const stepExplorationBtn = document.getElementById('stepExplorationBtn');
const resetExplorationBtn = document.getElementById('resetExplorationBtn');
const autoStepExplorationBtn = document.getElementById('autoStepExplorationBtn');
const controlsSection = runExplorationBtn ? runExplorationBtn.closest('.controls-section') : null;
const visualizationSection = document.getElementById('visualizationSection');
const explanationSection = document.getElementById('explanationSection');
const stepExplanation = document.getElementById('stepExplanation');
const resultsSection = document.getElementById('resultsOutput');

// Exploration data - always 10 numbers
let explorationArray = [];

// ==================== CODE TAB STATE ====================
let codeAlgorithm = null;
let codeCode = '';
let codeSteps = [];
let codeStepIndex = 0;
let codeOperationCount = 0;
let codeInput = null;
let codeAutoStepInterval = null;

const codeAlgorithmSelect = document.getElementById('codeAlgorithmSelect');
const codeEditor = document.getElementById('codeEditor');
const codeInputData = document.getElementById('codeInputData');
const codeInputDisplay = document.getElementById('codeInputDisplay');
const codeGenerateInputBtn = document.getElementById('codeGenerateInputBtn');
const codeLoadSampleBtn = document.getElementById('codeLoadSampleBtn');
const runCodeBtn = document.getElementById('runCodeBtn');
const stepBtn = document.getElementById('stepBtn');
const resetExecutionBtn = document.getElementById('resetExecutionBtn');
const codeResetCodeBtn = document.getElementById('codeResetCodeBtn');
const autoStepBtn = document.getElementById('autoStepBtn');
const traceOutput = document.getElementById('traceOutput');
const operationCountDisplay = document.getElementById('operationCount');
const currentStepDisplay = document.getElementById('currentStep');
const totalStepsDisplay = document.getElementById('totalSteps');
const codeResultsOutput = document.getElementById('codeResultsOutput');

function generateExplorationData() {
  // Always generate 10 numbers from 1 to 100
  explorationArray = [];
  for (let i = 0; i < 10; i++) {
    explorationArray.push(Math.floor(Math.random() * 100) + 1);
  }
  
  // For binary search, sort the array
  if (algorithmSelect.value === 'binary-search') {
    explorationArray.sort((a, b) => a - b);
  }
  
  // Populate target dropdown
  targetSelect.innerHTML = '<option value="">Select Target</option>';
  explorationArray.forEach((val, index) => {
    const option = document.createElement('option');
    option.value = val;
    option.textContent = `${val} (index ${index})`;
    targetSelect.appendChild(option);
  });
  
  // Auto-select a random target for search algorithms
  if (explorationAlgorithm && (explorationAlgorithm.category === 'search')) {
    const randomIndex = Math.floor(Math.random() * explorationArray.length);
    const randomTarget = explorationArray[randomIndex];
    targetSelect.value = randomTarget;
    updateExplorationInput();
    // Show initial visualization
    renderVisualization({ array: explorationArray });
  } else if (explorationAlgorithm && (explorationAlgorithm.category === 'sort')) {
    updateExplorationInput();
    // Show initial visualization
    renderVisualization({ array: explorationArray });
  } else if (explorationAlgorithm && (explorationAlgorithm.category === 'math')) {
    // For math algorithms, set input and show initial message
    updateExplorationInput();
  }
}

function loadExplorationAlgorithm(algorithmKey) {
  explorationAlgorithm = algorithms[algorithmKey];
  explorationCode = explorationAlgorithm.code;
  explorationStepIndex = 0;
  explorationOperationCount = 0;
  explorationSteps = [];
  explorationInput = null;
  
  algorithmInfo.innerHTML = `
    <p>${explorationAlgorithm.description}</p>
    <p><strong>Time Complexity:</strong> ${explorationAlgorithm.complexity}</p>
    ${algorithmKey === 'binary-search' ? '<p style="color: var(--warning); margin-top: 8px;"><strong>⚠️ Note:</strong> Binary search requires the array to be sorted. Unsorted arrays will be automatically sorted.</p>' : ''}
  `;
  
  clearExplorationVisualization();
  clearExplorationResults();
  
  // Generate data for search/sort algorithms, skip for math algorithms
  if (explorationAlgorithm.category === 'search' || explorationAlgorithm.category === 'sort') {
    generateExplorationData();
    } else {
    // For math algorithms, use a default value (5 for factorial, 6 for fibonacci)
    const defaultN = explorationAlgorithm.key === 'factorial' ? 5 : 6;
    explorationArray = [defaultN]; // Store in array for consistency
    explorationInput = { n: defaultN };
    // Clear target select
    targetSelect.innerHTML = '<option value="">Select Target</option>';
    targetSelect.value = '';
    // Show initial visualization with the number
    renderVisualization({ 
      type: 'recursion', 
      algorithm: explorationAlgorithm.key === 'factorial' ? 'factorial' : 'fibonacci', 
      n: defaultN,
      fibonacciSequence: explorationAlgorithm.key === 'fibonacci' ? [0, 1] : undefined,
      multiplicationChain: [],
      callStack: []
    });
  }
}

function loadCodeAlgorithm(algorithmKey) {
  codeAlgorithm = algorithms[algorithmKey];
  codeCode = codeAlgorithm.code;
  codeStepIndex = 0;
  codeOperationCount = 0;
  codeSteps = [];
  codeInput = null;
  
  renderCode(codeCode);
  clearCodeTrace();
  clearCodeResults();
  
  // Load sample input
  if (codeAlgorithm.sampleInput) {
    if (codeAlgorithm.category === 'math') {
      codeInputData.value = codeAlgorithm.sampleInput.n;
    } else if (codeAlgorithm.sampleInput.target !== undefined) {
      codeInputData.value = `${codeAlgorithm.sampleInput.arr.join(',')} | ${codeAlgorithm.sampleInput.target}`;
    } else {
      codeInputData.value = codeAlgorithm.sampleInput.arr.join(',');
    }
    updateCodeInputDisplay();
  }
}

function renderCode(code) {
  const lines = code.split('\n');
  codeEditor.innerHTML = lines.map((line, index) => {
    let htmlLine = escapeHtml(line);
    
    // Basic Python syntax highlighting
    if (code.includes('def ')) {
      // Python keywords
      htmlLine = htmlLine.replace(/\b(def|if|elif|else|for|while|return|in|range|len|or|and)\b/g, '<span class="py-keyword">$1</span>');
      // Comments
      htmlLine = htmlLine.replace(/#.*$/g, '<span class="py-comment">$&</span>');
      // Strings (docstrings)
      htmlLine = htmlLine.replace(/""".*?"""/g, '<span class="py-string">$&</span>');
      htmlLine = htmlLine.replace(/'''.*?'''/g, '<span class="py-string">$&</span>');
      // BUG comments
      htmlLine = htmlLine.replace(/BUG:.*$/g, '<span class="py-bug">$&</span>');
      // Fixed comments
      htmlLine = htmlLine.replace(/Fixed:.*$/g, '<span class="py-fixed">$&</span>');
    }
    
    return `<div class="code-line" data-line="${index}">${htmlLine}</div>`;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Convert Python code to executable JavaScript function
function pythonToJS(pythonCode) {
  // Detect which function and whether it's broken or fixed
  const isFixed = pythonCode.includes('Fixed:') || pythonCode.includes('len(arr) - 1') && pythonCode.includes('i + 1');
  
  if (pythonCode.includes('def linear_search')) {
    if (isFixed || pythonCode.includes('range(len(arr))')) {
      // Fixed version
      return function(arr, target) {
  for (let i = 0; i < arr.length; i++) {
          if (arr[i] === target) return i;
        }
        return -1;
      };
    } else {
      // Broken: i <= arr.length should be i < arr.length
      return function(arr, target) {
        for (let i = 0; i <= arr.length; i++) {
          if (arr[i] === target) return i;
        }
        return -1;
      };
    }
  } else if (pythonCode.includes('def binary_search')) {
    if (isFixed || pythonCode.includes('len(arr) - 1') && pythonCode.includes('left <= right')) {
      // Fixed version
      return function(arr, target) {
        let left = 0;
        let right = arr.length - 1;
        while (left <= right) {
          let mid = Math.floor((left + right) / 2);
          if (arr[mid] === target) return mid;
          else if (arr[mid] < target) left = mid + 1;
          else right = mid - 1;
        }
        return -1;
      };
    } else {
      // Broken version
      return function(arr, target) {
        let left = 0;
        let right = arr.length;
        while (left < right) {
          let mid = Math.floor((left + right) / 2);
          if (arr[mid] === target) return mid;
          else if (arr[mid] < target) left = mid;
          else right = mid;
        }
        return -1;
      };
    }
  } else if (pythonCode.includes('def bubble_sort')) {
    if (isFixed || pythonCode.includes('len(arr) - 1 - i')) {
      // Fixed version
      return function(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
      };
    } else {
      // Broken version
      return function(arr) {
  for (let i = 0; i < arr.length; i++) {
          for (let j = 0; j < arr.length; j++) {
            if (arr[j] > arr[j + 1]) {
              [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
          }
  }
  return arr;
      };
    }
  } else if (pythonCode.includes('def selection_sort')) {
    if (isFixed || pythonCode.includes('i + 1') && pythonCode.includes('min_index != i')) {
      // Fixed version
      return function(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
    }
    if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
      };
    } else {
      // Broken version
      return function(arr) {
        for (let i = 0; i < arr.length; i++) {
          let minIndex = i;
          for (let j = i; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) minIndex = j;
          }
          arr[i] = arr[minIndex];
        }
        return arr;
      };
    }
  } else if (pythonCode.includes('def factorial')) {
    if (isFixed || pythonCode.includes('n == 0 or n == 1') || pythonCode.includes('return 1')) {
      // Fixed version
      return function factorial(n) {
        if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
      };
    } else {
      // Broken version
      return function factorial(n) {
        if (n === 0) return 0;
        return n * factorial(n - 1);
      };
    }
  } else if (pythonCode.includes('def fibonacci')) {
    if (isFixed || pythonCode.includes('n - 2')) {
      // Fixed version
      return function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      };
    } else {
      // Broken version
      return function fibonacci(n) {
        if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n);
      };
    }
  }
  
  // Fallback
  return function() { return null; };
}

function updateExplorationInput() {
  const selectedTarget = targetSelect.value;
  
  if (explorationAlgorithm.category === 'math') {
    // For math algorithms, we'd need a different approach, but for now skip
    return;
  } else if (explorationAlgorithm.category === 'search') {
    if (!selectedTarget) {
      explorationInput = null;
      return;
    }
    const target = parseInt(selectedTarget);
    explorationInput = { arr: [...explorationArray], target };
  } else if (explorationAlgorithm.category === 'sort') {
    explorationInput = { arr: [...explorationArray] };
  }
}

function updateExplorationInputDisplay() {
  const value = inputData.value.trim();
  if (!value) {
    inputDisplay.innerHTML = '<p style="color: var(--text-muted);">No input provided</p>';
    return;
  }
  
  if (explorationAlgorithm.category === 'math') {
    const n = parseInt(value);
    if (isNaN(n)) {
      inputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter a number.</p>';
    } else {
      inputDisplay.innerHTML = `<p><strong>Input:</strong> n = ${n}</p>`;
      explorationInput = { n };
    }
  } else if (value.includes('|')) {
    // Search algorithm with target
    const parts = value.split('|').map(s => s.trim());
    let arr = parts[0].split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const target = parseInt(parts[1]);
    if (arr.length === 0 || isNaN(target)) {
      inputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Format: "1,2,3,4,5 | 3"</p>';
    } else {
      // For binary search, ensure array is sorted
      if (algorithmSelect.value === 'binary-search') {
        const isSorted = arr.every((val, i) => i === 0 || arr[i - 1] <= val);
        if (!isSorted) {
          arr.sort((a, b) => a - b);
          inputData.value = `${arr.join(',')} | ${target}`;
          inputDisplay.innerHTML = `
            <p><strong>Array:</strong> [${arr.join(', ')}] <span style="color: var(--warning);">(sorted for binary search)</span></p>
            <p><strong>Target:</strong> ${target}</p>
          `;
        } else {
          inputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
        }
      } else {
        inputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
      }
      explorationInput = { arr, target };
    }
  } else {
    // Sort algorithm
    const arr = value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) {
      inputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter comma-separated numbers.</p>';
    } else {
      inputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p>`;
      explorationInput = { arr };
    }
  }
}

function updateCodeInputDisplay() {
  const value = codeInputData.value.trim();
  if (!value) {
    codeInputDisplay.innerHTML = '<p style="color: var(--text-muted);">No input provided</p>';
    return;
  }
  
  if (codeAlgorithm.category === 'math') {
    const n = parseInt(value);
    if (isNaN(n)) {
      codeInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter a number.</p>';
    } else {
      codeInputDisplay.innerHTML = `<p><strong>Input:</strong> n = ${n}</p>`;
      codeInput = { n };
    }
  } else if (value.includes('|')) {
    // Search algorithm with target
    const parts = value.split('|').map(s => s.trim());
    let arr = parts[0].split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const target = parseInt(parts[1]);
    if (arr.length === 0 || isNaN(target)) {
      codeInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Format: "1,2,3,4,5 | 3"</p>';
    } else {
      // For binary search, ensure array is sorted
      if (codeAlgorithmSelect.value === 'binary-search') {
        const isSorted = arr.every((val, i) => i === 0 || arr[i - 1] <= val);
        if (!isSorted) {
          arr.sort((a, b) => a - b);
          codeInputData.value = `${arr.join(',')} | ${target}`;
          codeInputDisplay.innerHTML = `
            <p><strong>Array:</strong> [${arr.join(', ')}] <span style="color: var(--warning);">(sorted for binary search)</span></p>
            <p><strong>Target:</strong> ${target}</p>
          `;
        } else {
          codeInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
        }
      } else {
        codeInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
      }
      codeInput = { arr, target };
    }
  } else {
    // Sort algorithm
    const arr = value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) {
      codeInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter comma-separated numbers.</p>';
    } else {
      codeInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p>`;
      codeInput = { arr };
    }
  }
}

// ==================== EXPLORATION TAB FUNCTIONS ====================
function clearExplorationVisualization() {
  visualizationSection.innerHTML = '<h3>Visual Simulation</h3><p style="color: var(--text-muted); text-align: center; padding: 40px;">Click "Run Algorithm" or "Step Forward" to see the visualization</p>';
}

function clearExplorationResults() {
  resultsSection.innerHTML = '';
  stepExplanation.innerHTML = '<p style="color: var(--text-muted);">Click "Run Algorithm" or "Step Forward" to start exploring</p>';
}

// ==================== CODE TAB FUNCTIONS ====================
function clearCodeTrace() {
  traceOutput.innerHTML = '';
  operationCountDisplay.textContent = '0';
  currentStepDisplay.textContent = '0';
  totalStepsDisplay.textContent = '0';
}

function clearCodeResults() {
  codeResultsOutput.innerHTML = '';
}

// ==================== CODE TAB EXECUTION FUNCTIONS ====================
function generateCodeExecutionSteps() {
  if (!codeInput) {
    updateCodeInputDisplay();
    if (!codeInput) {
      showNotification('Please provide valid input first', 'error');
      return;
    }
  }
  
  codeSteps = [];
  codeOperationCount = 0;
  codeStepIndex = 0;
  
  // Generate step-by-step execution based on algorithm
  const algoKey = codeAlgorithmSelect.value;
  
  if (algoKey === 'linear-search') {
    generateCodeLinearSearchSteps(codeInput.arr, codeInput.target);
  } else if (algoKey === 'binary-search') {
    generateCodeBinarySearchSteps(codeInput.arr, codeInput.target);
  } else if (algoKey === 'bubble-sort') {
    generateCodeBubbleSortSteps([...codeInput.arr]);
  } else if (algoKey === 'selection-sort') {
    generateCodeSelectionSortSteps([...codeInput.arr]);
  } else if (algoKey === 'insertion-sort') {
    generateCodeInsertionSortSteps([...codeInput.arr]);
  } else if (algoKey === 'factorial') {
    generateCodeFactorialSteps(codeInput.n);
  } else if (algoKey === 'fibonacci') {
    generateCodeFibonacciSteps(codeInput.n);
  }
  
  totalStepsDisplay.textContent = codeSteps.length;
  renderCodeStep(0);
}

function runCode() {
  generateCodeExecutionSteps();
  if (codeSteps.length === 0) return;
  
  // Auto-execute all steps
  codeStepIndex = 0;
  const executeNext = () => {
    if (codeStepIndex < codeSteps.length) {
      renderCodeStep(codeStepIndex);
      codeStepIndex++;
      setTimeout(executeNext, 300);
        } else {
      showCodeResults();
    }
  };
  executeNext();
}

function stepForward() {
  if (codeSteps.length === 0) {
    generateCodeExecutionSteps();
  }
  
  if (codeStepIndex < codeSteps.length) {
    renderCodeStep(codeStepIndex);
    codeStepIndex++;
    currentStepDisplay.textContent = codeStepIndex;
    
    if (codeStepIndex >= codeSteps.length) {
      showCodeResults();
    }
  }
}

function renderCodeStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= codeSteps.length) return;
  
  const step = codeSteps[stepIndex];
  codeStepIndex = stepIndex;
  currentStepDisplay.textContent = stepIndex + 1;
  operationCountDisplay.textContent = step.operations || codeOperationCount;
  
  // Add trace line
  addCodeTraceLine(step.message, step.type || 'info');
  
  // Scroll to latest trace
  traceOutput.scrollTop = traceOutput.scrollHeight;
}

function showCodeResults() {
  if (codeSteps.length === 0) return;
  
  const lastStep = codeSteps[codeSteps.length - 1];
  const result = lastStep.result;
  
  codeResultsOutput.innerHTML = `
    <div class="result-content">
      <h4>Algorithm Result</h4>
      <p><strong>Output:</strong> ${JSON.stringify(result)}</p>
      <p><strong>Total Operations:</strong> ${codeOperationCount}</p>
      <p><strong>Time Complexity:</strong> ${codeAlgorithm.complexity}</p>
    </div>
  `;
}

function addCodeTraceLine(text, type = '') {
  const line = document.createElement('div');
  line.className = `trace-line ${type}`;
  line.textContent = text;
  traceOutput.appendChild(line);
  traceOutput.scrollTop = traceOutput.scrollHeight;
}

// Wrapper functions that call the step generation functions with code-specific state
function generateCodeLinearSearchSteps(arr, target) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateLinearSearchSteps(arr, target);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeBinarySearchSteps(arr, target) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateBinarySearchSteps(arr, target);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeBubbleSortSteps(arr) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateBubbleSortSteps(arr);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeSelectionSortSteps(arr) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateSelectionSortSteps(arr);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeInsertionSortSteps(arr) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateInsertionSortSteps(arr);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeFactorialSteps(n) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateFactorialSteps(n);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function generateCodeFibonacciSteps(n) {
  const originalSteps = executionSteps;
  const originalOpCount = operationCount;
  executionSteps = codeSteps;
  operationCount = codeOperationCount;
  generateFibonacciSteps(n);
  codeSteps = executionSteps;
  codeOperationCount = operationCount;
  executionSteps = originalSteps;
  operationCount = originalOpCount;
}

function addTraceLine(text, type = '') {
  const line = document.createElement('div');
  line.className = `trace-line ${type}`;
  line.textContent = text;
  traceOutput.appendChild(line);
  traceOutput.scrollTop = traceOutput.scrollHeight;
}

function showFeedback(type, title, message) {
  feedbackSection.className = `feedback-section ${type}`;
  feedbackSection.innerHTML = `
    <h4>${title}</h4>
    ${message ? `<p>${message}</p>` : ''}
  `;
}

// Step generation functions for each algorithm
function generateLinearSearchSteps(arr, target) {
  executionSteps.push({
    title: 'Starting Linear Search',
    message: `Searching for ${target} in array [${arr.join(', ')}]`,
    explanation: 'Linear search checks each element sequentially from the beginning.',
    operations: 0
  });
  
  for (let i = 0; i < arr.length; i++) {
    operationCount++;
    executionSteps.push({
      title: `Checking index ${i}`,
      message: `Comparing arr[${i}] = ${arr[i]} with target ${target}`,
      explanation: `We check if the element at position ${i} matches our target.`,
      state: { index: i, currentValue: arr[i], target },
      visualization: { 
        array: [...arr], 
        currentIndex: i, 
        target,
        checked: arr.slice(0, i).map((_, idx) => idx)
      },
      operations: operationCount
    });
    
    if (arr[i] === target) {
      executionSteps.push({
        title: 'Target Found!',
        message: `Found ${target} at index ${i}`,
        explanation: `The element matches the target, so we return the index ${i}.`,
        visualization: {
          array: [...arr],
          currentIndex: i,
          target,
          found: i,
          checked: arr.slice(0, i).map((_, idx) => idx)
        },
        result: i,
        operations: operationCount
      });
      return;
    }
  }
  
  executionSteps.push({
    title: 'Target Not Found',
    message: `Target ${target} not found in array`,
    explanation: 'We checked all elements but none matched the target.',
    visualization: {
      array: [...arr],
      target,
      checked: arr.map((_, idx) => idx),
      found: -1
    },
    result: -1,
    operations: operationCount
  });
}

function generateBinarySearchSteps(arr, target) {
  // Ensure array is sorted for binary search
  const sortedArr = [...arr].sort((a, b) => a - b);
  const wasSorted = JSON.stringify(arr) === JSON.stringify(sortedArr);
  
  if (!wasSorted) {
    executionSteps.push({
      title: 'Sorting Array',
      message: `Array was not sorted. Sorting for binary search: [${sortedArr.join(', ')}]`,
      explanation: 'Binary search requires a sorted array. The array has been sorted automatically.',
      visualization: { array: sortedArr, target },
      operations: 0
    });
  }
  
  executionSteps.push({
    title: 'Starting Binary Search',
    message: `Searching for ${target} in sorted array [${sortedArr.join(', ')}]`,
    explanation: 'Binary search requires a sorted array. We divide the search space in half at each step.',
    visualization: { array: sortedArr, target },
    operations: 0
  });
  
  // Use sorted array for the rest of the algorithm
  arr = sortedArr;
  
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    operationCount++;
    const mid = Math.floor((left + right) / 2);
    
    executionSteps.push({
      title: `Checking middle element`,
      message: `Left=${left}, Right=${right}, Mid=${mid}, arr[${mid}]=${arr[mid]}`,
      explanation: `We calculate the middle index and compare it with the target.`,
      state: { left, right, mid, midValue: arr[mid], target },
      visualization: { 
        array: [...arr], 
        left, 
        right, 
        mid, 
        target 
      },
      operations: operationCount
    });
    
    if (arr[mid] === target) {
      executionSteps.push({
        title: 'Target Found!',
        message: `Found ${target} at index ${mid}`,
        explanation: `The middle element matches the target, so we return the index.`,
        visualization: {
          array: [...arr],
          left,
          right,
          mid,
          target,
          found: mid
        },
        result: mid,
        operations: operationCount
      });
      return;
    } else if (arr[mid] < target) {
      left = mid + 1;
      executionSteps.push({
        title: 'Target in right half',
        message: `arr[${mid}]=${arr[mid]} < ${target}, search right half`,
        explanation: `Since the middle element is smaller, the target must be in the right half.`,
        state: { left, right },
        visualization: {
          array: [...arr],
          left,
          right,
          mid,
          target
        },
        operations: operationCount
      });
    } else {
      right = mid - 1;
      executionSteps.push({
        title: 'Target in left half',
        message: `arr[${mid}]=${arr[mid]} > ${target}, search left half`,
        explanation: `Since the middle element is larger, the target must be in the left half.`,
        state: { left, right },
        visualization: {
          array: [...arr],
          left,
          right,
          mid,
          target
        },
        operations: operationCount
      });
    }
  }
  
  executionSteps.push({
    title: 'Target Not Found',
    message: `Target ${target} not found`,
    explanation: 'The search space is exhausted without finding the target.',
    visualization: {
      array: [...arr],
      target,
      found: -1
    },
    result: -1,
    operations: operationCount
  });
}

function generateBubbleSortSteps(arr) {
  executionSteps.push({
    title: 'Starting Bubble Sort',
    message: `Sorting array [${arr.join(', ')}]`,
    explanation: 'Bubble sort compares adjacent elements and swaps them if they are in wrong order.',
    operations: 0
  });
  
  for (let i = 0; i < arr.length - 1; i++) {
    executionSteps.push({
      title: `Pass ${i + 1}`,
      message: `Starting pass ${i + 1} of ${arr.length - 1}`,
      explanation: `In each pass, the largest unsorted element "bubbles up" to its correct position.`,
      state: { pass: i + 1, array: [...arr] },
      operations: operationCount
    });
    
    for (let j = 0; j < arr.length - 1 - i; j++) {
      operationCount++;
      executionSteps.push({
        title: `Comparing elements`,
        message: `Comparing arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`,
        explanation: `We compare adjacent elements to see if they need to be swapped.`,
        state: { comparing: j, array: [...arr] },
        visualization: { 
          array: [...arr], 
          comparing: j,
          sorted: arr.length - 1 - i
        },
        operations: operationCount
      });
      
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        operationCount++;
        executionSteps.push({
          title: 'Swapping elements',
          message: `Swapped ${arr[j + 1]} and ${arr[j]}`,
          explanation: `Since ${arr[j + 1]} > ${arr[j]}, we swap them.`,
          state: { swapped: j, array: [...arr] },
          visualization: { 
            array: [...arr], 
            swapped: j,
            sorted: arr.length - 1 - i
          },
          operations: operationCount
        });
      }
    }
  }
  
  executionSteps.push({
    title: 'Sorting Complete',
    message: `Sorted array: [${arr.join(', ')}]`,
    explanation: 'All passes completed. The array is now sorted.',
    visualization: {
      array: [...arr],
      sorted: arr.length - 1
    },
    result: arr,
    operations: operationCount
  });
}

function generateSelectionSortSteps(arr) {
  executionSteps.push({
    title: 'Starting Selection Sort',
    message: `Sorting array [${arr.join(', ')}]`,
    explanation: 'Selection sort finds the minimum element in the unsorted portion and places it at the beginning. The sorted portion grows from left to right.',
    visualization: { array: [...arr], sorted: -1 },
    operations: 0
  });
  
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    executionSteps.push({
      title: `Iteration ${i + 1}: Finding minimum`,
      message: `Looking for minimum in unsorted portion [${i} to ${arr.length - 1}]`,
      explanation: `We start by assuming position ${i} has the minimum. We'll compare it with all remaining unsorted elements.`,
      visualization: { 
        array: [...arr], 
        current: i,
        minIndex: i,
        sorted: i - 1,
        comparing: null
      },
      operations: operationCount
    });
    
    for (let j = i + 1; j < arr.length; j++) {
      operationCount++;
      const currentMinIndex = minIndex; // Store before potential update
      executionSteps.push({
        title: `Comparing with candidate`,
        message: `Comparing arr[${j}]=${arr[j]} with current minimum arr[${currentMinIndex}]=${arr[currentMinIndex]}`,
        explanation: `We check if the element at position ${j} is smaller than our current minimum candidate at position ${currentMinIndex}.`,
        visualization: { 
          array: [...arr], 
          current: i,
          minIndex: currentMinIndex,
          comparing: j,
          sorted: i - 1
        },
        operations: operationCount
      });
      
      if (arr[j] < arr[currentMinIndex]) {
        minIndex = j;
        operationCount++;
        executionSteps.push({
          title: 'New minimum found!',
          message: `Found smaller element: arr[${j}]=${arr[j]} < arr[${currentMinIndex}]=${arr[currentMinIndex]}`,
          explanation: `Element at position ${j} is smaller, so we update our minimum candidate to position ${j}.`,
          visualization: { 
            array: [...arr], 
            current: i,
            minIndex: j,
            comparing: j,
            sorted: i - 1,
            newMin: true
          },
          operations: operationCount
        });
      }
    }
    
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      operationCount++;
      executionSteps.push({
        title: 'Swapping minimum into place',
        message: `Swapping arr[${i}]=${arr[i]} with arr[${minIndex}]=${arr[minIndex]}`,
        explanation: `We swap the minimum element with the element at position ${i}, placing it in the sorted portion.`,
        visualization: { 
          array: [...arr], 
          current: i,
          minIndex: minIndex,
          swapped: i,
          sorted: i - 1,
          swapping: true
        },
        operations: operationCount
      });
    } else {
      executionSteps.push({
        title: 'Minimum already in place',
        message: `Minimum element is already at position ${i}, no swap needed`,
        explanation: `The minimum element is already at the correct position, so we don't need to swap.`,
        visualization: { 
          array: [...arr], 
          current: i,
          minIndex: i,
          sorted: i - 1
        },
        operations: operationCount
      });
    }
    
    executionSteps.push({
      title: `Iteration ${i + 1} complete`,
      message: `Position ${i} is now sorted. Sorted portion: [0 to ${i}]`,
      explanation: `After this iteration, the first ${i + 1} elements are in their correct sorted positions.`,
      visualization: { 
        array: [...arr], 
        sorted: i
      },
      operations: operationCount
    });
  }
  
  executionSteps.push({
    title: 'Sorting Complete',
    message: `Sorted array: [${arr.join(', ')}]`,
    explanation: 'All iterations completed. The entire array is now sorted.',
    visualization: { 
      array: [...arr], 
      sorted: arr.length - 1
    },
    result: arr,
    operations: operationCount
  });
}

function generateInsertionSortSteps(arr) {
  executionSteps.push({
    title: 'Starting Insertion Sort',
    message: `Sorting array [${arr.join(', ')}]`,
    explanation: 'Insertion sort builds the sorted array one element at a time by inserting each element into its correct position in the sorted portion.',
    visualization: { array: [...arr], sorted: 0, key: null },
    operations: 0
  });
  
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    const keyIndex = i; // Store original position
    let j = i - 1;
    
    executionSteps.push({
      title: `Iteration ${i}: Inserting element`,
      message: `Taking element arr[${i}]=${key} to insert into sorted portion [0 to ${i - 1}]`,
      explanation: `We take the next unsorted element (at position ${i}) and will insert it into the correct position in the sorted portion.`,
      visualization: { 
        array: [...arr], 
        current: i,
        keyIndex: keyIndex,
        keyValue: key,
        sorted: i - 1,
        inserting: true
      },
      operations: operationCount
    });
    
    while (j >= 0 && arr[j] > key) {
      operationCount++;
      arr[j + 1] = arr[j];
      executionSteps.push({
        title: 'Shifting element right',
        message: `Shifting arr[${j}]=${arr[j + 1]} to position ${j + 1} (making room for ${key})`,
        explanation: `Since arr[${j}]=${arr[j + 1]} > ${key}, we shift it one position to the right to make space.`,
        visualization: { 
          array: [...arr], 
          current: i,
          keyIndex: keyIndex,
          keyValue: key,
          comparing: j,
          shifting: j + 1,
          sorted: i - 1
        },
        operations: operationCount
      });
      j--;
    }
    
    arr[j + 1] = key;
    operationCount++;
    executionSteps.push({
      title: 'Element inserted',
      message: `Inserted ${key} at position ${j + 1}`,
      explanation: `The element ${key} is now in its correct sorted position. The sorted portion now extends to position ${i}.`,
      visualization: { 
        array: [...arr], 
        current: j + 1,
        keyIndex: j + 1,
        keyValue: key,
        sorted: i,
        inserted: true
      },
      operations: operationCount
    });
  }
  
  executionSteps.push({
    title: 'Sorting Complete',
    message: `Sorted array: [${arr.join(', ')}]`,
    explanation: 'All elements have been inserted into their correct positions. The array is now sorted.',
    visualization: { 
      array: [...arr], 
      sorted: arr.length - 1
    },
    result: arr,
    operations: operationCount
  });
}

function generateFactorialSteps(n) {
  const multiplicationChain = [];
  const callStack = [];
  
  executionSteps.push({
    title: 'Starting Factorial',
    message: `Calculating ${n}!`,
    explanation: `Factorial multiplies all numbers from ${n} down to 1: ${n}! = ${n} × ${n-1} × ... × 2 × 1`,
    visualization: { type: 'recursion', algorithm: 'factorial', n, multiplicationChain: [], callStack: [] },
    operations: 0
  });
  
  function fact(n, depth = 0) {
    operationCount++;
    callStack.push({ n, depth });
    
    executionSteps.push({
      title: `Computing factorial(${n})`,
      message: `Calling factorial(${n})`,
      explanation: depth === 0 ? 
        `We start by calling factorial(${n}). This will compute ${n} × ${n-1} × ... × 2 × 1` :
        `Recursive call: factorial(${n}) needs factorial(${n-1}) first.`,
      state: { n, depth },
      visualization: { 
        type: 'recursion', 
        algorithm: 'factorial', 
        n, 
        multiplicationChain: [...multiplicationChain],
        callStack: [...callStack], 
        depth,
        current: n
      },
      operations: operationCount
    });
    
    if (n === 0 || n === 1) {
      callStack.pop();
      multiplicationChain.push({ value: 1, isBase: true });
      executionSteps.push({
        title: 'Base case reached',
        message: `factorial(${n}) = 1 (base case)`,
        explanation: `When n is 0 or 1, we return 1. This stops the recursion.`,
        result: 1,
        visualization: { 
          type: 'recursion', 
          algorithm: 'factorial', 
          n, 
          multiplicationChain: [...multiplicationChain],
          callStack: [...callStack], 
          depth, 
          baseCase: true, 
          returnValue: 1,
          current: n
        },
        operations: operationCount
      });
      return 1;
    }
    
    const recursiveResult = fact(n - 1, depth + 1);
    const result = n * recursiveResult;
    callStack.pop();
    multiplicationChain.push({ value: n, result });
    
    executionSteps.push({
      title: `Multiplying ${n} × ${recursiveResult}`,
      message: `factorial(${n}) = ${n} × factorial(${n-1}) = ${n} × ${recursiveResult} = ${result}`,
      explanation: `We multiply ${n} by the result of factorial(${n-1}) = ${recursiveResult}, giving us ${result}.`,
      result,
      visualization: { 
        type: 'recursion', 
        algorithm: 'factorial', 
        n, 
        multiplicationChain: [...multiplicationChain],
        callStack: [...callStack], 
        depth, 
        returnValue: result,
        current: n,
        multiplying: { n, recursiveResult, result }
      },
      operations: operationCount
    });
    return result;
  }
  
  const result = fact(n);
  executionSteps.push({
    title: 'Final Result',
    message: `${n}! = ${result}`,
    explanation: `The recursion has completed. ${n}! = ${Array.from({length: n}, (_, i) => n - i).join(' × ')} = ${result}`,
    result,
    visualization: { 
      type: 'recursion', 
      algorithm: 'factorial', 
      n, 
      multiplicationChain: [...multiplicationChain],
      callStack: [], 
      result,
      final: true
    },
    operations: operationCount
  });
}

function generateFibonacciSteps(n) {
  const callStack = [];
  const fibonacciSequence = [0, 1]; // Base values
  const computedValues = {}; // Cache computed values (memoization)
  
  executionSteps.push({
    title: 'Starting Fibonacci',
    message: `Calculating Fibonacci(${n})`,
    explanation: `Fibonacci sequence: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). We're computing F(${n}) using memoization to avoid recalculating values.`,
    visualization: { 
      type: 'recursion', 
      algorithm: 'fibonacci', 
      n, 
      callStack: [],
      fibonacciSequence: [...fibonacciSequence],
      computedValues: {}
    },
    operations: 0
  });
  
  function fib(n, depth = 0) {
    // Check for negative values (should never happen, but safety check)
    if (n < 0) {
      return 0;
    }
    
    // Check if we've already computed this value (memoization)
    if (computedValues[n] !== undefined) {
      operationCount++;
      executionSteps.push({
        title: `Using cached value for F(${n})`,
        message: `Fibonacci(${n}) = ${computedValues[n]} (already computed)`,
        explanation: `We've already computed F(${n}) = ${computedValues[n]}, so we can reuse it instead of recalculating. This is memoization!`,
        result: computedValues[n],
        visualization: { 
          type: 'recursion', 
          algorithm: 'fibonacci', 
          n, 
          callStack: [...callStack],
          fibonacciSequence: [...fibonacciSequence],
          computedValues: {...computedValues},
          depth,
          current: n,
          cached: true,
          cachedValue: computedValues[n]
        },
        operations: operationCount
      });
      return computedValues[n];
    }
    
    operationCount++;
    callStack.push({ n, depth });
    
    executionSteps.push({
      title: `Computing Fibonacci(${n})`,
      message: `Calling Fibonacci(${n})`,
      explanation: depth === 0 ?
        `We start by calling Fibonacci(${n}). This requires Fibonacci(${n-1}) and Fibonacci(${n-2}).` :
        `Recursive call: Fibonacci(${n}) needs Fibonacci(${n-1}) and Fibonacci(${n-2}) first.`,
      state: { n, depth },
      visualization: { 
        type: 'recursion', 
        algorithm: 'fibonacci', 
        n, 
        callStack: [...callStack],
        fibonacciSequence: [...fibonacciSequence],
        computedValues: {...computedValues},
        depth,
        current: n
      },
      operations: operationCount
    });
    
    if (n <= 1) {
      callStack.pop();
      computedValues[n] = n;
      if (n === 1 && fibonacciSequence.length < 2) {
        fibonacciSequence.push(1);
      }
      executionSteps.push({
        title: 'Base case reached',
        message: `Fibonacci(${n}) = ${n} (base case)`,
        explanation: `When n is 0 or 1, we return n. This stops the recursion. We store this value for reuse.`,
        result: n,
        visualization: { 
          type: 'recursion', 
          algorithm: 'fibonacci', 
          n, 
          callStack: [...callStack],
          fibonacciSequence: [...fibonacciSequence],
          computedValues: {...computedValues},
          depth, 
          baseCase: true, 
          returnValue: n,
          current: n
        },
        operations: operationCount
      });
      return n;
    }
    
    const fib1 = fib(n - 1, depth + 1);
    const fib2 = fib(n - 2, depth + 1);
    const result = fib1 + fib2;
    callStack.pop();
    computedValues[n] = result; // Store in cache
    
    // Update sequence - ensure we have all values up to n
    while (fibonacciSequence.length <= n) {
      if (fibonacciSequence.length === 2) {
        // We already have 0 and 1, now add 2
        fibonacciSequence.push(1);
      } else {
        const next = fibonacciSequence[fibonacciSequence.length - 1] + fibonacciSequence[fibonacciSequence.length - 2];
        fibonacciSequence.push(next);
      }
    }
    
    executionSteps.push({
      title: `Adding ${fib1} + ${fib2}`,
      message: `Fibonacci(${n}) = Fibonacci(${n - 1}) + Fibonacci(${n - 2}) = ${fib1} + ${fib2} = ${result}`,
      explanation: `We add the results: ${fib1} + ${fib2} = ${result}. This gives us Fibonacci(${n}). We store this value for future reuse.`,
      result,
      visualization: { 
        type: 'recursion', 
        algorithm: 'fibonacci', 
        n, 
        callStack: [...callStack],
        fibonacciSequence: [...fibonacciSequence],
        computedValues: {...computedValues},
        depth, 
        returnValue: result,
        current: n,
        adding: { n, fib1, fib2, result }
      },
      operations: operationCount
    });
    return result;
  }
  
  const result = fib(n);
  executionSteps.push({
    title: 'Final Result',
    message: `Fibonacci(${n}) = ${result}`,
    explanation: `The recursion has completed. Fibonacci(${n}) = ${result}. The sequence so far: ${fibonacciSequence.slice(0, n + 1).join(', ')}. We computed ${Object.keys(computedValues).length} unique values using memoization.`,
    result,
    visualization: { 
      type: 'recursion', 
      algorithm: 'fibonacci', 
      n, 
      callStack: [],
      fibonacciSequence: fibonacciSequence.slice(0, n + 1),
      computedValues: {...computedValues},
      result,
      final: true
    },
    operations: operationCount
  });
}

function renderVisualization(viz) {
  if (!viz) {
    visualizationSection.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No visualization data available</p>';
    return;
  }
  
  // Handle recursion visualization (factorial, fibonacci)
  if (viz.type === 'recursion') {
    renderRecursionVisualization(viz);
    return;
  }
  
  if (!viz.array) {
    visualizationSection.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No visualization data available</p>';
    return;
  }
  
  // Determine visualization type based on algorithm
  const algoKey = algorithmSelect.value;
  
  if (algoKey === 'linear-search' || algoKey === 'binary-search') {
    renderSearchVisualization(viz);
  } else if (algoKey.includes('sort')) {
    renderSortVisualization(viz);
  } else {
    renderDefaultVisualization(viz);
  }
}

function renderRecursionVisualization(viz) {
  const { algorithm, n, callStack, depth, baseCase, returnValue, result, multiplicationChain, current, multiplying, final, fibonacciSequence, computedValues, adding, cached, cachedValue } = viz;
  
  let visualizationHTML = `
      <div class="viz-title">${algorithm === 'factorial' ? 'Factorial Calculation' : 'Fibonacci Calculation'}</div>
      <div class="recursion-viz">
  `;
  
  if (algorithm === 'factorial') {
    // Factorial visualization
    if (multiplicationChain && multiplicationChain.length > 0) {
      const chainValues = multiplicationChain.map(item => item.value);
      const currentResult = multiplicationChain[multiplicationChain.length - 1].result;
      
      visualizationHTML += `
        <div class="factorial-chain">
          <div class="chain-label">Multiplication Chain:</div>
          <div class="chain-values">
            ${chainValues.map((val, idx) => {
              const isCurrent = current === val;
              const isBase = multiplicationChain[idx].isBase;
              return `
                <span class="chain-number ${isCurrent ? 'current' : ''} ${isBase ? 'base' : ''}">
                  ${val}
                  ${idx < chainValues.length - 1 ? '<span class="multiply-symbol">×</span>' : ''}
                </span>
              `;
            }).join('')}
          </div>
          ${currentResult ? `<div class="chain-result">= ${currentResult}</div>` : ''}
        </div>
      `;
      
      if (multiplying) {
        visualizationHTML += `
          <div class="multiplying-step">
            <div class="multiplying-label">Currently computing:</div>
            <div class="multiplying-expression">
              ${multiplying.n} × ${multiplying.recursiveResult} = <strong>${multiplying.result}</strong>
            </div>
          </div>
        `;
      }
    } else if (n !== undefined) {
      const numbers = Array.from({length: n}, (_, i) => n - i);
      visualizationHTML += `
        <div class="factorial-chain">
          <div class="chain-label">Calculating ${n}!:</div>
          <div class="chain-values">
            ${numbers.map((val, idx) => `
              <span class="chain-number">
                ${val}
                ${idx < numbers.length - 1 ? '<span class="multiply-symbol">×</span>' : ''}
              </span>
            `).join('')}
          </div>
          ${result !== undefined ? `<div class="chain-result">= ${result}</div>` : ''}
        </div>
      `;
    }
    
    if (final && result) {
      const numbers = Array.from({length: n}, (_, i) => n - i);
      visualizationHTML += `
        <div class="final-result">
          <div class="final-label">Final Result:</div>
          <div class="final-expression">
            ${n}! = ${numbers.join(' × ')} = <strong>${result}</strong>
          </div>
        </div>
      `;
    }
  } else if (algorithm === 'fibonacci') {
    // Fibonacci visualization
    if (cached) {
      // Show when we're using a cached value
      visualizationHTML += `
        <div class="cached-step">
          <div class="multiplying-label">Using cached value:</div>
          <div class="multiplying-expression">
            F(${n}) = <strong>${cachedValue}</strong> (already computed, no recalculation needed!)
          </div>
        </div>
      `;
    }
    
    if (fibonacciSequence && fibonacciSequence.length > 0) {
      visualizationHTML += `
        <div class="fibonacci-sequence">
          <div class="chain-label">Fibonacci Sequence (Computed Values):</div>
          <div class="fibonacci-values">
            ${fibonacciSequence.map((val, idx) => {
              const isCurrent = current === idx;
              const isBase = idx <= 1;
              const isComputed = computedValues && computedValues[idx] !== undefined;
              return `
                <span class="fibonacci-number ${isCurrent ? 'current' : ''} ${isBase ? 'base' : ''} ${isComputed ? 'computed' : ''}">
                  F(${idx}) = ${val}
                  ${isComputed && !isBase ? '<span class="cached-badge">✓</span>' : ''}
                </span>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    // Show computed values cache
    if (computedValues && Object.keys(computedValues).length > 0) {
      const cacheEntries = Object.entries(computedValues)
        .filter(([k, v]) => parseInt(k) >= 0) // Only show non-negative indices
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
      
      if (cacheEntries.length > 0) {
        visualizationHTML += `
          <div class="computed-values-cache">
            <div class="chain-label">Memoization Cache:</div>
            <div class="cache-values">
              ${cacheEntries.map(([k, v]) => `
                <span class="cache-entry">F(${k})=${v}</span>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
    
    if (adding) {
      visualizationHTML += `
        <div class="adding-step">
          <div class="multiplying-label">Currently computing:</div>
          <div class="multiplying-expression">
            F(${adding.n}) = F(${adding.n - 1}) + F(${adding.n - 2}) = ${adding.fib1} + ${adding.fib2} = <strong>${adding.result}</strong>
          </div>
        </div>
      `;
    }
    
    if (n !== undefined && !adding && !final && !cached && n > 1) {
      // Only show goal if n is valid (not negative)
      visualizationHTML += `
        <div class="fibonacci-goal">
          <div class="chain-label">Computing:</div>
          <div class="fibonacci-goal-expression">
            F(${n}) = F(${n-1}) + F(${n-2})
          </div>
        </div>
      `;
    }
    
    if (final && result !== undefined) {
      const sequenceDisplay = fibonacciSequence.slice(0, Math.min(n + 1, fibonacciSequence.length));
      const uniqueComputations = computedValues ? Object.keys(computedValues).length : 0;
      visualizationHTML += `
        <div class="final-result">
          <div class="final-label">Final Result:</div>
          <div class="final-expression">
            F(${n}) = <strong>${result}</strong>
          </div>
          <div class="sequence-display" style="margin-top: 15px; font-size: 14px; opacity: 0.9;">
            Sequence: ${sequenceDisplay.map((val, idx) => `F(${idx})=${val}`).join(', ')}
          </div>
          <div class="memoization-info" style="margin-top: 10px; font-size: 13px; opacity: 0.8;">
            Computed ${uniqueComputations} unique values using memoization (avoided redundant calculations)
          </div>
        </div>
      `;
    }
  }
  
  // Show call stack if available
  if (callStack && callStack.length > 0) {
    visualizationHTML += `
      <div class="call-stack-section">
        <div class="call-stack-label">Call Stack:</div>
        ${callStack.map((call, index) => {
          const isCurrent = index === callStack.length - 1;
          return `
            <div class="call-stack-item ${isCurrent ? 'current' : ''}">
              ${algorithm}(${call.n})
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  if (baseCase) {
    visualizationHTML += `
      <div class="recursion-base-case">
        <strong>Base Case Reached:</strong> ${algorithm}(${n}) = ${returnValue}
      </div>
    `;
  }
  
  visualizationHTML += `
      </div>
  `;
  
  visualizationSection.innerHTML = visualizationHTML;
}

function renderSearchVisualization(viz) {
  const { array, currentIndex, target, left, right, mid, found, checked } = viz;
  
  visualizationSection.innerHTML = `
      <div class="viz-title">Array Elements</div>
      <div class="viz-boxes">
        ${array.map((val, i) => {
          let state = 'default';
          let label = '';
          
          // Determine box state
          if (found !== undefined && found === i) {
            state = 'found';
            label = 'Found!';
          } else if (found === -1 && checked && checked.includes(i)) {
            state = 'checked';
            label = 'Checked';
          } else if (currentIndex === i) {
            state = 'checking';
            label = 'Checking';
          } else if (currentIndex !== undefined && i < currentIndex && !checked) {
            state = 'checked';
            label = 'Checked';
          } else if (target !== undefined && val === target && found === undefined) {
            state = 'target';
            label = 'Target';
          }
          
          // Binary search specific
          if (left !== undefined && right !== undefined) {
            if (i === mid) {
              state = 'checking';
              label = 'Mid';
            } else if (i >= left && i <= right) {
              if (state === 'default' || state === 'target') {
                state = state === 'target' ? 'target' : 'search-space';
                if (state === 'search-space') label = 'Search Space';
              }
            } else {
              state = 'excluded';
              label = 'Excluded';
            }
          }
          
          return `
            <div class="viz-box ${state}" data-index="${i}" data-value="${val}">
              <div class="box-value">${val}</div>
              <div class="box-index">[${i}]</div>
              ${label ? `<div class="box-label">${label}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
  `;
}

function renderSortVisualization(viz) {
  const { array, comparing, swapped, sorted, current, minIndex, newMin, swapping, keyIndex, keyValue, shifting, inserting, inserted } = viz;
  const algoKey = algorithmSelect.value;
  
  visualizationSection.innerHTML = `
      <div class="viz-title">Array Elements</div>
      ${algoKey === 'selection-sort' && sorted !== undefined ? `<div class="viz-info">Sorted portion: [0 to ${sorted}] | Unsorted: [${sorted + 1} to ${array.length - 1}]</div>` : ''}
      ${algoKey === 'insertion-sort' && keyValue !== undefined ? `<div class="viz-info">Sorted portion: [0 to ${sorted !== undefined ? sorted : 0}] | Inserting: ${keyValue}</div>` : ''}
      <div class="viz-boxes">
        ${array.map((val, i) => {
          let state = 'default';
          let label = '';
          
          // Selection Sort specific visualization
          if (algoKey === 'selection-sort') {
            if (sorted !== undefined && i <= sorted) {
              state = 'sorted';
              label = 'Sorted';
            } else if (swapping && (i === swapped || i === minIndex)) {
              state = 'swapped';
              label = i === swapped ? 'Swapping' : 'Swapping';
            } else if (newMin && i === minIndex) {
              state = 'found';
              label = 'New Min!';
            } else if (minIndex === i) {
              state = 'current';
              label = 'Min Candidate';
            } else if (comparing === i) {
              state = 'comparing';
              label = 'Comparing';
            } else if (current === i) {
              state = 'current';
              label = 'Current';
            }
          } 
          // Insertion Sort specific visualization
          else if (algoKey === 'insertion-sort') {
            // During insertion, sorted portion is up to (but not including) the key's original position
            const sortedBoundary = inserting && keyIndex !== undefined ? keyIndex - 1 : sorted;
            if (sortedBoundary !== undefined && i <= sortedBoundary) {
              state = 'sorted';
              label = 'Sorted';
            } else if (inserted && i === keyIndex) {
              state = 'found';
              label = 'Inserted!';
            } else if (keyIndex === i && inserting && !inserted) {
              state = 'checking';
              label = 'Key';
            } else if (shifting === i) {
              state = 'swapped';
              label = 'Shifting';
            } else if (comparing === i) {
              state = 'comparing';
              label = 'Comparing';
            } else if (current === i) {
              state = 'current';
              label = 'Current';
            }
          } 
          // Other sorting algorithms (Bubble Sort, etc.)
          else {
            if (sorted !== undefined && i <= sorted) {
              state = 'sorted';
              label = 'Sorted';
            } else if (swapped === i || (swapped !== undefined && swapped === true && comparing === i)) {
              state = 'swapped';
              label = 'Swapped';
            } else if (comparing === i || (comparing !== undefined && comparing + 1 === i)) {
              state = 'comparing';
              label = comparing === i ? 'Comparing' : 'Comparing';
            } else if (current === i) {
              state = 'current';
              label = 'Current';
            }
          }
          
          return `
            <div class="viz-box ${state}" data-index="${i}" data-value="${val}">
              <div class="box-value">${val}</div>
              <div class="box-index">[${i}]</div>
              ${label ? `<div class="box-label">${label}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      ${algoKey === 'selection-sort' && minIndex !== undefined && comparing !== undefined ? 
        `<div class="viz-comparison-info">
          <span>Comparing: arr[${comparing}] = ${array[comparing]}</span>
          <span style="margin: 0 10px;">vs</span>
          <span>Min Candidate: arr[${minIndex}] = ${array[minIndex]}</span>
        </div>` : ''}
      ${algoKey === 'insertion-sort' && keyValue !== undefined && comparing !== undefined ? 
        `<div class="viz-comparison-info">
          <span>Key to insert: ${keyValue}</span>
          <span style="margin: 0 10px;">vs</span>
          <span>Comparing: arr[${comparing}] = ${array[comparing]}</span>
        </div>` : ''}
  `;
}

function renderDefaultVisualization(viz) {
  const { array, currentIndex } = viz;
  
  visualizationSection.innerHTML = `
      <div class="viz-title">Array Elements</div>
      <div class="viz-boxes">
        ${array.map((val, i) => {
          const state = currentIndex === i ? 'current' : 'default';
          return `
            <div class="viz-box ${state}" data-index="${i}" data-value="${val}">
              <div class="box-value">${val}</div>
              <div class="box-index">[${i}]</div>
            </div>
          `;
        }).join('')}
      </div>
  `;
}

function resetCode() {
  if (currentAlgorithm) {
    currentCode = currentAlgorithm.code;
    renderCode(currentCode);
    clearTrace();
    clearVisualization();
    clearResults();
    executionSteps = [];
    currentStepIndex = 0;
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent)'};
    color: white;
    border-radius: 6px;
    z-index: 1000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ==================== EXPLORATION TAB EVENT LISTENERS ====================
algorithmSelect.addEventListener('change', (e) => {
  loadExplorationAlgorithm(e.target.value);
});

// ==================== EXPLORATION TAB EVENT LISTENERS ====================
reloadDataBtn.addEventListener('click', () => {
  if (explorationAlgorithm.category === 'math') {
    // For math algorithms, regenerate with a new random number (1-8 for factorial, 2-8 for fibonacci)
    const maxN = explorationAlgorithm.key === 'factorial' ? 8 : 8;
    const minN = explorationAlgorithm.key === 'factorial' ? 1 : 2;
    const randomN = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
    explorationArray = [randomN];
    explorationInput = { n: randomN };
    renderVisualization({ 
      type: 'recursion', 
      algorithm: explorationAlgorithm.key === 'factorial' ? 'factorial' : 'fibonacci', 
      n: randomN,
      fibonacciSequence: explorationAlgorithm.key === 'fibonacci' ? [0, 1] : undefined,
      multiplicationChain: [],
      callStack: []
    });
  } else {
    generateExplorationData();
  }
  clearExplorationResults();
  explorationSteps = [];
  explorationStepIndex = 0;
  explorationOperationCount = 0;
});

targetSelect.addEventListener('change', () => {
  updateExplorationInput();
});

// ==================== SHARED STEP GENERATION VARIABLES ====================
// These are used by the step generation functions (generateLinearSearchSteps, etc.)
// They get temporarily assigned to either explorationSteps or codeSteps
let executionSteps = [];
let operationCount = 0;

// ==================== EXPLORATION TAB EXECUTION FUNCTIONS ====================
function generateExplorationSteps() {
  if (!explorationInput) {
    updateExplorationInput();
    if (!explorationInput) {
      showNotification('Please select a target first', 'error');
      return;
    }
  }
  
  explorationSteps = [];
  explorationOperationCount = 0;
  explorationStepIndex = 0;
  
  const algoKey = algorithmSelect.value;
  
  // Temporarily use exploration state for step generation
  // The step generation functions use executionSteps and operationCount as globals
  executionSteps = explorationSteps;
  operationCount = explorationOperationCount;
  
  if (algoKey === 'linear-search') {
    generateLinearSearchSteps(explorationInput.arr, explorationInput.target);
  } else if (algoKey === 'binary-search') {
    generateBinarySearchSteps(explorationInput.arr, explorationInput.target);
  } else if (algoKey === 'bubble-sort') {
    generateBubbleSortSteps([...explorationInput.arr]);
  } else if (algoKey === 'selection-sort') {
    generateSelectionSortSteps([...explorationInput.arr]);
  } else if (algoKey === 'insertion-sort') {
    generateInsertionSortSteps([...explorationInput.arr]);
  } else if (algoKey === 'factorial') {
    generateFactorialSteps(explorationInput.n);
  } else if (algoKey === 'fibonacci') {
    generateFibonacciSteps(explorationInput.n);
  }
  
  // Restore exploration state
  explorationSteps = executionSteps;
  explorationOperationCount = operationCount;
  
  renderExplorationStep(0);
}

function runExplorationCode() {
  generateExplorationSteps();
  if (explorationSteps.length === 0) return;
  
  // Scroll controls section to top so animation and steps below are visible
  if (controlsSection) {
    controlsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  explorationStepIndex = 0;
  const executeNext = () => {
    if (explorationStepIndex < explorationSteps.length) {
      renderExplorationStep(explorationStepIndex);
      explorationStepIndex++;
      setTimeout(executeNext, 300);
    } else {
      showExplorationResults();
    }
  };
  executeNext();
}

function stepExplorationForward() {
  if (explorationSteps.length === 0) {
    generateExplorationSteps();
    // Scroll to visualization section on first step
    visualizationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  if (explorationStepIndex < explorationSteps.length) {
    renderExplorationStep(explorationStepIndex);
    explorationStepIndex++;
    
    if (explorationStepIndex >= explorationSteps.length) {
      showExplorationResults();
    }
  }
}

function renderExplorationStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= explorationSteps.length) return;
  
  const step = explorationSteps[stepIndex];
  explorationStepIndex = stepIndex;
  
  // Show explanation
  stepExplanation.innerHTML = `
    <div class="step-explanation-content">
      <h4>${step.title || 'Step ' + (stepIndex + 1)}</h4>
      <p>${step.explanation || step.message}</p>
      ${step.state ? `<pre style="background: var(--bg); padding: 10px; border-radius: 4px; margin-top: 10px;">${JSON.stringify(step.state, null, 2)}</pre>` : ''}
    </div>
  `;
  
  // Update visualization
  if (step.visualization) {
    renderVisualization(step.visualization);
  } else if (explorationInput && explorationInput.arr) {
    renderVisualization({ array: explorationInput.arr });
  }
}

function showExplorationResults() {
  if (explorationSteps.length === 0) return;
  
  const lastStep = explorationSteps[explorationSteps.length - 1];
  const result = lastStep.result;
  
  resultsSection.innerHTML = `
    <div class="result-content">
      <h4>Algorithm Result</h4>
      <p><strong>Output:</strong> ${JSON.stringify(result)}</p>
      <p><strong>Total Operations:</strong> ${explorationOperationCount}</p>
      <p><strong>Time Complexity:</strong> ${explorationAlgorithm.complexity}</p>
    </div>
  `;
}

runExplorationBtn.addEventListener('click', runExplorationCode);
stepExplorationBtn.addEventListener('click', stepExplorationForward);
resetExplorationBtn.addEventListener('click', () => {
  clearExplorationVisualization();
  clearExplorationResults();
  explorationSteps = [];
  explorationStepIndex = 0;
  explorationOperationCount = 0;
  if (explorationAutoStepInterval) {
    clearInterval(explorationAutoStepInterval);
    explorationAutoStepInterval = null;
  }
});

autoStepExplorationBtn.addEventListener('click', () => {
  if (explorationAutoStepInterval) {
    clearInterval(explorationAutoStepInterval);
    explorationAutoStepInterval = null;
    autoStepExplorationBtn.textContent = 'Auto Step';
  } else {
    if (explorationSteps.length === 0) {
      generateExplorationSteps();
      // Scroll to visualization section when starting auto-step
      visualizationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    autoStepExplorationBtn.textContent = 'Stop Auto';
    explorationAutoStepInterval = setInterval(() => {
      if (explorationStepIndex < explorationSteps.length) {
        stepExplorationForward();
      } else {
        clearInterval(explorationAutoStepInterval);
        explorationAutoStepInterval = null;
        autoStepExplorationBtn.textContent = 'Auto Step';
      }
    }, 800);
  }
});

// ==================== CODE TAB EVENT LISTENERS ====================
codeAlgorithmSelect.addEventListener('change', (e) => {
  loadCodeAlgorithm(e.target.value);
});

codeInputData.addEventListener('input', updateCodeInputDisplay);

codeGenerateInputBtn.addEventListener('click', () => {
  if (codeAlgorithm.category === 'math') {
    const n = Math.floor(Math.random() * 10) + 1;
    codeInputData.value = n;
  } else {
    const size = 5 + Math.floor(Math.random() * 5);
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 100) + 1);
    }
    
    if (codeAlgorithmSelect.value === 'binary-search') {
      arr.sort((a, b) => a - b);
    }
    
    if (codeAlgorithm.category === 'search') {
      const target = arr[Math.floor(Math.random() * arr.length)];
      codeInputData.value = `${arr.join(',')} | ${target}`;
    } else {
      codeInputData.value = arr.join(',');
    }
  }
  updateCodeInputDisplay();
});

codeLoadSampleBtn.addEventListener('click', () => {
  if (codeAlgorithm.sampleInput) {
    if (codeAlgorithm.category === 'math') {
      codeInputData.value = codeAlgorithm.sampleInput.n;
    } else if (codeAlgorithm.sampleInput.target !== undefined) {
      codeInputData.value = `${codeAlgorithm.sampleInput.arr.join(',')} | ${codeAlgorithm.sampleInput.target}`;
    } else {
      codeInputData.value = codeAlgorithm.sampleInput.arr.join(',');
    }
    updateCodeInputDisplay();
  }
});

runCodeBtn.addEventListener('click', runCode);
stepBtn.addEventListener('click', stepForward);
codeResetCodeBtn.addEventListener('click', () => {
  if (codeAlgorithm) {
    renderCode(codeCode);
  }
});
resetExecutionBtn.addEventListener('click', () => {
  clearCodeTrace();
  clearCodeResults();
  codeSteps = [];
  codeStepIndex = 0;
  codeOperationCount = 0;
  if (codeAutoStepInterval) {
    clearInterval(codeAutoStepInterval);
    codeAutoStepInterval = null;
  }
});

autoStepBtn.addEventListener('click', () => {
  if (codeAutoStepInterval) {
    clearInterval(codeAutoStepInterval);
    codeAutoStepInterval = null;
    autoStepBtn.textContent = 'Auto Step';
  } else {
    if (codeSteps.length === 0) {
      generateCodeExecutionSteps();
    }
    autoStepBtn.textContent = 'Stop Auto';
    codeAutoStepInterval = setInterval(() => {
      if (codeStepIndex < codeSteps.length) {
        stepForward();
      } else {
        clearInterval(codeAutoStepInterval);
        codeAutoStepInterval = null;
        autoStepBtn.textContent = 'Auto Step';
      }
    }, 800);
  }
});

// Initialize
loadExplorationAlgorithm('linear-search');
generateExplorationData(); // Generate initial data
loadCodeAlgorithm('linear-search');

// ==================== EFFICIENCY TAB ====================

const algorithmComparisons = {
  'linear-vs-binary': {
    slow: {
      name: 'Linear Search',
      code: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      complexity: 'O(n)',
      run: (arr, target) => {
        let ops = 0;
        for (let i = 0; i < arr.length; i++) {
          ops++;
          if (arr[i] === target) return { result: i, operations: ops };
        }
        return { result: -1, operations: ops };
      }
    },
    fast: {
      name: 'Binary Search',
      code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      complexity: 'O(log n)',
      run: (arr, target) => {
        let ops = 0;
        let left = 0, right = arr.length - 1;
        while (left <= right) {
          ops++;
          let mid = Math.floor((left + right) / 2);
          if (arr[mid] === target) return { result: mid, operations: ops };
          if (arr[mid] < target) left = mid + 1;
          else right = mid - 1;
        }
        return { result: -1, operations: ops };
      }
    },
    generateInput: (size) => {
      const arr = [];
      for (let i = 1; i <= size; i++) arr.push(i);
      return { arr, target: Math.floor(size / 2) };
    }
  },
  'bubble-vs-quick': {
    slow: {
      name: 'Bubble Sort',
      code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      complexity: 'O(n²)',
      run: (arr) => {
        const copy = [...arr];
        let ops = 0;
        for (let i = 0; i < copy.length - 1; i++) {
          for (let j = 0; j < copy.length - 1 - i; j++) {
            ops++;
            if (copy[j] > copy[j + 1]) {
              [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
            }
          }
        }
        return { result: copy, operations: ops };
      }
    },
    fast: {
      name: 'Quick Sort',
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = [], right = [], equal = [];
  for (let x of arr) {
    if (x < pivot) left.push(x);
    else if (x > pivot) right.push(x);
    else equal.push(x);
  }
  return [...quickSort(left), ...equal, ...quickSort(right)];
}`,
      complexity: 'O(n log n)',
      run: (arr) => {
        let ops = 0;
        function qs(a) {
          if (a.length <= 1) return a;
          ops++;
          const pivot = a[Math.floor(a.length / 2)];
          const left = [], right = [], equal = [];
          for (let x of a) {
            ops++;
            if (x < pivot) left.push(x);
            else if (x > pivot) right.push(x);
            else equal.push(x);
          }
          return [...qs(left), ...equal, ...qs(right)];
        }
        return { result: qs([...arr]), operations: ops };
      }
    },
    generateInput: (size) => {
      const arr = [];
      for (let i = size; i >= 1; i--) arr.push(i);
      return { arr };
    }
  },
  'iterative-vs-recursive': {
    slow: {
      name: 'Recursive Fibonacci',
      code: `function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
}`,
      complexity: 'O(2ⁿ)',
      run: (n) => {
        let ops = 0;
        function fib(n) {
          ops++;
          if (n <= 1) return n;
          return fib(n - 1) + fib(n - 2);
        }
        return { result: fib(n), operations: ops };
      }
    },
    fast: {
      name: 'Iterative Fibonacci',
      code: `function fibIterative(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
      complexity: 'O(n)',
      run: (n) => {
        let ops = 0;
        if (n <= 1) return { result: n, operations: 1 };
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
          ops++;
          [a, b] = [b, a + b];
        }
        return { result: b, operations: ops };
      }
    },
    generateInput: (size) => {
      return { n: Math.min(size, 30) }; // Cap at 30 for recursive
    }
  },
  'naive-vs-optimized': {
    slow: {
      name: 'Naive Factorial',
      code: `function factorialNaive(n) {
  if (n <= 1) return 1;
  return n * factorialNaive(n - 1);
}`,
      complexity: 'O(n)',
      run: (n) => {
        let ops = 0;
        function fact(n) {
          ops++;
          if (n <= 1) return 1;
          return n * fact(n - 1);
        }
        return { result: fact(n), operations: ops };
      }
    },
    fast: {
      name: 'Iterative Factorial',
      code: `function factorialIterative(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`,
      complexity: 'O(n)',
      run: (n) => {
        let ops = 0;
        let result = 1;
        for (let i = 2; i <= n; i++) {
          ops++;
          result *= i;
        }
        return { result, operations: ops };
      }
    },
    generateInput: (size) => {
      return { n: Math.min(size, 20) };
    }
  }
};

const comparisonSelect = document.getElementById('comparisonSelect');
const inputSize = document.getElementById('inputSize');
const inputSizeValue = document.getElementById('inputSizeValue');
const runComparisonBtn = document.getElementById('runComparisonBtn');
const slowCode = document.getElementById('slowCode');
const fastCode = document.getElementById('fastCode');
const slowOperations = document.getElementById('slowOperations');
const fastOperations = document.getElementById('fastOperations');
const slowTime = document.getElementById('slowTime');
const fastTime = document.getElementById('fastTime');
const slowVisualization = document.getElementById('slowVisualization');
const fastVisualization = document.getElementById('fastVisualization');
const comparisonChart = document.getElementById('comparisonChart');

inputSize.addEventListener('input', (e) => {
  inputSizeValue.textContent = e.target.value;
});

function runComparison() {
  const comparison = algorithmComparisons[comparisonSelect.value];
  const size = parseInt(inputSize.value);
  const input = comparison.generateInput(size);
  
  // Update code displays
  slowCode.textContent = comparison.slow.code;
  fastCode.textContent = comparison.fast.code;
  
  // Update complexity badges
  document.querySelector('.algorithm-panel.slow .complexity-badge').textContent = comparison.slow.complexity;
  document.querySelector('.algorithm-panel.fast .complexity-badge').textContent = comparison.fast.complexity;
  
  // Run slow algorithm
  const startSlow = performance.now();
  const slowResult = comparison.slow.run(input.arr || input.n, input.target);
  const endSlow = performance.now();
  const slowTimeMs = (endSlow - startSlow).toFixed(2);
  
  // Run fast algorithm
  const startFast = performance.now();
  const fastResult = comparison.fast.run(input.arr || input.n, input.target);
  const endFast = performance.now();
  const fastTimeMs = (endFast - startFast).toFixed(2);
  
  // Update displays
  slowOperations.textContent = slowResult.operations;
  fastOperations.textContent = fastResult.operations;
  slowTime.textContent = `${slowTimeMs}ms`;
  fastTime.textContent = `${fastTimeMs}ms`;
  
  // Visualizations - show complexity graphs with normalized Y-axis
  const maxSize = parseInt(inputSize.value) || 100;
  const maxOps = calculateMaxOperations(comparison, maxSize);
  renderComplexityGraph(slowVisualization, comparison, comparison.slow, 'slow', maxOps);
  renderComplexityGraph(fastVisualization, comparison, comparison.fast, 'fast', maxOps);
  
  // Chart
  renderComparisonChart(comparison, size, slowResult.operations, fastResult.operations);
}

function calculateMaxOperations(comparison, maxSize) {
  // Calculate theoretical operations for both algorithms to find the maximum
  const complexities = [comparison.slow.complexity, comparison.fast.complexity];
  let maxOps = 1;
  
  for (const complexity of complexities) {
    const n = maxSize;
    let theoreticalOps;
    if (complexity === 'O(1)') {
      theoreticalOps = 1;
    } else if (complexity === 'O(log n)') {
      theoreticalOps = Math.log2(n);
    } else if (complexity === 'O(n)') {
      theoreticalOps = n;
    } else if (complexity === 'O(n log n)') {
      theoreticalOps = n * Math.log2(n);
    } else if (complexity === 'O(n²)') {
      theoreticalOps = n * n;
    } else if (complexity === 'O(2ⁿ)' || complexity === 'O(2^n)') {
      // Don't cap exponential - show true growth
      theoreticalOps = Math.pow(2, n);
    } else {
      theoreticalOps = 1;
    }
    maxOps = Math.max(maxOps, theoreticalOps);
  }
  
  return maxOps;
}

function renderComplexityGraph(container, comparison, algorithm, type, normalizedMaxOps) {
  container.innerHTML = '';
  
  // Generate data points for different input sizes
  const sizes = [];
  const operations = [];
  const maxSize = parseInt(inputSize.value) || 100;
  
  // Calculate theoretical operations based on complexity notation
  const complexity = algorithm.complexity;
  
  // Generate sample sizes (evenly distributed)
  const numPoints = 50;
  for (let i = 0; i < numPoints; i++) {
    const n = Math.max(1, Math.floor((maxSize / numPoints) * (i + 1)));
    sizes.push(n);
    
    // Calculate theoretical operations based on Big O notation
    let theoreticalOps;
    if (complexity === 'O(1)') {
      theoreticalOps = 1;
    } else if (complexity === 'O(log n)') {
      theoreticalOps = Math.log2(n);
    } else if (complexity === 'O(n)') {
      theoreticalOps = n;
    } else if (complexity === 'O(n log n)') {
      theoreticalOps = n * Math.log2(n);
    } else if (complexity === 'O(n²)') {
      theoreticalOps = n * n;
    } else if (complexity === 'O(2ⁿ)' || complexity === 'O(2^n)') {
      // Show true exponential growth
      theoreticalOps = Math.pow(2, n);
    } else {
      // Fallback: use actual measurement
      const testInput = comparison.generateInput(n);
      const result = algorithm.run(testInput.arr || testInput.n, testInput.target);
      theoreticalOps = result.operations;
    }
    
    operations.push(theoreticalOps);
  }
  
  // Use the normalized max operations (from both algorithms) for scaling
  const maxOps = normalizedMaxOps || Math.max(...operations.filter(op => isFinite(op)));
  
  // Create SVG for the graph
  const svgWidth = container.offsetWidth || 400;
  const svgHeight = 200;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);
  svg.style.display = 'block';
  
  // Draw axes
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', padding.left);
  xAxis.setAttribute('y1', svgHeight - padding.bottom);
  xAxis.setAttribute('x2', svgWidth - padding.right);
  xAxis.setAttribute('y2', svgHeight - padding.bottom);
  xAxis.setAttribute('stroke', 'var(--border)');
  xAxis.setAttribute('stroke-width', '2');
  svg.appendChild(xAxis);
  
  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', padding.left);
  yAxis.setAttribute('y1', padding.top);
  yAxis.setAttribute('x2', padding.left);
  yAxis.setAttribute('y2', svgHeight - padding.bottom);
  yAxis.setAttribute('stroke', 'var(--border)');
  yAxis.setAttribute('stroke-width', '2');
  svg.appendChild(yAxis);
  
  // Draw axis labels
  const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xLabel.setAttribute('x', svgWidth / 2);
  xLabel.setAttribute('y', svgHeight - 5);
  xLabel.setAttribute('text-anchor', 'middle');
  xLabel.setAttribute('fill', 'var(--text)');
  xLabel.setAttribute('font-size', '12px');
  xLabel.setAttribute('font-weight', '600');
  xLabel.textContent = 'Input Data Size';
  svg.appendChild(xLabel);
  
  const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yLabel.setAttribute('x', 25);
  yLabel.setAttribute('y', svgHeight / 2);
  yLabel.setAttribute('text-anchor', 'middle');
  yLabel.setAttribute('fill', 'var(--text)');
  yLabel.setAttribute('font-size', '12px');
  yLabel.setAttribute('font-weight', '600');
  yLabel.setAttribute('transform', `rotate(-90, 25, ${svgHeight / 2})`);
  yLabel.textContent = 'Operations';
  svg.appendChild(yLabel);
  
  // Draw grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (graphHeight / 5) * i;
    const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gridLine.setAttribute('x1', padding.left);
    gridLine.setAttribute('y1', y);
    gridLine.setAttribute('x2', svgWidth - padding.right);
    gridLine.setAttribute('y2', y);
    gridLine.setAttribute('stroke', 'var(--bg-subtle)');
    gridLine.setAttribute('stroke-width', '1');
    gridLine.setAttribute('stroke-dasharray', '2,2');
    svg.appendChild(gridLine);
    
    // Y-axis labels - only show first (0) and last (max) to avoid overlap
    const labelValue = Math.round((maxOps / 5) * (5 - i));
    // Only show label if it's the first (bottom, i === 5) or last (top, i === 0)
    if (i === 0 || i === 5) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', padding.left - 10);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '10px');
      label.textContent = labelValue.toString();
      svg.appendChild(label);
    }
  }
  
  // Draw data points and line
  const points = sizes.map((size, i) => ({
    x: padding.left + (size / sizes[sizes.length - 1]) * graphWidth,
    y: padding.top + graphHeight - (operations[i] / maxOps) * graphHeight
  }));
  
  // Draw line connecting points
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let pathData = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathData += ` L ${points[i].x} ${points[i].y}`;
  }
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', type === 'slow' ? 'var(--danger)' : 'var(--success)');
  path.setAttribute('stroke-width', '3');
  svg.appendChild(path);
  
  // Draw points
  points.forEach((point, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', type === 'slow' ? 'var(--danger)' : 'var(--success)');
    circle.setAttribute('stroke', 'var(--bg)');
    circle.setAttribute('stroke-width', '2');
    
    // Add tooltip
    circle.setAttribute('data-tooltip', `n=${sizes[i]}, ops=${operations[i]}`);
    circle.addEventListener('mouseenter', function(e) {
      showTooltip(e.target, sizes[i], operations[i]);
    });
    circle.addEventListener('mouseleave', function() {
      hideTooltip();
    });
    
    svg.appendChild(circle);
    
    // X-axis labels for some points
    if (i % 3 === 0 || i === sizes.length - 1) {
      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('x', point.x);
      xLabel.setAttribute('y', svgHeight - padding.bottom + 10);
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.setAttribute('fill', 'var(--text-muted)');
      xLabel.setAttribute('font-size', '10px');
      xLabel.textContent = sizes[i];
      svg.appendChild(xLabel);
    }
  });
  
  container.appendChild(svg);
  
  // Add complexity label
  const labelDiv = document.createElement('div');
  labelDiv.style.marginTop = '10px';
  labelDiv.style.textAlign = 'center';
  labelDiv.style.fontSize = '14px';
  labelDiv.style.fontWeight = '600';
  labelDiv.style.color = type === 'slow' ? 'var(--danger)' : 'var(--success)';
  labelDiv.textContent = `Complexity: ${algorithm.complexity}`;
  container.appendChild(labelDiv);
}

function showTooltip(element, size, ops) {
  const tooltip = document.createElement('div');
  tooltip.id = 'complexity-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.background = 'var(--bg)';
  tooltip.style.border = '1px solid var(--border)';
  tooltip.style.borderRadius = '4px';
  tooltip.style.padding = '6px 10px';
  tooltip.style.fontSize = '12px';
  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  tooltip.style.zIndex = '1000';
  tooltip.textContent = `Size: ${size}, Operations: ${ops}`;
  
  document.body.appendChild(tooltip);
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
}

function hideTooltip() {
  const tooltip = document.getElementById('complexity-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

function renderComparisonChart(comparison, size, slowOps, fastOps) {
  const maxOps = Math.max(slowOps, fastOps);
  const slowHeight = (slowOps / maxOps) * 100;
  const fastHeight = (fastOps / maxOps) * 100;
  
  comparisonChart.innerHTML = `
    <h4 style="margin-bottom: 12px; font-size: 16px;">Operation Count Comparison</h4>
    <div style="display: flex; gap: 20px; align-items: flex-end; height: 120px; margin-bottom: 10px;">
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%; height: ${slowHeight}%; background: var(--danger); border-radius: 4px 4px 0 0; margin-bottom: 8px;"></div>
        <div style="font-size: 12px; color: var(--text-muted);">${comparison.slow.name}</div>
        <div style="font-size: 14px; font-weight: 600; color: var(--danger);">${slowOps}</div>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%; height: ${fastHeight}%; background: var(--success); border-radius: 4px 4px 0 0; margin-bottom: 8px;"></div>
        <div style="font-size: 12px; color: var(--text-muted);">${comparison.fast.name}</div>
        <div style="font-size: 14px; font-weight: 600; color: var(--success);">${fastOps}</div>
      </div>
    </div>
    <div style="padding: 10px; background: var(--bg); border-radius: 4px; text-align: center; font-size: 14px;">
      <strong>Speedup:</strong> ${(slowOps / fastOps).toFixed(2)}x faster with ${comparison.fast.name}
    </div>
  `;
}

runComparisonBtn.addEventListener('click', runComparison);
comparisonSelect.addEventListener('change', runComparison);

// Initialize
runComparison();

// ==================== VISUALIZATION TAB ====================

let currentVizView = 'bar-chart'; // Default view

const vizAlgorithms = {
  'bubble-sort': {
    name: 'Bubble Sort',
    complexity: 'O(n²)',
    visualize: (arr, onStep) => {
      const steps = [];
      const copy = [...arr];
      let ops = 0, comparisons = 0, swaps = 0;
      
      for (let i = 0; i < copy.length - 1; i++) {
        for (let j = 0; j < copy.length - 1 - i; j++) {
          comparisons++;
          ops++;
          steps.push({
            array: [...copy],
            current: j,
            comparing: j + 1,
            operations: ops,
            comparisons,
            swaps
          });
          
          if (copy[j] > copy[j + 1]) {
            [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
            swaps++;
            steps.push({
              array: [...copy],
              current: j,
              comparing: j + 1,
              swapped: true,
              operations: ops,
              comparisons,
              swaps
            });
          }
        }
        steps.push({
          array: [...copy],
          sorted: copy.length - 1 - i,
          operations: ops,
          comparisons,
          swaps
        });
      }
      
      return steps;
    }
  },
  'selection-sort': {
    name: 'Selection Sort',
    complexity: 'O(n²)',
    visualize: (arr, onStep) => {
      const steps = [];
      const copy = [...arr];
      let ops = 0, comparisons = 0, swaps = 0;
      
      for (let i = 0; i < copy.length - 1; i++) {
        let minIndex = i;
        for (let j = i + 1; j < copy.length; j++) {
          comparisons++;
          ops++;
          steps.push({
            array: [...copy],
            current: i,
            comparing: j,
            minIndex,
            operations: ops,
            comparisons,
            swaps
          });
          
          if (copy[j] < copy[minIndex]) {
            minIndex = j;
          }
        }
        
        if (minIndex !== i) {
          [copy[i], copy[minIndex]] = [copy[minIndex], copy[i]];
          swaps++;
          ops++;
          steps.push({
            array: [...copy],
            current: i,
            swapped: minIndex,
            operations: ops,
            comparisons,
            swaps
          });
        }
      }
      
      return steps;
    }
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    complexity: 'O(n²)',
    visualize: (arr, onStep) => {
      const steps = [];
      const copy = [...arr];
      let ops = 0, comparisons = 0, swaps = 0;
      
      for (let i = 1; i < copy.length; i++) {
        let key = copy[i];
        let j = i - 1;
        
        while (j >= 0 && copy[j] > key) {
          comparisons++;
          ops++;
          copy[j + 1] = copy[j];
          j--;
          steps.push({
            array: [...copy],
            current: j + 1,
            comparing: j,
            operations: ops,
            comparisons,
            swaps
          });
        }
        
        copy[j + 1] = key;
        swaps++;
        steps.push({
          array: [...copy],
          current: j + 1,
          inserted: true,
          operations: ops,
          comparisons,
          swaps
        });
      }
      
      return steps;
    }
  },
  'linear-search': {
    name: 'Linear Search',
    complexity: 'O(n)',
    visualize: (arr, target) => {
      const steps = [];
      let ops = 0;
      
      for (let i = 0; i < arr.length; i++) {
        ops++;
        steps.push({
          array: [...arr],
          current: i,
          target,
          found: arr[i] === target,
          operations: ops
        });
        if (arr[i] === target) break;
      }
      
      return steps;
    }
  },
  'binary-search': {
    name: 'Binary Search',
    complexity: 'O(log n)',
    visualize: (arr, target) => {
      const steps = [];
      let ops = 0;
      let left = 0, right = arr.length - 1;
      
      while (left <= right) {
        ops++;
        let mid = Math.floor((left + right) / 2);
        steps.push({
          array: [...arr],
          left,
          right,
          mid,
          target,
          found: arr[mid] === target,
          operations: ops
        });
        
        if (arr[mid] === target) break;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
      }
      
      return steps;
    }
  },
  'factorial': {
    name: 'Factorial',
    complexity: 'O(n)',
    visualize: (n, target) => {
      // For factorial, n is passed as a number, not array
      const steps = [];
      const callStack = [];
      const multiplicationChain = [];
      let ops = 0;
      
      function fact(n, depth = 0) {
        ops++;
        callStack.push({ n, depth });
        
        steps.push({
          type: 'recursion',
          algorithm: 'factorial',
          n,
          callStack: [...callStack],
          multiplicationChain: [...multiplicationChain],
          depth,
          current: n,
          operations: ops
        });
        
        if (n === 0 || n === 1) {
          callStack.pop();
          multiplicationChain.push({ value: 1, isBase: true });
          steps.push({
            type: 'recursion',
            algorithm: 'factorial',
            n,
            callStack: [...callStack],
            multiplicationChain: [...multiplicationChain],
            depth,
            baseCase: true,
            returnValue: 1,
            current: n,
            operations: ops
          });
          return 1;
        }
        
        const recursiveResult = fact(n - 1, depth + 1);
        const result = n * recursiveResult;
        callStack.pop();
        multiplicationChain.push({ value: n, result });
        
        steps.push({
          type: 'recursion',
          algorithm: 'factorial',
          n,
          multiplicationChain: [...multiplicationChain],
          callStack: [...callStack],
          depth,
          returnValue: result,
          current: n,
          multiplying: { n, recursiveResult, result },
          operations: ops
        });
        return result;
      }
      
      const result = fact(n);
      steps.push({
        type: 'recursion',
        algorithm: 'factorial',
        n,
        multiplicationChain: [...multiplicationChain],
        callStack: [],
        result,
        final: true,
        operations: ops
      });
      
      return steps;
    }
  },
  'fibonacci': {
    name: 'Fibonacci',
    complexity: 'O(2ⁿ)',
    visualize: (n, target) => {
      // For fibonacci, n is passed as a number, not array
      const steps = [];
      const callStack = [];
      const fibonacciSequence = [0, 1];
      const computedValues = {};
      let ops = 0;
      
      function fib(n, depth = 0) {
        if (n < 0) return 0;
        
        if (computedValues[n] !== undefined) {
          ops++;
          steps.push({
            type: 'recursion',
            algorithm: 'fibonacci',
            n,
            callStack: [...callStack],
            fibonacciSequence: [...fibonacciSequence],
            computedValues: {...computedValues},
            depth,
            current: n,
            cached: true,
            cachedValue: computedValues[n],
            operations: ops
          });
          return computedValues[n];
        }
        
        ops++;
        callStack.push({ n, depth });
        
        steps.push({
          type: 'recursion',
          algorithm: 'fibonacci',
          n,
          callStack: [...callStack],
          fibonacciSequence: [...fibonacciSequence],
          computedValues: {...computedValues},
          depth,
          current: n,
          operations: ops
        });
        
        if (n <= 1) {
          callStack.pop();
          computedValues[n] = n;
          if (n === 1 && fibonacciSequence.length < 2) {
            fibonacciSequence.push(1);
          }
          steps.push({
            type: 'recursion',
            algorithm: 'fibonacci',
            n,
            callStack: [...callStack],
            fibonacciSequence: [...fibonacciSequence],
            computedValues: {...computedValues},
            depth,
            baseCase: true,
            returnValue: n,
            current: n,
            operations: ops
          });
          return n;
        }
        
        const fib1 = fib(n - 1, depth + 1);
        const fib2 = fib(n - 2, depth + 1);
        const result = fib1 + fib2;
        callStack.pop();
        computedValues[n] = result;
        
        while (fibonacciSequence.length <= n) {
          if (fibonacciSequence.length === 2) {
            fibonacciSequence.push(1);
          } else {
            const next = fibonacciSequence[fibonacciSequence.length - 1] + fibonacciSequence[fibonacciSequence.length - 2];
            fibonacciSequence.push(next);
          }
        }
        
        steps.push({
          type: 'recursion',
          algorithm: 'fibonacci',
          n,
          callStack: [...callStack],
          fibonacciSequence: [...fibonacciSequence],
          computedValues: {...computedValues},
          depth,
          returnValue: result,
          current: n,
          adding: { n, fib1, fib2, result },
          operations: ops
        });
        return result;
      }
      
      const result = fib(n);
      steps.push({
        type: 'recursion',
        algorithm: 'fibonacci',
        n,
        callStack: [],
        fibonacciSequence: fibonacciSequence.slice(0, n + 1),
        computedValues: {...computedValues},
        result,
        final: true,
        operations: ops
      });
      
      return steps;
    }
  }
};

let currentVizAlgorithm = null;
let vizSteps = [];
let currentVizStep = 0;
let vizInterval = null;
let vizData = [];
let vizTarget = null;

const vizAlgorithmSelect = document.getElementById('vizAlgorithmSelect');
const vizInputData = document.getElementById('vizInputData');
const vizInputDisplay = document.getElementById('vizInputDisplay');
const generateDataBtn = document.getElementById('generateDataBtn');
const loadVizSampleBtn = document.getElementById('loadVizSampleBtn');
const startVizBtn = document.getElementById('startVizBtn');
const playVizBtn = document.getElementById('playVizBtn');
const pauseVizBtn = document.getElementById('pauseVizBtn');
const stepVizBtn = document.getElementById('stepVizBtn');
const resetVizBtn = document.getElementById('resetVizBtn');
const speedSlider = document.getElementById('speedSlider');
const vizCanvas = document.getElementById('vizCanvas');
const vizStepInfo = document.getElementById('vizStepInfo');
const vizOperations = document.getElementById('vizOperations');
const vizComparisons = document.getElementById('vizComparisons');
const vizSwaps = document.getElementById('vizSwaps');
const vizComplexity = document.getElementById('vizComplexity');

function updateVizInputDisplay() {
  const value = vizInputData.value.trim();
  const algoKey = vizAlgorithmSelect.value;
  
  if (!value) {
    vizInputDisplay.innerHTML = '<p style="color: var(--text-muted);">No input provided. Generate random data or enter your own.</p>';
    return;
  }
  
  // Handle math algorithms (factorial, fibonacci) - single number
  if (algoKey === 'factorial' || algoKey === 'fibonacci') {
    const n = parseInt(value);
    if (isNaN(n) || n < 0) {
      vizInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter a non-negative integer (e.g., 5).</p>';
    } else {
      vizInputDisplay.innerHTML = `<p><strong>n =</strong> ${n}</p>`;
      vizData = n; // Store as number, not array
      vizTarget = null;
    }
    return;
  }
  
  if (value.includes('|')) {
    // Search algorithm with target
    const parts = value.split('|').map(s => s.trim());
    let arr = parts[0].split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    const target = parseInt(parts[1]);
    if (arr.length === 0 || isNaN(target)) {
      vizInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Format: "1,2,3,4,5 | 3"</p>';
    } else {
      // For binary search, ensure array is sorted
      if (algoKey === 'binary-search') {
        const isSorted = arr.every((val, i) => i === 0 || arr[i - 1] <= val);
        if (!isSorted) {
          arr.sort((a, b) => a - b);
          vizInputData.value = `${arr.join(',')} | ${target}`;
          vizInputDisplay.innerHTML = `
            <p><strong>Array:</strong> [${arr.join(', ')}] <span style="color: var(--warning);">(sorted for binary search)</span></p>
            <p><strong>Target:</strong> ${target}</p>
          `;
        } else {
          vizInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
        }
      } else {
        vizInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p><p><strong>Target:</strong> ${target}</p>`;
      }
      vizData = arr;
      vizTarget = target;
    }
  } else {
    // Sort algorithm
    let arr = value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (arr.length === 0) {
      vizInputDisplay.innerHTML = '<p style="color: var(--danger);">Invalid input. Please enter comma-separated numbers.</p>';
    } else {
      vizInputDisplay.innerHTML = `<p><strong>Array:</strong> [${arr.join(', ')}]</p>`;
      vizData = arr;
      vizTarget = null;
    }
  }
}

function generateRandomData() {
  const algoKey = vizAlgorithmSelect.value;
  
  // Handle math algorithms
  if (algoKey === 'factorial') {
    const n = Math.floor(Math.random() * 8) + 1; // 1-8
    vizInputData.value = n.toString();
    vizData = n;
    vizTarget = null;
  } else if (algoKey === 'fibonacci') {
    const n = Math.floor(Math.random() * 7) + 2; // 2-8
    vizInputData.value = n.toString();
    vizData = n;
    vizTarget = null;
  } else {
    // Array-based algorithms
    const size = 8 + Math.floor(Math.random() * 7); // 8-14 elements
    const arr = [];
    
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 100) + 1);
    }
    
    // For binary search, sort the array
    if (algoKey === 'binary-search') {
      arr.sort((a, b) => a - b);
      vizTarget = arr[Math.floor(Math.random() * arr.length)];
      vizInputData.value = `${arr.join(',')} | ${vizTarget}`;
    } else if (algoKey === 'linear-search') {
      vizTarget = arr[Math.floor(Math.random() * arr.length)];
      vizInputData.value = `${arr.join(',')} | ${vizTarget}`;
    } else {
      vizInputData.value = arr.join(',');
      vizTarget = null;
    }
    
    vizData = arr;
  }
  
  updateVizInputDisplay();
  renderVizTabVisualization();
}

function renderVizTabVisualization() {
  const algoKey = vizAlgorithmSelect.value;
  
  // Check if data is valid (array with length > 0 OR number for math algorithms)
  const hasData = Array.isArray(vizData) ? vizData.length > 0 : (typeof vizData === 'number' && vizData >= 0);
  
  if (!hasData) {
    vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Generate data or enter your own to start visualization</p>';
    vizStepInfo.innerHTML = '';
    return;
  }
  
  const algorithm = vizAlgorithms[algoKey];
  if (!algorithm) {
    vizCanvas.innerHTML = '<p style="color: var(--danger); text-align: center; padding: 40px;">Algorithm not found</p>';
    return;
  }
  
  let target = vizTarget;
  
  // For math algorithms, pass the number directly
  if (algoKey === 'factorial' || algoKey === 'fibonacci') {
    vizSteps = algorithm.visualize(vizData, null);
  } else {
    // Array-based algorithms
    // Use provided target or generate one for search algorithms
    if (algorithm.name.includes('Search') && !target && Array.isArray(vizData)) {
      target = vizData[Math.floor(Math.random() * vizData.length)];
      vizTarget = target;
    }
    
    // For binary search, ensure array is sorted
    if (algorithm.name === 'Binary Search' && Array.isArray(vizData)) {
      const sorted = [...vizData].sort((a, b) => a - b);
      if (JSON.stringify(sorted) !== JSON.stringify(vizData)) {
        vizData = sorted;
        if (vizInputData.value.includes('|')) {
          const parts = vizInputData.value.split('|');
          vizInputData.value = `${sorted.join(',')} | ${target}`;
        } else {
          vizInputData.value = sorted.join(',');
        }
        updateVizInputDisplay();
      }
    }
    
    vizSteps = algorithm.visualize([...vizData], target);
  }
  
  currentVizStep = 0;
  vizComplexity.textContent = algorithm.complexity;
  
  // Update view buttons and switch to best view for this algorithm
  updateViewButtonsForAlgorithm(vizAlgorithmSelect.value);
  
  renderVizStep();
}

function renderVizStep() {
  if (currentVizStep >= vizSteps.length) {
    currentVizStep = vizSteps.length - 1;
    return;
  }
  
  const step = vizSteps[currentVizStep];
  const algoKey = vizAlgorithmSelect.value;
  
  // Route to appropriate renderer based on view type
  switch (currentVizView) {
    case 'bar-chart':
      renderBarChartView(step, algoKey);
      break;
    case 'tree':
      renderTreeView(step, algoKey);
      break;
    case 'path':
      renderPathView(step, algoKey);
      break;
    case 'matrix':
      renderMatrixView(step, algoKey);
      break;
    default:
      renderBarChartView(step, algoKey);
  }
  
  updateVizStepInfo(step, algoKey);
}

function updateVizStepInfo(step, algoKey) {
  let stepMessage = '';
  let stepDetails = '';
  
  // Generate step information
  if (algoKey === 'linear-search' || algoKey === 'binary-search') {
    if (step.found) {
      stepMessage = `✓ Found ${step.target} at index ${step.current}`;
      stepDetails = `The target value ${step.target} was found at position ${step.current}.`;
    } else if (step.current !== undefined) {
      if (algoKey === 'linear-search') {
        stepMessage = `Checking index ${step.current}: arr[${step.current}] = ${step.array[step.current]}`;
        stepDetails = `Comparing arr[${step.current}] = ${step.array[step.current]} with target ${step.target}.`;
      } else {
        stepMessage = `Checking middle: arr[${step.mid}] = ${step.array[step.mid]}`;
        stepDetails = `Left=${step.left}, Right=${step.right}, Mid=${step.mid}. Comparing arr[${step.mid}] = ${step.array[step.mid]} with target ${step.target}.`;
      }
    }
  } else if (algoKey.includes('sort')) {
    if (step.swapped || step.swapped === true) {
      stepMessage = `Swapping elements`;
      stepDetails = `Swapped arr[${step.current}] and arr[${step.comparing}].`;
    } else if (step.comparing !== undefined) {
      stepMessage = `Comparing arr[${step.current}] = ${step.array[step.current]} with arr[${step.comparing}] = ${step.array[step.comparing]}`;
      stepDetails = `Comparing elements at positions ${step.current} and ${step.comparing}.`;
    } else if (step.sorted !== undefined) {
      stepMessage = `Sorted portion: [0 to ${step.sorted}]`;
      stepDetails = `Elements from index 0 to ${step.sorted} are now in sorted order.`;
    }
  }
  
  // Update step info
  vizStepInfo.innerHTML = `
    <div class="step-info-content">
      <h4>Step ${currentVizStep + 1} of ${vizSteps.length}</h4>
      <p><strong>${stepMessage}</strong></p>
      ${stepDetails ? `<p style="color: var(--text-muted); margin-top: 8px;">${stepDetails}</p>` : ''}
    </div>
  `;
  
  vizOperations.textContent = step.operations || 0;
  vizComparisons.textContent = step.comparisons || 0;
  vizSwaps.textContent = step.swaps || 0;
}

// Bar Chart Visualization - bars where height = value
function renderBarChartView(step, algoKey) {
  // Handle recursion visualizations
  if (step.type === 'recursion') {
    renderTreeView(step, algoKey); // Fallback to tree view for recursion
    return;
  }
  
  if (!step.array) {
    vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No data available for this step</p>';
    return;
  }
  
  const { array, comparing, swapped, sorted, current, minIndex, keyIndex, keyValue, inserted, shifting, target, left, right, mid, found } = step;
  const maxValue = Math.max(...array);
  const containerHeight = 350;
  const barWidth = Math.max(20, Math.floor((vizCanvas.offsetWidth - 60) / array.length) - 5);
  
  let html = `<div class="viz-container"><div class="viz-title">Bar Chart View</div><div class="bar-chart-container" style="display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: ${containerHeight}px; padding: 20px;">`;
  
  array.forEach((val, i) => {
    const height = (val / maxValue) * (containerHeight - 60);
    let state = 'default';
    let label = '';
    
    if (algoKey === 'linear-search' || algoKey === 'binary-search') {
      if (found && current === i) {
        state = 'found';
        label = 'Found!';
      } else if (current === i || (mid !== undefined && i === mid)) {
        state = 'checking';
        label = algoKey === 'binary-search' ? 'Mid' : 'Checking';
      } else if (target !== undefined && val === target && !found) {
        state = 'target';
        label = 'Target';
      } else if (left !== undefined && right !== undefined) {
        if (i >= left && i <= right) {
          state = 'search-space';
        } else {
          state = 'excluded';
        }
      }
    } else if (algoKey.includes('sort')) {
      if (algoKey === 'bubble-sort') {
        if (sorted !== undefined && i > sorted) {
          state = 'sorted';
        } else if (swapped && (i === current || i === comparing)) {
          state = 'swapped';
        } else if (i === current || i === comparing) {
          state = 'comparing';
        }
      } else if (algoKey === 'selection-sort') {
        if (sorted !== undefined && i <= sorted) {
          state = 'sorted';
        } else if (i === minIndex) {
          state = 'min-candidate';
        } else if (i === current || i === comparing) {
          state = 'comparing';
        } else if (swapped === i) {
          state = 'swapped';
        }
      } else if (algoKey === 'insertion-sort') {
        if (sorted !== undefined && i <= sorted) {
          state = 'sorted';
        } else if (i === keyIndex) {
          state = 'key';
        } else if (shifting === i) {
          state = 'shifting';
        } else if (comparing === i) {
          state = 'comparing';
        } else if (inserted === i) {
          state = 'swapped';
        }
      }
    }
    
    const stateColors = {
      'default': 'var(--border)',
      'comparing': 'var(--warning)',
      'swapped': 'var(--accent)',
      'sorted': 'var(--success)',
      'found': 'var(--success)',
      'checking': 'var(--accent)',
      'target': 'var(--danger)',
      'search-space': 'var(--accent)',
      'excluded': 'var(--text-muted)',
      'min-candidate': 'var(--warning)',
      'key': 'var(--accent)',
      'shifting': 'var(--warning)'
    };
    
    html += `
      <div class="bar-chart-bar" style="
        width: ${barWidth}px;
        height: ${height}px;
        background: ${stateColors[state] || stateColors.default};
        border-radius: 4px 4px 0 0;
        position: relative;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 5px;
        font-size: 12px;
        font-weight: 600;
        color: ${state === 'excluded' ? 'var(--text-muted)' : 'var(--text)'};
        box-shadow: ${state !== 'default' ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'};
      " title="${val} [${i}]">
        <span>${val}</span>
        ${label ? `<span style="font-size: 10px; margin-top: 5px; font-weight: 700;">${label}</span>` : ''}
      </div>
    `;
  });
  
  html += `</div></div>`;
  vizCanvas.innerHTML = html;
}

// Tree View - for recursive algorithms and search trees
function renderTreeView(step, algoKey) {
  // Handle recursion visualization (factorial, fibonacci)
  if (step.type === 'recursion') {
    const { algorithm, n, callStack, depth, baseCase, returnValue, result, multiplicationChain, current, multiplying, final, fibonacciSequence, computedValues, adding, cached, cachedValue } = step;
    
    if (algorithm === 'factorial') {
      renderFactorialTreeView(step);
      return;
    } else if (algorithm === 'fibonacci') {
      renderFibonacciTreeView(step);
      return;
    }
  }
  
  if (algoKey === 'binary-search' && step.array) {
    // Show binary search tree structure
    const { array, left, right, mid, target, found } = step;
    
    if (!array || array.length === 0) {
      vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No data available</p>';
      return;
    }
    
    // Build tree representation
    let html = `<div class="viz-container"><div class="viz-title">Binary Search Tree View</div>`;
    html += `<div class="tree-container" style="padding: 20px; text-align: center;">`;
    
    // Show search space visualization
    if (left !== undefined && right !== undefined && mid !== undefined) {
      const searchSpace = array.slice(left, right + 1);
      const midRelative = mid - left;
      
      html += `<div style="margin-bottom: 20px;">`;
      html += `<div style="font-weight: 600; margin-bottom: 10px;">Search Space: [${left} to ${right}]</div>`;
      html += `<div style="display: flex; justify-content: center; gap: 10px; align-items: center;">`;
      
      searchSpace.forEach((val, idx) => {
        const absoluteIdx = left + idx;
        let state = 'default';
        if (absoluteIdx === mid) {
          state = 'current';
        } else if (absoluteIdx < mid) {
          state = 'left';
        } else {
          state = 'right';
        }
        
        const colors = {
          'current': 'var(--accent)',
          'left': 'var(--text-muted)',
          'right': 'var(--text-muted)'
        };
        
        html += `
          <div style="
            width: 50px;
            height: 50px;
            border: 2px solid ${colors[state]};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${state === 'current' ? colors[state] : 'transparent'};
            color: ${state === 'current' ? 'white' : 'var(--text)'};
            font-weight: 600;
          ">${val}</div>
        `;
      });
      
      html += `</div></div>`;
      
      // Tree structure
      html += `<div style="margin-top: 30px;">`;
      html += `<div style="display: flex; justify-content: center; gap: 40px;">`;
      html += `<div>`;
      html += `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Left</div>`;
      html += `<div style="width: 60px; height: 60px; border: 2px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-subtle);">[${left}, ${mid - 1}]</div>`;
      html += `</div>`;
      
      html += `<div style="display: flex; flex-direction: column; align-items: center;">`;
      html += `<div style="width: 70px; height: 70px; border: 3px solid var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--accent); color: white; font-weight: 700; font-size: 18px;">${array[mid]}</div>`;
      html += `<div style="font-size: 12px; margin-top: 5px; color: var(--text-muted);">Mid</div>`;
      html += `</div>`;
      
      html += `<div>`;
      html += `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">Right</div>`;
      html += `<div style="width: 60px; height: 60px; border: 2px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-subtle);">[${mid + 1}, ${right}]</div>`;
      html += `</div>`;
      html += `</div></div>`;
      
    } else {
      html += `<p>Click "Start Visualization" to see the tree structure</p>`;
    }
    
    html += `</div></div>`;
    vizCanvas.innerHTML = html;
  } else if (algoKey.includes('sort') && step.array) {
    // For sorting, show comparison tree
    renderBarChartView(step, algoKey); // Fallback to bar chart
  } else if (algoKey === 'linear-search' && step.array) {
    // Show linear path
    renderPathView(step, algoKey);
  } else {
    vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Tree view is best for recursive algorithms like Binary Search</p>';
  }
}

// Factorial Recursion Tree Visualization
function renderFactorialTreeView(step) {
  const { n, callStack, depth, baseCase, returnValue, result, multiplicationChain, current, multiplying, final } = step;
  
  const maxN = n;
  
  // Track which calls have returned values
  const returnedValues = {};
  
  // If we're multiplying, the previous call (n-1) has returned
  if (multiplying && multiplying.n) {
    returnedValues[multiplying.n - 1] = multiplying.recursiveResult;
  }
  
  // If base case, mark it as returned
  if (baseCase && n !== undefined) {
    returnedValues[n] = 1;
  }
  
  // Track returned values from multiplication chain
  if (multiplicationChain) {
    multiplicationChain.forEach((item, idx) => {
      if (item.result !== undefined && !item.isBase) {
        // The result is the product up to this point
        // We need to figure out which n this corresponds to
        // It's the first value in the chain that hasn't been multiplied yet
        const chainValues = multiplicationChain.map(m => m.value);
        const itemIndex = chainValues.indexOf(item.value);
        if (itemIndex >= 0) {
          // The returned value corresponds to the item.value
          returnedValues[item.value] = item.result;
        }
      }
    });
  }
  
  // If we have a returnValue in the step, it's for the current n
  if (returnValue !== undefined && current !== undefined) {
    returnedValues[current] = returnValue;
  }
  
  // Build expression expansion showing how n! expands
  function buildExpressionExpansion(level) {
    if (level <= 0) return '';
    const parts = [];
    for (let i = maxN; i > level; i--) {
      parts.push(i);
    }
    if (parts.length > 0) {
      parts.push(`${level}!`);
      return parts.join(' × ');
    }
    return `${level}!`;
  }
  
  // Fix parent container FIRST before rendering
  const vizCanvasParent = vizCanvas.parentElement;
  if (vizCanvasParent && vizCanvasParent.classList.contains('viz-canvas')) {
    vizCanvasParent.style.display = 'block';
    vizCanvasParent.style.alignItems = 'stretch';
    vizCanvasParent.style.justifyContent = 'flex-start';
  }
  
  // Ensure vizCanvas itself takes full width
  vizCanvas.style.width = '100%';
  vizCanvas.style.maxWidth = '100%';
  vizCanvas.style.display = 'block';
  vizCanvas.style.boxSizing = 'border-box';
  vizCanvas.style.margin = '0';
  vizCanvas.style.padding = '0';
  
  let html = `<div style="padding: 24px; width: 100%; box-sizing: border-box; display: block;">`;
  html += `<div style="margin-bottom: 30px; font-size: 24px; font-weight: 700; text-align: center; color: var(--text);">Factorial Recursion Tree: ${n}!</div>`;
  
  // Build tree nodes with connecting lines - calculate first for container sizing
  const startN = maxN || n;
  const nodeHeight = 95;  // Actual node height including padding and content
  const nodeSpacing = 30;  // Increased spacing to prevent overlap
  const requiredHeight = startN * (nodeHeight + nodeSpacing) + 100;
  
  // Two-column layout: Tree on left, Expression Expansion on right
  // Using flexbox with explicit widths to ensure side-by-side layout
  html += `<div style="
    display: flex !important; 
    flex-direction: row !important;
    gap: 30px; 
    margin-bottom: 30px; 
    align-items: flex-start; 
    overflow: hidden; 
    width: 100%; 
    box-sizing: border-box;
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
    padding: 0;
  ">`;
  
  // LEFT COLUMN: Recursion Tree
  // Strict boundaries - exactly 50% minus half gap
  html += `<div id="left-column-recursion-tree" style="
    overflow: hidden;
    width: calc((100% - 30px) / 2) !important;
    flex: 0 0 calc((100% - 30px) / 2) !important;
    min-width: 0;
    max-width: calc((100% - 30px) / 2) !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    position: relative;
  ">`;
  html += `<div style="font-weight: 700; margin-bottom: 20px; font-size: 18px; color: var(--accent); flex-shrink: 0; width: 100%; box-sizing: border-box;">📊 Recursion Tree</div>`;
  html += `<div style="
    position: relative; 
    min-height: ${Math.max(500, requiredHeight)}px; 
    height: ${Math.max(500, requiredHeight)}px; 
    padding: 30px 20px; 
    background: var(--bg-subtle); 
    border-radius: 12px; 
    overflow-x: hidden;
    overflow-y: auto; 
    width: 100%; 
    max-width: 100%;
    box-sizing: border-box;
    transition: height 0.3s ease;
    flex: 1;
  ">`;
  
  // Determine which calls are active/returned
  const activeCalls = new Set();
  if (callStack) {
    callStack.forEach(call => activeCalls.add(call.n));
  }
  if (current !== undefined) {
    activeCalls.add(current);
  }
  
  for (let i = startN; i >= 1; i--) {
    const isCurrent = current === i;
    const isBase = i === 1 || i === 0;
    const isActive = activeCalls.has(i);
    const hasReturned = returnedValues[i] !== undefined || (i === 1 && baseCase);
    const isWaiting = isActive && !hasReturned && !isBase && !isCurrent;
    
    const nodeDepth = startN - i;
    const topPos = nodeDepth * (nodeHeight + nodeSpacing);
    
    // Vertical line connecting to child (except for base case)
    // Must stay within left column boundaries
    if (i > 1) {
      const lineColor = (isCurrent || isActive) ? 'var(--accent)' : 
                       hasReturned ? '#38bdf8' : 'var(--border)';
      // Center the line within the column
      html += `<div style="
        position: absolute;
        left: calc(50% - 1.5px);
        top: ${topPos + nodeHeight - 5}px;
        width: 3px;
        height: ${nodeSpacing + 10}px;
        background: ${lineColor};
        opacity: ${isActive || hasReturned ? '1' : '0.4'};
        z-index: 1;
      "></div>`;
    }
    
    // Node container - positioned relative to left column, cannot exceed boundaries
    html += `<div style="
      position: absolute;
      left: 20px;
      top: ${topPos}px;
      width: calc(100% - 40px);
      max-width: calc(100% - 40px);
      z-index: 5;
      overflow: hidden;
      margin-bottom: ${nodeSpacing}px;
      box-sizing: border-box;
    ">`;
    
      // Connection line to parent (if not root)
      // Lines must stay within column boundaries
      if (i < startN) {
        const lineColor = (isCurrent || isActive) ? 'var(--accent)' : 
                         hasReturned ? '#38bdf8' : 'var(--border)';
        html += `<div style="
          position: absolute;
          left: -20px;
          top: 38px;
          width: 20px;
          height: 3px;
          background: ${lineColor};
          opacity: ${isActive || hasReturned ? '1' : '0.4'};
          z-index: 2;
        "></div>`;
        
        // Add arrow pointing to child (downward direction)
        if (!hasReturned && isActive) {
          html += `<div style="
            position: absolute;
            left: -8px;
            top: 46px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 5px solid var(--accent);
            z-index: 3;
          "></div>`;
        }
        
        // Add arrow pointing to parent (upward direction for returned values)
        if (hasReturned) {
          html += `<div style="
            position: absolute;
            left: -8px;
            top: 30px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 5px solid #38bdf8;
            z-index: 3;
          "></div>`;
        }
      }
    
    // Node box
    let nodeBg = 'var(--bg)';
    let nodeBorder = 'var(--border)';
    let nodeColor = 'var(--text)';
    
    if (isCurrent) {
      nodeBg = 'var(--accent)';
      nodeBorder = 'var(--accent-hover)';
      nodeColor = 'white';
    } else if (isBase && baseCase) {
      nodeBg = 'var(--success)';
      nodeBorder = 'var(--success)';
      nodeColor = 'white';
    } else if (hasReturned) {
      nodeBg = '#e0f2fe';
      nodeBorder = '#38bdf8';
      nodeColor = '#0c4a6e'; // Dark blue for better contrast on light blue background
    } else if (isWaiting) {
      nodeBg = '#fef3c7';
      nodeBorder = '#fbbf24';
      nodeColor = '#78350f'; // Dark amber for better contrast on yellow background
    }
    
    html += `<div style="
      padding: 14px 16px;
      background: ${nodeBg};
      border: 2px solid ${nodeBorder};
      border-radius: 10px;
      color: ${nodeColor};
      text-align: center;
      box-shadow: ${isCurrent ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'};
      position: relative;
      z-index: 10;
      min-height: ${nodeHeight}px;
      width: 100%;
      min-width: 100%;
      max-width: 100%;
      display: block;
      box-sizing: border-box;
      overflow: hidden;
      transition: all 0.3s ease;
    ">`;
    
    // Simple, clear text structure - one line at a time
    html += `<div style="font-size: 18px; font-weight: 700; margin-bottom: 6px; color: ${nodeColor};">factorial(${i})</div>`;
    
    // Show expression
    if (!isBase) {
      const exprOpacity = nodeColor === 'white' ? '1' : '1';
      html += `<div style="font-size: 14px; margin-bottom: 8px; color: ${nodeColor}; opacity: ${exprOpacity}; font-weight: 600;">= ${i} × (${i-1}!)</div>`;
    }
    
    // Separator line only if we have return value
    if (hasReturned || isBase) {
      html += `<div style="border-top: 2px solid ${nodeBorder}; margin: 8px 0; opacity: 0.5;"></div>`;
    }
    
    // Show return value or base case
    if (hasReturned) {
      const retVal = returnedValues[i] !== undefined ? returnedValues[i] : 1;
      html += `<div style="font-size: 16px; margin-bottom: 6px; color: ${nodeColor}; font-weight: 700;">= ${retVal}</div>`;
    } else if (isBase) {
      html += `<div style="font-size: 16px; margin-bottom: 6px; color: ${nodeColor}; font-weight: 700;">= 1</div>`;
    }
    
    // Status indicator
    if (isCurrent) {
      html += `<div style="font-size: 12px; margin-top: 6px; color: ${nodeColor}; font-weight: 600;">▶ Executing</div>`;
    } else if (isWaiting) {
      html += `<div style="font-size: 12px; margin-top: 6px; color: ${nodeColor}; font-weight: 600;">⏳ Waiting</div>`;
    } else if (hasReturned) {
      html += `<div style="font-size: 12px; margin-top: 6px; color: ${nodeColor}; font-weight: 600;">✓ Returned</div>`;
    }
    
    html += `</div></div>`;
  }
  
  // Close tree container div
  html += `</div>`;
  // Close LEFT COLUMN wrapper
  html += `</div>`;
  
  // RIGHT COLUMN: Expression Expansion & Details
  // Strict boundaries - exactly 50% minus half gap
  html += `<div id="right-column-expression" style="
    overflow: hidden;
    width: calc((100% - 30px) / 2) !important;
    flex: 0 0 calc((100% - 30px) / 2) !important;
    min-width: 0;
    max-width: calc((100% - 30px) / 2) !important;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
  ">`;
  html += `<div style="font-weight: 700; margin-bottom: 20px; font-size: 18px; color: var(--accent); flex-shrink: 0;">🔢 Expression Expansion</div>`;
  
  // Expression expansion panel
  html += `<div style="padding: 24px; background: var(--bg-subtle); border-radius: 12px; margin-bottom: 24px; min-height: 200px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; overflow: hidden;">`;
  
  // Determine the current level we're expanding
  let currentLevel = maxN;
  if (current !== undefined) {
    currentLevel = current;
  } else if (callStack && callStack.length > 0) {
    // Get the deepest call (lowest n value)
    const deepestCall = callStack.reduce((min, call) => call.n < min.n ? call : min, callStack[0]);
    currentLevel = deepestCall.n;
  }
  
  // If we're in the multiplication phase, show what we've computed so far
  if (multiplying) {
    // Show the multiplication happening
    html += `<div style="font-size: 18px; font-weight: 700; margin-bottom: 14px; color: var(--accent);">Computing Result:</div>`;
    html += `<div style="font-size: 22px; padding: 16px; background: white; border-radius: 10px; text-align: center; border: 3px solid var(--accent); line-height: 1.4; word-break: break-word; color: #1e293b;">`;
    
    // Build the expression showing what's been computed
    const computedParts = [];
    for (let i = maxN; i > multiplying.n; i--) {
      computedParts.push(i.toString());
    }
    computedParts.push(`${multiplying.n} × ${multiplying.recursiveResult}`);
    html += `${maxN}! = ${computedParts.join(' × ')}`;
    html += `</div>`;
    html += `<div style="font-size: 20px; font-weight: 700; margin-top: 12px; text-align: center; color: var(--accent);">= ${multiplying.result}</div>`;
    
    // If there are more factors to compute
    if (multiplying.n < maxN) {
      const remainingParts = [];
      for (let i = maxN; i >= multiplying.n + 1; i--) {
        remainingParts.push(i.toString());
      }
      html += `<div style="margin-top: 16px; font-size: 15px; color: var(--text); text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; border: 1px solid var(--border);">`;
      html += `Progress: ${remainingParts.length} of ${maxN} factors computed`;
      html += `</div>`;
    }
  } else if (baseCase) {
    // Show fully expanded expression at base case
    html += `<div style="font-size: 19px; font-weight: 700; margin-bottom: 14px; color: var(--success);">Base Case Reached:</div>`;
    html += `<div style="font-size: 20px; padding: 16px; background: white; border-radius: 10px; text-align: center; border: 3px solid var(--success); line-height: 1.4; color: #065f46;">`;
    html += `factorial(1) = 1`;
    html += `</div>`;
    html += `<div style="margin-top: 16px; font-size: 15px; color: var(--text); text-align: center; line-height: 1.5;">Ready to multiply results back up the stack</div>`;
  } else if (currentLevel < maxN || (callStack && callStack.length > 0)) {
    // Show partial expansion during descent
    html += `<div style="font-size: 18px; font-weight: 700; margin-bottom: 14px; color: var(--text);">Current Expression:</div>`;
    html += `<div style="font-size: 22px; padding: 16px; background: white; border-radius: 10px; text-align: center; border: 3px solid var(--accent); line-height: 1.4; word-break: break-word; color: #1e293b; min-height: 60px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">`;
    
    const parts = [];
    // Add factors that have been "expanded" (numbers from maxN down to currentLevel+1)
    for (let i = maxN; i > currentLevel; i--) {
      parts.push(i.toString());
    }
    // Add the current factorial expression
    if (currentLevel >= 1) {
      parts.push(`${currentLevel}!`);
    }
    html += `${maxN}! = ${parts.join(' × ')}`;
    html += `</div>`;
    
    // Show next step hint
    if (currentLevel > 1) {
      html += `<div style="margin-top: 16px; font-size: 15px; color: var(--text); text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 6px; border: 1px solid var(--border); line-height: 1.5;">`;
      html += `↓ Next: expand factorial(${currentLevel})<br>= ${currentLevel} × factorial(${currentLevel - 1})`;
      html += `</div>`;
    }
  } else {
    html += `<div style="font-size: 17px; text-align: center; color: var(--text-muted); padding: 24px; line-height: 1.6;">`;
    html += `Start the visualization to see how ${maxN}! expands step by step`;
    html += `</div>`;
  }
  
  html += `</div>`;
  
  // Current computation
  if (multiplying) {
    html += `<div style="padding: 18px; background: var(--accent); border-radius: 12px; color: white; margin-bottom: 24px; width: 100%; box-sizing: border-box; overflow: hidden;">`;
    html += `<div style="font-weight: 700; margin-bottom: 12px; font-size: 16px;">Currently Computing:</div>`;
    html += `<div style="font-size: 22px; font-weight: 700; text-align: center; line-height: 1.4;">${multiplying.n} × ${multiplying.recursiveResult}</div>`;
    html += `<div style="font-size: 28px; font-weight: 700; text-align: center; margin-top: 10px; border-top: 2px solid rgba(255,255,255,0.4); padding-top: 12px; line-height: 1.3;">= ${multiplying.result}</div>`;
    html += `</div>`;
  }
  
  // Call Stack
  if (callStack && callStack.length > 0) {
    html += `<div style="padding: 18px; background: var(--bg-subtle); border-radius: 12px; transition: all 0.3s ease; width: 100%; box-sizing: border-box; overflow: hidden; position: relative;">`;
    html += `<div style="font-weight: 700; margin-bottom: 14px; font-size: 16px;">📚 Call Stack (${callStack.length}):</div>`;
    html += `<div style="display: flex; flex-direction: column-reverse; gap: 8px; min-height: ${callStack.length * 50}px; width: 100%; overflow: hidden;">`;
    
    [...callStack].reverse().forEach((call, idx) => {
      const isCurrent = callStack.length - 1 - idx === callStack.length - 1;
      html += `<div style="
        padding: 12px 16px;
        background: ${isCurrent ? 'var(--accent)' : 'var(--bg-subtle)'};
        border-left: 5px solid ${isCurrent ? 'var(--accent-hover)' : 'var(--border)'};
        border: ${isCurrent ? '2px solid var(--accent-hover)' : '2px solid var(--border)'};
        border-left-width: 5px;
        border-radius: 6px;
        color: ${isCurrent ? 'white' : 'var(--text)'};
        font-weight: ${isCurrent ? '700' : '600'};
        font-size: 15px;
        line-height: 1.4;
        margin-bottom: 2px;
        width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
        overflow-wrap: break-word;
      ">${call.depth === 0 ? '🔝 ' : '  '}factorial(${call.n})${isCurrent ? ' ← Active' : ''}</div>`;
    });
    
    html += `</div></div>`;
  }
  
  html += `</div>`; // End right column wrapper
  html += `</div>`; // End two-column flex container
  
  // Final result banner - only show when recursion is completely finished
  if (final && result !== undefined) {
    html += `<div style="padding: 16px 20px; background: linear-gradient(135deg, var(--success) 0%, #059669 100%); border-radius: 10px; color: white; text-align: center; margin-top: 20px; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);">`;
    html += `<div style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">✅ ${n}! = ${result}</div>`;
    html += `<div style="font-size: 14px; opacity: 0.95; padding: 6px 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; display: inline-block;">`;
    const numbers = Array.from({length: n}, (_, i) => n - i);
    html += `${numbers.join(' × ')} = ${result}`;
    html += `</div></div>`;
  }
  
  html += `</div>`;
  
  vizCanvas.innerHTML = html;
}

// Fibonacci Recursion Tree Visualization
function renderFibonacciTreeView(step) {
  const { n, callStack, depth, baseCase, returnValue, result, fibonacciSequence, current, adding, final, computedValues, cached, cachedValue } = step;
  
  let html = `<div class="viz-container" style="padding: 20px;">`;
  html += `<div class="viz-title" style="margin-bottom: 20px; font-size: 20px; font-weight: 700;">Fibonacci Recursion Tree: F(${n})</div>`;
  
  // Cached value display
  if (cached) {
    html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--success); border-radius: 8px; color: white; text-align: center;">`;
    html += `<div style="font-size: 18px; font-weight: 700;">Using Cached Value</div>`;
    html += `<div style="font-size: 24px; margin-top: 5px;">F(${n}) = ${cachedValue}</div>`;
    html += `</div>`;
  }
  
  // Base case
  if (baseCase) {
    html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--success); border-radius: 8px; color: white; text-align: center;">`;
    html += `<div style="font-size: 18px; font-weight: 700;">Base Case Reached!</div>`;
    html += `<div style="font-size: 24px; margin-top: 5px;">F(${n}) = ${n}</div>`;
    html += `</div>`;
  }
  
  // Fibonacci sequence display
  if (fibonacciSequence && fibonacciSequence.length > 0) {
    html += `<div style="margin-bottom: 25px; padding: 15px; background: var(--bg-subtle); border-radius: 8px;">`;
    html += `<div style="font-weight: 600; margin-bottom: 10px; font-size: 14px;">Fibonacci Sequence:</div>`;
    html += `<div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">`;
    
    fibonacciSequence.forEach((val, idx) => {
      const isCurrent = current === idx;
      const isBase = idx <= 1;
      html += `<div style="
        padding: 10px 15px;
        border: 2px solid ${isCurrent ? 'var(--accent)' : isBase ? 'var(--success)' : 'var(--border)'};
        border-radius: 6px;
        background: ${isCurrent ? 'var(--accent)' : isBase ? 'var(--success)' : 'transparent'};
        color: ${isCurrent || isBase ? 'white' : 'var(--text)'};
        font-weight: 600;
      ">F(${idx}) = ${val}</div>`;
    });
    
    html += `</div></div>`;
  }
  
  // Current computation
  if (adding) {
    html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--accent); border-radius: 8px; color: white; text-align: center;">`;
    html += `<div style="font-weight: 600; margin-bottom: 5px;">Currently Computing:</div>`;
    html += `<div style="font-size: 20px; font-weight: 700;">F(${adding.n}) = F(${adding.n - 1}) + F(${adding.n - 2})</div>`;
    html += `<div style="font-size: 18px; margin-top: 8px;">= ${adding.fib1} + ${adding.fib2} = ${adding.result}</div>`;
    html += `</div>`;
  }
  
  // Call Stack
  if (callStack && callStack.length > 0) {
    html += `<div style="margin-top: 25px; padding: 15px; background: var(--bg-subtle); border-radius: 8px;">`;
    html += `<div style="font-weight: 600; margin-bottom: 10px; font-size: 14px;">Call Stack (${callStack.length} active calls):</div>`;
    html += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
    
    callStack.forEach((call, idx) => {
      const isCurrent = idx === callStack.length - 1;
      html += `<div style="
        padding: 10px 15px;
        background: ${isCurrent ? 'var(--accent)' : 'var(--bg)'};
        border-left: 4px solid ${isCurrent ? 'var(--accent-hover)' : 'var(--border)'};
        border-radius: 4px;
        color: ${isCurrent ? 'white' : 'var(--text)'};
        font-weight: ${isCurrent ? '700' : '500'};
        margin-left: ${call.depth * 20}px;
      ">fibonacci(${call.n})${isCurrent ? ' ← Currently executing' : ''}</div>`;
    });
    
    html += `</div></div>`;
  }
  
  // Final result
  if (final && result !== undefined) {
    html += `<div style="margin-top: 25px; padding: 20px; background: var(--success); border-radius: 8px; color: white; text-align: center;">`;
    html += `<div style="font-size: 24px; font-weight: 700;">F(${n}) = ${result}</div>`;
    if (computedValues) {
      const uniqueComputations = Object.keys(computedValues).length;
      html += `<div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Computed ${uniqueComputations} unique values using memoization</div>`;
    }
    html += `</div>`;
  }
  
  html += `</div>`;
  vizCanvas.innerHTML = html;
}

// Path View - shows the path through the data structure
function renderPathView(step, algoKey) {
  if (!step.array) {
    vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No data available</p>';
    return;
  }
  
  const { array, current, target, left, right, mid, found, comparing } = step;
  
  let html = `<div class="viz-container"><div class="viz-title">Path View - Algorithm Execution Path</div>`;
  html += `<div class="path-container" style="padding: 30px;">`;
  
  if (algoKey === 'linear-search' || algoKey === 'binary-search') {
    // Show visited path
    html += `<div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">`;
    
    array.forEach((val, i) => {
      let visited = false;
      let currentStep = false;
      
      if (algoKey === 'linear-search') {
        visited = current !== undefined && i < current;
        currentStep = current === i;
      } else {
        // Binary search - show search space
        if (left !== undefined && right !== undefined) {
          visited = i < left || i > right;
          currentStep = i === mid;
        }
      }
      
      const state = found && current === i ? 'found' : 
                   currentStep ? 'current' : 
                   visited ? 'visited' : 
                   'unvisited';
      
      const colors = {
        'found': 'var(--success)',
        'current': 'var(--accent)',
        'visited': 'var(--text-muted)',
        'unvisited': 'var(--border)'
      };
      
      html += `
        <div style="
          position: relative;
          width: 60px;
          height: 60px;
          border: 3px solid ${colors[state]};
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${state === 'current' || state === 'found' ? colors[state] : 'transparent'};
          color: ${state === 'current' || state === 'found' ? 'white' : 'var(--text)'};
          font-weight: 600;
        ">
          <span>${val}</span>
          <span style="font-size: 10px; opacity: 0.8;">[${i}]</span>
        </div>
      `;
      
      // Add arrow between elements (except last)
      if (i < array.length - 1) {
        const arrowColor = state === 'current' || state === 'found' ? 'var(--accent)' : 
                          visited ? 'var(--text-muted)' : 'var(--border)';
        html += `<div style="
          width: 0;
          height: 0;
          border-left: 15px solid ${arrowColor};
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          align-self: center;
          margin: 0 -5px;
        "></div>`;
      }
    });
    
    html += `</div>`;
    
    // Legend
    html += `<div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; font-size: 12px;">`;
    html += `<span>🔵 <strong>Current</strong></span>`;
    html += `<span style="color: var(--text-muted);">⚪ Visited</span>`;
    html += `<span style="color: var(--border);">⚪ Unvisited</span>`;
    if (found) html += `<span style="color: var(--success);">✅ Found</span>`;
    html += `</div>`;
    
  } else {
    // For sorting, show comparison path
    renderBarChartView(step, algoKey);
  }
  
  html += `</div></div>`;
  vizCanvas.innerHTML = html;
}

// Matrix View - comparison matrix
function renderMatrixView(step, algoKey) {
  if (!step.array || algoKey === 'linear-search' || algoKey === 'binary-search') {
    // Matrix view works best for sorting algorithms
    renderBarChartView(step, algoKey);
    return;
  }
  
  const { array, comparing, current, minIndex, keyIndex } = step;
  const n = array.length;
  
  let html = `<div class="viz-container"><div class="viz-title">Comparison Matrix View</div>`;
  html += `<div class="matrix-container" style="padding: 20px; overflow-x: auto;">`;
  html += `<table style="border-collapse: collapse; margin: 0 auto; font-size: 14px;">`;
  
  // Header row
  html += `<tr><th style="padding: 10px; background: var(--bg-subtle);"></th>`;
  array.forEach((_, i) => {
    html += `<th style="padding: 10px; background: var(--bg-subtle); min-width: 50px; border: 1px solid var(--border);">[${i}]</th>`;
  });
  html += `</tr>`;
  
  // Data rows
  array.forEach((val, i) => {
    html += `<tr>`;
    html += `<th style="padding: 10px; background: var(--bg-subtle); border: 1px solid var(--border);">[${i}] = ${val}</th>`;
    
    array.forEach((val2, j) => {
      let cellClass = '';
      let cellContent = '';
      
      if (i === j) {
        cellClass = 'diagonal';
        cellContent = '—';
      } else if (algoKey === 'bubble-sort' && ((i === current && j === comparing) || (i === comparing && j === current))) {
        cellClass = 'comparing';
        cellContent = val > val2 ? '>' : '<';
      } else if (algoKey === 'selection-sort' && i === current && j === comparing) {
        cellClass = 'comparing';
        cellContent = val > val2 ? '>' : '<';
      } else if (algoKey === 'insertion-sort' && (i === keyIndex || j === keyIndex) && comparing !== undefined) {
        if ((i === keyIndex && j === comparing) || (i === comparing && j === keyIndex)) {
          cellClass = 'comparing';
          cellContent = val > val2 ? '>' : '<';
        }
      }
      
      const colors = {
        'comparing': 'var(--warning)',
        'diagonal': 'var(--bg-subtle)'
      };
      
      html += `<td style="
        padding: 10px;
        text-align: center;
        border: 1px solid var(--border);
        background: ${colors[cellClass] || 'transparent'};
        font-weight: ${cellClass ? '700' : '400'};
      ">${cellContent || ''}</td>`;
    });
    
    html += `</tr>`;
  });
  
  html += `</table>`;
  html += `<div style="margin-top: 15px; text-align: center; font-size: 12px; color: var(--text-muted);">`;
  html += `<span>🔶 Comparing | </span>`;
  html += `<span>— Diagonal (same element) | </span>`;
  html += `<span>Empty = Not compared</span>`;
  html += `</div>`;
  html += `</div></div>`;
  
  vizCanvas.innerHTML = html;
}

// Original box-based view (kept for reference, but we'll use bar chart as default)
if (false) {
  if (algoKey === 'linear-search' || algoKey === 'binary-search') {
    const { array, current, target, left, right, mid, found } = step;
    
    vizCanvas.innerHTML = `
      <div class="viz-container">
        <div class="viz-title">Array Elements</div>
        <div class="viz-boxes">
          ${array.map((val, i) => {
            let state = 'default';
            let label = '';
            
            if (found && current === i) {
              state = 'found';
              label = 'Found!';
            } else if (current === i) {
              state = 'checking';
              label = 'Checking';
            } else if (current !== undefined && i < current) {
              state = 'checked';
              label = 'Checked';
            } else if (target !== undefined && val === target && !found) {
              state = 'target';
              label = 'Target';
            }
            
            // Binary search specific
            if (left !== undefined && right !== undefined) {
              if (i === mid) {
                state = 'checking';
                label = 'Mid';
              } else if (i >= left && i <= right) {
                if (state === 'default' || state === 'target') {
                  state = state === 'target' ? 'target' : 'search-space';
                  if (state === 'search-space') label = 'Search Space';
                }
              } else {
                state = 'excluded';
                label = 'Excluded';
              }
    }
    
    return `
              <div class="viz-box ${state}" data-index="${i}" data-value="${val}">
                <div class="box-value">${val}</div>
                <div class="box-index">[${i}]</div>
                ${label ? `<div class="box-label">${label}</div>` : ''}
      </div>
    `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    const { array, comparing, swapped, sorted, current, minIndex, keyIndex, keyValue, inserted, shifting } = step;
    
    vizCanvas.innerHTML = `
      <div class="viz-container">
        <div class="viz-title">Array Elements</div>
        ${algoKey === 'selection-sort' && sorted !== undefined ? `<div class="viz-info">Sorted portion: [0 to ${sorted}] | Unsorted: [${sorted + 1} to ${array.length - 1}]</div>` : ''}
        ${algoKey === 'insertion-sort' && keyValue !== undefined ? `<div class="viz-info">Key: ${keyValue} | Inserting into sorted portion</div>` : ''}
        <div class="viz-boxes">
          ${array.map((val, i) => {
            let state = 'default';
            let label = '';
            
            if (algoKey === 'bubble-sort') {
              if (sorted !== undefined && i > sorted) {
                state = 'sorted';
                label = 'Sorted';
              } else if (swapped && (i === current || i === comparing)) {
                state = 'swapped';
                label = 'Swapped';
              } else if (i === current || i === comparing) {
                state = 'comparing';
                label = 'Comparing';
              }
            } else if (algoKey === 'selection-sort') {
              if (sorted !== undefined && i <= sorted) {
                state = 'sorted';
                label = 'Sorted';
              } else if (i === minIndex) {
                state = 'min-candidate';
                label = 'Min';
              } else if (i === current) {
                state = 'comparing';
                label = 'Current';
              } else if (comparing === i) {
                state = 'comparing';
                label = 'Comparing';
              } else if (swapped === i) {
                state = 'swapped';
                label = 'Swapped';
              }
            } else if (algoKey === 'insertion-sort') {
              if (sorted !== undefined && i <= sorted) {
                state = 'sorted';
                label = 'Sorted';
              } else if (keyIndex !== undefined && i === keyIndex) {
                state = 'key';
                label = 'Key';
              } else if (shifting === i) {
                state = 'shifting';
                label = 'Shifting';
              } else if (comparing === i) {
                state = 'comparing';
                label = 'Comparing';
              } else if (inserted === i) {
                state = 'swapped';
                label = 'Inserted';
              }
            }
            
            return `
              <div class="viz-box ${state}" data-index="${i}" data-value="${val}">
                <div class="box-value">${val}</div>
                <div class="box-index">[${i}]</div>
                ${label ? `<div class="box-label">${label}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  // Update step info
  vizStepInfo.innerHTML = `
    <div class="step-info-content">
      <h4>Step ${currentVizStep + 1} of ${vizSteps.length}</h4>
      <p><strong>${stepMessage}</strong></p>
      ${stepDetails ? `<p style="color: var(--text-muted); margin-top: 8px;">${stepDetails}</p>` : ''}
    </div>
  `;
  
  vizOperations.textContent = step.operations || 0;
  vizComparisons.textContent = step.comparisons || 0;
  vizSwaps.textContent = step.swaps || 0;
}

function playVisualization() {
  if (vizInterval) return;
  
  const speed = parseInt(speedSlider.value);
  const delay = 1100 - (speed * 100);
  
  vizInterval = setInterval(() => {
    currentVizStep++;
    if (currentVizStep >= vizSteps.length) {
      pauseVisualization();
      return;
    }
    renderVizStep();
  }, delay);
}

function pauseVisualization() {
  if (vizInterval) {
    clearInterval(vizInterval);
    vizInterval = null;
  }
}

function stepVisualization() {
  pauseVisualization();
  currentVizStep++;
  if (currentVizStep >= vizSteps.length) {
    currentVizStep = vizSteps.length - 1;
  }
  renderVizStep();
}

function resetVisualization() {
  pauseVisualization();
  currentVizStep = 0;
  renderVizStep();
}

// Sample data for each algorithm
const vizSamples = {
  'bubble-sort': { arr: [64, 34, 25, 12, 22, 11, 90] },
  'selection-sort': { arr: [64, 25, 12, 22, 11] },
  'insertion-sort': { arr: [64, 34, 25, 12, 22, 11, 90] },
  'linear-search': { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 7 },
  'binary-search': { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], target: 7 },
  'factorial': { n: 5 },
  'fibonacci': { n: 6 }
};

vizInputData.addEventListener('input', updateVizInputDisplay);

vizInputData.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const hasData = Array.isArray(vizData) ? vizData.length > 0 : (typeof vizData === 'number' && vizData >= 0);
    if (hasData) {
      renderVizTabVisualization();
    }
  }
});

generateDataBtn.addEventListener('click', generateRandomData);

loadVizSampleBtn.addEventListener('click', () => {
  const algoKey = vizAlgorithmSelect.value;
  const sample = vizSamples[algoKey];
  if (sample) {
    if (sample.n !== undefined) {
      // Math algorithm
      vizInputData.value = sample.n.toString();
      vizData = sample.n;
      vizTarget = null;
    } else if (sample.target !== undefined) {
      // Search algorithm
      vizInputData.value = `${sample.arr.join(',')} | ${sample.target}`;
      vizTarget = sample.target;
      vizData = sample.arr;
    } else {
      // Sort algorithm
      vizInputData.value = sample.arr.join(',');
      vizTarget = null;
      vizData = sample.arr;
    }
    updateVizInputDisplay();
    renderVizTabVisualization();
  }
});

startVizBtn.addEventListener('click', () => {
  if (vizData.length > 0) {
    renderVizTabVisualization();
  } else {
    alert('Please enter data or generate random data first.');
  }
});

playVizBtn.addEventListener('click', playVisualization);
pauseVizBtn.addEventListener('click', pauseVisualization);
stepVizBtn.addEventListener('click', stepVisualization);
resetVizBtn.addEventListener('click', resetVisualization);

// Algorithm to best view mapping
const algorithmBestViews = {
  'binary-search': 'tree',
  'linear-search': 'path',
  'bubble-sort': 'bar-chart',
  'selection-sort': 'bar-chart',
  'insertion-sort': 'bar-chart',
  'factorial': 'tree',
  'fibonacci': 'tree'
};

// Algorithm to available views mapping
const algorithmAvailableViews = {
  'binary-search': ['tree', 'path', 'bar-chart'],
  'linear-search': ['path', 'bar-chart'],
  'bubble-sort': ['bar-chart', 'matrix'],
  'selection-sort': ['bar-chart', 'matrix'],
  'insertion-sort': ['bar-chart', 'matrix'],
  'factorial': ['tree', 'bar-chart'],
  'fibonacci': ['tree', 'bar-chart']
};

function updateViewButtonsForAlgorithm(algoKey) {
  const availableViews = algorithmAvailableViews[algoKey] || ['bar-chart', 'tree', 'path', 'matrix'];
  const bestView = algorithmBestViews[algoKey] || 'bar-chart';
  
  // Update which buttons are visible
  document.querySelectorAll('.view-btn').forEach(btn => {
    const viewType = btn.dataset.view;
    if (availableViews.includes(viewType)) {
      btn.style.display = 'inline-block';
    } else {
      btn.style.display = 'none';
    }
  });
  
  // Switch to best view
  currentVizView = bestView;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === bestView);
  });
  
  // Re-render if we have steps
  if (vizSteps.length > 0 && currentVizStep < vizSteps.length) {
    renderVizStep();
  }
}

vizAlgorithmSelect.addEventListener('change', () => {
  pauseVisualization();
  vizData = [];
  vizTarget = null;
  vizInputData.value = '';
  updateVizInputDisplay();
  vizCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Select algorithm and generate/enter data to start</p>';
  vizStepInfo.innerHTML = '';
  
  // Update view buttons and switch to best view for this algorithm
  updateViewButtonsForAlgorithm(vizAlgorithmSelect.value);
});

speedSlider.addEventListener('input', () => {
  if (vizInterval) {
    pauseVisualization();
    playVisualization();
  }
});

// View selector event listeners
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Only allow clicking if button is visible (not hidden)
    if (btn.style.display === 'none') return;
    
    // Remove active class from all buttons
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');
    // Update current view
    currentVizView = btn.dataset.view;
    // Re-render current step with new view
    if (vizSteps.length > 0 && currentVizStep < vizSteps.length) {
      renderVizStep();
    }
  });
});

// Initialize visualization tab
// Set up initial view buttons for default algorithm
if (vizAlgorithmSelect) {
  updateViewButtonsForAlgorithm(vizAlgorithmSelect.value);
}
generateRandomData();

// ==================== CODE TAB ====================

// codeAlgorithmSelect is already declared in the CODE TAB STATE section above

// This function is no longer needed as Code tab now has interactive code editor
// Keeping for potential future use
function renderCodeForReference(code) {
  // Apply Python syntax highlighting
  let highlighted = code
    // Keywords
    .replace(/\b(def|return|if|elif|else|for|while|in|range|len|and|or|not|True|False|None)\b/g, '<span class="py-keyword">$1</span>')
    // Comments
    .replace(/#.*$/gm, '<span class="py-comment">$&</span>')
    // Docstrings
    .replace(/""".*?"""/gs, '<span class="py-string">$&</span>')
    // Strings
    .replace(/('.*?'|".*?")/g, '<span class="py-string">$1</span>');
  
  // Split into lines and wrap each line
  const lines = highlighted.split('\n');
  return lines.map((line, i) => {
    const lineNum = (i + 1).toString().padStart(3, ' ');
    return `<div class="code-line">${lineNum} | ${line || ' '}</div>`;
  }).join('\n');
}

// Code tab algorithm selection is handled by loadCodeAlgorithm function
// which is called when the tab is initialized


