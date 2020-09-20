const icons = {};

// read all SVG files in this directory (and subdirectories) into icons object
// see https://webpack.js.org/guides/dependency-management/#requirecontext
const resolve = require.context(`.`, true, /\.svg$/);
resolve.keys().forEach(key => {
  const [, path] = key.match(/^\.\/(.+)\.svg$/);
  icons[path] = resolve(key);
});

export default icons;
