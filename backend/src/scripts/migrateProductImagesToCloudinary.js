const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const env = require('../config/env');
const Product = require('../models/Product');

// Ensure scratch directory exists for backups and caches
const scratchDir = path.join(__dirname, '../../scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const LOCAL_BACKUP_PATH = path.join(scratchDir, `products_backup_${TIMESTAMP}.json`);
const IMAGE_MAP_PATH = path.join(scratchDir, 'cloudinary_image_map.json');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

// Load existing image map cache if available (for resumability)
let imageMapCache = {};
if (fs.existsSync(IMAGE_MAP_PATH)) {
  try {
    imageMapCache = JSON.parse(fs.readFileSync(IMAGE_MAP_PATH, 'utf8'));
    console.log(`ℹ️  Loaded existing image map cache with ${Object.keys(imageMapCache).length} mapped URLs.`);
  } catch (e) {
    console.warn('⚠️  Could not parse existing image map cache, starting fresh.');
  }
}

function saveImageMapCache() {
  fs.writeFileSync(IMAGE_MAP_PATH, JSON.stringify(imageMapCache, null, 2), 'utf8');
}

/**
 * Upload single image URL to Cloudinary with retry
 */
async function uploadToCloudinary(url, retries = 2) {
  if (!url || typeof url !== 'string') return url;

  // Already hosted on Cloudinary
  if (url.includes('res.cloudinary.com')) {
    return url;
  }

  // Already in map cache
  if (imageMapCache[url]) {
    return imageMapCache[url];
  }

  // Skip generic placeholder if not needed, or upload it
  if (url.includes('placeholder.com')) {
    return url;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: 'ms-care/products',
        resource_type: 'image',
      });
      if (result && result.secure_url) {
        imageMapCache[url] = result.secure_url;
        return result.secure_url;
      }
    } catch (error) {
      if (attempt === retries) {
        console.warn(`  ⚠️ Failed to upload image after ${retries} attempts (${url}): ${error.message}`);
        return url; // fallback to original URL so nothing breaks
      }
      // Wait 1s before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return url;
}

/**
 * Process array of items with concurrency limit
 */
