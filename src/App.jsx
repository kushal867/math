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

  const handleSolve = async ({ type, question, imageFile }) => {
    setLoading(true);
    setSolution(null);
    setError(null);

    if (type === 'text') setLastQuestion(question);
    else setLastQuestion('(image uploaded)');

    try {
      let result;
      if (type === 'text') {
        result = await solveMathQuestion(question);
      } else {
        result = await solveMathImage(imageFile);
      }

      // 1. Check if result is just a string (n8n raw response)
      if (typeof result === 'string') {
        result = { solution: result, success: true };
      }

      // 2. Handle the new comprehensive JSON schema from the AI
      let steps = [];
      if (Array.isArray(result.steps)) {
        steps = result.steps.map(s => {
          if (typeof s === 'object') {
            // Greedy Search: Try every common name for 'math work' or 'content'
            const math = s.work || s.content || s.step || s.math || s.text || s.description || s.value || '';
            const title = s.title || s.name || s.heading || '';
            
            if (title && math && title !== math) {
              return `${title}: ${math}`;
            }
            return math || title || '';
          }
          return s;
        });
      }

      // 3. Extract primary content sources
      const solutionContent = result.solution && typeof result.solution === 'string' ? result.solution : null;
      const finalAnswer = result.answer || result.finalAnswer || result.answerValue || '';
      const explanation = result.explanation || result.reasoning || '';
      
      // 4. A response is successful if it has EITHER a final answer OR a detailed solution string/steps
      const hasContent = (typeof finalAnswer === 'string' && finalAnswer.trim().length > 0 && finalAnswer !== 'See solution steps below') || 
                         (steps.length > 0) || 
                         (solutionContent !== null && solutionContent.trim().length > 0);

      // 5. Detect if the response is an explicit error message
      const isErrorMessage = typeof finalAnswer === 'string' && 
        (finalAnswer.toLowerCase().includes('failed to parse') || 
         finalAnswer.toLowerCase().includes('could not solve') ||
         finalAnswer.toLowerCase().includes('internal error'));

      // 6. We treat it as a success if there is CONTENT, even if 'success' field is missing or false
      // This handles cases where the AI solves it but the workflow's JSON enrichment step fails.
      const success = (result.success !== false || hasContent) && !isErrorMessage && hasContent;
      
      const solvedAt = new Date().toISOString();

      setSolution({ 
        ...result, 
        explanation,
        steps: steps.length > 0 ? steps : (solutionContent ? [solutionContent] : []),
        finalAnswer: (finalAnswer && finalAnswer !== 'See solution steps below') ? finalAnswer : (hasContent ? 'See solution steps below' : ''), 
        success, 
        error: result.error || (isErrorMessage ? finalAnswer : null),
        solvedAt 
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unknown error occurred.';
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
      </div>
      
      <Header />

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
