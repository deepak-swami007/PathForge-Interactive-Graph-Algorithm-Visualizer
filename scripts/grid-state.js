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
