// Spreadsheet Simulator

const ROWS = 10; // 10x10 grid
const COLS = 10; // A-J

// IndexedDB setup
const DB_NAME = 'spreadsheetDB';
const DB_VERSION = 1;
const STORE_NAME = 'spreadsheetData';

let cells = {}; // Store cell data: { value, formula, display }
let selectedCell = { row: 0, col: 0 };
let isEditing = false;
let currentProject = null;
let completedProjects = JSON.parse(localStorage.getItem('completedProjects') || '[]');
let db = null; // IndexedDB database instance

// DOM Elements - will be initialized after DOM loads
let grid, formulaBar, currentCellDisplay, colHeaders, rowHeaders, clearBtn, resetBtn;

// Initialize grid
function initGrid() {
  // Get DOM elements
  grid = document.getElementById('spreadsheetGrid');
  formulaBar = document.getElementById('formulaBar');
  currentCellDisplay = document.getElementById('currentCell');
  colHeaders = document.querySelector('.col-headers');
  rowHeaders = document.querySelector('.row-headers');
  clearBtn = document.getElementById('clearBtn');
  resetBtn = document.getElementById('resetBtn');
  
  // Check if elements exist
  if (!grid || !colHeaders || !rowHeaders) {
    console.error('Spreadsheet grid elements not found');
    return;
  }
  
  // Clear existing content
  colHeaders.innerHTML = '';
  rowHeaders.innerHTML = '';
  grid.innerHTML = '';
  
  // Create column headers (A-Z)
  for (let col = 0; col < COLS; col++) {
    const header = document.createElement('div');
    header.className = 'col-header';
    header.textContent = String.fromCharCode(65 + col); // A=65
    colHeaders.appendChild(header);
  }
  
  // Create row headers (1-50)
  for (let row = 0; row < ROWS; row++) {
    const header = document.createElement('div');
    header.className = 'row-header';
    header.textContent = row + 1;
    rowHeaders.appendChild(header);
  }
  
  // Create cells
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('div');
      cell.className = 'spreadsheet-cell';
      cell.contentEditable = true;
      cell.setAttribute('data-row', row);
      cell.setAttribute('data-col', col);
      cell.setAttribute('tabindex', '0');
      
      const cellId = getCellId(row, col);
      cells[cellId] = { value: '', formula: '', display: '' };
      
      // Cell events - use mousedown for better click handling
      cell.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        selectCell(row, col);
        // Don't prevent default to allow text selection
      });
      
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCell(row, col);
      });
      
      cell.addEventListener('focus', () => {
        selectCell(row, col);
      });
      
      cell.addEventListener('blur', () => {
        if (isEditing) {
          updateCellFromDisplay(row, col);
          isEditing = false;
        }
      });
      
      cell.addEventListener('keydown', (e) => handleCellKeydown(e, row, col));
      
      cell.addEventListener('input', () => {
        isEditing = true;
        // Update formula bar in real-time while typing directly in cell
        // This shows what the user is typing, which will replace the formula if one exists
        if (formulaBar) {
          formulaBar.value = cell.textContent.trim();
        }
      });
      
      cell.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        cell.focus();
        // Select all text for easy editing
        const range = document.createRange();
        range.selectNodeContents(cell);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      });
      
      grid.appendChild(cell);
    }
  }
  
  selectCell(0, 0);
}

function getCellId(row, col) {
  return String.fromCharCode(65 + col) + (row + 1);
}

