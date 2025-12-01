// DNS Simulator with Real Data
// Uses DNS-over-HTTPS (DoH) for real DNS queries

const DNS_API = 'https://cloudflare-dns.com/dns-query';
const ROOT_SERVERS = [
  'a.root-servers.net',
  'b.root-servers.net',
  'c.root-servers.net',
  'd.root-servers.net',
  'e.root-servers.net',
  'f.root-servers.net',
  'g.root-servers.net',
  'h.root-servers.net',
  'i.root-servers.net',
  'j.root-servers.net',
  'k.root-servers.net',
  'l.root-servers.net',
  'm.root-servers.net'
];

// Tab switching
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('tab-active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-active'));
    btn.classList.add('tab-active');
    document.getElementById(`${tab}Tab`).classList.add('tab-active');
  });
});

// DNS-over-HTTPS query function
async function queryDNS(domain, type = 'A') {
  const url = `${DNS_API}?name=${encodeURIComponent(domain)}&type=${type}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/dns-json'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`DNS query failed: ${error.message}`);
  }
}

// Format DNS response
function formatDNSResponse(data, type) {
  if (!data.Answer || data.Answer.length === 0) {
    return null;
  }
  return data.Answer.map(answer => ({
    name: answer.name,
    type: answer.type,
    ttl: answer.TTL,
    value: answer.data,
    typeName: getTypeName(answer.type)
  }));
}

function getTypeName(type) {
  const types = {
    1: 'A',
    28: 'AAAA',
    5: 'CNAME',
    15: 'MX',
    2: 'NS',
    16: 'TXT'
  };
  return types[type] || type;
}

// Tab 1: Basic Lookup
const lookupBtn = document.getElementById('lookupBtn');
const lookupDomain = document.getElementById('lookupDomain');
const lookupType = document.getElementById('lookupType');
const lookupResults = document.getElementById('lookupResults');

lookupBtn.addEventListener('click', async () => {
  const domain = lookupDomain.value.trim();
  if (!domain) {
    lookupResults.innerHTML = '<div class="error">Please enter a domain name</div>';
    return;
  }

  lookupResults.innerHTML = '<div class="loading">Querying DNS</div>';
  lookupBtn.disabled = true;

  try {
    const type = lookupType.value;
    const data = await queryDNS(domain, type);
    const records = formatDNSResponse(data, type);

    if (!records || records.length === 0) {
      lookupResults.innerHTML = '<div class="error">No records found for this domain and type</div>';
      return;
    }

    let html = '';
    records.forEach(record => {
      html += `
        <div class="record-item">
          <div class="record-header">
            <span class="record-type">${record.typeName}</span>
            <span class="record-name">${record.name}</span>
          </div>
          <div class="record-value">${record.value}</div>
          <div class="record-ttl">TTL: ${record.ttl} seconds</div>
        </div>
      `;
    });

    lookupResults.innerHTML = html;
  } catch (error) {
    lookupResults.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  } finally {
    lookupBtn.disabled = false;
  }
});

// Tab 2: Delegation Path
const delegationBtn = document.getElementById('delegationBtn');
const delegationDomain = document.getElementById('delegationDomain');
const delegationPath = document.getElementById('delegationPath');

async function traceDelegationPath(domain) {
  const parts = domain.split('.').filter(p => p);
  if (parts.length === 0) return [];

  const path = [];
  let currentDomain = '';
  
  // Start from root
  path.push({
    step: 1,
    title: 'Root Servers',
    domain: '.',
    servers: ROOT_SERVERS.slice(0, 3),
    description: 'DNS root servers point to TLD nameservers'
  });

  // Build domain from right to left
  for (let i = parts.length - 1; i >= 0; i--) {
    currentDomain = parts.slice(i).join('.');
    if (i === parts.length - 1) {
      // TLD
      path.push({
        step: 2,
        title: `TLD: .${currentDomain}`,
        domain: currentDomain,
        servers: await getNameservers(currentDomain),
        description: `Top-level domain nameservers for .${currentDomain}`
      });
    } else {
      // Subdomain
      const prevDomain = parts.slice(i + 1).join('.');
      path.push({
        step: path.length + 1,
        title: `Delegation: ${currentDomain}`,
        domain: currentDomain,
        servers: await getNameservers(currentDomain),
        description: `Nameservers for ${currentDomain} (delegated from ${prevDomain})`
      });
    }
  }

  // Final authoritative lookup
  try {
    const nsData = await queryDNS(domain, 'NS');
    if (nsData.Answer) {
      path.push({
        step: path.length + 1,
        title: `Authoritative: ${domain}`,
        domain: domain,
        servers: nsData.Answer.map(a => a.data),
        description: `Authoritative nameservers for ${domain}`
      });
    }
  } catch (e) {
    // Continue even if NS lookup fails
  }

  return path;
}

async function getNameservers(domain) {
  try {
    const data = await queryDNS(domain, 'NS');
    if (data.Answer && data.Answer.length > 0) {
      return data.Answer.slice(0, 5).map(a => a.data);
    }
  } catch (e) {
    // Return placeholder if lookup fails
  }
  return [`ns1.${domain}`, `ns2.${domain}`];
}

delegationBtn.addEventListener('click', async () => {
  const domain = delegationDomain.value.trim();
  if (!domain) {
    delegationPath.innerHTML = '<div class="error">Please enter a domain name</div>';
    return;
  }

  delegationPath.innerHTML = '<div class="loading">Tracing delegation path</div>';
  delegationBtn.disabled = true;

  try {
    const path = await traceDelegationPath(domain);
    
    let html = '';
    path.forEach((step, index) => {
      setTimeout(() => {
        const stepEl = document.createElement('div');
        stepEl.className = 'delegation-step';
        stepEl.innerHTML = `
          <div class="step-header">
            <div class="step-number">${step.step}</div>
            <div class="step-title">${step.title}</div>
          </div>
          <p style="color: var(--muted); margin: 8px 0; font-size: 0.9rem;">${step.description}</p>
          <div class="step-servers">
            ${step.servers.map(server => `<div class="server-item">${server}</div>`).join('')}
          </div>
        `;
        delegationPath.appendChild(stepEl);
        
        setTimeout(() => {
          stepEl.classList.add('active');
        }, 100);
      }, index * 400);
    });

    // Clear loading after a moment
    setTimeout(() => {
      if (delegationPath.querySelector('.loading')) {
        delegationPath.innerHTML = '';
      }
    }, 100);
  } catch (error) {
    delegationPath.innerHTML = `<div class="error">Error: ${error.message}</div>`;
  } finally {
    delegationBtn.disabled = false;
  }
});

// Tab 3: Node Graph
const graphBtn = document.getElementById('graphBtn');
const graphDomain = document.getElementById('graphDomain');
const graphContainer = document.getElementById('graphContainer');
const dnsGraph = document.getElementById('dnsGraph');
const stepControls = document.getElementById('stepControls');
const stepSlider = document.getElementById('stepSlider');
const stepIndicator = document.getElementById('stepIndicator');
const stepDescription = document.getElementById('stepDescription');
const stepPrevBtn = document.getElementById('stepPrevBtn');
const stepNextBtn = document.getElementById('stepNextBtn');
const stepPlayBtn = document.getElementById('stepPlayBtn');
const stepResetBtn = document.getElementById('stepResetBtn');

let graphData = null;
let stepData = null;
let currentStep = 0;
let isPlaying = false;
let playInterval = null;

async function buildGraph(domain) {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();
  const steps = [];

  // Hierarchical layout: Root at top, Domain in middle, Records at bottom
  // Increased spacing for better readability
  const LAYER_HEIGHT = 133;
  const MIN_NODE_DISTANCE = 83;
  const domainNodeId = 'domain';
  
  // Step 0: Root DNS
  const rootId = 'root';
  nodes.push({ 
    id: rootId, 
    label: 'Root DNS', 
    type: 'root', 
    x: 0, 
    y: -LAYER_HEIGHT * 2.5,
    fixed: true,
    step: 0
  });
  nodeMap.set(rootId, nodes.length - 1);
  steps.push({ step: 0, name: 'Root DNS', description: 'DNS resolution starts at the root servers' });

  // Add domain node in center (visible from step 2)
  nodes.push({
    id: domainNodeId,
    label: domain,
    type: 'domain',
    x: 0,
    y: 0,
    fixed: true,
    step: 2
  });
  nodeMap.set(domainNodeId, nodes.length - 1);

  let nsServers = [];
  let aData = null;
  let aaaaData = null;
  let mxData = null;
  let cnameData = null;
  
  try {
    // Get NS records - position above domain with more spacing
    let nsData;
    try {
      nsData = await queryDNS(domain, 'NS');
    } catch (e) {
      // NS records might fail, continue without them
      nsData = null;
    }
    
    if (nsData && nsData.Answer && Array.isArray(nsData.Answer) && nsData.Answer.length > 0) {
      nsServers = nsData.Answer.map(a => a && a.data ? a.data : null).filter(Boolean);
      if (nsServers.length > 0) {
        const angleStep = (2 * Math.PI) / nsServers.length;
      const nsRadius = LAYER_HEIGHT * 1.5;
      
      nsServers.forEach((server, i) => {
        const angle = i * angleStep - Math.PI / 2; // Start from top
        // Spread out more evenly
        const spreadFactor = 1.6;
        const x = Math.cos(angle) * nsRadius * spreadFactor;
        const y = -LAYER_HEIGHT * 1.4 + Math.sin(angle) * nsRadius * spreadFactor * 0.4;
        const nodeId = `ns-${i}`;
        
        nodes.push({
          id: nodeId,
          label: server,
          type: 'nameserver',
          x: x,
          y: y,
          fixed: false,
          step: 1 // NS nodes appear in step 1
        });
        nodeMap.set(nodeId, nodes.length - 1);
        
        // Connect root to NS (step 1)
        links.push({
          source: rootId,
          target: nodeId,
          type: 'delegation',
          step: 1
        });
        
        // Connect NS to domain (step 2)
        links.push({
          source: nodeId,
          target: domainNodeId,
          type: 'authoritative',
          step: 2
        });
      });
      }
    }

    // Get A records - position below domain with more spacing
    try {
      aData = await queryDNS(domain, 'A');
    } catch (e) {
      // A records might fail, continue without them
      aData = null;
    }
    
    if (aData && aData.Answer && Array.isArray(aData.Answer) && aData.Answer.length > 0) {
      const validAnswers = aData.Answer.filter(a => a && a.data);
      if (validAnswers.length > 0) {
        const aRadius = LAYER_HEIGHT * 1.5;
        validAnswers.forEach((answer, i) => {
          const angle = (i * 2 * Math.PI) / validAnswers.length - Math.PI / 2;
          // Spread out more evenly
          const spreadFactor = 1.6;
          const x = Math.cos(angle) * aRadius * spreadFactor;
          const y = LAYER_HEIGHT * 1.4 + Math.sin(angle) * aRadius * spreadFactor * 0.3;
          const ipNodeId = `ip-${i}`;
          
          nodes.push({
            id: ipNodeId,
            label: answer.data,
            type: 'ip',
            x: x,
            y: y,
            fixed: false,
            ttl: answer.TTL || 0,
            step: 3 // A records appear in step 3
          });
          nodeMap.set(ipNodeId, nodes.length - 1);
          
          links.push({
            source: domainNodeId,
            target: ipNodeId,
            type: 'resolution',
            step: 3
          });
        });
      }
    }

    // Get AAAA records - position further below
    try {
      aaaaData = await queryDNS(domain, 'AAAA');
      if (aaaaData && aaaaData.Answer && Array.isArray(aaaaData.Answer) && aaaaData.Answer.length > 0) {
        const aaaaRadius = LAYER_HEIGHT * 1.9;
        aaaaData.Answer.forEach((answer, i) => {
          if (!answer || !answer.data) return;
          const angle = (i * 2 * Math.PI) / aaaaData.Answer.length - Math.PI / 2;
          // Spread out more evenly
          const spreadFactor = 1.7;
          const x = Math.cos(angle) * aaaaRadius * spreadFactor;
          const y = LAYER_HEIGHT * 2.0 + Math.sin(angle) * aaaaRadius * spreadFactor * 0.25;
          const ipv6NodeId = `ipv6-${i}`;
          
          nodes.push({
            id: ipv6NodeId,
            label: answer.data,
            type: 'ipv6',
            x: x,
            y: y,
            fixed: false,
            ttl: answer.TTL,
            step: 4 // AAAA records appear in step 4
          });
          nodeMap.set(ipv6NodeId, nodes.length - 1);
          
          links.push({
            source: domainNodeId,
            target: ipv6NodeId,
            type: 'resolution',
            step: 4
          });
        });
      }
    } catch (e) {
      // AAAA records optional
    }

    // Get MX records - position to the right with more spacing
    try {
      mxData = await queryDNS(domain, 'MX');
      if (mxData && mxData.Answer && Array.isArray(mxData.Answer) && mxData.Answer.length > 0) {
        mxData.Answer.forEach((answer, i) => {
          if (!answer || !answer.data) return;
          const parts = answer.data.split(' ');
          if (parts.length < 2) return;
          const priority = parts[0];
          const mxDomain = parts[1];
          if (!mxDomain) return;
          const mxNodeId = `mx-${i}`;
          const x = LAYER_HEIGHT * 2.4;
          const y = (i - (mxData.Answer.length - 1) / 2) * 80; // Vertical spacing
          
          nodes.push({
            id: mxNodeId,
            label: mxDomain,
            type: 'mx',
            x: x,
            y: y,
            fixed: false,
            priority: priority,
            ttl: answer.TTL,
            step: 5 // MX records appear in step 5
          });
          nodeMap.set(mxNodeId, nodes.length - 1);
          
          links.push({
            source: domainNodeId,
            target: mxNodeId,
            type: 'mx',
            step: 5
          });
        });
      }
    } catch (e) {
      // MX records optional
    }

    // Get CNAME if available - position to the left with more spacing
    try {
      cnameData = await queryDNS(domain, 'CNAME');
      if (cnameData && cnameData.Answer && Array.isArray(cnameData.Answer) && cnameData.Answer.length > 0) {
        cnameData.Answer.forEach((answer, i) => {
          if (!answer || !answer.data) return;
          const cnameNodeId = `cname-${i}`;
          const x = -LAYER_HEIGHT * 2.4;
          const y = (i - (cnameData.Answer.length - 1) / 2) * 80; // Vertical spacing
          
          nodes.push({
            id: cnameNodeId,
            label: answer.data,
            type: 'cname',
            x: x,
            y: y,
            fixed: false,
            ttl: answer.TTL,
            step: 6 // CNAME records appear in step 6
          });
          nodeMap.set(cnameNodeId, nodes.length - 1);
          
          links.push({
            source: domainNodeId,
            target: cnameNodeId,
            type: 'cname',
            step: 6
          });
        });
      }
    } catch (e) {
      // CNAME optional
    }

    // Apply force-directed layout for better positioning
    applyForceLayout(nodes, links, 150, MIN_NODE_DISTANCE);

    // Define step descriptions
    if (nsServers && nsServers.length > 0) {
      steps.push({ step: 1, name: 'Root Delegation', description: 'Root servers delegate to name servers for the domain' });
      steps.push({ step: 2, name: 'Authoritative Servers', description: 'Name servers are authoritative for the domain' });
    }
    if (aData && aData.Answer && aData.Answer.length > 0) {
      steps.push({ step: 3, name: 'IPv4 Resolution', description: 'Domain resolves to IPv4 addresses (A records)' });
    }
    if (aaaaData && aaaaData.Answer && aaaaData.Answer.length > 0) {
      steps.push({ step: 4, name: 'IPv6 Resolution', description: 'Domain resolves to IPv6 addresses (AAAA records)' });
    }
    if (mxData && mxData.Answer && mxData.Answer.length > 0) {
      steps.push({ step: 5, name: 'Mail Servers', description: 'Domain points to mail exchange servers (MX records)' });
    }
    if (cnameData && cnameData.Answer && cnameData.Answer.length > 0) {
      steps.push({ step: 6, name: 'Canonical Names', description: 'Domain has canonical name aliases (CNAME records)' });
    }

    // Find max step
    const maxStep = Math.max(...nodes.map(n => n.step || 0), ...links.map(l => l.step || 0));

    return { nodes, links, steps, maxStep };
  } catch (error) {
    throw error;
  }
}

// Improved force-directed layout with strong overlap prevention
function applyForceLayout(nodes, links, iterations = 150, minDistance = 83) {
  const repulsionStrength = 3.5; // Repulsion for spacing
  const nodeRadius = 50; // Approximate node radius including label
  
  // Initialize velocities
  nodes.forEach(node => {
    if (!node.fixed) {
      node.vx = 0;
      node.vy = 0;
    }
  });

  for (let iter = 0; iter < iterations; iter++) {
    // Very strong repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].fixed && nodes[j].fixed) continue;
        
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const effectiveMinDist = minDistance + nodeRadius * 2;
        
        // Very strong repulsion when nodes are too close
        let force = 0;
        if (dist < effectiveMinDist) {
          // Exponential repulsion when too close
          const overlap = effectiveMinDist - dist;
          force = (overlap / effectiveMinDist) * repulsionStrength * 10;
        } else if (dist < effectiveMinDist * 1.5) {
          // Still repulse but less strongly
          force = repulsionStrength * 2 / (dist / effectiveMinDist);
        } else {
          // Normal repulsion
          force = repulsionStrength / dist;
        }
        
        if (!nodes[i].fixed) {
          nodes[i].vx -= (dx / dist) * force * 0.02;
          nodes[i].vy -= (dy / dist) * force * 0.02;
        }
        if (!nodes[j].fixed) {
          nodes[j].vx += (dx / dist) * force * 0.02;
          nodes[j].vy += (dy / dist) * force * 0.02;
        }
      }
    }

    // Weak attraction along links to maintain structure
    links.forEach(link => {
      const source = nodes.find(n => n.id === link.source);
      const target = nodes.find(n => n.id === link.target);
      if (!source || !target) return;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealDist = minDistance * 1.2; // Ideal link length
      const diff = dist - idealDist;
      const force = diff * 0.1; // Weak attraction

      if (!source.fixed) {
        source.vx += (dx / dist) * force * 0.01;
        source.vy += (dy / dist) * force * 0.01;
      }
      if (!target.fixed) {
        target.vx -= (dx / dist) * force * 0.01;
        target.vy -= (dy / dist) * force * 0.01;
      }
    });

    // Update positions with adaptive damping
    const damping = iter < iterations / 2 ? 0.9 : 0.85; // Less damping early on
    nodes.forEach(node => {
      if (!node.fixed) {
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
    });
  }
  
  // Final pass: ensure no overlaps
  for (let pass = 0; pass < 20; pass++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].fixed) continue;
      for (let j = 0; j < nodes.length; j++) {
        if (i === j || nodes[j].fixed) continue;
        
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const effectiveMinDist = minDistance + nodeRadius * 2;
        
        if (dist < effectiveMinDist) {
          const overlap = effectiveMinDist - dist;
          const pushX = (dx / dist) * overlap * 0.5;
          const pushY = (dy / dist) * overlap * 0.5;
          nodes[i].x -= pushX;
          nodes[i].y -= pushY;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
}

function renderGraph(data) {
  const width = dnsGraph.clientWidth || 800;
  // Calculate dynamic height based on node spread
  let minY = Infinity, maxY = -Infinity;
  data.nodes.forEach(node => {
    minY = Math.min(minY, node.y);
    maxY = Math.max(maxY, node.y);
  });
  const rangeY = maxY - minY || 200;
  // Make height dynamic to accommodate spacing, minimum 500px
  const height = Math.max(500, rangeY + 200);
  dnsGraph.setAttribute('width', width);
  dnsGraph.setAttribute('height', height);
  
  // Clear previous
  dnsGraph.innerHTML = '';
  
  // Center the graph
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Find bounds for auto-scaling
  let minX = Infinity, maxX = -Infinity;
  data.nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
  });
  
  const rangeX = maxX - minX || 200;
  // Add padding for spacing
  const padding = 150;
  // Don't cap scale at 1 - allow it to be larger if needed, but ensure it fits
  const scaleX = (width - padding) / rangeX;
  const scaleY = (height - padding) / rangeY;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = centerX - (minX + maxX) / 2 * scale;
  const offsetY = centerY - (minY + maxY) / 2 * scale;
  
  // Draw links with curved paths and labels
  const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  linkGroup.setAttribute('class', 'links');
  data.links.forEach((link, index) => {
    const sourceNode = data.nodes.find(n => n.id === link.source);
    const targetNode = data.nodes.find(n => n.id === link.target);
    if (!sourceNode || !targetNode) return;
    
    const x1 = offsetX + sourceNode.x * scale;
    const y1 = offsetY + sourceNode.y * scale;
    const x2 = offsetX + targetNode.x * scale;
    const y2 = offsetY + targetNode.y * scale;
    
    // Calculate control point for curved path
    const dx = x2 - x1;
    const dy = y2 - y1;
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const curvature = 30;
    const perpX = -dy / Math.sqrt(dx * dx + dy * dy) * curvature;
    const perpY = dx / Math.sqrt(dx * dx + dy * dy) * curvature;
    const cpX = midX + perpX;
    const cpY = midY + perpY;
    
    // Create curved path with line style based on connection type
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`;
    path.setAttribute('d', d);
    path.setAttribute('class', 'graph-link');
    path.setAttribute('stroke', getLinkColor(link.type));
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-dasharray', getLinkDashArray(link.type));
    path.setAttribute('opacity', '0');
    path.setAttribute('data-link-type', link.type);
    path.setAttribute('data-source', link.source);
    path.setAttribute('data-target', link.target);
    path.setAttribute('data-link-tooltip', getLinkTooltip(link.type));
    path.setAttribute('marker-end', 'url(#arrowhead)');
    path.setAttribute('cursor', 'help');
    
    // Add hover tooltip for links
    path.addEventListener('mouseenter', (e) => {
      const tooltipText = path.getAttribute('data-link-tooltip');
      if (tooltipText) {
        const rect = dnsGraph.getBoundingClientRect();
        const pathEl = e.target;
        const pathLength = pathEl.getTotalLength();
        const midPoint = pathEl.getPointAtLength(pathLength / 2);
        showTooltip(rect.left + midPoint.x, rect.top + midPoint.y, tooltipText);
      }
    });
    
    path.addEventListener('mouseleave', () => {
      hideTooltip();
    });
    
    // Don't animate link appearance - will be controlled by step slider
    path.setAttribute('opacity', '0');
    path.setAttribute('data-link-step', link.step || 0);
    
    linkGroup.appendChild(path);
  });
  
  // Add arrowhead marker definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  arrow.setAttribute('points', '0 0, 10 3, 0 6');
  arrow.setAttribute('fill', 'rgba(148, 163, 184, 0.6)');
  marker.appendChild(arrow);
  defs.appendChild(marker);
  dnsGraph.appendChild(defs);
  
  dnsGraph.appendChild(linkGroup);
  
  // Draw nodes with animation
  const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  nodeGroup.setAttribute('class', 'nodes');
  data.nodes.forEach((node, index) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const x = offsetX + node.x * scale;
    const y = offsetY + node.y * scale;
    group.setAttribute('class', 'graph-node');
    group.setAttribute('transform', `translate(${x}, ${y})`);
    group.setAttribute('opacity', '0');
    group.setAttribute('data-node-id', node.id);
    group.setAttribute('data-node-type', node.type);
    
    // Tooltip data - build comprehensive tooltip
    let tooltipLines = [node.label];
    if (node.type === 'domain') {
      tooltipLines.push('Domain name');
    } else if (node.type === 'nameserver') {
      tooltipLines.push('Name Server (NS)');
    } else if (node.type === 'ip') {
      tooltipLines.push('IPv4 Address (A)');
    } else if (node.type === 'ipv6') {
      tooltipLines.push('IPv6 Address (AAAA)');
    } else if (node.type === 'mx') {
      tooltipLines.push('Mail Server (MX)');
      if (node.priority) tooltipLines.push(`Priority: ${node.priority}`);
    } else if (node.type === 'cname') {
      tooltipLines.push('Canonical Name (CNAME)');
    } else if (node.type === 'root') {
      tooltipLines.push('Root DNS Server');
    }
    if (node.ttl) tooltipLines.push(`TTL: ${node.ttl}s`);
    const tooltipText = tooltipLines.join('\n');
    group.setAttribute('data-tooltip', tooltipText);
    
    // Outer glow circle
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', getNodeRadius(node.type) + 4);
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', getNodeColor(node.type));
    glow.setAttribute('stroke-width', '1');
    glow.setAttribute('opacity', '0');
    glow.setAttribute('class', 'node-glow');
    group.appendChild(glow);
    
    // Main circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', getNodeRadius(node.type));
    circle.setAttribute('fill', getNodeColor(node.type));
    circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'node-circle');
    group.appendChild(circle);
    
    // Type badge for domain node
    if (node.type === 'domain') {
      const badge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badge.setAttribute('text-anchor', 'middle');
      badge.setAttribute('dy', '4');
      badge.setAttribute('fill', 'white');
      badge.setAttribute('font-size', '10px');
      badge.setAttribute('font-weight', '600');
      badge.textContent = 'DOMAIN';
      group.appendChild(badge);
    }
    
    // Label - hidden by default, shown in tooltip on hover
    // We'll show the full label in the tooltip instead
    
    // Hover effects with connection highlighting
    group.addEventListener('mouseenter', (e) => {
      glow.setAttribute('opacity', '0.5');
      circle.setAttribute('r', getNodeRadius(node.type) + 2);
      
      // Highlight connected links - find by source/target IDs
      dnsGraph.querySelectorAll('.graph-link').forEach(link => {
        const sourceId = link.getAttribute('data-source');
        const targetId = link.getAttribute('data-target');
        if (sourceId === node.id || targetId === node.id) {
          link.setAttribute('stroke-width', '4');
          link.setAttribute('opacity', '1');
          link.style.filter = 'drop-shadow(0 0 4px currentColor)';
        } else {
          link.setAttribute('opacity', '0.2');
        }
      });
      
      // Dim unconnected nodes
      dnsGraph.querySelectorAll('.graph-node').forEach(otherNode => {
        const otherId = otherNode.getAttribute('data-node-id');
        if (otherId !== node.id) {
          const isConnected = data.links.some(link => 
            (link.source === node.id && link.target === otherId) ||
            (link.target === node.id && link.source === otherId)
          );
          if (!isConnected) {
            otherNode.setAttribute('opacity', '0.3');
          }
        }
      });
      
      // Show tooltip with node label
      const rect = dnsGraph.getBoundingClientRect();
      const tooltipX = rect.left + x;
      const tooltipY = rect.top + y;
      showTooltip(tooltipX, tooltipY, tooltipText);
    });
    
    group.addEventListener('mouseleave', () => {
      glow.setAttribute('opacity', '0');
      circle.setAttribute('r', getNodeRadius(node.type));
      
      // Reset all links
      dnsGraph.querySelectorAll('.graph-link').forEach(link => {
        link.setAttribute('stroke-width', '2.5');
        link.setAttribute('opacity', '0.7');
        link.style.filter = 'none';
      });
      
      // Reset all nodes
      dnsGraph.querySelectorAll('.graph-node').forEach(otherNode => {
        otherNode.setAttribute('opacity', '1');
      });
      
      hideTooltip();
    });
    
    // Don't animate node appearance - will be controlled by step slider
    group.setAttribute('opacity', '0');
    group.setAttribute('data-node-step', node.step || 0);
    
    nodeGroup.appendChild(group);
  });
  dnsGraph.appendChild(nodeGroup);
  
  // Add legend
  addGraphLegend();
  
  // Hide empty state
  const emptyState = graphContainer.querySelector('.graph-empty');
  if (emptyState) emptyState.style.display = 'none';
}

