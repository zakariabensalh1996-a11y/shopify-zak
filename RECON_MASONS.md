# Full Site Reconnaissance — us.masons.it/fr
**Date:** 2026-03-25
**Project:** Pixel-perfect Shopify theme clone
**Target:** https://us.masons.it/fr
**Shop backend:** masons-forte-dei-marmi.myshopify.com
**Shop ID:** 56940101806
**Theme:** masons/main (Theme ID: 186912276862, Schema: masons v1.0.0)
**Base theme:** Shopify Horizon

---

## IMPORTANT TECHNICAL NOTE

The site renders all body/product content client-side via JavaScript modules. The raw HTML source only contains `<head>` infrastructure (CSS variables, JS imports, analytics config). Product listings, collection grids, FAQ content, page bodies etc. are all hydrated after JS execution. This is standard for Shopify Horizon. The clone must replicate this architecture.

---

## 1. HOMEPAGE — https://us.masons.it/fr

### Page Title
`Mason's | Pantalons Tailleur depuis 1974`

### Brand Identity
- Brand name: **Mason's**
- Tagline: **Pantalons Tailleur depuis 1974** (Tailored Trousers since 1974)
- Founded: **1974**
- Origin: **Forte dei Marmi, Italy**
- Category: Italian luxury fashion

### CSS Custom Properties (Design Tokens)

#### Colors
```css
--color-background: rgb(242 242 242 / 1.0)        /* #F2F2F2 — light gray */
--color-foreground: rgb(0 0 0 / 1.0)               /* #000000 — black */
--color-accent: rgb(255 80 49 / 1.0)               /* #FF5031 — orange/red */
--color-primary: rgb(0 0 0 / 1.0)                  /* #000000 */
--color-primary-button-background: rgb(34 34 34 / 1.0)  /* #222222 */
--color-primary-button-hover-background: rgb(255 80 49 / 1.0)  /* #FF5031 */
--color-border: rgb(229 229 229 / 1.0)             /* #E5E5E5 */
--color-error: #8B0000                             /* dark red */
--color-success: #006400                           /* dark green */
--color-instock: #3ED660                           /* green */
--color-outofstock: #C8C8C8                        /* gray */
```

#### Typography
```css
--font-body--family: Helvetica Neue, sans-serif
--font-heading--family: Helvetica Neue, monospace
--font-accent--family: Bull-5, monospace
--font-size--h1: 2.4rem
--font-size--h2: 2.4rem
--font-size--h3: 2.0rem
--font-size--paragraph: 1.4rem
--line-height--body-normal: 120%
```

#### Layout
```css
--sidebar-width: 37rem
--normal-content-width: 67.2rem
--wide-content-width: 90rem
--section-height-small: 24rem
--section-height-medium: 40rem
--section-height-large: 56rem
--padding-inline: 1.2rem
--margin-lg: 1rem
--gap-lg: 1rem
--scroll-margin: 50px
```

#### Z-index Layers
```css
--layer-overlay: 16
--layer-menu-drawer: 18
```

#### Animations
```css
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1)
--animation-speed: 0.125s
--animation-timing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
```

#### Component-specific
```css
--cart-font-family: var(--font-body--family)
--cart-font-size: 1.2rem
--overflow-count: (dynamic)
--header-height: (dynamic)
--header-group-height: (dynamic)
--transparent-header-offset-boolean: 0 or 1
```

### @font-face Declarations

```css
/* Helvetica Neue — multiple weights */
@font-face {
  font-family: 'Helvetica Neue';
  src: url('https://cdn.shopify.com/s/files/1/0569/4010/1806/files/HelveticaNeue-Roman.woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Helvetica Neue';
  src: url('https://cdn.shopify.com/s/files/1/0569/4010/1806/files/HelveticaNeue-Medium.woff2');
  font-weight: 500;
}
@font-face {
  font-family: 'Helvetica Neue';
  src: url('https://cdn.shopify.com/s/files/1/0569/4010/1806/files/HelveticaNeue-Bold.woff2');
  font-weight: 700;
}

/* Bull-5 Typewriter — accent/decorative font */
@font-face {
  font-family: 'Bull-5';
  src: url('https://cdn.shopify.com/s/files/1/0569/4010/1806/files/Bull-5-Typewriter.woff2');
  font-weight: 400 700;
}

/* Southera — display font */
@font-face {
  font-family: 'Southera';
  src: url('https://cdn.shopify.com/s/files/1/0511/3131/8443/files/Southera_2c5b675c-79a8-41af-bd02-1e550131dea7.woff2');
}
```

