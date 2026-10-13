/* All site content lives here. Product ids and prices are what the backend
   charges for, so change them only together with backend/src/services/productStore.js. */

export const CONTACT_EMAIL = "hello@boombapbombay.com"; // TODO: confirm the real inbox

export const LINKS = [
  // TODO: real profile URLs
  { label: "SPOTIFY", href: "#" },
  { label: "APPLE MUSIC", href: "#" },
  { label: "BEATSTARS", href: "#" },
  { label: "YOUTUBE", href: "#" },
  { label: "INSTAGRAM", href: "#" },
];

const cover = (name) => ({
  src: `/img/covers/${name}-800.webp`,
  srcSmall: `/img/covers/${name}-400.webp`,
});

export const RECORDS = [
  {
    title: "GUNS CARS AND BARS",
    display: "GUNS, CARS<br>AND BARS",
    format: "BEAT TAPE",
    year: "2026",
    tracks: 7,
    bpm: "94 BPM",
    key: "Em",
    description:
      "KSHAH's debut beat tape. Seven tracks of boom bap grit soundtracking Bombay's back alleys, one loop at a time.",
    art: cover("madvillainy"), // TODO: placeholder — Madvillainy (Madvillain, 2004)
    preview: "/assets/previews/beat1.mp3",
    product: { id: "album_guns_cars_and_bars", type: "album", priceInr: 1499, currency: "INR" },
  },
  {
    title: "SECOND DROP",
    display: "SECOND<br>DROP",
    format: "RECORD",
    year: "2026",
    bpm: "88 BPM",
    key: "Dm",
    description: "The follow-up cut. Darker keys, heavier low end, same unapologetic boom bap DNA.",
    art: cover("music-art2"),
    preview: "/assets/previews/beat2.mp3",
    product: { id: "album_second_drop", type: "album", priceInr: 1499, currency: "INR" },
  },
  {
    title: "THIRD CUT",
    display: "THIRD<br>CUT",
    format: "RECORD",
    year: "2026",
    bpm: "140 BPM",
    key: "C#m",
    description: "A frantic, high-BPM detour from the usual pocket. Proof KSHAH doesn't stay in one lane.",
    art: cover("music-art3"),
    preview: "/assets/previews/beat3.mp3",
    product: { id: "album_third_cut", type: "album", priceInr: 5, currency: "INR" },
  },
  {
    title: "FOURTH CUT",
    display: "FOURTH<br>CUT",
    format: "RECORD",
    year: "2026",
    bpm: "102 BPM",
    key: "Fm",
    description: "Short, sharp and straight to the point. No hook, no filler, just the loop.",
    art: cover("music-art4"),
    preview: "/assets/previews/beat4.mp3",
    product: { id: "album_fourth_cut", type: "album", priceInr: 1499, currency: "INR" },
  },
];

export const BEATS = [
  {
    title: "GUNS",
    bpm: "94",
    key: "Em",
    duration: "02:42",
    booked: "02.03.26",
    charge: "A snare like a cocked hammer and a bassline that won't let up.",
    art: cover("album-art1"),
    preview: "/assets/previews/beat1.mp3",
    product: { id: "beat_guns", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "DRUGS",
    bpm: "88",
    key: "Dm",
    duration: "03:05",
    booked: "03.03.26",
    charge: "Smoky, dust-caked keys over a slow nodding groove.",
    art: cover("album-art2"),
    preview: "/assets/previews/beat2.mp3",
    product: { id: "beat_drugs", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "PILLS",
    bpm: "140",
    key: "C#m",
    duration: "02:23",
    booked: "04.03.26",
    charge: "Frantic hats and a pitched-up vocal chop running on no sleep.",
    art: cover("album-art3"),
    preview: "/assets/previews/beat3.mp3",
    product: { id: "beat_pills", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "CARS",
    bpm: "102",
    key: "Fm",
    duration: "02:58",
    booked: "05.03.26",
    charge: "Cinematic strings over a rolling 808. Bombay, 3am, windows down.",
    art: cover("album-art4"),
    preview: "/assets/previews/beat4.mp3",
    product: { id: "beat_cars", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "SMOKES",
    bpm: "96",
    key: "Am",
    duration: "03:11",
    booked: "06.03.26",
    charge: "A hazy loop wrapped in vinyl crackle, low and unbothered.",
    art: cover("album-art5"),
    preview: "/assets/previews/beat5.mp3",
    product: { id: "beat_smokes", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "STACKS",
    bpm: "110",
    key: "Gm",
    duration: "02:49",
    booked: "07.03.26",
    charge: "Hard drums and a brass stab like counting money in a back room.",
    art: cover("album-art6"),
    preview: "/assets/previews/beat6.mp3",
    product: { id: "beat_stacks", type: "beat", priceInr: 5, currency: "INR" },
  },
  {
    title: "GREENS",
    bpm: "92",
    key: "Bm",
    duration: "03:21",
    booked: "08.03.26",
    charge: "A laid-back guitar loop and dusty breaks. Slow burn, heavy pocket.",
    art: cover("album-art7"),
    preview: "/assets/previews/beat7.mp3",
    product: { id: "beat_greens", type: "beat", priceInr: 5, currency: "INR" },
  },
];

export const EXHIBITS = [
  { tag: "B", name: "ARTURIA MINILAB MKII", role: "Keys, bass lines, the melody you hum later.", img: "/img/gear/minilab.webp" },
  { tag: "C", name: "FL STUDIO", role: "Where the loops become a record.", img: "/img/gear/fl-studio.webp" },
  { tag: "D", name: "WAVES", role: "The mix, the grit, the dirt on the drums.", img: "/img/gear/waves.webp" },
];

export const REELS = [
  { id: "home", label: "OPENING" },
  { id: "records", label: "THE RECORDS" },
  { id: "lineup", label: "BEAT LINE-UP" },
  { id: "arsenal", label: "THE ARSENAL" },
  { id: "city", label: "THE CITY" },
  { id: "end", label: "THE END" },
];
