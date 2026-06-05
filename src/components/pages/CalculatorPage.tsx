"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  Activity, ArrowRight, BookOpen, Calculator, Calendar, ChevronRight,
  ClipboardList, HelpCircle, Info, RefreshCw, Scale, ShieldAlert, Sparkles
} from "lucide-react";

export default function CalculatorPage() {
  const { setActivePage } = useApp();

  // Common State
  const [adultDose, setAdultDose] = useState<string>("500");
  const [calcTab, setCalcTab] = useState<"age" | "weight" | "bsa">("age");

  // Age Tab State
  const [ageUnit, setAgeUnit] = useState<"years" | "months">("years");
  const [ageValue, setAgeValue] = useState<string>("6");

  // Weight Tab State
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightValue, setWeightValue] = useState<string>("20");

  // BSA Tab State
  const [bsaMode, setBsaMode] = useState<"direct" | "calc">("direct");
  const [directBsa, setDirectBsa] = useState<string>("0.8");
  const [heightCm, setHeightCm] = useState<string>("110");
  const [weightKg, setWeightKg] = useState<string>("20");

  // Calculated Results
  const [results, setResults] = useState<any>({});

  // Trigger calculations on state updates
  useEffect(() => {
    const dose = parseFloat(adultDose) || 0;
    const res: any = { dose };

    // ── AGE CALCULATIONS ──
    if (calcTab === "age") {
      const ageVal = parseFloat(ageValue) || 0;
      if (ageUnit === "years") {
        // Young's Rule: (Age / (Age + 12)) * Adult Dose
        const youngsDose = ageVal > 0 ? (ageVal / (ageVal + 12)) * dose : 0;
        res.youngs = {
          value: parseFloat(youngsDose.toFixed(2)),
          formula: "Child Dose = [Age in Years / (Age + 12)] × Adult Dose",
          substitution: `Child Dose = [${ageVal} / (${ageVal} + 12)] × ${dose} mg`,
          calculation: `Child Dose = [${ageVal} / ${ageVal + 12}] × ${dose} = ${(ageVal / (ageVal + 12)).toFixed(4)} × ${dose} = ${youngsDose.toFixed(2)} mg`,
          validRange: ageVal >= 1 && ageVal <= 12,
          warning: ageVal < 1 || ageVal > 12 ? "Clinically formulated for ages 1 to 12 years." : null
        };

        // Dilling's Rule: (Age / 20) * Adult Dose
        const dillingsDose = ageVal > 0 ? (ageVal / 20) * dose : 0;
        res.dillings = {
          value: parseFloat(dillingsDose.toFixed(2)),
          formula: "Child Dose = [Age in Years / 20] × Adult Dose",
          substitution: `Child Dose = [${ageVal} / 20] × ${dose} mg`,
          calculation: `Child Dose = ${ageVal / 20} × ${dose} = ${dillingsDose.toFixed(2)} mg`,
          validRange: ageVal >= 4 && ageVal <= 20,
          warning: ageVal < 4 || ageVal > 20 ? "Clinically formulated for ages 4 to 20 years." : null
        };
      } else {
        // Fried's Rule: (Age in Months / 150) * Adult Dose
        const friedDose = ageVal > 0 ? (ageVal / 150) * dose : 0;
        res.frieds = {
          value: parseFloat(friedDose.toFixed(2)),
          formula: "Child Dose = [Age in Months / 150] × Adult Dose",
          substitution: `Child Dose = [${ageVal} / 150] × ${dose} mg`,
          calculation: `Child Dose = ${(ageVal / 150).toFixed(4)} × ${dose} = ${friedDose.toFixed(2)} mg`,
          validRange: ageVal <= 24,
          warning: ageVal > 24 ? "Clinically formulated for infants under 2 years (24 months)." : null
        };
      }
    }

    // ── WEIGHT CALCULATIONS ──
    if (calcTab === "weight") {
      const wtVal = parseFloat(weightValue) || 0;
      if (weightUnit === "kg") {
        // Clark's Rule (kg): (Weight in kg / 70) * Adult Dose
        const clarkKgDose = wtVal > 0 ? (wtVal / 70) * dose : 0;
        res.clarkKg = {
          value: parseFloat(clarkKgDose.toFixed(2)),
          formula: "Child Dose = [Weight in kg / 70] × Adult Dose",
          substitution: `Child Dose = [${wtVal} / 70] × ${dose} mg`,
          calculation: `Child Dose = ${(wtVal / 70).toFixed(4)} × ${dose} = ${clarkKgDose.toFixed(2)} mg`,
        };
      } else {
        // Clark's Rule (lbs): (Weight in lbs / 150) * Adult Dose
        const clarkLbsDose = wtVal > 0 ? (wtVal / 150) * dose : 0;
        res.clarkLbs = {
          value: parseFloat(clarkLbsDose.toFixed(2)),
          formula: "Child Dose = [Weight in lbs / 150] × Adult Dose",
          substitution: `Child Dose = [${wtVal} / 150] × ${dose} mg`,
          calculation: `Child Dose = ${(wtVal / 150).toFixed(4)} × ${dose} = ${clarkLbsDose.toFixed(2)} mg`,
        };
      }
    }

    // ── BSA CALCULATIONS ──
    if (calcTab === "bsa") {
      let bsa = 0;
      let calculatedByMosteller = false;
      let calculatedBsaStr = "";

      if (bsaMode === "direct") {
        bsa = parseFloat(directBsa) || 0;
      } else {
        const ht = parseFloat(heightCm) || 0;
        const wt = parseFloat(weightKg) || 0;
        if (ht > 0 && wt > 0) {
          // Mosteller: Sqrt((Height * Weight) / 3600)
          bsa = Math.sqrt((ht * wt) / 3600);
          calculatedByMosteller = true;
          calculatedBsaStr = `√[(${ht} cm × ${wt} kg) / 3600] = √[${(ht * wt)} / 3600] = √${((ht * wt) / 3600).toFixed(5)} = ${bsa.toFixed(3)} m²`;
        }
      }

      // BSA Rule: (Child BSA / 1.73) * Adult Dose
      const bsaDose = bsa > 0 ? (bsa / 1.73) * dose : 0;
      res.bsaRule = {
        value: parseFloat(bsaDose.toFixed(2)),
        childBsa: parseFloat(bsa.toFixed(3)),
        formula: "Child Dose = [Child BSA in m² / 1.73] × Adult Dose",
        substitution: `Child Dose = [${bsa.toFixed(3)} / 1.73] × ${dose} mg`,
        calculation: `Child Dose = ${(bsa / 1.73).toFixed(4)} × ${dose} = ${bsaDose.toFixed(2)} mg`,
        calculatedByMosteller,
        mostellerFormula: "BSA (Mosteller) = √[Height(cm) × Weight(kg) / 3600]",
        mostellerCalculation: calculatedBsaStr
      };
    }

    setResults(res);
  }, [calcTab, adultDose, ageUnit, ageValue, weightUnit, weightValue, bsaMode, directBsa, heightCm, weightKg]);

  // Load Exam/Course example queries
  const loadExample = (type: "youngs" | "frieds" | "clark" | "bsa") => {
    setAdultDose("150");
    if (type === "youngs") {
      setCalcTab("age");
      setAgeUnit("years");
      setAgeValue("8");
    } else if (type === "frieds") {
      setCalcTab("age");
      setAgeUnit("months");
      setAgeValue("10");
    } else if (type === "clark") {
      setCalcTab("weight");
      setWeightUnit("kg");
      setWeightValue("14");
    } else if (type === "bsa") {
      setCalcTab("bsa");
      setBsaMode("calc");
      setHeightCm("90");
      setWeightKg("12");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              D.Pharm Pharmaceutical Calculations
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white flex items-center justify-center md:justify-start gap-3">
              <Calculator className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-450 shrink-0" /> Pediatric Dosage Calculator
            </h1>
            <p className="text-gray-300 text-sm max-w-xl font-medium leading-relaxed">
              Formulated for D.Pharm syllabus pharmaceutics exam preparations and clinical guidance. Calculate child doses based on adult standards.
            </p>
          </div>
          <button
            onClick={() => setActivePage("shop")}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:scale-[1.02] cursor-pointer shrink-0 text-xs uppercase tracking-wider"
          >
            Browse Pediatric Products
          </button>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Configuration Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <ClipboardList className="w-5 h-5 text-emerald-600" /> 1. Input Parameters
            </h2>

            {/* Adult Dose (All tabs need this) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">
                Standard Adult Dose (mg)
              </label>
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <input
                  type="number"
                  value={adultDose}
                  onChange={(e) => setAdultDose(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-wider">MG</span>
              </div>
            </div>

            {/* Formula Type Tabs Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">
                Calculation Rule Method
              </label>
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-850 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-800/80">
                {(["age", "weight", "bsa"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCalcTab(tab)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all uppercase cursor-pointer ${
                      calcTab === tab
                        ? "bg-emerald-650 bg-emerald-600 text-white shadow"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Sub-Inputs */}
            {calcTab === "age" && (
              <div className="space-y-4 pt-2 border-t border-gray-50 dark:border-gray-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">
                    Child Age Unit
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => { setAgeUnit("years"); setAgeValue("6"); }}
                      className={`px-3 py-1 rounded-lg transition-all ${ageUnit === "years" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Years (Child)
                    </button>
                    <button
                      onClick={() => { setAgeUnit("months"); setAgeValue("10"); }}
                      className={`px-3 py-1 rounded-lg transition-all ${ageUnit === "months" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Months (Infant)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-455 dark:text-gray-400 uppercase tracking-widest block">
                    Child Age Value ({ageUnit})
                  </label>
                  <input
                    type="number"
                    value={ageValue}
                    onChange={(e) => setAgeValue(e.target.value)}
                    placeholder={ageUnit === "years" ? "e.g. 8" : "e.g. 10"}
                    className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                  />
                </div>
              </div>
            )}

            {calcTab === "weight" && (
              <div className="space-y-4 pt-2 border-t border-gray-50 dark:border-gray-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">
                    Weight Unit
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => { setWeightUnit("kg"); setWeightValue("20"); }}
                      className={`px-3 py-1 rounded-lg transition-all ${weightUnit === "kg" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Kilograms (kg)
                    </button>
                    <button
                      onClick={() => { setWeightUnit("lbs"); setWeightValue("45"); }}
                      className={`px-3 py-1 rounded-lg transition-all ${weightUnit === "lbs" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Pounds (lbs)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-455 dark:text-gray-400 uppercase tracking-widest block">
                    Child Weight ({weightUnit})
                  </label>
                  <input
                    type="number"
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                  />
                </div>
              </div>
            )}

            {calcTab === "bsa" && (
              <div className="space-y-4 pt-2 border-t border-gray-50 dark:border-gray-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-450 dark:text-gray-400 uppercase tracking-widest block">
                    BSA Entry Mode
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => setBsaMode("direct")}
                      className={`px-3 py-1 rounded-lg transition-all ${bsaMode === "direct" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Direct BSA (m²)
                    </button>
                    <button
                      onClick={() => setBsaMode("calc")}
                      className={`px-3 py-1 rounded-lg transition-all ${bsaMode === "calc" ? "bg-white dark:bg-gray-750 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}
                    >
                      Calculate via Ht/Wt
                    </button>
                  </div>
                </div>

                {bsaMode === "direct" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-455 dark:text-gray-400 uppercase tracking-widest block">
                      Body Surface Area (m²)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={directBsa}
                      onChange={(e) => setDirectBsa(e.target.value)}
                      placeholder="e.g. 0.8"
                      className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-455 dark:text-gray-400 uppercase tracking-widest block">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        placeholder="e.g. 110"
                        className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-455 dark:text-gray-400 uppercase tracking-widest block">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        placeholder="e.g. 20"
                        className="w-full bg-gray-50/50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:text-white font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* D.Pharm Syllabus Solved Examples Sidebar */}
          <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 p-6 rounded-3xl space-y-4">
            <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5" /> D.Pharm Syllabus Questions
            </h3>
            <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
              Click any standard board exam problem below to populate the values and view the calculated clinical steps instantly:
            </p>

            <div className="space-y-3">
              {[
                {
                  id: "youngs",
                  title: "Age-Based: Young's Rule Problem",
                  desc: "Calculate dose for an 8 year old child if adult dose is 150mg."
                },
                {
                  id: "frieds",
                  title: "Infants: Fried's Rule Problem",
                  desc: "Calculate dose for a 10 month old infant if adult dose is 150mg."
                },
                {
                  id: "clark",
                  title: "Weight: Clark's Rule (kg)",
                  desc: "Calculate dose for a 14 kg child if adult dose is 150mg."
                },
                {
                  id: "bsa",
                  title: "Modern: Surface Area Rule (BSA)",
                  desc: "Calculate dose for a child (Ht: 90cm, Wt: 12kg) if adult dose is 150mg."
                }
              ].map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => loadExample(ex.id as any)}
                  className="w-full text-left p-3.5 bg-white dark:bg-gray-900 border border-gray-150/70 dark:border-gray-800/80 hover:border-emerald-500 rounded-2xl shadow-sm text-xs space-y-1 hover:shadow-md transition-all group cursor-pointer"
                >
                  <span className="font-bold text-gray-800 dark:text-white group-hover:text-emerald-600 block flex items-center gap-1">
                    {ex.title} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-600" />
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{ex.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Calculated Results & Mathematical Steps Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-sm space-y-8 min-h-[450px]">
            <h2 className="text-base font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Scale className="w-5 h-5 text-emerald-600" /> 2. Dose Calculations &amp; Working
            </h2>

            {/* AGE RULE RESULTS */}
            {calcTab === "age" && (
              <div className="space-y-8">
                {ageUnit === "years" ? (
                  <>
                    {/* Young's Rule */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Young&apos;s Rule (Ages 1 - 12)</span>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Recommended for general pediatric calculations</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-gray-900 dark:text-white block">
                            {results.youngs?.value} mg
                          </span>
                        </div>
                      </div>

                      {/* Warnings */}
                      {results.youngs?.warning && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 p-3.5 rounded-xl text-xs font-medium">
                          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>{results.youngs.warning}</span>
                        </div>
                      )}

                      {/* Mathematical Working */}
                      <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                        <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.youngs?.formula}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.youngs?.substitution}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.youngs?.calculation}</p>
                      </div>
                    </div>

                    {/* Dilling's Rule */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Dilling&apos;s Rule (Ages 4 - 20)</span>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Often preferred in exams due to easy computation</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-gray-900 dark:text-white block">
                            {results.dillings?.value} mg
                          </span>
                        </div>
                      </div>

                      {/* Warnings */}
                      {results.dillings?.warning && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 p-3.5 rounded-xl text-xs font-medium">
                          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>{results.dillings.warning}</span>
                        </div>
                      )}

                      {/* Mathematical Working */}
                      <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                        <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.dillings?.formula}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.dillings?.substitution}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.dillings?.calculation}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Fried's Rule */
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Fried&apos;s Rule (Infants Under 2 Years)</span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Calculated using infant age in months</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-gray-900 dark:text-white block">
                          {results.frieds?.value} mg
                        </span>
                      </div>
                    </div>

                    {/* Warnings */}
                    {results.frieds?.warning && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 p-3.5 rounded-xl text-xs font-medium">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>{results.frieds.warning}</span>
                      </div>
                    )}

                    {/* Mathematical Working */}
                    <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                      <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.frieds?.formula}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.frieds?.substitution}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.frieds?.calculation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WEIGHT RULE RESULTS */}
            {calcTab === "weight" && (
              <div className="space-y-6">
                {weightUnit === "kg" ? (
                  /* Clark's kg Rule */
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Clark&apos;s Rule (Kilograms)</span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Calculated using standard 70 kg average adult mass</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-gray-900 dark:text-white block">
                          {results.clarkKg?.value} mg
                        </span>
                      </div>
                    </div>

                    {/* Mathematical Working */}
                    <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                      <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.clarkKg?.formula}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.clarkKg?.substitution}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.clarkKg?.calculation}</p>
                    </div>
                  </div>
                ) : (
                  /* Clark's lbs Rule */
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Clark&apos;s Rule (Pounds)</span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Calculated using standard 150 lbs average adult mass</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-gray-900 dark:text-white block">
                          {results.clarkLbs?.value} mg
                        </span>
                      </div>
                    </div>

                    {/* Mathematical Working */}
                    <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                      <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.clarkLbs?.formula}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.clarkLbs?.substitution}</p>
                      <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.clarkLbs?.calculation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BSA RULE RESULTS */}
            {calcTab === "bsa" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                  {/* Mosteller Calculation Display if active */}
                  {results.bsaRule?.calculatedByMosteller && (
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-4 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block uppercase tracking-wider">Step 1: Calculate Child BSA (Mosteller)</span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Required surface area calculated from height &amp; weight</span>
                      </div>
                      <div className="text-xs font-mono space-y-2 text-gray-550 dark:text-gray-400">
                        <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.bsaRule.mostellerFormula}</p>
                        <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.bsaRule.mostellerCalculation}</p>
                        <p className="pt-2 font-bold text-gray-900 dark:text-white">Calculated Child BSA = {results.bsaRule.childBsa} m²</p>
                      </div>
                    </div>
                  )}

                  {/* Main BSA Rule */}
                  <div className="flex justify-between items-start gap-4 flex-wrap pt-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
                        {results.bsaRule?.calculatedByMosteller ? "Step 2: Dosage via Body Surface Area (BSA)" : "Dosage via Body Surface Area (BSA)"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Most accurate method, standard for oncology drugs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900 dark:text-white block">
                        {results.bsaRule?.value} mg
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Working */}
                  <div className="text-xs space-y-2 border-t border-gray-100 dark:border-gray-800/80 pt-3.5 font-mono text-gray-500 dark:text-gray-400">
                    <p><strong className="text-gray-700 dark:text-gray-300">Formula:</strong> {results.bsaRule?.formula}</p>
                    <p><strong className="text-gray-700 dark:text-gray-300">Substitution:</strong> {results.bsaRule?.substitution}</p>
                    <p><strong className="text-gray-700 dark:text-gray-300">Working Steps:</strong> {results.bsaRule?.calculation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Note & Context */}
            <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl flex gap-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
              <Info className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>
                <strong>Clinical Note:</strong> Formulas based on age and weight are legacy approximations taught in the D.Pharm curriculum (such as Young&apos;s or Clark&apos;s rules). For critical medications (e.g. oncology/chemo), dosages are strictly calculated based on Body Surface Area (BSA) or pharmacokinetic clearances.
              </span>
            </div>
        </div>
      </div>
    </div>

    {/* D.Pharm Syllabus Solved Examples Section */}
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">D.Pharm Examination Prep</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" /> Syllabus Board Exam Reference Guide
            </h2>
            <p className="text-xs text-gray-550 dark:text-gray-400 font-medium">
              Review standard step-by-step example questions solved using all major pediatric calculation rules taught in Pharmaceutics.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Young's Rule */}
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-850/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Young&apos;s Rule
                </span>
                <span className="text-[10px] text-gray-450 dark:text-gray-450 font-bold">Ages 1–12 Years</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate the dose for an 8-year-old child if the adult dose of a drug is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong><br />Child Dose = [Age / (Age + 12)] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Substitution:</strong><br />= [8 / (8 + 12)] × 150 mg</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong><br />= [8 / 20] × 150 mg<br />= 0.4 × 150 = 60 mg</p>
              </div>
            </div>
            <button
              onClick={() => loadExample("youngs")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Dilling's Rule */}
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-850/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Dilling&apos;s Rule
                </span>
                <span className="text-[10px] text-gray-450 dark:text-gray-450 font-bold">Ages 4–20 Years</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate the dose for an 8-year-old child if the adult dose of a drug is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong><br />Child Dose = [Age / 20] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Substitution:</strong><br />= [8 / 20] × 150 mg</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong><br />= 0.4 × 150 = 60 mg</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAdultDose("150");
                setCalcTab("age");
                setAgeUnit("years");
                setAgeValue("8");
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Fried's Rule */}
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-850/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Fried&apos;s Rule
                </span>
                <span className="text-[10px] text-gray-450 dark:text-gray-450 font-bold">Infants (0–2 Years)</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate the dose for a 10-month-old infant if the adult dose of a drug is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong><br />Child Dose = [Age in Months / 150] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Substitution:</strong><br />= [10 / 150] × 150 mg</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong><br />= 0.0667 × 150 = 10 mg</p>
              </div>
            </div>
            <button
              onClick={() => loadExample("frieds")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Clark&apos;s Rule (lbs) */}
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-850/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Clark&apos;s Rule (lbs)
                </span>
                <span className="text-[10px] text-gray-455 dark:text-gray-455 font-bold">Weight in Pounds</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate the dose for a child weighing 30 lbs if the adult dose is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong><br />Child Dose = [Weight in lbs / 150] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Substitution:</strong><br />= [30 / 150] × 150 mg</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong><br />= 0.2 × 150 = 30 mg</p>
              </div>
            </div>
            <button
              onClick={() => {
                setAdultDose("150");
                setCalcTab("weight");
                setWeightUnit("lbs");
                setWeightValue("30");
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Clark&apos;s Rule (kg) */}
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-855/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Clark&apos;s Rule (kg)
                </span>
                <span className="text-[10px] text-gray-455 dark:text-gray-455 font-bold">Weight in Kilograms</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate the dose for a child weighing 14 kg if the adult dose is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong><br />Child Dose = [Weight in kg / 70] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Substitution:</strong><br />= [14 / 70] × 150 mg</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong><br />= 0.2 × 150 = 30 mg</p>
              </div>
            </div>
            <button
              onClick={() => loadExample("clark")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: BSA Rule */}
          <div className="bg-gray-50 dark:bg-gray-955 p-6 rounded-2xl border border-gray-100 dark:border-gray-850/80 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  BSA Rule (Mosteller)
                </span>
                <span className="text-[10px] text-gray-455 dark:text-gray-455 font-bold">Body Surface Area (m²)</span>
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white leading-snug">
                Q: Calculate dose for child (Height: 90 cm, Weight: 12 kg) if adult dose is 150 mg.
              </h3>
              <div className="space-y-2 text-xs text-gray-650 dark:text-gray-400 font-mono leading-relaxed bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800">
                <p><strong className="text-emerald-600 dark:text-emerald-400">BSA:</strong> √[(90 × 12) / 3600] = √0.3 ≈ 0.548 m²</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Formula:</strong> [Child BSA / 1.73] × Adult Dose</p>
                <p><strong className="text-emerald-600 dark:text-emerald-400">Calculation:</strong> [0.548 / 1.73] × 150 ≈ 47.51 mg</p>
              </div>
            </div>
            <button
              onClick={() => loadExample("bsa")}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
            >
              Load into Calculator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
