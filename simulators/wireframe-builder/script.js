// Wireframe Builder - Drag and Drop Functionality

// IndexedDB setup
const DB_NAME = 'WireframeBuilderDB';
const DB_VERSION = 1;
const STORE_NAME = 'wireframes';
let db = null;

let components = [];
let componentElements = new Map(); // Cache component DOM elements
let selectedComponent = null;
let componentIdCounter = 0;
let gridEnabled = true;
let snapEnabled = true;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let canvasSpacer = null;
let canvasHeightUpdateTimeout = null;
let selectedElement = null; // Cache selected element
let propertiesListeners = []; // Track properties panel listeners for cleanup
let saveTimeout = null; // Debounce saves

// DOM Elements
const canvas = document.getElementById('wireframeCanvas');
const placeholder = canvas.querySelector('.canvas-placeholder');
const componentsList = document.querySelectorAll('.component-item');
const propertiesContent = document.getElementById('propertiesContent');
const clearBtn = document.getElementById('clearCanvas');
const resetBtn = document.getElementById('resetCanvas');
const gridToggle = document.getElementById('gridToggle');
const snapToggle = document.getElementById('snapToggle');
const exportImageBtn = document.getElementById('exportImageBtn');
const exportHTMLBtn = document.getElementById('exportHTMLBtn');
const wireframeTitle = document.getElementById('wireframeTitle');

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    switchTab(tabId);
    button.classList.add('tab-active');
    document.querySelectorAll('.tab-button').forEach(btn => {
      if (btn !== button) btn.classList.remove('tab-active');
    });
  });
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('tab-active');
  });
  document.getElementById(`${tabId}Tab`).classList.add('tab-active');
  
  if (tabId === 'guide') {
    loadGuide();
  }
}

// Component definitions
const componentDefinitions = {
  header: {
    label: 'Header',
    defaultContent: 'Navigation | Logo | Menu',
    defaultHeight: 80,
    defaultWidth: '100%'
  },
  hero: {
    label: 'Hero Section',
    defaultContent: 'Hero Title\nSubtitle\nCall-to-Action Button',
    defaultHeight: 300,
    defaultWidth: '100%'
  },
  section: {
    label: 'Content Section',
    defaultContent: 'Section Content\n\nAdd your content here...',
    defaultHeight: 200,
    defaultWidth: '100%'
  },
  image: {
    label: 'Image',
    defaultContent: '[Image Placeholder]',
    defaultHeight: 200,
    defaultWidth: '100%'
  },
  text: {
    label: 'Text Block',
    defaultContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    defaultHeight: 100,
    defaultWidth: '100%'
  },
  button: {
    label: 'Button',
    defaultContent: 'Click Me',
    defaultHeight: 50,
    defaultWidth: 150
  },
  form: {
    label: 'Form',
    defaultContent: 'Name: [______]\nEmail: [______]\nMessage: [______]\n[Submit Button]',
    defaultHeight: 250,
    defaultWidth: '100%'
  },
  card: {
    label: 'Card',
    defaultContent: 'Card Title\n\nCard content goes here...',
    defaultHeight: 200,
    defaultWidth: 300
  },
  footer: {
    label: 'Footer',
    defaultContent: 'Footer Links | Copyright | Social Media',
    defaultHeight: 100,
    defaultWidth: '100%'
  }
};

// Drag and Drop Setup
componentsList.forEach(item => {
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragend', handleDragEnd);
});

canvas.addEventListener('dragover', handleDragOver);
canvas.addEventListener('drop', handleDrop);

// Use event delegation for component interactions (reduces memory usage)
canvas.addEventListener('click', (e) => {
  // Handle canvas background click
  if (e.target === canvas) {
    selectedComponent = null;
    if (selectedElement) {
      selectedElement.classList.remove('selected');
      selectedElement = null;
    }
    propertiesContent.innerHTML = '<p class="empty-state">Select a component to edit its properties</p>';
    return;
  }
  
  const target = e.target;
  const componentId = target.closest('.wireframe-component')?.getAttribute('data-component-id');
  
  if (!componentId) return;
  
  const component = components.find(c => c.id === componentId);
  if (!component) return;
  
  // Handle delete button
  if (target.classList.contains('component-delete') || target.getAttribute('data-action') === 'delete') {
    e.stopPropagation();
    deleteComponent(componentId);
    return;
  }
  
  // Handle label click
  if (target.classList.contains('component-label')) {
    selectComponent(component);
    return;
  }
  
  // Handle component click (but not delete button)
  if (target.closest('.wireframe-component') && !target.classList.contains('component-delete')) {
    selectComponent(component);
  }
});

