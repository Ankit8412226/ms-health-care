const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  { name: "Prescription Drugs", slug: "prescription", icon: "Pill" },
  { name: "Transplant", slug: "transplant", icon: "HeartPulse" },
  { name: "Diabetes Care", slug: "diabetes", icon: "Activity" },
  { name: "Heart Health", slug: "heart", icon: "HeartPulse" },
  { name: "Vitamins & OTC", slug: "vitamins", icon: "Sparkles" },
  { name: "Health Devices", slug: "devices", icon: "ShieldAlert" },
  { name: "Baby Care", slug: "baby", icon: "Baby" },
  { name: "Skin Care", slug: "skin", icon: "Sun" },
  { name: "Ayurvedic", slug: "ayurvedic", icon: "Leaf" }
];

const products = [
  {
    name: "Mofecon-S 360mg Tablet",
    slug: "mofecon-s-360mg-tablet",
    description: "Mofecon-S 360 mg Tablet is an immunosuppressant containing Mycophenolate sodium (an IMPDH inhibitor). It is used with other medicines to prevent organ rejection after kidney, heart, or liver transplantation.",
    shortDescription: "Mofecon-S 360 mg Tablet DR is an immunosuppressant used after organ transplants (kidney, heart, or liver) to prevent rejection by lowering the body's immune response.",
    price: 170,
    regularPrice: 799,
    category: "transplant",
    categoryName: "Transplant",
    brand: "CONCORD BIOTECH LIMITED",
    images: [
      {
        id: 14860,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A.webp",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A-300x250.jpeg"
      },
      {
        id: 14861,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AA.webp",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AA-300x250.webp"
      }
    ],
    image: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A.webp",
    salt: "Mycophenolate sodium (360mg)",
    dosage: "360MG",
    manufacturer: "Concord Biotech Ltd",
    prescriptionRequired: true,
    packSize: "10 Tablets in 1 Strip",
    storage: "Store below 30°C. Protect from light and moisture.",
    howToUse: "Take this medicine exactly in the dose and for the duration prescribed by your doctor.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Headache"],
    benefits: "Mofecon-S 360 mg Tablet is an immunosuppressant containing Mycophenolate sodium, an IMPDH inhibitor. It is used with other immunosuppressive medicines to prevent organ rejection after kidney, heart, or liver transplantation."
  },
  {
    name: "Metformin Glycomet 500mg SR",
    slug: "metformin-glycomet-500mg-sr",
    description: "Glycomet 500mg Tablet SR is a medicine used to treat Type 2 diabetes mellitus. It helps control blood sugar levels and thereby prevents serious complications of diabetes.",
    shortDescription: "Sustained-release Metformin tablet for Type 2 diabetes management. Controls blood glucose and improves insulin response.",
    price: 145,
    regularPrice: 180,
    category: "diabetes",
    categoryName: "Diabetes Care",
    brand: "USV Private Ltd",
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
        alt: "Metformin Glycomet 500mg SR",
        thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500",
    salt: "Metformin Hydrochloride IP 500mg",
    dosage: "500MG",
    manufacturer: "USV Private Ltd",
    prescriptionRequired: true,
    packSize: "15 Tablets in a strip",
    storage: "Store below 30°C. Protect from light and moisture.",
    howToUse: "To be swallowed whole, not chewed or crushed. Usually taken with or after meals.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain"],
    benefits: "Controls blood glucose levels efficiently. Reduces the risk of cardiovascular events in Type 2 diabetic patients."
  },
  {
    name: "Atorvastatin Lipivas 10mg",
    slug: "atorvastatin-lipivas-10mg",
    description: "Lipivas 10mg is a statin medication used to lower high cholesterol levels and reduce the risk of stroke, heart attack, or other blood vessel complications in patients with cardiac risks.",
    shortDescription: "Atorvastatin tablet to lower LDL cholesterol and protect against cardiovascular events.",
    price: 210,
    regularPrice: 280,
    category: "heart",
    categoryName: "Heart Health",
    brand: "Cipla Pharmaceuticals",
    images: [
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500",
        alt: "Atorvastatin Lipivas 10mg",
        thumbnail: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500",
    salt: "Atorvastatin Calcium IP 10mg",
    dosage: "10MG",
    manufacturer: "Cipla Pharmaceuticals",
    prescriptionRequired: true,
    packSize: "10 Tablets in a strip",
    storage: "Store in a cool dry place.",
    howToUse: "Can be taken with or without food, but preferably at a fixed time in the evening.",
    sideEffects: ["Muscle pain", "Headache", "Abdominal pain"],
    benefits: "Lowers bad LDL cholesterol and triglycerides. Increases good HDL cholesterol levels."
  },
  {
    name: "Omron HEM-7120 Smart BP Monitor",
    slug: "omron-hem-7120-smart-bp-monitor",
    description: "The Omron HEM-7120 is a fully automatic upper arm blood pressure monitor. It operates on the oscillometric principle, delivering precise systolic, diastolic, and pulse measurements.",
    shortDescription: "Fully automatic upper arm BP monitor with IntelliSense technology and irregular heartbeat detection.",
    price: 1999,
    regularPrice: 2790,
    category: "devices",
    categoryName: "Health Devices",
    brand: "Omron Healthcare Japan",
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500",
        alt: "Omron HEM-7120 Smart BP Monitor",
        thumbnail: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500",
    manufacturer: "Omron Healthcare Japan",
    prescriptionRequired: false,
    packSize: "1 Unit (Includes Monitor, Cuff, Batteries, Manual)",
    storage: "Keep in a dust-free dry container. Avoid dropping the device.",
    howToUse: "Wrap the cuff snuggly around the upper left arm, 1-2 cm above the elbow crease.",
    sideEffects: ["None under regular usage instructions"],
    benefits: "User-friendly single-button measurement. Equipped with IntelliSense technology for customized inflation."
  },
  {
    name: "Multivitamin A-Z Vitality Capsule",
    slug: "multivitamin-a-z-vitality-capsule",
    description: "A-Z Vitality capsules provide a comprehensive blend of daily micronutrients, active Korean ginseng extract, and essential trace elements.",
    shortDescription: "Daily multivitamin with ginseng, Vitamin C, D3, B12, and Zinc for immunity and energy.",
    price: 350,
    regularPrice: 420,
    category: "vitamins",
    categoryName: "Vitamins & OTC",
    brand: "Abbott Healthcare",
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500",
        alt: "Multivitamin A-Z Vitality Capsule",
        thumbnail: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500",
    salt: "Multi-Minerals, Amino Acids, Ginseng, Vitamin C, D3, B12, Zinc",
    manufacturer: "Abbott Healthcare",
    prescriptionRequired: false,
    packSize: "30 Capsules in a bottle",
    storage: "Store in a cool, dark, and dry place. Keep out of reach of children.",
    howToUse: "One softgel capsule daily with breakfast or milk.",
    sideEffects: ["Mild stomach upset if taken on empty stomach"],
    benefits: "Replenishes micro-nutrients in daily diets. Ginseng enhances stamina and stress resilience."
  },
  {
    name: "Cetaphil Gentle Skin Cleanser",
    slug: "cetaphil-gentle-skin-cleanser",
    description: "This soap-free, non-comedogenic gentle cleanser is clinically proven to clean deeply, hydrate dry skin, and preserve the natural skin barrier.",
    shortDescription: "Soap-free, hypoallergenic cleanser for sensitive and dry skin. Preserves natural moisture barrier.",
    price: 395,
    regularPrice: 450,
    category: "skin",
    categoryName: "Skin Care",
    brand: "Galderma India Pvt Ltd",
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
        alt: "Cetaphil Gentle Skin Cleanser",
        thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    manufacturer: "Galderma India Pvt Ltd",
    prescriptionRequired: false,
    packSize: "250ml Pump Bottle",
    storage: "Store below 25°C. Do not freeze.",
    howToUse: "Apply to skin and massage gently.",
    sideEffects: ["Extremely rare mild irritation on hypersensitive skin"],
    benefits: "Hypoallergenic formula free of fragrance, parabens, and soap. Locks in natural skin moisture."
  },
  {
    name: "Dabur Chyawanprash Double Immunity",
    slug: "dabur-chyawanprash-double-immunity",
    description: "Dabur Chyawanprash is a time-tested ancient Ayurvedic formulation containing over 45 essential herbs like Amla, Ashwagandha, and Giloy.",
    shortDescription: "Ayurvedic immunity booster with 45+ herbs including Amla, Ashwagandha, and Giloy.",
    price: 299,
    regularPrice: 350,
    category: "ayurvedic",
    categoryName: "Ayurvedic",
    brand: "Dabur India Ltd",
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500",
        alt: "Dabur Chyawanprash Double Immunity",
        thumbnail: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500",
    manufacturer: "Dabur India Ltd",
    prescriptionRequired: false,
    packSize: "500g Jar",
    storage: "Close cap tightly after every use. Store in a dry hygienic place.",
    howToUse: "1-2 teaspoons twice a day for adults, 1/2 teaspoon for kids.",
    sideEffects: ["None known. High glycemic index — diabetes patients should use Sugar-Free version."],
    benefits: "Boosts antibody production for defense against colds and viruses."
  },
  {
    name: "Himalaya Bonnisan Baby Drops",
    slug: "himalaya-bonnisan-baby-drops",
    description: "Bonnisan is a natural, clinically tested pediatric digestive tonic. It relieves common pediatric gastrointestinal disorders like colic, flatulence, gas, and indigestion.",
    shortDescription: "Natural pediatric digestive tonic for colic, gas, and indigestion in infants.",
    price: 95,
    regularPrice: 110,
    category: "baby",
    categoryName: "Baby Care",
    brand: "The Himalaya Drug Company",
    images: [
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=500",
        alt: "Himalaya Bonnisan Baby Drops",
        thumbnail: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=500",
    manufacturer: "The Himalaya Drug Company",
    prescriptionRequired: false,
    packSize: "30ml Bottle with Dropper",
    storage: "Store in dry place, away from sunlight. Do not refrigerate.",
    howToUse: "Administer drops orally to infants according to age.",
    sideEffects: ["None documented. Herbal-based formulation."],
    benefits: "Alleviates painful gas bubbles and infantile colic instantly."
  },
  {
    name: "Paracetamol Crocin Advance 650mg",
    slug: "paracetamol-crocin-advance-650mg",
    description: "Crocin Advance 650mg is a fast-acting analgesic and antipyretic formulated with Optizorb technology, which releases the active paracetamol up to 5 times faster than standard tablets.",
    shortDescription: "Fast-acting paracetamol 650mg with Optizorb technology for fever, pain, and headache relief.",
    price: 45,
    regularPrice: 50,
    category: "prescription",
    categoryName: "Prescription Drugs",
    brand: "GlaxoSmithKline Consumer Healthcare",
    images: [
      {
        id: 8,
        src: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500",
        alt: "Paracetamol Crocin Advance 650mg",
        thumbnail: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300"
      }
    ],
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500",
    salt: "Paracetamol IP 650mg with Optizorb Technology",
    dosage: "650MG",
    manufacturer: "GlaxoSmithKline Consumer Healthcare",
    prescriptionRequired: false,
    packSize: "15 Tablets in a strip",
    storage: "Store below 30°C. Protect from light.",
    howToUse: "Adults: 1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours.",
    sideEffects: ["Extremely safe, but liver toxicity possible if daily limit is exceeded"],
    benefits: "Fast relief from severe fever, cold symptoms, and body aches."
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Database collections cleared.');

    // Seed default Categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully.');

    // Seed default Products
    await Product.insertMany(products);
    console.log('Products seeded successfully.');

    // Seed default Admin and Regular User
    // Note: User.create triggers password hashing pre-save
    await User.create({
      name: "Admin User",
      email: "admin@mscare.com",
      password: "adminpassword123",
      phone: "+91 99999 88888",
      role: "admin"
    });

    await User.create({
      name: "Normal User",
      email: "user@mscare.com",
      password: "userpassword123",
      phone: "+91 88888 77777",
      role: "user"
    });

    console.log('Users (Admin & Normal) seeded successfully.');
    console.log('Data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