function selectCell(row, col) {
  // Deselect previous
  const prevCell = document.querySelector(`[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
  if (prevCell) {
    prevCell.classList.remove('selected');
  }
  
  selectedCell = { row, col };
  const cellId = getCellId(row, col);
  
  if (currentCellDisplay) {
    currentCellDisplay.textContent = cellId;
  }
  
  // Update formula bar
  if (formulaBar) {
    const cellData = cells[cellId];
    if (cellData && cellData.formula) {
      formulaBar.value = '=' + cellData.formula;
    } else {
      formulaBar.value = (cellData && cellData.value) || '';
    }
  }
  
  // Select new cell
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (cell) {
    cell.focus();
    cell.classList.add('selected');
  }
}

function handleCellKeydown(e, row, col) {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    updateCellFromDisplay(row, col);
    isEditing = false;
    
    if (e.key === 'Enter') {
      // Move down
      if (row < ROWS - 1) {
        selectCell(row + 1, col);
      }
    } else if (e.key === 'Tab') {
      // Move right
      if (col < COLS - 1) {
        selectCell(row, col + 1);
      } else if (row < ROWS - 1) {
        selectCell(row + 1, 0);
      }
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    isEditing = false;
    updateCellDisplay(row, col);
  } else if (e.key.startsWith('Arrow')) {
    e.preventDefault();
    updateCellFromDisplay(row, col);
    isEditing = false;
    
    let newRow = row;
    let newCol = col;
    
    if (e.key === 'ArrowUp' && row > 0) newRow--;
    if (e.key === 'ArrowDown' && row < ROWS - 1) newRow++;
    if (e.key === 'ArrowLeft' && col > 0) newCol--;
    if (e.key === 'ArrowRight' && col < COLS - 1) newCol++;
    
    selectCell(newRow, newCol);
  }
}

function updateCellFromDisplay(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  
  const cellId = getCellId(row, col);
  const input = cell.textContent.trim();
  
  setCellValue(cellId, input);
  updateCellDisplay(row, col);
  
  // Update formula bar to show formula if cell has one, otherwise show value
  if (formulaBar) {
    const cellData = cells[cellId];
    if (cellData && cellData.formula) {
      formulaBar.value = '=' + cellData.formula;
    } else {
      formulaBar.value = (cellData && cellData.value) || '';
    }
  }
}

function setCellValue(cellId, input) {
  if (!input) {
    cells[cellId] = { value: '', formula: '', display: '' };
    updateCellDisplayByCellId(cellId);
    debouncedSave(); // Save to IndexedDB
    return;
  }
  
  // Check if it's a formula (starts with =)
  if (input.startsWith('=')) {
    const formula = input.substring(1).trim();
    cells[cellId] = {
      value: '',
      formula: formula,
      display: ''
    };
    try {
      evaluateCell(cellId);
      updateCellDisplayByCellId(cellId);
    } catch (error) {
      // Error already set in evaluateCell
      updateCellDisplayByCellId(cellId);
    }
  } else {
    // Regular value
    cells[cellId] = {
      value: input,
      formula: '',
      display: input
    };
    updateCellDisplayByCellId(cellId);
  }
  
  // Re-evaluate dependent cells (this will update cells that reference this one)
  reevaluateDependentCells(cellId);
  
  // Save to IndexedDB (debounced)
  debouncedSave();
}

function evaluateCell(cellId, visitedCells = new Set()) {
  const cellData = cells[cellId];
  if (!cellData || !cellData.formula) return;
  
  // Prevent circular references - check BEFORE adding to visited set
  if (visitedCells.has(cellId)) {
    throw new Error('Circular reference');
  }
  
  // Create a new set to avoid mutating the passed set
  const newVisited = new Set(visitedCells);
  newVisited.add(cellId);
  
  try {
    const result = evaluateFormula(cellData.formula, cellId, newVisited);
    
    // Check for division by zero (only for numeric results)
    if (typeof result === 'number' && (result === Infinity || result === -Infinity || isNaN(result))) {
      throw new Error('Division by zero or invalid result');
    }
    
    cellData.display = result !== null ? String(result) : '';
    cellData.value = result !== null ? result : '';
  } catch (error) {
    cellData.display = '#ERROR';
    cellData.value = null;
    // Log error for debugging
    console.error(`Error evaluating cell ${cellId}:`, error.message, 'Formula:', cellData.formula);
    // Don't re-throw for regular errors, only for circular references
    if (error.message === 'Circular reference') {
      throw error;
    }
  }
}

function evaluateFormula(formula, currentCellId, visitedCells = new Set()) {
  // Remove whitespace (but keep spaces in strings)
  const originalFormula = formula;
  formula = formula.replace(/\s+/g, '');
  
  // Check if formula is JUST a function call (no other operators)
  const isJustFunction = /^(SUM|AVERAGE|MAX|MIN|IF)\(/.test(formula.toUpperCase()) && 
                         !/[+\-*/]/.test(formula.replace(/^(SUM|AVERAGE|MAX|MIN|IF)\([^)]*\)/i, ''));
  
  // Handle standalone function calls
  if (isJustFunction) {
    if (formula.toUpperCase().startsWith('SUM(')) {
      return evaluateSUM(formula, currentCellId, visitedCells);
    }
    if (formula.toUpperCase().startsWith('AVERAGE(')) {
      return evaluateAVERAGE(formula, currentCellId, visitedCells);
    }
    if (formula.toUpperCase().startsWith('MAX(')) {
      return evaluateMAX(formula, currentCellId, visitedCells);
    }
    if (formula.toUpperCase().startsWith('MIN(')) {
      return evaluateMIN(formula, currentCellId, visitedCells);
    }
    if (formula.toUpperCase().startsWith('IF(')) {
      return evaluateIF(formula, currentCellId, visitedCells);
    }
  }
  
  // Handle formulas with function calls embedded in expressions (e.g., SUM(A1:A3)*2)
  // Replace function calls with their evaluated values
  let replacedFormula = formula;
  
  // Helper function to find matching closing parenthesis
  function findMatchingParen(str, startPos) {
    let depth = 0;
    for (let i = startPos; i < str.length; i++) {
      if (str[i] === '(') depth++;
      else if (str[i] === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return -1;
  }
  
  // Replace SUM(...) calls (handle nested parentheses and ranges with colons)
  let sumMatch;
  while ((sumMatch = replacedFormula.match(/SUM\(/i)) !== null) {
    const startPos = sumMatch.index;
    const endPos = findMatchingParen(replacedFormula, startPos + 3);
    if (endPos > startPos) {
      const sumCall = replacedFormula.substring(startPos, endPos + 1);
      try {
        const result = evaluateSUM(sumCall, currentCellId, visitedCells);
        replacedFormula = replacedFormula.substring(0, startPos) + String(result) + replacedFormula.substring(endPos + 1);
      } catch (error) {
        replacedFormula = replacedFormula.substring(0, startPos) + '0' + replacedFormula.substring(endPos + 1);
      }
    } else {
      break;
    }
  }
  
  // Replace AVERAGE(...) calls
  let avgMatch;
  while ((avgMatch = replacedFormula.match(/AVERAGE\(/i)) !== null) {
    const startPos = avgMatch.index;
    const endPos = findMatchingParen(replacedFormula, startPos + 8);
    if (endPos > startPos) {
      const avgCall = replacedFormula.substring(startPos, endPos + 1);
      try {
        const result = evaluateAVERAGE(avgCall, currentCellId, visitedCells);
        replacedFormula = replacedFormula.substring(0, startPos) + String(result) + replacedFormula.substring(endPos + 1);
      } catch (error) {
        replacedFormula = replacedFormula.substring(0, startPos) + '0' + replacedFormula.substring(endPos + 1);
      }
    } else {
      break;
    }
  }
  
  // Replace MAX(...) calls
  let maxMatch;
  while ((maxMatch = replacedFormula.match(/MAX\(/i)) !== null) {
    const startPos = maxMatch.index;
    const endPos = findMatchingParen(replacedFormula, startPos + 3);
    if (endPos > startPos) {
      const maxCall = replacedFormula.substring(startPos, endPos + 1);
      try {
        const result = evaluateMAX(maxCall, currentCellId, visitedCells);
        replacedFormula = replacedFormula.substring(0, startPos) + String(result) + replacedFormula.substring(endPos + 1);
      } catch (error) {
        replacedFormula = replacedFormula.substring(0, startPos) + '0' + replacedFormula.substring(endPos + 1);
      }
    } else {
      break;
    }
  }
  
  // Replace MIN(...) calls
  let minMatch;
  while ((minMatch = replacedFormula.match(/MIN\(/i)) !== null) {
    const startPos = minMatch.index;
    const endPos = findMatchingParen(replacedFormula, startPos + 3);
    if (endPos > startPos) {
      const minCall = replacedFormula.substring(startPos, endPos + 1);
      try {
        const result = evaluateMIN(minCall, currentCellId, visitedCells);
        replacedFormula = replacedFormula.substring(0, startPos) + String(result) + replacedFormula.substring(endPos + 1);
      } catch (error) {
        replacedFormula = replacedFormula.substring(0, startPos) + '0' + replacedFormula.substring(endPos + 1);
      }
    } else {
      break;
    }
  }
  
  // Replace IF(...) calls (handle nested parentheses by finding matching closing paren)
  // This is a simplified approach - for complex nested IFs, we'll handle them one at a time
  let ifMatch;
  while ((ifMatch = replacedFormula.match(/IF\(/i)) !== null) {
    const startPos = ifMatch.index;
    let depth = 0;
    let endPos = startPos + 3; // Start after "IF("
    
    // Find the matching closing parenthesis
    for (let i = endPos; i < replacedFormula.length; i++) {
      if (replacedFormula[i] === '(') depth++;
      else if (replacedFormula[i] === ')') {
        if (depth === 0) {
          endPos = i + 1;
          break;
        }
        depth--;
      }
    }
    
    if (endPos > startPos + 3) {
      const ifCall = replacedFormula.substring(startPos, endPos);
      try {
        const result = evaluateIF(ifCall, currentCellId, visitedCells);
        replacedFormula = replacedFormula.substring(0, startPos) + String(result) + replacedFormula.substring(endPos);
      } catch (error) {
        // If IF evaluation fails, replace with 0
        replacedFormula = replacedFormula.substring(0, startPos) + '0' + replacedFormula.substring(endPos);
      }
    } else {
      break; // Couldn't find matching paren, break to avoid infinite loop
    }
  }
  
  // Now replace cell references with their values
  try {
    replacedFormula = replaceCellReferences(replacedFormula, currentCellId, visitedCells);
  } catch (error) {
    if (error.message === 'Circular reference') {
      throw error;
    }
    console.error('Error replacing cell references:', error);
    throw new Error('Error replacing cell references: ' + error.message);
  }
  
  // Evaluate the expression
  try {
    // Use Function constructor for safe evaluation
    // Only allow numbers, operators, and parentheses
    if (!/^[0-9+\-*/().\s]+$/.test(replacedFormula)) {
      console.error('Invalid characters in formula:', replacedFormula);
      throw new Error('Invalid characters in formula: ' + replacedFormula);
    }
    
    const result = Function('"use strict"; return (' + replacedFormula + ')')();
    
    // Check for division by zero
    if (result === Infinity || result === -Infinity || isNaN(result)) {
      throw new Error('Division by zero or invalid result');
    }
    
    return typeof result === 'number' ? result : null;
  } catch (error) {
    // Provide more detailed error message
    console.error('Formula evaluation error:', error, 'Replaced formula:', replacedFormula);
    throw new Error('Formula evaluation error: ' + error.message);
  }
}

function replaceCellReferences(formula, currentCellId, visitedCells = new Set()) {
  // Match cell references like A1, B2, etc.
  const cellRefRegex = /([A-Z]+)(\d+)/g;
  
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  // We don't need to add currentCellId again here
  
  // Use replace with a function to handle each match
  return formula.replace(cellRefRegex, (match, col, row) => {
    const cellId = col + row;
    
    // Validate cell is within bounds
    const rowNum = parseInt(row);
    if (rowNum < 1 || rowNum > ROWS) {
      return '0';
    }
    const colNum = colToNumber(col);
    if (colNum < 0 || colNum >= COLS) {
      return '0';
    }
    
    // Prevent circular references - check if this referenced cell is already in the evaluation chain
    if (visitedCells.has(cellId)) {
      throw new Error('Circular reference');
    }
    
    const cellData = cells[cellId];
    if (!cellData) {
      return '0';
    }
    
    // If cell has a formula, evaluate it first (with circular reference tracking)
    if (cellData.formula) {
      try {
        // Pass the visitedCells set (which includes currentCellId) to prevent cycles
        evaluateCell(cellId, new Set(visitedCells));
      } catch (error) {
        if (error.message === 'Circular reference') {
          throw error;
        }
        return '0';
      }
    }
    
    const value = cellData.value;
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    
    // Convert to number if possible
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '0';
    }
    return String(numValue);
  });
}

function evaluateSUM(formula, currentCellId, visitedCells = new Set()) {
  // Extract arguments from SUM(...)
  const match = formula.match(/^SUM\((.*)\)$/i);
  if (!match) {
    throw new Error('Invalid SUM syntax');
  }
  
  const args = match[1];
  let sum = 0;
  
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  // We don't need to add currentCellId again here
  const newVisited = new Set(visitedCells);
  
  // Handle range: A1:A5
  if (args.includes(':')) {
    const [start, end] = args.split(':').map(s => s.trim());
    const range = getCellRange(start, end);
    
    if (range.length === 0) {
      throw new Error('Invalid cell range');
    }
    
    for (const cellId of range) {
      // Check for circular reference: if this cell is already in the evaluation chain
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          try {
            // Pass the visited set (which includes currentCellId) to prevent cycles
            evaluateCell(cellId, new Set(newVisited));
          } catch (error) {
            if (error.message === 'Circular reference') {
              throw error;
            }
            // If evaluation fails, skip this cell
            continue;
          }
        }
        // Try value first, then display if value is empty/null
        const value = parseFloat(cellData.value || cellData.display || '0');
        if (!isNaN(value)) {
          sum += value;
        }
      }
    }
  } else {
    // Handle comma-separated list: A1,B2,C3
    const cellRefs = args.split(',').map(s => s.trim());
    
    for (const cellId of cellRefs) {
      // Check for circular reference: if this cell is already in the evaluation chain
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          try {
            // Pass the visited set (which includes currentCellId) to prevent cycles
            evaluateCell(cellId, new Set(newVisited));
          } catch (error) {
            if (error.message === 'Circular reference') {
              throw error;
            }
            // If evaluation fails, skip this cell
            continue;
          }
        }
        // Try value first, then display if value is empty/null
        const value = parseFloat(cellData.value || cellData.display || '0');
        if (!isNaN(value)) {
          sum += value;
        }
      }
    }
  }
  
  return sum;
}

function evaluateAVERAGE(formula, currentCellId, visitedCells = new Set()) {
  const match = formula.match(/^AVERAGE\((.*)\)$/i);
  if (!match) {
    throw new Error('Invalid AVERAGE syntax');
  }
  
  const args = match[1];
  let values = [];
  
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  const newVisited = new Set(visitedCells);
  
  if (args.includes(':')) {
    const [start, end] = args.split(':').map(s => s.trim());
    const range = getCellRange(start, end);
    
    for (const cellId of range) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  } else {
    const cellRefs = args.split(',').map(s => s.trim());
    for (const cellId of cellRefs) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  }
  
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function evaluateMAX(formula, currentCellId, visitedCells = new Set()) {
  const match = formula.match(/^MAX\((.*)\)$/i);
  if (!match) {
    throw new Error('Invalid MAX syntax');
  }
  
  const args = match[1];
  let values = [];
  
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  const newVisited = new Set(visitedCells);
  
  if (args.includes(':')) {
    const [start, end] = args.split(':').map(s => s.trim());
    const range = getCellRange(start, end);
    
    for (const cellId of range) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  } else {
    const cellRefs = args.split(',').map(s => s.trim());
    for (const cellId of cellRefs) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  }
  
  return values.length > 0 ? Math.max(...values) : 0;
}

function evaluateMIN(formula, currentCellId, visitedCells = new Set()) {
  const match = formula.match(/^MIN\((.*)\)$/i);
  if (!match) {
    throw new Error('Invalid MIN syntax');
  }
  
  const args = match[1];
  let values = [];
  
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  const newVisited = new Set(visitedCells);
  
  if (args.includes(':')) {
    const [start, end] = args.split(':').map(s => s.trim());
    const range = getCellRange(start, end);
    
    for (const cellId of range) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  } else {
    const cellRefs = args.split(',').map(s => s.trim());
    for (const cellId of cellRefs) {
      if (newVisited.has(cellId)) {
        throw new Error('Circular reference');
      }
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        const value = parseFloat(cellData.value);
        if (!isNaN(value)) {
          values.push(value);
        }
      }
    }
  }
  
  return values.length > 0 ? Math.min(...values) : 0;
}

function evaluateIF(formula, currentCellId, visitedCells = new Set()) {
  const match = formula.match(/^IF\((.*)\)$/i);
  if (!match) {
    throw new Error('Invalid IF syntax');
  }
  
  const args = match[1];
  // Use the visitedCells set as-is (it already contains currentCellId from evaluateCell)
  const newVisited = new Set(visitedCells);
  
  // Parse arguments (handle nested functions and strings)
  let parts = [];
  let current = '';
  let depth = 0;
  let inString = false;
  
  for (let i = 0; i < args.length; i++) {
    const char = args[i];
    if (char === '"' && (i === 0 || args[i-1] !== '\\')) {
      inString = !inString;
      current += char;
    } else if (!inString && char === '(') {
      depth++;
      current += char;
    } else if (!inString && char === ')') {
      depth--;
      current += char;
    } else if (!inString && depth === 0 && char === ',') {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push(current.trim());
  
  if (parts.length !== 3) {
    throw new Error('IF requires 3 arguments: condition, value_if_true, value_if_false');
  }
  
  const [condition, valueIfTrue, valueIfFalse] = parts;
  
  // Evaluate condition
  let conditionFormula = replaceCellReferences(condition, currentCellId, newVisited);
  
  try {
    if (!/^[0-9+\-*/().<>=!\s]+$/.test(conditionFormula)) {
      throw new Error('Invalid condition');
    }
    
    // Replace comparison operators (be careful with order - do compound operators first)
    // Replace <> (not equal) first
    conditionFormula = conditionFormula.replace(/<>/g, '!=');
    // Replace >= and <= (these contain =, so we need to handle them specially)
    // Temporarily replace them with placeholders
    conditionFormula = conditionFormula.replace(/>=/g, '__GTE__');
    conditionFormula = conditionFormula.replace(/<=/g, '__LTE__');
    // Now replace standalone = with ==
    conditionFormula = conditionFormula.replace(/=/g, '==');
    // Restore the compound operators
    conditionFormula = conditionFormula.replace(/__GTE__/g, '>=');
    conditionFormula = conditionFormula.replace(/__LTE__/g, '<=');
    
    const conditionResult = Function('"use strict"; return (' + conditionFormula + ')')();
    
    let resultValue = conditionResult ? valueIfTrue : valueIfFalse;
    
    // Remove quotes if string
    if (resultValue.startsWith('"') && resultValue.endsWith('"')) {
      return resultValue.slice(1, -1);
    }
    
    // Try as formula (starts with = or IF, SUM, AVERAGE, etc.)
    if (resultValue.startsWith('=')) {
      return evaluateFormula(resultValue.substring(1), currentCellId, newVisited);
    }
    
    // Check if it's a nested function call (IF, SUM, AVERAGE, MAX, MIN)
    const upperValue = resultValue.toUpperCase().trim();
    if (upperValue.startsWith('IF(') || upperValue.startsWith('SUM(') || 
        upperValue.startsWith('AVERAGE(') || upperValue.startsWith('MAX(') || 
        upperValue.startsWith('MIN(')) {
      return evaluateFormula(resultValue.trim(), currentCellId, newVisited);
    }
    
    // Try as cell reference
    const cellRefMatch = resultValue.match(/^([A-Z]+)(\d+)$/);
    if (cellRefMatch) {
      const cellId = resultValue;
      const cellData = cells[cellId];
      if (cellData) {
        if (cellData.formula) {
          evaluateCell(cellId, new Set(newVisited));
        }
        return cellData.value !== null && cellData.value !== undefined ? cellData.value : '';
      }
      return '';
    }
    
    // Try as number
    const numValue = parseFloat(resultValue);
    return isNaN(numValue) ? resultValue : numValue;
  } catch (error) {
    console.error('IF condition evaluation error:', error.message, 'Condition:', condition, 'Replaced:', conditionFormula);
    throw new Error('IF condition error: ' + error.message);
  }
}

function getCellRange(start, end) {
  const startMatch = start.match(/([A-Z]+)(\d+)/);
  const endMatch = end.match(/([A-Z]+)(\d+)/);
  
  if (!startMatch || !endMatch) {
    return [];
  }
  
  const startCol = startMatch[1];
  const startRow = parseInt(startMatch[2]);
  const endCol = endMatch[1];
  const endRow = parseInt(endMatch[2]);
  
  const startColNum = colToNumber(startCol);
  const endColNum = colToNumber(endCol);
  
  const range = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startColNum; col <= endColNum; col++) {
      range.push(numberToCol(col) + row);
    }
  }
  
  return range;
}

function colToNumber(col) {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num - 1;
}

function numberToCol(num) {
  let col = '';
  num++;
  while (num > 0) {
    num--;
    col = String.fromCharCode(65 + (num % 26)) + col;
    num = Math.floor(num / 26);
  }
  return col;
}

function reevaluateDependentCells(changedCellId, visited = new Set()) {
  // Prevent infinite recursion
  if (visited.has(changedCellId)) {
    return;
  }
  visited.add(changedCellId);
  
  // Find all cells that reference the changed cell (using regex for accurate matching)
  const cellRefRegex = new RegExp('\\b' + changedCellId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
  
  for (const cellId in cells) {
    const cellData = cells[cellId];
    if (cellData.formula && cellRefRegex.test(cellData.formula)) {
      try {
        evaluateCell(cellId);
        updateCellDisplayByCellId(cellId);
        
        // Recursively re-evaluate cells that depend on this one
        reevaluateDependentCells(cellId, new Set(visited));
      } catch (error) {
        // Handle errors (circular references, etc.)
        updateCellDisplayByCellId(cellId);
      }
    }
  }
}

function updateCellDisplay(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell) return;
  
  const cellId = getCellId(row, col);
  const cellData = cells[cellId];
  
  if (!cellData) {
    cell.textContent = '';
    cell.classList.remove('error', 'formula');
    return;
  }
  
  if (cellData.display === '#ERROR') {
    cell.textContent = '#ERROR';
    cell.classList.add('error');
    cell.classList.remove('formula');
  } else {
    cell.textContent = cellData.display || '';
    cell.classList.remove('error');
    // Add 'formula' class if cell has a formula (for visual indication)
    if (cellData.formula) {
      cell.classList.add('formula');
    } else {
      cell.classList.remove('formula');
    }
  }
}

function updateCellDisplayByCellId(cellId) {
  const match = cellId.match(/([A-Z]+)(\d+)/);
  if (!match) return;
  
  const col = colToNumber(match[1]);
  const row = parseInt(match[2]) - 1;
  
  updateCellDisplay(row, col);
}

// Formula bar, Clear, and Reset event listeners are initialized in initEventListeners()

// Tab switching
// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'spreadsheet';
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
      const tabContent = document.getElementById(`${savedTab}Tab`);
      
      if (tabButton && tabContent) {
        switchTab(savedTab);
        document.querySelectorAll('.tab-button').forEach(btn => {
          if (btn === tabButton) {
            btn.classList.add('tab-active');
          } else {
            btn.classList.remove('tab-active');
          }
        });
        return savedTab;
      }
    }
  } catch (e) {
    console.warn('Failed to restore tab state:', e);
  }
  return null;
}

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    switchTab(tabId);
    button.classList.add('tab-active');
    document.querySelectorAll('.tab-button').forEach(btn => {
      if (btn !== button) btn.classList.remove('tab-active');
    });
    
    // Save tab state
    saveTabState(tabId);
  });
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('tab-active');
  });
  document.getElementById(`${tabId}Tab`).classList.add('tab-active');
  
  if (tabId === 'projects') {
    loadProjects();
  } else if (tabId === 'spreadsheet') {
    updateSpreadsheetProjectDisplay();
  } else if (tabId === 'guide') {
    loadGuide();
  } else if (tabId === 'examples') {
    loadExamples();
  }
}

// Restore tab state on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    restoreTabState();
  });
} else {
  restoreTabState();
}

// Projects Data
const projects = [
  {
    id: 1,
    title: 'Simple Addition',
    difficulty: 'Beginner',
    description: 'Learn to add two numbers using cell references.',
    scenario: 'You have two numbers: 15 in cell A1 and 25 in cell B1. Calculate their sum in cell C1.',
    instructions: [
      'Enter 15 in cell A1',
      'Enter 25 in cell B1',
      'In cell C1, enter the formula =A1+B1',
      'Press Enter to see the result (40)'
    ],
    sampleData: { A1: '15', B1: '25' },
    validation: (cells) => {
      const c1 = cells['C1'];
      // Check that C1 has the correct formula
      return c1 && formulaMatches(c1.formula, 'A1+B1');
    },
    hint: 'Use the formula =A1+B1 in cell C1 to add the two numbers.',
    solution: 'In C1, enter: =A1+B1'
  },
  {
    id: 2,
    title: 'Subtraction Practice',
    difficulty: 'Beginner',
    description: 'Practice subtracting one cell from another.',
    scenario: 'Calculate the difference between 100 (in A1) and 35 (in B1). Put the result in C1.',
    instructions: [
      'Enter 100 in cell A1',
      'Enter 35 in cell B1',
      'In cell C1, enter =A1-B1',
      'The result should be 65'
    ],
    sampleData: { A1: '100', B1: '35' },
    validation: (cells) => {
      const c1 = cells['C1'];
      return c1 && formulaMatches(c1.formula, 'A1-B1');
    },
    hint: 'Use =A1-B1 to subtract B1 from A1.',
    solution: 'In C1, enter: =A1-B1'
  },
  {
    id: 3,
    title: 'Multiplication',
    difficulty: 'Beginner',
    description: 'Learn to multiply cells together.',
    scenario: 'Calculate the product of 8 (in A1) and 7 (in B1). Put the result in C1.',
    instructions: [
      'Enter 8 in cell A1',
      'Enter 7 in cell B1',
      'In cell C1, enter =A1*B1',
      'The result should be 56'
    ],
    sampleData: { A1: '8', B1: '7' },
    validation: (cells) => {
      const c1 = cells['C1'];
      return c1 && formulaMatches(c1.formula, 'A1*B1');
    },
    hint: 'Use the asterisk (*) for multiplication: =A1*B1',
    solution: 'In C1, enter: =A1*B1'
  },
  {
    id: 4,
    title: 'Division',
    difficulty: 'Beginner',
    description: 'Practice dividing one cell by another.',
    scenario: 'Divide 100 (in A1) by 4 (in B1). Put the result in C1.',
    instructions: [
      'Enter 100 in cell A1',
      'Enter 4 in cell B1',
      'In cell C1, enter =A1/B1',
      'The result should be 25'
    ],
    sampleData: { A1: '100', B1: '4' },
    validation: (cells) => {
      const c1 = cells['C1'];
      return c1 && formulaMatches(c1.formula, 'A1/B1');
    },
    hint: 'Use the forward slash (/) for division: =A1/B1',
    solution: 'In C1, enter: =A1/B1'
  },
  {
    id: 5,
    title: 'Expense Calculator',
    difficulty: 'Beginner',
    description: 'Use SUM to calculate total expenses.',
    scenario: 'You have 5 expenses: $10, $20, $15, $25, and $30 in cells A1 through A5. Calculate the total in cell A6.',
    instructions: [
      'Enter expenses: 10 in A1, 20 in A2, 15 in A3, 25 in A4, 30 in A5',
      'In cell A6, enter =SUM(A1:A5)',
      'The total should be 100'
    ],
    sampleData: { A1: '10', A2: '20', A3: '15', A4: '25', A5: '30' },
    validation: (cells) => {
      const a6 = cells['A6'];
      return a6 && formulaMatches(a6.formula, 'SUM(A1:A5)');
    },
    hint: 'Use =SUM(A1:A5) to add all values from A1 to A5.',
    solution: 'In A6, enter: =SUM(A1:A5)'
  },
  {
    id: 6,
    title: 'Multiple Cell Addition',
    difficulty: 'Intermediate',
    description: 'Add multiple cells using the + operator.',
    scenario: 'Add three numbers: 12 (A1), 18 (B1), and 20 (C1). Put the sum in D1.',
    instructions: [
      'Enter 12 in A1, 18 in B1, 20 in C1',
      'In D1, enter =A1+B1+C1',
      'The result should be 50'
    ],
    sampleData: { A1: '12', B1: '18', C1: '20' },
    validation: (cells) => {
      const d1 = cells['D1'];
      return d1 && formulaMatches(d1.formula, 'A1+B1+C1');
    },
    hint: 'Chain additions: =A1+B1+C1',
    solution: 'In D1, enter: =A1+B1+C1'
  },
  {
    id: 7,
    title: 'SUM with List',
    difficulty: 'Intermediate',
    description: 'Use SUM with comma-separated cell references.',
    scenario: 'Sum specific cells: A1 (10), B2 (20), and C3 (30). Put the result in D1.',
    instructions: [
      'Enter 10 in A1, 20 in B2, 30 in C3',
      'In D1, enter =SUM(A1,B2,C3)',
      'The result should be 60'
    ],
    sampleData: { A1: '10', B2: '20', C3: '30' },
    validation: (cells) => {
      const d1 = cells['D1'];
      return d1 && formulaMatches(d1.formula, 'SUM(A1,B2,C3)');
    },
    hint: 'Use =SUM(A1,B2,C3) to add specific cells.',
    solution: 'In D1, enter: =SUM(A1,B2,C3)'
  },
  {
    id: 8,
    title: 'Complex Formula',
    difficulty: 'Intermediate',
    description: 'Combine SUM with multiplication.',
    scenario: 'You have expenses in A1 (10), A2 (20), A3 (30). Calculate the total multiplied by 2 in B1.',
    instructions: [
      'Enter 10 in A1, 20 in A2, 30 in A3',
      'In B1, enter =SUM(A1:A3)*2',
      'The result should be 120'
    ],
    sampleData: { A1: '10', A2: '20', A3: '30' },
    validation: (cells) => {
      const b1 = cells['B1'];
      return b1 && formulaMatches(b1.formula, 'SUM(A1:A3)*2');
    },
    hint: 'Use =SUM(A1:A3)*2 to sum first, then multiply.',
    solution: 'In B1, enter: =SUM(A1:A3)*2'
  },
  {
    id: 9,
    title: 'Average Grade',
    difficulty: 'Intermediate',
    description: 'Calculate the average of grades using AVERAGE function.',
    scenario: 'Calculate the average of 5 grades: 85, 90, 88, 92, 87 in cells A1 through A5. Put the result in A6.',
    instructions: [
      'Enter grades: 85 in A1, 90 in A2, 88 in A3, 92 in A4, 87 in A5',
      'In A6, enter =AVERAGE(A1:A5)',
      'The result should be 88.4'
    ],
    sampleData: { A1: '85', A2: '90', A3: '88', A4: '92', A5: '87' },
    validation: (cells) => {
      const a6 = cells['A6'];
      return a6 && formulaMatches(a6.formula, 'AVERAGE(A1:A5)');
    },
    hint: 'Use =AVERAGE(A1:A5) to calculate the average.',
    solution: 'In A6, enter: =AVERAGE(A1:A5)',
    newFormula: 'AVERAGE'
  },
  {
    id: 10,
    title: 'Find Maximum',
    difficulty: 'Intermediate',
    description: 'Use MAX to find the highest value.',
    scenario: 'Find the highest sales value from: 150, 200, 175, 225, 190 in cells A1 through A5. Put the result in A6.',
    instructions: [
      'Enter sales: 150 in A1, 200 in A2, 175 in A3, 225 in A4, 190 in A5',
      'In A6, enter =MAX(A1:A5)',
      'The result should be 225'
    ],
    sampleData: { A1: '150', A2: '200', A3: '175', A4: '225', A5: '190' },
    validation: (cells) => {
      const a6 = cells['A6'];
      return a6 && formulaMatches(a6.formula, 'MAX(A1:A5)');
    },
    hint: 'Use =MAX(A1:A5) to find the maximum value.',
    solution: 'In A6, enter: =MAX(A1:A5)',
    newFormula: 'MAX'
  },
  {
    id: 11,
    title: 'Find Minimum',
    difficulty: 'Intermediate',
    description: 'Use MIN to find the lowest value.',
    scenario: 'Find the lowest temperature from: 72, 68, 75, 70, 73 in cells A1 through A5. Put the result in A6.',
    instructions: [
      'Enter temperatures: 72 in A1, 68 in A2, 75 in A3, 70 in A4, 73 in A5',
      'In A6, enter =MIN(A1:A5)',
      'The result should be 68'
    ],
    sampleData: { A1: '72', A2: '68', A3: '75', A4: '70', A5: '73' },
    validation: (cells) => {
      const a6 = cells['A6'];
      return a6 && formulaMatches(a6.formula, 'MIN(A1:A5)');
    },
    hint: 'Use =MIN(A1:A5) to find the minimum value.',
    solution: 'In A6, enter: =MIN(A1:A5)',
    newFormula: 'MIN'
  },
  {
    id: 12,
    title: 'Budget Analysis',
    difficulty: 'Advanced',
    description: 'Combine multiple formulas: SUM, AVERAGE, and subtraction.',
    scenario: 'You have income (1000 in A1) and expenses (200, 150, 300, 100 in B1-B4). Calculate total expenses (B5), average expense (B6), and remaining budget (A2).',
    instructions: [
      'Enter 1000 in A1 (income)',
      'Enter expenses: 200 in B1, 150 in B2, 300 in B3, 100 in B4',
      'In B5, enter =SUM(B1:B4) for total expenses',
      'In B6, enter =AVERAGE(B1:B4) for average expense',
      'In A2, enter =A1-B5 for remaining budget',
      'Results: B5=750, B6=187.5, A2=250'
    ],
    sampleData: { A1: '1000', B1: '200', B2: '150', B3: '300', B4: '100' },
    validation: (cells) => {
      const b5 = cells['B5'];
      const b6 = cells['B6'];
      const a2 = cells['A2'];
      return b5 && formulaMatches(b5.formula, 'SUM(B1:B4)') &&
             b6 && formulaMatches(b6.formula, 'AVERAGE(B1:B4)') &&
             a2 && formulaMatches(a2.formula, 'A1-B5');
    },
    hint: 'Use SUM for total, AVERAGE for average, and subtraction for remaining.',
    solution: 'B5: =SUM(B1:B4), B6: =AVERAGE(B1:B4), A2: =A1-B5'
  },
  {
    id: 13,
    title: 'Pass/Fail Check',
    difficulty: 'Advanced',
    description: 'Use IF statement to check if a score passes (>=70).',
    scenario: 'Check if a score of 85 (in A1) is passing. Put "Pass" in B1 if >=70, otherwise "Fail".',
    instructions: [
      'Enter 85 in A1',
      'In B1, enter =IF(A1>=70,"Pass","Fail")',
      'The result should be "Pass"'
    ],
    sampleData: { A1: '85' },
    validation: (cells) => {
      const b1 = cells['B1'];
      // Check formula matches (normalize to handle spacing variations)
      return b1 && formulaMatches(b1.formula, 'IF(A1>=70,"Pass","Fail")');
    },
    hint: 'Use =IF(A1>=70,"Pass","Fail") to check the condition.',
    solution: 'In B1, enter: =IF(A1>=70,"Pass","Fail")',
    newFormula: 'IF'
  },
  {
    id: 14,
    title: 'Grade Calculator',
    difficulty: 'Advanced',
    description: 'Use IF to assign letter grades based on score.',
    scenario: 'Assign a letter grade to score 88 (in A1): A if >=90, B if >=80, C if >=70, F otherwise. Put result in B1.',
    instructions: [
      'Enter 88 in A1',
      'In B1, enter =IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F")))',
      'The result should be "B"'
    ],
    sampleData: { A1: '88' },
    validation: (cells) => {
      const b1 = cells['B1'];
      return b1 && formulaMatches(b1.formula, 'IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F")))');
    },
    hint: 'Use nested IF statements: =IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F")))',
    solution: 'In B1, enter: =IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F")))',
    newFormula: 'IF'
  },
  {
    id: 15,
    title: 'Sales Report',
    difficulty: 'Advanced',
    description: 'Create a complete sales report with SUM, AVERAGE, MAX, and MIN.',
    scenario: 'Sales data: 1200, 1500, 1100, 1800, 1400 in A1-A5. Calculate total (A6), average (A7), max (A8), and min (A9).',
    instructions: [
      'Enter sales: 1200 in A1, 1500 in A2, 1100 in A3, 1800 in A4, 1400 in A5',
      'In A6, enter =SUM(A1:A5)',
      'In A7, enter =AVERAGE(A1:A5)',
      'In A8, enter =MAX(A1:A5)',
      'In A9, enter =MIN(A1:A5)',
      'Results: A6=7000, A7=1400, A8=1800, A9=1100'
    ],
    sampleData: { A1: '1200', A2: '1500', A3: '1100', A4: '1800', A5: '1400' },
    validation: (cells) => {
      const a6 = cells['A6'];
      const a7 = cells['A7'];
      const a8 = cells['A8'];
      const a9 = cells['A9'];
      return a6 && formulaMatches(a6.formula, 'SUM(A1:A5)') &&
             a7 && formulaMatches(a7.formula, 'AVERAGE(A1:A5)') &&
             a8 && formulaMatches(a8.formula, 'MAX(A1:A5)') &&
             a9 && formulaMatches(a9.formula, 'MIN(A1:A5)');
    },
    hint: 'Use SUM, AVERAGE, MAX, and MIN functions.',
    solution: 'A6: =SUM(A1:A5), A7: =AVERAGE(A1:A5), A8: =MAX(A1:A5), A9: =MIN(A1:A5)'
  }
];

// Project Functions
function loadProjects() {
  const projectsList = document.getElementById('projectsList');
  const projectDisplay = document.getElementById('projectDisplay');
  const completedCount = document.getElementById('completedCount');
  const completedCount2 = document.getElementById('completedCount2');
  
  if (!projectsList) return; // Projects tab not loaded yet
  
  projectsList.innerHTML = '';
  if (completedCount) completedCount.textContent = completedProjects.length;
  if (completedCount2) completedCount2.textContent = completedProjects.length;
  
  projects.forEach(project => {
    const isCompleted = completedProjects.includes(project.id);
    const isLocked = project.id > 1 && !completedProjects.includes(project.id - 1);
    const isActive = currentProject && currentProject.id === project.id;
    
    const item = document.createElement('div');
    item.className = `project-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
    if (isLocked) {
      item.innerHTML = `
        <div class="project-number">${project.id}</div>
        <div class="project-info">
          <div class="project-title">${project.title}</div>
          <div class="project-difficulty">${project.difficulty} • 🔒 Locked</div>
        </div>
        <div class="project-status">🔒</div>
      `;
    } else {
      item.innerHTML = `
        <div class="project-number">${project.id}</div>
        <div class="project-info">
          <div class="project-title">${project.title}</div>
          <div class="project-difficulty">${project.difficulty}</div>
        </div>
        <div class="project-status">${isCompleted ? '✓' : ''}</div>
      `;
      item.addEventListener('click', () => loadProject(project));
    }
    
    projectsList.appendChild(item);
  });
  
  // Show current project instructions or welcome message
  if (projectDisplay) {
    if (currentProject) {
      showProjectInstructions(projectDisplay, currentProject);
    } else {
      projectDisplay.innerHTML = `
        <div class="project-welcome">
          <h2>Welcome to Spreadsheet Projects!</h2>
          <p>Select a project from the left to get started. Each project teaches you new spreadsheet skills through real-world scenarios.</p>
          <div class="project-stats">
            <div class="stat-item">
              <span class="stat-value" id="completedCount2">${completedProjects.length}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">15</span>
              <span class="stat-label">Total Projects</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 20px;">
            <button id="generateReportBtn" class="btn-primary" style="width: 100%;">
              📊 Generate Progress Report
            </button>
            <div style="display: flex; gap: 10px;">
              <button id="exportProgressBtn" class="btn-secondary" style="flex: 1;">
                📤 Export Progress
              </button>
              <button id="importProgressBtn" class="btn-secondary" style="flex: 1;">
                📥 Import Progress
              </button>
            </div>
            <input type="file" id="importFileInput" accept=".json" style="display: none;" />
          </div>
        </div>
      `;
      
      // Re-attach event listeners
      const generateReportBtn = document.getElementById('generateReportBtn');
      if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
      }
      
      const exportProgressBtn = document.getElementById('exportProgressBtn');
      const importProgressBtn = document.getElementById('importProgressBtn');
      const importFileInput = document.getElementById('importFileInput');
      
      if (exportProgressBtn) {
        exportProgressBtn.addEventListener('click', exportProgress);
      }
      
      if (importProgressBtn && importFileInput) {
        importProgressBtn.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            importProgress(e.target.files[0]);
          }
        });
      }
    }
  }
}

