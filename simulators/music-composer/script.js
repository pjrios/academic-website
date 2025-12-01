// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'music-composer';
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

const DB_NAME = 'MusicComposerDB';
const DB_VERSION = 1;
const STORE_NAME = 'loops';

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
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

function saveLoop(loopData) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(loopData);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadLoops() {
  if (!db) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteLoop(id) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Initialize DB
initDB().catch(console.error);

// ==================== SEQUENCER ====================

const tempoSlider = document.getElementById('tempoSlider');
const tempoValue = document.getElementById('tempoValue');
const beatsPerBar = document.getElementById('beatsPerBar');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const saveLoopBtn = document.getElementById('saveLoopBtn');
const loadLoopBtn = document.getElementById('loadLoopBtn');
const addTrackBtn = document.getElementById('addTrackBtn');
const removeTrackBtn = document.getElementById('removeTrackBtn');
const tracksContainer = document.getElementById('tracksContainer');
const playbackInfo = document.getElementById('playbackInfo');

let tracks = [];
let isPlaying = false;
let playInterval = null;
let currentBeat = 0;
let audioContext = null;

// Initialize Web Audio API
try {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.warn('Web Audio API not supported');
}

// Sound generation
function generateTone(frequency, duration, startTime) {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  
  gainNode.gain.setValueAtTime(0.3, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
  
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playBeat(trackIndex, beatIndex) {
  if (!audioContext) return;
  
  const track = tracks[trackIndex];
  if (!track || !track.beats[beatIndex]) return;
  
  // Different frequencies for different tracks
  const frequencies = [220, 330, 440, 550, 660]; // A3, E4, A4, C#5, E5
  const frequency = frequencies[trackIndex % frequencies.length] || 440;
  
  const now = audioContext.currentTime;
  generateTone(frequency, 0.1, now);
}

// Track management
let trackIdCounter = 1;

function createTrack(name = null) {
  const track = {
    id: trackIdCounter++,
    name: name || `Track ${trackIdCounter - 1}`,
    beats: Array(16).fill(false),
    muted: false,
    solo: false,
    instrument: 'default'
  };
  tracks.push(track);
  renderTracks();
  return track;
}

function removeTrack() {
  if (tracks.length > 1) {
    tracks.pop();
    renderTracks();
  } else {
    showNotification('At least one track is required', 'error');
  }
}

function renderTracks() {
  const beatsCount = parseInt(beatsPerBar.value);
  
  tracksContainer.innerHTML = tracks.map((track, trackIndex) => {
    const beatCells = Array.from({ length: beatsCount }, (_, beatIndex) => {
      const isActive = track.beats[beatIndex];
      const isPlayingNow = isPlaying && currentBeat === beatIndex;
      
      return `
        <div class="beat-cell ${isActive ? 'active' : ''} ${isPlayingNow ? 'playing' : ''}" 
             data-track="${trackIndex}" 
             data-beat="${beatIndex}"
             onclick="toggleBeat(${trackIndex}, ${beatIndex})">
          ${isActive ? '●' : ''}
        </div>
      `;
    }).join('');
    
    const beatLabels = Array.from({ length: beatsCount }, (_, i) => 
      `<div class="beat-label">${i + 1}</div>`
    ).join('');
    
    return `
      <div class="track">
        <div class="track-header">
          <div class="track-name">
            <input type="text" value="${track.name}" 
                   onchange="renameTrack(${track.id}, this.value)"
                   style="width: 150px;">
          </div>
          <div class="track-controls">
            <button class="track-mute-btn ${track.muted ? 'muted' : ''}" 
                    onclick="toggleMute(${track.id})">
              ${track.muted ? '🔇 Muted' : '🔊 Mute'}
            </button>
            <button class="track-solo-btn ${track.solo ? 'solo' : ''}" 
                    onclick="toggleSolo(${track.id})">
              ${track.solo ? '⭐ Solo' : 'Solo'}
            </button>
          </div>
        </div>
        <div class="sequencer-grid">
          <div class="beat-label">${track.name}</div>
          ${beatCells}
        </div>
      </div>
    `;
  }).join('');
}

window.toggleBeat = function(trackIndex, beatIndex) {
  if (trackIndex >= tracks.length) return;
  tracks[trackIndex].beats[beatIndex] = !tracks[trackIndex].beats[beatIndex];
  renderTracks();
};

window.renameTrack = function(trackId, newName) {
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    track.name = newName;
    renderTracks();
  }
};

window.toggleMute = function(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    track.muted = !track.muted;
    if (track.muted) track.solo = false;
    renderTracks();
  }
};

window.toggleSolo = function(trackId) {
  const track = tracks.find(t => t.id === trackId);
  if (track) {
    track.solo = !track.solo;
    if (track.solo) track.muted = false;
    renderTracks();
  }
};

function play() {
  if (isPlaying) return;
  
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  isPlaying = true;
  playBtn.disabled = true;
  stopBtn.disabled = false;
  
  const beatsCount = parseInt(beatsPerBar.value);
  const tempo = parseInt(tempoSlider.value);
  const beatDuration = (60 / tempo) * 1000; // milliseconds per beat
  
  currentBeat = 0;
  
  playInterval = setInterval(() => {
    // Play beats for all tracks
    tracks.forEach((track, trackIndex) => {
      if (track.muted) return;
      
      // Solo logic: if any track is solo, only play solo tracks
      const hasSolo = tracks.some(t => t.solo);
      if (hasSolo && !track.solo) return;
      
      if (track.beats[currentBeat]) {
        playBeat(trackIndex, currentBeat);
      }
    });
    
    renderTracks();
    
    currentBeat++;
    if (currentBeat >= beatsCount) {
      currentBeat = 0;
    }
    
    updatePlaybackInfo();
  }, beatDuration);
}

function stop() {
  if (!isPlaying) return;
  
  isPlaying = false;
  playBtn.disabled = false;
  stopBtn.disabled = true;
  
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
  
  currentBeat = 0;
  renderTracks();
  updatePlaybackInfo();
}

function updatePlaybackInfo() {
  const tempo = parseInt(tempoSlider.value);
  const beatsCount = parseInt(beatsPerBar.value);
  
  playbackInfo.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>Status:</strong> ${isPlaying ? '▶ Playing' : '⏹ Stopped'}
      </div>
      <div>
        <strong>Beat:</strong> ${currentBeat + 1} / ${beatsCount}
      </div>
      <div>
        <strong>Tempo:</strong> ${tempo} BPM
      </div>
      <div>
        <strong>Tracks:</strong> ${tracks.length}
      </div>
    </div>
  `;
}

function clearAll() {
  if (confirm('Clear all beats? This cannot be undone.')) {
    tracks.forEach(track => {
      track.beats = Array(16).fill(false);
    });
    renderTracks();
  }
}

function saveCurrentLoop() {
  const name = prompt('Enter a name for this loop:');
  if (!name) return;
  
  const loopData = {
    name: name,
    date: new Date().toISOString(),
    tempo: parseInt(tempoSlider.value),
    beatsPerBar: parseInt(beatsPerBar.value),
    tracks: tracks.map(track => ({
      name: track.name,
      beats: [...track.beats],
      instrument: track.instrument
    }))
  };
  
  saveLoop(loopData).then(() => {
    showNotification('Loop saved!', 'success');
    progressData.loopsCreated++;
    saveProgress('main', progressData);
  }).catch(err => {
    console.error('Error saving loop:', err);
    showNotification('Error saving loop', 'error');
  });
}

function loadLoop() {
  loadLoops().then(loops => {
    if (loops.length === 0) {
      showNotification('No saved loops found', 'info');
      return;
    }
    
    const loopNames = loops.map((loop, i) => `${i + 1}. ${loop.name} (${new Date(loop.date).toLocaleDateString()})`).join('\n');
    const choice = prompt(`Select a loop to load:\n\n${loopNames}\n\nEnter number:`);
    
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < loops.length) {
      const loop = loops[index];
      tempoSlider.value = loop.tempo || 120;
      tempoValue.textContent = loop.tempo || 120;
      beatsPerBar.value = loop.beatsPerBar || 16;
      
      tracks = loop.tracks.map((t, i) => ({
        id: trackIdCounter++,
        name: t.name || `Track ${i + 1}`,
        beats: t.beats || Array(16).fill(false),
        muted: false,
        solo: false,
        instrument: t.instrument || 'default'
      }));
      
      renderTracks();
      showNotification('Loop loaded!', 'success');
    }
  }).catch(err => {
    console.error('Error loading loops:', err);
    showNotification('Error loading loops', 'error');
  });
}

tempoSlider.addEventListener('input', (e) => {
  tempoValue.textContent = e.target.value;
  if (isPlaying) {
    stop();
    play();
  }
});

beatsPerBar.addEventListener('change', () => {
  tracks.forEach(track => {
    const newLength = parseInt(beatsPerBar.value);
    if (track.beats.length < newLength) {
      track.beats = [...track.beats, ...Array(newLength - track.beats.length).fill(false)];
    } else if (track.beats.length > newLength) {
      track.beats = track.beats.slice(0, newLength);
    }
  });
  renderTracks();
  if (isPlaying) {
    stop();
    play();
  }
});

playBtn.addEventListener('click', play);
stopBtn.addEventListener('click', stop);
clearBtn.addEventListener('click', clearAll);
saveLoopBtn.addEventListener('click', saveCurrentLoop);
loadLoopBtn.addEventListener('click', loadLoop);
addTrackBtn.addEventListener('click', () => {
  createTrack();
  progressData.tracksCreated++;
  saveProgress('main', progressData);
});
removeTrackBtn.addEventListener('click', removeTrack);

// Initialize
createTrack('Kick');
createTrack('Snare');
createTrack('Hi-Hat');
updatePlaybackInfo();

// ==================== LIBRARY TAB ====================

const refreshLibraryBtn = document.getElementById('refreshLibraryBtn');
const exportAllBtn = document.getElementById('exportAllBtn');
const loopsGrid = document.getElementById('loopsGrid');

function renderLibrary() {
  loadLoops().then(loops => {
    if (loops.length === 0) {
      loopsGrid.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">No saved loops yet. Create and save a loop to see it here!</p>';
      return;
    }
    
    loopsGrid.innerHTML = loops.map(loop => {
      const date = new Date(loop.date);
      const totalBeats = loop.tracks.reduce((sum, t) => sum + t.beats.filter(b => b).length, 0);
      
      return `
        <div class="loop-card">
          <h3>${loop.name}</h3>
          <div class="loop-card-info">
            <div>Tempo: ${loop.tempo} BPM</div>
            <div>Beats per Bar: ${loop.beatsPerBar}</div>
            <div>Tracks: ${loop.tracks.length}</div>
            <div>Total Beats: ${totalBeats}</div>
            <div>Created: ${date.toLocaleDateString()}</div>
          </div>
          <div class="loop-card-actions">
            <button class="btn-primary" onclick="loadLoopFromLibrary(${loop.id})">Load</button>
            <button class="btn-secondary" onclick="exportLoop(${loop.id})">Export</button>
            <button class="btn-secondary" onclick="deleteLoopFromLibrary(${loop.id})" style="background: var(--danger); color: white;">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }).catch(err => {
    console.error('Error loading library:', err);
    loopsGrid.innerHTML = '<p style="color: var(--danger);">Error loading library</p>';
  });
}

