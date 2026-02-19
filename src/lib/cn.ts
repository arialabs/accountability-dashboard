/**
 * @module cn
 * @description Lightweight className utility for composing Tailwind CSS classes.
 *
 * A minimal drop-in that filters falsy values and joins class strings.
 * Intentionally small — no `clsx` or `tailwind-merge` dependency needed for
 * this project's usage patterns. Add one of those packages if you need
 * conditional logic beyond simple string/undefined/false filtering.
 *
 * @example
 * cn("text-sm text-slate-600", isActive && "font-bold", undefined)
 * // → "text-sm text-slate-600 font-bold"
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
