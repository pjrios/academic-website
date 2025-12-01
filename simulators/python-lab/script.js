// Tab Navigation
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Get simulator name from path for localStorage key
const getSimulatorName = () => {
  const path = window.location.pathname;
  const match = path.match(/simulators\/([^\/]+)/);
  return match ? match[1] : 'python-lab';
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
        // Remove active from all
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate saved tab
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
    
    // Load projects when Projects tab is opened
    if (targetTab === 'projects' && projectsList) {
      loadProjects();
    }
    
    // Load progress when Progress tab is opened
    if (targetTab === 'progress') {
      loadProgress();
    }
  });
});

// Restore tab state on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const restoredTab = restoreTabState();
    if (restoredTab === 'projects' && projectsList) {
      loadProjects();
    } else if (restoredTab === 'progress') {
      loadProgress();
    }
  });
} else {
  // DOM already loaded
  const restoredTab = restoreTabState();
  if (restoredTab === 'projects' && projectsList) {
    loadProjects();
  } else if (restoredTab === 'progress') {
    loadProgress();
  }
}

// ==================== INDEXEDDB SETUP ====================

const DB_NAME = 'PythonLabDB';
const DB_VERSION = 1;
const STORE_NAMES = {
  code: 'code',
  progress: 'progress',
  projects: 'projects'
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
      if (!db.objectStoreNames.contains(STORE_NAMES.code)) {
        db.createObjectStore(STORE_NAMES.code);
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.progress)) {
        db.createObjectStore(STORE_NAMES.progress);
      }
      if (!db.objectStoreNames.contains(STORE_NAMES.projects)) {
        db.createObjectStore(STORE_NAMES.projects);
      }
    };
  });
}

function saveToDB(storeName, key, data) {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function loadFromDB(storeName, key) {
  if (!db) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Initialize DB
initDB().catch(console.error);

// ==================== PYTHON INTERPRETER ====================

class PythonInterpreter {
  constructor() {
    this.variables = {};
    this.output = [];
    this.currentLine = 0;
  }

  reset() {
    this.variables = {};
    this.output = [];
    this.currentLine = 0;
  }

  validateSyntax(code) {
    const lines = code.split('\n');
    
    // Check for unmatched brackets, parentheses, braces
    let parenCount = 0, bracketCount = 0, braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Count brackets
      for (let char of line) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
        else if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
      }
      
      // Check for unmatched quotes (basic check)
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
        throw new SyntaxError(`SyntaxError: unterminated string literal at line ${i + 1}`);
      }
      
      // Check for missing colons after control structures
      if (trimmed.match(/^(def|if|elif|else|for|while|try|except|finally|class)\s/)) {
        if (!trimmed.includes(':') && !trimmed.endsWith(':')) {
          const keyword = trimmed.split(/\s+/)[0];
          throw new SyntaxError(`SyntaxError: expected ':' after '${keyword}' statement at line ${i + 1}`);
        }
      }
      
      // Check for invalid indentation patterns (mixing tabs and spaces)
      if (line.startsWith(' ') && line.includes('\t')) {
        throw new SyntaxError(`SyntaxError: inconsistent use of tabs and spaces in indentation at line ${i + 1}`);
      }
      
      // Check for invalid syntax patterns
      if (trimmed.match(/^else\s/)) {
        throw new SyntaxError(`SyntaxError: invalid syntax - 'else' without 'if' at line ${i + 1}`);
      }
      
      // Check for invalid assignments (e.g., 5 = x)
      const invalidAssign = trimmed.match(/^\d+\s*=/);
      if (invalidAssign) {
        throw new SyntaxError(`SyntaxError: cannot assign to literal at line ${i + 1}`);
      }
      
      // Check for incomplete statements
      if (trimmed.endsWith('\\') && i === lines.length - 1) {
        throw new SyntaxError(`SyntaxError: unexpected EOF while parsing`);
      }
    }
    
    // Check for unmatched brackets at the end
    if (parenCount !== 0) {
      throw new SyntaxError(`SyntaxError: unmatched '(' or ')'`);
    }
    if (bracketCount !== 0) {
      throw new SyntaxError(`SyntaxError: unmatched '[' or ']'`);
    }
    if (braceCount !== 0) {
      throw new SyntaxError(`SyntaxError: unmatched '{' or '}'`);
    }
  }
  
  getIndentLevel(line) {
    let indent = 0;
    for (let char of line) {
      if (char === ' ') indent++;
      else if (char === '\t') indent += 4; // Treat tab as 4 spaces
      else break;
    }
    return indent;
  }
  
  parseCode(code) {
    // First validate syntax
    this.validateSyntax(code);
    
    // Process each line, handling simple statements and control flow
    const allLines = code.split('\n');
    const lines = [];
    let hasFunction = false;
    let i = 0;
    
    while (i < allLines.length) {
      const line = allLines[i];
      const trimmed = line.trim();
      const indentLevel = this.getIndentLevel(line);
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }
      
      // Track function definitions
      if (trimmed.startsWith('def ')) {
        hasFunction = true;
        // Try to extract and test the function
        const funcMatch = trimmed.match(/def\s+(\w+)\s*\(([^)]*)\)/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const params = funcMatch[2].split(',').map(p => p.trim()).filter(p => p);
          
          // Look for return statement in the function body
          for (let j = i + 1; j < allLines.length; j++) {
            const bodyLine = allLines[j];
            if (bodyLine.trim() && !bodyLine.match(/^\s/)) break; // End of function
            
            if (bodyLine.trim().startsWith('return ')) {
              const returnExpr = bodyLine.trim().substring(7).trim();
              
              // Try to test with sample values
              if (params.length === 2) {
                try {
                  // Replace parameter names with test values
                  let testExpr = returnExpr;
                  testExpr = testExpr.replace(new RegExp(`\\b${params[0]}\\b`, 'g'), '5');
                  testExpr = testExpr.replace(new RegExp(`\\b${params[1]}\\b`, 'g'), '3');
                  
                  const result = this.evaluateExpression(testExpr);
                  this.output.push(`Function '${funcName}' test: ${funcName}(5, 3) = ${result}`);
                } catch (e) {
                  // Can't evaluate, skip
                }
              }
              break;
            }
          }
        }
        // Skip function body
        i++;
        while (i < allLines.length && (this.getIndentLevel(allLines[i]) > indentLevel || !allLines[i].trim())) {
          i++;
        }
        continue;
      }
      
      // Handle if statements
      if (trimmed.startsWith('if ')) {
        // First execute any pending lines (assignments) that came before this if
        for (const pendingLine of lines) {
          this.executeLine(pendingLine);
        }
        lines.length = 0; // Clear processed lines
        
        const condition = trimmed.substring(3).split(':')[0].trim();
        
        // Find if block (indented lines after if)
        const ifBlock = [];
        const elseBlock = [];
        let hasElse = false;
        let j = i + 1;
        const blockIndent = indentLevel + (allLines[i].match(/^(\s+)/) ? allLines[i].match(/^(\s+)/)[1].length : 0);
        
        // Collect if block
        while (j < allLines.length) {
          const nextLine = allLines[j];
          const nextIndent = this.getIndentLevel(nextLine);
          const nextTrimmed = nextLine.trim();
          
          // Check for else/elif
          if (nextIndent === indentLevel && (nextTrimmed.startsWith('else:') || nextTrimmed.startsWith('elif '))) {
            hasElse = nextTrimmed.startsWith('else:');
            j++;
            // Collect else block
            while (j < allLines.length) {
              const elseLine = allLines[j];
              const elseIndent = this.getIndentLevel(elseLine);
              const elseTrimmed = elseLine.trim();
              
              if (elseIndent <= indentLevel && elseTrimmed) break;
              if (elseTrimmed && !elseTrimmed.startsWith('#')) {
                elseBlock.push(elseLine);
              }
              j++;
            }
            break;
          }
          
          // End of if block
          if (nextIndent <= indentLevel && nextTrimmed && !nextTrimmed.startsWith('else:') && !nextTrimmed.startsWith('elif ')) {
            break;
          }
          
          if (nextIndent > indentLevel && nextTrimmed && !nextTrimmed.startsWith('#')) {
            ifBlock.push(nextLine);
          }
          j++;
        }
        
        // Evaluate condition and execute appropriate block
        try {
          const conditionResult = this.evaluateCondition(condition);
          if (conditionResult) {
            // Execute if block
            for (const blockLine of ifBlock) {
              this.executeLine(blockLine.trim());
            }
          } else if (hasElse && elseBlock.length > 0) {
            // Execute else block
            for (const blockLine of elseBlock) {
              this.executeLine(blockLine.trim());
            }
          }
        } catch (e) {
          this.output.push(`Error evaluating condition: ${e.message}`);
        }
        
        // Skip to after the if/else block
        i = j;
        continue;
      }
      
      // Handle while loops
      if (trimmed.startsWith('while ')) {
        // First execute any pending lines (assignments) that came before this while
        for (const pendingLine of lines) {
          this.executeLine(pendingLine);
        }
        lines.length = 0; // Clear processed lines
        
        const condition = trimmed.substring(6).split(':')[0].trim();
        
        // Find while block (indented lines after while)
        const whileBlock = [];
        let j = i + 1;
        const blockIndent = indentLevel + (allLines[i].match(/^(\s+)/) ? allLines[i].match(/^(\s+)/)[1].length : 0);
        
        // Collect while block
        while (j < allLines.length) {
          const nextLine = allLines[j];
          const nextIndent = this.getIndentLevel(nextLine);
          const nextTrimmed = nextLine.trim();
          
          // End of while block
          if (nextIndent <= indentLevel && nextTrimmed && !nextTrimmed.startsWith('else:') && !nextTrimmed.startsWith('elif ')) {
            break;
          }
          
          if (nextIndent > indentLevel && nextTrimmed && !nextTrimmed.startsWith('#')) {
            whileBlock.push(nextLine);
          }
          j++;
        }
        
        // Execute while loop (with safety limit to prevent infinite loops)
        let iterations = 0;
        const maxIterations = 1000; // Safety limit
        
        try {
          while (iterations < maxIterations) {
            const conditionResult = this.evaluateCondition(condition);
            if (!conditionResult) {
              break; // Condition is false, exit loop
            }
            
            // Execute while block
            for (const blockLine of whileBlock) {
              this.executeLine(blockLine.trim());
            }
            
            iterations++;
          }
          
          if (iterations >= maxIterations) {
            this.output.push(`Warning: Loop exceeded ${maxIterations} iterations and was stopped`);
          }
        } catch (e) {
          this.output.push(`Error in while loop: ${e.message}`);
        }
        
        // Skip to after the while block
        i = j;
        continue;
      }
      
      // Skip other control structures we don't execute yet
      if (trimmed.startsWith('for ') || 
          trimmed.startsWith('elif ') ||
          trimmed.startsWith('return ') ||
          trimmed.startsWith('class ')) {
        i++;
        continue;
      }
      
      // Skip standalone else (should have been handled with if)
      if (trimmed.startsWith('else:')) {
        i++;
        continue;
      }
      
      // Skip indented lines that are part of blocks we don't handle
      if (indentLevel > 0) {
        i++;
        continue;
      }
      
      // Process simple statements (assignments, print)
      lines.push(trimmed);
      i++;
    }
    
    // If code is valid but only contains function definitions with no output
    if (hasFunction && lines.length === 0 && this.output.length === 0) {
      this.output.push('Code is syntactically correct. Function definitions are valid but need to be called to produce output.');
    }
    
    return lines;
  }
  
  evaluateCondition(condition) {
    // Handle len() comparisons
    const lenMatch = condition.match(/len\((\w+)\)\s*(>|<|>=|<=|==|!=)\s*(\d+)/);
    if (lenMatch) {
      const varName = lenMatch[1];
      const operator = lenMatch[2];
      const value = parseInt(lenMatch[3]);
      
      if (!this.variables.hasOwnProperty(varName)) {
        const error = new Error(`NameError: name '${varName}' is not defined`);
        error.name = 'NameError';
        throw error;
      }
      
      const varValue = this.variables[varName];
      if (!Array.isArray(varValue) && typeof varValue !== 'string') {
        const error = new Error(`TypeError: object of type '${typeof varValue}' has no len()`);
        error.name = 'TypeError';
        throw error;
      }
      
      const len = varValue.length;
      
      switch (operator) {
        case '>': return len > value;
        case '<': return len < value;
        case '>=': return len >= value;
        case '<=': return len <= value;
        case '==': return len === value;
        case '!=': return len !== value;
        default: return false;
      }
    }
    
    // Handle simple comparisons with variables
    const simpleMatch = condition.match(/^(\w+)\s*(>|<|>=|<=|==|!=)\s*(\d+)$/);
    if (simpleMatch) {
      const varName = simpleMatch[1];
      const operator = simpleMatch[2];
      const value = parseInt(simpleMatch[3]);
      
      if (!this.variables.hasOwnProperty(varName)) {
        const error = new Error(`NameError: name '${varName}' is not defined`);
        error.name = 'NameError';
        throw error;
      }
      
      const varValue = this.variables[varName];
      if (typeof varValue !== 'number') {
        return false;
      }
      
      switch (operator) {
        case '>': return varValue > value;
        case '<': return varValue < value;
        case '>=': return varValue >= value;
        case '<=': return varValue <= value;
        case '==': return varValue === value;
        case '!=': return varValue !== value;
        default: return false;
      }
    }
    
    // Default: try to evaluate as boolean
    try {
      const result = this.evaluateExpression(condition);
      return Boolean(result);
    } catch (e) {
      throw new SyntaxError(`SyntaxError: invalid condition: ${condition}`);
    }
  }

  evaluateExpression(expr) {
    expr = expr.trim();
    
    // Check for empty expression
    if (!expr) {
      throw new SyntaxError('SyntaxError: invalid syntax');
    }
    
    // String literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }
    
    // Check for unterminated strings
    if ((expr.startsWith('"') && !expr.endsWith('"')) || (expr.startsWith("'") && !expr.endsWith("'"))) {
      throw new SyntaxError('SyntaxError: unterminated string literal');
    }
    
    // Numbers
    if (/^-?\d+$/.test(expr)) {
      return parseInt(expr);
    }
    if (/^-?\d+\.\d+$/.test(expr)) {
      return parseFloat(expr);
    }
    
    // Boolean
    if (expr === 'True') return true;
    if (expr === 'False') return false;
    if (expr === 'None') return null;
    
    // List indexing (e.g., numbers[5])
    const indexMatch = expr.match(/^(\w+)\[(\d+)\]$/);
    if (indexMatch) {
      const varName = indexMatch[1];
      const index = parseInt(indexMatch[2]);
      if (this.variables.hasOwnProperty(varName)) {
        const arr = this.variables[varName];
        if (Array.isArray(arr)) {
          if (index >= 0 && index < arr.length) {
            return arr[index];
          } else {
            const error = new Error(`IndexError: list index ${index} out of range`);
            error.name = 'IndexError';
            throw error;
          }
        } else {
          const error = new Error(`TypeError: '${typeof arr}' object is not subscriptable`);
          error.name = 'TypeError';
          throw error;
        }
      } else {
        const error = new Error(`NameError: name '${varName}' is not defined`);
        error.name = 'NameError';
        throw error;
      }
    }
    
    // Variables (check last to avoid conflicts)
    if (this.variables.hasOwnProperty(expr)) {
      return this.variables[expr];
    }
    
    // Check if it looks like a variable name but isn't defined
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expr)) {
      const error = new Error(`NameError: name '${expr}' is not defined`);
      error.name = 'NameError';
      throw error;
    }
    
    // List literals
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const content = expr.slice(1, -1).trim();
      if (!content) return [];
      const items = content.split(',').map(item => this.evaluateExpression(item.trim()));
      return items;
    }
    
    // Dictionary literals
    if (expr.startsWith('{') && expr.endsWith('}')) {
      const content = expr.slice(1, -1).trim();
      if (!content) return {};
      const obj = {};
      const pairs = content.split(',').map(p => p.trim());
      pairs.forEach(pair => {
        const [key, value] = pair.split(':').map(s => s.trim());
        obj[this.evaluateExpression(key)] = this.evaluateExpression(value);
      });
      return obj;
    }
    
    // f-strings
    if (expr.startsWith('f"') || expr.startsWith("f'")) {
      let str = expr.slice(2, -1);
      str = str.replace(/\{([^}]+)\}/g, (match, varName) => {
        const val = this.variables[varName.trim()];
        return val !== undefined ? String(val) : match;
      });
      return str;
    }
    
    // Arithmetic operations
    if (expr.includes('+')) {
      const [left, right] = expr.split('+').map(s => s.trim());
      return this.evaluateExpression(left) + this.evaluateExpression(right);
    }
    if (expr.includes('-') && !expr.startsWith('-')) {
      const [left, right] = expr.split('-').map(s => s.trim());
      return this.evaluateExpression(left) - this.evaluateExpression(right);
    }
    if (expr.includes('*')) {
      const [left, right] = expr.split('*').map(s => s.trim());
      return this.evaluateExpression(left) * this.evaluateExpression(right);
    }
    if (expr.includes('/')) {
      const [left, right] = expr.split('/').map(s => s.trim());
      return this.evaluateExpression(left) / this.evaluateExpression(right);
    }
    
    return expr;
  }

  executeLine(line) {
    try {
      // Augmented assignment (e.g., count += 1)
      const augAssignMatch = line.match(/^(\w+)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
      if (augAssignMatch) {
        const varName = augAssignMatch[1];
        const operator = augAssignMatch[2];
        const valueExpr = augAssignMatch[3].trim();
        
        if (!this.variables.hasOwnProperty(varName)) {
          const error = new Error(`NameError: name '${varName}' is not defined`);
          error.name = 'NameError';
          throw error;
        }
        
        const currentValue = this.variables[varName];
        const incrementValue = this.evaluateExpression(valueExpr);
        
        if (typeof currentValue !== 'number' || typeof incrementValue !== 'number') {
          const error = new Error(`TypeError: unsupported operand type(s) for ${operator}: '${typeof currentValue}' and '${typeof incrementValue}'`);
          error.name = 'TypeError';
          throw error;
        }
        
        switch (operator) {
          case '+=':
            this.variables[varName] = currentValue + incrementValue;
            break;
          case '-=':
            this.variables[varName] = currentValue - incrementValue;
            break;
          case '*=':
            this.variables[varName] = currentValue * incrementValue;
            break;
          case '/=':
            this.variables[varName] = currentValue / incrementValue;
            break;
          case '%=':
            this.variables[varName] = currentValue % incrementValue;
            break;
        }
        return;
      }
      
      // Assignment
      if (line.includes('=')) {
        const parts = line.split('=');
        if (parts.length !== 2) {
          throw new SyntaxError(`SyntaxError: invalid syntax`);
        }
        const varName = parts[0].trim();
        const value = parts[1].trim();
        
        // Validate variable name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          throw new SyntaxError(`SyntaxError: invalid variable name '${varName}'`);
        }
        
        if (!value) {
          throw new SyntaxError(`SyntaxError: invalid syntax`);
        }
        
        this.variables[varName] = this.evaluateExpression(value);
        return;
      }
      
      // Print statement
      if (line.startsWith('print(') && line.endsWith(')')) {
        const content = line.slice(6, -1);
        try {
        const value = this.evaluateExpression(content);
        this.output.push(String(value));
        } catch (e) {
          // Preserve error type
          if (e instanceof SyntaxError) {
            this.output.push(`SyntaxError: ${e.message}`);
          } else if (e instanceof NameError) {
            this.output.push(`NameError: ${e.message}`);
          } else if (e instanceof TypeError) {
            this.output.push(`TypeError: ${e.message}`);
          } else {
            this.output.push(`Error: ${e.message}`);
          }
        }
        return;
      }
      
      // If statement (simplified)
      if (line.startsWith('if ')) {
        // Basic if handling
        return;
      }
      
      // For loop (simplified)
      if (line.startsWith('for ')) {
        // Basic for loop handling
        return;
      }
      
      // While loop (simplified)
      if (line.startsWith('while ')) {
        // Basic while loop handling
        return;
      }
      
      // Function definition (simplified)
      if (line.startsWith('def ')) {
        // Basic function handling
        return;
      }
      
      // Unknown statement
      if (line.trim()) {
        throw new SyntaxError(`SyntaxError: invalid syntax`);
      }
      
    } catch (error) {
      // Preserve error type and message
      if (error instanceof SyntaxError) {
        this.output.push(`SyntaxError: ${error.message}`);
      } else if (error instanceof NameError) {
        this.output.push(`NameError: ${error.message}`);
      } else if (error instanceof TypeError) {
        this.output.push(`TypeError: ${error.message}`);
      } else {
      this.output.push(`Error: ${error.message}`);
      }
    }
  }

  run(code) {
    this.reset();
    
    try {
    const lines = this.parseCode(code);
    
    lines.forEach(line => {
      this.currentLine++;
      this.executeLine(line);
    });
    } catch (error) {
      // If there's a syntax error, add it to output
      if (error instanceof SyntaxError) {
        this.output.push(`SyntaxError: ${error.message}`);
      } else {
        this.output.push(`Error: ${error.message}`);
      }
    }
    
    return {
      output: this.output,
      variables: { ...this.variables }
    };
  }
}

