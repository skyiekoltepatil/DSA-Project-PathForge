/**
 * Maze Generation Algorithms
 */

import { CellState, CellType, Grid, Position } from '../types';
import { DEFAULT_WEIGHT } from '../utils/constants';

/**
 * Creates a maze using Recursive Backtracking.
 * Ensures the grid is completely filled with walls first, then carves paths.
 */
export function generateRecursiveBacktrackingMaze(
  grid: Grid,
  start: Position,
  end: Position
): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  
  // 1. Start with a grid full of walls
  const newGrid = grid.map((row, r) =>
    row.map((cell, c) => {
      if (
        (r === start.row && c === start.col) ||
        (r === end.row && c === end.col)
      ) {
        return { ...cell, state: CellState.UNVISITED, weight: DEFAULT_WEIGHT };
      }
      return {
        ...cell,
        type: CellType.WALL,
        state: CellState.UNVISITED,
        weight: DEFAULT_WEIGHT,
      };
    })
  );

  // 2. Recursive backtracking to carve paths
  // We need to move in steps of 2 to guarantee thick walls between paths
  const stack: Position[] = [];
  
  // Start carving from a valid odd coordinate, ideally close to start
  let startR = start.row;
  let startC = start.col;
  
  // Ensure start is on an even or odd grid depending on preference.
  // Standard maze generation usually assumes walls are at even indices and paths at odd, or vice versa.
  // We'll carve from the start position itself, but we might need to adjust it to fit the 2-step grid.
  
  stack.push({ row: startR, col: startC });
  
  // Directions we can move (up, right, down, left), but taking 2 steps
  const dirs = [
    [-2, 0], // Up
    [0, 2],  // Right
    [2, 0],  // Down
    [0, -2], // Left
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    
    // Make current an empty path (unless it's start/end)
    if (newGrid[current.row][current.col].type !== CellType.START && 
        newGrid[current.row][current.col].type !== CellType.END) {
      newGrid[current.row][current.col].type = CellType.EMPTY;
    }

    // Find unvisited neighbors that are 2 steps away
    const unvisitedNeighbors: { pos: Position; wallToRemove: Position }[] = [];
    
    for (const [dr, dc] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      
      // Check boundaries
      if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1) {
        // If it's a wall, it means we haven't visited it yet
        if (newGrid[nr][nc].type === CellType.WALL) {
          unvisitedNeighbors.push({
            pos: { row: nr, col: nc },
            wallToRemove: { row: current.row + dr / 2, col: current.col + dc / 2 }
          });
        }
      }
    }

    if (unvisitedNeighbors.length > 0) {
      // Pick a random neighbor
      const randIdx = Math.floor(Math.random() * unvisitedNeighbors.length);
      const next = unvisitedNeighbors[randIdx];
      
      // Remove wall between current and chosen neighbor
      const wallCell = newGrid[next.wallToRemove.row][next.wallToRemove.col];
      if (wallCell.type !== CellType.START && wallCell.type !== CellType.END) {
         wallCell.type = CellType.EMPTY;
      }
      
      stack.push(next.pos);
    } else {
      // Backtrack
      stack.pop();
    }
  }

  // Ensure end is accessible. Since we carve by 2s, the end might be walled off if it's on an even/odd boundary mismatch.
  // Let's just punch a hole near the end node to connect it to an empty space.
  const endNeighbors = [
    [-1, 0], [0, 1], [1, 0], [0, -1]
  ];
  let endConnected = false;
  for (const [dr, dc] of endNeighbors) {
    const r = end.row + dr;
    const c = end.col + dc;
    if (r >= 0 && r < rows && c >= 0 && c < cols && newGrid[r][c].type === CellType.EMPTY) {
      endConnected = true;
      break;
    }
  }

  if (!endConnected) {
    // Punch a random hole to connect it
    for (const [dr, dc] of endNeighbors) {
      const r = end.row + dr;
      const c = end.col + dc;
      if (r > 0 && r < rows - 1 && c > 0 && c < cols - 1) {
        newGrid[r][c].type = CellType.EMPTY;
        break; // Just one hole is enough
      }
    }
  }

  return newGrid;
}
