function makeEdgeKey(from, to) {
  return [from, to].sort().join("-");
}

function getGraphNode(id) {
  return graphNodes.find((node) => node.id === id);
}

function createSvgElement(tagName) {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}

function renderGraph() {
  graphSvg.innerHTML = "";
  const selectedAlgorithm = graphAlgorithmSelect.value;
  const isSccMode = selectedAlgorithm === "kosaraju" || Object.keys(sccGroupByNode).length > 0;
  const isFlowMode = selectedAlgorithm === "edmondsKarp";
  const isDirectedMode = isSccMode || isFlowMode;
  const edgesToRender = isSccMode ? directedGraphEdges : (isFlowMode ? flowGraphEdges : graphEdges);

  if (isDirectedMode) {
    const defs = createSvgElement("defs");
    const marker = createSvgElement("marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "8");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "4");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const path = createSvgElement("path");
    path.setAttribute("d", "M 0 0 L 10 4 L 0 8 z");
    path.setAttribute("fill", "#64748b");
    marker.appendChild(path);
    defs.appendChild(marker);
    graphSvg.appendChild(defs);
  }

  for (const edge of edgesToRender) {
    const fromNode = getGraphNode(edge.from);
    const toNode = getGraphNode(edge.to);
    const edgeKey = makeEdgeKey(edge.from, edge.to);
    const isSelected = selectedGraphEdges.has(edgeKey);
    const line = createSvgElement("line");
    const offset = isDirectedMode ? 28 : 0;
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const distance = Math.hypot(dx, dy) || 1;
    const startX = fromNode.x + (dx / distance) * offset;
    const startY = fromNode.y + (dy / distance) * offset;
    const endX = toNode.x - (dx / distance) * offset;
    const endY = toNode.y - (dy / distance) * offset;

    line.setAttribute("x1", startX);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", endY);
    line.setAttribute("class", isDirectedMode ? (isSelected ? "graph-edge directed selected" : "graph-edge directed") : (isSelected ? "graph-edge selected" : "graph-edge"));

    if (isDirectedMode) {
      line.setAttribute("marker-end", "url(#arrowhead)");
    }

    graphSvg.appendChild(line);

    if (isSccMode) {
      continue;
    }

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const labelBg = createSvgElement("rect");
    labelBg.setAttribute("x", midX - 13);
    labelBg.setAttribute("y", midY - 12);
    labelBg.setAttribute("width", 26);
    labelBg.setAttribute("height", 24);
    labelBg.setAttribute("rx", 6);
    labelBg.setAttribute("class", "edge-label-bg");
    graphSvg.appendChild(labelBg);

    const label = createSvgElement("text");
    label.setAttribute("x", midX);
    label.setAttribute("y", midY + 1);
    label.setAttribute("class", "edge-label");
    label.textContent = isFlowMode ? edge.capacity : edge.weight;
    graphSvg.appendChild(label);
  }

  for (const node of graphNodes) {
    const circle = createSvgElement("circle");
    const sccClass = Number.isInteger(sccGroupByNode[node.id]) ? ` scc-${sccGroupByNode[node.id] % 4}` : "";
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 25);
    circle.setAttribute("class", selectedGraphNodes.has(node.id) ? `graph-node active${sccClass}` : `graph-node${sccClass}`);
    graphSvg.appendChild(circle);

    const label = createSvgElement("text");
    label.setAttribute("x", node.x);
    label.setAttribute("y", node.y + 1);
    label.setAttribute("class", "graph-label");
    label.textContent = node.id;
    graphSvg.appendChild(label);
  }
}

