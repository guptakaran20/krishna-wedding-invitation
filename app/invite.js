// Everything that changes from one couple to the next lives here.
// This is a wedding invitation. Items marked "placeholder" were written for the template: replace them with the family's own words.

const venue = {
  name: 'Club Babylon',
  address: ['Babylon Club Road, S. P. Ring Road', 'Near Science City Circle, Bhadaj', 'Ahmedabad, Gujarat 380060'],
  art: '/art/venue-mandap.webp',
};
const venueQuery = [venue.name, ...venue.address].join(', ');

// The wedding day (India time). The card, the Save the Date scene, the cube and the finale all read their day,
// month and year from this one value.
// Set dateRevealed to true once the family announces the day. While it is false, every place that would show the
// date (opening card, scroll, Save the Date, cube, events, finale) says "to be announced" instead.
const dateRevealed = true;
const weddingDate = '2027-02-21T10:30:00+05:30';
const dp = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  .formatToParts(new Date(weddingDate)).map((x) => [x.type, x.value]));
const dateParts = { day: dp.day, month: dp.month, year: dp.year, weekday: dp.weekday };

export const invite = {
  groom: 'Sheshank',
  bride: 'Sakshi',
  families: 'The Menat & Patel Families',
  // the guest greeted when the link has no ?guest=… (a name in the link always wins). Set to '' to greet
  // "Family & Friends".
  guest: '',
  // the RSVP: reply-by date shown above the card
  // whatsapp: optional, international digits without '+', e.g. '9198XXXXXXXX'
  rsvp: { by: 'Kindly respond by 15 January 2027', whatsapp: '' },
  // People guests can call for travel, stay and the day itself (placeholders)
  contacts: [
    { label: 'Bride’s family', name: 'Mr. Harisiddh Patel', phone: '+91 98XXX XXXXX' },
    { label: 'Groom’s family', name: 'Mr. Hiralal Menat', phone: '+91 98XXX XXXXX' },
    { label: 'Travel & stay', name: 'Family coordinator', phone: '+91 98XXX XXXXX' },
  ],
  // A warm word from the elders (placeholder)
  family: {
    heading: 'Our doors, our hearts, our table, all open to you',
    message: 'Whether you travel from the next lane or from across the world, there is a seat at the table with your name on it. Come as family, leave as family.',
    signoff: 'With love, the Menat & Patel families',
  },
  // the couple's profiles, shown under their card. Swap photo for the customer's own picture (portrait, about 3:4).
  // about: a line or two in the couple's own words (placeholder text below)
  people: [
    {
      role: 'The Groom',
      roleHindi: 'वर',
      name: 'Sheshank',
      fullName: 'Sheshank Menat',
      parents: 'Son of Mr. Hiralal & Mrs. Bhanumati Menat',
      about: 'Engineer by day, weekend cricketer, and the one who still plans every family trip down to the last chai stop.',
      photo: '/photos/groom.webp',
    },
    {
      role: 'The Bride',
      roleHindi: 'वधू',
      name: 'Sakshi',
      fullName: 'Sakshi Patel',
      parents: 'Daughter of Mr. Harisiddh & Mrs. Monika Patel',
      about: 'Designer, Garba queen of every Navratri, and happiest with a sketchbook and a cup of masala chai.',
      photo: '/photos/bride.webp',
    },
  ],
  // the opening card (Hindi)
  namesHindi: 'शेशांक संग साक्षी',
  dateHindi: dateRevealed ? 'रविवार, 21 फ़रवरी 2027 · प्रातः 10:30 बजे से' : 'तिथि शीघ्र ही घोषित की जाएगी',
  occasionHindi: 'के शुभ विवाह में',
  occasionEnglish: 'to their wedding celebrations',
  occasionLine: 'request the pleasure of your company at their wedding',
  groomParents: 'S/O Mr. Hiralal & Mrs. Bhanumati Menat',
  brideParents: 'D/O Mr. Harisiddh & Mrs. Monika Patel',
  dateRevealed,
  date: weddingDate,
  dateParts,
  // the date as written on the scroll: 21 · 02 · 2027
  dateShort: !dateRevealed ? 'Date to be announced' : `${dateParts.day} · ${new Date(weddingDate).toLocaleString('en-GB', { month: '2-digit', timeZone: 'Asia/Kolkata' })} · ${dateParts.year}`,
  city: 'Ahmedabad',
  hashtag: '#SheshankWedsSakshi',
  venue: {
    ...venue,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(venueQuery)}`,
  },
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueQuery)}`,
  mapEmbed: `https://www.google.com/maps?q=${encodeURIComponent(venueQuery)}&output=embed`,

  // Add or reorder events here. Optional fields are attire, art, mapUrl, and transition.
  // mood: the word used in the sentence "laughter and colour at the Haldi". Dates and times are placeholders.
  events: [
    {
      name: 'Haldi & Ganesh Puja',
      mood: 'blessings and laughter',
      start: '2027-02-20T10:00:00+05:30',
      time: '10:00 am onwards',
      place: 'Lawn Mandap, Club Babylon',
      attire: 'Yellows and traditional pastels',
      description: 'Haldi for the couple and a puja to begin the celebrations.',
      art: '/art/events-puja.webp',
      transition: 'feathers',
    },
    {
      name: 'Sangeet Night',
      mood: 'music and dancing',
      start: '2027-02-20T19:00:00+05:30',
      time: '7:00 pm onwards',
      place: 'Poolside Stage, Club Babylon',
      attire: 'Indo-western glam',
      description: 'Performances, Garba and a dance floor that will not rest.',
      art: '/art/events-sangeet.webp',
      transition: 'marigolds',
    },
    {
      name: 'Wedding Ceremony',
      mood: 'vows and blessings',
      start: '2027-02-21T10:30:00+05:30',
      time: '10:30 am onwards',
      place: 'Grand Lawn Mandap, Club Babylon',
      attire: 'Indian festive · blush & gold',
      description: 'The pheras and the vows, in the presence of family and friends.',
      art: '/art/events-engagement.webp',
      transition: 'toast',
    },
    {
      name: 'Reception & Dinner',
      mood: 'dinner and celebration',
      start: '2027-02-21T19:30:00+05:30',
      time: '7:30 pm onwards',
      place: 'Banquet Hall, Club Babylon',
      attire: 'Cocktail · festive glam',
      description: 'Dinner, toasts and one last dance before the vidaai.',
      art: '/art/events-dinner.webp',
      transition: 'roses',
    },
  ],

  // placeholder story, written for the template
  story: [
    { year: '2019', title: 'The First Hello', text: 'Two borrowed books, one library table, and a conversation that never quite ended.', art: '/art/story-1.webp' },
    { year: '2021', title: 'Chai in the Rain', text: 'Monsoon evenings, one umbrella and endless cutting chai under the gulmohar.', art: '/art/story-2.webp' },
    { year: '2025', title: 'The Question', text: 'A sunset terrace, a trembling ring and the easiest “yes” ever said.', art: '/art/story-3.webp' },
    { year: '2026', title: 'Two Families, One', text: 'With marigolds and blessings, our families became one big family.', art: '/art/story-4.webp' },
  ],

  moments: [
    { art: '/art/moment-1.webp', caption: 'Through the rose garden' },
    { art: '/art/moment-2.webp', caption: 'Dusk on the lotus lake' },
    { art: '/art/moment-3.webp', caption: 'Haldi giggles' },
    { art: '/art/moment-4.webp', caption: 'A sky full of lanterns' },
    { art: '/art/moment-5.webp', caption: 'Chai in the monsoon' },
    { art: '/art/moment-6.webp', caption: 'Garba nights' },
    { art: '/art/moment-7.webp', caption: 'Uttarayan on the rooftop' },
    { art: '/art/moment-8.webp', caption: 'Bangles at the bazaar' },
    { art: '/art/moment-9.webp', caption: 'Under the mango tree' },
    { art: '/art/moment-10.webp', caption: 'Rotis with Ba' },
    { art: '/art/moment-11.webp', caption: 'Riverfront at dusk' },
    { art: '/art/moment-12.webp', caption: 'The yes' },
  ],

  // Our Families: the card for each side, and its family tree. The tree is a list of groups, top to bottom: give each
  // group any title and any people you like ({ name, role }); add, remove or reorder freely.
  ourFamilies: {
    groom: {
      heading: 'The Groom’s Family',
      person: 'Sheshank',
      relation: 'son',
      father: 'Mr. Hiralal Menat',
      mother: 'Mrs. Bhanumati Menat',
      art: '/art/family-groom.webp',
      tree: [
        { title: 'Grandparents', people: [{ name: '', role: 'Dada' }, { name: '', role: 'Dadi' }, { name: '', role: 'Nana' }, { name: '', role: 'Nani' }] },
        { title: 'Parents', people: [{ name: 'Mr. Hiralal Menat', role: 'Father' }, { name: 'Mrs. Bhanumati Menat', role: 'Mother' }] },
        { title: 'Sheshank & siblings', people: [{ name: 'Sheshank', role: 'Groom', focus: true }] },
      ],
    },
    bride: {
      heading: 'The Bride’s Family',
      person: 'Sakshi',
      relation: 'daughter',
      father: 'Mr. Harisiddh Patel',
      mother: 'Mrs. Monika Patel',
      art: '/art/family-bride.webp',
      tree: [
        { title: 'Grandparents', people: [{ name: '', role: 'Dada' }, { name: '', role: 'Dadi' }, { name: '', role: 'Nana' }, { name: '', role: 'Nani' }] },
        { title: 'Parents', people: [{ name: 'Mr. Harisiddh Patel', role: 'Father' }, { name: 'Mrs. Monika Patel', role: 'Mother' }] },
        { title: 'Sakshi & siblings', people: [{ name: 'Sakshi', role: 'Bride', focus: true }] },
      ],
    },
  },

  // Good to know: one card at a time. map is a Google Maps search; tone is the card's paper (cream, rose, sage, gold).
  // Placeholders: the hotel suggestions and timings.
  goodToKnow: [
    {
      word: 'Arrive', kicker: 'Getting to Ahmedabad', tone: 'cream', art: '/art/gtk-arrive.webp',
      items: [
        { name: 'Ahmedabad Airport', note: 'About 30 min by car to Club Babylon.', map: 'Ahmedabad Airport' },
        { name: 'Ahmedabad Junction (Kalupur)', note: 'About 35 min by car to Club Babylon.', map: 'Ahmedabad Railway Station' },
      ],
    },
    {
      word: 'Stay', kicker: 'Where to rest', tone: 'rose', art: '/art/gtk-stay.webp',
      items: [
        { name: 'Hotels near Science City', note: 'A few minutes from the venue. The family will share partner hotels soon.', map: 'Hotels near Science City, Ahmedabad' },
      ],
    },
    {
      word: 'Travel', kicker: 'Reaching the venue', tone: 'sage', art: '/art/gtk-travel.webp',
      items: [
        { name: 'Club Babylon, Bhadaj', note: 'Valet parking at the main gate from 9 am.', map: venueQuery },
        { name: 'Cabs', note: 'Uber and Ola run late into the night from Science City Circle.' },
      ],
    },
    {
      word: 'Weather', kicker: 'Late February in Ahmedabad', tone: 'gold', art: '/art/gtk-weather-courtyard.webp',
      items: [
        { name: 'Warm days, pleasant nights', note: 'Around 30°C by day and 15°C after sunset.' },
        { name: 'What to carry', note: 'Light fabrics for the evening and a shawl for the night.' },
      ],
    },
  ],

  // placeholder blessings shown before guests add their own
  wishes: [
    { text: 'May your love bloom brighter with every passing season.', from: 'Dadi & Dadaji' },
    { text: 'Two beautiful souls, one beautiful journey. So happy for you both!', from: 'Riya Mausi' },
    { text: 'Wishing you a lifetime of laughter, chai and long drives.', from: 'College Gang' },
    { text: 'Jai Shri Krishna! Blessings for a joyful new beginning.', from: 'Patel Parivar' },
    { text: 'From playing ghar-ghar to this day. Love you both endlessly!', from: 'Ananya Didi' },
    { text: 'May your home always smell of fresh rotis and laughter.', from: 'Ba' },
    { text: 'The best things come to those who wait. Congratulations, beta!', from: 'Kaka & Kaki' },
    { text: 'Here’s to a partnership as strong as Ahmedabad chai.', from: 'The Office Crew' },
    { text: 'Shubh Mangal! May every festival be brighter with you two.', from: 'Menat Parivar' },
    { text: 'You make each other better. That’s everything.', from: 'Nikhil & Pooja' },
  ],
};

// The invitation's fixed wording in Hindi, shown when the guest picks हिंदी in the corner menu. Everything the family
// enters (names, events, story, captions, travel notes, contacts, blessings, dates) stays in English in both languages;
// only these template phrases change. Lists go item by item, in the same order as above.
export const inviteHindi = {
  occasionEnglish: 'आपकी गरिमामयी उपस्थिति प्रार्थनीय है',
  occasionLine: 'अपने शुभ विवाह में आपको सादर आमंत्रित करते हैं',
  people: [
    { role: 'वर', roleHindi: '' },
    { role: 'वधू', roleHindi: '' },
  ],
  ourFamilies: {
    groom: { heading: 'वर पक्ष', relation: 'सुपुत्र' },
    bride: { heading: 'वधू पक्ष', relation: 'सुपुत्री' },
  },
};
