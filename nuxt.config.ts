import { defineNuxtConfig } from 'nuxt/config';

import plugins from './plugins/plugins.json';

const websiteUrl = process.env.WEBSITE_URL || `http://localhost:${process.env.PORT || 3000}/`;

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: 'ui',
  dir: {
    public: 'ui/public',
    assets: 'ui/assets',
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    'nuxt-security',
  ],
  fonts: {
    families: [
      { name: 'Lato', provider: 'google', weights: [300, 400, 700] },
      { name: 'Inconsolata', provider: 'google', weights: [400] },
    ],
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    dataValue: 'theme',
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#fafafa' },
      ],
      link: [
        { rel: 'canonical', href: '' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#64b5f6' },
      ],
    },
  },
  css: [
    '~/assets/styles/style.scss',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/global.scss" as *;',
        },
      },
    },
  },
  security: {
    rateLimiter: {
      whiteList: ['127.0.0.1', '::1', 'localhost'],
    },
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https://*.ytimg.com', 'https://embetty.open-fixture-library.org'],
        'frame-src': ["'self'", 'https://*.vimeo.com', '*.youtube-nocookie.com', 'https://www.facebook.com'],
      },
    },
  },
  runtimeConfig: {
    public: {
      websiteUrl,
      searchIndexingIsAllowed: process.env.ALLOW_SEARCH_INDEXING === 'allowed',
    },
  },
  robots: {
    rules: process.env.ALLOW_SEARCH_INDEXING !== 'allowed'
      ? {
          UserAgent: '*',
          Disallow: '/',
        }
      : {
          UserAgent: '*',
          Disallow: plugins.exportPlugins.map((pluginKey: string) => `/*.${pluginKey}$`),
          Allow: '/',
          Sitemap: `${websiteUrl}sitemap.xml`,
        },
  },
  sitemap: {
    sources: [
      '/api/__sitemap__/manufacturers',
      '/api/__sitemap__/fixtures',
      '/api/__sitemap__/categories',
      '/api/__sitemap__/plugins',
    ],
  },
  devtools: { enabled: true },
  routeRules: {
    '/**': { cors: true },
  },
  nitro: {
    srcDir: 'server',
    preset: 'node-server',
    experimental: {
      openAPI: true,
    },
  },
});
