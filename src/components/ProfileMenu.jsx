import React, { useState, useEffect, useRef } from 'react';

export default function ProfileMenu() {
  const [isSignedIn, setIsSignedIn] = useState(false);
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

  if (!isSignedIn) {
    return (
      <div style={{ position: 'relative' }}>
        <a
          ref={btnRef}
          href="https://accounts.google.com/ServiceLogin?hl=en"
          className="sign-in-btn"
          aria-label="Sign in"
          onClick={(e) => {
            // Optional: let users toggle profile menu on Shift/Alt or preview demo account
            if (e.altKey || e.ctrlKey) {
              e.preventDefault();
              setIsSignedIn(true);
            }
          }}
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="profile-avatar-btn"
        aria-label="Google Account"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-avatar-circle">U</div>
      </button>

      {isOpen && (
        <div ref={menuRef} className="profile-popup" role="dialog" aria-label="Account details">
          <div className="profile-avatar-large">U</div>
          <div className="profile-name">Google User</div>
          <div className="profile-email">user@example.com</div>
          <a
            href="https://myaccount.google.com"
            target="_blank"
            rel="noreferrer"
            className="manage-account-btn"
          >
            Manage your Google Account
          </a>
          <button
            type="button"
            className="sign-out-btn"
            onClick={() => {
              setIsSignedIn(false);
              setIsOpen(false);
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

