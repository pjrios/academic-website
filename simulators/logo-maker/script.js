// Canvas setup
const canvas = document.getElementById('logoCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('canvasOverlay');

// State
let currentTool = 'select';
let currentColor = '#3b82f6';
let isDrawing = false;
let startX, startY;
let shapes = [];
let history = [];
let historyIndex = -1;
let selectedShape = null;
let dragOffset = { x: 0, y: 0 };
let canvasBgColor = '#ffffff';

// Tool buttons
const toolButtons = document.querySelectorAll('.tool-btn');
toolButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    toolButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
    canvas.style.cursor = currentTool === 'select' ? 'default' : 'crosshair';
    
    // Show/hide controls
    document.getElementById('textControls').style.display = 
      currentTool === 'text' ? 'flex' : 'none';
    document.getElementById('textInput').style.display = 
      currentTool === 'text' ? 'block' : 'none';
    document.getElementById('shapeControls').style.display = 
      ['rectangle', 'circle', 'triangle', 'line', 'star'].includes(currentTool) ? 'flex' : 'none';
  });
});

// Color picker
const colorPicker = document.getElementById('colorPicker');
const colorHex = document.getElementById('colorHex');

colorPicker.addEventListener('input', (e) => {
  currentColor = e.target.value;
  colorHex.value = currentColor;
});

colorHex.addEventListener('input', (e) => {
  const hex = e.target.value;
  if (/^#[0-9A-F]{6}$/i.test(hex)) {
    currentColor = hex;
    colorPicker.value = hex;
  }
});

// Palette colors
const paletteColors = document.querySelectorAll('.palette-color');
paletteColors.forEach(color => {
  color.addEventListener('click', () => {
    paletteColors.forEach(c => c.classList.remove('active'));
    color.classList.add('active');
    currentColor = color.dataset.color;
    colorPicker.value = currentColor;
    colorHex.value = currentColor;
  });
});

// Text controls
const textInput = document.getElementById('textInput');
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontFamily = document.getElementById('fontFamily');
const fontWeight = document.getElementById('fontWeight');
const fontStyle = document.getElementById('fontStyle');
const textAlign = document.getElementById('textAlign');

fontSize.addEventListener('input', (e) => {
  fontSizeValue.textContent = e.target.value;
});

// Shape controls
const shapeFill = document.getElementById('shapeFill');
const strokeWidth = document.getElementById('strokeWidth');
const strokeWidthValue = document.getElementById('strokeWidthValue');
const shapeOpacity = document.getElementById('shapeOpacity');
const opacityValue = document.getElementById('opacityValue');
const borderRadius = document.getElementById('borderRadius');
const borderRadiusValue = document.getElementById('borderRadiusValue');
const shapeRotation = document.getElementById('shapeRotation');
const rotationValue = document.getElementById('rotationValue');

strokeWidth.addEventListener('input', (e) => {
  strokeWidthValue.textContent = e.target.value;
});

shapeOpacity.addEventListener('input', (e) => {
  opacityValue.textContent = e.target.value + '%';
});

borderRadius.addEventListener('input', (e) => {
  borderRadiusValue.textContent = e.target.value;
});

shapeRotation.addEventListener('input', (e) => {
  rotationValue.textContent = e.target.value + '°';
});

// Canvas controls
const canvasSize = document.getElementById('canvasSize');
const canvasBgColorInput = document.getElementById('canvasBgColor');

canvasSize.addEventListener('change', (e) => {
  const [width, height] = e.target.value.split('x').map(Number);
  canvas.width = width;
  canvas.height = height;
  redraw();
});

canvasBgColorInput.addEventListener('input', (e) => {
  canvasBgColor = e.target.value;
  redraw();
});

// Selected shape controls
const duplicateBtn = document.getElementById('duplicateBtn');
const deleteBtn = document.getElementById('deleteBtn');
const bringToFrontBtn = document.getElementById('bringToFrontBtn');
const sendToBackBtn = document.getElementById('sendToBackBtn');
const selectedShapeControls = document.getElementById('selectedShapeControls');

// Canvas events
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('mouseleave', handleMouseLeave);

