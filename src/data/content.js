import { FESTIVALS } from './festivals.js';
import { CULTURE_IMAGES } from './cultureImages.js';
import nuvoco01 from '../assets/Nuvoco/N_01.webp';
import nuvoco02 from '../assets/Nuvoco/N-02.webp';
import nuvoco03 from '../assets/Nuvoco/N-03.webp';
import lalTail1 from '../assets/Lal_tail_Mothers day/L_1.webp';
import lalTail4 from '../assets/Lal_tail_Mothers day/L_4.webp';
import lalTail2 from '../assets/Lal_tail_Mothers day/L-2.webp';
import lalTail3 from '../assets/Lal_tail_Mothers day/L-3.webp';
import lalTail5 from '../assets/Lal_tail_Mothers day/L-5.webp';

/** Wikimedia Commons thumbnail. 500 and 960 are standard steps the CDN keeps warm. */
export const wm = (file, w = 960) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=${w}`;

export const festivalById = (id) => FESTIVALS.find((f) => f.id === id);
export const cultureFor = (lang) => CULTURE_IMAGES.find((c) => c.lang === lang);

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/*
 * Where the claims come from. Everything BCF says about itself on this page —
 * 22+ languages, 72-hour turnaround, 10x output, the nine formats, the market
 * figures — is lifted from bcfworks.com (bcfworks-build/_html). Clients, awards and
 * past work come only from BCF's own portfolio deck (see folio.js). Nothing is
 * invented: no case results, no testimonials. 36 = 28 states + 8 UTs.
 */
export const BRAND = {
  name: 'BC[f]W',
  full: 'Bharat Content Fireworks',
  tagline: 'Manufacturers of Regional Stories. At Scale.',
  // Every CTA lands on the brief builder, whose step 4 emails the team (netlify/functions/inquiry.mjs).
  contact: '#brief',
  inquiry: 'https://bcfworks.com/#inquiry',
  site: 'https://bcfworks.com',
  work: 'https://bcfworks.com/#stories',
};

// Preloader. Each greeting is in its own script, with the language it belongs to.
export const GREETINGS = [
  { word: 'নমস্কার', roman: 'Nomoskar', lang: 'Bengali' },
  { word: 'வணக்கம்', roman: 'Vanakkam', lang: 'Tamil' },
  { word: 'నమస్కారం', roman: 'Namaskaram', lang: 'Telugu' },
  { word: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', roman: 'Sat Sri Akal', lang: 'Punjabi' },
  { word: 'ನಮಸ್ಕಾರ', roman: 'Namaskara', lang: 'Kannada' },
  { word: 'કેમ છો', roman: 'Kem Chho', lang: 'Gujarati' },
  { word: 'നമസ്കാരം', roman: 'Namaskaram', lang: 'Malayalam' },
  { word: 'नमस्कार', roman: 'Namaskar', lang: 'Marathi' },
  { word: 'ନମସ୍କାର', roman: 'Namaskar', lang: 'Odia' },
  { word: 'নমস্কাৰ', roman: 'Nomoskar', lang: 'Assamese' },
  { word: 'آداب', roman: 'Aadab', lang: 'Urdu' },
  { word: 'नमस्ते', roman: 'Namaste', lang: 'Hindi' },
];

/*
 * The main BCF production language for each market. Only languages on BCF's own
 * list appear; markets whose main language is not on it (Ladakhi, Nepali, the
 * Northeast's own languages) are null rather than guessed.
 */
export const STATE_LANG = {
  'Ladakh': null, 'Jammu & Kashmir': 'Kashmiri', 'Himachal Pradesh': 'Hindi', 'Punjab': 'Punjabi',
  'Chandigarh': 'Punjabi', 'Haryana': 'Haryanvi', 'Delhi': 'Hindi', 'Uttarakhand': 'Hindi',
  'Uttar Pradesh': 'Hindi', 'Rajasthan': 'Rajasthani', 'Gujarat': 'Gujarati',
  'Dadra & Nagar Haveli and Daman & Diu': 'Gujarati', 'Maharashtra': 'Marathi', 'Goa': 'Konkani',
  'Madhya Pradesh': 'Hindi', 'Chhattisgarh': 'Chhattisgarhi', 'Bihar': 'Bhojpuri', 'Jharkhand': 'Santali',
  'West Bengal': 'Bengali', 'Odisha': 'Odia', 'Sikkim': null, 'Assam': 'Assamese',
  'Arunachal Pradesh': null, 'Nagaland': null, 'Manipur': null, 'Mizoram': null, 'Tripura': 'Bengali',
  'Meghalaya': null, 'Andhra Pradesh': 'Telugu', 'Telangana': 'Telugu', 'Karnataka': 'Kannada',
  'Tamil Nadu': 'Tamil', 'Kerala': 'Malayalam', 'Puducherry': 'Tamil', 'Lakshadweep': 'Malayalam',
  'Andaman & Nicobar Islands': 'Hindi',
};
export const langOf = (state) => STATE_LANG[state] ?? null;

// Hero photo wall: six columns of festival moments, mixed across regions.
const ALL_PRODUCTION = Object.entries(
  import.meta.glob('../assets/production_images/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
).map(([path, src]) => ({ id: path, src }));
// Dedicated 5 images for the 4th slide exclusively (S_1, S_2, S_3, S_4, S-5)
const getFilename = (id) => id.split('/').pop().split('\\').pop().toLowerCase();
const S_FILENAMES = ['s_1.jpeg', 's_2.jpeg', 's_3.jpeg', 's_4.jpeg', 's-5.jpeg'];

export const S_IMAGES = S_FILENAMES.map((name) =>
  ALL_PRODUCTION.find((p) => getFilename(p.id) === name)
).filter(Boolean);

// Dedicated MYK Reels media for the 1st slide exclusively (every image and video in assets/MYK_Reels)
export const MYK_REELS_MEDIA = Object.entries(
  import.meta.glob('../assets/MYK_Reels/*.{jpg,jpeg,png,webp,mp4,webm}', { eager: true, import: 'default' })
).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({ id: getFilename(path), src, type: /\.(mp4|webm)$/i.test(path) ? 'video' : 'image' }));

// Dedicated Odomos images for the 2nd slide exclusively (everything in assets/Odomos)
export const ODOMOS_IMAGES = Object.entries(
  import.meta.glob('../assets/Odomos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({ id: getFilename(path), src }));

// Dedicated Red Paste images for the 3rd slide exclusively (everything in assets/Red_paste)
export const RED_PASTE_IMAGES = Object.entries(
  import.meta.glob('../assets/Red_paste/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, src]) => ({ id: getFilename(path), src }));

// Dedicated Nuvoco images for the 6th slide exclusively (N_01, N-02, N-03)
export const NUVOCO_IMAGES = [
  { id: 'N_01.webp', src: nuvoco01 },
  { id: 'N-02.webp', src: nuvoco02 },
  { id: 'N-03.webp', src: nuvoco03 },
];

// Dedicated 5 images for the 5th slide exclusively (L_1, L_4, L-2, L-3, L-5)
export const LAL_TAIL_IMAGES = [
  { id: 'L_1.webp', src: lalTail1 },
  { id: 'L_4.webp', src: lalTail4 },
  { id: 'L-2.webp', src: lalTail2 },
  { id: 'L-3.webp', src: lalTail3 },
  { id: 'L-5.webp', src: lalTail5 },
];

// All other production stills strictly exclude S_1 through S-5, Ganguly shoot stills,
// Nuvoco images, and Lal Tail images so that none of these appear in the other slides.
const isExcludedFromOtherSlides = (id) => {
  const fn = getFilename(id);
  return (
    fn === 's_1.jpeg' ||
    fn === 's_2.jpeg' ||
    fn === 's_3.jpeg' ||
    fn === 's_4.jpeg' ||
    fn === 's-5.jpeg' ||
    fn.startsWith('s_') ||
    fn.startsWith('s-') ||
    fn.includes('11.11.34') ||
    fn.includes('nuvoco') ||
    fn.includes('11.36.16') ||
    fn.includes('11.36.17') ||
    fn.startsWith('n_') ||
    fn.startsWith('n-') ||
    fn.startsWith('l_') ||
    fn.startsWith('l-') ||
    fn.includes('lal_tail')
  );
};

const OTHER_IMAGES = ALL_PRODUCTION.filter(
  (p) => !isExcludedFromOtherSlides(p.id)
);

export const HERO_WALL = Array.from({ length: 6 }, (_, c) => {
  // Slide 1 (c === 0) is populated exclusively by the MYK_Reels images and videos
  if (c === 0) {
    return MYK_REELS_MEDIA;
  }
  // Slide 2 (c === 1) is populated exclusively by the Odomos images
  if (c === 1) {
    return ODOMOS_IMAGES;
  }
  // Slide 3 (c === 2) is populated exclusively by the Red_paste images
  if (c === 2) {
    return RED_PASTE_IMAGES;
  }
  // Slide 4 (c === 3) is populated exclusively by S_1 through S-5
  if (c === 3) {
    return S_IMAGES;
  }
  // Slide 5 (c === 4) is populated exclusively by Lal Tail Mother's Day images (L_1, L_4, L-2, L-3, L-5)
  if (c === 4) {
    return LAL_TAIL_IMAGES;
  }
  // Slide 6 (c === 5, last slide) is populated exclusively by Nuvoco images (N_01, N-02, N-03)
  if (c === 5) {
    return [
      NUVOCO_IMAGES[0],
      NUVOCO_IMAGES[1],
      NUVOCO_IMAGES[2],
      NUVOCO_IMAGES[0],
      NUVOCO_IMAGES[1],
      NUVOCO_IMAGES[2],
    ];
  }
  // Slide 1 (index 0) uses only the other production images
  return Array.from({ length: 5 }, (_, i) =>
    OTHER_IMAGES[(c * 5 + i) % OTHER_IMAGES.length]
  );
});
// Photographs the preloader warms up (the first screenful of the wall).
export const HERO_PRELOAD = HERO_WALL.flatMap((col) => col.slice(0, 4)).filter((f) => f.type !== 'video');

/*
 * "One brief, thirteen markets": a campaign travelling Kashmir → Kanyakumari,
 * re-originated per market. Each stop is a market BCF produces in, with the
 * format it would suit — a planning illustration, not past work.
 */
export const JOURNEY = [
  [2, 'Brand film'], [4, 'Reel series'], [10, 'YouTube pre-roll'], [9, 'Festival campaign'],
  [17, 'Branded microdrama'], [19, 'Brand film'], [22, 'Reel series'], [11, 'Festival campaign'],
  [13, 'Local event content'], [30, 'Reel series'], [31, 'YouTube pre-roll'], [33, 'Festival campaign'],
  [32, 'Brand film'],
].map(([id, format]) => {
  const f = festivalById(id);
  return { ...f, format, lang: langOf(f.state) };
});

export const REGIONS = [
  {
    key: 'North',
    mood: 'Snow, rivers & harvest drums',
    accent: '#4B3FE0',
    langs: ['Hindi', 'Punjabi', 'Haryanvi', 'Rajasthani', 'Marwari', 'Kashmiri', 'Urdu', 'Bhojpuri'],
    line: 'Ten markets that punish one-size Hindi. Win Vaisakhi in Punjabi, Pushkar in Rajasthani and the Kumbh in Hindi — each as its own story.',
    photos: [9, 1, 10],
  },
  {
    key: 'West',
    mood: 'Garba nights & Ganpati mornings',
    accent: '#E83E8C',
    langs: ['Gujarati', 'Marathi', 'Konkani', 'Hindi'],
    line: 'Navratri and Ganesh Chaturthi make September–October the loudest window of the year. Originate in Gujarati, Marathi and Konkani.',
    photos: [11, 13, 14],
  },
  {
    key: 'Central',
    mood: 'Temple towns & a tribal Dussehra',
    accent: '#8B5CF6',
    langs: ['Hindi', 'Chhattisgarhi'],
    line: 'The heartland’s own moments — Khajuraho’s dance festival and Bastar’s seventy-five-day Dussehra — told in Hindi and Chhattisgarhi.',
    photos: [16, 15],
  },
  {
    key: 'East',
    mood: 'Pandals, chariots & river ghats',
    accent: '#0EA5E9',
    langs: ['Bengali', 'Odia', 'Bhojpuri', 'Maithili', 'Magahi', 'Santali'],
    line: 'Durga Puja, Rath Yatra and Chhath are the region’s emotional peaks. Bengali, Odia, Bhojpuri and Maithili — never one dub.',
    photos: [19, 20, 17],
  },
  {
    key: 'Northeast',
    mood: 'Hornbills, Bihu & hill harvests',
    accent: '#0F9D8A',
    langs: ['Assamese', 'Bengali'],
    line: 'Eight states that notice when they are an afterthought. Bihu, Hornbill and Wangala, with Assamese and Bengali at the core.',
    photos: [24, 22, 28],
  },
  {
    key: 'South',
    mood: 'Kolam, pookalam & palace lights',
    accent: '#5B9A0B',
    langs: ['Tamil', 'Telugu', 'Kannada', 'Malayalam'],
    line: 'Four languages, four film cultures. Onam, Pongal, Ugadi and Dasara each need a native story — not a dubbed one.',
    photos: [33, 31, 32],
  },
  {
    key: 'Islands',
    mood: 'Lagoons, atolls & island melas',
    accent: '#06A3C4',
    langs: ['Malayalam', 'Bengali', 'Tamil', 'Hindi'],
    line: 'Small, connected and usually skipped. Island melas reach audiences who speak Malayalam, Bengali, Tamil and Hindi.',
    photos: [36, 35],
  },
].map((r) => ({
  ...r,
  entries: FESTIVALS.filter((f) => f.region === r.key),
  photos: r.photos.map(festivalById),
}));

// "Cultural codes" — forms an audience reads in a heartbeat.
export const ARTS = [
  { name: 'Kathak', state: 'Uttar Pradesh', lang: 'Hindi', line: 'Storytelling in spins and footwork — the name comes from katha, a story.' },
  { name: 'Kathakali', state: 'Kerala', lang: 'Malayalam', line: 'Painted faces, towering headdresses, and epics told through the eyes and hands.' },
  { name: 'Odissi', state: 'Odisha', lang: 'Odia', line: 'Sculptural poses lifted off temple walls, built around the three-bend tribhangi.' },
  { name: 'Kuchipudi', state: 'Andhra Pradesh', lang: 'Telugu', line: 'Dance-drama named for its home village in Krishna district, quick and precise.' },
  { name: 'Sattriya', state: 'Assam', lang: 'Assamese', line: 'Born in the Vaishnavite sattras founded by Srimanta Sankardev.' },
  { name: 'Ghoomar', state: 'Rajasthan', lang: 'Rajasthani', line: 'Swirling ghagras turning in slow, hypnotic circles.' },
  { name: 'Madhubani', state: 'Bihar', lang: 'Maithili', line: 'Mithila’s line-painting tradition, once drawn on walls for weddings and festivals.' },
  { name: 'Baha', state: 'Jharkhand', lang: 'Santali', line: 'The Santal spring festival, danced when the sal trees come into flower.' },
  { name: 'Kolam', state: 'Tamil Nadu', lang: 'Tamil', line: 'Rice-flour geometry drawn at the threshold every dawn, grandest at Pongal.' },
  { name: 'Shigmo', state: 'Goa', lang: 'Konkani', line: 'Goa’s spring festival — floats, drums and folk dance through the streets.' },
].map((a) => ({ ...a, img: cultureFor(a.lang) }));

// BCF's working languages (from the BCF site), each paired with a culture photograph.
export const LANGUAGES = [
  { native: 'हिन्दी', name: 'Hindi' },
  { native: 'বাংলা', name: 'Bengali' },
  { native: 'తెలుగు', name: 'Telugu' },
  { native: 'मराठी', name: 'Marathi' },
  { native: 'தமிழ்', name: 'Tamil' },
  { native: 'اردو', name: 'Urdu' },
  { native: 'ગુજરાતી', name: 'Gujarati' },
  { native: 'ಕನ್ನಡ', name: 'Kannada' },
  { native: 'മലയാളം', name: 'Malayalam' },
  { native: 'ଓଡ଼ିଆ', name: 'Odia' },
  { native: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
  { native: 'অসমীয়া', name: 'Assamese' },
  { native: 'भोजपुरी', name: 'Bhojpuri' },
  { native: 'राजस्थानी', name: 'Rajasthani' },
  { native: 'मैथिली', name: 'Maithili' },
  { native: 'हरियाणवी', name: 'Haryanvi' },
  { native: 'कोंकणी', name: 'Konkani' },
  { native: 'मारवाड़ी', name: 'Marwari' },
  { native: 'मगही', name: 'Magahi' },
  { native: 'छत्तीसगढ़ी', name: 'Chhattisgarhi' },
  { native: 'संथाली', name: 'Santali' },
  { native: 'कॉशुर', name: 'Kashmiri' },
].map((l) => ({ ...l, img: cultureFor(l.name) }));

// Every language the quick-update picker offers: the 22 Eighth Schedule languages,
// English, then other widely spoken languages. `native` is omitted where the
// language is usually written in Latin script.
export const INDIA_LANGUAGES = [
  {
    group: 'Scheduled languages', items: [
      ['Assamese', 'অসমীয়া'], ['Bengali', 'বাংলা'], ['Bodo', 'बड़ो'], ['Dogri', 'डोगरी'], ['Gujarati', 'ગુજરાતી'],
      ['Hindi', 'हिन्दी'], ['Kannada', 'ಕನ್ನಡ'], ['Kashmiri', 'کٲشُر'], ['Konkani', 'कोंकणी'], ['Maithili', 'मैथिली'],
      ['Malayalam', 'മലയാളം'], ['Manipuri', 'ꯃꯩꯇꯩꯂꯣꯟ'], ['Marathi', 'मराठी'], ['Nepali', 'नेपाली'], ['Odia', 'ଓଡ଼ିଆ'],
      ['Punjabi', 'ਪੰਜਾਬੀ'], ['Sanskrit', 'संस्कृतम्'], ['Santali', 'ᱥᱟᱱᱛᱟᱲᱤ'], ['Sindhi', 'سنڌي'], ['Tamil', 'தமிழ்'],
      ['Telugu', 'తెలుగు'], ['Urdu', 'اردو'],
    ]
  },
  { group: 'Link language', items: [['English']] },
  {
    group: 'Other languages', items: [
      ['Awadhi', 'अवधी'], ['Bhili', 'भीली'], ['Bhojpuri', 'भोजपुरी'], ['Bundeli', 'बुंदेली'], ['Chhattisgarhi', 'छत्तीसगढ़ी'],
      ['Garhwali', 'गढ़वाली'], ['Garo'], ['Gondi', 'गोंडी'], ['Haryanvi', 'हरियाणवी'], ['Ho'], ['Khasi'],
      ['Kodava', 'ಕೊಡವ'], ['Kokborok'], ['Kumaoni', 'कुमाऊँनी'], ['Kurukh', 'कुँड़ुख़'], ['Ladakhi'], ['Lambadi'],
      ['Lepcha'], ['Magahi', 'मगही'], ['Marwari', 'मारवाड़ी'], ['Mizo'], ['Mundari', 'मुंडारी'], ['Nagamese'],
      ['Rajasthani', 'राजस्थानी'], ['Tulu', 'ತುಳು'],
    ]
  },
].map((g) => ({ ...g, items: g.items.map(([name, native]) => ({ name, native })) }));

/* ------------------------------------------------------------------
   Marketing copy — all adapted from bcfworks.com
   ------------------------------------------------------------------ */

// The three things that go wrong when India is treated as one market.
export const PAINS = [
  {
    n: '01',
    head: 'Dubbed, not made',
    body: 'One Hindi master, dubbed twelve ways. Audiences can tell in a second when a brand is talking at them instead of to them.',
    img: festivalById(19).file,
  },
  {
    n: '02',
    head: 'Late to the moment',
    body: 'Navratri, Eid, a match-winning six, a viral local event at 3pm. A generic post three days later is worse than no post at all.',
    img: festivalById(11).file,
  },
  {
    n: '03',
    head: 'Culture by assumption',
    body: 'Saffron means one thing in Varanasi and another in Mysuru. Guessing at culture reads as a stock photo — and gets scrolled past.',
    img: festivalById(9).file,
  },
];

// The fix, in one statement — lights up word by word with photo pills.
export const MANIFESTO = [
  'Most agencies build one story and dub it twelve ways.',
  { pill: festivalById(19).file, alt: 'Durga Puja, West Bengal' },
  '*We build twelve stories* — because Diwali in Lucknow and Diwali in Coimbatore are emotionally',
  { pill: festivalById(32).file, alt: 'Pongal, Tamil Nadu' },
  'different events. Same lantern.',
  { pill: festivalById(33).file, alt: 'Onam, Kerala' },
  '*A completely different light.*',
];

// "The Bharat Lens" — figures exactly as bcfworks.com publishes them.
export const LENS = [
  { value: 600, suffix: 'M+', label: 'Internet users outside metro India' },
  { value: 12, suffix: '+', label: 'Major content languages' },
  { value: 4, suffix: 'X', label: 'Higher engagement in regional-language content' },
  { value: 90, suffix: '%', label: 'Of brands still using the same Hindi-dubbed assets' },
];

// The three pillars, each with BCF's own operating number.
export const PILLARS = [
  {
    n: '01', head: 'Regional storytelling', metric: '22+', unit: 'languages. One Bharat.',
    body: 'From Onam to Bihu, from Pongal to Baisakhi. We don’t translate stories — we originate them, in the dialect that moves people.',
    img: festivalById(33).file,
  },
  {
    n: '02', head: 'Moment marketing', metric: '72hr', unit: 'idea to delivery.',
    body: 'IPL. Navratri. Eid. Budget day. When the moment arrives, your brand is ready — not three days late with a generic post.',
    img: festivalById(13).file,
  },
  {
    n: '03', head: 'AI-powered production', metric: '10x', unit: 'output. Same brief, less budget.',
    body: 'The soul is human, the scale is machine. A modern AI production stack delivers cinematic quality at a fraction of traditional cost.',
    img: cultureFor('Malayalam').file,
  },
];

// The content arsenal — nine formats, taglines from the BCF site.
export const FORMATS = [
  { head: 'Reels & Shorts', kind: 'Short form', line: '15 seconds. Full emotion. Zero compromise on soul.', img: festivalById(4).file },
  { head: 'Brand films', kind: 'Long format', line: 'Cinematic, layered stories that outlive a campaign cycle.', img: festivalById(31).file },
  { head: 'Festival campaigns', kind: 'Seasonal', line: 'From Diwali to Durga Puja — originated in the festival’s own language.', img: festivalById(19).file },
  { head: 'Local event content', kind: 'Hyperlocal', line: 'The Kumbh. The carnival. The corner mandir. Every city has its own story.', img: festivalById(14).file },
  { head: 'IP creation', kind: 'Owned media', line: 'Don’t rent audiences — build them, with content brands that compound in equity.', img: festivalById(24).file },
  { head: 'Branded microdramas', kind: 'Drama IP', line: '3 to 7 minute serialised dramas with the brand inside the story, not interrupting it.', img: cultureFor('Kannada').file },
  { head: 'YouTube pre-rolls', kind: 'Pre-roll', line: '10 to 20 second regional pre-rolls people choose not to skip. Story first, logo last.', img: festivalById(10).file },
  { head: 'Animation IPs', kind: 'Animation', line: 'Original characters and worlds rooted in regional folklore, language and aesthetics.', img: cultureFor('Maithili').file },
  { head: 'AI regional influencers', kind: 'AI talent', line: 'Hyper-local voice, face and language — a persona the brand owns outright.', img: festivalById(22).file },
];

// How a brief moves — built from BCF's four principles.
export const PROCESS = [
  { n: '01', head: 'Decode', body: 'Insight, not assumption. A team from inside Bharat’s cultural fabric reads the market’s codes before a word is written.' },
  { n: '02', head: 'Originate', body: 'One story per market, written in its own language from line one — never a master dubbed twelve ways.' },
  { n: '03', head: 'Produce at scale', body: 'An AI production stack built around storytelling workflows: many markets at once, without cutting corners on soul.' },
  { n: '04', head: 'Launch on the moment', body: 'When a festival or a trend breaks, idea to delivery in 72 hours. Fast and deep — both.' },
];

// Dubbed vs originated — the argument in a table.
export const COMPARE = [
  ['Script', 'Written once, translated later', 'Written in the market’s language from line one'],
  ['Humour & idiom', 'Lost in translation', 'Native jokes, native references'],
  ['Faces & voices', 'One national cast', 'Faces and voices the market recognises'],
  ['Calendar', 'One national festival plan', 'Each market’s own moments'],
  ['The audience says', '“That’s an ad.”', '“That’s us.”'],
];

export const FAQS = [
  {
    q: 'Which languages do you produce in?',
    a: 'Twenty-two and counting: Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Bhojpuri, Rajasthani, Maithili, Haryanvi, Konkani, Marwari, Magahi, Chhattisgarhi, Santali and Kashmiri.',
  },
  {
    q: 'Can one campaign run across several states?',
    a: 'Yes — that is the point. Instead of one master dubbed for every market, we originate a version for each one, produced in parallel so the rollout stays on schedule.',
  },
  {
    q: 'Do you only make festival content?',
    a: 'No. Festivals are one of nine formats: reels and shorts, brand films, festival campaigns, local event content, IP creation, branded microdramas, YouTube pre-rolls, animation IPs and AI regional influencers.',
  },
  {
    q: 'How fast can you turn around moment content?',
    a: 'Our standard for moment marketing is 72 hours from idea to delivery.',
  },
  {
    q: 'How do you use AI?',
    a: 'AI is our engine, not our identity. It scales production and cuts cost; the story, the cultural calls and the craft stay human.',
  },
  {
    q: 'Can we see your work?',
    a: 'Yes — the portfolio above: scripted films, AI production, activations, unscripted and corporate work for brands including Dabur, ITC, Lenskart and Nykaa. It is our team’s track record, including the award-winning work our founder made at ICE Media Lab, his first content shop.',
  },
  {
    q: 'How do we start?',
    a: 'Build a brief in the brief builder above and send it — it comes straight to our team’s inbox. Tell us the markets, the moment and the format; we come back with a story worth telling.',
  },
];

export { FESTIVALS, CULTURE_IMAGES };
