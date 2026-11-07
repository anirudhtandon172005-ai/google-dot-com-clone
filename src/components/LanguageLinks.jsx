import React from 'react';

const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' }
];

export default function LanguageLinks() {
  return (
    <div className="language-links" id="SIvCob">
      <span className="lang-label">Google offered in:</span>
      {LANGUAGES.map((lang) => (
        <a
          key={lang.code}
          href={`https://www.google.com/setprefs?hl=${lang.code}&source=homepage`}
          className="lang-link"
        >
          {lang.label}
        </a>
      ))}
    </div>
  );
}
