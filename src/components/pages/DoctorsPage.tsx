"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DOCTORS, Doctor } from "@/data/mockData";
import {
  Stethoscope, Calendar, Clock, Star, ShieldCheck,
  Video, MessageSquare, Phone, X, AlertCircle
} from "lucide-react";
import Image from "next/image";

export default function DoctorsPage() {
  const { bookDoctor, setActivePage } = useApp();
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [apptDate, setApptDate] = useState("");
  const [apptSlot, setApptSlot] = useState("");
  const [apptType, setApptType] = useState<"Chat" | "Video" | "Audio">("Video");
  const [patientName, setPatientName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !apptDate || !apptSlot || !patientName) return;

    bookDoctor(selectedDoc, apptDate, apptSlot, apptType, patientName);
    setSuccessMsg(`Your appointment with ${selectedDoc.name} has been scheduled successfully!`);

    // Reset Form
    setApptDate("");
    setApptSlot("");
    setPatientName("");

    setTimeout(() => {
      setSuccessMsg("");
      setSelectedDoc(null);
      setActivePage("dashboard", "tab=appointments");
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Stethoscope className="w-8 h-8 text-emerald-600" /> Online Doctor Consultation
        </h1>
        <p className="text-gray-500 mt-1">Consult with verified clinical experts from the comfort of your home</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {DOCTORS.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0">
                <Image src={doc.image} alt={doc.name} fill className="object-cover" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold text-gray-850 dark:text-white">{doc.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-emerald-600 font-bold">{doc.specialty}</p>
                <p className="text-[10px] text-gray-400 font-mono">{doc.education}</p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-700">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                    {doc.rating}
                  </div>
                  <span className="text-[10px] text-gray-400">{doc.experience} Years Exp</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between items-end gap-4 sm:border-l border-gray-100 dark:border-gray-850 sm:pl-4">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Fees</span>
                <span className="text-lg font-black text-gray-900 dark:text-white">₹{doc.consultationFee}</span>
              </div>
              <button
                onClick={() => setSelectedDoc(doc)}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <span className="font-bold text-gray-800 dark:text-white">Schedule Appointment</span>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="inline-flex w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{successMsg}</p>
                <p className="text-xs text-gray-400">Consultation link details have been updated in your dashboard appointments tab.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50">
                    <Image src={selectedDoc.image} alt={selectedDoc.name} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">{selectedDoc.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">{selectedDoc.specialty}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Consultation Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Video", icon: Video },
                      { id: "Chat", icon: MessageSquare },
                      { id: "Audio", icon: Phone },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setApptType(mode.id as any)}
                        className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          apptType === mode.id
                            ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <mode.icon className="w-3.5 h-3.5" /> {mode.id}
                      </button>
                    ))}
                  </div>
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
                      {selectedDoc.availableSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-850 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 flex gap-2.5 text-[10px] text-gray-500">
                  <AlertCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p>Confirmation message details will be shared on your registered phone number once verified.</p>
                </div>

                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md">
                  Confirm Booking (Pay ₹{selectedDoc.consultationFee})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
