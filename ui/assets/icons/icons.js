// Read all SVG files in this directory (and subdirectories) using Vite's import.meta.glob
const svgModules = import.meta.glob('./**/*.svg', { eager: true, query: '?raw', import: 'default' });

const getIconPath = (key) => key.match(/^\.\/(.+)\.svg$/)[1];

export default Object.fromEntries(
  Object.entries(svgModules).map(([key, value]) => [getIconPath(key), value]),
);
