// FDE Cycle Simulator
let currentCycle = 'idle'; // idle, fetch, decode, execute
let programCounter = 0;
let instructionRegister = null;
let currentInstruction = null;
let cyclesCompleted = 0;
let isPlaying = false;
let animationInterval = null;
let speed = 5;

// Memory and Registers
const memory = [];
const registers = {
  ACC: 0,      // Accumulator
  R1: 0,       // General Purpose Register 1
  R2: 0,       // General Purpose Register 2
  R3: 0,       // General Purpose Register 3
  MAR: 0,      // Memory Address Register
  MDR: 0       // Memory Data Register
};

// Example programs
const examplePrograms = {
  simple: [
    { address: 0x0000, instruction: 'LOAD R1, 5' },
    { address: 0x0001, instruction: 'LOAD R2, 10' },
    { address: 0x0002, instruction: 'ADD R1, R2' },
    { address: 0x0003, instruction: 'STORE ACC, 0x1000' },
    { address: 0x0004, instruction: 'HALT' }
  ],
  calculation: [
    { address: 0x0000, instruction: 'LOAD R1, 25' },
    { address: 0x0001, instruction: 'LOAD R2, 17' },
    { address: 0x0002, instruction: 'SUB R1, R2' },
    { address: 0x0003, instruction: 'MUL ACC, 2' },
    { address: 0x0004, instruction: 'STORE ACC, 0x1000' },
    { address: 0x0005, instruction: 'HALT' }
  ],
  loop: [
    { address: 0x0000, instruction: 'LOAD R1, 0' },
    { address: 0x0001, instruction: 'LOAD R2, 5' },
    { address: 0x0002, instruction: 'ADD R1, 1' },
    { address: 0x0003, instruction: 'CMP R1, R2' },
    { address: 0x0004, instruction: 'JLT 0x0002' },
    { address: 0x0005, instruction: 'STORE R1, 0x1000' },
    { address: 0x0006, instruction: 'HALT' }
  ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeControls();
  renderCPU();
  loadExampleProgram('simple');
  
  // Update connections on window resize
  window.addEventListener('resize', () => {
    updateConnections();
  });
});

// Tab Switching
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

// Controls
function initializeControls() {
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const loadExampleBtn = document.getElementById('loadExampleBtn');

  playBtn.addEventListener('click', () => {
    isPlaying = true;
    playBtn.textContent = '⏸ Playing...';
    startAnimation();
  });

  pauseBtn.addEventListener('click', () => {
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    stopAnimation();
  });

  stepBtn.addEventListener('click', () => {
    executeNextCycle();
  });

  resetBtn.addEventListener('click', () => {
    resetSimulation();
  });

  speedSlider.addEventListener('input', (e) => {
    speed = parseInt(e.target.value);
    speedValue.textContent = speed;
    if (isPlaying) {
      stopAnimation();
      startAnimation();
    }
  });

  loadExampleBtn.addEventListener('click', () => {
    const programs = Object.keys(examplePrograms);
    const randomProgram = programs[Math.floor(Math.random() * programs.length)];
    loadExampleProgram(randomProgram);
  });
}

