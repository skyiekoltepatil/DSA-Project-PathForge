/**
 * Grid utility functions for creating, modifying, and querying the grid.
 */

import {
  Cell,
  CellState,
  CellType,
  Grid,
  Position,
} from '../types';
import { DEFAULT_WEIGHT, WEIGHTED_CELL_COST, DIRECTIONS } from './constants';

/**
 * Create a fresh grid with all empty cells.
 */
export function createGrid(rows: number, cols: number): Grid {
  const grid: Grid = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        type: CellType.EMPTY,
        state: CellState.UNVISITED,
        weight: DEFAULT_WEIGHT,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Reset all cell states to UNVISITED (preserves walls, weights, start, end).
 */
export function resetGridState(grid: Grid): Grid {
  return grid.map(row =>
    row.map(cell => ({
      ...cell,
      state: CellState.UNVISITED,
    }))
  );
}

/**
 * Clear everything except start and end positions.
 */
export function clearGrid(grid: Grid, start: Position, end: Position): Grid {
  return grid.map(row =>
    row.map(cell => {
      if (cell.row === start.row && cell.col === start.col) {
        return { ...cell, type: CellType.START, state: CellState.UNVISITED, weight: DEFAULT_WEIGHT };
      }
      if (cell.row === end.row && cell.col === end.col) {
        return { ...cell, type: CellType.END, state: CellState.UNVISITED, weight: DEFAULT_WEIGHT };
      }
      return {
        ...cell,
        type: CellType.EMPTY,
        state: CellState.UNVISITED,
        weight: DEFAULT_WEIGHT,
      };
    })
  );
}

/**
 * Clear only walls (preserve weights, start, end).
 */
export function clearWalls(grid: Grid): Grid {
  return grid.map(row =>
    row.map(cell => {
      if (cell.type === CellType.WALL) {
        return { ...cell, type: CellType.EMPTY, state: CellState.UNVISITED, weight: DEFAULT_WEIGHT };
      }
      return { ...cell, state: CellState.UNVISITED };
    })
  );
}

/**
 * Get valid neighbors for a given position (4-directional).
 */
export function getNeighbors(
  grid: Grid,
  pos: Position,
  rows: number,
  cols: number
): Position[] {
  const neighbors: Position[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].type !== CellType.WALL) {
      neighbors.push({ row: nr, col: nc });
    }
  }
  return neighbors;
}

/**
 * Reconstruct the path from parent map.
 */
export function reconstructPath(
  parentMap: Map<string, Position>,
  end: Position
): Position[] {
  const path: Position[] = [];
  let current: Position | undefined = end;
  while (current) {
    path.unshift(current);
    const key = posKey(current);
    current = parentMap.get(key);
  }
  return path;
}

/**
 * Generate a unique string key for a position.
 */
export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

/**
 * Calculate default start and end positions based on grid dimensions.
 */
export function getDefaultPositions(rows: number, cols: number): { start: Position; end: Position } {
  return {
    start: { row: Math.floor(rows / 4), col: Math.floor(cols / 4) },
    end: { row: Math.floor((rows * 3) / 4), col: Math.floor((cols * 3) / 4) },
  };
}

/**
 * Get the weight of a cell.
 */
export function getCellWeight(grid: Grid, pos: Position): number {
  const cell = grid[pos.row][pos.col];
  return cell.type === CellType.WEIGHTED ? WEIGHTED_CELL_COST : DEFAULT_WEIGHT;
}

/**
 * Calculate responsive grid dimensions based on container size.
 */
export function calculateGridDimensions(
  containerWidth: number,
  containerHeight: number,
  cellSize: number
): { rows: number; cols: number } {
  const cols = Math.min(70, Math.max(20, Math.floor((containerWidth - 40) / cellSize)));
  const rows = Math.min(35, Math.max(15, Math.floor((containerHeight - 40) / cellSize)));
  return { rows, cols };
}

/**
 * Generate random weighted cells.
 */
export function generateRandomWeights(
  grid: Grid,
  start: Position,
  end: Position,
  density: number = 0.15
): Grid {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (
        (r === start.row && c === start.col) ||
        (r === end.row && c === end.col) ||
        cell.type === CellType.WALL
      ) {
        return { ...cell, state: CellState.UNVISITED };
      }
      if (Math.random() < density) {
        return {
          ...cell,
          type: CellType.WEIGHTED,
          state: CellState.UNVISITED,
          weight: WEIGHTED_CELL_COST,
        };
      }
      return { ...cell, type: CellType.EMPTY, state: CellState.UNVISITED, weight: DEFAULT_WEIGHT };
    })
  );
}
