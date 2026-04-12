import React from 'react';
import './Header.css';

export default function Header({ isTest, setIsTest }) {
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
          <div className="toggle-container">
            <span className={`toggle-label ${!isTest ? 'active' : ''}`}>Prod</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isTest} 
                onChange={() => setIsTest(!isTest)} 
              />
              <span className="slider round"></span>
            </label>
            <span className={`toggle-label ${isTest ? 'active' : ''}`}>Test</span>
          </div>
          <span className="model-badge">AI Solver</span>
        </div>
      </div>
    </header>
  );
}

