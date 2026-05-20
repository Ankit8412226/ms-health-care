"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PRODUCTS } from "@/data/mockData";
import ProductCard from "@/components/ProductCard";
import {
  Package, Upload, Heart, MapPin, Stethoscope, FlaskConical,
  LogOut, Phone, Mail, User, ShieldCheck, ClipboardCheck
} from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    logout,
    orders,
    prescriptions,
    doctorAppointments,
    labAppointments,
    wishlist,
    addresses,
    deleteAddress
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"orders" | "rx" | "appointments" | "labs" | "wish" | "addr">("orders");

  const wProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* User Card Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
              {user?.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-gray-400 mt-1">{user?.email}</p>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <span className="text-gray-400 font-bold block">Orders</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">{orders.length}</span>
              </div>
              <div className="text-center">
                <span className="text-gray-400 font-bold block">Prescriptions</span>
                <span className="text-base font-black text-emerald-600 mt-1 block">{prescriptions.length}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full mt-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out Account
            </button>
          </div>

          {/* Sub Navigation List */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 shadow-sm space-y-1">
            {[
              { id: "orders", label: "My Orders", icon: Package },
              { id: "rx", label: "My Prescriptions", icon: Upload },
              { id: "appointments", label: "Doctor Appointments", icon: Stethoscope },
              { id: "labs", label: "Lab Package Bookings", icon: FlaskConical },
              { id: "wish", label: "My Wishlist", icon: Heart },
              { id: "addr", label: "Saved Addresses", icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSubTab(id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-colors ${
                  activeSubTab === id
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area column */}
        <div className="lg:col-span-8 space-y-6">
          {activeSubTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">My Orders</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400">No orders placed yet.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-wrap justify-between items-baseline gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-xs text-gray-400">Order ID: <strong className="text-gray-700 dark:text-white">{order.id}</strong></span>
                        <p className="text-[10px] text-gray-400 mt-0.5">Placed on: {order.date}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-32 overflow-y-auto pr-2">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="py-2 flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{item.product.name} ({item.quantity})</span>
                          <span className="font-semibold text-gray-800 dark:text-white">₹{item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                      <span className="text-gray-400">Paid using: <strong className="uppercase text-gray-600 dark:text-gray-300">{order.paymentMethod}</strong></span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">Total Amount: ₹{order.total}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === "rx" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">My Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p className="text-sm text-gray-400">No prescriptions uploaded yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-gray-800 dark:text-white truncate max-w-[150px]">{rx.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Uploaded on: {rx.date}</p>
                      {rx.extractedMedicines && (
                        <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 space-y-1">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">OCR MATCHED DRUGS:</span>
                          {rx.extractedMedicines.map((med) => (
                            <span key={med} className="inline-block text-[10px] font-medium bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded mr-1 mb-1">
                              {med}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "appointments" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Doctor Consultations</h3>
              {doctorAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">No appointments booked yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctorAppointments.map((appt) => (
                    <div key={appt.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {appt.type} CONSULT
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{appt.status}</span>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-white block">{appt.doctor.name}</span>
                        <span className="text-xs text-gray-400">{appt.doctor.specialty}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-850 text-xs text-gray-500">
                        Date: <strong>{appt.date}</strong> | Slot: <strong>{appt.slot}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "labs" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Lab Test Bookings</h3>
              {labAppointments.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">No diagnostics packages booked yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {labAppointments.map((appt) => (
                    <div key={appt.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          HOME COLLECTION
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{appt.status}</span>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-white block">{appt.test.name}</span>
                        <span className="text-xs text-gray-400">Patient: {appt.patientName}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-850 text-xs text-gray-500">
                        Date: <strong>{appt.date}</strong> | Slot: <strong>{appt.slot}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "wish" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">My Wishlist</h3>
              {wProducts.length === 0 ? (
                <p className="text-sm text-gray-400">Wishlist empty.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === "addr" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Saved Addresses</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm relative">
                    <span className="text-xs font-bold text-gray-800 dark:text-white block">{addr.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{addr.phone}</span>
                    <p className="text-xs text-gray-500 mt-2">
                      {addr.flat}, {addr.area}, {addr.city} - {addr.pincode}
                    </p>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="absolute bottom-4 right-4 text-xs font-bold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
