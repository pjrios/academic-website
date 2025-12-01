// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'computing-systems';
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

const DB_NAME = 'ComputingSystemsDB';
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
  networkDevices: { router: false, switch: false, server: false },
  hardware: { cpu: false, ram: false, storage: false },
  dataFlow: { network: false, memory: false, storage: false, cpu: false },
  osSimulator: { processes: false, scheduling: false, memory: false },
  sessions: 0
};

// ==================== NETWORK DEVICES TAB ====================

const deviceBtns = document.querySelectorAll('.device-btn');
const deviceDiagram = document.getElementById('deviceDiagram');
const deviceInfo = document.getElementById('deviceInfo');
const deviceInteractive = document.getElementById('deviceInteractive');

const deviceData = {
  router: {
    title: 'Router',
    description: 'A router connects multiple networks and routes data packets between them.',
    info: `
      <h3>Router Functions</h3>
      <ul>
        <li><strong>Routing:</strong> Determines the best path for data packets</li>
        <li><strong>Forwarding:</strong> Sends packets to their destination</li>
        <li><strong>Network Address Translation (NAT):</strong> Translates private IPs to public IPs</li>
        <li><strong>Firewall:</strong> Filters and blocks unwanted traffic</li>
        <li><strong>DHCP:</strong> Assigns IP addresses to devices</li>
      </ul>
      <h3>Key Features</h3>
      <ul>
        <li>Operates at Layer 3 (Network Layer)</li>
        <li>Uses IP addresses for routing decisions</li>
        <li>Creates routing tables</li>
        <li>Can connect different network types</li>
      </ul>
    `,
    diagram: `
      <div id="routerDiagram" style="display: flex; flex-direction: column; align-items: center; gap: 30px; position: relative; padding: 20px;">
        <div id="routerNode" class="network-node router-central" style="padding: 25px 50px; background: var(--accent); color: white; position: relative; z-index: 10;">
          <strong>🛣️ Router</strong>
          <div style="font-size: 12px; margin-top: 8px;">192.168.1.1</div>
        </div>
        <div id="networkContainer" style="display: flex; gap: 40px; margin-top: 20px; position: relative; z-index: 10;">
          <div id="networkA" class="network-node router-network" data-network="A" style="position: relative; z-index: 10;">
            <strong>Network A</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">192.168.1.0/24</div>
            <div id="packetA" class="packet-icon" style="display: none;">📦</div>
        </div>
          <div id="networkB" class="network-node router-network" data-network="B" style="position: relative; z-index: 10;">
            <strong>Network B</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">192.168.2.0/24</div>
            <div id="packetB" class="packet-icon" style="display: none;">📦</div>
          </div>
          <div id="networkInternet" class="network-node router-network" data-network="Internet" style="position: relative; z-index: 10;">
            <strong>🌐 Internet</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">WAN</div>
            <div id="packetInternet" class="packet-icon" style="display: none;">📦</div>
          </div>
        </div>
        <!-- Connection lines - behind everything -->
        <svg id="routerConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
          <line id="lineA" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="lineB" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="lineInternet" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
        </svg>
      </div>
    `,
    interactive: `
      <h4>Interactive: Packet Routing</h4>
      <p>Click on a network to see how the router routes packets:</p>
      <div style="display: flex; gap: 15px; margin-top: 15px;">
        <button class="btn-secondary" onclick="simulateRouting('A')">Route to Network A</button>
        <button class="btn-secondary" onclick="simulateRouting('B')">Route to Network B</button>
        <button class="btn-secondary" onclick="simulateRouting('Internet')">Route to Internet</button>
      </div>
      <div id="routingOutput" style="margin-top: 15px; padding: 15px; background: var(--bg); border-radius: 4px; font-family: monospace; font-size: 13px;"></div>
    `
  },
  switch: {
    title: 'Switch',
    description: 'A switch connects devices within the same network and forwards data based on MAC addresses.',
    info: `
      <h3>Switch Functions</h3>
      <ul>
        <li><strong>Switching:</strong> Forwards frames to specific devices</li>
        <li><strong>MAC Address Learning:</strong> Builds a MAC address table</li>
        <li><strong>Frame Filtering:</strong> Only sends frames to intended recipient</li>
        <li><strong>Collision Domain:</strong> Creates separate collision domains per port</li>
      </ul>
      <h3>Key Features</h3>
      <ul>
        <li>Operates at Layer 2 (Data Link Layer)</li>
        <li>Uses MAC addresses for forwarding</li>
        <li>Creates a MAC address table</li>
        <li>Full-duplex communication</li>
        <li>Reduces network collisions</li>
      </ul>
    `,
    diagram: `
      <div id="switchDiagram" style="display: flex; flex-direction: column; align-items: center; gap: 30px; position: relative; padding: 20px;">
        <div id="switchNode" class="network-node switch-central" style="padding: 25px 50px; background: var(--success); color: white; position: relative; z-index: 10;">
          <strong>🔀 Switch</strong>
          <div style="font-size: 12px; margin-top: 8px;">8 Ports</div>
          <div id="macTableBadge" style="font-size: 10px; margin-top: 5px; opacity: 0.8;">MAC Table: <span id="macCount">0</span></div>
        </div>
        <div id="switchPCContainer" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; width: 100%; max-width: 600px; position: relative; z-index: 10;">
          <div id="pc1" class="network-node switch-pc" data-pc="1" data-mac="AA:BB:CC:DD:EE:01" style="position: relative; z-index: 10;">
            <strong>PC 1</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">MAC: AA:BB:CC:DD:EE:01</div>
            <div id="packetPC1" class="packet-icon" style="display: none;">📦</div>
        </div>
          <div id="pc2" class="network-node switch-pc" data-pc="2" data-mac="AA:BB:CC:DD:EE:02" style="position: relative; z-index: 10;">
            <strong>PC 2</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">MAC: AA:BB:CC:DD:EE:02</div>
            <div id="packetPC2" class="packet-icon" style="display: none;">📦</div>
          </div>
          <div id="pc3" class="network-node switch-pc" data-pc="3" data-mac="AA:BB:CC:DD:EE:03" style="position: relative; z-index: 10;">
            <strong>PC 3</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">MAC: AA:BB:CC:DD:EE:03</div>
            <div id="packetPC3" class="packet-icon" style="display: none;">📦</div>
          </div>
        </div>
        <!-- Connection lines - behind everything -->
        <svg id="switchConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
          <line id="switchLine1" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="switchLine2" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="switchLine3" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
        </svg>
      </div>
    `,
    interactive: `
      <h4>Interactive: MAC Address Learning & Frame Forwarding</h4>
      <p>Watch the switch learn MAC addresses and forward frames:</p>
      <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
        <button class="btn-secondary" onclick="simulateSwitchLearning()">Simulate Frame Forwarding</button>
        <button class="btn-secondary" onclick="resetSwitchTable()">Reset MAC Table</button>
      </div>
      <div id="switchOutput" style="margin-top: 15px; padding: 15px; background: var(--bg); border-radius: 4px; font-family: monospace; font-size: 13px; min-height: 100px;"></div>
      <div id="macTableDisplay" style="margin-top: 15px; padding: 15px; background: var(--bg-subtle); border-radius: 4px;">
        <h5 style="margin-bottom: 10px; color: var(--accent);">MAC Address Table</h5>
        <div id="macTableContent" style="font-family: monospace; font-size: 12px;">
          <div style="color: var(--text-muted);">No entries yet</div>
        </div>
      </div>
    `
  },
  server: {
    title: 'Server',
    description: 'A server provides services and resources to client devices on the network.',
    info: `
      <h3>Server Functions</h3>
      <ul>
        <li><strong>Web Server:</strong> Hosts websites and web applications</li>
        <li><strong>File Server:</strong> Stores and shares files</li>
        <li><strong>Database Server:</strong> Manages databases</li>
        <li><strong>Email Server:</strong> Handles email communication</li>
        <li><strong>DNS Server:</strong> Resolves domain names to IP addresses</li>
      </ul>
      <h3>Key Features</h3>
      <ul>
        <li>Always-on availability</li>
        <li>High processing power</li>
        <li>Large storage capacity</li>
        <li>Multiple client connections</li>
        <li>Redundancy and backup systems</li>
      </ul>
    `,
    diagram: `
      <div id="serverDiagram" style="display: flex; flex-direction: column; align-items: center; gap: 30px; position: relative; padding: 20px;">
        <div id="serverNode" class="network-node server-central" style="padding: 30px 50px; background: var(--warning); color: white; position: relative; z-index: 10;">
          <strong>🖥️ Server</strong>
          <div style="font-size: 12px; margin-top: 8px;">192.168.1.100</div>
          <div id="serverStatus" style="font-size: 10px; margin-top: 5px; opacity: 0.8;">Status: Ready</div>
        </div>
        <div id="serverClientContainer" style="display: flex; gap: 20px; margin-top: 20px; position: relative; z-index: 10;">
          <div id="client1" class="network-node server-client" data-client="1" style="position: relative; z-index: 10;">
            <strong>Client 1</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">192.168.1.10</div>
            <div id="responseClient1" class="packet-icon" style="display: none;">📦</div>
        </div>
          <div id="client2" class="network-node server-client" data-client="2" style="position: relative; z-index: 10;">
            <strong>Client 2</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">192.168.1.11</div>
            <div id="responseClient2" class="packet-icon" style="display: none;">📦</div>
          </div>
          <div id="client3" class="network-node server-client" data-client="3" style="position: relative; z-index: 10;">
            <strong>Client 3</strong>
            <div style="font-size: 11px; margin-top: 5px; color: var(--text-muted);">192.168.1.12</div>
            <div id="responseClient3" class="packet-icon" style="display: none;">📦</div>
          </div>
        </div>
        <!-- Connection lines - behind everything -->
        <svg id="serverConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
          <line id="serverLine1" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="serverLine2" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
          <line id="serverLine3" class="connection-line" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2"/>
        </svg>
      </div>
    `,
    interactive: `
      <h4>Interactive: Server Request/Response Cycle</h4>
      <p>Watch clients send requests and receive responses from the server:</p>
      <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
        <button class="btn-secondary" onclick="simulateServerRequest()">Send Request</button>
        <button class="btn-secondary" onclick="simulateMultipleRequests()">Multiple Clients</button>
      </div>
      <div id="serverOutput" style="margin-top: 15px; padding: 15px; background: var(--bg); border-radius: 4px; font-family: monospace; font-size: 13px; min-height: 100px;"></div>
    `
  }
};

function loadDevice(deviceType) {
  const device = deviceData[deviceType];
  if (!device) return;
  
  deviceDiagram.innerHTML = device.diagram;
  deviceInfo.innerHTML = device.info;
  deviceInteractive.innerHTML = device.interactive;
  
  // Update connection lines after diagram loads
  if (deviceType === 'router') {
    setTimeout(() => {
      updateRouterConnections();
    }, 100);
  } else if (deviceType === 'switch') {
    setTimeout(() => {
      updateSwitchConnections();
      resetSwitchTable();
    }, 100);
  } else if (deviceType === 'server') {
    setTimeout(() => {
      updateServerConnections();
    }, 100);
  }
  
  progressData.networkDevices[deviceType] = true;
  saveProgress('main', progressData);
}

function updateRouterConnections() {
  const routerNode = document.getElementById('routerNode');
  const networkA = document.getElementById('networkA');
  const networkB = document.getElementById('networkB');
  const networkInternet = document.getElementById('networkInternet');
  const diagram = document.getElementById('routerDiagram');
  
  if (!routerNode || !diagram) return;
  
  const routerRect = routerNode.getBoundingClientRect();
  const diagramRect = diagram.getBoundingClientRect();
  
  const routerX = routerRect.left - diagramRect.left + routerRect.width / 2;
  const routerY = routerRect.top - diagramRect.top + routerRect.height / 2;
  
  const updateLine = (lineId, network) => {
    if (!network) return;
    const line = document.getElementById(lineId);
    const networkRect = network.getBoundingClientRect();
    const networkX = networkRect.left - diagramRect.left + networkRect.width / 2;
    const networkY = networkRect.top - diagramRect.top + networkRect.height / 2;
    
    if (line) {
      line.setAttribute('x1', routerX);
      line.setAttribute('y1', routerY);
      line.setAttribute('x2', networkX);
      line.setAttribute('y2', networkY);
    }
  };
  
  updateLine('lineA', networkA);
  updateLine('lineB', networkB);
  updateLine('lineInternet', networkInternet);
}

deviceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    deviceBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadDevice(btn.dataset.device);
  });
});

