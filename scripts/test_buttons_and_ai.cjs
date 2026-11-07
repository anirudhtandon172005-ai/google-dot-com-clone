const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function testButtonsAndAI() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Measure Buttons
  const buttonsMetrics = await page.evaluate(() => {
    function rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow
      };
    }

    const searchBtn = Array.from(document.querySelectorAll('.search-btn')).find(b => b.textContent.includes('Google Search'));
    const luckyBtn = Array.from(document.querySelectorAll('.search-btn')).find(b => b.textContent.includes("I'm Feeling Lucky"));
    const aiBtn = document.querySelector('.ai-mode-toggle');

    return {
      searchBtn: rect(searchBtn),
      luckyBtn: rect(luckyBtn),
      aiBtn: rect(aiBtn)
    };
  });

  console.log('Buttons Metrics:', buttonsMetrics);

  // 2. Test Hover state on Google Search button
  const searchBtnSelector = '.search-btn:first-of-type';
  await page.hover(searchBtnSelector);
  await new Promise(r => setTimeout(r, 200));
  const hoverStyles = await page.$eval(searchBtnSelector, el => {
    const cs = window.getComputedStyle(el);
    return {
      border: cs.border,
      boxShadow: cs.boxShadow,
      color: cs.color
    };
  });
  console.log('Search Button Hover Styles:', hoverStyles);
  await page.screenshot({ path: 'screenshots/checkpoint_04_button_hover.png' });

  // 3. Test AI Mode toggle
  console.log('Testing AI Mode toggle...');
  await page.click('.ai-mode-toggle');
  await new Promise(r => setTimeout(r, 200));
  const isAiActive = await page.$eval('.ai-mode-toggle', el => el.classList.contains('active'));
  console.log('AI Mode is active:', isAiActive);
  await page.screenshot({ path: 'screenshots/checkpoint_04_ai_mode_active.png' });

  // 4. Test Search Redirection logic
  const testQuery = 'Vite React Google Clone';
  await page.focus('.search-input');
  await page.keyboard.type(testQuery);

  let navigatedUrl = null;
  page.on('request', req => {
    const url = req.url();
    if (url.includes('google.com/search')) {
      navigatedUrl = url;
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.setRequestInterception(true);

  // Click Search
  try {
    await page.click(searchBtnSelector);
    await new Promise(r => setTimeout(r, 500));
  } catch (e) {}

  console.log('Search navigated to:', navigatedUrl);

  await browser.close();

  const passed =
    buttonsMetrics.searchBtn.width === 127 &&
    buttonsMetrics.searchBtn.height === 36 &&
    buttonsMetrics.luckyBtn.width === 143 &&
    buttonsMetrics.luckyBtn.height === 36 &&
    isAiActive &&
    navigatedUrl && navigatedUrl.includes('google.com/search') && navigatedUrl.includes('udm=14');

  console.log('Buttons & AI test status:', passed ? 'ALL PASS' : 'FAIL');
  return { buttonsMetrics, passed };
}

testButtonsAndAI().catch(console.error);
