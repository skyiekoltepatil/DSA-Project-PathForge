import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AlgorithmResult,
  AlgorithmType,
  AnimationSpeed,
  CellState,
  Grid,
  Position,
  VisualizationStatus,
} from '../types';
import { bfs, dfs, dijkstra, astar } from '../algorithms';
import { ANIMATION_DELAYS, PATH_ANIMATION_DELAYS } from '../utils/constants';

interface UsePathfindingProps {
  initialGrid: Grid;
  initialStart: Position;
  initialEnd: Position;
}

export function usePathfinding({ initialGrid, initialStart, initialEnd }: UsePathfindingProps) {
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [startPos, setStartPos] = useState<Position>(initialStart);
  const [endPos, setEndPos] = useState<Position>(initialEnd);
  
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.BFS);
  const [speed, setSpeed] = useState<AnimationSpeed>(AnimationSpeed.NORMAL);
  const [status, setStatus] = useState<VisualizationStatus>(VisualizationStatus.IDLE);
  
  const [result, setResult] = useState<AlgorithmResult | null>(null);

  // We use refs for animation timers so we can clear them easily without React warnings
  const animationTimers = useRef<number[]>([]);
  
  const clearTimers = useCallback(() => {
    animationTimers.current.forEach(clearTimeout);
    animationTimers.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const runAlgorithm = useCallback(() => {
    if (status === VisualizationStatus.RUNNING) return;
    
    // Clear previous results visually before running
    const cleanGrid = grid.map(row => row.map(cell => ({ ...cell, state: CellState.UNVISITED })));
    setGrid(cleanGrid);
    setStatus(VisualizationStatus.RUNNING);
    setResult(null);

    // Execute logic synchronously
    let currentResult: AlgorithmResult;
    switch (algorithm) {
      case AlgorithmType.BFS:
        currentResult = bfs(cleanGrid, startPos, endPos);
        break;
      case AlgorithmType.DFS:
        currentResult = dfs(cleanGrid, startPos, endPos);
        break;
      case AlgorithmType.DIJKSTRA:
        currentResult = dijkstra(cleanGrid, startPos, endPos);
        break;
      case AlgorithmType.ASTAR:
        currentResult = astar(cleanGrid, startPos, endPos);
        break;
    }

    setResult(currentResult);
    animateResult(currentResult, cleanGrid);
  }, [algorithm, grid, startPos, endPos, status]);

  const animateResult = useCallback(
    (currentResult: AlgorithmResult, initialGridState: Grid) => {
      clearTimers();
      
      const { visitedOrder, path, found } = currentResult;
      const delay = ANIMATION_DELAYS[speed];
      const pathDelay = PATH_ANIMATION_DELAYS[speed];
      
      let nextGridState = [...initialGridState.map(row => [...row])];
      
      // Animate visited nodes
      for (let i = 0; i < visitedOrder.length; i++) {
        const timer = window.setTimeout(() => {
          const { row, col } = visitedOrder[i];
          
          // Don't overwrite start/end visually (even though they are visited)
          // We just update their state but keep their type. We use state to style them.
          nextGridState = [...nextGridState];
          nextGridState[row] = [...nextGridState[row]];
          nextGridState[row][col] = {
            ...nextGridState[row][col],
            state: CellState.VISITED,
          };
          
          setGrid(nextGridState);
        }, i * delay);
        animationTimers.current.push(timer);
      }

      // Animate shortest path
      if (found) {
        for (let i = 0; i < path.length; i++) {
          const timer = window.setTimeout(() => {
            const { row, col } = path[i];
            
            nextGridState = [...nextGridState];
            nextGridState[row] = [...nextGridState[row]];
            nextGridState[row][col] = {
              ...nextGridState[row][col],
              state: CellState.PATH,
            };
            
            setGrid(nextGridState);
            
            // Finish
            if (i === path.length - 1) {
              setStatus(VisualizationStatus.FINISHED);
            }
          }, visitedOrder.length * delay + i * pathDelay);
          animationTimers.current.push(timer);
        }
      } else {
        // Finish if no path
        const timer = window.setTimeout(() => {
          setStatus(VisualizationStatus.FINISHED);
        }, visitedOrder.length * delay);
        animationTimers.current.push(timer);
      }
    },
    [speed, clearTimers]
  );

  return {
    grid,
    setGrid,
    startPos,
    setStartPos,
    endPos,
    setEndPos,
    algorithm,
    setAlgorithm,
    speed,
    setSpeed,
    status,
    setStatus,
    result,
    setResult,
    runAlgorithm,
    clearTimers,
  };
}
