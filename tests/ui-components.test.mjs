import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits dialog transitions and reduced-motion styles", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /--tw-enter-opacity/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("portfolio content has unique IDs, supported formats and existing local assets", async () => {
  const { works } = await vite.ssrLoadModule("/app/portfolio-content.ts");
  assert.equal(new Set(works.map((work) => work.id)).size, works.length);
  for (const work of works) {
    assert.ok(["portrait", "landscape"].includes(work.format ?? "portrait"));
    for (const asset of [work.videoUrl, work.posterUrl]) {
      if (asset?.startsWith("/") && !asset.startsWith("//")) {
        await access(path.join(root, "public", asset));
      }
    }
  }
});

test("supports landscape as the featured case and omits empty format groups", async () => {
  const { works } = await vite.ssrLoadModule("/app/portfolio-content.ts");
  const { default: Home } = await vite.ssrLoadModule("/app/page.tsx");
  const originals = [...works];
  try {
    works.splice(0, works.length, {
      id: "test-landscape", format: "landscape", title: "Wide test",
      category: "Test", description: "Test", details: [], tone: "blue",
    });
    const html = renderToStaticMarkup(React.createElement(Home));
    assert.match(html, /featured-frame--landscape/);
    assert.match(html, /Горизонтальные видео/);
    assert.doesNotMatch(html, /Вертикальные видео/);
    assert.doesNotMatch(html, /(?:src|poster)=""/);

    delete works[0].format;
    const legacyHtml = renderToStaticMarkup(React.createElement(Home));
    assert.match(legacyHtml, /Вертикальные видео/);
    assert.doesNotMatch(legacyHtml, /Горизонтальные видео/);

    works.splice(0);
    const emptyHtml = renderToStaticMarkup(React.createElement(Home));
    assert.doesNotMatch(emptyHtml, /id="works"/);
    assert.match(emptyHtml, /id="contact"/);
  } finally {
    works.splice(0, works.length, ...originals);
  }
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});
