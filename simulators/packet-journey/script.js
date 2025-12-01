const NUM_NODES = 6; // initial defaults
let NUM_HOPS = NUM_NODES - 1;
const GRID_COLS = 8;
const GRID_ROWS = 6;
const LAUNCH_GAP = 120; // ms between packet launches
const MAX_PACKET_COUNT = 120;
const MAX_RUNS_FALLBACK = 15;

const dom = {
  networkCanvas: document.getElementById("networkCanvas"),
  nodeElements: Array.from(document.querySelectorAll(".hop-node")),
  topologyNodes: document.getElementById("topologyNodes"),
  topologyEdges: document.getElementById("topologyEdges"),
  stageLabel: document.getElementById("stageLabel"),
  statusDot: document.getElementById("statusDot"),
  runProgress: document.getElementById("runProgress"),
  packetCountInput: document.getElementById("packetCount"),
  packetCountValue: document.getElementById("packetCountValue"),
  packetCountError: document.getElementById("packetCountError"),
  latencyRange: document.getElementById("latencyRange"),
  jitterRange: document.getElementById("jitterRange"),
  lossRange: document.getElementById("lossRange"),
  latencyValue: document.getElementById("latencyValue"),
  jitterValue: document.getElementById("jitterValue"),
  lossValue: document.getElementById("lossValue"),
  speedRange: document.getElementById("speedRange"),
  speedValue: document.getElementById("speedValue"),
  patternSelect: document.getElementById("patternSelect"),
  presetSelect: document.getElementById("presetSelect"),
  applyPresetBtn: document.getElementById("applyPresetBtn"),
  topologySelect: document.getElementById("topologySelect"),
  hopCountInput: document.getElementById("hopCountInput"),
  hopCountError: document.getElementById("hopCountError"),
  starDestinationGroup: document.getElementById("starDestinationGroup"),
  starDestinationSelect: document.getElementById("starDestinationSelect"),
  linearDestinationGroup: document.getElementById("linearDestinationGroup"),
  linearDestinationSelect: document.getElementById("linearDestinationSelect"),
  linearSourceSelect: document.getElementById("linearSourceSelect"),
  linearSourceGroup: document.getElementById("linearSourceGroup"),
  applyTopologyBtn: document.getElementById("applyTopologyBtn"),
  annotationSelect: document.getElementById("annotationSelect"),
  applyAnnotationsBtn: document.getElementById("applyAnnotationsBtn"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  startBtnInline: document.getElementById("startBtnInline"),
  pauseBtnInline: document.getElementById("pauseBtnInline"),
  resetBtnInline: document.getElementById("resetBtnInline"),
  clearLogBtn: document.getElementById("clearLogBtn"),
  replayLogBtn: document.getElementById("replayLogBtn"),
  tabControls: document.getElementById("tabControls"),
  tabGuide: document.getElementById("tabGuide"),
  tabTopology: document.getElementById("tabTopology"),
  tabRuns: document.getElementById("tabRuns"),
  controlsTabPanel: document.getElementById("controlsTabPanel"),
  guideTabPanel: document.getElementById("guideTabPanel"),
  topologyTabPanel: document.getElementById("topologyTabPanel"),
  runsTabPanel: document.getElementById("runsTabPanel"),
  collapseToggle: document.getElementById("collapseToggle"),
  tabPanelsContainer: document.getElementById("tabPanelsContainer"),
  topologyPros: document.getElementById("topologyPros"),
  topologyCons: document.getElementById("topologyCons"),
  exportLastBtn: document.getElementById("exportLastBtn"),
  exportAllBtn: document.getElementById("exportAllBtn"),
  clearRunsBtn: document.getElementById("clearRunsBtn"),
  storageHint: document.getElementById("storageHint"),
  historyRuns: document.getElementById("historyRuns"),
  statCreated: document.getElementById("statCreated"),
  statDelivered: document.getElementById("statDelivered"),
  statLost: document.getElementById("statLost"),
  statRate: document.getElementById("statRate"),
  statAvgLatency: document.getElementById("statAvgLatency"),
  statPercentiles: document.getElementById("statPercentiles"),
  statJitterStd: document.getElementById("statJitterStd"),
  statSpan: document.getElementById("statSpan"),
  hopLossList: document.getElementById("hopLossList"),
  latencyBars: document.getElementById("latencyBars"),
  logContainer: document.getElementById("log"),
};

// --- Storage layer with IndexedDB + fallback to memory/localStorage ---
class RunStore {
  constructor() {
    this.mode = "pending"; // "idb" | "memory"
    this.dbPromise = null;
    this.memoryRuns = [];
    this.memoryId = 1;
  }

  async init() {
    if (!("indexedDB" in window)) {
      this.mode = "memory";
      this.loadFromLocalStorage();
      return this.mode;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("PacketSimDB", 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("runs")) {
          db.createObjectStore("runs", { keyPath: "id", autoIncrement: true });
        }
      };
      request.onsuccess = () => {
        this.mode = "idb";
        resolve(request.result);
      };
      request.onerror = () => {
        console.warn("IndexedDB error, falling back to memory", request.error);
        this.mode = "memory";
        this.loadFromLocalStorage();
        resolve(null);
      };
    });

    return this.mode;
  }

  async getDB() {
    if (this.mode !== "idb" || !this.dbPromise) return null;
    return this.dbPromise;
  }

  async list() {
    if (this.mode === "idb") {
      const db = await this.getDB();
      if (!db) return [];
      return new Promise((resolve, reject) => {
        const tx = db.transaction("runs", "readonly");
        const store = tx.objectStore("runs");
        const req = store.getAll();
        req.onsuccess = () => {
          const runs = req.result || [];
          runs.sort((a, b) => (b.id || 0) - (a.id || 0));
          resolve(runs);
        };
        req.onerror = () => reject(req.error);
      });
    }
    const runs = [...this.memoryRuns].sort((a, b) => (b.id || 0) - (a.id || 0));
    return runs;
  }

  async save(runRecord) {
    if (this.mode === "idb") {
      const db = await this.getDB();
      if (!db) return null;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("runs", "readwrite");
        const store = tx.objectStore("runs");
        const req = store.add(runRecord);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    const record = { ...runRecord, id: this.memoryId++ };
    this.memoryRuns.push(record);
    if (this.memoryRuns.length > MAX_RUNS_FALLBACK) {
      this.memoryRuns = this.memoryRuns.slice(-MAX_RUNS_FALLBACK);
    }
    this.persistToLocalStorage();
    return record.id;
  }

  async delete(id) {
    if (this.mode === "idb") {
      const db = await this.getDB();
      if (!db) return;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("runs", "readwrite");
        tx.objectStore("runs").delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    this.memoryRuns = this.memoryRuns.filter((r) => r.id !== id);
    this.persistToLocalStorage();
  }

  async clear() {
    if (this.mode === "idb") {
      const db = await this.getDB();
      if (!db) return;
      return new Promise((resolve, reject) => {
        const tx = db.transaction("runs", "readwrite");
        tx.objectStore("runs").clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
    this.memoryRuns = [];
    this.persistToLocalStorage();
  }

  persistToLocalStorage() {
    try {
      const payload = JSON.stringify({
        runs: this.memoryRuns,
        memoryId: this.memoryId,
      });
      localStorage.setItem("PacketSimFallbackRuns", payload);
    } catch (err) {
      console.warn("Could not persist fallback runs", err);
    }
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem("PacketSimFallbackRuns");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.memoryRuns = parsed.runs || [];
      this.memoryId = parsed.memoryId || 1;
    } catch (err) {
      console.warn("Could not parse fallback runs", err);
      this.memoryRuns = [];
      this.memoryId = 1;
    }
  }
}

// --- Utility functions ---
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function stdDev(values) {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Simulation app ---
class PacketSimApp {
  constructor() {
    this.store = new RunStore();
    this.nodePositions = [];
    this.currentNodes = [];
    this.activePackets = [];
    this.animationFrame = null;
    this.isPaused = false;
    this.runStartTime = 0;
    this.pausedAt = 0;
    this.pausedDuration = 0;
    this.currentRun = null; // holds run meta + schedules
    this.logEntries = [];
    this.supportsIndexedDB = "indexedDB" in window;
    this.tooltipEl = this.createTooltip();
    this.speedMultiplier = 1;
    this.trafficPattern = "steady";
    this.topologyShape = "linear";
    this.hopCount = NUM_HOPS;
    this.starSpokes = 4;
    this.starInputCount = 5; // user-entered count for star (spokes incl. server, excluding hub/client)
    this.starDestinationIndex = 0;
    this.linearDestination = "last"; // "last" or hop index (used for mesh/linear)
    this.linearInputCount = 5;
    this.linearSource = 0; // used for mesh start selection
    this.activePathNodes = null; // used for mesh path
    this.annotationMode = "router";
    this.stats = this.blankStats();

    this.bindEvents();
    this.updateControlLabels();
    this.attachTooltips();
    this.initTabs();
    this.renderTopology();
    this.updateTopologyProsCons(this.topologyShape);
    this.refreshStatus("ready", "Ready · no packets yet");
    this.initCollapsedState();

    this.store.init().then(() => {
      this.updateStorageHint();
      this.loadRunHistory();
    });

    window.addEventListener("resize", () => this.computeNodePositions());
  }

  blankStats() {
    const pathHops = this.pathHopCount();
    return {
      created: 0,
      delivered: 0,
      lost: 0,
      latencies: [],
      perHopLoss: Array(pathHops).fill(0),
      simulatedSpan: 0,
    };
  }

  initTabs() {
    // Restore saved tab state, or use default
    const savedTab = this.restoreTabState();
    if (savedTab) {
      this.showTab(savedTab);
    } else {
      this.showTab("controls");
    }
  }

  // Get simulator name from path for localStorage key
  getSimulatorName() {
    const path = window.location.pathname;
    const match = path.match(/simulators\/([^\/]+)/);
    return match ? match[1] : 'packet-journey';
  }

  // Save tab state to localStorage
  saveTabState(tabId) {
    try {
      const key = `tabState_${this.getSimulatorName()}`;
      localStorage.setItem(key, tabId);
    } catch (e) {
      console.warn('Failed to save tab state:', e);
    }
  }

  // Restore tab state from localStorage
  restoreTabState() {
    try {
      const key = `tabState_${this.getSimulatorName()}`;
      const savedTab = localStorage.getItem(key);
      if (savedTab && (savedTab === "controls" || savedTab === "guide" || savedTab === "topology" || savedTab === "runs")) {
        return savedTab;
      }
    } catch (e) {
      console.warn('Failed to restore tab state:', e);
    }
    return null;
  }

  showTab(name) {
    const isGuide = name === "guide";
    const isTopology = name === "topology";
    const isRuns = name === "runs";
    dom.controlsTabPanel.classList.toggle("hidden", isGuide || isTopology || isRuns);
    dom.guideTabPanel.classList.toggle("hidden", !isGuide);
    dom.topologyTabPanel.classList.toggle("hidden", !isTopology);
    dom.runsTabPanel?.classList.toggle("hidden", !isRuns);

    dom.tabControls.classList.toggle("tab-active", !isGuide && !isTopology && !isRuns);
    dom.tabGuide.classList.toggle("tab-active", isGuide);
    dom.tabTopology.classList.toggle("tab-active", isTopology);
    dom.tabRuns?.classList.toggle("tab-active", isRuns);
    dom.tabControls.setAttribute("aria-selected", (!isGuide && !isTopology && !isRuns).toString());
    dom.tabGuide.setAttribute("aria-selected", isGuide.toString());
    dom.tabTopology.setAttribute("aria-selected", isTopology.toString());
    dom.tabRuns?.setAttribute("aria-selected", isRuns.toString());
    
    // Save tab state (convert to actual tab name)
    const tabName = isGuide ? "guide" : isTopology ? "topology" : isRuns ? "runs" : "controls";
    this.saveTabState(tabName);
    
    if (isTopology) {
      const hopsDisplay =
        this.topologyShape === "star" ? this.starInputCount : this.hopCount;
      dom.hopCountInput.value = hopsDisplay;
      dom.topologySelect.value = this.topologyShape;
      dom.annotationSelect.value = this.annotationMode;
      if (this.topologyShape === "star") {
        dom.starDestinationGroup?.classList.add("visible");
        dom.linearDestinationGroup?.classList.remove("visible");
        dom.linearSourceGroup?.classList.remove("visible");
        this.updateStarDestinationOptions();
      } else if (this.topologyShape === "mesh") {
        dom.starDestinationGroup?.classList.remove("visible");
        dom.linearDestinationGroup?.classList.add("visible");
        dom.linearSourceGroup?.classList.add("visible");
        this.updateLinearDestinationOptions();
      } else {
        dom.starDestinationGroup?.classList.remove("visible");
        dom.linearDestinationGroup?.classList.add("visible");
        dom.linearSourceGroup?.classList.remove("visible");
        this.updateLinearDestinationOptions();
      }
    }
  }

  createTooltip() {
    const el = document.createElement("div");
    el.className = "tooltip-bubble";
    document.body.appendChild(el);
    return el;
  }

  attachTooltips() {
    const targets = document.querySelectorAll("[data-tooltip]");
    targets.forEach((el) => {
      const show = () => this.showTooltip(el);
      const hide = () => this.hideTooltip();
      el.addEventListener("mouseenter", show);
      el.addEventListener("focus", show);
      el.addEventListener("mouseleave", hide);
      el.addEventListener("blur", hide);
    });

    const hint = document.createElement("div");
    hint.className = "vis-hint";
    hint.textContent =
      "Latency = delay per hop · Jitter = randomness in that delay · Loss = chance a packet disappears on each hop. Runs stay local with logs you can replay.";
    const header = document.querySelector(".controls-header");
    if (header) header.appendChild(hint);
  }

  showTooltip(el) {
    if (!this.tooltipEl) return;
    const text = el.dataset.tooltip;
    if (!text) return;
    const rect = el.getBoundingClientRect();
    this.tooltipEl.textContent = text;
    this.tooltipEl.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
    this.tooltipEl.style.top = `${rect.bottom + window.scrollY + 14}px`;
    this.tooltipEl.classList.add("visible");
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove("visible");
  }

  bindEvents() {
    dom.latencyRange.addEventListener("input", () => this.updateControlLabels());
    dom.jitterRange.addEventListener("input", () => this.updateControlLabels());
    dom.lossRange.addEventListener("input", () => this.updateControlLabels());
    dom.speedRange.addEventListener("input", () => {
      this.speedMultiplier = Number(dom.speedRange.value);
      dom.speedValue.textContent = `${this.speedMultiplier.toFixed(1)}×`;
    });
    dom.patternSelect.addEventListener("change", () => {
      this.trafficPattern = dom.patternSelect.value || "steady";
    });
    dom.topologySelect.addEventListener("change", () => {
      const shape = dom.topologySelect.value || "linear";
      if (shape === "star") {
        dom.starDestinationGroup?.classList.add("visible");
        dom.linearDestinationGroup?.classList.remove("visible");
        dom.linearSourceGroup?.classList.remove("visible");
        this.updateStarDestinationOptions();
      } else if (shape === "mesh") {
        dom.starDestinationGroup?.classList.remove("visible");
        dom.linearDestinationGroup?.classList.add("visible");
        dom.linearSourceGroup?.classList.add("visible");
        this.updateLinearDestinationOptions();
      } else {
        dom.starDestinationGroup?.classList.remove("visible");
        dom.linearDestinationGroup?.classList.add("visible");
        dom.linearSourceGroup?.classList.remove("visible");
        this.updateLinearDestinationOptions();
      }
      this.updateTopologyProsCons(shape);
    });
    dom.applyPresetBtn.addEventListener("click", () => this.applyPreset());
    dom.linearDestinationSelect?.addEventListener("change", () => {
      this.linearDestination = dom.linearDestinationSelect.value || "last";
      this.updateTopologyProsCons(this.topologyShape);
      this.renderTopology();
    });
    dom.linearSourceSelect?.addEventListener("change", () => {
      this.linearSource = Math.max(0, Number(dom.linearSourceSelect.value) || 0);
      this.updateTopologyProsCons(this.topologyShape);
      this.renderTopology();
    });
    dom.packetCountInput.addEventListener("input", () => {
      dom.packetCountValue.textContent = dom.packetCountInput.value;
      dom.packetCountError.textContent = "";
    });

    if (dom.startBtn) dom.startBtn.addEventListener("click", () => this.startRun());
    if (dom.pauseBtn) dom.pauseBtn.addEventListener("click", () => this.togglePause());
    if (dom.resetBtn) dom.resetBtn.addEventListener("click", () => this.resetRun(true));
    dom.startBtnInline?.addEventListener("click", () => this.startRun());
    dom.pauseBtnInline?.addEventListener("click", () => this.togglePause());
    dom.resetBtnInline?.addEventListener("click", () => this.resetRun(true));
    dom.clearLogBtn.addEventListener("click", () => this.clearLog());
    dom.replayLogBtn.addEventListener("click", () => this.replayLatest());
    dom.exportLastBtn.addEventListener("click", () => this.exportLatest());
    dom.exportAllBtn.addEventListener("click", () => this.exportAll());
    dom.clearRunsBtn.addEventListener("click", () => this.clearHistory());
    dom.tabControls.addEventListener("click", () => this.showTab("controls"));
    dom.tabGuide.addEventListener("click", () => this.showTab("guide"));
    dom.tabTopology.addEventListener("click", () => this.showTab("topology"));
    dom.tabRuns?.addEventListener("click", () => this.showTab("runs"));
    dom.applyTopologyBtn.addEventListener("click", () => this.applyTopology());
    dom.applyAnnotationsBtn.addEventListener("click", () => this.applyAnnotations());
    dom.collapseToggle?.addEventListener("click", () => this.toggleControlsPanel());
    dom.starDestinationSelect?.addEventListener("change", () => {
      this.starDestinationIndex = Math.max(
        0,
        Math.min(this.starSpokes - 1, Number(dom.starDestinationSelect.value) - 1 || 0)
      );
      this.renderTopology();
    });
    window.addEventListener("scroll", () => this.hideTooltip());
  }

  updateControlLabels() {
    dom.latencyValue.textContent = `${dom.latencyRange.value} ms`;
    dom.jitterValue.textContent = `${dom.jitterRange.value} ms`;
    dom.lossValue.textContent = `${dom.lossRange.value} %`;
    dom.speedValue.textContent = `${Number(dom.speedRange.value).toFixed(1)}×`;
  }

  applyPreset() {
    const preset = (dom.presetSelect.value || "").toLowerCase();
    const presets = {
      good: { packetCount: 30, latency: 80, jitter: 20, loss: 1, speed: 1, pattern: "steady" },
      congested: { packetCount: 50, latency: 200, jitter: 120, loss: 8, speed: 1, pattern: "burst" },
      longhaul: { packetCount: 40, latency: 400, jitter: 150, loss: 3, speed: 1, pattern: "steady" },
      lossy: { packetCount: 30, latency: 150, jitter: 80, loss: 20, speed: 1, pattern: "random" },
    };
    const cfg = presets[preset];
    if (!cfg) return;
    dom.packetCountInput.value = cfg.packetCount;
    dom.latencyRange.value = cfg.latency;
    dom.jitterRange.value = cfg.jitter;
    dom.lossRange.value = cfg.loss;
    dom.speedRange.value = cfg.speed;
    dom.patternSelect.value = cfg.pattern;
    this.speedMultiplier = cfg.speed;
    this.trafficPattern = cfg.pattern;
    this.updateControlLabels();
  }

  pathHopCount() {
    if (this.topologyShape === "star") return 2;
    if (this.topologyShape === "mesh" && this.activePathNodes?.length) {
      return this.activePathNodes.length - 1;
    }
    if (this.topologyShape === "linear") {
      const dest = this.getLinearDestinationHop();
      return Math.max(1, dest - this.linearSource);
    }
    return this.hopCount;
  }

  getLinearDestinationHop() {
    const hopsInput = Math.max(2, Math.min(8, this.linearInputCount || this.hopCount || 2));
    const src = Math.max(0, Math.min(hopsInput - 1, this.linearSource || 0));
    if (this.linearDestination === "last") return hopsInput;
    const val = Number(this.linearDestination);
    if (Number.isNaN(val)) return hopsInput;
    return Math.max(src + 1, Math.min(hopsInput, val));
  }

  applyTopology() {
    const shape = dom.topologySelect.value || "linear";
    this.topologyShape = shape;
    const rawValue = Number(dom.hopCountInput.value) || 5;
    const requestedSpokes = Math.max(2, Math.min(9, rawValue));
    if (shape === "star") {
      // user input counts destinations (server included), but excludes hub/client
      this.starInputCount = requestedSpokes;
      this.starSpokes = Math.max(1, Math.min(8, requestedSpokes - 1));
      this.hopCount = this.starSpokes + 2; // total nodes for labels only
      this.updateStarDestinationOptions();
      dom.starDestinationGroup?.classList.add("visible");
      dom.hopCountInput.value = this.starInputCount;
      dom.linearDestinationGroup?.classList.remove("visible");
      dom.linearSourceGroup?.classList.remove("visible");
      this.linearSource = 0;
      this.linearDestination = "last";
    } else {
      this.linearInputCount = requestedSpokes;
      this.hopCount = requestedSpokes;
      dom.starDestinationGroup?.classList.remove("visible");
      dom.linearDestinationGroup?.classList.add("visible");
      dom.linearSourceGroup?.classList.toggle("visible", shape === "mesh");
      if (shape === "mesh") {
        this.updateLinearDestinationOptions();
      } else {
        this.linearSource = 0;
        this.linearDestination = "last";
        this.updateLinearDestinationOptions();
      }
    }
    this.updateTopologyProsCons(shape);
    NUM_HOPS = this.pathHopCount();
    dom.hopCountError.textContent = "";
    dom.hopCountInput.value = requestedSpokes;
    dom.hopCountInput.disabled = false;
    this.renderTopology();
    this.computeNodePositions();
    this.stats = this.blankStats();
    this.updateStatsUI();
  }

  updateStarDestinationOptions() {
    if (!dom.starDestinationSelect) return;
    dom.starDestinationSelect.innerHTML = "";
    const peers = Math.max(1, Math.min(8, this.starSpokes));
    const current = Math.max(0, Math.min(peers - 1, this.starDestinationIndex));
    this.starDestinationIndex = current;
    for (let i = 0; i < peers; i++) {
      const opt = document.createElement("option");
      opt.value = (i + 1).toString();
      opt.textContent = `Spoke ${i + 1} (server)`;
      if (i === current) opt.selected = true;
      dom.starDestinationSelect.appendChild(opt);
    }
  }

  updateLinearDestinationOptions() {
    if (!dom.linearDestinationSelect || !dom.linearSourceSelect) return;
    dom.linearDestinationSelect.innerHTML = "";
    dom.linearSourceSelect.innerHTML = "";
    const hops = Math.max(2, Math.min(8, this.linearInputCount || this.hopCount));
    const optLast = document.createElement("option");
    optLast.value = "last";
    optLast.textContent = "Last hop";
    dom.linearDestinationSelect.appendChild(optLast);
    for (let i = 0; i <= hops; i++) {
      const optSrc = document.createElement("option");
      optSrc.value = `${i}`;
      optSrc.textContent = i === 0 ? "Client (0)" : `Hop ${i}`;
      dom.linearSourceSelect.appendChild(optSrc);
      if (i > 0) {
        const optDest = document.createElement("option");
        optDest.value = `${i}`;
        optDest.textContent = `Hop ${i}`;
        dom.linearDestinationSelect.appendChild(optDest);
      }
    }
    const src = Math.max(0, Math.min(hops - 1, this.linearSource || 0));
    const val = this.linearDestination;
    if (val !== "last" && (Number(val) <= src || Number(val) > hops)) {
      this.linearDestination = "last";
    }
    dom.linearDestinationSelect.value = this.linearDestination;
    dom.linearSourceSelect.value = `${src}`;
    this.linearSource = src;
  }

  updateTopologyProsCons(shape = this.topologyShape) {
    if (!dom.topologyPros || !dom.topologyCons) return;
    const data = {
      linear: {
        pros: [
          "Simple, predictable path",
          "Easy to trace delays hop by hop",
          "Least visual clutter",
        ],
        cons: [
          "No redundancy; one bad hop breaks the path",
          "Can’t show alternate routes",
        ],
      },
      star: {
        pros: [
          "Easy to manage through a hub",
          "Failures isolated to spokes",
          "Clear client↔hub↔server flow",
        ],
        cons: [
          "Hub is a single point of failure",
          "Hub congestion affects all spokes",
        ],
      },
      mesh: {
        pros: [
          "Redundant links and alternate routes",
          "More fault tolerant than linear/star",
          "Can show shortest-path selection",
        ],
        cons: [
          "Busier graph; harder to read at a glance",
          "More links to manage/visualize",
        ],
      },
    };
    const { pros = [], cons = [] } = data[shape] || data.linear;
    dom.topologyPros.innerHTML = pros.map((p) => `<li>${p}</li>`).join("");
    dom.topologyCons.innerHTML = cons.map((c) => `<li>${c}</li>`).join("");
  }

  applyAnnotations() {
    this.annotationMode = dom.annotationSelect.value || "none";
    this.renderTopology();
    this.computeNodePositions();
  }

  annotateLabel(node) {
    if (this.annotationMode === "isp") {
      if (node.isClient) return "Home Wi‑Fi";
      if (node.isServer) return "Cloud service";
      if (node.id === 1) return "ISP gateway";
      if (node.id === 2) return "Backbone";
      return "Exchange";
    }
    if (this.annotationMode === "router") {
      if (node.label) return node.label;
      if (node.isClient) return "Client";
      if (node.isServer) return "Server";
      return `Router ${node.id}`;
    }
    return node.label || `Node ${node.id}`;
  }

  renderTopology() {
    const container = dom.topologyNodes;
    const svg = dom.topologyEdges;
    container.innerHTML = "";
    if (svg) svg.innerHTML = "";

    const maxLinear = 5;
    const hopsInput =
      this.topologyShape === "star"
        ? Math.max(3, Math.min(10, this.starSpokes + 2))
        : this.topologyShape === "linear"
        ? Math.max(2, Math.min(maxLinear, this.linearInputCount || this.hopCount))
        : Math.max(2, Math.min(8, this.hopCount));
    const linearDest =
      this.topologyShape === "linear"
        ? this.getLinearDestinationHop()
        : hopsInput;
    // store total hops (full chain) separately from destination hop
    this.hopCount = hopsInput;
    NUM_HOPS = this.pathHopCount();

    const nodes = this.buildGridNodes(this.topologyShape || "linear", hopsInput, linearDest);
    const colToPct = (col) => ((col + 0.5) / GRID_COLS) * 100;
    const rowToPct = (row) => ((row + 0.5) / GRID_ROWS) * 100;

    nodes.forEach((n) => {
      const div = document.createElement("div");
      const beyondLinearDest =
        this.topologyShape === "linear" &&
        typeof this.linearDestinationId === "number" &&
        n.hop > (Number(this.linearDestination) || n.hop);
      const classes =
        "hop-node" +
        (n.isClient ? " hop-node-client" : n.isServer ? " hop-node-server" : "") +
        (beyondLinearDest ? " inactive" : "");
      div.className = classes;
      div.style.left = `${colToPct(n.col)}%`;
      div.style.top = `${rowToPct(n.row)}%`;
      div.dataset.node = n.id;
      if (n.hop >= 0) div.dataset.hop = n.hop;
      div.dataset.col = n.col;
      div.dataset.row = n.row;
      div.innerHTML = `
        <div class="hop-node-label-main">${this.annotateLabel(n)}</div>
        <div class="hop-node-label-sub">${n.sub}</div>
        <div class="hop-node-id">${n.id}</div>
      `;
      container.appendChild(div);
    });

    this.nodeElements = Array.from(container.querySelectorAll(".hop-node")).sort(
      (a, b) => Number(a.dataset.node || 0) - Number(b.dataset.node || 0)
    );
    this.currentNodes = nodes;
    this.computeNodePositions();
  }

  buildGridNodes(shape = "linear", hops = this.hopCount, linearDestHop = this.getLinearDestinationHop()) {
    const centerRow = (GRID_ROWS - 1) / 2;
    const centerCol = (GRID_COLS - 1) / 2;
    const clampRow = (r) => clamp(r, 0, GRID_ROWS - 1);
    const clampCol = (c) => clamp(c, 0, GRID_COLS - 1);
    const nodes = [];

    const baseLabel = (id, isClient, isServer) =>
      isClient ? "Client" : isServer ? "Server" : `Router ${id}`;
    const baseSub = (id, isClient, isServer) =>
      isClient ? "Your device" : isServer ? "Destination" : `Hop ${id}`;

    if (shape === "star") {
      const hubCol = clampCol(centerCol);
      const hubRow = clampRow(centerRow);
      const spokes = Math.max(1, this.starSpokes || 1);
      const destIdx = Math.max(0, Math.min(spokes - 1, this.starDestinationIndex || 0));
      const nodesArr = [
        {
          id: 1,
          hop: 1,
          label: "Hub / Switch",
          sub: "Center of the star",
          col: hubCol,
          row: hubRow,
        },
      ];

      const margin = 0.9;
      const maxRadius = Math.min(
        centerCol - margin,
        GRID_COLS - 1 - margin - centerCol,
        centerRow - margin,
        GRID_ROWS - 1 - margin - centerRow
      );
      const radius = Math.max(1.6, maxRadius);
      const totalRadials = spokes + 1; // client + spokes (one is server)
      let nextPeerId = 3;
      for (let i = 0; i < totalRadials; i++) {
        const angle =
          (i / totalRadials) * Math.PI * 2 - Math.PI / 2 + (totalRadials % 2 === 0 ? Math.PI / totalRadials : 0);
        const isClient = i === 0;
        const isServer = !isClient && i - 1 === destIdx;
        const col = clampCol(hubCol + radius * Math.cos(angle));
        const row = clampRow(hubRow + radius * Math.sin(angle));
        let nodeId;
        if (isClient) {
          nodeId = 0;
        } else if (isServer) {
          nodeId = 2;
        } else {
          nodeId = nextPeerId++;
        }
        nodesArr.push({
          id: nodeId,
          hop: isServer ? 2 : isClient ? 0 : -1,
          isServer,
          isClient,
          label: isClient ? "Client" : isServer ? "Server" : `Peer ${nodeId}`,
          sub: isClient ? "Your device" : isServer ? "Destination" : "Other device",
          col,
          row,
        });
      }
      this.starServerId = 2;
      nodesArr.sort((a, b) => a.id - b.id);
      return nodesArr;
    }

    const span = GRID_COLS - 1;
    if (shape === "linear") {
      const pad = 0.8;
      const usable = GRID_COLS - 1 - pad * 2;
      const src = Math.max(0, Math.min(hops - 1, this.linearSource || 0));
      const destHop =
        this.linearDestination === "last"
          ? Math.max(src + 1, Math.min(hops, linearDestHop))
          : Math.max(src + 1, Math.min(hops, linearDestHop));
      for (let i = 0; i <= hops; i++) {
        const col = clampCol(pad + (usable * i) / hops);
        const row = centerRow;
        const isServer = i === destHop;
        const isClient = i === src;
        nodes.push({
          id: i,
          hop: i,
          isServer,
          isClient,
          label: baseLabel(i, isClient, isServer),
          sub: baseSub(i, isClient, isServer),
          col,
          row,
        });
      }
      return nodes;
    }

    if (shape === "mesh") {
      const margin = 0.9;
      const maxRadius = Math.min(
        centerCol - margin,
        GRID_COLS - 1 - margin - centerCol,
        centerRow - margin,
        GRID_ROWS - 1 - margin - centerRow
      );
      const radius = Math.max(1.8, maxRadius * 0.9);
      const total = hops + 1; // client + hops (server at last)
      const srcHop = Math.max(0, Math.min(hops - 1, this.linearSource || 0));
      const destHop =
        this.linearDestination === "last"
          ? hops
          : Math.max(srcHop + 1, Math.min(hops, Number(this.linearDestination) || hops));
      for (let i = 0; i < total; i++) {
        const angle =
          (i / total) * Math.PI * 2 - Math.PI / 2 + (total % 2 === 0 ? Math.PI / total : 0);
        const col = clampCol(centerCol + radius * Math.cos(angle));
        const row = clampRow(centerRow + radius * Math.sin(angle));
        const isClient = i === srcHop;
        const isServer = i === destHop;
        nodes.push({
          id: i,
          hop: i,
          isClient,
          isServer,
          label: baseLabel(i, isClient, isServer),
          sub: baseSub(i, isClient, isServer),
          col,
          row,
        });
      }
      return nodes;
    }

    for (let i = 0; i <= hops; i++) {
      const col = clampCol(Math.round((span * i) / hops));
      let row = centerRow;
      const wiggle = i === 0 || i === hops ? 0 : i % 2 === 0 ? -1 : 1;
      row = clampRow(centerRow + wiggle);
      nodes.push({
        id: i,
        hop: i,
        label: baseLabel(i),
        sub: baseSub(i),
        col,
        row,
      });
    }
    return nodes;
  }

  drawEdges(nodes = []) {
    const svg = dom.topologyEdges;
    if (!svg) return;
    const rect = dom.networkCanvas.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.setAttribute("width", rect.width);
    svg.setAttribute("height", rect.height);
    svg.innerHTML = "";

    const positions = this.nodePositions;
    const posById = new Map();
    positions.forEach((pos) => {
      posById.set(pos.id, pos);
    });
    let primaryEdges = [];
    let secondaryEdges = [];
    if (this.topologyShape === "star") {
      const hub = nodes.find((n) => n.hop === 1);
      const client = nodes.find((n) => n.isClient);
      const server = nodes.find((n) => n.isServer);
      if (hub && client && server) {
        primaryEdges = [
          [client.id, hub.id],
          [hub.id, server.id],
        ];
      }
      secondaryEdges = nodes
        .filter((n) => n.hop < 0)
        .map((n) => [hub?.id ?? 1, n.id]);
    } else if (this.topologyShape === "linear") {
      const hops = nodes.filter((n) => n.hop >= 0);
      const destHop =
        this.linearDestination === "last"
          ? hops[hops.length - 1]?.hop
          : Math.max(1, Math.min(hops[hops.length - 1]?.hop || 1, Number(this.linearDestination) || 1));
      for (let i = 1; i < hops.length; i++) {
        const from = hops[i - 1];
        const to = hops[i];
        const isBeyondDest = to.hop > destHop;
        if (!isBeyondDest) {
          primaryEdges.push([from.id, to.id]);
        } else {
          secondaryEdges.push([from.id, to.id]);
        }
      }
      this.linearDestinationId = hops.find((n) => n.hop === destHop)?.id;
    } else if (this.topologyShape === "mesh") {
      const hops = nodes.filter((n) => n.hop >= 0);
      const pathNodes = this.activePathNodes && this.activePathNodes.length
        ? this.activePathNodes
        : hops.map((n) => n.id);
      for (let i = 1; i < pathNodes.length; i++) {
        primaryEdges.push([pathNodes[i - 1], pathNodes[i]]);
      }
      // complete graph secondary edges
      for (let i = 0; i < hops.length; i++) {
        for (let j = i + 1; j < hops.length; j++) {
          const pair = [hops[i].id, hops[j].id];
          const isPrimary = primaryEdges.some(
            ([a, b]) => (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0])
          );
          if (!isPrimary) secondaryEdges.push(pair);
        }
      }
    } else {
      for (let i = 1; i < nodes.length; i++) {
        primaryEdges.push([i - 1, i]);
      }
    }
    const allEdges = [...primaryEdges, ...secondaryEdges];
    const seen = new Set();
    allEdges.forEach(([from, to], idx) => {
      const key = `${from}-${to}`;
      if (seen.has(key) || from === to) return;
      seen.add(key);
      const a = posById.get(from);
      const b = posById.get(to);
      if (!a || !b) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.left);
      line.setAttribute("y1", a.top);
      line.setAttribute("x2", b.left);
      line.setAttribute("y2", b.top);
      line.setAttribute(
        "class",
        "topology-edge" + (idx < primaryEdges.length ? " edge-primary" : " edge-secondary")
      );
      svg.appendChild(line);
    });
  }

  computeNodePositions() {
    const rect = dom.networkCanvas.getBoundingClientRect();
    this.nodePositions = this.nodeElements.map((node) => {
      const r = node.getBoundingClientRect();
      return {
        left: r.left - rect.left + r.width / 2,
        top: r.top - rect.top + r.height / 2,
        gridCol: Number(node.dataset.col || 0),
        gridRow: Number(node.dataset.row || 0),
        id: Number(node.dataset.node || 0),
      };
    });
    if (this.currentNodes && this.currentNodes.length) {
      this.drawEdges(this.currentNodes);
    }
  }

  validateInputs() {
    const packetCount = Number(dom.packetCountInput.value);
    if (
      Number.isNaN(packetCount) ||
      packetCount < 1 ||
      packetCount > MAX_PACKET_COUNT
    ) {
      dom.packetCountError.textContent = `Enter 1–${MAX_PACKET_COUNT} packets`;
      return null;
    }
    dom.packetCountError.textContent = "";
    return {
      packetCount,
      baseLatency: Number(dom.latencyRange.value),
      jitter: Number(dom.jitterRange.value),
      lossPerHop: Number(dom.lossRange.value) / 100,
    };
  }

  resetRun(hard) {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.activePackets.forEach((p) => p.el.remove());
    this.activePackets = [];
    this.currentRun = null;
    this.logEntries = hard ? [] : this.logEntries;
    this.isPaused = false;
    this.runStartTime = 0;
    this.pausedAt = 0;
    this.pausedDuration = 0;
    this.stats = this.blankStats();
    if (this.topologyShape === "mesh") {
      this.activePathNodes = null;
    }
    dom.runProgress.style.width = "0%";
    if (dom.pauseBtn) {
      dom.pauseBtn.textContent = "❚❚ Pause";
      dom.pauseBtn.disabled = true;
    }
    if (dom.pauseBtnInline) {
      dom.pauseBtnInline.textContent = "❚❚ Pause";
      dom.pauseBtnInline.disabled = true;
    }
    if (dom.pauseBtnInline) {
      dom.pauseBtnInline.textContent = "❚❚ Pause";
      dom.pauseBtnInline.disabled = true;
    }
    dom.replayLogBtn.disabled = true;
    this.updateStatsUI();
    if (hard) {
      this.refreshStatus("ready", "Ready · no packets yet");
      dom.logContainer.innerHTML = "";
    }
    this.setControlsEnabled(true);
  }

  startRun(options = {}) {
    if (this.currentRun && !this.currentRun.finished && !options.replay) {
      return;
    }

    // ensure hop count aligns with current topology (star is always 2 hops)
    if (this.topologyShape === "mesh") {
      this.activePathNodes = this.buildMeshPath();
    } else {
      this.activePathNodes = null;
    }
    NUM_HOPS = this.pathHopCount();

    const settings = options.replay
      ? options.settings
      : this.validateInputs();
    if (!settings) return;

    this.resetRun(false);
    if (!options.replay) {
      this.clearLog();
    }
    this.collapseControlsPanel();
    this.computeNodePositions();

    const packetCount = options.replay
      ? options.schedule.length
      : clamp(settings.packetCount, 1, MAX_PACKET_COUNT);
    dom.packetCountInput.value = packetCount;
    dom.packetCountValue.textContent = packetCount;

    const normalizedSettings = {
      ...settings,
      lossPerHop: clamp(settings.lossPerHop ?? 0, 0, 1),
    };

    const schedule =
      options.schedule ||
      this.buildSchedule(
        packetCount,
        normalizedSettings.baseLatency,
        normalizedSettings.jitter,
        normalizedSettings.lossPerHop,
        this.trafficPattern
      );

    // refresh stats to current hop count
    this.stats = this.blankStats();
    this.currentRun = {
      id: Date.now(),
      schedule,
      packetCount,
      settings: normalizedSettings,
      finished: false,
      simDuration: Math.max(
        ...schedule.map((p) => (p.hops.length ? p.hops[p.hops.length - 1].end : 0))
      ),
      packetsData: {},
      replayMode: Boolean(options.replay),
    };

    this.stats.created = packetCount;
    this.stats.simulatedSpan = this.currentRun.simDuration;
    this.renderPackets(packetCount);
    this.refreshStatus("running", options.replay ? "Replaying saved run" : "Running · packets in flight");
    dom.replayLogBtn.disabled = true;
    this.setControlsEnabled(false);
    if (dom.pauseBtn) dom.pauseBtn.disabled = false;
    if (dom.startBtnInline) dom.startBtnInline.disabled = true;
    if (dom.pauseBtnInline) dom.pauseBtnInline.disabled = false;
    dom.runProgress.style.width = "0%";
    this.logEntries = options.replay ? options.log?.slice() || [] : [];
    if (!options.replay) {
      this.appendLog(`Run started with ${packetCount} packets.`);
    } else {
      dom.logContainer.innerHTML = "";
      this.logEntries.forEach((entry) => this.renderLogEntry(entry));
      this.appendLog(`Replay started for run #${options.runId ?? "?"}.`);
    }

    this.runStartTime = performance.now();
    this.pausedDuration = 0;
    this.isPaused = false;
    this.tick();
  }

  buildMeshPath() {
    const nodes = this.currentNodes || [];
    const client = nodes.find((n) => n.isClient) || nodes.find((n) => n.id === 0);
    const maxHop = Math.max(...nodes.map((n) => n.hop));
    const serverHop =
      this.linearDestination === "last"
        ? maxHop
        : Math.max(1, Math.min(maxHop, Number(this.linearDestination) || maxHop));
    const server = nodes.find((n) => n.hop === serverHop) || nodes.find((n) => n.isServer);
    const startHop = Math.max(0, Math.min(maxHop - 1, this.linearSource || 0));
    const startNode = nodes.find((n) => n.hop === startHop) || client;
    const path = [];
    if (startNode) path.push(startNode.id);
    if (server && server.id !== startNode?.id) path.push(server.id);
    return path;
  }

  setControlsEnabled(enabled) {
    if (dom.startBtn) dom.startBtn.disabled = !enabled;
    if (dom.startBtnInline) dom.startBtnInline.disabled = !enabled;
    dom.packetCountInput.disabled = !enabled;
    dom.latencyRange.disabled = !enabled;
    dom.jitterRange.disabled = !enabled;
    dom.lossRange.disabled = !enabled;
  }

  refreshStatus(kind, message) {
    dom.stageLabel.textContent = message;
    dom.statusDot.classList.remove(
      "status-ready",
      "status-running",
      "status-paused",
      "status-finished"
    );
    const statusClass =
      kind === "running"
        ? "status-running"
        : kind === "paused"
        ? "status-paused"
        : kind === "finished"
        ? "status-finished"
        : "status-ready";
    dom.statusDot.classList.add(statusClass);
  }

  renderPackets(count) {
    const startNodeId =
      this.topologyShape === "mesh" && this.activePathNodes?.length
        ? this.activePathNodes[0]
        : 0;
    const startPos = this.nodePositions.find((p) => p.id === startNodeId);
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "packet packet-inflight";
      if (startPos) {
        el.style.left = `${startPos.left}px`;
        el.style.top = `${startPos.top}px`;
      }
      dom.networkCanvas.appendChild(el);
      this.activePackets.push({
        id: i + 1,
        el,
        state: "pending",
        lastHandledHop: -1,
        createdLogged: false,
      });
    }
    this.stats.created = count;
    this.updateStatsUI();
  }

  buildSchedule(packetCount, baseLatency, jitter, lossPerHop, pattern = "steady") {
    const schedule = [];
    let launchAccumulator = 0;
    const groupSize = 5;
    const burstGap = 320;
    const inBurstGap = 50;
    for (let i = 0; i < packetCount; i++) {
      let launchAt = 0;
      if (pattern === "steady") {
        launchAt = i * LAUNCH_GAP;
      } else if (pattern === "burst") {
        const group = Math.floor(i / groupSize);
        const within = i % groupSize;
        launchAt = group * burstGap + within * inBurstGap;
      } else if (pattern === "random") {
        const gap = 60 + Math.random() * 200;
        launchAt = launchAccumulator + gap;
        launchAccumulator = launchAt;
      } else {
        launchAt = i * LAUNCH_GAP;
      }
      const hops = [];
      // build path for mesh or linear with custom source/dest
      let pathNodes =
        this.topologyShape === "mesh" && this.activePathNodes?.length
          ? this.activePathNodes
          : Array.from({ length: NUM_HOPS + 1 }, (_, idx) => idx);
      if (this.topologyShape === "linear") {
        const destHop =
          this.linearDestination === "last"
            ? NUM_HOPS
            : Math.max(1, Math.min(NUM_HOPS, Number(this.linearDestination) || NUM_HOPS));
        const src = Math.max(0, Math.min(NUM_HOPS - 1, this.linearSource || 0));
        pathNodes = [];
        for (let h = src; h <= destHop; h++) pathNodes.push(h);
      }
      let current = launchAt;
      let lostAtHop = null;
      for (let hop = 1; hop <= NUM_HOPS; hop++) {
        const hopLatency = Math.max(
          20,
          baseLatency + (jitter > 0 ? (Math.random() * 2 - 1) * jitter : 0)
        );
        const end = current + hopLatency;
        const lostHere = Math.random() < lossPerHop;
        hops.push({
          hopIndex: hop,
          start: current,
          end,
          duration: hopLatency,
          lostHere,
          fromNode: pathNodes[hop - 1],
          toNode: pathNodes[hop],
        });
        current = end;
        if (lostHere) {
          lostAtHop = hop;
          break;
        }
      }
      schedule.push({
        id: i + 1,
        launchAt,
        hops,
        lostAtHop,
      });
    }
    return schedule;
  }

  getSimTime() {
    if (!this.runStartTime) return 0;
    const now = performance.now();
    if (this.isPaused) {
      return (this.pausedAt - this.runStartTime - this.pausedDuration) * this.speedMultiplier;
    }
    return (now - this.runStartTime - this.pausedDuration) * this.speedMultiplier;
  }

  tick() {
    if (!this.currentRun || this.currentRun.finished) return;
    if (this.isPaused) return;

    const simTime = this.getSimTime();
    const allDone = this.updatePackets(simTime);
    const progress = clamp(simTime / (this.currentRun.simDuration || 1), 0, 1);
    dom.runProgress.style.width = `${progress * 100}%`;

    if (allDone || simTime >= this.currentRun.simDuration + 200) {
      this.finishRun();
      return;
    }

    this.animationFrame = requestAnimationFrame(() => this.tick());
  }

  updatePackets(simTime) {
    let completed = 0;
    this.currentRun.schedule.forEach((schedule, idx) => {
      const packet = this.activePackets[idx];
      if (!packet) return;
      if (packet.state === "delivered" || packet.state === "lost") {
        completed += 1;
        return;
      }

      if (simTime < schedule.launchAt) {
        this.positionAtNode(packet.el, 0);
        return;
      }

      if (!packet.createdLogged) {
        this.appendLog(
          `Packet ${schedule.id} created at client.`,
          schedule.launchAt
        );
        packet.createdLogged = true;
      }

      const hops = schedule.hops;
      if (!hops.length) {
        packet.state = "lost";
        this.markLost(schedule.id, 0, simTime, schedule.hops);
        completed += 1;
        return;
      }

      // Handle hop completions that happened before this frame
      while (
        packet.lastHandledHop + 1 < hops.length &&
        simTime >= hops[packet.lastHandledHop + 1].end &&
        packet.state !== "lost" &&
        packet.state !== "delivered"
      ) {
        const hop = hops[packet.lastHandledHop + 1];
        this.handleHopComplete(schedule, packet, hop);
      }

      if (packet.state === "delivered" || packet.state === "lost") {
        completed += 1;
        return;
      }

      // Position during active hop
      const activeHop =
        hops.find((h) => simTime >= h.start && simTime <= h.end) ||
        hops[Math.min(hops.length - 1, packet.lastHandledHop + 1)];
      if (activeHop) {
        const progress = clamp(
          (simTime - activeHop.start) / (activeHop.duration || 1),
          0,
          1
        );
        const fromIdx = activeHop.hopIndex - 1;
        const toIdx = activeHop.hopIndex;
        this.positionBetween(packet.el, fromIdx, toIdx, progress);
      }
    });

    return completed >= this.currentRun.packetCount;
  }

  handleHopComplete(schedule, packet, hop) {
    packet.lastHandledHop = hop.hopIndex - 1;
    if (hop.lostHere) {
      packet.state = "lost";
      this.markLost(schedule.id, hop.hopIndex, hop.end, schedule.hops);
      this.positionAtNode(packet.el, hop.hopIndex);
      return;
    }

    if (hop.hopIndex === NUM_HOPS) {
      packet.state = "delivered";
      this.markDelivered(schedule.id, hop.end, schedule.launchAt, schedule.hops);
      this.positionAtNode(packet.el, hop.hopIndex);
      return;
    }

    this.appendLog(
      `Packet ${schedule.id} reached hop ${hop.hopIndex}.`,
      hop.end
    );
  }

  positionAtNode(el, nodeIndex) {
    let nodeId = nodeIndex;
    if (this.topologyShape === "mesh" && this.activePathNodes?.length) {
      nodeId = this.activePathNodes[nodeIndex] ?? nodeIndex;
    }
    const pos = this.nodePositions.find((p) => p.id === nodeId);
    if (!pos) return;
    el.style.left = `${pos.left}px`;
    el.style.top = `${pos.top}px`;
  }

  positionBetween(el, fromIndex, toIndex, progress) {
    let fromId = fromIndex;
    let toId = toIndex;
    if (this.topologyShape === "mesh" && this.activePathNodes?.length) {
      fromId = this.activePathNodes[fromIndex] ?? fromIndex;
      toId = this.activePathNodes[toIndex] ?? toIndex;
    }
    const from = this.nodePositions.find((p) => p.id === fromId);
    const to = this.nodePositions.find((p) => p.id === toId);
    if (!from || !to) return;
    const left = from.left + (to.left - from.left) * progress;
    const top = from.top + (to.top - from.top) * progress;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  markLost(packetId, hopIndex, timeMs, hops = []) {
    const packet = this.activePackets.find((p) => p.id === packetId);
    if (packet) {
      packet.el.classList.remove("packet-inflight");
      packet.el.classList.add("packet-lost");
    }
    this.stats.lost += 1;
    if (hopIndex > 0 && hopIndex <= NUM_HOPS) {
      this.stats.perHopLoss[hopIndex - 1] += 1;
    }
    this.appendLog(
      `Packet ${packetId} lost between hop ${hopIndex - 1} and ${hopIndex}.`,
      timeMs,
      "lost"
    );
    this.updateStatsUI();
    this.currentRun.packetsData[packetId] = {
      id: packetId,
      delivered: false,
      lostAtHop: hopIndex,
      endToEndLatencyMs: null,
      hops,
    };
  }

  markDelivered(packetId, timeMs, launchAt, hops) {
    const packet = this.activePackets.find((p) => p.id === packetId);
    if (packet) {
      packet.el.classList.remove("packet-inflight");
      packet.el.classList.add("packet-delivered");
    }
    const latency = timeMs - launchAt;
    this.stats.delivered += 1;
    this.stats.latencies.push(latency);
    this.appendLog(`Packet ${packetId} delivered to server.`, timeMs, "delivered");
    this.updateStatsUI();
    this.currentRun.packetsData[packetId] = {
      id: packetId,
      delivered: true,
      lostAtHop: null,
      endToEndLatencyMs: latency,
      hops,
    };
  }

  finishRun() {
    if (!this.currentRun || this.currentRun.finished) return;
    this.currentRun.finished = true;
    this.refreshStatus(
      "finished",
      "Finished · run saved in local history and ready to export"
    );
    if (dom.pauseBtn) dom.pauseBtn.disabled = true;
    if (dom.pauseBtnInline) dom.pauseBtnInline.disabled = true;
    dom.replayLogBtn.disabled = false;
    this.setControlsEnabled(true);

    const { created, delivered, lost, latencies, simulatedSpan, perHopLoss } =
      this.stats;
    const deliveryRate = created > 0 ? (delivered / created) * 100 : 0;
    const avgLatency =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : null;
    const minLatency = latencies.length ? Math.min(...latencies) : null;
    const maxLatency = latencies.length ? Math.max(...latencies) : null;
    const p50 = percentile(latencies, 50);
    const p90 = percentile(latencies, 90);
    const p95 = percentile(latencies, 95);
    const p99 = percentile(latencies, 99);
    const jitterStd = stdDev(latencies);

    const runSettings = this.currentRun.settings || {};
    const runRecord = {
      createdAt: new Date().toISOString(),
      settings: {
        packetCount: this.currentRun.packetCount,
        baseLatencyPerHopMs:
          runSettings.baseLatency ?? Number(dom.latencyRange.value),
        jitterMs: runSettings.jitter ?? Number(dom.jitterRange.value),
        lossPerHopPercent:
          runSettings.lossPerHop != null
            ? Math.round(runSettings.lossPerHop * 10000) / 100
            : Number(dom.lossRange.value),
        hops: NUM_HOPS,
        speedMultiplier: this.speedMultiplier,
        trafficPattern: this.trafficPattern,
      },
      summary: {
        created,
        delivered,
        lost,
        deliveryRate,
        avgLatency,
        minLatency,
        maxLatency,
        p50,
        p90,
        p95,
        p99,
        jitterStd,
        simulatedSpan,
        perHopLoss: [...perHopLoss],
      },
      schedule: this.currentRun.schedule,
      packets: Object.values(this.currentRun.packetsData),
      log: this.logEntries,
    };

    this.store
      .save(runRecord)
      .then((id) => {
        runRecord.id = id;
        this.loadRunHistory();
      })
      .catch((err) => console.error("Error saving run", err));
  }

  appendLog(message, timeMs = this.getSimTime(), type = "info") {
    const entry = {
      timeMs: Math.round(timeMs),
      message,
      type,
    };
    this.logEntries.push(entry);
    this.renderLogEntry(entry);
  }

  renderLogEntry(entry) {
    const el = document.createElement("div");
    el.className = "log-entry";
    if (entry.type === "lost") el.classList.add("log-lost");
    if (entry.type === "delivered") el.classList.add("log-delivered");

    const timeSpan = document.createElement("span");
    timeSpan.className = "log-time";
    timeSpan.textContent = `t=${entry.timeMs.toString().padStart(4, " ")} ms`;

    const msgSpan = document.createElement("span");
    msgSpan.textContent = entry.message;

    el.appendChild(timeSpan);
    el.appendChild(msgSpan);
    dom.logContainer.appendChild(el);
    dom.logContainer.scrollTop = dom.logContainer.scrollHeight;
  }

  updateStatsUI() {
    const { created, delivered, lost, latencies, simulatedSpan, perHopLoss } =
      this.stats;
    dom.statCreated.textContent = created;
    dom.statDelivered.textContent = delivered;
    dom.statLost.textContent = lost;
    const rate = created > 0 ? (delivered / created) * 100 : 0;
    dom.statRate.textContent = `${Math.round(rate)}%`;

    if (latencies.length > 0) {
      const sum = latencies.reduce((a, b) => a + b, 0);
      const avg = sum / latencies.length;
      dom.statAvgLatency.textContent = `${Math.round(avg)} ms`;
      const p50 = percentile(latencies, 50);
      const p90 = percentile(latencies, 90);
      const p95 = percentile(latencies, 95);
      const p99 = percentile(latencies, 99);
      dom.statPercentiles.textContent = `${Math.round(p50)} / ${Math.round(
        p90
      )} / ${Math.round(p99)} ms`;
      const jitterStd = stdDev(latencies);
      dom.statJitterStd.textContent = jitterStd
        ? `${Math.round(jitterStd)} ms`
        : "–";
    } else {
      dom.statAvgLatency.textContent = "0 ms";
      dom.statPercentiles.textContent = "–";
      dom.statJitterStd.textContent = "–";
    }

    dom.statSpan.textContent = `${Math.round(simulatedSpan)} ms`;
    this.renderPerHopLoss(perHopLoss);
    this.renderHistogram(latencies);
  }

  renderPerHopLoss(perHopLoss) {
    dom.hopLossList.innerHTML = "";
    perHopLoss.forEach((loss, idx) => {
      const chip = document.createElement("span");
      chip.className = "hop-loss-chip";
      chip.textContent = `Hop ${idx + 1}: ${loss}`;
      dom.hopLossList.appendChild(chip);
      const node = dom.topologyNodes.querySelector(`[data-hop="${idx + 1}"]`);
      if (node) {
        node.setAttribute("data-loss", loss);
      }
    });
  }

  renderHistogram(latencies) {
    dom.latencyBars.innerHTML = "";
    const bars = latencies.length ? 5 : 0;
    if (!bars) {
      for (let i = 0; i < 5; i++) {
        const bar = this.createHistogramBar(`–`, 0);
        dom.latencyBars.appendChild(bar);
      }
      return;
    }

    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const range = Math.max(1, max - min);
    const bucketSize = range / 5;
    const buckets = Array(5).fill(0);
    latencies.forEach((lat) => {
      let bucket = Math.floor((lat - min) / bucketSize);
      if (bucket === 5) bucket = 4;
      buckets[bucket] += 1;
    });
    const maxCount = Math.max(...buckets, 1);
    for (let i = 0; i < 5; i++) {
      const start = min + i * bucketSize;
      const end = i === 4 ? max : start + bucketSize;
      const label = `${Math.round(start)}-${Math.round(end)} ms`;
      const fill = Math.round((buckets[i] / maxCount) * 100);
      dom.latencyBars.appendChild(this.createHistogramBar(label, fill, buckets[i]));
    }
  }

  createHistogramBar(label, fillWidth, count = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = "histogram-bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${fillWidth}%`;
    const text = document.createElement("div");
    text.className = "bar-label";
    text.textContent = `${label} · ${count}`;
    wrapper.appendChild(fill);
    wrapper.appendChild(text);
    return wrapper;
  }

  clearLog() {
    dom.logContainer.innerHTML = "";
    this.logEntries = [];
  }

  async loadRunHistory() {
    const runs = await this.store.list();
    if (!runs.length) {
      dom.historyRuns.innerHTML =
        '<p class="stat-hint">No saved runs yet. Start a simulation to create one.</p>';
      dom.replayLogBtn.disabled = true;
      return;
    }

    dom.historyRuns.innerHTML = "";
    runs.forEach((run) => {
      const item = document.createElement("div");
      item.className = "history-item";

      const row = document.createElement("div");
      row.className = "history-row";
      const title = document.createElement("div");
      title.className = "history-title";
      const deliveryRate =
        run.summary && typeof run.summary.deliveryRate === "number"
          ? `${Math.round(run.summary.deliveryRate)}%`
          : "–";
      title.textContent = `Run #${run.id ?? "?"} · ${deliveryRate} delivered`;

      const buttons = document.createElement("div");
      buttons.className = "history-buttons";
      const replayBtn = document.createElement("button");
      replayBtn.className = "btn-secondary";
      replayBtn.textContent = "↺ Replay";
      replayBtn.addEventListener("click", () => this.replayRun(run));
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-secondary";
      deleteBtn.textContent = "✕ Delete";
      deleteBtn.addEventListener("click", () => this.deleteRun(run.id));
      buttons.appendChild(replayBtn);
      buttons.appendChild(deleteBtn);

      row.appendChild(title);
      row.appendChild(buttons);

      const createdDate = run.createdAt ? new Date(run.createdAt) : null;
      const timeLabel = createdDate
        ? createdDate.toLocaleTimeString()
        : "Unknown time";
      const meta = document.createElement("div");
      meta.className = "history-meta";
      meta.textContent = `${timeLabel} · packets: ${
        run.summary?.created ?? "?"
      } · avg: ${
        run.summary?.avgLatency != null
          ? `${Math.round(run.summary.avgLatency)} ms`
          : "–"
      }`;

      item.appendChild(row);
      item.appendChild(meta);
      dom.historyRuns.appendChild(item);
    });

    dom.replayLogBtn.disabled = false;
  }

  async deleteRun(id) {
    await this.store.delete(id);
    this.loadRunHistory();
  }

  async replayRun(run) {
    if (!run.schedule) {
      alert("This run does not contain a replayable schedule.");
      return;
    }
    this.startRun({
      replay: true,
      schedule: run.schedule,
      log: run.log,
      settings: {
        packetCount: run.settings?.packetCount ?? run.schedule.length,
        baseLatency: run.settings?.baseLatencyPerHopMs ?? 200,
        jitter: run.settings?.jitterMs ?? 0,
        lossPerHop: (run.settings?.lossPerHopPercent ?? 0) / 100,
      },
      runId: run.id,
    });
  }

  async replayLatest() {
    const runs = await this.store.list();
    if (!runs.length) return;
    this.replayRun(runs[0]);
  }

  async exportLatest() {
    const runs = await this.store.list();
    if (!runs.length) {
      alert("No saved runs to export yet.");
      return;
    }
    const latest = runs[0];
    downloadJSON("packet_sim_last_run.json", {
      meta: {
        exportedAt: new Date().toISOString(),
        type: "packet_simulation_run",
        runsIncluded: 1,
      },
      run: latest,
    });
  }

  async exportAll() {
    const runs = await this.store.list();
    if (!runs.length) {
      alert("No saved runs to export yet.");
      return;
    }
    downloadJSON("packet_sim_all_runs.json", {
      meta: {
        exportedAt: new Date().toISOString(),
        type: "packet_simulation_all_runs",
        count: runs.length,
      },
      runs,
    });
  }

  async clearHistory() {
    await this.store.clear();
    this.loadRunHistory();
  }

  updateStorageHint() {
    if (this.store.mode === "idb") {
      dom.storageHint.textContent =
        "Runs are stored using IndexedDB and stay on this device.";
    } else {
      dom.storageHint.textContent =
        "IndexedDB unavailable; storing the last few runs in memory/localStorage.";
    }
  }

  togglePause() {
    if (!this.currentRun || this.currentRun.finished) return;
    if (!this.isPaused) {
      this.isPaused = true;
      this.pausedAt = performance.now();
      if (dom.pauseBtn) dom.pauseBtn.textContent = "▶ Resume";
      if (dom.pauseBtnInline) dom.pauseBtnInline.textContent = "▶ Resume";
      this.refreshStatus("paused", "Paused · packets hold position");
    } else {
      this.isPaused = false;
      this.pausedDuration += performance.now() - this.pausedAt;
      if (dom.pauseBtn) dom.pauseBtn.textContent = "❚❚ Pause";
      if (dom.pauseBtnInline) dom.pauseBtnInline.textContent = "❚❚ Pause";
      this.refreshStatus("running", "Running · packets in flight");
      this.tick();
    }
  }

  initCollapsedState() {
    if (!dom.tabPanelsContainer || !dom.collapseToggle) return;
    const isCollapsed = dom.tabPanelsContainer.classList.contains("collapsed");
    const toggleIcon = dom.collapseToggle.querySelector(".toggle-icon");
    if (toggleIcon) {
      toggleIcon.textContent = isCollapsed ? "▲" : "▼";
    }
    dom.collapseToggle.setAttribute("aria-expanded", (!isCollapsed).toString());
    dom.collapseToggle.setAttribute("aria-label", isCollapsed ? "Show controls panel" : "Hide controls panel");
    dom.collapseToggle.setAttribute("title", isCollapsed ? "Show controls" : "Hide controls");
  }

  collapseControlsPanel() {
    if (!dom.tabPanelsContainer || !dom.collapseToggle) return;
    if (!dom.tabPanelsContainer.classList.contains("collapsed")) {
      dom.tabPanelsContainer.classList.add("collapsed");
      const toggleIcon = dom.collapseToggle.querySelector(".toggle-icon");
      if (toggleIcon) {
        toggleIcon.textContent = "▲";
      }
      dom.collapseToggle.setAttribute("aria-expanded", "false");
      dom.collapseToggle.setAttribute("aria-label", "Show controls panel");
      dom.collapseToggle.setAttribute("title", "Show controls");
    }
  }

  toggleControlsPanel() {
    if (!dom.tabPanelsContainer || !dom.collapseToggle) return;
    const isCollapsed = dom.tabPanelsContainer.classList.toggle("collapsed");
    const toggleIcon = dom.collapseToggle.querySelector(".toggle-icon");
    if (toggleIcon) {
      toggleIcon.textContent = isCollapsed ? "▲" : "▼";
    }
    dom.collapseToggle.setAttribute("aria-expanded", (!isCollapsed).toString());
    dom.collapseToggle.setAttribute("aria-label", isCollapsed ? "Show controls panel" : "Hide controls panel");
    dom.collapseToggle.setAttribute("title", isCollapsed ? "Show controls" : "Hide controls");
  }

  resetRun(hard) {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
    this.activePackets.forEach((p) => p.el.remove());
    this.activePackets = [];
    this.currentRun = null;
    this.logEntries = hard ? [] : this.logEntries;
    this.isPaused = false;
    this.runStartTime = 0;
    this.pausedAt = 0;
    this.pausedDuration = 0;
    this.stats = this.blankStats();
    dom.runProgress.style.width = "0%";
    if (dom.pauseBtn) {
      dom.pauseBtn.textContent = "❚❚ Pause";
      dom.pauseBtn.disabled = true;
    }
    if (dom.pauseBtnInline) {
      dom.pauseBtnInline.textContent = "❚❚ Pause";
      dom.pauseBtnInline.disabled = true;
    }
    dom.replayLogBtn.disabled = true;
    this.updateStatsUI();
    if (hard) {
      this.refreshStatus("ready", "Ready · no packets yet");
      dom.logContainer.innerHTML = "";
    }
    this.setControlsEnabled(true);
  }
}

new PacketSimApp();
