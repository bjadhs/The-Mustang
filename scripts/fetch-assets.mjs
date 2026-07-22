/**
 * Downloads the Higgsfield 2K dish photography + table hero into
 * public/assets/food/ with the exact filenames the site expects.
 * Run once from the project root:  npm run fetch:assets
 *
 * These are the renders generated on 2026-07-22. If you regenerate a dish,
 * swap its URL here (or just drop a new file with the same name into
 * public/assets/food/).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3GMIfznJcTcgt384macCyiYCf6Z";

const FILES = [
  { url: `${BASE}/hf_20260722_101945_b0dc596d-a92c-4f23-ae42-e7c6e9d016d9.png`, out: "public/assets/food/momo.png" },
  { url: `${BASE}/hf_20260722_101949_ad4accba-a80b-4b3c-9f3b-2b5a4bb1464f.png`, out: "public/assets/food/jhol-momo.png" },
  { url: `${BASE}/hf_20260722_101953_a75396ee-0b61-4c28-b365-cd527b139f26.png`, out: "public/assets/food/mustang-tikka.png" },
  { url: `${BASE}/hf_20260722_102001_b6fe4b99-9d7c-4aa4-821e-a25e89c44d13.png`, out: "public/assets/food/thali.png" },
  { url: `${BASE}/hf_20260722_102005_7c10d564-e462-47d4-ac7a-837d43e1c674.png`, out: "public/assets/food/butter-chicken.png" },
  { url: `${BASE}/hf_20260722_102007_0dd0bf4f-8b6a-4c22-a291-8c41ad184531.png`, out: "public/assets/food/eggplant-masala.png" },
  // 16:9 table hero: hero poster, reservation poster, and the video base frame.
  { url: `${BASE}/hf_20260722_102010_8df7415b-ea14-4dec-9acd-87546a73cdc1.png`, out: "public/assets/food/table-hero.png" },
  // Hero scroll-scrub video: the table + Mustang beer journey (Higgsfield veo3).
  { url: `${BASE}/hf_20260722_114954_1d1b474d-bb43-4029-a9b8-803f59d6c041.mp4`, out: "public/assets/mustang-hero.mp4" },
];

let ok = 0;
for (const { url, out } of FILES) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  FAIL ${out}: HTTP ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log(`  saved ${out}`);
    ok++;
  } catch (e) {
    console.error(`  FAIL ${out}: ${e.message}`);
    process.exitCode = 1;
  }
}
console.log(`\nDone: ${ok}/${FILES.length} assets saved into public/assets/food/`);
