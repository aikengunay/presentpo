"use client";

/** Microsoft Fluent animated emoji (APNG), vendored under /public/emoji. */
export function FluentAnimatedEmoji({
  src,
  size = 104,
  alt = "",
  className,
}: {
  src: string;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    // APNG animates natively in modern browsers; no JS player needed.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
