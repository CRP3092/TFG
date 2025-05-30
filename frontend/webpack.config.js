const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"), // 🔹 Genera `bundle.js` en `dist/`
    filename: "bundle.js",
  },
  mode: "development",
};
