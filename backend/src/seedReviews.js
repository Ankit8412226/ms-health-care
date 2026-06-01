const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');

const indianReviewers = [
  { name: "Amit Sharma", email: "amit.sharma@gmail.com", phone: "+91 98765 43201" },
  { name: "Rajesh Patel", email: "rajesh.patel@gmail.com", phone: "+91 98765 43202" },
  { name: "Priya Iyer", email: "priya.iyer@gmail.com", phone: "+91 98765 43203" },
  { name: "Sneha Reddy", email: "sneha.reddy@gmail.com", phone: "+91 98765 43204" },
  { name: "Vikram Singh", email: "vikram.singh@gmail.com", phone: "+91 98765 43205" },
  { name: "Sandeep Verma", email: "sandeep.verma@gmail.com", phone: "+91 98765 43206" },
  { name: "Sunita Gupta", email: "sunita.gupta@gmail.com", phone: "+91 98765 43207" },
  { name: "Meera Nair", email: "meera.nair@gmail.com", phone: "+91 98765 43208" },
  { name: "Rahul Joshi", email: "rahul.joshi@gmail.com", phone: "+91 98765 43209" },
  { name: "Anjali Choudhary", email: "anjali.c@gmail.com", phone: "+91 98765 43210" },
  { name: "Deepak Saxena", email: "deepak.s@gmail.com", phone: "+91 98765 43211" },
  { name: "Rohan Deshmukh", email: "rohan.d@gmail.com", phone: "+91 98765 43212" },
  { name: "Shalini Sen", email: "shalini.sen@gmail.com", phone: "+91 98765 43213" },
  { name: "Ramesh Rao", email: "ramesh.rao@gmail.com", phone: "+91 98765 43214" },
  { name: "Kavitha Krishnan", email: "kavitha.k@gmail.com", phone: "+91 98765 43215" },
  { name: "Manoj Mishra", email: "manoj.mishra@gmail.com", phone: "+91 98765 43216" },
  { name: "Divya Pillai", email: "divya.pillai@gmail.com", phone: "+91 98765 43217" },
  { name: "Suresh Hegde", email: "suresh.hegde@gmail.com", phone: "+91 98765 43218" },
  { name: "Neha Bhatia", email: "neha.bhatia@gmail.com", phone: "+91 98765 43219" },
  { name: "Vikram Malhotra", email: "vikram.m@gmail.com", phone: "+91 98765 43220" }
];

