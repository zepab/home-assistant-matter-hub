import { distDir } from "@home-assistant-matter-hub/build-utils";
import * as fs from "node:fs";
import * as path from "node:path";

const packageDist = distDir("home-assistant-matter-hub");
const filename = fs
  .readFileSync(path.join(packageDist, "package-name.txt"), "utf-8")
  .trim();

const packagePath = path.join(packageDist, filename);
const destination = path.join(import.meta.dirname, "package.tgz");

fs.copyFileSync(packagePath, destination);
console.log(`Copied ${packagePath} to ${destination}`);
