const ROWS = 14;
const COLS = 20;

const gridElement = document.getElementById("grid");
const algorithmSelect = document.getElementById("algorithm");
const algorithmStat = document.getElementById("algorithmStat");
const statusStat = document.getElementById("statusStat");
const runButton = document.getElementById("runBtn");
const resetButton = document.getElementById("resetBtn");

const startCell = { row: 3, col: 4 };
const targetCell = { row: 10, col: 15 };

function createGrid() {
  gridElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("aria-label", `Cell ${row}, ${col}`);

      if (row === startCell.row && col === startCell.col) {
        cell.classList.add("start");
      }

      if (row === targetCell.row && col === targetCell.col) {
        cell.classList.add("target");
      }

      gridElement.appendChild(cell);
    }
  }
}

function updateAlgorithmLabel() {
  const selectedOption = algorithmSelect.options[algorithmSelect.selectedIndex];
  algorithmStat.textContent = selectedOption.textContent;
}

algorithmSelect.addEventListener("change", updateAlgorithmLabel);

runButton.addEventListener("click", () => {
  updateAlgorithmLabel();
  statusStat.textContent = "Algorithm logic comes in the next step";
});

resetButton.addEventListener("click", () => {
  createGrid();
  statusStat.textContent = "Ready";
});

createGrid();
