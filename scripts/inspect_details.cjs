const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function inspectDetails() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--lang=en-US']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('https://www.google.com/?hl=en', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const details = await page.evaluate(() => {
    // Check all images
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      alt: img.alt,
      src: img.src,
      id: img.id,
      className: img.className,
      rect: img.getBoundingClientRect(),
      computed: {
        width: window.getComputedStyle(img).width,
        height: window.getComputedStyle(img).height,
        margin: window.getComputedStyle(img).margin
      }
    }));

    // Find all SVGs
    const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
      parentTag: svg.parentElement?.tagName,
      parentClass: svg.parentElement?.className,
      parentAria: svg.parentElement?.getAttribute('aria-label'),
      viewBox: svg.getAttribute('viewBox'),
      width: svg.getAttribute('width') || window.getComputedStyle(svg).width,
      height: svg.getAttribute('height') || window.getComputedStyle(svg).height,
      rect: svg.getBoundingClientRect(),
      outerHTML: svg.outerHTML
    }));

    // Find search bar container - let's inspect the element with rounded borders or search input parent chain
    const input = document.querySelector('textarea[name="q"], input[name="q"]');
    const inputChain = [];
    let curr = input;
    while (curr && curr !== document.body) {
      const cs = window.getComputedStyle(curr);
      inputChain.push({
        tag: curr.tagName,
        id: curr.id,
        className: curr.className,
        rect: curr.getBoundingClientRect(),
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        backgroundColor: cs.backgroundColor,
        padding: cs.padding,
        margin: cs.margin,
        display: cs.display,
        width: cs.width,
        height: cs.height
      });
      curr = curr.parentElement;
    }

    // Check footer elements
    const footer = document.querySelector('footer') || Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('About') && d.textContent.includes('Privacy') && d.children.length > 0);
    const footerHTML = footer ? footer.outerHTML : null;

    // Check center section / main section
    const centerSection = inputChain.find(c => c.borderRadius && c.borderRadius !== '0px');

    return {
      images,
      svgs,
      inputChain,
      bodyStyles: {
        backgroundColor: window.getComputedStyle(document.body).backgroundColor,
        fontFamily: window.getComputedStyle(document.body).fontFamily
      }
    };
  });

  fs.writeFileSync('reference/dom_details.json', JSON.stringify(details, null, 2));
  console.log('Saved detailed DOM inspection to reference/dom_details.json');
  await browser.close();
}

inspectDetails().catch(console.error);