const interpreter = new PythonInterpreter();

// Interpreter Tab Elements
const pythonCode = document.getElementById('pythonCode');
const runCodeBtn = document.getElementById('runCodeBtn');
const clearCodeBtn = document.getElementById('clearCodeBtn');
const loadExampleSelect = document.getElementById('loadExampleSelect');
const saveCodeBtn = document.getElementById('saveCodeBtn');
const outputDisplay = document.getElementById('outputDisplay');
const variablesDisplay = document.getElementById('variablesDisplay');
const clearOutputBtn = document.getElementById('clearOutputBtn');

function displayOutput(result) {
  outputDisplay.innerHTML = result.output.map(line => 
    `<div class="output-line">${escapeHtml(line)}</div>`
  ).join('');
  
  variablesDisplay.innerHTML = Object.entries(result.variables).map(([name, value]) => 
    `<div class="variable-item">
      <span class="variable-name">${escapeHtml(name)}</span>
      <span class="variable-value">${formatValue(value)}</span>
    </div>`
  ).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{${Object.entries(value).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')}}`;
  }
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return String(value);
}

runCodeBtn.addEventListener('click', () => {
  const code = pythonCode.value;
  if (!code.trim()) return;
  
  const result = interpreter.run(code);
  displayOutput(result);
  saveToDB(STORE_NAMES.code, 'interpreter', code);
  
  // Check if code matches any example to track example usage
  let exampleUsed = null;
  for (const [key, exampleCode] of Object.entries(pythonExamples)) {
    if (code.trim() === exampleCode.trim()) {
      exampleUsed = key;
      break;
    }
  }
  
  // Track interpreter execution for progress report
  trackInterpreterExecution(code, result.output, result.variables, exampleUsed);
});

clearCodeBtn.addEventListener('click', () => {
  pythonCode.value = '';
  outputDisplay.innerHTML = '';
  variablesDisplay.innerHTML = '';
});

// Python code examples
const pythonExamples = {
  'basic': `# Basic Python Example
name = "Python"
age = 30
numbers = [1, 2, 3, 4, 5]
print(f"Hello, {name}!")
print(f"Age: {age}")
print(f"Numbers: {numbers}")
total = sum(numbers)
print(f"Sum: {total}")`,

  'variables': `# Variables and Data Types
# String
name = "Alice"
print(f"Name: {name}")

# Numbers
age = 25
height = 5.6
print(f"Age: {age}, Height: {height}")

# Boolean
is_student = True
print(f"Is student: {is_student}")

# List
fruits = ["apple", "banana", "orange"]
print(f"Fruits: {fruits}")`,

  'lists': `# Lists and Loops
numbers = [1, 2, 3, 4, 5]

# For loop
print("Numbers:")
for num in numbers:
    print(f"  {num}")

# List operations
squared = [x ** 2 for x in numbers]
print(f"Squared: {squared}")

# Sum
total = sum(numbers)
print(f"Sum: {total}")

# Max and min
print(f"Max: {max(numbers)}, Min: {min(numbers)}")`,

  'functions': `# Functions
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

# Call functions
print(greet("World"))
print(f"5 + 3 = {add(5, 3)}")
print(f"5 * 3 = {multiply(5, 3)}")

# Function with default parameter
def power(base, exponent=2):
    return base ** exponent

print(f"2^3 = {power(2, 3)}")
print(f"5^2 = {power(5)}")`,

  'conditionals': `# Conditionals
age = 20

if age < 18:
    print("You are a minor")
elif age < 65:
    print("You are an adult")
else:
    print("You are a senior")

# Multiple conditions
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Score: {score}, Grade: {grade}")

# Ternary-like expression
status = "adult" if age >= 18 else "minor"
print(f"Status: {status}")`,

  'dictionaries': `# Dictionaries
# Create dictionary
student = {
    "name": "Alice",
    "age": 20,
    "grades": [85, 90, 88]
}

print(f"Student: {student['name']}")
print(f"Age: {student['age']}")
print(f"Grades: {student['grades']}")

# Add new key
student["major"] = "Computer Science"
print(f"Major: {student['major']}")

# Iterate over dictionary
print("\\nAll info:")
for key, value in student.items():
    print(f"  {key}: {value}")`,

  'list-comprehension': `# List Comprehensions
# Basic comprehension
numbers = [1, 2, 3, 4, 5]
squared = [x ** 2 for x in numbers]
print(f"Squared: {squared}")

# With condition
evens = [x for x in numbers if x % 2 == 0]
print(f"Even numbers: {evens}")

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(f"Matrix: {matrix}")

# String operations
words = ["hello", "world", "python"]
uppercase = [word.upper() for word in words]
print(f"Uppercase: {uppercase}")`,

  'string-operations': `# String Operations
text = "Hello, Python World!"

# Basic operations
print(f"Original: {text}")
print(f"Upper: {text.upper()}")
print(f"Lower: {text.lower()}")
print(f"Length: {len(text)}")

# String methods
print(f"Starts with 'Hello': {text.startswith('Hello')}")
print(f"Ends with '!': {text.endswith('!')}")
print(f"Replace: {text.replace('World', 'Universe')}")

# Split and join
words = text.split()
print(f"Words: {words}")
joined = "-".join(words)
print(f"Joined: {joined}")

# Slicing
print(f"First 5 chars: {text[:5]}")
print(f"Last 5 chars: {text[-5:]}")`,

  'file-operations': `# File Operations (simulated)
# Note: In this interpreter, file operations are simulated

# Simulated file content
file_content = """Line 1: Hello
Line 2: World
Line 3: Python"""

# Split into lines
lines = file_content.split("\\n")
print("File lines:")
for i, line in enumerate(lines, 1):
    print(f"  {i}: {line}")

# Count lines
print(f"\\nTotal lines: {len(lines)}")

# Search in content
if "Python" in file_content:
    print("Found 'Python' in file")`,

  'classes': `# Classes and Objects
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name} and I'm {self.age} years old"
    
    def have_birthday(self):
        self.age += 1
        return f"Happy birthday! Now I'm {self.age}"

# Create objects
person1 = Person("Alice", 25)
person2 = Person("Bob", 30)

print(person1.greet())
print(person2.greet())
print(person1.have_birthday())
print(person1.greet())`
};

loadExampleSelect.addEventListener('change', (e) => {
  const exampleKey = e.target.value;
  if (exampleKey && pythonExamples[exampleKey]) {
    pythonCode.value = pythonExamples[exampleKey];
    // Track that example was loaded (will be tracked when run is clicked)
    // Reset dropdown to show placeholder
    e.target.value = '';
  }
});

saveCodeBtn.addEventListener('click', () => {
  saveToDB(STORE_NAMES.code, 'interpreter', pythonCode.value);
  showNotification('Code saved!', 'success');
});

clearOutputBtn.addEventListener('click', () => {
  outputDisplay.innerHTML = '';
  variablesDisplay.innerHTML = '';
});

// Load saved code
loadFromDB(STORE_NAMES.code, 'interpreter').then(code => {
  if (code) pythonCode.value = code;
});

// ==================== VISUALIZER TAB ====================

const visualizerType = document.getElementById('visualizerType');
const visualizerInput = document.getElementById('visualizerInput');
const visualizeBtn = document.getElementById('visualizeBtn');
const resetVisualizerBtn = document.getElementById('resetVisualizerBtn');
const visualizationCanvas = document.getElementById('visualizationCanvas');
const visualizerInfo = document.getElementById('visualizerInfo');
const operationButtons = document.getElementById('operationButtons');
const operationResult = document.getElementById('operationResult');

// Example inputs for each type
const exampleInputs = {
  list: 'numbers = [1, 2, 3, 4, 5]',
  string: 'message = "Hello, Python!"',
  dict: 'personal_info = {"name": "Alice", "age": 25, "city": "NYC"}'
};

// Additional examples for variety
const exampleSets = {
  list: [
    '[1, 2, 3, 4, 5]',
    '["apple", "banana", "orange"]',
    '[10, 20, 30, 40, 50]',
    '[true, false, true]'
  ],
  string: [
    '"Hello, Python!"',
    '"Python Programming"',
    '"12345"',
    '"ABCDEFG"'
  ],
  dict: [
    '{"name": "Alice", "age": 25, "city": "NYC"}',
    '{"apple": 5, "banana": 3, "orange": 8}',
    '{"x": 10, "y": 20, "z": 30}'
  ]
};

function parseVisualizerInput(input, type) {
  try {
    let variableName = null;
    let dataString = input.trim();
    
    // Check if input has a variable assignment pattern (e.g., "name = {...}" or "name={...}")
    const assignmentMatch = dataString.match(/^(\w+)\s*=\s*(.+)$/);
    if (assignmentMatch) {
      variableName = assignmentMatch[1];
      dataString = assignmentMatch[2].trim();
    }
    
    if (type === 'list') {
      const list = JSON.parse(dataString);
      return {
        name: variableName,
        data: Array.isArray(list) ? list : null
      };
    }
    if (type === 'string') {
      const str = dataString.startsWith('"') || dataString.startsWith("'") ? dataString.slice(1, -1) : dataString;
      return {
        name: variableName,
        data: str
      };
    }
    if (type === 'dict') {
      const dict = JSON.parse(dataString);
      return {
        name: variableName,
        data: typeof dict === 'object' && !Array.isArray(dict) ? dict : null
      };
    }
  } catch (e) {
    return null;
  }
}

function renderVisualization(parsedData, type) {
  visualizationCanvas.innerHTML = '';
  visualizerInfo.innerHTML = '';
  operationResult.innerHTML = '';
  
  if (!parsedData || !parsedData.data) {
    return;
  }
  
  const data = parsedData.data;
  const variableName = parsedData.name || 'variable';
  
  if (type === 'list' || type === 'string') {
    const items = type === 'list' ? data : data.split('');
    
    // Create info display
    visualizerInfo.innerHTML = `
      <div class="info-card">
        <strong>Variable:</strong> ${variableName}<br>
        <strong>Type:</strong> ${type === 'list' ? 'List' : 'String'}<br>
        <strong>Length:</strong> ${items.length}<br>
        ${type === 'list' ? `<strong>Sum:</strong> ${items.reduce((a, b) => a + b, 0)}` : ''}
      </div>
    `;
    
    items.forEach((item, index) => {
      const element = document.createElement('div');
      element.className = 'visual-element';
      element.textContent = typeof item === 'string' ? (item.length > 10 ? item.substring(0, 10) + '...' : item) : item;
      element.dataset.index = index;
      element.dataset.value = item;
      element.title = `Index: ${index}, Value: ${item}`;
      
      const indexLabel = document.createElement('div');
      indexLabel.className = 'visual-index-label';
      indexLabel.textContent = `[${index}]`;
      element.appendChild(indexLabel);
      
      // Add hover effect
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.1)';
        element.style.zIndex = '10';
      });
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
        element.style.zIndex = '1';
      });
      
      visualizationCanvas.appendChild(element);
    });
  } else if (type === 'dict') {
    const entries = Object.entries(data);
    
    // Create info display
    visualizerInfo.innerHTML = `
      <div class="info-card">
        <strong>Variable:</strong> ${variableName}<br>
        <strong>Type:</strong> Dictionary (Single Entity)<br>
        <strong>Properties:</strong> ${entries.length}<br>
        <strong>Keys:</strong> ${Object.keys(data).join(', ')}
      </div>
    `;
    
    // Create a container for the dictionary entity
    const entityContainer = document.createElement('div');
    entityContainer.className = 'dict-entity-container';
    
    // Add entity label with variable name
    const entityLabel = document.createElement('div');
    entityLabel.className = 'dict-entity-label';
    entityLabel.innerHTML = `<span class="var-name">${variableName}</span>`;
    entityContainer.appendChild(entityLabel);
    
    // Create inner container for properties
    const propertiesContainer = document.createElement('div');
    propertiesContainer.className = 'dict-properties-container';
    
    entries.forEach(([key, value]) => {
      const propertyElement = document.createElement('div');
      propertyElement.className = 'dict-property';
      propertyElement.innerHTML = `
        <div class="dict-key">${escapeHtml(key)}</div>
        <div class="dict-arrow">→</div>
        <div class="dict-value">${escapeHtml(String(value))}</div>
      `;
      propertyElement.dataset.key = key;
      propertyElement.dataset.value = value;
      propertyElement.title = `Property: ${key} = ${value}`;
      
      propertiesContainer.appendChild(propertyElement);
    });
    
    entityContainer.appendChild(propertiesContainer);
    visualizationCanvas.appendChild(entityContainer);
  }
  
  updateOperationButtons(data, type);
}

