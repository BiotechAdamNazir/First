#!/usr/bin/env node
// Batch-render posters to PNG with a headless browser.
//
//   node render.js                 -> every template × every size into samples/
//   node render.js posts.json      -> the posts listed in posts.json into out/
//
// posts.json format (see examples/posts.example.json):
//   { "brand": { ...optional brand overrides... },
//     "posts": [ { "template": "promo", "size": "story", "name": "optional-file-name",
//                  "values": { "big": "20%", ... } } ] }
// `size` may also be "all". Any field you leave out uses the template's example text.
//
// Needs Playwright:  npm install   (inside this folder)  then  npx playwright install chromium
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (e) {
  console.error("Playwright not found. Run `npm install` in the marketing/ folder first.");
  process.exit(1);
}

async function main() {
  const input = process.argv[2];
  const page = await openStudio();
  const { templates, sizes } = await page.evaluate(() => ({ templates: window.PosterStudio.templates, sizes: window.PosterStudio.sizes }));

  let jobs, outDir, brand;
  if (input) {
    const spec = JSON.parse(fs.readFileSync(input, "utf8"));
    brand = spec.brand || {};
    outDir = path.join(__dirname, "out");
    jobs = [];
    (spec.posts || []).forEach((p, i) => {
      const list = !p.size || p.size === "all" ? Object.keys(sizes) : [p.size];
      list.forEach((s) =>
        jobs.push({ template: p.template, size: s, values: p.values || {}, file: `${p.name || `${String(i + 1).padStart(2, "0")}-${p.template}`}-${s}.png` })
      );
    });
  } else {
    brand = {};
    outDir = path.join(__dirname, "samples");
    jobs = templates.flatMap((t) => Object.keys(sizes).map((s) => ({ template: t.id, size: s, values: {}, file: `${t.id}-${s}.png` })));
  }

  fs.mkdirSync(outDir, { recursive: true });
  for (const job of jobs) {
    const { w, h } = await page.evaluate((j) => window.PosterStudio.mount(j), { ...job, brand });
    await page.setViewportSize({ width: w, height: h });
    await page.locator("#render-root .poster").screenshot({ path: path.join(outDir, job.file) });
    console.log("✓", path.relative(process.cwd(), path.join(outDir, job.file)));
  }
  await page.context().browser().close();
}

async function openStudio() {
  const opts = {};
  // Use a pre-installed Chromium if one is provided (e.g. in CI / cloud sandboxes).
  if (process.env.CHROMIUM_PATH) opts.executablePath = process.env.CHROMIUM_PATH;
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(pathToFileURL(path.join(__dirname, "index.html")).href + "?render=1");
  await page.waitForFunction(() => window.PosterStudio);
  return page;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
