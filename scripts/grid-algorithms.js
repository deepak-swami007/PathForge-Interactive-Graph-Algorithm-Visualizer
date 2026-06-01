function bfs() {
  const queue = [startCell];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[startCell.row][startCell.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    visitOrder.push(current);

    if (isSameCell(current, targetCell)) {
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

  const path = buildPath(parent);
  return { visitOrder, path };
}

function bidirectionalBfs() {
  const startQueue = [startCell];
  const targetQueue = [targetCell];
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

  visitedFromStart[startCell.row][startCell.col] = true;
  visitedFromTarget[targetCell.row][targetCell.col] = true;

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
    ? buildBidirectionalPath(meetingCell, parentFromStart, parentFromTarget)
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

function buildBidirectionalPath(meetingCell, parentFromStart, parentFromTarget) {
  const leftPath = [];
  let current = meetingCell;

  while (!isSameCell(current, startCell)) {
    leftPath.push(current);
    current = parentFromStart[makeKey(current.row, current.col)];
  }

  leftPath.push(startCell);
  leftPath.reverse();

  if (isSameCell(meetingCell, targetCell)) {
    return leftPath;
  }

  const rightPath = [];
  current = parentFromTarget[makeKey(meetingCell.row, meetingCell.col)];

  while (current && !isSameCell(current, targetCell)) {
    rightPath.push(current);
    current = parentFromTarget[makeKey(current.row, current.col)];
  }

  rightPath.push(targetCell);
  return [...leftPath, ...rightPath];
}

function dfs() {
  const stack = [startCell];
  const visited = [];
  const parent = {};
  const visitOrder = [];

  for (let row = 0; row < ROWS; row++) {
    visited.push(Array(COLS).fill(false));
  }

  visited[startCell.row][startCell.col] = true;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (stack.length > 0) {
    const current = stack.pop();
    visitOrder.push(current);

    if (isSameCell(current, targetCell)) {
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

  const path = buildPath(parent);
  return { visitOrder, path };
}

function dijkstra() {
  const distances = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const priorityQueue = new MinHeap((first, second) => first.distance - second.distance);
  priorityQueue.push({ ...startCell, distance: 0 });

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  distances[startCell.row][startCell.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (priorityQueue.size() > 0) {
    const current = priorityQueue.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (isSameCell(current, targetCell)) {
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

  const path = buildPath(parent);
  const cost = distances[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
}

function manhattanDistance(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col);
}

function astar() {
  const gCost = [];
  const visited = [];
  const parent = {};
  const visitOrder = [];
  const openSet = new MinHeap((first, second) => first.f - second.f);
  openSet.push({
    ...startCell,
    g: 0,
    f: manhattanDistance(startCell, targetCell),
  });

  for (let row = 0; row < ROWS; row++) {
    gCost.push(Array(COLS).fill(Infinity));
    visited.push(Array(COLS).fill(false));
  }

  gCost[startCell.row][startCell.col] = 0;

  const directions = [
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
  ];

  while (openSet.size() > 0) {
    const current = openSet.pop();

    if (visited[current.row][current.col]) {
      continue;
    }

    visited[current.row][current.col] = true;
    visitOrder.push({ row: current.row, col: current.col });

    if (isSameCell(current, targetCell)) {
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
          f: nextGCost + manhattanDistance(nextCell, targetCell),
        });
      }
    }
  }

  const path = buildPath(parent);
  const cost = gCost[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
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
  const distances = [];
  const parent = {};
  const visitOrder = [];
  const edges = getGridEdges();

  for (let row = 0; row < ROWS; row++) {
    distances.push(Array(COLS).fill(Infinity));
  }

  distances[startCell.row][startCell.col] = 0;

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

  const path = buildPath(parent);
  const cost = distances[targetCell.row][targetCell.col];
  return { visitOrder, path, cost: Number.isFinite(cost) ? cost : 0 };
}

function buildPath(parent) {
  const path = [];
  let current = targetCell;

  if (!parent[makeKey(current.row, current.col)] && !isSameCell(startCell, targetCell)) {
    return path;
  }

  while (!isSameCell(current, startCell)) {
    path.push(current);
    current = parent[makeKey(current.row, current.col)];
  }

  path.push(startCell);
  path.reverse();
  return path;
}
