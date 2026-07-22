import type { Metadata } from "next";
import PromptArchive from "../../src/components/PromptArchive";

// The reconstruction prompt archive. Kept out of the index: it is an internal
// build artifact, not a page we want ranking.
export const metadata: Metadata = {
  title: "Prompt Archive",
  robots: { index: false, follow: false },
};

export default function PromptArchivePage() {
  return <PromptArchive />;
}
