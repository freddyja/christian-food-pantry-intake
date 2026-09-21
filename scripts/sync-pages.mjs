import { cpSync, existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
if (!existsSync(join(dist, "index.html"))) {
  throw new Error("dist/index.html missing — run vite build first");
}

if (existsSync("assets")) rmSync("assets", { recursive: true, force: true });

for (const name of readdirSync(dist)) {
  if (name === "dist") continue;
  cpSync(join(dist, name), name, { recursive: true });
}

writeFileSync(".nojekyll", "");
console.log("synced dist/ to repo root for GitHub Pages (main /)");
