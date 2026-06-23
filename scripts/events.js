algorithmSelect.addEventListener("change", updateAlgorithmLabel);

graphAlgorithmSelect.addEventListener("change", resetGraphLab);

function updateWeightInputVisibility() {
  const customWeightGroup = document.getElementById("gridWeightInputGroup");
  if (customWeightGroup) {
    if (cellToolSelect.value === "weight") {
      customWeightGroup.style.display = "grid";
    } else {
      customWeightGroup.style.display = "none";
    }
  }
}
cellToolSelect.addEventListener("change", updateWeightInputVisibility);
updateWeightInputVisibility();

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
    if (isSameCell({ row, col }, startCell)) {
      statusStat.textContent = "Cannot place target on start cell";
      return;
    }
    const targetIndex = targetCells.findIndex(t => isSameCell(t, { row, col }));
    if (targetIndex !== -1) {
      if (targetCells.length > 1) {
        targetCells.splice(targetIndex, 1);
        statusStat.textContent = "Target removed";
      } else {
        statusStat.textContent = "Must have at least one target cell";
        return;
      }
    } else {
      targetCells.push({ row, col });
      gridState[row][col] = "empty";
      statusStat.textContent = "Target added";
    }
    clearAlgorithmPaint();
    resetStats();
    refreshGridPaint();
    return;
  }

  if (isSameCell({ row, col }, startCell) || targetCells.some(t => isSameCell(t, { row, col }))) {
    statusStat.textContent = "Cannot overwrite start or target";
    return;
  }

  if (selectedTool === "erase") {
    gridState[row][col] = "empty";
  } else if (selectedTool === "weight") {
    let weightVal = parseInt(document.getElementById("gridCustomWeight").value, 10);
    if (isNaN(weightVal) || weightVal < 1) {
      weightVal = 5;
    } else if (weightVal > 99) {
      weightVal = 99;
    }
    gridState[row][col] = `weight_${weightVal}`;
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
  gridAnimationId++; // Cancel running animation!
  forceResume();
  document.getElementById("pauseBtn").textContent = "Pause";
  document.getElementById("pauseBtn").disabled = true;
  applyPreset(presetSelect.value);
  clearComparisonTable();
  setControlsDisabled(false);
});

clearPathButton.addEventListener("click", () => {
  gridAnimationId++; // Cancel running animation!
  forceResume();
  document.getElementById("pauseBtn").textContent = "Pause";
  document.getElementById("pauseBtn").disabled = true;
  clearAlgorithmPaint();
  resetStats();
  statusStat.textContent = "Visualization cleared";
  setControlsDisabled(false);
});

resetButton.addEventListener("click", () => {
  gridAnimationId++; // Cancel running animation!
  forceResume();
  document.getElementById("pauseBtn").textContent = "Pause";
  document.getElementById("pauseBtn").disabled = true;
  createGrid();
  resetStats();
  clearComparisonTable();
  statusStat.textContent = "Ready";
  setControlsDisabled(false);
});

graphModeSelect.addEventListener("change", () => {
  graphAnimationId++; // Cancel running animation!
  forceResume();
  document.getElementById("pauseGraphBtn").textContent = "Pause";
  document.getElementById("pauseGraphBtn").disabled = true;
  if (graphModeSelect.value === "preset") {
    switchToPresetGraph();
  } else {
    switchToCustomGraph();
  }
});

graphEditToolSelect.addEventListener("change", () => {
  pendingEdgeFrom = null;
  draggingNode = null;
  updateSvgCursorClass();
  renderGraph();

  const toolHints = {
    select: "Select mode — click nodes or edges to inspect.",
    addNode: "Click on the canvas to place a new node.",
    addEdge: "Click a source node, then click a destination node to create an edge.",
    delete: "Click a node or edge to delete it.",
    move: "Click and drag a node to reposition it.",
  };
  updateEditorHint(toolHints[graphEditToolSelect.value] || "");
});

graphSvg.addEventListener("click", handleGraphSvgClick);
graphSvg.addEventListener("mousedown", handleGraphSvgMouseDown);
graphSvg.addEventListener("mousemove", handleGraphSvgMouseMove);
graphSvg.addEventListener("mouseup", handleGraphSvgMouseUp);
document.addEventListener("mouseup", handleGraphSvgMouseUp);

clearGraphButton.addEventListener("click", () => {
  graphAnimationId++; // Cancel running animation!
  forceResume();
  document.getElementById("pauseGraphBtn").textContent = "Pause";
  document.getElementById("pauseGraphBtn").disabled = true;
  if (!isCustomGraph) {
    graphModeSelect.value = "custom";
    switchToCustomGraph();
  }
  clearCustomGraph();
});

// Comparison List Management Event Listeners
addGridCompare.addEventListener("change", () => {
  const selectedAlgo = addGridCompare.value;
  if (selectedAlgo && !gridCompareList.includes(selectedAlgo)) {
    gridCompareList.push(selectedAlgo);
    renderComparisonTable();
  }
  addGridCompare.value = "";
});

addGraphCompare.addEventListener("change", () => {
  const selectedAlgo = addGraphCompare.value;
  if (selectedAlgo && !graphCompareList.includes(selectedAlgo)) {
    graphCompareList.push(selectedAlgo);
    renderGraphComparisonTable();
  }
  addGraphCompare.value = "";
});

comparisonBody.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".remove-compare-btn");
  if (removeBtn) {
    const algo = removeBtn.dataset.algo;
    gridCompareList = gridCompareList.filter(item => item !== algo);
    renderComparisonTable();
  }
});

graphComparisonBody.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".remove-compare-btn");
  if (removeBtn) {
    const algo = removeBtn.dataset.algo;
    graphCompareList = graphCompareList.filter(item => item !== algo);
    renderGraphComparisonTable();
  }
});

// Tab switching functionality
const tabButtons = document.querySelectorAll(".tab-btn");
const appShell = document.querySelector(".app-shell");

function switchTab(tabName) {
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (tabName === "grid") {
    appShell.classList.remove("tab-graph");
    appShell.classList.add("tab-grid");
  } else {
    appShell.classList.remove("tab-grid");
    appShell.classList.add("tab-graph");
  }

  localStorage.setItem("pathforge_active_tab", tabName);
}

// Add tab button click event listeners
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

// Restore saved tab on page load
const savedTab = localStorage.getItem("pathforge_active_tab");
if (savedTab === "grid" || savedTab === "graph") {
  switchTab(savedTab);
} else {
  switchTab("grid");
}

const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = "Pause";
    if (resumeResolve) {
      resumeResolve();
      resumeResolve = null;
    }
  } else {
    isPaused = true;
    pauseBtn.textContent = "Resume";
  }
});

const pauseGraphBtn = document.getElementById("pauseGraphBtn");
pauseGraphBtn.addEventListener("click", () => {
  if (isPaused) {
    isPaused = false;
    pauseGraphBtn.textContent = "Pause";
    if (resumeResolve) {
      resumeResolve();
      resumeResolve = null;
    }
  } else {
    isPaused = true;
    pauseGraphBtn.textContent = "Resume";
  }
});

createGrid();
updateAlgorithmLabel();
renderComparisonTable();
resetGraphLab();
renderGraphComparisonTable();