async function loadProject(project) {
  // Save current project's data before switching
  if (currentProject) {
    saveSpreadsheet();
  }
  
  currentProject = project;
  loadProjects(); // Refresh list to show active state and update instructions
  
  // Try to load saved data for this project
  const savedData = await loadSpreadsheet(project.id);
  
  if (savedData) {
    // Loaded saved data - it's already rendered and evaluated
    // Just update the display
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        updateCellDisplay(row, col);
      }
    }
  } else {
    // No saved data - start fresh
    cells = {};
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellId = getCellId(row, col);
        cells[cellId] = { value: '', formula: '', display: '' };
        updateCellDisplay(row, col);
      }
    }
    
    // Pre-fill sample data
    if (project.sampleData) {
      Object.entries(project.sampleData).forEach(([cellId, value]) => {
        setCellValue(cellId, value);
        const match = cellId.match(/([A-Z]+)(\d+)/);
        if (match) {
          const col = colToNumber(match[1]);
          const row = parseInt(match[2]) - 1;
          updateCellDisplay(row, col);
        }
      });
    }
  }
  
  // Switch to spreadsheet tab and update sidebar
  switchTab('spreadsheet');
  // Small delay to ensure tab is visible before updating sidebar
  setTimeout(() => {
    updateSpreadsheetProjectDisplay();
  }, 100);
}

