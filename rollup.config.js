import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";
import { visualizer } from "rollup-plugin-visualizer";
import macros from "unplugin-parcel-macros";

const isVisualize = process.env.VISUALIZE === "true";

/** Rollup only matches exact strings in external[]; subpaths like @react-spectrum/s2/icons/Copy must be external too. */
function isExternal(id) {
  if (id === "react" || id === "react-dom" || id === "markdown-to-jsx") {
    return true;
  }
  if (id.startsWith("react/")) {
    return true;
  }
  if (id.startsWith("@react-spectrum/s2")) {
    return true;
  }
  return false;
}

export default {
  input: ["client/index.js"],
  output: [
    {
      dir: "dist/cjs",
      format: "cjs"
    },
    {
      dir: "dist/esm",
      format: "esm"
    }
  ],
  external: isExternal,
  plugins: [
    macros.rollup(),
    resolve({
      preferBuiltins: true
    }),
    babel({ babelHelpers: "bundled" }),
    postcss(),
    ...(isVisualize ? [visualizer({ open: true })] : [])
  ]
};
