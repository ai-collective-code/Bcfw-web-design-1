/*
 * "BC[f]W Folio 2026" — BCF's own portfolio deck (canva.link/bcfwfolio), rebuilt as a page section.
 * Every client, award, press piece and video below appears in that deck. Video titles were
 * checked against YouTube on 2026-09-29; two private videos in the deck are left out.
 */

export const FOLIO_COVER = {
  lines: [
    [['Insight driven ', 'grey'], ['creative colab', 'navy']],
    [['Content ', 'ink'], ['first', 'grey']],
  ],
  registered: ['Registered under', 'AI Collective Private Limited.', 'Noida. Kolkata. Mumbai.'],
};

export const FOUNDER = {
  name: 'Debojit',
  role: 'Founder',
  paras: [
    'A Calcutta Xaverian and IIMB alumnus, 20+ years in branded content marketing & distribution. Former Creative & Regional Programming Lead at Radio One, spearheading national campaigns along with vernacular content marketing with deep cultural insights.',
    'Co-founded ICE Media Lab, his first content shop, that built award-winning content for some of India’s biggest brands.',
    'Building BC[f]W, an intersection of his experience with the latest technology, achieving content innovation at scale.',
  ],
};

// The deck's section dividers: an English word, its Hindustani twin, and the slide's colours.
export const DIVIDERS = {
  portfolio: { word: 'Portfolio', script: 'branded content producer', bg: '#FDBC1B', fg: '#0E4B24', sc: '#FFFFFF', size: 40, style: 'shadow' },
  awards: { word: 'Awards', script: 'tareefein', bg: '#FF6AC1', fg: '#E3197B', sc: '#F8B418', size: 52, style: 'offset' },
  scripted: { word: 'Scripted', script: 'kahani', bg: '#9DD5C8', fg: '#E2DC4F', sc: '#FFFFFF', size: 44, style: 'shadow' },
  ai: { word: 'AI', script: 'a-insaan', bg: '#F86A1C', fg: '#FDBC1B', sc: '#F6E7CF', size: 135, style: 'shadow' },
  activation: { word: 'Activation', script: 'tamasha', bg: '#FDBC1B', fg: '#E4217C', sc: '#FFFFFF', size: 31, style: 'flat' },
  unscripted: { word: 'Unscripted', script: 'haqeqaat', bg: '#1F6B35', fg: '#E9E4CA', sc: '#F7B51B', size: 31, style: 'shadow' },
  corporate: { word: 'Corporate', script: 'majdoor', bg: '#D46AE0', fg: '#E7E2C9', sc: '#B05683', size: 34, style: 'shadow' },
  technology: { word: 'Technology', script: 'takniki', bg: '#E91F7B', fg: '#FDBC1B', sc: '#FFFFFF', size: 30, style: 'flat' },
};

// Slide 4, in the deck's order.
export const CLIENTS = [
  'P.C. Chandra Jewellers', 'DTC', 'Lenskart', 'Nykaa', 'Fem', 'Cremica', 'Dabur',
  'Swiggy', 'Dabur Red', 'Dabur Honey', 'ENO', 'Sunfeast YiPPee!', 'Dabur Chyawanprash', 'Dabur Lal Tail',
  'MYK Laticrete', 'India Gate', 'Mom’s Magic', 'Aashirvaad', 'ITC Limited', 'Aditya Birla', 'Baidyanath Vansaar',
  'Odomos', 'Kurl-on', 'SBI General', 'CEAT', 'Nuvoco', 'Sunfeast', 'Mrs. Bector’s',
  'Sunrise Pure', 'gaana.com', 'Zetwerk', 'Srijan', 'Réal Fruit Power', 'Springfit', 'Bounce',
  'Hajmola', 'Berger', 'Baidyanath', 'Ola', 'Dozee', 'Pudin Hara',
];

export const AWARDS = [
  'Digixx Award', 'Brand Disruption Award', 'DMA Asia ECHO Create Awards', 'Kaleido',
  'ET Ascent Stars of Industry', 'The Abbys', 'The Maddies', 'afaqs Marketing Excellence Award',
  'Drivers of Digital', 'EMA',
];

// Slide 8: the one award in the deck shown with its full citation.
export const CITATION = {
  medal: 'Bronze',
  award: 'The Maddies 2021 — 7th Mobile Marketing Awards',
  category: 'Best Use of Mobile – Customer Engagement',
  campaign: 'The Honey Trail – Sundarbans Chapter',
  brand: 'Dabur Honey',
  agency: 'ICE Media Lab & Analytics',
};

