export const projectionPalettes = [
  {
    id: "home",
    label: "Home gray",
    background: "#2B2B2B",
    foreground: "#FFFFFF",
  },
  {
    id: "1",
    label: "Color 1",
    background: "#343839",
    foreground: "#FEFEFE",
  },
  {
    id: "2",
    label: "Color 2",
    background: "#022074",
    foreground: "#FEFEFE",
  },
  {
    id: "3",
    label: "Color 3",
    background: "#66FFC5",
    foreground: "#010101",
    note: "Background interpreted as #66FFC5 from the supplied #66FFCS.",
  },
  {
    id: "4",
    label: "Color 4",
    background: "#060606",
    foreground: "#05D977",
  },
  {
    id: "5",
    label: "Color 5",
    background: "#060606",
    foreground: "#C5C5C4",
  },
  {
    id: "6",
    label: "Color 6",
    background: "#9CEDFE",
    foreground: "#152733",
  },
  {
    id: "7",
    label: "Color 7",
    background: "#1227A0",
    foreground: "#B5C4E7",
  },
] as const;

export type ProjectionPalette = (typeof projectionPalettes)[number];

export function projectionPalette(id: string) {
  return projectionPalettes.find((palette) => palette.id === id);
}
