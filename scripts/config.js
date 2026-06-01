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
const comparisonBody = document.getElementById("comparisonBody");
const graphAlgorithmSelect = document.getElementById("graphAlgorithm");
const graphSvg = document.getElementById("graphSvg");
const graphAlgorithmStat = document.getElementById("graphAlgorithmStat");
const graphStatusStat = document.getElementById("graphStatusStat");
const graphWeightStat = document.getElementById("graphWeightStat");
const graphEdgesStat = document.getElementById("graphEdgesStat");
const graphRuntimeStat = document.getElementById("graphRuntimeStat");
const graphComparisonBody = document.getElementById("graphComparisonBody");
const runButton = document.getElementById("runBtn");
const runAllButton = document.getElementById("runAllBtn");
const loadPresetButton = document.getElementById("loadPresetBtn");
const clearPathButton = document.getElementById("clearPathBtn");
const resetButton = document.getElementById("resetBtn");
const runGraphButton = document.getElementById("runGraphBtn");
const runGraphAllButton = document.getElementById("runGraphAllBtn");
const resetGraphButton = document.getElementById("resetGraphBtn");

let startCell = { row: 3, col: 4 };
let targetCell = { row: 10, col: 15 };
let gridState = [];
let comparisonStats = {};
let selectedGraphEdges = new Set();
let selectedGraphNodes = new Set();
let sccGroupByNode = {};
let graphComparisonStats = {};

const algorithmInfoText = {
  bfs: "BFS explores level by level and finds the shortest path when every move has the same cost.",
  dfs: "DFS explores as deep as possible before backtracking. It is useful for traversal and maze-style search, but it does not guarantee the shortest path.",
  dijkstra: "Dijkstra finds the lowest-cost path in a weighted grid. It is ideal when some cells are more expensive than others.",
  astar: "A* combines real path cost with Manhattan distance, so it usually reaches the target with fewer explored cells than Dijkstra.",
  bellmanFord: "Bellman-Ford relaxes all edges repeatedly. It is slower than Dijkstra here, but it is important because it can handle negative edges in graph problems.",
  bidirectionalBfs: "Bidirectional BFS searches from the start and target at the same time, then joins the path when the two searches meet.",
};

const speedDelay = {
  fast: 4,
  normal: 12,
  slow: 40,
};

const algorithmLabels = {
  bfs: "BFS",
  dfs: "DFS",
  dijkstra: "Dijkstra",
  astar: "A*",
  bellmanFord: "Bellman-Ford",
  bidirectionalBfs: "Bidirectional BFS",
};

const gridAlgorithms = ["bfs", "dfs", "dijkstra", "astar", "bellmanFord", "bidirectionalBfs"];

const graphNodes = [
  { id: "A", x: 90, y: 85 },
  { id: "B", x: 250, y: 55 },
  { id: "C", x: 430, y: 90 },
  { id: "D", x: 150, y: 245 },
  { id: "E", x: 335, y: 250 },
  { id: "F", x: 540, y: 225 },
];

const graphEdges = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "D", weight: 3 },
  { from: "B", to: "C", weight: 5 },
  { from: "B", to: "D", weight: 6 },
  { from: "B", to: "E", weight: 7 },
  { from: "C", to: "E", weight: 2 },
  { from: "C", to: "F", weight: 8 },
  { from: "D", to: "E", weight: 4 },
  { from: "E", to: "F", weight: 1 },
];

const directedGraphEdges = [
  { from: "A", to: "B" },
  { from: "B", to: "C" },
  { from: "C", to: "A" },
  { from: "C", to: "D" },
  { from: "D", to: "E" },
  { from: "E", to: "F" },
  { from: "F", to: "D" },
  { from: "B", to: "D" },
];

const graphAlgorithmLabels = {
  prim: "Prim's MST",
  kruskal: "Kruskal's MST",
  kosaraju: "Kosaraju SCC",
};
