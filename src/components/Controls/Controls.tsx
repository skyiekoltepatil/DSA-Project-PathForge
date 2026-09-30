import React from 'react';
import { Play, Square, RefreshCw, Trash2, Eraser, PenTool, Weight, Shuffle } from 'lucide-react';
import { AlgorithmType, AnimationSpeed, DrawMode, VisualizationStatus } from '../../types';
import './Controls.css';

interface ControlsProps {
  algorithm: AlgorithmType;
  setAlgorithm: (alg: AlgorithmType) => void;
  speed: AnimationSpeed;
  setSpeed: (speed: AnimationSpeed) => void;
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
  status: VisualizationStatus;
  onStart: () => void;
  onReset: () => void;
  onClearBoard: () => void;
  onClearWalls: () => void;
  onGenerateMaze: () => void;
  onGenerateWeights: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  algorithm,
  setAlgorithm,
  speed,
  setSpeed,
  drawMode,
  setDrawMode,
  status,
  onStart,
  onReset,
  onClearBoard,
  onClearWalls,
  onGenerateMaze,
  onGenerateWeights,
}) => {
  const isRunning = status === VisualizationStatus.RUNNING;

  return (
    <div className="controls-panel">
      <div className="controls-group">
        <label>Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
          disabled={isRunning}
          className="control-select"
        >
          <option value={AlgorithmType.BFS}>Breadth-First Search (BFS)</option>
          <option value={AlgorithmType.DFS}>Depth-First Search (DFS)</option>
          <option value={AlgorithmType.DIJKSTRA}>Dijkstra's Algorithm</option>
          <option value={AlgorithmType.ASTAR}>A* Search</option>
        </select>
      </div>

      <div className="controls-group">
        <label>Speed</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value as AnimationSpeed)}
          disabled={isRunning}
          className="control-select"
        >
          <option value={AnimationSpeed.SLOW}>Slow</option>
          <option value={AnimationSpeed.NORMAL}>Normal</option>
          <option value={AnimationSpeed.FAST}>Fast</option>
        </select>
      </div>

      <div className="controls-divider"></div>

      <div className="controls-group">
        <label>Draw Mode</label>
        <div className="draw-modes">
          <button
            className={`btn-icon ${drawMode === DrawMode.WALL ? 'active' : ''}`}
            onClick={() => setDrawMode(DrawMode.WALL)}
            title="Draw Walls"
            disabled={isRunning}
          >
            <PenTool size={18} />
          </button>
          <button
            className={`btn-icon ${drawMode === DrawMode.WEIGHT ? 'active' : ''}`}
            onClick={() => setDrawMode(DrawMode.WEIGHT)}
            title="Draw Weights (Cost: 5)"
            disabled={isRunning}
          >
            <Weight size={18} />
          </button>
          <button
            className={`btn-icon ${drawMode === DrawMode.ERASE ? 'active' : ''}`}
            onClick={() => setDrawMode(DrawMode.ERASE)}
            title="Erase"
            disabled={isRunning}
          >
            <Eraser size={18} />
          </button>
        </div>
      </div>

      <div className="controls-divider"></div>

      <div className="controls-group buttons-group">
        <button
          className={`btn-primary ${isRunning ? 'running' : ''}`}
          onClick={isRunning ? onReset : onStart}
        >
          {isRunning ? (
            <>
              <Square size={18} /> Stop
            </>
          ) : (
            <>
              <Play size={18} /> Visualize
            </>
          )}
        </button>

        <button className="btn-secondary" onClick={onReset} disabled={isRunning} title="Reset paths (R)">
          <RefreshCw size={18} />
        </button>

        <button className="btn-secondary" onClick={onClearBoard} disabled={isRunning} title="Clear everything (C)">
          <Trash2 size={18} />
        </button>
        
        <button className="btn-secondary" onClick={onClearWalls} disabled={isRunning} title="Clear walls">
          <Eraser size={18} />
        </button>
      </div>

      <div className="controls-divider"></div>

      <div className="controls-group buttons-group">
         <button className="btn-tertiary" onClick={onGenerateMaze} disabled={isRunning} title="Generate Maze (M)">
          <Shuffle size={16} /> Maze
        </button>
        <button className="btn-tertiary" onClick={onGenerateWeights} disabled={isRunning || (algorithm !== AlgorithmType.DIJKSTRA && algorithm !== AlgorithmType.ASTAR)} title="Random Weights">
          <Weight size={16} /> Weights
        </button>
      </div>
    </div>
  );
};
