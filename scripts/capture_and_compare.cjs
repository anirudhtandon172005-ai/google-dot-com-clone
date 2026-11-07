const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function captureAndCompare(checkpointName = 'checkpoint_01', viewport = { width: 1440, height: 900 }) {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${viewport.width},${viewport.height}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });

  const url = 'http://localhost:3000';
  console.log(`Loading local app from ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const screenshotPath = path.resolve(`screenshots/${checkpointName}_${viewport.width}x${viewport.height}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved screenshot to ${screenshotPath}`);

  // Extract current measurements
  const currentMetrics = await page.evaluate(() => {
    function rect(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) };
    }

    const header = document.querySelector('header') || document.querySelector('.header');
    const logo = document.querySelector('.google-logo') || document.querySelector('svg.ESTs9d') || document.querySelector('svg[aria-label="Google"]') || document.querySelector('.logo-container');
    const searchBar = document.querySelector('.search-bar') || document.querySelector('.RNNXgb');
    const searchInput = document.querySelector('input[name="q"], textarea[name="q"]');
    const buttonsContainer = document.querySelector('.search-buttons');
    const searchBtn = Array.from(document.querySelectorAll('button, input[type="submit"]')).find(b => (b.textContent || b.value || '').includes('Google Search'));
    const luckyBtn = Array.from(document.querySelectorAll('button, input[type="submit"]')).find(b => (b.textContent || b.value || '').includes("I'm Feeling Lucky"));
    const languageLinks = document.querySelector('.language-links');
    const footer = document.querySelector('footer') || document.querySelector('.footer');

    return {
      header: rect(header),
      logo: rect(logo),
      searchBar: rect(searchBar),
      searchInput: rect(searchInput),
      buttonsContainer: rect(buttonsContainer),
      searchBtn: rect(searchBtn),
      luckyBtn: rect(luckyBtn),
      languageLinks: rect(languageLinks),
      footer: rect(footer)
    };
  });

  console.log('Current Metrics:', JSON.stringify(currentMetrics, null, 2));

  // Compare against reference spec if 1440x900
  let comparison = [];
  if (viewport.width === 1440 && fs.existsSync('reference/spec.json')) {
    const spec = JSON.parse(fs.readFileSync('reference/spec.json'));
    const refHeader = { x: 0, y: 0, width: 1440, height: 60 };
    const refLogo = spec.logo?.rect ? {
      x: Math.round(spec.logo.rect.x),
      y: Math.round(spec.logo.rect.y),
      width: Math.round(spec.logo.rect.width),
      height: Math.round(spec.logo.rect.height)
    } : { x: 584, y: 258, width: 272, height: 92 };

    const refSearchBar = spec.searchBar?.styles?.rect ? {
      x: Math.round(spec.searchBar.styles.rect.x),
      y: Math.round(spec.searchBar.styles.rect.y),
      width: Math.round(spec.searchBar.styles.rect.width),
      height: Math.round(spec.searchBar.styles.rect.height)
    } : { x: 428, y: 376, width: 584, height: 50 };

    const refFooter = { x: 0, y: 806, width: 1440, height: 94 };

    function diff(name, refVal, curVal, priority = 'Medium') {
      if (!curVal) {
        return { element: name, reference: JSON.stringify(refVal), current: 'Missing', difference: 'Not Rendered', priority: 'High' };
      }
      const xDiff = curVal.x - refVal.x;
      const yDiff = curVal.y - refVal.y;
      const wDiff = curVal.width - refVal.width;
      const hDiff = curVal.height - refVal.height;
      const hasDiff = xDiff !== 0 || yDiff !== 0 || wDiff !== 0 || hDiff !== 0;
      return {
        element: name,
        reference: `x:${refVal.x}, y:${refVal.y}, w:${refVal.width}, h:${refVal.height}`,
        current: `x:${curVal.x}, y:${curVal.y}, w:${curVal.width}, h:${curVal.height}`,
        difference: hasDiff ? `dx:${xDiff}, dy:${yDiff}, dw:${wDiff}, dh:${hDiff}` : 'Exact Match',
        priority: hasDiff ? (Math.abs(yDiff) > 10 || Math.abs(xDiff) > 10 ? 'High' : 'Medium') : 'None'
      };
    }

    comparison.push(diff('Header', refHeader, currentMetrics.header, 'Medium'));
    comparison.push(diff('Logo', refLogo, currentMetrics.logo, 'High'));
    comparison.push(diff('Search Bar', refSearchBar, currentMetrics.searchBar, 'High'));
    comparison.push(diff('Footer', refFooter, currentMetrics.footer, 'Medium'));
  }

  console.table(comparison);
  fs.writeFileSync(`screenshots/${checkpointName}_mismatch_report.json`, JSON.stringify({ currentMetrics, comparison }, null, 2));

  await browser.close();
  return { currentMetrics, comparison, screenshotPath };
}

if (require.main === module) {
  const cp = process.argv[2] || 'checkpoint_01';
  captureAndCompare(cp).catch(console.error);
}

module.exports = { captureAndCompare };

