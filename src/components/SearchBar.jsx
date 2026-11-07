import React, { useState, useRef } from 'react';

export default function SearchBar({ query, setQuery, onSearch }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser.');
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    try {
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setIsListening(false);
          if (onSearch) {
            onSearch(transcript);
          }
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          setVoiceError(`Voice search requires microphone permission: ${event.error}`);
          setTimeout(() => setVoiceError(null), 4000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setVoiceError('Could not start microphone.');
      setTimeout(() => setVoiceError(null), 3000);
    }
  };

  return (
    <div className={`search-bar ${isFocused ? 'has-focus' : ''}`}>
      {/* Magnifying glass icon on left */}
      <div className="search-lens-icon">
        <svg focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M784-120L532-372q-30,24-69,38t-83,14q-109,0-184.5-75.5T120-580t75.5-184.5T380-840t184.5,75.5T640-580q0,44-14,83t-38,69L840-176l-56,56ZM380-400q75,0 127.5-52.5T560-580T507.5-707.5T380-760T252.5-707.5T200-580t52.5,127.5T380-400Z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        type="text"
        name="q"
        className="search-input"
        aria-label="Search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit(e);
          }
        }}
      />

      <div className="search-tools">
        {query && (
          <button
            type="button"
            className="tool-icon-btn clear-btn"
            aria-label="Clear"
            title="Clear"
            onClick={handleClear}
          >
            <svg focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M256-200l-56-56L424-480L200-704l56-56L480-536L704-760l56,56L536-480L760-256l-56,56L480-424L256-200Z" />
            </svg>
          </button>
        )}

        {/* Voice Search */}
        <button
          type="button"
          className="tool-icon-btn"
          aria-label="Search by voice"
          title="Search by voice"
          onClick={handleVoiceSearch}
        >
          <svg className="ByCvB" aria-hidden="true" focusable="false" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z"
              fill={isListening ? '#ea4335' : 'currentColor'}
            />
          </svg>
        </button>

        {/* Lens / Image Search */}
        <button
          type="button"
          className="tool-icon-btn"
          aria-label="Search by image"
          title="Search by image"
          onClick={() => {
            window.open('https://lens.google.com/', '_blank');
          }}
        >
          <svg className="hWdRGb" aria-hidden="true" focusable="false" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M480-320q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35Zm240 160q-33 0-56.5-23.5T640-240q0-33 23.5-56.5T720-320q33 0 56.5 23.5T800-240q0 33-23.5 56.5T720-160Zm-440 40q-66 0-113-47t-47-113v-80h80v80q0 33 23.5 56.5T280-200h200v80H280Zm480-320v-160q0-33-23.5-56.5T680-680H280q-33 0-56.5 23.5T200-600v120h-80v-120q0-66 47-113t113-47h80l40-80h160l40 80h80q66 0 113 47t47 113v160h-80Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Voice listening modal overlay */}
      {isListening && (
        <div className="voice-modal-overlay" onClick={() => setIsListening(false)}>
          <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="voice-close-btn"
              onClick={() => setIsListening(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="voice-pulse-ring">
              <svg viewBox="0 -960 960 960" width="36" height="36" fill="#fff">
                <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm-40 280v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Z" />
              </svg>
            </div>
            <div className="voice-status">Listening...</div>
            <div className="voice-subtext">Speak now to search Google</div>
          </div>
        </div>
      )}

      {/* Voice error toast */}
      {voiceError && (
        <div
          className="voice-error-toast"
          style={{
            position: 'absolute',
            bottom: '-45px',
            background: '#323232',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '13px',
            zIndex: 100
          }}
        >
          {voiceError}
        </div>
      )}
    </div>
  );
}
