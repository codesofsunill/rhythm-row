/* =====================================================================
   RHYTHM ROW  -  CONFIG  (poori website yahin se control hoti hai)
   ---------------------------------------------------------------------
   * Har client ke liye sirf is file ko badlo. app.js / style.css ko mat chhedo.
   * scriptUrl bhar doge to Workshops, Teachers, Classes, Promo codes aur seats
     Google Sheet se aayenge (is file ke workshops/teachers sirf demo ke liye hain).
   * scriptUrl khali = "demo mode": site chalti hai, data sirf us browser mein rehta hai.
   ===================================================================== */
window.CONFIG = {

  /* ---------- 1. BRAND ---------- */
  brand: 'Rhythm Row',                   // site ka naam (logo na ho to text logo banta hai)
  idPrefix: 'RR',                        // ticket ID: RR-XXXXXX  (Code.gs ke ID_PREFIX jaisa hi rakho)
  tagline: 'One weekend. One routine. Your stage.',
  headline: ['One weekend.', 'One routine.', 'Your stage.'],   // hero ki 3 lines (aakhri line accent rang mein)
  intro: 'Learn one full routine from a guest choreographer in a single weekend, then perform it with your batch. Complete beginners are welcome next to trained dancers.',
  city: 'Your City',
  state: 'Your State',

  /* ---------- 2. THEME ---------- */
  theme: {
    accent: '#2DD4A0',                   // main rang: buttons, glow, highlights (koi bhi hex)
    accentOnLight: '#0B8F6A',            // light theme mein text/links ke liye thoda gehra version
    default: 'dark'                      // 'dark' | 'light' | 'system'  (visitor toggle se badal sakta hai)
  },

  /* ---------- 3. BACKEND (Google Sheet) ---------- */
  scriptUrl: 'https://script.google.com/macros/s/AKfycbz_U9H-tjqekkGqPXlO_9ZsPQmz7ffJtL4v9jeJGHEat23uTaTa9gJiSn-WyQhHOXEanQ/exec',                         // README Part A ke Step 4 se mila link

  /* ---------- 4. CONTACT ---------- */
  contact: {
    whatsapp: '916371433363',            // country code + number, sirf digits
    phoneDisplay: '+91 63714 33363',
    email: 'hello@example.com',
    instagram: 'https://instagram.com/your_handle',
    instagramHandle: '@your_handle',
    youtube: ''                          // recap video ka link. Khali = video block chhup jaata hai
  },

  /* ---------- 5. PAYMENT ---------- */
  payment: {
    upiId: '9040742899@ybl',
    upiName: 'Rhythm Row',
    note: 'All bookings and registrations are strictly non-refundable and non-transferable.'
  },

  /* ---------- 6. IMAGES  (files assets/img/ mein rakho, 400 KB se chhoti) ---------- */
  images: {
    logo: '',                            // 'assets/img/logo.png'  (transparent PNG/SVG)
    hero: [],                            // ['assets/img/hero1.jpg','assets/img/hero2.jpg']  slideshow
    workshopsBg: '',                     // Workshops section ke peeche ki photo
    about: [],                           // 2 photos
    gallery: []                          // kitni bhi photos, lightbox mein khulti hain
  },

  /* ---------- 7. SECTIONS ON/OFF ---------- */
  sections: { how: true, teachers: true, about: true, gallery: true, reviews: true, faq: true },

  /* ---------- 8. TEACHERS ---------- */
  teachers: [
    { id: 't1', name: '[TEACHER ONE]',   photo: '', styles: ['Bollywood', 'Jazz Funk'], instagram: '', bio: '[Two or three lines about training, credits and teaching style.]' },
    { id: 't2', name: '[TEACHER TWO]',   photo: '', styles: ['Hip Hop', 'Freestyle'],   instagram: '', bio: '[Two or three lines about training, credits and teaching style.]' },
    { id: 't3', name: '[TEACHER THREE]', photo: '', styles: ['Contemporary'],           instagram: '', bio: '[Two or three lines about training, credits and teaching style.]' }
  ],

  /* ---------- 9. WORKSHOPS ----------
     Ek workshop = ek teacher + ek din. Usme kai "classes" (gaane / routines), har ki apni timing aur price.
     date: 'yyyy-mm-dd'  ya  weeksFromNow:1 (demo ke liye aane wale Saturday se).
     bundle: {min:3, off:150} => 3 ya zyada classes chuno to Rs 150 off. Nahi chahiye to hata do.
     groupLink: WhatsApp group link. Sirf verified ticket par dikhta hai (Sheet mode mein). */
  workshops: [
    { id: 'w1', teacher: 't1', tag: 'Dance Workshop', weeksFromNow: 1, city: 'Your City', venue: '[VENUE NAME, AREA]', mapLink: '', groupLink: '',
      bundle: { min: 3, off: 150 },
      classes: [
        { id: 'c1', name: '[Song one]',   time: '1:00 PM', price: 1, seats: 20 },
        { id: 'c2', name: '[Song two]',   time: '4:00 PM', price: 950, seats: 20 },
        { id: 'c3', name: '[Song three]', time: '6:00 PM', price: 950, seats: 20 } ] },
    { id: 'w2', teacher: 't2', tag: 'Dance Workshop', weeksFromNow: 2, city: 'Your City', venue: '[VENUE NAME, AREA]', mapLink: '', groupLink: '',
      bundle: { min: 2, off: 100 },
      classes: [
        { id: 'c4', name: '[Song one]', time: '3:00 PM', price: 1100, seats: 24 },
        { id: 'c5', name: '[Song two]', time: '5:30 PM', price: 1100, seats: 24 } ] },
    { id: 'w3', teacher: 't3', tag: 'Dance Workshop', weeksFromNow: 3, city: 'Your City', venue: '[VENUE NAME, AREA]', mapLink: '', groupLink: '',
      classes: [
        { id: 'c6', name: '[Routine one]', time: '5:00 PM', price: 1200, seats: 16 } ] }
  ],

  /* Demo mode ke promo codes. Sheet mode mein "Promo" tab use hota hai.
     type: 'flat' (Rs off)  ya  'percent' */
  promoCodes: [ { code: 'WELCOME100', type: 'flat', value: 100 } ],

  /* ---------- 10. CONTENT ---------- */
  styles: ['Hip Hop', 'Bollywood', 'Contemporary', 'Latin', 'Salsa', 'Bachata', 'Freestyle', 'Commercial', 'Urban', 'Afro', 'Popping', 'Locking', 'House', 'Waacking', 'Bhangra', 'Semi-Classical', 'Lyrical', 'Jazz Funk', 'Breaking', 'Heels'],

  how: [
    { t: 'Choose your classes', d: 'Pick a workshop and the classes you want. The total updates as you choose.' },
    { t: 'Pay via UPI',         d: 'Scan the QR or tap pay, then enter your UTR number.' },
    { t: 'Join the group',      d: 'Once your payment is verified, your ticket shows the workshop WhatsApp group link.' }
  ],

  about: {
    title: 'More than a class. A weekend you perform.',
    text: 'Guest choreographers, small batches and one routine taught start to finish.',
    pillars: [
      { t: 'Guest choreographers', d: 'Working artists travel in to teach each weekend.' },
      { t: 'Open floor',           d: 'Any age, any experience level.' },
      { t: 'One routine',          d: 'Learn it start to finish and perform it on day two.' },
      { t: 'Local crew',           d: 'Dancers from your city who learn, film and cheer together.' }
    ]
  },

  reviews: [
    { q: '[REAL TESTIMONIAL 1]', by: '[NAME]' },
    { q: '[REAL TESTIMONIAL 2]', by: '[NAME]' },
    { q: '[REAL TESTIMONIAL 3]', by: '[NAME]' }
  ],

  faqs: [
    { q: 'Who can join the workshops?', a: 'Everyone. All ages, backgrounds and skill levels share the same floor.' },
    { q: 'What should I bring?', a: '[YOUR ANSWER: water bottle, comfortable clothes, shoes]' },
    { q: 'Can I pick only some classes?', a: 'Yes. Choose any classes from a workshop. Some workshops give a discount when you pick several.' },
    { q: 'Do you provide certificates?', a: '[YOUR ANSWER]' },
    { q: 'Can I get a refund or transfer my spot?', a: 'All bookings are non-refundable and non-transferable. Please check the date and venue before you pay.' }
  ],

  /* ---------- 11. EXTRAS ---------- */
  analyticsId: ''                        // Google Analytics 4 ID, e.g. 'G-XXXXXXXXXX'. Khali = off
};