// Tooltip functions
let tooltip = null;

function showTooltip(x, y, text) {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    document.body.appendChild(tooltip);
  }
  
  // Split text into lines for better formatting
  const lines = text.split('\n');
  tooltip.innerHTML = lines.map(line => {
    if (line.includes(':')) {
      const [label, value] = line.split(':');
      return `<div><strong>${label}:</strong> ${value}</div>`;
    }
    return `<div><strong>${line}</strong></div>`;
  }).join('');
  
  // Position tooltip near cursor but keep it in viewport
  tooltip.style.display = 'block';
  tooltip.style.opacity = '0';
  
  // Force reflow to get dimensions
  void tooltip.offsetWidth;
  
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = x + 20;
  let top = y - 10;
  
  // Adjust if tooltip would go off screen
  if (left + tooltipRect.width > viewportWidth - 10) {
    left = x - tooltipRect.width - 20;
  }
  if (top + tooltipRect.height > viewportHeight - 10) {
    top = y - tooltipRect.height - 10;
  }
  if (left < 10) left = 10;
  if (top < 10) top = 10;
  
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  
  setTimeout(() => {
    tooltip.style.transition = 'opacity 0.2s ease';
    tooltip.style.opacity = '1';
  }, 10);
}

function hideTooltip() {
  if (tooltip) {
    tooltip.style.opacity = '0';
    setTimeout(() => {
      tooltip.style.display = 'none';
    }, 200);
  }
}

