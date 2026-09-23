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
import {
  siteContent,
  works,
  type PortfolioWork,
} from "./portfolio-content";

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
      <div className="visual-glow visual-glow-one" />
      <div className="visual-glow visual-glow-two" />
      <div className="visual-scanline" />
      <div className="visual-copy">
        <span>EDIT</span>
        <strong>{work.id === "work-01" ? "RHYTHM" : "MOTION"}</strong>
        <span>{work.id === "work-01" ? "SOUND" : "STORY"}</span>
      </div>
      <div className="visual-timeline">
        <i />
        <i />
        <i />
        <i />
      </div>
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

function ProjectMedia({ work }: { work: PortfolioWork }) {
  const source = useMemo(() => getVideoSource(work.videoUrl ?? ""), [work.videoUrl]);

  if (!source) {
    return (
      <>
        <ProjectVisual work={work} active={false} />
        <div className="project-empty">
          <span>Видео скоро</span>
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
      Ваш браузер не поддерживает видео.
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
  const firstWork = works[0] ?? null;
  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(firstWork);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const workGroups = [
    { format: "portrait", title: "Вертикальные видео", ratio: "9:16" },
    { format: "landscape", title: "Горизонтальные видео", ratio: "16:9" },
  ].map((group) => ({
    ...group,
    items: works.filter((work) => (work.format ?? "portrait") === group.format),
  }));
  const hasTelegram = Boolean(siteContent.telegramUrl);
  const hasEmail = Boolean(siteContent.email);

  function openWork(work: PortfolioWork, opener: HTMLButtonElement) {
    openerRef.current = opener;
    setSelectedWork(work);
    setDialogOpen(true);
  }

  async function copyBrief() {
    const message =
      "Привет! Хочу обсудить монтаж. Формат ролика: ... Хронометраж: ... Срок: ...";

    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function trackPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;

    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
  }

  return (
    <div className="site-shell" onPointerMove={trackPointer}>
      <a className="skip-link" href={works.length ? "#works" : "#about"}>
        {works.length ? "Перейти к работам" : "Перейти к информации"}
      </a>

      <div className="ambient ambient-violet" aria-hidden="true" />
      <div className="ambient ambient-sand" aria-hidden="true" />
      <div className="pointer-light" aria-hidden="true" />
      <div className="site-noise" aria-hidden="true" />

      <header className="site-header page-width">
        <a
          className="brand"
          href="#top"
          aria-label="В начало страницы"
          onClick={scrollToSection}
        >
          <span>{siteContent.shortName}</span>
          <i>.</i>
        </a>

        <nav className="main-nav" aria-label="Основная навигация">
          {works.length > 0 && <LiquidLink href="#works">работы</LiquidLink>}
          <LiquidLink href="#about">обо мне</LiquidLink>
          <LiquidLink href="#contact">связаться</LiquidLink>
        </nav>
      </header>

      <main id="top">
        <section
          className={`hero page-width${firstWork ? "" : " hero-no-work"}`}
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              {siteContent.role}
            </p>
            <h1 id="hero-title">
              Монтаж, который
              <span>держит внимание</span>
            </h1>
            <p className="hero-intro">{siteContent.intro}</p>

            <div className="hero-actions">
              <LiquidLink
                href={works.length ? "#works" : "#about"}
                className="button button-primary"
              >
                {works.length ? "Смотреть работы" : "Обо мне"}
                <ArrowDown aria-hidden="true" />
              </LiquidLink>
              <LiquidLink href="#contact" className="button button-secondary">
                Обсудить проект
                <ArrowUpRight aria-hidden="true" />
              </LiquidLink>
            </div>
          </div>

          {firstWork && (
            <button
              className={`featured-frame featured-frame--${firstWork.format ?? "portrait"} glass-panel`}
              type="button"
              onClick={(event) => openWork(firstWork, event.currentTarget)}
              aria-label={`Открыть ${firstWork.title}`}
            >
              <ProjectVisual work={firstWork} active={!dialogOpen} />
              <span className="featured-tag">
                {firstWork.format === "landscape" ? "Видео" : "Reel"}
                {firstWork.duration ? ` · ${firstWork.duration}` : ""}
              </span>
              {firstWork.videoUrl ? <span className="featured-play">
                <Play fill="currentColor" aria-hidden="true" />
              </span> : <span className="work-card-status">Скоро</span>}
              <span className="featured-caption">
                <small>Избранная работа</small>
                <strong>{firstWork.title}</strong>
              </span>
            </button>
          )}

          <a
            className="scroll-cue"
            href={works.length ? "#works" : "#about"}
            aria-label={works.length ? "Прокрутить к работам" : "Прокрутить к информации"}
            onClick={scrollToSection}
          >
            <span>листай</span>
            <ArrowDown aria-hidden="true" />
          </a>
        </section>

        {works.length > 0 && (
        <section className="works-section page-width" id="works" aria-labelledby="works-title">
          <div className="section-heading">
            <div>
              <p className="section-index">01 · Портфолио</p>
              <h2 id="works-title">Работы</h2>
            </div>
            <p>Каждый проект открывается в отдельном просмотре.</p>
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
                aria-label={`Открыть работу ${work.title}`}
              >
                <ProjectVisual work={work} compact active={!dialogOpen} />
                <span className="work-card-topline">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
                {work.videoUrl ? <span className="work-card-play">
                  <Play fill="currentColor" aria-hidden="true" />
                </span> : <span className="work-card-status">Скоро</span>}
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
            <p className="section-index">02 · Обо мне</p>
            <h2 id="about-title">Собираю видео вокруг смысла и ритма.</h2>
            <p>{siteContent.about}</p>
          </div>
          <div className="about-skills glass-panel" aria-label="Направления работы">
            <span>Reels и Shorts</span>
            <span>Субтитры</span>
            <span>Саунд-дизайн</span>
            <span>Motion</span>
            <span>Цвет</span>
          </div>
        </section>

        <section className="contact-section page-width" id="contact" aria-labelledby="contact-title">
          <div className="contact-card glass-panel">
            <div>
              <p className="section-index">03 · Связаться</p>
              <h2 id="contact-title">Есть задача по монтажу?</h2>
              <p>{siteContent.contactText}</p>
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
                    Написать в Telegram
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
                    Написать на почту
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </a>
              )}
              {!hasTelegram && !hasEmail && (
                <button className="button button-primary copy-button" type="button" onClick={copyBrief}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "Текст скопирован" : "Скопировать текст для сообщения"}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <span>© 2026 {siteContent.name}</span>
        <a href="#top" onClick={scrollToSection}>
          Наверх
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
          <DialogClose className="dialog-close" aria-label="Закрыть просмотр">
            <X aria-hidden="true" />
          </DialogClose>

          <div className="dialog-body">
          <div className="dialog-media">
            <ProjectMedia key={selectedWork.id} work={selectedWork} />
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
