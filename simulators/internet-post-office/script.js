// Simple Internet Post Office – Packet Simulator
// Style C (hybrid: clean + playful)

const neighborhoodById = new Map();

const neighborhoods = [
  {
    id: "A",
    name: "Neighborhood A",
    subnet: "192.168.1.0/24",
    base: "192.168.1.",
    topology: {
      type: "linear",
      gateway: "A-2",
      nodes: [
        { label: "A-1", offset: 10, position: [25, 50] },
        { label: "A-2", offset: 11, position: [50, 50] },
        { label: "A-3", offset: 12, position: [75, 50] },
      ],
      edges: [
        ["A-1", "A-2"],
        ["A-2", "A-3"],
      ],
    },
  },
  {
    id: "B",
    name: "Neighborhood B",
    subnet: "192.168.2.0/24",
    base: "192.168.2.",
    topology: {
      type: "mesh",
      gateway: "B-2",
      nodes: [
        { label: "B-1", offset: 20, position: [25, 25] },
        { label: "B-2", offset: 21, position: [75, 25] },
        { label: "B-3", offset: 22, position: [75, 75] },
        { label: "B-4", offset: 23, position: [25, 75] },
      ],
      edges: [
        ["B-1", "B-2"],
        ["B-1", "B-3"],
        ["B-1", "B-4"],
        ["B-2", "B-3"],
        ["B-2", "B-4"],
        ["B-3", "B-4"],
      ],
    },
  },
  {
    id: "C",
    name: "Neighborhood C",
    subnet: "10.0.0.0/24",
    base: "10.0.0.",
    topology: {
      type: "ring",
      gateway: "C-1",
      nodes: [
        { label: "C-1", offset: 5, position: [50, 25] },
        { label: "C-2", offset: 6, position: [75, 75] },
        { label: "C-3", offset: 7, position: [25, 75] },
      ],
      edges: [
        ["C-1", "C-2"],
        ["C-2", "C-3"],
        ["C-3", "C-1"],
      ],
    },
  },
];

neighborhoods.forEach((n) => neighborhoodById.set(n.id, n));

// Simple core-router table
let routerRoutes = [
  { network: "192.168.1.0/24", via: "local-A" },
  { network: "192.168.2.0/24", via: "local-B" },
  { network: "10.0.0.0/24", via: "local-C" },
];

let selectedSource = null;
let selectedDestination = null;
let isAnimating = false;
let lastPacket = null;
let currentJitter = 120;
let modalRoutesDraft = [];

const stats = {
  sent: 0,
  delivered: 0,
  lost: 0,
  totalHops: 0,
};

const ipToNeighborhood = new Map();
const ipToNodeId = new Map();
const neighborhoodGraphs = new Map();
const neighborhoodGateways = new Map();
const neighborhoodNodeMeta = new Map();

// DOM refs
const gridEl = document.getElementById("neighborhoodGrid");
const fieldSourceIp = document.getElementById("fieldSourceIp");
const fieldDestIp = document.getElementById("fieldDestIp");
const fieldMessage = document.getElementById("fieldMessage");
const hintSource = document.getElementById("hintSource");
const hintDest = document.getElementById("hintDest");
const sliderLatency = document.getElementById("sliderLatency");
const sliderLoss = document.getElementById("sliderLoss");
const latencyLabel = document.getElementById("latencyLabel");
const lossLabel = document.getElementById("lossLabel");
const nodeSourceLabel = document.getElementById("nodeSourceLabel");
const nodeDestLabel = document.getElementById("nodeDestLabel");
const packetIcon = document.getElementById("packetIcon");
const timeline = document.getElementById("timeline");
const hopChipSource = document.getElementById("hopChipSource");
const hopChipRouter = document.getElementById("hopChipRouter");
const hopChipDest = document.getElementById("hopChipDest");

// Helper function to safely update elements that may not exist
function safeSetText(element, text) {
  if (element) element.textContent = text;
}

function safeSetHopChip(element, text, status) {
  if (element) setHopChip(element, text, status);
}

function safeResetPacketIcon(duration) {
  if (packetIcon) resetPacketIcon(duration);
}
const statSent = document.getElementById("statSent");
const statDelivered = document.getElementById("statDelivered");
const statLost = document.getElementById("statLost");
const statSuccessRate = document.getElementById("statSuccessRate");
const statAvgHops = document.getElementById("statAvgHops");
const statNetworkMood = document.getElementById("statNetworkMood");
const chipSuccessLabel = document.getElementById("chipSuccessLabel");
const chipNetworkWarning = document.getElementById("chipNetworkWarning");
let btnSend, btnSendAgain; // Will be set after neighborhoods are built
const btnSoftReset = document.getElementById("btnSoftReset");
const btnReset = document.getElementById("btnReset");
const btnToggleRoutes = document.getElementById("btnToggleRoutes");
const routerRoutingIcon = document.getElementById("routerRoutingIcon");
const selectPreset = document.getElementById("selectPreset");
const jitterPill = document.getElementById("jitterPill");
const subnetSelectedIp = document.getElementById("subnetSelectedIp");
const subnetNetwork = document.getElementById("subnetNetwork");
const subnetReason = document.getElementById("subnetReason");
const btnCopyLink = document.getElementById("btnCopyLink");
const routesModal = document.getElementById("routesModal");
const routesModalClose = document.getElementById("routesModalClose");
const routesModalSave = document.getElementById("routesModalSave");
const routesTable = document.getElementById("routesTable");
const btnAddRoute = document.getElementById("btnAddRoute");

// --- Initialization ---

buildNeighborhoods();
applyPreset(selectPreset.value);
updateLatencyLabel();
updateLossLabel();
resetPacketIcon();
resetHopChips();
applyQueryParams();
updateSubnetHelper(fieldSourceIp.value || fieldDestIp.value || "");
btnSendAgain.disabled = true;

// --- Build neighborhoods / houses ---

