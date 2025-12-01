// ==================== TAB NAVIGATION ====================
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'digital-representation-lab';
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
const DB_NAME = 'DigitalRepresentationDB';
const DB_VERSION = 1;
const STORE_NAMES = {
  examples: 'examples',
  progress: 'progress'
};

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
      Object.values(STORE_NAMES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          if (storeName === 'examples') {
            store.createIndex('type', 'type', { unique: false });
            store.createIndex('date', 'date', { unique: false });
          }
        }
      });
    };
  });
}

function saveToDB(storeName, data) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function loadFromDB(storeName) {
  if (!db) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromDB(storeName, id) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function updateInDB(storeName, id, data) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ ...data, id });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Initialize DB
initDB().catch(console.error);

// ==================== PIXELS & COLOR DEPTH ====================
const pixelCanvas = document.getElementById('pixelCanvas');
const gridSize = document.getElementById('gridSize');
const gridSizeValue = document.getElementById('gridSizeValue');
const colorDepth = document.getElementById('colorDepth');
const pixelTool = document.getElementById('pixelTool');
const colorPicker = document.getElementById('colorPicker');
const clearPixelsBtn = document.getElementById('clearPixelsBtn');
const loadImageBtn = document.getElementById('loadImageBtn');
const savePixelArtBtn = document.getElementById('savePixelArtBtn');
const pixelResolution = document.getElementById('pixelResolution');
const pixelColorDepth = document.getElementById('pixelColorDepth');
const pixelFileSize = document.getElementById('pixelFileSize');

let pixelCtx = pixelCanvas.getContext('2d');
let currentGridSize = 16;
let isDrawing = false;
let currentColor = '#3b82f6';

function initPixelCanvas() {
  currentGridSize = parseInt(gridSize.value);
  pixelCanvas.width = 400;
  pixelCanvas.height = 400;
  pixelCanvas.style.width = '400px';
  pixelCanvas.style.height = '400px';
  
  clearPixelCanvas();
  updatePixelInfo();
}

function clearPixelCanvas() {
  pixelCtx.fillStyle = '#ffffff';
  pixelCtx.fillRect(0, 0, pixelCanvas.width, pixelCanvas.height);
  drawPixelGrid();
}

function drawPixelGrid() {
  const cellSize = pixelCanvas.width / currentGridSize;
  pixelCtx.strokeStyle = '#e5e7eb';
  pixelCtx.lineWidth = 1;
  
  for (let i = 0; i <= currentGridSize; i++) {
    const pos = i * cellSize;
    pixelCtx.beginPath();
    pixelCtx.moveTo(pos, 0);
    pixelCtx.lineTo(pos, pixelCanvas.height);
    pixelCtx.stroke();
    
    pixelCtx.beginPath();
    pixelCtx.moveTo(0, pos);
    pixelCtx.lineTo(pixelCanvas.width, pos);
    pixelCtx.stroke();
  }
}

function getPixelAt(x, y) {
  const cellSize = pixelCanvas.width / currentGridSize;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  return { col, row, cellSize };
}

function drawPixel(col, row, color) {
  const cellSize = pixelCanvas.width / currentGridSize;
  pixelCtx.fillStyle = applyColorDepth(color);
  pixelCtx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
  drawPixelGrid();
}

function applyColorDepth(color) {
  const depth = parseInt(colorDepth.value);
  if (depth === 24) return color;
  
  const rgb = hexToRgb(color);
  if (depth === 1) {
    const gray = (rgb.r + rgb.g + rgb.b) / 3;
    return gray > 127 ? '#ffffff' : '#000000';
  } else if (depth === 4) {
    const r = Math.round(rgb.r / 51) * 51;
    const g = Math.round(rgb.g / 51) * 51;
    const b = Math.round(rgb.b / 51) * 51;
    return rgbToHex(r, g, b);
  } else if (depth === 8) {
    const r = Math.round(rgb.r / 32) * 32;
    const g = Math.round(rgb.g / 32) * 32;
    const b = Math.round(rgb.b / 32) * 32;
    return rgbToHex(r, g, b);
  }
  return color;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function updatePixelInfo() {
  pixelResolution.textContent = `${currentGridSize}x${currentGridSize}`;
  const depth = parseInt(colorDepth.value);
  pixelColorDepth.textContent = `${depth}-bit`;
  
  const bitsPerPixel = depth;
  const totalPixels = currentGridSize * currentGridSize;
  const sizeBytes = (totalPixels * bitsPerPixel) / 8;
  pixelFileSize.textContent = `~${(sizeBytes / 1024).toFixed(2)} KB`;
}

pixelCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const rect = pixelCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const pixel = getPixelAt(x, y);
  
  if (pixelTool.value === 'fill') {
    fillArea(pixel.col, pixel.row);
  } else {
    drawPixel(pixel.col, pixel.row, currentColor);
  }
});

pixelCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing || pixelTool.value === 'fill') return;
  const rect = pixelCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const pixel = getPixelAt(x, y);
  drawPixel(pixel.col, pixel.row, currentColor);
});

pixelCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

pixelCanvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

function fillArea(startCol, startRow) {
  const targetColor = getPixelColor(startCol, startRow);
  const fillColor = applyColorDepth(currentColor);
  if (targetColor === fillColor) return;
  
  const stack = [[startCol, startRow]];
  const visited = new Set();
  
  while (stack.length > 0) {
    const [col, row] = stack.pop();
    const key = `${col},${row}`;
    
    if (visited.has(key) || col < 0 || col >= currentGridSize || row < 0 || row >= currentGridSize) continue;
    if (getPixelColor(col, row) !== targetColor) continue;
    
    visited.add(key);
    drawPixel(col, row, currentColor);
    
    stack.push([col + 1, row], [col - 1, row], [col, row + 1], [col, row - 1]);
  }
}

function getPixelColor(col, row) {
  const cellSize = pixelCanvas.width / currentGridSize;
  const x = col * cellSize + cellSize / 2;
  const y = row * cellSize + cellSize / 2;
  const imageData = pixelCtx.getImageData(x, y, 1, 1);
  const [r, g, b] = imageData.data;
  return rgbToHex(r, g, b);
}

gridSize.addEventListener('input', () => {
  currentGridSize = parseInt(gridSize.value);
  gridSizeValue.textContent = `${currentGridSize}x${currentGridSize}`;
  initPixelCanvas();
});

colorDepth.addEventListener('change', () => {
  updatePixelInfo();
  // Redraw with new color depth
  const imageData = pixelCtx.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
  pixelCtx.putImageData(imageData, 0, 0);
  drawPixelGrid();
});

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
});

clearPixelsBtn.addEventListener('click', () => {
  clearPixelCanvas();
});

loadImageBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        pixelCtx.drawImage(img, 0, 0, pixelCanvas.width, pixelCanvas.height);
        drawPixelGrid();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
});

savePixelArtBtn.addEventListener('click', () => {
  const dataURL = pixelCanvas.toDataURL('image/png');
  const example = {
    type: 'pixel-art',
    name: `Pixel Art ${new Date().toLocaleString()}`,
    data: dataURL,
    date: new Date().toISOString(),
    metadata: {
      gridSize: currentGridSize,
      colorDepth: parseInt(colorDepth.value)
    }
  };
  
  saveToDB(STORE_NAMES.examples, example).then(() => {
    showNotification('Pixel art saved!', 'success');
    progressData.pixelArtCreated++;
    saveProgress();
    loadExamples();
  });
});

// Initialize
initPixelCanvas();

// ==================== RESOLUTION & QUALITY ====================
const resImageUpload = document.getElementById('resImageUpload');
const resImageUploadBtn = document.getElementById('resImageUploadBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const compareResolutionsBtn = document.getElementById('compareResolutionsBtn');
const saveComparisonBtn = document.getElementById('saveComparisonBtn');
const originalImage = document.getElementById('originalImage');
const lowResCanvas = document.getElementById('lowResCanvas');
const mediumResCanvas = document.getElementById('mediumResCanvas');
const highResCanvas = document.getElementById('highResCanvas');
const originalStats = document.getElementById('originalStats');
const lowResStats = document.getElementById('lowResStats');
const mediumResStats = document.getElementById('mediumResStats');
const highResStats = document.getElementById('highResStats');

let currentImage = null;

resImageUploadBtn.addEventListener('click', () => {
  resImageUpload.click();
});

resImageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    originalImage.src = event.target.result;
    originalImage.onload = () => {
      currentImage = originalImage;
      updateImageStats(originalImage, originalStats);
      compareResolutions();
    };
  };
  reader.readAsDataURL(file);
});

