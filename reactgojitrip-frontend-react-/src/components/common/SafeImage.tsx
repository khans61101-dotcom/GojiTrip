import React, { useEffect, useState } from "react";

interface SafeImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src?: string | null;
  fallbackSrc?: string;
  fill?: boolean;
  unoptimized?: boolean;
  priority?: boolean;
  sizes?: string;
}

/*
 * Generic fallback image.
 *
 * IMPORTANT:
 * This is NOT the GojiTrip logo.
 * It is an inline SVG placeholder so that no logo asset
 * is loaded when an image fails.
 */
const DEFAULT_FALLBACK = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="800"
    height="500"
    viewBox="0 0 800 500"
  >
    <rect width="800" height="500" fill="#e5e7eb"/>
    <rect
      x="300"
      y="150"
      width="200"
      height="140"
      rx="16"
      fill="#cbd5e1"
    />
    <circle
      cx="400"
      cy="205"
      r="28"
      fill="#94a3b8"
    />
    <path
      d="M330 270 L380 225 L420 255 L460 215 L500 270 Z"
      fill="#94a3b8"
    />
    <text
      x="400"
      y="350"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      font-size="24"
      fill="#64748b"
    >
      Image unavailable
    </text>
  </svg>
`)}`;

/**
 * Cleans image URLs coming from backend/API.
 *
 * Supports:
 * 1. Normal URL
 * 2. Markdown URL:
 *    [https://example.com/image.jpg](https://example.com/image.jpg)
 * 3. Accidentally quoted URLs
 * 4. Empty/null/undefined values
 */
const cleanImageUrl = (
  value?: string | null,
  fallback: string = DEFAULT_FALLBACK,
): string => {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  let url = value.trim();

  // Invalid values
  if (
    url === "" ||
    url === "undefined" ||
    url === "null" ||
    url === "[object Object]"
  ) {
    return fallback;
  }

  /*
   * Remove markdown image syntax:
   *
   * [https://example.com/image.jpg](https://example.com/image.jpg)
   *
   * Also supports:
   *
   * ![image](https://example.com/image.jpg)
   */
  const markdownMatch = url.match(/^!?\[[^\]]*\]\((https?:\/\/[^)]+)\)$/);

  if (markdownMatch?.[1]) {
    url = markdownMatch[1];
  }

  /*
   * Sometimes backend may return:
   *
   * [https://example.com/image.jpg](https://example.com/image.jpg)
   *
   * with extra escaped characters.
   */
  url = url
    .replace(/^\s*["']/, "")
    .replace(/["']\s*$/, "")
    .trim();

  /*
   * If URL is still markdown-like, try extracting
   * the actual HTTP URL.
   */
  const httpMatch = url.match(/https?:\/\/[^\s)"']+/);

  if (httpMatch?.[0]) {
    url = httpMatch[0];
  }

  /*
   * Never allow GojiTrip logo files to become fallback.
   *
   * This prevents accidental logo rendering when API image
   * data is invalid.
   */
  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes("gojitrip") &&
    (lowerUrl.includes("logo") ||
      lowerUrl.includes("gojitrip.jpg") ||
      lowerUrl.includes("gojitrip.jpeg") ||
      lowerUrl.includes("gojitrip.png") ||
      lowerUrl.includes("gojitrip.webp"))
  ) {
    return fallback;
  }

  // Final validation
  if (
    url === "" ||
    url === "undefined" ||
    url === "null" ||
    url === "[object Object]"
  ) {
    return fallback;
  }

  return url;
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  alt = "Image",
  onError,
  fill = false,

  // Next.js compatibility props.
  // They are intentionally not passed to <img>.
  unoptimized: _unoptimized,
  priority: _priority,
  sizes: _sizes,

  className = "",
  style,
  ...props
}) => {
  /*
   * If caller explicitly gives a fallbackSrc, use it.
   *
   * Otherwise use generic inline placeholder.
   *
   * We intentionally do NOT use:
   * /logo.jpeg
   * /logo.jpg
   * /images/GojiTrip.jpg
   * /images/KA.png
   */
  const safeFallback =
    fallbackSrc && !fallbackSrc.toLowerCase().includes("gojitrip")
      ? fallbackSrc
      : DEFAULT_FALLBACK;

  const [imgSrc, setImgSrc] = useState<string>(() =>
    cleanImageUrl(src, safeFallback),
  );

  const [hasError, setHasError] = useState(false);

  /*
   * Update image whenever src changes.
   */
  useEffect(() => {
    const newSrc = cleanImageUrl(src, safeFallback);

    setImgSrc(newSrc);
    setHasError(false);
  }, [src, safeFallback]);

  /*
   * Handle broken images.
   *
   * Original image -> fallback only once.
   */
  const handleError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    if (!hasError && imgSrc !== safeFallback) {
      setHasError(true);
      setImgSrc(safeFallback);
    }

    /*
     * Preserve parent's onError callback.
     */
    if (onError) {
      onError(event);
    }
  };

  /*
   * Vite/React does not support Next.js `fill`.
   *
   * We reproduce the same visual behavior with CSS.
   */
  const computedClassName = [
    className,
    fill ? "absolute inset-0 w-full h-full object-cover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const computedStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }
      : {}),
  };

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={computedClassName || undefined}
      style={computedStyle}
      onError={handleError}
      loading="lazy"
      decoding="async"
    />
  );
};

export default SafeImage;