function buildNeighborhoods() {
  // Clear any existing content
  gridEl.innerHTML = "";
  ipToNeighborhood.clear();
  ipToNodeId.clear();
  neighborhoodGraphs.clear();
  neighborhoodGateways.clear();
  neighborhoodNodeMeta.clear();

  const svgNS = "http://www.w3.org/2000/svg";

  // Create router (in row 2, centered)
  const routerCard = document.createElement("div");
  routerCard.className = "neighborhood-router";
  routerCard.id = "visualRouter";
  routerCard.style.gridColumn = "1 / -1";
  routerCard.style.gridRow = "2";

  const routerInner = document.createElement("div");
  routerInner.className = "router-visual";

  const routerIcon = document.createElement("div");
  routerIcon.className = "router-icon-small";

  const routerLabel = document.createElement("div");
  routerLabel.className = "router-label";
  routerLabel.textContent = "Router";

  routerInner.appendChild(routerIcon);
  routerInner.appendChild(routerLabel);
  routerCard.appendChild(routerInner);
  gridEl.appendChild(routerCard);

  // Create SVG overlay for connections between neighborhoods and router
  const connectionsSvg = document.createElementNS(svgNS, "svg");
  connectionsSvg.id = "neighborhoodConnections";
  connectionsSvg.style.position = "absolute";
  connectionsSvg.style.top = "0";
  connectionsSvg.style.left = "0";
  connectionsSvg.style.width = "100%";
  connectionsSvg.style.height = "100%";
  connectionsSvg.style.pointerEvents = "none";
  connectionsSvg.style.zIndex = "1";
  connectionsSvg.setAttribute("preserveAspectRatio", "none");
  gridEl.style.position = "relative";
  gridEl.appendChild(connectionsSvg);

  neighborhoods.forEach((n, index) => {
    const card = document.createElement("div");
    card.className = "neighborhood";
    card.dataset.neighborhoodId = n.id;

    // Neighborhood A in row 1, centered and 50% width; B and C in row 3, each taking half width
    if (index === 0) {
      card.style.gridRow = "1";
      card.style.gridColumn = "1 / -1";
      card.style.justifySelf = "center";
      card.style.width = "50%";
      card.classList.add("neighborhood-left");
    } else if (index === 1) {
      card.style.gridRow = "3";
      card.style.gridColumn = "1";
      card.classList.add("neighborhood-right");
    } else {
      card.style.gridRow = "3";
      card.style.gridColumn = "2";
      card.classList.add("neighborhood-right");
    }

    const header = document.createElement("div");
    header.className = "neighborhood-header";

    // Get gateway IP for routing icon
    const gatewayNode = n.topology.nodes.find(node => node.label === n.topology.gateway);
    const gatewayIp = gatewayNode ? n.base + gatewayNode.offset : null;

    // Create left section with icon and name
    const headerLeft = document.createElement("div");
    headerLeft.className = "neighborhood-header-left";

    // Add routing table icon button
    const routingTableIcon = document.createElement("button");
    routingTableIcon.className = "neighborhood-routing-icon";
    routingTableIcon.title = "View routing table";
    routingTableIcon.innerHTML = "📋";
    routingTableIcon.dataset.neighborhoodId = n.id;
    routingTableIcon.dataset.subnet = n.subnet;
    routingTableIcon.dataset.gatewayIp = gatewayIp || "";
    
    routingTableIcon.addEventListener("click", () => {
      openNeighborhoodRoutingModal(n.id, n.name, n.subnet, gatewayIp);
    });
    
    headerLeft.appendChild(routingTableIcon);

    const nameSpan = document.createElement("span");
    nameSpan.className = "neighborhood-name";
    nameSpan.textContent = n.name;
    headerLeft.appendChild(nameSpan);

    const subnetSpan = document.createElement("span");
    subnetSpan.className = "neighborhood-subnet";
    subnetSpan.textContent = n.subnet;

    header.appendChild(headerLeft);
    header.appendChild(subnetSpan);
    card.appendChild(header);

    const net = document.createElement("div");
    net.className = "neighborhood-net";

    const edgeSvg = document.createElementNS(svgNS, "svg");
    edgeSvg.setAttribute("viewBox", "0 0 100 100");
    edgeSvg.setAttribute("preserveAspectRatio", "none");
    edgeSvg.classList.add("neighborhood-edges");
    net.appendChild(edgeSvg);

    const nodeMeta = new Map();
    const adjacency = new Map();

    n.topology.nodes.forEach((node) => {
      adjacency.set(node.label, new Set());
    });

    n.topology.edges.forEach(([a, b]) => {
      adjacency.get(a)?.add(b);
      adjacency.get(b)?.add(a);
    });

    neighborhoodGraphs.set(n.id, adjacency);
    neighborhoodGateways.set(n.id, n.topology.gateway);

    n.topology.nodes.forEach((node) => {
      const ip = n.base + node.offset;
      const houseEl = document.createElement("div");
      houseEl.className = "house";
      houseEl.style.left = `${node.position[0]}%`;
      houseEl.style.top = `${node.position[1]}%`;
      houseEl.dataset.ip = ip;
      houseEl.dataset.neighborhood = n.id;
      houseEl.dataset.nodeId = node.label;
      if (node.label === n.topology.gateway) {
        houseEl.classList.add("house-gateway");
      }

      const hHeader = document.createElement("div");
      hHeader.className = "house-header";

      const icon = document.createElement("div");
      icon.className = "house-icon";

      const name = document.createElement("div");
      name.className = "house-name";
      name.textContent = node.label;

      hHeader.appendChild(icon);
      hHeader.appendChild(name);

      const ipDiv = document.createElement("div");
      ipDiv.className = "house-ip";
      ipDiv.textContent = ip;

      const role = document.createElement("div");
      role.className = "house-role";
      role.textContent = node.label === n.topology.gateway ? "Gateway" : "Mailbox";

      houseEl.appendChild(hHeader);
      houseEl.appendChild(ipDiv);
      houseEl.appendChild(role);

      houseEl.addEventListener("click", () => onHouseClick(houseEl));

      net.appendChild(houseEl);
      nodeMeta.set(node.label, { ip, position: node.position });
      ipToNeighborhood.set(ip, n.id);
      ipToNodeId.set(ip, node.label);
    });

    neighborhoodNodeMeta.set(n.id, nodeMeta);

    // Draw edges after all nodes are created and nodeMeta is populated
    n.topology.edges.forEach(([a, b]) => {
      const aNode = nodeMeta.get(a);
      const bNode = nodeMeta.get(b);
      if (!aNode || !bNode) {
        console.warn(`Missing node data for edge ${a}-${b} in neighborhood ${n.id}`);
        return;
      }
      const aPos = aNode.position;
      const bPos = bNode.position;
      if (!aPos || !bPos) {
        console.warn(`Missing position for edge ${a}-${b} in neighborhood ${n.id}`);
        return;
      }
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", aPos[0]);
      line.setAttribute("y1", aPos[1]);
      line.setAttribute("x2", bPos[0]);
      line.setAttribute("y2", bPos[1]);
      line.setAttribute("stroke", "rgba(56, 189, 248, 0.7)");
      line.setAttribute("stroke-width", "2.5");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("fill", "none");
      line.classList.add("neighborhood-edge");
      edgeSvg.appendChild(line);
    });

    card.appendChild(net);

    gridEl.appendChild(card);
  });

  // Add control buttons at the top left of the grid
  const gridControls = document.createElement("div");
  gridControls.className = "grid-controls";
  
  btnSend = document.createElement("button");
  btnSend.className = "btn btn-primary";
  btnSend.id = "btnSend";
  btnSend.innerHTML = '<span class="icon">✉</span> Send packet';
  
  btnSendAgain = document.createElement("button");
  btnSendAgain.className = "btn";
  btnSendAgain.id = "btnSendAgain";
  btnSendAgain.title = "Send the previous packet with the current network settings";
  btnSendAgain.innerHTML = '<span class="icon">↻</span> Send again';
  
  gridControls.appendChild(btnSend);
  gridControls.appendChild(btnSendAgain);
  gridEl.appendChild(gridControls);
  
  // Attach event listeners to the buttons
  btnSend.addEventListener("click", () => sendPacket());
  btnSendAgain.addEventListener("click", () => {
    if (!lastPacket) return;
    fieldSourceIp.value = lastPacket.srcIp;
    fieldDestIp.value = lastPacket.dstIp;
    fieldMessage.value = lastPacket.msg;
    sendPacket({ reuseLast: true });
  });

  // Draw connections from neighborhoods to router after all neighborhoods are created
  setTimeout(() => {
    drawNeighborhoodConnections();
  }, 100);
}

