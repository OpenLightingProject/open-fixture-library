import { Window } from 'happy-dom';
import type { Document, Element, Text } from 'happy-dom';

/**
 * A parsed, framework-independent snapshot of the user-visible content of a
 * server-rendered page. Nuxt 2 and Nuxt 4 emit different framework markup
 * around the same content (payload scripts, hydration anchors, scoped-style
 * attributes, attribute order), so the parity contract is defined on these
 * facts instead of on raw HTML.
 */
export interface PageFacts {
  title: string;
  h1: string[];
  headings: HeadingFact[];
  links: LinkFact[];
  images: ImageFact[];
  controls: ControlFact[];
  forms: FormFact[];
  textBlocks: TextBlockFact[];
}

export interface HeadingFact {
  level: number;
  text: string;
  id: string | null;
}

export interface LinkFact {
  href: string;
  text: string;
  title: string | null;
  ariaLabel: string | null;
  rel: string | null;
  target: string | null;
}

export interface ImageFact {
  src: string;
  alt: string | null;
  width: string | null;
  height: string | null;
}

export interface ControlFact {
  tag: string;
  type: string | null;
  name: string | null;
  id: string | null;
  placeholder: string | null;
  ariaLabel: string | null;
  title: string | null;
  value: string | null;
  text: string | null;
  classes: string[];
  disabled: boolean;
  checked: boolean;
  selected: boolean;
  multiple: boolean;
  required: boolean;
  readOnly: boolean;
  options: OptionFact[];
}

export interface OptionFact {
  value: string | null;
  text: string;
  selected: boolean;
}

export interface FormFact {
  action: string;
  method: string | null;
}

export interface TextBlockFact {
  tag: string;
  text: string;
}

const HTML_WHITESPACE = /[\t\n\f\r ]+/g;

/**
 * Normalizes rendered text the same way for both frameworks: HTML whitespace
 * runs collapse to one space, and leading/trailing whitespace disappears.
 *
 * @param {string | null | undefined} value - Raw text or attribute value.
 * @returns {string} The normalized text.
 */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(HTML_WHITESPACE, ' ').trim();
}

/**
 * Rewrites origin-dependent and fingerprinted URLs into stable equivalents.
 * Absolute URLs lose their origin because the oracle runs on port 3001 while
 * the migrated site runs on port 3000. Nuxt build asset names are normalized
 * because Vite and webpack hash them differently.
 *
 * @param {string | null | undefined} value - The URL or path to normalize.
 * @returns {string} The normalized URL or path.
 */
