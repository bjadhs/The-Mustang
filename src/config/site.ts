/**
 * Single source of truth for the experience.
 * The macro film was generated with Higgsfield (Veo 3.1 Lite, image-to-video
 * from a Nano Banana Pro macro still) as one continuous extreme-macro journey.
 *
 * VIDEO_SOURCES is tried in order: a local copy first (run `npm run fetch:video`
 * to pull it into public/assets/), then the hosted render.
 */

export const VIDEO_FILENAME = "mustang.mp4";

/**
 * Hero scroll-scrub video: the table + Mustang beer journey (Higgsfield veo3).
 * Local copy first (npm run fetch:assets), hosted render as the fallback so it
 * streams in the browser even before the local file is downloaded.
 */
export const VIDEO_SOURCES: string[] = [
  "/assets/mustang.mp4",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3GMIfznJcTcgt384macCyiYCf6Z/hf_20260722_114954_1d1b474d-bb43-4029-a9b8-803f59d6c041.mp4",
];

export const POSTER_SOURCES: string[] = [
  "/assets/food/table-hero.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3GMIfznJcTcgt384macCyiYCf6Z/hf_20260722_102010_8df7415b-ea14-4dec-9acd-87546a73cdc1.png",
];

export const SITE = {
  brand: "The Mustang",
  place: "Farrer, Canberra",
  address: "4 Farrer Place, Farrer ACT 2607",
  phone: "(02) 6286 8088",
  phoneHref: "tel:+61262868088",
  phoneAlt: "+61 416 471 724",
  phoneAltHref: "tel:+61416471724",
  email: "eatthemustangcanberra@gmail.com",
  hours: "Open 7 nights, 5:00pm to 9:30pm",
  hoursShort: "Mon to Sun, 5:00pm to 9:30pm",
  menuUrl: "https://themustangcanberra.com.au/menu/",
  reserveUrl: "https://themustangcanberra.com.au/contact-us/",
  orderUrl: "https://themustangcanberra.com.au/",
  mapUrl: "https://maps.google.com/?q=4+Farrer+Place+Farrer+ACT+2607",
  tagline: "A Journey Through Nepalese Taste and Spirit",
} as const;

/**
 * Approximate geo coordinates for Farrer ACT 2607, used only for the
 * Restaurant JSON-LD `geo` block. These are a suburb-level approximation, not a
 * surveyed pin for 4 Farrer Place; refine against Google Business Profile
 * before relying on them for maps.
 */
export const GEO = {
  lat: -35.3766,
  lng: 149.0985,
  approximate: true,
} as const;

/**
 * Optional announcement bar copy shown above the nav (e.g. a holiday closure
 * or an event night). Empty string means no bar renders. Keep it short and
 * free of em/en dashes per the house style.
 */
export const ANNOUNCEMENT = "";

export interface Review {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Human relative date, matching Google's "a week ago" style. */
  date: string;
  quote: string;
}

/**
 * PLACEHOLDER reviews. These are NOT real Google reviews and carry no real
 * rating. They exist purely as a graceful fallback so the reviews section
 * never renders empty before the Google Places integration (PLAN Phase 6)
 * supplies live data. Do NOT feed these into AggregateRating JSON-LD, and do
 * not present them as genuine customer ratings. Replace with real quotes the
 * owner has approved, or let the live API override them.
 */
export const REVIEWS: Review[] = [
  {
    author: "Sample Reviewer A",
    rating: 5,
    date: "a week ago",
    quote: "The jhol momo is the best I have had in Canberra. Warm room, generous spice, we will be back.",
  },
  {
    author: "Sample Reviewer B",
    rating: 5,
    date: "two weeks ago",
    quote: "Proper Nepalese cooking in Farrer. The thali set is a feast and the staff made us feel at home.",
  },
  {
    author: "Sample Reviewer C",
    rating: 4,
    date: "a month ago",
    quote: "Lovely food and a great little bar. Book ahead on weekends, it fills up fast for good reason.",
  },
  {
    author: "Sample Reviewer D",
    rating: 5,
    date: "a month ago",
    quote: "Butter chicken and garlic naan done right, and the cocktails are a genuine surprise. A local gem.",
  },
  {
    author: "Sample Reviewer E",
    rating: 5,
    date: "two months ago",
    quote: "Took the family for a birthday and they looked after us beautifully. Authentic, friendly and worth the drive.",
  },
];