function addGraphLegend() {
  // Remove existing legend
  const existing = dnsGraph.querySelector('.graph-legend');
  if (existing) existing.remove();
  
  const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  legend.setAttribute('class', 'graph-legend');
  legend.setAttribute('transform', 'translate(20, 20)');
  
  // Node types
  const nodeItems = [
    { type: 'root', label: 'Root DNS' },
    { type: 'nameserver', label: 'Name Server' },
    { type: 'domain', label: 'Domain' },
    { type: 'ip', label: 'IPv4' },
    { type: 'ipv6', label: 'IPv6' },
    { type: 'mx', label: 'Mail Server' },
    { type: 'cname', label: 'CNAME' }
  ];
  
  let yOffset = 0;
  nodeItems.forEach((item, i) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(0, ${yOffset})`);
    group.setAttribute('class', 'legend-item');
    group.setAttribute('cursor', 'help');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', 8);
    circle.setAttribute('fill', getNodeColor(item.type));
    circle.setAttribute('cx', '8');
    circle.setAttribute('cy', '8');
    group.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '22');
    text.setAttribute('y', '12');
    text.setAttribute('fill', 'var(--text)');
    text.setAttribute('font-size', '11px');
    text.textContent = item.label;
    group.appendChild(text);
    
    // Add hover tooltip with explanation
    const tooltip = getNodeTooltip(item.type);
    if (tooltip) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = tooltip;
      group.appendChild(title);
      
      // Also add mouse events for custom tooltip
      group.addEventListener('mouseenter', (e) => {
        const rect = dnsGraph.getBoundingClientRect();
        const bbox = group.getBBox();
        const x = rect.left + bbox.x + bbox.width / 2;
        const y = rect.top + bbox.y + bbox.height / 2;
        showTooltip(x, y, tooltip);
      });
      group.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    }
    
    legend.appendChild(group);
    yOffset += 25;
  });
  
  // Connection types (line styles)
  yOffset += 10;
  const lineItems = [
    { type: 'delegation', label: 'Delegation', dashArray: '8,4' },
    { type: 'authoritative', label: 'Authoritative', dashArray: 'none' },
    { type: 'resolution', label: 'Resolution', dashArray: '4,4' },
    { type: 'mx', label: 'Mail Server', dashArray: '12,4,4,4' },
    { type: 'cname', label: 'CNAME', dashArray: '2,2' }
  ];
  
  // Add separator
  const separator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  separator.setAttribute('x1', '0');
  separator.setAttribute('y1', yOffset);
  separator.setAttribute('x2', '200');
  separator.setAttribute('y2', yOffset);
  separator.setAttribute('stroke', 'var(--border-subtle)');
  separator.setAttribute('stroke-width', '1');
  legend.appendChild(separator);
  yOffset += 15;
  
  lineItems.forEach((item, i) => {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(0, ${yOffset})`);
    group.setAttribute('class', 'legend-item');
    group.setAttribute('cursor', 'help');
    
    // Draw sample line (longer to show the line style better)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '4');
    line.setAttribute('y1', '8');
    line.setAttribute('x2', '20'); // Made longer to show line style
    line.setAttribute('y2', '8');
    line.setAttribute('stroke', getLinkColor(item.type));
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-dasharray', item.dashArray);
    // Arrowhead shows direction of DNS resolution flow
    line.setAttribute('marker-end', 'url(#arrowhead)');
    group.appendChild(line);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '26'); // Moved right to accommodate longer line
    text.setAttribute('y', '12');
    text.setAttribute('fill', 'var(--text)');
    text.setAttribute('font-size', '11px');
    text.textContent = item.label;
    group.appendChild(text);
    
    // Add hover tooltip with explanation
    const tooltip = getLinkTooltip(item.type);
    if (tooltip) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = tooltip;
      group.appendChild(title);
      
      // Also add mouse events for custom tooltip
      group.addEventListener('mouseenter', (e) => {
        const rect = dnsGraph.getBoundingClientRect();
        const bbox = group.getBBox();
        const x = rect.left + bbox.x + bbox.width / 2;
        const y = rect.top + bbox.y + bbox.height / 2;
        showTooltip(x, y, tooltip);
      });
      group.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    }
    
    legend.appendChild(group);
    yOffset += 25;
  });
  
  dnsGraph.appendChild(legend);
}