### External Scripts (Third-party)

| Service | URL |
|---------|-----|
| Klaviyo email | `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=TuLFF4` |
| Trustpilot | `https://ecommplugins-scripts.trustpilot.com/v2.1/js/header.min.js` |
| Triple Whale analytics | `https://pps.triplewhale.systems/main.js` |
| Klarna BNPL | `https://s3.eu-west-1.amazonaws.com/production-klarna-il-shopify-osm/[id]/masons-forte-dei-marmi.myshopify.com-[timestamp].js` |
| TrustedShops | `https://tseish-app.connect.trustedshops.com/esc.js` |
| Shopify Shop JS | `https://cdn.shopify.com/shopifycloud/shop-js/modules/v2/loader.init-shop-cart-sync.fr.esm.js` |
| Pandectes GDPR | `https://cdn.shopify.com/extensions/019d06ed-f6e5-7cd5-84ac-d4e2fb3c889c/gdpr-cookie-consent-294/assets/pandectes-rules-latest.js` |
| Google Tag Manager | GTM container ID: `GTM-MC27J74` |

### Theme JS Modules (Internal)
```
//us.masons.it/cdn/shop/t/61/assets/critical.js
//us.masons.it/cdn/shop/t/61/assets/product-form.js
//us.masons.it/cdn/shop/t/61/assets/custom-variant-picker.js
//us.masons.it/cdn/shop/t/61/assets/media-gallery.js
```

### Import Map Modules
```
@theme/product-form       → product selection handling
@theme/variant-picker     → custom variant UI
@theme/media-gallery      → image/video display
@theme/quick-add          → fast add-to-cart
@theme/paginated-list     → list pagination
@theme/component          → base component
```

### Shopify Routes (French locale)
```
root:              /fr/
cart_url:          /fr/cart
cart_add_url:      /fr/cart/add.js
cart_change_url:   /fr/cart/change
cart_update_url:   /fr/cart/update
search_url:        /fr/search
predictive_search: /fr/search/suggest
```

### Navigation Links (known)
```
/fr/cart
/fr/search
/fr/
/policies/privacy-policy
/fr/pages/contacts
/fr/pages/faq
/fr/pages/retours-et-remboursements
/fr/pages/expeditions
/fr/pages/guide-des-tailles-pantalons-homme
/fr/pages/guide-des-tailles-vestes-homme
/fr/pages/guide-des-tailles-vestes-femme
/fr/pages/guide-des-tailles-pantalons-femme
/fr/pages/service-ourlet-gratuit
```

### Payment Methods
- Shopify Pay / Shop Pay
- PayPal
- Klarna
- Visa, Maestro, Mastercard, Amex (Apple Pay supported)

### Language Support
- Italian (it) — primary locale
- French (fr)
- German (de)
- Spanish (es)
- English (en)

### Geolocation/Currency
- Currency: USD
- EUR→USD conversion rate: 1.15591
- Country (Shopify.country): "BM" (Bermuda — likely test/demo)

### Cookie Categories (Pandectes GDPR)
- Category 0 (Strictly Necessary): cart, cart_currency, localization, _shopify_essential, discount_code
- Category 1 (Functional): crisp-client, ttcsid, _cfuvid
- Category 2 (Performance/Analytics): _ga, _shopify_s, _shopify_y, _orig_referrer, _landing_page
- Category 3 (Targeting/Marketing): _fbp, _ttp, _pin_unauth, test_cookie, IDE, __kla_id
- Category 4 (Unclassified): CozyRedirectOnce, shopify_client_id, cookies.js

### French UI Strings
```
"Ajouté"                                          → Added
"Image de remplacement"                            → Placeholder image
"Votre panier"                                    → Your cart
"Cookies strictement nécessaires"                  → Strictly necessary cookies
"Cookies fonctionnels"                            → Functional cookies
"Cookies de performances"                         → Performance cookies
"Ciblage des cookies"                             → Targeting cookies
"Accepter"                                        → Accept
"Déclin"                                          → Decline
"Préférences"                                     → Preferences
```

