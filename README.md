# PathForge

PathForge is an interactive 2D graph algorithm visualizer built with plain HTML, CSS, and JavaScript. It demonstrates how classic DSA algorithms explore grids, optimize paths, build spanning trees, detect graph structure, and solve network-flow problems.

The project is designed to be easy to run, easy to deploy, and strong enough for a DSA-focused presentation.

## Tech Stack

```text
HTML + CSS + Vanilla JavaScript
```

No backend, no database, no frameworks, no APIs, and no build step.

## Key Features

- Interactive Grid Lab with start, target, blocked cells, bombs, and weighted cells.
- Demo presets for weighted detours, blocked mazes, bomb traps, and clean grids.
- Animated pathfinding with visited cells, final path, path cost, runtime, and comparison stats.
- Graph Lab with weighted, directed, capacity, DAG, and bridge-test graph modes.
- Graph algorithm comparison table with result, item count, and runtime.
- All-pairs distance matrix for Floyd-Warshall.
- Fully static deployment through GitHub Pages, Netlify, or Vercel.

## Algorithms Implemented

### Grid Lab

| Algorithm | Core Concept | Used For |
| --- | --- | --- |
| BFS | Queue, level-order traversal | Shortest path in unweighted grids |
| DFS | Stack/backtracking | Deep traversal and maze-style exploration |
| Dijkstra | Min heap, relaxation | Weighted shortest path |
| A* | Heuristic search | Faster guided pathfinding |
| Bellman-Ford | Edge relaxation | Shortest path foundation for negative-edge graphs |
| Bidirectional BFS | Two-frontier search | Faster unweighted path search |

### Graph Lab

| Algorithm | Core Concept | Used For |
| --- | --- | --- |
| Prim's MST | Min heap, greedy expansion | Minimum spanning tree |
| Kruskal's MST | Sorting, DSU | Minimum spanning tree |
| Kosaraju SCC | DFS, graph reversal | Strongly connected components |
| Floyd-Warshall | Dynamic programming | All-pairs shortest paths |
| Edmonds-Karp | BFS, residual graph | Maximum flow |
| Topological Sort | Indegree, queue | Dependency ordering in DAGs |
| Tarjan Bridges | DFS low-link values | Critical edge detection |

## Demo Walkthrough

Use these flows during a presentation:

1. **Pathfinding comparison**
   - Load `Weighted Detour`.
   - Click `Run All`.
   - Compare BFS, DFS, Dijkstra, A*, Bellman-Ford, and Bidirectional BFS.

2. **Obstacle and bomb behavior**
   - Load `Bomb Trap`.
   - Run BFS or A*.
   - Show how bombs and blocked cells stop path expansion.

3. **Minimum spanning tree**
   - In Graph Lab, run `Prim's MST`.
   - Then run `Kruskal's MST`.
   - Compare same total MST weight with different algorithmic strategies.

4. **Directed graph analysis**
   - Run `Kosaraju SCC`.
   - Show strongly connected components with colored node groups.

5. **All-pairs shortest path**
   - Run `Floyd-Warshall`.
   - Show the generated distance matrix.

6. **Network flow**
   - Run `Edmonds-Karp Max Flow`.
   - Show max flow and augmenting paths from source `A` to sink `F`.

7. **Dependency ordering**
   - Run `Topological Sort`.
   - Show the computed DAG order.

8. **Critical edge detection**
   - Run `Tarjan Bridges`.
   - Show bridge edges whose removal would disconnect the graph.

## File Structure

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

## Implementation Map

- `scripts/config.js`: DOM references, app state, labels, grid settings, and graph data.
- `scripts/structures.js`: reusable DSA structures such as `MinHeap` and `DisjointSet`.
- `scripts/grid-state.js`: grid creation, presets, cell painting, costs, and shared helpers.
- `scripts/grid-algorithms.js`: grid pathfinding algorithms.
- `scripts/grid-ui.js`: animation, run logic, stats, and grid comparison table.
- `scripts/graph-lab.js`: graph rendering and graph algorithms.
- `scripts/events.js`: button handlers and startup initialization.

## Run Locally

Open `index.html` directly in a browser.

No installation is required.

## Deploy On GitHub Pages

1. Push this project to a GitHub repository.
2. Open repository `Settings`.
3. Go to `Pages`.
4. Set source to `Deploy from a branch`.
5. Select the `main` branch and root folder.
6. Save and open the generated GitHub Pages link.

## Project Pitch

PathForge is a visual DSA lab that combines grid-based pathfinding and graph-theory algorithms in one deployable web project. It demonstrates traversal, shortest paths, greedy algorithms, dynamic programming, disjoint sets, strongly connected components, max flow, topological ordering, and bridge detection through interactive animations and comparison tables.
