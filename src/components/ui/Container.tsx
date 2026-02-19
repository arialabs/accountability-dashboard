/**
 * @component Container
 * @description Reusable responsive container that replaces the repeated
 * `max-w-5xl mx-auto px-6 lg:px-8` Tailwind pattern (26+ occurrences).
 *
 * @example
 * // Before (old pattern — being replaced throughout the codebase)
 * // div className="max-w-5xl mx-auto px-6 lg:px-8" → …content… → /div
 *
 * // After
 * <Container>…</Container>
 *
 * // With additional classes
 * <Container className="text-center">…</Container>
 *
 * // Different max-width
 * <Container size="lg">…</Container>   // max-w-7xl
 * <Container size="sm">…</Container>   // max-w-3xl
 */

import { cn } from "@/lib/cn";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** @default "md" — maps to max-w-5xl */
  size?: "sm" | "md" | "lg";
  as?: React.ElementType;
}

const SIZE_CLASSES = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
} as const;

export function Container({
  children,
  className,
  size = "md",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={cn(SIZE_CLASSES[size], "mx-auto px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}