qualitySlider.addEventListener('input', (e) => {
  qualityValue.textContent = `${e.target.value}%`;
});

function compareResolutions() {
  if (!currentImage) return;
  
  const originalWidth = currentImage.naturalWidth;
  const originalHeight = currentImage.naturalHeight;
  const quality = parseInt(qualitySlider.value) / 100;
  
  // Low res (50%)
  const lowCtx = lowResCanvas.getContext('2d');
  lowResCanvas.width = originalWidth * 0.5;
  lowResCanvas.height = originalHeight * 0.5;
  lowCtx.drawImage(currentImage, 0, 0, lowResCanvas.width, lowResCanvas.height);
  updateCanvasStats(lowResCanvas, lowResStats, 0.5);
  
  // Medium res (75%)
  const mediumCtx = mediumResCanvas.getContext('2d');
  mediumResCanvas.width = originalWidth * 0.75;
  mediumResCanvas.height = originalHeight * 0.75;
  mediumCtx.drawImage(currentImage, 0, 0, mediumResCanvas.width, mediumResCanvas.height);
  updateCanvasStats(mediumResCanvas, mediumResStats, 0.75);
  
  // High res (100%)
  const highCtx = highResCanvas.getContext('2d');
  highResCanvas.width = originalWidth;
  highResCanvas.height = originalHeight;
  highCtx.drawImage(currentImage, 0, 0, highResCanvas.width, highResCanvas.height);
  updateCanvasStats(highResCanvas, highResStats, 1.0);
  
  progressData.resolutionComparisons++;
  saveProgress();
}

function updateImageStats(img, statsEl) {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const pixels = width * height;
  const sizeMB = (pixels * 3) / (1024 * 1024);
  
  statsEl.innerHTML = `
    <div>Resolution: ${width}x${height}</div>
    <div>Pixels: ${pixels.toLocaleString()}</div>
    <div>Size: ~${sizeMB.toFixed(2)} MB (uncompressed)</div>
  `;
}

function updateCanvasStats(canvas, statsEl, scale) {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;
  const sizeMB = (pixels * 3) / (1024 * 1024);
  
  statsEl.innerHTML = `
    <div>Resolution: ${width}x${height}</div>
    <div>Scale: ${(scale * 100).toFixed(0)}%</div>
    <div>Pixels: ${pixels.toLocaleString()}</div>
    <div>Size: ~${sizeMB.toFixed(2)} MB</div>
  `;
}

compareResolutionsBtn.addEventListener('click', compareResolutions);

saveComparisonBtn.addEventListener('click', () => {
  if (!currentImage) {
    showNotification('Load an image first', 'error');
    return;
  }
  
  const comparison = {
    type: 'resolution-comparison',
    name: `Resolution Comparison ${new Date().toLocaleString()}`,
    data: {
      original: originalImage.src,
      lowRes: lowResCanvas.toDataURL(),
      mediumRes: mediumResCanvas.toDataURL(),
      highRes: highResCanvas.toDataURL()
    },
    date: new Date().toISOString()
  };
  
  saveToDB(STORE_NAMES.examples, comparison).then(() => {
    showNotification('Comparison saved!', 'success');
    loadExamples();
  });
});

// ==================== WAVEFORM VISUALIZER ====================
const audioUpload = document.getElementById('audioUpload');
const audioUploadBtn = document.getElementById('audioUploadBtn');
const generateToneBtn = document.getElementById('generateToneBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const saveWaveformBtn = document.getElementById('saveWaveformBtn');
const waveformCanvas = document.getElementById('waveformCanvas');
const audioPlayer = document.getElementById('audioPlayer');
const waveformFreq = document.getElementById('waveformFreq');
const waveformAmp = document.getElementById('waveformAmp');
const waveformSampleRate = document.getElementById('waveformSampleRate');

let audioContext = null;
let audioBuffer = null;
let isPlaying = false;

audioUploadBtn.addEventListener('click', () => {
  audioUpload.click();
});

audioUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  audioPlayer.src = URL.createObjectURL(file);
  audioPlayer.onloadedmetadata = () => {
    loadAudioFile(file);
  };
});

function loadAudioFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    audioContext.decodeAudioData(e.target.result).then(buffer => {
      audioBuffer = buffer;
      drawWaveform(buffer);
      waveformSampleRate.textContent = `${buffer.sampleRate} Hz`;
    });
  };
  reader.readAsArrayBuffer(file);
}