### Custom Web Components / Shadow DOM
- `DeclarativeShadowElement` — base class for shadow DOM elements
- `ResizeNotifier` — custom ResizeObserver
- `OverflowList` — header overflow menu handler
  - Parts: `[part="overflow"]`, `[part="list"]`, `[part="placeholder"]`
  - Slots: default (items), `overflow` (hidden items), `more` (button)
- `<pandectes-cmp>` — cookie consent
- `<shopify-accelerated-checkout-cart>` — Shop Pay checkout
- `<shopify-accelerated-checkout>` — accelerated checkout
- `<shop-button>` — Shop Pay button
- `<shop-login-button>` — Shop login
- `<pay-button>` — generic payment button

### CSS Selectors (Header)
```css
#header-component
#header-group
.header-section
.shopify-section
```

### Placeholder Images (Horizon theme)
```
https://cdn.shopify.com/static/themes/horizon/placeholders/general-1.png
https://cdn.shopify.com/static/themes/horizon/placeholders/general-2.png
...through general-7.png
https://cdn.shopify.com/static/themes/horizon/placeholders/product-ball.png
https://cdn.shopify.com/static/themes/horizon/placeholders/product-cone.png
https://cdn.shopify.com/static/themes/horizon/placeholders/product-cube.png
```

### Logo/Brand Images (CDN)
```
//masons-forte-dei-marmi.myshopify.com/cdn/shop/files/pandectes-banner-logo.png?v=1770040045
//masons-forte-dei-marmi.myshopify.com/cdn/shop/files/pandectes-reopen-logo.png?v=1770040045
```

### Shopify Analytics Token
`2acd502d9df5`

---

## 2. COLLECTIONS LIST — https://us.masons.it/fr/collections

Template: `list-collections`
Content: Dynamically rendered (same infrastructure as homepage)

### All Known Collection Slugs (from sitemap)

#### Men's Spring/Summer
- `/fr/collections/printemps-ete-homme`
- `/fr/collections/pantalons-homme-ete`
- `/fr/collections/bermuda-ete-homme`
- `/fr/collections/polo-et-tshirt-homme`
- `/fr/collections/vestes-ete-homme`
- `/fr/collections/chemises-ete-homme`
- `/fr/collections/blazer-ete-homme`
- `/fr/collections/costumes-ete-homme`

#### Men's Fall/Winter
- `/fr/collections/fall-winter-homme`
- `/fr/collections/pantalons-dhiver-hommes`
- `/fr/collections/blazer-dhiver-hommes`
- `/fr/collections/manteaux-dhiver-hommes`
- `/fr/collections/vestes-homme-dhiver`

#### Men's By Fit
- `/fr/collections/extra-slim-fit-pantalons-homme`
- `/fr/collections/slim-fit-pantalons-homme`
- `/fr/collections/carrot-fit-pantalons-homme`
- `/fr/collections/regular-fit-pantalons-homme`
- `/fr/collections/relaxed-fit-masons-hommes`

#### Women's Spring/Summer
- `/fr/collections/printemps-ete-femme`
- `/fr/collections/pantalons-ete-femmes`
- `/fr/collections/bermuda-ete-femme`
- `/fr/collections/chemises-femme-ete`
- `/fr/collections/robes-ete-femme`

#### Women's Fall/Winter
- `/fr/collections/fall-winter-femme`
- `/fr/collections/pantalons-dhiver-femme`

#### Accessories & Other
- `/fr/collections/accessories`
- `/fr/collections/parfums`
- `/fr/collections/masons-maillots-de-bain`
- `/fr/collections/all`

### Apple Pay Config (Collections)
```json
{
  "shopId": "gid://shopify/Shop/56940101806",
  "merchantName": "Mason's",
  "countryCode": "IT",
  "currencyCode": "USD",
  "supportedNetworks": ["visa", "maestro", "masterCard", "amex"]
}
```

---

## 3. CART PAGE — https://us.masons.it/fr/cart

