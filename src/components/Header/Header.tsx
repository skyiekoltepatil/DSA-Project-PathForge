import React from 'react';
import { GitBranch, Route } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
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
    </header>
  );
};
