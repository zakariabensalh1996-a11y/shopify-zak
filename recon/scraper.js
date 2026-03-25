/**
 * Mason's Site Full Reconnaissance Script
 * Renders all pages with Playwright, extracts:
 *  - Full rendered DOM (post-JS)
 *  - Computed CSS custom properties
 *  - Section structure with data attributes
 *  - Navigation structure (header + footer)
 *  - All fonts, images, colors
 *  - Full-page screenshots at 1440px and 375px
 *  - Third-party script inventory
 *
 * Output: recon/output/ folder
 *
 * Run: node recon/scraper.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = 'https://us.masons.it/fr';
const OUTPUT_DIR = path.join(__dirname, 'output');
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'mobile',  width: 375,  height: 812 },
];

const PAGES = [
  { slug: '',                        name: 'homepage' },
  { slug: '/collections',            name: 'collection-list' },
  { slug: '/collections/homme',      name: 'collection-homme' },
  { slug: '/collections/femme',      name: 'collection-femme' },
  { slug: '/cart',                   name: 'cart' },
  { slug: '/pages/faq',              name: 'page-faq' },
  { slug: '/blogs',                  name: 'blog-index' },
  { slug: '/search',                 name: 'search' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, data) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  console.log(`  ✓ Wrote ${path.relative(OUTPUT_DIR, filePath)}`);
}

// ─── Extraction functions (run inside browser context) ───────────────────────
async function extractPageData(page) {
  return await page.evaluate(() => {
    const data = {};

    // 1. CSS Custom Properties from :root
    data.cssVars = {};
    const sheets = document.styleSheets;
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (const rule of rules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const name = style[i];
              if (name.startsWith('--')) {
                data.cssVars[name] = style.getPropertyValue(name).trim();
              }
            }
          }
        }
      } catch (e) { /* cross-origin stylesheet */ }
    }

    // Also get computed vars from body
    const computed = getComputedStyle(document.body);
    const computedVars = {};
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      if (prop.startsWith('--')) {
        computedVars[prop] = computed.getPropertyValue(prop).trim();
      }
    }
    data.computedVars = computedVars;

    // 2. Sections
    data.sections = [];
    const sectionEls = document.querySelectorAll('.shopify-section, [data-section-type], section');
    sectionEls.forEach((el, i) => {
      const section = {
        index: i,
        id: el.id || null,
        sectionType: el.dataset.sectionType || null,
        classes: el.className,
        dataAttrs: {},
        innerHTML_preview: el.innerHTML.slice(0, 500),
        children_count: el.children.length,
        computedBg: getComputedStyle(el).backgroundColor,
        computedColor: getComputedStyle(el).color,
        computedPaddingTop: getComputedStyle(el).paddingTop,
        computedPaddingBottom: getComputedStyle(el).paddingBottom,
      };
      for (const attr of el.attributes) {
        if (attr.name.startsWith('data-')) {
          section.dataAttrs[attr.name] = attr.value;
        }
      }
      data.sections.push(section);
    });

    // 3. Navigation — Header
    data.header = {};
    const headerEl = document.querySelector('header, #header, [data-section-type="header"], header-component');
    if (headerEl) {
      data.header.html = headerEl.innerHTML.slice(0, 5000);
      data.header.links = Array.from(headerEl.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href,
      })).filter(l => l.text);
      data.header.computedHeight = getComputedStyle(headerEl).height;
      data.header.computedBg = getComputedStyle(headerEl).backgroundColor;
    }

    // 4. Navigation — Footer
    data.footer = {};
    const footerEl = document.querySelector('footer, #footer, [data-section-type="footer"]');
    if (footerEl) {
      data.footer.html = footerEl.innerHTML.slice(0, 5000);
      data.footer.links = Array.from(footerEl.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.href,
      })).filter(l => l.text);
    }

    // 5. Fonts
    data.fonts = [];
    for (const font of document.fonts) {
      data.fonts.push({
        family: font.family,
        weight: font.weight,
        style: font.style,
        status: font.status,
      });
    }

    // 6. All images
    data.images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      loading: img.loading,
    }));

    // 7. All headings and key text
    data.headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
      tag: h.tagName,
      text: h.textContent.trim(),
      computedSize: getComputedStyle(h).fontSize,
      computedWeight: getComputedStyle(h).fontWeight,
      computedFamily: getComputedStyle(h).fontFamily,
      computedColor: getComputedStyle(h).color,
      computedTransform: getComputedStyle(h).textTransform,
      computedTracking: getComputedStyle(h).letterSpacing,
    }));

    // 8. Buttons
    data.buttons = Array.from(document.querySelectorAll('button, .btn, [class*="button"], a[class*="btn"]')).slice(0, 50).map(btn => ({
      text: btn.textContent.trim(),
      classes: btn.className,
      computedBg: getComputedStyle(btn).backgroundColor,
      computedColor: getComputedStyle(btn).color,
      computedBorder: getComputedStyle(btn).border,
      computedRadius: getComputedStyle(btn).borderRadius,
      computedPadding: getComputedStyle(btn).padding,
      computedFont: getComputedStyle(btn).fontFamily,
      computedSize: getComputedStyle(btn).fontSize,
    }));

    // 9. Third-party scripts
    data.scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
      .filter(src => !src.includes('cdn.shopify.com/s/trekkie') && src.length > 0);

    // 10. Color scheme classes
    data.colorSchemes = Array.from(document.querySelectorAll('[class*="color-scheme"], [class*="scheme-"]')).slice(0, 30).map(el => ({
      classes: el.className,
      tag: el.tagName,
      computedBg: getComputedStyle(el).backgroundColor,
      computedColor: getComputedStyle(el).color,
    }));

    // 11. Announcement bar
    const announcementBar = document.querySelector('[data-section-type="announcement-bar"], .announcement-bar, header-announcements, .header-announcements');
    data.announcementBar = announcementBar ? {
      html: announcementBar.innerHTML.slice(0, 1000),
      text: announcementBar.textContent.trim(),
      computedBg: getComputedStyle(announcementBar).backgroundColor,
      computedColor: getComputedStyle(announcementBar).color,
    } : null;

    // 12. Computed styles for body
    const bodyStyle = getComputedStyle(document.body);
    data.bodyStyles = {
      backgroundColor: bodyStyle.backgroundColor,
      color: bodyStyle.color,
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize,
      lineHeight: bodyStyle.lineHeight,
    };

    return data;
  });
}

