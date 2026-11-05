"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, Play, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  siteContent,
  works,
  type PortfolioWork,
} from "./portfolio-content";
import { interfaceText, type InterfaceText } from "./portfolio-i18n";
import { usePortfolioLanguage } from "./use-portfolio-language";

function getVideoSource(url: string) {
  if (!url) return null;

  try {
    const parsed = new URL(url, "https://portfolio.local");
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return {
        kind: "embed" as const,
        src: `https://www.youtube-nocookie.com/embed/${id}`,
        previewSrc: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      };
    }

    if (host.endsWith("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return {
          kind: "embed" as const,
          src: `https://www.youtube-nocookie.com/embed/${id}`,
          previewSrc: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        };
      }

      if (parsed.pathname.startsWith("/embed/")) {
        const embedId = parsed.pathname.split("/")[2];
        return {
          kind: "embed" as const,
          src: url,
          previewSrc: embedId
            ? `https://i.ytimg.com/vi/${embedId}/maxresdefault.jpg`
            : undefined,
        };
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const shortsId = parsed.pathname.split("/")[2];
        return {
          kind: "embed" as const,
          src: `https://www.youtube-nocookie.com/embed/${shortsId}`,
          previewSrc: `https://i.ytimg.com/vi/${shortsId}/maxresdefault.jpg`,
        };
      }
    }

    if (
      host.endsWith("vimeo.com") ||
      host.endsWith("vkvideo.ru") ||
      host.endsWith("vk.com")
    ) {
      return { kind: "embed" as const, src: url, previewSrc: undefined };
    }
  } catch {
    return { kind: "file" as const, src: url };
  }

  return { kind: "file" as const, src: url };
}

function ProjectPreview({ work, active }: { work: PortfolioWork; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = useMemo(() => getVideoSource(work.videoUrl ?? ""), [work.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || source?.kind !== "file") return;
    if (!active) {
      video.pause();
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    if (reduceMotion || connection?.saveData) return;

    const loopShortPreview = () => {
      if (video.currentTime >= 6) video.currentTime = 0;
    };

    let visible = false;
    const updatePlayback = () => {
      if (visible && !document.hidden) {
        // Не загружаем все полные ролики сразу при открытии портфолио.
        if (!video.getAttribute("src")) video.src = source.src;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updatePlayback();
      },
      { threshold: 0.25 },
    );

    video.addEventListener("timeupdate", loopShortPreview);
    document.addEventListener("visibilitychange", updatePlayback);
    observer.observe(video);
    return () => {
      video.removeEventListener("timeupdate", loopShortPreview);
      document.removeEventListener("visibilitychange", updatePlayback);
      observer.disconnect();
      video.pause();
    };
  }, [source, active]);

  if (source?.kind === "file") {
    return (
      <video
        key={source.src}
        ref={videoRef}
        className="project-preview-media"
        poster={work.posterUrl || undefined}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden="true"
      />
    );
  }

  const previewSrc =
    work.posterUrl || (source?.kind === "embed" ? source.previewSrc : undefined);

  if (!previewSrc) return null;

  return (
    <span
      className="project-preview-media project-preview-image"
      style={{ backgroundImage: `url(${JSON.stringify(previewSrc)})` }}
      aria-hidden="true"
    />
  );
}

function ProjectVisual({
  work,
  compact = false,
  active = true,
}: {
  work: PortfolioWork;
  compact?: boolean;
  active?: boolean;
}) {
  const hasPreview = Boolean(work.videoUrl || work.posterUrl);

  return (
    <div
      className={`project-visual project-visual-${work.tone} project-visual--${work.format ?? "portrait"}${compact ? " is-compact" : ""}${hasPreview ? " has-preview" : ""}`}
      aria-hidden="true"
    >
      <ProjectPreview work={work} active={active} />
      <div className="project-preview-vignette" />
      {!hasPreview && (
        <>
          <div className="visual-glow visual-glow-one" />
          <div className="visual-glow visual-glow-two" />
        </>
      )}
    </div>
  );
}

function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>) {
  const href = event.currentTarget.getAttribute("href");
  if (!href?.startsWith("#")) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  event.preventDefault();

  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topOffset = isTouch ? 20 : 80;
  const top = target.getBoundingClientRect().top + window.scrollY - topOffset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: isTouch || reduceMotion ? "auto" : "smooth",
  });

  if (isTouch) event.currentTarget.blur();
}

