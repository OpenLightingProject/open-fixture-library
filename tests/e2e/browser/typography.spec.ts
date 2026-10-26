import { expect, test } from '@nuxt/test-utils/playwright';

// The brief's `waitUntil: 'hydration'` cannot be used here: @nuxt/test-utils waits
// for `window.useNuxtApp().isHydrating === false`, which never becomes true on the
// Nuxt 2 oracle (no `useNuxtApp` global), so the old-site run timed out. `load` plus
// `document.fonts.ready` works on both sites and still proves the font is loaded.
const VENDORED_FONT_DIR = '/fonts/AtkinsonHyperlegibleNext/';
const VENDORED_NORMAL = `${VENDORED_FONT_DIR}AtkinsonHyperlegibleNext-Variable.woff2`;
const VENDORED_ITALIC = `${VENDORED_FONT_DIR}AtkinsonHyperlegibleNext-Italic-Variable.woff2`;

test('body uses the vendored Atkinson Hyperlegible Next font', async ({ page, goto }) => {
  // URLs are not enough: a preload fetch keeps the vendored URL in the list even when
  // a substituted face does the rendering, so statuses are recorded as well.
  const fontResponses: { url: string; status: number }[] = [];
  page.on('response', (response) => {
    if (/\.woff2?($|\?)/.test(response.url())) {
      fontResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await goto('/', { waitUntil: 'load' });
  // Force the italic face to load too; plain page text only uses the normal face.
  await page.evaluate(async () => {
    await document.fonts.load('italic 12pt "Atkinson Hyperlegible Next"');
    await document.fonts.ready;
  });

  // Negative provenance: no proxy for a provider-fetched (Google) build, and no
  // direct Google Fonts request. A preload of the vendored file does not satisfy the
  // actual @font-face source, so this catches a substitution regression.
  expect(fontResponses.filter(({ url }) => /\/_fonts\/|gstatic\.com|googleapis\.com/.test(url))).toEqual([]);

  // Positive provenance: the vendored files were fetched successfully.
  const statusFor = (url: string) => fontResponses
    .filter((response) => response.url.endsWith(url))
    .map((response) => response.status);
  expect(statusFor(VENDORED_NORMAL)).toContain(200);
  expect(statusFor(VENDORED_ITALIC)).toContain(200);

  const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(family).toContain('Atkinson Hyperlegible Next');
  // @nuxt/fonts injects metric-matched "… Fallback: …" families when it resolves the
  // family itself; master's stack has none.
  expect(family).not.toContain('Fallback:');

  expect(await page.evaluate(() => document.fonts.check('12pt "Atkinson Hyperlegible Next"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('italic 12pt "Atkinson Hyperlegible Next"'))).toBe(true);

  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveAttribute('href', VENDORED_NORMAL);
  await expect(preload).toHaveAttribute('type', 'font/woff2');
  await expect(preload).toHaveAttribute('crossorigin', '');
});
