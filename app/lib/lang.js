'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { invite as base, inviteHindi } from '../invite';

// The invitation reads in English or Hindi. The guest picks one in the corner menu (it is remembered on this device),
// or the link can choose it with ?lang=hi. Words the guest types themselves (their name, their blessing) stay as typed.
const KEY = 'invite-lang';

// The fixed words of the invitation, in Hindi. Every t('…') looks its English up here; anything missing stays English.
const HINDI = {
  'Tap to open': 'खोलने के लिए टैप करें',
  'Tap the scroll to open': 'खोलने के लिए पत्र पर टैप करें',
  'Meet the couple': 'वर-वधू से मिलिए',
  'Two Hearts': 'दो हृदय',
  'How it all began': 'कैसे शुरू हुई कहानी',
  'Our Story': 'हमारी कहानी',
  Chapter: 'अध्याय',
  'keep scrolling to turn the page': 'पन्ना पलटने के लिए स्क्रॉल करते रहें',
  'Save the Date': 'तिथि याद रखें',
  'For the wedding|celebration of': 'शुभ विवाह|समारोह',
  'Date to be announced': 'तिथि शीघ्र घोषित होगी',
  Location: 'स्थान',
  'Save the date': 'कैलेंडर में जोड़ें',
  Events: 'कार्यक्रम',
  'The Venue': 'विवाह स्थल',
  Directions: 'रास्ता देखें',
  'Copy address': 'पता कॉपी करें',
  Copied: 'कॉपी हो गया',
  'Address copied': 'पता कॉपी हो गया',
  'Use your device’s Copy command to copy the address.': 'पता कॉपी करने के लिए अपने फ़ोन का कॉपी विकल्प चुनें।',
  'Before you travel': 'यात्रा से पहले',
  'Good to Know': 'ज़रूरी जानकारी',
  Map: 'नक्शा',
  'Our journey': 'हमारा सफ़र',
  'Moments Together': 'साथ बिताए पल',
  'Scroll to open our gallery': 'गैलरी खोलने के लिए स्क्रॉल करें',
  'to follow': 'शीघ्र',
  'with love': 'प्रेम सहित',
  swipe: 'स्वाइप',
  'Swipe left for the next photo · tap a photo to see it in full': 'अगली फ़ोटो के लिए स्वाइप करें · पूरी फ़ोटो देखने के लिए टैप करें',
  'swipe to see more': 'और देखने के लिए स्वाइप करें',
  'Previous photo': 'पिछली फ़ोटो',
  'Next photo': 'अगली फ़ोटो',
  'Close photo': 'फ़ोटो बंद करें',
  'Parents & family': 'माता-पिता एवं परिवार',
  'Our Families': 'हमारे परिवार',
  'With grateful hearts we honour the families who raised us with love.': 'कृतज्ञ हृदय से हम उन परिवारों को नमन करते हैं जिन्होंने हमें प्रेम से पाला।',
  'To be shared': 'शीघ्र साझा होगा',
  'Family Tree': 'वंश वृक्ष',
  'View family tree': 'वंश वृक्ष देखें',
  'Close the family tree': 'वंश वृक्ष बंद करें',
  'Thank you': 'धन्यवाद',
  'We can’t wait to celebrate with you': 'आपके साथ उत्सव मनाने की हमें प्रतीक्षा है',
  'Kindly Reply': 'कृपया उत्तर दें',
  'Will you join us?': 'क्या आप पधारेंगे?',
  'Yes, I’ll be there': 'जी हाँ, अवश्य आएँगे',
  'Wishing wall': 'शुभकामना दीवार',
  Blessings: 'आशीर्वाद',
  'Words of love from our family and friends for': 'परिवार और मित्रों के प्रेम भरे शब्द, इनके लिए:',
  'View all postcards': 'सभी पोस्टकार्ड देखें',
  'Blessing postcards': 'आशीर्वाद पोस्टकार्ड',
  'Close postcards': 'पोस्टकार्ड बंद करें',
  'Previous postcard': 'पिछला पोस्टकार्ड',
  'Next postcard': 'अगला पोस्टकार्ड',
  'Leave a blessing': 'आशीर्वाद लिखें',
  From: 'प्रेषक',
  'Add my postcard': 'मेरा पोस्टकार्ड जोड़ें',
  'Write a blessing before adding your postcard.': 'पोस्टकार्ड जोड़ने से पहले आशीर्वाद लिखें।',
  'Your postcard was added to the wall.': 'आपका पोस्टकार्ड दीवार पर लग गया।',
  'Your postcard was added for this visit.': 'आपका पोस्टकार्ड इस बार के लिए जोड़ दिया गया।',
  'Here to help': 'सहायता के लिए',
  'Reach Out': 'संपर्क करें',
  'The Families': 'परिवारजन',
  'For anything you need': 'किसी भी आवश्यकता के लिए',
  Call: 'कॉल करें',
  'Thank you for|blessing our journey': 'हमारे सफ़र को|आशीर्वाद देने के लिए धन्यवाद',
  'Just married': 'नवविवाहित',
  'Return to top': 'ऊपर जाएँ',
  Previous: 'पिछला',
  Next: 'अगला',
  Menu: 'मेन्यू',
  Close: 'बंद करें',
  Music: 'संगीत',
  Language: 'भाषा',
  On: 'चालू',
  Off: 'बंद',
};

// Hindi digits for the storybook's chapter numbers
const HINDI_DIGITS = ['१', '२', '३', '४', '५', '६', '७', '८', '९'];

// a copy of `from` with every field `over` gives replaced (lists item by item)
function merge(from, over) {
  if (over === undefined) return from;
  if (Array.isArray(from)) return from.map((item, index) => merge(item, over?.[index]));
  if (from && typeof from === 'object' && over && typeof over === 'object') {
    const out = { ...from };
    for (const key of Object.keys(over)) out[key] = merge(from[key], over[key]);
    return out;
  }
  return over;
}
const hindiInvite = merge(base, inviteHindi);

function translator(lang) {
  return (text) => (lang === 'hi' ? HINDI[text] ?? text : text);
}

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: translator('en'), invite: base, chapter: (i) => i + 1 });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch { /* storage unavailable */ }
    const fromLink = new URLSearchParams(window.location.search).get('lang');
    const chosen = fromLink === 'hi' || fromLink === 'en' ? fromLink : saved;
    if (chosen === 'hi') setLangState('hi');
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang(next) {
      setLangState(next);
      try { localStorage.setItem(KEY, next); } catch { /* storage unavailable */ }
    },
    t: translator(lang),
    invite: lang === 'hi' ? hindiInvite : base,
    chapter: (index) => (lang === 'hi' ? HINDI_DIGITS[index] ?? index + 1 : ['I', 'II', 'III', 'IV', 'V', 'VI'][index] ?? index + 1),
  }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