function updateOperationButtons(data, type) {
  operationButtons.innerHTML = '';
  
  // Get current parsed data to preserve variable name
  const currentInput = visualizerInput.value.trim();
  const assignmentMatch = currentInput.match(/^(\w+)\s*=\s*(.+)$/);
  const variableName = assignmentMatch ? assignmentMatch[1] : 'variable';
  
  const operations = {
    list: [
      { name: 'len()', action: () => highlightResult(data.length) },
      { name: 'sum()', action: () => highlightResult(data.reduce((a, b) => a + b, 0)) },
      { name: 'max()', action: () => highlightResult(Math.max(...data)) },
      { name: 'min()', action: () => highlightResult(Math.min(...data)) },
      { name: 'reverse()', action: () => {
        const parsed = { name: variableName, data: [...data].reverse() };
        renderVisualization(parsed, 'list');
      }},
      { name: 'sort()', action: () => {
        const parsed = { name: variableName, data: [...data].sort((a, b) => a - b) };
        renderVisualization(parsed, 'list');
      }}
    ],
    string: [
      { name: 'len()', action: () => highlightResult(data.length) },
      { name: 'upper()', action: () => {
        const parsed = { name: variableName, data: data.toUpperCase() };
        renderVisualization(parsed, 'string');
      }},
      { name: 'lower()', action: () => {
        const parsed = { name: variableName, data: data.toLowerCase() };
        renderVisualization(parsed, 'string');
      }},
      { name: 'reverse', action: () => {
        const parsed = { name: variableName, data: [...data].reverse().join('') };
        renderVisualization(parsed, 'string');
      }},
      { name: 'split()', action: () => {
        const separator = prompt('Enter separator (or leave empty for whitespace):', ' ');
        const result = separator === null ? null : (separator === '' ? data.split() : data.split(separator));
        if (result !== null) {
          highlightResult(JSON.stringify(result));
        }
      }},
      { name: 'split(",")', action: () => highlightResult(JSON.stringify(data.split(','))) },
      { name: 'split("-")', action: () => highlightResult(JSON.stringify(data.split('-'))) },
      { name: 'split(" ")', action: () => highlightResult(JSON.stringify(data.split(' '))) }
    ],
    dict: [
      { name: 'keys()', action: () => highlightResult(JSON.stringify(Object.keys(data))) },
      { name: 'values()', action: () => highlightResult(JSON.stringify(Object.values(data))) },
      { name: 'items()', action: () => highlightResult(JSON.stringify(Object.entries(data))) }
    ]
  };
  
  (operations[type] || []).forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'operation-btn';
    btn.textContent = op.name;
    btn.addEventListener('click', op.action);
    operationButtons.appendChild(btn);
  });
}