function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentTool === 'select') {
    // Check if clicking on a shape
    selectedShape = getShapeAt(x, y);
    if (selectedShape) {
      const centerX = selectedShape.x + (selectedShape.width || 0) / 2;
      const centerY = selectedShape.y + (selectedShape.height || 0) / 2;
      dragOffset.x = x - centerX;
      dragOffset.y = y - centerY;
      isDrawing = true;
      updateSelectedShapeControls();
    } else {
      selectedShape = null;
      updateSelectedShapeControls();
    }
  } else if (currentTool === 'text') {
    // Add text at click position
    const text = textInput.value.trim() || 'Text';
    addShape({
      type: 'text',
      x: x,
      y: y,
      text: text,
      color: currentColor,
      fontSize: parseInt(fontSize.value),
      fontFamily: fontFamily.value,
      fontWeight: fontWeight.value,
      fontStyle: fontStyle.value,
      textAlign: textAlign.value,
      opacity: parseInt(shapeOpacity.value) / 100
    });
    textInput.value = '';
  } else {
    // Start drawing shape
    isDrawing = true;
    startX = x;
    startY = y;
  }
}

function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isDrawing && currentTool === 'select' && selectedShape) {
    // Move selected shape
    const newCenterX = x - dragOffset.x;
    const newCenterY = y - dragOffset.y;
    
    if (selectedShape.type === 'circle') {
      selectedShape.x = newCenterX;
      selectedShape.y = newCenterY;
    } else if (selectedShape.type === 'line') {
      const oldCenterX = (selectedShape.x1 + selectedShape.x2) / 2;
      const oldCenterY = (selectedShape.y1 + selectedShape.y2) / 2;
      const dx = newCenterX - oldCenterX;
      const dy = newCenterY - oldCenterY;
      selectedShape.x1 += dx;
      selectedShape.y1 += dy;
      selectedShape.x2 += dx;
      selectedShape.y2 += dy;
    } else if (selectedShape.type === 'triangle' || selectedShape.type === 'star') {
      const oldCenterX = selectedShape.type === 'star' ? selectedShape.x : 
        (selectedShape.points[0].x + selectedShape.points[1].x + selectedShape.points[2].x) / 3;
      const oldCenterY = selectedShape.type === 'star' ? selectedShape.y :
        (selectedShape.points[0].y + selectedShape.points[1].y + selectedShape.points[2].y) / 3;
      const dx = newCenterX - oldCenterX;
      const dy = newCenterY - oldCenterY;
      selectedShape.points.forEach(point => {
        point.x += dx;
        point.y += dy;
      });
      if (selectedShape.type === 'star') {
        selectedShape.x += dx;
        selectedShape.y += dy;
      }
    } else {
      const oldCenterX = selectedShape.x + (selectedShape.width || 0) / 2;
      const oldCenterY = selectedShape.y + (selectedShape.height || 0) / 2;
      const dx = newCenterX - oldCenterX;
      const dy = newCenterY - oldCenterY;
      selectedShape.x += dx;
      selectedShape.y += dy;
    }
    
    redraw();
  } else if (isDrawing && currentTool !== 'select' && currentTool !== 'text') {
    // Preview shape while drawing
    redraw();
    drawPreview(x, y);
  }
}

function handleMouseUp(e) {
  if (isDrawing && currentTool !== 'select' && currentTool !== 'text') {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const shape = createShape(startX, startY, x, y);
    if (shape) {
      addShape(shape);
    }
  }
  isDrawing = false;
  if (currentTool !== 'select') {
    selectedShape = null;
    updateSelectedShapeControls();
  }
}

function updateSelectedShapeControls() {
  if (selectedShape) {
    selectedShapeControls.style.display = 'block';
  } else {
    selectedShapeControls.style.display = 'none';
  }
}

function handleMouseLeave() {
  isDrawing = false;
  redraw();
}

