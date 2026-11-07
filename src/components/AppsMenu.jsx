import React, { useState, useEffect, useRef } from 'react';

const GOOGLE_APPS = [
  { name: 'Search', icon: 'https://www.gstatic.com/companion/icon_assets/search_2020q4_2x.png', url: 'https://www.google.com' },
  { name: 'Maps', icon: 'https://maps.gstatic.com/tactile/pane/default_geocode-2x.png', url: 'https://maps.google.com' },
  { name: 'YouTube', icon: 'https://www.gstatic.com/images/branding/product/2x/youtube_64dp.png', url: 'https://youtube.com' },
  { name: 'Play', icon: 'https://www.gstatic.com/images/branding/product/2x/play_prism_64dp.png', url: 'https://play.google.com' },
  { name: 'News', icon: 'https://www.gstatic.com/images/branding/product/2x/news_64dp.png', url: 'https://news.google.com' },
  { name: 'Gmail', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', url: 'https://mail.google.com' },
  { name: 'Meet', icon: 'https://www.gstatic.com/images/branding/product/2x/meet_2020q4_48dp.png', url: 'https://meet.google.com' },
  { name: 'Chat', icon: 'https://www.gstatic.com/images/branding/product/2x/chat_2020q4_48dp.png', url: 'https://chat.google.com' },
  { name: 'Drive', icon: 'https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png', url: 'https://drive.google.com' },
  { name: 'Calendar', icon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico', url: 'https://calendar.google.com' },
  { name: 'Contacts', icon: 'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png', url: 'https://contacts.google.com' },
  { name: 'Translate', icon: 'https://www.gstatic.com/images/branding/product/2x/translate_24dp.png', url: 'https://translate.google.com' }
];

export default function AppsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="apps-btn"
        aria-label="Google apps"
        title="Google apps"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg focusable="false" viewBox="0 0 24 24">
          <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z" />
        </svg>
      </button>

      {isOpen && (
        <div ref={menuRef} className="apps-popup" role="dialog" aria-label="Google apps">
          <div className="apps-grid">
            {GOOGLE_APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="app-item"
              >
                <img
                  src={app.icon}
                  alt={app.name}
                  className="app-icon"
                  onError={(e) => {
                    // Fallback to initial if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="app-label">{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