const categoryReviewTemplates = {
  // Vaccines
  vaccine: [
    { rating: 5, comment: "Very reliable vaccine. Oncolife India's cold chain delivery was excellent, ice packs were completely intact." },
    { rating: 5, comment: "Got this pediatric vaccine on time. Standard batch and original packaging. Highly recommended." },
    { rating: 4, comment: "Genuine vaccine product, batch details matched. Doctor verified and administered without issues." },
    { rating: 5, comment: "Excellent clinical logistics. Sourced vaccine at a very good discount. Thank you." }
  ],
  
  // Transplant medicines
  transplant: [
    { rating: 5, comment: "Life-saving transplant medicine. Hard to find in local stores but got it here easily with long expiry." },
    { rating: 5, comment: "Authentic immunosuppressant, prompt shipping. The price discount is a huge help for transplant patients." },
    { rating: 4, comment: "Physician verified the batch number. Standard manufacturer packing. Good support team." },
    { rating: 5, comment: "Genuine medicine. Oncolife India is highly reliable for critical post-transplant care medicines." }
  ],

  // Oncology/Anti-cancer
  oncology: [
    { rating: 5, comment: "Genuine anti-cancer drug. Oncolife India is doing a great job helping patients get authentic therapy." },
    { rating: 5, comment: "Excellent price discount for critical treatment medicine. Barcode and serial number verified on manufacturer portal." },
    { rating: 4, comment: "Sourced this oncology tablet easily. Expiry date is 18 months away. Proper sealed packaging." },
    { rating: 5, comment: "Original chemotherapy medication. Very prompt delivery, which was extremely critical for my therapy cycle." },
    { rating: 5, comment: "High quality oncology care. Saved significant costs compared to local retail outlets. Very satisfied." }
  ],

  // Critical Care Injections / Infusions / Immunoglobulins
  critical_injection: [
    { rating: 5, comment: "Hospital-grade injection, delivered in perfect condition. Packaging was fully sealed in a cool box." },
    { rating: 5, comment: "Sourced this critical care injection easily. Standard temperature-controlled delivery. Very reliable service." },
    { rating: 4, comment: "Genuine infusion. The doctor verified the batch details before administration. Great pricing." },
    { rating: 5, comment: "Oncolife India is highly reliable for critical infusions. Got prompt shipping and proper invoicing." },
    { rating: 5, comment: "Genuine albumin infusion, very professional packaging. Extremely satisfied with Oncolife." }
  ],

  // Diabetes Care
  diabetes: [
    { rating: 5, comment: "Regular buyer for my father. Controls blood sugar levels perfectly. Best rate online." },
    { rating: 5, comment: "Fast delivery, got standard strips with long shelf life. Excellent service." },
    { rating: 4, comment: "Good discounts on monthly medicine subscription. Recommended for diabetes care." },
    { rating: 5, comment: "Original product. Quick billing and standard shipping. Happy with Oncolife India." }
  ],

  // Heart Health
  heart: [
    { rating: 5, comment: "Highly reliable for cardiac care. Original Cipla product. Expiry date is far off." },
    { rating: 4, comment: "My cardiologist recommended this brand. Happy to find it here at a discounted price." },
    { rating: 5, comment: "Prompt delivery and original batch validation. Will buy again." }
  ],

  // Health Devices
  devices: [
    { rating: 5, comment: "Very accurate readings. Extremely easy to use for daily health tracking. Good product." },
    { rating: 4, comment: "Build quality is solid and user manual is clear. Helpful for elders at home." },
    { rating: 5, comment: "Excellent brand, original packaging, and fast shipment. Highly satisfied." },
    { rating: 4, comment: "Product is very good. Delivery took two days but the packaging was very secure." }
  ],

  // Skin Care
  skin: [
    { rating: 5, comment: "Super gentle on skin, perfect for sensitive skin types. Authentic Galderma product." },
    { rating: 5, comment: "Dermatologist recommended this. Best price and original product on Oncolife." },
    { rating: 4, comment: "Hydrates well without making skin greasy. Worth every rupee." },
    { rating: 5, comment: "Very good product. Packaging was neat and delivered quickly." }
  ],

  // Ayurvedic
  ayurvedic: [
    { rating: 5, comment: "Excellent natural immunity booster. Standard product in our daily routine." },
    { rating: 5, comment: "Great discount on the standard jar. Original Ayurvedic ingredients and premium brand." },
    { rating: 4, comment: "Authentic herbal taste. Fast shipping by Oncolife India." },
    { rating: 5, comment: "Very good quality, protects from cold and cough effectively." }
  ],

  // Baby Care
  baby: [
    { rating: 5, comment: "Safe and natural for infants. Relieves colic and gas very quickly. Trusted brand." },
    { rating: 5, comment: "Extremely helpful for pediatric digestion issues. Safe ayurvedic ingredients." },
    { rating: 4, comment: "Received authentic drops with dropper. Very convenient." }
  ],

  // General Prescription Medicines / Fallback
  general_medicine: [
    { rating: 5, comment: "Authentic prescription medicine. Good expiry date and proper sealed packaging." },
    { rating: 5, comment: "Oncolife India is my go-to pharmacy now. Excellent customer support and genuine product." },
    { rating: 4, comment: "Highly satisfied with the product quality. Saved a good amount compared to offline shops." },
    { rating: 5, comment: "Prompt delivery and genuine manufacturer packing. Safe and secure." }
  ]
};

