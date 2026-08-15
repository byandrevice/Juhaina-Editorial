export const listTypes = ["Films", "Albums", "Books"];
export const listYears = ["2026", "2025", "2024", "2023", "All time"];

export type ListType = string;
export type ListYear = string;
export type ArtworkRatio = "poster_2_3" | "book_5_8" | "square_1_1" | "landscape_16_9";

export type ListEntry = {
  rank: string;
  title: string;
  creator: string;
  year: string;
  note: string;
  tone: string;
  image?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  imageZoom?: number;
  imageAlt?: string;
  externalUrl?: string;
};

export type ListCollection = {
  id?: string;
  slug?: string;
  title: string;
  typeLabel: string;
  typeSlug: string;
  periodLabel: string;
  periodSlug: string;
  artworkRatio: ArtworkRatio;
  creatorLabel: string;
  showRanks: boolean;
  items: ListEntry[];
};

const tones = [
  "#c5bdaf", "#b2b7b6", "#a79f94", "#8d948f", "#c9b6a4",
  "#98a1ab", "#b1a79a", "#8a877f", "#c0b8aa", "#9a9a96",
];

const films2024 = [
  ["All We Imagine as Light", "Payal Kapadia", "2024", "Two nurses and one borrowed city; the most generous ending of the year."],
  ["I Saw the TV Glow", "Jane Schoenbrun", "2024", "Late-night static used as a language for the thing you cannot say aloud."],
  ["The Beast", "Bertrand Bonello", "2023", "Three centuries of the same fear, filmed with a terrifying patience."],
  ["Do Not Expect Too Much from the End of the World", "Radu Jude", "2023", "Furious and funny, and built like a working day that refuses to end."],
  ["Perfect Days", "Wim Wenders", "2023", "A film about routine that never once condescends to routine."],
  ["Aftersun", "Charlotte Wells", "2022", "Watched again in June. The camcorder footage undid me a second time."],
  ["The Substance", "Coralie Fargeat", "2024", "Vulgar on purpose, and far more precise than its reputation suggests."],
  ["Evil Does Not Exist", "Ryusuke Hamaguchi", "2023", "The tracking shots through the trees make the argument the dialogue refuses to."],
  ["La Chimera", "Alice Rohrwacher", "2023", "Grave robbers and red thread — the most tactile film I saw all year."],
  ["Janet Planet", "Annie Baker", "2023", "A summer measured in small betrayals, all of it at kitchen-table height."],
];

const films2023 = [
  ["Showing Up", "Kelly Reichardt", "2022", "Work as devotion, and the small indignities that surround making anything."],
  ["Past Lives", "Celine Song", "2023", "A film with the discipline to leave its best scene unspoken."],
  ["Fallen Leaves", "Aki Kaurismäki", "2023", "Deadpan tenderness, and the finest use of a dog in recent memory."],
  ["Anatomy of a Fall", "Justine Triet", "2023", "A marriage cross-examined until language itself becomes the evidence."],
  ["Pacifiction", "Albert Serra", "2022", "Humid, drifting, impossible to summarise — I keep returning to it."],
  ["Killers of the Flower Moon", "Martin Scorsese", "2023", "The radio-play ending reframes everything that came before it."],
  ["The Zone of Interest", "Jonathan Glazer", "2023", "Everything decisive happens off-frame, in the sound design."],
  ["Trenque Lauquen", "Laura Citarella", "2022", "Four hours that keep changing genre without ever losing the thread."],
  ["Afire", "Christian Petzold", "2023", "A summer house, a manuscript, and a man determined to miss everything."],
  ["Menus-Plaisirs — Les Troisgros", "Frederick Wiseman", "2023", "Four hours of labour and sauce; the most restful film of the year."],
  ["May December", "Todd Haynes", "2023", "Performance, imitation, and the violence of treating another person's life as material."],
  ["Passages", "Ira Sachs", "2023", "A romantic disaster carried by three people who refuse the comfort of easy sympathy."],
  ["The Delinquents", "Rodrigo Moreno", "2023", "A bank robbery that quietly escapes into another kind of movie."],
  ["De Humani Corporis Fabrica", "Véréna Paravel & Lucien Castaing-Taylor", "2022", "The body filmed as machinery, landscape, and a place no camera should quite fit."],
  ["All of Us Strangers", "Andrew Haigh", "2023", "Grief becomes a room you can enter, even when you know you cannot stay."],
  ["The Boy and the Heron", "Hayao Miyazaki", "2023", "A farewell that keeps opening new doors instead of closing the old ones."],
  ["Priscilla", "Sofia Coppola", "2023", "Scale and silence do the work that a more conventional biopic would give to exposition."],
  ["Four Daughters", "Kaouther Ben Hania", "2023", "Reenactment used not to solve a family's absence, but to let everyone approach it."],
  ["Rotting in the Sun", "Sebastián Silva", "2023", "A brittle comedy of self-invention that becomes much sadder than its setup suggests."],
  ["The Human Surge 3", "Eduardo Williams", "2023", "Movement, friendship, and digital space rendered as one continuous drifting world."],
];

