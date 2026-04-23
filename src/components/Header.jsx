import React from 'react';
import './Header.css';

export default function Header({ isTest, setIsTest, toggleHistory, historyCount }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <span>∑</span>
          </div>
          <div className="logo-text">
            <h1>MathAI</h1>
            <span className="logo-tag">PREMIUM</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="history-toggle" onClick={toggleHistory} title="View History">
            <span className="history-icon">🕒</span>
            <span className="history-label">History</span>
            {historyCount > 0 && <span className="history-badge">{historyCount}</span>}
          </button>

          <div className="v-divider"></div>

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
          
          <div className="user-profile">
            <div className="avatar">A</div>
          </div>
        </div>
      </div>
    </header>
  );
}