let lastVisualizerData = null;
let lastVisualizerType = null;
let visualizerOperations = [];

function highlightResult(result) {
  operationResult.innerHTML = `
    <div class="result-display success">
      <strong>Result:</strong> ${escapeHtml(String(result))}
    </div>
  `;
  
  // Track operation
  if (lastVisualizerData && lastVisualizerType) {
    const operationName = event?.target?.textContent || 'operation';
    if (!visualizerOperations.includes(operationName)) {
      visualizerOperations.push(operationName);
    }
  }
  
  // Auto-clear after 5 seconds
  setTimeout(() => {
    operationResult.innerHTML = '';
  }, 5000);
}

// Update input when type changes
visualizerType.addEventListener('change', () => {
  const type = visualizerType.value;
  visualizerInput.value = exampleInputs[type];
  visualizationCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Click "Visualize" to see the structure</p>';
  visualizerInfo.innerHTML = '';
  operationButtons.innerHTML = '';
  operationResult.innerHTML = '';
});

visualizeBtn.addEventListener('click', () => {
  const type = visualizerType.value;
  const input = visualizerInput.value;
  const parsedData = parseVisualizerInput(input, type);
  
  if (!parsedData || parsedData.data === null) {
    visualizationCanvas.innerHTML = '<p style="color: var(--danger); padding: 20px; text-align: center;">❌ Invalid input! Please check your syntax.</p>';
    visualizerInfo.innerHTML = '';
    return;
  }
  
  renderVisualization(parsedData, type);
  
  // Track visualizer activity - will track operations separately when buttons are clicked
  trackVisualizerActivity(type, parsedData.data, [], input);
});

resetVisualizerBtn.addEventListener('click', () => {
  const type = visualizerType.value;
  visualizerInput.value = exampleInputs[type];
  visualizationCanvas.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 40px;">Select a data type and click "Visualize" to see the structure</p>';
  visualizerInfo.innerHTML = '';
  operationButtons.innerHTML = '';
  operationResult.innerHTML = '';
});

// ==================== LOOPS TAB ====================

const loopType = document.getElementById('loopType');
const loopCode = document.getElementById('loopCode');
const playLoopBtn = document.getElementById('playLoopBtn');
const pauseLoopBtn = document.getElementById('pauseLoopBtn');
const stepLoopBtn = document.getElementById('stepLoopBtn');
const resetLoopBtn = document.getElementById('resetLoopBtn');
const loopSpeed = document.getElementById('loopSpeed');
const loopVisualization = document.getElementById('loopVisualization');
const loopOutput = document.getElementById('loopOutput');

const loopExamples = {
  'for-range': {
    code: `for i in range(5):
    print(f"Number: {i}")`,
    steps: Array.from({ length: 5 }, (_, i) => ({
      iteration: i,
      code: `i = ${i}`,
      output: `Number: ${i}`
    }))
  },
  'for-list': {
    code: `fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)`,
    steps: [
      { iteration: 0, code: 'fruit = "apple"', output: 'apple' },
      { iteration: 1, code: 'fruit = "banana"', output: 'banana' },
      { iteration: 2, code: 'fruit = "cherry"', output: 'cherry' }
    ]
  },
  'while': {
    code: `count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1`,
    steps: [
      { iteration: 0, code: 'count = 0, condition: count < 3 (True)', output: 'Count: 0' },
      { iteration: 1, code: 'count = 1, condition: count < 3 (True)', output: 'Count: 1' },
      { iteration: 2, code: 'count = 2, condition: count < 3 (True)', output: 'Count: 2' },
      { iteration: 3, code: 'count = 3, condition: count < 3 (False) - Exit loop', output: '' }
    ]
  },
  'nested': {
    code: `for i in range(2):
    for j in range(3):
        print(f"({i}, {j})")`,
    steps: [
      { iteration: 0, code: 'i = 0, j = 0', output: '(0, 0)' },
      { iteration: 1, code: 'i = 0, j = 1', output: '(0, 1)' },
      { iteration: 2, code: 'i = 0, j = 2', output: '(0, 2)' },
      { iteration: 3, code: 'i = 1, j = 0', output: '(1, 0)' },
      { iteration: 4, code: 'i = 1, j = 1', output: '(1, 1)' },
      { iteration: 5, code: 'i = 1, j = 2', output: '(1, 2)' }
    ]
  }
};

let currentLoopStep = 0;
let loopInterval = null;
let currentLoopData = null;

function parseLoopCode(code) {
  // Parse the user's code and generate visualization steps
  const lines = code.split('\n').map(l => l.trim()).filter(l => l);
  const steps = [];
  
  // Extract variable assignments before the loop (e.g., fruits = [...])
  const varAssignments = {};
  const assignmentMatches = code.matchAll(/(\w+)\s*=\s*\[(.*?)\]/g);
  for (const match of assignmentMatches) {
    const varName = match[1];
    const listStr = match[2];
    const items = listStr.split(',').map(s => {
      s = s.trim();
      // Remove quotes but preserve the value
      return s.replace(/^['"]|['"]$/g, '');
    });
    varAssignments[varName] = items;
  }
  
  // Try to detect loop type and parse it
  // For range loops: for i in range(n):
  const rangeMatch = code.match(/for\s+(\w+)\s+in\s+range\((\d+)\)/);
  if (rangeMatch) {
    const varName = rangeMatch[1];
    const count = parseInt(rangeMatch[2]);
    for (let i = 0; i < count; i++) {
      steps.push({
        iteration: i,
        code: `${varName} = ${i}`,
        output: executeLoopCode(code, { [varName]: i })
      });
    }
    return steps;
  }
  
  // For list loops: for item in [list]:
  const listMatch = code.match(/for\s+(\w+)\s+in\s+\[(.*?)\]/);
  if (listMatch) {
    const varName = listMatch[1];
    const listStr = listMatch[2];
    const items = listStr.split(',').map(s => {
      s = s.trim();
      return s.replace(/^['"]|['"]$/g, '');
    });
    items.forEach((item, i) => {
      steps.push({
        iteration: i,
        code: `${varName} = "${item}"`,
        output: executeLoopCode(code, { [varName]: item })
      });
    });
    return steps;
  }
  
  // For variable list loops: for item in variable_name
  const varListMatch = code.match(/for\s+(\w+)\s+in\s+(\w+)/);
  if (varListMatch) {
    const loopVar = varListMatch[1];
    const listVar = varListMatch[2];
    if (varAssignments[listVar]) {
      const items = varAssignments[listVar];
      items.forEach((item, i) => {
        steps.push({
          iteration: i,
          code: `${loopVar} = "${item}"`,
          output: executeLoopCode(code, { [loopVar]: item, [listVar]: items })
        });
      });
      return steps;
    }
  }
  
  // While loops
  if (code.includes('while')) {
    // Parse while loop - would need more complex parsing
    return [];
  }
  
  return steps;
}

function executeLoopCode(code, vars) {
  // Simple execution to get output for one iteration
  // Create a mock print function
  const outputs = [];
  const mockPrint = (...args) => {
    outputs.push(args.join(' '));
  };
  
  // Try to extract the print statement
  const printMatch = code.match(/print\s*\(([^)]+)\)/);
  if (printMatch) {
    try {
      const printExpr = printMatch[1];
      // Replace variables
      let result = printExpr;
      Object.keys(vars).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        if (typeof vars[varName] === 'string') {
          result = result.replace(regex, `"${vars[varName]}"`);
        } else {
          result = result.replace(regex, vars[varName]);
        }
      });
      // Evaluate f-strings
      result = result.replace(/f?"([^"]*)\{([^}]+)\}([^"]*)"?/g, (match, before, expr, after) => {
        try {
          // Simple evaluation - replace variables
          let evalExpr = expr;
          Object.keys(vars).forEach(varName => {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            evalExpr = evalExpr.replace(regex, typeof vars[varName] === 'string' ? `"${vars[varName]}"` : vars[varName]);
          });
          const value = Function(`"use strict"; return (${evalExpr})`)();
          return before + value + after;
        } catch (e) {
          return match;
        }
      });
      // Remove quotes if result is a string literal
      if (result.startsWith('"') && result.endsWith('"')) {
        return result.slice(1, -1);
      }
      return result;
    } catch (e) {
      return '';
    }
  }
  return outputs.join('\n') || '';
}

function loadLoopExample(type) {
  const example = loopExamples[type];
  if (!example) return;
  
  currentLoopData = example;
  currentLoopStep = 0;
  loopCode.value = example.code;
  // Parse the loaded example code
  currentLoopData.steps = parseLoopCode(example.code);
  renderLoopStep();
}

function updateLoopFromCode() {
  const code = loopCode.value;
  if (!code.trim()) return;
  
  const steps = parseLoopCode(code);
  currentLoopData = {
    code: code,
    steps: steps
  };
  currentLoopStep = 0;
  renderLoopStep();
}

function renderLoopStep() {
  if (!currentLoopData || currentLoopStep >= currentLoopData.steps.length) {
    return;
  }
  
  const step = currentLoopData.steps[currentLoopStep];
  
  loopVisualization.innerHTML = currentLoopData.steps.map((s, i) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = `loop-step ${i === currentLoopStep ? 'current' : i < currentLoopStep ? 'completed' : ''}`;
    stepDiv.innerHTML = `<strong>Iteration ${s.iteration}:</strong> ${s.code}`;
    return stepDiv.outerHTML;
  }).join('');
  
  loopOutput.textContent = currentLoopData.steps.slice(0, currentLoopStep + 1)
    .filter(s => s.output)
    .map(s => s.output)
    .join('\n');
}

function playLoop() {
  if (loopInterval) return;
  
  const speed = parseInt(loopSpeed.value);
  const delay = 1100 - (speed * 100);
  
  loopInterval = setInterval(() => {
    currentLoopStep++;
    if (currentLoopStep >= currentLoopData.steps.length) {
      pauseLoop();
      return;
    }
    renderLoopStep();
  }, delay);
}

function pauseLoop() {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
}

function stepLoop() {
  pauseLoop();
  currentLoopStep++;
  if (currentLoopStep >= currentLoopData.steps.length) {
    currentLoopStep = currentLoopData.steps.length - 1;
  }
  renderLoopStep();
}

function resetLoop() {
  pauseLoop();
  currentLoopStep = 0;
  renderLoopStep();
}

loopType.addEventListener('change', (e) => {
  loadLoopExample(e.target.value);
});

// Update visualization when code changes
loopCode.addEventListener('input', () => {
  // Optionally auto-update, or just update when buttons are clicked
});

playLoopBtn.addEventListener('click', () => {
  updateLoopFromCode();
  playLoop();
});

pauseLoopBtn.addEventListener('click', pauseLoop);

stepLoopBtn.addEventListener('click', () => {
  if (!currentLoopData) {
    updateLoopFromCode();
  }
  stepLoop();
});

resetLoopBtn.addEventListener('click', () => {
  updateLoopFromCode();
  resetLoop();
});

loadLoopExample('for-range');

// ==================== EVENTS TAB ====================

const eventType = document.getElementById('eventType');
const flowDiagram = document.getElementById('flowDiagram');
const eventCode = document.getElementById('eventCode');
const triggerEventBtn = document.getElementById('triggerEventBtn');
const eventOutput = document.getElementById('eventOutput');

