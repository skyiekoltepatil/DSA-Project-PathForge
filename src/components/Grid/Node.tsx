import React from 'react';
import { CellState, CellType } from '../../types';
import './Node.css';

interface NodeProps {
  row: number;
  col: number;
  type: CellType;
  state: CellState;
  weight: number;
  isStart: boolean;
  isEnd: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

export const Node: React.FC<NodeProps> = React.memo(
  ({
    row,
    col,
    type,
    state,
    weight,
    isStart,
    isEnd,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  }) => {
    let extraClassName = '';
    
    // Type classes
    if (isStart) extraClassName = 'node-start';
    else if (isEnd) extraClassName = 'node-end';
    else if (type === CellType.WALL) extraClassName = 'node-wall';
    else if (type === CellType.WEIGHTED) extraClassName = 'node-weight';
    
    // State classes (only apply if not start/end to avoid overriding them completely,
    // though CSS can handle priorities, it's cleaner here too)
    if (!isStart && !isEnd) {
      if (state === CellState.VISITED) extraClassName += ' node-visited';
      else if (state === CellState.PATH) extraClassName += ' node-path';
    }

    // Special animation classes for start/end if they are part of path
    if ((isStart || isEnd) && state === CellState.PATH) {
        extraClassName += ' node-path-endpoint';
    }

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent text selection
          onMouseDown(row, col);
        }}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={onMouseUp}
        // Touch events for mobile/tablet
        onTouchStart={(e) => {
            e.preventDefault();
            onMouseDown(row, col);
        }}
        onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.classList.contains('node')) {
                const id = target.id;
                const match = id.match(/node-(\d+)-(\d+)/);
                if (match) {
                    onMouseEnter(parseInt(match[1], 10), parseInt(match[2], 10));
                }
            }
        }}
        onTouchEnd={(e) => {
            e.preventDefault();
            onMouseUp();
        }}
      >
        {type === CellType.WEIGHTED && !isStart && !isEnd && (
          <span className="node-weight-text">{weight}</span>
        )}
      </div>
    );
  }
);

Node.displayName = 'Node';
