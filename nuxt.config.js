import sass from 'sass';
import register from './fixtures/register.json';
import { fixtureFromRepository } from './lib/model.js';
import plugins from './plugins/plugins.json';

const sassDeprecationIds = Object.values(sass.deprecations).flatMap((deprecation) =>
  (deprecation.status === 'active' ? [deprecation.id] : []),
);

const websiteUrl = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT || 3000}/`;

export default defineNuxtConfig({
  srcDir: './ui/',

  modules: [
    'nuxt-security',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
  ],

  plugins: [
    '~/plugins/global-components.js',
    '~/plugins/vue-form.js',
  ],

  css: [
    '~/assets/styles/style.scss',
  ],

  runtimeConfig: {
    public: {
      websiteUrl,
      searchIndexingIsAllowed: process.env.ALLOW_SEARCH_INDEXING === 'allowed',
    },
  },

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'none'"],
        'script-src': ["'self'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'https://*.open-fixture-library.org', 'https://*.ytimg.com', 'data:'],
        'frame-src': ["'self'", 'https://*.vimeo.com', '*.youtube-nocookie.com', 'https://www.facebook.com'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'manifest-src': ["'self'"],
        'media-src': ['*'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
      },
      strictTransportSecurity: {
        maxAge: 2 * 365 * 24 * 60 * 60,
        includeSubdomains: true,
        preload: true,
      },
      crossOriginEmbedderPolicy: false,
    },
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'twitter:card', content: 'summary' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Open Fixture Library' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:determiner', content: 'the' },
        { property: 'og:description', content: 'Create and browse fixture definitions for lighting equipment online and download them in the right format for your DMX control software!' },
        { property: 'og:image', content: 'https://open-fixture-library.org/open-graph.png' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '640' },
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#64b5f6' },
        { rel: 'preload', href: '/fonts/LatoLatin/LatoLatin-Regular.woff2', as: 'font', type: 'font/woff2' },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/global.scss" as *;',
          api: 'modern-compiler',
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  },

  sitemap: {
    hostname: websiteUrl,
    gzip: true,
    async urls() {
      const staticUrls = [
        { url: '/', changefreq: 'daily' },
        { url: '/fixture-editor', changefreq: 'monthly' },
        { url: '/import-fixture-file', changefreq: 'monthly' },
        { url: '/manufacturers', changefreq: 'monthly' },
        { url: '/categories', changefreq: 'monthly' },
        { url: '/about', changefreq: 'monthly' },
        { url: '/about/plugins', changefreq: 'monthly' },
        { url: '/rdm', changefreq: 'yearly' },
        { url: '/search', changefreq: 'yearly' },
      ];

      const manufacturerUrlPromises = Object.keys(register.manufacturers).flatMap((manufacturerKey) => [
        Promise.resolve({ url: `/${manufacturerKey}`, changefreq: 'weekly' }),
        ...register.manufacturers[manufacturerKey].map(async (fixtureKey) => {
          const fixture = await fixtureFromRepository(manufacturerKey, fixtureKey);
          return {
            url: `/${manufacturerKey}/${fixtureKey}`,
            changefreq: 'monthly',
            lastmod: fixture.meta.lastModifyDate.toISOString(),
          };
        }),
      ]);

      const categoryUrls = Object.keys(register.categories).map(
        (category) => ({ url: `/categories/${category}`, changefreq: 'weekly' }),
      );

      const pluginUrls = Object.keys(plugins.data).filter((key) => !plugins.data[key].outdated).map(
        (pluginKey) => ({ url: `/about/plugins/${pluginKey}`, changefreq: 'monthly' }),
      );

      return [
        ...staticUrls,
        ...await Promise.all(manufacturerUrlPromises),
        ...categoryUrls,
        ...pluginUrls,
      ];
    },
  },

  robots: {
    disallow: process.env.ALLOW_SEARCH_INDEXING !== 'allowed' ? ['/'] : plugins.exportPlugins.map((pluginKey) => `/*.${pluginKey}$`),
    sitemap: process.env.ALLOW_SEARCH_INDEXING === 'allowed' ? `${websiteUrl}sitemap.xml` : undefined,
  },

  compatibilityDate: '2024-11-01',
});