const selectTemplates = (product) => {
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const catName = (product.categoryName || '').toLowerCase();

  // 1. Vaccine check
  if (name.includes('vaccine') || name.includes('vax') || cat.includes('vaccine') || catName.includes('vaccine')) {
    return categoryReviewTemplates.vaccine;
  }

  // 2. Oncology/Anti-cancer check
  if (
    cat.includes('cancer') || cat.includes('onco') || catName.includes('cancer') || catName.includes('onco') || 
    name.includes('lenalid') || name.includes('probret') || name.includes('temozolomide') || 
    name.includes('gefitinib') || name.includes('erlotinib') || name.includes('imatinib') || 
    name.includes('sorafenib') || name.includes('bortezomib') || name.includes('decitabine') ||
    name.includes('rituximab') || name.includes('trastuzumab') || name.includes('gemcitabine') ||
    name.includes('abiraterone') || name.includes('anastrozole') || name.includes('bicalutamide') ||
    name.includes('carboplatin') || name.includes('cisplatin') || name.includes('cyclophosphamide')
  ) {
    return categoryReviewTemplates.oncology;
  }

  // 3. Transplant check
  if (
    cat.includes('transplant') || catName.includes('transplant') || 
    name.includes('mofecon') || name.includes('tacro') || name.includes('mycophenol') || 
    name.includes('cyclosporin') || name.includes('sirolimus') || name.includes('azathioprine')
  ) {
    return categoryReviewTemplates.transplant;
  }

  // 4. Critical Care Injections / Infusions / Immunoglobulins / Specialty Nephrology Injections
  if (
    cat.includes('immunoglobulin') || catName.includes('immunoglobulin') || 
    cat.includes('nephro') || catName.includes('nephro') ||
    name.includes('injection') || name.includes('infusion') || name.includes('inj') || 
    name.includes('fcm') || name.includes('ferinject') || name.includes('orofer') || 
    name.includes('alburel') || name.includes('bumin') || name.includes('sucrofer') || 
    name.includes('ivferox') || name.includes('vial') || name.includes('ampoule') ||
    name.includes('epoetin') || name.includes('darbepoetin') || name.includes('heparin')
  ) {
    return categoryReviewTemplates.critical_injection;
  }

  // 5. Diabetes Care
  if (
    cat.includes('diabet') || catName.includes('diabet') || 
    name.includes('metformin') || name.includes('glycomet') || name.includes('insulin') ||
    name.includes('glimepiride') || name.includes('vildagliptin') || name.includes('teneligliptin')
  ) {
    return categoryReviewTemplates.diabetes;
  }

  // 6. Heart Health
  if (
    cat.includes('heart') || catName.includes('heart') || cat.includes('cardio') || 
    name.includes('atorvastatin') || name.includes('lipivas') || name.includes('rosuvastatin') ||
    name.includes('telmisartan') || name.includes('amlodipine') || name.includes('clopidogrel')
  ) {
    return categoryReviewTemplates.heart;
  }

  // 7. Health Devices
  if (
    cat.includes('device') || catName.includes('device') || 
    name.includes('monitor') || name.includes('omron') || name.includes('thermometer') || 
    name.includes('oximeter') || name.includes('nebulizer')
  ) {
    return categoryReviewTemplates.devices;
  }

  // 8. Skin Care
  if (
    cat.includes('skin') || catName.includes('skin') || 
    name.includes('cleanser') || name.includes('cream') || name.includes('lotion') ||
    name.includes('cetaphil') || name.includes('gel') || name.includes('soap') || name.includes('ointment')
  ) {
    return categoryReviewTemplates.skin;
  }

  // 9. Ayurvedic
  if (
    cat.includes('ayur') || catName.includes('ayur') || 
    name.includes('chyawanprash') || name.includes('ashwagandha') || name.includes('shilajit') ||
    name.includes('dabur') || name.includes('himalaya') || name.includes('patanjali')
  ) {
    return categoryReviewTemplates.ayurvedic;
  }

  // 10. Baby Care
  if (
    cat.includes('baby') || catName.includes('baby') || 
    name.includes('drops') || name.includes('diaper') || name.includes('cerelac')
  ) {
    return categoryReviewTemplates.baby;
  }

  // Fallback to General Prescription Medicine
  return categoryReviewTemplates.general_medicine;
};

