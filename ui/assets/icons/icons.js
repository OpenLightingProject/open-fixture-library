// read all SVG files in this directory (and subdirectories) into icons object
// see https://webpack.js.org/guides/dependency-management/#requirecontext
// eslint-disable-next-line unicorn/prefer-module
const resolve = require.context(`.`, true, /\.svg$/);

const getIconPath = key => key.match(/^\.\/(.+)\.svg$/)[1];

export default Object.fromEntries(resolve.keys().map(
  key => [getIconPath(key), resolve(key)],
));
