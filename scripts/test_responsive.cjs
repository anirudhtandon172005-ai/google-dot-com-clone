const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const BREAKPOINTS = [
  { name: '1366x768', width: 1366, height: 768, isMobile: false },
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '768x1024', width: 768, height: 1024, isMobile: false },
  { name: '390x844', width: 390, height: 844, isMobile: true }
];

async function testResponsive() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = [];

  for (const bp of BREAKPOINTS) {
    console.log(`Testing breakpoint ${bp.name}...`);
    await page.setViewport({
      width: bp.width,
      height: bp.height,
      deviceScaleFactor: 1,
      isMobile: bp.isMobile,
      hasTouch: bp.isMobile
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const screenshotPath = path.resolve(`screenshots/checkpoint_07_${bp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved screenshot to ${screenshotPath}`);

    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const hasHorizontalScroll = scrollWidth > innerWidth;

      const logo = document.querySelector('.google-logo-svg');
      const searchBar = document.querySelector('.search-bar');
      const footer = document.querySelector('.footer');

      const logoRect = logo?.getBoundingClientRect();
      const searchRect = searchBar?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();

      return {
        hasHorizontalScroll,
        scrollWidth,
        innerWidth,
        logo: logoRect ? { x: Math.round(logoRect.x), width: Math.round(logoRect.width) } : null,
        searchBar: searchRect ? { x: Math.round(searchRect.x), width: Math.round(searchRect.width) } : null,
        footer: footerRect ? { y: Math.round(footerRect.y), height: Math.round(footerRect.height) } : null
      };
    });

    // Check if horizontal centering is maintained
    const isLogoCentered = metrics.logo ? Math.abs((bp.width - metrics.logo.width) / 2 - metrics.logo.x) <= 2 : false;
    const isSearchCentered = metrics.searchBar ? Math.abs((bp.width - metrics.searchBar.width) / 2 - metrics.searchBar.x) <= 2 : false;

    results.push({
      breakpoint: bp.name,
      viewport: `${bp.width}x${bp.height}`,
      noHorizontalScroll: !metrics.hasHorizontalScroll,
      isLogoCentered,
      isSearchCentered,
      passed: !metrics.hasHorizontalScroll && isLogoCentered && isSearchCentered
    });
  }

  console.table(results);
  await browser.close();

  const allPassed = results.every(r => r.passed);
  console.log('Responsive testing status:', allPassed ? 'ALL PASS' : 'FAIL');
  return { results, allPassed };
}

testResponsive().catch(console.error);
