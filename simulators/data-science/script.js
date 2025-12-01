// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'data-science';
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

const DB_NAME = 'DataScienceDB';
const DB_VERSION = 1;
const STORE_NAMES = {
  datasets: 'datasets',
  progress: 'progress',
  ppdac: 'ppdac'
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
          if (storeName === 'datasets') {
            store.createIndex('name', 'name', { unique: false });
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

// Initialize DB
initDB().catch(console.error);

// ==================== DATASET MANAGEMENT ====================

let currentDataset = null;
let chartInstance = null;

const loadSampleBtn = document.getElementById('loadSampleBtn');
const importCSVBtn = document.getElementById('importCSVBtn');
const createDatasetBtn = document.getElementById('createDatasetBtn');
const saveDatasetBtn = document.getElementById('saveDatasetBtn');
const loadDatasetBtn = document.getElementById('loadDatasetBtn');
const csvFileInput = document.getElementById('csvFileInput');
const datasetInfo = document.getElementById('datasetInfo');
const dataTable = document.getElementById('dataTable');
const datasetStats = document.getElementById('datasetStats');
const searchData = document.getElementById('searchData');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

const sampleDatasets = {
  'Student Grades': {
    name: 'Student Grades',
    columns: ['Student', 'Math', 'Science', 'English', 'History'],
    data: [
      ['Alice', 85, 90, 88, 82],
      ['Bob', 78, 85, 80, 75],
      ['Charlie', 92, 88, 95, 90],
      ['Diana', 88, 92, 85, 88],
      ['Eve', 75, 80, 78, 72],
      ['Frank', 90, 85, 92, 88],
      ['Grace', 82, 88, 85, 80],
      ['Henry', 95, 90, 98, 92]
    ]
  },
  'Temperature Data': {
    name: 'Temperature Data',
    columns: ['Month', 'Temperature', 'Humidity', 'Rainfall'],
    data: [
      ['January', 5, 65, 45],
      ['February', 7, 60, 40],
      ['March', 12, 55, 35],
      ['April', 18, 50, 30],
      ['May', 22, 55, 25],
      ['June', 25, 60, 20],
      ['July', 28, 65, 15],
      ['August', 27, 70, 20]
    ]
  },
  'Sales Data': {
    name: 'Sales Data',
    columns: ['Product', 'Q1', 'Q2', 'Q3', 'Q4'],
    data: [
      ['Widget A', 1200, 1350, 1500, 1650],
      ['Widget B', 800, 950, 1100, 1250],
      ['Widget C', 1500, 1600, 1700, 1800],
      ['Widget D', 600, 700, 800, 900],
      ['Widget E', 2000, 2100, 2200, 2300]
    ]
  }
};

function loadDataset(dataset) {
  currentDataset = dataset;
  renderDatasetInfo();
  renderDataTable();
  updateDatasetStats();
  updateChartOptions();
  updateDataSummary();
  
  progressData.datasetsLoaded++;
  saveProgress();
}

function renderDatasetInfo() {
  if (!currentDataset) {
    datasetInfo.innerHTML = '<p style="color: var(--text-muted);">No dataset loaded. Load a sample or import your own.</p>';
    return;
  }
  
  datasetInfo.innerHTML = `
    <h3>${currentDataset.name}</h3>
    <div style="margin-top: 10px; display: flex; gap: 20px; flex-wrap: wrap;">
      <div><strong>Rows:</strong> ${currentDataset.data.length}</div>
      <div><strong>Columns:</strong> ${currentDataset.columns.length}</div>
      <div><strong>Columns:</strong> ${currentDataset.columns.join(', ')}</div>
    </div>
  `;
}

function renderDataTable() {
  if (!currentDataset) {
    dataTable.innerHTML = '';
    return;
  }
  
  const searchTerm = searchData.value.toLowerCase();
  const filteredData = currentDataset.data.filter(row => {
    if (!searchTerm) return true;
    return row.some(cell => String(cell).toLowerCase().includes(searchTerm));
  });
  
  dataTable.innerHTML = `
    <thead>
      <tr>
        ${currentDataset.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${filteredData.map(row => `
        <tr>
          ${row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;
}

function updateDatasetStats() {
  if (!currentDataset) {
    datasetStats.innerHTML = '';
    return;
  }
  
  const numericColumns = [];
  currentDataset.columns.forEach((col, index) => {
    const values = currentDataset.data.map(row => parseFloat(row[index])).filter(v => !isNaN(v));
    if (values.length > 0) {
      numericColumns.push({
        name: col,
        values: values,
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      });
    }
  });
  
  datasetStats.innerHTML = numericColumns.map(col => `
    <div class="stat-card">
      <div class="stat-label">${col.name}</div>
      <div class="stat-value">${col.mean.toFixed(1)}</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">
        Min: ${col.min} | Max: ${col.max}
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return null;
  
  const columns = lines[0].split(',').map(col => col.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(val => val.trim());
    return values.map(val => {
      const num = parseFloat(val);
      return isNaN(num) ? val : num;
    });
  });
  
  return {
    name: 'Imported Dataset',
    columns: columns,
    data: data
  };
}

loadSampleBtn.addEventListener('click', () => {
  const datasets = Object.keys(sampleDatasets);
  const choice = prompt(`Choose a sample dataset:\n\n${datasets.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n\nEnter number:`);
  const index = parseInt(choice) - 1;
  if (index >= 0 && index < datasets.length) {
    loadDataset(sampleDatasets[datasets[index]]);
  }
});

importCSVBtn.addEventListener('click', () => {
  csvFileInput.click();
});

csvFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const dataset = parseCSV(event.target.result);
      if (dataset) {
        loadDataset(dataset);
        showNotification('CSV imported successfully!', 'success');
      } else {
        showNotification('Invalid CSV format', 'error');
      }
    } catch (err) {
      showNotification('Error parsing CSV', 'error');
      console.error(err);
    }
  };
  reader.readAsText(file);
});

createDatasetBtn.addEventListener('click', () => {
  const name = prompt('Enter dataset name:');
  if (!name) return;
  
  const columnsInput = prompt('Enter column names (comma-separated):');
  if (!columnsInput) return;
  
  const columns = columnsInput.split(',').map(c => c.trim());
  const dataset = {
    name: name,
    columns: columns,
    data: []
  };
  
  loadDataset(dataset);
  showNotification('New dataset created! Add data in the table.', 'success');
});

saveDatasetBtn.addEventListener('click', () => {
  if (!currentDataset) {
    showNotification('No dataset to save', 'error');
    return;
  }
  
  const datasetData = {
    name: currentDataset.name,
    date: new Date().toISOString(),
    columns: currentDataset.columns,
    data: currentDataset.data
  };
  
  saveToDB(STORE_NAMES.datasets, datasetData).then(() => {
    showNotification('Dataset saved!', 'success');
    progressData.datasetsSaved++;
    saveProgress();
  }).catch(err => {
    console.error('Error saving dataset:', err);
    showNotification('Error saving dataset', 'error');
  });
});

loadDatasetBtn.addEventListener('click', () => {
  loadFromDB(STORE_NAMES.datasets).then(datasets => {
    if (datasets.length === 0) {
      showNotification('No saved datasets found', 'info');
      return;
    }
    
    const datasetNames = datasets.map((d, i) => `${i + 1}. ${d.name} (${new Date(d.date).toLocaleDateString()})`).join('\n');
    const choice = prompt(`Select a dataset to load:\n\n${datasetNames}\n\nEnter number:`);
    const index = parseInt(choice) - 1;
    
    if (index >= 0 && index < datasets.length) {
      const dataset = datasets[index];
      loadDataset({
        name: dataset.name,
        columns: dataset.columns,
        data: dataset.data
      });
      showNotification('Dataset loaded!', 'success');
    }
  });
});

searchData.addEventListener('input', () => {
  renderDataTable();
});

clearFiltersBtn.addEventListener('click', () => {
  searchData.value = '';
  renderDataTable();
});

// Initialize
renderDatasetInfo();

// ==================== VISUALIZATION ====================

const chartType = document.getElementById('chartType');
const xAxis = document.getElementById('xAxis');
const yAxis = document.getElementById('yAxis');
const generateChartBtn = document.getElementById('generateChartBtn');
const exportChartBtn = document.getElementById('exportChartBtn');
const chartCanvas = document.getElementById('chartCanvas');
const chartInfo = document.getElementById('chartInfo');

function updateChartOptions() {
  if (!currentDataset) {
    xAxis.innerHTML = '<option>No dataset loaded</option>';
    yAxis.innerHTML = '<option>No dataset loaded</option>';
    return;
  }
  
  const options = currentDataset.columns.map(col => `<option value="${col}">${col}</option>`).join('');
  xAxis.innerHTML = options;
  yAxis.innerHTML = options;
}

function generateChart() {
  if (!currentDataset) {
    showNotification('Load a dataset first', 'error');
    return;
  }
  
  const type = chartType.value;
  const xCol = xAxis.value;
  const yCol = yAxis.value;
  
  if (!xCol || !yCol) {
    showNotification('Select X and Y axes', 'error');
    return;
  }
  
  const xIndex = currentDataset.columns.indexOf(xCol);
  const yIndex = currentDataset.columns.indexOf(yCol);
  
  if (xIndex === -1 || yIndex === -1) {
    showNotification('Invalid column selection', 'error');
    return;
  }
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  const xValues = currentDataset.data.map(row => row[xIndex]);
  const yValues = currentDataset.data.map(row => parseFloat(row[yIndex])).filter(v => !isNaN(v));
  
  if (yValues.length === 0) {
    showNotification('Y-axis column must contain numeric values', 'error');
    return;
  }
  
  const ctx = chartCanvas.getContext('2d');
  
  let chartData, chartConfig;
  
  if (type === 'pie') {
    chartData = {
      labels: xValues,
      datasets: [{
        label: yCol,
        data: yValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(167, 139, 250, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }]
    };
  } else {
    chartData = {
      labels: xValues,
      datasets: [{
        label: yCol,
        data: yValues,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    };
  }
  
  chartConfig = {
    type: type,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: '#e5e7eb'
          }
        }
      },
      scales: type !== 'pie' ? {
        x: {
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        },
        y: {
          ticks: { color: '#9ca3af' },
          grid: { color: '#374151' }
        }
      } : {}
    }
  };
  
  chartInstance = new Chart(ctx, chartConfig);
  
  chartInfo.innerHTML = `
    <h4>Chart Information</h4>
    <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
    <p><strong>X-Axis:</strong> ${xCol}</p>
    <p><strong>Y-Axis:</strong> ${yCol}</p>
    <p><strong>Data Points:</strong> ${yValues.length}</p>
  `;
  
  progressData.chartsCreated++;
  saveProgress();
}

exportChartBtn.addEventListener('click', () => {
  if (!chartInstance) {
    showNotification('Generate a chart first', 'error');
    return;
  }
  
  const url = chartInstance.toBase64Image();
  const link = document.createElement('a');
  link.download = `chart-${Date.now()}.png`;
  link.href = url;
  link.click();
  showNotification('Chart exported!', 'success');
});

generateChartBtn.addEventListener('click', generateChart);

// ==================== PPDAC WORKFLOW ====================

const ppdacStepBtns = document.querySelectorAll('.ppdac-step-btn');
const ppdacStepContents = document.querySelectorAll('.ppdac-step-content');
const problemText = document.getElementById('problemText');
const planText = document.getElementById('planText');
const analysisText = document.getElementById('analysisText');
const conclusionText = document.getElementById('conclusionText');
const goToDatasetBtn = document.getElementById('goToDatasetBtn');
const goToVisualizeBtn = document.getElementById('goToVisualizeBtn');
const addAnnotationBtn = document.getElementById('addAnnotationBtn');
const annotationsList = document.getElementById('annotationsList');
const exportWorkflowBtn = document.getElementById('exportWorkflowBtn');
const exportWorkflowImageBtn = document.getElementById('exportWorkflowImageBtn');

let annotations = [];
let currentStep = 'problem';

ppdacStepBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const step = btn.dataset.step;
    currentStep = step;
    
    ppdacStepBtns.forEach(b => b.classList.remove('active'));
    ppdacStepContents.forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(step + 'Step').classList.add('active');
    
    savePPDAC();
  });
});

function savePPDAC() {
  const ppdacData = {
    problem: problemText.value,
    plan: planText.value,
    analysis: analysisText.value,
    conclusion: conclusionText.value,
    annotations: annotations,
    date: new Date().toISOString()
  };
  
  loadFromDB(STORE_NAMES.ppdac).then(existing => {
    if (existing.length > 0) {
      updateInDB(STORE_NAMES.ppdac, existing[0].id, ppdacData);
    } else {
      saveToDB(STORE_NAMES.ppdac, ppdacData);
    }
  });
  
  progressData.ppdacCompleted = {
    problem: problemText.value.length > 0,
    plan: planText.value.length > 0,
    analysis: analysisText.value.length > 0,
    conclusion: conclusionText.value.length > 0
  };
  saveProgress();
}

problemText.addEventListener('input', savePPDAC);
planText.addEventListener('input', savePPDAC);
analysisText.addEventListener('input', savePPDAC);
conclusionText.addEventListener('input', savePPDAC);

goToDatasetBtn.addEventListener('click', () => {
  document.querySelector('[data-tab="dataset"]').click();
});

goToVisualizeBtn.addEventListener('click', () => {
  document.querySelector('[data-tab="visualize"]').click();
});

function renderAnnotations() {
  annotationsList.innerHTML = annotations.map((annotation, index) => `
    <div class="annotation-item">
      <div class="annotation-text">${escapeHtml(annotation)}</div>
      <div class="annotation-actions">
        <button class="btn-secondary" onclick="editAnnotation(${index})" style="padding: 6px 12px; font-size: 12px;">Edit</button>
        <button class="btn-secondary" onclick="deleteAnnotation(${index})" style="padding: 6px 12px; font-size: 12px; background: var(--danger); color: white;">Delete</button>
      </div>
    </div>
  `).join('');
}

window.editAnnotation = function(index) {
  const current = annotations[index];
  const newText = prompt('Edit annotation:', current);
  if (newText !== null) {
    annotations[index] = newText;
    renderAnnotations();
    savePPDAC();
  }
};

window.deleteAnnotation = function(index) {
  annotations.splice(index, 1);
  renderAnnotations();
  savePPDAC();
};

addAnnotationBtn.addEventListener('click', () => {
  const text = prompt('Enter annotation:');
  if (text) {
    annotations.push(text);
    renderAnnotations();
    savePPDAC();
  }
});

function updateDataSummary() {
  const dataSummary = document.getElementById('dataSummary');
  if (!currentDataset) {
    dataSummary.innerHTML = '<p style="color: var(--text-muted);">No dataset loaded. Go to Dataset tab to load data.</p>';
    return;
  }
  
  dataSummary.innerHTML = `
    <h4>Dataset Summary</h4>
    <p><strong>Name:</strong> ${currentDataset.name}</p>
    <p><strong>Rows:</strong> ${currentDataset.data.length}</p>
    <p><strong>Columns:</strong> ${currentDataset.columns.join(', ')}</p>
  `;
}

function exportWorkflow() {
  const workflow = {
    problem: problemText.value,
    plan: planText.value,
    analysis: analysisText.value,
    conclusion: conclusionText.value,
    annotations: annotations,
    dataset: currentDataset ? currentDataset.name : 'None',
    date: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(workflow, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ppdac-workflow-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showNotification('Workflow exported!', 'success');
}

function exportWorkflowImage() {
  const workflowContent = document.querySelector('.ppdac-content');
  html2canvas(workflowContent).then(canvas => {
    const link = document.createElement('a');
    link.download = `ppdac-workflow-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showNotification('Workflow exported as image!', 'success');
  });
}

exportWorkflowBtn.addEventListener('click', exportWorkflow);
exportWorkflowImageBtn.addEventListener('click', exportWorkflowImage);

// Load PPDAC data on startup
loadFromDB(STORE_NAMES.ppdac).then(data => {
  if (data.length > 0) {
    const ppdac = data[0];
    problemText.value = ppdac.problem || '';
    planText.value = ppdac.plan || '';
    analysisText.value = ppdac.analysis || '';
    conclusionText.value = ppdac.conclusion || '';
    annotations = ppdac.annotations || [];
    renderAnnotations();
  }
});

// ==================== PROGRESS TAB ====================

const generateProgressReportBtn = document.getElementById('generateProgressReportBtn');
const exportProgressBtn = document.getElementById('exportProgressBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');

let progressData = {
  datasetsLoaded: 0,
  datasetsSaved: 0,
  chartsCreated: 0,
  ppdacCompleted: {
    problem: false,
    plan: false,
    analysis: false,
    conclusion: false
  },
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
  const ppdacCount = Object.values(progressData.ppdacCompleted).filter(Boolean).length;
  
  progressStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Datasets Loaded</div>
      <div class="stat-value">${progressData.datasetsLoaded || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Charts Created</div>
      <div class="stat-value">${progressData.chartsCreated || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">PPDAC Steps</div>
      <div class="stat-value">${ppdacCount}/4</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Sessions</div>
      <div class="stat-value">${progressData.sessions || 0}</div>
    </div>
  `;
}

function generateReport() {
  const ppdacCount = Object.values(progressData.ppdacCompleted).filter(Boolean).length;
  
  progressReport.innerHTML = `
    <div class="report-section">
      <h3>Activity Summary</h3>
      <div class="report-item">
        <span>Datasets Loaded: ${progressData.datasetsLoaded || 0}</span>
      </div>
      <div class="report-item">
        <span>Datasets Saved: ${progressData.datasetsSaved || 0}</span>
      </div>
      <div class="report-item">
        <span>Charts Created: ${progressData.chartsCreated || 0}</span>
      </div>
      <div class="report-item">
        <span>PPDAC Steps Completed: ${ppdacCount}/4</span>
      </div>
    </div>
    <div class="report-section">
      <h3>PPDAC Progress</h3>
      <div class="report-item ${progressData.ppdacCompleted.problem ? 'completed' : ''}">
        <span>Problem: ${progressData.ppdacCompleted.problem ? 'Completed' : 'Not started'}</span>
        <span>${progressData.ppdacCompleted.problem ? '✓' : ''}</span>
      </div>
      <div class="report-item ${progressData.ppdacCompleted.plan ? 'completed' : ''}">
        <span>Plan: ${progressData.ppdacCompleted.plan ? 'Completed' : 'Not started'}</span>
        <span>${progressData.ppdacCompleted.plan ? '✓' : ''}</span>
      </div>
      <div class="report-item ${progressData.ppdacCompleted.analysis ? 'completed' : ''}">
        <span>Analysis: ${progressData.ppdacCompleted.analysis ? 'Completed' : 'Not started'}</span>
        <span>${progressData.ppdacCompleted.analysis ? '✓' : ''}</span>
      </div>
      <div class="report-item ${progressData.ppdacCompleted.conclusion ? 'completed' : ''}">
        <span>Conclusion: ${progressData.ppdacCompleted.conclusion ? 'Completed' : 'Not started'}</span>
        <span>${progressData.ppdacCompleted.conclusion ? '✓' : ''}</span>
      </div>
    </div>
  `;
}

function exportProgress() {
  const reportElement = progressReport;
  html2canvas(reportElement).then(canvas => {
    const link = document.createElement('a');
    link.download = 'data-science-progress.png';
    link.href = canvas.toDataURL();
    link.click();
    showNotification('Progress exported!', 'success');
  });
}

generateProgressReportBtn.addEventListener('click', generateReport);
exportProgressBtn.addEventListener('click', exportProgress);
clearProgressBtn.addEventListener('click', () => {
  if (confirm('Clear all progress? This cannot be undone.')) {
    progressData = {
      datasetsLoaded: 0,
      datasetsSaved: 0,
      chartsCreated: 0,
      ppdacCompleted: {
        problem: false,
        plan: false,
        analysis: false,
        conclusion: false
      },
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

// Load progress on startup
initDB().then(() => {
  loadProgress();
  progressData.sessions = (progressData.sessions || 0) + 1;
  saveProgress();
});


