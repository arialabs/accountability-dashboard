'use client';

import { useEffect, useRef, ReactNode, ElementType, Children, cloneElement, isValidElement } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  as?: ElementType;
  direction?: Direction;
  /** If true, stagger each direct child by `staggerMs` ms */
  stagger?: boolean;
  staggerMs?: number;
  distance?: number; // px to slide (default 30)
}

function getTranslate(direction: Direction, distance: number): string {
  switch (direction) {
    case 'up':    return `translateY(${distance}px)`;
    case 'down':  return `translateY(-${distance}px)`;
    case 'left':  return `translateX(${distance}px)`;
    case 'right': return `translateX(-${distance}px)`;
  }
}

/**
 * Wraps children in a container that fades+slides in when it enters the viewport.
 * Supports direction (up/down/left/right), delay, stagger, and custom slide distance.
 * Uses IntersectionObserver; degrades gracefully if unavailable.
 */
export default function ScrollFadeIn({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  direction = 'up',
  stagger = false,
  staggerMs = 80,
  distance = 30,
}: ScrollFadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (stagger) {
      // Animate each child individually
      const childEls = Array.from(el.children) as HTMLElement[];
      childEls.forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = getTranslate(direction, distance);
        child.style.transition = `opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay + i * staggerMs}ms, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay + i * staggerMs}ms`;
      });

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        childEls.forEach(child => {
          child.style.opacity = '1';
          child.style.transform = 'none';
        });
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            childEls.forEach(child => {
              child.style.opacity = '1';
              child.style.transform = 'none';
            });
            observer.disconnect();
          }
        },
        { threshold: 0.08 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }

    // Single element animation
    el.style.opacity = '0';
    el.style.transform = getTranslate(direction, distance);
    el.style.transition = `opacity 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, stagger, staggerMs, distance]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
