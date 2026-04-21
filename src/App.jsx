import React, { useState } from 'react';
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

  const handleSolve = async ({ type, question, imageFile }) => {
    setLoading(true);
    setSolution(null);
    setError(null);

    if (type === 'text') setLastQuestion(question);
    else setLastQuestion('(image uploaded)');

    try {
      let blob;
      if (type === 'text') {
        blob = await solveMathQuestion(question, isTest);
      } else {
        blob = await solveMathImage(imageFile, isTest);
      }

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

        setSolution({
          success: true,
          isPDF: true,
          fileName,
          pdfUrl: url,
          solvedAt: new Date().toISOString()
        });
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

        // Otherwise, it's a text-based solution
        setSolution({
          ...solutionData,
          isPDF: false,
          solvedAt: new Date().toISOString()
        });
      }

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

  return (
    <div className="app">
      {/* Dynamic Background */}
      <div className="bg-mesh">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      
      <Header isTest={isTest} setIsTest={setIsTest} />

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

      <footer className="footer">
        <p>
          Powered by <span className="footer-highlight">n8n</span> workflows + <span className="footer-highlight">AI</span>
          &nbsp;·&nbsp; MathAI Solver
        </p>
      </footer>
    </div>
  );
}
