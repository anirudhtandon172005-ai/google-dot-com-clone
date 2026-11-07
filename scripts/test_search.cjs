const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function testSearchSection() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Measure Logo and Search Bar
  const searchMetrics = await page.evaluate(() => {
    function rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        borderRadius: cs.borderRadius,
        border: cs.border,
        boxShadow: cs.boxShadow
      };
    }

    const logo = document.querySelector('.google-logo-svg');
    const searchBar = document.querySelector('.search-bar');
    const lensIcon = document.querySelector('.search-lens-icon');
    const input = document.querySelector('.search-input');
    const tools = document.querySelector('.search-tools');

    return {
      logo: rect(logo),
      searchBar: rect(searchBar),
      lensIcon: rect(lensIcon),
      input: rect(input),
      tools: rect(tools)
    };
  });

  console.log('Search Section Metrics:', searchMetrics);

  // 2. Test typing in search bar
  console.log('Testing typing...');
  await page.focus('.search-input');
  await page.keyboard.type('Antigravity React Google Clone');
  await new Promise(r => setTimeout(r, 200));

  const inputValue = await page.$eval('.search-input', el => el.value);
  console.log('Input value:', inputValue);
  const clearBtnVisible = await page.evaluate(() => !!document.querySelector('.clear-btn'));
  console.log('Clear (X) button visible:', clearBtnVisible);

  await page.screenshot({ path: 'screenshots/checkpoint_03_typing.png' });

  // 3. Test Clear button
  console.log('Testing Clear button click...');
  await page.click('.clear-btn');
  await new Promise(r => setTimeout(r, 200));
  const clearedValue = await page.$eval('.search-input', el => el.value);
  console.log('Cleared input value:', clearedValue);

  // 4. Test Hover state on search bar
  await page.hover('.search-bar');
  await new Promise(r => setTimeout(r, 200));
  const hoverShadow = await page.$eval('.search-bar', el => window.getComputedStyle(el).boxShadow);
  console.log('Search Bar hover shadow:', hoverShadow);

  await page.screenshot({ path: 'screenshots/checkpoint_03_search_bar.png' });

  await browser.close();

  const passed =
    searchMetrics.logo.width === 272 &&
    searchMetrics.logo.height === 92 &&
    searchMetrics.searchBar.width === 584 &&
    searchMetrics.searchBar.height === 52 &&
    inputValue === 'Antigravity React Google Clone' &&
    clearBtnVisible &&
    clearedValue === '';

  console.log('Search section test status:', passed ? 'ALL PASS' : 'FAIL');
  return { searchMetrics, passed };
}

testSearchSection().catch(console.error);

