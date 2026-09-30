/**
 * A* Search Algorithm
 *
 * Combines actual distance (g-score) with a heuristic estimate (h-score) toward the destination.
 * Uses a priority queue (min-heap).
 *
 * Time Complexity:  O((V + E) log V)
 * Space Complexity: O(V)
 * Data Structure:   Priority Queue (Min-Heap)
 */

import { AlgorithmResult, AlgorithmType, Grid, Position } from '../types';
import { PriorityQueue } from '../dataStructures';
import { getCellWeight, getNeighbors, posKey, reconstructPath } from '../utils/grid';
import { manhattanDistance } from '../utils/heuristics';

export function astar(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const startTime = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;
  
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parentMap = new Map<string, Position>();
  const visitedOrder: Position[] = [];
  const visited = new Set<string>();

  const pq = new PriorityQueue();

  const startKey = posKey(start);
  gScore.set(startKey, 0);
  
  const initialHeuristic = manhattanDistance(start, end);
  fScore.set(startKey, initialHeuristic);
  pq.enqueue(start, initialHeuristic);

  while (!pq.isEmpty()) {
    const { item: current } = pq.dequeue()!;
    const key = posKey(current);

    // Skip if we've already processed this node optimally
    if (visited.has(key)) continue;

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
        algorithmType: AlgorithmType.ASTAR,
      };
    }

    const currentGScore = gScore.get(key) ?? Infinity;
    const neighbors = getNeighbors(grid, current, rows, cols);

    for (const neighbor of neighbors) {
      const nKey = posKey(neighbor);
      
      if (visited.has(nKey)) continue;

      const weight = getCellWeight(grid, neighbor);
      const tentativeGScore = currentGScore + weight;
      
      const neighborGScore = gScore.get(nKey) ?? Infinity;

      if (tentativeGScore < neighborGScore) {
        // This path to neighbor is better than any previous one
        parentMap.set(nKey, current);
        gScore.set(nKey, tentativeGScore);
        
        const hScore = manhattanDistance(neighbor, end);
        const newFScore = tentativeGScore + hScore;
        fScore.set(nKey, newFScore);
        
        pq.enqueue(neighbor, newFScore);
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
    algorithmType: AlgorithmType.ASTAR,
  };
}
