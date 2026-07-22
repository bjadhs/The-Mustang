/**
 * The complete Mustang menu as structured data, the single source of truth for
 * the /menu page and the Menu JSON-LD. MENU_CATEGORIES in site.ts is the teaser
 * derived from this fuller set.
 *
 * Prices are in AUD, formatted like the existing site.ts dishes ("$16.50").
 * Image filenames are kebab-case and match the names in PROMPT.md so the
 * DishImage convention (public/assets/food/<name>) picks them up, falling back
 * to a styled tile when a file is missing.
 *
 * Dietary and spice values are a reasonable house reading of common Nepalese
 * preparations; confirm allergen and vegan claims with the kitchen before
 * publishing them as guarantees.
 */

/** Dietary markers shown as chips. V vegetarian, VG vegan, GF gluten free. */
export type Dietary = "V" | "VG" | "GF" | "nuts";

/** 0 no heat, 1 mild, 2 medium, 3 hot. Rendered as chili glyphs. */
export type Spice = 0 | 1 | 2 | 3;

export type MenuCategoryId =
  | "momo"
  | "entrees"
  | "curries"
  | "sides"
  | "desserts"
  | "bar";

export interface MenuItem {
  name: string;
  price: string;
  desc: string;
  category: MenuCategoryId;
  dietary: Dietary[];
  spice: Spice;
  /** filename in public/assets/food/, optional. Falls back to a styled tile. */
  image?: string;
}

export interface MenuCategoryMeta {
  id: MenuCategoryId;
  name: string;
  note: string;
}

/** Categories in display order for the menu rail. */
export const MENU_CATEGORY_META: MenuCategoryMeta[] = [
  { id: "momo", name: "Mo:Mo", note: "Hand pleated, steamed to order" },
  { id: "entrees", name: "Entrees", note: "From the tandoor and the wok" },
  { id: "curries", name: "Curries and mains", note: "Himalayan spice, slow cooked" },
  { id: "sides", name: "Rice, bread and sides", note: "The supporting cast" },
  { id: "desserts", name: "Desserts", note: "A sweet Himalayan finish" },
  { id: "bar", name: "From the bar", note: "Mountain inspired drinks" },
];

