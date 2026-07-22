# The Mustang, Canberra: scroll-driven landing page

A premium single-page experience for The Mustang (Nepalese restaurant and bar,
Farrer ACT), built around one continuous 8-second extreme macro film generated
with Higgsfield. Scrolling plays the film: steam, hand-pleated momo dough,
spice, and a final swirl of chili oil, mapped to five narrative chapters that
end in a table reservation.

## Run it

```bash
npm install
npm run fetch:video   # pulls the Higgsfield film + poster into public/assets/
npm run dev
```

The site also works without `fetch:video` (it streams the hosted render), but
the local copy is faster and survives CDN link expiry.

## Routes

- `/` : the experience (about 520vh of scroll, video fixed behind the UI)
- `/prompt` : the prompt archive with the full reconstruction prompt and a
  copy button

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), GSAP +
ScrollTrigger, Lenis, react-router-dom (BrowserRouter), lucide-react, native
HTML video (no canvas). The film's duration is read from `loadedmetadata`,
never hardcoded.

## Production build

```bash
npm run build
npm run preview
```

Because routing uses BrowserRouter, deploy with an SPA fallback (all paths
rewrite to `index.html`).
