import SectionHead from './SectionHead.jsx';
import { PROCESS } from '../data/content.js';
import './Process.css';

/** How a brief becomes a campaign — four steps built from BCF's principles. */
export default function Process() {
  return (
    <section className="proc" id="process" aria-labelledby="proc-title">
      <div className="shell">
        <SectionHead id="proc-title" n="08" label="How we work" title="From brief to live, *in four moves.*">
          Story first, not AI first. The machine gives us scale; the insight, the writing and the cultural calls stay human.
        </SectionHead>

        <ol className="proc__list">
          {PROCESS.map((s) => (
            <li className="proc__step" key={s.n} data-reveal>
              <span className="proc__n">{s.n}</span>
              <h3>{s.head}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="proc__promise" data-reveal>
          <strong>72<sup>hr</sup></strong>
          <p>From idea to delivery when the moment can’t wait — a festival, a match, a trend at 3pm.</p>
        </div>
      </div>
    </section>
  );
}
