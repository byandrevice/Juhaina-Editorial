import { HomePortal, type FontChoice } from "@/components/home-portal";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const fontChoices: FontChoice[] = ["syne-tactile", "syne-mono", "ncl-bhagnes"];

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const requestedFont = Array.isArray(params.font) ? params.font[0] : params.font;
  const initialFont = fontChoices.includes(requestedFont as FontChoice)
    ? (requestedFont as FontChoice)
    : "syne-mono";
  const showTypeLab = params["type-lab"] === "1";
  const captureScaleHalf = params.capture === "1";

  return (
    <HomePortal
      initialFont={initialFont}
      showTypeLab={showTypeLab}
      captureScaleHalf={captureScaleHalf}
    />
  );
}
