import { useRef, useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { PAINS, wm } from '../data/content.js';
import { useLiveEvents, useProblemHeadline } from '../lib/quickUpdate.js';
import './Problem.css';

/** One event card: photo with a glass badge, bold headline, and a story that expands on tap. */
function PainCard({ n, img, head, body }) {
  const [open, setOpen] = useState(false);
  const long = body.length > 150;
  return (
    <article className={`pain ${open ? 'is-open' : ''}`} data-reveal>
      <div className="pain__img">
        <img src={img} alt="" loading="lazy" decoding="async" />
        <span className="pain__badge"><i />Event {n}</span>
      </div>
      <div className="pain__body">
        <h3>{head}</h3>
        <p>{body}</p>
        {long && (
          <button type="button" className="pain__more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            {open ? 'Show less' : 'Read more'} <span aria-hidden="true">{open ? '↑' : '→'}</span>
          </button>
        )}
      </div>
    </article>
  );
}

/** The pitch opens on the pain: three ways brands lose regional India, then the fix. */
export default function Problem() {
  const root = useRef(null);
  // Quick-update live events replace the card images, catchy lines, and descriptions in order.
  const liveEvents = useLiveEvents();
  const headline = useProblemHeadline();

  const line1 = headline.line1 || 'Made in Mumbai.';
  const cleanLine2 = (headline.line2 || 'Dies in Madurai.').replace(/^\*+|\*+$/g, '');
  const title = `${line1} *${cleanLine2}*`;

  return (
    <section className="prob" id="problem" ref={root} aria-labelledby="prob-title">
      <div className="shell">
        <SectionHead id="prob-title" title={title}>
          Every year, brands spend crores on content their own regional audiences don’t recognise as their own.
          Here is where it goes wrong.
        </SectionHead>

        <div className="prob__grid">
          {PAINS.map((p, i) => {
            const live = liveEvents[i];
            const img = live?.image || wm(p.img, 500);
            const head = live?.catchyLine?.trim() ? live.catchyLine : p.head;
            const body = live?.description?.trim() ? live.description : p.body;

            return <PainCard key={p.n} n={Number(p.n)} img={img} head={head} body={body} />;
          })}
        </div>
      </div>
    </section>
  );
}
