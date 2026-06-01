const ROWS = 14;
const COLS = 20;

const gridElement = document.getElementById("grid");
const algorithmSelect = document.getElementById("algorithm");
const cellToolSelect = document.getElementById("cellTool");
const algorithmStat = document.getElementById("algorithmStat");
const statusStat = document.getElementById("statusStat");
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
    refreshGridPaint();
    statusStat.textContent = "Start moved";
    return;
  }

  if (selectedTool === "target") {
    targetCell = { row, col };
    gridState[row][col] = "empty";
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

  paintCell(cell, row, col);
  statusStat.textContent = `Placed ${selectedTool}`;
});

runButton.addEventListener("click", () => {
  updateAlgorithmLabel();
  statusStat.textContent = "Algorithm logic comes in the next step";
});

resetButton.addEventListener("click", () => {
  createGrid();
  statusStat.textContent = "Ready";
});

createGrid();
