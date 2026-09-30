import React from 'react';
import { Activity, Clock, Route, CheckCircle, XCircle } from 'lucide-react';
import { AlgorithmResult, VisualizationStatus } from '../../types';
import './StatsPanel.css';

interface StatsPanelProps {
  result: AlgorithmResult | null;
  status: VisualizationStatus;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ result, status }) => {
  if (status === VisualizationStatus.IDLE) {
    return (
      <div className="stats-panel idle">
        <p>Ready to visualize. Select an algorithm and click Start.</p>
      </div>
    );
  }

  if (status === VisualizationStatus.RUNNING) {
    return (
      <div className="stats-panel running">
        <Activity className="spinner" size={20} />
        <p>Visualizing algorithm...</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`stats-panel ${result.found ? 'success' : 'failure'}`}>
      <div className="stat-status">
        {result.found ? (
          <>
            <CheckCircle className="icon-success" size={24} />
            <span className="status-text success-text">Path Found!</span>
          </>
        ) : (
          <>
            <XCircle className="icon-failure" size={24} />
            <span className="status-text failure-text">No Path Exists</span>
          </>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">
            <Route size={14} /> Path Length
          </div>
          <div className="stat-value">{result.pathLength > 0 ? result.pathLength : '-'}</div>
        </div>

        <div className="stat-box">
          <div className="stat-label">
            <Activity size={14} /> Nodes Explored
          </div>
          <div className="stat-value">{result.nodesExplored}</div>
        </div>

        <div className="stat-box">
          <div className="stat-label">
            <Clock size={14} /> Execution Time
          </div>
          <div className="stat-value">{result.executionTimeMs.toFixed(2)} ms</div>
        </div>
      </div>
    </div>
  );
};
