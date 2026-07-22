import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  stepCountIs,
  tool,
  type UIMessage,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { SITE, FAQS, SERVICES } from "@/config/site";
import {
  MENU_ITEMS,
  MENU_CATEGORY_META,
  menuByCategory,
  type MenuItem,
  type MenuCategoryId,
} from "@/config/menu";

/*
 * The Mustang AI concierge.
 *
 * A warm, concise assistant that answers questions about The Mustang using
 * ONLY the structured content in src/config. It can look up the live menu
 * (getMenu) and deep-link a guest into the reservation form (startReservation).
 *
 * Requires the OPENROUTER_API_KEY environment variable at request time. The
 * model is only called when a request arrives, so the route type-checks and
 * builds without the key present.
 */

export const runtime = "nodejs";

/* ------------------------------------------------------------------ *
 * System prompt, assembled once at module load from the config files. *
 * ------------------------------------------------------------------ */

const DIET_LABEL: Record<string, string> = {
  V: "vegetarian",
  VG: "vegan",
  GF: "gluten free",
  nuts: "contains nuts",
};

function describeItem(item: MenuItem): string {
  const tags = item.dietary.length
    ? ` [${item.dietary.map((d) => DIET_LABEL[d] ?? d).join(", ")}]`
    : "";
  const spice = item.spice > 0 ? ` (spice ${item.spice}/3)` : "";
  return `- ${item.name}, ${item.price}${tags}${spice}: ${item.desc}`;
}

const MENU_TEXT = menuByCategory()
  .map(
    ({ meta, items }) =>
      `${meta.name} (${meta.note}):\n${items.map(describeItem).join("\n")}`,
  )
  .join("\n\n");

const FAQ_TEXT = FAQS.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

const SERVICES_TEXT = SERVICES.map((s) => `- ${s.title}: ${s.desc}`).join("\n");

const SYSTEM_PROMPT = `You are the Mustang concierge, the friendly digital host for The Mustang, a Nepalese restaurant and bar in ${SITE.place}.

Your job is to help guests with hours, location, the menu, dietary options, catering, and booking a table. Be warm, welcoming and concise. Keep answers short, a couple of sentences unless the guest asks for detail. Never use em dashes or en dashes; use commas or shorter sentences.

## The essentials
- Name: ${SITE.brand}, a Nepalese restaurant and bar.
- Address: ${SITE.address}. Map: ${SITE.mapUrl}
- Hours: ${SITE.hours}.
- Phone: ${SITE.phone} (also ${SITE.phoneAlt}).
- Email: ${SITE.email}
- Tagline: ${SITE.tagline}

## Services
${SERVICES_TEXT}

## Catering
We cater off site with banquet menus starting at $20 per plate. For a catering quote, take the guest's rough numbers and date and point them to the phone or email above so the team can tailor it.

## Full menu (prices in AUD)
${MENU_TEXT}

## Frequently asked
${FAQ_TEXT}

## Rules
- Answer ONLY questions about The Mustang. If asked anything unrelated, gently steer back to the restaurant.
- Quote real prices and dietary tags straight from the menu above. Never invent a dish, a price or a claim. If you are unsure, say so and suggest calling.
- You cannot take payment, hold a card, or guarantee a specific table. Never promise availability.
- For same day or urgent bookings, or large groups, direct the guest to call ${SITE.phone}.
- When a guest wants to book a table, call the startReservation tool to open the reservation form, then tell them you have opened it and they can confirm the details there.
- Use the getMenu tool when a guest asks what is available in a category or for a dietary need, so you always quote the current menu.
- Dietary codes: V vegetarian, VG vegan, GF gluten free, nuts contains nuts.`;

/* --------------------------- Tools --------------------------- */

const CATEGORY_IDS = MENU_CATEGORY_META.map((c) => c.id);

/** Loose diet term to menu code. */
function normalizeDiet(diet: string): string | null {
  const d = diet.trim().toLowerCase();
  if (["vg", "vegan"].includes(d)) return "VG";
  if (["v", "veg", "vegetarian"].includes(d)) return "V";
  if (["gf", "gluten free", "gluten-free", "glutenfree"].includes(d)) return "GF";
  if (["nut", "nuts"].includes(d)) return "nuts";
  return null;
}

/** Loose category term to a category id. */
function normalizeCategory(category: string): MenuCategoryId | null {
  const c = category.trim().toLowerCase();
  const direct = CATEGORY_IDS.find((id) => id === c);
  if (direct) return direct;
  if (/(momo|mo:mo|dumpling)/.test(c)) return "momo";
  if (/(entree|starter|appetiser|appetizer)/.test(c)) return "entrees";
  if (/(curry|curries|main)/.test(c)) return "curries";
  if (/(rice|bread|naan|side)/.test(c)) return "sides";
  if (/(dessert|sweet)/.test(c)) return "desserts";
  if (/(bar|drink|cocktail|beer|wine|beverage)/.test(c)) return "bar";
  return null;
}

const getMenu = tool({
  description:
    "Look up dishes and drinks from The Mustang menu, optionally filtered by category (momo, entrees, curries, sides, desserts, bar) and/or dietary need (V vegetarian, VG vegan, GF gluten free). Use this to quote real prices and options.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe("Menu category, e.g. momo, entrees, curries, sides, desserts, bar."),
    diet: z
      .string()
      .optional()
      .describe("Dietary need, e.g. vegan, vegetarian, gluten free."),
  }),
  execute: async ({ category, diet }) => {
    const categoryId = category ? normalizeCategory(category) : null;
    const dietCode = diet ? normalizeDiet(diet) : null;

    const items = MENU_ITEMS.filter((item) => {
      if (categoryId && item.category !== categoryId) return false;
      if (dietCode && !item.dietary.includes(dietCode as MenuItem["dietary"][number]))
        return false;
      return true;
    }).map((item) => ({
      name: item.name,
      price: item.price,
      category: item.category,
      dietary: item.dietary,
      spice: item.spice,
      desc: item.desc,
    }));

    return {
      count: items.length,
      appliedCategory: categoryId,
      appliedDiet: dietCode,
      items,
    };
  },
});

const startReservation = tool({
  description:
    "Open the reservation form for the guest, pre-filled with any details they gave. Returns a deep link to the reservation page. Use this whenever the guest wants to book a table.",
  inputSchema: z.object({
    date: z
      .string()
      .optional()
      .describe("Requested date in YYYY-MM-DD form if known."),
    time: z
      .string()
      .optional()
      .describe("Requested time in 24 hour HH:MM form if known, between 17:00 and 21:30."),
    partySize: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Number of guests."),
  }),
  execute: async ({ date, time, partySize }) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (time) params.set("time", time);
    if (partySize) params.set("party", String(partySize));
    const query = params.toString();
    return {
      opened: true,
      href: query ? `/reserve?${query}` : "/reserve",
      date: date ?? null,
      time: time ?? null,
      partySize: partySize ?? null,
    };
  },
});

/* --------------------------- Route --------------------------- */

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter("anthropic/claude-haiku-4.5"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { getMenu, startReservation },
    stopWhen: stepCountIs(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
