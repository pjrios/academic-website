// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'logic-systems';
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

// ==================== INDEXEDDB SETUP ====================

const DB_NAME = 'LogicSystemsDB';
const DB_VERSION = 1;
const STORE_NAME = 'progress';

let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function saveProgress(key, data) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function loadProgress(key) {
  if (!db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Initialize DB
initDB().catch(console.error);

// Progress tracking
let progressData = {
  gates: { explored: false, circuitsCreated: 0 },
  sensors: { explored: false, rulesCreated: 0 },
  binary: { explored: false, conversionsDone: 0 },
  sessions: 0
};

// ==================== LOGIC GATES TAB ====================

const gateBtns = document.querySelectorAll('.gate-btn');
const gatesCanvas = document.getElementById('gatesCanvas');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const saveCircuitBtn = document.getElementById('saveCircuitBtn');
const loadCircuitBtn = document.getElementById('loadCircuitBtn');
const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const truthTableContainer = document.getElementById('truthTableContainer');
const gateInfoSection = document.getElementById('gateInfoSection');

let gates = [];
let selectedGate = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

const gateInfo = {
  AND: {
    description: 'Output is HIGH (1) only when ALL inputs are HIGH (1).',
    symbol: 'AND',
    truthTable: [
      { A: 0, B: 0, Output: 0 },
      { A: 0, B: 1, Output: 0 },
      { A: 1, B: 0, Output: 0 },
      { A: 1, B: 1, Output: 1 }
    ]
  },
  OR: {
    description: 'Output is HIGH (1) when ANY input is HIGH (1).',
    symbol: 'OR',
    truthTable: [
      { A: 0, B: 0, Output: 0 },
      { A: 0, B: 1, Output: 1 },
      { A: 1, B: 0, Output: 1 },
      { A: 1, B: 1, Output: 1 }
    ]
  },
  NOT: {
    description: 'Output is the OPPOSITE of the input (inverter).',
    symbol: 'NOT',
    truthTable: [
      { Input: 0, Output: 1 },
      { Input: 1, Output: 0 }
    ]
  },
  NAND: {
    description: 'NOT AND - Output is LOW (0) only when ALL inputs are HIGH (1).',
    symbol: 'NAND',
    truthTable: [
      { A: 0, B: 0, Output: 1 },
      { A: 0, B: 1, Output: 1 },
      { A: 1, B: 0, Output: 1 },
      { A: 1, B: 1, Output: 0 }
    ]
  },
  NOR: {
    description: 'NOT OR - Output is LOW (0) when ANY input is HIGH (1).',
    symbol: 'NOR',
    truthTable: [
      { A: 0, B: 0, Output: 1 },
      { A: 0, B: 1, Output: 0 },
      { A: 1, B: 0, Output: 0 },
      { A: 1, B: 1, Output: 0 }
    ]
  },
  XOR: {
    description: 'Exclusive OR - Output is HIGH (1) when inputs are DIFFERENT.',
    symbol: 'XOR',
    truthTable: [
      { A: 0, B: 0, Output: 0 },
      { A: 0, B: 1, Output: 1 },
      { A: 1, B: 0, Output: 1 },
      { A: 1, B: 1, Output: 0 }
    ]
  },
  XNOR: {
    description: 'Exclusive NOR - Output is HIGH (1) when inputs are SAME.',
    symbol: 'XNOR',
    truthTable: [
      { A: 0, B: 0, Output: 1 },
      { A: 0, B: 1, Output: 0 },
      { A: 1, B: 0, Output: 0 },
      { A: 1, B: 1, Output: 1 }
    ]
  }
};

function evaluateGate(gateType, inputA, inputB) {
  const a = inputA ? 1 : 0;
  const b = inputB ? 1 : 0;
  
  switch(gateType) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'NOT': return !inputA ? 1 : 0;
    case 'NAND': return !(a && b) ? 1 : 0;
    case 'NOR': return !(a || b) ? 1 : 0;
    case 'XOR': return (a !== b) ? 1 : 0;
    case 'XNOR': return (a === b) ? 1 : 0;
    default: return 0;
  }
}

function createGateElement(gateType) {
  const gate = {
    id: Date.now(),
    type: gateType,
    x: Math.random() * 300 + 50,
    y: Math.random() * 200 + 50
  };
  gates.push(gate);
  renderGates();
  updateTruthTable();
  progressData.gates.explored = true;
  progressData.gates.circuitsCreated++;
  saveProgress('main', progressData);
}

function renderGates() {
  const a = inputA.checked;
  const b = inputB.checked;
  
  gatesCanvas.innerHTML = gates.map(gate => {
    const output = evaluateGate(gate.type, a, b);
    const isBinary = gate.type === 'NOT';
    
    return `
      <div class="gate-element ${gate.type} ${selectedGate?.id === gate.id ? 'selected' : ''}" 
           style="position: absolute; left: ${gate.x}px; top: ${gate.y}px;"
           data-gate-id="${gate.id}"
           onclick="selectGate(${gate.id})">
        <div style="font-weight: 600; margin-bottom: 8px;">${gate.type}</div>
        ${!isBinary ? `
          <div class="gate-inputs">
            <div class="gate-input ${a ? 'high' : 'low'}">A</div>
            <div class="gate-input ${b ? 'high' : 'low'}">B</div>
          </div>
        ` : `
          <div class="gate-inputs">
            <div class="gate-input ${a ? 'high' : 'low'}">IN</div>
          </div>
        `}
        <div class="gate-output ${output ? 'high' : 'low'}">OUT</div>
      </div>
    `;
  }).join('');
  
  // Add drag functionality
  gatesCanvas.querySelectorAll('.gate-element').forEach(element => {
    element.addEventListener('mousedown', (e) => {
      const gateId = parseInt(element.dataset.gateId);
      const gate = gates.find(g => g.id === gateId);
      if (gate) {
        selectedGate = gate;
        isDragging = true;
        const rect = element.getBoundingClientRect();
        const canvasRect = gatesCanvas.getBoundingClientRect();
        dragOffset.x = e.clientX - (gate.x + canvasRect.left);
        dragOffset.y = e.clientY - (gate.y + canvasRect.top);
        renderGates();
      }
    });
  });
}

gatesCanvas.addEventListener('mousemove', (e) => {
  if (isDragging && selectedGate) {
    const canvasRect = gatesCanvas.getBoundingClientRect();
    selectedGate.x = e.clientX - canvasRect.left - dragOffset.x;
    selectedGate.y = e.clientY - canvasRect.top - dragOffset.y;
    renderGates();
  }
});

gatesCanvas.addEventListener('mouseup', () => {
  isDragging = false;
});

gatesCanvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

window.selectGate = function(id) {
  selectedGate = gates.find(g => g.id === id);
  renderGates();
  updateGateInfo();
};

function updateGateInfo() {
  if (!selectedGate) {
    gateInfoSection.innerHTML = '<p style="color: var(--text-muted);">Select a gate to view information</p>';
    return;
  }
  
  const info = gateInfo[selectedGate.type];
  if (!info) return;
  
  const a = inputA.checked;
  const b = inputB.checked;
  const output = evaluateGate(selectedGate.type, a, b);
  
  gateInfoSection.innerHTML = `
    <h4>${selectedGate.type} Gate</h4>
    <p>${info.description}</p>
    <p style="margin-top: 15px;"><strong>Current Output:</strong> <span style="color: ${output ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">${output ? 'HIGH (1)' : 'LOW (0)'}</span></p>
  `;
}

function updateTruthTable() {
  if (gates.length === 0) {
    truthTableContainer.innerHTML = '<p style="color: var(--text-muted);">Add gates to see truth tables</p>';
    return;
  }
  
  // Show truth table for first gate (or selected gate)
  const gate = selectedGate || gates[0];
  const info = gateInfo[gate.type];
  if (!info) return;
  
  const isBinary = gate.type === 'NOT';
  
  if (isBinary) {
    truthTableContainer.innerHTML = `
      <table class="truth-table">
        <thead>
          <tr>
            <th>Input</th>
            <th>${gate.type} Output</th>
          </tr>
        </thead>
        <tbody>
          ${info.truthTable.map(row => `
            <tr>
              <td>${row.Input}</td>
              <td>${row.Output}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    truthTableContainer.innerHTML = `
      <table class="truth-table">
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th>${gate.type} Output</th>
          </tr>
        </thead>
        <tbody>
          ${info.truthTable.map(row => `
            <tr>
              <td>${row.A}</td>
              <td>${row.B}</td>
              <td>${row.Output}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

gateBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    createGateElement(btn.dataset.gate);
  });
});