const eventExamples = {
  'button-click': {
    flow: ['User clicks button', 'Event triggered', 'Handler function called', 'Code executes', 'Output displayed'],
    code: `def on_button_click():
    print("Button was clicked!")
    print("Executing action...")
    return "Action completed"`,
    handler: () => {
      eventOutput.innerHTML = 'Button was clicked!\nExecuting action...\nAction completed';
    }
  },
  'key-press': {
    flow: ['User presses key', 'Key event detected', 'Handler checks key', 'Action performed', 'Result returned'],
    code: `def on_key_press(key):
    if key == "Enter":
        print("Enter key pressed!")
        return "Submitted"
    return "Other key"`,
    handler: () => {
      eventOutput.innerHTML = 'Enter key pressed!\nSubmitted';
    }
  },
  'timer': {
    flow: ['Timer starts', 'Time elapses', 'Timer event fired', 'Handler executes', 'Timer resets'],
    code: `def on_timer():
    print("Timer tick!")
    print("Updating display...")
    return "Updated"`,
    handler: () => {
      eventOutput.innerHTML = 'Timer tick!\nUpdating display...\nUpdated';
    }
  },
  'user-input': {
    flow: ['User enters input', 'Input validated', 'Event triggered', 'Handler processes', 'Response sent'],
    code: `def on_user_input(text):
    print(f"Received: {text}")
    if len(text) > 0:
        return "Valid input"
    return "Empty input"`,
    handler: () => {
      eventOutput.innerHTML = 'Received: Hello\nValid input';
    }
  }
};

function renderFlowDiagram(flow) {
  flowDiagram.innerHTML = flow.map((step, index) => {
    const node = document.createElement('div');
    node.className = 'flow-node';
    node.textContent = step;
    node.dataset.step = index;
    return node.outerHTML;
  }).join('');
}

let flowAnimationTimeouts = [];

function resetFlowAnimation() {
  // Clear all pending timeouts
  flowAnimationTimeouts.forEach(timeout => clearTimeout(timeout));
  flowAnimationTimeouts = [];
  
  // Reset all nodes
  const nodes = flowDiagram.querySelectorAll('.flow-node');
  nodes.forEach(node => {
    node.classList.remove('active', 'completed');
  });
  
  // Reset scroll to top
  flowDiagram.scrollTo({ top: 0, behavior: 'smooth' });
}

function animateFlow(flow) {
  // Reset any existing animation first
  resetFlowAnimation();
  
  const nodes = flowDiagram.querySelectorAll('.flow-node');
  nodes.forEach((node, index) => {
    const timeout = setTimeout(() => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      if (index > 0) {
        nodes[index - 1].classList.add('completed');
      }
      // Auto-scroll within the flow-diagram container
      const container = flowDiagram;
      const nodeTop = node.offsetTop;
      const nodeHeight = node.offsetHeight;
      const containerHeight = container.clientHeight;
      
      // Calculate the position to center the node
      const targetScroll = nodeTop - (containerHeight / 2) + (nodeHeight / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }, index * 500);
    
    flowAnimationTimeouts.push(timeout);
  });
}

eventType.addEventListener('change', (e) => {
  const example = eventExamples[e.target.value];
  if (!example) return;
  
  eventCode.value = example.code;
  renderFlowDiagram(example.flow);
});

triggerEventBtn.addEventListener('click', () => {
  const example = eventExamples[eventType.value];
  if (!example) return;
  
  // Clear any existing output
  eventOutput.textContent = '';
  
  // Reset and start animation
  animateFlow(example.flow);
  
  // Execute handler after animation completes
  const handlerTimeout = setTimeout(() => {
    example.handler();
  }, example.flow.length * 500);
  
  flowAnimationTimeouts.push(handlerTimeout);
});

// Initialize
const initialEvent = eventExamples['button-click'];
eventCode.value = initialEvent.code;
renderFlowDiagram(initialEvent.flow);

// ==================== DEBUGGING TAB ====================

const puzzleSelect = document.getElementById('puzzleSelect');
const puzzleInfo = document.getElementById('puzzleInfo');
const puzzleCode = document.getElementById('puzzleCode');
const showPuzzleSolutionBtn = document.getElementById('showPuzzleSolutionBtn');
const testPuzzleBtn = document.getElementById('testPuzzleBtn');
const resetPuzzleBtn = document.getElementById('resetPuzzleBtn');
const puzzleOutput = document.getElementById('puzzleOutput');
const puzzleFeedback = document.getElementById('puzzleFeedback');

// Initialize output with placeholder
if (puzzleOutput) {
  puzzleOutput.innerHTML = '<div class="output-line" style="color: var(--text-muted);">Click "Test Code" to see output</div>';
}

const puzzles = {
  '1': {
    title: 'Syntax Error',
    description: 'Fix the syntax error in this code. There\'s a missing colon.',
    broken: `def greet(name)
    return f"Hello, {name}!"`,
    fixed: `def greet(name):
    return f"Hello, {name}!"`,
    test: (code) => code.includes('def greet(name):')
  },
  '2': {
    title: 'Logic Error',
    description: 'This function should return the sum of two numbers, but it\'s returning the product. Fix it.',
    broken: `def add(a, b):
    return a * b`,
    fixed: `def add(a, b):
    return a + b`,
    test: (code) => code.includes('return a + b')
  },
  '3': {
    title: 'Index Error',
    description: 'This code tries to access an index that doesn\'t exist (index 5 in a list of length 3). Fix it to handle the error properly by checking the length before accessing, or using try/except. Don\'t just change the index to a valid one!',
    broken: `numbers = [1, 2, 3]
print(numbers[5])`,
    fixed: `numbers = [1, 2, 3]
if len(numbers) > 5:
    print(numbers[5])
else:
    print("Index out of range")`,
    test: (code) => {
      // Must still access index 5 (not just change it to a valid index)
      const stillAccessesIndex5 = code.includes('numbers[5]') || code.includes('numbers[ 5 ]');
      // Must have error handling: either len check, try/except, or conditional
      const hasErrorHandling = code.includes('len(numbers)') || 
                               code.includes('try:') || 
                               code.includes('except') ||
                               code.includes('IndexError') ||
                               (code.includes('if ') && code.includes('else'));
      return stillAccessesIndex5 && hasErrorHandling;
    }
  },
  '4': {
    title: 'Type Error',
    description: 'This code tries to add a string and a number. Fix the type error.',
    broken: `age = 25
message = "I am " + age + " years old"`,
    fixed: `age = 25
message = "I am " + str(age) + " years old"`,
    test: (code) => code.includes('str(age)')
  },
  '5': {
    title: 'Infinite Loop',
    description: 'This while loop never stops. Add a condition to make it exit properly.',
    broken: `count = 0
while True:
    print(count)
    count += 1`,
    fixed: `count = 0
while count < 10:
    print(count)
    count += 1`,
    test: (code) => code.includes('while count <') || code.includes('while count <=')
  }
};

function loadPuzzle(id) {
  const puzzle = puzzles[id];
  if (!puzzle) return;
  
  puzzleInfo.innerHTML = `
    <h4>${puzzle.title}</h4>
    <p>${puzzle.description}</p>
  `;
  puzzleCode.value = puzzle.broken;
  puzzleOutput.innerHTML = '';
  puzzleFeedback.innerHTML = '';
  puzzleFeedback.className = 'puzzle-feedback';
}

function testPuzzle() {
  const puzzle = puzzles[puzzleSelect.value];
  if (!puzzle) return;
  
  if (!puzzleOutput) {
    console.error('puzzleOutput element not found');
    return;
  }
  
  const code = puzzleCode.value;
  
  // Run the code and display output
  try {
    // Reset interpreter and run code
    interpreter.reset();
    const result = interpreter.run(code);
    
    console.log('Interpreter result:', result);
    
    // Display output
    if (result && result.output && result.output.length > 0) {
      puzzleOutput.innerHTML = result.output.map(line => {
        // Style error messages differently
        if (line.includes('Error:') || line.includes('SyntaxError:') || line.includes('NameError:') || line.includes('TypeError:') || line.includes('IndexError:')) {
          return `<div class="output-line error">${escapeHtml(line)}</div>`;
        }
        return `<div class="output-line">${escapeHtml(line)}</div>`;
      }).join('');
    } else {
      // Check if there are syntax errors or issues by checking the code structure
      const hasPrint = code.includes('print(');
      if (hasPrint) {
        puzzleOutput.innerHTML = '<div class="output-line error">Code contains print statement but produced no output. The interpreter may not support this code structure.</div>';
      } else {
        puzzleOutput.innerHTML = '<div class="output-line" style="color: var(--text-muted);">No output. Code executed without print statements or errors.</div>';
      }
    }
  } catch (e) {
    console.error('Error running code:', e);
    puzzleOutput.innerHTML = `<div class="output-line error">Error: ${escapeHtml(e.message)}</div>`;
  }
  
  // Test if puzzle is fixed
  const passed = puzzle.test(code);
  
  puzzleFeedback.className = `puzzle-feedback ${passed ? 'success' : 'error'}`;
  
  // Provide more helpful feedback for logic errors
  if (passed) {
    puzzleFeedback.innerHTML = '<h4>✓ Correct!</h4><p>You fixed the bug successfully!</p>';
  } else {
    // Check if it's a logic error vs syntax error
    const hasSyntaxError = result && result.output && result.output.some(line => 
      line.includes('SyntaxError') || line.includes('NameError') || line.includes('TypeError')
    );
    
    if (hasSyntaxError) {
      puzzleFeedback.innerHTML = '<h4>✗ Syntax Error</h4><p>Fix the syntax error first, then address the logic issue.</p>';
    } else {
      puzzleFeedback.innerHTML = '<h4>✗ Logic Error</h4><p>The code is syntactically correct but has a logic error. Check the description for hints.</p>';
    }
  }
  
  // Track debugging attempt with enhanced tracking
  const outputLines = result && result.output ? result.output : [];
  trackDebuggingPuzzle(puzzleSelect.value, code, outputLines, passed);
}

puzzleSelect.addEventListener('change', (e) => {
  loadPuzzle(e.target.value);
});

showPuzzleSolutionBtn.addEventListener('click', () => {
  const puzzle = puzzles[puzzleSelect.value];
  if (puzzle) {
    puzzleCode.value = puzzle.fixed;
  }
});

testPuzzleBtn.addEventListener('click', testPuzzle);
resetPuzzleBtn.addEventListener('click', () => {
  loadPuzzle(puzzleSelect.value);
});

loadPuzzle('1');

// ==================== PROJECTS TAB ====================

const projectsList = document.getElementById('projectsList');
const projectHeader = document.getElementById('projectHeader');
const projectInstructions = document.getElementById('projectInstructions');
const projectCode = document.getElementById('projectCode');
const runProjectBtn = document.getElementById('runProjectBtn');
const checkProjectBtn = document.getElementById('checkProjectBtn');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const projectOutput = document.getElementById('projectOutput');
const projectFeedback = document.getElementById('projectFeedback');

