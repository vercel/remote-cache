import { defineConfig } from "tsup";
import type { Options } from "tsup";

// eslint-disable-next-line import/no-default-export
export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  ...options,
}));