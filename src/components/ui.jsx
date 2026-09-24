import { Fragment } from 'react';

/** Split "plain *italic* plain" into [{ text, em }] runs. */
export function runs(text) {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part) => (
    part.startsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false }
  ));
}

/** Inline rich text: *starred* runs become the serif italic. */
export function Rich({ text }) {
  return runs(text).map((r, i) => (r.em ? <em key={i}>{r.text}</em> : <Fragment key={i}>{r.text}</Fragment>));
}

/** Rich text split into masked words, for the slide-up headline reveal. */
export function Words({ text }) {
  const out = [];
  runs(text).forEach((r, ri) => {
    r.text.split(/(\s+)/).forEach((w, wi) => {
      if (!w) return;
      if (/^\s+$/.test(w)) { out.push(' '); return; }
      const inner = r.em ? <em>{w}</em> : w;
      out.push(<span className="word" key={`${ri}-${wi}`}><span>{inner}</span></span>);
    });
  });
  return out;
}

/** The arrow bubble inside .btn — two glyphs so hover can slide one out, one in. */
export function Arrow({ ch = '↗' }) {
  return (
    <span className="btn__arrow" aria-hidden="true"><i>{ch}</i><i>{ch}</i></span>
  );
}
