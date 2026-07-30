import type { Plugin } from "vite";
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Minimal sites Vite plugin stub for local development.
 * In the OpenAI Sites platform this is provided by the build system.
 */
export function sites(): Plugin {
  return {
    name: "sites-vite-plugin",
    async closeBundle() {
      const projectRoot = process.cwd();
      const manifestDir = resolve(projectRoot, "dist/.openai");

      await mkdir(manifestDir, { recursive: true });
      await copyFile(
        resolve(projectRoot, ".openai/hosting.json"),
        resolve(manifestDir, "hosting.json"),
      );
    },
  };
}
