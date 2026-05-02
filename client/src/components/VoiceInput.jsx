import { useEffect, useRef } from 'react';
import './VoiceInput.css';

export default function VoiceInput({ onTranscript, isListening, setIsListening }) {
  const recognitionRef = useRef(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join('');
      onTranscript(transcript, e.results[e.results.length - 1].isFinal);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!isSupported) {
    return (
      <div className="voice-unsupported">
        🎤 Voice input not supported in this browser. Use Chrome or Edge.
      </div>
    );
  }

  return (
    <button
      id="voice-input-btn"
      type="button"
      className={`voice-btn ${isListening ? 'voice-btn-active' : ''}`}
      onClick={toggleListening}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      <div className={`voice-icon-wrap ${isListening ? 'pulsing' : ''}`}>
        {isListening ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="2"/>
            <rect x="14" y="4" width="4" height="16" rx="2"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
            <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 18 0h-2z"/>
            <line x1="12" y1="20" x2="12" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
      {isListening && (
        <>
          <span className="voice-ring voice-ring-1" />
          <span className="voice-ring voice-ring-2" />
        </>
      )}
    </button>
  );
}