function drawNeighborhoodConnections() {
  const connectionsSvg = document.getElementById("neighborhoodConnections");
  if (!connectionsSvg) return;

  // Clear existing connections
  connectionsSvg.innerHTML = "";

  const router = document.getElementById("visualRouter");
  if (!router) return;

  const gridEl = document.getElementById("neighborhoodGrid");
  if (!gridEl) return;

  const gridRect = gridEl.getBoundingClientRect();
  const routerRect = router.getBoundingClientRect();
  
  // Set SVG viewBox to match grid dimensions
  connectionsSvg.setAttribute("viewBox", `0 0 ${gridRect.width} ${gridRect.height}`);
  
  // Get router center position relative to grid
  const routerX = routerRect.left + routerRect.width / 2 - gridRect.left;
  const routerY = routerRect.top + routerRect.height / 2 - gridRect.top;

  // Connect each neighborhood's gateway to router
  neighborhoods.forEach((n) => {
    const neighborhoodCard = document.querySelector(`[data-neighborhood-id="${n.id}"]`);
    if (!neighborhoodCard) return;

    const gatewayNode = n.topology.nodes.find(node => node.label === n.topology.gateway);
    if (!gatewayNode) return;

    const net = neighborhoodCard.querySelector(".neighborhood-net");
    if (!net) return;

    // Find the gateway house element
    const gatewayHouse = net.querySelector(`[data-node-id="${gatewayNode.label}"]`);
    if (!gatewayHouse) return;

    const houseRect = gatewayHouse.getBoundingClientRect();

    // Calculate gateway position relative to grid
    const gatewayX = houseRect.left + houseRect.width / 2 - gridRect.left;
    const gatewayY = houseRect.top + houseRect.height / 2 - gridRect.top;

    // Create L-shaped path: up first, then horizontal to router
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Determine path based on neighborhood position
    if (n.id === "A") {
      // Neighborhood A is above router - go straight down
      const pathData = `M ${gatewayX} ${gatewayY} L ${routerX} ${routerY}`;
      path.setAttribute("d", pathData);
    } else if (n.id === "B") {
      // Neighborhood B is left - go up, then right
      const midY = routerY; // Align with router's Y position
      const pathData = `M ${gatewayX} ${gatewayY} L ${gatewayX} ${midY} L ${routerX} ${routerY}`;
      path.setAttribute("d", pathData);
    } else if (n.id === "C") {
      // Neighborhood C is right - go up, then left
      const midY = routerY; // Align with router's Y position
      const pathData = `M ${gatewayX} ${gatewayY} L ${gatewayX} ${midY} L ${routerX} ${routerY}`;
      path.setAttribute("d", pathData);
    } else {
      // Default: direct line
      const pathData = `M ${gatewayX} ${gatewayY} L ${routerX} ${routerY}`;
      path.setAttribute("d", pathData);
    }
    
    path.setAttribute("stroke", "rgba(56, 189, 248, 0.7)");
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    connectionsSvg.appendChild(path);
  });
}

// Update connections on window resize
window.addEventListener("resize", () => {
  if (document.getElementById("neighborhoodConnections")) {
    drawNeighborhoodConnections();
  }
});

function getNeighborhoodIdByIp(ip) {
  return ipToNeighborhood.get(ip) || null;
}

// Animate packet along path in neighborhood
function animatePacketInNeighborhood(neighborhoodId, path, onComplete, status = null) {
  const nodeMeta = neighborhoodNodeMeta.get(neighborhoodId);
  if (!nodeMeta || !path || path.length < 2) {
    if (onComplete) onComplete();
    return;
  }

  const neighborhoodCard = document.querySelector(`[data-neighborhood-id="${neighborhoodId}"]`);
  if (!neighborhoodCard) {
    if (onComplete) onComplete();
    return;
  }

  const net = neighborhoodCard.querySelector(".neighborhood-net");
  if (!net) {
    if (onComplete) onComplete();
    return;
  }

  // Remove any existing packet
  const existingPacket = net.querySelector(".neighborhood-packet");
  if (existingPacket) existingPacket.remove();

  // Create packet element
  const packet = document.createElement("div");
  packet.className = "neighborhood-packet";
  if (status === "lost") {
    packet.classList.add("lost");
  } else if (status === "delivered") {
    packet.classList.add("delivered");
  }
  net.appendChild(packet);

  // Get positions for the path
  const positions = path.map(nodeId => {
    const node = nodeMeta.get(nodeId);
    return node ? node.position : null;
  }).filter(p => p !== null);

  if (positions.length < 2) {
    packet.remove();
    if (onComplete) onComplete();
    return;
  }

  // Animate along the path
  let currentIndex = 0;
  const animateStep = () => {
    if (currentIndex >= positions.length - 1) {
      // Reached destination - show briefly then remove
      setTimeout(() => {
        packet.style.opacity = "0";
        setTimeout(() => {
          packet.remove();
          if (onComplete) onComplete();
        }, 300);
      }, 200);
      return;
    }

    const startPos = positions[currentIndex];
    const endPos = positions[currentIndex + 1];
    
    // Position packet at start (immediately, no transition)
    packet.style.transition = "none";
    packet.style.left = `${startPos[0]}%`;
    packet.style.top = `${startPos[1]}%`;
    packet.style.opacity = "1";

    // Force reflow
    void packet.offsetWidth;

    // Animate to end position
    packet.style.transition = "left 0.8s ease-in-out, top 0.8s ease-in-out";
    setTimeout(() => {
      packet.style.left = `${endPos[0]}%`;
      packet.style.top = `${endPos[1]}%`;
    }, 10);

    currentIndex++;
    setTimeout(animateStep, 800);
  };

  // Start animation after a brief delay
  setTimeout(animateStep, 100);
}

function animatePacketToRouter(fromNeighborhoodId, onComplete, status = null) {
  const gridEl = document.getElementById("neighborhoodGrid");
  const router = document.getElementById("visualRouter");
  const neighborhoodCard = document.querySelector(`[data-neighborhood-id="${fromNeighborhoodId}"]`);
  
  if (!gridEl || !router || !neighborhoodCard) {
    if (onComplete) onComplete();
    return;
  }

  const n = neighborhoods.find(n => n.id === fromNeighborhoodId);
  if (!n) {
    if (onComplete) onComplete();
    return;
  }

  const gatewayNode = n.topology.nodes.find(node => node.label === n.topology.gateway);
  if (!gatewayNode) {
    if (onComplete) onComplete();
    return;
  }

  const net = neighborhoodCard.querySelector(".neighborhood-net");
  if (!net) {
    if (onComplete) onComplete();
    return;
  }

  const gatewayHouse = net.querySelector(`[data-node-id="${gatewayNode.label}"]`);
  if (!gatewayHouse) {
    if (onComplete) onComplete();
    return;
  }

  // Remove any existing router packet
  const existingPacket = gridEl.querySelector(".router-packet");
  if (existingPacket) existingPacket.remove();

  // Create packet element for router connection
  const packet = document.createElement("div");
  packet.className = "router-packet";
  if (status === "lost") {
    packet.classList.add("lost");
  } else if (status === "delivered") {
    packet.classList.add("delivered");
  }
  gridEl.appendChild(packet);

  const gridRect = gridEl.getBoundingClientRect();
  const routerRect = router.getBoundingClientRect();
  const houseRect = gatewayHouse.getBoundingClientRect();

  const startX = houseRect.left + houseRect.width / 2 - gridRect.left;
  const startY = houseRect.top + houseRect.height / 2 - gridRect.top;
  const endX = routerRect.left + routerRect.width / 2 - gridRect.left;
  const endY = routerRect.top + routerRect.height / 2 - gridRect.top;

  // Determine L-shaped path based on neighborhood (matching drawNeighborhoodConnections)
  let midX, midY;
  let useLShape = true;
  
  if (fromNeighborhoodId === "A") {
    // Neighborhood A is above router - go straight down (no L-shape)
    useLShape = false;
  } else if (fromNeighborhoodId === "B") {
    // Neighborhood B is left - go up first, then right
    midX = startX;
    midY = endY; // Align with router's Y position
  } else if (fromNeighborhoodId === "C") {
    // Neighborhood C is right - go up first, then left
    midX = startX;
    midY = endY; // Align with router's Y position
  }

  // Position packet at start
  packet.style.transition = "none";
  packet.style.left = `${startX}px`;
  packet.style.top = `${startY}px`;
  packet.style.opacity = "1";

  // Force reflow
  void packet.offsetWidth;

  if (useLShape) {
    // Animate along L-shaped path: first segment (vertical - up)
    packet.style.transition = "top 0.5s ease-in-out";
    setTimeout(() => {
      packet.style.top = `${midY}px`;
    }, 10);

    // Second segment (horizontal) after first completes
    setTimeout(() => {
      packet.style.transition = "left 0.5s ease-in-out";
      setTimeout(() => {
        packet.style.left = `${endX}px`;
        packet.style.top = `${endY}px`;
      }, 10);
    }, 500);

    // Wait for both segments to complete (500ms + 500ms = 1000ms)
    setTimeout(() => {
      packet.style.opacity = "0";
      setTimeout(() => {
        packet.remove();
        if (onComplete) onComplete();
      }, 300);
    }, 1000);
  } else {
    // Straight path for Neighborhood A
    packet.style.transition = "left 0.5s ease-in-out, top 0.5s ease-in-out";
    setTimeout(() => {
      packet.style.left = `${endX}px`;
      packet.style.top = `${endY}px`;
    }, 10);

    // Wait for animation to complete
    setTimeout(() => {
      packet.style.opacity = "0";
      setTimeout(() => {
        packet.remove();
        if (onComplete) onComplete();
      }, 300);
    }, 500);
  }
}