function generateTone(frequency = 440, duration = 2, sampleRate = 44100) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  const length = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  audioBuffer = buffer;
  drawWaveform(buffer);
  waveformFreq.textContent = `${frequency} Hz`;
  waveformAmp.textContent = '1.0';
  waveformSampleRate.textContent = `${sampleRate} Hz`;
  
  // Create audio blob for playback
  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  audioPlayer.src = URL.createObjectURL(blob);
}

function drawWaveform(buffer) {
  const canvas = waveformCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < canvas.width; i++) {
    const sample = data[i * step] || 0;
    const x = i;
    const y = amp + sample * amp * 0.8;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
  
  // Draw center line
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineTo(canvas.width, amp);
  ctx.stroke();
}

function audioBufferToWav(buffer) {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  let offset = 0;
  writeString(offset, 'RIFF'); offset += 4;
  view.setUint32(offset, 36 + length * numberOfChannels * 2, true); offset += 4;
  writeString(offset, 'WAVE'); offset += 4;
  writeString(offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numberOfChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numberOfChannels * 2, true); offset += 4;
  view.setUint16(offset, numberOfChannels * 2, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeString(offset, 'data'); offset += 4;
  view.setUint32(offset, length * numberOfChannels * 2, true); offset += 4;
  
  const channelData = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
}

generateToneBtn.addEventListener('click', () => {
  generateTone(440, 2, 44100);
  progressData.waveformsCreated++;
  saveProgress();
});

playPauseBtn.addEventListener('click', () => {
  if (isPlaying) {
    audioPlayer.pause();
    playPauseBtn.textContent = '▶️ Play';
    isPlaying = false;
  } else {
    audioPlayer.play();
    playPauseBtn.textContent = '⏸️ Pause';
    isPlaying = true;
  }
});

saveWaveformBtn.addEventListener('click', () => {
  if (!audioBuffer) {
    showNotification('Generate or load audio first', 'error');
    return;
  }
  
  const waveformData = waveformCanvas.toDataURL();
  const example = {
    type: 'waveform',
    name: `Waveform ${new Date().toLocaleString()}`,
    data: waveformData,
    date: new Date().toISOString(),
    metadata: {
      frequency: waveformFreq.textContent,
      sampleRate: waveformSampleRate.textContent
    }
  };
  
  saveToDB(STORE_NAMES.examples, example).then(() => {
    showNotification('Waveform saved!', 'success');
    loadExamples();
  });
});

// ==================== SAMPLING & BIT DEPTH ====================
const sampleRate = document.getElementById('sampleRate');
const bitDepth = document.getElementById('bitDepth');
const toneFreq = document.getElementById('toneFreq');
const toneFreqValue = document.getElementById('toneFreqValue');
const generateSampledToneBtn = document.getElementById('generateSampledToneBtn');
const compareSamplingBtn = document.getElementById('compareSamplingBtn');
const saveSamplingBtn = document.getElementById('saveSamplingBtn');
const samplingCanvas = document.getElementById('samplingCanvas');
const currentSampleRate = document.getElementById('currentSampleRate');
const currentBitDepth = document.getElementById('currentBitDepth');
const dynamicRange = document.getElementById('dynamicRange');
const samplingFileSize = document.getElementById('samplingFileSize');

toneFreq.addEventListener('input', (e) => {
  toneFreqValue.textContent = `${e.target.value} Hz`;
});

function generateSampledTone() {
  const freq = parseInt(toneFreq.value);
  const sr = parseInt(sampleRate.value);
  const depth = parseInt(bitDepth.value);
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  const duration = 1;
  const length = sr * duration;
  const buffer = audioContext.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);
  
  const maxValue = Math.pow(2, depth - 1) - 1;
  
  for (let i = 0; i < length; i++) {
    const sample = Math.sin(2 * Math.PI * freq * i / sr);
    // Quantize based on bit depth
    const quantized = Math.round(sample * maxValue) / maxValue;
    data[i] = quantized;
  }
  
  drawSamplingComparison(buffer, depth);
  updateSamplingInfo(sr, depth);
  
  progressData.samplingExperiments++;
  saveProgress();
}

