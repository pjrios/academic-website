# Grade Tags & Filtering System - Implementation Plan

## Overview
Add grade-level tags to all simulators and implement filtering functionality on the dashboard.

## Grade Color Scheme
- 🟦 **GRADE 6**: Blue (#38bdf8)
- 🟩 **GRADE 7**: Green (#22c55e)
- 🟧 **GRADE 8**: Orange (#fb923c)
- 🟥 **GRADE 9**: Red (#ef4444)

## Simulator-to-Grade Mapping

### GRADE 6 (🟦)
**Internet**
- ✅ Packet Journey → Network Addresses & Packet Routing Explorer
- ✅ Internet Post Office → Network Addresses & Packet Routing Explorer
- ✅ DNS Simulator → Network Addresses & Packet Routing Explorer
- ✅ Safe Chat Simulator → Safe Communication Scenarios

**Web Design**
- ✅ HTML Basics → Web Page Creation Tutorial Portal
- ✅ Design Comparison → Good vs Bad Website Analyzer
- ✅ Wireframe Builder → Wireframe / Layout Builder

**Spreadsheets**
- ✅ Spreadsheet Simulator → Spreadsheet Formula Simulator (Basic)

**Digital Citizenship**
- ✅ Digital Safety → Basic Online Safety Micro-Course
- ✅ Network Privacy Basics → Online Collaboration Scenario Trainer (partial)

### GRADE 7 (🟩)
**Networks**
- ✅ DNS Simulator → Networking Hardware Explorer (partial)
- ✅ Packet Journey → Routing & Hops Visualizer
- ✅ Network Privacy Basics → Network Performance & Privacy Lab

**Programming**
- ✅ Programming Basics Trainer → Sequence & Variables Trainer, Operators & Conditionals Simulator, Count-Controlled Loops Visualizer

**Spreadsheets**
- ✅ Spreadsheet Simulator → Spreadsheet Basics Simulator (Intermediate), Chart Builder (partial)

**Branding & Media**
- ✅ Logo Maker → Logo & Branding Workshop
- ✅ Design Comparison → Poster Builder (Visual Hierarchy Trainer) (partial)

**Search & Credibility**
- ✅ Search & Credibility Lab → Source Credibility Game, Search Engine Result Analysis Trainer, Search Strategy Micro-Course

**Algorithms**
- ✅ Algorithm Debugging Lab → Algorithm Debugging Lab, Algorithm Efficiency Visualizer

**Data Transmission**
- ✅ Packet Journey → Basic Protocols Visualizer (HTTP, DNS, TCP/IP)
- ✅ Internet Post Office → Network Packet Assembly Tool
- ✅ DNS Simulator → Network Latency & Bandwidth Sandbox (partial)

### GRADE 8 (🟧)
**Computing Systems**
- ✅ Computing Systems Explorer → Hardware Systems Explorer (CPU, RAM, Storage), Mini OS Simulator (Processes, Scheduling, Memory)
- ✅ Logic Systems → Logical Gates Playground (AND/OR/NOT)

**Web Development**
- ✅ HTML Basics → HTML Structure Builder, Inline Style Tester
- ✅ Wireframe Builder → Multi-Page Navigation Builder (partial)

**Programming**
- ✅ Programming Basics Trainer → Decision Logic Simulator (Sensor Input Simulation) (partial)
- ✅ Music Composer → Music Pattern Composer (Loops + Patterns)

### GRADE 9 (🟥)
**Python Programming**
- ✅ Python Lab → Python List & String Playground, For/While Loop Visualizer, Mini Python Projects Lab, Event-Driven Programming Simulator, Debugging Playground

**Animation**
- ✅ Music Composer → Music Pattern Composer (Loops + Patterns) (partial)

**Data Science**
- ✅ Data Science Explorer → Data Science Explorer (Patterns & Trends), Investigative Cycle (PPDAC) Trainer, Data Cleaning Lab

**Digital Representation**
- ✅ Digital Representation Lab → Binary Number Converter, Pixel & Color Depth Simulator, Resolution vs Quality Explorer, Sound Sampling Simulator, Sound Wave Visualizer, Sound Compression Explorer, Image Manipulation Ethics Explorer

**Cybersecurity**
- ✅ Network Privacy Basics → Cybersecurity Privacy Simulator (partial)
- ✅ Digital Safety → Social Engineering Scenarios Game (partial)

## Implementation Steps

### Phase 1: Data Structure
1. Create a JavaScript object mapping each simulator to its grade levels
2. Include topic/subtopic information for each mapping
3. Add grade metadata (color, number)

### Phase 2: Dashboard UI Updates
1. Add filter buttons/chips above the simulator grid
   - "All Grades" (default)
   - Grade 6, 7, 8, 9 buttons
   - Multi-select capability
2. Add grade badge/tag to each simulator card
   - Display all applicable grades
   - Color-coded badges
   - Position: top-right or below title

### Phase 3: Filtering Logic
1. JavaScript function to filter simulators by selected grades
2. Show/hide cards based on filter
3. Smooth transitions/animations
4. Update URL hash for bookmarkable filters (optional)

### Phase 4: Card Updates
1. Update each simulator card HTML to include:
   - Data attribute for grades: `data-grades="6,7"`
   - Grade badge elements
2. Ensure responsive design maintains with badges

## File Changes

### Files to Modify
1. `index.html` - Dashboard
   - Add filter UI
   - Add grade badges to cards
   - Add filtering JavaScript
   - Update CSS for badges and filters

2. Each simulator's `index.html` (optional)
   - Could add grade indicator in header
   - Link back to filtered dashboard view

### New Files (Optional)
- `js/dashboard-filters.js` - Filtering logic (if extracting to separate file)
- `js/simulator-data.js` - Simulator metadata (if extracting to separate file)

## Technical Considerations
1. **Performance**: Use data attributes for efficient filtering
2. **Accessibility**: Proper ARIA labels for filter buttons
3. **Mobile**: Responsive filter UI for smaller screens
4. **Persistence**: Consider localStorage for user's preferred filter
5. **URL Parameters**: Support ?grade=6,7 for direct links

## CSS Classes Needed
- `.grade-filter` - Filter button container
- `.filter-btn` - Individual filter button
- `.filter-btn.active` - Active filter state
- `.grade-badge` - Badge on cards
- `.grade-6`, `.grade-7`, `.grade-8`, `.grade-9` - Grade-specific styling
- `.card.hidden` - Hidden card state for filtering

