import React, { useState, useEffect, useRef } from 'react';

export default function Footer() {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setShowSettings(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowSettings(false);
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSettings]);

  return (
    <footer className="footer">
      <div className="footer-location">India</div>

      <div className="footer-links-row">
        <div className="footer-links-left">
          <a
            href="https://about.google/?utm_source=google-IN&utm_medium=referral&utm_campaign=hp-footer&fg=1"
            className="footer-link"
          >
            About
          </a>
          <a
            href="https://www.google.com/intl/en_in/ads/?subid=ww-ww-et-g-awa-a-g_hpafoot1_1!o2&utm_source=google.com&utm_medium=referral&utm_campaign=google_hpafooter&fg=1"
            className="footer-link"
          >
            Advertising
          </a>
          <a
            href="https://www.google.com/services/?subid=ww-ww-et-g-awa-a-g_hpbfoot1_1!o2&utm_source=google.com&utm_medium=referral&utm_campaign=google_hpbfooter&fg=1"
            className="footer-link"
          >
            Business
          </a>
          <a
            href="https://google.com/search/howsearchworks/?fg=1"
            className="footer-link"
          >
            How Search works
          </a>
        </div>

        <div className="footer-links-right">
          <a
            href="https://policies.google.com/privacy?hl=en-IN&fg=1"
            className="footer-link"
          >
            Privacy
          </a>
          <a
            href="https://policies.google.com/terms?hl=en-IN&fg=1"
            className="footer-link"
          >
            Terms
          </a>

          <div className="settings-container">
            <button
              ref={btnRef}
              type="button"
              className="footer-link settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-expanded={showSettings}
            >
              Settings
            </button>

            {showSettings && (
              <div ref={settingsRef} className="settings-menu" role="menu">
                <a
                  href="https://www.google.com/preferences?hl=en-IN&fg=1"
                  className="settings-item"
                  role="menuitem"
                >
                  Search settings
                </a>
                <a
                  href="https://www.google.com/advanced_search?hl=en-IN&fg=1"
                  className="settings-item"
                  role="menuitem"
                >
                  Advanced search
                </a>
                <a
                  href="https://www.google.com/history/privacyadvisor/search/unauth?utm_source=googlemenu&fg=1"
                  className="settings-item"
                  role="menuitem"
                >
                  Your data in Search
                </a>
                <a
                  href="https://www.google.com/history/optout?hl=en-IN&fg=1"
                  className="settings-item"
                  role="menuitem"
                >
                  Search history
                </a>
                <a
                  href="https://support.google.com/websearch/?p=ws_results_help&hl=en-IN&fg=1"
                  className="settings-item"
                  role="menuitem"
                >
                  Search help
                </a>
                <div className="settings-divider" />
                <button
                  type="button"
                  className="settings-item"
                  role="menuitem"
                  onClick={() => alert('Dark theme toggle available in system preferences.')}
                >
                  Dark theme: Off
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

