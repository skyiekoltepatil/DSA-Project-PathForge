/**
 * Breadth-First Search (BFS) Algorithm
 *
 * Uses a queue to explore nodes level by level.
 * Guarantees the shortest path in an unweighted graph.
 *
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V)
 * Data Structure:   Queue
 */

import { AlgorithmResult, AlgorithmType, Grid, Position } from '../types';
import { Queue } from '../dataStructures';
import { getNeighbors, posKey, reconstructPath } from '../utils/grid';

export function bfs(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const startTime = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parentMap = new Map<string, Position>();
  const visitedOrder: Position[] = [];

  const queue = new Queue();
  queue.enqueue(start);
  visited.add(posKey(start));

  while (!queue.isEmpty()) {
    const current = queue.dequeue()!;
    visitedOrder.push(current);

    // Found the end
    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(parentMap, end);
      const executionTimeMs = performance.now() - startTime;
      return {
        visitedOrder,
        path,
        found: true,
        nodesExplored: visitedOrder.length,
        pathLength: path.length,
        executionTimeMs,
        algorithmType: AlgorithmType.BFS,
      };
    }

    const neighbors = getNeighbors(grid, current, rows, cols);
    for (const neighbor of neighbors) {
      const key = posKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(key, current);
        queue.enqueue(neighbor);
      }
    }
  }

  // No path found
  const executionTimeMs = performance.now() - startTime;
  return {
    visitedOrder,
    path: [],
    found: false,
    nodesExplored: visitedOrder.length,
    pathLength: 0,
    executionTimeMs,
    algorithmType: AlgorithmType.BFS,
  };
}
