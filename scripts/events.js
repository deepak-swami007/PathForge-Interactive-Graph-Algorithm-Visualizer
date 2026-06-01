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
