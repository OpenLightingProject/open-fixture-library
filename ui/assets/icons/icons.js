const icons = import.meta.glob('./*.svg', { query: '?raw', import: 'default', eager: true });
const fixtureIcons = import.meta.glob('./fixture/*.svg', { query: '?raw', import: 'default', eager: true });
const capabilityIcons = import.meta.glob('./capability*.svg', { query: '?raw', import: 'default', eager: true });

const allIcons = {
  ...icons,
  ...fixtureIcons,
  ...capabilityIcons,
};

export default Object.fromEntries(
  Object.entries(allIcons).map(([key, value]) => [key.replace(/^\.\/(.+)\.svg$/, '$1'), value])
);
