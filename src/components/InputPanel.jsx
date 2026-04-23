import React, { useState } from 'react';
import './InputPanel.css';

export default function InputPanel({ onSolve, loading }) {
  const [mode, setMode] = useState('text'); // 'text' | 'image'
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const exampleQuestions = [
    'Solve: 2x² + 5x - 3 = 0',
    'Differentiate: f(x) = x³ + 4x² - 7x + 2',
    'Find the integral of sin(x)cos(x)dx',
    'If sin θ = 3/5, find cos θ and tan θ',
    'Find the area of a triangle with sides 5, 7, and 8',
  ];

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (mode === 'text' && question.trim()) {
      onSolve({ type: 'text', question: question.trim() });
    } else if (mode === 'image' && imageFile) {
      onSolve({ type: 'image', imageFile });
    }
  };

  const handleExample = (ex) => {
    setMode('text');
    setQuestion(ex);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const canSubmit = !loading && ((mode === 'text' && question.trim()) || (mode === 'image' && imageFile));

  return (
    <div className="input-panel animate-fade-in-up">
      {/* Mode Toggle */}
      <div className="mode-toggle" role="tablist">
        <button
          id="tab-text"
          role="tab"
          aria-selected={mode === 'text'}
          className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          <span className="mode-icon">✏️</span>
          Type a Question
        </button>
        <button
          id="tab-image"
          role="tab"
          aria-selected={mode === 'image'}
          className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
          onClick={() => setMode('image')}
        >
          <span className="mode-icon">📸</span>
          Upload Question Paper
        </button>
      </div>

      {/* Text Input Mode */}
      {mode === 'text' && (
        <div className="text-input-area animate-fade-in">
          <div className="textarea-wrapper">
            <textarea
              id="math-question-input"
              className="math-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Find the roots of x² - 5x + 6 = 0&#10;or: What is the derivative of sin(x) * e^x?"
              rows={5}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
              }}
            />
            <div className="textarea-controls">
              <div className="extra-actions">
                <button 
                  className="action-btn" 
                  title="Voice Input (Coming Soon)"
                  onClick={() => alert("Voice input will be available in the next update!")}
                >
                  🎙️
                </button>
                <button 
                  className="action-btn" 
                  title="Math Symbols"
                >
                  π
                </button>
              </div>
              <span className="textarea-hint">⌘ + Enter to solve instantly</span>
              {question && (
                <button 
                  className="clear-btn" 
                  onClick={() => setQuestion('')}
                  title="Clear input"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Example Questions */}
          <div className="examples-section">
            <p className="examples-label">✨ Try an example:</p>
            <div className="examples-list">
              {exampleQuestions.map((ex, i) => (
                <button
                  key={i}
                  className="example-chip"
                  onClick={() => handleExample(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Mode */}
      {mode === 'image' && (
        <div className="image-input-area animate-fade-in">
          {!imagePreview ? (
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('file-input').click()}
              role="button"
              tabIndex={0}
              aria-label="Upload image of question paper"
            >
              <div className="drop-icon">📄</div>
              <p className="drop-title">Drop your question paper here</p>
              <p className="drop-sub">or click to browse</p>
              <p className="drop-hint">Supports JPG, PNG, PDF</p>
              <input
                id="file-input"
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={handleImageInput}
              />
            </div>
          ) : (
            <div className="image-preview-box">
              {imageFile && imageFile.type === 'application/pdf' ? (
                <div style={{ height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', color: '#ef4444' }}>
                  <span style={{ fontSize: '48px' }}>📄</span>
                  <span style={{ fontWeight: '600', marginTop: '8px' }}>PDF Document</span>
                </div>
              ) : (
                <img src={imagePreview} alt="Uploaded question paper" className="preview-img" />
              )}
              <div className="preview-info">
                <span className="preview-name">📎 {imageFile.name}</span>
                <button className="clear-btn" onClick={clearImage}>✕ Remove</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solve Button */}
      <button
        id="solve-btn"
        className={`solve-btn ${canSubmit ? 'active' : 'disabled'}`}
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Solve math question"
      >
        {loading ? (
          <>
            <span className="btn-spinner" />
            Solving with AI...
          </>
        ) : (
          <>
            <span>🧠</span>
            Solve Step by Step
          </>
        )}
      </button>
    </div>
  );
}