// CPU Rendering - Traditional Architecture
function renderCPU() {
  const cpuDiagram = document.getElementById('cpuDiagram');
  cpuDiagram.innerHTML = `
    <div class="cpu-architecture-container">
      <!-- CPU Box -->
      <div class="cpu-box">
        <div class="cpu-box-label">Central Processing Unit</div>
        
        <!-- General Purpose Registers -->
        <div class="cpu-section registers-section-top">
          <div class="section-label">General-purpose registers</div>
          <div class="registers-row">
            <div class="register-box"><div class="register-value-box"></div></div>
            <div class="register-box"><div class="register-value-box"></div></div>
            <div class="register-box"><div class="register-value-box"></div></div>
            <div style="color: var(--text-muted);">...</div>
            <div class="register-box"><div class="register-value-box"></div></div>
          </div>
        </div>
        
        <!-- Accumulator -->
        <div class="cpu-section accumulator-section">
          <div class="register-box accumulator-box">
            <div class="register-label">Accumulator</div>
            <div class="register-value-box" id="accValueDisplay">0</div>
          </div>
        </div>
        
        <!-- Control Unit with Registers -->
        <div class="cpu-section control-unit-section">
          <div class="control-unit-box">
            <div class="section-label">Control unit</div>
            <div class="control-registers">
              <div class="control-register-item">
                <span class="register-label">PC</span>
                <div class="register-value-box" id="pcValue">0x0000</div>
              </div>
              <div class="control-register-item">
                <span class="register-label">SR</span>
                <div class="register-value-box" id="srValue">0000</div>
              </div>
              <div class="control-register-item">
                <span class="register-label">CIR</span>
                <div class="register-value-box" id="cirValue">-</div>
              </div>
              <div class="control-register-item">
                <span class="register-label">MAR</span>
                <div class="register-value-box" id="marValue">0x0000</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- ALU -->
        <div class="cpu-section alu-section">
          <div class="alu-box" id="aluComponent">
            <div class="alu-label">ALU</div>
            <div class="alu-status" id="aluValue">Ready</div>
          </div>
        </div>
        
        <!-- MBR/MDR -->
        <div class="cpu-section mbr-section">
          <div class="register-box mbr-box">
            <div class="register-label">MBR/MDR</div>
            <div class="register-value-box" id="mbrValue">0x0000</div>
          </div>
        </div>
      </div>
      
      <!-- Main Memory -->
      <div class="memory-box" id="mainMemoryBox">
        <div class="memory-box-label">Main memory (RAM)</div>
        <div class="memory-table" id="mainMemoryTable">
          <div class="memory-table-header">
            <div class="memory-col">Address</div>
            <div class="memory-col">Data</div>
          </div>
          <div class="memory-table-body" id="memoryTableBody">
            <!-- Memory rows will be populated here -->
          </div>
        </div>
      </div>
      
      <!-- Buses -->
      <div class="buses-container">
        <!-- Data Bus -->
        <div class="bus-line data-bus" id="dataBus">
          <div class="bus-label">Data bus</div>
          <svg class="bus-arrows" style="position: absolute; width: 100%; height: 100%; pointer-events: none;">
            <defs>
              <marker id="data-arrow-left" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
                <polygon points="8 0, 8 8, 0 4" fill="var(--info)" />
              </marker>
              <marker id="data-arrow-right" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                <polygon points="0 0, 0 8, 8 4" fill="var(--info)" />
              </marker>
            </defs>
            <line id="dataBusLine" x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--info)" stroke-width="3" marker-end="url(#data-arrow-right)" marker-start="url(#data-arrow-left)" />
          </svg>
        </div>
        
        <!-- Address Bus -->
        <div class="bus-line address-bus" id="addressBus">
          <div class="bus-label">Address bus</div>
          <svg class="bus-arrows" style="position: absolute; width: 100%; height: 100%; pointer-events: none;">
            <defs>
              <marker id="addr-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                <polygon points="0 0, 0 8, 8 4" fill="var(--warning)" />
              </marker>
            </defs>
            <line id="addressBusLine" x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--warning)" stroke-width="3" marker-end="url(#addr-arrow)" />
          </svg>
        </div>
        
        <!-- Control Bus -->
        <div class="bus-line control-bus" id="controlBus">
          <div class="bus-label">Control bus</div>
          <svg class="bus-arrows" style="position: absolute; width: 100%; height: 100%; pointer-events: none;">
            <defs>
              <marker id="ctrl-arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                <polygon points="0 0, 0 8, 8 4" fill="var(--success)" />
              </marker>
            </defs>
            <line id="controlBusLine" x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--success)" stroke-width="3" marker-end="url(#ctrl-arrow)" />
          </svg>
        </div>
      </div>
    </div>
    
    <svg id="cpuInternalConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
      <!-- Internal CPU connections will be drawn here -->
    </svg>
  `;
  
  // Populate memory table
  renderMemoryTable();
  
  // Draw internal connections after components are rendered
  setTimeout(() => {
    updateInternalConnections();
    updateBusConnections();
  }, 200);
}

// Memory Rendering (legacy - memory is now shown in CPU architecture diagram)
function renderMemory() {
  // Memory is now displayed in the CPU architecture diagram via renderMemoryTable()
  // This function is kept for compatibility but does nothing
}

// Render Memory Table in CPU Architecture
function renderMemoryTable() {
  const memoryTableBody = document.getElementById('memoryTableBody');
  if (!memoryTableBody) return;
  
  // Show addresses from 0x0000 to 0x0008 (9 addresses)
  const addresses = [];
  for (let i = 0; i <= 8; i++) {
    addresses.push(i);
  }
  
  memoryTableBody.innerHTML = addresses.map(addr => {
    const memItem = memory.find(m => m.address === addr);
    let data = '0000000';
    if (memItem) {
      // Convert instruction to binary representation or show as text
      if (memItem.instruction === 'DATA: 0') {
        data = '0000000';
      } else {
        // Show instruction as text for now
        data = memItem.instruction.substring(0, 10) || '0000000';
      }
    }
    
    const binaryAddr = addr.toString(2).padStart(8, '0');
    
    return `
      <div class="memory-table-row" id="memoryRow${addr}" data-address="${addr}">
        <div class="memory-addr-col">${binaryAddr}</div>
        <div class="memory-data-col">${data}</div>
      </div>
    `;
  }).join('');
  
  // Update active memory row
  updateMemoryHighlight();
}

function updateMemoryHighlight() {
  document.querySelectorAll('.memory-table-row').forEach(row => {
    row.classList.remove('active');
    const addr = parseInt(row.dataset.address);
    if (addr === registers.MAR || addr === programCounter) {
      row.classList.add('active');
    }
  });
}

