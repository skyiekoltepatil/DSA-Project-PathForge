import React, { useState, useCallback } from 'react';
import { Node } from './Node';
import { CellType, DrawMode, Grid as GridType, Position, VisualizationStatus } from '../../types';
import { DEFAULT_WEIGHT, WEIGHTED_CELL_COST } from '../../utils/constants';
import './Grid.css';

interface GridProps {
  grid: GridType;
  setGrid: React.Dispatch<React.SetStateAction<GridType>>;
  startPos: Position;
  setStartPos: React.Dispatch<React.SetStateAction<Position>>;
  endPos: Position;
  setEndPos: React.Dispatch<React.SetStateAction<Position>>;
  status: VisualizationStatus;
  drawMode: DrawMode;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  setGrid,
  startPos,
  setStartPos,
  endPos,
  setEndPos,
  status,
  drawMode,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [movingNode, setMovingNode] = useState<'start' | 'end' | null>(null);

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (status === VisualizationStatus.RUNNING) return;

      setIsMouseDown(true);
      const isStart = row === startPos.row && col === startPos.col;
      const isEnd = row === endPos.row && col === endPos.col;

      if (isStart) {
        setMovingNode('start');
        return;
      }
      if (isEnd) {
        setMovingNode('end');
        return;
      }

      updateGridWithDrawMode(row, col);
    },
    [status, startPos, endPos, grid, drawMode]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isMouseDown || status === VisualizationStatus.RUNNING) return;

      const isStart = row === startPos.row && col === startPos.col;
      const isEnd = row === endPos.row && col === endPos.col;

      if (movingNode === 'start') {
        if (!isEnd) setStartPos({ row, col });
        return;
      }
      if (movingNode === 'end') {
        if (!isStart) setEndPos({ row, col });
        return;
      }

      if (!isStart && !isEnd) {
        updateGridWithDrawMode(row, col);
      }
    },
    [isMouseDown, status, startPos, endPos, movingNode, grid, drawMode]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    setMovingNode(null);
  }, []);

  const updateGridWithDrawMode = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const newRow = [...newGrid[row]];
      const cell = newRow[col];

      if (drawMode === DrawMode.WALL) {
        newRow[col] = { ...cell, type: CellType.WALL, weight: DEFAULT_WEIGHT };
      } else if (drawMode === DrawMode.WEIGHT) {
        newRow[col] = { ...cell, type: CellType.WEIGHTED, weight: WEIGHTED_CELL_COST };
      } else if (drawMode === DrawMode.ERASE) {
        newRow[col] = { ...cell, type: CellType.EMPTY, weight: DEFAULT_WEIGHT };
      }

      newGrid[row] = newRow;
      return newGrid;
    });
  };

  return (
    <div
      className="grid-container"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div className="grid">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid-row">
            {row.map((cell, colIdx) => (
              <Node
                key={`${rowIdx}-${colIdx}`}
                row={cell.row}
                col={cell.col}
                type={cell.type}
                state={cell.state}
                weight={cell.weight}
                isStart={cell.row === startPos.row && cell.col === startPos.col}
                isEnd={cell.row === endPos.row && cell.col === endPos.col}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
