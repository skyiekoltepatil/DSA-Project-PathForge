import React, { useState, useEffect } from 'react';
import { AlgorithmResult, ComparisonEntry, Grid, Position, AlgorithmType } from '../../types';
import { bfs, dfs, dijkstra, astar } from '../../algorithms';
import { ALGORITHM_INFO } from '../../utils/constants';
import { resetGridState } from '../../utils/grid';
import { Play } from 'lucide-react';
import './ComparisonPanel.css';

interface ComparisonPanelProps {
  grid: Grid;
  startPos: Position;
  endPos: Position;
  currentResult: AlgorithmResult | null;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  grid,
  startPos,
  endPos,
  currentResult,
}) => {
  const [results, setResults] = useState<ComparisonEntry[]>([]);

  // Update comparison table when a new result comes in
  useEffect(() => {
    if (currentResult) {
      setResults((prev) => {
        const newResults = [...prev];
        const existingIdx = newResults.findIndex((r) => r.algorithmType === currentResult.algorithmType);
        
        const entry: ComparisonEntry = {
          ...currentResult,
          guaranteesShortestPath: ALGORITHM_INFO[currentResult.algorithmType].guaranteesShortestPath,
        };

        if (existingIdx >= 0) {
          newResults[existingIdx] = entry;
        } else {
          newResults.push(entry);
        }
        return newResults.sort((a, b) => a.pathLength - b.pathLength || a.executionTimeMs - b.executionTimeMs);
      });
    }
  }, [currentResult]);

  const runAll = () => {
    const cleanGrid = resetGridState(grid);
    
    // Run them synchronously (they are fast enough on standard grid sizes)
    const bfsRes = bfs(cleanGrid, startPos, endPos);
    const dfsRes = dfs(cleanGrid, startPos, endPos);
    const dijkstraRes = dijkstra(cleanGrid, startPos, endPos);
    const astarRes = astar(cleanGrid, startPos, endPos);

    const newResults: ComparisonEntry[] = [
      { ...bfsRes, guaranteesShortestPath: ALGORITHM_INFO[AlgorithmType.BFS].guaranteesShortestPath },
      { ...dfsRes, guaranteesShortestPath: ALGORITHM_INFO[AlgorithmType.DFS].guaranteesShortestPath },
      { ...dijkstraRes, guaranteesShortestPath: ALGORITHM_INFO[AlgorithmType.DIJKSTRA].guaranteesShortestPath },
      { ...astarRes, guaranteesShortestPath: ALGORITHM_INFO[AlgorithmType.ASTAR].guaranteesShortestPath },
    ];

    setResults(newResults.sort((a, b) => a.pathLength - b.pathLength || a.executionTimeMs - b.executionTimeMs));
  };

  if (results.length === 0) return null;

  return (
    <div className="comparison-panel">
      <div className="comparison-header">
        <h3>Algorithm Comparison</h3>
        <button className="btn-secondary btn-small" onClick={runAll} title="Run all instantly on current grid">
          <Play size={14} /> Run All
        </button>
      </div>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Path Found</th>
              <th className="numeric">Path Length</th>
              <th className="numeric">Nodes Explored</th>
              <th className="numeric">Time (ms)</th>
              <th>Optimal</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res.algorithmType}>
                <td className="alg-name">{ALGORITHM_INFO[res.algorithmType].name}</td>
                <td>
                  <span className={res.found ? 'status-yes' : 'status-no'}>
                    {res.found ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="numeric">{res.pathLength > 0 ? res.pathLength : '-'}</td>
                <td className="numeric">{res.nodesExplored}</td>
                <td className="numeric">{res.executionTimeMs.toFixed(2)}</td>
                <td>
                  <span className={res.guaranteesShortestPath ? 'status-yes' : 'status-warn'}>
                    {res.guaranteesShortestPath ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