function createShape(x1, y1, x2, y2) {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const opacity = parseInt(shapeOpacity.value) / 100;
  const rotation = parseInt(shapeRotation.value);

  const baseShape = {
    x: x,
    y: y,
    width: width,
    height: height,
    color: currentColor,
    strokeWidth: parseInt(strokeWidth.value),
    fill: shapeFill.checked,
    opacity: opacity,
    rotation: rotation
  };

  switch (currentTool) {
    case 'rectangle':
      return { 
        ...baseShape, 
        type: 'rectangle',
        borderRadius: parseInt(borderRadius.value)
      };
    case 'circle':
      const radius = Math.max(width, height) / 2;
      return {
        type: 'circle',
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        radius: radius,
        color: currentColor,
        strokeWidth: parseInt(strokeWidth.value),
        fill: shapeFill.checked,
        opacity: opacity,
        rotation: rotation
      };
    case 'triangle':
      return {
        ...baseShape,
        type: 'triangle',
        points: [
          { x: x1, y: y2 },
          { x: (x1 + x2) / 2, y: y1 },
          { x: x2, y: y2 }
        ]
      };
    case 'line':
      return {
        type: 'line',
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        color: currentColor,
        strokeWidth: parseInt(strokeWidth.value),
        opacity: opacity
      };
    case 'star':
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const outerRadius = Math.max(width, height) / 2;
      const innerRadius = outerRadius * 0.5;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        });
      }
      return {
        type: 'star',
        x: centerX,
        y: centerY,
        points: points,
        color: currentColor,
        strokeWidth: parseInt(strokeWidth.value),
        fill: shapeFill.checked,
        opacity: opacity,
        rotation: rotation
      };
    default:
      return null;
  }
}

function addShape(shape) {
  shapes.push(shape);
  saveHistory();
  redraw();
}