canvas.addEventListener('mousedown', (e) => {
  const target = e.target;
  const componentId = target.closest('.wireframe-component')?.getAttribute('data-component-id');
  
  if (!componentId) return;
  
  const component = components.find(c => c.id === componentId);
  if (!component) return;
  
  // Don't drag if clicking delete button or label
  if (target.classList.contains('component-delete') || 
      target.getAttribute('data-action') === 'delete' ||
      target.classList.contains('component-label')) {
    if (target.classList.contains('component-label')) {
      selectComponent(component);
    }
    return;
  }
  
  e.preventDefault();
  e.stopPropagation();
  selectComponent(component);
  startComponentDrag(e, component);
});

// Prevent text selection during drag (delegated)
canvas.addEventListener('selectstart', (e) => {
  if (e.target.closest('.wireframe-component')) {
    e.preventDefault();
  }
});

function handleDragStart(e) {
  isDragging = true;
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', e.target.getAttribute('data-component'));
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  isDragging = false;
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function handleDrop(e) {
  e.preventDefault();
  const componentType = e.dataTransfer.getData('text/plain');
  
  if (componentType) {
    const canvasRect = canvas.getBoundingClientRect();
    const canvasScrollLeft = canvas.scrollLeft;
    const canvasScrollTop = canvas.scrollTop;
    
    // Calculate position relative to canvas (including scroll)
    const x = e.clientX - canvasRect.left + canvasScrollLeft;
    const y = e.clientY - canvasRect.top + canvasScrollTop;
    
    const snappedX = snapEnabled ? Math.round(x / 20) * 20 : x;
    const snappedY = snapEnabled ? Math.round(y / 20) * 20 : y;
    
    createComponent(componentType, Math.max(0, snappedX), Math.max(0, snappedY));
  }
}

function createComponent(type, x, y) {
  const def = componentDefinitions[type];
  if (!def) return;
  
  const id = `component-${componentIdCounter++}`;
  // Store only essential data to minimize memory usage
  const component = {
    id,
    type,
    x,
    y,
    width: def.defaultWidth,
    height: def.defaultHeight,
    content: String(def.defaultContent).substring(0, 500), // Limit content length
    label: String(def.label).substring(0, 50) // Limit label length
  };
  
  components.push(component);
  renderComponent(component);
  updatePlaceholder();
  updateCanvasHeight();
  selectComponent(component);
  
  // Auto-save
  saveWireframe();
}

function renderComponent(component) {
  const element = document.createElement('div');
  element.className = 'wireframe-component';
  element.setAttribute('data-type', component.type);
  element.setAttribute('data-id', component.id);
  // Use transform for better performance
  element.style.transform = `translate(${component.x}px, ${component.y}px)`;
  element.style.left = '0';
  element.style.top = '0';
  element.style.width = typeof component.width === 'number' ? `${component.width}px` : component.width;
  element.style.height = `${component.height}px`;
  element.style.minHeight = `${component.height}px`;
  
  const label = document.createElement('div');
  label.className = 'component-label';
  label.textContent = component.label;
  
  const content = document.createElement('div');
  content.className = 'component-content';
  content.textContent = component.content;
  content.style.whiteSpace = 'pre-wrap';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'component-delete';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-component-id', component.id);
  
  element.appendChild(label);
  element.appendChild(content);
  element.appendChild(deleteBtn);
  
  // Store component reference on element for event delegation
  element.setAttribute('data-component-id', component.id);
  
  canvas.appendChild(element);
  
  // Cache the element
  componentElements.set(component.id, element);
}

function startComponentDrag(e, component) {
  e.preventDefault();
  e.stopPropagation();
  
  // Use cached element
  let element = componentElements.get(component.id);
  if (!element) {
    element = document.querySelector(`[data-id="${component.id}"]`);
    if (!element) return;
    componentElements.set(component.id, element);
  }
  
  // Disable transitions during drag for better performance
  element.style.transition = 'none';
  
  // Get canvas position and scroll
  const canvasRect = canvas.getBoundingClientRect();
  const canvasScrollLeft = canvas.scrollLeft;
  const canvasScrollTop = canvas.scrollTop;
  
  // Calculate mouse position relative to canvas (including scroll)
  const mouseX = e.clientX - canvasRect.left + canvasScrollLeft;
  const mouseY = e.clientY - canvasRect.top + canvasScrollTop;
  
  // Calculate offset from mouse to component's top-left corner
  dragOffset.x = mouseX - component.x;
  dragOffset.y = mouseY - component.y;
  
  element.classList.add('dragging');
  
  let rafId = null;
  const handleMouseMove = (e) => {
    // Use requestAnimationFrame for smooth updates
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      // Get current canvas position and scroll (may have changed)
      const currentCanvasRect = canvas.getBoundingClientRect();
      const currentScrollLeft = canvas.scrollLeft;
      const currentScrollTop = canvas.scrollTop;
      
      // Calculate new position relative to canvas (including scroll)
      const newMouseX = e.clientX - currentCanvasRect.left + currentScrollLeft;
      const newMouseY = e.clientY - currentCanvasRect.top + currentScrollTop;
      
      // Calculate component position (mouse position minus offset)
      let x = newMouseX - dragOffset.x;
      let y = newMouseY - dragOffset.y;
      
      // Apply snapping if enabled
      if (snapEnabled) {
        x = Math.round(x / 20) * 20;
        y = Math.round(y / 20) * 20;
      }
      
      // Ensure component stays within canvas bounds
      x = Math.max(0, x);
      y = Math.max(0, y);
      
      // Update component position
      component.x = x;
      component.y = y;
      
      // Update element position using transform for better performance
      element.style.transform = `translate(${component.x}px, ${component.y}px)`;
      element.style.left = '0';
      element.style.top = '0';
    });
  };
  
  const handleMouseUp = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    
    element.classList.remove('dragging');
    // Re-enable transitions
    element.style.transition = '';
    // Finalize position with transform
    element.style.transform = `translate(${component.x}px, ${component.y}px)`;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Update canvas height once after drag completes
    updateCanvasHeight();
    
    // Auto-save after drag
    saveWireframe();
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function selectComponent(component) {
  selectedComponent = component;
  
  // Update visual selection - use cached elements
  if (selectedElement) {
    selectedElement.classList.remove('selected');
  }
  
  const element = componentElements.get(component.id);
  if (element) {
    element.classList.add('selected');
    selectedElement = element;
  } else {
    // Fallback if not cached
    const fallbackElement = document.querySelector(`[data-id="${component.id}"]`);
    if (fallbackElement) {
      fallbackElement.classList.add('selected');
      selectedElement = fallbackElement;
      componentElements.set(component.id, fallbackElement);
    }
  }
  
  // Update properties panel
  updatePropertiesPanel(component);
}

