import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hook for smooth GSAP page and section reveals
 */
export const useGsapPageReveal = <T extends HTMLElement = HTMLDivElement>(deps: any[] = []) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Main container smooth entrance
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );

      // Child cards stagger reveal if present
      const cards = containerRef.current?.querySelectorAll('.gsap-card');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 18, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.05 }
        );
      }

      // Stagger list/table rows if marked
      const rows = containerRef.current?.querySelectorAll('.gsap-row');
      if (rows && rows.length > 0) {
        gsap.fromTo(
          rows,
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: 'power1.out', delay: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, deps);

  return containerRef;
};

/**
 * Animated counter hook using GSAP
 */
export const useGsapCounter = (targetValue: number, duration: number = 1.2) => {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numberRef.current) return;
    const obj = { val: 0 };
    const anim = gsap.to(obj, {
      val: targetValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = Math.round(obj.val).toString();
        }
      }
    });

    return () => {
      anim.kill();
    };
  }, [targetValue, duration]);

  return numberRef;
};

/**
 * Subtle pulse for alert badges
 */
export const animateAlertBadge = (element: HTMLElement | null) => {
  if (!element) return;
  return gsap.fromTo(
    element,
    { scale: 0.96, boxShadow: '0 0 0 rgba(244, 63, 94, 0)' },
    { scale: 1.04, boxShadow: '0 0 14px rgba(244, 63, 94, 0.45)', duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' }
  );
};