Template: `cart`
Page heading: **"Votre panier – Mason's"**

### Cart Form Endpoints
```
POST /fr/cart/update     → update quantities
POST /fr/cart/change     → change line items
POST /fr/cart/add.js     → add item
GET  /fr/cart            → view cart
```

### Cart CSS Variables
```css
--cart-font-family: var(--font-body--family)
--cart-font-size: 1.2rem
```

### UI Element Specs
- Checkout button gap: 8px
- Minimum touch target: 44px
- Input disabled opacity: 0.5

### Form Fields (checkout)
- Email
- Phone
- Postal address
- Discount code input

---

## 4. SITEMAP — https://us.masons.it/sitemap.xml

### Sub-sitemaps (all 5 language variants each)
- `sitemap_products_1.xml` (range: 6709040382126–15828807745918)
- `sitemap_pages_1.xml` (range: 81361174702–700000600446)
- `sitemap_collections_1.xml` (range: 269046841518–743283097982)
- `sitemap_blogs_1.xml`

---

## 5. PAGES — Complete List from sitemap_pages_1.xml

| URL | Last Modified |
|-----|--------------|
| `/fr/pages/no-route` | 2024-06-01 |
| `/fr/pages/enable-cookies` | 2024-06-01 |
| `/fr/pages/privacy-policy-cookie-restriction-mode` | 2024-06-01 |
| `/fr/pages/entreprise` | 2025-12-09 |
| `/fr/pages/historique` | 2025-12-09 |
| `/fr/pages/avis-de-non-responsabilite` | 2026-03-09 |
| `/fr/pages/paiements` | 2024-06-01 |
| `/fr/pages/retours-et-remboursements` | 2025-12-18 |
| `/fr/pages/expeditions` | 2025-07-21 |
| `/fr/pages/politique-de-cookie-du-site-web-masons-it` | 2023-06-21 |
| `/fr/pages/champ-d-application` | 2025-06-03 |
| `/fr/pages/guide-des-tailles-pantalons-homme` | 2026-03-20 |
| `/fr/pages/spedizioni-resi` | 2024-06-01 |
| `/fr/pages/assistant-de-vente` | 2025-12-09 |
| `/fr/pages/book-your-sales-assistant` | 2024-06-01 |
| `/fr/pages/contacts` | 2025-12-09 |
| `/fr/pages/faq` | 2024-06-01 |
| `/fr/pages/lookbook-ss21` | 2024-06-01 |
| `/fr/pages/guide-des-tailles-vestes-homme` | 2026-03-20 |
| `/fr/pages/guide-des-tailles-vestes-femme` | 2026-03-20 |
| `/fr/pages/guide-des-tailles-pantalons-femme` | 2026-03-20 |
| `/fr/pages/extra-slim-uomo` | 2026-03-06 |
| `/fr/pages/slim-uomo` | 2026-03-06 |
| `/fr/pages/carrot-uomo` | 2026-03-06 |
| `/fr/pages/regular-uomo` | 2026-03-06 |
| `/fr/pages/slim-fit-donna` | 2026-03-06 |
| `/fr/pages/regular-donna` | 2025-07-07 |
| `/fr/pages/relaxed-donna` | 2026-03-06 |
| `/fr/pages/shop-by-fit` | 2023-06-21 |
| `/fr/pages/service-ourlet-gratuit` | 2024-07-16 |
| `/fr/pages/acquista-per-look` | 2023-06-21 |
| `/fr/pages/benvenuti-su-masons` | 2023-06-21 |
| `/fr/pages/codice-sconto-10-benvenuto-su-masons` | 2025-08-06 |
| `/fr/pages/masons-hem-service` | 2023-07-11 |
| `/fr/pages/merci-pour-votre-entree` | 2023-06-21 |
| `/fr/pages/gdpr-compliance` | 2024-06-01 |
| `/fr/pages/ccpa-compliance` | 2024-06-01 |
| `/fr/pages/pantaloni-denim-uomo` | 2023-06-21 |
| `/fr/pages/landing-masons` | 2026-02-02 |
| `/fr/pages/look-inspiration` | 2023-06-21 |
| `/fr/pages/anniversaire` | 2023-06-21 |
| `/fr/pages/denim-ss23` | 2023-06-21 |
| `/fr/pages/masons-nuovi-arrivi` | 2024-06-06 |
| `/fr/pages/iscriviti-alla-newsletter` | 2024-02-29 |
| `/fr/pages/women-s-straight-fit-trousers` | 2026-03-06 |
| `/fr/pages/raccontaci-la-tua-esperienza` | 2024-09-19 |
| `/fr/pages/decouvrez-notre-histoire` | 2024-10-11 |
| `/fr/pages/impressum` | 2024-10-21 |
| `/fr/pages/carrot-femme` | 2026-03-06 |
| `/fr/pages/relaxed-homme` | 2026-03-06 |
| `/fr/pages/notre-emballage` | 2025-03-06 |
| `/fr/pages/la-nostra-produzione` | 2025-03-11 |
| `/fr/pages/servizio-orlo-gratuito-how-to-do-it` | 2025-06-05 |
| `/fr/pages/tabelle-taglie` | 2025-12-04 |
| `/fr/pages/pantalon-wide-leg-femme` | 2026-03-06 |
| `/fr/pages/wishlist` | 2025-12-11 |

