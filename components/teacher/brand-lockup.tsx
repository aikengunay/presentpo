import Link from "next/link";

import { cn } from "@/lib/utils";

const sizeStyles = {
  default: {
    mark: "size-7",
    markPx: 28,
    text: "text-base font-bold",
  },
  lg: {
    mark: "size-8",
    markPx: 32,
    text: "text-xl font-bold",
  },
  /** Join / splash — Duo-like brand hero */
  hero: {
    mark: "size-12",
    markPx: 48,
    text: "text-3xl font-extrabold tracking-tight sm:text-4xl",
  },
} as const;

export function BrandLockup({
  href = "/",
  className,
  size = "default",
}: {
  href?: string;
  className?: string;
  size?: keyof typeof sizeStyles;
}) {
  const styles = sizeStyles[size];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-brand",
        size === "hero" && "gap-2.5",
        className,
      )}
    >
      <img
        src="/brand/brand.png"
        alt=""
        width={styles.markPx}
        height={styles.markPx}
        className={styles.mark}
      />
      <span className={cn("text-foreground", styles.text)}>PresentPo</span>
    </Link>
  );
}
