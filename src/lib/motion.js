import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useEffect, useState } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

// Lenis is created once in App; everything else reaches it through here so a
// missing instance (reduced motion) degrades to native scrolling.
let lenis = null;
export const setLenis = (l) => { lenis = l; };
export const getLenis = () => lenis;

export function scrollToTarget(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

export function lockScroll(on) {
  if (lenis) (on ? lenis.stop() : lenis.start());
  document.documentElement.classList.toggle('is-locked', on);
}

/** Anchor click handler that routes through Lenis. */
export const onAnchor = (e) => {
  const href = e.currentTarget.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  e.preventDefault();
  scrollToTarget(href === '#top' ? document.body : href);
};

/**
 * True once `ref` comes within `margin` of the viewport, and stays true.
 * Used instead of loading="lazy" for images inside 3D / transformed tracks,
 * where the browser's native lazy loading does not fire reliably.
 */
export function useNear(ref, margin = '150%') {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setNear(true); io.disconnect(); } },
      { rootMargin: `${margin} 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** Ask the atlas to open a festival's detail sheet (the atlas owns the modal). */
export const openInAtlas = (id) => window.dispatchEvent(new CustomEvent('atlas:open', { detail: id }));