**Total pages: 63** (some duplicates/legacy pages)

### Key Pages by Category

**Brand / About:**
- `/fr/pages/entreprise` — Company page (template: page.azienda) — "Qui nous sommes - Mode de Luxe Italienne | Mason's"
- `/fr/pages/historique` — History (template: page.storia) — "L'histoire d'une recherche et d'une passion pour la mode depuis 1974"
- `/fr/pages/decouvrez-notre-histoire` — Brand story
- `/fr/pages/notre-emballage` — Packaging
- `/fr/pages/la-nostra-produzione` — Production

**Customer Service:**
- `/fr/pages/contacts` — Contact (template: page.contatti)
- `/fr/pages/faq` — FAQ (template: page.faq)
- `/fr/pages/retours-et-remboursements` — Returns & Refunds
- `/fr/pages/expeditions` — Shipping
- `/fr/pages/paiements` — Payments
- `/fr/pages/assistant-de-vente` — Sales assistant
- `/fr/pages/book-your-sales-assistant` — Book appointment

**Size Guides:**
- `/fr/pages/guide-des-tailles-pantalons-homme` — Men's trouser size guide
- `/fr/pages/guide-des-tailles-vestes-homme` — Men's jacket size guide
- `/fr/pages/guide-des-tailles-vestes-femme` — Women's jacket size guide
- `/fr/pages/guide-des-tailles-pantalons-femme` — Women's trouser size guide
- `/fr/pages/tabelle-taglie` — Size tables (general)

**Fit Pages:**
- `/fr/pages/extra-slim-uomo` — Extra Slim (men)
- `/fr/pages/slim-uomo` — Slim (men)
- `/fr/pages/carrot-uomo` — Carrot (men)
- `/fr/pages/regular-uomo` — Regular (men)
- `/fr/pages/relaxed-homme` — Relaxed (men)
- `/fr/pages/slim-fit-donna` — Slim Fit (women)
- `/fr/pages/regular-donna` — Regular (women)
- `/fr/pages/relaxed-donna` — Relaxed (women)
- `/fr/pages/carrot-femme` — Carrot (women)
- `/fr/pages/pantalon-wide-leg-femme` — Wide Leg (women)
- `/fr/pages/women-s-straight-fit-trousers` — Straight Fit (women)
- `/fr/pages/shop-by-fit` — Shop by fit hub

**Services:**
- `/fr/pages/service-ourlet-gratuit` — Free hem service
- `/fr/pages/servizio-orlo-gratuito-how-to-do-it` — How to use hem service

**Legal:**
- `/fr/pages/avis-de-non-responsabilite` — Disclaimer
- `/fr/pages/politique-de-cookie-du-site-web-masons-it` — Cookie policy
- `/fr/pages/gdpr-compliance` — GDPR
- `/fr/pages/ccpa-compliance` — CCPA
- `/fr/pages/champ-d-application` — Scope/terms
- `/fr/pages/impressum` — Legal notice