function updatePropertiesPanel(component) {
  const def = componentDefinitions[component.type];
  
  // Clean up previous listeners to prevent memory leaks
  propertiesListeners.forEach(({ element, event, handler }) => {
    if (element && element.parentNode) {
      element.removeEventListener(event, handler);
    }
  });
  propertiesListeners = [];
  
  propertiesContent.innerHTML = `
    <div class="property-group">
      <label>Component Type</label>
      <input type="text" value="${def.label}" disabled style="opacity: 0.6;" />
    </div>
    <div class="property-group">
      <label>Label</label>
      <input type="text" id="prop-label" value="${component.label}" />
    </div>
    <div class="property-group">
      <label>Content</label>
      <textarea id="prop-content">${component.content}</textarea>
    </div>
    <div class="property-group">
      <label>Width</label>
      <input type="text" id="prop-width" value="${component.width}" placeholder="e.g., 100% or 300px" />
    </div>
    <div class="property-group">
      <label>Height (px)</label>
      <input type="number" id="prop-height" value="${component.height}" min="50" />
    </div>
    <div class="property-group">
      <label>Position X (px)</label>
      <input type="number" id="prop-x" value="${component.x}" min="0" />
    </div>
    <div class="property-group">
      <label>Position Y (px)</label>
      <input type="number" id="prop-y" value="${component.y}" min="0" />
    </div>
  `;
  
  // Add event listeners with cleanup tracking
  const addListener = (id, event, handler) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, handler);
      propertiesListeners.push({ element, event, handler });
    }
  };
  
  addListener('prop-label', 'input', (e) => {
    component.label = e.target.value;
    updateComponentDisplay(component);
  });
  
  addListener('prop-content', 'input', (e) => {
    component.content = e.target.value;
    updateComponentDisplay(component);
  });
  
  addListener('prop-width', 'input', (e) => {
    component.width = e.target.value;
    updateComponentDisplay(component);
  });
  
  addListener('prop-height', 'input', (e) => {
    component.height = parseInt(e.target.value) || 50;
    updateComponentDisplay(component);
  });
  
  addListener('prop-x', 'input', (e) => {
    component.x = parseInt(e.target.value) || 0;
    updateComponentDisplay(component);
  });
  
  addListener('prop-y', 'input', (e) => {
    component.y = parseInt(e.target.value) || 0;
    updateComponentDisplay(component);
  });
}

