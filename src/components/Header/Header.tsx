import React from 'react';
import { GitBranch, Route } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <Route className="logo-icon" size={28} />
          <div className="logo-text">
            <h1>PathForge</h1>
            <p>Interactive Shortest Path Visualizer</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
            style={{ padding: '6px 12px', fontSize: '0.9rem' }}
          >
            {viewMode === 'grid' ? '🌍 Real Map Mode' : '⬛ Grid Mode'}
          </button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="github-link"
            title="View source on GitHub"
          >
            <GitBranch size={20} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