inputA.addEventListener('change', () => {
  renderGates();
  updateGateInfo();
  updateTruthTable();
});

inputB.addEventListener('change', () => {
  renderGates();
  updateGateInfo();
  updateTruthTable();
});

clearCanvasBtn.addEventListener('click', () => {
  gates = [];
  selectedGate = null;
  renderGates();
  updateTruthTable();
  gateInfoSection.innerHTML = '';
});

saveCircuitBtn.addEventListener('click', () => {
  saveProgress('circuit', gates);
  showNotification('Circuit saved!', 'success');
});

loadCircuitBtn.addEventListener('click', () => {
  loadProgress('circuit').then(savedGates => {
    if (savedGates) {
      gates = savedGates;
      renderGates();
      updateTruthTable();
      showNotification('Circuit loaded!', 'success');
    }
  });
});

// Initialize
updateTruthTable();

// ==================== SENSORS TAB ====================

const sensorList = document.getElementById('sensorList');
const addSensorBtn = document.getElementById('addSensorBtn');
const rulesList = document.getElementById('rulesList');
const addRuleBtn = document.getElementById('addRuleBtn');
const outputList = document.getElementById('outputList');
const runSimulationBtn = document.getElementById('runSimulationBtn');
const stepSimulationBtn = document.getElementById('stepSimulationBtn');
const resetSimulationBtn = document.getElementById('resetSimulationBtn');
const simulationOutput = document.getElementById('simulationOutput');

