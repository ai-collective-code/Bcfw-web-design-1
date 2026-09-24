import { useEffect, useRef, useState } from 'react';
import { gsap, isTouch } from '../lib/motion.js';
import './Cursor.css';

/**
 * The native pointer stays. Over anything tagged data-cursor="Label" a small
 * pill trails the pointer and names the action — View, Drag, Open.
 * Not mounted on touch devices.
 */
export default function Cursor() {
  const [enabled] = useState(() => !isTouch());
  const bubble = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = bubble.current;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
    let current = null;

    const move = (e) => {
      xTo(e.clientX); yTo(e.clientY);
      const target = e.target.closest?.('[data-cursor]');
      const text = target?.getAttribute('data-cursor') || '';
      if (target === current && text === label.current.textContent) return;
      current = target;
      if (text) label.current.textContent = text;
      el.classList.toggle('is-on', Boolean(text));
    };
    const hide = () => el.classList.remove('is-on');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
      window.removeEventListener('scroll', hide);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cur" ref={bubble} aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
