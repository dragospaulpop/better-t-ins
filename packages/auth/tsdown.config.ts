import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/**/*.tsx",
  sourcemap: true,
  dts: true,
});
