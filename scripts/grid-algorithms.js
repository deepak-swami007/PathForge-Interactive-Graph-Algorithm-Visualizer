function runMultiTargetAlgorithm(algoName) {
  let currentStart = startCell;
  let remainingTargets = [...targetCells];
  let finalVisitOrder = [];
  let finalPath = [];
  let finalCost = 0;

  while (remainingTargets.length > 0) {
    let stageResult;
    if (algoName === "bfs") {
      stageResult = bfsStage(currentStart, remainingTargets);
    } else if (algoName === "dfs") {
      stageResult = dfsStage(currentStart, remainingTargets);
    } else if (algoName === "dijkstra") {
      stageResult = dijkstraStage(currentStart, remainingTargets);
    } else if (algoName === "astar") {
      stageResult = astarStage(currentStart, remainingTargets);
    } else if (algoName === "bellmanFord") {
      stageResult = bellmanFordStage(currentStart, remainingTargets);
    } else if (algoName === "bidirectionalBfs") {
      stageResult = bidirectionalBfsStage(currentStart, remainingTargets);
    }

    if (!stageResult || stageResult.path.length === 0) {
      break;
    }

    finalVisitOrder.push(...stageResult.visitOrder);

    if (finalPath.length > 0) {
      finalPath.push(...stageResult.path.slice(1));
    } else {
      finalPath.push(...stageResult.path);
    }

    finalCost += stageResult.cost || 0;

    currentStart = stageResult.reachedTarget;
    remainingTargets = remainingTargets.filter(t => !isSameCell(t, currentStart));
  }

  return { visitOrder: finalVisitOrder, path: finalPath, cost: finalCost };
}

function bfs() {
  return runMultiTargetAlgorithm("bfs");
}

function bfsStage(start, targets) {
  const queue = [start];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[start.row][start.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  let reachedTarget = null;

  while (queue.length > 0) {
    const current = queue.shift();
    visitOrder.push(current);

    if (targets.some(t => isSameCell(current, t))) {
      reachedTarget = current;
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol)) {
        continue;
      }

      if (visited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      visited[nextRow][nextCol] = true;
      parent[makeKey(nextRow, nextCol)] = current;
      queue.push({ row: nextRow, col: nextCol });
    }
  }

  const path = reachedTarget ? buildPathStage(parent, start, reachedTarget) : [];
  let cost = 0;
  if (path.length > 0) {
    for (let i = 1; i < path.length; i++) {
      cost += getCellCost(path[i].row, path[i].col);
    }
  }
  return { visitOrder, path, cost, reachedTarget };
}

function bidirectionalBfs() {
  return runMultiTargetAlgorithm("bidirectionalBfs");
}

function bidirectionalBfsStage(start, targets) {
  let bestResult = null;
  let minPathLength = Infinity;

  for (const target of targets) {
    const result = runSingleBidirectionalBfs(start, target);
    if (result.path.length > 0 && result.path.length < minPathLength) {
      minPathLength = result.path.length;
      bestResult = { ...result, reachedTarget: target };
    }
  }

  if (bestResult) {
    let cost = 0;
    for (let i = 1; i < bestResult.path.length; i++) {
      cost += getCellCost(bestResult.path[i].row, bestResult.path[i].col);
    }
    bestResult.cost = cost;
    return bestResult;
  }

  return { visitOrder: [], path: [], cost: 0, reachedTarget: null };
}