function drawSamplingComparison(buffer, bitDepth) {
  const canvas = samplingCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 300;
  
  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw smooth reference
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const freq = parseInt(toneFreq.value);
  const sr = parseInt(sampleRate.value);
  for (let i = 0; i < canvas.width; i++) {
    const x = i;
    const t = (i / canvas.width) * (data.length / sr);
    const y = amp + Math.sin(2 * Math.PI * freq * t) * amp * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw sampled waveform
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < canvas.width; i++) {
    const sample = data[i * step] || 0;
    const x = i;
    const y = amp + sample * amp * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw quantization levels
  const levels = Math.pow(2, bitDepth);
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < levels; i++) {
    const y = (i / levels) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Center line
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, amp);
  ctx.lineTo(canvas.width, amp);
  ctx.stroke();
}

function updateSamplingInfo(sr, depth) {
  currentSampleRate.textContent = `${sr} Hz`;
  currentBitDepth.textContent = `${depth}-bit`;
  dynamicRange.textContent = `${(depth * 6).toFixed(1)} dB`;
  
  // Calculate file size (1 minute)
  const channels = 1;
  const duration = 60; // seconds
  const bytesPerSample = depth / 8;
  const fileSizeMB = (sr * channels * bytesPerSample * duration) / (1024 * 1024);
  samplingFileSize.textContent = `~${fileSizeMB.toFixed(2)} MB`;
}

generateSampledToneBtn.addEventListener('click', generateSampledTone);

compareSamplingBtn.addEventListener('click', () => {
  // Show comparison of different bit depths
  const depths = [8, 16, 24];
  const comparison = {
    type: 'sampling-comparison',
    name: `Sampling Comparison ${new Date().toLocaleString()}`,
    data: samplingCanvas.toDataURL(),
    date: new Date().toISOString(),
    metadata: {
      sampleRate: parseInt(sampleRate.value),
      bitDepths: depths
    }
  };
  
  saveToDB(STORE_NAMES.examples, comparison).then(() => {
    showNotification('Comparison saved!', 'success');
    loadExamples();
  });
});

saveSamplingBtn.addEventListener('click', () => {
  const example = {
    type: 'sampling',
    name: `Sampling ${new Date().toLocaleString()}`,
    data: samplingCanvas.toDataURL(),
    date: new Date().toISOString(),
    metadata: {
      sampleRate: parseInt(sampleRate.value),
      bitDepth: parseInt(bitDepth.value),
      frequency: parseInt(toneFreq.value)
    }
  };
  
  saveToDB(STORE_NAMES.examples, example).then(() => {
    showNotification('Sampling experiment saved!', 'success');
    loadExamples();
  });
});

// ==================== AUDIO COMPRESSION ====================
const compressionUpload = document.getElementById('compressionUpload');
const compressionUploadBtn = document.getElementById('compressionUploadBtn');
const compressionType = document.getElementById('compressionType');
const applyCompressionBtn = document.getElementById('applyCompressionBtn');
const saveCompressionBtn = document.getElementById('saveCompressionBtn');
const originalAudio = document.getElementById('originalAudio');
const compressedAudio = document.getElementById('compressedAudio');
const originalAudioStats = document.getElementById('originalAudioStats');
const compressedAudioStats = document.getElementById('compressedAudioStats');
const compressionCanvas = document.getElementById('compressionCanvas');

compressionUploadBtn.addEventListener('click', () => {
  compressionUpload.click();
});

compressionUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  originalAudio.src = URL.createObjectURL(file);
  originalAudioStats.innerHTML = `
    <div>Format: ${file.type || 'Unknown'}</div>
    <div>Size: ${(file.size / 1024).toFixed(2)} KB</div>
    <div>Compression: None</div>
  `;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    audioContext.decodeAudioData(event.target.result).then(buffer => {
      drawCompressionComparison(buffer, buffer);
    });
  };
  reader.readAsArrayBuffer(file);
});

