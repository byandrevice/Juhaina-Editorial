"use client";

import {
  CaretLeft,
  CaretRight,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatPublicationDate,
  orderFilmEssays,
  type FilmEssay,
} from "@/lib/film-essays";

function EssayImage({ essay }: { essay: FilmEssay }) {
  return (
    <>
      <span
        className={`film-essay__image-frame${
          essay.imageSrc ? "" : " film-essay__image-frame--placeholder"
        }`}
      >
        {essay.imageSrc ? (
          <Image
            src={essay.imageSrc}
            alt=""
            fill
            sizes="(max-width: 819px) 100vw, 50vw"
            className="film-essay__image-file"
            style={{
              objectPosition: `${essay.imagePositionX ?? 50}% ${essay.imagePositionY ?? 50}%`,
              transform: `scale(${essay.imageZoom ?? 1})`,
              transformOrigin: `${essay.imagePositionX ?? 50}% ${essay.imagePositionY ?? 50}%`,
            }}
          />
        ) : null}
      </span>
      <figcaption className="film-essay__image-note">
        <cite>{essay.filmTitle}</cite> ({essay.filmYear}), directed by{" "}
        {essay.director}
      </figcaption>
    </>
  );
}

export function FilmIndex({ essays }: { essays: FilmEssay[] }) {
  const pageCount = 4;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchInput = useRef<HTMLInputElement>(null);

  const orderedEssays = useMemo(() => orderFilmEssays(essays), [essays]);
  const visibleEssays = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return orderedEssays;

    return orderedEssays.filter((essay) =>
      [
        essay.title,
        essay.excerpt,
        essay.filmTitle,
        essay.director,
        String(essay.filmYear),
      ].some((field) => field.toLowerCase().includes(normalizedQuery)),
    );
  }, [orderedEssays, query]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function syncPageFromUrl() {
      const requestedPage = Number(
        new URLSearchParams(window.location.search).get("page") ?? 1,
      );

      setCurrentPage(
        Number.isInteger(requestedPage) &&
          requestedPage >= 1 &&
          requestedPage <= pageCount
          ? requestedPage
          : 1,
      );
    }

    syncPageFromUrl();
    window.addEventListener("popstate", syncPageFromUrl);
    return () => window.removeEventListener("popstate", syncPageFromUrl);
  }, [pageCount]);

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <main className="film-index">
      <header
        className={`film-index__masthead${
          searchOpen ? " film-index__masthead--search-open" : ""
        }`}
      >
        <Link className="film-index__identity" href="/">
          Second Viewing
        </Link>

        <div className={`film-search${searchOpen ? " film-search--open" : ""}`}>
          <button
            className="film-search__trigger"
            type="button"
            aria-label="Search Film Thoughts"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(true)}
          >
            <MagnifyingGlass size={21} weight="regular" aria-hidden="true" />
          </button>

          <form
            className="film-search__form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <MagnifyingGlass size={17} weight="regular" aria-hidden="true" />
            <label className="sr-only" htmlFor="film-search-input">
              Search Film Thoughts
            </label>
            <input
              id="film-search-input"
              ref={searchInput}
              type="search"
              value={query}
              disabled={!searchOpen}
              tabIndex={searchOpen ? 0 : -1}
              placeholder="Search essays"
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") closeSearch();
              }}
            />
            <button
              type="button"
              aria-label="Close search"
              tabIndex={searchOpen ? 0 : -1}
              onClick={closeSearch}
            >
              <X size={17} weight="regular" aria-hidden="true" />
            </button>
          </form>
        </div>
      </header>

      <p className="sr-only" aria-live="polite">
        {visibleEssays.length} essay{visibleEssays.length === 1 ? "" : "s"}
        {query ? ` found for ${query}` : " shown"}.
      </p>

      <section className="film-index__essays" aria-label="Film essays">
        {visibleEssays.map((essay) => (
          <Link
            className="film-essay"
            href={`/films/${essay.slug}`}
            key={essay.slug}
            aria-label={essay.title}
          >
            <div className="film-essay__text">
              <div className="film-essay__title-group">
                <h2>{essay.title}</h2>
                <time dateTime={essay.publishedAt}>
                  {formatPublicationDate(essay.publishedAt)}
                </time>
                {essay.featured ? (
                  <p className="film-essay__featured">Featured</p>
                ) : null}
              </div>
              <p className="film-essay__excerpt">{essay.excerpt}</p>
            </div>

            <figure className="film-essay__image">
              <EssayImage essay={essay} />
            </figure>
          </Link>
        ))}

        {visibleEssays.length === 0 ? (
          <div className="film-index__empty">
            <p>No essays match “{query}”.</p>
            <button type="button" onClick={closeSearch}>
              Clear search
            </button>
          </div>
        ) : null}
      </section>

      <footer className="film-index__footer">
        <nav className="film-pagination" aria-label="Film essay pages">
          {currentPage > 1 ? (
            <Link
              className="film-pagination__arrow"
              href={`/films?page=${currentPage - 1}`}
              aria-label="Previous page"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <CaretLeft size={16} weight="bold" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="film-pagination__arrow film-pagination__arrow--disabled"
              aria-hidden="true"
            >
              <CaretLeft size={16} weight="bold" />
            </span>
          )}

          {Array.from({ length: pageCount }, (_, index) => index + 1).map(
            (page) => (
              <Link
                className="film-pagination__page"
                href={`/films?page=${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                key={page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Link>
            ),
          )}

          {currentPage < pageCount ? (
            <Link
              className="film-pagination__arrow"
              href={`/films?page=${currentPage + 1}`}
              aria-label="Next page"
              onClick={() =>
                setCurrentPage((page) => Math.min(pageCount, page + 1))
              }
            >
              <CaretRight size={16} weight="bold" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="film-pagination__arrow film-pagination__arrow--disabled"
              aria-hidden="true"
            >
              <CaretRight size={16} weight="bold" />
            </span>
          )}
        </nav>
      </footer>
    </main>
  );
}
