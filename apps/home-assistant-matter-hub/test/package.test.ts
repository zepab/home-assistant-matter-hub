import { describe, expect, it } from "vitest";
import own from "../package.json";
import backend from "@home-assistant-matter-hub/backend/package.json";
import common from "@home-assistant-matter-hub/common/package.json";
import _ from "lodash";
import * as fs from "node:fs";
import * as path from "node:path";

describe("home-assistant-matter-hub", () => {
  it("should include all necessary dependencies", () => {
    const expected = _.pickBy(
      { ...backend.dependencies, ...common.dependencies },
      (_, key) => !key.startsWith("@home-assistant-matter-hub/"),
    );
    expect(own.dependencies).toEqual(expected);
  });

  it("should use the same readme as the root project", () => {
    const rootReadme = fs.readFileSync(
      path.join(__dirname, "../../../README.md"),
      "utf-8",
    );
    const packageReadme = fs.readFileSync(
      path.join(__dirname, "../README.md"),
      "utf-8",
    );
    expect(packageReadme).toEqual(rootReadme);
  });

  it("should use the same readme as the about page", () => {
    const packageReadme = fs.readFileSync(
      path.join(__dirname, "../README.md"),
      "utf-8",
    );
    const aboutPage = fs.readFileSync(
      require.resolve(
        "@home-assistant-matter-hub/documentation/pages/About.md",
      ),
      "utf-8",
    );
    expect(packageReadme).toEqual(aboutPage);
  });

  it("should use the same License as the root project", () => {
    const rootReadme = fs.readFileSync(
      path.join(__dirname, "../../../LICENSE"),
      "utf-8",
    );
    const packageReadme = fs.readFileSync(
      path.join(__dirname, "../LICENSE"),
      "utf-8",
    );
    expect(packageReadme).toEqual(rootReadme);
  });
});