function runSingleBidirectionalBfs(start, target) {
  const startQueue = [start];
  const targetQueue = [target];
  const visitedFromStart = [];
  const visitedFromTarget = [];
  const parentFromStart = {};
  const parentFromTarget = {};
  const visitOrder = [];
  let meetingCell = null;

  for (let row = 0; row < ROWS; row++) {
    visitedFromStart.push(Array(COLS).fill(false));
    visitedFromTarget.push(Array(COLS).fill(false));
  }

  visitedFromStart[start.row][start.col] = true;
  visitedFromTarget[target.row][target.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (startQueue.length > 0 && targetQueue.length > 0 && !meetingCell) {
    meetingCell = expandBidirectionalLayer(
      startQueue,
      visitedFromStart,
      visitedFromTarget,
      parentFromStart,
      directions,
      visitOrder
    );

    if (meetingCell) {
      break;
    }

    meetingCell = expandBidirectionalLayer(
      targetQueue,
      visitedFromTarget,
      visitedFromStart,
      parentFromTarget,
      directions,
      visitOrder
    );
  }

  const path = meetingCell
    ? buildBidirectionalPathStage(meetingCell, start, target, parentFromStart, parentFromTarget)
    : [];

  return { visitOrder, path };
}

function expandBidirectionalLayer(queue, ownVisited, otherVisited, ownParent, directions, visitOrder) {
  const layerSize = queue.length;

  for (let index = 0; index < layerSize; index++) {
    const current = queue.shift();
    visitOrder.push(current);

    if (otherVisited[current.row][current.col]) {
      return current;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || ownVisited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      ownVisited[nextRow][nextCol] = true;
      ownParent[makeKey(nextRow, nextCol)] = current;
      const nextCell = { row: nextRow, col: nextCol };

      if (otherVisited[nextRow][nextCol]) {
        return nextCell;
      }

      queue.push(nextCell);
    }
  }

  return null;
}

function buildBidirectionalPathStage(meetingCell, start, target, parentFromStart, parentFromTarget) {
  const leftPath = [];
  let current = meetingCell;

  while (!isSameCell(current, start)) {
    leftPath.push(current);
    current = parentFromStart[makeKey(current.row, current.col)];
  }

  leftPath.push(start);
  leftPath.reverse();

  if (isSameCell(meetingCell, target)) {
    return leftPath;
  }

  const rightPath = [];
  current = parentFromTarget[makeKey(meetingCell.row, meetingCell.col)];

  while (current && !isSameCell(current, target)) {
    rightPath.push(current);
    current = parentFromTarget[makeKey(current.row, current.col)];
  }

  rightPath.push(target);
  return [...leftPath, ...rightPath];
}

function dfs() {
  return runMultiTargetAlgorithm("dfs");
}

function dfsStage(start, targets) {
  const stack = [start];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[start.row][start.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  let reachedTarget = null;

  while (stack.length > 0) {
    const current = stack.pop();
    visitOrder.push(current);

    if (targets.some(t => isSameCell(current, t))) {
      reachedTarget = current;
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol)) {
        continue;
      }

      if (visited[nextRow][nextCol] || !canVisit(nextRow, nextCol)) {
        continue;
      }

      visited[nextRow][nextCol] = true;
      parent[makeKey(nextRow, nextCol)] = current;
      stack.push({ row: nextRow, col: nextCol });
    }
  }

  const path = reachedTarget ? buildPathStage(parent, start, reachedTarget) : [];
  let cost = 0;
  if (path.length > 0) {
    for (let i = 1; i < path.length; i++) {
      cost += getCellCost(path[i].row, path[i].col);
    }
  }
  return { visitOrder, path, cost, reachedTarget };
}

function dijkstra() {
  return runMultiTargetAlgorithm("dijkstra");
}

function dijkstraStage(start, targets) {
  const distances = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const priorityQueue = new MinHeap((first, second) => first.distance - second.distance);
  priorityQueue.push({ ...start, distance: 0 });

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  distances[start.row][start.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  let reachedTarget = null;

  while (priorityQueue.size() > 0) {
    const current = priorityQueue.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (targets.some(t => isSameCell(current, t))) {
      reachedTarget = current;
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
        continue;
      }

      const nextDistance = distances[current.row][current.col] + getCellCost(nextRow, nextCol);

      if (nextDistance < distances[nextRow][nextCol]) {
        distances[nextRow][nextCol] = nextDistance;
        parent[makeKey(nextRow, nextCol)] = { row: current.row, col: current.col };
        priorityQueue.push({ row: nextRow, col: nextCol, distance: nextDistance });
      }
    }
  }

  const path = reachedTarget ? buildPathStage(parent, start, reachedTarget) : [];
  const cost = reachedTarget ? distances[reachedTarget.row][reachedTarget.col] : 0;
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0, reachedTarget };
}

