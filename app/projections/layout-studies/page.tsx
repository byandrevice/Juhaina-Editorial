import Image from "next/image";
import Link from "next/link";
import { projectionLayoutStudies } from "@/lib/projection-layout-studies";
import styles from "./studies.module.css";

export default function ProjectionLayoutStudiesPage() {
  return (
    <main className={styles.gallery}>
      <header className={styles.galleryHeader}>
        <Link href="/projections">Projections</Link>
        <Link href="/" rel="home">Second Viewing</Link>
      </header>
      <section className={styles.galleryIntro}>
        <p>Reader studies · August 2026</p>
        <h1>Seven ways into the same story.</h1>
        <p>
          Each study uses identical content and a single lead image. The comparison
          isolates hierarchy, typography, rhythm, and reading character.
        </p>
      </section>
      <ol className={styles.studyGrid}>
        {projectionLayoutStudies.map((study) => (
          <li key={study.slug}>
            <Link href={`/projections/layout-studies/${study.slug}`}>
              <span className={`${styles.studySwatch} ${styles[study.slug]}`} aria-hidden="true">
                <Image
                  src={`/images/projection-layout-studies/${study.slug}.png`}
                  alt=""
                  fill
                  sizes="(max-width: 819px) 42vw, 280px"
                />
                <b>{study.number}</b>
              </span>
              <span className={styles.studyCopy}>
                <span>{study.reference} reference</span>
                <strong>{study.name}</strong>
                <span>{study.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