// Update Internal Connections
function updateInternalConnections() {
  const svg = document.getElementById('cpuInternalConnections');
  if (!svg) return;
  
  // Clear existing connections
  svg.innerHTML = `
    <defs>
      <marker id="arrow-internal" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 0 8, 8 4" fill="rgba(148, 163, 184, 0.8)" />
      </marker>
      <marker id="arrow-bidirectional-start" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
        <polygon points="8 0, 8 8, 0 4" fill="rgba(148, 163, 184, 0.8)" />
      </marker>
      <marker id="arrow-bidirectional-end" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 0 8, 8 4" fill="rgba(148, 163, 184, 0.8)" />
      </marker>
    </defs>
  `;
  
  // Get component positions
  const cpuBox = document.querySelector('.cpu-box');
  if (!cpuBox) return;
  
  const cpuBoxRect = cpuBox.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  
  // Helper to get element center position relative to SVG
  function getElementCenter(selector) {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - svgRect.left,
      y: rect.top + rect.height / 2 - svgRect.top
    };
  }
  
  // Helper to get element edge position
  function getElementEdge(selector, edge) {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    switch(edge) {
      case 'right':
        return { x: rect.right - svgRect.left, y: rect.top + rect.height / 2 - svgRect.top };
      case 'left':
        return { x: rect.left - svgRect.left, y: rect.top + rect.height / 2 - svgRect.top };
      case 'bottom':
        return { x: rect.left + rect.width / 2 - svgRect.left, y: rect.bottom - svgRect.top };
      case 'top':
        return { x: rect.left + rect.width / 2 - svgRect.left, y: rect.top - svgRect.top };
      default:
        return getElementCenter(selector);
    }
  }
  
  // Draw connections
  const connections = [];
  
  // General-purpose registers to ALU (top to center)
  const regsCenter = getElementCenter('.registers-row');
  const aluCenter = getElementCenter('.alu-box');
  if (regsCenter && aluCenter) {
    connections.push({
      x1: regsCenter.x,
      y1: regsCenter.y + 20,
      x2: aluCenter.x,
      y2: aluCenter.y - 30,
      stroke: 'rgba(148, 163, 184, 0.6)',
      strokeWidth: 2,
      markerEnd: 'url(#arrow-internal)'
    });
  }
  
  // Accumulator to ALU (left to center)
  const accCenter = getElementCenter('.accumulator-box');
  if (accCenter && aluCenter) {
    connections.push({
      x1: accCenter.x + 40,
      y1: accCenter.y,
      x2: aluCenter.x - 30,
      y2: aluCenter.y,
      stroke: 'rgba(148, 163, 184, 0.6)',
      strokeWidth: 2,
      markerStart: 'url(#arrow-bidirectional-start)',
      markerEnd: 'url(#arrow-bidirectional-end)'
    });
  }
  
  // Control Unit to ALU (left to center)
  const cuCenter = getElementCenter('.control-unit-box');
  if (cuCenter && aluCenter) {
    connections.push({
      x1: cuCenter.x + 60,
      y1: cuCenter.y + 20,
      x2: aluCenter.x - 30,
      y2: aluCenter.y - 10,
      stroke: 'rgba(147, 197, 253, 0.7)',
      strokeWidth: 2,
      strokeDasharray: '4 4',
      markerEnd: 'url(#arrow-internal)'
    });
  }
  
  // MBR/MDR to ALU (bottom to center)
  const mbrCenter = getElementCenter('.mbr-box');
  if (mbrCenter && aluCenter) {
    connections.push({
      x1: mbrCenter.x,
      y1: mbrCenter.y - 20,
      x2: aluCenter.x,
      y2: aluCenter.y + 30,
      stroke: 'rgba(148, 163, 184, 0.6)',
      strokeWidth: 2,
      markerStart: 'url(#arrow-bidirectional-start)',
      markerEnd: 'url(#arrow-bidirectional-end)'
    });
  }
  
  // General-purpose registers to Accumulator
  if (regsCenter && accCenter) {
    connections.push({
      x1: regsCenter.x - 60,
      y1: regsCenter.y + 20,
      x2: accCenter.x,
      y2: accCenter.y - 20,
      stroke: 'rgba(148, 163, 184, 0.5)',
      strokeWidth: 1.5,
      markerEnd: 'url(#arrow-internal)'
    });
  }
  
  // Draw all connections
  connections.forEach(conn => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', conn.x1);
    line.setAttribute('y1', conn.y1);
    line.setAttribute('x2', conn.x2);
    line.setAttribute('y2', conn.y2);
    line.setAttribute('stroke', conn.stroke);
    line.setAttribute('stroke-width', conn.strokeWidth);
    if (conn.strokeDasharray) line.setAttribute('stroke-dasharray', conn.strokeDasharray);
    if (conn.markerStart) line.setAttribute('marker-start', conn.markerStart);
    if (conn.markerEnd) line.setAttribute('marker-end', conn.markerEnd);
    svg.appendChild(line);
  });
}

