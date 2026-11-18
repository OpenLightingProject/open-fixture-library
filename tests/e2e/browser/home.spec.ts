import { expect, test } from '@nuxt/test-utils/playwright';
import type { Page } from '@playwright/test';

/**
 * Opens the homepage and waits for the old site's client-only components.
 * @param {Page} page - The Playwright page.
 * @param {function(string, object=): Promise<void>} goto - The Nuxt test-utils navigation helper.
 */
async function openHome(page: Page, goto: (path: string, options?: object) => Promise<void>) {
  await goto('/', { waitUntil: 'load' });
}

test('homepage shows the library title and download options', async ({ page, goto }) => {
  await openHome(page, goto);

  await expect(page).toHaveTitle('Open Fixture Library');
  await expect(page.locator('h1').first()).toHaveText('Open Fixture Library');

  const downloadTitle = page.locator('.download-button > .title');
  await expect(downloadTitle).toHaveText(/^Download all \d+ fixtures$/);

  const pluginLinks = page.locator('.download-button > ul > li > a');
  expect(await pluginLinks.count()).toBeGreaterThan(10);
  await expect(pluginLinks.filter({ hasText: 'AGLight' })).toHaveAttribute('href', '/download.aglight');
  await expect(pluginLinks.filter({ hasText: 'DMXControl 3' })).toHaveAttribute('title', /^Download DMXControl 3/);

  await expect(page.getByRole('link', { name: 'Download instructions' })).toHaveAttribute('href', '/about/plugins');
});

test('homepage renders recent fixtures and contributors', async ({ page, goto }) => {
  await openHome(page, goto);

  const recentFixtures = page.locator('section.card', { hasText: 'Recently updated fixtures' }).locator('ul.list > li');
  expect(await recentFixtures.count()).toBeGreaterThan(0);
  await expect(recentFixtures.first().locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);

  const recentContributors = page.locator('section.card', { hasText: 'Recent contributors' }).locator('ul.list > li');
  expect(await recentContributors.count()).toBeGreaterThan(0);
  await expect(recentContributors.first()).toContainText(/latest: /);
});

test('theme switcher toggles the theme', async ({ page, goto }) => {
  await openHome(page, goto);

  const switcher = page.locator('button.theme-switcher');
  await expect(switcher).toBeVisible();
  await expect(switcher).toHaveAttribute('title', /^Switch to (?:light|dark) theme$/);

  const initialTheme = await page.locator('html').getAttribute('data-theme');
  const initialTitle = await switcher.getAttribute('title');

  await switcher.click();

  await expect(page.locator('html')).not.toHaveAttribute('data-theme', initialTheme ?? '');
  await expect(switcher).toHaveAttribute('title', initialTitle === 'Switch to dark theme' ? 'Switch to light theme' : 'Switch to dark theme');

  const toggledTheme = await page.locator('html').getAttribute('data-theme');
  expect(new Set([initialTheme, toggledTheme])).toEqual(new Set(['light', 'dark']));
});

test('theme switcher hydrates without a server/client title mismatch', async ({ page, goto }) => {
  const hydrationMessages: string[] = [];
  page.on('console', (message) => {
    if (/hydration/i.test(message.text())) {
      hydrationMessages.push(message.text());
    }
  });

  await openHome(page, goto);
  // Give Vue's post-hydration warnings a chance to be logged.
  await page.waitForLoadState('networkidle');

  expect(hydrationMessages).toEqual([]);
});