function animatePacketFromRouter(toNeighborhoodId, onComplete, status = null) {
  const gridEl = document.getElementById("neighborhoodGrid");
  const router = document.getElementById("visualRouter");
  const neighborhoodCard = document.querySelector(`[data-neighborhood-id="${toNeighborhoodId}"]`);
  
  if (!gridEl || !router || !neighborhoodCard) {
    if (onComplete) onComplete();
    return;
  }

  const n = neighborhoods.find(n => n.id === toNeighborhoodId);
  if (!n) {
    if (onComplete) onComplete();
    return;
  }

  const gatewayNode = n.topology.nodes.find(node => node.label === n.topology.gateway);
  if (!gatewayNode) {
    if (onComplete) onComplete();
    return;
  }

  const net = neighborhoodCard.querySelector(".neighborhood-net");
  if (!net) {
    if (onComplete) onComplete();
    return;
  }

  const gatewayHouse = net.querySelector(`[data-node-id="${gatewayNode.label}"]`);
  if (!gatewayHouse) {
    if (onComplete) onComplete();
    return;
  }

  // Remove any existing router packet
  const existingPacket = gridEl.querySelector(".router-packet");
  if (existingPacket) existingPacket.remove();

  // Create packet element for router connection
  const packet = document.createElement("div");
  packet.className = "router-packet";
  if (status === "lost") {
    packet.classList.add("lost");
  } else if (status === "delivered") {
    packet.classList.add("delivered");
  }
  gridEl.appendChild(packet);

  const gridRect = gridEl.getBoundingClientRect();
  const routerRect = router.getBoundingClientRect();
  const houseRect = gatewayHouse.getBoundingClientRect();

  const startX = routerRect.left + routerRect.width / 2 - gridRect.left;
  const startY = routerRect.top + routerRect.height / 2 - gridRect.top;
  const endX = houseRect.left + houseRect.width / 2 - gridRect.left;
  const endY = houseRect.top + houseRect.height / 2 - gridRect.top;

  // Determine L-shaped path based on neighborhood (matching drawNeighborhoodConnections)
  let midX, midY;
  let useLShape = true;
  
  if (toNeighborhoodId === "A") {
    // Neighborhood A is above router - go straight up (no L-shape)
    useLShape = false;
  } else if (toNeighborhoodId === "B") {
    // Neighborhood B is left - go left first, then down
    midX = endX;
    midY = startY; // Start at router's Y position
  } else if (toNeighborhoodId === "C") {
    // Neighborhood C is right - go right first, then down
    midX = endX;
    midY = startY; // Start at router's Y position
  }

  // Position packet at router
  packet.style.transition = "none";
  packet.style.left = `${startX}px`;
  packet.style.top = `${startY}px`;
  packet.style.opacity = "1";

  // Force reflow
  void packet.offsetWidth;

  if (useLShape) {
    // Animate along L-shaped path: first segment (horizontal)
    packet.style.transition = "left 0.5s ease-in-out";
    setTimeout(() => {
      packet.style.left = `${midX}px`;
      packet.style.top = `${midY}px`;
    }, 10);

    // Second segment (vertical - down) after first completes
    setTimeout(() => {
      packet.style.transition = "top 0.5s ease-in-out";
      setTimeout(() => {
        packet.style.left = `${endX}px`;
        packet.style.top = `${endY}px`;
      }, 10);
    }, 500);

    // Wait for both segments to complete (500ms + 500ms = 1000ms)
    setTimeout(() => {
      packet.style.opacity = "0";
      setTimeout(() => {
        packet.remove();
        if (onComplete) onComplete();
      }, 300);
    }, 1000);
  } else {
    // Straight path for Neighborhood A
    packet.style.transition = "left 0.5s ease-in-out, top 0.5s ease-in-out";
    setTimeout(() => {
      packet.style.left = `${endX}px`;
      packet.style.top = `${endY}px`;
    }, 10);

    // Wait for animation to complete
    setTimeout(() => {
      packet.style.opacity = "0";
      setTimeout(() => {
        packet.remove();
        if (onComplete) onComplete();
      }, 300);
    }, 500);
  }
}

function getNodeIdByIp(ip) {
  return ipToNodeId.get(ip) || null;
}

function findPathInNeighborhood(neighborhoodId, startNode, endNode) {
  if (!neighborhoodId || !startNode || !endNode) return null;
  const graph = neighborhoodGraphs.get(neighborhoodId);
  if (!graph || !graph.has(startNode) || !graph.has(endNode)) return null;
  const queue = [startNode];
  const prev = new Map([[startNode, null]]);
  while (queue.length) {
    const current = queue.shift();
    if (current === endNode) break;
    const neighbors = graph.get(current) || [];
    neighbors.forEach((neighbor) => {
      if (!prev.has(neighbor)) {
        prev.set(neighbor, current);
        queue.push(neighbor);
      }
    });
  }
  if (!prev.has(endNode)) return null;
  const path = [];
  let cursor = endNode;
  while (cursor) {
    path.unshift(cursor);
    cursor = prev.get(cursor);
  }
  return path;
}

function ensurePath(path, start, end) {
  if (path && path.length) return path;
  const fallback = [];
  if (start) fallback.push(start);
  if (end && end !== start) fallback.push(end);
  return fallback;
}

function formatPath(path) {
  if (!path || path.length === 0) return "";
  return path.join(" → ");
}

function getNeighborhoodName(id) {
  return neighborhoodById.get(id)?.name || id || "Unknown network";
}

function pathHopCount(path) {
  if (!path || path.length === 0) return 0;
  return Math.max(0, path.length - 1);
}

// --- House selection ---

function onHouseClick(houseEl) {
  const ip = houseEl.dataset.ip;

  // First click or after both selected → start new selection
  if (!selectedSource || (selectedSource && selectedDestination)) {
    clearSelectionStyles();
    selectedSource = ip;
    selectedDestination = null;
    fieldSourceIp.value = ip;
    fieldDestIp.value = "";
    setIpHint(ip, hintSource);
    setIpHint("", hintDest);
    updateSubnetHelper(ip);
    houseEl.classList.add("selected-source");
    safeSetText(nodeSourceLabel, ip);
    safeSetText(nodeDestLabel, "–");
    highlightUnknownNetwork(false);
  } else if (!selectedDestination) {
    selectedDestination = ip;
    fieldDestIp.value = ip;
    setIpHint(ip, hintDest);
    updateSubnetHelper(ip);
    houseEl.classList.add("selected-destination");
    safeSetText(nodeDestLabel, ip);
  }
}

function clearSelectionStyles() {
  document
    .querySelectorAll(".house")
    .forEach((h) => h.classList.remove("selected-source", "selected-destination"));
}

// --- IP utils / router decision ---

function parseIP(ip) {
  const parts = ip.split(".").map((p) => parseInt(p.trim(), 10));
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) {
    return null;
  }
  return parts;
}