// Update Bus Connections
function updateBusConnections() {
  // Buses are already defined in the HTML structure
  // We can highlight them during different phases
  const dataBus = document.getElementById('dataBus');
  const addressBus = document.getElementById('addressBus');
  const controlBus = document.getElementById('controlBus');
  
  // Reset all buses
  if (dataBus) dataBus.classList.remove('active');
  if (addressBus) addressBus.classList.remove('active');
  if (controlBus) controlBus.classList.remove('active');
  
  // Highlight active bus based on cycle
  if (currentCycle === 'fetch') {
    if (addressBus) addressBus.classList.add('active');
    if (dataBus) dataBus.classList.add('active');
  } else if (currentCycle === 'execute') {
    if (dataBus) dataBus.classList.add('active');
    if (controlBus) controlBus.classList.add('active');
  }
  
  // Draw connections from CPU to buses and buses to memory
  drawBusConnections();
}

// Draw connections from CPU components to buses and buses to memory
function drawBusConnections() {
  const architectureContainer = document.querySelector('.cpu-architecture-container');
  if (!architectureContainer) return;
  
  // Create or get SVG for bus connections
  let busConnectionsSvg = document.getElementById('busConnectionsSvg');
  if (!busConnectionsSvg) {
    busConnectionsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    busConnectionsSvg.id = 'busConnectionsSvg';
    busConnectionsSvg.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;');
    architectureContainer.appendChild(busConnectionsSvg);
  }
  
  const containerRect = architectureContainer.getBoundingClientRect();
  const svgRect = busConnectionsSvg.getBoundingClientRect();
  
  // Helper to get element position
  function getElementPos(selector, edge = 'center') {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    switch(edge) {
      case 'bottom':
        return { x: rect.left + rect.width / 2 - svgRect.left, y: rect.bottom - svgRect.top };
      case 'right':
        return { x: rect.right - svgRect.left, y: rect.top + rect.height / 2 - svgRect.top };
      case 'left':
        return { x: rect.left - svgRect.left, y: rect.top + rect.height / 2 - svgRect.top };
      default:
        return { x: rect.left + rect.width / 2 - svgRect.left, y: rect.top + rect.height / 2 - svgRect.top };
    }
  }
  
  // Clear existing connections
  busConnectionsSvg.innerHTML = `
    <defs>
      <marker id="bus-arrow-addr" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 0 8, 8 4" fill="var(--warning)" />
      </marker>
      <marker id="bus-arrow-data-start" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto">
        <polygon points="8 0, 8 8, 0 4" fill="var(--info)" />
      </marker>
      <marker id="bus-arrow-data-end" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 0 8, 8 4" fill="var(--info)" />
      </marker>
      <marker id="bus-arrow-ctrl" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
        <polygon points="0 0, 0 8, 8 4" fill="var(--success)" />
      </marker>
    </defs>
  `;
  
  // Get positions
  const marBox = document.getElementById('marValue');
  const mbrBox = document.querySelector('.mbr-box');
  const controlUnit = document.querySelector('.control-unit-box');
  const addressBusEl = document.getElementById('addressBus');
  const dataBusEl = document.getElementById('dataBus');
  const controlBusEl = document.getElementById('controlBus');
  const memoryBox = document.getElementById('mainMemoryBox');
  
  // MAR → Address Bus
  if (marBox && addressBusEl) {
    const marPos = getElementPos('#marValue', 'bottom');
    const addrBusPos = getElementPos('#addressBus', 'left');
    if (marPos && addrBusPos) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', marPos.x);
      line.setAttribute('y1', marPos.y + 15);
      line.setAttribute('x2', addrBusPos.x);
      line.setAttribute('y2', addrBusPos.y);
      line.setAttribute('stroke', 'var(--warning)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#bus-arrow-addr)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
  
  // MBR/MDR → Data Bus
  if (mbrBox && dataBusEl) {
    const mbrPos = getElementPos('.mbr-box', 'bottom');
    const dataBusPos = getElementPos('#dataBus', 'left');
    if (mbrPos && dataBusPos) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', mbrPos.x);
      line.setAttribute('y1', mbrPos.y + 15);
      line.setAttribute('x2', dataBusPos.x);
      line.setAttribute('y2', dataBusPos.y);
      line.setAttribute('stroke', 'var(--info)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-start', 'url(#bus-arrow-data-start)');
      line.setAttribute('marker-end', 'url(#bus-arrow-data-end)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
  
  // Control Unit → Control Bus
  if (controlUnit && controlBusEl) {
    const cuPos = getElementPos('.control-unit-box', 'bottom');
    const ctrlBusPos = getElementPos('#controlBus', 'left');
    if (cuPos && ctrlBusPos) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cuPos.x);
      line.setAttribute('y1', cuPos.y + 10);
      line.setAttribute('x2', ctrlBusPos.x);
      line.setAttribute('y2', ctrlBusPos.y);
      line.setAttribute('stroke', 'var(--success)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '4 4');
      line.setAttribute('marker-end', 'url(#bus-arrow-ctrl)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
  
  // Address Bus → Memory
  if (addressBusEl && memoryBox) {
    const addrBusRight = getElementPos('#addressBus', 'right');
    const memoryLeft = getElementPos('#mainMemoryBox', 'left');
    if (addrBusRight && memoryLeft) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', addrBusRight.x);
      line.setAttribute('y1', addrBusRight.y);
      line.setAttribute('x2', memoryLeft.x);
      line.setAttribute('y2', memoryLeft.y + 40); // Connect to address column area
      line.setAttribute('stroke', 'var(--warning)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end', 'url(#bus-arrow-addr)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
  
  // Data Bus → Memory (bidirectional)
  if (dataBusEl && memoryBox) {
    const dataBusRight = getElementPos('#dataBus', 'right');
    const memoryLeft = getElementPos('#mainMemoryBox', 'left');
    if (dataBusRight && memoryLeft) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', dataBusRight.x);
      line.setAttribute('y1', dataBusRight.y);
      line.setAttribute('x2', memoryLeft.x);
      line.setAttribute('y2', memoryLeft.y + 60); // Connect to data column area
      line.setAttribute('stroke', 'var(--info)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-start', 'url(#bus-arrow-data-start)');
      line.setAttribute('marker-end', 'url(#bus-arrow-data-end)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
  
  // Control Bus → Memory
  if (controlBusEl && memoryBox) {
    const ctrlBusRight = getElementPos('#controlBus', 'right');
    const memoryLeft = getElementPos('#mainMemoryBox', 'left');
    if (ctrlBusRight && memoryLeft) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ctrlBusRight.x);
      line.setAttribute('y1', ctrlBusRight.y);
      line.setAttribute('x2', memoryLeft.x);
      line.setAttribute('y2', memoryLeft.y + 80); // Connect to memory control area
      line.setAttribute('stroke', 'var(--success)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-dasharray', '4 4');
      line.setAttribute('marker-end', 'url(#bus-arrow-ctrl)');
      line.setAttribute('opacity', '0.7');
      busConnectionsSvg.appendChild(line);
    }
  }
}

// Registers Rendering (legacy - registers are now shown in CPU architecture diagram)
function renderRegisters() {
  // Registers are now displayed in the CPU architecture diagram (PC, MAR, CIR, ACC, MBR/MDR)
  // This function is kept for compatibility but does nothing
}

// Update Display
function updateDisplay() {
  // Update Program Counter (PC in Control Unit)
  const pcElement = document.getElementById('pcValue');
  if (pcElement && pcElement.parentElement.querySelector('.register-label')?.textContent === 'PC') {
    pcElement.textContent = `0x${programCounter.toString(16).padStart(4, '0').toUpperCase()}`;
  }
  
  // Update Program Counter info display (if exists)
  const pcInfoElement = document.getElementById('programCounter');
  if (pcInfoElement) {
    pcInfoElement.textContent = `0x${programCounter.toString(16).padStart(4, '0').toUpperCase()}`;
  }
  
  // Update MAR (Memory Address Register)
  const marElement = document.getElementById('marValue');
  if (marElement) {
    marElement.textContent = `0x${registers.MAR.toString(16).padStart(4, '0').toUpperCase()}`;
  }
  
  // Update CIR (Current Instruction Register)
  const cirElement = document.getElementById('cirValue');
  if (cirElement) {
    const irValue = instructionRegister || '-';
    cirElement.textContent = irValue.length > 10 ? irValue.substring(0, 10) + '...' : irValue;
  }
  
  // Update Instruction Register (legacy support)
  const irValue = instructionRegister || '-';
  const irValueElement = document.getElementById('irValue');
  if (irValueElement && !irValueElement.id.includes('cirValue')) {
    irValueElement.textContent = irValue;
  }
  
  const currentInstructionElement = document.getElementById('currentInstruction');
  if (currentInstructionElement) {
    currentInstructionElement.textContent = irValue;
  }
  
  // Update Next instruction preview (if exists)
  const nextIrElement = document.getElementById('irNextValue');
  if (nextIrElement) {
    const nextMemItem = memory.find(m => m.address === programCounter);
    const nextIrValue = nextMemItem && nextMemItem.instruction !== 'HALT' ? nextMemItem.instruction : '-';
    nextIrElement.textContent = nextIrValue;
  }
  
  // Update MBR/MDR
  const mbrElement = document.getElementById('mbrValue');
  if (mbrElement) {
    mbrElement.textContent = `0x${registers.MDR.toString(16).padStart(4, '0').toUpperCase()}`;
  }
  
  // Update Accumulator
  const accElement = document.getElementById('accValueDisplay');
  if (accElement) {
    accElement.textContent = registers.ACC;
  }
  
  // Update Cycle Info
  const currentCycleElement = document.getElementById('currentCycle');
  if (currentCycleElement) {
    currentCycleElement.textContent = currentCycle.charAt(0).toUpperCase() + currentCycle.slice(1);
  }
  const cyclesCompletedElement = document.getElementById('cyclesCompleted');
  if (cyclesCompletedElement) {
    cyclesCompletedElement.textContent = cyclesCompleted;
  }
  
  // Update Control Unit status (legacy)
  const cuValueElement = document.getElementById('cuValue');
  if (cuValueElement && !cuValueElement.parentElement.classList.contains('alu-status')) {
    const cuStatus = currentCycle === 'fetch' ? 'Fetching...' :
                     currentCycle === 'decode' ? 'Decoding...' :
                     currentCycle === 'execute' ? 'Executing...' : 'Idle';
    cuValueElement.textContent = cuStatus;
  }
  
  // Update ALU status
  const aluValueElement = document.getElementById('aluValue');
  if (aluValueElement && aluValueElement.parentElement.classList.contains('alu-status')) {
    const aluStatus = currentCycle === 'execute' ? 'Processing...' : 'Ready';
    aluValueElement.textContent = aluStatus;
  }
  
  // Update Registers
  Object.entries(registers).forEach(([name, value]) => {
    const registerElement = document.getElementById(`registerValue${name}`);
    if (registerElement) {
      registerElement.textContent = value;
    }
  });
  
  // Update Memory Highlighting (both old and new format)
  document.querySelectorAll('.memory-cell').forEach(cell => {
    const address = parseInt(cell.dataset.address);
    cell.classList.remove('active');
    if (address === programCounter || address === registers.MAR) {
      cell.classList.add('active');
    }
  });
  
  // Update Memory Table Highlighting
  updateMemoryHighlight();
  
  // Update CPU Component States
  updateCPUComponentStates();
  
  // Update Bus Connections
  updateBusConnections();
  
  // Re-render memory table if it exists
  if (document.getElementById('memoryTableBody')) {
    renderMemoryTable();
  }
  
  // Update connections
  setTimeout(() => {
    updateInternalConnections();
    updateBusConnections();
  }, 50);
}

function updateCPUComponentStates() {
  // Reset all components
  document.querySelectorAll('.cpu-component').forEach(comp => {
    comp.classList.remove('active', 'completed');
  });
  
  // Reset all connection lines
  document.querySelectorAll('#cpuConnections line').forEach(line => {
    line.classList.remove('active', 'fetch', 'decode', 'execute');
  });
  
  // Set active component based on cycle and show connections
  if (currentCycle === 'fetch') {
    document.getElementById('pcComponent').classList.add('active');
    document.getElementById('irComponent').classList.add('active');
    highlightConnection('pcToIr', 'fetch');
    highlightConnection('memoryToIr', 'fetch');
  } else if (currentCycle === 'decode') {
    document.getElementById('irComponent').classList.add('completed');
    document.getElementById('cuComponent').classList.add('active');
    highlightConnection('irToCu', 'decode');
  } else if (currentCycle === 'execute') {
    document.getElementById('cuComponent').classList.add('completed');
    if (currentInstruction && currentInstruction.includes('ADD') || currentInstruction.includes('SUB') || currentInstruction.includes('MUL')) {
      document.getElementById('aluComponent').classList.add('active');
      highlightConnection('cuToAlu', 'execute');
      highlightConnection('aluToReg', 'execute');
    } else {
      document.getElementById('cuComponent').classList.add('active');
    }
  }
  
  // Update connections
  updateConnections();
}

function highlightConnection(lineId, phase) {
  const line = document.getElementById(lineId);
  if (line) {
    line.classList.add('active', phase);
  }
}

function updateConnections() {
  const svg = document.getElementById('cpuConnections');
  if (!svg) return;
  
  const container = document.querySelector('.cpu-diagram-container');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  
  // Get component positions
  const pc = document.getElementById('pcComponent');
  const ir = document.getElementById('irComponent');
  const cu = document.getElementById('cuComponent');
  const alu = document.getElementById('aluComponent');
  
  if (!pc || !ir || !cu || !alu) return;
  
  const pcRect = pc.getBoundingClientRect();
  const irRect = ir.getBoundingClientRect();
  const cuRect = cu.getBoundingClientRect();
  const aluRect = alu.getBoundingClientRect();
  
  // Calculate positions relative to container
  const getCenter = (rect) => ({
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  });
  
  const pcCenter = getCenter(pcRect);
  const irCenter = getCenter(irRect);
  const cuCenter = getCenter(cuRect);
  const aluCenter = getCenter(aluRect);
  
  // Clear existing lines
  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
      </marker>
      <marker id="arrowhead-fetch" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="var(--info)" />
      </marker>
      <marker id="arrowhead-decode" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="var(--warning)" />
      </marker>
      <marker id="arrowhead-execute" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="var(--success)" />
      </marker>
    </defs>
    
    <!-- PC to IR (Fetch phase) -->
    <line id="pcToIr" class="connection-line" 
          x1="${pcCenter.x}" y1="${pcRect.bottom - containerRect.top}" 
          x2="${irCenter.x}" y2="${irRect.top - containerRect.top}"
          marker-end="url(#arrowhead-fetch)"></line>
    
    <!-- Memory to IR (Fetch phase - conceptual) -->
    <line id="memoryToIr" class="connection-line" 
          x1="${irCenter.x - 50}" y1="${irRect.top - containerRect.top}" 
          x2="${irCenter.x}" y2="${irRect.top - containerRect.top}"
          marker-end="url(#arrowhead-fetch)" 
          stroke-dasharray="4 4"></line>
    
    <!-- IR to CU (Decode phase) -->
    <line id="irToCu" class="connection-line" 
          x1="${irRect.left - containerRect.left}" y1="${irCenter.y}" 
          x2="${cuRect.right - containerRect.left}" y2="${cuCenter.y}"
          marker-end="url(#arrowhead-decode)"></line>
    
    <!-- CU to ALU (Execute phase) -->
    <line id="cuToAlu" class="connection-line" 
          x1="${cuRect.right - containerRect.left}" y1="${cuCenter.y}" 
          x2="${aluRect.left - containerRect.left}" y2="${aluCenter.y}"
          marker-end="url(#arrowhead-execute)"></line>
    
    <!-- ALU to Registers (Execute phase) -->
    <line id="aluToReg" class="connection-line" 
          x1="${aluCenter.x}" y1="${aluRect.bottom - containerRect.top}" 
          x2="${aluCenter.x}" y2="${containerRect.height - 60}"
          marker-end="url(#arrowhead-execute)" 
          stroke-dasharray="4 4"></line>
    
    <!-- CU feedback to PC (increment) -->
    <line id="cuToPc" class="connection-line" 
          x1="${cuCenter.x}" y1="${cuRect.top - containerRect.top}" 
          x2="${pcCenter.x}" y2="${pcRect.bottom - containerRect.top}"
          marker-end="url(#arrowhead)" 
          stroke-dasharray="3 3" 
          opacity="0.4"></line>
  `;
}

// FDE Cycle Execution
function executeNextCycle() {
  if (currentCycle === 'idle' || currentCycle === 'execute') {
    startFetch();
  } else if (currentCycle === 'fetch') {
    startDecode();
  } else if (currentCycle === 'decode') {
    startExecute();
  }
}

function startFetch() {
  currentCycle = 'fetch';
  
  // Check if program is complete
  const currentMemItem = memory.find(m => m.address === programCounter);
  if (!currentMemItem || currentMemItem.instruction === 'HALT') {
    currentCycle = 'idle';
    addTrace('Program completed. All instructions executed.');
    updateDisplay();
    updateConnections();
    return;
  }
  
  // Fetch phase
  registers.MAR = programCounter;
  instructionRegister = currentMemItem.instruction;
  
  addTrace(`[FETCH] PC → MAR: 0x${programCounter.toString(16).padStart(4, '0').toUpperCase()}`);
  addTrace(`[FETCH] Memory[0x${programCounter.toString(16).padStart(4, '0').toUpperCase()}] → IR: "${instructionRegister}"`);
  
  updateDisplay();
  updateConnections();
  
  // Auto-advance to decode after a moment
  setTimeout(() => {
    if (currentCycle === 'fetch') {
      startDecode();
    }
  }, getSpeedDelay());
}

function startDecode() {
  if (!instructionRegister) return;
  
  currentCycle = 'decode';
  
  // Parse instruction
  const parts = instructionRegister.split(/[\s,]+/);
  const opcode = parts[0];
  
  addTrace(`[DECODE] Opcode: "${opcode}"`);
  addTrace(`[DECODE] Control Unit generates control signals for: ${opcode}`);
  
  updateDisplay();
  updateConnections();
  
  // Auto-advance to execute after a moment
  setTimeout(() => {
    if (currentCycle === 'decode') {
      startExecute();
    }
  }, getSpeedDelay());
}

function startExecute() {
  if (!instructionRegister) return;
  
  currentCycle = 'execute';
  
  // Parse and execute instruction
  const parts = instructionRegister.split(/[\s,]+/);
  const opcode = parts[0];
  const operand1 = parts[1];
  const operand2 = parts[2];
  
  let result = '';
  
  switch (opcode) {
    case 'LOAD':
      if (operand2) {
        // LOAD R1, 5
        const value = parseInt(operand2);
        registers[operand1] = value;
        result = `Loaded value ${value} into ${operand1}`;
        addTrace(`[EXECUTE] ${operand1} = ${value}`);
      } else {
        // LOAD R1, address
        const address = parseInt(operand2, 16);
        registers[operand1] = memory[address]?.value || 0;
        result = `Loaded value from address ${operand2} into ${operand1}`;
        addTrace(`[EXECUTE] ${operand1} = Memory[${operand2}]`);
      }
      break;
      
    case 'ADD':
      if (operand1 === 'ACC' || operand2) {
        const val1 = operand1 === 'ACC' ? registers.ACC : registers[operand1];
        const val2 = operand2 ? (registers[operand2] || parseInt(operand2)) : registers.ACC;
        registers.ACC = val1 + val2;
        result = `ACC = ${val1} + ${val2} = ${registers.ACC}`;
        addTrace(`[EXECUTE] ALU performs addition: ${val1} + ${val2} = ${registers.ACC}`);
      } else {
        registers[operand1] = registers[operand1] + (registers[operand2] || 0);
        result = `${operand1} = ${registers[operand1]}`;
        addTrace(`[EXECUTE] ${operand1} = ${operand1} + ${operand2}`);
      }
      break;
      
    case 'SUB':
      const val1 = registers[operand1] || registers.ACC;
      const val2 = registers[operand2] || parseInt(operand2);
      registers.ACC = val1 - val2;
      result = `ACC = ${val1} - ${val2} = ${registers.ACC}`;
      addTrace(`[EXECUTE] ALU performs subtraction: ${val1} - ${val2} = ${registers.ACC}`);
      break;
      
    case 'MUL':
      const m1 = operand1 === 'ACC' ? registers.ACC : registers[operand1];
      const m2 = registers[operand2] || parseInt(operand2);
      registers.ACC = m1 * m2;
      result = `ACC = ${m1} × ${m2} = ${registers.ACC}`;
      addTrace(`[EXECUTE] ALU performs multiplication: ${m1} × ${m2} = ${registers.ACC}`);
      break;
      
    case 'STORE':
      const address = parseInt(operand2, 16);
      const value = operand1 === 'ACC' ? registers.ACC : registers[operand1];
      // In real system, this would write to memory
      result = `Stored ${value} to address ${operand2}`;
      addTrace(`[EXECUTE] Memory[${operand2}] = ${value}`);
      break;
      
    case 'CMP':
      const c1 = registers[operand1];
      const c2 = registers[operand2];
      result = `Compare ${c1} with ${c2}`;
      addTrace(`[EXECUTE] Compare ${c1} with ${c2}`);
      break;
      
    case 'JLT':
      // Simplified jump (would check flags in real system)
      result = `Jump to ${operand1}`;
      addTrace(`[EXECUTE] Jump to ${operand1}`);
      break;
      
    case 'HALT':
      result = 'Program halted';
      addTrace(`[EXECUTE] Program halted`);
      break;
      
    default:
      result = `Unknown instruction: ${opcode}`;
      addTrace(`[EXECUTE] Unknown instruction: ${opcode}`);
  }
  
  addTrace(`[EXECUTE] ${result}`);
  
  // Increment program counter
  programCounter++;
  cyclesCompleted++;
  
  updateDisplay();
  updateConnections();
  
  // Reset cycle to fetch next instruction
  currentCycle = 'idle';
  
  // Check if we should continue
  setTimeout(() => {
    if (isPlaying) {
      executeNextCycle();
    }
  }, getSpeedDelay());
}

// Animation Control
function startAnimation() {
  stopAnimation();
  animationInterval = setInterval(() => {
    if (!isPlaying) {
      stopAnimation();
      return;
    }
    executeNextCycle();
  }, getSpeedDelay() * 3);
}

function stopAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
}

function getSpeedDelay() {
  // Speed 1 = slow, Speed 10 = fast
  return (11 - speed) * 200;
}

// Reset
function resetSimulation() {
  isPlaying = false;
  stopAnimation();
  currentCycle = 'idle';
  programCounter = 0;
  instructionRegister = null;
  cyclesCompleted = 0;
  
  // Reset registers
  Object.keys(registers).forEach(key => {
    registers[key] = 0;
  });
  
  document.getElementById('playBtn').textContent = '▶ Play';
  document.getElementById('traceOutput').innerHTML = '<div class="trace-item">Simulation reset. Ready to execute instructions...</div>';
  
  updateDisplay();
  renderCPU(); // Re-render CPU to update memory table
  updateConnections();
}

// Load Example Program
function loadExampleProgram(programName) {
  resetSimulation();
  
  const program = examplePrograms[programName];
  if (!program) return;
  
  memory.length = 0;
  program.forEach(item => {
    memory.push(item);
  });
  
  // Add some data memory locations
  for (let i = 0x1000; i < 0x1005; i++) {
    if (!memory.find(m => m.address === i)) {
      memory.push({ address: i, instruction: `DATA: 0` });
    }
  }
  
  renderCPU(); // Re-render CPU to update memory table
  addTrace(`Loaded example program: ${programName}`);
  addTrace(`Program contains ${program.length} instructions`);
}

// Trace Output
function addTrace(message) {
  const traceOutput = document.getElementById('traceOutput');
  const traceItem = document.createElement('div');
  traceItem.className = 'trace-item fade-in';
  traceItem.textContent = `[Cycle ${cyclesCompleted}] ${message}`;
  
  // Remove active class from previous items
  traceOutput.querySelectorAll('.trace-item').forEach(item => {
    item.classList.remove('active');
    item.classList.add('completed');
  });
  
  traceItem.classList.add('active');
  traceOutput.appendChild(traceItem);
  
  // Auto-scroll
  traceOutput.scrollTop = traceOutput.scrollHeight;
  
  // Limit trace items
  const traceItems = traceOutput.querySelectorAll('.trace-item');
  if (traceItems.length > 50) {
    traceItems[0].remove();
  }
}

// Tab State Persistence
function saveTabState() {
  const activeTab = document.querySelector('.tab-button.active')?.dataset.tab;
  if (activeTab) {
    localStorage.setItem('fdeCycle_activeTab', activeTab);
  }
}

function restoreTabState() {
  const savedTab = localStorage.getItem('fdeCycle_activeTab');
  if (savedTab) {
    const tabButton = document.querySelector(`[data-tab="${savedTab}"]`);
    if (tabButton) {
      tabButton.click();
    }
  }
}

document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', saveTabState);
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restoreTabState);
} else {
  restoreTabState();
}