// Interactive functions
window.simulateRouting = function(destination) {
  const output = document.getElementById('routingOutput');
  const routerNode = document.getElementById('routerNode');
  const routerDiagram = document.getElementById('routerDiagram');
  
  // Reset all animations
  document.querySelectorAll('.router-network').forEach(node => {
    node.classList.remove('active', 'receiving');
  });
  document.querySelectorAll('.packet-icon').forEach(packet => {
    packet.style.display = 'none';
    packet.classList.remove('packet-moving');
  });
  document.querySelectorAll('.connection-line').forEach(line => {
    line.classList.remove('active');
  });
  
  if (!routerNode) return;
  
  // Clear output and show step-by-step animation
  output.innerHTML = '';
  
  // Step 1: Packet received
  setTimeout(() => {
    output.innerHTML += `<div style="color: var(--accent); animation: fadeIn 0.3s;">📦 Packet received at router</div>`;
    routerNode.style.animation = 'pulse 0.5s ease-in-out';
  }, 100);
  
  // Step 2: Checking routing table
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">🔍 Checking routing table...</div>`;
    routerNode.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
  }, 800);
  
  // Step 3: Route decision
  setTimeout(() => {
    const routeType = destination === 'Internet' ? 'Default gateway' : 'Direct route';
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">📍 Destination: <strong>${destination}</strong></div>`;
    output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Route found: ${routeType}</div>`;
  }, 1500);
  
  // Step 4: Forwarding - animate packet movement
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">➡️ Forwarding packet to ${destination}</div>`;
    
    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      // Highlight target network - use exact match
      let targetNetwork = null;
      if (destination === 'A') {
        targetNetwork = document.getElementById('networkA');
      } else if (destination === 'B') {
        targetNetwork = document.getElementById('networkB');
      } else if (destination === 'Internet') {
        targetNetwork = document.getElementById('networkInternet');
      }
      
      if (!targetNetwork || !routerNode || !routerDiagram) return;
      
      targetNetwork.classList.add('receiving');
      
      // Wait for next frame to ensure positions are accurate
      requestAnimationFrame(() => {
        // Get bounding rectangles
        const routerRect = routerNode.getBoundingClientRect();
        const networkRect = targetNetwork.getBoundingClientRect();
        const diagramRect = routerDiagram.getBoundingClientRect();
        
        // Calculate positions relative to diagram container
        const routerX = routerRect.left - diagramRect.left + routerRect.width / 2;
        const routerY = routerRect.top - diagramRect.top + routerRect.height / 2;
        const networkX = networkRect.left - diagramRect.left + networkRect.width / 2;
        const networkY = networkRect.top - diagramRect.top + networkRect.height / 2;
        
        // Calculate movement delta
        const deltaX = networkX - routerX;
        const deltaY = networkY - routerY;
        
        // Create unique animation name for this route
        const animationName = `movePacket_${destination}_${Date.now()}`;
        
        // Add animation keyframes dynamically
        if (!document.getElementById('packetAnimation')) {
          const style = document.createElement('style');
          style.id = 'packetAnimation';
          document.head.appendChild(style);
        }
        
        const styleElement = document.getElementById('packetAnimation');
        if (styleElement && !styleElement.textContent.includes(animationName)) {
          styleElement.textContent += `
            @keyframes ${animationName} {
              from {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              50% {
                transform: translate(${deltaX / 2}px, ${deltaY / 2}px) scale(1.2);
                opacity: 1;
              }
              to {
                transform: translate(${deltaX}px, ${deltaY}px) scale(0.8);
                opacity: 0;
              }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-5px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `;
        }
        
        // Create floating packet
        const packet = document.createElement('div');
        packet.className = 'packet-animated';
        packet.innerHTML = '📦';
        packet.style.cssText = `
          position: absolute;
          left: ${routerX}px;
          top: ${routerY}px;
          font-size: 24px;
          z-index: 50;
          pointer-events: none;
          animation: ${animationName} 1.5s ease-in-out forwards;
        `;
        
        routerDiagram.appendChild(packet);
        
        // Update connection line
        const lineId = destination === 'A' ? 'lineA' : destination === 'B' ? 'lineB' : 'lineInternet';
        const line = document.getElementById(lineId);
        if (line) {
          line.setAttribute('x1', routerX);
          line.setAttribute('y1', routerY);
          line.setAttribute('x2', networkX);
          line.setAttribute('y2', networkY);
          line.classList.add('active');
          line.setAttribute('stroke', 'var(--accent)');
          line.setAttribute('stroke-width', '3');
        }
        
        // Remove packet after animation
        setTimeout(() => {
          packet.remove();
          targetNetwork.classList.remove('receiving');
          targetNetwork.classList.add('active');
          routerNode.style.boxShadow = '';
          routerNode.style.animation = '';
          
          // Show packet at destination
          const destPacketId = destination === 'A' ? 'packetA' : destination === 'B' ? 'packetB' : 'packetInternet';
          const destPacket = document.getElementById(destPacketId);
          if (destPacket) {
            destPacket.style.display = 'block';
            destPacket.style.animation = 'bounceIn 0.5s ease-out';
          }
          
          output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Packet delivered to ${destination}!</div>`;
        }, 1500);
      });
    });
  }, 2300);
};

// Switch MAC address table state
let switchMacTable = {};
let switchAnimationInProgress = false;

window.resetSwitchTable = function() {
  switchMacTable = {};
  const macTableContent = document.getElementById('macTableContent');
  const macCount = document.getElementById('macCount');
  if (macTableContent) {
    macTableContent.innerHTML = '<div style="color: var(--text-muted);">No entries yet</div>';
  }
  if (macCount) {
    macCount.textContent = '0';
  }
  document.querySelectorAll('.switch-pc').forEach(pc => {
    pc.classList.remove('active', 'sending', 'receiving');
  });
  document.querySelectorAll('.packet-icon').forEach(packet => {
    packet.style.display = 'none';
  });
}

function updateMacTableDisplay() {
  const macTableContent = document.getElementById('macTableContent');
  const macCount = document.getElementById('macCount');
  
  if (!macTableContent) return;
  
  const entries = Object.keys(switchMacTable);
  if (entries.length === 0) {
    macTableContent.innerHTML = '<div style="color: var(--text-muted);">No entries yet</div>';
  } else {
    macTableContent.innerHTML = entries.map(mac => {
      const port = switchMacTable[mac];
      return `<div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--border);">
        <span>${mac}</span>
        <span style="color: var(--accent);">${port}</span>
      </div>`;
    }).join('');
  }
  
  if (macCount) {
    macCount.textContent = entries.length;
  }
}

window.simulateSwitchLearning = function() {
  if (switchAnimationInProgress) return;
  
  const output = document.getElementById('switchOutput');
  const switchNode = document.getElementById('switchNode');
  const switchDiagram = document.getElementById('switchDiagram');
  
  if (!output || !switchNode || !switchDiagram) return;
  
  switchAnimationInProgress = true;
  
  // Reset visual states
  document.querySelectorAll('.switch-pc').forEach(pc => {
    pc.classList.remove('active', 'sending', 'receiving');
  });
  document.querySelectorAll('.packet-icon').forEach(packet => {
    packet.style.display = 'none';
  });
  document.querySelectorAll('.connection-line').forEach(line => {
    line.classList.remove('active');
  });
  
  // Clear output
  output.innerHTML = '';
  
  // Randomly select source and destination PCs
  const pcs = ['1', '2', '3'];
  const sourcePC = pcs[Math.floor(Math.random() * pcs.length)];
  const destPCs = pcs.filter(pc => pc !== sourcePC);
  const destPC = destPCs[Math.floor(Math.random() * destPCs.length)];
  
  const sourceElement = document.getElementById(`pc${sourcePC}`);
  const destElement = document.getElementById(`pc${destPC}`);
  const sourceMAC = sourceElement?.dataset.mac || '';
  const destMAC = destElement?.dataset.mac || '';
  
  if (!sourceElement || !destElement) {
    switchAnimationInProgress = false;
    return;
  }
  
  // Step 1: Frame sent from source PC
    setTimeout(() => {
    output.innerHTML += `<div style="color: var(--accent); animation: fadeIn 0.3s;">📤 PC ${sourcePC} sends frame to ${destMAC}</div>`;
    sourceElement.classList.add('sending');
    
    requestAnimationFrame(() => {
      updateSwitchConnections();
    });
  }, 100);
  
  // Step 2: Switch receives frame
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">📥 Switch receives frame on Port ${sourcePC}</div>`;
    switchNode.style.animation = 'pulse 0.5s ease-in-out';
    switchNode.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
    
    // Animate frame from source to switch
    animateFrameForwarding(sourceElement, switchNode, switchDiagram, sourcePC, 'switch');
  }, 800);
  
  // Step 3: Switch learns source MAC address
  setTimeout(() => {
    if (!switchMacTable[sourceMAC]) {
      switchMacTable[sourceMAC] = `Port ${sourcePC}`;
      output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✓ Learned: ${sourceMAC} → Port ${sourcePC}</div>`;
      updateMacTableDisplay();
    } else {
      output.innerHTML += `<div style="animation: fadeIn 0.3s;">ℹ️ Already know: ${sourceMAC} → Port ${sourcePC}</div>`;
    }
  }, 2000);
  
  // Step 4: Switch checks MAC table for destination
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">🔍 Checking MAC table for ${destMAC}...</div>`;
  }, 2800);
  
  // Step 5: Forwarding decision
  setTimeout(() => {
    const knownPort = switchMacTable[destMAC];
    
    if (knownPort) {
      output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Found: ${destMAC} → ${knownPort}</div>`;
      output.innerHTML += `<div style="animation: fadeIn 0.3s;">➡️ Forwarding frame to ${knownPort} only</div>`;
      
      // Forward to specific port
      setTimeout(() => {
        destElement.classList.add('receiving');
        animateFrameForwarding(switchNode, destElement, switchDiagram, 'switch', destPC);
        
        setTimeout(() => {
          destElement.classList.remove('receiving');
          destElement.classList.add('active');
          
          // Show packet at destination
          const destPacket = document.getElementById(`packetPC${destPC}`);
          if (destPacket) {
            destPacket.style.display = 'block';
            destPacket.style.animation = 'bounceIn 0.5s ease-out';
          }
          
          output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Frame delivered to PC ${destPC}!</div>`;
          
          switchNode.style.boxShadow = '';
          switchNode.style.animation = '';
          sourceElement.classList.remove('sending');
          switchAnimationInProgress = false;
        }, 1500);
      }, 500);
    } else {
      output.innerHTML += `<div style="color: var(--warning); animation: fadeIn 0.3s;">❓ Unknown MAC address</div>`;
      output.innerHTML += `<div style="animation: fadeIn 0.3s;">📢 Broadcasting frame to all ports (flooding)</div>`;
      
      // Flood to all ports except source
      pcs.forEach((pcNum, i) => {
        if (pcNum !== sourcePC) {
          setTimeout(() => {
            const pc = document.getElementById(`pc${pcNum}`);
            if (pc) {
              pc.classList.add('receiving');
              animateFrameForwarding(switchNode, pc, switchDiagram, 'switch', pcNum);
              
              setTimeout(() => {
                pc.classList.remove('receiving');
                if (pcNum === destPC) {
                  pc.classList.add('active');
                  const destPacket = document.getElementById(`packetPC${pcNum}`);
                  if (destPacket) {
                    destPacket.style.display = 'block';
                    destPacket.style.animation = 'bounceIn 0.5s ease-out';
                  }
                }
              }, 800);
            }
          }, i * 300);
        }
      });
      
      setTimeout(() => {
        // Learn destination MAC when it responds
        switchMacTable[destMAC] = `Port ${destPC}`;
        output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✓ Learned: ${destMAC} → Port ${destPC}</div>`;
        updateMacTableDisplay();
        
        output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Frame delivered via broadcast!</div>`;
        switchNode.style.boxShadow = '';
        switchNode.style.animation = '';
        sourceElement.classList.remove('sending');
        switchAnimationInProgress = false;
      }, 2000);
    }
  }, 3500);
};

function animateFrameForwarding(source, dest, container, sourceId, destId) {
  if (!source || !dest || !container) return;
  
  requestAnimationFrame(() => {
    const sourceRect = source.getBoundingClientRect();
    const destRect = dest.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
    const destX = destRect.left - containerRect.left + destRect.width / 2;
    const destY = destRect.top - containerRect.top + destRect.height / 2;
    
    const deltaX = destX - sourceX;
    const deltaY = destY - sourceY;
    const animationName = `switchFrame_${sourceId}_${destId}_${Date.now()}`;
    
    // Add animation
    if (!document.getElementById('switchAnimation')) {
      const style = document.createElement('style');
      style.id = 'switchAnimation';
      document.head.appendChild(style);
    }
    
    const styleElement = document.getElementById('switchAnimation');
    if (styleElement && !styleElement.textContent.includes(animationName)) {
      styleElement.textContent += `
        @keyframes ${animationName} {
          from {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(${deltaX / 2}px, ${deltaY / 2}px) scale(1.2);
            opacity: 1;
          }
          to {
            transform: translate(${deltaX}px, ${deltaY}px) scale(0.8);
            opacity: 0;
          }
        }
      `;
    }
    
    // Create animated frame
    const frame = document.createElement('div');
    frame.className = 'packet-animated';
    frame.innerHTML = '📦';
    frame.style.cssText = `
      position: absolute;
      left: ${sourceX}px;
      top: ${sourceY}px;
      font-size: 20px;
      z-index: 50;
      pointer-events: none;
      animation: ${animationName} 1s ease-in-out forwards;
    `;
    
    container.appendChild(frame);
    
    // Update connection line
    const lineId = `switchLine${destId}`;
    const line = document.getElementById(lineId);
    if (line) {
      line.setAttribute('x1', sourceX);
      line.setAttribute('y1', sourceY);
      line.setAttribute('x2', destX);
      line.setAttribute('y2', destY);
      line.classList.add('active');
      line.setAttribute('stroke', 'var(--success)');
      line.setAttribute('stroke-width', '3');
    }
    
    setTimeout(() => {
      frame.remove();
      if (line) {
        line.classList.remove('active');
      }
    }, 1000);
  });
}

