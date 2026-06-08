const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ms-care';

const Product = require('../models/Product');
const Category = require('../models/Category');

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { dbName: 'ms-care' });
    console.log(`✅ Connected to database: ${mongoose.connection.host}`);

    // 1. Check current categories in the database
    const categoriesBefore = await Category.find({});
    console.log('\n📂 Current categories in DB:');
    categoriesBefore.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

    // 2. Find and update products belonging to category "ransplant"
    const ransplantProducts = await Product.find({ category: 'ransplant' });
    console.log(`\n🔍 Found ${ransplantProducts.length} products belonging to 'ransplant'.`);
    if (ransplantProducts.length > 0) {
      const updateRx = await Product.updateMany(
        { category: 'ransplant' },
        { $set: { category: 'transplant', categoryName: 'Transplant' } }
      );
      console.log(`✅ Updated ${updateRx.modifiedCount} products from 'ransplant' to 'transplant'.`);
    }

    // 3. Find and update products belonging to category "cipla-ltd"
    const ciplaProducts = await Product.find({ category: 'cipla-ltd' });
    console.log(`\n🔍 Found ${ciplaProducts.length} products belonging to 'cipla-ltd'.`);
    if (ciplaProducts.length > 0) {
      for (const prod of ciplaProducts) {
        // Decide fallback category: default to 'prescription' if Rx required, otherwise 'others' or 'prescription'
        const newCategory = prod.prescriptionRequired ? 'prescription' : 'others';
        const newCategoryName = prod.prescriptionRequired ? 'Prescription Drugs' : 'Others';
        
        await Product.updateOne(
          { _id: prod._id },
          { $set: { category: newCategory, categoryName: newCategoryName } }
        );
        console.log(`  - Updated product '${prod.name}' from 'cipla-ltd' to '${newCategory}'.`);
      }
      console.log(`✅ Finished updating all products in 'cipla-ltd'.`);
    }

    // 4. Delete the erroneous categories from the Category collection
    const deleteCipla = await Category.deleteOne({ slug: 'cipla-ltd' });
    console.log(`\n🗑️ Deleted category 'cipla-ltd': ${deleteCipla.deletedCount} document(s)`);

    const deleteRansplant = await Category.deleteOne({ slug: 'ransplant' });
    console.log(`🗑️ Deleted category 'ransplant': ${deleteRansplant.deletedCount} document(s)`);

    // 5. Check categories after cleanup
    const categoriesAfter = await Category.find({});
    console.log('\n📂 Categories in DB after cleanup:');
    categoriesAfter.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));

    console.log('\n🎉 Cleanup successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanup();
