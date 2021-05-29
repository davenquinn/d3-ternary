import * as pkg from "./package.json";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const globals = Object.assign({}, ...Object.keys(pkg.dependencies || {}).filter(key => /^d3-/.test(key)).map(key => ({[key]: "d3"})))
const external = Object.keys(pkg.dependencies || {}).filter((key) =>/^(d3-)/.test(key));
// console.log({ globals ,external });

// standalone ES module
const config = {
  input: "src/index.ts",
  output: {
    file: `dist/${pkg.name}.mjs`,
    format: "es",
    banner: `// ${pkg.homepage} v${pkg.version} Copyright ${new Date().getFullYear()} ${pkg.author.name}`,
    name: "d3",
    extend: true,
    globals
  },
  plugins: [ nodeResolve(), typescript()],
};

// d3 module: d3.ternaryPlot() and d3.barycentric()
const umdConfig = {
  ...config,
  external: Object.keys(pkg.dependencies || {}).filter((key) =>
    /^(d3-)/.test(key)
  ),
  output: {
    ...config.output,
    file: `dist/${pkg.name}.umd.js`,
    format: "umd"
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
