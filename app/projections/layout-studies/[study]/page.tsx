import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { filmArticleParagraphs } from "@/lib/film-article-content";
import { projectionEssays, projectionPublicationDate } from "@/lib/projection-essays";
import {
  projectionLayoutStudies,
  projectionLayoutStudy,
  type ProjectionLayoutStudy,
} from "@/lib/projection-layout-studies";
import { ColorLabShell } from "./color-lab-shell";
import styles from "./study.module.css";

type StudyPageProps = { params: Promise<{ study: string }> };

export function generateStaticParams() {
  return projectionLayoutStudies.map(({ slug }) => ({ study: slug }));
}

const essay = projectionEssays[0];

function LeadImage({ priority = false }: { priority?: boolean }) {
  return (
    <figure className={styles.leadImage}>
      <Image
        src={essay.still.src}
        alt={essay.still.alt}
        fill
        sizes="(max-width: 819px) calc(100vw - 32px), 760px"
        priority={priority}
        style={{ objectPosition: `${essay.still.focalX * 100}% ${essay.still.focalY * 100}%` }}
      />
    </figure>
  );
}

function Meta() {
  return (
    <div className={styles.meta}>
      <span>Essay</span>
      <span>Words by Juhaina Khan</span>
      <time dateTime={essay.publishedAt}>{projectionPublicationDate(essay.publishedAt)}</time>
      <span>{essay.readingTime} min read</span>
    </div>
  );
}

function Body({ start = 0, end = 12 }: { start?: number; end?: number }) {
  const paragraphs = filmArticleParagraphs.slice(start, end);

  return (
    <div className={styles.bodyCopy}>
      {paragraphs.map((paragraph, index) => (
        <Fragment key={paragraph}>
          {index === 5 - start ? (
            <blockquote>
              “The image can be replayed and searched, but it cannot answer.”
            </blockquote>
          ) : null}
          <p>{paragraph}</p>
        </Fragment>
      ))}
    </div>
  );
}

function StudyNavigation({ current }: { current: ProjectionLayoutStudy }) {
  return (
    <nav className={styles.studyNav} aria-label="Reader study navigation">
      <Link href="/projections/layout-studies">All studies</Link>
      <span>{current.number} / 07 · {current.name}</span>
      <div>
        {projectionLayoutStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/projections/layout-studies/${study.slug}`}
            aria-current={study.slug === current.slug ? "page" : undefined}
            aria-label={`${study.number}: ${study.name}`}
          >{study.number}</Link>
        ))}
      </div>
    </nav>
  );
}

function Reader({ study }: { study: ProjectionLayoutStudy }) {
  const sharedHeader = (
    <header className={styles.articleHeader}>
      <p>{essay.subjectTitle} · Memory and image</p>
      <h1>{essay.title}</h1>
      <p>{essay.excerpt}</p>
    </header>
  );

  if (study.slug === "chorus") {
    return <article className={styles.chorus}>{sharedHeader}<div className={styles.chorusLead}><Meta /><LeadImage priority /></div><Body end={11} /></article>;
  }
  if (study.slug === "literary") {
    return <article className={styles.literary}>{sharedHeader}<Meta /><LeadImage priority /><Body end={13} /></article>;
  }
  if (study.slug === "sidebar") {
    return <article className={styles.sidebar}><LeadImage priority /><div className={styles.sidebarGrid}><aside><Meta /><span>Reporting</span><b>Film / Memory / Image</b></aside><div>{sharedHeader}<Body end={13} /></div></div></article>;
  }
  if (study.slug === "diptych") {
    return <article className={styles.diptych}><div className={styles.diptychHero}>{sharedHeader}<LeadImage priority /></div><Meta /><Body end={14} /></article>;
  }
  if (study.slug === "signal") {
    return <article className={styles.signal}>{sharedHeader}<Meta /><Body end={12} /></article>;
  }
  if (study.slug === "monument") {
    return <article className={styles.monument}><LeadImage priority /><div className={styles.monumentIntro}>{sharedHeader}<Meta /></div><Body end={12} /></article>;
  }
  return <article className={styles.dispatch}>{sharedHeader}<LeadImage priority /><div className={styles.dispatchRail}><Meta /><Body end={13} /></div></article>;
}

export default async function ProjectionLayoutStudyPage({ params }: StudyPageProps) {
  const { study: studySlug } = await params;
  const study = projectionLayoutStudy(studySlug);
  if (!study) notFound();

  return (
    <ColorLabShell className={`${styles.studyPage} ${styles[`page_${study.slug}`]}`}>
      <StudyNavigation current={study} />
      <header className={styles.publicationHeader}>
        <Link href="/projections">Projections</Link>
        <Link href="/" rel="home">Second Viewing</Link>
      </header>
      <Reader study={study} />
    </ColorLabShell>
  );
}