function updateSwitchConnections() {
  const switchNode = document.getElementById('switchNode');
  const pc1 = document.getElementById('pc1');
  const pc2 = document.getElementById('pc2');
  const pc3 = document.getElementById('pc3');
  const diagram = document.getElementById('switchDiagram');
  
  if (!switchNode || !diagram) return;
  
  const switchRect = switchNode.getBoundingClientRect();
  const diagramRect = diagram.getBoundingClientRect();
  
  const switchX = switchRect.left - diagramRect.left + switchRect.width / 2;
  const switchY = switchRect.top - diagramRect.top + switchRect.height / 2;
  
  const updateLine = (lineId, pc) => {
    if (!pc) return;
    const line = document.getElementById(lineId);
    const pcRect = pc.getBoundingClientRect();
    const pcX = pcRect.left - diagramRect.left + pcRect.width / 2;
    const pcY = pcRect.top - diagramRect.top + pcRect.height / 2;
    
    if (line) {
      line.setAttribute('x1', switchX);
      line.setAttribute('y1', switchY);
      line.setAttribute('x2', pcX);
      line.setAttribute('y2', pcY);
    }
  };
  
  updateLine('switchLine1', pc1);
  updateLine('switchLine2', pc2);
  updateLine('switchLine3', pc3);
}

let serverAnimationInProgress = false;