function drawShape(shape) {
  ctx.save();

  // Apply opacity
  const opacity = shape.opacity !== undefined ? shape.opacity : 1;
  ctx.globalAlpha = opacity;

  // Apply rotation if needed
  if (shape.rotation && shape.rotation !== 0) {
    let centerX, centerY;
    if (shape.type === 'circle' || shape.type === 'star') {
      centerX = shape.x;
      centerY = shape.y;
    } else if (shape.type === 'line') {
      centerX = (shape.x1 + shape.x2) / 2;
      centerY = (shape.y1 + shape.y2) / 2;
    } else {
      centerX = shape.x + (shape.width || 0) / 2;
      centerY = shape.y + (shape.height || 0) / 2;
    }
    ctx.translate(centerX, centerY);
    ctx.rotate((shape.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  if (shape.type === 'rectangle') {
    const x = shape.x;
    const y = shape.y;
    const w = shape.width;
    const h = shape.height;
    const radius = shape.borderRadius || 0;

    if (radius > 0) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();

      if (shape.fill) {
        ctx.fillStyle = shape.color;
        ctx.fill();
      } else {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();
      }
    } else {
      if (shape.fill) {
        ctx.fillStyle = shape.color;
        ctx.fillRect(x, y, w, h);
      } else {
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;
        ctx.strokeRect(x, y, w, h);
      }
    }
  } else if (shape.type === 'circle') {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    if (shape.fill) {
      ctx.fillStyle = shape.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  } else if (shape.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    ctx.lineTo(shape.points[1].x, shape.points[1].y);
    ctx.lineTo(shape.points[2].x, shape.points[2].y);
    ctx.closePath();
    if (shape.fill) {
      ctx.fillStyle = shape.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  } else if (shape.type === 'star') {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    for (let i = 1; i < shape.points.length; i++) {
      ctx.lineTo(shape.points[i].x, shape.points[i].y);
    }
    ctx.closePath();
    if (shape.fill) {
      ctx.fillStyle = shape.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.stroke();
    }
  } else if (shape.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.strokeWidth;
    ctx.stroke();
  } else if (shape.type === 'text') {
    ctx.fillStyle = shape.color;
    ctx.font = `${shape.fontStyle || 'normal'} ${shape.fontWeight} ${shape.fontSize}px ${shape.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = shape.textAlign || 'left';
    
    // Calculate text position based on alignment
    let textX = shape.x;
    if (shape.textAlign === 'center') {
      const metrics = ctx.measureText(shape.text);
      textX = shape.x - metrics.width / 2;
    } else if (shape.textAlign === 'right') {
      const metrics = ctx.measureText(shape.text);
      textX = shape.x - metrics.width;
    }
    
    ctx.fillText(shape.text, textX, shape.y);
  }

  ctx.restore();
}

function drawPreview(x, y) {
  const shape = createShape(startX, startY, x, y);
  if (shape) {
    drawShape(shape);
  }
}

function redraw() {
  // Fill canvas with background color
  ctx.fillStyle = canvasBgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw all shapes
  shapes.forEach(shape => drawShape(shape));
  
  // Highlight selected shape
  if (selectedShape && currentTool === 'select') {
    highlightShape(selectedShape);
  }
}

function highlightShape(shape) {
  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  if (shape.type === 'rectangle') {
    ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
  } else if (shape.type === 'circle') {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, shape.radius + 2, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape.type === 'triangle' || shape.type === 'star') {
    const minX = Math.min(...shape.points.map(p => p.x));
    const maxX = Math.max(...shape.points.map(p => p.x));
    const minY = Math.min(...shape.points.map(p => p.y));
    const maxY = Math.max(...shape.points.map(p => p.y));
    ctx.strokeRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);
  } else if (shape.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
  } else if (shape.type === 'text') {
    ctx.font = `${shape.fontStyle || 'normal'} ${shape.fontWeight} ${shape.fontSize}px ${shape.fontFamily}`;
    const metrics = ctx.measureText(shape.text);
    let textX = shape.x;
    if (shape.textAlign === 'center') {
      textX = shape.x - metrics.width / 2;
    } else if (shape.textAlign === 'right') {
      textX = shape.x - metrics.width;
    }
    ctx.strokeRect(textX - 2, shape.y - 2, metrics.width + 4, shape.fontSize + 4);
  }
  
  ctx.restore();
}

function getShapeAt(x, y) {
  // Check shapes in reverse order (top to bottom)
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isPointInShape(x, y, shape)) {
      return shape;
    }
  }
  return null;
}

function isPointInShape(x, y, shape) {
  if (shape.type === 'rectangle') {
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  } else if (shape.type === 'circle') {
    const dx = x - shape.x;
    const dy = y - shape.y;
    return dx * dx + dy * dy <= shape.radius * shape.radius;
  } else if (shape.type === 'triangle' || shape.type === 'star') {
    // Simple bounding box check
    const minX = Math.min(...shape.points.map(p => p.x));
    const maxX = Math.max(...shape.points.map(p => p.x));
    const minY = Math.min(...shape.points.map(p => p.y));
    const maxY = Math.max(...shape.points.map(p => p.y));
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else if (shape.type === 'line') {
    // Check if point is near the line
    const dist = distanceToLine(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
    return dist < 10;
  } else if (shape.type === 'text') {
    ctx.save();
    ctx.font = `${shape.fontStyle || 'normal'} ${shape.fontWeight} ${shape.fontSize}px ${shape.fontFamily}`;
    const metrics = ctx.measureText(shape.text);
    ctx.restore();
    let textX = shape.x;
    if (shape.textAlign === 'center') {
      textX = shape.x - metrics.width / 2;
    } else if (shape.textAlign === 'right') {
      textX = shape.x - metrics.width;
    }
    return x >= textX && x <= textX + metrics.width &&
           y >= shape.y && y <= shape.y + shape.fontSize;
  }
  return false;
}

function distanceToLine(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// History management
function saveHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.parse(JSON.stringify(shapes)));
  historyIndex = history.length - 1;
  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    shapes = JSON.parse(JSON.stringify(history[historyIndex]));
    redraw();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    shapes = JSON.parse(JSON.stringify(history[historyIndex]));
    redraw();
  }
}

// Buttons
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear the entire canvas?')) {
    shapes = [];
    selectedShape = null;
    updateSelectedShapeControls();
    saveHistory();
    redraw();
  }
});

document.getElementById('undoBtn').addEventListener('click', () => {
  undo();
  selectedShape = null;
  updateSelectedShapeControls();
});

document.getElementById('redoBtn').addEventListener('click', () => {
  redo();
  selectedShape = null;
  updateSelectedShapeControls();
});

// Selected shape actions
duplicateBtn.addEventListener('click', () => {
  if (selectedShape) {
    const index = shapes.indexOf(selectedShape);
    const duplicated = JSON.parse(JSON.stringify(selectedShape));
    duplicated.x += 20;
    duplicated.y += 20;
    if (duplicated.type === 'line') {
      duplicated.x1 += 20;
      duplicated.y1 += 20;
      duplicated.x2 += 20;
      duplicated.y2 += 20;
    } else if (duplicated.type === 'triangle' || duplicated.type === 'star') {
      duplicated.points.forEach(point => {
        point.x += 20;
        point.y += 20;
      });
      if (duplicated.type === 'star') {
        duplicated.x += 20;
        duplicated.y += 20;
      }
    }
    shapes.splice(index + 1, 0, duplicated);
    selectedShape = duplicated;
    saveHistory();
    redraw();
  }
});

deleteBtn.addEventListener('click', () => {
  if (selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    selectedShape = null;
    updateSelectedShapeControls();
    saveHistory();
    redraw();
  }
});

bringToFrontBtn.addEventListener('click', () => {
  if (selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    shapes.push(selectedShape);
    saveHistory();
    redraw();
  }
});

sendToBackBtn.addEventListener('click', () => {
  if (selectedShape) {
    const index = shapes.indexOf(selectedShape);
    shapes.splice(index, 1);
    shapes.unshift(selectedShape);
    saveHistory();
    redraw();
  }
});

// Export functions
document.getElementById('exportPngBtn').addEventListener('click', () => {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
});

document.getElementById('exportSvgBtn').addEventListener('click', () => {
  const svg = generateSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `logo-${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

function generateSVG() {
  let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `  <rect width="${canvas.width}" height="${canvas.height}" fill="${canvasBgColor}"/>\n`;
  
  shapes.forEach(shape => {
    const opacity = shape.opacity !== undefined ? shape.opacity : 1;
    const transform = shape.rotation && shape.rotation !== 0 
      ? ` transform="rotate(${shape.rotation} ${shape.x + (shape.width || 0) / 2} ${shape.y + (shape.height || 0) / 2})"` 
      : '';
    
    if (shape.type === 'rectangle') {
      const fillAttr = shape.fill ? `fill="${shape.color}"` : `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"`;
      const rx = shape.borderRadius || 0;
      svg += `  <rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${rx}" ${fillAttr} opacity="${opacity}"${transform}/>\n`;
    } else if (shape.type === 'circle') {
      const fillAttr = shape.fill ? `fill="${shape.color}"` : `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"`;
      svg += `  <circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" ${fillAttr} opacity="${opacity}"${transform}/>\n`;
    } else if (shape.type === 'triangle') {
      const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
      const fillAttr = shape.fill ? `fill="${shape.color}"` : `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"`;
      svg += `  <polygon points="${points}" ${fillAttr} opacity="${opacity}"${transform}/>\n`;
    } else if (shape.type === 'star') {
      const points = shape.points.map(p => `${p.x},${p.y}`).join(' ');
      const fillAttr = shape.fill ? `fill="${shape.color}"` : `fill="none" stroke="${shape.color}" stroke-width="${shape.strokeWidth}"`;
      svg += `  <polygon points="${points}" ${fillAttr} opacity="${opacity}"${transform}/>\n`;
    } else if (shape.type === 'line') {
      svg += `  <line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" stroke="${shape.color}" stroke-width="${shape.strokeWidth}" opacity="${opacity}"/>\n`;
    } else if (shape.type === 'text') {
      let textX = shape.x;
      if (shape.textAlign === 'center') {
        // Approximate center alignment
        textX = shape.x;
      } else if (shape.textAlign === 'right') {
        textX = shape.x;
      }
      svg += `  <text x="${textX}" y="${shape.y + parseInt(shape.fontSize)}" font-family="${shape.fontFamily}" font-size="${shape.fontSize}" font-weight="${shape.fontWeight}" font-style="${shape.fontStyle || 'normal'}" text-anchor="${shape.textAlign === 'center' ? 'middle' : shape.textAlign === 'right' ? 'end' : 'start'}" fill="${shape.color}" opacity="${opacity}">${escapeXml(shape.text)}</text>\n`;
    }
  });
  
  svg += '</svg>';
  return svg;
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

// Initialize
saveHistory();
redraw();

