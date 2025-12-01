// Activity Tracking
const ACTIVITY_STORAGE_KEY = 'networkPrivacyActivities';
let activities = [];

function loadActivities() {
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (stored) {
      activities = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading activities:', e);
    activities = [];
  }
}

function saveActivities() {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities:', e);
  }
}

function logActivity(type, details) {
  const activity = {
    timestamp: new Date().toISOString(),
    type: type,
    details: details
  };
  activities.push(activity);
  saveActivities();
}

// Load activities on page load
loadActivities();

// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'network-privacy';
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
    
    // Update active states
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    
    // Save tab state
    saveTabState(targetTab);
    
    // Log tab switch
    if (targetTab !== 'report') {
      logActivity('tab_switch', { tab: targetTab });
    }
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

// Bandwidth Demo
let bandwidthInterval = null;
let bandwidthStartTime = null;
let bandwidthDataTransferred = 0;
const FILE_SIZE_MB = 100; // 100 MB file to download

const bandwidthSelect = document.getElementById('bandwidthSelect');
const startBandwidthBtn = document.getElementById('startBandwidthDemo');
const bandwidthPipe = document.getElementById('bandwidthPipe');
const dataPackets = document.getElementById('dataPackets');
const bandwidthSpeed = document.getElementById('bandwidthSpeed');
const bandwidthData = document.getElementById('bandwidthData');
const bandwidthTime = document.getElementById('bandwidthTime');
const bandwidthRemaining = document.getElementById('bandwidthRemaining');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const etaText = document.getElementById('etaText');

function updatePipeWidth(bandwidthMbps) {
  // Pipe height scales with bandwidth (min 30px, max 150px)
  const minHeight = 30;
  const maxHeight = 150;
  const height = minHeight + (bandwidthMbps / 1000) * (maxHeight - minHeight);
  bandwidthPipe.style.height = `${Math.min(height, maxHeight)}px`;
  bandwidthPipe.style.borderRadius = `${Math.min(height, maxHeight) / 2}px`;
}

