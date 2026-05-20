"use client";
import { useApp } from "@/context/AppContext";
import { Mail, Phone, MapPin, MessageSquare, Info, ShieldCheck, HelpCircle } from "lucide-react";

export default function StaticPages() {
  const { activePage, setActivePage } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-4 mb-8 scrollbar-none">
        {[
          { id: "about", label: "About Us" },
          { id: "contact", label: "Contact Us" },
          { id: "faq", label: "FAQs" },
          { id: "privacy", label: "Privacy Policy" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePage(tab.id as any)}
            className={`pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activePage === tab.id
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-6">
        {activePage === "about" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">About MS Care</h1>
            </div>

            <p>
              MS Care is one of India&apos;s leading digital healthcare platforms. We strive to make premium healthcare accessible, affordable, and trusted by connecting patients with genuine medicines, medical devices, online consultations, and home-diagnostics packages.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl">
                <span className="text-xl font-black text-emerald-600 block">100% Genuine</span>
                <p className="text-xs text-gray-400 mt-1">Directly sourced from licensed manufacturers under certified pharmacist supervision.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl">
                <span className="text-xl font-black text-emerald-600 block">Express Delivery</span>
                <p className="text-xs text-gray-400 mt-1">Superfast delivery under 4 hours across major metropolitan centers.</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl">
                <span className="text-xl font-black text-emerald-600 block">50 Lakh+ Users</span>
                <p className="text-xs text-gray-400 mt-1">Trusted health partner providing regular checkups and prescriptions.</p>
              </div>
            </div>
          </div>
        )}

        {activePage === "contact" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Contact Our Team</h1>
            </div>

            <p>
              Have a question about your medication order, prescription validation, or appointment timing? Get in touch with our 24/7 care desk team.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl flex gap-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block text-xs">Call Customer Care</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">1800-123-CARE (Toll Free)</span>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl flex gap-3">
                <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block text-xs">Email Correspondence</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">support@mscare.in</span>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-850 rounded-2xl flex gap-3 sm:col-span-2">
                <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block text-xs">Corporate Office</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">Plot No. 12, Tech Sector 62, Noida, UP, India - 201301</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePage === "faq" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Frequently Asked Questions</h1>
            </div>

            <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
              {[
                { q: "How do I upload my medical prescription?", a: "Navigate to the 'Upload Rx' tab on the header, drag & drop your PDF or image slip, and our clinical OCR will automatically parse the matched drugs." },
                { q: "Are all medicines sourced from genuine suppliers?", a: "Yes, all products on MS Care are sourced directly from verified licensed manufacturers and packed under supervision." },
                { q: "How long does home sample lab test collection take?", a: "Our certified phlebotomists will arrive at your home slot selection. Samples are processed, and digital results are sent to your dashboard within 12 hours." },
              ].map((faq, i) => (
                <div key={i} className="pt-4 first:pt-0 space-y-1">
                  <span className="font-bold text-gray-850 dark:text-white block">{faq.q}</span>
                  <p className="text-xs text-gray-400 mt-1">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "privacy" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Privacy Policy</h1>
            </div>

            <p>
              At MS Care, we take patient confidentiality and healthcare records safety seriously. We store medical history, prescriptions, and diagnostic profiles securely, complying with all state medicine guidelines and regulatory guidelines.
            </p>
            <p>
              Your data is encrypted end-to-end, and is never shared with third-party advertising partners.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