export const PRESS = [
  { outlet: 'The Economic Times', head: 'Beware! Misleading ad-game tricking Indians rather than offering ‘Umeedo Wali Dhoop’?', url: 'https://economictimes.indiatimes.com/industry/services/advertising/beware-misleading-ad-game-tricking-indians-rather-than-offering-umeedo-wali-dhoop/articleshow/110534209.cms' },
  { outlet: 'The Economic Times', head: 'MS Dhoni: A Baahubali brand whose valuation score keeps running to new dawns', url: 'https://economictimes.indiatimes.com/industry/services/advertising/ms-dhoni-a-baahubali-brand-whose-valuation-score-keeps-running-to-new-dawns/articleshow/100614122.cms' },
  { outlet: 'exchange4media', head: 'Dabur Red Paste revolutionises oral care at Kumbh 2025 with ‘Dant Snan’ initiative', url: 'https://www.exchange4media.com/marketing-initiative-news/dabur-red-paste-revolutionises-oral-ccare-at-kumbh-2025-with-dant-snan-initiative-141249.html' },
  { outlet: 'exchange4media', head: 'Nykaa TV presents Khoj, a Mother’s Day film created using vertical smartphone interface', url: 'https://www.exchange4media.com/advertising-news/nykaa-tv-presents-khoj-a-mothers-day-film-created-using-vertical-smartphone-interface-104625.html' },
  { outlet: 'adgully', head: 'ITC’s Aashirvaad Mishti Doi brought the age-old ‘Doi-walas’ to life this festive season', url: 'https://archive.adgully.com/itc--s-aashirvaad-mishti-doi-brought-the-age-old--doi-walas--to-life-138441.html' },
  { outlet: 'adgully', head: 'Nykaa TV presents Rakshak', url: 'https://archive.adgully.com/nykaa-tv-presents-rakshak-95316.html' },
  { outlet: 'Social Samosa', head: 'Campaign face-off: SpringFit’s #AbToSoJa v/s Duroflex’s #YawnOffSleepOn', url: 'https://www.socialsamosa.com/2020/03/campaign-face-off-springfit-abtosoja-v-s-duroflex-yawnoffsleepon/' },
];

// [YouTube id, brand, title]. Untitled uploads on the AiC India channel keep a neutral caption.
const AIC = 'AiC India';
const v = ([id, brand, title]) => ({ id, brand, title });