function getNetworkPrefix(ip) {
  const parts = parseIP(ip);
  if (!parts) return null;
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

function simulateRouterDecision(destIp) {
  const destNet = getNetworkPrefix(destIp);
  if (!destNet) return { known: false, route: null };
  const route = routerRoutes.find((r) => r.network === destNet);
  return { known: !!route, route };
}

// --- Sliders labels ---

function updateLatencyLabel() {
  const v = parseInt(sliderLatency.value, 10);
  let label = "Normal";
  if (v === 0) label = "Fast";
  else if (v === 2) label = "Slow";
  latencyLabel.textContent = label;
}

function updateLossLabel() {
  const v = parseInt(sliderLoss.value, 10);
  let label = "None";
  if (v === 1) label = "Low";
  else if (v === 2) label = "Medium";
  else if (v === 3) label = "High";
  lossLabel.textContent = label;
}

sliderLatency.addEventListener("input", updateLatencyLabel);
sliderLoss.addEventListener("input", updateLossLabel);
selectPreset.addEventListener("change", () => applyPreset(selectPreset.value));
fieldSourceIp.addEventListener("input", () => {
  setIpHint(fieldSourceIp.value.trim(), hintSource);
  updateSubnetHelper(fieldSourceIp.value.trim());
});
fieldDestIp.addEventListener("input", () => {
  setIpHint(fieldDestIp.value.trim(), hintDest);
  updateSubnetHelper(fieldDestIp.value.trim());
  highlightUnknownNetwork(false);
});

// --- Packet animation & timeline ---

function resetPacketIcon(durationMs = 800) {
  if (!packetIcon) return;
  packetIcon.classList.remove("lost", "delivered");
  packetIcon.style.transition = "none";
  packetIcon.style.left = "0%";
  packetIcon.style.opacity = "1";
  // Force reflow to reset transition
  void packetIcon.offsetWidth;
  packetIcon.style.transition = `left ${durationMs}ms linear`;
}

function setHopChip(el, text, state) {
  el.textContent = text;
  el.classList.remove("ok", "err");
  if (state === "ok") el.classList.add("ok");
  else if (state === "err") el.classList.add("err");
}

function resetHopChips() {
  safeSetHopChip(hopChipSource, "Waiting…", null);
  safeSetHopChip(hopChipRouter, "Idle", null);
  safeSetHopChip(hopChipDest, "Waiting…", null);
}

function highlightUnknownNetwork(isUnknown) {
  gridEl.classList.toggle("unknown-network", !!isUnknown);
}

function setIpHint(value, hintEl) {
  const parsed = parseIP(value);
  if (!value) {
    hintEl.textContent = "";
    hintEl.classList.remove("error");
    return false;
  }
  if (!parsed) {
    hintEl.textContent = "Not a valid IPv4 address.";
    hintEl.classList.add("error");
    return false;
  }
  hintEl.textContent = "Looks valid.";
  hintEl.classList.remove("error");
  return true;
}

function updateSubnetHelper(ip) {
  // Subnet helper section removed - function kept for compatibility but does nothing
  if (!subnetSelectedIp || !subnetNetwork || !subnetReason) return;
  const network = getNetworkPrefix(ip);
  subnetSelectedIp.textContent = ip || "–";
  if (network) {
    subnetNetwork.textContent = network;
    const parts = parseIP(ip);
    subnetReason.textContent = `${parts[0]}.${parts[1]}.${parts[2]}.0 is the /24 network portion.`;
  } else if (ip) {
    subnetNetwork.textContent = "Unknown";
    subnetReason.textContent = "We need a full IPv4 address to explain.";
  } else {
    subnetNetwork.textContent = "–";
    subnetReason.textContent = "Pick an address to explain it.";
  }
}

function applyPreset(name) {
  const presets = {
    calm: { latency: 1, loss: 1, jitter: 80, label: "±80 ms wiggle" },
    busy: { latency: 1, loss: 2, jitter: 140, label: "±140 ms wiggle" },
    stormy: { latency: 2, loss: 3, jitter: 220, label: "±220 ms wiggle" },
  };
  const p = presets[name] || presets.calm;
  sliderLatency.value = p.latency;
  sliderLoss.value = p.loss;
  currentJitter = p.jitter;
  jitterPill.textContent = p.label;
  updateLatencyLabel();
  updateLossLabel();
}

function buildShareUrl() {
  const params = new URLSearchParams();
  if (fieldSourceIp.value) params.set("src", fieldSourceIp.value.trim());
  if (fieldDestIp.value) params.set("dst", fieldDestIp.value.trim());
  if (fieldMessage.value) params.set("msg", fieldMessage.value.trim());
  if (selectPreset.value) params.set("preset", selectPreset.value);
  const routes = routerRoutes
    .map((r) => `${encodeURIComponent(r.network)}:${encodeURIComponent(r.via)}`)
    .join("|");
  if (routes) params.set("routes", routes);
  const base =
    window.location.origin && window.location.origin !== "null"
      ? `${window.location.origin}${window.location.pathname}`
      : window.location.href.split("?")[0];
  return `${base}?${params.toString()}`;
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const src = params.get("src");
  const dst = params.get("dst");
  const msg = params.get("msg");
  const preset = params.get("preset");
  const routesParam = params.get("routes");

  if (preset) {
    selectPreset.value = preset;
    applyPreset(preset);
  }

  if (routesParam) {
    const entries = routesParam.split("|");
    const parsed = entries
      .map((e) => {
        const [net, via] = e.split(":").map((t) => decodeURIComponent(t || ""));
        return net && via ? { network: net, via } : null;
      })
      .filter(Boolean);
    if (parsed.length > 0) {
      routerRoutes = parsed;
    }
  }

  if (src) {
    fieldSourceIp.value = src;
    updateSubnetHelper(src);
    setIpHint(src, hintSource);
  }
  if (dst) {
    fieldDestIp.value = dst;
    updateSubnetHelper(dst);
    setIpHint(dst, hintDest);
  }
  if (msg) fieldMessage.value = msg;
}
function addTimelineEntry({ time, text, tag, ok }) {
  if (
    timeline.firstElementChild &&
    timeline.firstElementChild.classList.contains("timeline-title")
  ) {
    timeline.innerHTML = "";
  }

  const item = document.createElement("div");
  item.className = "timeline-item";

  const t = document.createElement("div");
  t.className = "timeline-time";
  t.textContent = time;

  const content = document.createElement("div");
  content.className = "timeline-text";
  content.textContent = text;

  const tagEl = document.createElement("div");
  tagEl.className = "timeline-tag";
  if (ok === true) tagEl.classList.add("ok");
  else if (ok === false) tagEl.classList.add("err");
  tagEl.textContent = tag;

  item.appendChild(t);
  item.appendChild(content);
  item.appendChild(tagEl);

  timeline.appendChild(item);
  timeline.scrollTop = timeline.scrollHeight;
}

function nowTimeLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function updateStats(isDelivered, hops) {
  stats.sent += 1;
  stats.totalHops += hops;
  if (isDelivered) stats.delivered += 1;
  else stats.lost += 1;

  statSent.textContent = stats.sent;
  statDelivered.textContent = stats.delivered;
  statLost.textContent = stats.lost;

  if (stats.sent > 0) {
    const successRate = (stats.delivered / stats.sent) * 100;
    statSuccessRate.textContent = successRate.toFixed(0) + "%";

    if (stats.delivered === 0) {
      chipSuccessLabel.textContent = "Nothing is getting through";
    } else if (successRate >= 90) {
      chipSuccessLabel.textContent = "Excellent delivery";
    } else if (successRate >= 70) {
      chipSuccessLabel.textContent = "Mostly working";
    } else {
      chipSuccessLabel.textContent = "Network needs help";
    }

    const avgHops = stats.totalHops / stats.sent;
    statAvgHops.textContent = avgHops.toFixed(1);

    const lossRatio = stats.lost / stats.sent;
    if (lossRatio === 0) {
      statNetworkMood.textContent = "Calm";
      chipNetworkWarning.style.display = "none";
    } else if (lossRatio < 0.25) {
      statNetworkMood.textContent = "A bit busy";
      chipNetworkWarning.style.display = "none";
    } else {
      statNetworkMood.textContent = "Stormy";
      chipNetworkWarning.style.display = "inline-flex";
    }
  } else {
    statSuccessRate.textContent = "–";
    statAvgHops.textContent = "–";
    statNetworkMood.textContent = "Calm";
    chipNetworkWarning.style.display = "none";
    chipSuccessLabel.textContent = "No packets yet";
  }
}

// --- Main "Send packet" handler ---

function sendPacket({ reuseLast = false } = {}) {
  if (isAnimating) return;

  const srcIp = (fieldSourceIp.value || "").trim();
  const dstIp = (fieldDestIp.value || "").trim();
  const msg = fieldMessage.value.trim();

  const srcOk = setIpHint(srcIp, hintSource);
  const dstOk = setIpHint(dstIp, hintDest);

  if (!srcOk || !dstOk) {
    addTimelineEntry({
      time: nowTimeLabel(),
      text: "Cannot send – invalid source or destination IP address.",
      tag: "Error",
      ok: false,
    });
    return;
  }

  lastPacket = { srcIp, dstIp, msg };
  btnSendAgain.disabled = false;

  safeSetText(nodeSourceLabel, srcIp);
  safeSetText(nodeDestLabel, dstIp);
  updateSubnetHelper(dstIp);

  const srcNeighborhoodId = getNeighborhoodIdByIp(srcIp);
  const dstNeighborhoodId = getNeighborhoodIdByIp(dstIp);
  const srcNodeId = getNodeIdByIp(srcIp);
  const dstNodeId = getNodeIdByIp(dstIp);

  if (!srcNeighborhoodId || !dstNeighborhoodId || !srcNodeId || !dstNodeId) {
    addTimelineEntry({
      time: nowTimeLabel(),
      text: "Choose addresses that belong to the visible neighborhoods.",
      tag: "Error",
      ok: false,
    });
    return;
  }

  const sameNeighborhood = srcNeighborhoodId === dstNeighborhoodId;
  const srcGateway = neighborhoodGateways.get(srcNeighborhoodId);
  const dstGateway = neighborhoodGateways.get(dstNeighborhoodId);

  const rawSourcePath = sameNeighborhood
    ? findPathInNeighborhood(srcNeighborhoodId, srcNodeId, dstNodeId)
    : findPathInNeighborhood(srcNeighborhoodId, srcNodeId, srcGateway);

  const rawDestPath = sameNeighborhood
    ? null
    : findPathInNeighborhood(dstNeighborhoodId, dstGateway, dstNodeId);

  const sourcePath = ensurePath(
    rawSourcePath,
    srcNodeId,
    sameNeighborhood ? dstNodeId : srcGateway
  );
  const destPath = sameNeighborhood
    ? null
    : ensurePath(rawDestPath, dstGateway, dstNodeId);

  const { known, route } = simulateRouterDecision(dstIp);
  highlightUnknownNetwork(!known && !sameNeighborhood);

  const srcNeighborhoodName = getNeighborhoodName(srcNeighborhoodId);
  const dstNeighborhoodName = getNeighborhoodName(dstNeighborhoodId);

  safeSetHopChip(
    hopChipSource,
    `${srcNeighborhoodName}: ${formatPath(sourcePath)}`,
    "ok"
  );
  safeSetHopChip(hopChipDest, `${dstNeighborhoodName}: awaiting delivery`, "ok");
  safeSetHopChip(
    hopChipRouter,
    sameNeighborhood
      ? "Local delivery (router not needed)"
      : known
      ? `Route via ${route.via}`
      : "No matching route",
    sameNeighborhood ? "ok" : known ? null : "err"
  );

  const time = nowTimeLabel();
  addTimelineEntry({
    time,
    text: `${reuseLast ? "Re-sending" : "New packet"} from ${srcIp} to ${dstIp}${msg ? ` – message: "${msg}"` : ""
      }.`,
    tag: reuseLast ? "Resend" : "Send",
    ok: true,
  });

  addTimelineEntry({
    time: nowTimeLabel(),
    text: `${srcNeighborhoodName} path: ${formatPath(sourcePath)}`,
    tag: "Local hops",
    ok: true,
  });

  // Handle same-subnet direct delivery (no router)
  if (sameNeighborhood) {
    const lossSetting = parseInt(sliderLoss.value, 10);
    let lossProb = 0;
    if (lossSetting === 1) lossProb = 0.05; // Lower loss for same subnet
    else if (lossSetting === 2) lossProb = 0.15;
    else if (lossSetting === 3) lossProb = 0.35;

    const willBeLost = Math.random() < lossProb;
    
    // Animate packet in neighborhood with status
    if (sourcePath && sourcePath.length > 1) {
      const status = willBeLost ? "lost" : "delivered";
      animatePacketInNeighborhood(srcNeighborhoodId, sourcePath, null, status);
    }

    addTimelineEntry({
      time: nowTimeLabel(),
      text: `Source and destination are within ${srcNeighborhoodName}. Router is skipped.`,
      tag: "Same subnet",
      ok: true,
    });

    const latencySetting = parseInt(sliderLatency.value, 10);
    let baseDuration = 400; // Faster for same subnet (no router hop)
    if (latencySetting === 0) baseDuration = 250;
    else if (latencySetting === 2) baseDuration = 700;

    const jitter = (Math.random() * 2 - 1) * (currentJitter * 0.5); // Less jitter for same subnet
    const travelDuration = Math.max(200, Math.round(baseDuration + jitter));
    const intraHopCount = pathHopCount(sourcePath);

    safeResetPacketIcon(travelDuration);
    isAnimating = true;
    if (packetIcon) {
      packetIcon.classList.remove("lost", "delivered");
      packetIcon.style.left = "100%"; // Direct path, skip router
    }

    setTimeout(() => {
      if (packetIcon && willBeLost) {
        packetIcon.classList.add("lost");
        addTimelineEntry({
          time: nowTimeLabel(),
          text: `Packet was lost during local delivery within the same subnet.`,
          tag: "Lost",
          ok: false,
        });
        safeSetHopChip(hopChipRouter, "Local delivery failed", "err");
        safeSetHopChip(hopChipDest, "Lost in transit", "err");
        updateStats(false, intraHopCount);
      } else {
        if (packetIcon) packetIcon.classList.add("delivered");
        addTimelineEntry({
          time: nowTimeLabel(),
          text: `Packet delivered inside ${srcNeighborhoodName}. Path: ${formatPath(
            sourcePath
          )}. The mailbox received the message${msg ? `: "${msg}"` : ""
            }.`,
          tag: "Delivered",
          ok: true,
        });
        safeSetHopChip(hopChipRouter, "Local delivery complete", "ok");
        safeSetHopChip(hopChipDest, "Delivered", "ok");
        updateStats(true, intraHopCount);
      }

      isAnimating = false;
    }, travelDuration);

    return;
  }

  if (!known) {
    // Animate packet to router, then show as lost
    if (sourcePath && sourcePath.length > 1) {
      animatePacketInNeighborhood(srcNeighborhoodId, sourcePath, () => {
        animatePacketToRouter(srcNeighborhoodId, null, "lost");
      });
    }
    
    safeResetPacketIcon();
    isAnimating = true;
    if (packetIcon) {
      packetIcon.classList.remove("lost", "delivered");
      packetIcon.style.left = "50%";
    }

    setTimeout(() => {
      if (packetIcon) packetIcon.classList.add("lost");
      addTimelineEntry({
        time: nowTimeLabel(),
        text: `Core router has no route for network ${getNetworkPrefix(
          dstIp
        )}. Packet dropped at the router.`,
        tag: "No route",
        ok: false,
      });
      safeSetHopChip(hopChipRouter, "Dropped at router", "err");
      safeSetHopChip(hopChipDest, "Never delivered", "err");
      updateStats(false, pathHopCount(sourcePath) + 1);
      isAnimating = false;
    }, 900);

    return;
  }

  const lossSetting = parseInt(sliderLoss.value, 10);
  let lossProb = 0;
  if (lossSetting === 1) lossProb = 0.1;
  else if (lossSetting === 2) lossProb = 0.3;
  else if (lossSetting === 3) lossProb = 0.6;

  const willBeLost = Math.random() < lossProb;
  const dropPoint = willBeLost && Math.random() < 0.35 ? "router" : "transit";
  const totalHops =
    pathHopCount(sourcePath) + 1 + pathHopCount(destPath || []);

  // Function to handle final delivery status
  const handleFinalStatus = () => {
    if (willBeLost) {
      if (packetIcon) packetIcon.classList.add("lost");
      if (dropPoint === "router") {
        addTimelineEntry({
          time: nowTimeLabel(),
          text: `Router ${route.via} dropped the packet while forwarding to ${dstIp}.`,
          tag: "Dropped",
          ok: false,
        });
        safeSetHopChip(hopChipRouter, "Dropped during forward", "err");
        safeSetHopChip(hopChipDest, "Never received", "err");
      } else {
        addTimelineEntry({
          time: nowTimeLabel(),
          text: `Packet was lost in transit to ${dstIp} because of network conditions (${lossLabel.textContent} loss).`,
          tag: "Lost",
          ok: false,
        });
        safeSetHopChip(hopChipRouter, `Sent via ${route.via}`, "ok");
        safeSetHopChip(hopChipDest, "Dropped in transit", "err");
      }
      updateStats(false, totalHops);
    } else {
      if (packetIcon) packetIcon.classList.add("delivered");
      const destinationPathInfo =
        destPath && destPath.length
          ? ` Destination path: ${formatPath(destPath)}.`
          : "";
      addTimelineEntry({
        time: nowTimeLabel(),
        text: `Packet successfully delivered to ${dstIp} via ${route.via}.${destinationPathInfo} The mailbox received the message${msg ? `: "${msg}"` : ""
          }.`,
        tag: "Delivered",
        ok: true,
      });
      safeSetHopChip(hopChipRouter, `Sent via ${route.via}`, "ok");
      safeSetHopChip(hopChipDest, "Delivered", "ok");
      updateStats(true, totalHops);
    }
    isAnimating = false;
  };

  // Animate packet for cross-neighborhood delivery
  if (sourcePath && sourcePath.length > 1) {
    // Step 1: Animate from source to source gateway
    animatePacketInNeighborhood(srcNeighborhoodId, sourcePath, () => {
      // Step 2: Animate from source gateway to router
      addTimelineEntry({
        time: nowTimeLabel(),
        text: `Packet arrives at core router from ${srcNeighborhoodName} gateway (${srcGateway}).`,
        tag: "Router hop",
        ok: true,
      });
      animatePacketToRouter(srcNeighborhoodId, () => {
        addTimelineEntry({
          time: nowTimeLabel(),
          text: `Core router forwards to ${route.via} for network ${route.network}.`,
          tag: "Route",
          ok: true,
        });
        // Step 3: Animate from router to destination gateway
        animatePacketFromRouter(dstNeighborhoodId, () => {
          addTimelineEntry({
            time: nowTimeLabel(),
            text: `Packet leaves router to ${dstNeighborhoodName} gateway (${dstGateway}).`,
            tag: "Router hop",
            ok: true,
          });
          // Step 4: Animate from destination gateway to destination with status
          if (destPath && destPath.length > 1) {
            const status = willBeLost ? "lost" : "delivered";
            animatePacketInNeighborhood(dstNeighborhoodId, destPath, handleFinalStatus, status);
          } else {
            // No destination path, packet is already at destination
            handleFinalStatus();
          }
        }, willBeLost && dropPoint === "router" ? "lost" : null);
      }, willBeLost && dropPoint === "router" ? "lost" : null);
    });
  } else {
    // If no source path (direct from gateway), still add router entries
    addTimelineEntry({
      time: nowTimeLabel(),
      text: `Packet arrives at core router from ${srcNeighborhoodName} gateway (${srcGateway}).`,
      tag: "Router hop",
      ok: true,
    });
    addTimelineEntry({
      time: nowTimeLabel(),
      text: `Core router forwards to ${route.via} for network ${route.network}.`,
      tag: "Route",
      ok: true,
    });
    animatePacketFromRouter(dstNeighborhoodId, () => {
      addTimelineEntry({
        time: nowTimeLabel(),
        text: `Packet leaves router to ${dstNeighborhoodName} gateway (${dstGateway}).`,
        tag: "Router hop",
        ok: true,
      });
      if (destPath && destPath.length > 1) {
        const status = willBeLost ? "lost" : "delivered";
        animatePacketInNeighborhood(dstNeighborhoodId, destPath, handleFinalStatus, status);
      } else {
        // No destination path, packet is already at destination
        handleFinalStatus();
      }
    }, willBeLost && dropPoint === "router" ? "lost" : null);
  }

  // Legacy packet icon animation (for compatibility, but timeline is now driven by animations)
  const latencySetting = parseInt(sliderLatency.value, 10);
  let baseDuration = 800; // ms
  if (latencySetting === 0) baseDuration = 500;
  else if (latencySetting === 2) baseDuration = 1400;

  const jitter = (Math.random() * 2 - 1) * currentJitter;
  const travelDuration = Math.max(300, Math.round(baseDuration + jitter));
  const targetLeft = dropPoint === "router" ? "50%" : "100%";

  safeResetPacketIcon(travelDuration);
  isAnimating = true;
  if (packetIcon) {
    packetIcon.classList.remove("lost", "delivered");
    packetIcon.style.left = targetLeft;
  }
}

// Button event listeners are attached in buildNeighborhoods() after buttons are created

// --- Reset session ---

if (btnSoftReset) {
  btnSoftReset.addEventListener("click", () => {
    selectedSource = null;
    selectedDestination = null;
    clearSelectionStyles();
    fieldSourceIp.value = "";
    fieldDestIp.value = "";
    fieldMessage.value = "";
    hintSource.textContent = "";
    hintDest.textContent = "";
    hintSource.classList.remove("error");
    hintDest.classList.remove("error");
    safeSetText(nodeSourceLabel, "–");
    safeSetText(nodeDestLabel, "–");
    resetHopChips();
    resetPacketIcon();
    highlightUnknownNetwork(false);
    updateSubnetHelper("");
  });
}

if (btnReset) {
  btnReset.addEventListener("click", () => {
  selectedSource = null;
  selectedDestination = null;
  clearSelectionStyles();
  fieldSourceIp.value = "";
  fieldDestIp.value = "";
  fieldMessage.value = "";
  safeSetText(nodeSourceLabel, "–");
  safeSetText(nodeDestLabel, "–");
  resetHopChips();
  resetPacketIcon();
  highlightUnknownNetwork(false);
  hintSource.textContent = "";
  hintDest.textContent = "";
  hintSource.classList.remove("error");
  hintDest.classList.remove("error");
  lastPacket = null;
  btnSendAgain.disabled = true;
  updateSubnetHelper("");

  stats.sent = 0;
  stats.delivered = 0;
  stats.lost = 0;
  stats.totalHops = 0;
  statSent.textContent = "0";
  statDelivered.textContent = "0";
  statLost.textContent = "0";
  statSuccessRate.textContent = "–";
  statAvgHops.textContent = "–";
  statNetworkMood.textContent = "Calm";
  chipNetworkWarning.style.display = "none";
  chipSuccessLabel.textContent = "No packets yet";

  timeline.innerHTML =
    '<div class="timeline-title">No packets sent yet – launch the first envelope!</div>';
  });
}

// --- Routing table popup ---

function renderRoutesTable() {
  routesTable.innerHTML = "";
  modalRoutesDraft.forEach((r, idx) => {
    const row = document.createElement("div");
    row.className = "route-row";

    const netInput = document.createElement("input");
    netInput.value = r.network;
    netInput.placeholder = "192.168.10.0/24";
    netInput.addEventListener("input", (e) => {
      modalRoutesDraft[idx].network = e.target.value;
    });

    const viaInput = document.createElement("input");
    viaInput.value = r.via;
    viaInput.placeholder = "next-hop";
    viaInput.addEventListener("input", (e) => {
      modalRoutesDraft[idx].via = e.target.value;
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn route-remove";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      modalRoutesDraft.splice(idx, 1);
      renderRoutesTable();
    });

    row.appendChild(netInput);
    row.appendChild(viaInput);
    row.appendChild(removeBtn);
    routesTable.appendChild(row);
  });
}

function openRoutesModal() {
  modalRoutesDraft = routerRoutes.map((r) => ({ ...r }));
  renderRoutesTable();
  
  // Add neighbor table section
  let neighborSection = document.getElementById("routerNeighborTable");
  if (!neighborSection) {
    neighborSection = document.createElement("div");
    neighborSection.id = "routerNeighborTable";
    neighborSection.className = "table-section";
    
    const neighborTitle = document.createElement("div");
    neighborTitle.className = "table-section-title";
    neighborTitle.textContent = "Neighbor Table (Direct connections)";
    neighborSection.appendChild(neighborTitle);
    
    const neighborTable = document.createElement("div");
    neighborTable.className = "routing-table";
    
    // Get all gateway connections
    neighborhoods.forEach((n) => {
      const gatewayNode = n.topology.nodes.find(node => node.label === n.topology.gateway);
      if (gatewayNode) {
        const gatewayIp = n.base + gatewayNode.offset;
        const neighborEntry = document.createElement("div");
        neighborEntry.className = "route-entry";
        
        const routerLabel = document.createElement("span");
        routerLabel.className = "route-network";
        routerLabel.textContent = "Router";
        
        const neighborInfo = document.createElement("span");
        neighborInfo.className = "route-via";
        neighborInfo.textContent = `connected to ${gatewayNode.label} (${gatewayIp}) - ${n.name}`;
        
        neighborEntry.appendChild(routerLabel);
        neighborEntry.appendChild(neighborInfo);
        neighborTable.appendChild(neighborEntry);
      }
    });
    
    neighborSection.appendChild(neighborTable);
    
    // Insert before the routes table
    const modalBody = document.querySelector("#routesModal .modal-body");
    if (modalBody) {
      const routesTableEl = document.getElementById("routesTable");
      if (routesTableEl && routesTableEl.parentNode) {
        routesTableEl.parentNode.insertBefore(neighborSection, routesTableEl);
      }
    }
  }
  
  routesModal.classList.add("active");
}

function closeRoutesModal() {
  routesModal.classList.remove("active");
}

if (btnToggleRoutes) {
  btnToggleRoutes.addEventListener("click", openRoutesModal);
}
if (routerRoutingIcon) {
  routerRoutingIcon.addEventListener("click", openRoutesModal);
}
if (routesModalClose) {
  routesModalClose.addEventListener("click", closeRoutesModal);
}
if (routesModalSave) {
  routesModalSave.addEventListener("click", () => {
  routerRoutes = modalRoutesDraft
    .filter((r) => r.network && r.via)
    .map((r) => ({ ...r }));
  addTimelineEntry({
    time: nowTimeLabel(),
    text: "Routing table updated.",
    tag: "Routes",
    ok: true,
  });
  closeRoutesModal();
  });
}

if (btnAddRoute) {
  btnAddRoute.addEventListener("click", () => {
    modalRoutesDraft.push({ network: "", via: "" });
    renderRoutesTable();
  });
}

// --- Neighborhood Routing Table Modal ---

function openNeighborhoodRoutingModal(neighborhoodId, neighborhoodName, subnet, gatewayIp) {
  const modal = document.getElementById("neighborhoodRoutingModal");
  const title = document.getElementById("neighborhoodRoutingModalTitle");
  const subtitle = document.getElementById("neighborhoodRoutingModalSubtitle");
  const content = document.getElementById("neighborhoodRoutingTableContent");
  
  title.textContent = `${neighborhoodName} Routing & Neighbor Tables`;
  subtitle.textContent = `Network routes and direct connections for ${subnet}`;
  
  content.innerHTML = "";
  
  // Get neighborhood data
  const n = neighborhoods.find(neigh => neigh.id === neighborhoodId);
  if (!n) return;
  
  const graph = neighborhoodGraphs.get(neighborhoodId);
  if (!graph) return;
  
  // Add Routing Table section
  const routingSection = document.createElement("div");
  routingSection.className = "table-section";
  
  const routingTitle = document.createElement("div");
  routingTitle.className = "table-section-title";
  routingTitle.textContent = "Routing Table (Network-level)";
  routingSection.appendChild(routingTitle);
  
  const routingTable = document.createElement("div");
  routingTable.className = "routing-table";
  
  // Add local network route
  const localRoute = document.createElement("div");
  localRoute.className = "route-entry";
  const localNetwork = document.createElement("span");
  localNetwork.className = "route-network";
  localNetwork.textContent = subnet;
  const localVia = document.createElement("span");
  localVia.className = "route-via";
  localVia.textContent = "directly connected";
  localRoute.appendChild(localNetwork);
  localRoute.appendChild(localVia);
  routingTable.appendChild(localRoute);
  
  // Add default gateway route
  if (gatewayIp) {
    const defaultRoute = document.createElement("div");
    defaultRoute.className = "route-entry";
    const defaultNetwork = document.createElement("span");
    defaultNetwork.className = "route-network";
    defaultNetwork.textContent = "0.0.0.0/0";
    const defaultVia = document.createElement("span");
    defaultVia.className = "route-via";
    defaultVia.textContent = `via ${gatewayIp}`;
    defaultRoute.appendChild(defaultNetwork);
    defaultRoute.appendChild(defaultVia);
    routingTable.appendChild(defaultRoute);
  }
  
  routingSection.appendChild(routingTable);
  content.appendChild(routingSection);
  
  // Add Neighbor Table section
  const neighborSection = document.createElement("div");
  neighborSection.className = "table-section";
  
  const neighborTitle = document.createElement("div");
  neighborTitle.className = "table-section-title";
  neighborTitle.textContent = "Neighbor Table (Direct connections)";
  neighborSection.appendChild(neighborTitle);
  
  const neighborTable = document.createElement("div");
  neighborTable.className = "routing-table";
  
  // Show neighbors for each node
  n.topology.nodes.forEach((node) => {
    const nodeIp = n.base + node.offset;
    const neighbors = graph.get(node.label) || new Set();
    
    if (neighbors.size > 0) {
      const neighborEntry = document.createElement("div");
      neighborEntry.className = "route-entry";
      
      const nodeLabel = document.createElement("span");
      nodeLabel.className = "route-network";
      nodeLabel.textContent = `${node.label} (${nodeIp})`;
      
      const neighborList = document.createElement("span");
      neighborList.className = "route-via";
      
      const neighborLabels = Array.from(neighbors).map(neighborLabel => {
        const neighborNode = n.topology.nodes.find(n => n.label === neighborLabel);
        const neighborIp = neighborNode ? n.base + neighborNode.offset : "";
        return `${neighborLabel} (${neighborIp})`;
      });
      
      // Add router connection for gateway
      if (node.label === n.topology.gateway) {
        neighborLabels.push("Router");
      }
      
      neighborList.textContent = `knows: ${neighborLabels.join(", ")}`;
      
      neighborEntry.appendChild(nodeLabel);
      neighborEntry.appendChild(neighborList);
      neighborTable.appendChild(neighborEntry);
    }
  });
  
  neighborSection.appendChild(neighborTable);
  content.appendChild(neighborSection);
  
  modal.classList.add("active");
}

function closeNeighborhoodRoutingModal() {
  const modal = document.getElementById("neighborhoodRoutingModal");
  modal.classList.remove("active");
}

// Initialize modal event listeners after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const neighborhoodRoutingModalClose = document.getElementById("neighborhoodRoutingModalClose");
  const neighborhoodRoutingModalCloseBtn = document.getElementById("neighborhoodRoutingModalCloseBtn");

  if (neighborhoodRoutingModalClose) {
    neighborhoodRoutingModalClose.addEventListener("click", closeNeighborhoodRoutingModal);
  }
  if (neighborhoodRoutingModalCloseBtn) {
    neighborhoodRoutingModalCloseBtn.addEventListener("click", closeNeighborhoodRoutingModal);
  }
});

if (btnCopyLink) {
  btnCopyLink.addEventListener("click", async () => {
    const shareUrl = buildShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      addTimelineEntry({
        time: nowTimeLabel(),
        text: "Shareable link copied to clipboard.",
        tag: "Share",
        ok: true,
      });
    } catch (e) {
      window.prompt("Copy this link", shareUrl);
    }
  });
}
