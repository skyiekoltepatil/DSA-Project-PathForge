/**
 * Core type definitions for PathForge
 */

export enum CellType {
  EMPTY = 'empty',
  WALL = 'wall',
  START = 'start',
  END = 'end',
  WEIGHTED = 'weighted',
}

export enum CellState {
  UNVISITED = 'unvisited',
  VISITING = 'visiting',   // Currently being explored (frontier)
  VISITED = 'visited',     // Already processed
  PATH = 'path',           // Part of the final shortest path
}

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  state: CellState;
  weight: number;          // Default 1 for normal, higher for weighted
}

export enum AlgorithmType {
  BFS = 'bfs',
  DFS = 'dfs',
  DIJKSTRA = 'dijkstra',
  ASTAR = 'astar',
}

export enum AnimationSpeed {
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
}

export enum VisualizationStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

export interface Position {
  row: number;
  col: number;
}

export interface AlgorithmResult {
  visitedOrder: Position[];     // Order in which nodes were visited
  path: Position[];             // The final path from start to end
  found: boolean;               // Whether a path was found
  nodesExplored: number;
  pathLength: number;
  executionTimeMs: number;
  algorithmType: AlgorithmType;
}

export interface ComparisonEntry extends AlgorithmResult {
  guaranteesShortestPath: boolean;
}

export interface AlgorithmInfo {
  name: string;
  type: AlgorithmType;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  dataStructure: string;
  guaranteesShortestPath: boolean;
  pseudocode: string;
}

export type Grid = Cell[][];

export enum DrawMode {
  WALL = 'wall',
  WEIGHT = 'weight',
  ERASE = 'erase',
}

export enum MazeType {
  RECURSIVE_BACKTRACKING = 'recursive_backtracking',
  RANDOM = 'random',
}
