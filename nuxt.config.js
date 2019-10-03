const path = require(`path`);

module.exports = {
  srcDir: `./ui/`,
  modules: [
    [`@nuxtjs/axios`, {
      browserBaseURL: `/`
    }],
    `@nuxtjs/style-resources`
  ],
  plugins: [
    `~/plugins/embetty-vue.js`,
    {
      src: `~/plugins/polyfills.js`,
      ssr: false
    },
    `~/plugins/vue-form.js`
  ],
  css: [
    `~/assets/styles/style.scss`,
    `embetty-vue/dist/embetty-vue.css`
  ],
  styleResources: {
    scss: [
      `~/assets/styles/vars.scss`,
      `~/assets/styles/theming.scss`,
      `~/assets/styles/mixins.scss`
    ]
  },
  build: {
    extend(config, ctx) {
      // exclude /assets/icons from url-loader
      const urlLoader = config.module.rules.find(rule => `use` in rule && rule.use[0].loader === `url-loader`);
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

      // condense whitespace in Vue templates
      const vueLoader = config.module.rules.find(rule => rule.loader === `vue-loader`);
      vueLoader.options.compilerOptions = {
        preserveWhitespace: false,
        whitespace: `condense`
      };
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

    const websitePath = this.$route.path.replace(/\/$/, ``); // remove trailing slash
    const canonicalUrl = `https://open-fixture-library.org${websitePath}`;

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
      },
      {
        // this enables Twitter link previews
        name: `twitter:card`,
        content: `summary`
      },
      {
        hid: `url`,
        property: `og:url`,
        content: canonicalUrl
      },
      {
        hid: `type`,
        property: `og:type`,
        content: `website`
      },
      {
        hid: `site_name`,
        property: `og:site_name`,
        content: `Open Fixture Library`
      },
      {
        hid: `locale`,
        property: `og:locale`,
        content: `en_US`
      },
      {
        hid: `determiner`,
        property: `og:determiner`,
        content: `the`
      },
      {
        hid: `description`,
        property: `og:description`,
        content: `Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!`
      },
      {
        hid: `title`,
        property: `og:title`,
        content: ``,
        template: titleTemplate
      },
      {
        hid: `image`,
        property: `og:image`,
        content: `https://open-fixture-library.org/open-graph.png`
      },
      {
        hid: `image_type`,
        property: `og:image:type`,
        content: `image/png`
      },
      {
        hid: `image_width`,
        property: `og:image:width`,
        content: `1280`
      },
      {
        hid: `image_height`,
        property: `og:image:height`,
        content: `640`
      }
    ];

    if (process.env.ALLOW_SEARCH_INDEXING !== `allowed`) {
      meta.push({
        name: `robots`,
        content: `noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache`
      });
    }

    const link = [
      {
        rel: `canonical`,
        href: canonicalUrl
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
  }
};
