const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

async function inspect() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-size=1440,900',
      '--lang=en-US'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Navigating to https://www.google.com/?hl=en ...');
  await page.goto('https://www.google.com/?hl=en', { waitUntil: 'networkidle2' });

  // Dismiss any consent dialog if present
  try {
    const consentButtons = await page.$$('button');
    for (const btn of consentButtons) {
      const text = await (await btn.getProperty('textContent')).jsonValue();
      if (text.includes('Accept all') || text.includes('Reject all') || text.includes('I agree') || text.includes('Stay signed out')) {
        console.log('Clicking button:', text);
        await btn.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
  } catch (e) {
    console.log('No consent dialog detected or already handled');
  }

  // Also check if there's an iframe for sign-in or stay signed out
  try {
    const frames = page.frames();
    for (const frame of frames) {
      const staySignedOutBtn = await frame.$('button:has-text("Stay signed out")');
      if (staySignedOutBtn) {
        console.log('Found Stay signed out button in frame');
        await staySignedOutBtn.click();
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch (e) {}

  await new Promise(r => setTimeout(r, 2000));

  // Capture reference screenshot
  const refPath = path.resolve('reference/google_reference_1440x900.png');
  await page.screenshot({ path: refPath, fullPage: false });
  console.log('Saved screenshot to', refPath);

  // Inspect page details
  const inspection = await page.evaluate(() => {
    function getStyles(el, props) {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const res = {};
      props.forEach(p => res[p] = cs.getPropertyValue(p));
      const rect = el.getBoundingClientRect();
      res.rect = {
        x: rect.x,
        y: rect.y,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right
      };
      return res;
    }

    const keyProps = [
      'display', 'flex-direction', 'justify-content', 'align-items',
      'width', 'height', 'max-width', 'min-width',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'background-color', 'color', 'border', 'border-radius',
      'box-shadow', 'font-family', 'font-size', 'font-weight', 'line-height',
      'letter-spacing', 'text-align', 'position', 'top', 'right', 'bottom', 'left',
      'z-index', 'opacity', 'cursor', 'visibility', 'gap'
    ];

    // Find main components
    // 1. Header
    const headerEl = document.querySelector('header') || document.querySelector('#gb') || document.querySelector('.gb_h') || document.querySelector('#header');
    
    // Header links
    const gmailLink = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Gmail' || a.href.includes('mail.google.com'));
    const imagesLink = Array.from(document.querySelectorAll('a')).find(a => a.textContent.trim() === 'Images' || a.href.includes('imghp'));
    const appsBtn = document.querySelector('a[aria-label*="Google apps"], button[aria-label*="Google apps"], a[title*="Google apps"]');
    const signInBtn = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.trim() === 'Sign in' || el.getAttribute('aria-label')?.includes('Sign in'));

    // 2. Logo
    const logoImg = document.querySelector('img[alt="Google"]') || document.querySelector('#hplogo') || document.querySelector('img[src*="logo"]') || document.querySelector('.lnXdpd');

    // 3. Search Bar / Form
    const searchForm = document.querySelector('form[role="search"]') || document.querySelector('form');
    const searchBarContainer = document.querySelector('div[jscontroller]') || searchForm?.querySelector('div');
    const searchInput = document.querySelector('textarea[name="q"], input[name="q"]');
    
    // Find search bar outer wrapper
    let searchBarWrapper = null;
    if (searchInput) {
      let p = searchInput.parentElement;
      while (p && p !== document.body && p.getBoundingClientRect().height < 60) {
        if (p.getBoundingClientRect().height >= 40 && p.getBoundingClientRect().width > 300) {
          searchBarWrapper = p;
          break;
        }
        p = p.parentElement;
      }
    }

    // Search bar icons
    const searchIconSvgs = searchBarWrapper ? Array.from(searchBarWrapper.querySelectorAll('svg')).map(svg => ({
      html: svg.outerHTML,
      viewBox: svg.getAttribute('viewBox'),
      rect: svg.getBoundingClientRect()
    })) : [];

    // 4. Buttons
    const buttons = Array.from(document.querySelectorAll('input[type="submit"], button')).filter(b => {
      const val = b.value || b.textContent || '';
      return val.includes('Google Search') || val.includes("I'm Feeling Lucky");
    });

    const searchBtn = buttons.find(b => (b.value || b.textContent || '').includes('Google Search'));
    const luckyBtn = buttons.find(b => (b.value || b.textContent || '').includes("I'm Feeling Lucky"));

    // 5. Language section
    const langDiv = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Google offered in:') || d.textContent.includes('Google offered in'));

    // 6. Footer
    const footerEl = document.querySelector('footer') || document.querySelector('#fbar') || Array.from(document.querySelectorAll('div')).reverse().find(d => d.textContent.includes('About') && d.textContent.includes('Privacy'));
    
    // Footer rows
    const footerRows = footerEl ? Array.from(footerEl.children).map(child => ({
      tagName: child.tagName,
      className: child.className,
      text: child.textContent.trim(),
      styles: getStyles(child, keyProps)
    })) : [];

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      body: getStyles(document.body, ['background-color', 'color', 'font-family', 'font-size', 'line-height', 'margin', 'padding']),
      header: {
        container: getStyles(headerEl, keyProps),
        gmail: getStyles(gmailLink, keyProps),
        images: getStyles(imagesLink, keyProps),
        appsBtn: getStyles(appsBtn, keyProps),
        appsBtnSvg: appsBtn?.querySelector('svg')?.outerHTML,
        signInBtn: getStyles(signInBtn, keyProps)
      },
      logo: {
        tag: logoImg?.tagName,
        src: logoImg?.src,
        srcset: logoImg?.srcset,
        alt: logoImg?.alt,
        width: logoImg?.width,
        height: logoImg?.height,
        naturalWidth: logoImg?.naturalWidth,
        naturalHeight: logoImg?.naturalHeight,
        styles: getStyles(logoImg, keyProps),
        parentStyles: getStyles(logoImg?.parentElement, keyProps)
      },
      searchBar: {
        wrapper: getStyles(searchBarWrapper, keyProps),
        input: getStyles(searchInput, keyProps),
        inputAttributes: {
          name: searchInput?.name,
          type: searchInput?.tagName.toLowerCase() === 'textarea' ? 'textarea' : searchInput?.type,
          placeholder: searchInput?.placeholder,
          title: searchInput?.title,
          ariaLabel: searchInput?.getAttribute('aria-label')
        },
        icons: searchIconSvgs
      },
      buttons: {
        container: getStyles(searchBtn?.parentElement, keyProps),
        searchBtn: getStyles(searchBtn, keyProps),
        searchBtnText: searchBtn?.value || searchBtn?.textContent,
        luckyBtn: getStyles(luckyBtn, keyProps),
        luckyBtnText: luckyBtn?.value || luckyBtn?.textContent
      },
      language: {
        element: getStyles(langDiv, keyProps),
        html: langDiv?.innerHTML,
        text: langDiv?.textContent?.trim()
      },
      footer: {
        container: getStyles(footerEl, keyProps),
        rows: footerRows
      }
    };
  });

  fs.writeFileSync('reference/inspection_data.json', JSON.stringify(inspection, null, 2));
  console.log('Saved inspection data to reference/inspection_data.json');

  // Let's capture other breakpoints as requested
  const breakpoints = [
    { name: '1366x768', width: 1366, height: 768 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '390x844', width: 390, height: 844, isMobile: true }
  ];

  for (const bp of breakpoints) {
    await page.setViewport({
      width: bp.width,
      height: bp.height,
      deviceScaleFactor: 1,
      isMobile: !!bp.isMobile,
      hasTouch: !!bp.isMobile
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `reference/google_reference_${bp.name}.png` });
    console.log(`Saved screenshot for ${bp.name}`);
  }

  await browser.close();
  console.log('Reference inspection complete!');
}

inspect().catch(err => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
