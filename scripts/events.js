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

graphModeSelect.addEventListener("change", () => {
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
  if (!isCustomGraph) {
    graphModeSelect.value = "custom";
    switchToCustomGraph();
  }
  clearCustomGraph();
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

createGrid();
updateAlgorithmLabel();
renderComparisonTable();
renderGraph();
renderGraphComparisonTable();

