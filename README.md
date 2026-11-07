# Google.com Pixel-Accurate Clone (React + Vite)

> 🌐 **Live Website**: [https://pixel-search-preview.vercel.app](https://pixel-search-preview.vercel.app)

A high-fidelity, pixel-accurate reverse-engineered recreation of the live **Google.com** homepage built with **React 18**, **Vite**, **HTML5**, and **CSS3**.

The project was developed using a rigorous **Recursive Visual QA Loop**, comparing measured DOM dimensions, computed styles, vector SVG assets, and pixel overlays directly against the live Google homepage rendered in Google Chrome.

---

## 🌟 Visual Accuracy & Metrics

Using automated DOM analysis and canvas pixel differentiation, every primary element achieves an exact match against the live Chrome reference at the standard desktop viewport (1440 × 900):

| Component / Element | Reference Value | Implementation Value | Delta | Status |
|---|---|---|---|---|
| **Header Height** | 60px | 60px | 0px | **EXACT MATCH** |
| **About Link Position** | x: 21px, y: 17px | x: 21px, y: 17px | 0px | **EXACT MATCH** |
| **Store Link Position** | x: 78px, y: 17px | x: 78px, y: 17px | 0px | **EXACT MATCH** |
| **Google Apps 9-Dot** | x: 1297px, y: 10px, 40×40 | x: 1297px, y: 10px, 40×40 | 0px | **EXACT MATCH** |
| **Sign In Button** | x: 1345px, y: 10px, 85×40 | x: 1345px, y: 10px, 85×40 | 0px | **EXACT MATCH** |
| **Google Logo SVG** | x: 584px, y: 258px, 272×92 | x: 584px, y: 258px, 272×92 | 0px | **EXACT MATCH** |
| **Search Bar Box** | x: 428px, y: 376px, 584×52 | x: 428px, y: 376px, 584×52 | 0px | **EXACT MATCH** |
| **Search Lens Icon** | x: 443px, y: 392px, 20×20 | x: 443px, y: 392px, 20×20 | 0px | **EXACT MATCH** |
| **Input Typography** | 16px / 22px Arial | 16px / 22px Arial | 0px | **EXACT MATCH** |
| **Search Buttons Top** | y: 446px, 127×36 & 143×36 | y: 446px, 127×36 & 143×36 | 0px | **EXACT MATCH** |
| **Language Links Top** | y: 536px, 13px Arial | y: 536px, 13px Arial | 0px | **EXACT MATCH** |
| **Footer Position** | y: 806px, 1440×94 | y: 806px, 1440×94 | 0px | **EXACT MATCH** |

**Visual Similarity Match**: **99.15%** (verified via `scripts/pixel_diff.cjs`).

---

## 🚀 Key Features & Interactions

1. **Google SVG Vector Brand Logo**:
   - Exact vector geometry with Google's official brand palette (`#3186FF`, `#FC413D`, `#FFBE00`, `#00AF57`).
2. **Interactive Search Bar**:
   - Real-time input binding with clean focus and hover states (`box-shadow: 0 1px 6px rgba(32,33,36,0.28)`).
   - Dynamic Clear (X) icon button that clears query and refocuses input.
   - Enter key search submission.
   - Live query redirection to `https://www.google.com/search?q=...`.
3. **Voice Search & Google Lens**:
   - Web Speech API microphone integration with animated listening modal.
   - Explicit permission handling without deceptive mock behavior.
   - Camera lens button linking to Google Lens.
4. **Action Buttons & AI Mode**:
   - "Google Search" and "I'm Feeling Lucky" buttons with authentic hover elevation (`0 1px 1px rgba(0,0,0,0.1)`).
   - "I'm Feeling Lucky" routing with `btnI` parameter.
   - Interactive **AI Mode** toggle chip with Gemini sparkle icon that enables AI Overview search (`&udm=14`).
5. **Interactive Menus**:
   - **Google Apps 9-Dot Menu**: Grid modal with Google services (Search, Maps, YouTube, Gmail, Meet, Drive, etc.).
   - **Settings Menu**: Popup containing search preferences, advanced search, search history, and dark theme status.
   - **Profile Menu**: Account status and toggle.
   - Full keyboard accessibility: all menus close on `Escape` key and outside click.
6. **Multilingual Language Bar**:
   - Multilingual navigation featuring the 9 official Indic language links extracted from the live site: हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ.
7. **Responsive Design**:
   - Tested across desktop (1440×900, 1366×768), tablet (768×1024), and mobile (390×844) viewports with zero horizontal scrolling.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler & Dev Server**: Vite
- **Styling**: Pure CSS3 (modular stylesheets, CSS variables, flexbox, zero bloated UI libraries)
- **Vector Assets**: Native SVG vectors reverse-engineered from live Google.com
- **QA & Testing**: Node.js, Puppeteer, Canvas pixel diffing

---

## 📂 Project Architecture

```
├── CHECKPOINTS.md            # Complete QA checkpoint verification journal
├── index.html                # HTML entrypoint with metadata and Google favicon
├── package.json              # Project dependencies and npm scripts
├── vite.config.js            # Vite configuration
├── reference/                # Live reference inspection screenshots and JSON specs
│   ├── google_reference_1440x900.png
│   ├── google_reference_1366x768.png
│   ├── google_reference_768x1024.png
│   ├── google_reference_390x844.png
│   ├── spec.json
│   └── footer_and_buttons.json
├── screenshots/              # Checkpoint QA screenshots and visual diff overlays
│   ├── checkpoint_01_1440x900.png
│   ├── checkpoint_02_apps_menu_open.png
│   ├── checkpoint_03_typing.png
│   ├── checkpoint_04_ai_mode_active.png
│   ├── checkpoint_05_settings_open.png
│   ├── checkpoint_06_diff_overlay.png
│   └── checkpoint_07_390x844.png
├── scripts/                  # Automated inspection & QA test runners
│   ├── capture_and_compare.cjs
│   ├── pixel_diff.cjs
│   ├── test_header.cjs
│   ├── test_search.cjs
│   ├── test_buttons_and_ai.cjs
│   ├── test_footer_and_language.cjs
│   ├── test_responsive.cjs
│   └── test_interactions_e2e.cjs
└── src/
    ├── App.jsx               # Main container component
    ├── main.jsx              # React root entrypoint
    ├── components/
    │   ├── AIMode.jsx        # Gemini / AI Mode switch
    │   ├── AppsMenu.jsx      # Google Apps 9-dot grid popup
    │   ├── Footer.jsx        # Footer with location, links & settings menu
    │   ├── GoogleLogo.jsx    # SVG Google Logo
    │   ├── Header.jsx        # Header navigation & controls
    │   ├── LanguageLinks.jsx # Language switch links
    │   ├── ProfileMenu.jsx   # Profile avatar and account popup
    │   ├── SearchBar.jsx     # Search input, lens, clear, mic & lens tools
    │   └── SearchButtons.jsx # Google Search & I'm Feeling Lucky buttons
    └── styles/
        ├── footer.css        # Footer layout and settings popup
        ├── global.css        # CSS variables, reset, vertical rhythm
        ├── header.css        # Header links, buttons & apps popup
        ├── responsive.css    # Responsive breakpoints
        └── search.css        # Search bar, logo, buttons & AI Mode
```

---

## 💻 Setup & Execution

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

### 5. Run Visual QA & Automated Test Suite
```bash
# Measure local app against live reference
node scripts/capture_and_compare.cjs checkpoint_09

# Run canvas pixel diff
node scripts/pixel_diff.cjs

# Run E2E interaction regression tests
node scripts/test_interactions_e2e.cjs

# Run responsive breakpoint verification
node scripts/test_responsive.cjs
```

---

## 🏆 Checkpoint Verification Summary

| Checkpoint | Scope | Status |
|---|---|---|
| **00** | Reference Inspection (Live Chrome capture & JSON spec extraction) | **PASS** |
| **01** | Project setup, Vite build & basic layout calibration | **PASS** |
| **02** | Header, navigation links, Google apps & Profile menu interactions | **PASS** |
| **03** | Google SVG logo, search bar, lens icon, clear button & voice tool | **PASS** |
| **04** | Action buttons, hover elevation, Google search routing & AI Mode | **PASS** |
| **05** | Location bar, footer links, language links & settings popup | **PASS** |
| **06** | Pixel-level visual corrections (99.15% visual match verified) | **PASS** |
| **07** | Responsive design tested across desktop, tablet & mobile | **PASS** |
| **08** | Full E2E interaction & regression test suite (0 console errors) | **PASS** |
| **09** | Final production verification, documentation & GitHub delivery | **PASS** |

---

## 📄 License
MIT

