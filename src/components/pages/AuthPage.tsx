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

  // Social login is demo-only (no real API for social auth)
  const handleSocialLogin = () => {
    setValidationError("Social login coming soon! Please use email & password.");
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
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Welcome Back to MS Care</h2>
              <p className="text-xs text-gray-400">Login to manage orders, health consults &amp; lab results</p>
            </>
          )}
          {authMode === "signup" && (
            <>
              <h2 className="text-xl font-bold text-gray-850 dark:text-white">Create Account</h2>
              <p className="text-xs text-gray-400">Join over 50 Lakh+ users getting authentic clinical care</p>
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
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                  placeholder="ankit@mscare.com"
                  className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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

        {(authMode === "login" || authMode === "signup") && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-850">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-center">OR SOCIAL CONNECT</span>
            <div className="grid grid-cols-3 gap-3">
              {/* Google */}
              <button
                type="button"
                onClick={handleSocialLogin}
                className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-center transition-colors"
                title="Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.842 1.05 15.114 0 12 0 7.354 0 3.327 2.68 1.341 6.6l3.925 3.165z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.427c-.277 1.455-1.095 2.691-2.327 3.518l3.609 2.8c2.11-1.945 3.327-4.8 3.327-8.245z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235A7.07 7.07 0 0 1 4.909 12c0-.79.132-1.55.357-2.235L1.34 6.6A11.936 11.936 0 0 0 0 12c0 1.92.455 3.73 1.259 5.345l4.007-3.11z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.077 7.955-2.909l-3.609-2.8c-1 .67-2.282 1.073-4.346 1.073-3.34 0-6.177-2.254-7.186-5.29l-3.99 3.09C2.886 21.05 6.827 24 12 24z"
                  />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleSocialLogin}
                className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={handleSocialLogin}
                className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-center transition-colors"
                title="GitHub"
              >
                <svg className="w-5 h-5 fill-gray-800 dark:fill-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>
            </div>
          </div>
        )}

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