/**
 * Reservation feature video. Drop the BytePlus table + Mustang beer clip here
 * as public/assets/mustang-table.mp4 and it plays as a muted loop in the
 * Reserve section. Until then it falls back to the poster still below.
 */
export const TABLE_VIDEO_SRC = "/assets/mustang.mp4";
export const TABLE_POSTER_SRC = "/assets/food/table-hero.png";

/** Brand story, verbatim spirit from the live site's Home + About copy. */
export const STORY = {
  eyebrow: "A taste of Nepal, a place to belong",
  lead: "Step into a world where the Himalayas meet your plate.",
  body: "At The Mustang, every dish carries the warmth, spice and soul of Nepal, crafted with a modern touch. From timeless recipes passed down through generations to inventive cocktails inspired by the mountains, we offer more than meals. Each bite tells a story, every drink sparks a memory, and every visit invites you to savour the richness of Nepalese culture.",
} as const;

export interface Dish {
  name: string;
  price: string;
  desc: string;
  tags: string[];
  /** filename in public/assets/food/, optional. Falls back to a text card. */
  image?: string;
}

/** Signature dishes, real names, prices and descriptions from the menu. */
export const SIGNATURE_DISHES: Dish[] = [
  {
    name: "Mo:Mo",
    price: "$16.50",
    desc: "Steamed dumplings filled with chicken or vegetable mince, onion, coriander, ginger, garlic and our secret spices, served with traditional sauce.",
    tags: ["Chicken or Veg", "Steamed"],
    image: "momo.png",
  },
  {
    name: "Jhol Mo:Mo",
    price: "$18.50",
    desc: "Steamed dumplings bathed in a warm, tangy sesame and tomato jhol broth, finished with chilli oil and toasted sesame.",
    tags: ["Signature", "Soup style"],
    image: "jhol-momo.png",
  },
  {
    name: "Mustang Tikka",
    price: "$17.50",
    desc: "Boneless chicken thigh fillets marinated in Himalayan spices and cooked in the tandoori oven until charred and juicy.",
    tags: ["GF", "Tandoor"],
    image: "mustang-tikka.png",
  },
  {
    name: "Mustang Thali Set",
    price: "$31.50",
    desc: "A typical Nepalese dinner: rice, daal, aloo bodi tama, a curry of your choice, tomato pickle, sauteed spinach, a papad and gulab jamun.",
    tags: ["Veg option", "Complete meal"],
    image: "thali.png",
  },
  {
    name: "Butter Chicken",
    price: "$24.00",
    desc: "Tandoori chicken thigh pieces simmered in a rich, creamy and buttery north Indian sauce.",
    tags: ["GF"],
    image: "butter-chicken.png",
  },
  {
    name: "Eggplant Masala",
    price: "$22.99",
    desc: "Marinated cubes of fresh eggplant cooked with green peas in a caramelised, aromatic onion sauce.",
    tags: ["V", "GF"],
    image: "eggplant-masala.png",
  },
];

export interface MenuCategory {
  name: string;
  note: string;
  items: string[];
}

/** A verbatim taste of the full menu, for the overview section. */
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    name: "Mo:Mo",
    note: "Six ways with dumplings",
    items: ["Steamed", "Fried", "Jhol", "Chilli", "Platter for 2", "Platter for 4"],
  },
  {
    name: "Entrees",
    note: "From the tandoor and the wok",
    items: ["Chicken Choila", "Himalayan Lamb Kebab", "Prawn Chilli", "Masala Makai", "Chatpate", "Nepali Pakauda"],
  },
  {
    name: "Curries and mains",
    note: "Himalayan spice, slow cooked",
    items: ["Lamb Rogan Josh", "Goat Curry", "Mustang Chicken Masala", "Palak Paneer", "Biryani", "Coconut Fish Curry"],
  },
  {
    name: "Rice, bread and sides",
    note: "The supporting cast",
    items: ["Pulao Rice", "Garlic Naan", "Cheese Naan", "Roti", "Papad", "Raita"],
  },
  {
    name: "Desserts",
    note: "A sweet Himalayan finish",
    items: ["Kheer", "Gulab Jamun", "Mango Kulfi", "Pistachio Ice-Cream"],
  },
  {
    name: "From the bar",
    note: "Mountain-inspired drinks",
    items: ["Mustang Lager", "Himalayan cocktails", "Wine", "Spirits"],
  },
];

