module.exports = {
  ci: {
    collect: {
      startServerCommand: `npm run start`,
      startServerReadyPattern: `Nuxt.js is ready.`,
      startServerReadyTimeout: 20_000,
    },
  },
};
