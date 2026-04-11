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
      let result;
      if (type === 'text') {
        result = await solveMathQuestion(question, isTest);
      } else {
        result = await solveMathImage(imageFile, isTest);
      }

      console.log("n8n Webhook Response:", result);

      // 1. Unwrap common n8n/API wrappings (Array or .data object)
      let data = result;
      if (Array.isArray(result) && result.length > 0) data = result[0];
      else if (result && result.data && typeof result.data === 'object' && !result.steps) data = result.data;

      // 2. Convert raw string to object if possible
      if (typeof data === 'string') {
        data = { solution: data, success: true };
      }

      // 3. Extract steps with multiple fallback names
      let rawSteps = data.steps || data.solutionSteps || data.work || data.process || [];
      let steps = [];
      
      if (Array.isArray(rawSteps)) {
        steps = rawSteps.map(s => {
          if (typeof s === 'object' && s !== null) {
            return s.work || s.content || s.step || s.math || s.text || s.description || s.value || s.title || '';
          }
          return s;
        });
      }

      // 4. Extract primary content with multiple fallback names
      const solutionContent = data.solution && typeof data.solution === 'string' ? data.solution : null;
      const finalAnswer = data.answer || data.finalAnswer || data.answerValue || data.result || '';
      const explanation = data.explanation || data.reasoning || data.description || '';
      const topic = data.topic || data.subject || '';
      
      // 5. Detect if there's ANY usable content
      const hasContent = (steps.length > 0) || 
                         (typeof finalAnswer === 'string' && finalAnswer.trim().length > 0 && finalAnswer !== 'See solution steps below') || 
                         (solutionContent !== null && solutionContent.trim().length > 0);

      // 6. Detect explicit errors
      const isErrorMessage = typeof finalAnswer === 'string' && 
        (finalAnswer.toLowerCase().includes('failed to parse') || 
         finalAnswer.toLowerCase().includes('could not solve') ||
         finalAnswer.toLowerCase().includes('internal error'));

      // 7. Force success if content is present, unless it's an explicit error string
      const success = hasContent && !isErrorMessage;
      
      const solvedAt = new Date().toISOString();

      setSolution({ 
        ...data, 
        topic,
        explanation,
        steps: steps.length > 0 ? steps : (solutionContent ? [solutionContent] : []),
        finalAnswer: (finalAnswer && finalAnswer !== 'See solution steps below') ? finalAnswer : (hasContent ? 'See solution steps below' : ''), 
        success, 
        error: data.error || (isErrorMessage ? finalAnswer : null),
        solvedAt 
      });

    } catch (err) {
      console.error("Full Error Object:", err);
      const statusCode = err?.response?.status;
      const errorData = err?.response?.data;
      
      let msg = "Webhook Connection Failed. ";
      
      if (err.message === "Network Error") {
        msg += "This is likely a CORS issue or n8n is offline. Ensure n8n allows requests from localhost.";
      } else if (statusCode === 404) {
        msg += "The webhook URL was not found (404). Check if the workflow is Active.";
      } else {
        msg += err.message || "Unknown error occurred.";
      }
      
      if (statusCode) msg += ` (System Status: ${statusCode})`;
      
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
