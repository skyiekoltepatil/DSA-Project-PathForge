import React from 'react';
import './Legend.css';

export const Legend: React.FC = () => {
  return (
    <div className="legend-container">
      <div className="legend-item">
        <div className="legend-node legend-start"></div>
        <span>Start Node</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-end"></div>
        <span>Target Node</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-unvisited"></div>
        <span>Unvisited</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-visited"></div>
        <span>Visited</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-path"></div>
        <span>Shortest Path</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-wall"></div>
        <span>Wall</span>
      </div>
      <div className="legend-item">
        <div className="legend-node legend-weight">
          <span className="legend-weight-text">5</span>
        </div>
        <span>Weight Node</span>
      </div>
    </div>
  );
};