const projects = [
  {
    id: '1',
    title: 'Hello World',
    description: 'Create your first Python program',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that prints "Hello, World!" to the console.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Use the print() function</li>
        <li>Pass the string "Hello, World!" as an argument</li>
      </ol>
    `,
    solution: 'print("Hello, World!")',
    test: (code) => code.includes('print') && code.includes('Hello')
  },
  {
    id: '2',
    title: 'Calculator',
    description: 'Create a simple calculator',
    instructions: `
      <h4>Task:</h4>
      <p>Create variables for two numbers and calculate their sum, difference, product, and quotient.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create two variables (e.g., a = 10, b = 5)</li>
        <li>Calculate and print the sum (a + b)</li>
        <li>Calculate and print the difference (a - b)</li>
        <li>Calculate and print the product (a * b)</li>
        <li>Calculate and print the quotient (a / b)</li>
      </ol>
    `,
    solution: `a = 10
b = 5
print(a + b)
print(a - b)
print(a * b)
print(a / b)`,
    test: (code) => code.includes('+') && code.includes('-') && code.includes('*') && code.includes('/')
  },
  {
    id: '3',
    title: 'List Operations',
    description: 'Work with Python lists',
    instructions: `
      <h4>Task:</h4>
      <p>Create a list of numbers, find the sum, maximum, and minimum values.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a list with at least 5 numbers</li>
        <li>Calculate and print the sum</li>
        <li>Find and print the maximum value</li>
        <li>Find and print the minimum value</li>
      </ol>
    `,
    solution: `numbers = [1, 2, 3, 4, 5]
print(sum(numbers))
print(max(numbers))
print(min(numbers))`,
    test: (code) => code.includes('sum') || code.includes('max') || code.includes('min')
  },
  {
    id: '4',
    title: 'Temperature Converter',
    description: 'Convert between Celsius and Fahrenheit',
    instructions: `
      <h4>Task:</h4>
      <p>Create a program that converts a temperature from Celsius to Fahrenheit.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a variable for the temperature in Celsius (e.g., celsius = 25)</li>
        <li>Use the formula: fahrenheit = (celsius * 9/5) + 32</li>
        <li>Print both the Celsius and Fahrenheit values</li>
      </ol>
    `,
    solution: `celsius = 25
fahrenheit = (celsius * 9/5) + 32
print(f"{celsius}°C = {fahrenheit}°F")`,
    test: (code) => code.includes('*') && code.includes('+') && (code.includes('fahrenheit') || code.includes('F'))
  },
  {
    id: '5',
    title: 'Even or Odd',
    description: 'Check if a number is even or odd',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that determines if a number is even or odd.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a variable with a number (e.g., num = 7)</li>
        <li>Use the modulo operator (%) to check if the number is divisible by 2</li>
        <li>If num % 2 == 0, print "Even", otherwise print "Odd"</li>
      </ol>
    `,
    solution: `num = 7
if num % 2 == 0:
    print("Even")
else:
    print("Odd")`,
    test: (code) => code.includes('%') && code.includes('if') && (code.includes('Even') || code.includes('Odd'))
  },
  {
    id: '6',
    title: 'Count Vowels',
    description: 'Count vowels in a string',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that counts how many vowels are in a given string.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a string variable (e.g., text = "Hello World")</li>
        <li>Create a variable to count vowels (count = 0)</li>
        <li>Loop through each character in the string</li>
        <li>Check if the character is a vowel (a, e, i, o, u)</li>
        <li>Increment the count if it's a vowel</li>
        <li>Print the total count</li>
      </ol>
    `,
    solution: `text = "Hello World"
count = 0
for char in text.lower():
    if char in "aeiou":
        count += 1
print(f"Number of vowels: {count}")`,
    test: (code) => code.includes('for') && code.includes('in') && (code.includes('vowel') || code.includes('aeiou'))
  },
  {
    id: '7',
    title: 'Reverse a List',
    description: 'Reverse the order of a list',
    instructions: `
      <h4>Task:</h4>
      <p>Create a program that reverses the order of elements in a list.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a list (e.g., numbers = [1, 2, 3, 4, 5])</li>
        <li>Reverse the list (you can use reverse() method or slicing)</li>
        <li>Print the reversed list</li>
      </ol>
    `,
    solution: `numbers = [1, 2, 3, 4, 5]
numbers.reverse()
print(numbers)`,
    test: (code) => code.includes('reverse') || (code.includes('[') && code.includes('::-1'))
  },
  {
    id: '8',
    title: 'Sum of Even Numbers',
    description: 'Sum all even numbers in a list',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that sums all even numbers from a list.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a list of numbers (e.g., numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])</li>
        <li>Create a variable to store the sum (sum_even = 0)</li>
        <li>Loop through each number</li>
        <li>Check if the number is even (use % 2 == 0)</li>
        <li>Add even numbers to the sum</li>
        <li>Print the total sum</li>
      </ol>
    `,
    solution: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
sum_even = 0
for num in numbers:
    if num % 2 == 0:
        sum_even += num
print(f"Sum of even numbers: {sum_even}")`,
    test: (code) => code.includes('for') && code.includes('% 2 == 0') && code.includes('+=')
  },
  {
    id: '9',
    title: 'Grade Calculator',
    description: 'Calculate letter grade from score',
    instructions: `
      <h4>Task:</h4>
      <p>Create a program that converts a numerical score to a letter grade.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a variable for the score (e.g., score = 85)</li>
        <li>Use if/elif statements to assign grades:
          <ul>
            <li>90+ = "A"</li>
            <li>80-89 = "B"</li>
            <li>70-79 = "C"</li>
            <li>60-69 = "D"</li>
            <li>Below 60 = "F"</li>
          </ul>
        </li>
        <li>Print the letter grade</li>
      </ol>
    `,
    solution: `score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(f"Score: {score}, Grade: {grade}")`,
    test: (code) => code.includes('if') && code.includes('elif') && (code.includes('A') || code.includes('B') || code.includes('C'))
  },
  {
    id: '10',
    title: 'Word Frequency',
    description: 'Count how many times each word appears',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that counts how many times each word appears in a sentence.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a sentence string (e.g., sentence = "hello world hello python")</li>
        <li>Split the sentence into words using split()</li>
        <li>Create a dictionary to store word counts</li>
        <li>Loop through each word</li>
        <li>Count occurrences of each word</li>
        <li>Print the word frequency dictionary</li>
      </ol>
    `,
    solution: `sentence = "hello world hello python"
words = sentence.split()
word_count = {}
for word in words:
    if word in word_count:
        word_count[word] += 1
    else:
        word_count[word] = 1
print(word_count)`,
    test: (code) => code.includes('split') && (code.includes('{}') || code.includes('dict')) && code.includes('in')
  },
  {
    id: '11',
    title: 'Find Largest Number',
    description: 'Find the largest number in a list',
    instructions: `
      <h4>Task:</h4>
      <p>Write a program that finds the largest number in a list without using the max() function.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a list of numbers (e.g., numbers = [23, 45, 12, 67, 34, 89])</li>
        <li>Create a variable to store the largest (largest = numbers[0])</li>
        <li>Loop through each number in the list</li>
        <li>Compare each number with the largest</li>
        <li>Update largest if current number is bigger</li>
        <li>Print the largest number</li>
      </ol>
    `,
    solution: `numbers = [23, 45, 12, 67, 34, 89]
largest = numbers[0]
for num in numbers:
    if num > largest:
        largest = num
print(f"Largest number: {largest}")`,
    test: (code) => code.includes('for') && code.includes('>') && code.includes('largest')
  },
  {
    id: '12',
    title: 'Simple Password Checker',
    description: 'Check if password meets requirements',
    instructions: `
      <h4>Task:</h4>
      <p>Create a program that checks if a password is at least 8 characters long.</p>
      <h4>Steps:</h4>
      <ol>
        <li>Create a password variable (e.g., password = "mypassword123")</li>
        <li>Check the length using len()</li>
        <li>If length >= 8, print "Password is valid"</li>
        <li>Otherwise, print "Password is too short"</li>
      </ol>
    `,
    solution: `password = "mypassword123"
if len(password) >= 8:
    print("Password is valid")
else:
    print("Password is too short")`,
    test: (code) => code.includes('len(') && code.includes('>= 8') && code.includes('valid')
  }
];

let currentProject = null;

function loadProjects() {
  if (!projectsList) {
    console.error('Projects list element not found');
    return;
  }
  
  if (!projects || projects.length === 0) {
    projectsList.innerHTML = '<div style="padding: 20px; color: var(--text-muted);">No projects available.</div>';
    return;
  }
  
  projectsList.innerHTML = projects.map(project => `
    <div class="project-item" data-project-id="${project.id}">
      <strong>${project.title}</strong>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${project.description}</div>
    </div>
  `).join('');
  
  projectsList.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', () => {
      const projectId = item.dataset.projectId;
      loadProject(projectId);
      projectsList.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Load first project by default if none is loaded
  if (!currentProject && projects.length > 0) {
    const firstItem = projectsList.querySelector('.project-item');
    if (firstItem) {
      firstItem.click();
    }
  }
}

function loadProject(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  
  currentProject = project;
  projectHeader.innerHTML = `<h3>${project.title}</h3>`;
  projectInstructions.innerHTML = project.instructions;
  
  loadFromDB(STORE_NAMES.projects, id).then(code => {
    projectCode.value = code || '';
  });
  
  projectOutput.innerHTML = '';
  projectFeedback.innerHTML = '';
  projectFeedback.className = 'project-feedback';
}

function runProject() {
  if (!currentProject) {
    projectFeedback.className = 'project-feedback error';
    projectFeedback.innerHTML = '<h4>No Project Selected</h4><p>Please select a project from the list first.</p>';
    return;
  }
  
  const code = projectCode.value;
  try {
    const result = interpreter.run(code);
    if (result && result.output && result.output.length > 0) {
      projectOutput.innerHTML = result.output.map(line => 
        `<div class="output-line">${escapeHtml(line)}</div>`
      ).join('');
    } else {
      projectOutput.innerHTML = '<div class="output-line" style="color: var(--text-muted);">No output. Code executed without print statements.</div>';
    }
  } catch (e) {
    projectOutput.innerHTML = `<div class="output-line error">Error: ${escapeHtml(e.message)}</div>`;
  }
}

function checkProject() {
  if (!currentProject) {
    projectFeedback.className = 'project-feedback error';
    projectFeedback.innerHTML = '<h4>No Project Selected</h4><p>Please select a project from the list first.</p>';
    return;
  }
  
  const code = projectCode.value.trim();
  if (!code) {
    projectFeedback.className = 'project-feedback error';
    projectFeedback.innerHTML = '<h4>Empty Code</h4><p>Please write some code before checking.</p>';
    return;
  }
  
  // Run the code first to get output
  let outputLines = [];
  try {
    const result = interpreter.run(code);
    if (result && result.output && result.output.length > 0) {
      outputLines = result.output;
      if (projectOutput) {
        projectOutput.innerHTML = result.output.map(line => 
          `<div class="output-line">${escapeHtml(line)}</div>`
        ).join('');
      }
    }
  } catch (e) {
    outputLines = [`Error: ${e.message}`];
    if (projectOutput) {
      projectOutput.innerHTML = `<div class="output-line error">Error: ${escapeHtml(e.message)}</div>`;
    }
  }
  
  try {
    const passed = currentProject.test(code);
    
    projectFeedback.className = `project-feedback ${passed ? 'success' : 'error'}`;
    const feedbackText = passed
      ? '<h4>✓ Great job!</h4><p>Your solution is correct!</p>'
      : '<h4>✗ Not quite right</h4><p>Review the instructions and try again.</p>';
    projectFeedback.innerHTML = feedbackText;
    
    // Track project attempt with enhanced tracking
    trackProjectActivity(currentProject.id, code, outputLines, feedbackText, passed);
  } catch (e) {
    projectFeedback.className = 'project-feedback error';
    projectFeedback.innerHTML = `<h4>Error</h4><p>${escapeHtml(e.message)}</p>`;
    trackProjectActivity(currentProject.id, code, outputLines, `<h4>Error</h4><p>${e.message}</p>`, false);
  }
}

runProjectBtn.addEventListener('click', runProject);
checkProjectBtn.addEventListener('click', checkProject);
saveProjectBtn.addEventListener('click', () => {
  if (currentProject) {
    saveToDB(STORE_NAMES.projects, currentProject.id, projectCode.value);
    showNotification('Progress saved!', 'success');
  }
});

// Initialize projects - will be called when Projects tab is opened
// Also initialize on page load if Projects tab is active
setTimeout(() => {
  if (projectsList && document.getElementById('projects').classList.contains('active')) {
    loadProjects();
  }
}, 100);

// ==================== PROGRESS TAB ====================

// Get progress tab elements - ensure they exist
const generateReportBtn = document.getElementById('generateReportBtn');
const exportReportBtn = document.getElementById('exportReportBtn');
const clearProgressBtn = document.getElementById('clearProgressBtn');
const progressStats = document.getElementById('progressStats');
const progressReport = document.getElementById('progressReport');

