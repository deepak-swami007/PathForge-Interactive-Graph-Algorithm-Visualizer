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
