"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import {
  Search, BookOpen, Clock, User, ArrowRight, X,
  Share2, Heart, Sparkles, Calendar, MessageSquare, ChevronRight
} from "lucide-react";

interface Article {
  id: number;
  title: string;
  category: string;
  readTime: string;
  image: string;
  desc: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
}

const ARTICLES: Article[] = [
  {
    id: 0,
    title: "Understanding Type 2 Diabetes Management",
    category: "Diabetes",
    readTime: "5 min read",
    image: "/image.png",
    date: "May 28, 2026",
    author: "Dr. Sneha Sharma, MD",
    tags: ["Diabetes", "Metformin", "Wellness", "Insulin"],
    desc: "Discover daily meal habits, lifestyle tracking, and the role of metformin in keeping blood glucose balanced.",
    content: `Diabetes is a chronic condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar (also called glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let the blood sugar into your body’s cells for use as energy.

If you have type 2 diabetes, your cells don't respond to insulin as well as they should (a state known as insulin resistance). During the later stages, your body also might not produce enough insulin to maintain stable glycemic levels.

### Key Pillars of Diabetes Care:
1. **Clinical Medication:** Formulations like Metformin Glycomet 500mg SR are commonly prescribed first-line therapies. They reduce hepatic glucose production and enhance peripheral insulin sensitivity.
2. **Nutritional Roadmap:** Emphasize non-starchy vegetables, lean proteins, and low-glycemic-index complex carbohydrates. Distribute meals evenly throughout the day to avoid blood sugar spikes.
3. **Physical Activity:** Engaging in 150 minutes of moderate cardiovascular exercises weekly stimulates glucose uptake directly in skeletal muscle tissue, independent of insulin pathways.
4. **Active Tracking:** Routine capillary blood glucose tests help you and your endocrinologist identify patterns, preventing long-term diabetic retinopathy or nerve damage complications.`
  },
  {
    id: 1,
    title: "Statins & Heart Health: Myths vs Facts",
    category: "Cardio",
    readTime: "7 min read",
    image: "/image copy.png",
    date: "June 02, 2026",
    author: "Dr. Ramesh Mehta",
    tags: ["Cardio", "Statins", "Atorvastatin", "Cholesterol"],
    desc: "Learn how Atorvastatin protects arterial pathways, regulates bad LDL cholesterol, and facts surrounding cardiovascular protection.",
    content: `Cardiovascular diseases represent the leading cause of mortality globally. At the center of clinical prevention is the regulation of blood lipid profiles, specifically Low-Density Lipoprotein (LDL) cholesterol, frequently referred to as "bad cholesterol."

Statins, such as Atorvastatin (Lipivas), are HMG-CoA reductase inhibitors. They decrease cholesterol production in the liver, while simultaneously increasing the liver's ability to clear circulating LDL from your blood.

### Common Myths vs. Clinical Facts:
* **Myth:** Statins cause severe, irreversible muscle damage in almost everyone.
  * **Fact:** While mild muscle aches (myalgia) can affect 5-10% of patients, severe muscle breakdown (rhabdomyolysis) is extremely rare, occurring in less than 0.1% of cases.
* **Myth:** If you eat healthy and exercise, you do not need statins.
  * **Fact:** A healthy lifestyle is foundational, but genetics play a major role in how much cholesterol your liver produces. For patients with high plaque build-up risk, diet alone is rarely sufficient.
* **Myth:** You can stop taking statins once your cholesterol numbers drop.
  * **Fact:** Statins manage cholesterol levels; they do not cure the underlying genetic predisposition. If you stop taking them, your cholesterol levels will likely return to their baseline within weeks.`
  },
  {
    id: 2,
    title: "The Ultimate Guide to Daily Vitamin Supplements",
    category: "Vitamins",
    readTime: "4 min read",
    image: "/image copy 2.png",
    date: "April 15, 2026",
    author: "Dr. Sneha Sharma, MD",
    tags: ["Vitamins", "Supplements", "Immunity", "Vitamin D3"],
    desc: "Are you taking enough Vitamin D3 and B12? Learn how daily multivitamins replenish trace minerals and support immunity.",
    content: `Micronutrient deficiencies affect over two billion people worldwide. In urban populations, sedentary indoor habits and specialized diets often lead to chronic deficits of key vitamins and minerals.

### Essential Nutrients to Monitor:
1. **Vitamin D3 (Cholecalciferol):** Synthesized via skin exposure to ultraviolet-B radiation, Vitamin D3 functions more like a hormone, regulating calcium absorption and supporting T-cell immune responses. Deficiency is linked to fatigue and bone density depletion.
2. **Vitamin B12 (Cobalamin):** Essential for neurological health, DNA synthesis, and red blood cell formation. B12 is primarily found in animal-derived products, leaving vegetarians and vegans at high risk of clinical deficiency, requiring oral supplementation.
3. **Zinc and Vitamin C:** These act as potent antioxidants that support cellular defense mechanisms during upper respiratory tract infections.

While whole food sources are always primary, high-quality clinical supplements (like A-Z Vitality Capsule) help bridge nutritional gaps and optimize your daily immune response.`
  },
  {
    id: 3,
    title: "Anxiety and Gut Health: The Gut-Brain Connection",
    category: "Mental Health",
    readTime: "6 min read",
    image: "/image copy 3.png",
    date: "May 10, 2026",
    author: "Dr. Sneha Sharma, MD",
    tags: ["Gut Health", "Anxiety", "Probiotics", "Mental Health"],
    desc: "Explore the bidirectional communication between your central nervous system and your gastrointestinal tract.",
    content: `Have you ever felt "butterflies" in your stomach when nervous? This sensation is a direct result of the gut-brain axis, a bidirectional biochemical communication network linking your central nervous system (brain and spinal cord) and your enteric nervous system (which governs gastrointestinal function).

This pathway operates via direct vagus nerve connections, neurotransmitter signaling (more than 90% of your body's serotonin is produced in the gut), and immune system pathways.

### Navigating the Gut-Brain Axis:
* **Stress-Induced Dysbiosis:** High stress levels trigger cortisol release, which alters the integrity of your gut lining (intestinal permeability) and shifts the balance of gut microbiota.
* **Probiotic Support:** Clinical studies show that supplementing with specific strains of *Lactobacillus* and *Bifidobacterium* can reduce circulating stress hormones and improve clinical anxiety scores.
* **High-Fiber Prebiotics:** Consuming fermentable plant fibers nourishes beneficial gut bacteria, leading to the production of Short-Chain Fatty Acids (SCFAs) like butyrate, which protect blood-brain barrier integrity.`
  },
  {
    id: 4,
    title: "Immuno-Oncology: A New Frontier in Cancer Care",
    category: "Oncology",
    readTime: "8 min read",
    image: "/image copy 4.png",
    date: "June 05, 2026",
    author: "Dr. Ramesh Mehta",
    tags: ["Oncology", "Immunotherapy", "Cancer Care", "Chemotherapy"],
    desc: "Discover how immunotherapy drugs train the body's own immune system to identify and eliminate cancer cells.",
    content: `Traditional oncology therapies, such as radiation and cytotoxic chemotherapy, work by directly targetting and destroying rapidly dividing cells. While effective, they also impact healthy cells throughout the body, leading to systemic side-effects.

Immuno-oncology, or cancer immunotherapy, represents a paradigm shift. Instead of attacking the tumor directly, immunotherapy drugs stimulate or reprogram the patient's own immune system to recognize and destroy cancer cells.

### Key Immunotherapy Mechanisms:
1. **Immune Checkpoint Inhibitors:** Cancer cells often evade detection by putting the brakes on T-cells (using pathways like PD-1/PD-L1). Checkpoint inhibitors release these brakes, allowing T-cells to mount a powerful attack.
2. **CAR T-Cell Therapy:** A patient's T-cells are extracted, genetically modified in a laboratory to bind to specific proteins on their cancer cells, and infused back into the body.
3. **Monoclonal Antibodies:** Synthetic proteins designed to bind to specific targets on cancer cells, marking them for destruction by the immune system.

These advanced oncology therapeutics are transforming outcomes, turning previously terminal diagnoses into manageable, chronic conditions.`
  }
];

