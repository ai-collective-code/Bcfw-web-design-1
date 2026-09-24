import { useEffect, useRef } from 'react';
import { gsap, useGSAP, onAnchor, isTouch, prefersReducedMotion } from '../lib/motion.js';
import { HERO_WALL, BRAND, wm, langOf } from '../data/content.js';
import { Words, Arrow } from './ui.jsx';
import './Hero.css';

const TILT = { rotateX: 26, rotateZ: -15 };
// Illustrative planning tags (format · language · moment) — not past work.
const TAGS = [
  ['Reel series', 'Tamil', 'Pongal'],
  ['Brand film', 'Bengali', 'Durga Puja'],
  ['Pre-roll', 'Marathi', 'Ganesh Chaturthi'],
];

/*
 * A wall of festival photographs laid on a tilted plane. Columns sit at two
 * depths and drift in opposite directions, so the parallax reads as real 3D.
 * Everything between .hero__scene (the perspective root) and the columns must
 * stay free of opacity/filter/overflow, or the browser flattens the scene.
 */
export default function Hero({ ready }) {
  const root = useRef(null);
  const frame = useRef(null);
  const tilt = useRef(null);

  // The plane leans toward the pointer.
  useEffect(() => {
    gsap.set(tilt.current, TILT);
    if (isTouch() || prefersReducedMotion()) return undefined;
    const rx = gsap.quickTo(tilt.current, 'rotateX', { duration: 1.2, ease: 'power3' });
    const ry = gsap.quickTo(tilt.current, 'rotateY', { duration: 1.2, ease: 'power3' });
    const move = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      rx(TILT.rotateX - y * 6);
      ry(x * 8);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  // Entrance as the preloader lifts.
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (!ready) {
      gsap.set(q('.hero__title .word > span'), { yPercent: 110 });
      gsap.set(q('[data-hi]'), { opacity: 0, y: 26 });
      gsap.set(q('.wall__col'), { yPercent: 30 });
      gsap.set(q('.hero__scene'), { opacity: 0 });
      gsap.set(frame.current, { '--in': 0.94 });
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set([q('.hero__title .word > span'), q('[data-hi]'), q('.wall__col'), q('.hero__scene')], { clearProps: 'opacity,transform' });
      gsap.set(frame.current, { '--in': 1 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(frame.current, { '--in': 1, duration: 1.6, ease: 'expo.out' })
      .to(q('.hero__scene'), { opacity: 1, duration: 1.4, ease: 'power2.out' }, '<')
      .to(q('.wall__col'), { yPercent: 0, duration: 2.2, ease: 'expo.out', stagger: 0.06 }, '<')
      .to(q('.hero__title .word > span'), { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, '<0.3')
      .to(q('[data-hi]'), { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, '<0.35');
  }, { dependencies: [ready], scope: root });

  // Scroll-out: the frame recedes, the wall keeps travelling.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true };
    // Drift the perspective root, not .hero__tilt: a refresh reverts a tween's target
    // to its pre-tween inline style, which would wipe the tilt set on that element.
    gsap.to(root.current.querySelector('.hero__scene'), { y: () => -window.innerHeight * 0.16, ease: 'none', scrollTrigger: st });
    // Entrance and scroll-out each own a CSS variable, so neither overwrites the other's scale.
    gsap.to(frame.current, { '--out': 0.92, ease: 'none', scrollTrigger: st });
    gsap.to(root.current.querySelector('.hero__content'), { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
  }, { scope: root });

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      <div className="hero__frame on-night" ref={frame}>
        <div className="hero__scene" aria-hidden="true">
          <div className="hero__tilt" ref={tilt}>
            <div className="hero__wall">
              {HERO_WALL.map((col, c) => (
                <div
                  className="wall__col"
                  key={c}
                  style={{ '--dur': `${54 + (c % 3) * 12}s`, '--dir': c % 2 ? 'reverse' : 'normal', '--z': `${c % 2 ? 70 : 0}px` }}
                >
                  <div className="wall__track">
                    {[...col, ...col].map((f, i) => (
                      <figure className="wall__card" key={`${f.id}-${i}`}>
                        <img src={wm(f.file, 500)} alt="" draggable="false" decoding="async" />
                        <figcaption>{f.festival}{langOf(f.state) && <span> · {langOf(f.state)}</span>}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero__shade" aria-hidden="true" />

        {/* Planning tags floating over the wall: format · language · moment */}
        <ul className="hero__tags" aria-hidden="true">
          {TAGS.map((t, i) => (
            <li key={t[0]} data-hi style={{ '--d': `${i * 1.3}s` }}>
              <b>{t[0]}</b><span>{t[1]}</span><em>{t[2]}</em>
            </li>
          ))}
        </ul>

        <div className="hero__content">
          <span className="tag" data-hi><b>BCF</b> Regional content for brands</span>
          <h1 id="hero-title" className="display hero__title">
            <Words text="Win India, *one state* at a time." />
          </h1>
          <p className="hero__sub" data-hi>
            We originate films, reels and festival campaigns in 22+ Indian languages — so your brand
            sounds local in every state, not dubbed.
          </p>
          <div className="hero__ctas" data-hi>
            <a href={BRAND.inquiry} className="btn btn--lime" target="_blank" rel="noreferrer">
              Start your campaign <Arrow />
            </a>
            <a href="#brief" className="btn btn--ghost btn--down" onClick={onAnchor}>
              Build your brief <Arrow ch="↓" />
            </a>
          </div>
        </div>

        <dl className="hero__stats" data-hi>
          <div><dt>Languages, originated</dt><dd>22<sup>+</sup></dd></div>
          <div><dt>Idea to delivery</dt><dd>72<sup>hr</sup></dd></div>
          <div><dt>Content formats</dt><dd>9</dd></div>
          <div><dt>States &amp; UTs</dt><dd>36</dd></div>
        </dl>
      </div>
    </section>
  );
}