function ProjectMedia({ work, labels }: { work: PortfolioWork; labels: InterfaceText }) {
  const source = useMemo(() => getVideoSource(work.videoUrl ?? ""), [work.videoUrl]);

  if (!source) {
    return (
      <>
        <ProjectVisual work={work} active={false} />
        <div className="project-empty">
          <span>{labels.videoSoon}</span>
          <small>{work.format === "landscape" ? "16:9" : "9:16"}</small>
        </div>
      </>
    );
  }

  if (source.kind === "embed") {
    return (
      <iframe
        className="project-video"
        src={source.src}
        title={work.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      className="project-video"
      src={source.src}
      poster={work.posterUrl || undefined}
      controls
      playsInline
      preload="metadata"
    >
      {labels.videoUnsupported}
    </video>
  );
}

function LiquidLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={`liquid-link ${className}`} href={href} onClick={scrollToSection}>
      <span>{children}</span>
    </a>
  );
}

export default function Home() {
  const [language, setLanguage] = usePortfolioLanguage();
  const labels = interfaceText[language];
  const content = language === "en" ? { ...siteContent, ...siteContent.en } : siteContent;
  const localizedWorks = useMemo(
    () => works.map((work) => language === "en" && work.en ? { ...work, ...work.en } : work),
    [language],
  );
  const firstWork = localizedWorks[0] ?? null;
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(works[0]?.id ?? null);
  const selectedWork = localizedWorks.find((work) => work.id === selectedWorkId) ?? null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workGroups = [
    { format: "portrait", title: labels.vertical, ratio: "9:16" },
    { format: "landscape", title: labels.landscape, ratio: "16:9" },
  ].map((group) => ({
    ...group,
    items: localizedWorks.filter((work) => (work.format ?? "portrait") === group.format),
  }));
  const hasTelegram = Boolean(siteContent.telegramUrl);
  const hasEmail = Boolean(siteContent.email);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = content.metadataTitle;
    document.querySelector('meta[name="description"]')?.setAttribute("content", content.metadataDescription);
  }, [language, content.metadataTitle, content.metadataDescription]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  function openWork(work: PortfolioWork, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setSelectedWorkId(work.id);
    setDialogOpen(true);
  }

  async function copyBrief() {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(labels.brief);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyFailed(true);
    }
  }

  function trackPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;

    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  return (
    <div className="site-shell" onPointerMove={trackPointer}>
      <a className="skip-link" href={works.length ? "#works" : "#about"}>
        {works.length ? labels.skipWorks : labels.skipAbout}
      </a>

      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-sand" aria-hidden="true" />
      <div className="pointer-light" aria-hidden="true" />
      <div className="site-noise" aria-hidden="true" />

      <header className="site-header page-width">
        <a
          className="brand"
          href="#top"
          aria-label={labels.backToTop}
          onClick={scrollToSection}
        >
          <span>{content.shortName}</span>
          <i>.</i>
        </a>

        <div className="header-controls">
          <nav className="main-nav" aria-label={labels.navigation}>
            {works.length > 0 && <LiquidLink href="#works">{labels.navWorks}</LiquidLink>}
            <LiquidLink href="#about">{labels.navAbout}</LiquidLink>
            <LiquidLink href="#contact">{labels.navContact}</LiquidLink>
          </nav>
          <ToggleGroup
            className="language-switch"
            type="single"
            value={language}
            onValueChange={(value) => {
              if (value === "ru" || value === "en") setLanguage(value);
              else if (value === "") setLanguage(language);
            }}
            aria-label={labels.language}
          >
            <ToggleGroupItem value="ru" aria-label="Русский" lang="ru">RU</ToggleGroupItem>
            <ToggleGroupItem value="en" aria-label="English" lang="en">EN</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      <main id="top">
        <section
          className={`hero page-width${firstWork ? "" : " hero-no-work"}`}
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              {content.role}
            </p>
            <h1 id="hero-title">
              {content.headlineLead}
              <span>{content.headlineAccent}</span>
            </h1>
            <p className="hero-intro">{content.intro}</p>

            <div className="hero-actions">
              <LiquidLink
                href={works.length ? "#works" : "#about"}
                className="button button-primary"
              >
                {works.length ? labels.viewWorks : labels.about}
                <ArrowDown aria-hidden="true" />
              </LiquidLink>
              <LiquidLink href="#contact" className="button button-secondary">
                {labels.discussProject}
                <ArrowUpRight aria-hidden="true" />
              </LiquidLink>
            </div>
          </div>

          {firstWork && (
            <button
              className={`featured-frame featured-frame--${firstWork.format ?? "portrait"} glass-panel`}
              type="button"
              onClick={(event) => openWork(firstWork, event.currentTarget)}
              aria-label={`${labels.openProject}: ${firstWork.title}`}
            >
              <ProjectVisual work={firstWork} active={!dialogOpen} />
              <span className="featured-tag">
                {firstWork.format === "landscape" ? labels.video : "Reel"}
                {firstWork.duration ? ` · ${firstWork.duration}` : ""}
              </span>
              {firstWork.videoUrl ? <span className="featured-play">
                <Play fill="currentColor" aria-hidden="true" />
              </span> : <span className="work-card-status">{labels.soon}</span>}
              <span className="featured-caption">
                <small>{labels.featured}</small>
                <strong>{firstWork.title}</strong>
              </span>
            </button>
          )}

          <a
            className="scroll-cue"
            href={works.length ? "#works" : "#about"}
            aria-label={works.length ? labels.scrollWorks : labels.scrollAbout}
            onClick={scrollToSection}
          >
            <span>{labels.scroll}</span>
            <ArrowDown aria-hidden="true" />
          </a>
        </section>

        {works.length > 0 && (
        <section className="works-section page-width" id="works" aria-labelledby="works-title">
          <div className="section-heading">
            <div>
              <p className="section-index">01 · {labels.portfolio}</p>
              <h2 id="works-title">{labels.works}</h2>
            </div>
            <p>{labels.worksHint}</p>
          </div>

          {workGroups.filter((group) => group.items.length > 0).map((group) => (
          <div className="work-group" key={group.format}>
            <div className="work-group-heading">
              <h3 id={`works-${group.format}`}>{group.title}</h3>
              <span>{group.ratio}</span>
            </div>
            <div
              className={`works-grid works-grid--${group.format} works-count-${Math.min(group.items.length, 4)}`}
              aria-labelledby={`works-${group.format}`}
            >
            {group.items.map((work, index) => (
              <button
                className={`work-card work-card--${group.format} glass-panel`}
                type="button"
                key={work.id}
                onClick={(event) => openWork(work, event.currentTarget)}
                aria-label={`${labels.openProject}: ${work.title}`}
              >
                <ProjectVisual work={work} compact active={!dialogOpen} />
                <span className="work-card-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
                {work.videoUrl ? <span className="work-card-play">
                  <Play fill="currentColor" aria-hidden="true" />
                </span> : <span className="work-card-status">{labels.soon}</span>}
                <span className="work-card-copy">
                  <strong>{work.title}</strong>
                  <small>{work.category}</small>
                </span>
              </button>
            ))}
            </div>
          </div>
          ))}
        </section>
        )}

        <section className="about-section page-width" id="about" aria-labelledby="about-title">
          <div className="about-number" aria-hidden="true">
            02
          </div>
          <div className="about-copy">
            <p className="section-index">02 · {labels.about}</p>
            <h2 id="about-title">{content.aboutTitle}</h2>
            <p>{content.about}</p>
          </div>
          <ul className="about-skills about-benefits glass-panel" aria-label={labels.benefits}>
            {content.benefits.map((benefit) => (
              <li key={benefit}><Check aria-hidden="true" /><span>{benefit}</span></li>
            ))}
          </ul>
        </section>

        <section className="contact-section page-width" id="contact" aria-labelledby="contact-title">
          <div className="contact-card glass-panel">
            <div>
              <p className="section-index">03 · {labels.contact}</p>
              <h2 id="contact-title">{content.contactTitle}</h2>
              <p>{content.contactText}</p>
            </div>

            <div className="contact-actions">
              {hasTelegram && (
                <a
                  className="button button-primary liquid-link"
                  href={siteContent.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>
                    {content.telegramLabel}
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </a>
              )}
              {hasEmail && (
                <a
                  className="button button-secondary liquid-link"
                  href={`mailto:${siteContent.email}`}
                >
                  <span>
                    {labels.email}
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </a>
              )}
              {!hasTelegram && !hasEmail && (
                <button className="button button-primary copy-button liquid-link" type="button" onClick={copyBrief}>
                  <span>
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copied ? labels.copied : labels.copy}
                  </span>
                </button>
              )}
              {copyFailed && <p className="copy-status" role="status">{labels.copyError}</p>}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <span>© 2026 {content.name}</span>
        <a href="#top" onClick={scrollToSection}>
          {labels.top}
        </a>
      </footer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedWork && (
        <DialogContent
          className={`project-dialog project-dialog--${selectedWork.format ?? "portrait"}`}
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus({ preventScroll: true });
          }}
        >
          <DialogClose className="dialog-close" aria-label={labels.close}>
            <X aria-hidden="true" />
          </DialogClose>

          <div className="dialog-body">
          <div className="dialog-media">
            <ProjectMedia key={selectedWork.id} work={selectedWork} labels={labels} />
          </div>

          <div className="dialog-copy">
            <p className="section-index">{selectedWork.category}</p>
            <DialogTitle>{selectedWork.title}</DialogTitle>
            <DialogDescription>{selectedWork.description}</DialogDescription>
            {selectedWork.details.length > 0 && <div className="detail-list">
              {selectedWork.details.map((detail) => (
                <span key={detail}>{detail}</span>
              ))}
            </div>}
          </div>
          </div>
        </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
