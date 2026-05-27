// ─── Product Interface ─────────────────────────────────────────────────────
// Fields aligned directly with WooCommerce REST API response.
// Removed: WooCommerce internals (stock, shipping, tax, permalink, dates,
//          plugin meta keys), and fields not present in API (expiryDate,
//          countryOfOrigin, safetyInfo, bestSeller, form).
// Added:   slug, shortDescription, onSale, brand, salt, dosage, images[],
//          howToUse (replaces usageInstructions).

export interface ProductImage {
  id: number;
  src: string;
  alt: string;
  thumbnail: string;
}

export interface Product {
  id: string;                    // API: id (number → string)
  name: string;                  // API: name
  slug: string;                  // API: slug
  description: string;           // API: description (HTML stripped)
  shortDescription: string;      // API: short_description (HTML stripped)
  price: number;                 // API: sale_price (or price when not on sale)
  regularPrice: number;          // API: regular_price
  onSale: boolean;               // API: on_sale
  rating: number;                // API: average_rating
  reviewCount: number;           // API: rating_count
  category: string;              // API: categories[0].slug
  categoryName: string;          // API: categories[0].name
  brand: string;                 // API: brands[0].name
  images: ProductImage[];        // API: images[] (id, src, alt, thumbnail)
  image: string;                 // Convenience: images[0].src
  salt?: string;                 // API meta: _medicine_salt
  dosage?: string;               // API meta: _medicine_dosage
  manufacturer: string;          // API meta: _medicine_company
  prescriptionRequired: boolean; // API meta: _prescription_required === "yes"
  packSize: string;              // API meta: _product_notes (first line)
  storage: string;               // API meta: _product_notes (storage line)
  howToUse: string;              // API meta: wb_custom_tabs → "How to Use"
  sideEffects: string[];         // API meta: wb_custom_tabs → "Side Effects"
  benefits: string;              // API meta: wb_custom_tabs → "Benefits"
}

// ─── Categories ────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: "all",          name: "All Products",       icon: "LayoutGrid"  },
  { id: "prescription", name: "Prescription Drugs",  icon: "Pill"        },
  { id: "transplant",   name: "Transplant",           icon: "HeartPulse"  },
  { id: "diabetes",     name: "Diabetes Care",        icon: "Activity"    },
  { id: "heart",        name: "Heart Health",         icon: "HeartPulse"  },
  { id: "vitamins",     name: "Vitamins & OTC",       icon: "Sparkles"    },
  { id: "devices",      name: "Health Devices",       icon: "ShieldAlert" },
  { id: "baby",         name: "Baby Care",            icon: "Baby"        },
  { id: "skin",         name: "Skin Care",            icon: "Sun"         },
  { id: "ayurvedic",    name: "Ayurvedic",            icon: "Leaf"        },
];

