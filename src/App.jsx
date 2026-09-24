import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, useGSAP, setLenis, lockScroll, prefersReducedMotion } from './lib/motion.js';
import Preloader from './components/Preloader.jsx';
import Cursor from './components/Cursor.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Problem from './components/Problem.jsx';
import Lens from './components/Lens.jsx';
import Services from './components/Services.jsx';
import Formats from './components/Formats.jsx';
import Journey from './components/Journey.jsx';
import Regions from './components/Regions.jsx';
import Calendar from './components/Calendar.jsx';
import Brief from './components/Brief.jsx';
import Process from './components/Process.jsx';
import Languages from './components/Languages.jsx';
import Atlas from './components/Atlas.jsx';
import Arts from './components/Arts.jsx';
import Faq from './components/Faq.jsx';
import Finale from './components/Finale.jsx';
import StickyCta from './components/StickyCta.jsx';

export default function App() {
  const [ready, setReady] = useState(false);
  const progress = useRef(null);
  const reduced = prefersReducedMotion();

  // Smooth scrolling. Lenis keeps the native scrollbar, keyboard paging and
  // find-in-page working; it only eases the wheel. Off for reduced motion.
  useEffect(() => {
    if (reduced) { document.documentElement.classList.add('no-motion'); return undefined; }
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); setLenis(null); };
  }, [reduced]);

  useEffect(() => {
    lockScroll(!ready);
    if (ready) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [ready]);

  // Filtering the atlas or switching calendar months changes the page height;
  // without a refresh every trigger below it would fire at its old position.
  useEffect(() => {
    let timer = 0;
    let last = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 180);
    });
    ro.observe(document.body);
    return () => { ro.disconnect(); clearTimeout(timer); };
  }, []);

  useGSAP(() => {
    gsap.to(progress.current, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
    });
    if (reduced) return;
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      // clearProps hands transform back to CSS so :hover lifts work afterwards.
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' }),
    });
  }, []);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <div className="progress" ref={progress} aria-hidden="true" />
      <Cursor />
      <Nav />
      {/* A pitch, in order: hook → problem → opportunity → offer → proof of fit → plan → objections → ask */}
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Problem />
        <Lens />
        <Services />
        <Formats />
        <Journey />
        <Regions />
        <Calendar />
        <Brief />
        <Process />
        <Languages />
        <Atlas />
        <Arts />
        <Faq />
      </main>
      <Finale />
      <StickyCta />
    </>
  );
}
