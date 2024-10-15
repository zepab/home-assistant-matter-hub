import * as path from "node:path";
import * as fs from "node:fs";

import { rimraf } from "rimraf";
import { distDir } from "@home-assistant-matter-hub/build-utils";

const dist = path.resolve(import.meta.dirname, "dist");

await rimraf(dist);

await copyDist(
  distDir("@home-assistant-matter-hub/frontend"),
  path.join(dist, "frontend"),
);

await copyDist(
  distDir("@home-assistant-matter-hub/backend"),
  path.join(dist, "backend"),
);

async function copyDist(source, destination) {
  process.stdout.write(
    `Copy ${path.relative(import.meta.dirname, source)} to ${path.relative(import.meta.dirname, destination)}... `,
  );
  fs.cpSync(source, destination, {
    recursive: true,
  });
  process.stdout.write("Done\n");
}