// ─── Products ──────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  // ── Real product from API ──────────────────────────────────────────────
  {
    id: "14859",
    name: "Mofecon-S 360mg Tablet",
    slug: "mofecon-s-360mg-tablet",
    description:
      "Mofecon-S 360 mg Tablet is an immunosuppressant containing Mycophenolate sodium (an IMPDH inhibitor). It is used with other medicines to prevent organ rejection after kidney, heart, or liver transplantation.",
    shortDescription:
      "Mofecon-S 360 mg Tablet DR is an immunosuppressant used after organ transplants (kidney, heart, or liver) to prevent rejection by lowering the body's immune response.",
    price: 170,
    regularPrice: 799,
    onSale: true,
    rating: 0,
    reviewCount: 0,
    category: "transplant",
    categoryName: "Transplant",
    brand: "CONCORD BIOTECH LIMITED",
    images: [
      {
        id: 14860,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A.webp",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A-300x250.jpeg",
      },
      {
        id: 14861,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AA.webp",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AA-300x250.webp",
      },
      {
        id: 14862,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AAA.jpeg",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AAA-300x250.jpeg",
      },
      {
        id: 14863,
        src: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AAAA.jpeg",
        alt: "Mofecon-S 360mg Tablet",
        thumbnail: "https://oncomshealthcare.com/wp-content/uploads/2026/01/AAAA-300x250.jpeg",
      },
    ],
    image: "https://oncomshealthcare.com/wp-content/uploads/2026/01/A.webp",
    salt: "Mycophenolate sodium (360mg)",
    dosage: "360MG",
    manufacturer: "Concord Biotech Ltd",
    prescriptionRequired: true,
    packSize: "10 Tablets in 1 Strip",
    storage: "Store below 30°C. Protect from light and moisture.",
    howToUse:
      "Take this medicine exactly in the dose and for the duration prescribed by your doctor.",
    sideEffects: [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Abdominal pain",
      "Headache",
      "High blood pressure",
      "Low white blood cell count (neutropenia)",
      "Bacterial and fungal infections",
      "Pneumonia",
      "Increased uric acid levels",
      "Electrolyte imbalance",
      "Anxiety",
      "Breathlessness",
      "Increased creatinine levels",
      "Anemia (low red blood cells)",
      "Acne",
      "Muscle pain",
    ],
    benefits:
      "Mofecon-S 360 mg Tablet is an immunosuppressant containing Mycophenolate sodium, an IMPDH inhibitor. It is used with other immunosuppressive medicines to prevent organ rejection after kidney, heart, or liver transplantation.",
  },

  // ── Sample products (adapted to new interface) ─────────────────────────
  {
    id: "p1",
    name: "Metformin Glycomet 500mg SR",
    slug: "metformin-glycomet-500mg-sr",
    description:
      "Glycomet 500mg Tablet SR is a medicine used to treat Type 2 diabetes mellitus. It helps control blood sugar levels and thereby prevents serious complications of diabetes. It is a biguanide that improves insulin sensitivity.",
    shortDescription:
      "Sustained-release Metformin tablet for Type 2 diabetes management. Controls blood glucose and improves insulin response.",
    price: 145,
    regularPrice: 180,
    onSale: true,
    rating: 4.8,
    reviewCount: 342,
    category: "diabetes",
    categoryName: "Diabetes Care",
    brand: "USV Private Ltd",
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
        alt: "Metformin Glycomet 500mg SR",
        thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
    salt: "Metformin Hydrochloride IP 500mg",
    dosage: "500MG",
    manufacturer: "USV Private Ltd",
    prescriptionRequired: true,
    packSize: "15 Tablets in a strip",
    storage: "Store below 30°C. Protect from light and moisture.",
    howToUse:
      "To be swallowed whole, not chewed or crushed. Usually taken with or after meals, or as prescribed by your endocrinologist.",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Loss of appetite", "Metallic taste in mouth"],
    benefits:
      "Controls blood glucose levels efficiently. Reduces the risk of cardiovascular events in Type 2 diabetic patients. Aids in improving cellular response to insulin.",
  },
  {
    id: "p2",
    name: "Atorvastatin Lipivas 10mg",
    slug: "atorvastatin-lipivas-10mg",
    description:
      "Lipivas 10mg is a statin medication used to lower high cholesterol levels and reduce the risk of stroke, heart attack, or other blood vessel complications in patients with cardiac risks.",
    shortDescription:
      "Atorvastatin tablet to lower LDL cholesterol and protect against cardiovascular events.",
    price: 210,
    regularPrice: 280,
    onSale: true,
    rating: 4.7,
    reviewCount: 198,
    category: "heart",
    categoryName: "Heart Health",
    brand: "Cipla Pharmaceuticals",
    images: [
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop&q=60",
        alt: "Atorvastatin Lipivas 10mg",
        thumbnail: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=500&auto=format&fit=crop&q=60",
    salt: "Atorvastatin Calcium IP 10mg",
    dosage: "10MG",
    manufacturer: "Cipla Pharmaceuticals",
    prescriptionRequired: true,
    packSize: "10 Tablets in a strip",
    storage: "Store in a cool dry place.",
    howToUse:
      "Can be taken with or without food, but preferably at a fixed time in the evening, as recommended by your cardiologist.",
    sideEffects: ["Muscle pain", "Headache", "Abdominal pain", "Weakness", "Increased liver enzymes"],
    benefits:
      "Lowers bad LDL cholesterol and triglycerides. Increases good HDL cholesterol levels. Stabilizes arterial plaques to prevent cardiovascular events.",
  },
  {
    id: "p3",
    name: "Omron HEM-7120 Smart BP Monitor",
    slug: "omron-hem-7120-smart-bp-monitor",
    description:
      "The Omron HEM-7120 is a fully automatic upper arm blood pressure monitor. It operates on the oscillometric principle, delivering precise systolic, diastolic, and pulse measurements.",
    shortDescription:
      "Fully automatic upper arm BP monitor with IntelliSense technology and irregular heartbeat detection.",
    price: 1999,
    regularPrice: 2790,
    onSale: true,
    rating: 4.9,
    reviewCount: 1285,
    category: "devices",
    categoryName: "Health Devices",
    brand: "Omron Healthcare Japan",
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60",
        alt: "Omron HEM-7120 Smart BP Monitor",
        thumbnail: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Omron Healthcare Japan",
    prescriptionRequired: false,
    packSize: "1 Unit (Includes Monitor, Cuff, Batteries, Manual)",
    storage: "Keep in a dust-free dry container. Avoid dropping the device.",
    howToUse:
      "Wrap the cuff snuggly around the upper left arm, 1-2 cm above the elbow crease. Keep your arm rested at heart level. Press start and remain seated silently.",
    sideEffects: ["None under regular usage instructions"],
    benefits:
      "User-friendly single-button measurement. Equipped with IntelliSense technology for customized inflation. Features a Hypertension Indicator and Irregular Heartbeat sensor.",
  },
  {
    id: "p4",
    name: "Multivitamin A-Z Vitality Capsule",
    slug: "multivitamin-a-z-vitality-capsule",
    description:
      "A-Z Vitality capsules provide a comprehensive blend of daily micronutrients, active Korean ginseng extract, and essential trace elements that assist in maintaining active immunity, sustained energy, and brain clarity.",
    shortDescription:
      "Daily multivitamin with ginseng, Vitamin C, D3, B12, and Zinc for immunity and energy.",
    price: 350,
    regularPrice: 420,
    onSale: true,
    rating: 4.6,
    reviewCount: 412,
    category: "vitamins",
    categoryName: "Vitamins & OTC",
    brand: "Abbott Healthcare",
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
        alt: "Multivitamin A-Z Vitality Capsule",
        thumbnail: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60",
    salt: "Multi-Minerals, Amino Acids, Ginseng, Vitamin C, D3, B12, Zinc",
    manufacturer: "Abbott Healthcare",
    prescriptionRequired: false,
    packSize: "30 Capsules in a bottle",
    storage: "Store in a cool, dark, and dry place. Keep out of reach of children.",
    howToUse:
      "One softgel capsule daily with breakfast or milk, or as recommended by a nutritionist.",
    sideEffects: ["Mild stomach upset if taken on empty stomach", "Slight yellow coloration of urine (due to Vitamin B)"],
    benefits:
      "Replenishes micro-nutrients in daily diets. Ginseng enhances stamina and stress resilience. Zinc and Vitamin C reinforce the active cellular immune defense.",
  },
  {
    id: "p5",
    name: "Cetaphil Gentle Skin Cleanser",
    slug: "cetaphil-gentle-skin-cleanser",
    description:
      "This soap-free, non-comedogenic gentle cleanser is clinically proven to clean deeply, hydrate dry skin, and preserve the natural skin barrier. Ideal for dry, sensitive, and compromised skin.",
    shortDescription:
      "Soap-free, hypoallergenic cleanser for sensitive and dry skin. Preserves natural moisture barrier.",
    price: 395,
    regularPrice: 450,
    onSale: true,
    rating: 4.8,
    reviewCount: 896,
    category: "skin",
    categoryName: "Skin Care",
    brand: "Galderma India Pvt Ltd",
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60",
        alt: "Cetaphil Gentle Skin Cleanser",
        thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Galderma India Pvt Ltd",
    prescriptionRequired: false,
    packSize: "250ml Pump Bottle",
    storage: "Store below 25°C. Do not freeze.",
    howToUse:
      "Apply to skin and massage gently. With water: Rinse thoroughly. Without water: Wipe off excess with soft tissue.",
    sideEffects: ["Extremely rare mild irritation on hypersensitive skin"],
    benefits:
      "Hypoallergenic formula free of fragrance, parabens, and soap. Locks in natural skin moisture during cleansing. Safe for even highly sensitive or baby skin.",
  },
  {
    id: "p6",
    name: "Dabur Chyawanprash Double Immunity",
    slug: "dabur-chyawanprash-double-immunity",
    description:
      "Dabur Chyawanprash is a time-tested ancient Ayurvedic formulation containing over 45 essential herbs like Amla, Ashwagandha, and Giloy. It is clinically proven to double systemic immunity and prevent seasonal infections.",
    shortDescription:
      "Ayurvedic immunity booster with 45+ herbs including Amla, Ashwagandha, and Giloy.",
    price: 299,
    regularPrice: 350,
    onSale: true,
    rating: 4.7,
    reviewCount: 1542,
    category: "ayurvedic",
    categoryName: "Ayurvedic",
    brand: "Dabur India Ltd",
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=60",
        alt: "Dabur Chyawanprash Double Immunity",
        thumbnail: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=500&auto=format&fit=crop&q=60",
    manufacturer: "Dabur India Ltd",
    prescriptionRequired: false,
    packSize: "500g Jar",
    storage: "Close cap tightly after every use. Store in a dry hygienic place.",
    howToUse:
      "1-2 teaspoons twice a day for adults, 1/2 teaspoon for kids. Best consumed directly or followed by lukewarm milk.",
    sideEffects: ["None known. High glycemic index — diabetes patients should use Sugar-Free version."],
    benefits:
      "Boosts antibody production for defense against colds and viruses. Stimulates internal energy, metabolism, and digestion. Purifies blood and assists respiratory pathways.",
  },
  {
    id: "p7",
    name: "Himalaya Bonnisan Baby Drops",
    slug: "himalaya-bonnisan-baby-drops",
    description:
      "Bonnisan is a natural, clinically tested pediatric digestive tonic. It relieves common pediatric gastrointestinal disorders like colic, flatulence, gas, and indigestion.",
    shortDescription:
      "Natural pediatric digestive tonic for colic, gas, and indigestion in infants.",
    price: 95,
    regularPrice: 110,
    onSale: true,
    rating: 4.8,
    reviewCount: 654,
    category: "baby",
    categoryName: "Baby Care",
    brand: "The Himalaya Drug Company",
    images: [
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=500&auto=format&fit=crop&q=60",
        alt: "Himalaya Bonnisan Baby Drops",
        thumbnail: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eb2?w=500&auto=format&fit=crop&q=60",
    manufacturer: "The Himalaya Drug Company",
    prescriptionRequired: false,
    packSize: "30ml Bottle with Dropper",
    storage: "Store in dry place, away from sunlight. Do not refrigerate.",
    howToUse:
      "Administer drops orally to infants according to age. Under 1 month: 5-10 drops; 1-6 months: 10-20 drops, or as directed by a pediatrician.",
    sideEffects: ["None documented. Herbal-based formulation."],
    benefits:
      "Alleviates painful gas bubbles and infantile colic instantly. Promotes general growth, weight gain, and good appetite. Combats pediatric teething distress and loose motions.",
  },
  {
    id: "p8",
    name: "Paracetamol Crocin Advance 650mg",
    slug: "paracetamol-crocin-advance-650mg",
    description:
      "Crocin Advance 650mg is a fast-acting analgesic and antipyretic formulated with Optizorb technology, which releases the active paracetamol up to 5 times faster than standard tablets.",
    shortDescription:
      "Fast-acting paracetamol 650mg with Optizorb technology for fever, pain, and headache relief.",
    price: 45,
    regularPrice: 50,
    onSale: true,
    rating: 4.7,
    reviewCount: 2311,
    category: "prescription",
    categoryName: "Prescription Drugs",
    brand: "GlaxoSmithKline Consumer Healthcare",
    images: [
      {
        id: 8,
        src: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
        alt: "Paracetamol Crocin Advance 650mg",
        thumbnail: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60",
      },
    ],
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60",
    salt: "Paracetamol IP 650mg with Optizorb Technology",
    dosage: "650MG",
    manufacturer: "GlaxoSmithKline Consumer Healthcare",
    prescriptionRequired: false,
    packSize: "15 Tablets in a strip",
    storage: "Store below 30°C. Protect from light.",
    howToUse:
      "Adults: 1 tablet every 4 to 6 hours as needed. Do not exceed 4 tablets in 24 hours. Swallow with water.",
    sideEffects: [
      "Extremely safe, but liver toxicity possible if daily limit is exceeded",
      "Allergic skin rash (very rare)",
    ],
    benefits:
      "Fast relief from severe fever, cold symptoms, and body aches. Relieves migraine headaches, dental pain, and muscular pain. Gentler on the stomach lining compared to NSAIDs.",
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Rajesh K. Verma",
    rating: 5,
    text: "MS Care has completely transformed how I purchase medicines. The Prescription OCR reader instantly parsed my chronic diabetic doctor slip, and the package arrived under 4 hours in Delhi. Extremely authentic service!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "t2",
    name: "Dr. Ananya Ray",
    rating: 5,
    text: "As a clinician, I value authentic drug formulations. The clear salt disclosures, structural storage advice, and expiration safety notices displayed for every single medicine on this pharmacy make it the most trusted online healthcare platform.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: "t3",
    name: "Sandhya Iyer",
    rating: 5,
    text: "I am extremely pleased with the monthly chronic care refill subscription service. My hypertension medicines arrive automatically on the 1st of every month at a great discount. Never have to worry about running out!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60",
  },
];
