const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--lang=en-US']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('https://www.google.com/?hl=en', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Extract comprehensive specs
  const spec = await page.evaluate(() => {
    function rectOf(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    }

    function stylesOf(el, props = [
      'display', 'flex-direction', 'justify-content', 'align-items',
      'width', 'height', 'margin', 'padding', 'background-color', 'color',
      'border', 'border-radius', 'box-shadow', 'font-family', 'font-size',
      'font-weight', 'line-height', 'letter-spacing', 'text-decoration',
      'cursor', 'gap'
    ]) {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const res = { rect: rectOf(el) };
      for (const p of props) res[p] = cs.getPropertyValue(p);
      return res;
    }

    // Header elements
    const gmail = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Gmail');
    const images = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Images');
    const appsBtn = document.querySelector('a[aria-label*="Google apps"], button[aria-label*="Google apps"]');
    const signInBtn = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.trim() === 'Sign in');

    // Logo
    const logoSvg = document.querySelector('svg.ESTs9d') || document.querySelector('svg[aria-label="Google"]');

    // Search bar
    const searchBar = document.querySelector('.RNNXgb') || document.querySelector('form div[role="combobox"]') || document.querySelector('form');
    const searchInput = document.querySelector('textarea[name="q"], input[name="q"]');
    
    // Search icons inside search bar
    const searchIcon = document.querySelector('.Ty0Rrc svg, .RNNXgb .z1asCe svg');
    const voiceIcon = document.querySelector('.fzj3ad svg, div[aria-label="Search by voice"] svg');
    const lensIcon = document.querySelector('.etxtjc svg, div[aria-label="Search by image"] svg');

    // Action buttons
    const buttons = Array.from(document.querySelectorAll('input[type="submit"], button')).filter(b => {
      const t = b.value || b.textContent || '';
      return t.includes('Google Search') || t.includes("I'm Feeling Lucky");
    });
    const searchBtn = buttons.find(b => (b.value || b.textContent || '').includes('Google Search'));
    const luckyBtn = buttons.find(b => (b.value || b.textContent || '').includes("I'm Feeling Lucky"));
    const buttonsContainer = searchBtn ? searchBtn.closest('div.FPdoLc') || searchBtn.parentElement : null;

    // Languages
    const langSection = document.querySelector('#SIvCob') || Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Google offered in:'));

    // Footer
    const footer = document.querySelector('footer');
    let locationRow = null;
    let linksRow = null;
    if (footer) {
      const divs = Array.from(footer.querySelectorAll('div')).filter(d => d.children.length > 0 && d.parentElement === footer);
      if (divs.length >= 2) {
        locationRow = divs[0];
        linksRow = divs[1];
      }
    }
    const locationText = locationRow ? locationRow.textContent.trim() : null;

    // Footer links
    const footerLinks = footer ? Array.from(footer.querySelectorAll('a')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
      styles: stylesOf(a)
    })) : [];

    return {
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      header: {
        gmail: stylesOf(gmail),
        images: stylesOf(images),
        appsBtn: stylesOf(appsBtn),
        signInBtn: stylesOf(signInBtn)
      },
      logo: {
        rect: rectOf(logoSvg),
        styles: stylesOf(logoSvg),
        svgHTML: logoSvg ? logoSvg.outerHTML : null,
        viewBox: logoSvg ? logoSvg.getAttribute('viewBox') : null
      },
      searchBar: {
        styles: stylesOf(searchBar),
        input: stylesOf(searchInput),
        icons: {
          search: { svg: searchIcon ? searchIcon.outerHTML : null, styles: stylesOf(searchIcon) },
          voice: { svg: voiceIcon ? voiceIcon.outerHTML : null, styles: stylesOf(voiceIcon) },
          lens: { svg: lensIcon ? lensIcon.outerHTML : null, styles: stylesOf(lensIcon) }
        }
      },
      buttons: {
        container: stylesOf(buttonsContainer),
        searchBtn: {
          text: searchBtn ? (searchBtn.value || searchBtn.textContent) : null,
          styles: stylesOf(searchBtn)
        },
        luckyBtn: {
          text: luckyBtn ? (luckyBtn.value || luckyBtn.textContent) : null,
          styles: stylesOf(luckyBtn)
        }
      },
      languages: {
        text: langSection ? langSection.textContent.trim() : null,
        styles: stylesOf(langSection),
        links: langSection ? Array.from(langSection.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          styles: stylesOf(a)
        })) : []
      },
      footer: {
        styles: stylesOf(footer),
        locationRow: {
          text: locationText,
          styles: stylesOf(locationRow)
        },
        linksRow: stylesOf(linksRow),
        links: footerLinks
      }
    };
  });

  fs.writeFileSync('reference/spec.json', JSON.stringify(spec, null, 2));
  console.log('Saved detailed spec to reference/spec.json');

  // Hover states inspection
  // Find search button
  const buttonsHandles = await page.$$('input[type="submit"], button, input[name="btnK"]');
  let searchBtnHandle = null;
  for (const b of buttonsHandles) {
    const val = await page.evaluate(el => el.value || el.textContent, b);
    if (val && val.includes('Google Search')) {
      searchBtnHandle = b;
      break;
    }
  }

  let searchBtnHoverStyles = null;
  if (searchBtnHandle) {
    await searchBtnHandle.hover();
    await new Promise(r => setTimeout(r, 300));
    searchBtnHoverStyles = await page.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        border: cs.border,
        boxShadow: cs.boxShadow,
        color: cs.color
      };
    }, searchBtnHandle);
    await page.screenshot({ path: 'reference/search_button_hover.png' });
  }

  // Hover on Search Bar
  const searchBarHandle = await page.$('.RNNXgb');
  let searchBarHoverStyles = null;
  if (searchBarHandle) {
    await searchBarHandle.hover();
    await new Promise(r => setTimeout(r, 300));
    searchBarHoverStyles = await page.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        border: cs.border,
        boxShadow: cs.boxShadow
      };
    }, searchBarHandle);
    await page.screenshot({ path: 'reference/search_bar_hover.png' });
  }

  // Focus on search input
  const inputHandle = await page.$('textarea[name="q"], input[name="q"]');
  if (inputHandle) {
    await inputHandle.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'reference/search_bar_focus.png' });
  }

  // Click Google apps menu
  const appsBtnHandle = await page.$('a[aria-label*="Google apps"], button[aria-label*="Google apps"]');
  let appsMenuData = null;
  if (appsBtnHandle) {
    await appsBtnHandle.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'reference/apps_menu_open.png' });
    appsMenuData = await page.evaluate(() => {
      // Find opened dialog/menu or iframe
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
        src: f.src,
        title: f.title,
        rect: f.getBoundingClientRect()
      }));
      const popups = Array.from(document.querySelectorAll('div[role="region"], div[role="dialog"], .gb_Ca, .gb_Da')).map(p => ({
        html: p.innerHTML.slice(0, 500),
        rect: p.getBoundingClientRect()
      }));
      return { iframes, popups };
    });
  }

  fs.writeFileSync('reference/hover_and_interaction.json', JSON.stringify({
    searchBtnHoverStyles,
    searchBarHoverStyles,
    appsMenuData
  }, null, 2));

  await browser.close();
  console.log('Full reference inspection complete!');
}

run().catch(console.error);