export const WORK = [
  {
    key: 'scripted',
    videos: [
      ['NdKiG7Nb-ZU', 'ENO Chewy Bites', 'Bengali film, 60 seconds'],
      ['2_artdz7u7o', 'Dabur Chyawanprash', 'Parampara Sehat Ki · Chhath Puja'],
      ['1fT4Yi2Gb5g', 'Dabur Honey', '#AcchaiKiMithaas · Ganesh Chaturthi'],
      ['AtRc3Yj6Jbg', 'Dabur Red Paste', 'Mishti Khobor · #ChiboteThakun'],
      ['dkOf3qE16f0', 'Swiggy', 'Durga Pujo isn’t complete without bhog and new clothes'],
      ['wSsYxn9F8hA', 'Dabur Ratnaprash', 'Ganesh Modak · #ImmunityKaVardaan · Marathi'],
      ['-h-M0Ef5-Pg', 'Réal Fruit Power', 'Rakshabandhan'],
      ['xsGZM-MBo-g', 'Aashirvaad Svasti Ghee', 'The Smell of Onam'],
      ['7UxNXkoxCvM', 'Dabur Red Paste', 'Jaago Tumi Jaago · Durga Puja'],
      ['53hjspAk1so', 'Lenskart BLU', '#BLUWaaliDiwali'],
      ['WssiuukgKKg', 'Lenskart', 'Nazar Ghati Durghatna Ghati 2.0 × Virtual AR'],
      ['bo_hhB2MaWA', 'Lenskart', 'Nazar Ghati Durghatna Ghati 2.0 — second cut'],
      ['ITLV_y66KgM', 'Aditya Birla Capital', 'Personal Loan · #EkNayiShuruaat'],
      ['TDa72iVCBEo', 'Aditya Birla Capital', 'Home Loan · #EkNayiShuruaat'],
      ['NKSa3wse7jU', 'Aditya Birla Capital', 'Business Loan · #EkNayiShuruaat'],
      ['c3DpbFkLwCY', 'Pro-ease', 'Women’s Day · #BadalKarDekho'],
      ['fnitYgM114o', 'Pro-ease', 'Happy Mother’s Day'],
      ['qx6xK9u3Gys', 'Nykaa', 'Rakshak · a Raksha Bandhan special'],
      ['v0ZCh59fd_Q', 'Dabur Ratnaprash', 'Kashmiri Kesar'],
      ['dQJVfjn4Ujs', 'Nuvoco', 'Azaadi Badi Khaas Hai · 75 years of Independence'],
      ['W7eT0eRLLDs', 'Dabur Red Paste', 'Say No To Passive Smoking · World No Tobacco Day'],
      ['DKbydhXXB1Q', 'Dabur Red Paste', 'Desh Ke Laal · Independence Day'],
      ['U__HS5Ta3M4', 'Berger Paints', 'Armaano Ki Deewar · Children’s Day'],
      ['abelI2Osvn8', 'Dabur Lal Tail', 'Durga Puja'],
      ['hehcWbvJ2Zc', AIC, 'Scripted film'],
      ['0XSS25o5JpA', 'Srijan Realty', 'Bada Ghar · #ZarooriHai'],
      ['7sAIgEQTaqY', 'Srijan Realty', 'Khula Aasman · #ZarooriHai'],
      ['Slj3cWgsKYI', 'Srijan Realty', 'Bada Parivaar · #ZarooriHai'],
      ['QG9flcxOn4E', 'Srijan Realty', 'Apna Ghar · #ZarooriHai'],
      ['HKE-ipAXZKo', 'Srijan Realty', 'Eternia · #DekhLeiFlat'],
      ['gXB88RnQC4w', 'Srijan Realty', 'Eternia, Badu Road'],
      ['2Csx1XZ61lk', 'Srijan Realty', 'Your ideal living space at Eternia'],
      ['VimEMWxij5k', 'Srijan Realty', 'Natura, New Alipore'],
      ['nXDdLlmHXU0', 'Srijan Realty', 'Natura — luxury flats'],
      ['D1PXny_K1No', 'Srijan Realty', 'Natura — three sides open'],
      ['ouTgr5uZvlc', 'DTC Group', 'Capital City, Rajarhat'],
      ['ns27SjoIQVA', 'DTC Group', 'Capital City — 2BHK from 42 lakhs'],
      ['bFshSeVvu0U', 'DTC Group', 'Capital City — A life bigger than your imagination'],
      ['VUbcib70A7U', 'Springfit', 'Ab To So Jao · Hindi'],
    ].map(v),
  },
  {
    key: 'ai',
    videos: [
      ['dSnQ8ph47sY', 'MYK Laticrete', 'MythBuster Ep. 1 · Hindi'],
      ['olqdq8OZ7-Q', 'MYK Laticrete', 'MythBuster Ep. 2 · Hindi'],
      ['5pWShPhRnJQ', 'MYK Laticrete', 'MythBuster Ep. 3 · Hindi'],
      ['Qq-32Gl4lzg', 'MYK Laticrete', 'Car'],
      ['xjPWafGYqS4', 'MYK Laticrete', 'Ghungroo'],
      ['6BKspqBqbiE', 'MYK Laticrete', 'Operah'],
      ['WKbuNrcAWwY', 'MYK Laticrete', 'Laxmi'],
      ['VwkGj3-ZD8A', 'MYK Laticrete', 'Paratha'],
      ['MpOVKWIUaNE', 'Odomos', 'Maccharon Se Gayab Ho Jao'],
      ['oBMtkENXnYI', 'Dabur Lal Tail', 'Pehli Maalish · Hindi'],
      ['8Ztsq0We6HE', 'Dabur Honitus', 'Skip the kadha prep — Hot Sip'],
      ['8MpafHWNSkk', 'Rumi Fine Fragrances', 'It’s time to find your essence'],
      ['_mJQZOp7NqY', 'DTC Group', 'Still Waters — find your childhood in Newtown'],
      ['hMnHaykWIU8', 'AI film', 'AC retail film'],
      ['bu-coJ-QRe4', 'AI film', 'The Honey World'],
      ['6k5hZEUwHiE', 'AI film', 'Tata Sierra'],
      ['oBtLkG1S6aY', 'AI film', 'AI Auto Car'],
      ['Qi2N-eINkw8', AIC, 'AI film'],
      ['bYwPP1S0UEQ', AIC, 'AI film'],
      ['KhELDQvMQUc', AIC, 'AI film'],
      ['tx2dOmd-3II', AIC, 'AI film'],
      ['Ylql3MlTpg0', AIC, 'AI film'],
      ['EipINORnB4s', AIC, 'AI film'],
    ].map(v),
  },
  {
    key: 'activation',
    feature: {
      id: 'vekc_Sb3GHA',
      brand: 'Dabur Red Paste',
      title: 'The Wall That Spits Back',
      lead: 'What if the wall spits on you, every time you spit on it?',
      body: 'Introduced on World No Tobacco Day to stop people spitting chewed tobacco on walls — a public-service campaign built on a technology innovation by Dabur Red Paste.',
    },
    reels: [
      { brand: 'Aashirvaad', title: 'Durga Puja · Durgotinashini at Bagbazaar Sarbojanin, Kolkata — hunger as the Asura, the energy used to feed underserved children', url: 'https://www.instagram.com/reels/DA7jmPQSvaS/' },
      { brand: 'Dabur Red Paste', title: 'Dant Snan at the Maha Kumbh, Prayagraj', url: 'https://www.instagram.com/reel/DFzeCYUyDcb/' },
    ],
    videos: [
      ['Sa3xrxWURvM', 'Dabur Red Paste', 'Mahakumbh · Dant Snan'],
      ['ie9iPHW8Gpo', 'Dabur Red Paste', 'Dantasurs beware! Dantlal is here'],
      ['sU6iArfu36s', 'Dabur Pudin Hara', 'The Kumbh Mela anthem'],
      ['M1a-7F9h_Lo', 'Dabur Hajmola', 'Achhai Ka Chatkara ft. Umesh Tiwari'],
      ['wKbETpn784Y', 'Aashirvaad Mishti Doi', 'The Doiwalas are taking over Kolkata'],
      ['5lpFle-skcs', 'Aashirvaad', 'Eta Amar Maa'],
      ['sLu8p-Rqn_I', AIC, 'Activation film'],
    ].map(v),
  },
  {
    key: 'unscripted',
    videos: [
      ['_Kpv89kl-Jk', 'Mrs. Bector’s', 'Goodness Wali Gaadi with Mrs Rajni Bector'],
      ['w9uIdbmaq18', 'English Oven', 'Ode to Super Mom — Dr. Baani Yadav'],
      ['fLUw_olT7ko', 'English Oven', 'Ode to Super Mom — Alaknanda Dasgupta'],
      ['goFcjBu7qLE', 'English Oven', 'Ode to Super Mom — Dolma aunty'],
      ['RpndV_ixjgQ', 'Dabur Honey', 'Honey Trail — Dhule chapter'],
      ['1qeSRFuM25w', 'Dabur Honey', 'Honey Trails — Kashmir chapter · Jannat Ka Phal'],
      ['7EzudqtjUPg', 'Dabur Honey', 'In search of pure honey in the Sundarbans'],
      ['JOXRAEVH2uY', 'Dabur Organic Honey', 'From the heart of the Aravallis'],
      ['1I5nRg3fXq0', 'Dabur Honey', 'Shubho Bijoya · the sweetness of giving back'],
      ['6drAE_vKL_Y', 'Dabur Hajmola', 'Achhai ka Chatkara ft. Dorris Francis · Women’s Day 2024'],
      ['RdEs5bzU6r8', 'Dabur Hajmola', 'Celebrating goodness'],
      ['PYWBqDbeTKA', 'Dabur Gulabari', 'From fields to bottles'],
      ['zxuVCyvhA2A', 'ITC', 'Dabbo wala Rishta · the story of the dabbawalas'],
      ['6rUv496MtEU', 'Srijan Realty', 'Home is where the Pujo celebrations are'],
      ['e_bPoZLdnas', AIC, 'Unscripted film'],
    ].map(v),
  },
  {
    key: 'corporate',
    videos: [
      ['mWD4WxjBhWE', 'Dabur', 'Sapno ki Udaan · Dabur Strengthens India, Pithampur'],
      ['6_1yBSH-nIU', 'Dabur', 'Dabur Herbs'],
      ['CWbub1oQ1uA', 'Zetwerk', 'Aerospace & Defence'],
      ['gbmSZ7NdwtE', 'Zetwerk', 'Water & Irrigation'],
      ['fgclT0QvCYA', 'Zetwerk', 'Transmission & Distribution'],
    ].map(v),
  },
  {
    key: 'technology',
    videos: [
      ['pYOpfw2x2D8', 'India Gate', 'Chalchitra · NFT legacy gallery of rice art'],
      ['A3srOw9ZD3g', 'ICE Media Lab', 'Pilot video · Pashto, with subtitles'],
      ['p22ncVb0aaY', 'ICE Media Lab', 'Geography, Grade 10 · Dari'],
      ['A62xui73X0c', 'ICE Media Lab', 'Film with North AI'],
      ['lbJecyIr4f4', AIC, 'Technology film'],
    ].map(v),
  },
];

export const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const ytWatch = (id) => `https://www.youtube.com/watch?v=${id}`;
export const ytEmbed = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
