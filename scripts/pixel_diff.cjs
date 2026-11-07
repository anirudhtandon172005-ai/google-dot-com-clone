const fs = require('fs');
const puppeteer = require('/Users/anirudhtandon/.local/lib/node_modules/puppeteer');

async function compareVisuals() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load both screenshots into canvas in a helper page to compute difference
  const refBuf = fs.readFileSync('reference/google_reference_1440x900.png');
  const curBuf = fs.readFileSync('screenshots/checkpoint_05_1440x900.png');

  const refB64 = 'data:image/png;base64,' + refBuf.toString('base64');
  const curB64 = 'data:image/png;base64,' + curBuf.toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><style>body { margin: 0; background: #000; }</style></head>
      <body>
        <canvas id="c1" width="1440" height="900"></canvas>
        <canvas id="c2" width="1440" height="900"></canvas>
        <canvas id="diff" width="1440" height="900"></canvas>
      </body>
    </html>
  `);

  const diffResult = await page.evaluate(async (img1Src, img2Src) => {
    function loadImg(src) {
      return new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
    }

    const [img1, img2] = await Promise.all([loadImg(img1Src), loadImg(img2Src)]);

    const c1 = document.getElementById('c1');
    const ctx1 = c1.getContext('2d');
    ctx1.drawImage(img1, 0, 0);

    const c2 = document.getElementById('c2');
    const ctx2 = c2.getContext('2d');
    ctx2.drawImage(img2, 0, 0);

    const data1 = ctx1.getImageData(0, 0, 1440, 900).data;
    const data2 = ctx2.getImageData(0, 0, 1440, 900).data;

    const diffCanvas = document.getElementById('diff');
    const diffCtx = diffCanvas.getContext('2d');
    const diffImgData = diffCtx.createImageData(1440, 900);
    const diffData = diffImgData.data;

    let totalPixels = 1440 * 900;
    let diffPixels = 0;
    let sumDelta = 0;

    for (let i = 0; i < data1.length; i += 4) {
      const dr = Math.abs(data1[i] - data2[i]);
      const dg = Math.abs(data1[i + 1] - data2[i + 1]);
      const db = Math.abs(data1[i + 2] - data2[i + 2]);
      const delta = (dr + dg + db) / 3;

      if (delta > 15) { // threshold for anti-aliasing / font rendering tolerance
        diffPixels++;
        sumDelta += delta;
        // highlight difference in red
        diffData[i] = 255;
        diffData[i + 1] = 0;
        diffData[i + 2] = 0;
        diffData[i + 3] = 255;
      } else {
        diffData[i] = data2[i];
        diffData[i + 1] = data2[i + 1];
        diffData[i + 2] = data2[i + 2];
        diffData[i + 3] = 40; // dimmed original
      }
    }

    diffCtx.putImageData(diffImgData, 0, 0);
    const diffDataUrl = diffCanvas.toDataURL('image/png');

    return {
      totalPixels,
      diffPixels,
      matchPercentage: (((totalPixels - diffPixels) / totalPixels) * 100).toFixed(2),
      diffDataUrl
    };
  }, refB64, curB64);

  console.log('Visual Match Percentage:', diffResult.matchPercentage + '%');
  console.log('Differing pixels (beyond AA threshold):', diffResult.diffPixels, '/', diffResult.totalPixels);

  // Save diff image
  const base64Data = diffResult.diffDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('screenshots/checkpoint_06_diff_overlay.png', base64Data, 'base64');
  console.log('Saved visual diff overlay to screenshots/checkpoint_06_diff_overlay.png');

  await browser.close();
}

compareVisuals().catch(console.error);

