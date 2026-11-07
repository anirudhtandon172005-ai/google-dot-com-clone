import React, { useState } from 'react';
import Header from './components/Header';
import GoogleLogo from './components/GoogleLogo';
import SearchBar from './components/SearchBar';
import SearchButtons from './components/SearchButtons';
import LanguageLinks from './components/LanguageLinks';
import Footer from './components/Footer';
import AIMode from './components/AIMode';

import './styles/global.css';
import './styles/header.css';
import './styles/search.css';
import './styles/footer.css';
import './styles/responsive.css';

export default function App() {
  const [query, setQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSearch = (q) => {
    const term = (q !== undefined ? q : query).trim();
    if (term) {
      if (isAiMode) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}&udm=14`;
      } else {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
      }
    }
  };

  const handleLucky = (q) => {
    const term = (q !== undefined ? q : query).trim();
    if (term) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}&btnI=I%27m+Feeling+Lucky`;
    } else {
      window.location.href = 'https://doodles.google/';
    }
  };

  return (
    <div className="google-app">
      <Header />

      <main className="main-content">
        <div className="top-spacer" />

        <GoogleLogo />

        <form className="search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
          />

          <SearchButtons
            query={query}
            onSearch={handleSearch}
            onLucky={handleLucky}
          />

          <AIMode
            isAiMode={isAiMode}
            onToggle={() => setIsAiMode(!isAiMode)}
          />
        </form>

        <LanguageLinks />

        <div className="bottom-spacer" />
      </main>

      <Footer />

      {/* Educational Showcase Badge */}
      <div
        style={{
          position: 'fixed',
          bottom: '12px',
          right: '16px',
          backgroundColor: 'rgba(32, 33, 36, 0.88)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '11px',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.2px',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        🎓 Educational UI Showcase • Not affiliated with Google
      </div>
    </div>
  );
}
