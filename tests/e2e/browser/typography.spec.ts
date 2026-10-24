import { expect, test } from '@nuxt/test-utils/playwright';

// The brief's `waitUntil: 'hydration'` cannot be used here: @nuxt/test-utils waits
// for `window.useNuxtApp().isHydrating === false`, which never becomes true on the
// Nuxt 2 oracle (no `useNuxtApp` global), so the old-site run timed out. `load` plus
// `document.fonts.ready` works on both sites and still proves the font is loaded.
test('body uses the vendored Atkinson Hyperlegible Next font', async ({ page, goto }) => {
  const fontRequests: string[] = [];
  page.on('response', (response) => {
    if (/\.woff2?($|\?)/.test(response.url())) {
      fontRequests.push(response.url());
    }
  });

  await goto('/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Atkinson Hyperlegible Next');
  expect(await page.evaluate(() => document.fonts.check('12pt "Atkinson Hyperlegible Next"'))).toBe(true);

  // The family is vendored in ui/public/fonts; @nuxt/fonts must not substitute a
  // different (Google-hosted) build of the same family.
  expect(fontRequests).toContainEqual(
    expect.stringContaining('/fonts/AtkinsonHyperlegibleNext/'),
  );
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveAttribute(
    'href',
    '/fonts/AtkinsonHyperlegibleNext/AtkinsonHyperlegibleNext-Variable.woff2',
  );
});
