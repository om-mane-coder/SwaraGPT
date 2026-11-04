/**
 * SwaraGPT - Authentic Indian Classical Musicology Knowledge Base & Reasoning Engine
 * Grounded in the Natya Shastra, Sangeeta Ratnakara, Kramik Pustak Malika, and Gharana traditions.
 */

export interface RagaDetails {
  name: string;
  hindiName: string;
  thaat: string;
  prahar: string;
  time: string;
  jati: string;
  vadi: string;
  samvadi: string;
  aroha: string;
  avaroha: string;
  pakad: string;
  rasa: string;
  description: string;
  rules: string[];
  drills: string[];
}

export interface ThaatDetails {
  name: string;
  hindiName: string;
  swaras: string;
  description: string;
  majorRagas: string[];
  characteristic: string;
}

export interface TalaDetails {
  name: string;
  matras: number;
  vibhags: string;
  tali: string;
  khali: string;
  theka: string;
  description: string;
  genres: string[];
}

export const THAATS: Record<string, ThaatDetails> = {
  bilawal: {
    name: "Bilawal",
    hindiName: "बिलावल",
    swaras: "S R G M P D N (All Shuddha / Natural notes)",
    description: "The primary shuddha scale of modern Hindustani classical music, equivalent to the Western Major scale (Ionian mode) and Carnatic Shankarabharanam.",
    majorRagas: ["Alhaiya Bilawal", "Bihag", "Deshkar", "Durga", "Hamsadhwani"],
    characteristic: "Radiates joyous, radiant, and peaceful (Shanta) emotions. Often sung in the late morning."
  },
  kalyan: {
    name: "Kalyan",
    hindiName: "कल्याण",
    swaras: "S R G M' P D N (Tivra Madhyam M', all other notes Shuddha)",
    description: "Equivalent to the Lydian mode and Carnatic Mechakalyani. Characterized by the prominent use of Tivra Madhyam (sharp 4th).",
    majorRagas: ["Yaman", "Yaman Kalyan", "Bhoopali", "Shuddha Kalyan", "Kedar", "Hameer", "Chhayanat"],
    characteristic: "Evokes serene contemplation, romance (Shringar), and evening beauty. Sung during the first prahar of night (6–9 PM)."
  },
  khamaj: {
    name: "Khamaj",
    hindiName: "खमाज",
    swaras: "S R G M P D n (Komal Nishad n, all other notes Shuddha)",
    description: "Equivalent to the Mixolydian mode and Carnatic Harikambhoji. Characterized by Shuddha Ni in ascent and Komal Ni in descent.",
    majorRagas: ["Khamaj", "Desh", "Tilak Kamod", "Rageshri", "Jaijaiwanti", "Sorath"],
    characteristic: "The prime thaat for Thumri, Dadra, Ghazals, and semi-classical romantic compositions."
  },
  kafi: {
    name: "Kafi",
    hindiName: "काफ़ी",
    swaras: "S R g M P D n (Komal Gandhar g, Komal Nishad n)",
    description: "Equivalent to the Dorian mode and Carnatic Kharaharapriya. An ancient scale corresponding to the original Shadja Grama of Bharata Muni.",
    majorRagas: ["Kafi", "Bageshri", "Bhimpalasi", "Dhanashree", "Piloo", "Megh"],
    characteristic: "Deeply emotive, evoking the spirit of monsoon (Hori, Chaiti), devotion, and pathos."
  },
  asavari: {
    name: "Asavari",
    hindiName: "आसावरी",
    swaras: "S R g M P d n (Komal Gandhar g, Komal Dhaivat d, Komal Nishad n)",
    description: "Equivalent to the Natural Minor scale (Aeolian mode) and Carnatic Natabhairavi.",
    majorRagas: ["Asavari", "Jaunpuri", "Darbari Kanada", "Adana", "Desi"],
    characteristic: "Conveys poignant seriousness, pathos (Karuna), and deep majestic grandeur."
  },
  bhairav: {
    name: "Bhairav",
    hindiName: "भैरव",
    swaras: "S r G M P d N (Komal Rishabh r, Komal Dhaivat d, Shuddha Ga and Ni)",
    description: "Equivalent to Carnatic Mayamalavagowla. The king of morning Sandhiprakash (dawn twilight) ragas.",
    majorRagas: ["Bhairav", "Ahir Bhairav", "Bairagi Bhairav", "Ramkali", "Nat Bhairav", "Jogia"],
    characteristic: "Evokes profound meditative devotion (Bhakti), spiritual awe, and Shiva's cosmic tranquility."
  },
  bhairavi: {
    name: "Bhairavi",
    hindiName: "भैरवी",
    swaras: "S r g M P d n (All four Komal swaras: r, g, d, n)",
    description: "Equivalent to the Phrygian mode and Carnatic Hanumatodi. The reigning queen of conclusion in classical concerts.",
    majorRagas: ["Bhairavi", "Sindhi Bhairavi", "Malkauns (derivative)", "Bilaskhani Todi"],
    characteristic: "Universal expressiveness; traditionally sung at dawn or to conclude any classical recital with overwhelming Karuna."
  },
  todi: {
    name: "Todi",
    hindiName: "तोड़ी",
    swaras: "S r g M' P d N (Komal r, Komal g, Tivra M', Komal d, Shuddha N)",
    description: "Equivalent to Carnatic Shubhapantuvarali. Known for its deeply microtonal, introspective character.",
    majorRagas: ["Miyan Ki Todi", "Gujari Todi", "Bilaskhani Todi", "Bhupal Todi"],
    characteristic: "Intense longing, ascetic devotion, and emotional yearning. Sung in the late morning (8–11 AM)."
  },
  poorvi: {
    name: "Poorvi",
    hindiName: "पूर्वा / पूर्वी",
    swaras: "S r G M' P d N (Komal r, Tivra M', Komal d, Shuddha G and N)",
    description: "Equivalent to Carnatic Kamavardhani (Pantuvarali). Sung at dusk Sandhiprakash (sunset twilight).",
    majorRagas: ["Poorvi", "Puriya Dhanashree", "Paraj", "Basant", "Shree"],
    characteristic: "Deep yearning and solemn mystery as daylight dissolves into darkness."
  },
  marwa: {
    name: "Marwa",
    hindiName: "मारवा",
    swaras: "S r G M' D N (Komal r, Tivra M', Shuddha D and N, omits Pancham Pa)",
    description: "Equivalent to Carnatic Gamanashrama. Omits Pa and emphasizes Komal Re and Dhaivat.",
    majorRagas: ["Marwa", "Puriya", "Sohini", "Lalit (related)"],
    characteristic: "Restless tension, psychological depth, and transcendental dispassion (Vairagya). Sung at sunset (6–7 PM)."
  }
};

