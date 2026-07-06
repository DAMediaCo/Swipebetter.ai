import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { mkdir, rm, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  generateSitemapXml,
  INDEXABLE_ROUTES,
  NOINDEX_STATIC_ROUTES,
  publicOutputPath,
  renderSeoHtml,
} from "../functions/seo-data.js";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();
  await generateSeoHtmlFiles();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

async function generateSeoHtmlFiles() {
  console.log("generating SEO HTML...");
  const publicDir = path.resolve("dist/public");
  const indexPath = path.join(publicDir, "index.html");
  const indexHtml = await readFile(indexPath, "utf-8");
  const routes = [...INDEXABLE_ROUTES, ...NOINDEX_STATIC_ROUTES];

  for (const route of routes) {
    const outputPath = path.join(publicDir, publicOutputPath(route));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderSeoHtml(indexHtml, route));
  }

  await writeFile(path.join(publicDir, "sitemap.xml"), generateSitemapXml());
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
