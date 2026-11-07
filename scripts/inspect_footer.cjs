const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');
const fs = require('fs');

async function inspectFooterAndButtons() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900', '--lang=en-US']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('https://www.google.com/?hl=en', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    function rectOf(el) {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    }

    function stylesOf(el) {
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      return {
        rect: rectOf(el),
        display: cs.display,
        flexDirection: cs.flexDirection,
        justifyContent: cs.justifyContent,
        alignItems: cs.alignItems,
        width: cs.width,
        height: cs.height,
        margin: cs.margin,
        padding: cs.padding,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
        borderTop: cs.borderTop,
        borderBottom: cs.borderBottom,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        cursor: cs.cursor,
        gap: cs.gap,
        position: cs.position,
        bottom: cs.bottom
      };
    }

    // Inspect buttons inside the main form
    const centerButtons = Array.from(document.querySelectorAll('center input, .FPdoLc input, form input[type="submit"]')).map(btn => ({
      value: btn.value,
      name: btn.name,
      styles: stylesOf(btn),
      parentStyles: stylesOf(btn.parentElement)
    }));

    // Find footer element
    // Let's search by text: "About", "Advertising", "Business", "Privacy", "Terms", "Settings"
    const allLinks = Array.from(document.querySelectorAll('a'));
    const footerLinkTexts = ['About', 'Advertising', 'Business', 'How Search works', 'Privacy', 'Terms', 'Settings'];
    const foundFooterLinks = allLinks.filter(a => footerLinkTexts.includes(a.textContent.trim()));
    
    // Find common container for these links
    let footerContainer = null;
    if (foundFooterLinks.length > 0) {
      let p = foundFooterLinks[0].parentElement;
      while (p && p !== document.body) {
        if (p.textContent.includes('About') && p.textContent.includes('Privacy')) {
          footerContainer = p;
        }
        p = p.parentElement;
      }
    }

    // Inspect footer children
    const footerInfo = {
      container: stylesOf(footerContainer),
      containerClass: footerContainer?.className,
      containerTag: footerContainer?.tagName,
      children: footerContainer ? Array.from(footerContainer.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        text: c.textContent.trim(),
        styles: stylesOf(c),
        links: Array.from(c.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href,
          styles: stylesOf(a)
        }))
      })) : []
    };

    return {
      centerButtons,
      footer: footerInfo
    };
  });

  fs.writeFileSync('reference/footer_and_buttons.json', JSON.stringify(result, null, 2));
  console.log('Saved footer and buttons inspection to reference/footer_and_buttons.json');

  // Let's test hover on the actual visible search button
  const searchInputs = await page.$$('input[name="btnK"]');
  for (const si of searchInputs) {
    const isVisible = await page.evaluate(el => el.getBoundingClientRect().width > 0, si);
    if (isVisible) {
      console.log('Hovering over visible search button...');
      await si.hover();
      await new Promise(r => setTimeout(r, 300));
      const hoverStyles = await page.evaluate(el => {
        const cs = window.getComputedStyle(el);
        return {
          backgroundColor: cs.backgroundColor,
          border: cs.border,
          boxShadow: cs.boxShadow,
          color: cs.color
        };
      }, si);
      console.log('Button hover styles:', hoverStyles);
      fs.writeFileSync('reference/button_hover_styles.json', JSON.stringify(hoverStyles, null, 2));
      break;
    }
  }

  // Hover on Search Bar
  const searchBar = await page.$('.RNNXgb');
  if (searchBar) {
    await searchBar.hover();
    await new Promise(r => setTimeout(r, 300));
    const sbHover = await page.evaluate(el => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        border: cs.border,
        boxShadow: cs.boxShadow
      };
    }, searchBar);
    console.log('Search bar hover styles:', sbHover);
    fs.writeFileSync('reference/search_bar_hover_styles.json', JSON.stringify(sbHover, null, 2));
  }

  // Apps menu inspection
  const appsBtn = await page.$('a[aria-label*="Google apps"], button[aria-label*="Google apps"]');
  if (appsBtn) {
    await appsBtn.click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: 'reference/apps_menu_popup.png' });
    const appsData = await page.evaluate(() => {
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
        src: f.src,
        name: f.name,
        rect: f.getBoundingClientRect()
      }));
      return { iframes };
    });
    fs.writeFileSync('reference/apps_menu_inspection.json', JSON.stringify(appsData, null, 2));
    console.log('Captured apps menu popup!');
  }

  await browser.close();
}

inspectFooterAndButtons().catch(console.error);
