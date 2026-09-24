import { useEffect, useState } from 'react';
import { ScrollTrigger, onAnchor } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import { useBrief } from '../lib/brief.js';
import './StickyCta.css';

/**
 * A conversion bar that appears once the hero is gone and steps aside while the
 * brief builder or the closing CTA is on screen. It reflects the brief as it grows.
 */
export default function StickyCta() {
  const { regions, formats, month } = useBrief();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let pastHero = false;
    const blocked = { '#brief': false, '#contact': false };
    const sync = () => setShown(pastHero && !blocked['#brief'] && !blocked['#contact']);
    const hero = ScrollTrigger.create({
      trigger: '#top', start: 'bottom 60%', end: 'max',
      onToggle: (self) => { pastHero = self.isActive; sync(); },
    });
    const zones = Object.keys(blocked).map((sel) => ScrollTrigger.create({
      trigger: sel, start: 'top 85%', end: 'bottom 15%',
      onToggle: (self) => { blocked[sel] = self.isActive; sync(); },
    }));
    return () => { hero.kill(); zones.forEach((z) => z.kill()); };
  }, []);

  const parts = [];
  if (regions.length) parts.push(`${regions.length} region${regions.length > 1 ? 's' : ''}`);
  if (formats.length) parts.push(`${formats.length} format${formats.length > 1 ? 's' : ''}`);
  if (month >= 0) parts.push('1 moment');

  return (
    <div className={`scta ${shown ? 'is-on' : ''}`} aria-hidden={!shown}>
      <a href="#brief" className="scta__brief" onClick={onAnchor} tabIndex={shown ? 0 : -1}>
        <span className="scta__dot" aria-hidden="true" />
        {parts.length ? <>Your brief · <b>{parts.join(' · ')}</b></> : <>Plan your India campaign</>}
      </a>
      <a href={BRAND.inquiry} className="scta__go" target="_blank" rel="noreferrer" tabIndex={shown ? 0 : -1}>
        Start <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