function updateComponentDisplay(component) {
  // Use cached element
  let element = componentElements.get(component.id);
  if (!element) {
    element = document.querySelector(`[data-id="${component.id}"]`);
    if (!element) return;
    componentElements.set(component.id, element);
  }
  
  // Use transform for positioning (better performance)
  element.style.transform = `translate(${component.x}px, ${component.y}px)`;
  element.style.left = '0';
  element.style.top = '0';
  element.style.width = typeof component.width === 'number' ? `${component.width}px` : component.width;
  element.style.height = `${component.height}px`;
  element.style.minHeight = `${component.height}px`;
  
  const labelEl = element.querySelector('.component-label');
  if (labelEl) labelEl.textContent = component.label;
  
  const contentEl = element.querySelector('.component-content');
  if (contentEl) {
    contentEl.textContent = component.content;
    contentEl.style.whiteSpace = 'pre-wrap';
  }
  
  // Debounced update - only if position or height changed significantly
  updateCanvasHeight();
  
  // Auto-save
  saveWireframe();
}

function deleteComponent(id) {
  components = components.filter(c => c.id !== id);
  
  // Use cached element
  const element = componentElements.get(id);
  if (element) {
    element.remove();
    componentElements.delete(id);
  }
  
  if (selectedComponent && selectedComponent.id === id) {
    selectedComponent = null;
    selectedElement = null;
    propertiesContent.innerHTML = '<p class="empty-state">Select a component to edit its properties</p>';
  }
  
  updatePlaceholder();
  // Debounced update
  updateCanvasHeight();
  
  // Auto-save
  saveWireframe();
}

// handleCanvasClick removed - now using event delegation above

function updatePlaceholder() {
  if (components.length === 0) {
    placeholder.classList.remove('hidden');
  } else {
    placeholder.classList.add('hidden');
  }
  // Debounced update
  updateCanvasHeight();
}

function updateCanvasHeight() {
  // Clear any pending updates
  if (canvasHeightUpdateTimeout) {
    clearTimeout(canvasHeightUpdateTimeout);
  }
  
  // Debounce the update to avoid excessive calls
  canvasHeightUpdateTimeout = setTimeout(() => {
    // Find the lowest component position
    let maxY = 0;
    const componentsLength = components.length;
    
    for (let i = 0; i < componentsLength; i++) {
      const comp = components[i];
      const compBottom = comp.y + comp.height;
      if (compBottom > maxY) {
        maxY = compBottom;
      }
    }
    
    // Get canvas viewport height (visible area) - cache it
    const canvasViewportHeight = canvas.clientHeight || 600;
    
    // Always ensure scrollable space (reduced for memory efficiency):
    // - At least 1.2x the viewport height for empty canvas
    // - Or component position + 300px buffer if components exist (reduced from 500px)
    const minHeight = componentsLength === 0 
      ? Math.max(canvasViewportHeight * 1.2, 800)
      : Math.max(canvasViewportHeight * 1.1, maxY + 300, 800);
    
    // Get or create spacer (cache it)
    if (!canvasSpacer) {
      canvasSpacer = canvas.querySelector('.canvas-spacer');
      if (!canvasSpacer) {
        canvasSpacer = document.createElement('div');
        canvasSpacer.className = 'canvas-spacer';
        canvas.appendChild(canvasSpacer);
      }
    }
    
    // Only update if height changed significantly (avoid unnecessary DOM updates)
    const currentHeight = parseInt(canvasSpacer.style.height) || 0;
    
    if (Math.abs(currentHeight - minHeight) > 50) {
      canvasSpacer.style.height = `${minHeight}px`;
      canvasSpacer.style.width = '100%';
    }
    
    canvasHeightUpdateTimeout = null;
  }, 100); // Debounce by 100ms
}