let sensors = [];
let rules = [];
let outputs = [];

function addSensor() {
  const sensor = {
    id: Date.now(),
    name: `Sensor ${sensors.length + 1}`,
    value: false
  };
  sensors.push(sensor);
  renderSensors();
  progressData.sensors.explored = true;
  saveProgress('main', progressData);
}

function renderSensors() {
  sensorList.innerHTML = sensors.map(sensor => `
    <div class="sensor-item">
      <div style="display: flex; align-items: center; gap: 10px;">
        <input type="checkbox" ${sensor.value ? 'checked' : ''} 
               onchange="updateSensor(${sensor.id}, this.checked)">
        <input type="text" value="${sensor.name}" 
               onchange="renameSensor(${sensor.id}, this.value)"
               style="flex: 1;">
      </div>
      <button class="btn-secondary" onclick="removeSensor(${sensor.id})" style="padding: 6px 12px; font-size: 12px;">Remove</button>
    </div>
  `).join('');
}

window.updateSensor = function(id, value) {
  const sensor = sensors.find(s => s.id === id);
  if (sensor) {
    sensor.value = value;
  }
};

window.renameSensor = function(id, name) {
  const sensor = sensors.find(s => s.id === id);
  if (sensor) {
    sensor.name = name;
  }
};

window.removeSensor = function(id) {
  sensors = sensors.filter(s => s.id !== id);
  rules = rules.filter(r => r.sensorId !== id);
  renderSensors();
  renderRules();
  renderOutputs();
};