applyCompressionBtn.addEventListener('click', () => {
  if (!originalAudio.src) {
    showNotification('Load audio first', 'error');
    return;
  }
  
  const compression = compressionType.value;
  const bitrate = compression.includes('128') ? 128 : compression.includes('192') ? 192 : compression.includes('320') ? 320 : 0;
  
  // Simulate compression (in real app, would use actual codec)
  const originalFile = originalAudio.src;
  compressedAudio.src = originalFile; // In real implementation, would compress
  
  const originalSize = 100; // Would get from actual file
  const compressionRatio = bitrate > 0 ? (bitrate / 320) : 1;
  const compressedSize = originalSize * compressionRatio;
  
  compressedAudioStats.innerHTML = `
    <div>Format: ${compression.split('-')[0].toUpperCase()}</div>
    <div>Bitrate: ${bitrate} kbps</div>
    <div>Size: ~${compressedSize.toFixed(2)} KB (estimated)</div>
    <div>Compression: ${((1 - compressionRatio) * 100).toFixed(1)}%</div>
  `;
  
  progressData.compressionExperiments++;
  saveProgress();
});

function drawCompressionComparison(originalBuffer, compressedBuffer) {
  const canvas = compressionCanvas;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  
  const originalData = originalBuffer.getChannelData(0);
  const compressedData = compressedBuffer.getChannelData(0);
  const step = Math.ceil(originalData.length / canvas.width);
  const amp = canvas.height / 2;
  
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw original
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < canvas.width; i++) {
    const sample = originalData[i * step] || 0;
    const x = i;
    const y = amp + sample * amp * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Draw compressed (simulated)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < canvas.width; i++) {
    const sample = compressedData[i * step] || 0;
    const x = i;
    const y = amp + sample * amp * 0.8;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // Legend
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(10, 10, 20, 2);
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '12px sans-serif';
  ctx.fillText('Original', 35, 15);
  
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 25, 20, 2);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillText('Compressed', 35, 30);
}

saveCompressionBtn.addEventListener('click', () => {
  const example = {
    type: 'compression',
    name: `Compression ${new Date().toLocaleString()}`,
    data: compressionCanvas.toDataURL(),
    date: new Date().toISOString(),
    metadata: {
      compressionType: compressionType.value
    }
  };
  
  saveToDB(STORE_NAMES.examples, example).then(() => {
    showNotification('Compression comparison saved!', 'success');
    loadExamples();
  });
});

// ==================== IMAGE MANIPULATION ETHICS ====================
const ethicsImageUpload = document.getElementById('ethicsImageUpload');
const ethicsImageUploadBtn = document.getElementById('ethicsImageUploadBtn');
const manipulationType = document.getElementById('manipulationType');
const manipulationIntensity = document.getElementById('manipulationIntensity');
const manipulationIntensityValue = document.getElementById('manipulationIntensityValue');
const applyManipulationBtn = document.getElementById('applyManipulationBtn');
const resetManipulationBtn = document.getElementById('resetManipulationBtn');
const saveEthicsBtn = document.getElementById('saveEthicsBtn');
const ethicsOriginalCanvas = document.getElementById('ethicsOriginalCanvas');
const ethicsManipulatedCanvas = document.getElementById('ethicsManipulatedCanvas');
const scenarioList = document.getElementById('scenarioList');

let originalImageData = null;

const ethicalScenarios = [
  {
    title: 'News Photography',
    description: 'A news outlet uses photo editing to enhance the contrast of a political rally photo, making the crowd appear larger.',
    questions: [
      'Is this ethical?',
      'Does it change the meaning of the photo?',
      'Should news photos be edited?'
    ]
  },
  {
    title: 'Fashion Advertising',
    description: 'A fashion brand uses Photoshop to make models appear thinner and remove blemishes in their advertisements.',
    questions: [
      'What are the ethical implications?',
      'How does this affect body image?',
      'Should there be disclosure requirements?'
    ]
  },
  {
    title: 'Historical Documentation',
    description: 'A museum digitally restores a damaged historical photograph, adding color to a black and white image.',
    questions: [
      'Is this preservation or manipulation?',
      'Should historical images be modified?',
      'How should this be documented?'
    ]
  },
  {
    title: 'Social Media',
    description: 'An influencer uses filters and editing to create an idealized version of their life on social media.',
    questions: [
      'What are the consequences?',
      'Should platforms require disclosure?',
      'How does this affect mental health?'
    ]
  },
  {
    title: 'Scientific Research',
    description: 'A researcher adjusts the brightness of microscope images to better visualize cell structures for publication.',
    questions: [
      'Is this acceptable in research?',
      'What are the limits?',
      'How should this be documented?'
    ]
  }
];

