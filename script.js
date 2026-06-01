const ROWS = 14;
const COLS = 20;

const gridElement = document.getElementById("grid");
const algorithmSelect = document.getElementById("algorithm");
const cellToolSelect = document.getElementById("cellTool");
const speedSelect = document.getElementById("speed");
const presetSelect = document.getElementById("preset");
const algorithmStat = document.getElementById("algorithmStat");
const statusStat = document.getElementById("statusStat");
const visitedStat = document.getElementById("visitedStat");
const pathStat = document.getElementById("pathStat");
const costStat = document.getElementById("costStat");
const runtimeStat = document.getElementById("runtimeStat");
const algorithmInfo = document.getElementById("algorithmInfo");
const comparisonBody = document.getElementById("comparisonBody");
const graphAlgorithmSelect = document.getElementById("graphAlgorithm");
const graphSvg = document.getElementById("graphSvg");
const graphAlgorithmStat = document.getElementById("graphAlgorithmStat");
const graphStatusStat = document.getElementById("graphStatusStat");
const graphWeightStat = document.getElementById("graphWeightStat");
const graphEdgesStat = document.getElementById("graphEdgesStat");
const graphRuntimeStat = document.getElementById("graphRuntimeStat");
const graphComparisonBody = document.getElementById("graphComparisonBody");
const runButton = document.getElementById("runBtn");
const runAllButton = document.getElementById("runAllBtn");
const loadPresetButton = document.getElementById("loadPresetBtn");
const clearPathButton = document.getElementById("clearPathBtn");
const resetButton = document.getElementById("resetBtn");
const runGraphButton = document.getElementById("runGraphBtn");
const runGraphAllButton = document.getElementById("runGraphAllBtn");
const resetGraphButton = document.getElementById("resetGraphBtn");

let startCell = { row: 3, col: 4 };
let targetCell = { row: 10, col: 15 };
let gridState = [];
let comparisonStats = {};
let selectedGraphEdges = new Set();
let selectedGraphNodes = new Set();
let sccGroupByNode = {};
let graphComparisonStats = {};

const algorithmInfoText = {
  bfs: "BFS explores level by level and finds the shortest path when every move has the same cost.",
  dfs: "DFS explores as deep as possible before backtracking. It is useful for traversal and maze-style search, but it does not guarantee the shortest path.",
  dijkstra: "Dijkstra finds the lowest-cost path in a weighted grid. It is ideal when some cells are more expensive than others.",
  astar: "A* combines real path cost with Manhattan distance, so it usually reaches the target with fewer explored cells than Dijkstra.",
  bellmanFord: "Bellman-Ford relaxes all edges repeatedly. It is slower than Dijkstra here, but it is important because it can handle negative edges in graph problems.",
  bidirectionalBfs: "Bidirectional BFS searches from the start and target at the same time, then joins the path when the two searches meet.",
};

const speedDelay = {
  fast: 4,
  normal: 12,
  slow: 40,
};

const algorithmLabels = {
  bfs: "BFS",
  dfs: "DFS",
  dijkstra: "Dijkstra",
  astar: "A*",
  bellmanFord: "Bellman-Ford",
  bidirectionalBfs: "Bidirectional BFS",
};

const gridAlgorithms = ["bfs", "dfs", "dijkstra", "astar", "bellmanFord", "bidirectionalBfs"];

const graphNodes = [
  { id: "A", x: 90, y: 85 },
  { id: "B", x: 250, y: 55 },
  { id: "C", x: 430, y: 90 },
  { id: "D", x: 150, y: 245 },
  { id: "E", x: 335, y: 250 },
  { id: "F", x: 540, y: 225 },
];

const graphEdges = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "D", weight: 3 },
  { from: "B", to: "C", weight: 5 },
  { from: "B", to: "D", weight: 6 },
  { from: "B", to: "E", weight: 7 },
  { from: "C", to: "E", weight: 2 },
  { from: "C", to: "F", weight: 8 },
  { from: "D", to: "E", weight: 4 },
  { from: "E", to: "F", weight: 1 },
];

const directedGraphEdges = [
  { from: "A", to: "B" },
  { from: "B", to: "C" },
  { from: "C", to: "A" },
  { from: "C", to: "D" },
  { from: "D", to: "E" },
  { from: "E", to: "F" },
  { from: "F", to: "D" },
  { from: "B", to: "D" },
];