async function extractProductPage(page) {
  return await page.evaluate(() => {
    const data = {};

    // Product title
    data.title = document.querySelector('h1')?.textContent.trim();

    // Price
    data.price = document.querySelector('[class*="price"]')?.textContent.trim();

    // Variants
    data.variants = Array.from(document.querySelectorAll('[class*="variant"], [class*="swatch"], select option')).slice(0, 30).map(el => ({
      text: el.textContent.trim(),
      classes: el.className,
      tag: el.tagName,
    }));

    // Product description
    data.description = document.querySelector('[class*="description"], .product__description')?.innerHTML?.slice(0, 2000);

    // Images
    data.mediaGallery = Array.from(document.querySelectorAll('[class*="gallery"] img, [class*="media"] img')).map(img => ({
      src: img.src,
      alt: img.alt,
    }));

    // Add to cart button
    const atcBtn = document.querySelector('[name="add"], [class*="add-to-cart"]');
    data.addToCartBtn = atcBtn ? {
      text: atcBtn.textContent.trim(),
      classes: atcBtn.className,
      computedBg: getComputedStyle(atcBtn).backgroundColor,
      computedColor: getComputedStyle(atcBtn).color,
      computedRadius: getComputedStyle(atcBtn).borderRadius,
    } : null;

    // Size guide
    data.sizeGuide = document.querySelector('[class*="size-guide"], [href*="size"]')?.textContent.trim();

    return data;
  });
}