function getNodeColor(type) {
  const colors = {
    root: '#38bdf8',
    nameserver: '#fb923c',
    domain: '#4ade80',
    ip: '#a78bfa',
    ipv6: '#8b5cf6',
    mx: '#f472b6',
    cname: '#fbbf24'
  };
  return colors[type] || '#64748b';
}

function getNodeRadius(type) {
  const radii = {
    root: 22,
    nameserver: 18,
    domain: 24,
    ip: 16,
    ipv6: 16,
    mx: 16,
    cname: 16
  };
  return radii[type] || 14;
}

function getLinkColor(type) {
  const colors = {
    delegation: '#38bdf8',
    authoritative: '#fb923c',
    resolution: '#4ade80',
    mx: '#f472b6',
    cname: '#fbbf24'
  };
  return colors[type] || '#94a3b8';
}

function getLinkDashArray(type) {
  // Different line styles for different connection types
  const styles = {
    delegation: '8,4',      // Dashed: Root → NS
    authoritative: 'none',   // Solid: NS → Domain
    resolution: '4,4',       // Dotted: Domain → IP
    mx: '12,4,4,4',          // Dash-dot: Domain → MX
    cname: '2,2'              // Densely dotted: Domain → CNAME
  };
  return styles[type] || 'none';
}

function getLinkTooltip(type) {
  const tooltips = {
    delegation: 'Delegation: Root servers point to name servers that handle this domain. The root "delegates" authority to these servers.',
    authoritative: 'Authoritative: These name servers have the official records for this domain. They are the "authoritative" source.',
    resolution: 'Resolution: The domain name is "resolved" to an IP address. This is what happens when you visit a website.',
    mx: 'Mail Server: The domain points to mail exchange servers that handle email for this domain.',
    cname: 'CNAME (Alias): The domain has a canonical name alias, pointing to another domain name.'
  };
  return tooltips[type] || '';
}

