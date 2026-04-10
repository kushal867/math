import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <span>∑</span>
          </div>
          <div className="logo-text">
            <h1>MathAI</h1>
          </div>
        </div>
        <div className="header-actions">
           <span className="model-badge">GPT-Inspired Solver</span>
        </div>
      </div>
    </header>
  );
}
