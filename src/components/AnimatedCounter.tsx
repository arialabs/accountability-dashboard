'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** The target value string e.g. "535", "2.4M+", "9" */
  value: string;
  /** Duration of the count-up in ms */
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Parses a display value like "2.4M+", "535", "26" into a numeric target
 * and a suffix like "M+" or "".
 */
function parseValue(raw: string): { prefix: string; numeric: number; suffix: string } {
  // Strip leading non-numeric characters (currency symbols)
  const prefixMatch = raw.match(/^([^0-9]*)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  const withoutPrefix = raw.slice(prefix.length);

  // Parse trailing suffix (letters, +, etc.)
  const numericMatch = withoutPrefix.match(/^([0-9.]+)(.*)/);
  if (!numericMatch) return { prefix, numeric: 0, suffix: withoutPrefix };

  const numeric = parseFloat(numericMatch[1]);
  const suffix = numericMatch[2] || '';
  return { prefix, numeric, suffix };
}

function formatNumber(n: number, originalDecimalPlaces: number): string {
  if (originalDecimalPlaces === 0) return Math.round(n).toString();
  return n.toFixed(originalDecimalPlaces);
}

export default function AnimatedCounter({ value, duration = 1800, className, style }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const { prefix, numeric, suffix } = parseValue(value);
  const decimalPlaces = (numeric.toString().split('.')[1] || '').length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * numeric;
            setDisplayed(formatNumber(current, decimalPlaces));
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplayed(formatNumber(numeric, decimalPlaces));
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [numeric, duration, decimalPlaces, hasAnimated]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{displayed}{suffix}
    </span>
  );
}