function renderScenarios() {
  scenarioList.innerHTML = ethicalScenarios.map((scenario, index) => `
    <div class="scenario-item">
      <h4>${scenario.title}</h4>
      <p>${scenario.description}</p>
      <div class="scenario-questions">
        <strong>Questions to consider:</strong>
        <ul>
          ${scenario.questions.map(q => `<li>${q}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

ethicsImageUploadBtn.addEventListener('click', () => {
  ethicsImageUpload.click();
});

ethicsImageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = ethicsOriginalCanvas;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      ethicsManipulatedCanvas.width = img.width;
      ethicsManipulatedCanvas.height = img.height;
      const manipulatedCtx = ethicsManipulatedCanvas.getContext('2d');
      manipulatedCtx.putImageData(originalImageData, 0, 0);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

manipulationIntensity.addEventListener('input', (e) => {
  manipulationIntensityValue.textContent = `${e.target.value}%`;
});

applyManipulationBtn.addEventListener('click', () => {
  if (!originalImageData) {
    showNotification('Load an image first', 'error');
    return;
  }
  
  const type = manipulationType.value;
  const intensity = parseInt(manipulationIntensity.value) / 100;
  const canvas = ethicsManipulatedCanvas;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    originalImageData.width,
    originalImageData.height
  );
  
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let a = data[i + 3];
    
    switch (type) {
      case 'brightness':
        const brightFactor = 1 + (intensity * 0.5);
        r = Math.min(255, r * brightFactor);
        g = Math.min(255, g * brightFactor);
        b = Math.min(255, b * brightFactor);
        break;
      case 'contrast':
        const contrastFactor = 1 + (intensity * 2);
        r = Math.min(255, Math.max(0, (r - 128) * contrastFactor + 128));
        g = Math.min(255, Math.max(0, (g - 128) * contrastFactor + 128));
        b = Math.min(255, Math.max(0, (b - 128) * contrastFactor + 128));
        break;
      case 'saturation':
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (r - gray) * (1 + intensity)));
        g = Math.min(255, Math.max(0, gray + (g - gray) * (1 + intensity)));
        b = Math.min(255, Math.max(0, gray + (b - gray) * (1 + intensity)));
        break;
      case 'blur':
        // Simple blur simulation
        break;
      case 'sharpen':
        // Simple sharpen simulation
        break;
    }
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  progressData.ethicsExperiments++;
  saveProgress();
});

resetManipulationBtn.addEventListener('click', () => {
  if (!originalImageData) return;
  const ctx = ethicsManipulatedCanvas.getContext('2d');
  ctx.putImageData(originalImageData, 0, 0);
});

saveEthicsBtn.addEventListener('click', () => {
  if (!originalImageData) {
    showNotification('Load an image first', 'error');
    return;
  }
  
  const example = {
    type: 'ethics',
    name: `Ethics Experiment ${new Date().toLocaleString()}`,
    data: {
      original: ethicsOriginalCanvas.toDataURL(),
      manipulated: ethicsManipulatedCanvas.toDataURL()
    },
    date: new Date().toISOString(),
    metadata: {
      manipulationType: manipulationType.value,
      intensity: parseInt(manipulationIntensity.value)
    }
  };
  
  saveToDB(STORE_NAMES.examples, example).then(() => {
    showNotification('Ethics experiment saved!', 'success');
    loadExamples();
  });
});

renderScenarios();

// ==================== PROGRESS TRACKING ====================
const generateProgressReportBtn = document.getElementById('generateProgressReportBtn');
const exportProgressBtn = document.getElementById('exportProgressBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');
const examplesList = document.getElementById('examplesList');

let progressData = {
  pixelArtCreated: 0,
  resolutionComparisons: 0,
  waveformsCreated: 0,
  samplingExperiments: 0,
  compressionExperiments: 0,
  ethicsExperiments: 0,
  sessions: 0
};

function saveProgress() {
  if (!db) return;
  const transaction = db.transaction([STORE_NAMES.progress], 'readwrite');
  const store = transaction.objectStore(STORE_NAMES.progress);
  store.put({ id: 'main', ...progressData });
}

function loadProgress() {
  if (!db) return;
  loadFromDB(STORE_NAMES.progress).then(data => {
    if (data.length > 0) {
      const saved = data.find(d => d.id === 'main');
      if (saved) {
        progressData = { ...progressData, ...saved };
      }
    }
    updateProgressStats();
  });
}