function addRule() {
  if (sensors.length === 0) {
    alert('Add at least one sensor first!');
    return;
  }
  
  const rule = {
    id: Date.now(),
    sensorId: sensors[0].id,
    condition: '>',
    threshold: 50,
    output: 'Output 1',
    action: 'ON'
  };
  rules.push(rule);
  renderRules();
  progressData.sensors.rulesCreated++;
  saveProgress('main', progressData);
}

function renderRules() {
  rulesList.innerHTML = rules.map((rule, index) => {
    const sensor = sensors.find(s => s.id === rule.sensorId);
    return `
      <div class="rule-item">
        <div style="display: flex; gap: 10px; align-items: center; flex: 1;">
          <span>IF</span>
          <select onchange="updateRule(${rule.id}, 'sensorId', parseInt(this.value))">
            ${sensors.map(s => `<option value="${s.id}" ${s.id === rule.sensorId ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
          <select onchange="updateRule(${rule.id}, 'condition', this.value)">
            <option value=">" ${rule.condition === '>' ? 'selected' : ''}>></option>
            <option value="<" ${rule.condition === '<' ? 'selected' : ''}><</option>
            <option value="==" ${rule.condition === '==' ? 'selected' : ''}>=</option>
            <option value="ON" ${rule.condition === 'ON' ? 'selected' : ''}>ON</option>
            <option value="OFF" ${rule.condition === 'OFF' ? 'selected' : ''}>OFF</option>
          </select>
          ${rule.condition !== 'ON' && rule.condition !== 'OFF' ? `
            <input type="number" value="${rule.threshold}" 
                   onchange="updateRule(${rule.id}, 'threshold', parseInt(this.value))"
                   style="width: 80px;">
          ` : ''}
          <span>THEN</span>
          <input type="text" value="${rule.output}" 
                 onchange="updateRule(${rule.id}, 'output', this.value)"
                 style="flex: 1;">
          <select onchange="updateRule(${rule.id}, 'action', this.value)">
            <option value="ON" ${rule.action === 'ON' ? 'selected' : ''}>ON</option>
            <option value="OFF" ${rule.action === 'OFF' ? 'selected' : ''}>OFF</option>
          </select>
        </div>
        <button class="btn-secondary" onclick="removeRule(${rule.id})" style="padding: 6px 12px; font-size: 12px;">Remove</button>
      </div>
    `;
  }).join('');
  
  updateOutputs();
}

window.updateRule = function(id, field, value) {
  const rule = rules.find(r => r.id === id);
  if (rule) {
    rule[field] = value;
    renderRules();
  }
};

window.removeRule = function(id) {
  rules = rules.filter(r => r.id !== id);
  renderRules();
};

function updateOutputs() {
  const uniqueOutputs = [...new Set(rules.map(r => r.output))];
  outputs = uniqueOutputs.map(name => ({ name, active: false }));
  renderOutputs();
}

function renderOutputs() {
  outputList.innerHTML = outputs.map(output => `
    <div class="output-item ${output.active ? 'active' : ''}">
      <span><strong>${output.name}</strong></span>
      <span style="color: ${output.active ? 'var(--success)' : 'var(--text-muted)'};">
        ${output.active ? 'ON' : 'OFF'}
      </span>
    </div>
  `).join('');
}

function runSimulation() {
  simulationOutput.innerHTML = 'Running simulation...\n\n';
  
  // Reset outputs
  outputs.forEach(output => output.active = false);
  
  // Evaluate rules
  rules.forEach(rule => {
    const sensor = sensors.find(s => s.id === rule.sensorId);
    if (!sensor) return;
    
    let conditionMet = false;
    
    if (rule.condition === 'ON') {
      conditionMet = sensor.value === true;
    } else if (rule.condition === 'OFF') {
      conditionMet = sensor.value === false;
    } else if (rule.condition === '>') {
      conditionMet = (sensor.value ? 100 : 0) > rule.threshold;
    } else if (rule.condition === '<') {
      conditionMet = (sensor.value ? 100 : 0) < rule.threshold;
    } else if (rule.condition === '==') {
      conditionMet = (sensor.value ? 100 : 0) === rule.threshold;
    }
    
    if (conditionMet) {
      const output = outputs.find(o => o.name === rule.output);
      if (output) {
        output.active = rule.action === 'ON';
      }
      simulationOutput.innerHTML += `Rule: IF ${sensor.name} ${rule.condition} ${rule.condition !== 'ON' && rule.condition !== 'OFF' ? rule.threshold : ''} THEN ${rule.output} = ${rule.action}\n`;
      simulationOutput.innerHTML += `  → Condition met! Setting ${rule.output} to ${rule.action}\n\n`;
    } else {
      simulationOutput.innerHTML += `Rule: IF ${sensor.name} ${rule.condition} ${rule.condition !== 'ON' && rule.condition !== 'OFF' ? rule.threshold : ''} THEN ${rule.output} = ${rule.action}\n`;
      simulationOutput.innerHTML += `  → Condition not met\n\n`;
    }
  });
  
  renderOutputs();
  simulationOutput.innerHTML += `\nSimulation complete!\n`;
  simulationOutput.innerHTML += `Active outputs: ${outputs.filter(o => o.active).map(o => o.name).join(', ') || 'None'}`;
}

addSensorBtn.addEventListener('click', addSensor);
addRuleBtn.addEventListener('click', addRule);
runSimulationBtn.addEventListener('click', runSimulation);
stepSimulationBtn.addEventListener('click', runSimulation);
resetSimulationBtn.addEventListener('click', () => {
  sensors.forEach(s => s.value = false);
  outputs.forEach(o => o.active = false);
  renderSensors();
  renderOutputs();
  simulationOutput.innerHTML = 'Simulation reset.';
});

// Initialize
addSensor();

// ==================== BINARY CONVERTER TAB ====================

const decimalInput = document.getElementById('decimalInput');
const convertToBinaryBtn = document.getElementById('convertToBinaryBtn');
const decimalToBinaryResult = document.getElementById('decimalToBinaryResult');
const binaryInput = document.getElementById('binaryInput');
const convertToDecimalBtn = document.getElementById('convertToDecimalBtn');
const binaryToDecimalResult = document.getElementById('binaryToDecimalResult');
const explanationContent = document.getElementById('explanationContent');
const practiceExercises = document.getElementById('practiceExercises');

function convertDecimalToBinary(decimal) {
  if (decimal === 0) return { binary: '0', steps: ['0 = 0 in binary'] };
  
  let binary = '';
  let num = parseInt(decimal);
  const steps = [];
  let position = 0;
  
  while (num > 0) {
    const remainder = num % 2;
    binary = remainder + binary;
    steps.push(`Step ${position + 1}: ${num} ÷ 2 = ${Math.floor(num / 2)} remainder ${remainder} → bit ${position}`);
    num = Math.floor(num / 2);
    position++;
  }
  
  steps.push(`Result: ${binary} (read from bottom to top)`);
  
  return { binary, steps };
}

function convertBinaryToDecimal(binary) {
  if (!/^[01]+$/.test(binary)) {
    return { decimal: null, steps: ['Invalid binary number! Use only 0s and 1s.'] };
  }
  
  let decimal = 0;
  const steps = [];
  const bits = binary.split('').reverse();
  
  bits.forEach((bit, index) => {
    const value = parseInt(bit) * Math.pow(2, index);
    decimal += value;
    steps.push(`Position ${index}: ${bit} × 2^${index} = ${bit} × ${Math.pow(2, index)} = ${value}`);
  });
  
  steps.push(`Sum: ${steps.slice(0, -1).map(s => s.split('=')[1].trim()).join(' + ')} = ${decimal}`);
  
  return { decimal, steps };
}

convertToBinaryBtn.addEventListener('click', () => {
  const decimal = parseInt(decimalInput.value);
  if (isNaN(decimal) || decimal < 0) {
    decimalToBinaryResult.innerHTML = '<span style="color: var(--danger);">Invalid input!</span>';
    explanationContent.innerHTML = '<p style="color: var(--danger);">Please enter a valid non-negative decimal number.</p>';
    return;
  }
  
  const result = convertDecimalToBinary(decimal);
  decimalToBinaryResult.textContent = result.binary;
  
  explanationContent.innerHTML = `
    <h4>Step-by-Step Conversion:</h4>
    ${result.steps.map(step => `<div class="explanation-step">${step}</div>`).join('')}
    <div style="margin-top: 20px; padding: 15px; background: var(--bg-subtle); border-radius: 6px;">
      <strong>Method:</strong> Divide by 2 repeatedly, keep track of remainders. Read remainders from bottom to top.
    </div>
  `;
  
  progressData.binary.explored = true;
  progressData.binary.conversionsDone++;
  saveProgress('main', progressData);
});

convertToDecimalBtn.addEventListener('click', () => {
  const binary = binaryInput.value.trim();
  if (!binary) {
    binaryToDecimalResult.innerHTML = '<span style="color: var(--danger);">Invalid input!</span>';
    explanationContent.innerHTML = '<p style="color: var(--danger);">Please enter a binary number.</p>';
    return;
  }
  
  const result = convertBinaryToDecimal(binary);
  if (result.decimal === null) {
    binaryToDecimalResult.innerHTML = '<span style="color: var(--danger);">Invalid!</span>';
    explanationContent.innerHTML = result.steps[0];
    return;
  }
  
  binaryToDecimalResult.textContent = result.decimal;
  
  explanationContent.innerHTML = `
    <h4>Step-by-Step Conversion:</h4>
    ${result.steps.map(step => `<div class="explanation-step">${step}</div>`).join('')}
    <div style="margin-top: 20px; padding: 15px; background: var(--bg-subtle); border-radius: 6px;">
      <strong>Method:</strong> Multiply each bit by 2 raised to its position (starting from 0), then sum all values.
    </div>
  `;
  
  progressData.binary.explored = true;
  progressData.binary.conversionsDone++;
  saveProgress('main', progressData);
});

// Practice exercises
const exercises = [
  { question: 'Convert 5 to binary', answer: '101', type: 'decimal' },
  { question: 'Convert 10 to binary', answer: '1010', type: 'decimal' },
  { question: 'Convert 15 to binary', answer: '1111', type: 'decimal' },
  { question: 'Convert 101 to decimal', answer: '5', type: 'binary' },
  { question: 'Convert 1100 to decimal', answer: '12', type: 'binary' },
  { question: 'Convert 1111 to decimal', answer: '15', type: 'binary' }
];

function renderPracticeExercises() {
  practiceExercises.innerHTML = exercises.map((exercise, index) => `
    <div class="practice-item">
      <h4>Exercise ${index + 1}: ${exercise.question}</h4>
      <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
        <input type="text" id="exercise${index}" placeholder="Your answer" 
               style="flex: 1;">
        <button onclick="checkExercise(${index})">Check</button>
      </div>
      <div id="exerciseFeedback${index}" class="feedback" style="display: none;"></div>
    </div>
  `).join('');
}

window.checkExercise = function(index) {
  const exercise = exercises[index];
  const userAnswer = document.getElementById(`exercise${index}`).value.trim();
  const feedback = document.getElementById(`exerciseFeedback${index}`);
  
  if (!userAnswer) {
    feedback.style.display = 'block';
    feedback.className = 'feedback incorrect';
    feedback.textContent = 'Please enter an answer.';
    return;
  }
  
  const isCorrect = userAnswer.toLowerCase() === exercise.answer.toLowerCase();
  feedback.style.display = 'block';
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.textContent = isCorrect 
    ? `✓ Correct! ${exercise.question} = ${exercise.answer}`
    : `✗ Incorrect. The correct answer is ${exercise.answer}.`;
  
  if (isCorrect) {
    progressData.binary.conversionsDone++;
    saveProgress('main', progressData);
  }
};

renderPracticeExercises();

// ==================== PROGRESS TAB ====================

const generateProgressReportBtn = document.getElementById('generateProgressReportBtn');
const exportProgressBtn = document.getElementById('exportProgressBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');

function updateProgressStats() {
  progressStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Logic Gates</div>
      <div class="stat-value">${progressData.gates.circuitsCreated}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sensor Rules</div>
      <div class="stat-value">${progressData.sensors.rulesCreated}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Conversions</div>
      <div class="stat-value">${progressData.binary.conversionsDone}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sessions</div>
      <div class="stat-value">${progressData.sessions || 0}</div>
    </div>
  `;
}

function generateReport() {
  progressReport.innerHTML = `
    <div class="report-section">
      <h3>Learning Progress</h3>
      <div class="report-item ${progressData.gates.explored ? 'completed' : ''}">
        <span>Logic Gates: ${progressData.gates.explored ? 'Explored' : 'Not explored'}</span>
        <span>${progressData.gates.explored ? '✓' : ''}</span>
      </div>
      <div class="report-item ${progressData.sensors.explored ? 'completed' : ''}">
        <span>Sensor Logic: ${progressData.sensors.explored ? 'Explored' : 'Not explored'}</span>
        <span>${progressData.sensors.explored ? '✓' : ''}</span>
      </div>
      <div class="report-item ${progressData.binary.explored ? 'completed' : ''}">
        <span>Binary Converter: ${progressData.binary.explored ? 'Explored' : 'Not explored'}</span>
        <span>${progressData.binary.explored ? '✓' : ''}</span>
      </div>
    </div>
    <div class="report-section">
      <h3>Activity Summary</h3>
      <div class="report-item">
        <span>Circuits Created: ${progressData.gates.circuitsCreated}</span>
      </div>
      <div class="report-item">
        <span>Rules Created: ${progressData.sensors.rulesCreated}</span>
      </div>
      <div class="report-item">
        <span>Conversions Done: ${progressData.binary.conversionsDone}</span>
      </div>
      <div class="report-item">
        <span>Total Sessions: ${progressData.sessions || 0}</span>
      </div>
    </div>
  `;
}

function exportReport() {
  const reportElement = progressReport;
  html2canvas(reportElement).then(canvas => {
    const link = document.createElement('a');
    link.download = 'logic-systems-progress.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

generateProgressReportBtn.addEventListener('click', generateReport);
exportProgressBtn.addEventListener('click', exportReport);
clearProgressBtn.addEventListener('click', () => {
  if (confirm('Clear all progress? This cannot be undone.')) {
    progressData = {
      gates: { explored: false, circuitsCreated: 0 },
      sensors: { explored: false, rulesCreated: 0 },
      binary: { explored: false, conversionsDone: 0 },
      sessions: 0
    };
    saveProgress('main', progressData);
    updateProgressStats();
    progressReport.innerHTML = '';
  }
});

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--accent)'};
    color: white;
    border-radius: 6px;
    z-index: 1000;
    font-weight: 600;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Load progress on startup
loadProgress('main').then(data => {
  if (data) {
    progressData = { ...progressData, ...data };
  }
  progressData.sessions = (progressData.sessions || 0) + 1;
  saveProgress('main', progressData);
  updateProgressStats();
});

// Fix binary conversion explanation rendering
const originalConvertToDecimal = convertBinaryToDecimal;
convertBinaryToDecimal = function(binary) {
  const result = originalConvertToDecimal(binary);
  if (result.steps && result.steps.length > 0) {
    const lastStep = result.steps[result.steps.length - 1];
    const sumParts = result.steps.slice(0, -1).map(s => {
      const match = s.match(/= (\d+)$/);
      return match ? match[1] : '0';
    });
    result.steps[result.steps.length - 1] = `Sum: ${sumParts.join(' + ')} = ${result.decimal}`;
  }
  return result;
};


