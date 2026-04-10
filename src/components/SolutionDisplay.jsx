import React, { useEffect, useState } from 'react';
import './SolutionDisplay.css';

// Cleaned up steps display to match a more natural 'ChatGPT' style


export default function SolutionDisplay({ solution, question, error, loading }) {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copyType, setCopyType] = useState(null);

  // Staggered reveal of steps for a 'streaming' effect
  useEffect(() => {
    if (!solution?.steps) {
      setVisibleSteps([]);
      return;
    }
    setVisibleSteps([]);
    solution.steps.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i]);
      }, i * 150);
    });
  }, [solution]);

  const copyToClipboard = async (text, type = 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyType(type);
      if (type === 'all') setCopied(true);
      setTimeout(() => {
        setCopyType(null);
        if (type === 'all') setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  if (loading) {
    return (
      <div className="solution-display animate-fade-in loading-mode">
        <div className="loading-state">
          <div className="loading-orb-container">
            <div className="loading-brain">🧠</div>
            <div className="pulse-circle"></div>
          </div>
          <h3 className="loading-title">MathAI is thinking...</h3>
          <p className="loading-subtitle">Processing your problem with advanced logic</p>
          
          <div className="loading-steps-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-step">
                <div className="skeleton-line" style={{ width: `${80 - i * 5}%`, animationDelay: `${i * 0.2}s` }} />
                <div className="skeleton-line" style={{ width: `${50 - i * 3}%`, animationDelay: `${i * 0.2 + 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || (solution && solution.success === false)) {
    const errorMsg = error || solution?.error || solution?.message || "The AI encountered an issue parsing the math problem.";
    return (
      <div className="solution-display animate-fade-in">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Couldn't solve this one</h3>
          <p className="error-msg">{errorMsg}</p>
          
          {/* If there's partial data despite the error, show it simplified */}
          {(solution?.question || solution?.topic) && (
            <div className="error-context">
              <p>Requested: <strong>{solution.question || "N/A"}</strong></p>
              <p>Topic detected: <strong>{solution.topic || "Unknown"}</strong></p>
            </div>
          )}

          <div className="error-tips">
            <p className="tips-header">🔍 Troubleshooting Tips:</p>
            <ul>
              <li>Check your <strong>n8n workflow</strong> connections.</li>
              <li>Ensure the <strong>AI model</strong> in n8n is returning structured JSON.</li>
              <li>If you see "Failed to parse", the AI's math formatting might be too complex for the current workflow.</li>
              <li>Try simplifying the question or re-uploading a clearer image.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!solution) return null;

  const fullSolutionText = `Problem: ${question || solution.question}\n\nSteps:\n${solution.steps?.join('\n') || ''}\n\nFinal Answer: ${solution.finalAnswer}`;

  return (
    <div className="solution-display animate-fade-in">
      {/* Question Recap Header */}
      <div className="solution-header">
        <div className="solution-header-top">
          <div className="solution-badges">
            <span className="solution-badge">✨ Solution</span>
            {solution.topic && <span className="solution-badge badge-topic">🏷️ {solution.topic}</span>}
          </div>
          <button 
            className={`copy-all-btn ${copied ? 'copied' : ''}`}
            onClick={() => copyToClipboard(fullSolutionText, 'all')}
          >
            {copied ? '✅ Solution Copied' : '📋 Copy All'}
          </button>
        </div>
        
        {(question || solution.question) && (
          <div className="question-recap">
            <span className="recap-label">Q:</span>
            <span className="recap-text">{question || solution.question}</span>
          </div>
        )}
      </div>

      <div className="solution-content">
        {/* Explanation / Introduction */}
        {solution.explanation && (
          <div className="explanation-paragraph animate-slide-up">
            {solution.explanation}
          </div>
        )}

        {/* Unified Steps Container */}
        <div className="steps-container">
          {solution.steps && solution.steps.map((step, i) => (
            visibleSteps.includes(i) && (
              <div key={i} className="solution-step-item animate-slide-up">
                {step.split('\n').map((line, idx) => {
                  const isMath = /[=+\-*/√θ^∫λΣΔπµ∞≈≠≤≥]/.test(line) || /\\/.test(line) || /(\d+[a-zA-Z])/.test(line);
                  return (
                    <p 
                      key={idx} 
                      className={`${line.trim() === "" ? "step-spacer" : "step-line"} ${isMath ? "math-line" : ""}`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            )
          ))}
        </div>

        {/* Final Answer - Styled as part of the flow */}
        {solution.finalAnswer && (
          <div className="final-answer-section animate-slide-up" style={{ animationDelay: `${(solution.steps?.length || 0) * 150}ms` }}>
            <div className="final-answer-row">
              <div className="final-answer-label">Final Answer:</div>
              <button 
                className="copy-mini-btn"
                onClick={() => copyToClipboard(solution.finalAnswer, 'final')}
                title="Copy result"
              >
                {copyType === 'final' ? '✅' : '📋'}
              </button>
            </div>
            <div className="final-answer-text">{solution.finalAnswer}</div>
          </div>
        )}
      </div>

      {/* Hints */}
      {solution.hints && solution.hints.length > 0 && (
        <div className="hints-section">
          <h4 className="hints-title">💡 Pro Hints</h4>
          <ul className="hints-list">
            {solution.hints.map((hint, i) => (
              <li key={i}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="solution-footer">
        <p>
          {solution.solvedAt && (
            <span className="solved-at">Solved at: {new Date(solution.solvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </p>
      </div>
    </div>
  );
}