window.simulateServerRequest = function() {
  if (serverAnimationInProgress) return;
  
  const output = document.getElementById('serverOutput');
  const serverNode = document.getElementById('serverNode');
  const serverDiagram = document.getElementById('serverDiagram');
  const serverStatus = document.getElementById('serverStatus');
  
  if (!output || !serverNode || !serverDiagram) return;
  
  serverAnimationInProgress = true;
  
  // Reset visual states
  document.querySelectorAll('.server-client').forEach(client => {
    client.classList.remove('active', 'sending', 'receiving');
  });
  document.querySelectorAll('.packet-icon').forEach(packet => {
    packet.style.display = 'none';
  });
  document.querySelectorAll('.connection-line').forEach(line => {
    line.classList.remove('active');
  });
  
  // Clear output
  output.innerHTML = '';
  
  // Randomly select a client
  const clients = ['1', '2', '3'];
  const clientId = clients[Math.floor(Math.random() * clients.length)];
  const clientElement = document.getElementById(`client${clientId}`);
  
  if (!clientElement) {
    serverAnimationInProgress = false;
    return;
  }
  
  // Step 1: Client sends request
  setTimeout(() => {
    output.innerHTML += `<div style="color: var(--accent); animation: fadeIn 0.3s;">📤 Client ${clientId} sends request to server</div>`;
    clientElement.classList.add('sending');
    if (serverStatus) {
      serverStatus.textContent = 'Status: Receiving...';
    }
    
    requestAnimationFrame(() => {
      updateServerConnections();
    });
  }, 100);
  
  // Step 2: Request arrives at server
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">📥 Request received at server</div>`;
    serverNode.style.animation = 'pulse 0.5s ease-in-out';
    serverNode.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
    
    // Animate request packet
    animateRequestResponse(clientElement, serverNode, serverDiagram, clientId, 'server', 'request');
  }, 800);
  
  // Step 3: Server processes request
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">🔍 Processing request...</div>`;
    if (serverStatus) {
      serverStatus.textContent = 'Status: Processing...';
    }
    serverNode.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.7)';
  }, 2000);
  
  // Step 4: Server accesses data
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">💾 Accessing database...</div>`;
    serverNode.style.animation = 'pulse 0.3s ease-in-out 3';
  }, 3000);
  
  // Step 5: Server prepares response
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">📦 Preparing response...</div>`;
    if (serverStatus) {
      serverStatus.textContent = 'Status: Responding...';
    }
  }, 4000);
  
  // Step 6: Server sends response
  setTimeout(() => {
    output.innerHTML += `<div style="animation: fadeIn 0.3s;">📤 Sending response to Client ${clientId}...</div>`;
    
    // Animate response packet
    animateRequestResponse(serverNode, clientElement, serverDiagram, 'server', clientId, 'response');
    
    clientElement.classList.remove('sending');
    clientElement.classList.add('receiving');
  }, 5000);
  
  // Step 7: Response delivered
  setTimeout(() => {
    clientElement.classList.remove('receiving');
    clientElement.classList.add('active');
    
    const responsePacket = document.getElementById(`responseClient${clientId}`);
    if (responsePacket) {
      responsePacket.style.display = 'block';
      responsePacket.style.animation = 'bounceIn 0.5s ease-out';
    }
    
    output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ Response delivered: 200 OK</div>`;
    
    serverNode.style.boxShadow = '';
    serverNode.style.animation = '';
    if (serverStatus) {
      serverStatus.textContent = 'Status: Ready';
    }
    serverAnimationInProgress = false;
  }, 6000);
};

window.simulateMultipleRequests = function() {
  if (serverAnimationInProgress) return;
  
  serverAnimationInProgress = true;
  const output = document.getElementById('serverOutput');
  const serverNode = document.getElementById('serverNode');
  const serverStatus = document.getElementById('serverStatus');
  
  if (!output || !serverNode) {
    serverAnimationInProgress = false;
    return;
  }
  
  // Reset states
  document.querySelectorAll('.server-client').forEach(client => {
    client.classList.remove('active', 'sending', 'receiving');
  });
  document.querySelectorAll('.packet-icon').forEach(packet => {
    packet.style.display = 'none';
  });
  
  output.innerHTML = '';
  output.innerHTML += `<div style="color: var(--accent); animation: fadeIn 0.3s;">🔄 Simulating multiple client requests...</div>`;
  
  const clients = ['1', '2', '3'];
  let delay = 1000;
  
  clients.forEach((clientId, index) => {
    setTimeout(() => {
      const client = document.getElementById(`client${clientId}`);
      if (!client) return;
      
      // Client sends request
      client.classList.add('sending');
      output.innerHTML += `<div style="animation: fadeIn 0.3s;">📤 Client ${clientId} sends request</div>`;
      
      // Request arrives
      setTimeout(() => {
        client.classList.remove('sending');
        if (serverStatus) {
          serverStatus.textContent = `Status: Processing (${index + 1}/3)`;
        }
        serverNode.style.animation = 'pulse 0.4s ease-in-out';
        serverNode.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
      }, 500);
      
      // Response sent
      setTimeout(() => {
        client.classList.add('receiving');
        output.innerHTML += `<div style="animation: fadeIn 0.3s;">📦 Response sent to Client ${clientId}</div>`;
      }, 1200);
      
      // Response delivered
      setTimeout(() => {
        client.classList.remove('receiving');
        client.classList.add('active');
        const responsePacket = document.getElementById(`responseClient${clientId}`);
        if (responsePacket) {
          responsePacket.style.display = 'block';
          responsePacket.style.animation = 'bounceIn 0.5s ease-out';
        }
      }, 1800);
    }, delay);
    
    delay += 800;
  });
  
  setTimeout(() => {
    output.innerHTML += `<div style="color: var(--success); animation: fadeIn 0.3s;">✅ All requests processed successfully!</div>`;
    serverNode.style.boxShadow = '';
    serverNode.style.animation = '';
    if (serverStatus) {
      serverStatus.textContent = 'Status: Ready';
    }
    serverAnimationInProgress = false;
  }, delay + 1000);
};

function animateRequestResponse(source, dest, container, sourceId, destId, type) {
  if (!source || !dest || !container) return;
  
  requestAnimationFrame(() => {
    const sourceRect = source.getBoundingClientRect();
    const destRect = dest.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;
    const destX = destRect.left - containerRect.left + destRect.width / 2;
    const destY = destRect.top - containerRect.top + destRect.height / 2;
    
    const deltaX = destX - sourceX;
    const deltaY = destY - sourceY;
    const animationName = `serverPacket_${sourceId}_${destId}_${type}_${Date.now()}`;
    const packetIcon = type === 'request' ? '📥' : '📤';
    const packetColor = type === 'request' ? 'var(--accent)' : 'var(--success)';
    
    // Add animation
    if (!document.getElementById('serverAnimation')) {
      const style = document.createElement('style');
      style.id = 'serverAnimation';
      document.head.appendChild(style);
    }
    
    const styleElement = document.getElementById('serverAnimation');
    if (styleElement && !styleElement.textContent.includes(animationName)) {
      styleElement.textContent += `
        @keyframes ${animationName} {
          from {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(${deltaX / 2}px, ${deltaY / 2}px) scale(1.3);
            opacity: 1;
          }
          to {
            transform: translate(${deltaX}px, ${deltaY}px) scale(0.8);
            opacity: 0;
          }
        }
      `;
    }
    
    // Create animated packet
    const packet = document.createElement('div');
    packet.className = 'packet-animated';
    packet.innerHTML = packetIcon;
    packet.style.cssText = `
      position: absolute;
      left: ${sourceX}px;
      top: ${sourceY}px;
      font-size: 24px;
      z-index: 50;
      pointer-events: none;
      animation: ${animationName} 1.2s ease-in-out forwards;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    `;
    
    container.appendChild(packet);
    
    // Update connection line
    const lineId = `serverLine${destId === 'server' ? sourceId : destId}`;
    const line = document.getElementById(lineId);
    if (line) {
      line.setAttribute('x1', sourceX);
      line.setAttribute('y1', sourceY);
      line.setAttribute('x2', destX);
      line.setAttribute('y2', destY);
      line.classList.add('active');
      const lineColor = type === 'request' ? 'rgb(59, 130, 246)' : 'rgb(251, 191, 36)';
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', '3');
    }
    
    setTimeout(() => {
      packet.remove();
      if (line) {
        line.classList.remove('active');
      }
    }, 1200);
  });
}

function updateServerConnections() {
  const serverNode = document.getElementById('serverNode');
  const client1 = document.getElementById('client1');
  const client2 = document.getElementById('client2');
  const client3 = document.getElementById('client3');
  const diagram = document.getElementById('serverDiagram');
  
  if (!serverNode || !diagram) return;
  
  const serverRect = serverNode.getBoundingClientRect();
  const diagramRect = diagram.getBoundingClientRect();
  
  const serverX = serverRect.left - diagramRect.left + serverRect.width / 2;
  const serverY = serverRect.top - diagramRect.top + serverRect.height / 2;
  
  const updateLine = (lineId, client) => {
    if (!client) return;
    const line = document.getElementById(lineId);
    const clientRect = client.getBoundingClientRect();
    const clientX = clientRect.left - diagramRect.left + clientRect.width / 2;
    const clientY = clientRect.top - diagramRect.top + clientRect.height / 2;
    
    if (line) {
      line.setAttribute('x1', serverX);
      line.setAttribute('y1', serverY);
      line.setAttribute('x2', clientX);
      line.setAttribute('y2', clientY);
    }
  };
  
  updateLine('serverLine1', client1);
  updateLine('serverLine2', client2);
  updateLine('serverLine3', client3);
}

// Initialize
loadDevice('router');

// ==================== HARDWARE TAB ====================

const hardwareBtns = document.querySelectorAll('.hardware-btn');
const hardwareVisualization = document.getElementById('hardwareVisualization');
const workloadSlider = document.getElementById('workloadSlider');
const workloadValue = document.getElementById('workloadValue');
const runWorkloadBtn = document.getElementById('runWorkloadBtn');
const resetHardwareBtn = document.getElementById('resetHardwareBtn');
const hardwareStats = document.getElementById('hardwareStats');

let currentHardware = 'cpu';
let workloadInterval = null;

workloadSlider.addEventListener('input', (e) => {
  workloadValue.textContent = e.target.value + '%';
});

function loadHardware(hardwareType) {
  currentHardware = hardwareType;
  clearInterval(workloadInterval);
  
  switch(hardwareType) {
    case 'cpu':
      renderCPU();
      break;
    case 'ram':
      renderRAM();
      break;
    case 'storage':
      renderStorage();
      break;
    case 'overview':
      renderOverview();
      break;
  }
  
  updateHardwareStats();
  progressData.hardware[hardwareType] = true;
  saveProgress('main', progressData);
}

function renderCPU() {
  hardwareVisualization.innerHTML = `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 20px; color: var(--accent);">CPU (Central Processing Unit)</h3>
      
      <!-- CPU Package with Cores -->
      <div style="max-width: 700px; margin: 0 auto 30px;">
        <div class="cpu-package" style="padding: 25px; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-subtle) 100%); border: 3px solid var(--accent); border-radius: 12px; position: relative;">
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 15px; font-weight: 600;">CPU Package</div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
        ${Array.from({ length: 4 }, (_, i) => `
              <div class="cpu-core" id="core${i}" style="position: relative;">
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Core ${i + 1}</div>
                <div style="font-size: 24px; font-weight: 700; margin-bottom: 5px;" id="coreUsage${i}">0%</div>
                <div class="cpu-activity-indicator" id="coreActivity${i}" style="height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 8px;">
                  <div class="cpu-activity-bar" style="height: 100%; width: 0%; background: var(--accent); transition: width 0.3s;"></div>
                </div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 5px;" id="coreSpeed${i}">3.5 GHz</div>
          </div>
        `).join('')}
      </div>
          
          <!-- Cache Visualization -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border);">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; font-weight: 600;">CPU Cache</div>
            <div style="display: flex; justify-content: space-around; gap: 10px;">
              <div style="flex: 1; padding: 10px; background: var(--bg); border: 2px solid var(--border); border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 5px;">L1 Cache</div>
                <div style="font-size: 16px; font-weight: 700; color: var(--accent);" id="l1Cache">32 KB</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 3px;">Fastest</div>
              </div>
              <div style="flex: 1; padding: 10px; background: var(--bg); border: 2px solid var(--border); border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 5px;">L2 Cache</div>
                <div style="font-size: 16px; font-weight: 700; color: var(--accent);" id="l2Cache">256 KB</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 3px;">Fast</div>
              </div>
              <div style="flex: 1; padding: 10px; background: var(--bg); border: 2px solid var(--border); border-radius: 6px;">
                <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 5px;">L3 Cache</div>
                <div style="font-size: 16px; font-weight: 700; color: var(--accent);" id="l3Cache">8 MB</div>
                <div style="font-size: 9px; color: var(--text-muted); margin-top: 3px;">Shared</div>
              </div>
            </div>
          </div>
          
          <!-- Instruction Pipeline Visualization -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border);">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; font-weight: 600;">Instruction Pipeline</div>
            <div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;" id="instructionPipeline">
              ${Array.from({ length: 5 }, (_, i) => `
                <div class="pipeline-stage" id="pipelineStage${i}" style="width: 60px; padding: 8px; background: var(--bg); border: 2px solid var(--border); border-radius: 4px; text-align: center; font-size: 10px;">
                  <div style="color: var(--text-muted); margin-bottom: 3px;">${['Fetch', 'Decode', 'Execute', 'Memory', 'Write'][i]}</div>
                  <div class="pipeline-instruction" style="font-size: 9px; color: var(--text-muted);">-</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: var(--bg); border-radius: 6px; text-align: left;">
        <h4 style="color: var(--accent); margin-bottom: 10px;">CPU Information</h4>
        <ul style="line-height: 2;">
          <li><strong>Function:</strong> Executes instructions and processes data</li>
          <li><strong>Cores:</strong> Multiple cores allow parallel processing</li>
          <li><strong>Clock Speed:</strong> Measured in GHz (billions of cycles per second)</li>
          <li><strong>Cache:</strong> Fast memory for frequently used data (L1, L2, L3)</li>
          <li><strong>Pipeline:</strong> Processes multiple instructions simultaneously</li>
        </ul>
      </div>
    </div>
  `;
}

function renderRAM() {
  const totalBlocks = 64;
  hardwareVisualization.innerHTML = `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 20px; color: var(--accent);">RAM (Random Access Memory)</h3>
      
      <!-- RAM Memory Map -->
      <div style="max-width: 700px; margin: 0 auto 30px;">
        <div class="ram-container" style="padding: 20px; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-subtle) 100%); border: 3px solid var(--success); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="font-size: 14px; color: var(--text-muted); font-weight: 600;">Memory Map (64 blocks = 8 GB)</div>
            <div style="display: flex; gap: 15px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 2px;"></div>
                <span style="color: var(--text-muted);">Free</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: var(--accent); border-radius: 2px;"></div>
                <span style="color: var(--text-muted);">Used</span>
              </div>
              <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 12px; height: 12px; background: var(--warning); border-radius: 2px;"></div>
                <span style="color: var(--text-muted);">Active</span>
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-bottom: 15px;">
        ${Array.from({ length: totalBlocks }, (_, i) => `
              <div class="ram-block" id="ramBlock${i}" data-index="${i}" style="position: relative;">
                <div style="font-size: 9px; opacity: 0.7;">${i}</div>
                <div class="ram-data-indicator" style="width: 100%; height: 6px; margin-top: 2px; background: transparent; border-radius: 1px;"></div>
          </div>
        `).join('')}
      </div>
          
          <!-- Memory Allocation Display -->
          <div style="padding-top: 15px; border-top: 2px solid var(--border);">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px; font-weight: 600;">Active Programs</div>
            <div id="memoryPrograms" style="display: flex; flex-direction: column; gap: 8px; text-align: left; font-size: 11px;">
              <div style="color: var(--text-muted);">No programs running</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: var(--bg); border-radius: 6px; text-align: left;">
        <h4 style="color: var(--accent); margin-bottom: 10px;">RAM Information</h4>
        <ul style="line-height: 2;">
          <li><strong>Function:</strong> Temporary storage for running programs</li>
          <li><strong>Speed:</strong> Much faster than storage (SSD/HDD)</li>
          <li><strong>Volatile:</strong> Data is lost when power is off</li>
          <li><strong>Capacity:</strong> Typically 4GB - 32GB in modern systems</li>
          <li><strong>Access:</strong> Random access allows reading/writing anywhere instantly</li>
        </ul>
      </div>
    </div>
  `;
}

function renderStorage() {
  hardwareVisualization.innerHTML = `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 20px; color: var(--accent);">Storage</h3>
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 700px; margin: 0 auto;">
        
        <!-- HDD Visualization -->
        <div class="storage-device" style="padding: 25px; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-subtle) 100%); border: 3px solid var(--warning); border-radius: 12px; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <h4 style="color: var(--warning); margin: 0;">💿 Hard Disk Drive (HDD)</h4>
            <div id="hddActivity" class="storage-activity" style="display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted);">
              <span>⚪ Idle</span>
            </div>
            </div>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
              <span>Used: <strong id="hddUsed">450 GB</strong></span>
              <span>Free: <strong id="hddFree">50 GB</strong></span>
              <span>Total: <strong>500 GB</strong></span>
          </div>
            <div style="position: relative; height: 40px; background: var(--bg); border-radius: 6px; overflow: hidden; border: 2px solid var(--border);">
              <div id="hddUsedBar" class="storage-bar used" style="position: absolute; left: 0; top: 0; height: 100%; width: 90%; background: linear-gradient(90deg, var(--warning) 0%, #f59e0b 100%); transition: width 0.3s;"></div>
              <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text);">90% Used</div>
        </div>
            </div>
          
          <!-- HDD Platters Visualization -->
          <div style="display: flex; justify-content: center; gap: 20px; padding: 15px; background: var(--bg); border-radius: 6px;">
            ${Array.from({ length: 3 }, (_, i) => `
              <div class="hdd-platter" id="hddPlatter${i}" style="width: 50px; height: 50px; border: 3px solid var(--border); border-radius: 50%; background: radial-gradient(circle, var(--bg-subtle) 0%, var(--bg) 100%); position: relative; transition: transform 0.3s;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: var(--accent); border-radius: 50%;"></div>
            </div>
            `).join('')}
          </div>
          
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">
            <strong>Speed:</strong> 7200 RPM | <strong>Interface:</strong> SATA 3
        </div>
      </div>
        
        <!-- SSD Visualization -->
        <div class="storage-device" style="padding: 25px; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-subtle) 100%); border: 3px solid var(--success); border-radius: 12px; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <h4 style="color: var(--success); margin: 0;">⚡ Solid State Drive (SSD)</h4>
            <div id="ssdActivity" class="storage-activity" style="display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted);">
              <span>⚪ Idle</span>
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
              <span>Used: <strong id="ssdUsed">200 GB</strong></span>
              <span>Free: <strong id="ssdFree">300 GB</strong></span>
              <span>Total: <strong>500 GB</strong></span>
            </div>
            <div style="position: relative; height: 40px; background: var(--bg); border-radius: 6px; overflow: hidden; border: 2px solid var(--border);">
              <div id="ssdUsedBar" class="storage-bar used" style="position: absolute; left: 0; top: 0; height: 100%; width: 40%; background: linear-gradient(90deg, var(--success) 0%, #10b981 100%); transition: width 0.3s;"></div>
              <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text);">40% Used</div>
            </div>
          </div>
          
          <!-- SSD Memory Chips Visualization -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 15px; background: var(--bg); border-radius: 6px;">
            ${Array.from({ length: 8 }, (_, i) => `
              <div class="ssd-chip" id="ssdChip${i}" style="padding: 10px; background: var(--bg-subtle); border: 2px solid var(--border); border-radius: 4px; text-align: center; font-size: 9px; transition: all 0.3s;">
                <div style="color: var(--text-muted);">NAND</div>
                <div style="color: var(--success); font-weight: 600; margin-top: 3px;">64GB</div>
              </div>
            `).join('')}
          </div>
          
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">
            <strong>Speed:</strong> 550 MB/s Read | <strong>Interface:</strong> NVMe
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: var(--bg); border-radius: 6px; text-align: left;">
        <h4 style="color: var(--accent); margin-bottom: 10px;">Storage Information</h4>
        <ul style="line-height: 2;">
          <li><strong>HDD:</strong> Mechanical, slower, cheaper, larger capacity</li>
          <li><strong>SSD:</strong> Electronic, faster, more expensive, smaller capacity</li>
          <li><strong>Function:</strong> Permanent storage for files and programs</li>
          <li><strong>Non-volatile:</strong> Data persists when power is off</li>
          <li><strong>Read/Write:</strong> Data is accessed and modified through read/write operations</li>
        </ul>
      </div>
    </div>
  `;
}

function renderOverview() {
  hardwareVisualization.innerHTML = `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 30px; color: var(--accent);">Computer System Overview</h3>
      
      <!-- System Diagram with Data Flow -->
      <div style="max-width: 900px; margin: 0 auto 30px; position: relative;">
        <div class="system-diagram" style="padding: 30px; background: linear-gradient(135deg, var(--bg) 0%, var(--bg-subtle) 100%); border: 3px solid var(--border); border-radius: 16px;">
          
          <!-- Top Row: CPU -->
          <div style="display: flex; justify-content: center; margin-bottom: 40px;">
            <div id="overviewCPU" class="overview-component" style="padding: 25px 40px; background: var(--bg); border: 3px solid var(--accent); border-radius: 12px; position: relative; z-index: 10;">
              <div style="font-size: 36px; margin-bottom: 8px;">⚙️</div>
              <h4 style="color: var(--accent); margin-bottom: 5px;">CPU</h4>
              <div style="font-size: 11px; color: var(--text-muted);">Processes instructions</div>
              <div id="overviewCPUUsage" style="font-size: 14px; font-weight: 700; color: var(--accent); margin-top: 8px;">0%</div>
        </div>
        </div>
          
          <!-- Middle Row: RAM -->
          <div style="display: flex; justify-content: center; margin-bottom: 40px; position: relative;">
            <!-- Data Flow Arrows -->
            <svg id="dataFlowArrows" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 5;">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                  <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
                </marker>
              </defs>
              <!-- CPU to RAM -->
              <line id="cpuToRam" x1="0" y1="0" x2="0" y2="0" stroke="var(--accent)" stroke-width="3" marker-end="url(#arrowhead)" style="opacity: 0; transition: opacity 0.3s;"></line>
              <!-- RAM to CPU -->
              <line id="ramToCpu" x1="0" y1="0" x2="0" y2="0" stroke="var(--success)" stroke-width="3" marker-end="url(#arrowhead)" style="opacity: 0; transition: opacity 0.3s;"></line>
              <!-- Storage to RAM -->
              <line id="storageToRam" x1="0" y1="0" x2="0" y2="0" stroke="var(--warning)" stroke-width="3" marker-end="url(#arrowhead)" style="opacity: 0; transition: opacity 0.3s;"></line>
              <!-- RAM to Storage -->
              <line id="ramToStorage" x1="0" y1="0" x2="0" y2="0" stroke="var(--warning)" stroke-width="3" marker-end="url(#arrowhead)" style="opacity: 0; transition: opacity 0.3s;"></line>
            </svg>
            
            <div id="overviewRAM" class="overview-component" style="padding: 25px 40px; background: var(--bg); border: 3px solid var(--success); border-radius: 12px; position: relative; z-index: 10;">
              <div style="font-size: 36px; margin-bottom: 8px;">💾</div>
              <h4 style="color: var(--success); margin-bottom: 5px;">RAM</h4>
              <div style="font-size: 11px; color: var(--text-muted);">Temporary storage</div>
              <div id="overviewRAMUsage" style="font-size: 14px; font-weight: 700; color: var(--success); margin-top: 8px;">0%</div>
        </div>
      </div>
          
          <!-- Bottom Row: Storage -->
          <div style="display: flex; justify-content: center; gap: 30px;">
            <div id="overviewStorage" class="overview-component" style="padding: 25px 40px; background: var(--bg); border: 3px solid var(--warning); border-radius: 12px; position: relative; z-index: 10;">
              <div style="font-size: 36px; margin-bottom: 8px;">💿</div>
              <h4 style="color: var(--warning); margin-bottom: 5px;">Storage</h4>
              <div style="font-size: 11px; color: var(--text-muted);">Permanent storage</div>
              <div id="overviewStorageUsage" style="font-size: 14px; font-weight: 700; color: var(--warning); margin-top: 8px;">90%</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Data Flow Steps -->
      <div style="margin-top: 30px; padding: 20px; background: var(--bg); border-radius: 6px; text-align: left;">
        <h4 style="color: var(--accent); margin-bottom: 15px;">How They Work Together</h4>
        <div id="dataFlowSteps" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="flow-step" data-step="1" style="padding: 12px; background: var(--bg-subtle); border-left: 4px solid var(--warning); border-radius: 4px; opacity: 0.5; transition: all 0.3s;">
            <strong style="color: var(--warning);">1. Load:</strong> CPU requests data from storage
          </div>
          <div class="flow-step" data-step="2" style="padding: 12px; background: var(--bg-subtle); border-left: 4px solid var(--success); border-radius: 4px; opacity: 0.5; transition: all 0.3s;">
            <strong style="color: var(--success);">2. Store:</strong> Data is loaded into RAM for fast access
          </div>
          <div class="flow-step" data-step="3" style="padding: 12px; background: var(--bg-subtle); border-left: 4px solid var(--accent); border-radius: 4px; opacity: 0.5; transition: all 0.3s;">
            <strong style="color: var(--accent);">3. Process:</strong> CPU processes data from RAM
          </div>
          <div class="flow-step" data-step="4" style="padding: 12px; background: var(--bg-subtle); border-left: 4px solid var(--success); border-radius: 4px; opacity: 0.5; transition: all 0.3s;">
            <strong style="color: var(--success);">4. Write:</strong> Results are written back to RAM
          </div>
          <div class="flow-step" data-step="5" style="padding: 12px; background: var(--bg-subtle); border-left: 4px solid var(--warning); border-radius: 4px; opacity: 0.5; transition: all 0.3s;">
            <strong style="color: var(--warning);">5. Save:</strong> Modified data is saved to storage
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize data flow arrows
  setTimeout(() => {
    updateDataFlowArrows();
  }, 100);
}

function updateHardwareStats() {
  const workload = parseInt(workloadSlider.value);
  
  if (currentHardware === 'cpu') {
    hardwareStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">CPU Usage</div>
        <div class="stat-value">${workload}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cores Active</div>
        <div class="stat-value">${Math.ceil(workload / 25)}/4</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Temperature</div>
        <div class="stat-value">${35 + Math.floor(workload * 0.4)}°C</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Clock Speed</div>
        <div class="stat-value">${(3.5 + workload * 0.015).toFixed(2)} GHz</div>
      </div>
    `;
    
    // Update core visualizations
    for (let i = 0; i < 4; i++) {
      const core = document.getElementById(`core${i}`);
      const coreUsage = document.getElementById(`coreUsage${i}`);
      const coreActivity = document.getElementById(`coreActivity${i}`);
      const coreSpeed = document.getElementById(`coreSpeed${i}`);
      const activityBar = coreActivity?.querySelector('.cpu-activity-bar');
      
      if (core && coreUsage) {
        const coreWorkload = Math.max(0, workload - (i * 25));
        const usage = Math.max(0, Math.min(100, coreWorkload));
        coreUsage.textContent = usage + '%';
        
        if (activityBar) {
          activityBar.style.width = usage + '%';
          activityBar.style.background = usage > 80 ? 'var(--error)' : usage > 50 ? 'var(--warning)' : 'var(--accent)';
        }
        
        if (coreSpeed) {
          coreSpeed.textContent = (3.5 + usage * 0.015).toFixed(2) + ' GHz';
        }
        
        if (usage > 0) {
          core.classList.add('active');
        } else {
          core.classList.remove('active');
        }
      }
    }
    
    // Update instruction pipeline
    if (workload > 0) {
      updateInstructionPipeline(workload);
    }
    
    // Update cache activity
    updateCacheActivity(workload);
  } else if (currentHardware === 'ram') {
    const usedBlocks = Math.floor((workload / 100) * 64);
    hardwareStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">RAM Usage</div>
        <div class="stat-value">${workload}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Used Blocks</div>
        <div class="stat-value">${usedBlocks}/64</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Available</div>
        <div class="stat-value">${64 - usedBlocks}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Programs</div>
        <div class="stat-value">${Math.max(1, Math.floor(workload / 25))}</div>
      </div>
    `;
    
    // Update RAM blocks
    for (let i = 0; i < 64; i++) {
      const block = document.getElementById(`ramBlock${i}`);
      if (block) {
        const indicator = block.querySelector('.ram-data-indicator');
        if (i < usedBlocks) {
          block.classList.add('used');
          block.classList.remove('free');
          if (indicator && i < usedBlocks - Math.floor(usedBlocks * 0.2)) {
            indicator.style.background = 'var(--accent)';
          } else if (indicator) {
            indicator.style.background = 'var(--warning)';
            indicator.style.animation = 'pulse 1s ease-in-out infinite';
          }
        } else {
          block.classList.remove('used');
          block.classList.add('free');
          if (indicator) {
            indicator.style.background = 'transparent';
            indicator.style.animation = 'none';
          }
        }
      }
    }
    
    // Update active programs display
    const programsDiv = document.getElementById('memoryPrograms');
    if (programsDiv && workload > 0) {
      const numPrograms = Math.max(1, Math.floor(workload / 25));
      const programs = ['Browser', 'Text Editor', 'Calculator', 'Music Player', 'Video Player', 'Game', 'Compiler', 'Image Editor'];
      programsDiv.innerHTML = programs.slice(0, numPrograms).map((name, idx) => {
        const size = Math.floor(workload / numPrograms) + (idx === 0 ? workload % numPrograms : 0);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: var(--bg); border-radius: 4px;">
            <span style="color: var(--text);">${name}</span>
            <span style="color: var(--accent); font-weight: 600;">${size}%</span>
          </div>
        `;
      }).join('');
    } else if (programsDiv) {
      programsDiv.innerHTML = '<div style="color: var(--text-muted);">No programs running</div>';
    }
  } else if (currentHardware === 'storage') {
    hardwareStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">HDD Usage</div>
        <div class="stat-value">90%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">SSD Usage</div>
        <div class="stat-value">40%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Read Speed</div>
        <div class="stat-value">${workload > 0 ? (workload > 50 ? '550' : '120') : '0'} MB/s</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Write Speed</div>
        <div class="stat-value">${workload > 0 ? (workload > 50 ? '520' : '100') : '0'} MB/s</div>
      </div>
    `;
    
    // Update storage activity indicators
    updateStorageActivity(workload);
  } else if (currentHardware === 'overview') {
    hardwareStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">CPU Usage</div>
        <div class="stat-value">${workload}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">RAM Usage</div>
        <div class="stat-value">${workload}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Storage Usage</div>
        <div class="stat-value">90%</div>
      </div>
    `;
    
    // Update overview components
    const cpuUsage = document.getElementById('overviewCPUUsage');
    const ramUsage = document.getElementById('overviewRAMUsage');
    
    if (cpuUsage) cpuUsage.textContent = workload + '%';
    if (ramUsage) ramUsage.textContent = workload + '%';
    
    // Animate data flow
    if (workload > 0) {
      animateOverviewDataFlow(workload);
    }
  }
}