// Clear and Reset
clearBtn.addEventListener('click', () => {
  if (confirm('Clear all components from the canvas?')) {
    components = [];
    // Clear cached elements
    componentElements.forEach(el => el.remove());
    componentElements.clear();
    selectedComponent = null;
    selectedElement = null;
    propertiesContent.innerHTML = '<p class="empty-state">Select a component to edit its properties</p>';
    canvasSpacer = null; // Reset spacer cache
    updatePlaceholder();
    updateCanvasHeight();
    
    // Auto-save
    saveWireframe();
  }
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reset everything? This will clear the canvas and reset all settings.')) {
    components = [];
    componentIdCounter = 0;
    // Clear cached elements
    componentElements.forEach(el => el.remove());
    componentElements.clear();
    selectedComponent = null;
    selectedElement = null;
    propertiesContent.innerHTML = '<p class="empty-state">Select a component to edit its properties</p>';
    gridEnabled = true;
    snapEnabled = true;
    gridToggle.textContent = 'Grid: ON';
    snapToggle.textContent = 'Snap: ON';
    canvas.classList.add('grid-on');
    canvasSpacer = null; // Reset spacer cache
    updatePlaceholder();
    updateCanvasHeight();
    
    // Clear saved wireframe and save new state
    clearSavedWireframe();
    saveWireframe();
  }
});

// Grid and Snap Toggles
gridToggle.addEventListener('click', () => {
  gridEnabled = !gridEnabled;
  gridToggle.textContent = `Grid: ${gridEnabled ? 'ON' : 'OFF'}`;
  if (gridEnabled) {
    canvas.classList.add('grid-on');
  } else {
    canvas.classList.remove('grid-on');
  }
  
  // Auto-save
  saveWireframe();
});

snapToggle.addEventListener('click', () => {
  snapEnabled = !snapEnabled;
  snapToggle.textContent = `Snap: ${snapEnabled ? 'ON' : 'OFF'}`;
  
  // Auto-save
  saveWireframe();
});

// Export Functions
exportImageBtn.addEventListener('click', async () => {
  if (components.length === 0) {
    alert('Add some components to the canvas before exporting!');
    return;
  }
  
  try {
    exportImageBtn.disabled = true;
    exportImageBtn.textContent = 'Exporting...';
    
    // Find the bounds of all components
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    components.forEach(comp => {
      const x = comp.x;
      const y = comp.y;
      const width = typeof comp.width === 'number' ? comp.width : 800; // Default width for percentage
      const height = comp.height;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // Add padding around the content
    const padding = 40;
    const contentWidth = maxX - minX + (padding * 2);
    const contentHeight = maxY - minY + (padding * 2);
    
    // Create a temporary container matching the canvas styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${contentWidth}px`;
    tempContainer.style.height = `${contentHeight}px`;
    tempContainer.style.background = 'white';
    tempContainer.style.padding = `${padding}px`;
    tempContainer.style.boxSizing = 'border-box';
    document.body.appendChild(tempContainer);
    
    // Clone and render components with exact styling
    components.forEach(comp => {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.border = '2px dashed #94a3b8';
      element.style.borderRadius = '4px';
      element.style.background = '#f8fafc';
      element.style.height = `${comp.height}px`;
      element.style.minHeight = `${comp.height}px`;
      element.style.width = typeof comp.width === 'number' ? `${comp.width}px` : '100%';
      element.style.left = `${comp.x - minX + padding}px`;
      element.style.top = `${comp.y - minY + padding}px`;
      element.style.boxSizing = 'border-box';
      
      // Apply component-specific styles
      if (comp.type === 'header') {
        element.style.background = '#e2e8f0';
      } else if (comp.type === 'hero') {
        element.style.background = 'linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 100%)';
      } else if (comp.type === 'section') {
        element.style.background = '#f1f5f9';
      } else if (comp.type === 'image') {
        element.style.background = '#e2e8f0';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
      } else if (comp.type === 'text') {
        element.style.background = '#ffffff';
      } else if (comp.type === 'button') {
        element.style.background = '#3b82f6';
        element.style.color = 'white';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.border = 'none';
      } else if (comp.type === 'form') {
        element.style.background = '#f8fafc';
      } else if (comp.type === 'card') {
        element.style.background = '#ffffff';
        element.style.border = '1px solid #e2e8f0';
      } else if (comp.type === 'footer') {
        element.style.background = '#1e293b';
        element.style.color = 'white';
      }
      
      const label = document.createElement('div');
      label.style.position = 'absolute';
      label.style.top = '-24px';
      label.style.left = '0';
      label.style.fontSize = '0.75rem';
      label.style.color = '#64748b';
      label.style.background = '#0f172a';
      label.style.padding = '2px 8px';
      label.style.borderRadius = '4px';
      label.style.fontWeight = '500';
      label.textContent = comp.label;
      
      const content = document.createElement('div');
      content.className = 'component-content';
      content.style.padding = '16px';
      content.style.color = comp.type === 'button' || comp.type === 'footer' ? 'white' : '#64748b';
      content.style.fontSize = '0.9rem';
      content.style.whiteSpace = 'pre-wrap';
      content.style.lineHeight = '1.5';
      if (comp.type === 'button') {
        content.style.fontWeight = '500';
      }
      content.textContent = comp.content;
      
      element.appendChild(label);
      element.appendChild(content);
      tempContainer.appendChild(element);
    });
    
    // Wait a moment for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capture with html2canvas at high quality
    const canvasEl = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      width: contentWidth,
      height: contentHeight
    });
    
    // Download
    const link = document.createElement('a');
    link.download = `${wireframeTitle.value || 'wireframe'}.png`;
    link.href = canvasEl.toDataURL('image/png');
    link.click();
    
    document.body.removeChild(tempContainer);
    
    exportImageBtn.disabled = false;
    exportImageBtn.textContent = '📸 Export as Image';
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export image. Please try again.');
    exportImageBtn.disabled = false;
    exportImageBtn.textContent = '📸 Export as Image';
  }
});

