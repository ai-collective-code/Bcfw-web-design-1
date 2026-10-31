import { onAnchor } from '../lib/motion.js';
import { BRAND, FESTIVALS, ARTS, LANGUAGES } from '../data/content.js';
import './Finale.css';

// Every photograph on the page, once. CC BY-SA requires the attribution; the
// Commons file page carries author and licence for each.
const CULTURE_USED = [...ARTS.map((a) => a.img), ...LANGUAGES.map((l) => l.img)]
  .filter(Boolean)
  .filter((img, i, all) => all.findIndex((o) => o.file === img.file) === i)
  .filter((img) => !FESTIVALS.some((f) => f.file === img.file));
const TOTAL = FESTIVALS.length + CULTURE_USED.length;
const pretty = (file) => decodeURIComponent(file).replace(/_/g, ' ').replace(/\.(jpe?g|png)$/i, '');

export default function Finale() {
  return (
    <footer className="fin" id="contact">
      <div className="fin__panel">
        <div className="fin__foot">
          <div className="fin__brand">
            <span className="fin__logo">BC[f]W<i /></span>
            <span>{BRAND.full}</span>
            <em>{BRAND.tagline}</em>
            <a href={BRAND.contact} className="fin__mail" onClick={onAnchor}>Start a brief <span aria-hidden="true">→</span></a>
          </div>
          <nav className="fin__nav" aria-label="Footer">
            <span className="mono">Explore</span>
            <a href="#problem" onClick={onAnchor}>Why regional</a>
            <a href="#regions" onClick={onAnchor}>Market playbooks</a>
          </nav>
          <nav className="fin__nav" aria-label="Plan">
            <span className="mono">Plan</span>
            <a href="#calendar" onClick={onAnchor}>Campaign calendar</a>
            <a href="#atlas" onClick={onAnchor}>Market index</a>
            <a href="#brief" onClick={onAnchor}>Brief builder</a>
            <a href="#faq" onClick={onAnchor}>FAQ</a>
          </nav>
          <div className="fin__where">
            <span className="mono">Studios</span>
            <ul>{['Noida', 'Kolkata', 'Mumbai'].map((c) => <li key={c}>{c}</li>)}</ul>
            <a href={BRAND.work} target="_blank" rel="noreferrer">See the work ↗</a>
          </div>
        </div>

        <details className="fin__credits">
          <summary><span className="mono">Photo credits</span> <sup>{TOTAL}</sup></summary>
          <p>
            All photographs are hot-linked from Wikimedia Commons and used under their free licences
            (CC BY-SA, CC BY, CC0, GFDL or public domain). Each link opens the file page with its author and licence.
          </p>
          <ul>
            {FESTIVALS.map((f) => (
              <li key={f.id}>
                <a href={f.credit} target="_blank" rel="noreferrer">{f.state} — {pretty(f.file)}</a>
              </li>
            ))}
            {CULTURE_USED.map((c) => (
              <li key={c.file}>
                <a href={c.credit} target="_blank" rel="noreferrer">{c.subject}</a>
                <span> — {c.author}, {c.licence}</span>
              </li>
            ))}
          </ul>
        </details>

        <div className="fin__giant" aria-hidden="true">win india<span>.</span></div>

        <div className="fin__legal mono">
          <span>© 2026 {BRAND.name} — {BRAND.full}</span>
          <span>Festival dates are indicative; lunar calendars move them every year.</span>
          <a href="#top" onClick={onAnchor}>Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