function updateInstructionPipeline(workload) {
  const stages = ['Fetch', 'Decode', 'Execute', 'Memory', 'Write'];
  const instructions = ['MOV', 'ADD', 'SUB', 'MUL', 'JMP', 'CMP', 'LOAD', 'STORE'];
  
  if (workload === 0) {
    for (let i = 0; i < 5; i++) {
      const stage = document.getElementById(`pipelineStage${i}`);
      if (stage) {
        const instruction = stage.querySelector('.pipeline-instruction');
        if (instruction) instruction.textContent = '-';
        stage.style.borderColor = 'var(--border)';
        stage.style.background = 'var(--bg)';
      }
    }
    return;
  }
  
  // Animate pipeline stages
  for (let i = 0; i < 5; i++) {
    const stage = document.getElementById(`pipelineStage${i}`);
    if (stage) {
      const instruction = stage.querySelector('.pipeline-instruction');
      const isActive = Math.random() < (workload / 100);
      
      if (isActive && instruction) {
        instruction.textContent = instructions[Math.floor(Math.random() * instructions.length)];
        stage.style.borderColor = 'var(--accent)';
        stage.style.background = 'rgba(59, 130, 246, 0.1)';
      } else if (instruction) {
        instruction.textContent = '-';
        stage.style.borderColor = 'var(--border)';
        stage.style.background = 'var(--bg)';
      }
    }
  }
}

function updateCacheActivity(workload) {
  const cacheLevels = ['l1Cache', 'l2Cache', 'l3Cache'];
  const cacheSizes = ['32 KB', '256 KB', '8 MB'];
  
  if (workload === 0) return;
  
  // Animate cache activity (simplified visualization)
  cacheLevels.forEach((cacheId, index) => {
    const cacheElement = document.getElementById(cacheId);
    if (cacheElement) {
      // Visual feedback that cache is being used
      if (workload > (index + 1) * 20) {
        cacheElement.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
          if (cacheElement) cacheElement.style.animation = '';
        }, 1000);
      }
    }
  });
}

function updateStorageActivity(workload) {
  if (workload === 0) {
    const hddActivity = document.getElementById('hddActivity');
    const ssdActivity = document.getElementById('ssdActivity');
    if (hddActivity) hddActivity.innerHTML = '<span>⚪ Idle</span>';
    if (ssdActivity) ssdActivity.innerHTML = '<span>⚪ Idle</span>';
    
    // Stop HDD platter rotation
    for (let i = 0; i < 3; i++) {
      const platter = document.getElementById(`hddPlatter${i}`);
      if (platter) {
        platter.style.animation = 'none';
        platter.style.transform = 'rotate(0deg)';
      }
    }
    
    // Reset SSD chips
    for (let i = 0; i < 8; i++) {
      const chip = document.getElementById(`ssdChip${i}`);
      if (chip) {
        chip.style.borderColor = 'var(--border)';
        chip.style.background = 'var(--bg-subtle)';
      }
    }
    return;
  }
  
  // HDD activity
  const hddActivity = document.getElementById('hddActivity');
  if (hddActivity) {
    const isReading = workload % 2 === 0;
    hddActivity.innerHTML = `<span style="color: var(--warning);">${isReading ? '📖 Reading' : '✏️ Writing'}</span>`;
    
    // Rotate HDD platters
    for (let i = 0; i < 3; i++) {
      const platter = document.getElementById(`hddPlatter${i}`);
      if (platter) {
        platter.style.animation = `spin ${2 - i * 0.2}s linear infinite`;
      }
    }
  }
  
  // SSD activity
  const ssdActivity = document.getElementById('ssdActivity');
  if (ssdActivity) {
    const isReading = workload % 2 === 0;
    ssdActivity.innerHTML = `<span style="color: var(--success);">${isReading ? '📖 Reading' : '✏️ Writing'}</span>`;
    
    // Light up active SSD chips
    const activeChips = Math.floor((workload / 100) * 8);
    for (let i = 0; i < 8; i++) {
      const chip = document.getElementById(`ssdChip${i}`);
      if (chip) {
        if (i < activeChips) {
          chip.style.borderColor = 'var(--success)';
          chip.style.background = 'rgba(16, 185, 129, 0.1)';
          chip.style.animation = 'pulse 0.5s ease-in-out infinite';
        } else {
          chip.style.borderColor = 'var(--border)';
          chip.style.background = 'var(--bg-subtle)';
          chip.style.animation = 'none';
        }
      }
    }
  }
}

function updateDataFlowArrows() {
  const cpu = document.getElementById('overviewCPU');
  const ram = document.getElementById('overviewRAM');
  const storage = document.getElementById('overviewStorage');
  
  if (!cpu || !ram || !storage) return;
  
  const cpuRect = cpu.getBoundingClientRect();
  const ramRect = ram.getBoundingClientRect();
  const storageRect = storage.getBoundingClientRect();
  const diagram = document.querySelector('.system-diagram');
  if (!diagram) return;
  
  const diagramRect = diagram.getBoundingClientRect();
  
  // CPU to RAM
  const cpuToRam = document.getElementById('cpuToRam');
  if (cpuToRam) {
    const cpuX = cpuRect.left - diagramRect.left + cpuRect.width / 2;
    const cpuY = cpuRect.bottom - diagramRect.top;
    const ramX = ramRect.left - diagramRect.left + ramRect.width / 2;
    const ramY = ramRect.top - diagramRect.top;
    
    cpuToRam.setAttribute('x1', cpuX);
    cpuToRam.setAttribute('y1', cpuY);
    cpuToRam.setAttribute('x2', ramX);
    cpuToRam.setAttribute('y2', ramY);
  }
  
  // RAM to CPU
  const ramToCpu = document.getElementById('ramToCpu');
  if (ramToCpu) {
    const cpuX = cpuRect.left - diagramRect.left + cpuRect.width / 2;
    const cpuY = cpuRect.bottom - diagramRect.top;
    const ramX = ramRect.left - diagramRect.left + ramRect.width / 2;
    const ramY = ramRect.top - diagramRect.top;
    
    ramToCpu.setAttribute('x1', ramX);
    ramToCpu.setAttribute('y1', ramY);
    ramToCpu.setAttribute('x2', cpuX);
    ramToCpu.setAttribute('y2', cpuY);
  }
  
  // Storage to RAM
  const storageToRam = document.getElementById('storageToRam');
  if (storageToRam) {
    const storageX = storageRect.left - diagramRect.left + storageRect.width / 2;
    const storageY = storageRect.top - diagramRect.top;
    const ramX = ramRect.left - diagramRect.left + ramRect.width / 2;
    const ramY = ramRect.bottom - diagramRect.top;
    
    storageToRam.setAttribute('x1', storageX);
    storageToRam.setAttribute('y1', storageY);
    storageToRam.setAttribute('x2', ramX);
    storageToRam.setAttribute('y2', ramY);
  }
  
  // RAM to Storage
  const ramToStorage = document.getElementById('ramToStorage');
  if (ramToStorage) {
    const storageX = storageRect.left - diagramRect.left + storageRect.width / 2;
    const storageY = storageRect.top - diagramRect.top;
    const ramX = ramRect.left - diagramRect.left + ramRect.width / 2;
    const ramY = ramRect.bottom - diagramRect.top;
    
    ramToStorage.setAttribute('x1', ramX);
    ramToStorage.setAttribute('y1', ramY);
    ramToStorage.setAttribute('x2', storageX);
    ramToStorage.setAttribute('y2', storageY);
  }
}