function getNodeTooltip(type) {
  const tooltips = {
    root: 'Root DNS Server: The top-level DNS servers that know where to find name servers for each top-level domain (.com, .org, etc.)',
    nameserver: 'Name Server (NS): Servers that hold DNS records for domains. They are "authoritative" for the domains they serve.',
    domain: 'Domain Name: The human-readable address (like example.com) that gets resolved to an IP address.',
    ip: 'IPv4 Address (A): The numerical address (like 192.0.2.1) that computers use to connect to servers.',
    ipv6: 'IPv6 Address (AAAA): The newer version of IP addresses, providing more available addresses.',
    mx: 'Mail Server (MX): Servers that handle email delivery for the domain. Each has a priority number.',
    cname: 'CNAME (Canonical Name): An alias that points one domain name to another domain name.'
  };
  return tooltips[type] || '';
}

graphBtn.addEventListener('click', async () => {
  const domain = graphDomain.value.trim();
  if (!domain) {
    graphContainer.querySelector('.graph-empty').textContent = 'Please enter a domain name';
    return;
  }

  graphContainer.querySelector('.graph-empty').textContent = 'Building graph...';
  graphBtn.disabled = true;
  stopPlayback();

  try {
    const data = await buildGraph(domain);
    graphData = data;
    stepData = data;
    currentStep = 0;
    
    // Setup step controls
    stepSlider.max = data.maxStep || 0;
    stepSlider.value = 0;
    updateStepControls();
    stepControls.style.display = 'flex';
    
    renderGraph(data);
    renderStep(0);
  } catch (error) {
    graphContainer.querySelector('.graph-empty').textContent = `Error: ${error.message}`;
    graphContainer.querySelector('.graph-empty').style.display = 'block';
    stepControls.style.display = 'none';
  } finally {
    graphBtn.disabled = false;
  }
});