**Utility:**
- `/fr/pages/wishlist` — Wishlist (template: page.wishlist)
- `/fr/pages/landing-masons` — Landing page

---

## 6. PRODUCT PAGE DATA

### Example Product 1: Field Jacket M74 (Men's)
**URL:** `/fr/products/field-jacket-m74-homme-en-coton-stretch`
**Title:** Field Jacket M74 homme en coton stretch
**Brand:** Mason's
**Category:** JACKET M74
**Price:** $628.00 USD
**Color:** Olive
**Composition:** 98% Coton 2% Élasthanne
**SKU:** 2GB2575 CBE308-441-FW25
**Product Group ID:** 14996615496062
**Image:** `https://us.masons.it/cdn/shop/files/2GB2575CBE308-441_5.jpg?v=1759738835&width=1920`

**Variants:**
| Size | GTIN | Availability |
|------|------|-------------|
| 46 | 1225000097020 | InStock |
| 48 | 1225000097037 | InStock |
| 50 | 1225000097044 | InStock |
| 52 | 1225000097051 | OutOfStock |
| 54 | 1225000097068 | OutOfStock |
| 56 | 1225000097075 | OutOfStock |
| 58 | 1225000097082 | OutOfStock |

**Variant URL pattern:** `/fr/products/[handle]?variant=[variant-id]`

### Example Product 2: New York Carrot Chino (Women's)
**URL:** `/fr/products/new-york-carrot-pantalon-chino-femme-en-laine-carrot-fit`
**Title:** New York Carrot pantalon chino femme en laine carrot fit
**Category:** NEW YORK CARROT
**Price:** $260.00 USD
**Fit:** Carrot
**Color:** Bleu foncé (Dark Blue)
**Composition:** 58% Polyester 21% Laine vierge 18% Viscose 03% Élasthanne
**SKU:** 4PNT2C240 MTE174-012-FW25
**Product Group ID:** 14996631224702
**Image:** `https://us.masons.it/cdn/shop/files/4PNT2C240MTE174012_3_0643abbc-9c4a-42d6-b830-b9ee1d936307.jpg`

**Variants (Size → GTIN):**
| Size | Availability |
|------|-------------|
| 36 | InStock |
| 38 | InStock |
| 40 | OutOfStock |
| 42 | OutOfStock |
| 44 | OutOfStock |
| 46 | OutOfStock |
| 48 | OutOfStock |

### Gift Card Product
**URL:** `/fr/products/gift-card`
**Title:** Carte-cadeau Mason
**Image:** `https://us.masons.it/cdn/shop/files/GIFTCARD_5b19e09b-04ae-4133-aee2-228dc619312d.jpg`
**Product Group ID:** 6837095694510

**Denominations (EUR → USD at 1.15591 rate):**
| EUR | USD |
|-----|-----|
| €100 | $115.59 |
| €150 | $173.39 |
| €200 | $231.18 |
| €250 | $288.98 |
| €500 | $577.96 |
| €750 | $866.93 |
| €1000 | $1,155.91 |
| €1500 | $1,733.87 |
| €2000 | $2,311.82 |
| €2500 | $2,889.78 |
| €3000 | $3,467.73 |

### JSON-LD Schema Pattern (ProductGroup)
```json
{
  "@context": "http://schema.org/",
  "@id": "/fr/products/[handle]#product",
  "@type": "ProductGroup",
  "brand": { "@type": "Brand", "name": "Mason's" },
  "category": "[PRODUCT CATEGORY]",
  "description": "Couleur : [color]\nComposition : [composition]\nCode : [sku]",
  "name": "[product title]",
  "productGroupID": "[id]",
  "url": "https://us.masons.it/fr/products/[handle]",
  "hasVariant": [
    {
      "@id": "/fr/products/[handle]?variant=[id]#variant",
      "@type": "Product",
      "gtin": "[gtin13]",
      "image": "https://us.masons.it/cdn/shop/files/[filename].jpg?v=[version]&width=1920",
      "name": "[title] - [size]",
      "sku": "[sku]",
      "offers": {
        "@id": "/fr/products/[handle]?variant=[id]#offer",
        "@type": "Offer",
        "availability": "http://schema.org/InStock|OutOfStock",
        "price": "[price]",
        "priceCurrency": "USD",
        "url": "https://us.masons.it/fr/products/[handle]?variant=[id]"
      }
    }
  ]
}
```

