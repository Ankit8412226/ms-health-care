"use client";
import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src: string | undefined | null;
  fallbackSrc?: string;
}

export default function SafeImage({ src, fallbackSrc = "/default-product.png", alt, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Product Image"}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