// Render graph at a specific step
function renderStep(step) {
  if (!graphData) return;
  
  currentStep = step;
  
  // Update all nodes
  dnsGraph.querySelectorAll('.graph-node').forEach(nodeEl => {
    const nodeStep = parseInt(nodeEl.getAttribute('data-node-step') || '0');
    if (nodeStep <= step) {
      nodeEl.style.transition = 'opacity 0.4s ease';
      nodeEl.setAttribute('opacity', '1');
      // Pulse animation for newly revealed nodes
      if (nodeStep === step && step > 0) {
        nodeEl.style.animation = 'nodePulse 0.6s ease';
        setTimeout(() => {
          nodeEl.style.animation = '';
        }, 600);
      }
    } else {
      nodeEl.style.transition = 'opacity 0.4s ease';
      nodeEl.setAttribute('opacity', '0');
    }
  });
  
  // Update all links
  dnsGraph.querySelectorAll('.graph-link').forEach(linkEl => {
    const linkStep = parseInt(linkEl.getAttribute('data-link-step') || '0');
    if (linkStep <= step) {
      linkEl.style.transition = 'opacity 0.4s ease';
      linkEl.setAttribute('opacity', '0.7');
      // Pulse animation for newly revealed links
      if (linkStep === step && step > 0) {
        linkEl.style.animation = 'linkPulse 0.6s ease';
        setTimeout(() => {
          if (linkEl) linkEl.style.animation = '';
        }, 600);
      }
    } else {
      linkEl.style.transition = 'opacity 0.4s ease';
      linkEl.setAttribute('opacity', '0');
    }
  });
  
  // Labels removed - using line styles instead
  
  updateStepControls();
}