exportHTMLBtn.addEventListener('click', () => {
  if (components.length === 0) {
    alert('Add some components to the canvas before exporting!');
    return;
  }
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${wireframeTitle.value || 'Wireframe'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 40px; background: #f8fafc; }
    .wireframe-container { max-width: 1200px; margin: 0 auto; }
    .wireframe-component { margin-bottom: 16px; border: 2px dashed #94a3b8; border-radius: 4px; background: #f8fafc; padding: 16px; }
    .component-label { font-size: 0.75rem; color: #64748b; margin-bottom: 8px; font-weight: 600; }
    .component-content { color: #64748b; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="wireframe-container">
`;

  // Sort components by Y position
  const sortedComponents = [...components].sort((a, b) => a.y - b.y);
  
  sortedComponents.forEach(comp => {
    html += `    <div class="wireframe-component" style="min-height: ${comp.height}px; width: ${typeof comp.width === 'number' ? comp.width + 'px' : comp.width};">
      <div class="component-label">${comp.label}</div>
      <div class="component-content">${comp.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
`;
  });
  
  html += `  </div>
</body>
</html>`;
  
  // Download
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = `${wireframeTitle.value || 'wireframe'}.html`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
});

// Guide Content
function loadGuide() {
  const guideContent = document.getElementById('guideContent');
  guideContent.innerHTML = `
    <h2>Wireframe Builder Guide</h2>
    
    <h3>Getting Started</h3>
    <p>Wireframes are simple, low-fidelity sketches of your website layout. They help you plan the structure and placement of elements before you start coding or designing.</p>
    
    <h3>How to Use This Tool</h3>
    <ul>
      <li><strong>Drag Components:</strong> Click and drag components from the left panel onto the canvas</li>
      <li><strong>Move Components:</strong> Click and drag components on the canvas to reposition them</li>
      <li><strong>Edit Properties:</strong> Click a component to select it, then edit its properties in the right panel</li>
      <li><strong>Delete Components:</strong> Select a component and click the × button that appears</li>
      <li><strong>Grid & Snap:</strong> Toggle the grid overlay and snap-to-grid for precise alignment</li>
    </ul>
    
    <h3>Component Types</h3>
    <ul>
      <li><strong>Header:</strong> Navigation bar, logo, and main menu</li>
      <li><strong>Hero Section:</strong> Large introductory section at the top of the page</li>
      <li><strong>Content Section:</strong> General content area for text, images, and other elements</li>
      <li><strong>Image:</strong> Image placeholder</li>
      <li><strong>Text Block:</strong> Paragraph or text content</li>
      <li><strong>Button:</strong> Call-to-action or interactive button</li>
      <li><strong>Form:</strong> Contact form, signup form, or other input fields</li>
      <li><strong>Card:</strong> Card component for displaying grouped content</li>
      <li><strong>Footer:</strong> Footer section with links and copyright</li>
    </ul>
    
    <h3>Best Practices</h3>
    <ul>
      <li><strong>Start Simple:</strong> Begin with the main structure (header, hero, sections, footer)</li>
      <li><strong>Think Mobile-First:</strong> Consider how components stack on smaller screens</li>
      <li><strong>Use Consistent Spacing:</strong> Maintain consistent gaps between elements</li>
      <li><strong>Plan Content Flow:</strong> Arrange components in a logical reading order</li>
      <li><strong>Keep It Simple:</strong> Wireframes should focus on layout, not detailed design</li>
    </ul>
    
    <h3>Export Options</h3>
    <ul>
      <li><strong>Export as Image:</strong> Download your wireframe as a PNG image to share with others</li>
      <li><strong>Export as HTML:</strong> Generate a basic HTML structure based on your wireframe</li>
    </ul>
    
    <h3>Tips</h3>
    <ul>
      <li>Use the grid and snap features for clean alignment</li>
      <li>Label your components clearly to remember their purpose</li>
      <li>Export your wireframe regularly to save your progress</li>
      <li>Start with a mobile layout, then expand to desktop</li>
      <li>Don't worry about colors or fonts - focus on structure</li>
    </ul>
  `;
}

// IndexedDB Functions
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

function saveWireframe() {
  if (!db) return;
  
  // Clear any pending saves
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Debounce saves
  saveTimeout = setTimeout(() => {
    const wireframeData = {
      id: 1, // Single wireframe per user
      components: components,
      componentIdCounter: componentIdCounter,
      gridEnabled: gridEnabled,
      snapEnabled: snapEnabled,
      timestamp: Date.now()
    };
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.put(wireframeData);
    
    request.onsuccess = () => {
      showSaveNotification('Saved');
    };
    
    request.onerror = () => {
      console.error('Save error:', request.error);
    };
  }, 500); // Debounce by 500ms
}

function loadWireframe() {
  if (!db) return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const request = objectStore.get(1);
    
    request.onsuccess = () => {
      const data = request.result;
      if (data) {
        components = data.components || [];
        componentIdCounter = data.componentIdCounter || 0;
        gridEnabled = data.gridEnabled !== undefined ? data.gridEnabled : true;
        snapEnabled = data.snapEnabled !== undefined ? data.snapEnabled : true;
        
        // Restore grid and snap UI
        gridToggle.textContent = `Grid: ${gridEnabled ? 'ON' : 'OFF'}`;
        snapToggle.textContent = `Snap: ${snapEnabled ? 'ON' : 'OFF'}`;
        if (gridEnabled) {
          canvas.classList.add('grid-on');
        } else {
          canvas.classList.remove('grid-on');
        }
        
        // Re-render all components
        components.forEach(comp => {
          renderComponent(comp);
        });
        
        updatePlaceholder();
        updateCanvasHeight();
        showSaveNotification('Loaded');
        resolve(data);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      console.error('Load error:', request.error);
      reject(request.error);
    };
  });
}

function clearSavedWireframe() {
  if (!db) return;
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const objectStore = transaction.objectStore(STORE_NAME);
  const request = objectStore.delete(1);
  
  request.onsuccess = () => {
    showSaveNotification('Cleared');
  };
}

function showSaveNotification(message) {
  // Create or update notification
  let notification = document.getElementById('saveNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'saveNotification';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--accent);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = `💾 ${message}`;
  notification.style.opacity = '1';
  
  setTimeout(() => {
    notification.style.opacity = '0';
  }, 2000);
}

// Initialize IndexedDB and load saved wireframe
initDB().then(() => {
  loadWireframe().then(() => {
    // Initialize UI after loading
    updatePlaceholder();
    setTimeout(() => {
      updateCanvasHeight();
    }, 100);
    if (gridEnabled) {
      canvas.classList.add('grid-on');
    }
  });
}).catch(err => {
  console.error('Failed to initialize IndexedDB:', err);
  // Continue without IndexedDB
  updatePlaceholder();
  setTimeout(() => {
    updateCanvasHeight();
  }, 100);
  if (gridEnabled) {
    canvas.classList.add('grid-on');
  }
});

// Update canvas height on window resize (debounced)
let resizeTimeout = null;
window.addEventListener('resize', () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    canvasSpacer = null; // Reset cache on resize
    updateCanvasHeight();
  }, 250);
});

