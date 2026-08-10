/**
 * Direct browser -> Cloudinary uploads.
 *
 * Why the file does not go through our API: Express capped JSON bodies at its
 * 100 KB default, so every real photo failed with "request entity too large"
 * before reaching any handler — and even with that raised, Vercel enforces a
 * hard 4.5 MB limit on serverless request bodies that no code change can lift.
 * Sending the bytes straight to Cloudinary sidesteps both, and is faster
 * because the image travels one hop instead of two.
 *
 * The API's only role is minting a short-lived signature that authorises this
 * one upload into one specific folder.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export type UploadType = "prescription" | "product" | "category";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

/**
 * Check a file before uploading anything.
 *
 * The upload box advertised "Maximum size 8MB" but nothing enforced it, and
 * drag-and-drop bypasses the file input's `accept` filter entirely — so a
 * 40 MB video could be dropped in and would fail confusingly much later.
 *
 * @returns an error message, or null when the file is acceptable.
 */
export function validateUploadFile(file: File): string | null {
  if (file.size === 0) {
    return "That file is empty. Please choose another file.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `That file is ${mb} MB. Please upload an image under ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`;
  }
  // Some browsers report an empty type for HEIC photos from iPhones, so fall
  // back to the extension rather than rejecting a legitimate prescription.
  const byExtension = /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(file.name);
  if (file.type && !ACCEPTED_MIME.includes(file.type) && !byExtension) {
    return "Please upload a JPG, PNG, WEBP or PDF file.";
  }
  if (!file.type && !byExtension) {
    return "Unsupported file type. Please upload a JPG, PNG, WEBP or PDF file.";
  }
  return null;
}

interface UploadSignature {
  timestamp: number;
  folder: string;
  public_id?: string;
  tags?: string;
  signature: string;
  apiKey: string;
  cloudName: string;
  uploadUrl: string;
  maxBytes: number;
}

/**
 * Upload one file and resolve to its permanent https URL.
 *
 * Throws an Error with a message suitable for display. Callers must surface it
 * rather than swallowing it — the previous flow caught upload failures and
 * showed a success screen anyway.
 *
 * @param onProgress receives 0-100 as the bytes go out.
 */
export async function uploadImage(
  file: File,
  type: UploadType,
  token: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const validationError = validateUploadFile(file);
  if (validationError) throw new Error(validationError);

  // 1. Ask our API to authorise this upload.
  let signature: UploadSignature;
  try {
    const res = await fetch(`${API_URL}/uploads/signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      if (res.status === 401) throw new Error("Your session has expired. Please sign in again.");
      if (res.status === 403) throw new Error("You do not have permission to upload this type of image.");
      if (res.status === 429) throw new Error("Too many uploads. Please wait a few minutes and try again.");
      throw new Error(json?.message || "Could not start the upload. Please try again.");
    }
    signature = json.data;
  } catch (err) {
    // Distinguish "server said no" from "could not reach the server".
    if (err instanceof TypeError) {
      throw new Error("Could not reach the server. Check your connection and try again.");
    }
    throw err;
  }

  // 2. Send the bytes straight to Cloudinary.
  //
  // XMLHttpRequest rather than fetch: it reports upload progress, which
  // matters when someone is pushing a 5 MB photo over a phone connection and
  // would otherwise stare at a spinner with no feedback.
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signature.apiKey);
  form.append("timestamp", String(signature.timestamp));
  form.append("signature", signature.signature);
  form.append("folder", signature.folder);
  if (signature.public_id) form.append("public_id", signature.public_id);
  if (signature.tags) form.append("tags", signature.tags);

  const secureUrl = await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signature.uploadUrl);
    xhr.timeout = 120_000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let body: { secure_url?: string; error?: { message?: string } } | null = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        return reject(new Error("Image service returned an unreadable response."));
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.secure_url) {
        return resolve(body.secure_url);
      }
      reject(new Error(body?.error?.message || `Upload failed (status ${xhr.status}).`));
    };

    xhr.onerror = () => reject(new Error("Network error while uploading. Please try again."));
    xhr.ontimeout = () => reject(new Error("Upload timed out. Please check your connection and retry."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    xhr.send(form);
  });

  return secureUrl;
}
