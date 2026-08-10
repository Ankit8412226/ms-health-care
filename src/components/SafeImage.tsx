"use client";
import { cldImage } from "@/lib/imageUrl";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | undefined | null;
  fallbackSrc?: string;

  cldWidth?: number;
}

export default function SafeImage({
  src,
  fallbackSrc = "/default-product.png",
  cldWidth = 640,
  alt,
  ...props
}: SafeImageProps) {
  // Track only which URL failed, and derive the rest during render. Mirroring
  // `src` into state and re-syncing it from an effect caused a second render
  // pass on every image whenever a prop changed.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const resolved = cldImage(src, cldWidth) || fallbackSrc;
  const imgSrc = failedSrc === resolved ? fallbackSrc : resolved;

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Product Image"}
      // Cloudinary already returns a correctly sized, f_auto/q_auto asset from
      // its own CDN, so routing it through Vercel's optimizer would add a
      // billed function hop for no gain. Other remote hosts stay unoptimized
      // as they were, since next.config allows arbitrary hostnames.
      unoptimized={imgSrc.startsWith("http")}
      onError={() => setFailedSrc(resolved)}
    />
  );
}