function manhattanDistance(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col);
}

function astar() {
  return runMultiTargetAlgorithm("astar");
}

function astarStage(start, targets) {
  const gCost = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const openSet = new MinHeap((first, second) => first.f - second.f);

  const getMinHeuristic = (cell) => {
    let minH = Infinity;
    for (const t of targets) {
      const h = manhattanDistance(cell, t);
      if (h < minH) minH = h;
    }
    return minH;
  };

  openSet.push({
    ...start,
    g: 0,
    f: getMinHeuristic(start),
  });

  for (let row = 0; row < ROWS; row++) {
    gCost.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  gCost[start.row][start.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  let reachedTarget = null;

  while (openSet.size() > 0) {
    const current = openSet.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (targets.some(t => isSameCell(current, t))) {
      reachedTarget = current;
      break;
    }

    for (const direction of directions) {
      const nextRow = current.row + direction.row;
      const nextCol = current.col + direction.col;

      if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
        continue;
      }

      const nextGCost = gCost[current.row][current.col] + getCellCost(nextRow, nextCol);

      if (nextGCost < gCost[nextRow][nextCol]) {
        const nextCell = { row: nextRow, col: nextCol };
        gCost[nextRow][nextCol] = nextGCost;
        parent[makeKey(nextRow, nextCol)] = { row: current.row, col: current.col };
        openSet.push({
          ...nextCell,
          g: nextGCost,
          f: nextGCost + getMinHeuristic(nextCell),
        });
      }
    }
  }

  const path = reachedTarget ? buildPathStage(parent, start, reachedTarget) : [];
  const cost = reachedTarget ? gCost[reachedTarget.row][reachedTarget.col] : 0;
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0, reachedTarget };
}

function getGridEdges() {
  const edges = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!canVisit(row, col)) {
        continue;
      }

      for (const direction of directions) {
        const nextRow = row + direction.row;
        const nextCol = col + direction.col;

        if (!isInsideGrid(nextRow, nextCol) || !canVisit(nextRow, nextCol)) {
          continue;
        }

        edges.push({
          from: { row, col },
          to: { row: nextRow, col: nextCol },
          weight: getCellCost(nextRow, nextCol),
        });
      }
    }
  }

  return edges;
}

function bellmanFord() {
  return runMultiTargetAlgorithm("bellmanFord");
}

function bellmanFordStage(start, targets) {
  const distances = [];
  const parent = {};
  const visitOrder = [];
  const edges = getGridEdges();

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
  }

  distances[start.row][start.col] = 0;

  for (let iteration = 0; iteration < ROWS * COLS - 1; iteration++) {
    let changed = false;

    for (const edge of edges) {
      const fromDistance = distances[edge.from.row][edge.from.col];

      if (!Number.isFinite(fromDistance)) {
        continue;
      }

      const nextDistance = fromDistance + edge.weight;

      if (nextDistance < distances[edge.to.row][edge.to.col]) {
        distances[edge.to.row][edge.to.col] = nextDistance;
        parent[makeKey(edge.to.row, edge.to.col)] = edge.from;
        visitOrder.push(edge.to);
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  let reachedTarget = null;
  let minCost = Infinity;
  for (const t of targets) {
    const dist = distances[t.row][t.col];
    if (dist < minCost) {
      minCost = dist;
      reachedTarget = t;
    }
  }

  const path = reachedTarget ? buildPathStage(parent, start, reachedTarget) : [];
  return { visitOrder, path, cost: Number.isFinite(minCost) ? minCost : 0, reachedTarget };
}

function buildPathStage(parent, start, target) {
  const path = [];
  let current = target;

  if (!parent[makeKey(current.row, current.col)] && !isSameCell(start, target)) {
    return path;
  }

  while (!isSameCell(current, start)) {
    path.push(current);
    current = parent[makeKey(current.row, current.col)];
  }

  path.push(start);
  path.reverse();
  return path;
}