let overviewFlowStep = 0;
function animateOverviewDataFlow(workload) {
  const steps = document.querySelectorAll('.flow-step');
  const arrows = {
    cpuToRam: document.getElementById('cpuToRam'),
    ramToCpu: document.getElementById('ramToCpu'),
    storageToRam: document.getElementById('storageToRam'),
    ramToStorage: document.getElementById('ramToStorage')
  };
  
  // Reset all steps
  steps.forEach(step => {
    step.style.opacity = '0.5';
    step.style.transform = 'scale(1)';
  });
  
  // Reset all arrows
  Object.values(arrows).forEach(arrow => {
    if (arrow) arrow.style.opacity = '0';
  });
  
  // Animate steps based on workload cycle
  const cycleProgress = (workload % 100) / 100;
  let activeStep = 0;
  
  if (cycleProgress < 0.2) {
    activeStep = 1; // Load from storage
    if (arrows.storageToRam) arrows.storageToRam.style.opacity = '1';
  } else if (cycleProgress < 0.4) {
    activeStep = 2; // Store in RAM
    if (arrows.storageToRam) arrows.storageToRam.style.opacity = '1';
  } else if (cycleProgress < 0.6) {
    activeStep = 3; // Process in CPU
    if (arrows.ramToCpu) arrows.ramToCpu.style.opacity = '1';
    if (arrows.cpuToRam) arrows.cpuToRam.style.opacity = '0.5';
  } else if (cycleProgress < 0.8) {
    activeStep = 4; // Write to RAM
    if (arrows.cpuToRam) arrows.cpuToRam.style.opacity = '1';
  } else {
    activeStep = 5; // Save to storage
    if (arrows.ramToStorage) arrows.ramToStorage.style.opacity = '1';
  }
  
  // Highlight active step
  const activeStepElement = document.querySelector(`.flow-step[data-step="${activeStep}"]`);
  if (activeStepElement) {
    activeStepElement.style.opacity = '1';
    activeStepElement.style.transform = 'scale(1.02)';
    activeStepElement.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)';
  }
}

runWorkloadBtn.addEventListener('click', () => {
  if (workloadInterval) {
    clearInterval(workloadInterval);
    workloadInterval = null;
    runWorkloadBtn.textContent = '▶ Run Workload';
    return;
  }
  
  runWorkloadBtn.textContent = '⏸ Stop';
  workloadInterval = setInterval(() => {
    const current = parseInt(workloadSlider.value);
    const newValue = current >= 100 ? 0 : current + 5;
    workloadSlider.value = newValue;
    workloadValue.textContent = newValue + '%';
    updateHardwareStats();
    
    // Update data flow arrows if on overview
    if (currentHardware === 'overview') {
      updateDataFlowArrows();
    }
  }, 200);
});

resetHardwareBtn.addEventListener('click', () => {
  clearInterval(workloadInterval);
  workloadInterval = null;
  workloadSlider.value = 0;
  workloadValue.textContent = '0%';
  updateHardwareStats();
  runWorkloadBtn.textContent = '▶ Run Workload';
});

hardwareBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    hardwareBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadHardware(btn.dataset.hardware);
    
    // Update data flow arrows if loading overview
    if (btn.dataset.hardware === 'overview') {
      setTimeout(() => {
        updateDataFlowArrows();
        // Update on window resize
        window.addEventListener('resize', () => {
          if (currentHardware === 'overview') {
            updateDataFlowArrows();
          }
        });
      }, 200);
    }
  });
});

// Update arrows when workload slider changes
workloadSlider.addEventListener('input', () => {
  if (currentHardware === 'overview') {
    updateDataFlowArrows();
  }
});

// Initialize
loadHardware('cpu');

// ==================== DATA FLOW TAB ====================

const flowBtns = document.querySelectorAll('.flow-btn');
const flowVisualization = document.getElementById('flowVisualization');
const playFlowBtn = document.getElementById('playFlowBtn');
const pauseFlowBtn = document.getElementById('pauseFlowBtn');
const stepFlowBtn = document.getElementById('stepFlowBtn');
const resetFlowBtn = document.getElementById('resetFlowBtn');
const flowSpeed = document.getElementById('flowSpeed');
const flowInfo = document.getElementById('flowInfo');

let currentFlow = 'network';
let flowInterval = null;
let flowStep = 0;

