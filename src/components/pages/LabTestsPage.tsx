"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { LAB_TESTS, LabTest } from "@/data/mockData";
import {
  FlaskConical, Calendar, Clock, Star, ShieldCheck,
  CheckCircle, Landmark, X, AlertCircle, Sparkles
} from "lucide-react";

export default function LabTestsPage() {
  const { setActivePage } = useApp();
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [apptDate, setApptDate] = useState("");
  const [apptSlot, setApptSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest || !apptDate || !apptSlot || !patientName) return;

    setSuccessMsg(`${selectedTest.name} has been booked successfully!`);

    // Reset Form
    setApptDate("");
    setApptSlot("");
    setPatientName("");

    setTimeout(() => {
      setSuccessMsg("");
      setSelectedTest(null);
      setActivePage("dashboard", "tab=labs");
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <FlaskConical className="w-8 h-8 text-emerald-600" /> Lab Checkups &amp; Diagnostics
        </h1>
        <p className="text-gray-500 mt-1">Book diagnostic packages. Home sample collection by certified phlebotomists.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {LAB_TESTS.map((test) => {
          const discount = Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100);
          return (
            <div key={test.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
              {discount > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                  {discount}% OFF
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {test.parameters} Parameters Screened
                  </span>
                  <h2 className="text-lg font-bold text-gray-850 dark:text-white mt-2">{test.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">{test.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-850">
                  {test.includes.slice(0, 4).map((inc) => (
                    <div key={inc} className="flex items-center gap-1.5 truncate">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                  {test.includes.length > 4 && (
                    <span className="text-[10px] text-emerald-600 font-bold col-span-2 mt-1">
                      + {test.includes.length - 4} more tests included
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-850 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-400 font-bold block">{test.duration}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-900 dark:text-white">₹{test.price}</span>
                    {discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">₹{test.originalPrice}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTest(test)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Book Home Checkup
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lab Appointment Booking Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <span className="font-bold text-gray-800 dark:text-white">Schedule Lab Checkup</span>
              <button onClick={() => setSelectedTest(null)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{successMsg}</p>
                <p className="text-xs text-gray-400">Our health check coordinator will schedule confirmation steps shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedTest.parameters} Parameters
                  </span>
                  <span className="text-sm font-bold text-gray-850 dark:text-white block mt-2">{selectedTest.name}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Patient Name</label>
                  <input
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ankit Kumar"
                    className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Appointment Date</label>
                    <input
                      required
                      type="date"
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Select Slot</label>
                    <select
                      required
                      value={apptSlot}
                      onChange={(e) => setApptSlot(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select Time</option>
                      <option value="06:00 AM - 08:00 AM">06:00 AM - 08:00 AM (Fasting)</option>
                      <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM (Fasting)</option>
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-955/20 p-3.5 rounded-xl border border-amber-150 dark:border-amber-900/40 flex gap-2.5 text-[10px] text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Fasting for at least 10-12 hours is recommended before early morning metabolic parameter draws.</p>
                </div>

                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md">
                  Confirm Booking (Pay ₹{selectedTest.price})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
