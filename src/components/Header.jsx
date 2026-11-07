import React from 'react';
import AppsMenu from './AppsMenu';
import ProfileMenu from './ProfileMenu';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <a
          href="https://about.google/?fg=1&utm_source=google-IN&utm_medium=referral&utm_campaign=hp-header"
          className="header-link about-link"
        >
          About
        </a>
        <a
          href="https://store.google.com/?utm_source=hp_header&utm_medium=google_ooo&hl=en"
          className="header-link"
        >
          Store
        </a>
      </div>

      <div className="header-spacer" />

      <div className="header-right">
        <a href="https://mail.google.com" className="header-nav-link">
          Gmail
        </a>
        <a href="https://www.google.com/imghp?hl=en" className="header-nav-link">
          Images
        </a>
        <AppsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
