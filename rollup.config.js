import { readFileSync } from "fs";
import json from '@rollup/plugin-json';
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

// Read package.json manually if needed
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// Extract copyrights from the LICENSE.
const copyright = readFileSync("./LICENSE", "utf-8")
  .split(/\n/g)
  .filter((line) => /^Copyright\s+/.test(line))
  .map((line) => line.replace(/^Copyright\s+/, ""))
  .join(", ");

// Update globals to explicitly include d3-scale
const globals = {
  'd3-scale': 'd3',
  // ... existing d3 dependencies
  ...Object.assign(
    {},
    ...Object.keys(pkg.dependencies || {})
      .filter((key) => /^d3-/.test(key))
      .map((key) => ({ [key]: "d3" }))
  )
};

// Update external to explicitly include d3-scale
const external = ['d3-scale'].concat(
  Object.keys(pkg.dependencies || {}).filter((key) => /^(d3-)/.test(key))
);

// standalone ES module
const config = {
  input: "src/index.ts",
  external,
  output: {
    // Use pkg.name directly instead of template literal
    file: "dist/d3-ternary.js",
    format: "es",
    banner: `// ${pkg.homepage} v${pkg.version} Copyright ${copyright}`,
    name: "d3",
    extend: true,
    globals,
  },
  plugins: [typescript()],
};

// d3 module: d3.ternaryPlot() and d3.barycentric()
const umdConfig = {
  ...config,
  output: {
    ...config.output,
    file: "dist/d3-ternary.umd.js",
    format: "umd",
  },
  plugins: [typescript()],
};

const minifiedConfig = {
  ...config,
  output: {
    ...config.output,
    file: "dist/d3-ternary.min.js",
  },
  plugins: [
    ...config.plugins,
    terser({
      output: {
        preamble: config.output.banner,
      },
    }),
  ],
};

const minifiedUmdConfig = {
  ...umdConfig,
  output: {
    ...umdConfig.output,
    file: "dist/d3-ternary.umd.min.js",
  },
  plugins: [
    ...umdConfig.plugins,
    terser({
      output: {
        preamble: config.output.banner,
      },
    }),
  ],
};

export default [config, umdConfig, minifiedUmdConfig, minifiedConfig];