async function getFirstProductUrl(page, baseUrl) {
  await page.goto(`${baseUrl}/collections/homme`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  return await page.evaluate(() => {
    const link = document.querySelector('a[href*="/products/"]');
    return link ? link.href : null;
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, 'screenshots'));
  ensureDir(path.join(OUTPUT_DIR, 'dom'));

  console.log('\n🔍 Mason\'s Site Reconnaissance\n');

  const browser = await chromium.launch({ headless: true });
  const allData = {};

  // ── Scrape each page ──
  for (const pageConfig of PAGES) {
    const url = `${BASE_URL}${pageConfig.slug}`;
    console.log(`\n📄 Scraping: ${pageConfig.name} → ${url}`);

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    });
    const p = await context.newPage();

    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Wait for JS hydration (Horizon is CSR-heavy)
      await p.waitForTimeout(4000);

      // Extract data
      const extracted = await extractPageData(p);
      extracted.url = url;
      extracted.name = pageConfig.name;

      // Get full HTML
      extracted.fullHTML = await p.content();

      allData[pageConfig.name] = extracted;
      write(path.join(OUTPUT_DIR, 'dom', `${pageConfig.name}.json`), extracted);

      // Write HTML separately
      write(path.join(OUTPUT_DIR, 'dom', `${pageConfig.name}.html`), extracted.fullHTML);
      delete extracted.fullHTML; // remove from JSON to keep it small

      // Screenshots at all viewports
      for (const vp of VIEWPORTS) {
        await p.setViewportSize({ width: vp.width, height: vp.height });
        await p.waitForTimeout(500);
        const ssPath = path.join(OUTPUT_DIR, 'screenshots', `${pageConfig.name}--${vp.name}.png`);
        await p.screenshot({ path: ssPath, fullPage: true });
        console.log(`  📸 Screenshot saved: ${pageConfig.name}--${vp.name}.png`);
      }

    } catch (err) {
      console.error(`  ✗ Error on ${pageConfig.name}: ${err.message}`);
      allData[pageConfig.name] = { error: err.message, url };
    }

    try { await context.close(); } catch (_) {}
  }

  // ── Scrape a product page ──
  console.log('\n📄 Finding and scraping a product page...');
  const context2 = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  const p2 = await context2.newPage();
  try {
    const productUrl = await getFirstProductUrl(p2, BASE_URL);
    if (productUrl) {
      console.log(`  → Product URL: ${productUrl}`);
      await p2.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await p2.waitForTimeout(4000);

      const productData = await extractPageData(p2);
      const productSpecific = await extractProductPage(p2);
      productData.productSpecific = productSpecific;
      productData.url = productUrl;
      productData.fullHTML = await p2.content();

      allData['product'] = productData;
      write(path.join(OUTPUT_DIR, 'dom', 'product.json'), productData);
      write(path.join(OUTPUT_DIR, 'dom', 'product.html'), productData.fullHTML);
      delete productData.fullHTML;

      for (const vp of VIEWPORTS) {
        await p2.setViewportSize({ width: vp.width, height: vp.height });
        await p2.waitForTimeout(500);
        await p2.screenshot({
          path: path.join(OUTPUT_DIR, 'screenshots', `product--${vp.name}.png`),
          fullPage: true
        });
        console.log(`  📸 Screenshot saved: product--${vp.name}.png`);
      }
    }
  } catch (err) {
    console.error(`  ✗ Error on product page: ${err.message}`);
  }
  try { await context2.close(); } catch (_) {}

  // ── Scrape a collection page with products ──
  console.log('\n📄 Scraping collection page with full product grid...');
  const context3 = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  const p3 = await context3.newPage();
  try {
    await p3.goto(`${BASE_URL}/collections/homme`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await p3.waitForTimeout(4000);

    // Scroll to trigger lazy load
    await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await p3.waitForTimeout(1500);
    await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p3.waitForTimeout(1500);

    const collectionData = await extractPageData(p3);
    collectionData.fullHTML = await p3.content();

    // Extract product cards
    collectionData.productCards = await p3.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="product-card"], [class*="card-product"], .grid__item')).slice(0, 10).map(card => ({
        html: card.innerHTML.slice(0, 800),
        classes: card.className,
        computedWidth: getComputedStyle(card).width,
        computedBg: getComputedStyle(card).backgroundColor,
        computedRadius: getComputedStyle(card).borderRadius,
        computedPadding: getComputedStyle(card).padding,
      }));
    });

    write(path.join(OUTPUT_DIR, 'dom', 'collection-homme.json'), collectionData);
    write(path.join(OUTPUT_DIR, 'dom', 'collection-homme.html'), collectionData.fullHTML);
    delete collectionData.fullHTML;

    for (const vp of VIEWPORTS) {
      await p3.setViewportSize({ width: vp.width, height: vp.height });
      await p3.waitForTimeout(500);
      await p3.screenshot({
        path: path.join(OUTPUT_DIR, 'screenshots', `collection-homme--${vp.name}.png`),
        fullPage: true
      });
      console.log(`  📸 Screenshot saved: collection-homme--${vp.name}.png`);
    }
  } catch (err) {
    console.error(`  ✗ Error on collection page: ${err.message}`);
  }
  try { await context3.close(); } catch (_) {}

  // ── Summary Report ──
  console.log('\n📊 Generating summary report...');

  const summary = {
    scrapedAt: new Date().toISOString(),
    totalPages: Object.keys(allData).length,
    pages: Object.keys(allData).map(name => ({
      name,
      url: allData[name].url,
      sectionsFound: allData[name].sections?.length || 0,
      imagesFound: allData[name].images?.length || 0,
      scriptsFound: allData[name].scripts?.length || 0,
      cssVarsFound: Object.keys(allData[name].cssVars || {}).length,
      error: allData[name].error || null,
    })),
    globalCssVars: allData['homepage']?.cssVars || {},
    globalComputedVars: allData['homepage']?.computedVars || {},
    fonts: allData['homepage']?.fonts || [],
    bodyStyles: allData['homepage']?.bodyStyles || {},
    announcementBar: allData['homepage']?.announcementBar || null,
    navigationLinks: allData['homepage']?.header?.links || [],
    footerLinks: allData['homepage']?.footer?.links || [],
    thirdPartyScripts: [...new Set(
      Object.values(allData).flatMap(d => d.scripts || [])
    )],
    allHeadings: allData['homepage']?.headings || [],
    allButtons: allData['homepage']?.buttons || [],
    colorSchemes: allData['homepage']?.colorSchemes || [],
  };

  write(path.join(OUTPUT_DIR, 'SUMMARY.json'), summary);

  // ── Human-readable report ──
  const report = `
# Mason's Reconnaissance Report
Generated: ${new Date().toISOString()}

## Pages Scraped (${summary.totalPages})
${summary.pages.map(p => `- [${p.error ? '✗' : '✓'}] ${p.name} → ${p.url} | ${p.sectionsFound} sections | ${p.imagesFound} images | ${p.cssVarsFound} CSS vars`).join('\n')}

## Body Styles
${Object.entries(summary.bodyStyles).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## CSS Custom Properties (${Object.keys(summary.globalCssVars).length} from :root)
${Object.entries(summary.globalCssVars).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Computed CSS Variables (${Object.keys(summary.globalComputedVars).length} total)
${Object.entries(summary.globalComputedVars).slice(0, 80).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Fonts Loaded (${summary.fonts.length})
${summary.fonts.map(f => `- ${f.family} | weight: ${f.weight} | style: ${f.style} | status: ${f.status}`).join('\n')}

## Navigation Links
${summary.navigationLinks.map(l => `- ${l.text} → ${l.href}`).join('\n')}

## Footer Links
${summary.footerLinks.map(l => `- ${l.text} → ${l.href}`).join('\n')}

## Announcement Bar
${summary.announcementBar ? `Text: ${summary.announcementBar.text}\nBG: ${summary.announcementBar.computedBg}\nColor: ${summary.announcementBar.computedColor}` : 'Not found'}

## Headings (Homepage)
${summary.allHeadings.map(h => `- ${h.tag}: "${h.text}" | ${h.computedSize} | weight: ${h.computedWeight} | ${h.computedFamily}`).join('\n')}

## Buttons (Homepage)
${summary.allButtons.slice(0, 20).map(b => `- "${b.text}" | bg: ${b.computedBg} | color: ${b.computedColor} | radius: ${b.computedRadius} | padding: ${b.computedPadding}`).join('\n')}

## Third-Party Scripts (${summary.thirdPartyScripts.length})
${summary.thirdPartyScripts.map(s => `- ${s}`).join('\n')}

## Color Scheme Elements Found
${summary.colorSchemes.slice(0, 20).map(c => `- .${c.classes.split(' ').find(cl => cl.includes('scheme')) || c.classes.split(' ')[0]} | bg: ${c.computedBg} | color: ${c.computedColor}`).join('\n')}
`;

  write(path.join(OUTPUT_DIR, 'REPORT.md'), report);

  await browser.close();

  console.log('\n✅ Reconnaissance complete!');
  console.log(`📁 Output folder: ${OUTPUT_DIR}`);
  console.log('\nFiles generated:');
  console.log('  recon/output/SUMMARY.json       ← machine-readable full data');
  console.log('  recon/output/REPORT.md          ← human-readable audit report');
  console.log('  recon/output/dom/*.json         ← per-page extracted data');
  console.log('  recon/output/dom/*.html         ← full rendered HTML per page');
  console.log('  recon/output/screenshots/*.png  ← full-page screenshots (3 viewports × all pages)');
  console.log('\nNext step: Share recon/output/REPORT.md and screenshots/ with Claude.');
})();
