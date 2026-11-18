import { defineNuxtPlugin, useHead, useRuntimeConfig } from '#app';

const robotsDisabledValue = 'noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache';

// Master emitted a `robots` meta tag only while search indexing was disabled
// (and never the positive `index, follow` variant that `@nuxtjs/robots`
// defaults to).
export default defineNuxtPlugin({
  name: 'robots-meta',
  parallel: true,
  setup() {
    const { searchIndexingIsAllowed } = useRuntimeConfig().public;

    if (!searchIndexingIsAllowed) {
      useHead({
        meta: [
          { name: 'robots', content: robotsDisabledValue },
        ],
      });
    }
  },
});
