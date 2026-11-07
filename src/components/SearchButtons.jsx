import React from 'react';

export default function SearchButtons({ query, onSearch, onLucky }) {
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      const q = query.trim();
      if (q) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      }
    }
  };

  const handleLucky = (e) => {
    e.preventDefault();
    if (onLucky) {
      onLucky(query);
    } else {
      const q = query.trim();
      if (q) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}&btnI=I%27m+Feeling+Lucky`;
      } else {
        window.location.href = 'https://doodles.google/';
      }
    }
  };

  return (
    <div className="search-buttons">
      <button
        type="button"
        className="search-btn"
        onClick={handleSearch}
        aria-label="Google Search"
      >
        Google Search
      </button>
      <button
        type="button"
        className="search-btn"
        onClick={handleLucky}
        aria-label="I'm Feeling Lucky"
      >
        I'm Feeling Lucky
      </button>
    </div>
  );
}

