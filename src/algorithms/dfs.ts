/**
 * Depth-First Search (DFS) Algorithm
 *
 * Explores as deeply as possible along each branch before backtracking.
 * Uses a stack. Does NOT guarantee the shortest path.
 *
 * Time Complexity:  O(V + E)
 * Space Complexity: O(V)
 * Data Structure:   Stack
 */

import { AlgorithmResult, AlgorithmType, Grid, Position } from '../types';
import { getNeighbors, posKey, reconstructPath } from '../utils/grid';

export function dfs(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const startTime = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set<string>();
  const parentMap = new Map<string, Position>();
  const visitedOrder: Position[] = [];

  const stack: Position[] = [];
  stack.push(start);

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = posKey(current);

    if (!visited.has(key)) {
      visited.add(key);
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
          algorithmType: AlgorithmType.DFS,
        };
      }

      // Add neighbors to stack
      // To make it look visually pleasing, we reverse the neighbors so it
      // explores right/down before up/left if possible.
      const neighbors = getNeighbors(grid, current, rows, cols).reverse();
      for (const neighbor of neighbors) {
        const nKey = posKey(neighbor);
        if (!visited.has(nKey)) {
          // In DFS, we set parent when pushing to stack. This can lead to non-optimal paths,
          // which is expected for DFS.
          parentMap.set(nKey, current);
          stack.push(neighbor);
        }
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
    algorithmType: AlgorithmType.DFS,
  };
}
