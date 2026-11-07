const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function runE2E() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  const testResults = [];

  // 1. Typing in search field
  await page.focus('.search-input');
  await page.keyboard.type('Test Query 123');
  const typedVal = await page.$eval('.search-input', el => el.value);
  testResults.push({
    test: '1. Typing updates search field',
    passed: typedVal === 'Test Query 123'
  });

  // 2. Clear button functionality
  await page.click('.clear-btn');
  const clearedVal = await page.$eval('.search-input', el => el.value);
  testResults.push({
    test: '2. Clear button clears search input',
    passed: clearedVal === ''
  });

  // 3. Search redirection via Enter
  await page.focus('.search-input');
  await page.keyboard.type('Deepmind Antigravity');

  let enterNavUrl = null;
  const onRequest = req => {
    const u = req.url();
    if (u.includes('google.com/search')) {
      enterNavUrl = u;
      req.abort();
    } else {
      req.continue();
    }
  };

  await page.setRequestInterception(true);
  page.on('request', onRequest);

  try {
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 400));
  } catch (e) {}

  page.off('request', onRequest);
  await page.setRequestInterception(false);

  testResults.push({
    test: '3. Enter key submits search to Google URL',
    passed: enterNavUrl && enterNavUrl.includes('google.com/search?q=Deepmind%20Antigravity')
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 4. Apps menu toggle & outside click & Escape
  await page.click('.apps-btn');
  await new Promise(r => setTimeout(r, 200));
  const appsOpen = await page.evaluate(() => !!document.querySelector('.apps-popup'));

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 200));
  const appsClosedEsc = await page.evaluate(() => !document.querySelector('.apps-popup'));

  await page.click('.apps-btn');
  await new Promise(r => setTimeout(r, 200));
  await page.click('.main-content');
  await new Promise(r => setTimeout(r, 200));
  const appsClosedClick = await page.evaluate(() => !document.querySelector('.apps-popup'));

  testResults.push({
    test: '4. Apps menu open/close (click, Escape, outside click)',
    passed: appsOpen && appsClosedEsc && appsClosedClick
  });

  // 5. Settings menu toggle & outside click & Escape
  await page.click('.settings-btn');
  await new Promise(r => setTimeout(r, 200));
  const settingsOpen = await page.evaluate(() => !!document.querySelector('.settings-menu'));

  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 200));
  const settingsClosedEsc = await page.evaluate(() => !document.querySelector('.settings-menu'));

  testResults.push({
    test: '5. Settings menu open/close (click, Escape)',
    passed: settingsOpen && settingsClosedEsc
  });

  // 6. Voice search explicitly handled
  await page.click('button[title="Search by voice"]');
  await new Promise(r => setTimeout(r, 400));
  const voiceHandled = await page.evaluate(() => {
    const hasModal = !!document.querySelector('.voice-modal');
    const hasToast = !!document.querySelector('.voice-error-toast') || !!document.querySelector('.voice-pulse-ring');
    return hasModal || hasToast;
  });
  testResults.push({
    test: '6. Voice search explicitly handles microphone/speech support',
    passed: voiceHandled
  });

  // If close button exists, close it
  const closeBtn = await page.$('.voice-close-btn');
  if (closeBtn) {
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 200));
  }

  // 7. Console error check
  testResults.push({
    test: '7. Zero console runtime errors',
    passed: consoleErrors.length === 0,
    details: consoleErrors
  });

  await page.screenshot({ path: 'screenshots/checkpoint_08_e2e_regression.png' });
  await browser.close();

  console.table(testResults);
  const allPassed = testResults.every(r => r.passed);
  console.log('E2E Regression status:', allPassed ? 'ALL PASS' : 'FAIL');
  return { testResults, allPassed };
}

runE2E().catch(console.error);
