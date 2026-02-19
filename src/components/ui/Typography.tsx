/**
 * @module Typography
 * @description Reusable text components that replace the two most common
 * repeated Tailwind text patterns:
 *  - `text-xs text-slate-500`  (30+ occurrences) → <Caption>
 *  - `text-sm text-slate-600`  (30+ occurrences) → <BodyText>
 *
 * Both components forward any additional `className` props so they compose
 * naturally with one-off modifiers (e.g. `font-semibold`, `mt-2`).
 *
 * @example
 * // Before
 * <span className="text-xs text-slate-500">Last updated Jan 2026</span>
 * <p className="text-sm text-slate-600">Representative for California</p>
 *
 * // After
 * <Caption>Last updated Jan 2026</Caption>
 * <BodyText>Representative for California</BodyText>
 *
 * // With extra classes
 * <Caption className="mt-1">…</Caption>
 * <BodyText className="font-medium">…</BodyText>
 */

import { cn } from "@/lib/cn";

interface TextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Caption — replaces `text-xs text-slate-500`
 * Use for metadata, timestamps, secondary labels, and helper text.
 */
export function Caption({ children, className, as: Tag = "span" }: TextProps) {
  return (
    <Tag className={cn("text-xs text-slate-500", className)}>{children}</Tag>
  );
}

/**
 * BodyText — replaces `text-sm text-slate-600`
 * Use for body copy, descriptions, and secondary content.
 */
export function BodyText({ children, className, as: Tag = "p" }: TextProps) {
  return (
    <Tag className={cn("text-sm text-slate-600", className)}>{children}</Tag>
  );
}
