/**
 * Mason's Product Creation Script
 * Creates authentic Mason's products with variants (colors × sizes)
 * and assigns them to the correct collections.
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Get collection GIDs ────────────────────────────────────
async function getCollectionGid(handle) {
  const r = await gql(`{ collections(first:1, query:"handle:${handle}") { nodes { id } } }`);
  return r.data.collections.nodes[0]?.id || null;
}

// ── Create product with variants ───────────────────────────
async function createProduct(title, handle, description, productType, tags, vendor, variants, collectionHandles) {
  process.stdout.write(`  ${handle}...`);

  // Check if product already exists
  const check = await gql(`{ products(first:1, query:"handle:${handle}") { nodes { id } } }`);
  if (check.data.products.nodes.length > 0) {
    console.log(' ✓ exists');
    return check.data.products.nodes[0];
  }

  // Build variants array for productCreate
  // options must be a flat array of string values in the same order as product.options
  const variantInputs = variants.map(v => ({
    price: v.price.toString(),
    compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : null,
    sku: v.sku || null,
    options: v.options,   // e.g. ['Beige', 'M']
    inventoryItem: { tracked: false },
  }));

  const r = await gql(`
    mutation($input: ProductInput!) {
      productCreate(input: $input) {
        product { id title handle variants(first:50) { nodes { id } } }
        userErrors { field message }
      }
    }
  `, {
    input: {
      title,
      handle,
      descriptionHtml: description,
      productType,
      vendor: vendor || "Mason's",
      tags,
      status: 'ACTIVE',
      options: getOptionNames(variants),
      variants: variantInputs,
    }
  });

  if (!r.data || !r.data.productCreate) {
    console.log(` ✗ ${JSON.stringify(r).substring(0, 120)}`);
    return null;
  }
  const errs = r.data.productCreate.userErrors;
  if (errs.length > 0) { console.log(` ✗ ${errs[0].message}`); return null; }

  const product = r.data.productCreate.product;
  console.log(' ✓ created');

  // Assign to collections
  for (const colHandle of collectionHandles) {
    const colId = await getCollectionGid(colHandle);
    if (colId) {
      await gql(`
        mutation($id: ID!, $products: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $products) {
            userErrors { message }
          }
        }
      `, { id: colId, products: [product.id] });
    }
    await sleep(100);
  }

  return product;
}

function getOptionNames(variants) {
  // Infer option names from product type (all Mason's products use Couleur + Taille)
  const first = variants[0]?.options || [];
  if (first.length === 2) return ['Couleur', 'Taille'];
  if (first.length === 1) return ['Couleur'];
  return first.map((_, i) => `Option ${i + 1}`);
}

// ── Mason's authentic sizes ───────────────────────────────
const HOMME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const FEMME_SIZES = ['36', '38', '40', '42', '44', '46'];

function makeVariants(colors, sizes, basePrice, salePrice) {
  const variants = [];
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        price: salePrice || basePrice,
        compareAtPrice: salePrice ? basePrice : null,
        sku: null,
        options: [color, size],   // flat array: [colorValue, sizeValue]
      });
    }
  }
  return variants;
}

// ── Product catalog ────────────────────────────────────────
async function main() {
  console.log("=== Mason's Product Setup ===");
  const shop = await gql('{ shop { name } }');
  console.log(`✓ Shop: ${shop.data.shop.name}\n`);

  // ── HOMME CHINOS — Milano ─────────────────────────────────
  console.log('── Pantalons Homme (Milano) ──');
  const milanoColors = ['Beige', 'Navy', 'Olive', 'Gris chiné', 'Ecru', 'Camel'];
  await createProduct(
    'Milano — Pantalon Chino Homme',
    'milano-chino-homme',
    `<p>Le chino Milano est la coupe signature de Mason's depuis 1974. Silhouette slim, taille mi-haute et jambe effilée pour une élégance intemporelle. Coton gabardine stretch de qualité italienne.</p>
<ul><li>Coupe slim fit</li><li>100% coton gabardine stretch</li><li>Ceinture passants avec boucle</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['chino', 'homme', 'slim', 'Milano', 'SS26'],
    "Mason's",
    makeVariants(milanoColors, HOMME_SIZES, '195.00', '149.00'),
    ['homme', 'printemps-ete-homme', 'new-arrivals', 'milano-pantalons-chino-homme-masons', 'slim-fit-pantalons-homme', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── HOMME CHINOS — New York ───────────────────────────────
  const nyColors = ['Blanc cassé', 'Navy', 'Noir', 'Gris', 'Kaki', 'Bleu ciel'];
  await createProduct(
    'New York — Pantalon Chino Homme',
    'new-york-chino-homme',
    `<p>Le New York incarne l'élégance urbaine selon Mason's. Coupe extra-slim avec une jambe très ajustée, idéale pour un look city chic. Tissu coton sergé léger.</p>
<ul><li>Coupe extra slim fit</li><li>Coton sergé 98% coton 2% elasthanne</li><li>Finitions soignées</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['chino', 'homme', 'extra-slim', 'New York', 'SS26'],
    "Mason's",
    makeVariants(nyColors, HOMME_SIZES, '185.00', '139.00'),
    ['homme', 'printemps-ete-homme', 'new-york-chino-homme-masons', 'extra-slim-fit-pantalons-homme', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── HOMME CHINOS — Torino ─────────────────────────────────
  const torinoColors = ['Taupe', 'Marine', 'Vert forêt', 'Sable', 'Bordeaux'];
  await createProduct(
    'Torino — Pantalon Chino Homme',
    'torino-chino-homme',
    `<p>Le Torino allie l'élégance du pantalon tailleur à la décontraction du chino. Coupe regular, jambe droite légèrement effilée. Tissu coton linen pour la saison estivale.</p>
<ul><li>Coupe regular fit</li><li>Mélange coton-lin premium</li><li>Tombé impeccable</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['chino', 'homme', 'regular', 'Torino', 'SS26'],
    "Mason's",
    makeVariants(torinoColors, HOMME_SIZES, '210.00', '165.00'),
    ['homme', 'printemps-ete-homme', 'torino-pantalons-chino-homme-masons', 'regular-fit-pantalons-homme', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── HOMME CHINOS — Osaka ──────────────────────────────────
  const osakaColors = ['Blanc', 'Beige', 'Navy', 'Kaki olive'];
  await createProduct(
    'Osaka — Pantalon Chino Homme',
    'osaka-chino-homme',
    `<p>Le chino Osaka de Mason's propose une silhouette carrot fit — taille haute, jambe évasée vers le genou puis resserrée. Style contemporain et confort optimal.</p>
<ul><li>Coupe carrot fit</li><li>Coton gabardine bio</li><li>Taille haute avec ceinture élastiquée au dos</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['chino', 'homme', 'carrot', 'Osaka', 'SS26'],
    "Mason's",
    makeVariants(osakaColors, HOMME_SIZES, '200.00', '155.00'),
    ['homme', 'printemps-ete-homme', 'osaka-men-chino-pants', 'carrot-fit-pantalons-homme', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── HOMME CARGO — Chile ───────────────────────────────────
  const chileColors = ['Kaki', 'Noir', 'Olive army', 'Sand'];
  await createProduct(
    'Chile — Pantalon Cargo Homme',
    'chile-cargo-homme',
    `<p>Le cargo Chile réinterprète l'utilitaire selon Mason's : des poches plaquées latérales, une silhouette relaxed et des détails militaires raffinés. Tissu coton ripstop léger.</p>
<ul><li>Coupe relaxed fit</li><li>Coton ripstop 100%</li><li>6 poches dont 2 cargo</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['cargo', 'homme', 'relaxed', 'Chile', 'SS26'],
    "Mason's",
    makeVariants(chileColors, HOMME_SIZES, '220.00', '175.00'),
    ['homme', 'printemps-ete-homme', 'chile-pantalons-cargo-masons', 'relaxed-fit-masons-hommes', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── HOMME BERMUDA — London ────────────────────────────────
  const londonColors = ['Navy', 'Beige', 'Kaki', 'Blanc', 'Bleu ciel'];
  await createProduct(
    'London — Bermuda Homme',
    'london-bermuda-homme-product',
    `<p>Le bermuda London est le short signature de Mason's. Coupe classique au-dessus du genou, tissu coton chino léger. L'essentiel de l'été italien.</p>
<ul><li>Longueur bermuda</li><li>Coton chino 100%</li><li>Coupe slim</li><li>Fabrication italienne</li></ul>`,
    'Bermuda',
    ['bermuda', 'homme', 'London', 'SS26', 'été'],
    "Mason's",
    makeVariants(londonColors, HOMME_SIZES, '150.00', '115.00'),
    ['homme', 'printemps-ete-homme', 'london-bermuda-homme', 'bermuda-ete-homme']
  );
  await sleep(300);

  // ── HOMME BERMUDA — Chile ─────────────────────────────────
  await createProduct(
    'Chile — Bermuda Cargo Homme',
    'chile-bermuda-homme-product',
    `<p>Le bermuda cargo Chile reprend les codes utilitaires du pantalon dans une version courte. Poches plaquées, tissu résistant, silhouette décontractée.</p>
<ul><li>Longueur bermuda</li><li>Coton ripstop</li><li>4 poches dont 2 cargo</li><li>Fabrication italienne</li></ul>`,
    'Bermuda',
    ['bermuda', 'cargo', 'homme', 'Chile', 'SS26'],
    "Mason's",
    makeVariants(['Kaki', 'Olive', 'Noir'], HOMME_SIZES, '160.00', '125.00'),
    ['homme', 'printemps-ete-homme', 'chile-bermuda', 'bermuda-ete-homme']
  );
  await sleep(300);

  // ── HOMME — Boston ────────────────────────────────────────
  await createProduct(
    'Boston — Pantalon Homme',
    'boston-homme-product',
    `<p>Le Boston offre une coupe relaxed contemporaine avec une jambe large et une taille mi-haute. Parfait pour un style décontracté-chic à l'italienne.</p>
<ul><li>Coupe relaxed wide leg</li><li>Tissu coton-viscose fluide</li><li>Ceinture souple</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['pantalon', 'homme', 'relaxed', 'Boston', 'SS26'],
    "Mason's",
    makeVariants(['Ivoire', 'Beige sable', 'Gris clair', 'Marine'], HOMME_SIZES, '215.00'),
    ['homme', 'printemps-ete-homme', 'boston', 'pantalons-homme-ete']
  );
  await sleep(300);

  // ── FEMME — Malibu ────────────────────────────────────────
  console.log('\n── Pantalons Femme (Malibu) ──');
  const malibuColors = ['Blanc', 'Rose nude', 'Bleu pastel', 'Caramel', 'Noir'];
  await createProduct(
    'Malibu — Pantalon Femme',
    'malibu-femme-product',
    `<p>Le Malibu est la coupe phare de la collection femme Mason's. Taille haute, jambe légèrement évasée pour une silhouette élancée. Tissu coton-lin premium italien.</p>
<ul><li>Coupe taille haute</li><li>Jambe semi-évasée</li><li>Coton-lin premium</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['pantalon', 'femme', 'Malibu', 'SS26'],
    "Mason's",
    makeVariants(malibuColors, FEMME_SIZES, '195.00', '149.00'),
    ['femme', 'printemps-ete-femme', 'new-woman-arrivals', 'malibu']
  );
  await sleep(300);

  // ── FEMME — Chino Femme ───────────────────────────────────
  const chinoFemmeColors = ['Blanc cassé', 'Navy', 'Kaki', 'Rose poudre', 'Terracotta'];
  await createProduct(
    'Chino Slim — Pantalon Femme',
    'chino-slim-femme',
    `<p>Un chino taillé spécialement pour la femme. Coupe slim, taille mi-haute, tissu coton stretch pour un confort toute la journée. Style intemporel made in Italy.</p>
<ul><li>Coupe slim</li><li>Coton stretch 97% / 3% élasthanne</li><li>Taille mi-haute</li><li>Fabrication italienne</li></ul>`,
    'Pantalon',
    ['chino', 'femme', 'slim', 'SS26'],
    "Mason's",
    makeVariants(chinoFemmeColors, FEMME_SIZES, '185.00', '139.00'),
    ['femme', 'printemps-ete-femme', 'new-woman-arrivals']
  );
  await sleep(300);

  // ── FEMME — Bermuda Femme ─────────────────────────────────
  await createProduct(
    'Bermuda Chino — Femme',
    'bermuda-chino-femme',
    `<p>Le bermuda chino femme Mason's reprend la qualité de tissu et les finitions soignées de la collection homme dans une coupe féminine. Confort et style pour l'été.</p>
<ul><li>Longueur bermuda</li><li>Coton chino léger</li><li>Taille haute boutonnée</li><li>Fabrication italienne</li></ul>`,
    'Bermuda',
    ['bermuda', 'femme', 'SS26', 'été'],
    "Mason's",
    makeVariants(['Blanc', 'Beige', 'Navy', 'Kaki'], FEMME_SIZES, '145.00', '109.00'),
    ['femme', 'printemps-ete-femme', 'new-woman-arrivals']
  );
  await sleep(300);

  // ── ACCESSORIES ───────────────────────────────────────────
  console.log('\n── Accessories ──');
  await createProduct(
    'Ceinture cuir — Homme',
    'ceinture-cuir-homme',
    `<p>Ceinture en cuir pleine fleur tannée végétalement, boucle en laiton mat. Fabriquée artisanalement en Toscane selon la tradition Mason's.</p>
<ul><li>Cuir pleine fleur</li><li>Tannage végétal</li><li>Boucle laiton mat</li><li>Fabrication toscane</li></ul>`,
    'Accessoire',
    ['ceinture', 'accessoire', 'cuir', 'homme'],
    "Mason's",
    makeVariants(['Cognac', 'Noir'], ['85', '90', '95', '100'], '95.00'),
    ['accessories']
  );
  await sleep(300);

  await createProduct(
    'Pochette toile — Homme',
    'pochette-toile-homme',
    `<p>Pochette en toile de coton épais, style workwear raffiné. Fermeture glissière YKK, anses cuir véritable. Idéale pour accompagner vos tenues Mason's.</p>`,
    'Accessoire',
    ['pochette', 'accessoire', 'toile', 'homme'],
    "Mason's",
    [
      { price: '75.00', sku: null, options: ['Kaki'] },
      { price: '75.00', sku: null, options: ['Navy'] },
      { price: '75.00', sku: null, options: ['Noir'] },
    ],
    ['accessories']
  );
  await sleep(300);

  // ── SOLDES — quelques articles ────────────────────────────
  console.log('\n── Soldes ──');
  await createProduct(
    'Milano SS25 — Chino Soldé',
    'milano-ss25-solde',
    `<p>Le chino Milano de la collection SS25, disponible en quantités limitées. Même qualité premium Mason's, à prix réduit.</p>`,
    'Pantalon',
    ['chino', 'homme', 'soldes', 'SS25'],
    "Mason's",
    makeVariants(['Beige', 'Navy'], ['S', 'M', 'L', 'XL'], '195.00', '97.00'),
    ['soldes', 'homme']
  );
  await sleep(300);

  await createProduct(
    'Malibu SS25 — Pantalon Femme Soldé',
    'malibu-ss25-solde',
    `<p>Le pantalon Malibu de la saison passée en quantité limitée. Même coupe et même qualité, au meilleur prix.</p>`,
    'Pantalon',
    ['pantalon', 'femme', 'soldes', 'SS25'],
    "Mason's",
    makeVariants(['Blanc', 'Rose nude'], ['36', '38', '40', '42'], '195.00', '97.00'),
    ['soldes', 'femme']
  );
  await sleep(300);

  console.log('\n=== ✓ All products created! ===');
  console.log('\nNext steps:');
  console.log('  • Upload product images via Shopify Admin → Products → select product → Add media');
  console.log('  • Or use the Files API / Shopify CLI to bulk upload images');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
