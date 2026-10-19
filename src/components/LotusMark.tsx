import { cn } from "@/lib/utils";

/**
 * The gold lotus-and-pearl brand mark.
 *
 * The artwork is wider than it is tall (1.41:1), so width is left to `auto` — call sites
 * size it by height only (`h-9`), never `h-9 w-9`, which would squash the petals.
 */
export function LotusMark({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src="/images/logo.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn("lotus-mark w-auto shrink-0 select-none object-contain", className)}
    />
  );
}
