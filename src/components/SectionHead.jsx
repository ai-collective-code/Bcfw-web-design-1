import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { Words } from './ui.jsx';

/**
 * "(01) Label" tag, a headline whose words slide up out of masks, and an optional
 * side note. `title` takes *starred* runs for the serif italic.
 */
export default function SectionHead({ id, n, label, title, children, className = '' }) {
  const root = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(root.current.querySelectorAll('.word > span'), {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.045,
      scrollTrigger: { trigger: root.current, start: 'top 82%', once: true },
    });
  }, { scope: root });

  return (
    <header className={`sec-head ${className}`} ref={root}>
      <div className="sec-head__main">
        <span className="tag"><b>({n})</b> {label}</span>
        <h2 id={id} className="display"><Words text={title} /></h2>
      </div>
      {children && <p data-reveal>{children}</p>}
    </header>
  );
}