const flowData = {
  network: {
    steps: ['Source', 'Router', 'Switch', 'Destination'],
    info: 'Data packets flow from source through network devices (router, switch) to destination. Each device processes and forwards the packet.',
    render: () => {
      flowVisualization.innerHTML = `
        <div id="networkFlowContainer" style="position: relative; height: 100%; min-height: 400px; padding: 40px;">
          <svg id="networkFlowConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
            <defs>
              <marker id="networkArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
              </marker>
            </defs>
            <line id="networkLine0" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#networkArrow)"></line>
            <line id="networkLine1" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#networkArrow)"></line>
            <line id="networkLine2" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#networkArrow)"></line>
          </svg>
          <div style="display: flex; justify-content: space-around; align-items: center; height: 100%; position: relative; z-index: 10;">
          ${['Source', 'Router', 'Switch', 'Destination'].map((step, i) => `
              <div class="flow-network-node" id="flowNode${i}" data-step="${step}" style="position: relative; padding: 25px 35px; background: var(--bg); border: 3px solid var(--border); border-radius: 12px; text-align: center; min-width: 140px; transition: all 0.3s;">
                <div style="font-size: 32px; margin-bottom: 8px;">${['📤', '🛣️', '🔀', '📥'][i]}</div>
                <div style="font-weight: 700; font-size: 16px; color: var(--text);">${step}</div>
                <div id="flowNodeStatus${i}" style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">Ready</div>
                <div class="flow-packet" id="flowPacket${i}" style="display: none; position: absolute; font-size: 24px; z-index: 20;">📦</div>
            </div>
          `).join('')}
          </div>
        </div>
      `;
      setTimeout(() => updateNetworkFlowConnections(), 100);
    }
  },
  memory: {
    steps: ['CPU Request', 'L1 Cache', 'L2 Cache', 'L3 Cache', 'RAM Access', 'Data Return'],
    info: 'CPU requests data through memory hierarchy: checks L1, L2, L3 cache (fast but small) before accessing RAM (slower but larger).',
    render: () => {
      flowVisualization.innerHTML = `
        <div id="memoryFlowContainer" style="position: relative; height: 100%; min-height: 500px; padding: 40px;">
          <svg id="memoryFlowConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
            <defs>
              <marker id="memoryArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
              </marker>
            </defs>
            ${[0, 1, 2, 3, 4].map(i => `
              <line id="memoryLine${i}" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#memoryArrow)"></line>
            `).join('')}
          </svg>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 25px; height: 100%; position: relative; z-index: 10;">
            ${[
              { name: 'CPU Request', icon: '⚙️', size: '32px', desc: 'Requests data' },
              { name: 'L1 Cache', icon: '⚡', size: '28px', desc: '32 KB, ~1ns' },
              { name: 'L2 Cache', icon: '⚡', size: '28px', desc: '256 KB, ~3ns' },
              { name: 'L3 Cache', icon: '⚡', size: '28px', desc: '8 MB, ~12ns' },
              { name: 'RAM Access', icon: '💾', size: '28px', desc: '8 GB, ~100ns' },
              { name: 'Data Return', icon: '✅', size: '32px', desc: 'Data found' }
            ].map((step, i) => `
              <div class="flow-memory-node" id="flowNode${i}" data-step="${step.name}" style="position: relative; padding: 20px 40px; background: var(--bg); border: 3px solid var(--border); border-radius: 12px; text-align: center; min-width: 200px; transition: all 0.3s;">
                <div style="font-size: ${step.size}; margin-bottom: 6px;">${step.icon}</div>
                <div style="font-weight: 700; font-size: 16px; color: var(--text);">${step.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${step.desc}</div>
                <div id="flowNodeStatus${i}" style="font-size: 10px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Waiting</div>
                <div class="flow-data" id="flowData${i}" style="display: none; position: absolute; font-size: 20px; z-index: 20;">💾</div>
            </div>
          `).join('')}
          </div>
        </div>
      `;
      setTimeout(() => updateMemoryFlowConnections(), 100);
    }
  },
  storage: {
    steps: ['Application', 'File System', 'Buffer Cache', 'Storage Driver', 'Storage Device'],
    info: 'Data flows from application through file system layers, buffer cache, storage driver to physical storage device.',
    render: () => {
      flowVisualization.innerHTML = `
        <div id="storageFlowContainer" style="position: relative; height: 100%; min-height: 450px; padding: 40px;">
          <svg id="storageFlowConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
            <defs>
              <marker id="storageArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="var(--warning)" />
              </marker>
            </defs>
            ${[0, 1, 2, 3].map(i => `
              <line id="storageLine${i}" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#storageArrow)"></line>
            `).join('')}
          </svg>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 25px; height: 100%; position: relative; z-index: 10;">
            ${[
              { name: 'Application', icon: '📱', desc: 'User request' },
              { name: 'File System', icon: '📁', desc: 'Directory structure' },
              { name: 'Buffer Cache', icon: '🔄', desc: 'Temporary buffer' },
              { name: 'Storage Driver', icon: '🔧', desc: 'Device driver' },
              { name: 'Storage Device', icon: '💿', desc: 'Physical storage' }
            ].map((step, i) => `
              <div class="flow-storage-node" id="flowNode${i}" data-step="${step.name}" style="position: relative; padding: 20px 50px; background: var(--bg); border: 3px solid var(--border); border-radius: 12px; text-align: center; min-width: 220px; transition: all 0.3s;">
                <div style="font-size: 32px; margin-bottom: 8px;">${step.icon}</div>
                <div style="font-weight: 700; font-size: 16px; color: var(--text);">${step.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">${step.desc}</div>
                <div id="flowNodeStatus${i}" style="font-size: 10px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Idle</div>
                <div class="flow-file" id="flowFile${i}" style="display: none; position: absolute; font-size: 22px; z-index: 20;">📄</div>
            </div>
          `).join('')}
          </div>
        </div>
      `;
      setTimeout(() => updateStorageFlowConnections(), 100);
    }
  },
  cpu: {
    steps: ['Fetch', 'Decode', 'Execute', 'Memory', 'Write Back'],
    info: 'CPU pipeline processes instructions in 5 stages simultaneously. Each stage works on different instructions in parallel.',
    render: () => {
      flowVisualization.innerHTML = `
        <div id="cpuFlowContainer" style="position: relative; height: 100%; min-height: 400px; padding: 40px;">
          <svg id="cpuFlowConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
            <defs>
              <marker id="cpuArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="var(--accent)" />
              </marker>
            </defs>
            ${[0, 1, 2, 3].map(i => `
              <line id="cpuLine${i}" x1="0" y1="0" x2="0" y2="0" stroke="var(--border)" stroke-width="2" marker-end="url(#cpuArrow)"></line>
            `).join('')}
          </svg>
          <div style="display: flex; justify-content: space-around; align-items: center; height: 100%; position: relative; z-index: 10;">
            ${[
              { name: 'Fetch', icon: '📥', desc: 'Get instruction', color: 'var(--accent)' },
              { name: 'Decode', icon: '🔍', desc: 'Interpret', color: 'var(--warning)' },
              { name: 'Execute', icon: '⚙️', desc: 'Process', color: 'var(--success)' },
              { name: 'Memory', icon: '💾', desc: 'Access data', color: 'var(--info)' },
              { name: 'Write Back', icon: '📤', desc: 'Store result', color: 'var(--purple)' }
            ].map((step, i) => `
              <div class="flow-cpu-stage" id="flowNode${i}" data-step="${step.name}" style="position: relative; padding: 25px 30px; background: var(--bg); border: 3px solid var(--border); border-radius: 12px; text-align: center; min-width: 140px; transition: all 0.3s;">
                <div style="font-size: 32px; margin-bottom: 8px;">${step.icon}</div>
                <div style="font-weight: 700; font-size: 16px; color: ${step.color};">${step.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">${step.desc}</div>
                <div id="flowNodeStatus${i}" style="font-size: 10px; color: var(--text-muted); margin-top: 6px; font-style: italic;">Empty</div>
                <div id="flowInstruction${i}" style="font-size: 10px; color: var(--text-muted); margin-top: 4px; font-family: monospace;">-</div>
                <div class="flow-instruction" id="flowInst${i}" style="display: none; position: absolute; font-size: 18px; z-index: 20;">📋</div>
            </div>
          `).join('')}
          </div>
        </div>
      `;
      setTimeout(() => updateCpuFlowConnections(), 100);
    }
  }
};

function loadFlow(flowType) {
  currentFlow = flowType;
  flowStep = 0;
  clearInterval(flowInterval);
  
  const flow = flowData[flowType];
  if (!flow) return;
  
  flow.render();
  
  // Enhanced info with details
  const infoDetails = {
    network: `
      <h4 style="color: var(--accent); margin-bottom: 10px;">Network Flow</h4>
      <p>${flow.info}</p>
      <ul style="margin-top: 10px; line-height: 1.8;">
        <li><strong>Source:</strong> Originates data packet</li>
        <li><strong>Router:</strong> Routes packet between networks</li>
        <li><strong>Switch:</strong> Forwards packet within network</li>
        <li><strong>Destination:</strong> Receives and processes packet</li>
      </ul>
    `,
    memory: `
      <h4 style="color: var(--accent); margin-bottom: 10px;">Memory Hierarchy Flow</h4>
      <p>${flow.info}</p>
      <ul style="margin-top: 10px; line-height: 1.8;">
        <li><strong>L1 Cache:</strong> Fastest, 32 KB, ~1 nanosecond</li>
        <li><strong>L2 Cache:</strong> Fast, 256 KB, ~3 nanoseconds</li>
        <li><strong>L3 Cache:</strong> Moderate, 8 MB, ~12 nanoseconds</li>
        <li><strong>RAM:</strong> Slowest but largest, 8 GB, ~100 nanoseconds</li>
      </ul>
    `,
    storage: `
      <h4 style="color: var(--accent); margin-bottom: 10px;">Storage I/O Flow</h4>
      <p>${flow.info}</p>
      <ul style="margin-top: 10px; line-height: 1.8;">
        <li><strong>Application:</strong> User request for data</li>
        <li><strong>File System:</strong> Manages file structure</li>
        <li><strong>Buffer Cache:</strong> Caches recent reads/writes</li>
        <li><strong>Storage Driver:</strong> Communicates with hardware</li>
        <li><strong>Storage Device:</strong> Physical disk/SSD</li>
      </ul>
    `,
    cpu: `
      <h4 style="color: var(--accent); margin-bottom: 10px;">CPU Pipeline</h4>
      <p>${flow.info}</p>
      <ul style="margin-top: 10px; line-height: 1.8;">
        <li><strong>Fetch:</strong> Load instruction from memory</li>
        <li><strong>Decode:</strong> Determine what instruction does</li>
        <li><strong>Execute:</strong> Perform the operation</li>
        <li><strong>Memory:</strong> Access data if needed</li>
        <li><strong>Write Back:</strong> Store result to register</li>
      </ul>
      <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;">
        <strong>Note:</strong> While one instruction is in Execute, another can be in Decode, 
        and another in Fetch - this is called pipelining and improves performance!
      </p>
    `
  };
  
  flowInfo.innerHTML = infoDetails[flowType] || `<p>${flow.info}</p>`;
  updateFlowVisualization();
  
  // Update connections on window resize
  setTimeout(() => {
    const updateFunc = {
      network: updateNetworkFlowConnections,
      memory: updateMemoryFlowConnections,
      storage: updateStorageFlowConnections,
      cpu: updateCpuFlowConnections
    };
    
    if (updateFunc[flowType]) {
      updateFunc[flowType]();
    }
    
    window.addEventListener('resize', () => {
      if (currentFlow === flowType && updateFunc[flowType]) {
        updateFunc[flowType]();
      }
    });
  }, 200);
  
  progressData.dataFlow[flowType] = true;
  saveProgress('main', progressData);
}

function updateFlowVisualization() {
  const flow = flowData[currentFlow];
  if (!flow) return;
  
  flow.steps.forEach((_, i) => {
    const node = document.getElementById(`flowNode${i}`);
    const status = document.getElementById(`flowNodeStatus${i}`);
    
    if (node) {
      node.classList.remove('active', 'completed');
      if (i < flowStep) {
        node.classList.add('completed');
        node.style.borderColor = 'var(--success)';
        node.style.background = 'rgba(16, 185, 129, 0.05)';
        if (status) status.textContent = 'Complete';
      } else if (i === flowStep) {
        node.classList.add('active');
        node.style.borderColor = 'var(--accent)';
        node.style.background = 'rgba(59, 130, 246, 0.1)';
        node.style.animation = 'pulse 1s ease-in-out';
        if (status) status.textContent = 'Processing...';
      } else {
        node.style.borderColor = 'var(--border)';
        node.style.background = 'var(--bg)';
        node.style.animation = 'none';
        if (status) status.textContent = i === 0 ? 'Ready' : 'Waiting';
      }
    }
  });
  
  // Animate data flow between nodes
  animateDataFlow();
}

function animateDataFlow() {
  if (currentFlow === 'network') {
    animateNetworkFlow();
  } else if (currentFlow === 'memory') {
    animateMemoryFlow();
  } else if (currentFlow === 'storage') {
    animateStorageFlow();
  } else if (currentFlow === 'cpu') {
    animateCpuPipeline();
  }
}

function animateNetworkFlow() {
  // Remove previous packets
  document.querySelectorAll('.flow-packet').forEach(p => p.style.display = 'none');
  document.querySelectorAll('#networkFlowConnections line').forEach(line => {
    line.classList.remove('active');
  });
  
  if (flowStep === 0) return;
  
  // Animate packet from previous node to current
  const fromNode = document.getElementById(`flowNode${flowStep - 1}`);
  const toNode = document.getElementById(`flowNode${flowStep}`);
  const container = document.getElementById('networkFlowContainer');
  
  if (fromNode && toNode && container && flowStep > 0) {
    animatePacketMovement(fromNode, toNode, container, flowStep - 1, flowStep, 'network');
  }
}

function animateMemoryFlow() {
  document.querySelectorAll('.flow-data').forEach(d => d.style.display = 'none');
  document.querySelectorAll('#memoryFlowConnections line').forEach(line => {
    line.classList.remove('active');
  });
  
  if (flowStep === 0) return;
  
  const fromNode = document.getElementById(`flowNode${flowStep - 1}`);
  const toNode = document.getElementById(`flowNode${flowStep}`);
  const container = document.getElementById('memoryFlowContainer');
  
  if (fromNode && toNode && container && flowStep > 0) {
    animateDataMovement(fromNode, toNode, container, flowStep - 1, flowStep, 'memory');
  }
}

function animateStorageFlow() {
  document.querySelectorAll('.flow-file').forEach(f => f.style.display = 'none');
  document.querySelectorAll('#storageFlowConnections line').forEach(line => {
    line.classList.remove('active');
  });
  
  if (flowStep === 0) return;
  
  const fromNode = document.getElementById(`flowNode${flowStep - 1}`);
  const toNode = document.getElementById(`flowNode${flowStep}`);
  const container = document.getElementById('storageFlowContainer');
  
  if (fromNode && toNode && container && flowStep > 0) {
    animateFileMovement(fromNode, toNode, container, flowStep - 1, flowStep, 'storage');
  }
}

function animateCpuPipeline() {
  document.querySelectorAll('.flow-instruction').forEach(i => i.style.display = 'none');
  document.querySelectorAll('#cpuFlowConnections line').forEach(line => {
    line.classList.remove('active');
  });
  
  // Show instructions in pipeline stages
  const instructions = ['MOV R1, 5', 'ADD R2, R1', 'SUB R3, R2', 'MUL R4, R3', 'STORE R4'];
  
  for (let i = 0; i <= flowStep && i < 5; i++) {
    const stage = document.getElementById(`flowInstruction${i}`);
    const instDiv = document.getElementById(`flowInst${i}`);
    if (stage && i < instructions.length) {
      stage.textContent = instructions[i];
      stage.style.color = 'var(--accent)';
    }
    if (instDiv && i === flowStep) {
      instDiv.style.display = 'block';
    }
  }
  
  if (flowStep > 0 && flowStep < 5) {
    const fromNode = document.getElementById(`flowNode${flowStep - 1}`);
    const toNode = document.getElementById(`flowNode${flowStep}`);
    const container = document.getElementById('cpuFlowContainer');
    
    if (fromNode && toNode && container) {
      animateInstructionMovement(fromNode, toNode, container, flowStep - 1, flowStep);
    }
  }
}

function animatePacketMovement(from, to, container, fromIdx, toIdx, type) {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
  const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
  const toX = toRect.left - containerRect.left + toRect.width / 2;
  const toY = toRect.top - containerRect.top + toRect.height / 2;
  
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const animName = `packetMove_${fromIdx}_${toIdx}_${Date.now()}`;
  
  // Add animation
  if (!document.getElementById('flowAnimationStyle')) {
    const style = document.createElement('style');
    style.id = 'flowAnimationStyle';
    document.head.appendChild(style);
  }
  
  const styleElement = document.getElementById('flowAnimationStyle');
  if (styleElement) {
    styleElement.textContent += `
      @keyframes ${animName} {
        from {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        50% {
          transform: translate(${deltaX / 2}px, ${deltaY / 2}px) scale(1.3);
          opacity: 1;
        }
        to {
          transform: translate(${deltaX}px, ${deltaY}px) scale(0.8);
          opacity: 0;
        }
      }
    `;
  }
  
  // Create animated packet
  const packet = document.createElement('div');
  packet.className = 'flow-packet-animated';
  packet.innerHTML = '📦';
  packet.style.cssText = `
    position: absolute;
    left: ${fromX}px;
    top: ${fromY}px;
    font-size: 28px;
    z-index: 50;
    pointer-events: none;
    animation: ${animName} 1s ease-in-out forwards;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  `;
  
  container.appendChild(packet);
  
  // Update connection line
  const line = document.getElementById(`${type}Line${fromIdx}`);
  if (line) {
    line.setAttribute('x1', fromX);
    line.setAttribute('y1', fromY);
    line.setAttribute('x2', toX);
    line.setAttribute('y2', toY);
    line.classList.add('active');
    line.setAttribute('stroke', 'var(--accent)');
    line.setAttribute('stroke-width', '3');
  }
  
  setTimeout(() => {
    packet.remove();
    if (line) line.classList.remove('active');
  }, 1000);
}

function animateDataMovement(from, to, container, fromIdx, toIdx, type) {
  animatePacketMovement(from, to, container, fromIdx, toIdx, type);
}

function animateFileMovement(from, to, container, fromIdx, toIdx, type) {
  animatePacketMovement(from, to, container, fromIdx, toIdx, type);
}

function animateInstructionMovement(from, to, container, fromIdx, toIdx) {
  animatePacketMovement(from, to, container, fromIdx, toIdx, 'cpu');
}

// Connection update functions
function updateNetworkFlowConnections() {
  const container = document.getElementById('networkFlowContainer');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    const fromNode = document.getElementById(`flowNode${i}`);
    const toNode = document.getElementById(`flowNode${i + 1}`);
    const line = document.getElementById(`networkLine${i}`);
    
    if (fromNode && toNode && line) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      
      line.setAttribute('x1', fromRect.left - containerRect.left + fromRect.width / 2);
      line.setAttribute('y1', fromRect.top - containerRect.top + fromRect.height / 2);
      line.setAttribute('x2', toRect.left - containerRect.left + toRect.width / 2);
      line.setAttribute('y2', toRect.top - containerRect.top + toRect.height / 2);
    }
  }
}

function updateMemoryFlowConnections() {
  const container = document.getElementById('memoryFlowContainer');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    const fromNode = document.getElementById(`flowNode${i}`);
    const toNode = document.getElementById(`flowNode${i + 1}`);
    const line = document.getElementById(`memoryLine${i}`);
    
    if (fromNode && toNode && line) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      
      line.setAttribute('x1', fromRect.left - containerRect.left + fromRect.width / 2);
      line.setAttribute('y1', fromRect.top - containerRect.top + fromRect.height / 2);
      line.setAttribute('x2', toRect.left - containerRect.left + toRect.width / 2);
      line.setAttribute('y2', toRect.top - containerRect.top + toRect.height / 2);
    }
  }
}

function updateStorageFlowConnections() {
  const container = document.getElementById('storageFlowContainer');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const fromNode = document.getElementById(`flowNode${i}`);
    const toNode = document.getElementById(`flowNode${i + 1}`);
    const line = document.getElementById(`storageLine${i}`);
    
    if (fromNode && toNode && line) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      
      line.setAttribute('x1', fromRect.left - containerRect.left + fromRect.width / 2);
      line.setAttribute('y1', fromRect.top - containerRect.top + fromRect.height / 2);
      line.setAttribute('x2', toRect.left - containerRect.left + toRect.width / 2);
      line.setAttribute('y2', toRect.top - containerRect.top + toRect.height / 2);
    }
  }
}

function updateCpuFlowConnections() {
  const container = document.getElementById('cpuFlowContainer');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  for (let i = 0; i < 4; i++) {
    const fromNode = document.getElementById(`flowNode${i}`);
    const toNode = document.getElementById(`flowNode${i + 1}`);
    const line = document.getElementById(`cpuLine${i}`);
    
    if (fromNode && toNode && line) {
      const fromRect = fromNode.getBoundingClientRect();
      const toRect = toNode.getBoundingClientRect();
      
      line.setAttribute('x1', fromRect.left - containerRect.left + fromRect.width / 2);
      line.setAttribute('y1', fromRect.top - containerRect.top + fromRect.height / 2);
      line.setAttribute('x2', toRect.left - containerRect.left + toRect.width / 2);
      line.setAttribute('y2', toRect.top - containerRect.top + toRect.height / 2);
    }
  }
}

function playFlow() {
  if (flowInterval) {
    pauseFlow();
    return;
  }
  
  playFlowBtn.textContent = '⏸ Pause';
  const speed = parseInt(flowSpeed.value);
  const delay = 1100 - (speed * 100);
  
  flowInterval = setInterval(() => {
    flowStep++;
    if (flowStep >= flowData[currentFlow].steps.length) {
      flowStep = 0;
    }
    updateFlowVisualization();
  }, delay);
  
  updateFlowVisualization();
}

function pauseFlow() {
  if (flowInterval) {
    clearInterval(flowInterval);
    flowInterval = null;
    playFlowBtn.textContent = '▶ Play';
  }
}