function showProjectInstructions(container, project) {
  const isCompleted = completedProjects.includes(project.id);
  const showHint = localStorage.getItem(`hint_${project.id}`) === 'shown';
  
  container.innerHTML = `
    <div class="project-scenario">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-size: 1.8rem; color: var(--accent); margin: 0;">Project ${project.id}: ${project.title}</h2>
        <span style="color: var(--text-muted); font-size: 0.9rem;">${project.difficulty}</span>
      </div>
      
      <p style="color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; font-size: 1.05rem;">${project.scenario}</p>
      
      <div class="project-instructions">
        <h4>Instructions:</h4>
        <ol>
          ${project.instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ol>
      </div>
      
      ${project.sampleData ? `
        <div class="project-sample-data">
          <strong>Sample Data:</strong><br>
          ${Object.entries(project.sampleData).map(([cell, val]) => `${cell}: ${val}`).join(', ')}
        </div>
      ` : ''}
      
      <div class="project-actions">
        <button id="checkSolutionBtn" class="btn-primary">✓ Check Solution</button>
        <button id="showHintBtn" class="btn-secondary">💡 ${showHint ? 'Hide' : 'Show'} Hint</button>
        <button id="openSpreadsheetBtn" class="btn-secondary">📊 Open Spreadsheet</button>
        ${isCompleted ? '<button id="showSolutionBtn" class="btn-secondary">👁️ Show Solution</button>' : ''}
      </div>
      
      <div id="projectFeedback"></div>
      
      ${showHint ? `
        <div class="project-hint">
          <h4>💡 Hint</h4>
          <p>${project.hint}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  // Attach event listeners
  document.getElementById('checkSolutionBtn').addEventListener('click', () => {
    checkProjectSolution(project);
  });
  
  document.getElementById('showHintBtn').addEventListener('click', () => {
    const newState = showHint ? 'hidden' : 'shown';
    localStorage.setItem(`hint_${project.id}`, newState);
    showProjectInstructions(container, project);
  });
  
  document.getElementById('openSpreadsheetBtn').addEventListener('click', () => {
    switchTab('spreadsheet');
  });
  
  if (isCompleted) {
    document.getElementById('showSolutionBtn').addEventListener('click', () => {
      const feedback = document.getElementById('projectFeedback');
      feedback.innerHTML = `
        <div class="project-feedback info">
          <strong>Solution:</strong> ${project.solution}
        </div>
      `;
    });
  }
}

