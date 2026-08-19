export const projectionLayoutStudies = [
  {
    slug: "chorus",
    number: "01",
    name: "Chorus",
    reference: "C41",
    description: "A spare split opener with an uninterrupted, conversational text field.",
  },
  {
    slug: "literary",
    number: "02",
    name: "Literary",
    reference: "Real Life",
    description: "A centered essay with serif authority, rules, and emphatic pull quotes.",
  },
  {
    slug: "sidebar",
    number: "03",
    name: "Sidebar",
    reference: "Lampoon",
    description: "A compact magazine column paired with persistent editorial metadata.",
  },
  {
    slug: "diptych",
    number: "04",
    name: "Diptych",
    reference: "Noema",
    description: "A formal title-and-image diptych leading into a calm long-form column.",
  },
  {
    slug: "signal",
    number: "05",
    name: "Signal",
    reference: "Crack",
    description: "A loud color field and bold display type for a culture-forward feature.",
  },
  {
    slug: "monument",
    number: "06",
    name: "Monument",
    reference: "SHOWstudio",
    description: "An image-led news layout with monumental headlines and modular text panels.",
  },
  {
    slug: "dispatch",
    number: "07",
    name: "Dispatch",
    reference: "Dazed",
    description: "A compact culture dispatch with a strong headline and narrow reading rail.",
  },
] as const;

export type ProjectionLayoutStudy = (typeof projectionLayoutStudies)[number];

export function projectionLayoutStudy(slug: string) {
  return projectionLayoutStudies.find((study) => study.slug === slug);
}