export function normalizeUrl(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  let path = value;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    const url = new URL(value);
    // Only the two local servers' origins are interchangeable. External
    // targets (GitHub, plugin documentation, ...) are part of the contract
    // and keep their full URL, including host and protocol.
    if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(url.hostname)) {
      path = `${url.pathname}${url.search}${url.hash}`;
    }
  }

  return path.replace(/\/_nuxt\/[^/?#]+/g, '/_nuxt/<asset>');
}

/**
 * Strips directories and content hashes from an image source. The parity
 * contract keeps the basename (so a different image is still caught) but does
 * not require identical build directories.
 *
 * @param {string | null | undefined} value - The raw `src` attribute.
 * @returns {string} The image basename without a content hash.
 */
export function imageSourceName(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const pathname = normalizeUrl(value).split(/[?#]/, 1)[0];
  const basename = pathname.split('/').pop() ?? '';
  // `logo.8f3a2b1c.svg` / `logo-8f3a2b1c.svg` -> `logo.svg`
  return basename.replace(/[.-][a-f0-9]{8,}(?=\.[a-z0-9]+$)/i, '');
}

/**
 * Removes markup that is either executable or generated per build. Scripts
 * contain the Nuxt 2 `__NUXT__` payload and the Nuxt 4 `#__NUXT_DATA__`
 * payload; scoped styles contain `data-v-*` hashes; comments contain Vue 2/3
 * hydration anchors (`<!---->`, `<!--[-->`, `<!--]-->`). None of it is DOM
 * content that should be compared, and the scripts/styles would otherwise
 * dominate parsing time.
 *
 * @param {string} html - The raw server response.
 * @returns {string} HTML with volatile framework markup removed.
 */
export function stripVolatileMarkup(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div\b[^>]*\bclass="(?:[^"]* )?nuxt-loading-indicator(?: [^"]*)?"[^>]*>\s*<\/div>/gi, '')
    .replace(/\sdata-v-[a-z0-9]+(?:="[^"]*")?/gi, '')
    .replace(/\sdata-(?:server-rendered|n-head(?:-ssr)?|hid|fetch-key)(?:="[^"]*")?/gi, '');
}

let parserWindow: Window | undefined;

/**
 * Parses a page with scripts/styles already removed. One detached window is
 * reused because creating a window per page is comparatively expensive.
 *
 * @param {string} html - The raw HTML response.
 * @returns {Document} The parsed document.
 */
function parseDocument(html: string): Document {
  parserWindow ??= new Window({
    settings: {
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
    },
  });
  return new parserWindow.DOMParser().parseFromString(stripVolatileMarkup(html), 'text/html');
}

/**
 * Removes text nodes that contain only HTML whitespace. The two frameworks
 * indent templates differently, so such nodes are not part of the DOM
 * contract. Non-whitespace text keeps its content (and is normalized later).
 *
 * @param {Document} document - The parsed document to prune.
 */
function removeWhitespaceTextNodes(document: Document): void {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(document.body, 4 /* NodeFilter.SHOW_TEXT */);

  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    const text = node as Text;
    if (text.data.trim() === '') {
      textNodes.push(text);
    }
  }

  for (const text of textNodes) {
    text.remove();
  }
}

/**
 * Reads an attribute without collapsing an absent value into an empty string.
 *
 * @param {Element} element - The element to inspect.
 * @param {string} name - The attribute name.
 * @returns {string | null} The attribute value or null.
 */
function attribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

/**
 * Returns an element's classes in a framework-independent order.
 *
 * @param {Element} element - The element to inspect.
 * @returns {string[]} Sorted, non-empty class names.
 */
function sortedClasses(element: Element): string[] {
  return (attribute(element, 'class') ?? '')
    .split(HTML_WHITESPACE)
    .filter(Boolean)
    .sort();
}

/**
 * Collects heading level, text and id in document order.
 *
 * @param {Document} document - The parsed document.
 * @returns {HeadingFact[]} Heading facts.
 */
function headingFacts(document: Document): HeadingFact[] {
  return [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => ({
    level: Number(heading.tagName.slice(1)),
    text: normalizeText(heading.textContent),
    id: attribute(heading, 'id'),
  }));
}

/**
 * Collects anchors and their normalized targets and labels.
 *
 * @param {Document} document - The parsed document.
 * @returns {LinkFact[]} Link facts.
 */
function linkFacts(document: Document): LinkFact[] {
  return [...document.querySelectorAll('a[href]')].map((link) => {
    const target = attribute(link, 'target');

    return {
      href: normalizeUrl(attribute(link, 'href')),
      text: normalizeText(link.textContent),
      title: attribute(link, 'title'),
      ariaLabel: attribute(link, 'aria-label'),
      rel: normalizeLinkRel(attribute(link, 'rel'), target),
      target,
    };
  });
}

/**
 * Drop the security tokens Nuxt 4's `<NuxtLink>` injects for
 * `target="_blank"`. The Nuxt 2 oracle emits no `rel` at all on those links;
 * the migrated site emits `rel="noopener noreferrer"`. Browsers already apply
 * implicit `noopener` to `target="_blank"`, so this changes no rendered
 * content. Any author-specified token (`nofollow`, `external`, ...) is kept
 * and still compared.
 *
 * @param {string | null} rel - The raw rel attribute.
 * @param {string | null} target - The link target.
 * @returns {string | null} Comparable rel tokens, or null if none remain.
 */
function normalizeLinkRel(rel: string | null, target: string | null): string | null {
  if (rel === null) {
    return null;
  }

  const tokens = rel
    .split(HTML_WHITESPACE)
    .filter(Boolean)
    .filter((token) => target !== '_blank' || !['noopener', 'noreferrer'].includes(token));

  return tokens.length > 0 ? tokens.join(' ') : null;
}

/**
 * Collects images with a stable source basename and accessible text.
 *
 * @param {Document} document - The parsed document.
 * @returns {ImageFact[]} Image facts.
 */
function imageFacts(document: Document): ImageFact[] {
  return [...document.querySelectorAll('img')].map((image) => ({
    src: imageSourceName(attribute(image, 'src')),
    alt: attribute(image, 'alt'),
    width: attribute(image, 'width'),
    height: attribute(image, 'height'),
  }));
}

/**
 * Collects the options of a select control.
 *
 * @param {Element} select - The select element.
 * @returns {OptionFact[]} Option facts.
 */
function optionFacts(select: Element): OptionFact[] {
  return [...select.querySelectorAll('option')].map((option) => ({
    value: attribute(option, 'value'),
    text: normalizeText(option.textContent),
    selected: option.hasAttribute('selected'),
  }));
}

/**
 * Collects form controls and their SSR-relevant state.
 *
 * @param {Document} document - The parsed document.
 * @returns {ControlFact[]} Control facts.
 */
function controlFacts(document: Document): ControlFact[] {
  return [...document.querySelectorAll('button, input, select, textarea')].map((control) => {
    const tag = control.tagName.toLowerCase();
    const select = tag === 'select';

    return {
      tag,
      type: attribute(control, 'type'),
      name: attribute(control, 'name'),
      id: attribute(control, 'id'),
      placeholder: attribute(control, 'placeholder'),
      ariaLabel: attribute(control, 'aria-label'),
      title: attribute(control, 'title'),
      value: attribute(control, 'value'),
      text: tag === 'button' ? normalizeText(control.textContent) : null,
      classes: sortedClasses(control),
      disabled: control.hasAttribute('disabled'),
      checked: control.hasAttribute('checked'),
      selected: control.hasAttribute('selected'),
      multiple: control.hasAttribute('multiple'),
      required: control.hasAttribute('required'),
      readOnly: control.hasAttribute('readonly'),
      options: select ? optionFacts(control) : [],
    };
  });
}

/**
 * Collects forms and their submission targets.
 *
 * @param {Document} document - The parsed document.
 * @returns {FormFact[]} Form facts.
 */
function formFacts(document: Document): FormFact[] {
  return [...document.querySelectorAll('form')].map((form) => ({
    action: normalizeUrl(attribute(form, 'action')),
    method: attribute(form, 'method'),
  }));
}

const TEXT_BLOCK_SELECTOR = 'p, li, td, th, dd, dt, summary, figcaption, time, code, label, option, caption';

/**
 * Collects semantic text blocks in document order. Whitespace is removed
 * entirely: Nuxt 2 templates emit spaces around inline elements (for example
 * `0 …255`) while the Vue 3 compiler condenses them (`0…255`). The rendered
 * gap is CSS/framework detail, but every non-whitespace character of every
 * block (table cells, list items, paragraphs, ...) must still match. This
 * catches content changes that do not live in a heading, link or control.
 *
 * @param {Document} document - The parsed document.
 * @returns {TextBlockFact[]} Tag and whitespace-free text per block.
 */
function textBlockFacts(document: Document): TextBlockFact[] {
  return [...document.querySelectorAll(TEXT_BLOCK_SELECTOR)].map((block) => ({
    tag: block.tagName.toLowerCase(),
    text: normalizeText(block.textContent).replace(HTML_WHITESPACE, ''),
  }));
}

/**
 * Extracts the comparable, user-visible facts from a server-rendered page.
 *
 * @param {string} html - The raw HTML response.
 * @returns {PageFacts} Normalized title, headings, links, images and controls.
 */
export function pageFacts(html: string): PageFacts {
  const document = parseDocument(html);
  removeWhitespaceTextNodes(document);

  return {
    title: normalizeText(document.title),
    h1: [...document.querySelectorAll('h1')].map((heading) => normalizeText(heading.textContent)),
    headings: headingFacts(document),
    links: linkFacts(document),
    images: imageFacts(document),
    controls: controlFacts(document),
    forms: formFacts(document),
    textBlocks: textBlockFacts(document),
  };
}

/**
 * Serializes a parsed page after volatile markup and whitespace-only text
 * nodes have been removed. Kept next to the fact extractor so callers that
 * need the normalized DOM (rather than individual facts) use the same rules.
 *
 * @param {string} html - The raw HTML response.
 * @returns {string} The normalized document markup.
 */
export function normalizedHtml(html: string): string {
  const document = parseDocument(html);
  removeWhitespaceTextNodes(document);

  // Neutralize addresses that legitimately differ between the two servers and
  // their build pipelines while keeping the part that identifies the target.
  for (const element of document.querySelectorAll('[href]')) {
    element.setAttribute('href', normalizeUrl(element.getAttribute('href')));
  }
  for (const element of document.querySelectorAll('[action]')) {
    element.setAttribute('action', normalizeUrl(element.getAttribute('action')));
  }
  for (const image of document.querySelectorAll('img[src]')) {
    image.setAttribute('src', imageSourceName(image.getAttribute('src')));
  }
  for (const element of document.querySelectorAll('[src]:not(img)')) {
    element.setAttribute('src', normalizeUrl(element.getAttribute('src')));
  }

  return document.documentElement.outerHTML;
}