export const RAGAS: Record<string, RagaDetails> = {
  yaman: {
    name: "Raga Yaman (राग यमन)",
    hindiName: "यमन",
    thaat: "Kalyan",
    prahar: "1st Prahar of Night (6:00 PM – 9:00 PM)",
    time: "Evening Twilight",
    jati: "Shadav - Sampurna (direct Sa omitted in ascent)",
    vadi: "Gandhar (Ga) [386.3 cents]",
    samvadi: "Nishad (Ni) [1088.3 cents]",
    aroha: "'.N R G, M' P, D N S'",
    avaroha: "S' N D P, M' G R S",
    pakad: "'.N R G, R G M' P, D P M' G R, .N R S'",
    rasa: "Shringar (Romantic Elegance), Shanta (Tranquil Devotion)",
    description: "Considered the fundamental pillar of Hindustani classical pedagogy. It uses all Shuddha swaras with a sharp Tivra Madhyam ($M'$). Direct Sa is omitted in ascent, beginning with the canonical glide '.Ni Re Ga'.",
    rules: [
      "Avoid starting directly on Sa in the ascent; always enter through Mandra Ni: '.N R G'.",
      "Tivra Madhyam (590.2 cents) must resolve smoothly into Pancham (702 cents) or descend to Gandhar.",
      "Gandhar (Ga) is the reigning Vadi note; sustain Ga with steady diaphragmatic breath.",
      "Touching Shuddha Madhyam creates the distinct raga Yaman-Kalyan."
    ],
    drills: [
      "Sustain Gandhar for 4 bars at 60 BPM with Tanpura drone.",
      "Practice the slow Meend glide: Tivra Ma -> Pa (M' -> P).",
      "Sing Pakad with correct microtones: '.N R G, M' P, D P M' G R, .N R S'."
    ]
  },
  bhairav: {
    name: "Raga Bhairav (राग भैरव)",
    hindiName: "भैरव",
    thaat: "Bhairav",
    prahar: "1st Prahar of Day (4:00 AM – 7:00 AM, Sandhiprakash)",
    time: "Dawn Twilight",
    jati: "Sampurna - Sampurna (All 7 notes present)",
    vadi: "Komal Dhaivat (d) [813.7 cents]",
    samvadi: "Komal Rishabh (r) [111.7 cents]",
    aroha: "S r G M P d N S'",
    avaroha: "S' N d P M G r S",
    pakad: "G M (d)d P, M G (r)r S",
    rasa: "Bhakti (Solemn Devotion), Vira (Spiritual Majesty), Shanta",
    description: "The supreme dawn raga dedicated to Lord Shiva. Characterized by its signature slow oscillation (Andolan) on Komal Rishabh and Komal Dhaivat.",
    rules: [
      "Komal Rishabh and Komal Dhaivat MUST feature a slow, majestic Andolan (undulation at 2-3 Hz).",
      "Never sing rapid vibrato on Re or Dha; let the pitch gently oscillate between lower and higher microtonal borders.",
      "Gandhar and Nishad are Shuddha, providing a striking, luminous contrast against Komal Re and Dha.",
      "Sung at early dawn to awaken spiritual consciousness."
    ],
    drills: [
      "Practice slow Komal Re Andolan: oscillate between 70 cents and 112 cents.",
      "Sustain Komal Dhaivat with deep chest resonance for 8 beats.",
      "Sing Bhairav Pakad: G M (d)d P, M G (r)r S."
    ]
  },
  bhairavi: {
    name: "Raga Bhairavi (राग भैरवी)",
    hindiName: "भैरवी",
    thaat: "Bhairavi",
    prahar: "Morning (Dawn) or Universal Concert Finale",
    time: "Dawn or Recital Conclusion",
    jati: "Sampurna - Sampurna",
    vadi: "Madhyam (Ma) [498.0 cents]",
    samvadi: "Shadja (Sa) [0.0 cents]",
    aroha: "S r g M P d n S'",
    avaroha: "S' n d P M g r S",
    pakad: "M g S r S, .d .n S",
    rasa: "Karuna (Pathos / Yearning), Bhakti (Devotion), Shringar",
    description: "The undisputed queen of Indian ragas. All four variable notes are Komal (r, g, d, n). In semi-classical thumri singing, all 12 swaras may be delicately touched, known as Mishra Bhairavi.",
    rules: [
      "Madhyam (Ma) is the resting Vadi swara, lending immense stability to phrases.",
      "Komal Re and Komal Dha are rendered with tender, melting meends without oscillation.",
      "Traditionally marks the peaceful climax of any classical mehfil."
    ],
    drills: [
      "Glide smoothly from Komal Dha to Pa: 'd -> P' without pitch steps.",
      "Practice descent: 'S' n d P M g r S' maintaining pitch purity.",
      "Vocalize 'M g S r S' with deep inward devotional expression."
    ]
  },
  bhoopali: {
    name: "Raga Bhoopali (राग भूपाली)",
    hindiName: "भूपाली",
    thaat: "Kalyan",
    prahar: "1st Prahar of Night (7:00 PM – 10:00 PM)",
    time: "Early Night",
    jati: "Audav - Audav (Pentatonic, 5 notes in ascent & descent)",
    vadi: "Gandhar (Ga) [386.3 cents]",
    samvadi: "Dhaivat (Dha) [884.4 cents]",
    aroha: "S R G P D S'",
    avaroha: "S' D P G R S",
    pakad: "S R G, P G, D P G, R S",
    rasa: "Shanta (Peace), Bhakti (Devotion), Vira",
    description: "A pentatonic masterpiece omitting Madhyam (Ma) and Nishad (Ni). Corresponds to Carnatic Mohanam and the universal major pentatonic scale. Requires immense vocal control on sustained Gandhar.",
    rules: [
      "Madhyam and Nishad are strictly varjit (forbidden).",
      "Gandhar (Ga) is the soul and resting pivot of the raga.",
      "Dhaivat is emphasized as the Samvadi swara.",
      "Avoid using Komal notes; all 5 notes are pure Shuddha."
    ],
    drills: [
      "Hold Shuddha Gandhar against drone for 12 seconds with zero tremor.",
      "Sing pentatonic cascade: S' D P G R S with fluid legato.",
      "Sing signature Pakad: S R G, P G, D P G, R S."
    ]
  },
  darbari: {
    name: "Raga Darbari Kanada (राग दरबारी कान्हड़ा)",
    hindiName: "दरबारी",
    thaat: "Asavari",
    prahar: "Late Night (Midnight, 11:00 PM – 2:00 AM)",
    time: "Midnight",
    jati: "Sampurna - Vakra",
    vadi: "Komal Rishabh (r) or Komal Dhaivat (d)",
    samvadi: "Pancham (Pa)",
    aroha: "S R g M P, d n S'",
    avaroha: "S' d n P, M P g, M r S",
    pakad: "R g, R S, d. n. P., M. P. S",
    rasa: "Gambhir (Grave Majesty), Karuna (Sublime Melancholy)",
    description: "Created by Miyan Tansen for Emperor Akbar's royal court (Darbar). Sung in the Mandra (lower) register with slow, heavy andolans on Komal Gandhar (ati-komal) and Komal Dhaivat.",
    rules: [
      "Sung predominantly in the Mandra (lower) and Madhya saptak.",
      "Komal Ga and Komal Dha are sung extremely low (Ati-Komal) with deep, slow microtonal oscillations.",
      "Requires heavy chest resonance and powerful breath control."
    ],
    drills: [
      "Practice Mandra Saptak resonance on '.d .n .P'.",
      "Hold Ati-Komal Ga with slow 1.5 Hz oscillatory sway.",
      "Sing Darbari phrase: 'S R g, R S' with continuous meend."
    ]
  },
  malkauns: {
    name: "Raga Malkauns (राग मालकौंस)",
    hindiName: "मालकौंस",
    thaat: "Bhairavi (traditionally derivative)",
    prahar: "3rd Prahar of Night (Midnight to 3:00 AM)",
    time: "Midnight",
    jati: "Audav - Audav (5 notes: S g M d n)",
    vadi: "Madhyam (Ma) [498.0 cents]",
    samvadi: "Shadja (Sa) [0.0 cents]",
    aroha: "S g M d n S'",
    avaroha: "S' n d M g M g S",
    pakad: "g M d M, g M g S",
    rasa: "Vira (Meditative Power), Gambhir (Spiritual Depth)",
    description: "One of the most ancient ragas in Indian musicology, said to have been sung by Lord Shiva. Completely omits Rishabh (Re) and Pancham (Pa). Features Komal Ga, Komal Dha, and Komal Ni with Shuddha Ma.",
    rules: [
      "Rishabh and Pancham are strictly varjit (omitted).",
      "Madhyam is the commanding Vadi swara; the phrase revolves around Ma.",
      "Movement between Komal Dha and Nishad is executed with profound meend."
    ],
    drills: [
      "Lock vocal pitch on Shuddha Madhyam (Ma) at exactly 498 cents.",
      "Glide between Komal Ga and Shuddha Ma: 'g -> M -> g -> S'.",
      "Sing Malkauns Pakad: 'g M d M, g M g S'."
    ]
  },
  bageshri: {
    name: "Raga Bageshri (राग बागेश्री)",
    hindiName: "बागेश्री",
    thaat: "Kafi",
    prahar: "Late Night (10:00 PM – 1:00 AM)",
    time: "Midnight",
    jati: "Audav - Sampurna (omits R and P in ascent)",
    vadi: "Madhyam (Ma)",
    samvadi: "Shadja (Sa)",
    aroha: "S g M D n S'",
    avaroha: "S' n D, M P D g, M g R S",
    pakad: "S n. D. S, M, D n D M, M g R S",
    rasa: "Shringar (Romantic Longing of Separation / Viraha)",
    description: "Depicts the emotion of a lover waiting in the quiet of midnight. Uses Komal Ga and Komal Ni. The ascent omits Re and Pa, while the descent incorporates all notes with characteristic phrasing.",
    rules: [
      "Pancham is weak (Alpatva) and hidden between Dha and Ga in descent: 'M P D g'.",
      "Madhyam is the Vadi note around which the romantic alap crystallizes."
    ],
    drills: [
      "Practice the glide '.D .n S, M' resolving into Madhyam.",
      "Execute the delicate Pancham touch: 'M P D g, M g R S'."
    ]
  },
  todi_miyan: {
    name: "Raga Miyan Ki Todi (राग मियाँ की तोड़ी)",
    hindiName: "तोड़ी",
    thaat: "Todi",
    prahar: "2nd Prahar of Day (8:00 AM – 11:00 AM)",
    time: "Late Morning",
    jati: "Sampurna - Sampurna",
    vadi: "Komal Dhaivat (d)",
    samvadi: "Komal Gandhar (g)",
    aroha: "S r g M' P d N S'",
    avaroha: "S' N d P M' g r S",
    pakad: "r g r S, M' d P, M' g, r g r S",
    rasa: "Karuna (Penitence, Yearning), Bhakti",
    description: "The monumental morning creation of Miyan Tansen. Uses Komal Re, Komal Ga, Tivra Ma, and Komal Dha. The microtones of Re and Ga are notoriously subtle and require deep vocal mastery.",
    rules: [
      "Komal Rishabh and Komal Gandhar are sung very close together (microtonal cluster).",
      "Tivra Madhyam is bright and acts as a bridge to Pancham or Dhaivat."
    ],
    drills: [
      "Intonate the microtonal difference between Komal Re and Komal Ga.",
      "Sing Todi signature: 'r g r S, .d .N S'."
    ]
  }
};

