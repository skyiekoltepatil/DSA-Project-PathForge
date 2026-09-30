/**
 * Heuristic functions for pathfinding algorithms.
 */

import { Position } from '../types';

/**
 * Manhattan distance heuristic for grid-based pathfinding.
 * Admissible for 4-directional movement (no diagonals).
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}