// Verify elements exist
if (!generateReportBtn || !exportReportBtn || !clearProgressBtn || !progressStats || !progressReport) {
  console.warn('Progress tab elements not found. They may be loaded later.');
}

// Initialize comprehensive progress tracking structure
let progressData = {
  // Session metadata
  firstSession: null,
  lastSession: null,
  totalSessions: 0,
  
  // Interpreter Tab
  interpreter: {
    sessions: [],
    totalExecutions: 0,
    examplesUsed: []
  },
  
  // Visualizer Tab
  visualizer: {
    sessions: [],
    typesUsed: [],
    totalVisualizations: 0
  },
  
  // Loops Tab
  loops: {
    sessions: [],
    totalLoopsRun: 0
  },
  
  // Events Tab
  events: {
    sessions: [],
    totalSimulations: 0
  },
  
  // Debugging Tab (backward compatible)
  debugging: {},
  // Enhanced debugging data
  debuggingDetails: {
    puzzles: {}
  },
  
  // Projects Tab (backward compatible)
  projects: {},
  // Enhanced project data
  projectDetails: {
    projects: {}
  }
};

// Initialize or migrate existing data
function initializeProgressData() {
  const now = new Date().toISOString();
  
  // Ensure all required properties exist
  if (!progressData.interpreter) {
    progressData.interpreter = { sessions: [], totalExecutions: 0, examplesUsed: [] };
  }
  if (!progressData.visualizer) {
    progressData.visualizer = { sessions: [], typesUsed: [], totalVisualizations: 0 };
  }
  if (!progressData.loops) {
    progressData.loops = { sessions: [], totalLoopsRun: 0 };
  }
  if (!progressData.events) {
    progressData.events = { sessions: [], totalSimulations: 0 };
  }
  if (!progressData.debugging) {
    progressData.debugging = {};
  }
  if (!progressData.debuggingDetails) {
    progressData.debuggingDetails = { puzzles: {} };
  }
  if (!progressData.projects) {
    progressData.projects = {};
  }
  if (!progressData.projectDetails) {
    progressData.projectDetails = { projects: {} };
  }
  
  // Initialize session metadata only on first load
  if (!progressData.firstSession) {
    progressData.firstSession = now;
  }
  
  // Update last session
  progressData.lastSession = now;
  
  // Only increment sessions if this is a new session (check time difference)
  const lastSessionTime = progressData.lastSession ? new Date(progressData.lastSession).getTime() : 0;
  const currentTime = new Date(now).getTime();
  const timeDiff = currentTime - lastSessionTime;
  
  // Consider it a new session if more than 5 minutes have passed
  if (!progressData.totalSessions || timeDiff > 5 * 60 * 1000) {
    progressData.totalSessions = (progressData.totalSessions || 0) + 1;
  }
  
  // Migrate old data structure
  if (progressData.debugging && Object.keys(progressData.debugging).length > 0 && !progressData.debuggingDetails) {
    progressData.debuggingDetails = { puzzles: {} };
    Object.keys(progressData.debugging).forEach(id => {
      if (progressData.debugging[id]) {
        progressData.debuggingDetails.puzzles[id] = {
          completed: true,
          completedAt: now
        };
      }
    });
  }
  
  if (progressData.projects && Object.keys(progressData.projects).length > 0 && !progressData.projectDetails) {
    progressData.projectDetails = { projects: {} };
    Object.keys(progressData.projects).forEach(id => {
      if (progressData.projects[id]) {
        progressData.projectDetails.projects[id] = {
          completed: true,
          completedAt: now
        };
      }
    });
  }
}

// Helper function to limit array size (keep last N items)
function limitArraySize(arr, maxSize) {
  if (arr.length > maxSize) {
    return arr.slice(-maxSize);
  }
  return arr;
}

