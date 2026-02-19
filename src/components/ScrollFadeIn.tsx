'use client';

import { useEffect, useRef, ReactNode, ElementType } from 'react';

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  as?: ElementType;
}

/**
 * Wraps children in a container that fades+slides in when it enters the viewport.
 * Uses IntersectionObserver; degrades gracefully if unavailable.
 */
export default function ScrollFadeIn({ children, className = '', delay = 0, as: Tag = 'div' }: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.55s ease-out ${delay}ms, transform 0.55s ease-out ${delay}ms`;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Degrade gracefully — show immediately
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