const albums = [
  ["Sable, Fable", "Bon Iver", "2025", "Warmth after a decade of static; the second half earns the first."],
  ["Glory", "Perfume Genius", "2025", "Physical, unhurried, and the best-sequenced record of the year."],
  ["Lotus", "Little Simz", "2025", "Anger arranged with a horn section and absolutely no wasted bars."],
  ["Virgin", "Lorde", "2025", "Brittle production, unguarded writing; the friction is the point."],
  ["Moisturizer", "Wet Leg", "2025", "Louder and stranger than expected, which is exactly right."],
  ["Something Beautiful", "Miley Cyrus", "2025", "An overreach that mostly works — I admire the size of the swing."],
  ["Manning Fireworks", "MJ Lenderman", "2024", "Nine songs about failing well, none of them a minute too long."],
  ["Bright Future", "Adrianne Lenker", "2024", "Recorded to tape in a room; you can hear the room."],
  ["Diamond Jubilee", "Cindy Lee", "2024", "Two hours of AM-radio hauntings that reward the whole sitting."],
  ["Only God Was Above Us", "Vampire Weekend", "2024", "Middle-age dread arranged for piano, strings and a broken fax."],
];

const books = [
  ["Housekeeping", "Marilynne Robinson", "1980", "Read in two nights in January; the flood chapters kept me awake."],
  ["Speedboat", "Renata Adler", "1976", "Paragraphs that behave like cuts. I read it as a film about editing."],
  ["The Rings of Saturn", "W. G. Sebald", "1995", "A walk that becomes an argument about how memory holds a coastline."],
  ["Cold Enough for Snow", "Jessica Au", "2022", "A mother, a daughter, and everything they agree not to name."],
  ["The Employees", "Olga Ravn", "2018", "Workplace testimony from a ship; funnier and sadder than that sounds."],
  ["Autumn", "Ali Smith", "2016", "Rereading it after a decade, the collage holds better than the politics."],
  ["The Hearing Trumpet", "Leonora Carrington", "1974", "A comic apocalypse run by old women; entirely unbothered by realism."],
  ["Pond", "Claire-Louise Bennett", "2015", "Domestic attention turned up until objects start behaving like characters."],
  ["Territory of Light", "Yūko Tsushima", "1979", "A year in an apartment above the light; the chapters accumulate quietly."],
  ["Second Place", "Rachel Cusk", "2021", "An argument about hospitality that keeps turning into an argument about art."],
];

function rowsFor(type: ListType, year: ListYear) {
  if (type === "Films") return year === "2023" ? films2023 : films2024;
  if (type === "Albums") return albums;
  return books;
}

export function getList(type: ListType, year: ListYear) {
  const suffix = year === "All time" ? ", All Time" : type === "Books" ? ` in ${year}` : ` of ${year}`;
  const lead = type === "Films" ? "Favorite Films" : type === "Albums" ? "Favorite Albums" : "Books Read";
  const rows = rowsFor(type, year);
  return {
    title: `${lead}${suffix}`,
    typeLabel: type,
    typeSlug: slugifyListLabel(type),
    periodLabel: year,
    periodSlug: listYearSlug(year),
    artworkRatio: (type === "Albums" ? "square_1_1" : type === "Books" ? "book_5_8" : "poster_2_3") as ArtworkRatio,
    creatorLabel: type === "Films" ? "Director" : type === "Albums" ? "Musician" : "Author",
    showRanks: true,
    items: rows.map(([title, creator, itemYear, note], index): ListEntry => ({
      rank: String(index + 1),
      title,
      creator,
      year: type === "Albums" ? (year === "All time" ? itemYear : year) : itemYear,
      note,
      tone: tones[index % tones.length],
      image: type === "Films" && year === "2024" ? `/images/lists/2024/${String(index + 1).padStart(2, "0")}.webp` : undefined,
    })),
  } satisfies ListCollection;
}

export function parseListType(value?: string): ListType {
  return listTypes.find((type) => type.toLowerCase() === value?.toLowerCase()) ?? "Films";
}

export function parseListYear(value?: string): ListYear {
  if (value === "all") return "All time";
  return listYears.find((year) => year === value) ?? "2024";
}

export function listYearSlug(year: ListYear) {
  return year === "All time" ? "all" : year;
}

export function slugifyListLabel(value: string, fallback = "list") {
  const result = value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
  return result || fallback;
}

export function getFallbackLists(): ListCollection[] {
  return listTypes.flatMap((type) => listYears.map((year) => getList(type, year)));
}