export const MENU_ITEMS: MenuItem[] = [
  // ---------- Mo:Mo ----------
  {
    name: "Steamed Mo:Mo",
    price: "$16.50",
    desc: "Steamed dumplings filled with chicken or vegetable mince, onion, coriander, ginger, garlic and our secret spices, served with traditional tomato achar.",
    category: "momo",
    dietary: ["V"],
    spice: 1,
    image: "momo.png",
  },
  {
    name: "Fried Mo:Mo",
    price: "$17.50",
    desc: "Pan fried dumplings with blistered crisp bottoms and soft pleated crowns, scattered with sesame and served with fiery tomato achar.",
    category: "momo",
    dietary: ["V"],
    spice: 1,
    image: "fried-momo.png",
  },
  {
    name: "Jhol Mo:Mo",
    price: "$18.50",
    desc: "Steamed dumplings bathed in a warm, tangy sesame and tomato jhol broth, finished with chilli oil and toasted sesame.",
    category: "momo",
    dietary: ["V"],
    spice: 2,
    image: "jhol-momo.png",
  },
  {
    name: "Chilli Mo:Mo",
    price: "$18.50",
    desc: "Fried dumplings tossed glossy in a sticky chilli sauce with charred onion and capsicum, spring onion and toasted sesame.",
    category: "momo",
    dietary: ["V"],
    spice: 3,
    image: "chilli-momo.png",
  },
  {
    name: "Mo:Mo Platter for 2",
    price: "$32.00",
    desc: "Two zones of dumplings, steamed and fried, with tomato achar and sesame jhol for the table.",
    category: "momo",
    dietary: ["V"],
    spice: 1,
    image: "momo-platter.png",
  },
  {
    name: "Mo:Mo Platter for 4",
    price: "$58.00",
    desc: "A generous sharing tray, steamed, fried and chilli tossed, with three dipping sauces. Built for a group.",
    category: "momo",
    dietary: ["V"],
    spice: 2,
    image: "momo-platter.png",
  },

  // ---------- Entrees ----------
  {
    name: "Chicken Choila",
    price: "$16.50",
    desc: "Newari style smoky charred chicken tossed with raw onion, garlic, ginger, green chilli and coriander, glistening with mustard oil, served with beaten rice.",
    category: "entrees",
    dietary: ["GF"],
    spice: 2,
    image: "chicken-choila.png",
  },
  {
    name: "Himalayan Lamb Kebab",
    price: "$18.50",
    desc: "Char marked lamb seekh kebabs dusted with chaat masala, with lemon and a pot of mint yoghurt.",
    category: "entrees",
    dietary: ["GF"],
    spice: 2,
    image: "lamb-kebab.png",
  },
  {
    name: "Prawn Chilli",
    price: "$19.50",
    desc: "Crispy battered king prawns wok tossed in a glossy chilli garlic sauce with onion and capsicum, spring onion and sesame.",
    category: "entrees",
    dietary: [],
    spice: 3,
    image: "prawn-chilli.png",
  },
  {
    name: "Masala Makai",
    price: "$12.50",
    desc: "Charred golden corn tossed with butter, cumin, chilli and lime, heaped in a cast iron skillet with coriander.",
    category: "entrees",
    dietary: ["V", "GF"],
    spice: 1,
    image: "masala-makai.png",
  },
  {
    name: "Chatpate",
    price: "$11.50",
    desc: "Nepalese street style puffed rice tossed with tomato, red onion, potato, green chilli, peanuts and tangy spice.",
    category: "entrees",
    dietary: ["VG", "nuts"],
    spice: 2,
    image: "chatpate.png",
  },
  {
    name: "Nepali Pakauda",
    price: "$12.50",
    desc: "Golden onion and spinach fritters with craggy crisp edges, served with tomato chutney.",
    category: "entrees",
    dietary: ["VG"],
    spice: 1,
    image: "nepali-pakauda.png",
  },

  // ---------- Curries and mains ----------
  {
    name: "Mustang Tikka",
    price: "$17.50",
    desc: "Boneless chicken thigh marinated in Himalayan spices and cooked in the tandoori oven until charred and juicy.",
    category: "curries",
    dietary: ["GF"],
    spice: 2,
    image: "mustang-tikka.png",
  },
  {
    name: "Lamb Rogan Josh",
    price: "$25.00",
    desc: "Tender lamb in a deep crimson slow cooked sauce with a slick of red oil, ginger julienne and coriander.",
    category: "curries",
    dietary: ["GF"],
    spice: 2,
    image: "lamb-rogan-josh.png",
  },
  {
    name: "Goat Curry",
    price: "$26.00",
    desc: "Goat on the bone in a rich brown gravy with whole spices, the way it is cooked at home in the hills.",
    category: "curries",
    dietary: ["GF"],
    spice: 2,
    image: "goat-curry.png",
  },
  {
    name: "Mustang Chicken Masala",
    price: "$24.00",
    desc: "Our signature: tandoori chicken in a spiced caramelised onion masala, deep amber red, finished with cream and kasuri methi.",
    category: "curries",
    dietary: ["GF"],
    spice: 2,
    image: "mustang-chicken-masala.png",
  },
  {
    name: "Butter Chicken",
    price: "$24.00",
    desc: "Tandoori chicken thigh simmered in a rich, creamy and buttery north Indian sauce.",
    category: "curries",
    dietary: ["GF"],
    spice: 1,
    image: "butter-chicken.png",
  },
  {
    name: "Palak Paneer",
    price: "$22.00",
    desc: "Seared paneer in a vivid deep green spinach puree with a swirl of cream and tempered cumin.",
    category: "curries",
    dietary: ["V", "GF"],
    spice: 1,
    image: "palak-paneer.png",
  },
  {
    name: "Eggplant Masala",
    price: "$22.99",
    desc: "Marinated cubes of fresh eggplant cooked with green peas in a caramelised, aromatic onion sauce.",
    category: "curries",
    dietary: ["VG", "GF"],
    spice: 1,
    image: "eggplant-masala.png",
  },
  {
    name: "Himalayan Biryani",
    price: "$23.50",
    desc: "Saffron streaked basmati layered with your choice of chicken or vegetables, fried onion and mint, served with raita.",
    category: "curries",
    dietary: ["V"],
    spice: 2,
    image: "biryani.png",
  },
  {
    name: "Coconut Fish Curry",
    price: "$25.50",
    desc: "Firm white fish in a turmeric gold coconut sauce with curry leaves and mustard seeds, a lime wedge on the rim.",
    category: "curries",
    dietary: ["GF"],
    spice: 2,
    image: "coconut-fish-curry.png",
  },
  {
    name: "Mustang Thali Set",
    price: "$31.50",
    desc: "A typical Nepalese dinner: rice, daal, aloo bodi tama, a curry of your choice, tomato pickle, sauteed spinach, a papad and gulab jamun.",
    category: "curries",
    dietary: ["V"],
    spice: 2,
    image: "thali.png",
  },

  // ---------- Rice, bread and sides ----------
  {
    name: "Pulao Rice",
    price: "$8.50",
    desc: "Fragrant basmati studded with green peas, cashews, fried onion and whole cardamom.",
    category: "sides",
    dietary: ["V", "GF", "nuts"],
    spice: 0,
    image: "pulao-rice.png",
  },
  {
    name: "Garlic Naan",
    price: "$5.50",
    desc: "Blistered naan brushed with garlic butter and finished with chopped garlic and coriander.",
    category: "sides",
    dietary: ["V"],
    spice: 0,
    image: "garlic-naan.png",
  },
  {
    name: "Cheese Naan",
    price: "$6.50",
    desc: "Naan filled with molten cheese, golden and blistered, brushed with butter and nigella seeds.",
    category: "sides",
    dietary: ["V"],
    spice: 0,
    image: "cheese-naan.png",
  },
  {
    name: "Roti",
    price: "$4.50",
    desc: "Whole wheat tandoori roti with charred leopard spots, served with a little ghee.",
    category: "sides",
    dietary: ["VG"],
    spice: 0,
    image: "roti.png",
  },
  {
    name: "Papad",
    price: "$4.00",
    desc: "Crisp golden lentil papads with chaat masala and a little tomato pickle.",
    category: "sides",
    dietary: ["VG", "GF"],
    spice: 1,
    image: "papad.png",
  },
  {
    name: "Cucumber Raita",
    price: "$5.00",
    desc: "Cooling yoghurt swirled with grated cucumber and carrot, tempered mustard seeds and roasted cumin.",
    category: "sides",
    dietary: ["V", "GF"],
    spice: 0,
    image: "raita.png",
  },

  // ---------- Desserts ----------
  {
    name: "Kheer",
    price: "$9.50",
    desc: "Creamy reduced milk rice pudding topped with slivered pistachio, almond, golden raisins and saffron.",
    category: "desserts",
    dietary: ["V", "GF", "nuts"],
    spice: 0,
    image: "kheer.png",
  },
  {
    name: "Gulab Jamun",
    price: "$8.50",
    desc: "Warm milk dumplings glistening in rose scented syrup, crushed pistachio on top.",
    category: "desserts",
    dietary: ["V", "nuts"],
    spice: 0,
    image: "gulab-jamun.png",
  },
  {
    name: "Mango Kulfi",
    price: "$9.50",
    desc: "Dense golden mango kulfi with saffron threads, crushed pistachio and dried rose petals.",
    category: "desserts",
    dietary: ["V", "GF", "nuts"],
    spice: 0,
    image: "mango-kulfi.png",
  },
  {
    name: "Pistachio Ice Cream",
    price: "$7.50",
    desc: "Two scoops of pistachio ice cream with a wafer shard and crushed pistachio.",
    category: "desserts",
    dietary: ["V", "GF", "nuts"],
    spice: 0,
    image: "pistachio-ice-cream.png",
  },

  // ---------- From the bar ----------
  {
    name: "Mustang Lager",
    price: "$10.00",
    desc: "A tall glass of golden lager with a dense head, our house pour to sit alongside the food.",
    category: "bar",
    dietary: ["VG"],
    spice: 0,
    image: "mustang-lager.png",
  },
  {
    name: "Himalayan Cocktail",
    price: "$18.00",
    desc: "A smoked mountain cocktail over one large clear cube, chilli threaded on a pick, smoked salt on the rim. The list changes with the kitchen.",
    category: "bar",
    dietary: ["VG"],
    spice: 1,
    image: "himalayan-cocktail.png",
  },
  {
    name: "House Wine",
    price: "$11.00",
    desc: "A short, well chosen list of red, white and sparkling by the glass or bottle.",
    category: "bar",
    dietary: ["VG"],
    spice: 0,
  },
  {
    name: "Spirits",
    price: "from $10.00",
    desc: "Whisky, gin, rum and vodka, neat or with a mixer, plus a rotating chilli washed pour.",
    category: "bar",
    dietary: ["VG"],
    spice: 0,
  },
  {
    name: "Masala Chai",
    price: "$5.00",
    desc: "Spiced Nepalese milk tea brewed with cardamom, ginger and cinnamon. A gentle way to finish.",
    category: "bar",
    dietary: ["V"],
    spice: 0,
  },
  {
    name: "Soft Drinks and Lassi",
    price: "from $5.00",
    desc: "Sweet or salted lassi, mango lassi, and the usual soft drinks and sparkling water.",
    category: "bar",
    dietary: ["V", "GF"],
    spice: 0,
  },
];

/** Items grouped by category, in the display order of MENU_CATEGORY_META. */
export function menuByCategory(): { meta: MenuCategoryMeta; items: MenuItem[] }[] {
  return MENU_CATEGORY_META.map((meta) => ({
    meta,
    items: MENU_ITEMS.filter((item) => item.category === meta.id),
  }));
}
