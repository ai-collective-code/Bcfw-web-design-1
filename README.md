# Win India — BCF

A single-page B2B landing page for BCF (Bharat Content Fireworks), selling regional content to brands:
the problem, the opportunity, services, formats, market playbooks for all 36 states and union
territories, a campaign calendar and a brief builder — with a CTA in every section.
React 18 + Vite, GSAP ScrollTrigger for scroll choreography, Lenis for smooth scrolling.

## Run

```bash
npm install
npm run dev      # http://localhost:5190
npm run build    # static output in dist/
```

Registered in `.claude/launch.json` as **Bharat Utsav**.

## Design system — "Neel"

Indigo anchors the palette (the word comes from *indikon*, "from India"); lime is the single loud
accent; pink, teal, sky and violet appear only as region colours. No orange.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` / `--surface` | `#F4F5F9` / `#FFFFFF` | page, cards |
| `--night` | `#0F0D2E` | hero, journey, languages frames |
| `--indigo` | `#4B3FE0` | primary, serif accents on light |
| `--lime` | `#C6F432` | CTAs, accents on dark |

Type: **Bricolage Grotesque** (headlines, tight tracking), **Instrument Serif** italic (accent words,
written as `*starred*` in copy), **Geist** (body), **Geist Mono** (tags and labels). Components are
rounded (22–36px), pills for tags and buttons, glass panels over photography.

## Sections — a pitch, in order

| # | Component | Headline | Job |
| --- | --- | --- | --- |
| — | `Hero` | Win India, one state at a time | Hook + proof (22+ / 72hr / 9 / 36); **3D** tilted photo wall |
| — | `Marquee` | We originate in… | Every language (native script) and every format |
| 01 | `Problem` | Made in Mumbai. Dies in Madurai. | Three pains, then the fix statement |
| — | `Lens` | Regional India isn’t a segment | Market figures from bcfworks.com, counting up |
| 02 | `Services` | Three ways we make your brand local | The three pillars with BCF’s own numbers |
| 03 | `Formats` | Nine formats. One native voice. | The content arsenal — each “Add to brief” |
| 04 | `Journey` | One brief. Thirteen originals. | **3D** flight: one campaign across 13 markets and languages |
| 05 | `Regions` | Seven regions. Seven playbooks. | Stacking cards: languages, peak moments, “Plan for…” |
| 06 | `Calendar` | Never miss a moment | Month tabs → moments → “Plan [month] campaigns” |
| 07 | `Brief` | Plan your India campaign in 30 seconds | Brief builder; copies the brief and opens the inquiry form |
| 08 | `Process` | From brief to live, in four moves | Decode → Originate → Produce → Launch (72hr) |
| 09 | `Languages` | 22+ languages. Zero dubbing. | **3D** script sphere + dubbed-vs-original table |
| 10 | `Atlas` | 36 markets. Their biggest moments. | Market index, drawer with “Plan a campaign in…” |
| 11 | `Arts` | Borrow the codes, not the clichés | **3D** coverflow of cultural codes |
| 12 | `Faq` | Before you brief us | Objection handling |
| — | `Finale` | Your brand. Bharat’s story. | Closing CTA, footer, photo credits |
| — | `StickyCta` | — | Floating bar after the hero; reflects the brief |

`src/lib/brief.js` is a tiny shared store: formats, regions, the calendar and the market drawer all
write to it; the brief builder and the sticky bar read it.

## Content rules

- **Every BCF claim comes from bcfworks.com** (`bcfworks-build/_html`): 22+ languages, 72-hour
  idea-to-delivery, 10x output, the nine formats, the four principles, and the market figures
  (600M+, 12+, 4X, 90%) — which the page footnotes as “as published by BCF”. Those four market
  figures have no cited source on the live site either; source them before a public launch.
- **No invented work.** No clients, case results or testimonials. BCF is a new company; the FAQ repeats
  the live site’s transparency note and links to the work on bcfworks.com. Journey formats and hero
  tags are planning illustrations, labelled in code as such.
- The only conversion path is the existing inquiry form at `bcfworks.com/#inquiry` — no contact details.
- **Photographs are hot-linked** from Wikimedia Commons, never downloaded, and credited in the footer.
- Market → language (`STATE_LANG`) only uses languages on BCF’s list; other markets are `null`, not guessed.

## Gotchas

- Nothing between a perspective root and its 3D children may set `opacity`, `filter` or
  `overflow` — each flattens the context. Fade the perspective root or the leaves instead.
- In the Journey, off-range elements get `display: none`, not `visibility: hidden`. A hidden
  element that has drifted behind the camera still counts toward the layer bounds, projects to
  infinity, and Chrome paints the whole scene black.
- Never let two tweens own the same transform. A ScrollTrigger refresh reverts its tween's target to
  the pre-tween inline style, which silently wiped the hero tilt once. The hero splits entrance and
  scroll-out scale into `--in` / `--out` CSS variables for the same reason.
- `.sr-only` labels are absolutely positioned: any horizontal scroller containing them needs
  `position: relative`, or they escape it and widen the page on phones (the month tabs did).
- Native `loading="lazy"` is unreliable inside 3D / translated tracks, so those images mount
  their `src` via `useNear()` or load eagerly.
- `prefers-reduced-motion` turns off Lenis, the wall drift, the flight (a static grid replaces it)
  and every scroll animation.
