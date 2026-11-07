const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function testFooterAndLanguage() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Measure Footer & Language
  const metrics = await page.evaluate(() => {
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
        borderBottom: cs.borderBottom,
        fontSize: cs.fontSize
      };
    }

    const langSection = document.querySelector('.language-links');
    const langLinks = Array.from(document.querySelectorAll('.lang-link')).map(a => a.textContent.trim());
    const footer = document.querySelector('.footer');
    const location = document.querySelector('.footer-location');
    const footerLinks = Array.from(document.querySelectorAll('.footer-link')).map(a => a.textContent.trim());

    return {
      langSection: rect(langSection),
      langCount: langLinks.length,
      langLinks,
      footer: rect(footer),
      location: rect(location),
      footerLinks
    };
  });

  console.log('Footer & Language Metrics:', metrics);

  // 2. Test Settings popup
  console.log('Testing Settings menu popup...');
  await page.click('.settings-btn');
  await new Promise(r => setTimeout(r, 200));

  const isSettingsOpen = await page.evaluate(() => !!document.querySelector('.settings-menu'));
  const settingsItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.settings-item')).map(el => el.textContent.trim());
  });
  console.log('Settings menu open:', isSettingsOpen);
  console.log('Settings items:', settingsItems);
  await page.screenshot({ path: 'screenshots/checkpoint_05_settings_open.png' });

  // 3. Test closing Settings menu on Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 200));
  const isSettingsClosedOnEsc = await page.evaluate(() => !document.querySelector('.settings-menu'));
  console.log('Settings closed on Escape:', isSettingsClosedOnEsc);

  // 4. Test closing Settings menu on click outside
  await page.click('.settings-btn');
  await new Promise(r => setTimeout(r, 200));
  await page.click('.main-content');
  await new Promise(r => setTimeout(r, 200));
  const isSettingsClosedOnClickOutside = await page.evaluate(() => !document.querySelector('.settings-menu'));
  console.log('Settings closed on click outside:', isSettingsClosedOnClickOutside);

  await page.screenshot({ path: 'screenshots/checkpoint_05_footer.png' });

  await browser.close();

  const passed =
    metrics.footer.y === 806 &&
    metrics.footer.height === 94 &&
    metrics.langCount === 9 &&
    isSettingsOpen &&
    isSettingsClosedOnEsc &&
    isSettingsClosedOnClickOutside &&
    settingsItems.length >= 6;

  console.log('Footer & Language test status:', passed ? 'ALL PASS' : 'FAIL');
  return { metrics, passed };
}

testFooterAndLanguage().catch(console.error);

