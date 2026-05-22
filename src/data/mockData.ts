export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  manufacturer: string;
  saltComposition?: string;
  prescriptionRequired: boolean;
  bestSeller?: boolean;
  form: string; // e.g. Tablet, Syrup, Device
  packSize: string; // e.g. "10 Tablets", "100ml"
  expiryDate: string;
  storage: string;
  usageInstructions: string;
  sideEffects: string[];
  safetyInfo: string[];
  countryOfOrigin: string;
  description: string;
  benefits: string[];
}

// Doctor and LabTest interfaces removed

export const CATEGORIES = [
  { id: "all", name: "All Products", icon: "LayoutGrid" },
  { id: "prescription", name: "Prescription Drugs", icon: "Pill" },
  { id: "diabetes", name: "Diabetes Care", icon: "Activity" },
  { id: "heart", name: "Heart Health", icon: "HeartPulse" },
  { id: "vitamins", name: "Vitamins & OTC", icon: "Sparkles" },
  { id: "devices", name: "Health Devices", icon: "ShieldAlert" },
  { id: "baby", name: "Baby Care", icon: "Baby" },
  { id: "skin", name: "Skin Care", icon: "Sun" },
  { id: "ayurvedic", name: "Ayurvedic", icon: "Leaf" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Metformin Glycomet 500mg SR",
    category: "diabetes",
    price: 145,
    originalPrice: 180,
    rating: 4.8,
    reviewCount: 342,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    manufacturer: "USV Private Ltd",
    saltComposition: "Metformin Hydrochloride IP 500mg",
    prescriptionRequired: true,
    bestSeller: true,
    form: "Sustained Release Tablet",
    packSize: "15 Tablets in a strip",
    expiryDate: "12/2027",
    storage: "Store below 30°C. Protect from light and moisture.",
    usageInstructions: "To be swallowed whole, not chewed or crushed. Usually taken with or after meals, or as prescribed by your endocrinologist.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Loss of appetite", "Metallic taste in mouth"],
    safetyInfo: [
      "Consult your doctor if you have kidney or liver issues.",
      "Monitor blood glucose levels regularly.",
      "Avoid alcohol consumption as it may increase the risk of lactic acidosis."
    ],
    countryOfOrigin: "India",
    description: "Glycomet 500mg Tablet SR is a medicine used to treat Type 2 diabetes mellitus. It helps control blood sugar levels and thereby prevents serious complications of diabetes. It is a biguanide that improves insulin sensitivity.",
    benefits: [
      "Controls blood glucose levels efficiently",
      "Reduces the risk of cardiovascular events in Type 2 diabetic patients",
      "Aids in improving cellular response to insulin"
    ]
  },
  {
    id: "p2",
    name: "Atorvastatin Lipivas 10mg",
    category: "heart",
    price: 210,
    originalPrice: 280,
    rating: 4.7,
    reviewCount: 198,
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Cipla Pharmaceuticals",
    saltComposition: "Atorvastatin Calcium IP 10mg",
    prescriptionRequired: true,
    bestSeller: true,
    form: "Tablet",
    packSize: "10 Tablets in a strip",
    expiryDate: "09/2027",
    storage: "Store in a cool dry place.",
    usageInstructions: "Can be taken with or without food, but preferably at a fixed time in the evening, as recommended by your cardiologist.",
    sideEffects: ["Muscle pain", "Headache", "Abdominal pain", "Weakness", "Increased liver enzymes"],
    safetyInfo: [
      "Contraindicated in active liver disease or during pregnancy.",
      "Inform your physician immediately if you experience unexplained muscle pain or tenderness."
    ],
    countryOfOrigin: "India",
    description: "Lipivas 10mg is a statin medication used to lower high cholesterol levels and reduce the risk of stroke, heart attack, or other blood vessel complications in patients with cardiac risks.",
    benefits: [
      "Lowers 'bad' LDL cholesterol and triglycerides",
      "Increases 'good' HDL cholesterol levels",
      "Stabilizes arterial plaques to prevent cardiovascular events"
    ]
  },
  {
    id: "p3",
    name: "Omron HEM-7120 Smart BP Monitor",
    category: "devices",
    price: 1999,
    originalPrice: 2790,
    rating: 4.9,
    reviewCount: 1285,
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Omron Healthcare Japan",
    prescriptionRequired: false,
    bestSeller: true,
    form: "Electronic Device",
    packSize: "1 Unit (Includes BP Monitor, Medium Cuff, AAA Batteries, Manual)",
    expiryDate: "N/A (3 Years Warranty Included)",
    storage: "Keep in a dust-free dry container. Avoid dropping the device.",
    usageInstructions: "Wrap the cuff snuggly around the upper left arm, 1-2 cm above the elbow crease. Keep your arm rested at heart level. Press start and remain seated silently without talking.",
    sideEffects: ["None under regular usage instructions"],
    safetyInfo: [
      "For accurate readings, rest for at least 5 minutes before taking measurements.",
      "Do not measure within 30 minutes of bathing, drinking alcohol, or exercising."
    ],
    countryOfOrigin: "Japan",
    description: "The Omron HEM-7120 is a fully automatic upper arm blood pressure monitor. It operates on the oscillometric principle, delivering incredibly precise and easy systolic, diastolic, and pulse measurements.",
    benefits: [
      "Incredibly user-friendly single-button measurement",
      "Equipped with IntelliSense technology for customized inflation",
      "Features a Hypertension Indicator and Irregular Heartbeat sensor"
    ]
  },
  {
    id: "p4",
    name: "Multivitamin A-Z Vitality Capsule",
    category: "vitamins",
    price: 350,
    originalPrice: 420,
    rating: 4.6,
    reviewCount: 412,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Abbott Healthcare",
    saltComposition: "Multi-Minerals, Amino Acids, Ginseng, Vitamin C, D3, B12, Zinc",
    prescriptionRequired: false,
    bestSeller: false,
    form: "Softgel Capsule",
    packSize: "30 Capsules in a bottle",
    expiryDate: "04/2027",
    storage: "Store in a cool, dark, and dry place. Keep out of reach of children.",
    usageInstructions: "One softgel capsule daily with breakfast or milk, or as recommended by a nutritionist.",
    sideEffects: ["Mild stomach upset if taken on empty stomach", "Slight yellow coloration of urine (due to Vitamin B)"],
    safetyInfo: [
      "Do not exceed the recommended daily dosage.",
      "Pregnant/lactating individuals should consult their physician before starting."
    ],
    countryOfOrigin: "India",
    description: "A-Z Vitality capsules provide a comprehensive blend of daily micronutrients, active Korean ginseng extract, and essential trace elements that assist in maintaining active immunity, sustained energy levels, and brain clarity.",
    benefits: [
      "Replenishes micro-nutrients in daily diets",
      "Ginseng enhances stamina and stress resilience",
      "Zinc and Vitamin C reinforce the active cellular immune defense"
    ]
  },
  {
    id: "p5",
    name: "Cetaphil Gentle Skin Cleanser",
    category: "skin",
    price: 395,
    originalPrice: 450,
    rating: 4.8,
    reviewCount: 896,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Galderma India Pvt Ltd",
    prescriptionRequired: false,
    bestSeller: true,
    form: "Liquid Cleanser",
    packSize: "250ml Pump Bottle",
    expiryDate: "03/2028",
    storage: "Store below 25°C. Do not freeze.",
    usageInstructions: "Apply to skin and massage gently. With water: Rinse thoroughly. Without water: Wipe off excess cleanser with soft tissue or cotton pad.",
    sideEffects: ["Extremely rare mild irritation on hypersensitive skin"],
    safetyInfo: ["For external cosmetic usage only. Avoid direct eye contact."],
    countryOfOrigin: "France",
    description: "This soap-free, non-comedogenic gentle cleanser is clinically proven to clean deeply, hydrate dry skin, and preserve the natural skin barrier. Ideal for dry, sensitive, and compromised skin.",
    benefits: [
      "Hypoallergenic formula free of fragrance, parabens, and soap",
      "Locks in natural skin moisture during cleansing",
      "Safe for even highly sensitive or baby skin"
    ]
  },
  {
    id: "p6",
    name: "Dabur Chyawanprash Double Immunity",
    category: "ayurvedic",
    price: 299,
    originalPrice: 350,
    rating: 4.7,
    reviewCount: 1542,
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Dabur India Ltd",
    prescriptionRequired: false,
    bestSeller: true,
    form: "Paste",
    packSize: "500g Jar",
    expiryDate: "01/2028",
    storage: "Close cap tightly after every use. Store in a dry hygienic place.",
    usageInstructions: "1-2 teaspoons twice a day for adults, 1/2 teaspoon for kids. Best consumed directly or followed by lukewarm milk.",
    sideEffects: ["None known. High glycemic index, diabetes patients should use Dabur Sugar-Free version."],
    safetyInfo: ["For healthy individuals of all ages. Consult ayurvedic doctor if you are under special medication."],
    countryOfOrigin: "India",
    description: "Dabur Chyawanprash is a time-tested ancient Ayurvedic formulation containing over 45 essential herbs like Amla, Ashwagandha, and Giloy. It is clinically proven to double systemic immunity and prevent day-to-day seasonal infections.",
    benefits: [
      "Boosts antibody production for defense against colds & viruses",
      "Stimulates internal energy, metabolism, and digestion",
      "Purifies blood and assists respiratory pathways"
    ]
  },
  {
    id: "p7",
    name: "Himalaya Bonnisan Baby Drops",
    category: "baby",
    price: 95,
    originalPrice: 110,
    rating: 4.8,
    reviewCount: 654,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=500&auto=format&fit=crop&q=60",
    manufacturer: "The Himalaya Drug Company",
    prescriptionRequired: false,
    bestSeller: false,
    form: "Oral Drops",
    packSize: "30ml Bottle with Dropper",
    expiryDate: "10/2027",
    storage: "Store in dry place, away from sunlight. Do not refrigerate.",
    usageInstructions: "Administer drops orally to infants according to age. Under 1 month: 5-10 drops; 1-6 months: 10-20 drops, or as directed by a pediatrician.",
    sideEffects: ["None documented. Herbal-based formulation."],
    safetyInfo: ["Keep cap sealed. Strictly adhere to dosage instructions based on infant age."],
    countryOfOrigin: "India",
    description: "Bonnisan is a natural, clinically tested pediatric digestive tonic. It relieves common pediatric gastrointestinal disorders like colic, flatulence, gas, and indigestion, keeping the baby active and sleeping comfortably.",
    benefits: [
      "Alleviates painful gas bubbles and infantile colic instantly",
      "Promotes general growth, weight gain, and good appetite",
      "Combats pediatric teething distress and loose motions"
    ]
  },
  {
    id: "p8",
    name: "Paracetamol Crocin Advance 650mg",
    category: "prescription",
    price: 45,
    originalPrice: 50,
    rating: 4.7,
    reviewCount: 2311,
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    manufacturer: "GlaxoSmithKline Consumer Healthcare",
    saltComposition: "Paracetamol IP 650mg with Optizorb Technology",
    prescriptionRequired: false,
    bestSeller: true,
    form: "Tablet",
    packSize: "15 Tablets in a strip",
    expiryDate: "02/2029",
    storage: "Store below 30°C. Protect from light.",
    usageInstructions: "Adults: 1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours. Swallowed with water.",
    sideEffects: ["Extremely safe, but liver toxicity possible if daily limit is exceeded", "Allergic skin rash (very rare)"],
    safetyInfo: [
      "Taking more than the recommended daily dose of paracetamol may cause severe liver damage or allergic reactions.",
      "Avoid concurrent usage of other paracetamol-containing cold formulations."
    ],
    countryOfOrigin: "India",
    description: "Crocin Advance 650mg is a fast-acting analgesic (painkiller) and antipyretic (fever reducer) formulated with Optizorb technology, which releases the active paracetamol up to 5 times faster than standard tablets.",
    benefits: [
      "Fast relief from severe fever, cold symptoms, and body aches",
      "Relieves migraine headaches, dental pain, and muscular pain",
      "Gentler on the stomach lining compared to NSAIDs like ibuprofen"
    ]
  }
];

// DOCTORS and LAB_TESTS datasets removed

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Rajesh K. Verma",
    rating: 5,
    text: "MS Care has completely transformed how I purchase medicines. The Prescription OCR reader instantly parsed my chronic diabetic doctor slip, and the package arrived under 4 hours in Delhi. Extremely authentic service!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "t2",
    name: "Dr. Ananya Ray",
    rating: 5,
    text: "As a clinician, I value authentic drug formulations. The clear salt disclosures, structural storage advice, and expiration safety notices displayed for every single medicine on this pharmacy make it the most trusted online healthcare platform.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60"
  },
  {
    id: "t3",
    name: "Sandhya Iyer",
    rating: 5,
    text: "I am extremely pleased with the monthly chronic care refill subscription service. My hypertension medicines arrive automatically on the 1st of every month at a great discount. Never have to worry about running out!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60"
  }
];
