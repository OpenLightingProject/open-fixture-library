import { expect, test } from '@nuxt/test-utils/playwright';
import type { Locator, Page } from '@playwright/test';

interface PageCase {
  path: string;
  title: string;
  heading: string;
  landmark: (page: Page) => Locator;
}

/**
 * One representative route per page component.
 *
 * Titles and headings are compared as rendered text, so the Nuxt 2
 * `window.__NUXT__` payload and the Nuxt 4 `__NUXT_DATA__` payload never enter
 * an assertion. The selectors are shared classes from the page templates,
 * which are identical on both targets.
 */
const pageCases: PageCase[] = [
  {
    path: '/',
    title: 'Open Fixture Library',
    heading: 'Open Fixture Library',
    landmark: (page) => page.locator('.download-button > .title'),
  },
  {
    path: '/about',
    title: 'About – Open Fixture Library',
    heading: 'About',
    landmark: (page) => page.locator('#contact'),
  },
  {
    path: '/about/plugins',
    title: 'Plugins – Open Fixture Library',
    heading: 'Plugins',
    landmark: (page) => page.getByRole('heading', { name: 'Export plugins' }),
  },
  {
    path: '/about/plugins/ofl',
    title: 'Open Fixture Library JSON Plugin – Open Fixture Library',
    heading: 'Open Fixture Library JSON Plugin',
    landmark: (page) => page.locator('.plugin-description'),
  },
  {
    path: '/categories',
    title: 'Categories – Open Fixture Library',
    heading: 'Categories',
    landmark: (page) => page.locator('.categories .card-category').first(),
  },
  {
    path: '/categories/Dimmer',
    title: 'Dimmer – Open Fixture Library',
    heading: 'Dimmer fixtures',
    landmark: (page) => page.locator('ul.fixtures li').first(),
  },
  {
    path: '/manufacturers',
    title: 'Manufacturers – Open Fixture Library',
    heading: 'Manufacturers',
    landmark: (page) => page.locator('.manufacturers a.manufacturer-color').first(),
  },
  {
    path: '/cameo',
    title: 'cameo – Open Fixture Library',
    heading: 'cameo fixtures',
    landmark: (page) => page.locator('ul.fixtures li').first(),
  },
  {
    path: '/cameo/auro-beam-150',
    title: 'cameo Auro Beam 150 DMX fixture definition – Open Fixture Library',
    heading: 'cameo Auro Beam 150',
    landmark: (page) => page.locator('section.fixture-meta').first(),
  },
  {
    path: '/search',
    title: 'Search – Open Fixture Library',
    heading: 'Search',
    landmark: (page) => page.locator('form.filter input[name="q"]'),
  },
  {
    path: '/rdm',
    title: 'RDM Lookup – Open Fixture Library',
    heading: 'RDM Lookup',
    landmark: (page) => page.locator('form input[name="manufacturerId"]'),
  },
  {
    path: '/fixture-editor',
    title: 'Fixture Editor – Open Fixture Library',
    heading: 'Fixture Editor',
    landmark: (page) => page.locator('#fixture-editor > section.card').first(),
  },
  {
    path: '/import-fixture-file',
    title: 'Import fixture – Open Fixture Library',
    heading: 'Import fixture file',
    landmark: (page) => page.locator('section.card.yellow').first(),
  },
];

for (const pageCase of pageCases) {
  test(`${pageCase.path} renders the same title, heading and landmark`, async ({ page, goto }) => {
    // `waitUntil: 'load'` is used for the same reason as the other browser
    // specs: the Nuxt 3 hydration wait helper does not exist on the Nuxt 2
    // oracle.
    const response = await goto(pageCase.path, { waitUntil: 'load' });

    expect(response?.status(), pageCase.path).toBe(200);
    await expect(page).toHaveTitle(pageCase.title);
    await expect(page.locator('h1').first()).toContainText(pageCase.heading);
    await expect(pageCase.landmark(page)).toBeVisible();
  });
}

interface ErrorCase {
  path: string;
  status: number;
  title: string;
  heading: string;
  message: string;
}

const errorCases: ErrorCase[] = [
  {
    path: '/nonexistent-page',
    status: 404,
    title: 'Not Found – Open Fixture Library',
    heading: '404 – Not found',
    message: 'The requested page was not found.',
  },
  {
    path: '/nonexistent-manufacturer',
    status: 404,
    title: 'Not Found – Open Fixture Library',
    heading: '404 – Not found',
    message: 'The requested page was not found.',
  },
  {
    path: '/cameo/nonexistent-fixture',
    status: 404,
    title: 'Not Found – Open Fixture Library',
    heading: '404 – Not found',
    message: 'The requested page was not found.',
  },
  {
    path: '/download.not-a-plugin',
    status: 400,
    title: 'Error – Open Fixture Library',
    heading: '400 – An error occurred',
    message: 'doesn\'t match schema',
  },
  {
    path: '/download.foo',
    status: 400,
    title: 'Error – Open Fixture Library',
    heading: '400 – An error occurred',
    message: 'doesn\'t match schema',
  },
];

for (const errorCase of errorCases) {
  test(`${errorCase.path} renders the shared ${errorCase.status} error page`, async ({ page, goto }) => {
    const response = await goto(errorCase.path, { waitUntil: 'load' });

    expect(response?.status(), errorCase.path).toBe(errorCase.status);
    await expect(page).toHaveTitle(errorCase.title);
    await expect(page.locator('h1').first()).toHaveText(errorCase.heading);
    await expect(page.locator('#content')).toContainText(errorCase.message);
  });
}
