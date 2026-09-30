import { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header/Header';
import { Controls } from './components/Controls/Controls';
import { Grid as GridComponent } from './components/Grid/Grid';
import { StatsPanel } from './components/StatsPanel/StatsPanel';
import { AlgorithmInfo } from './components/AlgorithmInfo/AlgorithmInfo';
import { Legend } from './components/Legend/Legend';
import { ComparisonPanel } from './components/ComparisonPanel/ComparisonPanel';

import { usePathfinding } from './hooks/usePathfinding';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { DrawMode, VisualizationStatus, AlgorithmType } from './types';
import {
  createGrid,
  getDefaultPositions,
  calculateGridDimensions,
  clearWalls,
  resetGridState,
  generateRandomWeights,
} from './utils/grid';
import { CELL_SIZE } from './utils/constants';
import { generateRecursiveBacktrackingMaze } from './maze';
import { MapMode } from './components/MapMode/MapMode';

import './App.css';

function App() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Need to initialize with a dummy grid, will recalculate on mount
  const initialDimensions = getDefaultPositions(25, 55);
  const [gridDimensions, setGridDimensions] = useState({ rows: 25, cols: 55 });
  
  const {
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
  } = usePathfinding({
    initialGrid: createGrid(25, 55),
    initialStart: initialDimensions.start,
    initialEnd: initialDimensions.end,
  });

  const [drawMode, setDrawMode] = useState<DrawMode>(DrawMode.WALL);

  // Initialize responsive grid on mount
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const { rows, cols } = calculateGridDimensions(clientWidth, clientHeight, CELL_SIZE);
      
      setGridDimensions({ rows, cols });
      const { start, end } = getDefaultPositions(rows, cols);
      
      setStartPos(start);
      setEndPos(end);
      setGrid(createGrid(rows, cols));
    }
  }, []); // Run once on mount

  const handleReset = () => {
    clearTimers();
    setGrid(prev => resetGridState(prev));
    setStatus(VisualizationStatus.IDLE);
    setResult(null);
  };

  const handleClearBoard = () => {
    clearTimers();
    const { start, end } = getDefaultPositions(gridDimensions.rows, gridDimensions.cols);
    setStartPos(start);
    setEndPos(end);
    setGrid(createGrid(gridDimensions.rows, gridDimensions.cols));
    setStatus(VisualizationStatus.IDLE);
    setResult(null);
  };

  const handleClearWalls = () => {
    clearTimers();
    setGrid(prev => clearWalls(prev));
    setStatus(VisualizationStatus.IDLE);
    setResult(null);
  };

  const handleGenerateMaze = () => {
    if (status === VisualizationStatus.RUNNING) return;
    handleReset();
    // Use the maze generator
    const newGrid = generateRecursiveBacktrackingMaze(createGrid(gridDimensions.rows, gridDimensions.cols), startPos, endPos);
    setGrid(newGrid);
  };

  const handleGenerateWeights = () => {
    if (status === VisualizationStatus.RUNNING) return;
    if (algorithm !== AlgorithmType.DIJKSTRA && algorithm !== AlgorithmType.ASTAR) {
      alert("Weights are only considered in Dijkstra's and A* algorithms. Please select one of them first.");
      return;
    }
    handleReset();
    setGrid(prev => generateRandomWeights(prev, startPos, endPos));
  };

  useKeyboardShortcuts({
    onStartPause: runAlgorithm,
    onReset: handleReset,
    onClear: handleClearBoard,
    onMaze: handleGenerateMaze,
    disabled: status === VisualizationStatus.RUNNING,
  });

  return (
    <div className="app-container">
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      
      {viewMode === 'grid' && (
        <Controls
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          speed={speed}
          setSpeed={setSpeed}
          drawMode={drawMode}
          setDrawMode={setDrawMode}
          status={status}
          onStart={runAlgorithm}
          onReset={handleReset}
          onClearBoard={handleClearBoard}
          onClearWalls={handleClearWalls}
          onGenerateMaze={handleGenerateMaze}
          onGenerateWeights={handleGenerateWeights}
        />
      )}

      <main className="main-content">
        <div className="workspace">
          {viewMode === 'grid' ? (
            <div className="grid-section" ref={containerRef}>
              <GridComponent
                grid={grid}
                setGrid={setGrid}
                startPos={startPos}
                setStartPos={setStartPos}
                endPos={endPos}
                setEndPos={setEndPos}
                status={status}
                drawMode={drawMode}
              />
              <Legend />
              <StatsPanel result={result} status={status} />
              <ComparisonPanel
                grid={grid}
                startPos={startPos}
                endPos={endPos}
                currentResult={result}
              />
            </div>
          ) : (
            <MapMode algorithm={algorithm} status={status} setStatus={setStatus} />
          )}
          
          <aside className="sidebar">
            <AlgorithmInfo algorithm={algorithm} />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
