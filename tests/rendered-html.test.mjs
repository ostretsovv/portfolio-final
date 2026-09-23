import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const root = new URL("../dist/client/", import.meta.url);

test("exports a Russian portfolio that renders before JavaScript loads", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /<html lang="ru"/);
  assert.match(html, /<h1\b[^>]*id="hero-title"/);
  assert.match(html, /id="works"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, /(?:src|poster)=""/);

  // Проверяем реальные ссылки в готовой странице, включая пользовательские обложки.
  const assets = [...html.matchAll(/(?:src|poster|href)="(\/(?:assets|posters|videos)\/[^"?]+)(?:\?[^"<]*)?"/g)];
  for (const [, asset] of assets) {
    await access(new URL(asset.slice(1), root));
  }
});
