import React from 'react';
import { AlgorithmType } from '../../types';
import { ALGORITHM_INFO } from '../../utils/constants';
import { Database, Zap, HardDrive, AlertTriangle } from 'lucide-react';
import './AlgorithmInfo.css';

interface AlgorithmInfoProps {
  algorithm: AlgorithmType;
}

export const AlgorithmInfo: React.FC<AlgorithmInfoProps> = ({ algorithm }) => {
  const info = ALGORITHM_INFO[algorithm];

  return (
    <div className="algorithm-info-panel">
      <div className="info-header">
        <h3>{info.name}</h3>
        {!info.guaranteesShortestPath && (
          <span className="warning-badge" title="Does not guarantee the shortest path">
            <AlertTriangle size={14} /> Unoptimal
          </span>
        )}
      </div>

      <p className="info-desc">{info.description}</p>

      <div className="info-metrics">
        <div className="metric">
          <Zap size={14} />
          <span className="label">Time:</span>
          <span className="value">{info.timeComplexity}</span>
        </div>
        <div className="metric">
          <HardDrive size={14} />
          <span className="label">Space:</span>
          <span className="value">{info.spaceComplexity}</span>
        </div>
        <div className="metric">
          <Database size={14} />
          <span className="label">Structure:</span>
          <span className="value">{info.dataStructure}</span>
        </div>
      </div>

      <div className="pseudocode-section">
        <div className="pseudocode-title">Pseudocode</div>
        <pre className="pseudocode-block">
          <code>{info.pseudocode}</code>
        </pre>
      </div>
    </div>
  );
};