export const TALAS: Record<string, TalaDetails> = {
  teental: {
    name: "Teental (तीनताल / त्रिताल)",
    matras: 16,
    vibhags: "4 + 4 + 4 + 4",
    tali: "Matras 1, 5, 13 (Sam on 1)",
    khali: "Matra 9",
    theka: "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha",
    description: "The undisputed king of Hindustani rhythmic cycles. Highly symmetrical and versatile, used for Khayal, Tarana, instrumental Gat, and solo Tabla performances.",
    genres: ["Khayal", "Tarana", "Sitar/Sarod Gat", "Solo Tabla"]
  },
  jhaptal: {
    name: "Jhaptal (झपताल)",
    matras: 10,
    vibhags: "2 + 3 + 2 + 3",
    tali: "Matras 1, 3, 8",
    khali: "Matra 6",
    theka: "Dhi Na | Dhi Dhi Na | Ti Na | Dhi Dhi Na",
    description: "An asymmetrical 10-beat cycle with a stately, majestic gait. Ideal for Sadra, Vilambit and Drut Khayal bandishes.",
    genres: ["Khayal", "Sadra", "Instrumental Gat"]
  },
  rupak: {
    name: "Rupak (रूपक ताल)",
    matras: 7,
    vibhags: "3 + 2 + 2",
    tali: "Matras 4, 6",
    khali: "Matra 1 (Unique: Begins on Khali!)",
    theka: "Tin Tin Na | Dhi Na | Dhi Na",
    description: "Unique among Indian talas because its Sam (first beat) is a Khali (wave of the hand), creating an intriguing syncopated tension.",
    genres: ["Khayal", "Ghazal", "Bhajan", "Sitar"]
  },
  ektal: {
    name: "Ektal (एकताल)",
    matras: 12,
    vibhags: "2 + 2 + 2 + 2 + 2 + 2",
    tali: "Matras 1, 5, 9, 11",
    khali: "Matras 3, 7",
    theka: "Dhin Dhin | DhaGe Tirakita | Tu Na | Kat Ta | DhaGe Tirakita | Dhi Na",
    description: "The primary rhythmic cycle for Vilambit (slow) Bada Khayal singing, giving tremendous space for expansive melodic improvisation.",
    genres: ["Vilambit Khayal", "Drut Khayal", "Dhrupad"]
  },
  keherwa: {
    name: "Keherwa (कहरवा ताल)",
    matras: 8,
    vibhags: "4 + 4",
    tali: "Matra 1",
    khali: "Matra 5",
    theka: "Dha Ge Na Ti | Na Ka Dhi Na",
    description: "The pulse of semi-classical and folk music across North India. Dynamic, energetic, and rhythmically catchy.",
    genres: ["Thumri", "Dadra", "Ghazal", "Bhajan", "Folk"]
  },
  dadra: {
    name: "Dadra (दादरा ताल)",
    matras: 6,
    vibhags: "3 + 3",
    tali: "Matra 1",
    khali: "Matra 4",
    theka: "Dha Dhi Na | Dha Ti Na",
    description: "A lilting 6-beat waltz-like rhythm, characteristic of lighter classical forms and romantic semi-classical compositions.",
    genres: ["Dadra", "Thumri", "Ghazal", "Bhajan"]
  }
};

