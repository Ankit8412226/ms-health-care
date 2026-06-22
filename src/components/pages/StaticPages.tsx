"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import {
  Mail, Phone, MapPin, ShieldCheck, HelpCircle,
  Send, CheckCircle, FileText, Sparkles, Award, ShieldAlert, RotateCcw
} from "lucide-react";

export default function StaticPages() {
  const { activePage, setActivePage } = useApp();

  // Contact Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setFormError("Bhai, safety check! Please fill in all fields.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(phone.replace(/[^0-9]/g, ""))) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setFormError("");
    setFormSuccess(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");

    // Hide success alert after 5 seconds
    setTimeout(() => {
      setFormSuccess(false);
    }, 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* SUCCESS FLOATING TOAST ALERT */}
      {formSuccess && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-scale-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-200" />
          <div>
            <div className="font-bold text-sm">Message Sent Successfully!</div>
            <div className="text-xs text-emerald-100 mt-0.5">Our healthcare care desk will contact you within 24 hours. Keep healthy!</div>
          </div>
        </div>
      )}

      {/* PAGE CONTAINER */}
      <div className="w-full relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* ===== 1. ABOUT US PAGE (Redesigned as a Landing Page) ===== */}
        {activePage === "about" && (
          <div className="space-y-24 pb-12">
            {/* Hero Section */}
            <section className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full">
                  Our Mission & Vision
                </span>
                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                  We are building the <span className="gradient-text font-black">Future of Oncology Pharmacy</span> in India
                </h1>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                  Onco Life India is a licensed, CDSCO-compliant healthcare platform delivering certified anti-cancer medications, chemotherapy supportive drugs, and automated prescription processing directly to your home.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
                  <button
                    onClick={() => setActivePage("shop")}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-105"
                  >
                    Explore Medicines
                  </button>
                  <button
                    onClick={() => setActivePage("contact")}
                    className="px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-850 dark:text-white border border-gray-250 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                  >
                    Contact Advisory Board
                  </button>
                </div>
              </div>

              {/* Right Hero Image Area */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-gray-150 dark:border-gray-800">
                  <Image
                    src="/image copy 4.png"
                    alt="Pharmacy Workstation"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Floating Card */}
                <div className="absolute -left-6 bottom-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-float max-w-[240px]">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-gray-900 dark:text-white">CDSCO Certified</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">100% Drug Compliance</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            <section className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150/50 dark:border-gray-800 rounded-[2.5rem] p-8 sm:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { count: "50 Lakh+", label: "Verified Patients" },
                { count: "100% Genuine", label: "CDSCO Batch Audited" },
                { count: "4 Hours", label: "Express Metro Delivery" },
                { count: "20,000+", label: "Pin Codes Covered" }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-450">{stat.count}</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </section>

            {/* Our Story / Detailed Segment */}
            <section className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Image Column */}
              <div className="lg:col-span-5 relative order-last lg:order-first">
                <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-gray-150 dark:border-gray-800">
                  <Image
                    src="/image copy 5.png"
                    alt="Clinical Quality Control"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Floating Card */}
                <div className="absolute -right-6 top-8 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-float max-w-[240px]" style={{ animationDelay: "2s" }}>
                  <div className="w-10 h-10 bg-cyan-500/10 text-cyan-600 dark:text-cyan-450 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-gray-900 dark:text-white">Cold Chain Logistics</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Molecule Potency Guard</span>
                  </div>
                </div>
              </div>

              {/* Text Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
                  Combating Fake Drugs and Inefficiencies
                </h2>
                <div className="text-sm sm:text-base text-gray-505 dark:text-gray-400 space-y-4 leading-relaxed">
                  <p>
                    Onco Life India was founded with a clear directive: to address the critical gap in genuine oncology and specialized cancer care medications in India. In an environment where patient safety is occasionally compromised by fragmented supply chains, we guarantee anti-cancer drug authenticity.
                  </p>
                  <p>
                    Every anti-cancer medicine we ship undergoes double-pharmacist verification. By sourcing directly from registered pharmaceutical manufacturers and maintaining a temperature-controlled cold chain network, we ensure chemotherapy drugs, targeted therapies, and support medications maintain maximum potency.
                  </p>
                </div>
              </div>
            </section>

            {/* Core Pillars */}
            <section className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Our Core Operating Standards</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">We align our systems with international clinical safety norms.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  {
                    title: "Clinical Sourcing Only",
                    desc: "We completely bypass brokers and buy directly from manufacturer batches, eliminating any counterfeit risks.",
                    icon: ShieldCheck,
                    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400"
                  },
                  {
                    title: "Cold Chain Verified",
                    desc: "Specially insulated and temperature-controlled logistics maintain drug molecules in perfect condition during shipping.",
                    icon: Award,
                    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400"
                  },
                  {
                    title: "AI-Powered Safety",
                    desc: "Our automated OCR prescription matching verifies dosages and formats, preventing dispensing mistakes.",
                    icon: Sparkles,
                    color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-lg space-y-4 hover:-translate-y-1 transition-all">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-505 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Our Team Section */}
            <section className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white">Our Clinical Advisory Board</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Guiding our medical compliance, quality assurance, and pharmacy systems.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Dr. Sneha Sharma, MD",
                    role: "Chief Medical Officer",
                    image: "/avatar-sneha.png",
                    desc: "Over 12 years of experience in cardiology and preventive clinical practice. Dr. Sneha reviews drug interaction checkers and diagnostic packages."
                  },
                  {
                    name: "Amit Verma, R.Ph.",
                    role: "Head of Pharmacy Operations",
                    image: "/avatar-amit.png",
                    desc: "Registered pharmacist with a deep background in hospital formulary control. Oversees dispensing standards and prescription extraction checkers."
                  },
                  {
                    name: "Rajesh Iyer",
                    role: "VP of Cold-Chain Supply",
                    image: "/avatar-rajesh.png",
                    desc: "Cold-chain distribution specialist formerly managing national vaccine logistics. Rajesh secures molecule integrity across India."
                  }
                ].map((member, i) => (
                  <div key={i} className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 overflow-hidden shadow-md hover:shadow-xl transition-all">
                    <div className="relative aspect-square w-full">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                    </div>
                    <div className="p-6 space-y-2 text-center md:text-left">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{member.name}</h3>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{member.role}</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pt-2 border-t border-gray-100 dark:border-gray-800">{member.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications and Compliance */}
            <section className="border-t border-gray-150 dark:border-gray-800 pt-16 flex flex-col items-center space-y-6">
              <h3 className="text-xs font-bold text-gray-405 uppercase tracking-widest text-center">Safety &amp; Compliance Standards</h3>
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-70 grayscale dark:invert">
                <div className="text-center font-black text-sm text-gray-500">CDSCO COMPLIANT</div>
                <div className="text-center font-black text-sm text-gray-500">GMP CERTIFIED BATCHES</div>
                <div className="text-center font-black text-sm text-gray-500">PCI-DSS SECURITY</div>
                <div className="text-center font-black text-sm text-gray-500">HIPAA SECURE DATA</div>
              </div>
            </section>
          </div>
        )}

        {/* ===== 2. CONTACT US PAGE ===== */}
        {activePage === "contact" && (
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Connect With Us</span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Let&apos;s Start a Conversation</h1>
              <p className="text-sm text-gray-505 dark:text-gray-400 leading-relaxed">
                Have questions about custom dosages, billing, prescription status, or clinic setups? Send us a message, and our verified clinical executives will respond.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Contact Info Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white rounded-3xl space-y-6 shadow-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  
                  <h3 className="text-xl font-bold">Clinical Care Desk</h3>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Our registered pharmacists are available to resolve medicine-related queries or prescription queries.
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">Call & Whatsapp Us</span>
                        <span className="text-sm font-bold block">+91 95402 94099</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">Email Query</span>
                        <span className="text-sm font-bold block">support@oncolifeindia.com</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-200 block uppercase tracking-wider">Corporate Office</span>
                        <span className="text-sm font-bold block leading-snug">Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station, Delhi-110007</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex gap-3 text-xs leading-relaxed">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-500" />
                  <span>
                    <strong>Medical Emergency Notice:</strong> Onco Life India online portal is for scheduled anti-cancer medicine purchases. If you are experiencing an acute clinical emergency, please dial 102 or visit the nearest local hospital immediately.
                  </span>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-7 bg-gray-50 dark:bg-gray-850 p-6 sm:p-8 rounded-3xl border border-gray-150 dark:border-gray-800">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Send Patient Inquiry</h3>

                  {formError && (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold rounded-xl">
                      {formError}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ankit Kumar"
                        className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ankit@oncolifeindia.com"
                        className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Prescription status, order refill, etc."
                        className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Detailed Inquiry Message</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your medicine request or medical question here..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-750 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" /> Send Care Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ===== 3. FAQS PAGE ===== */}
        {activePage === "faq" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Frequently Asked Questions</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "Is Onco Life India a licensed online pharmacy in India?", a: "Yes. Onco Life India holds a valid CDSCO Drug License and operates under the Drugs & Cosmetics Act, 1940. All medicines are sourced directly from licensed manufacturers and distributors." },
                { q: "How do I upload my medical prescription?", a: "Navigate to the 'Upload Rx' tab on the header, drag & drop your PDF or image slip, and our clinical OCR will automatically parse the matched drugs." },
                { q: "Do you deliver medicines across India?", a: "Yes, we ship to over 20,000 pin codes across India. For metro cities like Delhi NCR, Mumbai, and Bangalore, we offer express 4-hour delivery." },
                { q: "Are all medicines sourced from genuine suppliers?", a: "Yes, all products on Onco Life India are sourced directly from verified licensed manufacturers and packed under supervision." },
                { q: "What is your medicine return policy?", a: "We offer an easy 100% replacement or refund for damaged, defective, or incorrect products. Return requests must be raised within 48 hours of delivery by contacting our customer support team." },
                { q: "How does the 4-hour express delivery work?", a: "For emergency medications, orders placed before 6 PM in Delhi NCR, Mumbai, and Bangalore qualify for express 4-hour temperature-controlled deliveries." }
              ].map((faq, i) => (
                <div key={i} className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150/50 dark:border-gray-800 space-y-2">
                  <span className="font-bold text-gray-850 dark:text-white block text-sm leading-snug">{faq.q}</span>
                  <p className="text-xs text-gray-550 dark:text-gray-405 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== 4. PRIVACY POLICY PAGE ===== */}
        {activePage === "privacy" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Confidentiality &amp; Privacy Policy</h1>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-505 dark:text-gray-400 leading-relaxed">
                At Onco Life India, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.
              </p>

              <div className="space-y-4">
                {[
                  { 
                    title: "Information We Collect", 
                    desc: "• Personal details such as name, email, phone number, and address when you place an order or contact us.\n• Payment information to process transactions (secured through trusted payment gateways).\n• Browsing data such as IP address, cookies, and device information for website improvements." 
                  },
                  { 
                    title: "How We Use Your Information", 
                    desc: "• To process and deliver your orders.\n• To provide customer support and respond to queries.\n• To send important updates, offers, and service-related information.\n• To improve our website, products, and user experience." 
                  },
                  { 
                    title: "Data Security", 
                    desc: "We use secure servers and encryption to protect your personal data. Your payment details are never stored on our servers." 
                  },
                  { 
                    title: "Sharing Information", 
                    desc: "We do not sell or rent your personal information. Data is shared only with trusted third parties (such as delivery and payment partners) to complete your order." 
                  },
                  { 
                    title: "Your Rights", 
                    desc: "You can request access, correction, or deletion of your personal data at any time by contacting us." 
                  },
                  {
                    title: "Corporate & Support Info",
                    desc: "Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station, Delhi-110007\nCall & Whatsapp Us: +91 95402 94099"
                  }
                ].map((section, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150/40 dark:border-gray-800 space-y-1.5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h4>
                    <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed whitespace-pre-line">{section.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== 5. TERMS OF SERVICE PAGE ===== */}
        {activePage === "terms" && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Terms &amp; Conditions</h1>
            </div>

            <div className="space-y-6">
              <div className="p-5 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl border border-emerald-500/10 space-y-3">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">About Onco Life India</h4>
                <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed">
                  The domain name <strong>www.oncolifeindia.com</strong> is an online platform owned by Onco Life India. Your access to the Website, use of its features, transactions, and any services provided (directly or indirectly) from the Website (the “Services”) are all governed by these Terms of Use, and all policies referenced herein. These Terms of Use are a legally binding agreement between you and Onco Life India. By accessing, browsing, registering, or using the Website or Services in any way, shape, or form, you represent to Onco Life India that you have read, understood, and agreed to be bound by these Terms of Use. Your acceptance of these Terms of Use may be explicit, or it may be implicit.
                </p>
                <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed">
                  Additionally, by accepting these Terms, you also agree to follow our Privacy Policy, along with other policies, rules, guidelines, and documents on the Website, as these will always form part of these Terms and Conditions, as amended from time to time.
                </p>
                <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed">
                  If you leave our Website to go to a third-party Website, you accept that those other sites may have their own terms of use and policies regarding privacy. Onco Life India will not be liable or responsible for your use of any third-party sites, and their terms will apply to your use of their sites.
                </p>
                <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed">
                  Onco Life India may change, amend, or modify these Terms of Use, as well as the Privacy Policy from time to time, at its sole discretion. These changes will be effective immediately once they are posted on the Website. You will not be given direct notice of the changes, although they may be announced to the Website users. If you continue to use the Website after changes have been made, that will be viewed as your acceptance of those changes. You should check these Terms regularly.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Legal Compliance and Governing Laws",
                    desc: "The Terms of Use stipulations are implemented and governed in accordance with the following laws of India:\n• The Indian Contract Act of 1872\n• The Information Technology Act of 2000 and the rules, regulations, and guidelines made thereunder. They include:\n  - Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules of 2011\n  - Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules of 2021\n• The Drugs and Cosmetics Act of 1940 in conjunction with the Drugs and Cosmetics Rules of 1945.\n• The Drugs and Magic Remedies (Objectionable Advertisements) Act of 1954\n• The Indian Medical Council Act of 1956 and the rules made thereunder\n• The Pharmacy Act of 1948\n• The Consumer Protection Act of 2019 and the Consumer Protection (E-Commerce) Rules of 2020\n\nAny dispute that may arise from or in connection with these Terms will be governed by the laws of India, and will fall under the jurisdiction of the appropriate courts in India."
                  },
                  {
                    title: "Eligibility and Registration",
                    desc: "Users may be asked to perform a registration process as set by Onco Life India to access certain functionalities or use Services on the Website. This may include engaging with third-party service providers.\n\nFor the purpose of creating an account, the following details may be collected by Onco Life India:\n– Full Name\n– Username / User ID\n– Email Address\n– Residential Address\n– Age\n– Gender\n– Mobile / Contact Number\n– Account Password\n– Details of a valid payment or financial account (if applicable)\n\nIn the course of this registration process, you confirm that you are being truthful and that the information you are providing is completely accurate, timely, and valid, and you are solely liable for the confidentiality of your login information and are responsible for all actions that will be undertaken in your account.\n\nOnco Life India accounts will be canceled at their discretion once they are made aware of users providing information that is incorrect, incomplete, or simply false, and those breaching the Terms of Use of this contract."
                  }
                ].map((section, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150/40 dark:border-gray-800 space-y-1.5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h4>
                    <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed whitespace-pre-line">{section.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== 6. REFUND & RETURNS POLICY PAGE ===== */}
        {(activePage === "refund-returns" || activePage === "refund_returns") && (
          <div className="space-y-8">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Refund and Returns Policy</h1>
            </div>

            <div className="space-y-6">
              <p className="text-sm text-gray-505 dark:text-gray-400 leading-relaxed">
                At Onco Life India, we want you to have a safe and hassle-free shopping experience. If you are not satisfied with your order, our return and refund policy is designed to make the process simple and transparent.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Returns Eligibility",
                    desc: "• You may request a return if you receive a damaged, defective, or incorrect product.\n• Products must be returned in their original condition, unopened, unused, and with all packaging intact.\n• Due to safety and hygiene reasons, opened medicines, healthcare products, or consumables cannot be returned."
                  },
                  {
                    title: "Return Timeline",
                    desc: "• Return requests must be raised within 48 hours of delivery by contacting our customer support team.\n• Our team will guide you through the return process and arrange pickup if applicable."
                  },
                  {
                    title: "Refunds",
                    desc: "• Once the returned product is received and inspected, we will notify you about the approval or rejection of your refund.\n• Approved refunds will be processed to your original payment method within 7–10 working days.\n• In case of prepaid orders, the full amount (excluding shipping charges, if applicable) will be refunded.\n• For COD orders, refunds will be issued to your provided bank account or as store credit."
                  },
                  {
                    title: "Non-Returnable Items",
                    desc: "• Opened medicines or healthcare products.\n• Products without original packaging.\n• Items returned after the allowed time frame."
                  },
                  {
                    title: "Exchanges",
                    desc: "• If you wish to exchange a product for the same item (for example, if it was damaged in transit), we will provide a replacement free of cost."
                  },
                  {
                    title: "Corporate & Support Info",
                    desc: "Office Add. PRA-05A, Ground Floor, Pratap Nagar Metro Station, Delhi-110007\nCall & Whatsapp Us: +91 95402 94099"
                  }
                ].map((section, idx) => (
                  <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-150/40 dark:border-gray-800 space-y-1.5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h4>
                    <p className="text-xs text-gray-505 dark:text-gray-400 leading-relaxed whitespace-pre-line">{section.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
