import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './SolutionDisplay.css';

export default function SolutionDisplay({ solution, question, error, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = "";
    if (solution.solution) {
      textToCopy = solution.solution;
    } else if (solution.steps) {
      textToCopy = `${solution.topic}\n\n${solution.explanation}\n\n`;
      solution.steps.forEach((s, idx) => {
        textToCopy += `Step ${idx + 1}: ${s.step}\n${s.math}\n\n`;
      });
      textToCopy += `Final Answer: ${solution.finalAnswer}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="solution-display animate-fade-in loading-mode">
        <div className="loading-state">
          <div className="loading-orb-container">
            <div className="loading-brain">🧠</div>
            <div className="pulse-circle"></div>
          </div>
          <h3 className="loading-title">MathAI is analyzing...</h3>
          <p className="loading-subtitle">Solving all problems and formatting your report</p>
          
          <div className="loading-steps-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-step">
                <div className="skeleton-line" style={{ width: `${80 - i * 5}%`, animationDelay: `${i * 0.2}s` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="solution-display animate-fade-in">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Couldn't solve the question</h3>
          <p className="error-msg">{error}</p>
          <div className="error-tips">
            <p className="tips-header">🔍 Troubleshooting Tips:</p>
            <ul>
              <li>Check your <strong>n8n workflow</strong> connections.</li>
              <li>Ensure <strong>AI Model</strong> is responding in n8n.</li>
              <li>Try rephrasing your question or uploading a clearer image.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!solution) return null;

  // Render PDF Success State
  if (solution.isPDF) {
    return (
      <div className="solution-display animate-fade-in">
        <div className="pdf-success-state">
          <div className="pdf-icon">📄</div>
          <h2 className="pdf-title">Solution PDF Ready!</h2>
          <p className="pdf-msg"> Your step-by-step solutions have been generated and downloaded automatically.</p>
          
          {solution.fileName && (
            <div className="file-info">
              <span className="file-label">Filename:</span>
              <span className="file-name">{solution.fileName}</span>
            </div>
          )}

          <div className="pdf-actions">
            <a href={solution.pdfUrl} download={solution.fileName} className="download-btn">
              📥 Download PDF Again
            </a>
          </div>

          <div className="pdf-footer">
            <p>This report includes steps, final answers, and hints for all detected questions.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render Structured / Markdown Solution
  return (
    <div className="solution-display animate-fade-in">
      <div className="solution-header">
        <div className="solution-header-top">
          <div className="solution-badges">
            <span className="solution-badge badge-topic">{solution.topic || "Solution Found"}</span>
            {solution.difficulty && (
              <span className={`solution-badge badge-difficulty ${solution.difficulty.toLowerCase()}`}>
                {solution.difficulty}
              </span>
            )}
            <span className="solution-badge">AI Response</span>
          </div>
          <button className={`copy-all-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
            {copied ? '✓ Copied' : '📄 Copy All'}
          </button>
        </div>

        <div className="question-recap">
          <span className="recap-label">Q:</span>
          <span>{solution.question || question}</span>
        </div>
      </div>

      <div className="solution-content">
        {/* If it's structured fields */}
        {solution.explanation && (
          <div className="explanation-section animate-fade-in">
             <div className="section-label">Analysis</div>
             <p className="explanation-paragraph">{solution.explanation}</p>
          </div>
        )}

        {solution.steps && (
          <div className="steps-timeline">
            {solution.steps.map((step, idx) => (
              <div key={idx} className="timeline-item animate-slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="timeline-dot">
                  <span className="dot-number">{step.step || idx + 1}</span>
                </div>
                <div className="timeline-content">
                  <h4 className="step-title">{step.title || step.step_text || `Step ${idx + 1}`}</h4>
                  {(step.working || step.math) && (
                    <div className="step-working">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {step.working || step.math}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {solution.finalAnswer && (
          <div className="final-answer-card animate-fade-in-up">
            <div className="answer-card-glow"></div>
            <div className="answer-header">
               <span className="answer-icon">🎯</span>
               <span className="answer-label">Result</span>
            </div>
            <div className="answer-value">
               <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                 {solution.finalAnswer}
               </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Verification - only show if exists */}
        {solution.verification && (
          <div className="verification-block animate-fade-in">
            <div className="block-header">
               <span className="block-icon">🛡️</span>
               <span className="block-label">Solution Verified</span>
            </div>
            <div className="block-content">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {solution.verification}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* If it's fallback markdown */}
        {solution.solution && !solution.steps && (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {solution.solution}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {solution.hints && solution.hints.length > 0 && (
        <div className="hints-section">
          <h4 className="hints-title">💡 Hints & Tips</h4>
          <ul className="hints-list">
            {solution.hints.map((hint, idx) => (
              <li key={idx}>{hint}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="solution-footer">
        <div className="solved-at">Solved via MathAI • {new Date(solution.solvedAt).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}

