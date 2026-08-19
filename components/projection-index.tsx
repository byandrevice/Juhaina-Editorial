import Image from "next/image";
import Link from "next/link";
import {
  orderedProjectionEssays,
  projectionPublicationDate,
} from "@/lib/projection-essays";

const sectionLinks = [
  { href: "/films", label: "Films" },
  { href: "/moodboards", label: "Moodboards" },
  { href: "/projections", label: "Projections" },
  { href: "/lists", label: "Lists" },
];

export function ProjectionIndex() {
  const essays = orderedProjectionEssays().slice(0, 6);

  return (
    <div className="projection-index">
      <header className="projection-header">
        <nav className="projection-nav" aria-label="Sections">
          {sectionLinks.map((section) => (
            <Link
              href={section.href}
              aria-current={section.href === "/projections" ? "page" : undefined}
              key={section.href}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <Link className="projection-identity" href="/" rel="home">
          Second Viewing
        </Link>
      </header>

      <main className="projection-main">
        <h1>Projections</h1>
        <ul className="projection-grid">
          {essays.map((essay, index) => (
            <li key={essay.slug}>
              <article className="projection-entry">
                <Link
                  className="projection-entry__link"
                  href={`/projections/${essay.slug}`}
                  aria-label={essay.title}
                >
                  <span className="projection-entry__image">
                    <Image
                      src={essay.still.src}
                      alt={essay.still.alt}
                      fill
                      sizes="(max-width: 819px) calc(100vw - 32px), 340px"
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index < 2 ? "high" : "auto"}
                      style={{
                        objectPosition: `${essay.still.focalX * 100}% ${essay.still.focalY * 100}%`,
                      }}
                    />
                  </span>

                  <div className="projection-entry__text">
                    <div className="projection-entry__top">
                      <h2>{essay.title}</h2>
                      <p className="projection-entry__metadata">
                        {essay.subjectTitle} · {essay.creator} · {essay.subjectYear}
                        <br />
                        <time dateTime={essay.publishedAt}>
                          {projectionPublicationDate(essay.publishedAt)}
                        </time>
                      </p>
                    </div>
                    <p className="projection-entry__excerpt">{essay.excerpt}</p>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </main>

      <footer className="projection-footer">
        <Link href="/films">Earlier film writing — April 2026</Link>
      </footer>
    </div>
  );
}
