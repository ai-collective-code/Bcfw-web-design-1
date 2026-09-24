import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion.js';
import { GREETINGS, HERO_PRELOAD, wm } from '../data/content.js';
import './Preloader.css';

const MIN_MS = 2600; // long enough to read a few greetings
const MAX_MS = 5000; // never hold the page hostage to a slow image CDN

export default function Preloader({ onDone }) {
  const root = useRef(null);
  const num = useRef(null);
  const bar = useRef(null);
  const [g, setG] = useState(0);
  const [gone, setGone] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const id = setInterval(() => setG((v) => (v + 1) % GREETINGS.length), 190);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    // Warm the first screenful of the hero wall so it does not open on blanks.
    let loaded = 0;
    const total = HERO_PRELOAD.length;
    const imgs = HERO_PRELOAD.map((f) => {
      const im = new Image();
      im.onload = im.onerror = () => { loaded += 1; };
      im.src = wm(f.file, 500);
      return im;
    });

    const start = performance.now();
    const minMs = reduced ? 500 : MIN_MS;
    let shown = 0;
    let raf = 0;
    let exiting = false;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      done.current();
    };

    const exit = () => {
      exiting = true;
      if (!root.current) return;
      if (reduced) {
        finish();
        gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: () => setGone(true) });
        return;
      }
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(root.current.querySelectorAll('.pre__fade'), { y: -40, opacity: 0, duration: 0.6, ease: 'power3.in', stagger: 0.05 })
        .add(finish, '-=0.05')
        .to(root.current.querySelector('.pre__panel--main'), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<')
        .to(root.current.querySelector('.pre__panel--back'), { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<0.12');
    };

    let last = start;
    const loop = (now) => {
      const t = now - start;
      const byTime = Math.min(1, t / minMs);
      const byLoad = t > MAX_MS ? 1 : loaded / total;
      const goal = Math.min(byTime, byLoad);
      // Time-based easing, so a throttled or slow frame rate cannot stall the count.
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      shown += (goal - shown) * (1 - Math.exp(-dt * 6));
      if (goal === 1 && shown > 0.99) shown = 1;
      const n = Math.round(shown * 36);
      if (num.current) num.current.textContent = String(n).padStart(2, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      if (shown < 1) raf = requestAnimationFrame(loop);
      else if (!exiting) exit();
    };
    raf = requestAnimationFrame(loop);

    // Failsafe: rAF (and so GSAP) can be paused or heavily throttled — a tab opened in
    // the background, a power-saving webview. A plain timer still lifts the curtain,
    // even if the exit animation started and then stalled.
    const failsafe = setTimeout(() => {
      if (finished) return;
      exiting = true;
      finish();
      setGone(true);
    }, MAX_MS + 3000);

    return () => {
      clearTimeout(failsafe);
      cancelAnimationFrame(raf);
      imgs.forEach((im) => { im.onload = im.onerror = null; });
    };
  }, []);

  if (gone) return null;
  const greet = GREETINGS[g];

  return (
    <div className="pre" ref={root} role="status" aria-label="Loading">
      <div className="pre__panel pre__panel--back" />
      <div className="pre__panel pre__panel--main">
        <div className="pre__top pre__fade">
          <span className="pre__brand">BCF<i /></span>
          <span className="mono">Win India — one state at a time</span>
        </div>

        <div className="pre__center pre__fade" aria-hidden="true">
          <div className="pre__word" key={g}>{greet.word}</div>
          <span className="tag"><b>{greet.roman}</b> {greet.lang}</span>
        </div>

        <div className="pre__bottom pre__fade">
          <div className="pre__count">
            <span ref={num}>00</span>
            <small>/36</small>
          </div>
          <div className="pre__meta">
            <span className="mono">Loading every state &amp; union territory</span>
            <div className="pre__bar"><i ref={bar} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
