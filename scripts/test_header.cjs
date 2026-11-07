const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function testHeader() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Measure all header elements
  const headerMetrics = await page.evaluate(() => {
    function rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        color: cs.color,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily,
        backgroundColor: cs.backgroundColor
      };
    }

    const about = document.querySelector('.about-link');
    const store = Array.from(document.querySelectorAll('.header-left a'))[1];
    const gmail = Array.from(document.querySelectorAll('.header-right a')).find(a => a.textContent.trim() === 'Gmail');
    const images = Array.from(document.querySelectorAll('.header-right a')).find(a => a.textContent.trim() === 'Images');
    const appsBtn = document.querySelector('.apps-btn');
    const signInBtn = document.querySelector('.sign-in-btn');

    return {
      about: rect(about),
      store: rect(store),
      gmail: rect(gmail),
      images: rect(images),
      appsBtn: rect(appsBtn),
      signInBtn: rect(signInBtn)
    };
  });

  console.log('Header Metrics:', headerMetrics);

  // Test opening Apps menu
  console.log('Testing Apps Menu interaction...');
  await page.click('.apps-btn');
  await new Promise(r => setTimeout(r, 300));
  const isAppsMenuOpen = await page.evaluate(() => !!document.querySelector('.apps-popup'));
  console.log('Apps Menu opened:', isAppsMenuOpen);
  await page.screenshot({ path: 'screenshots/checkpoint_02_apps_menu_open.png' });

  // Test closing on Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));
  const isAppsMenuClosedOnEsc = await page.evaluate(() => !document.querySelector('.apps-popup'));
  console.log('Apps Menu closed on Escape:', isAppsMenuClosedOnEsc);

  // Test closing on click outside
  await page.click('.apps-btn');
  await new Promise(r => setTimeout(r, 200));
  await page.click('.main-content');
  await new Promise(r => setTimeout(r, 200));
  const isAppsMenuClosedOnClickOutside = await page.evaluate(() => !document.querySelector('.apps-popup'));
  console.log('Apps Menu closed on click outside:', isAppsMenuClosedOnClickOutside);

  // Capture clean header screenshot
  await page.screenshot({ path: 'screenshots/checkpoint_02_header.png' });

  await browser.close();

  const passed = isAppsMenuOpen && isAppsMenuClosedOnEsc && isAppsMenuClosedOnClickOutside;
  console.log('Header tests status:', passed ? 'ALL PASS' : 'FAIL');
  return { headerMetrics, passed };
}

testHeader().catch(console.error);