window.loadLoopFromLibrary = function(id) {
  loadLoops().then(loops => {
    const loop = loops.find(l => l.id === id);
    if (!loop) return;
    
    // Switch to sequencer tab
    document.querySelector('[data-tab="sequencer"]').click();
    
    // Load the loop
    tempoSlider.value = loop.tempo || 120;
    tempoValue.textContent = loop.tempo || 120;
    beatsPerBar.value = loop.beatsPerBar || 16;
    
    tracks = loop.tracks.map((t, i) => ({
      id: trackIdCounter++,
      name: t.name || `Track ${i + 1}`,
      beats: t.beats || Array(loop.beatsPerBar || 16).fill(false),
      muted: false,
      solo: false,
      instrument: t.instrument || 'default'
    }));
    
    renderTracks();
    showNotification('Loop loaded!', 'success');
  });
};

window.exportLoop = function(id) {
  loadLoops().then(loops => {
    const loop = loops.find(l => l.id === id);
    if (!loop) return;
    
    const dataStr = JSON.stringify(loop, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${loop.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Loop exported!', 'success');
  });
};

window.deleteLoopFromLibrary = function(id) {
  if (confirm('Delete this loop? This cannot be undone.')) {
    deleteLoop(id).then(() => {
      renderLibrary();
      showNotification('Loop deleted', 'success');
    }).catch(err => {
      console.error('Error deleting loop:', err);
      showNotification('Error deleting loop', 'error');
    });
  }
};

refreshLibraryBtn.addEventListener('click', renderLibrary);
exportAllBtn.addEventListener('click', () => {
  loadLoops().then(loops => {
    if (loops.length === 0) {
      showNotification('No loops to export', 'info');
      return;
    }
    
    const dataStr = JSON.stringify(loops, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_loops.json';
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('All loops exported!', 'success');
  });
});

// Render library when tab is clicked
document.querySelector('[data-tab="library"]').addEventListener('click', renderLibrary);

// ==================== PROGRESS TAB ====================

const generateProgressReportBtn = document.getElementById('generateProgressReportBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');

let progressData = {
  loopsCreated: 0,
  tracksCreated: 0,
  sessions: 0
};

function saveProgress(key, data) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['loops'], 'readwrite');
    const store = transaction.objectStore('loops');
    // Store progress in a special loop
    const progressLoop = {
      id: 'progress',
      name: 'Progress Data',
      date: new Date().toISOString(),
      progress: data
    };
    const request = store.put(progressLoop);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function loadProgress() {
  if (!db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['loops'], 'readonly');
    const store = transaction.objectStore('loops');
    const request = store.get('progress');
    request.onsuccess = () => {
      if (request.result && request.result.progress) {
        progressData = request.result.progress;
      }
      resolve(progressData);
    };
    request.onerror = () => reject(request.error);
  });
}

