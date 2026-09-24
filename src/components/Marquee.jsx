import { LANGUAGES, FORMATS } from '../data/content.js';
import './Marquee.css';

/** Capability strip: every language BCF originates in, then every format it makes. */
function Row({ children, reverse }) {
  return (
    <div className={`mq__row ${reverse ? 'mq__row--rev' : ''}`}>
      <div className="mq__track">
        {children}
        {/* second copy makes the -50% loop seamless; hidden from assistive tech */}
        <span className="mq__copy" aria-hidden="true">{children}</span>
      </div>
    </div>
  );
}

export default function Marquee() {
  const langs = LANGUAGES.map((l) => (
    <span className="mq__chip mq__chip--lang" key={l.name}>
      <b>{l.native}</b><span>{l.name}</span>
    </span>
  ));
  const formats = FORMATS.map((f, i) => (
    <span className="mq__chip mq__chip--fmt" key={f.head}>
      <i>{String(i + 1).padStart(2, '0')}</i><b>{f.head}</b>
    </span>
  ));

  return (
    <section className="mq" aria-label="Languages and formats BCF produces in">
      <p className="mq__label mono"><span>We originate in</span> 22+ languages · 9 formats</p>
      <Row>{langs}</Row>
      <Row reverse>{formats}{formats}</Row>
    </section>
  );
}