function stepFlow() {
  pauseFlow();
  flowStep++;
  if (flowStep >= flowData[currentFlow].steps.length) {
    flowStep = 0;
  }
  updateFlowVisualization();
}

function resetFlow() {
  pauseFlow();
  flowStep = 0;
  updateFlowVisualization();
}

flowBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    flowBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadFlow(btn.dataset.flow);
  });
});

playFlowBtn.addEventListener('click', playFlow);
pauseFlowBtn.addEventListener('click', pauseFlow);
stepFlowBtn.addEventListener('click', stepFlow);
resetFlowBtn.addEventListener('click', resetFlow);

loadFlow('network');

// ==================== OS SIMULATOR TAB ====================

const osTabBtns = document.querySelectorAll('.os-tab-btn');
const osTabContents = document.querySelectorAll('.os-tab-content');

osTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.osTab;
    
    osTabBtns.forEach(b => b.classList.remove('active'));
    osTabContents.forEach(content => content.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(targetTab + 'Tab').classList.add('active');
  });
});

// Processes
let processIdCounter = 1;
let processes = [];
let selectedProcess = null;

const createProcessBtn = document.getElementById('createProcessBtn');
const killProcessBtn = document.getElementById('killProcessBtn');
const pauseProcessBtn = document.getElementById('pauseProcessBtn');
const resumeProcessBtn = document.getElementById('resumeProcessBtn');
const processList = document.getElementById('processList');
const processDetails = document.getElementById('processDetails');

function createProcess() {
  const process = {
    id: processIdCounter++,
    name: `Process ${processIdCounter - 1}`,
    state: 'running',
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 500) + 100,
    priority: Math.floor(Math.random() * 10) + 1,
    startTime: Date.now()
  };
  processes.push(process);
  renderProcesses();
  progressData.osSimulator.processes = true;
  saveProgress('main', progressData);
}

function renderProcesses() {
  processList.innerHTML = processes.map(p => `
    <div class="process-item ${p.state} ${selectedProcess?.id === p.id ? 'selected' : ''}" 
         onclick="selectProcess(${p.id})">
      <div>
        <strong>${p.name}</strong> (PID: ${p.id})
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          State: ${p.state} | CPU: ${p.cpu}% | Memory: ${p.memory}MB
        </div>
      </div>
    </div>
  `).join('');
  
  if (selectedProcess) {
    const p = processes.find(proc => proc.id === selectedProcess.id);
    if (p) {
      processDetails.innerHTML = `
        <h4>Process Details</h4>
        <div style="margin-top: 15px;">
          <p><strong>Name:</strong> ${p.name}</p>
          <p><strong>PID:</strong> ${p.id}</p>
          <p><strong>State:</strong> ${p.state}</p>
          <p><strong>CPU Usage:</strong> ${p.cpu}%</p>
          <p><strong>Memory:</strong> ${p.memory}MB</p>
          <p><strong>Priority:</strong> ${p.priority}</p>
          <p><strong>Runtime:</strong> ${Math.floor((Date.now() - p.startTime) / 1000)}s</p>
        </div>
      `;
    }
  } else {
    processDetails.innerHTML = '<p style="color: var(--text-muted);">Select a process to view details</p>';
  }
}

window.selectProcess = function(id) {
  selectedProcess = processes.find(p => p.id === id);
  renderProcesses();
};

createProcessBtn.addEventListener('click', createProcess);
killProcessBtn.addEventListener('click', () => {
  if (selectedProcess) {
    processes = processes.filter(p => p.id !== selectedProcess.id);
    selectedProcess = null;
    renderProcesses();
  }
});
pauseProcessBtn.addEventListener('click', () => {
  if (selectedProcess) {
    selectedProcess.state = 'waiting';
    renderProcesses();
  }
});
resumeProcessBtn.addEventListener('click', () => {
  if (selectedProcess) {
    selectedProcess.state = 'running';
    renderProcesses();
  }
});

// Scheduling
const schedulerType = document.getElementById('schedulerType');
const startSchedulerBtn = document.getElementById('startSchedulerBtn');
const stopSchedulerBtn = document.getElementById('stopSchedulerBtn');
const addJobBtn = document.getElementById('addJobBtn');
const schedulerVisualization = document.getElementById('schedulerVisualization');
const schedulerStats = document.getElementById('schedulerStats');

let jobs = [];
let schedulerInterval = null;
let currentJobIndex = 0;

function addJob() {
  const job = {
    id: jobs.length + 1,
    name: `Job ${jobs.length + 1}`,
    duration: Math.floor(Math.random() * 5) + 1,
    priority: Math.floor(Math.random() * 10) + 1,
    state: 'waiting'
  };
  jobs.push(job);
  renderScheduler();
}

function renderScheduler() {
  schedulerVisualization.innerHTML = jobs.map((job, i) => `
    <div class="job-block ${job.state}" id="job${i}">
      <div><strong>${job.name}</strong></div>
      <div style="font-size: 12px; margin-top: 5px;">Duration: ${job.duration}s</div>
      <div style="font-size: 12px;">Priority: ${job.priority}</div>
    </div>
  `).join('');
  
  const completed = jobs.filter(j => j.state === 'completed').length;
  const waiting = jobs.filter(j => j.state === 'waiting').length;
  const executing = jobs.filter(j => j.state === 'executing').length;
  
  schedulerStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Jobs</div>
      <div class="stat-value">${jobs.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completed</div>
      <div class="stat-value">${completed}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Waiting</div>
      <div class="stat-value">${waiting}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Executing</div>
      <div class="stat-value">${executing}</div>
    </div>
  `;
}

function startScheduler() {
  if (schedulerInterval || jobs.length === 0) return;
  
  const type = schedulerType.value;
  if (type === 'fcfs') {
    currentJobIndex = 0;
  } else if (type === 'sjf') {
    jobs.sort((a, b) => a.duration - b.duration);
    currentJobIndex = 0;
  } else if (type === 'priority') {
    jobs.sort((a, b) => b.priority - a.priority);
    currentJobIndex = 0;
  }
  
  schedulerInterval = setInterval(() => {
    if (currentJobIndex < jobs.length) {
      jobs.forEach((j, i) => {
        j.state = i === currentJobIndex ? 'executing' : (i < currentJobIndex ? 'completed' : 'waiting');
      });
      
      jobs[currentJobIndex].duration--;
      if (jobs[currentJobIndex].duration <= 0) {
        jobs[currentJobIndex].state = 'completed';
        currentJobIndex++;
      }
      
      renderScheduler();
      
      if (currentJobIndex >= jobs.length) {
        stopScheduler();
      }
    }
  }, 1000);
  
  progressData.osSimulator.scheduling = true;
  saveProgress('main', progressData);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

startSchedulerBtn.addEventListener('click', startScheduler);
stopSchedulerBtn.addEventListener('click', stopScheduler);
addJobBtn.addEventListener('click', addJob);

// Memory Management
const allocateMemoryBtn = document.getElementById('allocateMemoryBtn');
const deallocateMemoryBtn = document.getElementById('deallocateMemoryBtn');
const defragmentBtn = document.getElementById('defragmentBtn');
const memoryVisualization = document.getElementById('memoryVisualization');
const memoryStats = document.getElementById('memoryStats');

let memoryBlocks = Array(64).fill(null);

function renderMemory() {
  memoryVisualization.innerHTML = memoryBlocks.map((block, i) => `
    <div class="memory-block ${block ? 'allocated' : 'free'}" id="memBlock${i}" title="Block ${i}">
      ${block ? block : 'Free'}
    </div>
  `).join('');
  
  const allocated = memoryBlocks.filter(b => b !== null).length;
  const free = memoryBlocks.filter(b => b === null).length;
  const fragmentation = calculateFragmentation();
  
  memoryStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Blocks</div>
      <div class="stat-value">64</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Allocated</div>
      <div class="stat-value">${allocated}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Free</div>
      <div class="stat-value">${free}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fragmentation</div>
      <div class="stat-value">${fragmentation}%</div>
    </div>
  `;
  
  progressData.osSimulator.memory = true;
  saveProgress('main', progressData);
}

function calculateFragmentation() {
  let freeBlocks = 0;
  let freeRuns = 0;
  let inFreeRun = false;
  
  memoryBlocks.forEach(block => {
    if (block === null) {
      freeBlocks++;
      if (!inFreeRun) {
        freeRuns++;
        inFreeRun = true;
      }
    } else {
      inFreeRun = false;
    }
  });
  
  if (freeBlocks === 0) return 0;
  return Math.round(((freeRuns - 1) / freeBlocks) * 100);
}

function allocateMemory() {
  const size = Math.floor(Math.random() * 5) + 1;
  const name = `Process ${Math.floor(Math.random() * 100)}`;
  
  // Find free space
  let start = -1;
  for (let i = 0; i <= memoryBlocks.length - size; i++) {
    if (memoryBlocks.slice(i, i + size).every(b => b === null)) {
      start = i;
      break;
    }
  }
  
  if (start !== -1) {
    for (let i = start; i < start + size; i++) {
      memoryBlocks[i] = name;
    }
    renderMemory();
  } else {
    alert('Not enough contiguous memory! Try defragmenting.');
  }
}

function deallocateMemory() {
  const allocatedIndices = memoryBlocks.map((b, i) => b !== null ? i : -1).filter(i => i !== -1);
  if (allocatedIndices.length > 0) {
    const randomIndex = allocatedIndices[Math.floor(Math.random() * allocatedIndices.length)];
    const name = memoryBlocks[randomIndex];
    memoryBlocks = memoryBlocks.map(b => b === name ? null : b);
    renderMemory();
  }
}

function defragment() {
  const allocated = memoryBlocks.filter(b => b !== null);
  const free = memoryBlocks.filter(b => b === null);
  memoryBlocks = [...allocated, ...free];
  renderMemory();
}

allocateMemoryBtn.addEventListener('click', allocateMemory);
deallocateMemoryBtn.addEventListener('click', deallocateMemory);
defragmentBtn.addEventListener('click', defragment);

renderMemory();

// ==================== PROGRESS TAB ====================

const generateProgressReportBtn = document.getElementById('generateProgressReportBtn');
const exportProgressBtn = document.getElementById('exportProgressBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');

function updateProgressStats() {
  const networkCount = Object.values(progressData.networkDevices).filter(Boolean).length;
  const hardwareCount = Object.values(progressData.hardware).filter(Boolean).length;
  const flowCount = Object.values(progressData.dataFlow).filter(Boolean).length;
  const osCount = Object.values(progressData.osSimulator).filter(Boolean).length;
  
  progressStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Network Devices</div>
      <div class="stat-value">${networkCount}/3</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Hardware</div>
      <div class="stat-value">${hardwareCount}/4</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Data Flow</div>
      <div class="stat-value">${flowCount}/4</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">OS Simulator</div>
      <div class="stat-value">${osCount}/3</div>
    </div>
  `;
}

function generateReport() {
  const networkCount = Object.values(progressData.networkDevices).filter(Boolean).length;
  const hardwareCount = Object.values(progressData.hardware).filter(Boolean).length;
  const flowCount = Object.values(progressData.dataFlow).filter(Boolean).length;
  const osCount = Object.values(progressData.osSimulator).filter(Boolean).length;
  
  progressReport.innerHTML = `
    <div class="report-section">
      <h3>Learning Progress</h3>
      <div class="report-item ${networkCount === 3 ? 'completed' : ''}">
        <span>Network Devices: ${networkCount}/3</span>
        <span>${networkCount === 3 ? '✓' : ''}</span>
      </div>
      <div class="report-item ${hardwareCount === 4 ? 'completed' : ''}">
        <span>Hardware: ${hardwareCount}/4</span>
        <span>${hardwareCount === 4 ? '✓' : ''}</span>
      </div>
      <div class="report-item ${flowCount === 4 ? 'completed' : ''}">
        <span>Data Flow: ${flowCount}/4</span>
        <span>${flowCount === 4 ? '✓' : ''}</span>
      </div>
      <div class="report-item ${osCount === 3 ? 'completed' : ''}">
        <span>OS Simulator: ${osCount}/3</span>
        <span>${osCount === 3 ? '✓' : ''}</span>
      </div>
    </div>
    <div class="report-section">
      <h3>Activity Summary</h3>
      <div class="report-item">
        <span>Total Sessions: ${progressData.sessions || 0}</span>
      </div>
      <div class="report-item">
        <span>Last Activity: ${new Date().toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

function exportReport() {
  const reportElement = progressReport;
  html2canvas(reportElement).then(canvas => {
    const link = document.createElement('a');
    link.download = 'computing-systems-progress.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

generateProgressReportBtn.addEventListener('click', generateReport);
exportProgressBtn.addEventListener('click', exportReport);
clearProgressBtn.addEventListener('click', () => {
  if (confirm('Clear all progress? This cannot be undone.')) {
    progressData = {
      networkDevices: { router: false, switch: false, server: false },
      hardware: { cpu: false, ram: false, storage: false },
      dataFlow: { network: false, memory: false, storage: false, cpu: false },
      osSimulator: { processes: false, scheduling: false, memory: false },
      sessions: 0
    };
    saveProgress('main', progressData);
    updateProgressStats();
    progressReport.innerHTML = '';
  }
});

// Load progress on startup
loadProgress('main').then(data => {
  if (data) {
    progressData = data;
  }
  updateProgressStats();
});

// Track sessions
progressData.sessions = (progressData.sessions || 0) + 1;
saveProgress('main', progressData);


