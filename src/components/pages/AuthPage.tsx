"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Mail, Lock, User, Phone, ArrowRight, ShieldCheck, AlertCircle, Loader2
} from "lucide-react";

export default function AuthPage() {
  const { login, signup, authMode, setAuthMode, otpEmail, setOtpEmail, setActivePage } = useApp();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setIsLoading(true);

    try {
      if (authMode === "login") {
        if (!emailInput || !passwordInput) {
          setValidationError("Please fill in all credentials.");
          setIsLoading(false);
          return;
        }
        const ok = await login(emailInput, passwordInput);
        if (!ok) {
          setValidationError("Invalid email or password. Please try again.");
        }
      } else if (authMode === "signup") {
        if (!nameInput || !emailInput || !phoneInput || !passwordInput) {
          setValidationError("Please fill in all details to register.");
          setIsLoading(false);
          return;
        }
        const ok = await signup(nameInput, emailInput, phoneInput, passwordInput);
        if (!ok) {
          setValidationError("Registration failed. Email may already exist.");
        }
      } else if (authMode === "forgot") {
        if (!emailInput) {
          setValidationError("Please enter your email to proceed.");
          setIsLoading(false);
          return;
        }
        setOtpEmail(emailInput);
        setAuthMode("otp");
      } else if (authMode === "otp") {
        if (otpInput === "123456" || otpInput.length === 6) {
          setActivePage("home");
        } else {
          setValidationError("Invalid 6-digit OTP verification token.");
        }
      }
    } catch {
      setValidationError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {authMode === "login" && (
            <>
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Welcome Back to Oncolife India</h2>
              <p className="text-xs text-gray-400">Login to manage your oncology orders, clinical prescriptions & tracker</p>
            </>
          )}
          {authMode === "signup" && (
            <>
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Create Account</h2>
              <p className="text-xs text-gray-400">Join over 50 Lakh+ users getting authentic oncology clinical care</p>
            </>
          )}
          {authMode === "forgot" && (
            <>
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Password Recovery</h2>
              <p className="text-xs text-gray-400">Enter email to send an OTP verification token code</p>
            </>
          )}
          {authMode === "otp" && (
            <>
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Verify Account</h2>
              <p className="text-xs text-gray-400">Enter 6-digit verification code sent to {otpEmail}</p>
            </>
          )}
        </div>

        {validationError && (
          <div className="bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/50 p-3 rounded-2xl flex gap-2 text-xs text-red-650 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ankit Kumar"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-750 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {authMode !== "otp" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ankit@oncolifeindia.com"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-850 border border-gray-250 dark:border-gray-750 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {authMode === "signup" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 99999 00000"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {(authMode === "login" || authMode === "signup") && (
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block">Password</label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() => setAuthMode("forgot")}
                    className="text-[10px] font-bold text-emerald-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {authMode === "otp" && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider block">Verification Code</label>
              <input
                required
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="e.g. 123456"
                maxLength={6}
                className="w-full text-center text-sm font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-gray-400 text-center mt-2">Didn&apos;t receive code? <button type="button" className="text-emerald-600 font-bold hover:underline">Resend OTP</button></p>
            </div>
          )}

          <button
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {authMode === "login" && "Login Securely"}
                {authMode === "signup" && "Create Secure Account"}
                {authMode === "forgot" && "Send OTP Token"}
                {authMode === "otp" && "Verify & Proceed"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs">
          {authMode === "login" && (
            <p className="text-gray-500">Don&apos;t have an account? <button onClick={() => setAuthMode("signup")} className="text-emerald-600 font-bold hover:underline">Sign up</button></p>
          )}
          {authMode === "signup" && (
            <p className="text-gray-500">Already have an account? <button onClick={() => setAuthMode("login")} className="text-emerald-600 font-bold hover:underline">Log in</button></p>
          )}
          {(authMode === "forgot" || authMode === "otp") && (
            <button onClick={() => setAuthMode("login")} className="text-emerald-600 font-bold hover:underline">Back to Login</button>
          )}
        </div>
      </div>
    </div>
  );
}
