"use client";

import { useMemo, useState } from "react";
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
      return {
        kind: "embed" as const,
        src: `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`,
      };
    }

    if (host.endsWith("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) {
        return {
          kind: "embed" as const,
          src: `https://www.youtube-nocookie.com/embed/${id}`,
        };
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return { kind: "embed" as const, src: url };
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return {
          kind: "embed" as const,
          src: `https://www.youtube-nocookie.com/embed/${parsed.pathname.split("/")[2]}`,
        };
      }
    }

    if (
      host.endsWith("vimeo.com") ||
      host.endsWith("vkvideo.ru") ||
      host.endsWith("vk.com")
    ) {
      return { kind: "embed" as const, src: url };
    }
  } catch {
    return { kind: "file" as const, src: url };
  }

  return { kind: "file" as const, src: url };
}

function ProjectVisual({
  work,
  compact = false,
}: {
  work: PortfolioWork;
  compact?: boolean;
}) {
  return (
    <div
      className={`project-visual project-visual-${work.tone}${compact ? " is-compact" : ""}`}
      aria-hidden="true"
    >
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

function ProjectMedia({ work }: { work: PortfolioWork }) {
  const source = useMemo(() => getVideoSource(work.videoUrl ?? ""), [work.videoUrl]);

  if (!source) return <ProjectVisual work={work} />;

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
    <a className={`liquid-link ${className}`} href={href}>
      <span>{children}</span>
    </a>
  );
}

export default function Home() {
  const firstWork = works[0] ?? null;
  const [selectedWork, setSelectedWork] = useState<PortfolioWork | null>(firstWork);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasTelegram = Boolean(siteContent.telegramUrl);
  const hasEmail = Boolean(siteContent.email);

  function openWork(work: PortfolioWork) {
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
        <a className="brand" href="#top" aria-label="В начало страницы">
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
              className="featured-frame glass-panel"
              type="button"
              onClick={() => openWork(firstWork)}
              aria-label={`Открыть ${firstWork.title}`}
            >
              <ProjectVisual work={firstWork} />
              <span className="featured-tag">
                Reel
                {firstWork.duration ? ` · ${firstWork.duration}` : ""}
              </span>
              <span className="featured-play">
                <Play fill="currentColor" aria-hidden="true" />
              </span>
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

          <div
            className={`works-grid works-count-${Math.min(works.length, 4)}`}
            aria-label="Список работ"
          >
            {works.map((work, index) => (
              <button
                className="work-card glass-panel"
                type="button"
                key={work.id}
                onClick={() => openWork(work)}
                aria-label={`Открыть работу ${work.title}`}
              >
                <ProjectVisual work={work} compact />
                <span className="work-card-topline">
                  <span>0{index + 1}</span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
                <span className="work-card-play">
                  <Play fill="currentColor" aria-hidden="true" />
                </span>
                <span className="work-card-copy">
                  <strong>{work.title}</strong>
                  <small>{work.category}</small>
                </span>
              </button>
            ))}
          </div>
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
        <a href="#top">Наверх</a>
      </footer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedWork && (
        <DialogContent className="project-dialog" showCloseButton={false}>
          <DialogClose className="dialog-close" aria-label="Закрыть просмотр">
            <X aria-hidden="true" />
          </DialogClose>

          <div className="dialog-media">
            <ProjectMedia work={selectedWork} />
          </div>

          <div className="dialog-copy">
            <p className="section-index">{selectedWork.category}</p>
            <DialogTitle>{selectedWork.title}</DialogTitle>
            <DialogDescription>{selectedWork.description}</DialogDescription>
            <div className="detail-list">
              {selectedWork.details.map((detail) => (
                <span key={detail}>{detail}</span>
              ))}
            </div>
          </div>
        </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
