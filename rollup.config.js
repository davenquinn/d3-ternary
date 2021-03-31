import babel from "@rollup/plugin-babel";
import * as pkg from "./package.json";
import { terser } from "rollup-plugin-terser";

const config = {
  input: "src/index.js",
  external: Object.keys(pkg.dependencies || {}).filter(key => /^(d3-)/.test(key)),
  output: {
    file: `dist/${pkg.name}.js`,
    // dir: 'output',
    format: "esm",
    banner: `// ${pkg.homepage} v${
      pkg.version
    } Copyright ${new Date().getFullYear()} ${pkg.author.name}`,
  },
  plugins: [ babel({ babelHelpers: "bundled", exclude: "node_modules/**" })],
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

export default [
  config,
  minifiedConfig
];
