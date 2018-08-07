const path = require(`path`);

module.exports = {
  srcDir: `ui/`,
  modules: [
    [`@nuxtjs/axios`, {
      browserBaseURL: `/`
    }]
  ],
  plugins: [
    `~/plugins/draggable.js`,
    {
      src: `~/plugins/focus-directive.js`,
      ssr: false
    },
    {
      src: `~/plugins/polyfills.js`,
      ssr: false
    },
    `~/plugins/vue-form.js`
  ],
  build: {
    vendor: [
      `~~/fixtures/register.json`,
      `~~/fixtures/manufacturers.json`,
      `~/components/svg.vue`
    ],
    extend(config, ctx) {
      // exclude /assets/icons from url-loader
      const urlLoader = config.module.rules.find(rule => rule.loader === `url-loader`);
      urlLoader.exclude = /assets\/icons/;

      // include /assets/icons for svg-inline-loader
      config.module.rules.push({
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, `ui/assets/icons`)
        ],
        loader: `svg-inline-loader`,
        options: {
          removeSVGTagAttrs: false
        }
      });

      // include .mjs files for babel-loader
      const babelLoader = config.module.rules.find(rule => rule.loader === `babel-loader`);
      babelLoader.test = /\.jsx?$|\.mjs$/;
    }
  },
  loading: {
    color: `#1e88e5`
  },
  head() {
    const htmlAttrs = {
      lang: `en`
    };

    const titleTemplate = titleChunk => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} – Open Fixture Library` : `Open Fixture Library`;
    };

    const meta = [
      {
        charset: `utf-8`
      },
      {
        name: `viewport`,
        content: `width=device-width, initial-scale=1.0`
      },
      {
        name: `mobile-web-app-capable`,
        content: `yes`
      }
    ];

    if (process.env.ALLOW_SEARCH_INDEXING !== `allowed`) {
      meta.push({
        name: `robots`,
        content: `noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache`
      });
    }

    const path = this.$route.path.replace(/\/$/, ``); // remove trailing slash

    const link = [
      {
        rel: `canonical`,
        href: `https://open-fixture-library.org${path}`
      },
      {
        rel: `apple-touch-icon`,
        sizes: `180x180`,
        href: `/apple-touch-icon.png`
      },
      {
        rel: `icon`,
        type: `image/png`,
        href: `/favicon-32x32.png`,
        sizes: `32x32`
      },
      {
        rel: `icon`,
        type: `image/png`,
        href: `/favicon-16x16.png`,
        sizes: `16x16`
      },
      {
        rel: `manifest`,
        href: `/manifest.json`
      },
      {
        rel: `mask-icon`,
        href: `/safari-pinned-tab.svg`,
        color: `#64b5f6`
      },
      {
        rel: `preload`,
        href: `/fonts/LatoLatin/LatoLatin-Regular.woff2`,
        as: `font`,
        type: `font/woff2`
      },
      {
        rel: `preload`,
        href: `/fonts/LatoLatin/LatoLatin-Regular.woff`,
        as: `font`,
        type: `font/woff`
      }
    ];

    return {
      htmlAttrs,
      titleTemplate,
      meta,
      link
    };
  },
  css: [`~/assets/styles/style.scss`]
};
