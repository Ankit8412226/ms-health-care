"use client";
import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { uploadImage, validateUploadFile, MAX_UPLOAD_BYTES } from "@/lib/uploadImage";
import {
  Upload, FileText, CheckCircle,
  ArrowRight, ShieldCheck, RefreshCw
} from "lucide-react";

export default function UploadPage() {
  const { uploadPrescription, setActivePage, user, cart } = useApp();

  // True when the cart holds something that cannot ship without a prescription.
  const cartNeedsRx = cart.some((item) => item.product.prescriptionRequired);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Upload one prescription.
   *
   * What this replaces: the file was read into a base64 data URI and POSTed as
   * JSON to our API, which rejected anything over 100 KB — so every real
   * photo failed. The failure was then swallowed and the success screen shown
   * regardless, complete with two hardcoded "detected" medicine names that had
   * nothing to do with the uploaded document.
   *
   * Now the file goes straight to Cloudinary and the record is only marked
   * uploaded once the API confirms it saved.
   */
  const processFile = async (file: File) => {
    setErrorMsg("");
    setUploadSuccess(false);
    setProgress(0);

    // Validate before showing any progress UI. Drag-and-drop bypasses the
    // input's `accept` filter, so this is the only real check.
    const validationError = validateUploadFile(file);
    if (validationError) {
      setSelectedFile(file);
      setErrorMsg(validationError);
      return;
    }

    if (!user?.token) {
      setSelectedFile(file);
      setErrorMsg("Please sign in before uploading a prescription.");
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      const url = await uploadImage(file, "prescription", user.token, setProgress);

      const result = await uploadPrescription(file.name, url);
      if (!result.success) {
        setErrorMsg(result.message || "Could not save your prescription. Please try again.");
        return;
      }

      setUploadSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const retry = () => {
    setErrorMsg("");
    setSelectedFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Upload className="w-8 h-8 text-emerald-600" /> Upload Prescription
        </h1>
        <p className="text-gray-500 mt-1">Our clinical experts will review and dispatch your medicines safely</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="md:col-span-7 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[300px] ${
              uploading ? "cursor-wait opacity-60" : "cursor-pointer"
            } ${
              dragActive
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-400"
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.heif"
              className="hidden"
              disabled={uploading}
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Drag and drop your file here</h3>
            {/* The stated limit now matches what the code actually enforces —
                it previously advertised 8MB while the API rejected anything
                over 100KB. */}
            <p className="text-xs text-gray-400 max-w-xs mb-4">
              Supports PDF, JPEG, PNG and WEBP. Maximum size {MAX_UPLOAD_BYTES / 1024 / 1024}MB.
            </p>
            <button
              type="button"
              disabled={uploading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20"
            >
              {uploading ? "Uploading…" : "Browse Files"}
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 flex gap-3 text-xs text-gray-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-gray-700 dark:text-white">CDSCO Registered &amp; Secure</span>
              <p className="mt-0.5">Your prescription is encrypted. Orders are verified and packaged under supervised medical licensing guidelines.</p>
            </div>
          </div>
        </div>

        {/* Scan Status Panel */}
        <div className="md:col-span-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col justify-center">
            {selectedFile ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-800 dark:text-white block truncate">{selectedFile.name}</span>
                    <span className="text-[10px] text-gray-400 block">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-3 text-center">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      Uploading Prescription… {progress}%
                    </span>
                    {/* Real progress from the upload itself. A large photo on a
                        phone connection takes a while; a bare spinner gave no
                        indication anything was happening. */}
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Your document is being transmitted securely.</p>
                  </div>
                )}

                {errorMsg && !uploading && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs text-red-600 dark:text-red-400 text-center space-y-3 font-medium">
                    <span className="font-bold block">Upload Failed</span>
                    <p>{errorMsg}</p>
                    <button
                      onClick={retry}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white">Prescription Uploaded</h3>
                      {/* No longer claims the prescription has been "verified"
                          or lists detected medicines. Those were hardcoded
                          placeholders shown before any pharmacist had looked
                          at the document. */}
                      <p className="text-[11px] text-gray-400 mt-1">
                        Saved successfully. Our pharmacist will review it and contact you if anything needs clarifying.
                      </p>
                    </div>


                    {/* If there is a prescription-only item waiting in the
                        cart, the customer almost certainly came here from
                        checkout — offer the way back rather than dropping them
                        on the shop page to find it themselves. */}
                    {cartNeedsRx && (
                      <button
                        onClick={() => setActivePage("checkout")}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Return to Checkout <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setActivePage("shop")}
                      className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        cartNeedsRx
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      }`}
                    >
                      Continue Shopping <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                <span className="text-xs font-bold text-gray-450 dark:text-gray-500 block">Upload Status Screen</span>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto">Upload your prescription slip to attach it securely to your order review profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
