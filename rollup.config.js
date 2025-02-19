import { readFileSync } from "fs";
import * as pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

// Extract copyrights from the LICENSE.
const copyright = readFileSync("./LICENSE", "utf-8")
  .split(/\n/g)
  .filter((line) => /^Copyright\s+/.test(line))
  .map((line) => line.replace(/^Copyright\s+/, ""))
  .join(", ");

const globals = Object.assign(
  {},
  ...Object.keys(pkg.dependencies || {})
    .filter((key) => /^d3-/.test(key))
    .map((key) => ({ [key]: "d3" })),
);
const external = Object.keys(pkg.dependencies || {}).filter((key) =>
  /^(d3-)/.test(key),
);

// standalone ES module
const config = {
  input: "src/index.ts",
  external,
  output: {
    file: `dist/${pkg.name}.js`,
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
    file: `dist/${pkg.name}.umd.js`,
    format: "umd",
  },
  plugins: [typescript()],
};

const minifiedConfig = {
  ...config,
  output: {
    ...config.output,
    file: `dist/${pkg.name}.min.js`,
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
    file: `dist/${pkg.name}.umd.min.js`,
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
