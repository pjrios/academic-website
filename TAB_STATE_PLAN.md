# Tab State Persistence - Implementation Plan

## Overview
Save the currently active tab when users switch tabs, so when they refresh the page, they return to the same tab they were viewing.

## Strategy

### 1. Storage Method
- Use **localStorage** to persist tab state
- Key format: `tabState_<simulator-name>` (e.g., `tabState_python-lab`, `tabState_algorithm-debugging`)
- Store only the tab ID/name

### 2. Implementation Pattern

For simulators using the common tab pattern:
- `.tab-button` with `data-tab` attribute
- `.tab-content` with matching `id`
- `active` class for both buttons and content

**Implementation Steps:**
1. **Save State**: When a tab button is clicked, save the tab ID to localStorage
2. **Restore State**: On page load, check localStorage and activate the saved tab
3. **Fallback**: If no saved state or invalid tab, use default (first tab)

### 3. Simulators to Update

**Common Pattern (easy to update):**
- ✅ Python Lab (`python-lab`) - 7 tabs
- ✅ Algorithm Debugging (`algorithm-debugging`) - 4 tabs  
- ✅ Data Science (`data-science`) - multiple tabs
- ✅ Computing Systems (`computing-systems`) - multiple tabs
- ✅ Logic Systems (`logic-systems`) - multiple tabs
- ✅ Music Composer (`music-composer`) - multiple tabs
- ✅ Digital Representation Lab (`digital-representation-lab`) - 7 tabs
- ✅ Programming Basics (`programming-basics`) - multiple tabs

**Custom Patterns (need individual handling):**
- Digital Safety - uses `tab-active` class and custom IDs
- Safe Chat - custom state management
- Packet Journey - custom tab system
- Spreadsheet - custom `switchTab()` function
- HTML Basics - complex tab system
- Network Privacy - custom tab system
- Others - need to check individually

### 4. Implementation Details

#### For Common Pattern Simulators:

```javascript
// Get simulator name from URL or path
const simulatorName = window.location.pathname.split('/')[2]; // e.g., "python-lab"
const STORAGE_KEY = `tabState_${simulatorName}`;

// Save tab state
function saveTabState(tabId) {
  localStorage.setItem(STORAGE_KEY, tabId);
}

// Restore tab state
function restoreTabState() {
  const savedTab = localStorage.getItem(STORAGE_KEY);
  if (savedTab) {
    const tabButton = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
    const tabContent = document.getElementById(savedTab);
    
    if (tabButton && tabContent) {
      // Remove active from all
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // Activate saved tab
      tabButton.classList.add('active');
      tabContent.classList.add('active');
      return true;
    }
  }
  return false;
}

// Update existing tab switching code
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetTab = button.getAttribute('data-tab');
    
    // ... existing tab switching code ...
    
    // Save state
    saveTabState(targetTab);
  });
});

// Restore on page load
document.addEventListener('DOMContentLoaded', () => {
  if (!restoreTabState()) {
    // Fallback to default tab if restore failed
  }
});
```

### 5. Implementation Priority

**Phase 1: Common Pattern Simulators (Quick Wins)**
1. Python Lab
2. Algorithm Debugging  
3. Data Science
4. Computing Systems
5. Logic Systems
6. Digital Representation Lab

**Phase 2: Custom Pattern Simulators**
- Each needs individual analysis and implementation

### 6. Edge Cases to Handle

1. **Invalid Tab IDs**: If saved tab doesn't exist, fallback to default
2. **URL Parameters**: Some simulators might use URL params - check if this conflicts
3. **Multiple Tab Systems**: Some simulators have nested tabs - save both
4. **Tab State Expiry**: Consider if we want tabs to expire (probably not needed)

### 7. Testing Checklist

- [ ] Switch to a tab and refresh - should stay on same tab
- [ ] Open in new tab - should use saved state
- [ ] Clear localStorage - should use default tab
- [ ] Invalid saved tab ID - should fallback gracefully
- [ ] Multiple simulators - each should have independent state

### 8. File Changes

For each simulator:
- Update `script.js` to add save/restore functions
- Modify tab switching event listeners to save state
- Add restoration on page load

**Example files to modify:**
- `simulators/python-lab/script.js`
- `simulators/algorithm-debugging/script.js`
- etc.

### 9. Benefits

- Better user experience - don't lose place on refresh
- Useful for long sessions or when browser crashes
- No server-side storage needed (localStorage)
- Works across browser sessions

### 10. Alternative Approach

Could also use URL hash fragments (`#tab=debugging`) instead of localStorage:
- Pros: Shareable URLs, works across devices if synced
- Cons: Messy URLs, might conflict with other hash usage

**Recommendation**: Use localStorage for simplicity, but could add URL hash as enhancement later.