const CATEGORIES = ["All", "Oncology", "Diabetes", "Cardio", "Vitamins", "Mental Health"];

export default function BlogPage() {
  const { setActivePage } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mscare_blog_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load blog favorites:", e);
    }
  }, []);

  // Sync article query parameters
  useEffect(() => {
    const articleIdParam = searchParams.get("id");
    if (articleIdParam !== null) {
      const id = parseInt(articleIdParam, 10);
      const article = ARTICLES.find((a) => a.id === id);
      if (article) {
        setSelectedArticle(article);
      }
    } else {
      setSelectedArticle(null);
    }
  }, [searchParams]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id];
      localStorage.setItem("mscare_blog_favorites", JSON.stringify(next));
      return next;
    });
  };

  const handleOpenArticle = (article: Article) => {
    // update url parameters smoothly
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("id", article.id.toString());
    router.push(`/blog?${newParams.toString()}`);
  };

  const handleCloseArticle = () => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete("id");
    router.push(`/blog?${newParams.toString()}`);
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || art.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredArticle = useMemo(() => {
    // Immuno-oncology is the featured article
    return ARTICLES.find((a) => a.id === 4) || ARTICLES[0];
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* ===== 1. HERO SECTION ===== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              Featured Clinical Article
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
              {featuredArticle.title}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
              {featuredArticle.desc}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1"><User className="w-4 h-4 text-emerald-450" /> {featuredArticle.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-450" /> {featuredArticle.readTime}</span>
            </div>
            <button
              onClick={() => handleOpenArticle(featuredArticle)}
              className="group flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[16/10] sm:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-emerald-950">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. CONTROLS BAR ===== */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-850 border border-gray-200/80 dark:border-gray-750/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all dark:text-white placeholder:text-gray-400 font-semibold"
          />
          <Search className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Sorting Chips */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-450 border-gray-200 dark:border-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== 3. ARTICLES GRID ===== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Health Library Articles</h2>
          <span className="text-xs text-gray-400 font-semibold">{filteredArticles.length} publications found</span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-850 dark:text-white">No articles matched search</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Try searching for other healthcare topics or resetting the category filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((art) => {
              const isFav = favorites.includes(art.id);
              return (
                <div
                  key={art.id}
                  onClick={() => handleOpenArticle(art)}
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-150/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-50">
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    
                    {/* Category tag */}
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {art.category}
                    </span>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(art.id, e)}
                      className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border shadow backdrop-blur-md transition-all cursor-pointer ${
                        isFav
                          ? "bg-rose-500 border-rose-500 text-white"
                          : "bg-white/90 hover:bg-white border-white/20 text-gray-505 dark:text-gray-800"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
                        <span>{art.date}</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-emerald-600 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-405 leading-relaxed line-clamp-3">
                        {art.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/80">
                      <span className="text-[10px] text-gray-400 font-semibold italic">By {art.author.split(",")[0]}</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 4. ARTICLE DETAIL READER MODAL ===== */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCloseArticle}
          />

          {/* Reader Panel */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[85vh] animate-scale-in">
            {/* Modal Header bar */}
            <div className="h-16 px-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between bg-gray-50 dark:bg-gray-900 flex-shrink-0 z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                <BookOpen className="w-4.5 h-4.5" />
                <span>Health Library Reader</span>
              </div>
              <button
                onClick={handleCloseArticle}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-all cursor-pointer text-gray-600 dark:text-gray-300 font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                aria-label="Close reader"
              >
                <X className="w-4 h-4 text-rose-500" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Document Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 select-text">
              {/* Cover Image */}
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow bg-gray-100 border border-gray-150 dark:border-gray-800">
                <Image
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Title & Metadata */}
              <div className="space-y-4">
                <span className="inline-block bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                
                {/* Author and Date Strip */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-400 border-y border-gray-100 dark:border-gray-850 py-3.5">
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-600" /> {selectedArticle.author}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-600" /> {selectedArticle.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> {selectedArticle.readTime}</span>
                </div>
              </div>

              {/* Main Content Paragraphs */}
              <article className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-350 text-sm sm:text-base leading-relaxed space-y-5 font-medium">
                {selectedArticle.content.split("\n\n").map((para, i) => {
                  if (para.startsWith("###")) {
                    return (
                      <h3 key={i} className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pt-4 tracking-tight">
                        {para.replace("###", "").trim()}
                      </h3>
                    );
                  }
                  if (para.startsWith("1.") || para.startsWith("*")) {
                    const lines = para.split("\n");
                    return (
                      <ul key={i} className="list-disc pl-6 space-y-2">
                        {lines.map((line, li) => {
                          const cleanLine = line.replace(/^\d+\.\s+\*\*/, "").replace(/^\*\s+\*\*/, "").replace(/^\*/, "").replace(/^\d+\./, "").trim();
                          // split by first "**" check to highlight bold sub-headings
                          const isBold = line.includes("**");
                          if (isBold) {
                            const parts = cleanLine.split("**");
                            return (
                              <li key={li}>
                                <strong className="text-gray-900 dark:text-white">{parts[0]}</strong>
                                {parts[1]}
                              </li>
                            );
                          }
                          return <li key={li}>{cleanLine}</li>;
                        })}
                      </ul>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </article>

              {/* Tags and sharing */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-850">
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-lg border border-gray-200/50 dark:border-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleFavorite(selectedArticle.id, e)}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer ${
                      favorites.includes(selectedArticle.id)
                        ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 text-rose-500"
                        : "bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(selectedArticle.id) ? "fill-rose-500" : ""}`} />
                    <span>{favorites.includes(selectedArticle.id) ? "Favorited" : "Add Favorite"}</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Article link copied to clipboard!");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

              {/* Related Medicines callout block (cohesive design) */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50 p-6 rounded-3xl space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">Looking for related healthcare items?</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order medicines, check salt compositions, and upload prescriptions on our clinical pharmacy.</p>
                </div>
                <button
                  onClick={() => {
                    handleCloseArticle();
                    setActivePage("shop");
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow shadow-emerald-650/20 hover:shadow-lg whitespace-nowrap cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Browse Store
                </button>
              </div>

              {/* Explicit bottom close/cut option */}
              <div className="flex justify-center pt-2 pb-6">
                <button
                  onClick={handleCloseArticle}
                  className="group flex items-center gap-2 px-8 py-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm border border-gray-200 dark:border-gray-800"
                >
                  <X className="w-4 h-4 text-rose-500" />
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
