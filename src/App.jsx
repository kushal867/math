import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import SolutionDisplay from './components/SolutionDisplay';
import { solveMathQuestion, solveMathImage } from './services/api';
import './App.css';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError]     = useState(null);
  const [lastQuestion, setLastQuestion] = useState('');
  const [isTest, setIsTest] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('math_ai_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('math_ai_history', JSON.stringify(history));
  }, [history]);

  const handleSolve = async ({ type, question, imageFile }) => {
    setLoading(true);
    setSolution(null);
    setError(null);

    const questionText = type === 'text' ? question : '(image uploaded)';
    setLastQuestion(questionText);

    try {
      let blob;
      if (type === 'text') {
        blob = await solveMathQuestion(question, isTest);
      } else {
        blob = await solveMathImage(imageFile, isTest);
      }

      let newSolution;

      // 1. Check if it's a PDF
      if (blob.type === 'application/pdf') {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        const fileName = `MathAI_Solution_${new Date().getTime()}.pdf`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        newSolution = {
          success: true,
          isPDF: true,
          fileName,
          pdfUrl: url,
          solvedAt: new Date().toISOString()
        };
      } 
      // 2. If not PDF, try to parse as JSON (might be solution or error)
      else {
        const text = await blob.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Received invalid data format from n8n.");
        }

        // Check if the JSON is an error
        if (data.error || (data.message && !data.steps && !data.solutions)) {
           throw new Error(data.error || data.message || "n8n returned an error.");
        }

        // If it's a list of solutions, take the first one
        const solutionData = data.solutions && data.solutions.length > 0 
          ? data.solutions[0] 
          : data;

        newSolution = {
          ...solutionData,
          isPDF: false,
          solvedAt: new Date().toISOString()
        };
      }

      setSolution(newSolution);
      
      // Add to history
      const historyItem = {
        id: Date.now(),
        question: questionText,
        solvedAt: new Date().toISOString(),
        solution: newSolution
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 20)); // Keep last 20

    } catch (err) {
      console.error("Full Error Object:", err);
      const msg = err.message || "Failed to connect to the n8n solver.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSolution(null);
    setError(null);
    setLastQuestion('');
  };

  const loadFromHistory = (item) => {
    setSolution(item.solution);
    setLastQuestion(item.question);
    setError(null);
    if (window.innerWidth <= 1024) setShowHistory(false);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your history?")) {
      setHistory([]);
    }
  };

  return (
    <div className={`app ${showHistory ? 'sidebar-open' : ''}`}>
      {/* Dynamic Background */}
      <div className="bg-mesh">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>
      
      <Header 
        isTest={isTest} 
        setIsTest={setIsTest} 
        toggleHistory={() => setShowHistory(!showHistory)}
        historyCount={history.length}
      />

      <main className="main-content">
        <div className="container">
          <div className="layout">
            {/* Left: Input */}
            <section className="panel-section" aria-label="Question input">
              <InputPanel onSolve={handleSolve} loading={loading} />

              {(solution || error) && !loading && (
                <button
                  id="reset-btn"
                  className="reset-btn animate-fade-in"
                  onClick={handleReset}
                >
                  🔄 Solve Another Question
                </button>
              )}
            </section>

            {/* Right: Solution */}
            <section className="panel-section" aria-label="Solution output">
              {(loading || solution || error) ? (
                <SolutionDisplay
                  solution={solution}
                  question={lastQuestion}
                  error={error}
                  loading={loading}
                />
              ) : (
                <div className="placeholder-card animate-fade-in">
                  <div className="placeholder-icon">📐</div>
                  <h2 className="placeholder-title">Your solution will appear here</h2>
                  <p className="placeholder-sub">
                    Type a maths question or upload a question paper on the left,
                    then hit <strong>Solve Step by Step</strong>.
                  </p>
                  <div className="placeholder-features">
                    <div className="feature-item">
                      <span>🔢</span>
                      <span>Algebra & Equations</span>
                    </div>
                    <div className="feature-item">
                      <span>📈</span>
                      <span>Calculus & Derivatives</span>
                    </div>
                    <div className="feature-item">
                      <span>📐</span>
                      <span>Geometry & Trigonometry</span>
                    </div>
                    <div className="feature-item">
                      <span>∑</span>
                      <span>Series & Statistics</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* History Sidebar */}
      <aside className={`history-sidebar ${showHistory ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h3>Recent History</h3>
          <button className="close-sidebar" onClick={() => setShowHistory(false)}>✕</button>
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <div className="empty-history">
              <p>No previous solutions yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className={`history-item ${solution && solution.solvedAt === item.solution.solvedAt ? 'active' : ''}`}
                onClick={() => loadFromHistory(item)}
              >
                <div className="history-item-top">
                  <span className="history-time">{new Date(item.solvedAt).toLocaleDateString()}</span>
                  <span className="history-tag">{item.solution.isPDF ? 'PDF' : 'Text'}</span>
                </div>
                <div className="history-item-q">{item.question}</div>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <button className="clear-history-btn" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </aside>

      {showHistory && <div className="sidebar-overlay" onClick={() => setShowHistory(false)}></div>}

      <footer className="footer">
        <p>
          Powered by <span className="footer-highlight">n8n</span> workflows + <span className="footer-highlight">AI</span>
          &nbsp;·&nbsp; MathAI Solver v2.0
        </p>
      </footer>
    </div>
  );
}