const graphAlgorithmLabels = {
  prim: "Prim's MST",
  kruskal: "Kruskal's MST",
  kosaraju: "Kosaraju SCC",
};

class DisjointSet {
  constructor(values) {
    this.parent = {};
    this.rank = {};

    for (const value of values) {
      this.parent[value] = value;
      this.rank[value] = 0;
    }
  }

  find(value) {
    if (this.parent[value] !== value) {
      this.parent[value] = this.find(this.parent[value]);
    }

    return this.parent[value];
  }

  union(first, second) {
    const firstRoot = this.find(first);
    const secondRoot = this.find(second);

    if (firstRoot === secondRoot) {
      return false;
    }

    if (this.rank[firstRoot] < this.rank[secondRoot]) {
      this.parent[firstRoot] = secondRoot;
    } else if (this.rank[firstRoot] > this.rank[secondRoot]) {
      this.parent[secondRoot] = firstRoot;
    } else {
      this.parent[secondRoot] = firstRoot;
      this.rank[firstRoot]++;
    }

    return true;
  }
}

class MinHeap {
  constructor(compare) {
    this.items = [];
    this.compare = compare;
  }

  size() {
    return this.items.length;
  }

  push(value) {
    this.items.push(value);
    this.heapifyUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) {
      return null;
    }

    if (this.items.length === 1) {
      return this.items.pop();
    }

    const top = this.items[0];
    this.items[0] = this.items.pop();
    this.heapifyDown(0);
    return top;
  }

  heapifyUp(index) {
    let currentIndex = index;

    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);

      if (this.compare(this.items[currentIndex], this.items[parentIndex]) >= 0) {
        break;
      }

      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  heapifyDown(index) {
    let currentIndex = index;

    while (true) {
      const leftIndex = currentIndex * 2 + 1;
      const rightIndex = currentIndex * 2 + 2;
      let smallestIndex = currentIndex;

      if (
        leftIndex < this.items.length
        && this.compare(this.items[leftIndex], this.items[smallestIndex]) < 0
      ) {
        smallestIndex = leftIndex;
      }

      if (
        rightIndex < this.items.length
        && this.compare(this.items[rightIndex], this.items[smallestIndex]) < 0
      ) {
        smallestIndex = rightIndex;
      }

      if (smallestIndex === currentIndex) {
        break;
      }

      this.swap(currentIndex, smallestIndex);
      currentIndex = smallestIndex;
    }
  }

  swap(firstIndex, secondIndex) {
    const temp = this.items[firstIndex];
    this.items[firstIndex] = this.items[secondIndex];
    this.items[secondIndex] = temp;
  }
}

function buildInitialState() {
  gridState = [];

  for (let row = 0; row < ROWS; row++) {
    const currentRow = [];

    for (let col = 0; col < COLS; col++) {
      currentRow.push("empty");
    }

    gridState.push(currentRow);
  }
}

function placePresetCells(cells, cellType) {
  for (const cell of cells) {
    if (isInsideGrid(cell.row, cell.col)) {
      gridState[cell.row][cell.col] = cellType;
    }
  }
}

function applyPreset(presetName) {
  buildInitialState();
  clearAlgorithmPaint();
  resetStats();

  if (presetName === "clean") {
    startCell = { row: 3, col: 4 };
    targetCell = { row: 10, col: 15 };
    refreshGridPaint();
    statusStat.textContent = "Clean grid loaded";
    return;
  }

  if (presetName === "weighted-detour") {
    startCell = { row: 6, col: 2 };
    targetCell = { row: 6, col: 17 };

    const weightedCells = [];

    for (let col = 5; col <= 14; col++) {
      weightedCells.push({ row: 6, col });
      weightedCells.push({ row: 7, col });
    }

    placePresetCells(weightedCells, "weight");
    statusStat.textContent = "Weighted detour loaded";
  }

  if (presetName === "blocked-maze") {
    startCell = { row: 2, col: 2 };
    targetCell = { row: 11, col: 17 };

    const walls = [];

    for (let row = 1; row <= 11; row++) {
      if (row !== 5) {
        walls.push({ row, col: 6 });
      }
    }

    for (let row = 2; row <= 12; row++) {
      if (row !== 9) {
        walls.push({ row, col: 12 });
      }
    }

    for (let col = 7; col <= 11; col++) {
      walls.push({ row: 5, col });
    }

    placePresetCells(walls, "wall");
    statusStat.textContent = "Blocked maze loaded";
  }

  if (presetName === "bomb-trap") {
    startCell = { row: 10, col: 2 };
    targetCell = { row: 3, col: 17 };

    const bombs = [
      { row: 7, col: 7 },
      { row: 7, col: 8 },
      { row: 7, col: 9 },
      { row: 6, col: 10 },
      { row: 5, col: 11 },
      { row: 4, col: 12 },
    ];
    const walls = [];

    for (let col = 4; col <= 15; col++) {
      if (col !== 9) {
        walls.push({ row: 8, col });
      }
    }

    placePresetCells(bombs, "bomb");
    placePresetCells(walls, "wall");
    statusStat.textContent = "Bomb trap loaded";
  }

  gridState[startCell.row][startCell.col] = "empty";
  gridState[targetCell.row][targetCell.col] = "empty";
  refreshGridPaint();
}

