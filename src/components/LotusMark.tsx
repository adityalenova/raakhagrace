import { cn } from "@/lib/utils";

/**
 * Classic upward lotus — brand ink by default so FOUC never shows browser-blue.
 */
export function LotusMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("lotus-mark overflow-visible text-fg", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 42c0-8 6-16 12-22 2 8 4 14 8 18-8 2-14 4-20 4z" opacity="0.85" />
      <path d="M52 42c0-8-6-16-12-22-2 8-4 14-8 18 8 2 14 4 20 4z" opacity="0.85" />
      <path d="M18 44c2-10 8-18 14-24 1 8 2 14 0 20-6 2-10 4-14 4z" opacity="0.92" />
      <path d="M46 44c-2-10-8-18-14-24-1 8-2 14 0 20 6 2 10 4 14 4z" opacity="0.92" />
      <path d="M32 8c3 10 5 18 0 30-5-12-3-20 0-30z" />
      <path d="M22 46c4-2 7-4 10-8 3 4 6 6 10 8-6 4-14 4-20 0z" opacity="0.88" />
      <ellipse cx="32" cy="36" rx="2.2" ry="3" />
    </svg>
  );
}
