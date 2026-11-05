"use client";

import { useEffect, useRef } from "react";

export function ScrollBackdrop({ paused = false }: { paused?: boolean }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const glow = glowRef.current;
    const orbit = orbitRef.current;
    if (!scene || !glow || !orbit) return;
    scene.dataset.motion = "off";
    if (paused) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection?.saveData;
    let frame = 0;
    let range = 1;
    let previous = -1;

    function paint() {
      frame = 0;
      if (document.hidden || preference.matches || saveData) return;
      const progress = Math.max(0, Math.min(1, window.scrollY / range));
      if (Math.abs(progress - previous) < 0.0005) return;
      previous = progress;
      glow!.style.transform = `translate3d(${-20 * progress}%, ${12 * progress}%, 0) rotate(${32 * progress}deg) scale(${1 - 0.16 * progress})`;
      orbit!.style.transform = `translate3d(${-22 * progress}%, ${-28 * progress}%, 0) rotate(${-18 + 78 * progress}deg) scale(${1.05 - 0.22 * progress})`;
      orbit!.style.opacity = String(0.18 + 0.18 * progress);
    }

    function schedule() {
      if (!frame && !document.hidden && !preference.matches && !saveData) {
        frame = window.requestAnimationFrame(paint);
      }
    }

    function measure() {
      range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      schedule();
    }

    function updatePreference() {
      const enabled = !preference.matches && !saveData;
      scene!.dataset.motion = enabled ? "on" : "off";
      if (enabled) {
        measure();
      } else {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previous = -1;
        glow!.style.transform = "";
        orbit!.style.transform = "";
        orbit!.style.opacity = "";
      }
    }

    function onVisibilityChange() {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else {
        measure();
      }
    }

    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    preference.addEventListener("change", updatePreference);
    updatePreference();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      preference.removeEventListener("change", updatePreference);
      scene!.dataset.motion = "off";
    };
  }, [paused]);

  return (
    <div ref={sceneRef} className="scroll-backdrop" aria-hidden="true">
      <div ref={glowRef} className="scroll-backdrop-glow" />
      <div ref={orbitRef} className="scroll-backdrop-orbit">
        <svg viewBox="0 0 640 640" fill="none" focusable="false">
          <ellipse cx="320" cy="320" rx="282" ry="172" transform="rotate(-24 320 320)" />
          <ellipse cx="320" cy="320" rx="254" ry="202" transform="rotate(24 320 320)" />
          <circle cx="570" cy="198" r="3" />
          <circle cx="122" cy="454" r="2" />
        </svg>
      </div>
    </div>
  );
}