// Helper function to normalize formulas for comparison (remove spaces, case insensitive)
function normalizeFormula(formula) {
  return formula.replace(/\s+/g, '').toUpperCase();
}

// Helper function to check if a formula matches expected formula
function formulaMatches(actualFormula, expectedFormula) {
  if (!actualFormula) return false;
  return normalizeFormula(actualFormula) === normalizeFormula(expectedFormula);
}

// Helper function to check if sample data cells have correct values
function checkSampleData(sampleData) {
  for (const [cellId, expectedValue] of Object.entries(sampleData)) {
    const cellData = cells[cellId];
    if (!cellData) return false;
    const actualValue = String(cellData.value || cellData.display || '').trim();
    const expected = String(expectedValue).trim();
    if (actualValue !== expected) {
      return false;
    }
  }
  return true;
}

function checkProjectSolution(project) {
  const feedback = document.getElementById('projectFeedback');
  const spreadsheetFeedback = document.getElementById('spreadsheetProjectFeedback');
  
  try {
    // Re-evaluate all cells to ensure formulas are up to date
    for (const cellId in cells) {
      const cellData = cells[cellId];
      if (cellData.formula) {
        try {
          evaluateCell(cellId);
          updateCellDisplayByCellId(cellId);
        } catch (e) {
          // Ignore errors during validation
        }
      }
    }
    
    // Run the validation function (which checks formulas, not just results)
    // We don't strictly enforce sample data values - students can experiment with different values
    // as long as they use the correct formulas
    const validationPassed = project.validation(cells);
    
    // Find next project
    const nextProject = projects.find(p => p.id === project.id + 1);
    const nextButton = nextProject ? `<button id="nextProjectBtn" class="btn-primary" style="margin-top: 12px;">➡️ Next Project: ${nextProject.title}</button>` : '';
    
    const successMessage = `
      <div class="project-feedback success">
        <strong>✓ Correct!</strong> You've completed this project. Great job!
        ${nextButton}
      </div>
    `;
    
    const errorMessage = `
      <div class="project-feedback error">
        <strong>Not quite right.</strong> Check your formulas and try again. Make sure you're using the correct formula structure. Use the hint if you need help.
      </div>
    `;
    
    if (validationPassed) {
      // Mark as completed
      if (!completedProjects.includes(project.id)) {
        completedProjects.push(project.id);
        localStorage.setItem('completedProjects', JSON.stringify(completedProjects));
        loadProjects();
      }
      
      if (feedback) {
        feedback.innerHTML = successMessage;
        // Add event listener for next button
        const nextBtn = feedback.querySelector('#nextProjectBtn');
        if (nextBtn && nextProject) {
          nextBtn.addEventListener('click', () => loadProject(nextProject));
        }
      }
      if (spreadsheetFeedback) {
        spreadsheetFeedback.innerHTML = successMessage.replace('project-feedback', 'spreadsheet-project-feedback');
        // Add event listener for next button in spreadsheet sidebar
        const nextBtn = spreadsheetFeedback.querySelector('#nextProjectBtn');
        if (nextBtn && nextProject) {
          nextBtn.addEventListener('click', () => loadProject(nextProject));
        }
      }
    } else {
      if (feedback) feedback.innerHTML = errorMessage;
      if (spreadsheetFeedback) spreadsheetFeedback.innerHTML = errorMessage.replace('project-feedback', 'spreadsheet-project-feedback');
    }
  } catch (error) {
    const errorMsg = `
      <div class="project-feedback error">
        <strong>Error:</strong> ${error.message}
      </div>
    `;
    if (feedback) feedback.innerHTML = errorMsg;
    if (spreadsheetFeedback) spreadsheetFeedback.innerHTML = errorMsg.replace('project-feedback', 'spreadsheet-project-feedback');
  }
}