const seedReviews = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    // 1. Delete all existing reviews to start fresh
    console.log('🗑️  Clearing existing reviews...');
    await Review.deleteMany({});
    console.log('✅ Existing reviews cleared.');

    // 2. Fetch or create the Indian reviewer users in DB
    console.log('👤 Fetching/Creating reviewer users...');
    const userIds = [];
    
    for (const reviewer of indianReviewers) {
      let user = await User.findOne({ email: reviewer.email });
      if (!user) {
        user = await User.create({
          name: reviewer.name,
          email: reviewer.email,
          password: "reviewpassword123",
          phone: reviewer.phone,
          role: "user"
        });
        console.log(`   Created user: ${user.name}`);
      } else {
        userIds.push(user);
      }
    }
    console.log(`✅ Loaded ${userIds.length} reviewer users.`);

    // 3. Fetch all products
    console.log('💊 Fetching products...');
    const products = await Product.find({});
    console.log(`✅ Found ${products.length} products to seed reviews for.`);

    if (products.length === 0) {
      console.log('⚠️  No products found. Please seed products first using seeder.js or importer.js');
      process.exit(0);
    }

    // Helper to shuffle array
    const shuffleArray = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const reviewsToInsert = [];
    const productBulkOps = [];

    // 4. Generate Review documents and Product update operations in memory
    console.log('⚡ Generating reviews and updates for all products...');
    for (const product of products) {
      const templates = selectTemplates(product);
      
      const reviewCount = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5 reviews
      const selectedReviewers = shuffleArray(userIds).slice(0, reviewCount);
      const selectedTemplates = shuffleArray(templates);

      let ratingsSum = 0;
      let actualReviewCount = 0;

      for (let i = 0; i < selectedReviewers.length; i++) {
        const reviewer = selectedReviewers[i];
        const template = selectedTemplates[i % selectedTemplates.length] || templates[0];

        let rating = template.rating;
        const rand = Math.random();
        if (rand < 0.1 && rating === 5) rating = 4;
        else if (rand < 0.05 && rating === 4) rating = 5;

        reviewsToInsert.push({
          user: reviewer._id,
          userName: reviewer.name,
          product: product._id,
          rating: rating,
          comment: template.comment
        });

        ratingsSum += rating;
        actualReviewCount++;
      }

      if (actualReviewCount > 0) {
        const avgRating = ratingsSum / actualReviewCount;
        productBulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: actualReviewCount
              }
            }
          }
        });
      }
    }

    // 5. Perform bulk insert of reviews
    console.log(`📦 Bulk inserting ${reviewsToInsert.length} reviews...`);
    if (reviewsToInsert.length > 0) {
      await Review.insertMany(reviewsToInsert, { ordered: false });
      console.log('   ✅ Reviews bulk inserted successfully.');
    }

    // 6. Perform bulk update of products
    console.log(`🚀 Bulk updating ${productBulkOps.length} products...`);
    if (productBulkOps.length > 0) {
      const bulkResult = await Product.bulkWrite(productBulkOps);
      console.log(`   ✅ Products bulk updated: modified ${bulkResult.modifiedCount} products.`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('   🎉 REVIEWS BULK SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`   Total Reviews Created: ${reviewsToInsert.length}`);
    console.log(`   Products Updated:      ${productBulkOps.length}`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error bulk seeding reviews: ${error.message}`);
    process.exit(1);
  }
};

seedReviews();