function updateProgressStats() {
  const total = Object.values(progressData).reduce((sum, val) => {
    return typeof val === 'number' ? sum + val : sum;
  }, 0);
  
  progressStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Pixel Art Created</div>
      <div class="stat-value">${progressData.pixelArtCreated || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Resolution Comparisons</div>
      <div class="stat-value">${progressData.resolutionComparisons || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Waveforms Created</div>
      <div class="stat-value">${progressData.waveformsCreated || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sampling Experiments</div>
      <div class="stat-value">${progressData.samplingExperiments || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Compression Tests</div>
      <div class="stat-value">${progressData.compressionExperiments || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ethics Experiments</div>
      <div class="stat-value">${progressData.ethicsExperiments || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Activities</div>
      <div class="stat-value">${total}</div>
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
      <h3>Activity Summary</h3>
      <div class="report-item">
        <span>Pixel Art Created: ${progressData.pixelArtCreated || 0}</span>
      </div>
      <div class="report-item">
        <span>Resolution Comparisons: ${progressData.resolutionComparisons || 0}</span>
      </div>
      <div class="report-item">
        <span>Waveforms Created: ${progressData.waveformsCreated || 0}</span>
      </div>
      <div class="report-item">
        <span>Sampling Experiments: ${progressData.samplingExperiments || 0}</span>
      </div>
      <div class="report-item">
        <span>Compression Tests: ${progressData.compressionExperiments || 0}</span>
      </div>
      <div class="report-item">
        <span>Ethics Experiments: ${progressData.ethicsExperiments || 0}</span>
      </div>
      <div class="report-item">
        <span>Total Sessions: ${progressData.sessions || 0}</span>
      </div>
    </div>
  `;
}

function loadExamples() {
  loadFromDB(STORE_NAMES.examples).then(examples => {
    examplesList.innerHTML = examples.map(example => `
      <div class="example-item">
        <h4>${example.name}</h4>
        <p>Type: ${example.type}</p>
        <p>Date: ${new Date(example.date).toLocaleString()}</p>
        <div class="example-actions">
          <button class="btn-secondary" onclick="viewExample(${example.id})">View</button>
          <button class="btn-secondary" onclick="deleteExample(${example.id})" style="background: var(--danger); color: white;">Delete</button>
        </div>
      </div>
    `).join('');
  });
}

window.viewExample = function(id) {
  loadFromDB(STORE_NAMES.examples).then(examples => {
    const example = examples.find(e => e.id === id);
    if (!example) return;
    
    if (typeof example.data === 'string') {
      // Image data
      const img = new Image();
      img.src = example.data;
      const w = window.open('', '_blank');
      w.document.write(`<img src="${example.data}" style="max-width: 100%;">`);
    } else if (example.data.original) {
      // Comparison data
      const w = window.open('', '_blank');
      w.document.write(`
        <h2>Original</h2>
        <img src="${example.data.original}" style="max-width: 100%;">
        <h2>Modified</h2>
        <img src="${example.data.manipulated || example.data.lowRes || ''}" style="max-width: 100%;">
      `);
    }
  });
};

window.deleteExample = function(id) {
  if (confirm('Delete this example?')) {
    deleteFromDB(STORE_NAMES.examples, id).then(() => {
      showNotification('Example deleted', 'success');
      loadExamples();
    });
  }
};

generateProgressReportBtn.addEventListener('click', generateReport);
exportProgressBtn.addEventListener('click', () => {
  const reportElement = progressReport;
  html2canvas(reportElement).then(canvas => {
    const link = document.createElement('a');
    link.download = 'digital-representation-progress.png';
    link.href = canvas.toDataURL();
    link.click();
    showNotification('Progress exported!', 'success');
  });
});

clearProgressBtn.addEventListener('click', () => {
  if (confirm('Clear all progress? This cannot be undone.')) {
    progressData = {
      pixelArtCreated: 0,
      resolutionComparisons: 0,
      waveformsCreated: 0,
      samplingExperiments: 0,
      compressionExperiments: 0,
      ethicsExperiments: 0,
      sessions: 0
    };
    saveProgress();
    updateProgressStats();
    progressReport.innerHTML = '';
    showNotification('Progress cleared', 'success');
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

// Load progress and examples on startup
initDB().then(() => {
  loadProgress();
  loadExamples();
  progressData.sessions = (progressData.sessions || 0) + 1;
  saveProgress();
});


