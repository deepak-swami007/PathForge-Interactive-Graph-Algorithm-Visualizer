const ROWS = 14;
const COLS = 20;

const gridElement = document.getElementById("grid");
const algorithmSelect = document.getElementById("algorithm");
const cellToolSelect = document.getElementById("cellTool");
const algorithmStat = document.getElementById("algorithmStat");
const statusStat = document.getElementById("statusStat");
const visitedStat = document.getElementById("visitedStat");
const pathStat = document.getElementById("pathStat");
const runButton = document.getElementById("runBtn");
const resetButton = document.getElementById("resetBtn");

let startCell = { row: 3, col: 4 };
let targetCell = { row: 10, col: 15 };
let gridState = [];

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

  if (selectedAlgorithm !== "bfs") {
    statusStat.textContent = "This algorithm comes in a later checkpoint";
    runButton.disabled = false;
    return;
  }

  const result = bfs();
  visitedStat.textContent = String(result.visitOrder.length);
  pathStat.textContent = String(Math.max(0, result.path.length - 1));

  await animateCells(result.visitOrder, "visited", 12);
  await animateCells(result.path, "path", 24);

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

resetButton.addEventListener("click", () => {
  createGrid();
  resetStats();
  statusStat.textContent = "Ready";
});

createGrid();
