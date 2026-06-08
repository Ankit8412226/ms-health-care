/**
 * WooCommerce → MongoDB Migration Script
 * 
 * Fetches ALL products from the WooCommerce REST API (with pagination),
 * maps fields to our Product & Category Mongoose schemas,
 * and bulk-inserts into MongoDB Atlas.
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config();

// ── WooCommerce API Config ──────────────────────────────────────────────
const WC_BASE_URL = 'https://oncomshealthcare.com/wp-json/wc/v3/products';
const WC_CONSUMER_KEY = 'ck_4e608eb36de389039fd78bc5849889e73ff70bf2';
const WC_CONSUMER_SECRET = 'cs_462f9e5adb12322ce447f85b933f9b82b295e92e';
const PER_PAGE = 100; // max WooCommerce allows

// ── Utility: Strip HTML tags ────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')     // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&#8377;/g, '₹')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00b0/g, '°')
    .replace(/\u2019/g, "'")
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Get meta_data field by key ──────────────────────────────────────────
function getMeta(metaArr, key) {
  if (!metaArr || !Array.isArray(metaArr)) return null;
  const entry = metaArr.find((m) => m.key === key);
  return entry ? entry.value : null;
}

// ── Extract custom tab content ──────────────────────────────────────────
function getTabContent(metaArr, tabTitle) {
  const tabs = getMeta(metaArr, 'wb_custom_tabs');
  if (!tabs || !Array.isArray(tabs)) return null;
  const tab = tabs.find((t) => t.title && t.title.toLowerCase() === tabTitle.toLowerCase());
  return tab ? stripHtml(tab.content) : null;
}

// ── Extract side effects as array ───────────────────────────────────────
function extractSideEffects(metaArr) {
  const tabs = getMeta(metaArr, 'wb_custom_tabs');
  if (!tabs || !Array.isArray(tabs)) return [];
  const sideTab = tabs.find((t) => t.title && t.title.toLowerCase() === 'side effects');
  if (!sideTab || !sideTab.content) return [];

  // Try to extract <li> items first
  const liMatches = sideTab.content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches.map((li) => stripHtml(li)).filter(Boolean);
  }

  // Fallback: split by <p> tags
  const pMatches = sideTab.content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  if (pMatches && pMatches.length > 0) {
    return pMatches.map((p) => stripHtml(p)).filter(Boolean);
  }

  return [stripHtml(sideTab.content)];
}

// ── Parse _product_notes into packSize + storage ────────────────────────
function parseProductNotes(metaArr) {
  const notes = getMeta(metaArr, '_product_notes');
  if (!notes) return { packSize: 'N/A', storage: 'Store as directed.' };

  const lines = notes.split(/\r?\n/).filter(Boolean);
  let packSize = 'N/A';
  let storage = 'Store as directed.';

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('weight/quantity:')) {
      packSize = trimmed.replace(/^weight\/quantity:\s*/i, '').trim();
    } else if (trimmed.toLowerCase().startsWith('store') || trimmed.toLowerCase().includes('store')) {
      storage = trimmed;
    }
  }

  return { packSize, storage };
}

// ── Map a single WooCommerce product → our Product schema ───────────────
function mapWcProduct(wc) {
  const meta = wc.meta_data || [];

  // Category
  const cat = wc.categories && wc.categories.length > 0 ? wc.categories[0] : null;
  let categorySlug = cat ? cat.slug : 'uncategorized';
  let categoryName = cat ? cat.name : 'Uncategorized';

  if (categorySlug === 'ransplant') {
    categorySlug = 'transplant';
    categoryName = 'Transplant';
  } else if (categorySlug === 'cipla-ltd') {
    const rxReq = getMeta(meta, '_prescription_required') === 'yes';
    categorySlug = rxReq ? 'prescription' : 'others';
    categoryName = rxReq ? 'Prescription Drugs' : 'Others';
  }

  // Brand
  const brandObj = wc.brands && wc.brands.length > 0 ? wc.brands[0] : null;
  const brand = brandObj ? brandObj.name : (getMeta(meta, '_medicine_company') || 'Unknown');

  // Prices
  const salePrice = parseFloat(wc.sale_price || wc.price || '0');
  const regularPrice = parseFloat(wc.regular_price || wc.price || '0');

  // Images
  const images = (wc.images || []).map((img) => ({
    id: img.id,
    src: img.src,
    alt: img.alt || wc.name,
    thumbnail: img.thumbnail || img.src,
  }));

  const mainImage = images.length > 0 ? images[0].src : 'https://via.placeholder.com/500x500?text=No+Image';

  // Meta fields
  const salt = getMeta(meta, '_medicine_salt') || '';
  const manufacturer = getMeta(meta, '_medicine_company') || brand;
  const dosage = getMeta(meta, '_medicine_dosage') || '';
  const prescriptionRequired = getMeta(meta, '_prescription_required') === 'yes';

  // Product notes
  const { packSize, storage } = parseProductNotes(meta);

  // Tab content
  const benefits = getTabContent(meta, 'Benefits') || stripHtml(wc.short_description) || 'Consult your doctor.';
  const howToUse = getTabContent(meta, 'How to Use') || getTabContent(meta, 'How to use') || 'Take as directed by your physician.';
  const sideEffects = extractSideEffects(meta);

  return {
    name: wc.name,
    slug: wc.slug,
    description: stripHtml(wc.description) || 'No description available.',
    shortDescription: stripHtml(wc.short_description) || 'No description available.',
    price: salePrice || regularPrice,
    regularPrice: regularPrice || salePrice,
    onSale: wc.on_sale || false,
    rating: parseFloat(wc.average_rating) || 0,
    reviewCount: wc.rating_count || 0,
    category: categorySlug,
    categoryName: categoryName,
    brand: brand,
    images: images,
    image: mainImage,
    salt: salt,
    dosage: dosage,
    manufacturer: manufacturer,
    prescriptionRequired: prescriptionRequired,
    packSize: packSize,
    storage: storage,
    howToUse: howToUse,
    sideEffects: sideEffects,
    benefits: benefits,
  };
}