function isSameCell(first, second) {
  return first.row === second.row && first.col === second.col;
}

function getCellElement(row, col) {
  return gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function paintCell(cell, row, col) {
  cell.className = "cell";

  if (isSameCell({ row, col }, startCell)) {
    cell.classList.add("start");
    return;
  }

  if (isSameCell({ row, col }, targetCell)) {
    cell.classList.add("target");
    return;
  }

  const cellType = gridState[row][col];

  if (cellType !== "empty") {
    cell.classList.add(cellType);
  }
}

function refreshGridPaint() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = getCellElement(row, col);
      paintCell(cell, row, col);
    }
  }
}

function clearAlgorithmPaint() {
  const cells = gridElement.querySelectorAll(".cell");

  for (const cell of cells) {
    cell.classList.remove("visited", "path");
  }
}

function resetStats() {
  visitedStat.textContent = "0";
  pathStat.textContent = "0";
  costStat.textContent = "0";
  runtimeStat.textContent = "0 ms";
}

function setControlsDisabled(isDisabled) {
  runButton.disabled = isDisabled;
  runAllButton.disabled = isDisabled;
  loadPresetButton.disabled = isDisabled;
  clearPathButton.disabled = isDisabled;
  resetButton.disabled = isDisabled;
  algorithmSelect.disabled = isDisabled;
  cellToolSelect.disabled = isDisabled;
  speedSelect.disabled = isDisabled;
  presetSelect.disabled = isDisabled;
  graphAlgorithmSelect.disabled = isDisabled;
  runGraphButton.disabled = isDisabled;
  runGraphAllButton.disabled = isDisabled;
  resetGraphButton.disabled = isDisabled;
}

