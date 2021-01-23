import path from 'path';

import plugins from './plugins/plugins.json';
import register from './fixtures/register.json';
import { fixtureFromRepository } from './lib/model.js';

export default {
  srcDir: `./ui/`,
  modules: [
    [`@nuxtjs/axios`, {
      browserBaseURL: `/`,
    }],
    `cookie-universal-nuxt`,
    `@nuxtjs/robots`,
    `@nuxtjs/sitemap`,
  ],
  plugins: [
    `~/plugins/embetty-vue.js`,
    `~/plugins/global-components.js`,
    {
      src: `~/plugins/polyfills.js`,
      ssr: false,
    },
    `~/plugins/vue-form.js`,
    {
      src: `~/plugins/vue-smooth-scroll.js`,
      ssr: false,
    },
  ],
  css: [
    `~/assets/styles/style.scss`,
    `embetty-vue/dist/embetty-vue.css`,
  ],
  build: {
    extend(config, context) {
      // exclude /assets/icons from url-loader
      const urlLoader = config.module.rules.find(rule => `use` in rule && rule.use[0].loader === `url-loader`);
      urlLoader.exclude = path.resolve(__dirname, `ui/assets/icons`);

      // include /assets/icons for svg-inline-loader
      config.module.rules.push({
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, `ui/assets/icons`),
        ],
        loader: `svg-inline-loader`,
        options: {
          removeSVGTagAttrs: false,
        },
      });

      // condense whitespace in Vue templates
      const vueLoader = config.module.rules.find(rule => rule.loader === `vue-loader`);
      vueLoader.options.compilerOptions = {
        preserveWhitespace: false,
        whitespace: `condense`,
      };

      // automatically `@use` global SCSS definitions
      const scssRule = config.module.rules.find(rule => rule.test.toString() === `/\\.scss$/i`);
      scssRule.oneOf.forEach(({ use }) => {
        const sassLoader = use.find(({ loader }) => loader === `sass-loader`);
        sassLoader.options.additionalData = `@use "~/assets/styles/global.scss" as *;`;
      });
    },
  },
  render: {
    csp: {
      policies: {
        'default-src': [`'none'`],
        'script-src': [`'unsafe-eval'`], // needed because of https://github.com/nuxt/nuxt.js/pull/7454
        'style-src': [`'self'`, `'unsafe-inline'`],
        'img-src': [`'self'`, `https://*.open-fixture-library.org`, `https://*.ytimg.com`, `data:`],
        'frame-src': [`'self'`, `https://*.vimeo.com`, `*.youtube-nocookie.com`, `https://www.facebook.com`],
        'font-src': [`'self'`],
        'connect-src': [`'self'`],
        'manifest-src': [`'self'`],
        'media-src': [`*`], // allow all videos
        'form-action': [`'self'`],
        'frame-ancestors': [`'none'`],
        'object-src': [`'none'`],
        'base-uri': [`'self'`],
      },
    },
  },
  loading: {
    color: `#1e88e5`,
  },
  head() {
    const htmlAttributes = {
      lang: `en`,
      'data-theme': this.$cookies.get(`__Host-theme`) || this.$cookies.get(`theme`),
    };

    const titleTemplate = titleChunk => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} – Open Fixture Library` : `Open Fixture Library`;
    };

    const websiteUrl = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT}/`;
    const canonicalUrl = websiteUrl.slice(0, -1) + this.$route.path.replace(/\/$/, ``); // remove trailing slash

    const meta = [
      {
        charset: `utf-8`,
      },
      {
        name: `viewport`,
        content: `width=device-width, initial-scale=1.0`,
      },
      {
        name: `mobile-web-app-capable`,
        content: `yes`,
      },
      {
        // this enables Twitter link previews
        name: `twitter:card`,
        content: `summary`,
      },
      {
        hid: `url`,
        property: `og:url`,
        content: canonicalUrl,
      },
      {
        hid: `type`,
        property: `og:type`,
        content: `website`,
      },
      {
        hid: `site_name`,
        property: `og:site_name`,
        content: `Open Fixture Library`,
      },
      {
        hid: `locale`,
        property: `og:locale`,
        content: `en_US`,
      },
      {
        hid: `determiner`,
        property: `og:determiner`,
        content: `the`,
      },
      {
        hid: `description`,
        property: `og:description`,
        content: `Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!`,
      },
      {
        hid: `title`,
        property: `og:title`,
        content: ``,
        template: titleTemplate,
      },
      {
        hid: `image`,
        property: `og:image`,
        content: `https://open-fixture-library.org/open-graph.png`,
      },
      {
        hid: `image_type`,
        property: `og:image:type`,
        content: `image/png`,
      },
      {
        hid: `image_width`,
        property: `og:image:width`,
        content: `1280`,
      },
      {
        hid: `image_height`,
        property: `og:image:height`,
        content: `640`,
      },
    ];

    if (process.env.ALLOW_SEARCH_INDEXING !== `allowed`) {
      meta.push({
        name: `robots`,
        content: `noindex, nofollow, none, noodp, noarchive, nosnippet, noimageindex, noydir, nocache`,
      });
    }

    const link = [
      {
        rel: `canonical`,
        href: canonicalUrl,
      },
      {
        rel: `apple-touch-icon`,
        sizes: `180x180`,
        href: `/apple-touch-icon.png`,
      },
      {
        rel: `icon`,
        type: `image/png`,
        href: `/favicon-32x32.png`,
        sizes: `32x32`,
      },
      {
        rel: `icon`,
        type: `image/png`,
        href: `/favicon-16x16.png`,
        sizes: `16x16`,
      },
      {
        rel: `manifest`,
        href: `/manifest.json`,
      },
      {
        rel: `mask-icon`,
        href: `/safari-pinned-tab.svg`,
        color: `#64b5f6`,
      },
      {
        rel: `preload`,
        href: `/fonts/LatoLatin/LatoLatin-Regular.woff2`,
        as: `font`,
        type: `font/woff2`,
      },
      {
        rel: `preload`,
        href: `/fonts/LatoLatin/LatoLatin-Regular.woff`,
        as: `font`,
        type: `font/woff`,
      },
    ];

    return {
      htmlAttrs: htmlAttributes,
      titleTemplate,
      meta,
      link,
    };
  },
  robots() {
    if (process.env.ALLOW_SEARCH_INDEXING !== `allowed`) {
      return {
        UserAgent: `*`,
        Disallow: `/`,
      };
    }

    return {
      UserAgent: `*`,
      Disallow: plugins.exportPlugins.map(pluginKey => `/*.${pluginKey}$`),
      Allow: `/`,
      Sitemap: `${process.env.WEBSITE_URL}sitemap.xml`,
    };
  },
  sitemap: {
    hostname: process.env.WEBSITE_URL,
    gzip: true,
    async routes() {
      const staticUrls = [
        { url: `/`, changefreq: `daily` },
        { url: `/fixture-editor`, changefreq: `monthly` },
        { url: `/import-fixture-file`, changefreq: `monthly` },
        { url: `/manufacturers`, changefreq: `monthly` },
        { url: `/categories`, changefreq: `monthly` },
        { url: `/about`, changefreq: `monthly` },
        { url: `/about/plugins`, changefreq: `monthly` },
        { url: `/rdm`, changefreq: `yearly` },
        { url: `/search`, changefreq: `yearly` },
      ];

      const manufacturerUrlPromises = Object.keys(register.manufacturers).flatMap(manufacturerKey => [
        Promise.resolve({ url: `/${manufacturerKey}`, changefreq: `weekly` }),

        // fixture URLs
        ...register.manufacturers[manufacturerKey].map(async fixtureKey => {
          const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);
          return {
            url: `/${manufacturerKey}/${fixtureKey}`,
            changefreq: `monthly`,
            lastmod: fixture.meta.lastModifyDate.toISOString(),
          };
        }),
      ]);

      const categoryUrls = Object.keys(register.categories).map(
        category => ({ url: `/categories/${category}`, changefreq: `weekly` }),
      );

      const pluginUrls = Object.keys(plugins.data).filter(key => !plugins.data[key].outdated).map(
        pluginKey => ({ url: `/about/plugins/${pluginKey}`, changefreq: `monthly` }),
      );

      return [
        ...staticUrls,
        ...await Promise.all(manufacturerUrlPromises),
        ...categoryUrls,
        ...pluginUrls,
      ];
    },
  },
};