// Track interpreter code execution
function trackInterpreterExecution(code, output, variables, exampleLoaded = null) {
  if (!progressData.interpreter) {
    progressData.interpreter = { sessions: [], totalExecutions: 0, examplesUsed: [] };
  }
  
  const session = {
    timestamp: new Date().toISOString(),
    code: code,
    output: output || [],
    variables: variables || {},
    exampleLoaded: exampleLoaded
  };
  
  progressData.interpreter.sessions.push(session);
  progressData.interpreter.sessions = limitArraySize(progressData.interpreter.sessions, 50);
  progressData.interpreter.totalExecutions = (progressData.interpreter.totalExecutions || 0) + 1;
  
  if (exampleLoaded && !progressData.interpreter.examplesUsed.includes(exampleLoaded)) {
    progressData.interpreter.examplesUsed.push(exampleLoaded);
  }
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Track visualizer activity
function trackVisualizerActivity(type, data, operations, inputUsed) {
  if (!progressData.visualizer) {
    progressData.visualizer = { sessions: [], typesUsed: [], totalVisualizations: 0 };
  }
  
  const session = {
    timestamp: new Date().toISOString(),
    type: type,
    data: data,
    operations: operations || [],
    inputUsed: inputUsed
  };
  
  progressData.visualizer.sessions.push(session);
  progressData.visualizer.sessions = limitArraySize(progressData.visualizer.sessions, 50);
  progressData.visualizer.totalVisualizations = (progressData.visualizer.totalVisualizations || 0) + 1;
  
  if (!progressData.visualizer.typesUsed.includes(type)) {
    progressData.visualizer.typesUsed.push(type);
  }
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Track loop visualization
function trackLoopActivity(code, output, visualizationRun) {
  if (!progressData.loops) {
    progressData.loops = { sessions: [], totalLoopsRun: 0 };
  }
  
  const session = {
    timestamp: new Date().toISOString(),
    code: code,
    output: output || [],
    visualizationRun: visualizationRun || false
  };
  
  progressData.loops.sessions.push(session);
  progressData.loops.sessions = limitArraySize(progressData.loops.sessions, 50);
  progressData.loops.totalLoopsRun = (progressData.loops.totalLoopsRun || 0) + 1;
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Track event simulation
function trackEventActivity(eventType, code, output, simulationRun) {
  if (!progressData.events) {
    progressData.events = { sessions: [], totalSimulations: 0 };
  }
  
  const session = {
    timestamp: new Date().toISOString(),
    eventType: eventType,
    code: code,
    output: output || [],
    simulationRun: simulationRun || false
  };
  
  progressData.events.sessions.push(session);
  progressData.events.sessions = limitArraySize(progressData.events.sessions, 50);
  progressData.events.totalSimulations = (progressData.events.totalSimulations || 0) + 1;
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Enhanced debugging puzzle tracking
function trackDebuggingPuzzle(puzzleId, code, output, completed) {
  if (!progressData.debuggingDetails) {
    progressData.debuggingDetails = { puzzles: {} };
  }
  
  if (!progressData.debuggingDetails.puzzles[puzzleId]) {
    const puzzleTitle = (typeof puzzles !== 'undefined' && puzzles[puzzleId]) ? puzzles[puzzleId].title : puzzleId;
    progressData.debuggingDetails.puzzles[puzzleId] = {
      title: puzzleTitle,
      attempts: [],
      completed: false
    };
  }
  
  const attempt = {
    timestamp: new Date().toISOString(),
    code: code,
    output: output || [],
    completed: completed || false
  };
  
  progressData.debuggingDetails.puzzles[puzzleId].attempts.push(attempt);
  progressData.debuggingDetails.puzzles[puzzleId].attempts = limitArraySize(
    progressData.debuggingDetails.puzzles[puzzleId].attempts, 
    20
  );
  
  if (completed) {
    progressData.debuggingDetails.puzzles[puzzleId].completed = true;
    progressData.debuggingDetails.puzzles[puzzleId].completedAt = new Date().toISOString();
  }
  
  // Backward compatibility
  if (!progressData.debugging) {
    progressData.debugging = {};
  }
  progressData.debugging[puzzleId] = completed;
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Enhanced project tracking
function trackProjectActivity(projectId, code, output, feedback, completed) {
  if (!progressData.projectDetails) {
    progressData.projectDetails = { projects: {} };
  }
  
  const project = projects.find(p => p.id === projectId);
  
  if (!progressData.projectDetails.projects[projectId]) {
    progressData.projectDetails.projects[projectId] = {
      id: projectId,
      title: project?.title || projectId,
      attempts: [],
      completed: false
    };
  }
  
  const attempt = {
    timestamp: new Date().toISOString(),
    code: code,
    output: output || [],
    feedback: feedback || '',
    completed: completed || false
  };
  
  progressData.projectDetails.projects[projectId].attempts.push(attempt);
  progressData.projectDetails.projects[projectId].attempts = limitArraySize(
    progressData.projectDetails.projects[projectId].attempts,
    20
  );
  
  if (completed) {
    progressData.projectDetails.projects[projectId].completed = true;
    progressData.projectDetails.projects[projectId].completedAt = new Date().toISOString();
  }
  
  // Backward compatibility
  if (!progressData.projects) {
    progressData.projects = {};
  }
  progressData.projects[projectId] = completed;
  
  progressData.lastSession = new Date().toISOString();
  saveProgressToDB();
}

// Backward compatible saveProgress function
function saveProgress(category, id, completed) {
  if (category === 'debugging') {
    trackDebuggingPuzzle(id, '', [], completed);
  } else if (category === 'projects') {
    trackProjectActivity(id, '', [], '', completed);
  } else {
    if (!progressData[category]) {
      progressData[category] = {};
    }
    progressData[category][id] = completed;
    saveProgressToDB();
  }
}

// Save progress to IndexedDB
function saveProgressToDB() {
  saveToDB(STORE_NAMES.progress, 'main', progressData);
}

function loadProgress() {
  loadFromDB(STORE_NAMES.progress, 'main').then(data => {
    if (data) {
      // Merge loaded data with default structure to ensure all properties exist
      progressData = {
        // Session metadata
        firstSession: data.firstSession || null,
        lastSession: data.lastSession || null,
        totalSessions: data.totalSessions || 0,
        
        // Interpreter Tab
        interpreter: {
          sessions: data.interpreter?.sessions || [],
          totalExecutions: data.interpreter?.totalExecutions || 0,
          examplesUsed: data.interpreter?.examplesUsed || []
        },
        
        // Visualizer Tab
        visualizer: {
          sessions: data.visualizer?.sessions || [],
          typesUsed: data.visualizer?.typesUsed || [],
          totalVisualizations: data.visualizer?.totalVisualizations || 0
        },
        
        // Loops Tab
        loops: {
          sessions: data.loops?.sessions || [],
          totalLoopsRun: data.loops?.totalLoopsRun || 0
        },
        
        // Events Tab
        events: {
          sessions: data.events?.sessions || [],
          totalSimulations: data.events?.totalSimulations || 0
        },
        
        // Debugging Tab (backward compatible)
        debugging: data.debugging || {},
        debuggingDetails: data.debuggingDetails || { puzzles: {} },
        
        // Projects Tab (backward compatible)
        projects: data.projects || {},
        projectDetails: data.projectDetails || { projects: {} },
        
        // Legacy support
        codeSessions: data.codeSessions || 0
      };
    }
    initializeProgressData();
    updateProgressDisplay();
  }).catch(error => {
    console.error('Error loading progress:', error);
    // Initialize with default structure on error
    initializeProgressData();
    updateProgressDisplay();
  });
}

function updateProgressDisplay() {
  if (!progressStats) {
    console.warn('progressStats element not found');
    return;
  }
  
  const debuggingCount = Object.values(progressData.debugging || {}).filter(Boolean).length;
  const projectsCount = Object.values(progressData.projects || {}).filter(Boolean).length;
  const totalPuzzles = (typeof puzzles !== 'undefined') ? Object.keys(puzzles).length : 0;
  const totalProjects = (typeof projects !== 'undefined') ? projects.length : 0;
  
  const interpreterExecutions = (progressData.interpreter?.totalExecutions || 0);
  const visualizations = (progressData.visualizer?.totalVisualizations || 0);
  const loopsRun = (progressData.loops?.totalLoopsRun || 0);
  const eventsRun = (progressData.events?.totalSimulations || 0);
  
  progressStats.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Debugging Puzzles</div>
      <div class="stat-value">${debuggingCount}/${totalPuzzles}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Projects Completed</div>
      <div class="stat-value">${projectsCount}/${totalProjects}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Code Executions</div>
      <div class="stat-value">${interpreterExecutions}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Visualizations</div>
      <div class="stat-value">${visualizations}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Loops Run</div>
      <div class="stat-value">${loopsRun}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Events Simulated</div>
      <div class="stat-value">${eventsRun}</div>
    </div>
  `;
}

// Helper function to escape HTML
function escapeHtmlForReport(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Helper function to format code in report
function formatCodeForReport(code) {
  if (!code || !code.trim()) return '<em class="no-code">No code</em>';
  return '<pre class="report-code-block"><code>' + escapeHtmlForReport(code) + '</code></pre>';
}

// Helper function to format output in report
function formatOutputForReport(outputArray) {
  if (!outputArray || outputArray.length === 0) return '<em class="no-output">No output</em>';
  return '<pre class="report-output-block"><code>' + outputArray.map(line => escapeHtmlForReport(line)).join('\n') + '</code></pre>';
}

// Helper function to format date
function formatDateForReport(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

function generateReport() {
  if (!progressReport) {
    console.error('progressReport element not found');
    alert('Error: Progress report container not found. Please refresh the page.');
    return;
  }
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const firstSession = formatDateForReport(progressData.firstSession);
  const lastSession = formatDateForReport(progressData.lastSession);
  const totalSessions = progressData.totalSessions || 0;
  
  // Calculate statistics
  const debuggingCount = Object.values(progressData.debugging || {}).filter(Boolean).length;
  const projectsCount = Object.values(progressData.projects || {}).filter(Boolean).length;
  const totalPuzzles = (typeof puzzles !== 'undefined' && puzzles) ? Object.keys(puzzles).length : 0;
  const totalProjects = (typeof projects !== 'undefined' && projects) ? projects.length : 0;
  
  const interpreterExecutions = progressData.interpreter?.totalExecutions || 0;
  const visualizations = progressData.visualizer?.totalVisualizations || 0;
  const loopsRun = progressData.loops?.totalLoopsRun || 0;
  const eventsRun = progressData.events?.totalSimulations || 0;
  
  // Get recent code samples (last 3)
  const recentInterpreterCode = (progressData.interpreter?.sessions || []).slice(-3).reverse();
  
  // Get completed debugging puzzles with solutions
  const completedPuzzles = [];
  if (progressData.debuggingDetails?.puzzles) {
    Object.entries(progressData.debuggingDetails.puzzles).forEach(([id, puzzleData]) => {
      if (puzzleData.completed) {
        const lastAttempt = puzzleData.attempts[puzzleData.attempts.length - 1];
        if (lastAttempt && lastAttempt.completed) {
          completedPuzzles.push({
            id,
            title: puzzleData.title || (typeof puzzles !== 'undefined' && puzzles[id]) ? puzzles[id].title : id,
            code: lastAttempt.code,
            output: lastAttempt.output
          });
        }
      }
    });
  }
  
  // Get completed projects with solutions (last 5)
  const completedProjectsData = [];
  
  // First, check projectDetails for projects with full tracking
  if (progressData.projectDetails?.projects) {
    Object.entries(progressData.projectDetails.projects).forEach(([id, projectData]) => {
      if (projectData.completed) {
        const lastAttempt = projectData.attempts && projectData.attempts.length > 0 
          ? projectData.attempts[projectData.attempts.length - 1] 
          : null;
        
        if (lastAttempt) {
          completedProjectsData.push({
            id,
            title: projectData.title || (typeof projects !== 'undefined' && projects) ? (projects.find(p => p.id === id)?.title || id) : id,
            code: lastAttempt.code || '',
            output: lastAttempt.output || [],
            feedback: lastAttempt.feedback || ''
          });
        } else {
          // Project is marked as completed but has no attempts yet (from migration)
          completedProjectsData.push({
            id,
            title: projectData.title || (typeof projects !== 'undefined' && projects) ? (projects.find(p => p.id === id)?.title || id) : id,
            code: '',
            output: [],
            feedback: 'Completed'
          });
        }
      }
    });
  }
  
  // Also check the backward-compatible projects object for any completed projects not yet in projectDetails
  if (progressData.projects && typeof projects !== 'undefined') {
    Object.entries(progressData.projects).forEach(([id, completed]) => {
      if (completed && !completedProjectsData.find(p => p.id === id)) {
        const project = projects.find(p => p.id === id);
        if (project) {
          completedProjectsData.push({
            id,
            title: project.title || id,
            code: '',
            output: [],
            feedback: 'Completed'
          });
        }
      }
    });
  }
  
  progressReport.innerHTML = `
    <div class="academic-report" id="academicReport">
      <header class="report-header">
        <h1>🐍 Python Programming Lab - Progress Report</h1>
        <div class="report-meta">
          <p><strong>Report Generated:</strong> ${reportDate}</p>
          <p><strong>Session Period:</strong> ${firstSession} - ${lastSession}</p>
          <p><strong>Total Active Sessions:</strong> ${totalSessions}</p>
        </div>
      </header>
      
      <section class="report-section">
        <h2>1. Executive Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">Total Code Executions</div>
            <div class="summary-value">${interpreterExecutions}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Debugging Puzzles</div>
            <div class="summary-value">${debuggingCount}/${totalPuzzles}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Projects Completed</div>
            <div class="summary-value">${projectsCount}/${totalProjects}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Visualizations</div>
            <div class="summary-value">${visualizations}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Loop Visualizations</div>
            <div class="summary-value">${loopsRun}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Event Simulations</div>
            <div class="summary-value">${eventsRun}</div>
          </div>
        </div>
      </section>
      
      <section class="report-section">
        <h2>2. Activity Breakdown by Tab</h2>
        
        <div class="activity-subsection">
          <h3>2.1 Interpreter Tab</h3>
          <ul>
            <li><strong>Total Executions:</strong> ${interpreterExecutions}</li>
            <li><strong>Examples Used:</strong> ${(progressData.interpreter?.examplesUsed || []).join(', ') || 'None'}</li>
          </ul>
          ${recentInterpreterCode.length > 0 ? `
            <h4>Recent Code Samples:</h4>
            ${recentInterpreterCode.map((session, idx) => `
              <div class="code-sample-section">
                <div class="sample-header">
                  <span class="sample-number">Sample ${idx + 1}</span>
                  <span class="sample-date">${formatDateForReport(session.timestamp)}</span>
                </div>
                ${formatCodeForReport(session.code)}
                ${session.output && session.output.length > 0 ? `
                  <div class="sample-output-section">
                    <strong>Output:</strong>
                    ${formatOutputForReport(session.output)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          ` : '<p class="no-data"><em>No code executions recorded yet.</em></p>'}
        </div>
        
        <div class="activity-subsection">
          <h3>2.2 Visualizer Tab</h3>
          <ul>
            <li><strong>Total Visualizations:</strong> ${visualizations}</li>
            <li><strong>Data Types Explored:</strong> ${(progressData.visualizer?.typesUsed || []).join(', ') || 'None'}</li>
          </ul>
        </div>
        
        <div class="activity-subsection">
          <h3>2.3 Loops Tab</h3>
          <ul>
            <li><strong>Total Loop Visualizations:</strong> ${loopsRun}</li>
          </ul>
        </div>
        
        <div class="activity-subsection">
          <h3>2.4 Events Tab</h3>
          <ul>
            <li><strong>Total Simulations:</strong> ${eventsRun}</li>
          </ul>
        </div>
        
        <div class="activity-subsection">
          <h3>2.5 Debugging Tab</h3>
          <ul>
            <li><strong>Puzzles Completed:</strong> ${debuggingCount}/${totalPuzzles}</li>
            <li><strong>Completion Rate:</strong> ${totalPuzzles > 0 ? Math.round((debuggingCount / totalPuzzles) * 100) : 0}%</li>
          </ul>
        </div>
        
        <div class="activity-subsection">
          <h3>2.6 Projects Tab</h3>
          <ul>
            <li><strong>Projects Completed:</strong> ${projectsCount}/${totalProjects}</li>
            <li><strong>Completion Rate:</strong> ${totalProjects > 0 ? Math.round((projectsCount / totalProjects) * 100) : 0}%</li>
          </ul>
        </div>
      </section>
      
      ${completedPuzzles.length > 0 ? `
      <section class="report-section">
        <h2>3. Debugging Puzzle Solutions</h2>
        ${completedPuzzles.map((puzzle, idx) => `
          <div class="solution-section">
            <h3>${idx + 1}. ${puzzle.title}</h3>
            ${formatCodeForReport(puzzle.code)}
            ${puzzle.output && puzzle.output.length > 0 ? `
              <div class="solution-output-section">
                <strong>Output:</strong>
                ${formatOutputForReport(puzzle.output)}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}
      
      ${completedProjectsData.length > 0 ? `
      <section class="report-section">
        <h2>4. Project Answers</h2>
        ${completedProjectsData.slice(0, 5).map((project, idx) => `
          <div class="solution-section">
            <h3>${idx + 1}. ${project.title}</h3>
            ${formatCodeForReport(project.code)}
            ${project.output && project.output.length > 0 ? `
              <div class="solution-output-section">
                <strong>Output:</strong>
                ${formatOutputForReport(project.output)}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}
      
      <footer class="report-footer">
        <p><em>Report generated by Python Programming Lab</em></p>
      </footer>
    </div>
  `;
}

function exportReport() {
  if (!exportReportBtn) {
    console.error('exportReportBtn element not found');
    alert('Error: Export button not found. Please refresh the page.');
    return;
  }
  
  const reportElement = document.getElementById('academicReport') || progressReport;
  
  if (!reportElement || reportElement.innerHTML.trim() === '') {
    alert('Please generate a report first by clicking "Generate Report"');
    return;
  }
  
  // Show loading indicator
  exportReportBtn.disabled = true;
  exportReportBtn.textContent = '⏳ Exporting...';
  
  // Use html2canvas with better options for quality
  html2canvas(reportElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: function(clonedDoc) {
      // Ensure all styles are applied
      const clonedReport = clonedDoc.getElementById('academicReport');
      if (clonedReport) {
        clonedReport.style.width = reportElement.offsetWidth + 'px';
      }
    }
  }).then(canvas => {
    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `python-lab-progress-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button
    exportReportBtn.disabled = false;
    exportReportBtn.textContent = '📸 Export as Image';
  }).catch(error => {
    console.error('Export error:', error);
    alert('Error exporting report. Please try again.');
    exportReportBtn.disabled = false;
    exportReportBtn.textContent = '📸 Export as Image';
  });
}

// Add event listeners only if elements exist
if (generateReportBtn) {
  generateReportBtn.addEventListener('click', generateReport);
}
if (exportReportBtn) {
  exportReportBtn.addEventListener('click', exportReport);
}
if (clearProgressBtn) {
  clearProgressBtn.addEventListener('click', () => {
    if (confirm('Clear all progress? This cannot be undone.')) {
      // Reset to initial structure
      progressData = {
        firstSession: null,
        lastSession: null,
        totalSessions: 0,
        interpreter: { sessions: [], totalExecutions: 0, examplesUsed: [] },
        visualizer: { sessions: [], typesUsed: [], totalVisualizations: 0 },
        loops: { sessions: [], totalLoopsRun: 0 },
        events: { sessions: [], totalSimulations: 0 },
        debugging: {},
        debuggingDetails: { puzzles: {} },
        projects: {},
        projectDetails: { projects: {} }
      };
      saveProgressToDB();
      updateProgressDisplay();
      if (progressReport) {
        progressReport.innerHTML = '';
      }
    }
  });
}

// Code sessions are now tracked via trackInterpreterExecution

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
loadProgress();

