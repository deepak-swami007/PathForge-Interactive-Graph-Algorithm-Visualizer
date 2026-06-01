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
const runButton = document.getElementById("runBtn");
const loadPresetButton = document.getElementById("loadPresetBtn");
const clearPathButton = document.getElementById("clearPathBtn");
const resetButton = document.getElementById("resetBtn");

let startCell = { row: 3, col: 4 };
let targetCell = { row: 10, col: 15 };
let gridState = [];

const algorithmInfoText = {
  bfs: "BFS explores level by level and finds the shortest path when every move has the same cost.",
  dfs: "DFS explores as deep as possible before backtracking. It is useful for traversal and maze-style search, but it does not guarantee the shortest path.",
  dijkstra: "Dijkstra finds the lowest-cost path in a weighted grid. It is ideal when some cells are more expensive than others.",
  astar: "A* combines real path cost with Manhattan distance, so it usually reaches the target with fewer explored cells than Dijkstra.",
};

const speedDelay = {
  fast: 4,
  normal: 12,
  slow: 40,
};

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
  runButton.disabled = true;

  const selectedAlgorithm = algorithmSelect.value;

  if (!["bfs", "dfs", "dijkstra", "astar"].includes(selectedAlgorithm)) {
    statusStat.textContent = "This algorithm comes in a later checkpoint";
    runButton.disabled = false;
    return;
  }

  let result;

  const startTime = performance.now();

  if (selectedAlgorithm === "bfs") {
    result = bfs();
  } else if (selectedAlgorithm === "dfs") {
    result = dfs();
  } else if (selectedAlgorithm === "dijkstra") {
    result = dijkstra();
  } else {
    result = astar();
  }

  const endTime = performance.now();
  const runtime = endTime - startTime;

  visitedStat.textContent = String(result.visitOrder.length);
  pathStat.textContent = String(Math.max(0, result.path.length - 1));
  costStat.textContent = String(result.cost || Math.max(0, result.path.length - 1));
  runtimeStat.textContent = `${runtime.toFixed(2)} ms`;

  const delay = getAnimationDelay();
  await animateCells(result.visitOrder, "visited", delay);
  await animateCells(result.path, "path", delay * 2);

  statusStat.textContent = result.path.length > 0 ? "Path found" : "No path found";
  runButton.disabled = false;
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

algorithmSelect.addEventListener("change", updateAlgorithmLabel);

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

loadPresetButton.addEventListener("click", () => {
  applyPreset(presetSelect.value);
});

clearPathButton.addEventListener("click", () => {
  clearAlgorithmPaint();
  resetStats();
  statusStat.textContent = "Visualization cleared";
});

resetButton.addEventListener("click", () => {
  createGrid();
  resetStats();
  statusStat.textContent = "Ready";
});

createGrid();
updateAlgorithmLabel();
