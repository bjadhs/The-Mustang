import Experience from "../src/components/Experience";

// The landing route. This stays a thin server component so the layout, fonts
// and metadata render on the server; the cinematic scroll-scrub film and its
// Act 2 content sections run inside the <Experience/> client boundary. Next
// still server-renders that client tree to HTML, so all Act 2 copy (story,
// dishes, menu, services, FAQ, visit block) is in the initial document for SEO.
export default function Home() {
  return <Experience />;
}