function updateStepControls() {
  if (!stepData) return;
  
  const maxStep = stepData.maxStep || 0;
  stepSlider.value = currentStep;
  stepIndicator.textContent = `Step ${currentStep} of ${maxStep}`;
  
  // Update step description
  const stepInfo = stepData.steps?.find(s => s.step === currentStep);
  if (stepInfo) {
    stepDescription.textContent = stepInfo.description || stepInfo.name;
  } else {
    stepDescription.textContent = currentStep === 0 ? 'DNS resolution starts' : 'Processing...';
  }
  
  // Update button states
  stepPrevBtn.disabled = currentStep === 0;
  stepNextBtn.disabled = currentStep >= maxStep;
}

function stopPlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
  isPlaying = false;
  if (stepPlayBtn) {
    stepPlayBtn.textContent = '▶ Play';
  }
}

function startPlayback() {
  if (!stepData) return;
  const maxStep = stepData.maxStep || 0;
  
  if (isPlaying) {
    stopPlayback();
    return;
  }
  
  isPlaying = true;
  stepPlayBtn.textContent = '⏸ Pause';
  
  playInterval = setInterval(() => {
    if (currentStep >= maxStep) {
      stopPlayback();
      return;
    }
    currentStep++;
    renderStep(currentStep);
  }, 1500); // 1.5 seconds per step
}

// Step control event listeners
if (stepSlider) {
  stepSlider.addEventListener('input', (e) => {
    const step = parseInt(e.target.value);
    stopPlayback();
    renderStep(step);
  });
}

if (stepPrevBtn) {
  stepPrevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      stopPlayback();
      renderStep(currentStep - 1);
    }
  });
}

if (stepNextBtn) {
  stepNextBtn.addEventListener('click', () => {
    if (stepData && currentStep < (stepData.maxStep || 0)) {
      stopPlayback();
      renderStep(currentStep + 1);
    }
  });
}

if (stepPlayBtn) {
  stepPlayBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });
}

if (stepResetBtn) {
  stepResetBtn.addEventListener('click', () => {
    stopPlayback();
    renderStep(0);
  });
}

// Allow Enter key to trigger lookups
[lookupDomain, delegationDomain, graphDomain].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const btn = input.closest('.tab-content').querySelector('.btn-primary');
      if (btn && !btn.disabled) btn.click();
    }
  });
});