function updateSpreadsheetProjectDisplay() {
  const sidebar = document.getElementById('spreadsheetSidebar');
  const display = document.getElementById('spreadsheetProjectDisplay');
  const layout = document.querySelector('.spreadsheet-layout');
  
  if (!sidebar || !display) {
    console.log('Sidebar elements not found');
    return;
  }
  
  if (!currentProject) {
    display.innerHTML = '';
    sidebar.style.display = 'none';
    if (layout) layout.classList.add('no-sidebar');
    return;
  }
  
  // Always show sidebar when project is active
  sidebar.style.display = 'block';
  sidebar.style.visibility = 'visible';
  if (layout) layout.classList.remove('no-sidebar');
  
  const isCompleted = completedProjects.includes(currentProject.id);
  const showHint = localStorage.getItem(`hint_${currentProject.id}`) === 'shown';
  
  display.innerHTML = `
    <div class="spreadsheet-project-header">
      <h3>Project ${currentProject.id}: ${currentProject.title}</h3>
      <span class="spreadsheet-project-difficulty">${currentProject.difficulty}</span>
    </div>
    
    <div class="spreadsheet-project-scenario">
      ${currentProject.scenario}
    </div>
    
    <div class="spreadsheet-project-instructions">
      <h4>Instructions:</h4>
      <ol>
        ${currentProject.instructions.map(inst => `<li>${inst}</li>`).join('')}
      </ol>
    </div>
    
    ${currentProject.sampleData ? `
      <div class="spreadsheet-project-sample-data">
        <strong>Sample Data:</strong><br>
        ${Object.entries(currentProject.sampleData).map(([cell, val]) => `${cell}: ${val}`).join(', ')}
      </div>
    ` : ''}
    
    <div class="spreadsheet-project-actions">
      <button id="spreadsheetCheckSolutionBtn" class="btn-primary">✓ Check Solution</button>
      <button id="spreadsheetShowHintBtn" class="btn-secondary">💡 ${showHint ? 'Hide' : 'Show'} Hint</button>
      ${isCompleted ? '<button id="spreadsheetShowSolutionBtn" class="btn-secondary">👁️ Show Solution</button>' : ''}
    </div>
    
    <div id="spreadsheetProjectFeedback"></div>
    
    ${showHint ? `
      <div class="spreadsheet-project-hint">
        <h4>💡 Hint</h4>
        <p>${currentProject.hint}</p>
      </div>
    ` : ''}
  `;
  
  // Attach event listeners
  document.getElementById('spreadsheetCheckSolutionBtn').addEventListener('click', () => {
    checkProjectSolution(currentProject);
  });
  
  document.getElementById('spreadsheetShowHintBtn').addEventListener('click', () => {
    const newState = showHint ? 'hidden' : 'shown';
    localStorage.setItem(`hint_${currentProject.id}`, newState);
    updateSpreadsheetProjectDisplay();
  });
  
  if (isCompleted) {
    document.getElementById('spreadsheetShowSolutionBtn').addEventListener('click', () => {
      const feedback = document.getElementById('spreadsheetProjectFeedback');
      feedback.innerHTML = `
        <div class="spreadsheet-project-feedback info">
          <strong>Solution:</strong> ${currentProject.solution}
        </div>
      `;
    });
  }
}

