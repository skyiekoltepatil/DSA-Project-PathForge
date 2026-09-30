/**
 * Dijkstra's Algorithm
 *
 * Finds the shortest path by always expanding the node with the smallest known distance.
 * Uses a priority queue (min-heap). Handles weighted edges correctly.
 *
 * Time Complexity:  O((V + E) log V)
 * Space Complexity: O(V)
 * Data Structure:   Priority Queue (Min-Heap)
 */

import { AlgorithmResult, AlgorithmType, Grid, Position } from '../types';
import { PriorityQueue } from '../dataStructures';
import { getCellWeight, getNeighbors, posKey, reconstructPath } from '../utils/grid';

export function dijkstra(grid: Grid, start: Position, end: Position): AlgorithmResult {
  const startTime = performance.now();

  const rows = grid.length;
  const cols = grid[0].length;
  
  const dist = new Map<string, number>();
  const parentMap = new Map<string, Position>();
  const visitedOrder: Position[] = [];
  const visited = new Set<string>();

  const pq = new PriorityQueue();

  const startKey = posKey(start);
  dist.set(startKey, 0);
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { position: current, priority: currentDist } = pq.dequeue()!;
    const key = posKey(current);

    // If we've already found a shorter path to this node, skip it
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
        pathLength: path.length, // or currentDist if we want weight sum
        executionTimeMs,
        algorithmType: AlgorithmType.DIJKSTRA,
      };
    }

    const neighbors = getNeighbors(grid, current, rows, cols);
    for (const neighbor of neighbors) {
      const nKey = posKey(neighbor);
      
      if (visited.has(nKey)) continue;

      const weight = getCellWeight(grid, neighbor);
      const newDist = currentDist + weight;

      const currentNeighborDist = dist.get(nKey) ?? Infinity;

      if (newDist < currentNeighborDist) {
        dist.set(nKey, newDist);
        parentMap.set(nKey, current);
        pq.enqueue(neighbor, newDist);
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
    algorithmType: AlgorithmType.DIJKSTRA,
  };
}
