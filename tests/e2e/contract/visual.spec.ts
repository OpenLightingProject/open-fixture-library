import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { fetchBoth } from '../helpers/parity';
import {
  type ControlFact,
  imageSourceName,
  normalizedHtml,
  normalizeText,
  pageFacts,
  type PageFacts,
  stripVolatileMarkup,
} from './helpers/normalize';

const repositoryRoot = new URL('../../../', import.meta.url);

const staticPages = [
  '/',
  '/about',
  '/about/plugins',
  '/about/plugins/ofl',
  '/categories',
  '/categories/Dimmer',
  '/manufacturers',
  '/cameo',
  '/cameo/auro-beam-150',
  '/search',
  '/rdm',
  '/fixture-editor',
  '/import-fixture-file',
];

const testFixtures = JSON.parse(
  await readFile(new URL('tests/test-fixtures.json', repositoryRoot), 'utf8'),
) as { man: string; key: string; name: string }[];

const fixturePages = testFixtures.map((fixture) => `/${fixture.man}/${fixture.key}`);
const pages = [...staticPages, ...fixturePages];

/**
 * Content-Type parameter spacing is serializer-specific (`; charset` on
 * Nuxt 2, `;charset` on Nitro), like header casing. The media type and
 * parameter values are the contract.
 *
 * @param {string | null} value - The raw Content-Type header.
 * @returns {string} The normalized Content-Type header.
 */
function normalizeContentType(value: string | null): string {
  return (value ?? '').replace(/;\s*/g, '; ').trim();
}

/**
 * Intentional Nuxt 4 difference, recorded for the migration audit (Task 20).
 *
 * The Nuxt 2 oracle wraps `<ThemeSwitcher>` in `<ClientOnly>`, so the theme
 * button is absent from server-rendered HTML and only appears after
 * hydration. The migrated site renders the button during SSR with the
 * hydration-safe `title="Switch theme"` (Task 10). This is the only
 * user-visible markup difference on the whole matrix, it disappears on
 * hydration, and it cannot be normalized without hiding an actual DOM node.
 * The allowlist is deliberately narrow: it removes exactly one
 * `button.theme-switcher`, and both its shape and the oracle's absence are
 * asserted below. Any other control difference still fails the test.
 */
const THEME_SWITCHER = {
  tag: 'button',
  type: 'button',
  name: null,
  id: null,
  placeholder: null,
  ariaLabel: null,
  title: 'Switch theme',
  value: null,
  text: '',
  classes: ['theme-switcher'],
  disabled: false,
  checked: false,
  selected: false,
  multiple: false,
  required: false,
  readOnly: false,
  options: [],
} satisfies ControlFact;

/**
 * Identifies the single allowlisted control (see `THEME_SWITCHER` above).
 *
 * @param {ControlFact} control - A normalized form control.
 * @returns {boolean} Whether the control is the theme switcher button.
 */
function isThemeSwitcher(control: ControlFact): boolean {
  return control.tag === 'button' && control.classes.includes('theme-switcher');
}

/**
 * Compares one path's normalized DOM facts.
 *
 * @param {string} path - The path to compare.
 * @param {PageFacts} oldFacts - Facts from the Nuxt 2 oracle.
 * @param {PageFacts} newFacts - Facts from the Nuxt 4 site.
 */
function compareFacts(path: string, oldFacts: PageFacts, newFacts: PageFacts): void {
  const oldThemeSwitchers = oldFacts.controls.filter(isThemeSwitcher);
  const newThemeSwitchers = newFacts.controls.filter(isThemeSwitcher);

  expect(oldThemeSwitchers, `${path}: oracle renders the theme switcher only after hydration`).toEqual([]);
  expect(newThemeSwitchers, `${path}: SSR theme switcher is the single allowlisted difference`).toEqual([THEME_SWITCHER]);

  const { controls: oldControls, ...oldContent } = oldFacts;
  const { controls: newControls, ...newContent } = newFacts;

  expect(newContent, `${path}: title, headings, links, images, forms and text blocks`).toEqual(oldContent);
  expect(
    newControls.filter((control) => !isThemeSwitcher(control)),
    `${path}: interactive controls other than the allowlisted theme switcher`,
  ).toEqual(oldControls.filter((control) => !isThemeSwitcher(control)));
}

describe('normalized DOM parity', () => {
  for (const path of pages) {
    it(`${path}`, async () => {
      const { oldResponse, newResponse } = await fetchBoth(path, {
        headers: { accept: 'text/html' },
      });

      expect(oldResponse.status, `${path}: oracle status`).toBe(200);
      expect(newResponse.status, `${path}: migrated status`).toBe(oldResponse.status);
      expect(oldResponse.headers.get('content-type')).toContain('text/html');
      expect(normalizeContentType(newResponse.headers.get('content-type'))).toBe(
        normalizeContentType(oldResponse.headers.get('content-type')),
      );

      const [oldHtml, newHtml] = await Promise.all([
        oldResponse.text(),
        newResponse.text(),
      ]);

      compareFacts(path, pageFacts(oldHtml), pageFacts(newHtml));

      // The normalized documents must not keep framework-only markup.
      for (const html of [oldHtml, newHtml]) {
        const normalized = normalizedHtml(html);
        expect(normalized).not.toMatch(/__NUXT__|__NUXT_DATA__|data-v-[a-z0-9]+|data-server-rendered|<\/?script\b|<!--/i);
        expect(normalized).not.toMatch(/\bnuxt-loading-indicator\b/);
      }
    });
  }
});

describe('DOM normalization', () => {
  it('ignores payload scripts, hydration comments, scoped attributes and build hashes', () => {
    const oldMarkup = `
      <!doctype html>
      <html lang="en">
        <head><title>Title</title></head>
        <body data-server-rendered="true">
          <!--[-->
          <div data-v-11111111>
            <h1 data-v-11111111>Heading</h1>
            <img data-v-11111111 src="/img/logo.png" alt="Logo">
            <a data-v-11111111 href="http://localhost:3001/_nuxt/entry.11111111.js">Download</a>
          </div>
          <script>window.__NUXT__ = {}</script>
          <!--]-->
        </body>
      </html>`;
    const newMarkup = `
      <!doctype html>
      <html lang="en">
        <head><title>Title</title></head>
        <body>
          <!--[-->
          <div data-v-22222222>
            <h1 data-v-22222222>Heading</h1>
            <img data-v-22222222 src="/img/logo.22222222.png" alt="Logo">
            <a data-v-22222222 href="http://localhost:3000/_nuxt/entry.22222222.js">Download</a>
          </div>
          <script type="application/json" id="__NUXT_DATA__">[]</script>
          <!--]-->
        </body>
      </html>`;

    expect(stripVolatileMarkup(oldMarkup)).not.toMatch(/__NUXT__|data-v-|<!--|<script/);
    expect(normalizedHtml(oldMarkup)).toBe(normalizedHtml(newMarkup));
    expect(pageFacts(oldMarkup)).toEqual(pageFacts(newMarkup));
  });

  it('normalizes whitespace the same way as the rendered DOM', () => {
    expect(normalizeText('  Foo\n\t bar  ')).toBe('Foo bar');
    expect(normalizeText(null)).toBe('');
  });

  it('keeps image basenames while removing content hashes', () => {
    expect(imageSourceName('/img/logo.22222222.png')).toBe('logo.png');
    expect(imageSourceName('https://example.org/assets/icon.svg')).toBe('icon.svg');
    expect(imageSourceName('/img/no-hash.png')).toBe('no-hash.png');
  });
});