function loadGuide() {
  const guideContent = document.getElementById('guideContent');
  guideContent.innerHTML = `
    <h2>Spreadsheet Guide</h2>
    
    <h3>Getting Started</h3>
    <p>This spreadsheet simulator teaches you the basics of working with spreadsheets like Excel and Google Sheets. You can enter values, create formulas, and use cell references.</p>
    
    <h3>Entering Data</h3>
    <ul>
      <li><strong>Click a cell</strong> to select it</li>
      <li><strong>Type a value</strong> directly in the cell or use the formula bar</li>
      <li><strong>Press Enter</strong> to confirm and move to the cell below</li>
      <li><strong>Press Tab</strong> to move to the next cell to the right</li>
      <li><strong>Use arrow keys</strong> to navigate between cells</li>
    </ul>
    
    <h3>Cell References</h3>
    <p>Cells are identified by their column (A-Z) and row (1-50). For example:</p>
    <ul>
      <li><strong>A1</strong> - First cell in the top-left</li>
      <li><strong>B2</strong> - Second column, second row</li>
      <li><strong>Z50</strong> - Last column, last row</li>
    </ul>
    <p>You can reference other cells in formulas to use their values.</p>
    
    <h3>Formulas</h3>
    <p>Formulas start with an equals sign (=). They can include:</p>
    <ul>
      <li><strong>Basic Math:</strong> =A1+B1, =A1-B1, =A1*B1, =A1/B1</li>
      <li><strong>Cell References:</strong> =A1+B2+C3</li>
      <li><strong>SUM Function:</strong> =SUM(A1:A5) or =SUM(A1,B2,C3)</li>
      <li><strong>Combinations:</strong> =SUM(A1:A5)*2</li>
    </ul>
    
    <h3>SUM Function</h3>
    <p>The SUM function adds up multiple values. You can use it in two ways:</p>
    <ul>
      <li><strong>Range:</strong> =SUM(A1:A5) adds cells A1 through A5</li>
      <li><strong>List:</strong> =SUM(A1,B2,C3) adds specific cells</li>
    </ul>
    
    <h3>Tips</h3>
    <ul>
      <li>Formulas automatically update when referenced cells change</li>
      <li>Cells with formulas are shown in green italic text</li>
      <li>Errors are shown in red with #ERROR</li>
      <li>Circular references (cell referencing itself) will show an error</li>
      <li>Empty cells are treated as 0 in calculations</li>
    </ul>
  `;
}

function loadExamples() {
  const examplesContent = document.getElementById('examplesContent');
  examplesContent.innerHTML = `
    <h2>Formula Examples</h2>
    
    <div class="example-item">
      <h4>1. Basic Addition</h4>
      <p>Add two cells together:</p>
      <div class="formula">=A1+B1</div>
      <p class="result">If A1 contains 5 and B1 contains 3, the result is 8.</p>
    </div>
    
    <div class="example-item">
      <h4>2. Subtraction</h4>
      <p>Subtract one cell from another:</p>
      <div class="formula">=A1-B1</div>
      <p class="result">If A1 contains 10 and B1 contains 4, the result is 6.</p>
    </div>
    
    <div class="example-item">
      <h4>3. Multiplication</h4>
      <p>Multiply two cells:</p>
      <div class="formula">=A1*B1</div>
      <p class="result">If A1 contains 6 and B1 contains 7, the result is 42.</p>
    </div>
    
    <div class="example-item">
      <h4>4. Division</h4>
      <p>Divide one cell by another:</p>
      <div class="formula">=A1/B1</div>
      <p class="result">If A1 contains 20 and B1 contains 4, the result is 5.</p>
    </div>
    
    <div class="example-item">
      <h4>5. SUM with Range</h4>
      <p>Add a range of cells:</p>
      <div class="formula">=SUM(A1:A5)</div>
      <p class="result">Adds all values from A1 through A5.</p>
      <p class="result">Example: If A1=1, A2=2, A3=3, A4=4, A5=5, the result is 15.</p>
    </div>
    
    <div class="example-item">
      <h4>6. SUM with List</h4>
      <p>Add specific cells:</p>
      <div class="formula">=SUM(A1,B2,C3)</div>
      <p class="result">Adds only the values in A1, B2, and C3.</p>
    </div>
    
    <div class="example-item">
      <h4>7. Complex Formula</h4>
      <p>Combine operations:</p>
      <div class="formula">=SUM(A1:A5)*2</div>
      <p class="result">First sums A1 through A5, then multiplies by 2.</p>
    </div>
    
    <div class="example-item">
      <h4>8. Multiple Cell References</h4>
      <p>Use multiple cells in a calculation:</p>
      <div class="formula">=A1+B1+C1</div>
      <p class="result">Adds three cells in the same row.</p>
    </div>
    
    <h3>Try It Yourself</h3>
    <p>Go to the Spreadsheet tab and try these examples:</p>
    <ol>
      <li>Enter <strong>10</strong> in cell A1</li>
      <li>Enter <strong>5</strong> in cell B1</li>
      <li>Enter <strong>=A1+B1</strong> in cell C1</li>
      <li>You should see <strong>15</strong> in cell C1</li>
      <li>Change A1 to <strong>20</strong> and watch C1 update to <strong>25</strong>!</li>
    </ol>
  `;
}

// Initialize event listeners
function initEventListeners() {
  if (!formulaBar || !clearBtn || !resetBtn) return;
  
  formulaBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = formulaBar.value.trim();
      const cellId = getCellId(selectedCell.row, selectedCell.col);
      
      if (input) {
        setCellValue(cellId, input);
        updateCellDisplay(selectedCell.row, selectedCell.col);
        reevaluateDependentCells(cellId);
      }
      
      // Move to next cell
      if (selectedCell.row < ROWS - 1) {
        selectCell(selectedCell.row + 1, selectedCell.col);
      }
    }
  });
  
  formulaBar.addEventListener('input', () => {
    // Don't update cell display while editing in formula bar
    // Only update when Enter is pressed
  });
  
  // Clear and Reset
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all cells?')) {
      cells = {};
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const cellId = getCellId(row, col);
          cells[cellId] = { value: '', formula: '', display: '' };
          updateCellDisplay(row, col);
        }
      }
      selectCell(0, 0);
      formulaBar.value = '';
      saveSpreadsheet(); // Save cleared state to IndexedDB
    }
  });
  
  resetBtn.addEventListener('click', async () => {
    if (confirm('Reset everything? This will clear all data for the current project.')) {
      // Clear cells
      cells = {};
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const cellId = getCellId(row, col);
          cells[cellId] = { value: '', formula: '', display: '' };
          updateCellDisplay(row, col);
        }
      }
      selectCell(0, 0);
      formulaBar.value = '';
      
      // Delete saved data for current project
      if (db && currentProject) {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        store.delete(`project_${currentProject.id}`);
      }
      
      // Reload project to get fresh sample data
      if (currentProject) {
        await loadProject(currentProject);
      }
    }
  });
  
  // Report generation button
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateReport);
  }
}

// IndexedDB functions
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
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function saveSpreadsheet() {
  if (!db || !currentProject) return; // Only save if a project is active
  
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const data = {
    id: `project_${currentProject.id}`, // Save per project
    cells: cells,
    projectId: currentProject.id,
    timestamp: Date.now()
  };
  
  store.put(data);
}

function loadSpreadsheet(projectId) {
  return new Promise((resolve, reject) => {
    if (!db || !projectId) {
      resolve(null);
      return;
    }
    
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(`project_${projectId}`);
    
    request.onsuccess = () => {
      const data = request.result;
      if (data && data.cells) {
        cells = data.cells;
        // Re-render all cells
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            updateCellDisplay(row, col);
          }
        }
        // Re-evaluate all formulas to ensure they're up to date
        for (const cellId in cells) {
          const cellData = cells[cellId];
          if (cellData && cellData.formula) {
            try {
              evaluateCell(cellId);
              updateCellDisplayByCellId(cellId);
            } catch (error) {
              // Error already handled in evaluateCell
              updateCellDisplayByCellId(cellId);
            }
          }
        }
        resolve(cells);
      } else {
        resolve(null);
      }
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Debounce function for saving
let saveTimeout = null;
function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveSpreadsheet();
  }, 500); // Save 500ms after last change
}

