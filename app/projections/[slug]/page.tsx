import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { filmArticleParagraphs } from "@/lib/film-article-content";
import {
  projectionEssays,
  projectionPublicationDate,
} from "@/lib/projection-essays";
import styles from "./reader.module.css";

type ProjectionArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projectionEssays.map(({ slug }) => ({ slug }));
}

export default async function ProjectionArticlePage({
  params,
}: ProjectionArticlePageProps) {
  const { slug } = await params;
  const essay = projectionEssays.find((candidate) => candidate.slug === slug);

  if (!essay) notFound();

  return (
    <main className={`projection-final-reader ${styles.page}`}>
      <header className={styles.masthead}>
        <Link href="/projections">Projections</Link>
        <Link href="/" rel="home">
          Second Viewing
        </Link>
      </header>

      <article className={styles.article}>
        <figure className={styles.leadImage}>
          <Image
            src={essay.still.src}
            alt={essay.still.alt}
            fill
            sizes="(max-width: 819px) calc(100vw - 32px), 780px"
            priority
            style={{
              objectPosition: `${essay.still.focalX * 100}% ${essay.still.focalY * 100}%`,
            }}
          />
        </figure>

        <div className={styles.articleGrid}>
          <aside className={styles.meta} aria-label="Article details">
            <span>Essay</span>
            <span>Words by Juhaina Khan</span>
            <time dateTime={essay.publishedAt}>
              {projectionPublicationDate(essay.publishedAt)}
            </time>
            <span>{essay.readingTime} min read</span>
            <span>Reporting</span>
            <strong>Film / Memory / Image</strong>
          </aside>

          <div className={styles.articleContent}>
            <header className={styles.articleHeader}>
              <p>
                {essay.subjectTitle} · {essay.creator} · {essay.subjectYear}
              </p>
              <h1>{essay.title}</h1>
              <p>{essay.excerpt}</p>
            </header>

            <div className={styles.bodyCopy}>
              {filmArticleParagraphs.slice(0, 13).map((paragraph, index) => (
                <Fragment key={paragraph}>
                  {index === 5 ? (
                    <blockquote>
                      “The image can be replayed and searched, but it cannot
                      answer.”
                    </blockquote>
                  ) : null}
                  <p>{paragraph}</p>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