export interface Service {
  title: string;
  desc: string;
}

export const SERVICES: Service[] = [
  {
    title: "Authentic Nepalese dining",
    desc: "Traditional Himalayan recipes and a warm room built for lingering over dinner.",
  },
  {
    title: "Signature bar and cocktails",
    desc: "Mountain-inspired cocktails and Mustang lager, built to follow the food.",
  },
  {
    title: "Private events and celebrations",
    desc: "Birthdays, gatherings and cultural nights, hosted with genuine Nepalese warmth.",
  },
  {
    title: "Takeaway and delivery",
    desc: "The whole menu, packed to travel. Order online for pickup or delivery.",
  },
  {
    title: "Catering",
    desc: "Feeding a crowd off site, with banquet menus starting at $20 per plate.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

/** Real questions from the About page, answered from the menu and site. */
export const FAQS: Faq[] = [
  {
    q: "Do you have vegetarian and vegan options?",
    a: "Yes. Plenty of the menu is vegetarian, from veg mo:mo and palak paneer to eggplant masala and vegetable tarkari, with many dishes marked vegan and gluten free.",
  },
  {
    q: "Do you serve alcohol at the bar?",
    a: "We do. The bar pours Mustang lager, Himalayan-inspired cocktails, wine and spirits, all chosen to sit alongside the food.",
  },
  {
    q: "Are your dishes authentic Nepalese cuisine?",
    a: "They are. We cook traditional recipes passed down through generations, using imported Himalayan spices and a tandoor, with a modern touch.",
  },
  {
    q: "Can I customise my order?",
    a: "Of course. Tell us your spice level and dietary needs and the kitchen will adjust. Many curries come with a choice of chicken, lamb, goat, beef or veg.",
  },
];

export interface Chapter {
  id: string;
  station: string;
  /** progress range of the film mapped to this chapter, 0..1 */
  from: number;
  to: number;
  heading: string;
  body: string;
  tags: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "steam",
    station: "01 Steam",
    from: 0.0,
    to: 0.16,
    heading: "The Himalayas, on your plate",
    body: "One momo, magnified. The Mustang is a Nepalese restaurant and bar in Farrer, and this is the journey every plate makes before it finds your table.",
    tags: [],
  },
  {
    id: "dough",
    station: "02 Dough",
    from: 0.16,
    to: 0.38,
    heading: "Folded by hand, every afternoon",
    body: "The dough is rolled thin enough to read through, then pinched into pleats before the first guests arrive. Steamed to order in bamboo, never held under a lamp.",
    tags: ["Hand pleated", "Steamed in bamboo"],
  },
  {
    id: "spice",
    station: "03 Spice",
    from: 0.38,
    to: 0.62,
    heading: "Timmur does the talking",
    body: "Sichuan pepper's Himalayan cousin tingles first, then warms. Our jhol achar balances timmur, toasted sesame and chilli into a broth you will want to drink.",
    tags: ["Timmur", "Toasted sesame", "Chilli oil"],
  },
  {
    id: "fire",
    station: "04 Fire",
    from: 0.62,
    to: 0.84,
    heading: "The bar leans in",
    body: "Himalayan spiced cocktails built to follow the food: chilli washed spirits, smoked salt, and a short list that changes with the kitchen.",
    tags: ["Signature cocktails"],
  },
  {
    id: "table",
    station: "05 Table",
    from: 0.84,
    to: 1.0,
    heading: "The table is set",
    body: "Seven nights a week in Farrer. Bring people you like to feed.",
    tags: [],
  },
];

/** Total scroll length of the experience, in viewport heights. */
export const EXPERIENCE_VH = 520;
