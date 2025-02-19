import { readFileSync } from "fs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import meta from "./package.json" with { type: "json" };

// Extract copyrights from the LICENSE.
const copyright = readFileSync("./LICENSE", "utf-8")
  .split(/\n/g)
  .filter((line) => /^Copyright\s+/.test(line))
  .map((line) => line.replace(/^Copyright\s+/, ""))
  .join(", ");

// Create banner text once
const BANNER = `// ${meta.name} v${meta.version} Copyright ${copyright}`;

// Base globals configuration
const globals = {
  "d3-scale": "d3",
  ...Object.assign(
    {},
    ...Object.keys(meta.dependencies || {})
      .filter((key) => /^d3-/.test(key))
      .map((key) => ({ [key]: "d3" })),
  ),
};

// Base external dependencies
const external = ["d3-scale"];

// Base configuration shared across all builds
const baseConfig = {
  input: "src/index.ts",
  output: {
    name: "d3",
    extend: true,
    banner: BANNER,
    sourcemap: true,
  },
};

// ES module for npm (with external dependencies)
const esmConfig = {
  ...baseConfig,
  external,
  output: {
    ...baseConfig.output,
    file: "dist/d3-ternary.js",
    format: "es",
    globals,
  },
  plugins: [typescript(), json()],
};

// ES module for browser (bundled dependencies)
const esmBrowserConfig = {
  ...baseConfig,
  external: [],
  output: {
    ...baseConfig.output,
    file: "dist/d3-ternary.bundle.js",
    format: "es",
  },
  plugins: [nodeResolve(), typescript()],
};

// UMD module
const umdConfig = {
  ...baseConfig,
  external,
  output: {
    ...baseConfig.output,
    file: "dist/d3-ternary.umd.js",
    format: "umd",
    globals,
  },
  plugins: [typescript()],
};

// Helper function to create minified config
const createMinifiedConfig = (config, suffix) => ({
  ...config,
  output: {
    ...config.output,
    file: config.output.file.replace(".js", suffix),
  },
  plugins: [
    ...config.plugins,
    terser({
      output: {
        preamble: BANNER,
      },
    }),
  ],
});

// Create minified versions
const minifiedConfig = createMinifiedConfig(esmConfig, ".min.js");
const minifiedUmdConfig = createMinifiedConfig(umdConfig, ".min.js");

export default [
  esmConfig,
  esmBrowserConfig,
  umdConfig,
  minifiedUmdConfig,
  minifiedConfig,
];