// ── Fetch all products with pagination ──────────────────────────────────
async function fetchAllProducts() {
  const allProducts = [];
  let page = 1;
  let hasMore = true;

  console.log('📡 Fetching products from WooCommerce API...\n');

  while (hasMore) {
    const url = `${WC_BASE_URL}?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}&per_page=${PER_PAGE}&page=${page}`;
    
    console.log(`   Fetching page ${page}...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();

    if (!products || products.length === 0) {
      hasMore = false;
    } else {
      allProducts.push(...products);
      console.log(`   ✅ Got ${products.length} products (total so far: ${allProducts.length})`);

      // Check total pages from response headers
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);
      if (page >= totalPages) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }

  console.log(`\n📦 Total products fetched: ${allProducts.length}\n`);
  return allProducts;
}

// ── Main Migration Function ─────────────────────────────────────────────
async function migrateData() {
  const MONGO_URI = process.env.MONGO_URI;
  
  if (!MONGO_URI || MONGO_URI.includes('localhost')) {
    console.error('❌ MONGO_URI is not set to Atlas. Update your .env file.');
    process.exit(1);
  }

  try {
    // 1. Connect to MongoDB Atlas
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { dbName: 'ms-care' });
    console.log(`✅ Connected to: ${mongoose.connection.host}\n`);

    // 2. Fetch all WooCommerce products
    const wcProducts = await fetchAllProducts();

    if (wcProducts.length === 0) {
      console.log('⚠️  No products found on WooCommerce. Exiting.');
      process.exit(0);
    }

    // 3. Map products
    console.log('🔄 Mapping WooCommerce data to our schema...');
    const mappedProducts = wcProducts.map(mapWcProduct);

    // 4. Extract unique categories
    const categoryMap = new Map();
    for (const p of mappedProducts) {
      if (!categoryMap.has(p.category)) {
        categoryMap.set(p.category, {
          name: p.categoryName,
          slug: p.category,
          icon: 'LayoutGrid', // Default icon; can be manually updated later
        });
      }
    }
    const categories = Array.from(categoryMap.values());
    console.log(`   Found ${categories.length} unique categories`);
    console.log(`   Mapped ${mappedProducts.length} products\n`);

    // 5. Clear existing data
    console.log('🗑️  Clearing existing Products & Categories in DB...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('   ✅ Cleared.\n');

    // 6. Insert Categories
    console.log('📂 Inserting categories...');
    const insertedCategories = await Category.insertMany(categories, { ordered: false });
    console.log(`   ✅ Inserted ${insertedCategories.length} categories\n`);

    // 7. Insert Products (in batches of 50 to avoid timeouts)
    console.log('💊 Inserting products...');
    const BATCH_SIZE = 50;
    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < mappedProducts.length; i += BATCH_SIZE) {
      const batch = mappedProducts.slice(i, i + BATCH_SIZE);
      try {
        const result = await Product.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        console.log(`   ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${result.length} products`);
      } catch (err) {
        if (err.insertedDocs) {
          insertedCount += err.insertedDocs.length;
          skippedCount += batch.length - err.insertedDocs.length;
          console.log(`   ⚠️  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${err.insertedDocs.length}, skipped ${batch.length - err.insertedDocs.length} (duplicates/validation errors)`);
        } else {
          console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, err.message);
          skippedCount += batch.length;
        }
      }
    }

    console.log(`\n   Total inserted: ${insertedCount}`);
    if (skippedCount > 0) console.log(`   Total skipped: ${skippedCount}`);

    // 8. Seed admin user if not exists
    console.log('\n👤 Checking admin user...');
    await User.deleteOne({ email: 'admin@mscare.com' });
    const existingAdmin = await User.findOne({ email: 'admin@oncolifeindia.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: 'admin@oncolifeindia.com',
        password: 'admin123',
        phone: '+91 99999 88888',
        role: 'admin',
      });
      console.log('   ✅ Admin user created (admin@oncolifeindia.com / admin123)');
    } else {
      console.log('   ℹ️  Admin user already exists, skipping.');
    }

    // 9. Summary
    console.log('\n═══════════════════════════════════════════');
    console.log('   🎉 MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`   📂 Categories: ${insertedCategories.length}`);
    console.log(`   💊 Products:   ${insertedCount}`);
    console.log(`   ⏭️  Skipped:    ${skippedCount}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.writeErrors) {
      console.error('Write errors:', error.writeErrors.map(e => e.errmsg).join('\n'));
    }
    process.exit(1);
  }
}

migrateData();
