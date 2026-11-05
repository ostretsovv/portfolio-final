"use client";

import { useSyncExternalStore } from "react";
import type { Language } from "./portfolio-content";

const storageKey = "viktor-portfolio-language";
const listeners = new Set<() => void>();
let currentLanguage: Language | undefined;

function isLanguage(value: unknown): value is Language {
  return value === "ru" || value === "en";
}

function browserLanguage(): Language {
  const preferred = navigator.languages?.[0] || navigator.language;
  return preferred?.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function getSnapshot(): Language {
  if (currentLanguage) return currentLanguage;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (isLanguage(saved)) return (currentLanguage = saved);
  } catch {
    // Переключение работает и при недоступном хранилище браузера.
  }
  return (currentLanguage = browserLanguage());
}

function getServerSnapshot(): Language {
  return "ru";
}

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    currentLanguage = isLanguage(event.newValue) ? event.newValue : browserLanguage();
    notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setLanguage(language: Language) {
  currentLanguage = language;
  try {
    window.localStorage.setItem(storageKey, language);
  } catch {
    // В приватном режиме сохраняем выбор на время текущего посещения.
  }
  notify();
}

export function usePortfolioLanguage() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [language, setLanguage] as const;
}