function renderComparisonTable() {
  comparisonBody.innerHTML = "";

  for (const algorithm of gridAlgorithms) {
    const stats = comparisonStats[algorithm];
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${algorithmLabels[algorithm]}</td>
      <td>${stats ? stats.status : "-"}</td>
      <td>${stats ? stats.visited : "-"}</td>
      <td>${stats ? stats.length : "-"}</td>
      <td>${stats ? stats.cost : "-"}</td>
      <td>${stats ? stats.runtime : "-"}</td>
    `;

    comparisonBody.appendChild(row);
  }
}

function clearComparisonTable() {
  comparisonStats = {};
  renderComparisonTable();
}

function getAnimationDelay() {
  return speedDelay[speedSelect.value] || speedDelay.normal;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isInsideGrid(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function canVisit(row, col) {
  return gridState[row][col] !== "wall" && gridState[row][col] !== "bomb";
}

function getCellCost(row, col) {
  return gridState[row][col] === "weight" ? 5 : 1;
}

function makeKey(row, col) {
  return `${row},${col}`;
}

function bfs() {
  const queue = [startCell];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[startCell.row][startCell.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    visitOrder.push(current);

    if (isSameCell(current, targetCell)) {
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol)) {
        continue;
      }

      if (visited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      visited[nextRow][nextCol] = true;
      parent[makeKey(nextRow, nextCol)] = current;
      queue.push({ row: nextRow, col: nextCol });
    }
  }

  const path = buildPath(parent);
  return { visitOrder, path };
}

function bidirectionalBfs() {
  const startQueue = [startCell];
  const targetQueue = [targetCell];
  const visitedFromStart = [];
  const visitedFromTarget = [];
  const parentFromStart = {};
  const parentFromTarget = {};
  const visitOrder = [];
  let meetingCell = null;

  for (let row = 0; row < ROWS; row++) {
    visitedFromStart.push(Array(COLS).fill(false));
    visitedFromTarget.push(Array(COLS).fill(false));
  }

  visitedFromStart[startCell.row][startCell.col] = true;
  visitedFromTarget[targetCell.row][targetCell.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (startQueue.length > 0 && targetQueue.length > 0 && !meetingCell) {
    meetingCell = expandBidirectionalLayer(
      startQueue,
      visitedFromStart,
      visitedFromTarget,
      parentFromStart,
      directions,
      visitOrder
    );

    if (meetingCell) {
      break;
    }

    meetingCell = expandBidirectionalLayer(
      targetQueue,
      visitedFromTarget,
      visitedFromStart,
      parentFromTarget,
      directions,
      visitOrder
    );
  }

  const path = meetingCell
    ? buildBidirectionalPath(meetingCell, parentFromStart, parentFromTarget)
    : [];

  return { visitOrder, path };
}

function expandBidirectionalLayer(queue, ownVisited, otherVisited, ownParent, directions, visitOrder) {
  const layerSize = queue.length;

  for (let index = 0; index < layerSize; index++) {
    const current = queue.shift();
    visitOrder.push(current);

    if (otherVisited[current.row][current.col]) {
      return current;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || ownVisited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      ownVisited[nextRow][nextCol] = true;
      ownParent[makeKey(nextRow, nextCol)] = current;
      const nextCell = { row: nextRow, col: nextCol };

      if (otherVisited[nextRow][nextCol]) {
        return nextCell;
      }

      queue.push(nextCell);
    }
  }

  return null;
}

function buildBidirectionalPath(meetingCell, parentFromStart, parentFromTarget) {
  const leftPath = [];
  let current = meetingCell;

  while (!isSameCell(current, startCell)) {
    leftPath.push(current);
    current = parentFromStart[makeKey(current.row, current.col)];
  }

  leftPath.push(startCell);
  leftPath.reverse();

  if (isSameCell(meetingCell, targetCell)) {
    return leftPath;
  }

  const rightPath = [];
  current = parentFromTarget[makeKey(meetingCell.row, meetingCell.col)];

  while (current && !isSameCell(current, targetCell)) {
    rightPath.push(current);
    current = parentFromTarget[makeKey(current.row, current.col)];
  }

  rightPath.push(targetCell);
  return [...leftPath, ...rightPath];
}

function dfs() {
  const stack = [startCell];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[startCell.row][startCell.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (stack.length > 0) {
    const current = stack.pop();
    visitOrder.push(current);

    if (isSameCell(current, targetCell)) {
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol)) {
        continue;
      }

      if (visited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      visited[nextRow][nextCol] = true;
      parent[makeKey(nextRow, nextCol)] = current;
      stack.push({ row: nextRow, col: nextCol });
    }
  }

  const path = buildPath(parent);
  return { visitOrder, path };
}

function dijkstra() {
  const distances = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const priorityQueue = new MinHeap((first, second) => first.distance - second.distance);
  priorityQueue.push({ ...startCell, distance: 0 });

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  distances[startCell.row][startCell.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (priorityQueue.size() > 0) {
    const current = priorityQueue.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (isSameCell(current, targetCell)) {
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
        continue;
      }

      const nextDistance = distances[current.row][current.col] + getCellCost(nextRow, nextCol);

      if (nextDistance < distances[nextRow][nextCol]) {
        distances[nextRow][nextCol] = nextDistance;
        parent[makeKey(nextRow, nextCol)] = { row: current.row, col: current.col };
        priorityQueue.push({ row: nextRow, col: nextCol, distance: nextDistance });
      }
    }
  }

  const path = buildPath(parent);
  const cost = distances[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
}

function manhattanDistance(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col);
}

function astar() {
  const gCost = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const openSet = new MinHeap((first, second) => first.f - second.f);
  openSet.push({
    ...startCell,
    g: 0,
    f: manhattanDistance(startCell, targetCell),
  });

  for (let row = 0; row < ROWS; row++) {
    gCost.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  gCost[startCell.row][startCell.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (openSet.size() > 0) {
    const current = openSet.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (isSameCell(current, targetCell)) {
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
        continue;
      }

      const nextGCost = gCost[current.row][current.col] + getCellCost(nextRow, nextCol);

      if (nextGCost < gCost[nextRow][nextCol]) {
        const nextCell = { row: nextRow, col: nextCol };
        gCost[nextRow][nextCol] = nextGCost;
        parent[makeKey(nextRow, nextCol)] = { row: current.row, col: current.col };
        openSet.push({
          ...nextCell,
          g: nextGCost,
          f: nextGCost + manhattanDistance(nextCell, targetCell),
        });
      }
    }
  }

  const path = buildPath(parent);
  const cost = gCost[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
}

function getGridEdges() {
  const edges = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!canVisit(row, col)) {
        continue;
      }

      for (const direction of directions) {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
          continue;
        }

        edges.push({
          from: { row, col },
          to: { row: nextRow, col: nextCol },
          weight: getCellCost(nextRow, nextCol),
        });
      }
    }
  }

  return edges;
}

function bellmanFord() {
  const distances = [];
  const parent = {};
  const visitOrder = [];
  const edges = getGridEdges();

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
  }

  distances[startCell.row][startCell.col] = 0;

  for (let iteration = 0; iteration < ROWS * COLS - 1; iteration++) {
    let changed = false;

    for (const edge of edges) {
      const fromDistance = distances[edge.from.row][edge.from.col];

      if (!Number.isFinite(fromDistance)) {
        continue;
      }

      const nextDistance = fromDistance + edge.weight;

      if (nextDistance < distances[edge.to.row][edge.to.col]) {
        distances[edge.to.row][edge.to.col] = nextDistance;
        parent[makeKey(edge.to.row, edge.to.col)] = edge.from;
        visitOrder.push(edge.to);
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  const path = buildPath(parent);
  const cost = distances[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
}

function buildPath(parent) {
  const path = [];
  let current = targetCell;

  if (!parent[makeKey(current.row, current.col)] && !isSameCell(startCell, targetCell)) {
    return path;
  }

  while (!isSameCell(current, startCell)) {
    path.push(current);
    current = parent[makeKey(current.row, current.col)];
  }

  path.push(startCell);
  path.reverse();
  return path;
}

async function animateCells(cells, className, delayMs) {
  for (const cellPosition of cells) {
    if (isSameCell(cellPosition, startCell) || isSameCell(cellPosition, targetCell)) {
      continue;
    }

    const cell = getCellElement(cellPosition.row, cellPosition.col);
    cell.classList.add(className);
    await sleep(delayMs);
  }
}

async function runSelectedAlgorithm() {
  clearAlgorithmPaint();
  resetStats();
  updateAlgorithmLabel();
  statusStat.textContent = "Running";
  setControlsDisabled(true);

  const selectedAlgorithm = algorithmSelect.value;

  const runResult = runAlgorithmByName(selectedAlgorithm);
  updateStatsFromRun(selectedAlgorithm, runResult);
  await animateRunResult(runResult);
  statusStat.textContent = runResult.path.length > 0 ? "Path found" : "No path found";
  setControlsDisabled(false);
}

function runAlgorithmByName(selectedAlgorithm) {
  let result;
  const startTime = performance.now();

  if (selectedAlgorithm === "bfs") {
    result = bfs();
  } else if (selectedAlgorithm === "dfs") {
    result = dfs();
  } else if (selectedAlgorithm === "dijkstra") {
    result = dijkstra();
  } else if (selectedAlgorithm === "astar") {
    result = astar();
  } else if (selectedAlgorithm === "bellmanFord") {
    result = bellmanFord();
  } else {
    result = bidirectionalBfs();
  }

  const endTime = performance.now();
  const runtime = endTime - startTime;
  return { ...result, runtime };
}

function updateStatsFromRun(selectedAlgorithm, result) {
  visitedStat.textContent = String(result.visitOrder.length);
  const pathLength = Math.max(0, result.path.length - 1);
  const pathCost = result.cost || pathLength;
  const runtimeText = `${result.runtime.toFixed(2)} ms`;
  const statusText = result.path.length > 0 ? "Path found" : "No path";

  pathStat.textContent = String(pathLength);
  costStat.textContent = String(pathCost);
  runtimeStat.textContent = runtimeText;
  comparisonStats[selectedAlgorithm] = {
    status: statusText,
    visited: result.visitOrder.length,
    length: pathLength,
    cost: pathCost,
    runtime: runtimeText,
  };
  renderComparisonTable();
}

async function animateRunResult(result) {
  const delay = getAnimationDelay();
  await animateCells(result.visitOrder, "visited", delay);
  await animateCells(result.path, "path", delay * 2);
}

async function runAllAlgorithms() {
  clearAlgorithmPaint();
  resetStats();
  clearComparisonTable();
  setControlsDisabled(true);

  for (const algorithm of gridAlgorithms) {
    algorithmSelect.value = algorithm;
    updateAlgorithmLabel();
    statusStat.textContent = `Running ${algorithmLabels[algorithm]}`;

    const result = runAlgorithmByName(algorithm);
    updateStatsFromRun(algorithm, result);
    clearAlgorithmPaint();
    await animateRunResult(result);
    await sleep(120);
  }

  statusStat.textContent = "Run All complete";
  setControlsDisabled(false);
}

function createGrid() {
  gridElement.innerHTML = "";
  buildInitialState();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", `Cell ${row}, ${col}`);
      paintCell(cell, row, col);

      gridElement.appendChild(cell);
    }
  }
}

function updateAlgorithmLabel() {
  const selectedOption = algorithmSelect.options[algorithmSelect.selectedIndex];
  algorithmStat.textContent = selectedOption.textContent;
  algorithmInfo.textContent = algorithmInfoText[algorithmSelect.value];
}

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
  const isSccMode = graphAlgorithmSelect.value === "kosaraju" || Object.keys(sccGroupByNode).length > 0;
  const edgesToRender = isSccMode ? directedGraphEdges : graphEdges;

  if (isSccMode) {
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
    const offset = isSccMode ? 28 : 0;
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
    line.setAttribute("class", isSccMode ? "graph-edge directed" : (isSelected ? "graph-edge selected" : "graph-edge"));

    if (isSccMode) {
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
    label.textContent = edge.weight;
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
}

algorithmSelect.addEventListener("change", updateAlgorithmLabel);

graphAlgorithmSelect.addEventListener("change", resetGraphLab);

gridElement.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");

  if (!cell) {
    return;
  }

  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  const selectedTool = cellToolSelect.value;

  if (selectedTool === "start") {
    startCell = { row, col };
    gridState[row][col] = "empty";
    clearAlgorithmPaint();
    resetStats();
    refreshGridPaint();
    statusStat.textContent = "Start moved";
    return;
  }

  if (selectedTool === "target") {
    targetCell = { row, col };
    gridState[row][col] = "empty";
    clearAlgorithmPaint();
    resetStats();
    refreshGridPaint();
    statusStat.textContent = "Target moved";
    return;
  }

  if (isSameCell({ row, col }, startCell) || isSameCell({ row, col }, targetCell)) {
    statusStat.textContent = "Cannot overwrite start or target";
    return;
  }

  if (selectedTool === "erase") {
    gridState[row][col] = "empty";
  } else {
    gridState[row][col] = selectedTool;
  }

  clearAlgorithmPaint();
  resetStats();
  paintCell(cell, row, col);
  statusStat.textContent = `Placed ${selectedTool}`;
});

runButton.addEventListener("click", runSelectedAlgorithm);

runAllButton.addEventListener("click", runAllAlgorithms);

runGraphButton.addEventListener("click", runGraphAlgorithm);

runGraphAllButton.addEventListener("click", runAllGraphAlgorithms);

resetGraphButton.addEventListener("click", resetGraphLab);

loadPresetButton.addEventListener("click", () => {
  applyPreset(presetSelect.value);
  clearComparisonTable();
});

clearPathButton.addEventListener("click", () => {
  clearAlgorithmPaint();
  resetStats();
  statusStat.textContent = "Visualization cleared";
});

resetButton.addEventListener("click", () => {
  createGrid();
  resetStats();
  clearComparisonTable();
  statusStat.textContent = "Ready";
});

createGrid();
updateAlgorithmLabel();
renderComparisonTable();
renderGraph();
renderGraphComparisonTable();
