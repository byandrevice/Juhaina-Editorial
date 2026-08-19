import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { filmArticleParagraphs } from "@/lib/film-article-content";
import { formatPublicationDate } from "@/lib/film-essays";
import { getPublicFilmEssay, getPublicFilmEssays } from "@/lib/films-data";
import { RichTextDocument } from "@/components/rich-text-document";

type FilmArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FilmArticlePage({
  params,
}: FilmArticlePageProps) {
  const { slug } = await params;
  const essay = await getPublicFilmEssay(slug);

  if (!essay) notFound();

  const relatedEssays = (await getPublicFilmEssays())
    .filter((candidate) => candidate.slug !== essay.slug)
    .slice(0, 4);

  return (
    <main className="film-article-page">
      <header className="film-article-masthead">
        <Link className="film-index__identity" href="/">
          Second Viewing
        </Link>
        <Link
          className="film-article-masthead__search"
          href="/films"
          aria-label="Browse and search Film Thoughts"
        >
          <MagnifyingGlass size={21} weight="regular" aria-hidden="true" />
        </Link>
      </header>

      <article className="film-article">
        <header className="film-article__header">
          <h1>{essay.title}</h1>
          <p className="film-article__subtitle">{essay.excerpt}</p>
        </header>

        <div className="film-article__body">
          {essay.body ? <RichTextDocument document={essay.body} /> : filmArticleParagraphs.map((paragraph, index) => (
            <p key={paragraph}>
              {index === 0 ? (
                <>
                  <strong>{paragraph.slice(0, paragraph.indexOf(" "))}</strong>
                  {paragraph.slice(paragraph.indexOf(" "))}
                </>
              ) : (
                paragraph
              )}
            </p>
          ))}
        </div>
      </article>

      <footer className="film-related">
        <h2>You Might Also Enjoy</h2>
        <div className="film-related__grid">
          {relatedEssays.map((relatedEssay) => (
            <Link
              className="film-related__card"
              href={`/films/${relatedEssay.slug}`}
              key={relatedEssay.slug}
            >
              <figure className="film-related__image">
                {relatedEssay.imageSrc ? (
                  <Image
                    src={relatedEssay.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 819px) 100vw, 50vw"
                    style={{
                      objectPosition: `${relatedEssay.imagePositionX ?? 50}% ${relatedEssay.imagePositionY ?? 50}%`,
                      transform: `scale(${relatedEssay.imageZoom ?? 1})`,
                      transformOrigin: `${relatedEssay.imagePositionX ?? 50}% ${relatedEssay.imagePositionY ?? 50}%`,
                    }}
                  />
                ) : null}
                <figcaption>
                  <cite>{relatedEssay.filmTitle}</cite> ({relatedEssay.filmYear}),
                  directed by {relatedEssay.director}
                </figcaption>
              </figure>

              <div className="film-related__text">
                <div>
                  <h3>{relatedEssay.title}</h3>
                  <time dateTime={relatedEssay.publishedAt}>
                    {formatPublicationDate(relatedEssay.publishedAt)}
                  </time>
                  {relatedEssay.featured ? <strong>Featured</strong> : null}
                </div>
                <p>{relatedEssay.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