function startBandwidthDemo() {
  if (bandwidthInterval) {
    clearInterval(bandwidthInterval);
  }
  
  const bandwidthMbps = parseInt(bandwidthSelect.value);
  bandwidthStartTime = Date.now();
  bandwidthDataTransferred = 0;
  
  // Update pipe width based on bandwidth
  updatePipeWidth(bandwidthMbps);
  
  // Clear previous packets
  dataPackets.innerHTML = '';
  
  // Calculate packet frequency based on bandwidth
  const mbPerSecond = bandwidthMbps / 8; // Convert Mbps to MB/s
  
  // Number of simultaneous packets based on bandwidth (more bandwidth = more packets)
  const simultaneousPackets = Math.min(8, Math.max(1, Math.floor(bandwidthMbps / 12)));
  
  // Packet spacing to avoid overlap
  const packetSpacing = 100 / (simultaneousPackets + 1);
  
  // Calculate packet interval
  const basePacketInterval = Math.max(100, 2000 / (bandwidthMbps / 5));
  const mbPerPacket = mbPerSecond / (1000 / basePacketInterval);
  
  bandwidthInterval = setInterval(() => {
    // Create packets with proper spacing
    for (let i = 0; i < simultaneousPackets; i++) {
      const packet = document.createElement('div');
      packet.className = 'data-packet';
      const animationDuration = Math.max(0.8, 2.5 - (bandwidthMbps / 400));
      packet.style.animationDuration = `${animationDuration}s`;
      
      // Distribute packets vertically within pipe using percentage
      // Calculate top position as percentage to work with any pipe height
      const spacing = 100 / (simultaneousPackets + 1);
      const topPercent = spacing * (i + 1);
      packet.style.top = `${topPercent}%`;
      packet.style.transform = 'translateY(-50%)';
      
      // Slightly stagger packet start times for visual clarity
      packet.style.animationDelay = `${(i * 0.15)}s`;
      
      dataPackets.appendChild(packet);
      
      // Remove packet after animation
      setTimeout(() => {
        if (packet.parentNode) {
          packet.remove();
        }
      }, (animationDuration + (i * 0.15)) * 1000);
    }
    
    // Update stats
    const elapsed = (Date.now() - bandwidthStartTime) / 1000;
    bandwidthDataTransferred = Math.min(FILE_SIZE_MB, mbPerSecond * elapsed);
    const remaining = Math.max(0, FILE_SIZE_MB - bandwidthDataTransferred);
    const progress = (bandwidthDataTransferred / FILE_SIZE_MB) * 100;
    const eta = remaining > 0 && mbPerSecond > 0 ? remaining / mbPerSecond : 0;
    
    bandwidthSpeed.textContent = `${bandwidthMbps} Mbps`;
    bandwidthData.textContent = `${bandwidthDataTransferred.toFixed(2)} MB`;
    bandwidthTime.textContent = `${elapsed.toFixed(1)}s`;
    bandwidthRemaining.textContent = `${remaining.toFixed(2)} MB`;
    
    // Update progress bar
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress.toFixed(1)}%`;
    
    // Update ETA
    if (eta > 0) {
      if (eta < 60) {
        etaText.textContent = `ETA: ${eta.toFixed(1)} seconds`;
      } else if (eta < 3600) {
        etaText.textContent = `ETA: ${(eta / 60).toFixed(1)} minutes`;
      } else {
        etaText.textContent = `ETA: ${(eta / 3600).toFixed(1)} hours`;
      }
    } else {
      etaText.textContent = 'Download complete!';
    }
    
    // Stop when file is downloaded
    if (bandwidthDataTransferred >= FILE_SIZE_MB) {
      clearInterval(bandwidthInterval);
      bandwidthInterval = null;
      startBandwidthBtn.textContent = 'Restart Demo';
    }
  }, basePacketInterval);
  
  startBandwidthBtn.textContent = 'Stop Demo';
}

// Update pipe width when bandwidth changes
bandwidthSelect.addEventListener('change', () => {
  const bandwidthMbps = parseInt(bandwidthSelect.value);
  updatePipeWidth(bandwidthMbps);
  if (!bandwidthInterval) {
    // Reset UI if not running
    bandwidthDataTransferred = 0;
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    bandwidthRemaining.textContent = `${FILE_SIZE_MB} MB`;
    etaText.textContent = 'Click "Start Demo" to begin';
  }
});

startBandwidthBtn.addEventListener('click', () => {
  if (bandwidthInterval) {
    clearInterval(bandwidthInterval);
    bandwidthInterval = null;
    dataPackets.innerHTML = '';
    startBandwidthBtn.textContent = 'Start Demo';
    logActivity('bandwidth', { action: 'stopped' });
  } else {
    const bandwidthMbps = parseInt(bandwidthSelect.value);
    startBandwidthDemo();
    logActivity('bandwidth', { 
      action: 'started', 
      bandwidth: `${bandwidthMbps} Mbps`,
      fileSize: `${FILE_SIZE_MB} MB`
    });
  }
});

// Latency Demo
const latencySelect = document.getElementById('latencySelect');
const startLatencyBtn = document.getElementById('startLatencyDemo');
const latencyPacket = document.getElementById('latencyPacket');
const latencyPath = document.getElementById('latencyPath');
const pathLine = latencyPath.querySelector('.path-line');
const latencyValue = document.getElementById('latencyValue');
const distanceValue = document.getElementById('distanceValue');

function startLatencyDemo() {
  const distance = parseInt(latencySelect.value);
  // Approximate latency: distance affects latency, but also routing, server processing, etc.
  // Rough estimate: ~1ms per 100km for fiber optic, plus overhead
  const baseLatency = Math.round((distance / 100) * 1.5 + Math.random() * 10);
  
  distanceValue.textContent = `${distance} km`;
  latencyValue.textContent = `${baseLatency} ms`;
  
  // Calculate animation duration based on latency (convert ms to seconds, min 0.5s, max 3s)
  const animationDuration = Math.max(0.5, Math.min(3, baseLatency / 1000));
  
  // Remove any existing animation classes and inline styles
  latencyPacket.classList.remove('packet-to-server', 'packet-to-device');
  pathLine.classList.remove('path-active');
  
  // Clear any inline animation styles
  latencyPacket.style.animation = '';
  pathLine.style.animation = '';
  
  // Force reflow to reset animation
  void latencyPacket.offsetWidth;
  void pathLine.offsetWidth;
  
  // Reset positions
  latencyPacket.style.left = '0';
  latencyPacket.style.transform = 'translateY(-50%)';
  pathLine.style.transform = 'scaleX(0)';
  pathLine.style.transformOrigin = 'left';
  
  // Start animation after a brief delay to ensure reset
  setTimeout(() => {
    // Set animation duration as CSS variable
    latencyPacket.style.setProperty('--animation-duration', `${animationDuration}s`);
    pathLine.style.setProperty('--animation-duration', `${animationDuration}s`);
    
    // Animate packet going to server and line expanding
    latencyPacket.classList.add('packet-to-server');
    pathLine.classList.add('path-active');
    
    // Animate packet coming back after first animation completes
    setTimeout(() => {
      latencyPacket.classList.remove('packet-to-server');
      latencyPacket.classList.add('packet-to-device');
      // Keep line expanded for return trip
      pathLine.style.transform = 'scaleX(1)';
      pathLine.style.transformOrigin = 'right';
    }, animationDuration * 1000);
    
    // Reset after round trip completes
    setTimeout(() => {
      latencyPacket.classList.remove('packet-to-device');
      pathLine.classList.remove('path-active');
      latencyPacket.style.left = '0';
      latencyPacket.style.transform = 'translateY(-50%)';
      pathLine.style.transform = 'scaleX(0)';
      pathLine.style.transformOrigin = 'left';
    }, animationDuration * 2000);
  }, 100);
}

startLatencyBtn.addEventListener('click', () => {
  const distance = parseInt(latencySelect.value);
  startLatencyDemo();
  logActivity('latency', { 
    action: 'packet_sent',
    distance: `${distance} km`
  });
});

// VPN Demo
let vpnConnected = false;
const toggleVPNBtn = document.getElementById('toggleVPN');
const vpnStatus = document.getElementById('vpnStatus');
const statusIndicator = vpnStatus.querySelector('.status-indicator');
const normalPath = document.getElementById('normalPath');
const vpnPathVisual = document.getElementById('vpnPathVisual');
const normalData = document.getElementById('normalData');
const vpnData = document.getElementById('vpnData');
const yourRealIP = document.getElementById('yourRealIP');
const visibleIP = document.getElementById('visibleIP');

// Generate random IP addresses for demo
const realIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
const vpnServerIPs = [
  '185.123.45.67',
  '203.0.113.89',
  '198.51.100.12',
  '172.16.0.34',
  '10.0.0.156'
];
let currentVPNIP = vpnServerIPs[Math.floor(Math.random() * vpnServerIPs.length)];

// Set initial IP
yourRealIP.textContent = realIP;
visibleIP.textContent = realIP;

function toggleVPN() {
  vpnConnected = !vpnConnected;
  
  if (vpnConnected) {
    toggleVPNBtn.textContent = 'Disconnect VPN';
    statusIndicator.classList.add('connected');
    statusIndicator.classList.remove('disconnected');
    vpnStatus.querySelector('span:last-child').textContent = 'Connected';
    normalPath.style.display = 'none';
    vpnPathVisual.style.display = 'flex';
    
    // Change visible IP to VPN server IP
    visibleIP.textContent = currentVPNIP;
    visibleIP.classList.add('changed');
    setTimeout(() => {
      visibleIP.classList.remove('changed');
    }, 500);
    
    // Start VPN animations
    const vpnDataToServer = document.getElementById('vpnDataToServer');
    const vpnDataToWebsite = document.getElementById('vpnDataToWebsite');
    
    // Animate packet going to VPN server
    vpnDataToServer.style.animation = 'flowDataVPN 1.5s linear infinite';
    
    // Animate packet going from VPN server to website (with delay)
    vpnDataToWebsite.style.animation = 'flowDataVPN 1.5s linear infinite';
    vpnDataToWebsite.style.animationDelay = '0.75s';
  } else {
    toggleVPNBtn.textContent = 'Connect to VPN';
    statusIndicator.classList.remove('connected');
    statusIndicator.classList.add('disconnected');
    vpnStatus.querySelector('span:last-child').textContent = 'Disconnected';
    normalPath.style.display = 'block';
    vpnPathVisual.style.display = 'none';
    
    // Change visible IP back to real IP
    visibleIP.textContent = realIP;
    visibleIP.classList.add('changed');
    setTimeout(() => {
      visibleIP.classList.remove('changed');
    }, 500);
    
    // Stop VPN animations
    const vpnDataToServer = document.getElementById('vpnDataToServer');
    const vpnDataToWebsite = document.getElementById('vpnDataToWebsite');
    vpnDataToServer.style.animation = 'none';
    vpnDataToWebsite.style.animation = 'none';
  }
}

toggleVPNBtn.addEventListener('click', () => {
  const wasConnected = vpnConnected;
  toggleVPN();
  // Log after toggle (vpnConnected is now updated)
  logActivity('vpn', { 
    action: vpnConnected ? 'connected' : 'disconnected',
    yourIP: realIP,
    visibleIP: vpnConnected ? currentVPNIP : realIP
  });
});

// Cookies Demo
const visitWebsiteBtn = document.getElementById('visitWebsite');
const clearCookiesBtn = document.getElementById('clearCookies');
const acceptCookiesBtn = document.getElementById('acceptCookies');
const rejectCookiesBtn = document.getElementById('rejectCookies');
const cookiesList = document.getElementById('cookiesList');

let storedCookies = [];

const cookieTypes = {
  essential: { name: 'session_id', type: 'Essential', icon: '✅' },
  preference: { name: 'language', type: 'Preference', icon: '⚙️' },
  analytics: { name: 'analytics_id', type: 'Analytics', icon: '📊' },
  tracking: { name: 'tracker_id', type: 'Tracking', icon: '👁️' }
};

function addCookie(type) {
  const cookie = cookieTypes[type];
  if (!cookie) return;
  
  const cookieItem = document.createElement('div');
  cookieItem.className = 'cookie-item';
  cookieItem.innerHTML = `
    <div>
      <div class="cookie-name">${cookie.icon} ${cookie.name}</div>
      <div class="cookie-type">${cookie.type} Cookie</div>
    </div>
  `;
  
  storedCookies.push({ type, ...cookie });
  updateCookiesList();
}

function updateCookiesList() {
  if (storedCookies.length === 0) {
    cookiesList.innerHTML = '<div class="empty-state">No cookies stored</div>';
    return;
  }
  
  cookiesList.innerHTML = '';
  storedCookies.forEach(cookie => {
    const cookieItem = document.createElement('div');
    cookieItem.className = 'cookie-item';
    cookieItem.innerHTML = `
      <div>
        <div class="cookie-name">${cookie.icon} ${cookie.name}</div>
        <div class="cookie-type">${cookie.type} Cookie</div>
      </div>
    `;
    cookiesList.appendChild(cookieItem);
  });
}

visitWebsiteBtn.addEventListener('click', () => {
  // Simulate visiting a website
  const websiteContent = document.querySelector('.website-content');
  websiteContent.innerHTML = `
    <p>Welcome! This site uses cookies.</p>
    <div class="cookie-actions">
      <button class="btn-small" id="acceptCookies">Accept All</button>
      <button class="btn-small" id="rejectCookies">Reject</button>
    </div>
  `;
  
  // Re-attach event listeners
  document.getElementById('acceptCookies').addEventListener('click', () => {
    addCookie('essential');
    addCookie('preference');
    addCookie('analytics');
    addCookie('tracking');
    websiteContent.innerHTML = '<p>Cookies accepted. Thank you!</p>';
  });
  
  document.getElementById('rejectCookies').addEventListener('click', () => {
    addCookie('essential'); // Essential cookies are usually required
    websiteContent.innerHTML = '<p>Only essential cookies were set.</p>';
  });
});

clearCookiesBtn.addEventListener('click', () => {
  const count = storedCookies.length;
  storedCookies = [];
  updateCookiesList();
  logActivity('cookies', { action: 'cleared', cookiesRemoved: count });
});

// Tracking Demo
const startTrackingBtn = document.getElementById('startTrackingDemo');
const clearTrackingBtn = document.getElementById('clearTracking');
const currentUrl = document.getElementById('currentUrl');
const browserContent = document.getElementById('browserContent');
const trackersList = document.getElementById('trackersList');
const profileSection = document.getElementById('profileSection');
const profileData = document.getElementById('profileData');

let trackingData = {
  websites: [],
  trackers: {},
  profile: {}
};

const websites = [
  { name: 'Shopping Site', url: 'https://shopping.example.com', trackers: ['Google Analytics', 'Facebook Pixel', 'Ad Network'] },
  { name: 'News Site', url: 'https://news.example.com', trackers: ['Google Analytics', 'Twitter Widget', 'Ad Network'] },
  { name: 'Social Media', url: 'https://social.example.com', trackers: ['Facebook Pixel', 'Instagram Tracker', 'Ad Network'] },
  { name: 'Video Site', url: 'https://video.example.com', trackers: ['Google Analytics', 'YouTube Tracker', 'Ad Network', 'Data Broker'] }
];

let currentWebsiteIndex = 0;

function browseWebsite() {
  if (currentWebsiteIndex >= websites.length) {
    browserContent.innerHTML = '<div class="website-placeholder">You\'ve visited all websites. Click "Clear Tracking Data" to start over.</div>';
    return;
  }
  
  const website = websites[currentWebsiteIndex];
  currentUrl.textContent = website.url;
  browserContent.innerHTML = `<div class="website-placeholder">${website.name}</div>`;
  
  // Add trackers
  website.trackers.forEach(trackerName => {
    if (!trackingData.trackers[trackerName]) {
      trackingData.trackers[trackerName] = 0;
    }
    trackingData.trackers[trackerName]++;
  });
  
  trackingData.websites.push(website.name);
  currentWebsiteIndex++;
  
  updateTrackingDisplay();
  updateProfile();
}

function updateTrackingDisplay() {
  if (Object.keys(trackingData.trackers).length === 0) {
    trackersList.innerHTML = '<div class="empty-state">No trackers detected yet</div>';
    return;
  }
  
  trackersList.innerHTML = '';
  Object.entries(trackingData.trackers).forEach(([name, count]) => {
    const trackerItem = document.createElement('div');
    trackerItem.className = 'tracker-item';
    trackerItem.innerHTML = `
      <span class="tracker-name">${name}</span>
      <span class="tracker-count">${count} sites</span>
    `;
    trackersList.appendChild(trackerItem);
  });
}

function updateProfile() {
  // Build a profile based on visited websites
  const interests = [];
  if (trackingData.websites.some(w => w.includes('Shopping'))) interests.push('Shopping');
  if (trackingData.websites.some(w => w.includes('News'))) interests.push('News');
  if (trackingData.websites.some(w => w.includes('Social'))) interests.push('Social Media');
  if (trackingData.websites.some(w => w.includes('Video'))) interests.push('Video');
  
  if (interests.length > 0) {
    profileSection.style.display = 'block';
    profileData.innerHTML = interests.map(interest => 
      `<div class="profile-item">Interested in: ${interest}</div>`
    ).join('');
    
    if (trackingData.websites.length >= 2) {
      profileData.innerHTML += '<div class="profile-item">Age range: 18-35</div>';
    }
    if (trackingData.websites.length >= 3) {
      profileData.innerHTML += '<div class="profile-item">Location: Estimated from IP</div>';
    }
  }
}

startTrackingBtn.addEventListener('click', () => {
  const website = websites[currentWebsiteIndex];
  browseWebsite();
  logActivity('tracking', { 
    action: 'website_visited',
    website: website.name,
    url: website.url,
    trackers: website.trackers
  });
});

clearTrackingBtn.addEventListener('click', () => {
  const websitesCount = trackingData.websites.length;
  const trackersCount = Object.keys(trackingData.trackers).length;
  trackingData = { websites: [], trackers: {}, profile: {} };
  currentWebsiteIndex = 0;
  currentUrl.textContent = 'about:blank';
  browserContent.innerHTML = '<div class="website-placeholder">Click "Browse Websites" to start</div>';
  trackersList.innerHTML = '<div class="empty-state">No trackers detected yet</div>';
  profileSection.style.display = 'none';
  logActivity('tracking', { 
    action: 'cleared',
    websitesCleared: websitesCount,
    trackersCleared: trackersCount
  });
});

// Encryption Demo
const encryptMessage = document.getElementById('encryptMessage');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const decryptMessage = document.getElementById('decryptMessage');
const decryptKey = document.getElementById('decryptKey');
const originalMessage = document.getElementById('originalMessage');
const encryptedMessage = document.getElementById('encryptedMessage');
const encryptionKey = document.getElementById('encryptionKey');
const encryptSection = document.getElementById('encryptSection');
const decryptSection = document.getElementById('decryptSection');
const modeTabs = document.querySelectorAll('.mode-tab');

let currentEncryptedText = '';
let currentKey = '';

// Mode switching
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const mode = tab.getAttribute('data-mode');
    
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    if (mode === 'encrypt') {
      encryptSection.style.display = 'flex';
      decryptSection.style.display = 'none';
    } else {
      encryptSection.style.display = 'none';
      decryptSection.style.display = 'flex';
    }
  });
});

function generateKey() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function simpleEncrypt(text, key) {
  // Simple Caesar cipher-like encryption for demonstration
  let encrypted = '';
  const keyNum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 26;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const base = isUpper ? 65 : 97;
      const shifted = ((code - base + keyNum) % 26) + base;
      encrypted += String.fromCharCode(shifted);
    } else {
      encrypted += char;
    }
  }
  
  return encrypted;
}

function simpleDecrypt(text, key) {
  // Reverse the encryption
  let decrypted = '';
  const keyNum = key.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 26;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const base = isUpper ? 65 : 97;
      const shifted = ((code - base - keyNum + 26) % 26) + base;
      decrypted += String.fromCharCode(shifted);
    } else {
      decrypted += char;
    }
  }
  
  return decrypted;
}

encryptBtn.addEventListener('click', () => {
  const text = encryptMessage.value.trim();
  if (!text) {
    alert('Please enter a message to encrypt');
    return;
  }
  
  currentKey = generateKey();
  currentEncryptedText = simpleEncrypt(text, currentKey);
  
  // Update the display
  originalMessage.textContent = text;
  encryptedMessage.textContent = currentEncryptedText;
  encryptionKey.textContent = `Key: ${currentKey}`;
  
  // Log encryption activity
  logActivity('encryption', {
    action: 'encrypted',
    originalLength: text.length,
    encryptedText: currentEncryptedText,
    key: currentKey
  });
  
  // Show visual feedback
  encryptedMessage.style.animation = 'none';
  setTimeout(() => {
    encryptedMessage.style.animation = 'fadeIn 0.5s ease';
  }, 10);
  
  // Copy encrypted message and key to clipboard for easy sharing
  const shareText = `Encrypted: ${currentEncryptedText}\nKey: ${currentKey}`;
  navigator.clipboard.writeText(shareText).then(() => {
    // Show a brief notification
    const notification = document.createElement('div');
    notification.textContent = '✓ Copied to clipboard! Share with a friend.';
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--accent); color: #000; padding: 12px 20px; border-radius: 8px; z-index: 1000; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }).catch(() => {
    // Clipboard API not available, that's okay
  });
  
  encryptMessage.value = '';
});

decryptBtn.addEventListener('click', () => {
  // Get encrypted message and key from input fields (manual decryption)
  const encryptedText = decryptMessage.value.trim();
  const key = decryptKey.value.trim().toUpperCase();
  
  // If manual inputs are provided, use those; otherwise use stored values
  let textToDecrypt = encryptedText || currentEncryptedText;
  let keyToUse = key || currentKey;
  
  if (!textToDecrypt || !keyToUse) {
    if (!encryptedText && !key) {
      alert('Please enter an encrypted message and key, or encrypt a message first');
    } else if (!encryptedText) {
      alert('Please enter an encrypted message');
    } else if (!key) {
      alert('Please enter the encryption key');
    }
    return;
  }
  
  // Decrypt the message
  const decrypted = simpleDecrypt(textToDecrypt, keyToUse);
  
  // Log decryption activity
  logActivity('encryption', {
    action: 'decrypted',
    encryptedText: textToDecrypt,
    key: keyToUse,
    decryptedText: decrypted,
    wasManual: !!(encryptedText && key)
  });
  
  // Update the display - show decrypted text in original message box
  originalMessage.textContent = decrypted;
  originalMessage.style.color = 'var(--accent)';
  
  // Show encrypted text
  encryptedMessage.textContent = textToDecrypt;
  
  // Show the key being used
  encryptionKey.textContent = `Key: ${keyToUse}`;
  
  // Visual feedback animation
  originalMessage.style.animation = 'none';
  setTimeout(() => {
    originalMessage.style.animation = 'fadeIn 0.5s ease';
  }, 10);
  
  // Add a brief highlight effect
  const originalBox = originalMessage.closest('.message-box');
  if (originalBox) {
    originalBox.style.borderColor = 'var(--accent)';
    originalBox.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.3)';
    setTimeout(() => {
      originalBox.style.borderColor = '';
      originalBox.style.boxShadow = '';
    }, 1000);
  }
  
  // Clear input fields after successful decryption
  if (encryptedText && key) {
    decryptMessage.value = '';
    decryptKey.value = '';
  }
});

// Allow Enter key to encrypt
encryptMessage.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    encryptBtn.click();
  }
});

// Allow Enter key to decrypt
decryptMessage.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    decryptBtn.click();
  }
});

decryptKey.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    decryptBtn.click();
  }
});

// Report Generation - Initialize after DOM is ready
let generateReportBtn, clearHistoryBtn, exportReportBtn, reportContent;

function initReportElements() {
  generateReportBtn = document.getElementById('generateReportBtn');
  clearHistoryBtn = document.getElementById('clearHistoryBtn');
  exportReportBtn = document.getElementById('exportReportBtn');
  reportContent = document.getElementById('reportContent');
  
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateReport);
  }
  
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', exportReportAsImage);
  }
  
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all activity history? This cannot be undone.')) {
        activities = [];
        saveActivities();
        if (reportContent) {
          reportContent.innerHTML = '<div class="empty-report">History cleared. Start using the simulator to generate a new report!</div>';
          reportContent.style.display = 'block';
        }
        if (exportReportBtn) {
          exportReportBtn.style.display = 'none';
        }
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReportElements);
} else {
  initReportElements();
}

function generateReport() {
  if (!reportContent) {
    console.error('Report content element not found');
    return;
  }
  
  if (activities.length === 0) {
    reportContent.innerHTML = '<div class="empty-report">No activities recorded yet. Start using the simulator to generate a report!</div>';
    reportContent.style.display = 'block';
    return;
  }
  
  // Group activities by type
  const grouped = {
    encryption: activities.filter(a => a.type === 'encryption'),
    bandwidth: activities.filter(a => a.type === 'bandwidth'),
    latency: activities.filter(a => a.type === 'latency'),
    vpn: activities.filter(a => a.type === 'vpn'),
    cookies: activities.filter(a => a.type === 'cookies'),
    tracking: activities.filter(a => a.type === 'tracking'),
    tab_switch: activities.filter(a => a.type === 'tab_switch')
  };
  
  // Calculate statistics
  const totalActivities = activities.length;
  const encryptionCount = grouped.encryption.length;
  const encryptCount = grouped.encryption.filter(a => a.details.action === 'encrypted').length;
  const decryptCount = grouped.encryption.filter(a => a.details.action === 'decrypted').length;
  const bandwidthCount = grouped.bandwidth.filter(a => a.details.action === 'started').length;
  const latencyCount = grouped.latency.length;
  const vpnToggles = grouped.vpn.length;
  const cookiesCount = grouped.cookies.filter(a => a.details.action === 'website_visited').length;
  const trackingCount = grouped.tracking.filter(a => a.details.action === 'website_visited').length;
  
  const reportDate = new Date().toLocaleString();
  
  let reportHTML = `
    <div class="activity-report" id="activityReport">
      <div class="report-header">
        <h1>Network & Privacy Basics Activity Report</h1>
        <div class="report-date">Generated on ${reportDate}</div>
      </div>
      
      <div class="report-stats">
        <div class="stat-card-report">
          <div class="stat-number">${totalActivities}</div>
          <div class="stat-label">Total Activities</div>
        </div>
        <div class="stat-card-report">
          <div class="stat-number">${encryptionCount}</div>
          <div class="stat-label">Encryption Activities</div>
        </div>
        <div class="stat-card-report">
          <div class="stat-number">${bandwidthCount}</div>
          <div class="stat-label">Bandwidth Tests</div>
        </div>
        <div class="stat-card-report">
          <div class="stat-number">${latencyCount}</div>
          <div class="stat-label">Latency Tests</div>
        </div>
      </div>
      
      <div class="report-section">
        <h2>🔐 Encryption Activities</h2>
        <div class="activities-list">
  `;
  
  // Encryption activities
  grouped.encryption.forEach((activity, index) => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    if (activity.details.action === 'encrypted') {
      reportHTML += `
        <div class="activity-item">
          <div class="activity-time">${time}</div>
          <div class="activity-content">
            <strong>Encrypted Message</strong>
            <div class="activity-details">
              <div><strong>Original:</strong> ${activity.details.originalLength} characters</div>
              <div><strong>Encrypted:</strong> <code>${activity.details.encryptedText}</code></div>
              <div><strong>Key:</strong> <code>${activity.details.key}</code></div>
            </div>
          </div>
        </div>
      `;
    } else if (activity.details.action === 'decrypted') {
      reportHTML += `
        <div class="activity-item">
          <div class="activity-time">${time}</div>
          <div class="activity-content">
            <strong>Decrypted Message</strong>
            <div class="activity-details">
              <div><strong>Encrypted:</strong> <code>${activity.details.encryptedText}</code></div>
              <div><strong>Key:</strong> <code>${activity.details.key}</code></div>
              <div><strong>Decrypted:</strong> ${activity.details.decryptedText}</div>
              <div><strong>Method:</strong> ${activity.details.wasManual ? 'Manual Input' : 'Stored Message'}</div>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  reportHTML += `
        </div>
      </div>
      
      <div class="report-section">
        <h2>🌊 Bandwidth Activities</h2>
        <div class="activities-list">
  `;
  
  grouped.bandwidth.filter(a => a.details.action === 'started').forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    reportHTML += `
      <div class="activity-item">
        <div class="activity-time">${time}</div>
        <div class="activity-content">
          <strong>Bandwidth Test Started</strong>
          <div class="activity-details">
            <div>Bandwidth: ${activity.details.bandwidth}</div>
            <div>File Size: ${activity.details.fileSize}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  reportHTML += `
        </div>
      </div>
      
      <div class="report-section">
        <h2>⚡ Latency Activities</h2>
        <div class="activities-list">
  `;
  
  grouped.latency.forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    reportHTML += `
      <div class="activity-item">
        <div class="activity-time">${time}</div>
        <div class="activity-content">
          <strong>Packet Sent</strong>
          <div class="activity-details">
            <div>Distance: ${activity.details.distance}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  reportHTML += `
        </div>
      </div>
      
      <div class="report-section">
        <h2>🔒 VPN Activities</h2>
        <div class="activities-list">
  `;
  
  grouped.vpn.forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    reportHTML += `
      <div class="activity-item">
        <div class="activity-time">${time}</div>
        <div class="activity-content">
          <strong>VPN ${activity.details.action === 'connected' ? 'Connected' : 'Disconnected'}</strong>
          <div class="activity-details">
            <div>Your IP: <code>${activity.details.yourIP}</code></div>
            <div>Visible IP: <code>${activity.details.visibleIP}</code></div>
          </div>
        </div>
      </div>
    `;
  });
  
  reportHTML += `
        </div>
      </div>
      
      <div class="report-section">
        <h2>🍪 Cookie Activities</h2>
        <div class="activities-list">
  `;
  
  grouped.cookies.forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    if (activity.details.action === 'website_visited') {
      reportHTML += `
        <div class="activity-item">
          <div class="activity-time">${time}</div>
          <div class="activity-content">
            <strong>Website Visited</strong>
          </div>
        </div>
      `;
    } else if (activity.details.action === 'accepted_all') {
      reportHTML += `
        <div class="activity-item">
          <div class="activity-time">${time}</div>
          <div class="activity-content">
            <strong>Cookies Accepted</strong>
            <div class="activity-details">
              <div>Cookies Added: ${activity.details.cookiesAdded.join(', ')}</div>
            </div>
          </div>
        </div>
      `;
    } else if (activity.details.action === 'cleared') {
      reportHTML += `
        <div class="activity-item">
          <div class="activity-time">${time}</div>
          <div class="activity-content">
            <strong>Cookies Cleared</strong>
            <div class="activity-details">
              <div>Cookies Removed: ${activity.details.cookiesRemoved}</div>
            </div>
          </div>
        </div>
      `;
    }
  });
  
  reportHTML += `
        </div>
      </div>
      
      <div class="report-section">
        <h2>👁️ Tracking Activities</h2>
        <div class="activities-list">
  `;
  
  grouped.tracking.filter(a => a.details.action === 'website_visited').forEach(activity => {
    const time = new Date(activity.timestamp).toLocaleTimeString();
    reportHTML += `
      <div class="activity-item">
        <div class="activity-time">${time}</div>
        <div class="activity-content">
          <strong>Website Visited</strong>
          <div class="activity-details">
            <div>Website: ${activity.details.website}</div>
            <div>URL: <code>${activity.details.url}</code></div>
            <div>Trackers Detected: ${activity.details.trackers.join(', ')}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  reportHTML += `
        </div>
      </div>
    </div>
  `;
  
  reportContent.innerHTML = reportHTML;
  reportContent.style.display = 'block';
  if (exportReportBtn) {
    exportReportBtn.style.display = 'inline-block';
  }
}

function exportReportAsImage() {
  const reportElement = document.getElementById('activityReport');
  if (!reportElement) {
    alert('Please generate a report first');
    return;
  }
  
  html2canvas(reportElement, {
    backgroundColor: '#0f172a',
    scale: 2,
    logging: false,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `network-privacy-report-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    console.error('Error generating image:', err);
    alert('Error generating report image. Please try again.');
  });
}