function updateProgressStats() {
  loadLoops().then(loops => {
    const actualLoops = loops.filter(l => l.id !== 'progress');
    
    progressStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Loops Created</div>
        <div class="stat-value">${actualLoops.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tracks Created</div>
        <div class="stat-value">${progressData.tracksCreated || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sessions</div>
        <div class="stat-value">${progressData.sessions || 0}</div>
      </div>
    `;
  });
}

function generateReport() {
  loadLoops().then(loops => {
    const actualLoops = loops.filter(l => l.id !== 'progress');
    
    progressReport.innerHTML = `
      <div class="report-section">
        <h3>Creation Summary</h3>
        <div class="report-item">
          <span>Total Loops Created: ${actualLoops.length}</span>
        </div>
        <div class="report-item">
          <span>Total Tracks Created: ${progressData.tracksCreated || 0}</span>
        </div>
        <div class="report-item">
          <span>Total Sessions: ${progressData.sessions || 0}</span>
        </div>
      </div>
      <div class="report-section">
        <h3>Recent Loops</h3>
        ${actualLoops.slice(-5).reverse().map(loop => `
          <div class="report-item">
            <span>${loop.name} - ${new Date(loop.date).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>
    `;
  });
}

generateProgressReportBtn.addEventListener('click', generateReport);
clearProgressBtn.addEventListener('click', () => {
  if (confirm('Clear all progress? This will delete all saved loops. This cannot be undone.')) {
    if (db) {
      const transaction = db.transaction(['loops'], 'readwrite');
      const store = transaction.objectStore('loops');
      store.clear().onsuccess = () => {
        progressData = { loopsCreated: 0, tracksCreated: 0, sessions: 0 };
        updateProgressStats();
        progressReport.innerHTML = '';
        renderLibrary();
        showNotification('Progress cleared', 'success');
      };
    }
  }
});

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

// Load progress on startup
loadProgress().then(() => {
  progressData.sessions = (progressData.sessions || 0) + 1;
  saveProgress('main', progressData);
  updateProgressStats();
});

// Update progress stats when progress tab is clicked
document.querySelector('[data-tab="progress"]').addEventListener('click', () => {
  updateProgressStats();
});