---

## 7. PRODUCT CATALOG (from sitemap — 400+ products, lastmod: 2026-03-25)

### Men's Products (sample handles)
- `field-jacket-m74-homme-en-coton-stretch`
- `field-jacket-m74-homme-en-coton-stretch` (multiple color variants)
- Cargo pants: Chile, Bolivia, San Andreas, San Luis, San Juan models
- Chino pants: New York, Harris models
- Jeans: Harris 5-pocket
- Dress pants: extra-slim, slim, regular, relaxed, carrot fits

### Women's Products (sample handles)
- `new-york-carrot-pantalon-chino-femme-en-laine-carrot-fit`
- Blazers: Helena, Irene models
- Field jackets and vests
- Sweats and hoodies
- Jackets: Karen, City Field, Icon models
- Cargo and chino pants (extensive variants)

### Accessories
- Mason's branded bags (multiple styles)
- Gift cards
- Merchandise (mugs, bottles)
- Perfumes (`/fr/collections/parfums`)

---

## 8. BRAND & STORE INFORMATION

- **Founded:** 1974
- **Origin:** Forte dei Marmi, Italy (Tuscan coast)
- **Positioning:** Italian luxury fashion, tailored trousers specialist
- **About page title:** "Qui nous sommes - Mode de Luxe Italienne | Mason's"
- **History page title:** "L'histoire d'une recherche et d'une passion pour la mode depuis 1974 | – Mason's"
- **Shopify backend:** masons-forte-dei-marmi.myshopify.com
- **US domain:** us.masons.it

### Page Templates (Liquid)
| Template Name | Page |
|--------------|------|
| `page.azienda` | Company/About |
| `page.storia` | History |
| `page.contatti` | Contacts |
| `page.faq` | FAQ |
| `page.wishlist` | Wishlist |
| `collection` | Collection |
| `list-collections` | Collections list |
| `cart` | Cart |
| `product` | Product |

---

## 9. TECHNICAL ARCHITECTURE SUMMARY

### Platform
- Shopify Plus/Enterprise (plan inferred from features)
- Custom theme "masons/main" built on Shopify Horizon base theme
- Component architecture: Web Components + Shadow DOM
- Module system: ES modules with import maps
- Rendering: Client-side (JS-rendered body content)

### Key Custom CSS Variables Count
~200+ variables covering colors, spacing, typography, shadows, animations, z-index layers, component-specific overrides.

### Security
- hCaptcha on forms (data-nocaptcha, data-hcaptcha-bound)
- reCAPTCHA fallback
- Pandectes GDPR CMP
- Shopify Captcha API

### Analytics Stack
- Google Tag Manager (GTM-MC27J74)
- Google Analytics (via GTM)
- Facebook Pixel
- TikTok Pixel
- Pinterest Pixel
- Klaviyo (TuLFF4)
- Triple Whale
- Trustpilot
- TrustedShops

### CDN Paths
- Theme assets: `//us.masons.it/cdn/shop/t/61/assets/`
- Store files: `https://cdn.shopify.com/s/files/1/0569/4010/1806/files/`
- Shopify static: `https://cdn.shopify.com/static/themes/horizon/`

---

## 10. LIMITATIONS OF THIS RECON

The site uses a fully client-side rendered (CSR) architecture. The WebFetch tool only retrieves raw HTML source which contains only the `<head>` section with infrastructure. **The following data was NOT extractable without a headless browser:**

1. Actual homepage section layout (hero banners, featured collections, lookbook, etc.)
2. Header navigation menu structure (full menu items)
3. Footer link structure
4. Collection page product grid (product names, prices, filter sidebar)
5. FAQ questions and answers
6. Contact form HTML structure
7. Size guide tables
8. About/history page body text
9. Announcement bar text
10. Promotional banner content
11. Cart drawer HTML structure

**Recommendation for next step:** Use a Playwright/Puppeteer headless browser script to render the pages after JS execution and extract the full DOM. Alternatively, use Shopify's Admin API (if credentials are available) to fetch products, collections, metafields, and page content directly.