// Report Generation
function generateReport() {
  const totalProjects = projects.length;
  const completedCount = completedProjects.length;
  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
  
  // Calculate by difficulty
  const byDifficulty = {
    Beginner: { total: 0, completed: 0 },
    Intermediate: { total: 0, completed: 0 },
    Advanced: { total: 0, completed: 0 }
  };
  
  projects.forEach(project => {
    byDifficulty[project.difficulty].total++;
    if (completedProjects.includes(project.id)) {
      byDifficulty[project.difficulty].completed++;
    }
  });
  
  // Separate projects into completed, in-progress, and not started
  const completed = projects.filter(p => completedProjects.includes(p.id));
  const inProgress = projects.filter(p => {
    if (completedProjects.includes(p.id)) return false;
    if (p.id === 1) return false; // First project is not "in progress"
    return completedProjects.includes(p.id - 1); // Previous project completed
  });
  const notStarted = projects.filter(p => {
    if (completedProjects.includes(p.id)) return false;
    if (p.id === 1) return true; // First project not started
    return !completedProjects.includes(p.id - 1); // Previous project not completed
  });
  
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const reportHTML = `
    <div class="report-container" id="reportContent">
      <div class="report-header">
        <h1>📊 Progress Report</h1>
        <div class="report-date">Generated on ${reportDate}</div>
      </div>
      
      <div class="report-section">
        <h2>Overall Progress</h2>
        <div class="report-stats">
          <div class="report-stat-card">
            <div class="report-stat-value">${completedCount}</div>
            <div class="report-stat-label">Completed Projects</div>
          </div>
          <div class="report-stat-card">
            <div class="report-stat-value">${totalProjects}</div>
            <div class="report-stat-label">Total Projects</div>
          </div>
          <div class="report-stat-card">
            <div class="report-stat-value">${completionRate}%</div>
            <div class="report-stat-label">Completion Rate</div>
          </div>
        </div>
        <div class="report-progress-bar">
          <div class="report-progress-fill" style="width: ${completionRate}%">
            ${completionRate}%
          </div>
        </div>
      </div>
      
      <div class="report-section">
        <h2>Progress by Difficulty</h2>
        <div class="report-difficulty-breakdown">
          <div class="report-difficulty-card">
            <div class="report-difficulty-title">Beginner</div>
            <div class="report-difficulty-count">${byDifficulty.Beginner.completed}/${byDifficulty.Beginner.total}</div>
            <div class="report-difficulty-total">Projects</div>
          </div>
          <div class="report-difficulty-card">
            <div class="report-difficulty-title">Intermediate</div>
            <div class="report-difficulty-count">${byDifficulty.Intermediate.completed}/${byDifficulty.Intermediate.total}</div>
            <div class="report-difficulty-total">Projects</div>
          </div>
          <div class="report-difficulty-card">
            <div class="report-difficulty-title">Advanced</div>
            <div class="report-difficulty-count">${byDifficulty.Advanced.completed}/${byDifficulty.Advanced.total}</div>
            <div class="report-difficulty-total">Projects</div>
          </div>
        </div>
      </div>
      
      ${completed.length > 0 ? `
      <div class="report-section">
        <h2>✅ Completed Projects (${completed.length})</h2>
        <div class="report-projects-list">
          ${completed.map(p => `
            <div class="report-project-item completed">
              <div class="report-project-number">${p.id}</div>
              <div class="report-project-info">
                <div class="report-project-title">${p.title}</div>
                <div class="report-project-difficulty">${p.difficulty}</div>
              </div>
              <div class="report-project-status">✓</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${inProgress.length > 0 ? `
      <div class="report-section">
        <h2>🔄 In Progress (${inProgress.length})</h2>
        <div class="report-projects-list">
          ${inProgress.map(p => `
            <div class="report-project-item">
              <div class="report-project-number">${p.id}</div>
              <div class="report-project-info">
                <div class="report-project-title">${p.title}</div>
                <div class="report-project-difficulty">${p.difficulty}</div>
              </div>
              <div class="report-project-status">⏳</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${notStarted.length > 0 ? `
      <div class="report-section">
        <h2>🔒 Not Started (${notStarted.length})</h2>
        <div class="report-projects-list">
          ${notStarted.map(p => `
            <div class="report-project-item ${p.id > 1 && !completedProjects.includes(p.id - 1) ? 'locked' : ''}">
              <div class="report-project-number">${p.id}</div>
              <div class="report-project-info">
                <div class="report-project-title">${p.title}</div>
                <div class="report-project-difficulty">${p.difficulty} ${p.id > 1 && !completedProjects.includes(p.id - 1) ? '• 🔒 Locked' : ''}</div>
              </div>
              <div class="report-project-status">○</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="report-section">
        <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; margin-top: 30px;">
          Keep up the great work! 🎉
        </div>
      </div>
    </div>
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'report-modal';
  modal.innerHTML = `
    <div class="report-modal-content">
      <button class="report-modal-close" onclick="this.closest('.report-modal').remove()">×</button>
      ${reportHTML}
      <div class="report-actions">
        <button class="btn-primary" id="exportReportBtn">📥 Download as Image</button>
        <button class="btn-secondary" onclick="this.closest('.report-modal').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Export as image
  const exportBtn = modal.querySelector('#exportReportBtn');
  exportBtn.addEventListener('click', async () => {
    exportBtn.textContent = '⏳ Generating...';
    exportBtn.disabled = true;
    
    try {
      const reportContent = modal.querySelector('#reportContent');
      
      // Check if html2canvas is loaded
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas library not loaded');
      }
      
      const canvas = await html2canvas(reportContent, {
        backgroundColor: '#1e293b',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: reportContent.scrollWidth,
        windowHeight: reportContent.scrollHeight
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spreadsheet-progress-report-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        exportBtn.textContent = '✓ Downloaded!';
        setTimeout(() => {
          exportBtn.textContent = '📥 Download as Image';
          exportBtn.disabled = false;
        }, 2000);
      }, 'image/png');
    } catch (error) {
      console.error('Error generating report image:', error);
      alert('Error generating report image. Please try again.');
      exportBtn.textContent = '📥 Download as Image';
      exportBtn.disabled = false;
    }
  });
  
  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Export/Import Progress Functions
async function exportProgress() {
  try {
    // Get completed projects from localStorage
    const completedProjectsData = JSON.parse(localStorage.getItem('completedProjects') || '[]');
    
    // Get all spreadsheet data from IndexedDB
    const spreadsheetData = {};
    if (db) {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          request.result.forEach(item => {
            spreadsheetData[item.id] = {
              projectId: item.projectId,
              cells: item.cells,
              timestamp: item.timestamp
            };
          });
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
    
    // Create export data structure
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      completedProjects: completedProjectsData,
      spreadsheetData: spreadsheetData
    };
    
    // Convert to JSON and download
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet-progress-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('Progress exported successfully!', 'success');
  } catch (error) {
    console.error('Error exporting progress:', error);
    showNotification('Error exporting progress. Please try again.', 'error');
  }
}

async function importProgress(file) {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate structure
    if (!importData.version || !importData.completedProjects || !importData.spreadsheetData) {
      throw new Error('Invalid file format. Please select a valid progress export file.');
    }
    
    // Confirm import
    const confirmed = confirm(
      `This will replace your current progress with the imported data.\n\n` +
      `Completed Projects: ${importData.completedProjects.length}\n` +
      `Saved Spreadsheets: ${Object.keys(importData.spreadsheetData).length}\n\n` +
      `Do you want to continue?`
    );
    
    if (!confirmed) {
      return;
    }
    
    // Import completed projects
    localStorage.setItem('completedProjects', JSON.stringify(importData.completedProjects));
    completedProjects = importData.completedProjects;
    
    // Import spreadsheet data to IndexedDB
    if (db && importData.spreadsheetData) {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing data first
      await new Promise((resolve, reject) => {
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => resolve();
        clearRequest.onerror = () => reject(clearRequest.error);
      });
      
      // Import all spreadsheet data
      const importPromises = Object.values(importData.spreadsheetData).map(item => {
        return new Promise((resolve, reject) => {
          const putRequest = store.put({
            id: `project_${item.projectId}`,
            projectId: item.projectId,
            cells: item.cells,
            timestamp: item.timestamp || Date.now()
          });
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        });
      });
      
      await Promise.all(importPromises);
    }
    
    // Reload projects to reflect changes
    loadProjects();
    
    // If current project is active, reload it
    if (currentProject) {
      await loadProject(currentProject);
    }
    
    // Show success message
    showNotification('Progress imported successfully!', 'success');
    
    // Reset file input
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) {
      importFileInput.value = '';
    }
  } catch (error) {
    console.error('Error importing progress:', error);
    showNotification(`Error importing progress: ${error.message}`, 'error');
    
    // Reset file input
    const importFileInput = document.getElementById('importFileInput');
    if (importFileInput) {
      importFileInput.value = '';
    }
  }
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--bg-subtle)'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    font-size: 0.95rem;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  if (!document.querySelector('#notification-style')) {
    style.id = 'notification-style';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Initialize when DOM is ready
async function initialize() {
  try {
    await initDB();
    initGrid();
    initEventListeners();
    // Don't load spreadsheet here - wait for a project to be selected
    loadProjects();
    
    // Save data when page is about to unload
    window.addEventListener('beforeunload', () => {
      if (currentProject) {
        saveSpreadsheet(); // Save immediately (no debounce)
      }
    });
  } catch (error) {
    console.error('Initialization error:', error);
    // Continue without IndexedDB if it fails
    initGrid();
    initEventListeners();
    loadProjects();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM already loaded
  initialize();
}

