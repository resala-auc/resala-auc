import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { renderPage } from "../src/render.mjs";
import { renderApplyPage } from "../src/apply-page.ts";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await mkdir("dist/apply", { recursive: true });
await writeFile("dist/index.html", renderPage(), "utf8");
await writeFile("dist/apply/index.html", renderApplyPage(), "utf8");
await writeFile("dist/.nojekyll", "", "utf8");
await cp("src/styles.css", "dist/styles.css");
await cp("src/app.js", "dist/app.js");
await cp("src/spreadsheet-config.js", "dist/spreadsheet-config.js");
await cp("The brand System", "dist/The brand System", { recursive: true });

const applyConfigSource = await readFile("src/apply-config.ts", "utf8");
const applySource = await readFile("src/apply.ts", "utf8");

await writeFile("dist/apply-config.js", stripTypeScriptTypes(applyConfigSource), "utf8");
await writeFile("dist/apply.js", stripTypeScriptTypes(applySource), "utf8");

console.log("Built static site to dist/");
