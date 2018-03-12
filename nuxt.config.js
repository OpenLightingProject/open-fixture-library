const path = require(`path`);

const nuxtOptions = {
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
    }
  },
  loading: {
    color: `#1e88e5`
  },
  head: {
    htmlAttrs: {
      lang: `en`
    },
    titleTemplate: titleChunk => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} – Open Fixture Library` : `Open Fixture Library`;
    },
    meta: [
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
    ],
    link: [
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
      }
    ]
  },
  css: [`~/assets/styles/style.scss`]
};

if (process.env.ALLOW_SEARCH_INDEXING !== `allowed`) {
  nuxtOptions.head.meta.push({
    name: `robots`,
    content: `noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache`
  });
}

module.exports = nuxtOptions;
