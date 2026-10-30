import { HomePortal } from "@/components/home-portal";
import { preload } from "react-dom";

// Review-only query parameters are read in the browser, keeping the public
// homepage statically generated and cacheable at the CDN.
export default function HomePage() {
  preload("/images/portal-background.webp", { as: "image", fetchPriority: "high" });
  return <HomePortal />;
}
