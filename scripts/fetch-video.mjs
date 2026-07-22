/**
 * Downloads the hosted Higgsfield renders into public/assets/ so the site
 * serves the film same-origin (faster, and Blob seeking never depends on CORS).
 * Run once: npm run fetch:video
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const FILES = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3GMIfznJcTcgt384macCyiYCf6Z/hf_20260722_084808_0bd9a69f-8f1a-4b26-8241-3086ea7e0bbd.mp4",
    out: "public/assets/mustang-macro.mp4",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_3GMIfznJcTcgt384macCyiYCf6Z/hf_20260722_084356_fe2e1a71-60dd-4c15-85ec-19cdf3fa2227.png",
    out: "public/assets/mustang-poster.png",
  },
];

for (const { url, out } of FILES) {
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed ${url}: ${res.status}`);
    process.exitCode = 1;
    continue;
  }
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await res.arrayBuffer()));
  console.log(`Saved ${out}`);
}