async function mapConcurrent(items, limit, fn) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runMigration() {
  console.log('====================================================');
  console.log('  🚀 PRODUCT IMAGE MIGRATION TO CLOUDINARY STARTED');
  console.log('====================================================\n');

  console.log(`🔌 Connecting to MongoDB Atlas (${env.mongoDbName})...`);
  await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
  const db = mongoose.connection.db;
  console.log('✅ Connected successfully.\n');

  // ----------------------------------------------------------------
  // STEP 1: CREATE BACKUPS
  // ----------------------------------------------------------------
  console.log('📦 STEP 1: Creating database backups...');

  const products = await Product.find({}).lean();
  console.log(`   Found ${products.length} products in production DB.`);

  // 1a. Local JSON file backup
  fs.writeFileSync(LOCAL_BACKUP_PATH, JSON.stringify(products, null, 2), 'utf8');
  console.log(`   ✅ Saved local JSON backup to: ${LOCAL_BACKUP_PATH}`);

  // 1b. MongoDB Atlas backup collection clone
  const backupCollectionName = `products_backup_${TIMESTAMP.replace(/-/g, '_')}`;
  console.log(`   Creating MongoDB backup collection: "${backupCollectionName}"...`);
  await db.collection('products').aggregate([{ $out: backupCollectionName }]).toArray();
  const backupCount = await db.collection(backupCollectionName).countDocuments();
  console.log(`   ✅ MongoDB backup collection created with ${backupCount} documents.\n`);

  if (backupCount !== products.length) {
    throw new Error(`Backup validation error: products count (${products.length}) != backup count (${backupCount})`);
  }

  // ----------------------------------------------------------------
  // STEP 2: COLLECT ALL UNIQUE IMAGE URLS
  // ----------------------------------------------------------------
  console.log('🔍 STEP 2: Collecting unique image URLs across products...');
  const uniqueUrls = new Set();

  products.forEach((p) => {
    if (p.image) uniqueUrls.add(p.image);
    if (p.images && Array.isArray(p.images)) {
      p.images.forEach((img) => {
        if (img.src) uniqueUrls.add(img.src);
        if (img.thumbnail) uniqueUrls.add(img.thumbnail);
      });
    }
  });

  const urlArray = Array.from(uniqueUrls).filter(
    (u) => u && !u.includes('res.cloudinary.com') && !u.includes('placeholder.com')
  );
  console.log(`   Total unique image URLs found: ${uniqueUrls.size}`);
  console.log(`   URLs requiring Cloudinary upload: ${urlArray.length}\n`);

  // ----------------------------------------------------------------
  // STEP 3: UPLOAD TO CLOUDINARY IN BATCHES
  // ----------------------------------------------------------------
  console.log('☁️  STEP 3: Uploading images to Cloudinary (Concurrency: 15)...');
  let processedCount = 0;
  let successCount = 0;
  let failedCount = 0;

  const CONCURRENCY = 15;

  await mapConcurrent(urlArray, CONCURRENCY, async (url, idx) => {
    const isNew = !imageMapCache[url];
    const newUrl = await uploadToCloudinary(url);

    processedCount++;
    if (newUrl.includes('res.cloudinary.com')) {
      successCount++;
    } else {
      failedCount++;
    }

    if (processedCount % 25 === 0 || processedCount === urlArray.length) {
      saveImageMapCache();
      const pct = ((processedCount / urlArray.length) * 100).toFixed(1);
      console.log(`   [${processedCount}/${urlArray.length}] (${pct}%) - Uploaded to Cloudinary (Success: ${successCount}, Failed/Fallback: ${failedCount})`);
    }

    return newUrl;
  });

  saveImageMapCache();
  console.log(`\n   ✅ Cloudinary upload complete! Cached ${Object.keys(imageMapCache).length} mapped image URLs.\n`);

  // ----------------------------------------------------------------
  // STEP 4: UPDATE PRODUCT DOCUMENTS IN MONGO DB
  // ----------------------------------------------------------------
  console.log('📝 STEP 4: Updating Product documents in MongoDB Atlas...');

  const bulkOps = [];
  let updatedProductsCount = 0;

  products.forEach((p) => {
    let modified = false;

    // Update main image
    let newMainImage = p.image;
    if (p.image && imageMapCache[p.image]) {
      newMainImage = imageMapCache[p.image];
      if (newMainImage !== p.image) modified = true;
    }

    // Update images array
    const newImagesArray = (p.images || []).map((img) => {
      let newSrc = img.src;
      let newThumb = img.thumbnail;

      if (img.src && imageMapCache[img.src]) {
        newSrc = imageMapCache[img.src];
        if (newSrc !== img.src) modified = true;
      }

      if (img.thumbnail && imageMapCache[img.thumbnail]) {
        newThumb = imageMapCache[img.thumbnail];
        if (newThumb !== img.thumbnail) modified = true;
      }

      return {
        ...img,
        src: newSrc,
        thumbnail: newThumb,
      };
    });

    if (modified) {
      updatedProductsCount++;
      bulkOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: {
            $set: {
              image: newMainImage,
              images: newImagesArray,
            },
          },
        },
      });
    }
  });

  console.log(`   Found ${updatedProductsCount} products requiring DB update.`);

  if (bulkOps.length > 0) {
    const BATCH_SIZE = 100;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await Product.bulkWrite(batch);
      console.log(`   ✅ DB Update Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(bulkOps.length / BATCH_SIZE)} saved (${batch.length} docs)`);
    }
  }
  console.log('   ✅ Database update finished.\n');

  // ----------------------------------------------------------------
  // STEP 5: FINAL AUDIT & VERIFICATION
  // ----------------------------------------------------------------
  console.log('🔬 STEP 5: Final Database Audit...');
  const updatedProducts = await Product.find({}).lean();

  let finalCloudinaryCount = 0;
  let finalOtherCount = 0;
  let finalPlaceholderCount = 0;

  updatedProducts.forEach((p) => {
    const urls = [p.image];
    if (p.images) {
      p.images.forEach((img) => {
        if (img.src) urls.push(img.src);
        if (img.thumbnail) urls.push(img.thumbnail);
      });
    }

    urls.forEach((u) => {
      if (!u) return;
      if (u.includes('res.cloudinary.com')) finalCloudinaryCount++;
      else if (u.includes('placeholder.com')) finalPlaceholderCount++;
      else finalOtherCount++;
    });
  });

  console.log('====================================================');
  console.log('  🎉 MIGRATION SUMMARY & VERIFICATION');
  console.log('====================================================');
  console.log(`  📦 Total Products:            ${updatedProducts.length}`);
  console.log(`  💾 Backup DB Collection:      ${backupCollectionName}`);
  console.log(`  💾 Backup Local JSON:         ${LOCAL_BACKUP_PATH}`);
  console.log(`  ☁️ Cloudinary Image URLs:    ${finalCloudinaryCount}`);
  console.log(`  🖼️ Placeholder URLs:         ${finalPlaceholderCount}`);
  console.log(`  ⚠️ Non-Cloudinary URLs:      ${finalOtherCount}`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB.');
}

runMigration().catch(async (err) => {
  console.error('\n❌ MIGRATION FAILED:', err);
  try {
    await mongoose.disconnect();
  } catch (e) {}
  process.exit(1);
});
