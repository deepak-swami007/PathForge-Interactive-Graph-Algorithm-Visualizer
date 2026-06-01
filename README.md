# PathForge

PathForge is an interactive 2D graph algorithm visualizer that demonstrates how classic DSA algorithms explore, optimize, and solve paths across grids and graphs.

The goal is to build a strong DSA project with the simplest web-deployable stack:

```text
HTML + CSS + Vanilla JavaScript
```

## Planned Features

- Grid lab with start, target, blocked cells, bombs, and weighted zones.
- Pathfinding algorithms such as BFS, DFS, Dijkstra, A*, Bellman-Ford, and Bidirectional BFS.
- Demo presets for weighted detours, blocked mazes, and bomb traps.
- Graph Lab with Prim's MST, Kruskal's MST, Kosaraju's SCC algorithm, Floyd-Warshall all-pairs shortest paths, and Edmonds-Karp max flow.
- Planned graph algorithms such as Topological Sort and Tarjan's algorithm.
- Visual stats for visited nodes, path length, path cost, and runtime.
- Free deployment through GitHub Pages.

## Current File Structure

```text
index.html
style.css
scripts/
  config.js
  structures.js
  grid-state.js
  grid-algorithms.js
  grid-ui.js
  graph-lab.js
  events.js
```

## Implementation Summary

- `config.js`: DOM references, app state, labels, grid settings, and graph data.
- `structures.js`: reusable DSA structures such as `MinHeap` and `DisjointSet`.
- `grid-state.js`: grid creation, presets, cell painting, costs, and shared helpers.
- `grid-algorithms.js`: BFS, DFS, Dijkstra, A*, Bellman-Ford, and Bidirectional BFS.
- `grid-ui.js`: animation, run logic, stats, and grid comparison table.
- `graph-lab.js`: graph rendering, Prim, Kruskal, Kosaraju, and graph comparison table.
- `events.js`: button handlers and app initialization.

## Run Locally

Open `index.html` directly in a browser.

No installation is required.
