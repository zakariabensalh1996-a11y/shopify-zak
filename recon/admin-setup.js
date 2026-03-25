/**
 * Mason's Shopify Admin Setup Script
 * Uses GraphQL Admin API to create: collections, pages, menus, blog
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

const STORE = 'zak-shop66.myshopify.com';
const API_VERSION = '2024-07';

const configPath = path.join(os.homedir(), 'AppData', 'Roaming', 'shopify-cli-kit-nodejs', 'Config', 'config.json');
const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const session = JSON.parse(raw.sessionStore);
const TOKEN = Object.values(Object.values(session)[0])[0].identity.accessToken;

// ── GraphQL helper ─────────────────────────────────────────
function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: STORE,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(body),
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Helpers ────────────────────────────────────────────────
async function ensureCollection(title, handle, descriptionHtml) {
  process.stdout.write(`  ${handle}...`);
  // Check existing
  const check = await gql(`{ collections(first:1, query:"handle:${handle}") { nodes { id title handle } } }`);
  if (check.data.collections.nodes.length > 0) {
    console.log(' ✓ exists');
    return check.data.collections.nodes[0];
  }
  // Create
  const r = await gql(`
    mutation($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id title handle }
        userErrors { field message }
      }
    }
  `, { input: { title, handle, descriptionHtml: descriptionHtml || '' } });
  const errs = r.data.collectionCreate.userErrors;
  if (errs.length > 0) { console.log(` ✗ ${errs[0].message}`); return null; }
  console.log(' ✓ created');
  return r.data.collectionCreate.collection;
}

async function ensurePage(title, handle, bodyHtml) {
  process.stdout.write(`  ${handle}...`);
  // GraphQL pages query
  const check = await gql(`{ pages(first:1, query:"handle:${handle}") { nodes { id title handle } } }`);
  if (check.data && check.data.pages.nodes.length > 0) {
    console.log(' ✓ exists');
    return check.data.pages.nodes[0];
  }
  const r = await gql(`
    mutation($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { id title handle }
        userErrors { field message }
      }
    }
  `, { page: { title, handle, body: bodyHtml || `<p>${title}</p>`, isPublished: true } });
  if (!r.data || !r.data.pageCreate) { console.log(` ✗ ${JSON.stringify(r).substring(0,120)}`); return null; }
  const errs = r.data.pageCreate.userErrors;
  if (errs.length > 0) { console.log(` ✗ ${errs[0].message}`); return null; }
  console.log(' ✓ created');
  return r.data.pageCreate.page;
}

async function ensureMenu(title, handle, items) {
  process.stdout.write(`  ${handle}...`);
  // Check
  const check = await gql(`{ menus(first:20) { nodes { id title handle } } }`);
  if (check.data && check.data.menus) {
    const existing = check.data.menus.nodes.find(m => m.handle === handle);
    if (existing) { console.log(' ✓ exists'); return existing; }
  } else if (check.errors) {
    console.log(` ✗ no menu access: ${check.errors[0].message}`);
    return null;
  }
  const r = await gql(`
    mutation($title: String!, $handle: String!, $items: [MenuItemCreateInput!]!) {
      menuCreate(title: $title, handle: $handle, items: $items) {
        menu { id title handle }
        userErrors { field message }
      }
    }
  `, { title, handle, items });
  if (!r.data || !r.data.menuCreate) { console.log(` ✗ ${JSON.stringify(r).substring(0,120)}`); return null; }
  const errs = r.data.menuCreate.userErrors;
  if (errs.length > 0) { console.log(` ✗ ${errs[0].message}`); return null; }
  console.log(' ✓ created');
  return r.data.menuCreate.menu;
}

async function ensureBlog(title, handle) {
  process.stdout.write(`  ${handle}...`);
  const r = await gql(`
    mutation($blog: BlogCreateInput!) {
      blogCreate(blog: $blog) {
        blog { id title handle }
        userErrors { field message }
      }
    }
  `, { blog: { title, handle, commentPolicy: 'CLOSED' } });
  if (!r.data || !r.data.blogCreate) { console.log(` ✗ no access`); return null; }
  const errs = r.data.blogCreate.userErrors;
  if (errs.length > 0) {
    if (errs[0].message.includes('already been taken') || errs[0].message.includes('taken')) {
      console.log(' ✓ exists');
    } else {
      console.log(` ✗ ${errs[0].message}`);
    }
    return null;
  }
  console.log(' ✓ created');
  return r.data.blogCreate.blog;
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('=== Mason\'s Admin Setup ===');
  const shop = await gql('{ shop { name } }');
  console.log(`✓ Shop: ${shop.data.shop.name}\n`);

  // ── Delete test collection ────────────────────────────────
  console.log('Cleaning test data...');
  const testCheck = await gql(`{ collections(first:1, query:"handle:test-masons-col") { nodes { id } } }`);
  if (testCheck.data.collections.nodes.length > 0) {
    const testId = testCheck.data.collections.nodes[0].id;
    await gql(`mutation { collectionDelete(input: {id:"${testId}"}) { deletedCollectionId userErrors { message } } }`);
    console.log('  ✓ Removed test collection');
  }

  // ── Collections ──────────────────────────────────────────
  console.log('\n── Collections ──');
  const collections = [
    ['Printemps-Été Homme SS26', 'printemps-ete-homme', '<p>Collection homme printemps-été SS26 — Mason\'s Forte dei Marmi.</p>'],
    ['Printemps-Été Femme SS26', 'printemps-ete-femme', '<p>Collection femme printemps-été SS26 — Mason\'s Forte dei Marmi.</p>'],
    ['New Arrivals', 'new-arrivals', '<p>Nos dernières nouveautés homme Mason\'s.</p>'],
    ['New Woman Arrivals', 'new-woman-arrivals', '<p>Nos dernières nouveautés femme Mason\'s.</p>'],
    ['Homme', 'homme', '<p>Toute la collection homme Mason\'s.</p>'],
    ['Femme', 'femme', '<p>Toute la collection femme Mason\'s.</p>'],
    ['Accessories', 'accessories', '<p>Accessoires Mason\'s.</p>'],
    ['Soldes', 'soldes', '<p>Nos meilleures offres Mason\'s.</p>'],
    ['Milano — Chino Homme', 'milano-pantalons-chino-homme-masons', '<p>Le chino Milano, coupe signature Mason\'s depuis 1974.</p>'],
    ['New York — Chino Homme', 'new-york-chino-homme-masons', '<p>Le chino New York, coupe slim emblématique.</p>'],
    ['Torino — Chino Homme', 'torino-pantalons-chino-homme-masons', '<p>Le pantalon Torino, élégance italienne.</p>'],
    ['Chile — Cargo', 'chile-pantalons-cargo-masons', '<p>Le cargo Chile Mason\'s.</p>'],
    ['Boston', 'boston', '<p>Collection Boston Mason\'s.</p>'],
    ['London — Bermuda Homme', 'london-bermuda-homme', '<p>Le bermuda London Mason\'s.</p>'],
    ['Osaka — Chino Homme', 'osaka-men-chino-pants', '<p>Le chino Osaka Mason\'s.</p>'],
    ['Malibu — Femme', 'malibu', '<p>Collection Malibu femme Mason\'s.</p>'],
    ['Pantalons Homme Été', 'pantalons-homme-ete', '<p>Pantalons homme collection été Mason\'s.</p>'],
    ['Bermuda Été Homme', 'bermuda-ete-homme', '<p>Bermudas homme été Mason\'s.</p>'],
    ['Slim Fit Homme', 'slim-fit-pantalons-homme', '<p>Pantalons slim fit homme Mason\'s.</p>'],
    ['Carrot Fit Homme', 'carrot-fit-pantalons-homme', '<p>Pantalons carrot fit homme Mason\'s.</p>'],
    ['Regular Fit Homme', 'regular-fit-pantalons-homme', '<p>Pantalons regular fit homme Mason\'s.</p>'],
    ['Relaxed Fit Homme', 'relaxed-fit-masons-hommes', '<p>Pantalons relaxed fit homme Mason\'s.</p>'],
    ['Extra Slim Fit Homme', 'extra-slim-fit-pantalons-homme', '<p>Pantalons extra slim fit homme Mason\'s.</p>'],
    ['Chile Bermuda', 'chile-bermuda', '<p>Bermuda Chile Mason\'s.</p>'],
  ];

  for (const [title, handle, body] of collections) {
    await ensureCollection(title, handle, body);
    await new Promise(r => setTimeout(r, 150));
  }

  // ── Pages ────────────────────────────────────────────────
  console.log('\n── Pages ──');
  const pages = [
    ['Notre Histoire', 'decouvrez-notre-histoire', `<h2>Mason\'s — Forte dei Marmi, 1974</h2><p>Mason\'s naît à Forte dei Marmi en 1974, station balnéaire chic de la Toscane. Depuis plus de 50 ans, nous créons des pantalons tailleur alliant style, confort et savoir-faire artisanal italien.</p><p>Chaque pièce Mason\'s est conçue pour sublimer la silhouette avec des coupes intemporelles, des matières nobles et une attention aux détails qui fait notre renommée internationale.</p>`],
    ['FAQ', 'faq', `<h2>Questions fréquentes</h2><h3>Livraison</h3><p>Livraison gratuite à partir de 200$. Délai : 3-5 jours ouvrés.</p><h3>Retours</h3><p>Retours gratuits sous 30 jours. Produits non portés, étiquettes intactes.</p><h3>Tailles</h3><p>Nos pantalons suivent le sizing européen/italien. Consultez notre guide des tailles.</p><h3>Matières</h3><p>Nous utilisons des tissus nobles : coton, lin, laine, cachemire — toujours de qualité artisanale italienne.</p>`],
    ['Contact', 'contact', `<p>Notre équipe est disponible du lundi au vendredi de 9h à 18h (CET).<br>Email : service@masons.it</p>`],
    ['Personal Shopper', 'assistant-de-vente', `<h2>Personal Shopper Mason\'s</h2><p>Bénéficiez des conseils personnalisés de nos experts pour trouver le pantalon parfait selon votre morphologie, vos goûts et votre style de vie.</p>`],
    ['Guide des tailles', 'guide-des-tailles', `<h2>Guide des tailles Mason\'s</h2><table><thead><tr><th>Taille EU</th><th>Taille IT</th><th>Tour de taille</th><th>Tour de hanches</th></tr></thead><tbody><tr><td>XS</td><td>44</td><td>72–76 cm</td><td>90–94 cm</td></tr><tr><td>S</td><td>46</td><td>76–80 cm</td><td>94–98 cm</td></tr><tr><td>M</td><td>48</td><td>80–84 cm</td><td>98–102 cm</td></tr><tr><td>L</td><td>50</td><td>84–88 cm</td><td>102–106 cm</td></tr><tr><td>XL</td><td>52</td><td>88–94 cm</td><td>106–112 cm</td></tr><tr><td>XXL</td><td>54</td><td>94–100 cm</td><td>112–118 cm</td></tr><tr><td>3XL</td><td>56</td><td>100–108 cm</td><td>118–126 cm</td></tr></tbody></table>`],
    ['Mentions légales', 'mentions-legales', `<h2>Mentions légales</h2><p>Mason\'s S.r.l. — Via Mattei, 10 — 55041 Forte dei Marmi (LU) — Italie.</p>`],
    ['Retours & Échanges', 'retours', `<h2>Politique de retours</h2><p>Vous disposez de 30 jours à compter de la réception de votre commande pour effectuer un retour. Les articles doivent être non portés, avec leurs étiquettes d\'origine. Les retours sont gratuits.</p>`],
  ];

  for (const [title, handle, body] of pages) {
    await ensurePage(title, handle, body);
    await new Promise(r => setTimeout(r, 150));
  }

  // ── Blog ─────────────────────────────────────────────────
  console.log('\n── Blog ──');
  await ensureBlog("Mason's Journal", 'news');

  // ── Navigation Menus ─────────────────────────────────────
  console.log('\n── Navigation Menus ──');

  const BASE = `https://${STORE}`;
  await ensureMenu('Main Menu', 'main-menu', [
    { title: 'HOMME', url: `${BASE}/collections/printemps-ete-homme`, type: 'HTTP' },
    { title: 'FEMME', url: `${BASE}/collections/printemps-ete-femme`, type: 'HTTP' },
    { title: 'ACCESSORIES', url: `${BASE}/collections/accessories`, type: 'HTTP' },
    { title: 'SOLDES', url: `${BASE}/collections/soldes`, type: 'HTTP' },
    { title: 'NOTRE HISTOIRE', url: `${BASE}/pages/decouvrez-notre-histoire`, type: 'HTTP' },
    { title: 'BLOG', url: `${BASE}/blogs/news`, type: 'HTTP' },
  ]);
  await new Promise(r => setTimeout(r, 200));

  await ensureMenu('Société', 'footer-societe', [
    { title: 'Notre histoire', url: `${BASE}/pages/decouvrez-notre-histoire`, type: 'HTTP' },
    { title: 'Blog', url: `${BASE}/blogs/news`, type: 'HTTP' },
    { title: 'Personal Shopper', url: `${BASE}/pages/assistant-de-vente`, type: 'HTTP' },
  ]);
  await new Promise(r => setTimeout(r, 200));

  await ensureMenu('Service Client', 'footer-service', [
    { title: 'Nous contacter', url: `${BASE}/pages/contact`, type: 'HTTP' },
    { title: 'FAQ', url: `${BASE}/pages/faq`, type: 'HTTP' },
    { title: 'Guide des tailles', url: `${BASE}/pages/guide-des-tailles`, type: 'HTTP' },
    { title: 'Retours & Échanges', url: `${BASE}/pages/retours`, type: 'HTTP' },
  ]);
  await new Promise(r => setTimeout(r, 200));

  await ensureMenu('Légal', 'footer-legal', [
    { title: 'CGV', url: `${BASE}/policies/terms-of-service`, type: 'HTTP' },
    { title: 'Confidentialité', url: `${BASE}/policies/privacy-policy`, type: 'HTTP' },
    { title: 'Mentions légales', url: `${BASE}/pages/mentions-legales`, type: 'HTTP' },
    { title: 'Remboursement', url: `${BASE}/policies/refund-policy`, type: 'HTTP' },
  ]);

  console.log('\n=== ✓ All done! ===');
  console.log('\nManual steps still needed (theme editor):');
  console.log('  • Logo: Online Store → Customize → Header → upload masons-logo.png');
  console.log('  • Favicon: Online Store → Customize → Theme settings → upload masons-favicon.jpg');
  console.log('  • Add products to collections via Products → Collections in admin');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