export const SHRUTIS_22 = [
  { index: 1, name: "Tivra", swara: "Sa", ratio: "1/1", cents: 0.0, rasa: "Shanta (Peace)" },
  { index: 2, name: "Kumudvati", swara: "Sa", ratio: "256/243", cents: 70.7, rasa: "Prashanta" },
  { index: 3, name: "Manda", swara: "Sa", ratio: "16/15", cents: 111.7, rasa: "Karuna" },
  { index: 4, name: "Chandovati", swara: "Sa", ratio: "10/9", cents: 182.4, rasa: "Dayardra" },
  { index: 5, name: "Dayavati", swara: "Re (Komal)", ratio: "9/8", cents: 203.9, rasa: "Veera" },
  { index: 6, name: "Ranjani", swara: "Re (Shuddha)", ratio: "32/27", cents: 294.1, rasa: "Ranjana" },
  { index: 7, name: "Raktika", swara: "Ga (Komal)", ratio: "6/5", cents: 315.6, rasa: "Ananda" },
  { index: 8, name: "Raudri", swara: "Ga (Sadharana)", ratio: "5/4", cents: 386.3, rasa: "Deepta" },
  { index: 9, name: "Krodha", swara: "Ga (Shuddha)", ratio: "81/64", cents: 407.8, rasa: "Gambhir" },
  { index: 10, name: "Vajrika", swara: "Ma (Shuddha)", ratio: "4/3", cents: 498.0, rasa: "Shanti" },
  { index: 11, name: "Prasarini", swara: "Ma (Tivra)", ratio: "27/20", cents: 519.5, rasa: "Utsaha" },
  { index: 12, name: "Priti", swara: "Ma (Tivratara)", ratio: "45/32", cents: 590.2, rasa: "Vismaya" },
  { index: 13, name: "Marjani", swara: "Ma (Tivratama)", ratio: "64/45", cents: 609.8, rasa: "Kautuka" },
  { index: 14, name: "Kshiti", swara: "Pa", ratio: "3/2", cents: 702.0, rasa: "Sthirata" },
  { index: 15, name: "Rakta", swara: "Pa", ratio: "128/81", cents: 772.6, rasa: "Bhakti" },
  { index: 16, name: "Sandipani", swara: "Dha (Komal)", ratio: "8/5", cents: 813.7, rasa: "Punya" },
  { index: 17, name: "Alapini", swara: "Dha (Shuddha)", ratio: "5/3", cents: 884.4, rasa: "Mangala" },
  { index: 18, name: "Madanti", swara: "Dha (Chatushruti)", ratio: "27/16", cents: 905.9, rasa: "Ullasa" },
  { index: 19, name: "Rohini", swara: "Ni (Komal)", ratio: "16/9", cents: 996.1, rasa: "Prema" },
  { index: 20, name: "Ramya", swara: "Ni (Kaishiki)", ratio: "9/5", cents: 1017.6, rasa: "Harsha" },
  { index: 21, name: "Ugra", swara: "Ni (Kakali / Shuddha)", ratio: "15/8", cents: 1088.3, rasa: "Samarpana" },
  { index: 22, name: "Kshobhini", swara: "Ni (Chyuta Sa)", ratio: "243/128", cents: 1109.8, rasa: "Moksha" },
];
