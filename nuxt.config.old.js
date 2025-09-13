import { fileURLToPath } from 'url';
import sass from 'sass';

import register from './fixtures/register.json';
import { fixtureFromRepository } from './lib/model.js';
import plugins from './plugins/plugins.json';

const ignoredSassDeprecations = [`legacy-js-api`]; // can only be fixed with Nuxt.js v3
const sassDeprecationIds = Object.values(sass.deprecations).flatMap(deprecation =>
  (deprecation.status === `active` && !ignoredSassDeprecations.includes(deprecation.id) ? [deprecation.id] : []),
);

const websiteUrl = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT || 3000}/`;

export default {
  telemetry: true,
  srcDir: `./ui/`,
  modules: [
    [`@nuxtjs/axios`, {
      browserBaseURL: `/`,
    }],
    `nuxt-helmet`,
    `cookie-universal-nuxt`,
    `@nuxtjs/robots`,
    `@nuxtjs/sitemap`,
  ],
  plugins: [
    `~/plugins/global-components.js`,
    `~/plugins/vue-form.js`,
  ],
  serverMiddleware: [
    {
      path: `/api/v1`,
      handler: `~/api/index.js`,
    },
    {
      path: `/`,
      handler: `~/api/download.js`,
    },
  ],
  helmet: {
    expectCt: false,
    hsts: {
      maxAge: 2 * 365 * 24 * 60 * 60,
      preload: true,
    },
    crossOriginEmbedderPolicy: false, // needed for Embetty poster images and video iframes
  },
  css: [
    `~/assets/styles/style.scss`,
    `embetty-vue/dist/embetty-vue.css`,
  ],
  publicRuntimeConfig: {
    websiteUrl,
    searchIndexingIsAllowed: process.env.ALLOW_SEARCH_INDEXING === `allowed`,
  },
  build: {
    quiet: false,
    loaders: {
      // condense whitespace in Vue templates
      vue: {
        compilerOptions: {
          whitespace: `condense`,
        },
      },
      // automatically `@use` global SCSS definitions
      scss: {
        additionalData: `@use "~/assets/styles/global.scss" as *;`,
        sassOptions: {
          fatalDeprecations: sassDeprecationIds,
          silenceDeprecations: ignoredSassDeprecations,
        },
      },
    },
    extend(config, context) {
      // exclude /assets/icons from url-loader
      const iconsPath = fileURLToPath(new URL(`ui/assets/icons/`, import.meta.url));
      const urlLoader = config.module.rules.find(rule => rule.test.toString().includes(`|svg|`));
      urlLoader.exclude = iconsPath;

      // include /assets/icons for svg-inline-loader
      config.module.rules.push({
        test: /\.svg$/,
        include: [iconsPath],
        loader: `svg-inline-loader`,
        options: {
          removeSVGTagAttrs: false,
        },
      });

      // Transpile a11y-dialog since optional chaining is not supported in Nuxt 2
      const javascriptRule = config.module.rules.find(rule => rule.type === `javascript/auto`);
      const originalExclude = javascriptRule.exclude;
      javascriptRule.exclude = {
        and: [
          originalExclude,
          { not: [/node_modules[/\\]a11y-dialog/] },
        ],
      };
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
    const theme = this.$cookies.get(`__Host-theme`) || this.$cookies.get(`theme`);
    const htmlAttributes = {
      lang: `en`,
      'data-theme': theme,
    };

    const titleTemplate = titleChunk => {
      // If undefined or blank then we don't need the hyphen
      return titleChunk ? `${titleChunk} – Open Fixture Library` : `Open Fixture Library`;
    };

    const canonicalUrl = this.$config.websiteUrl.slice(0, -1) + this.$route.path.replace(/\/$/, ``); // remove trailing slash

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
        hid: `theme-color`,
        name: `theme-color`,
        content: theme === `dark` ? `#383838` : `#fafafa`, // SCSS: theme-color(header-background)
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

    if (!this.$config.searchIndexingIsAllowed) {
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
      Sitemap: `${websiteUrl}sitemap.xml`,
    };
  },
  sitemap: {
    hostname: websiteUrl,
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