function renderGraphComparisonTable() {
  graphComparisonBody.innerHTML = "";

  for (const algorithm of Object.keys(graphAlgorithmLabels)) {
    const stats = graphComparisonStats[algorithm];
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${graphAlgorithmLabels[algorithm]}</td>
      <td>${stats ? stats.status : "-"}</td>
      <td>${stats ? stats.result : "-"}</td>
      <td>${stats ? stats.items : "-"}</td>
      <td>${stats ? stats.runtime : "-"}</td>
    `;

    graphComparisonBody.appendChild(row);
  }
}

function clearGraphMatrixOutput() {
  graphMatrixOutput.textContent = "Run Floyd-Warshall to generate the matrix.";
}

function renderDistanceMatrix(nodeIds, distances) {
  const table = document.createElement("table");
  table.className = "matrix-table";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");

  headerRow.innerHTML = `<th>From / To</th>${nodeIds.map((id) => `<th>${id}</th>`).join("")}`;
  thead.appendChild(headerRow);

  for (const fromNode of nodeIds) {
    const row = document.createElement("tr");
    const values = nodeIds.map((toNode) => {
      const distance = distances[fromNode][toNode];
      return `<td>${Number.isFinite(distance) ? distance : "∞"}</td>`;
    }).join("");
    row.innerHTML = `<td>${fromNode}</td>${values}`;
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  graphMatrixOutput.innerHTML = "";
  graphMatrixOutput.appendChild(table);
}

function buildGraphAdjacency() {
  const adjacency = {};

  for (const node of graphNodes) {
    adjacency[node.id] = [];
  }

  for (const edge of graphEdges) {
    adjacency[edge.from].push({ to: edge.to, weight: edge.weight, from: edge.from });
    adjacency[edge.to].push({ to: edge.from, weight: edge.weight, from: edge.to });
  }

  return adjacency;
}

function primMst(startNodeId = "A") {
  const adjacency = buildGraphAdjacency();
  const visited = new Set([startNodeId]);
  const minHeap = new MinHeap((first, second) => first.weight - second.weight);
  const mstEdges = [];
  let totalWeight = 0;

  for (const edge of adjacency[startNodeId]) {
    minHeap.push(edge);
  }

  while (minHeap.size() > 0 && visited.size < graphNodes.length) {
    const edge = minHeap.pop();

    if (visited.has(edge.to)) {
      continue;
    }

    visited.add(edge.to);
    mstEdges.push({ from: edge.from, to: edge.to, weight: edge.weight });
    totalWeight += edge.weight;

    for (const nextEdge of adjacency[edge.to]) {
      if (!visited.has(nextEdge.to)) {
        minHeap.push(nextEdge);
      }
    }
  }

  return { mstEdges, totalWeight, visited };
}

function kruskalMst() {
  const dsu = new DisjointSet(graphNodes.map((node) => node.id));
  const sortedEdges = [...graphEdges].sort((first, second) => first.weight - second.weight);
  const mstEdges = [];
  let totalWeight = 0;

  for (const edge of sortedEdges) {
    if (!dsu.union(edge.from, edge.to)) {
      continue;
    }

    mstEdges.push(edge);
    totalWeight += edge.weight;

    if (mstEdges.length === graphNodes.length - 1) {
      break;
    }
  }

  return { mstEdges, totalWeight };
}

function buildDirectedAdjacency(edges) {
  const adjacency = {};

  for (const node of graphNodes) {
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    adjacency[edge.from].push(edge.to);
  }

  return adjacency;
}

function reverseDirectedEdges(edges) {
  return edges.map((edge) => ({
    from: edge.to,
    to: edge.from,
  }));
}

function kosarajuScc() {
  const adjacency = buildDirectedAdjacency(directedGraphEdges);
  const reversedAdjacency = buildDirectedAdjacency(reverseDirectedEdges(directedGraphEdges));
  const visited = new Set();
  const order = [];
  const components = [];

  function fillOrder(nodeId) {
    visited.add(nodeId);

    for (const nextNode of adjacency[nodeId]) {
      if (!visited.has(nextNode)) {
        fillOrder(nextNode);
      }
    }

    order.push(nodeId);
  }

  function collectComponent(nodeId, component) {
    visited.add(nodeId);
    component.push(nodeId);

    for (const nextNode of reversedAdjacency[nodeId]) {
      if (!visited.has(nextNode)) {
        collectComponent(nextNode, component);
      }
    }
  }

  for (const node of graphNodes) {
    if (!visited.has(node.id)) {
      fillOrder(node.id);
    }
  }

  visited.clear();

  while (order.length > 0) {
    const nodeId = order.pop();

    if (visited.has(nodeId)) {
      continue;
    }

    const component = [];
    collectComponent(nodeId, component);
    components.push(component);
  }

  return { components };
}

function floydWarshall() {
  const nodeIds = graphNodes.map((node) => node.id);
  const distances = {};

  for (const fromNode of nodeIds) {
    distances[fromNode] = {};

    for (const toNode of nodeIds) {
      distances[fromNode][toNode] = fromNode === toNode ? 0 : Infinity;
    }
  }

  for (const edge of graphEdges) {
    distances[edge.from][edge.to] = Math.min(distances[edge.from][edge.to], edge.weight);
    distances[edge.to][edge.from] = Math.min(distances[edge.to][edge.from], edge.weight);
  }

  for (const midNode of nodeIds) {
    for (const fromNode of nodeIds) {
      for (const toNode of nodeIds) {
        const throughMid = distances[fromNode][midNode] + distances[midNode][toNode];

        if (throughMid < distances[fromNode][toNode]) {
          distances[fromNode][toNode] = throughMid;
        }
      }
    }
  }

  return { nodeIds, distances };
}

function edmondsKarp(source = "A", sink = "F") {
  const nodeIds = graphNodes.map((node) => node.id);
  const residual = {};
  const usedEdges = new Set();

  for (const fromNode of nodeIds) {
    residual[fromNode] = {};

    for (const toNode of nodeIds) {
      residual[fromNode][toNode] = 0;
    }
  }

  for (const edge of flowGraphEdges) {
    residual[edge.from][edge.to] += edge.capacity;
  }

  let maxFlow = 0;
  const augmentingPaths = [];

  while (true) {
    const parent = {};
    const queue = [source];
    parent[source] = null;

    while (queue.length > 0 && parent[sink] === undefined) {
      const current = queue.shift();

      for (const nextNode of nodeIds) {
        if (parent[nextNode] !== undefined || residual[current][nextNode] <= 0) {
          continue;
        }

        parent[nextNode] = current;
        queue.push(nextNode);
      }
    }

    if (parent[sink] === undefined) {
      break;
    }

    let bottleneck = Infinity;
    let current = sink;
    const path = [sink];

    while (current !== source) {
      const previous = parent[current];
      bottleneck = Math.min(bottleneck, residual[previous][current]);
      current = previous;
      path.push(current);
    }

    path.reverse();
    current = sink;

    while (current !== source) {
      const previous = parent[current];
      residual[previous][current] -= bottleneck;
      residual[current][previous] += bottleneck;
      usedEdges.add(makeEdgeKey(previous, current));
      current = previous;
    }

    maxFlow += bottleneck;
    augmentingPaths.push({ path, bottleneck });
  }

  return { maxFlow, augmentingPaths, usedEdges };
}

async function runGraphAlgorithm() {
  graphStatusStat.textContent = "Running";
  runGraphButton.disabled = true;
  runGraphAllButton.disabled = true;
  resetGraphButton.disabled = true;
  graphAlgorithmSelect.disabled = true;

  const selectedAlgorithm = graphAlgorithmSelect.value;
  await executeGraphAlgorithm(selectedAlgorithm);
  runGraphButton.disabled = false;
  runGraphAllButton.disabled = false;
  resetGraphButton.disabled = false;
  graphAlgorithmSelect.disabled = false;
}

async function runAllGraphAlgorithms() {
  runGraphButton.disabled = true;
  runGraphAllButton.disabled = true;
  resetGraphButton.disabled = true;
  graphAlgorithmSelect.disabled = true;

  for (const algorithm of Object.keys(graphAlgorithmLabels)) {
    graphAlgorithmSelect.value = algorithm;
    await executeGraphAlgorithm(algorithm);
    await sleep(160);
  }

  graphStatusStat.textContent = "Graph Run All complete";
  runGraphButton.disabled = false;
  runGraphAllButton.disabled = false;
  resetGraphButton.disabled = false;
  graphAlgorithmSelect.disabled = false;
}

async function executeGraphAlgorithm(selectedAlgorithm) {
  const graphAlgorithmLabel = graphAlgorithmLabels[selectedAlgorithm];
  let result = null;
  const startTime = performance.now();

  graphStatusStat.textContent = `Running ${graphAlgorithmLabel}`;

  if (selectedAlgorithm === "prim") {
    result = primMst();
  } else if (selectedAlgorithm === "kruskal") {
    result = kruskalMst();
  } else if (selectedAlgorithm === "kosaraju") {
    result = kosarajuScc();
  } else if (selectedAlgorithm === "floydWarshall") {
    result = floydWarshall();
  } else if (selectedAlgorithm === "edmondsKarp") {
    result = edmondsKarp();
  }

  const runtime = performance.now() - startTime;
  const runtimeText = `${runtime.toFixed(2)} ms`;

  if (selectedAlgorithm === "kosaraju") {
    selectedGraphEdges = new Set();
    selectedGraphNodes = new Set();
    sccGroupByNode = {};
    renderGraph();

    for (let index = 0; index < result.components.length; index++) {
      for (const nodeId of result.components[index]) {
        selectedGraphNodes.add(nodeId);
        sccGroupByNode[nodeId] = index;
      }

      renderGraph();
      await sleep(getAnimationDelay() * 6);
    }

    const nodeCount = result.components.reduce((total, component) => total + component.length, 0);
    graphAlgorithmStat.textContent = graphAlgorithmLabel;
    graphStatusStat.textContent = "SCC complete";
    graphWeightStat.textContent = `${result.components.length} SCCs`;
    graphEdgesStat.textContent = `${nodeCount} nodes`;
    graphRuntimeStat.textContent = runtimeText;
    graphComparisonStats[selectedAlgorithm] = {
      status: "SCC complete",
      result: `${result.components.length} SCCs`,
      items: `${nodeCount} nodes`,
      runtime: runtimeText,
    };
    renderGraphComparisonTable();
    return;
  }

  if (selectedAlgorithm === "floydWarshall") {
    selectedGraphEdges = new Set();
    selectedGraphNodes = new Set(graphNodes.map((node) => node.id));
    sccGroupByNode = {};
    renderGraph();
    renderDistanceMatrix(result.nodeIds, result.distances);

    graphAlgorithmStat.textContent = graphAlgorithmLabel;
    graphStatusStat.textContent = "Matrix complete";
    graphWeightStat.textContent = `${result.nodeIds.length}x${result.nodeIds.length}`;
    graphEdgesStat.textContent = `${graphEdges.length} edges`;
    graphRuntimeStat.textContent = runtimeText;
    graphComparisonStats[selectedAlgorithm] = {
      status: "Matrix complete",
      result: `${result.nodeIds.length}x${result.nodeIds.length}`,
      items: `${graphEdges.length} edges`,
      runtime: runtimeText,
    };
    renderGraphComparisonTable();
    return;
  }

  if (selectedAlgorithm === "edmondsKarp") {
    selectedGraphEdges = new Set();
    selectedGraphNodes = new Set(["A", "F"]);
    sccGroupByNode = {};
    clearGraphMatrixOutput();
    renderGraph();

    for (const augmentingPath of result.augmentingPaths) {
      for (let index = 0; index < augmentingPath.path.length - 1; index++) {
        const fromNode = augmentingPath.path[index];
        const toNode = augmentingPath.path[index + 1];
        selectedGraphEdges.add(makeEdgeKey(fromNode, toNode));
        selectedGraphNodes.add(fromNode);
        selectedGraphNodes.add(toNode);
      }

      renderGraph();
      await sleep(getAnimationDelay() * 6);
    }

    graphAlgorithmStat.textContent = graphAlgorithmLabel;
    graphStatusStat.textContent = "Max flow complete";
    graphWeightStat.textContent = `Flow ${result.maxFlow}`;
    graphEdgesStat.textContent = `${result.augmentingPaths.length} paths`;
    graphRuntimeStat.textContent = runtimeText;
    graphComparisonStats[selectedAlgorithm] = {
      status: "Max flow complete",
      result: `Flow ${result.maxFlow}`,
      items: `${result.augmentingPaths.length} paths`,
      runtime: runtimeText,
    };
    renderGraphComparisonTable();
    return;
  }

  selectedGraphEdges = new Set();
  selectedGraphNodes = new Set(selectedAlgorithm === "prim" ? ["A"] : []);
  sccGroupByNode = {};
  renderGraph();

  for (const edge of result.mstEdges) {
    selectedGraphEdges.add(makeEdgeKey(edge.from, edge.to));
    selectedGraphNodes.add(edge.from);
    selectedGraphNodes.add(edge.to);
    renderGraph();
    await sleep(getAnimationDelay() * 4);
  }

  graphAlgorithmStat.textContent = graphAlgorithmLabel;
  graphStatusStat.textContent = "MST complete";
  graphWeightStat.textContent = `Weight ${result.totalWeight}`;
  graphEdgesStat.textContent = `${result.mstEdges.length} edges`;
  graphRuntimeStat.textContent = runtimeText;
  graphComparisonStats[selectedAlgorithm] = {
    status: "MST complete",
    result: `Weight ${result.totalWeight}`,
    items: `${result.mstEdges.length} edges`,
    runtime: runtimeText,
  };
  renderGraphComparisonTable();
}

function resetGraphLab() {
  selectedGraphEdges = new Set();
  selectedGraphNodes = new Set();
  sccGroupByNode = {};
  graphAlgorithmStat.textContent = graphAlgorithmSelect.options[graphAlgorithmSelect.selectedIndex].textContent;
  graphStatusStat.textContent = "Ready";
  graphWeightStat.textContent = "0";
  graphEdgesStat.textContent = "0";
  graphRuntimeStat.textContent = "0 ms";
  renderGraph();
  clearGraphMatrixOutput();
}
