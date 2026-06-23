async function animateCells(cells, className, delayMs, sessionId) {
  for (const cellPosition of cells) {
    if (sessionId !== gridAnimationId) {
      return;
    }
    await checkPause();
    if (sessionId !== gridAnimationId) {
      return;
    }
    if (isSameCell(cellPosition, startCell) || targetCells.some(t => isSameCell(cellPosition, t))) {
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
  if (!gridCompareList.includes(selectedAlgorithm)) {
    gridCompareList.push(selectedAlgorithm);
  }

  const runResult = runAlgorithmByName(selectedAlgorithm);
  updateStatsFromRun(selectedAlgorithm, runResult);
  await animateRunResult(runResult, runSessionId);

  if (runSessionId === gridAnimationId) {
    statusStat.textContent = runResult.path.length > 0 ? "Path found" : "No path found";
    setControlsDisabled(false);
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("pauseBtn").disabled = true;
    isPaused = false;
  }
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

async function animateRunResult(result, sessionId) {
  const delay = getAnimationDelay();
  await animateCells(result.visitOrder, "visited", delay, sessionId);
  if (sessionId !== gridAnimationId) return;
  await animateCells(result.path, "path", delay * 2, sessionId);
}

async function runAllAlgorithms() {
  clearAlgorithmPaint();
  resetStats();
  gridCompareList = [...gridAlgorithms];
  clearComparisonTable();
  setControlsDisabled(true);

  gridAnimationId++;
  const runSessionId = gridAnimationId;

  for (const algorithm of gridAlgorithms) {
    if (runSessionId !== gridAnimationId) break;

    algorithmSelect.value = algorithm;
    updateAlgorithmLabel();
    statusStat.textContent = `Running ${algorithmLabels[algorithm]}`;

    const result = runAlgorithmByName(algorithm);
    updateStatsFromRun(algorithm, result);
    clearAlgorithmPaint();
    await animateRunResult(result, runSessionId);
    if (runSessionId !== gridAnimationId) break;
    await checkPause();
    if (runSessionId !== gridAnimationId) break;
    await sleep(120);
  }

  if (runSessionId === gridAnimationId) {
    statusStat.textContent = "Run All complete";
    setControlsDisabled(false);
    document.getElementById("pauseBtn").textContent = "Pause";
    document.getElementById("pauseBtn").disabled = true;
    isPaused = false;
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
  algorithmInfo.textContent = algorithmInfoText[algorithmSelect.value];

  const complexity = gridComplexity[algorithmSelect.value];
  if (complexity) {
    timeComplexity.textContent = complexity.time;
    spaceComplexity.textContent = complexity.space;
  } else {
    timeComplexity.textContent = "-";
    spaceComplexity.textContent = "-";
  }
}

