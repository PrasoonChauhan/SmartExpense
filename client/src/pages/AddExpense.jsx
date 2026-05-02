import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../context/ExpenseContext';
import VoiceInput from '../components/VoiceInput';
import ParsedPreview from '../components/ParsedPreview';
import './AddExpense.css';

const EXAMPLES = [
  'Spent ₹450 on pizza yesterday',
  'Paid 1200 for electricity bill',
  'Bought medicines for ₹350 today',
  'Flight ticket to Delhi for 5500',
];

export default function AddExpense() {
  const { parseWithAI, createExpense } = useExpense();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // Handle voice transcript — auto-parse when speech is done
  const handleTranscript = (transcript, isFinal) => {
    setText(transcript);
    if (isFinal) {
      setIsListening(false);
      if (transcript.trim()) {
        parseText(transcript.trim()); // pass transcript directly, don't rely on state
      }
    }
  };

  // Call AI parse — accepts optional text arg for voice auto-parse
  const handleParse = async () => {
    if (!text.trim()) return;
    parseText(text.trim());
  };

  const parseText = async (inputText) => {
    setParsing(true);
    try {
      const result = await parseWithAI(inputText);
      setParsedData(result.data);
    } catch {
      // Toast handled in context
    } finally {
      setParsing(false);
    }
  };

  // Save confirmed expense
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      await createExpense({
        ...formData,
        description: text,
        rawVoiceText: isListening ? text : '',
      });
      setText('');
      setParsedData(null);
      navigate('/dashboard');
    } catch {
      // Toast handled in context
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="add-header animate-fadeInUp">
        <div>
          <h1 className="page-title">Add Expense</h1>
          <p>Type or speak your expense in plain English — AI will extract the details.</p>
        </div>
      </div>

      <div className="add-layout">
        {/* Input card */}
        <div className="add-card glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="add-card-header">
            <h3>Describe your expense</h3>
          </div>

          <div className="textarea-wrap">
            <textarea
              id="expense-text-input"
              className="expense-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Paid ₹450 for pizza yesterday evening..."
              rows={4}
            />
            {isListening && (
              <div className="listening-badge">
                <span className="listening-dot" />
                Listening...
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="add-actions">
            <VoiceInput
              onTranscript={handleTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
            />
            <button
              id="parse-btn"
              className="btn btn-primary parse-btn"
              onClick={handleParse}
              disabled={!text.trim() || parsing}
            >
              {parsing ? (
                <>
                  <span className="spinner-sm" />
                  Parsing...
                </>
              ) : (
                <>✨ Parse with AI</>
              )}
            </button>
          </div>
        </div>

        {/* Examples card */}
        <div className="examples-card glass-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="examples-title">💡 Try these examples</h3>
          <div className="examples-list">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                id={`example-${i}`}
                type="button"
                className="example-chip"
                onClick={() => setText(ex)}
              >
                "{ex}"
              </button>
            ))}
          </div>

          <div className="divider" />

          <div className="tip-box">
            <p className="tip-label">🤖 How AI parsing works</p>
            <ul className="tip-list">
              <li>Detects product/service name</li>
              <li>Extracts amount (with or without ₹ symbol)</li>
              <li>Understands relative dates ("yesterday", "last week")</li>
              <li>Auto-classifies into categories</li>
              <li>Uses today's date if no date is mentioned</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Parsed Preview modal */}
      {parsedData && (
        <ParsedPreview
          data={parsedData}
          onSave={handleSave}
          onCancel={() => setParsedData(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
