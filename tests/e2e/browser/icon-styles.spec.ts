import { expect, test } from '@nuxt/test-utils/playwright';
import type { Page } from '@playwright/test';

/**
 * Reads the styles that the shared `.icon` rules are responsible for.
 * @param {Page} page - The Playwright page.
 * @param {string} selector - Selector for the icon element.
 * @returns {Promise<object>} The computed icon styles and bounding box.
 */
async function iconStyles(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((element) => {
    const styles = getComputedStyle(element);
    const box = element.getBoundingClientRect();

    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      boxSizing: styles.boxSizing,
      display: styles.display,
      height: box.height,
      padding: styles.padding,
      width: box.width,
    };
  });
}

test('OflSvg icons scale their v-html SVG to the container', async ({ page, goto }) => {
  await goto('/categories', { waitUntil: 'load' });

  const icon = page.locator('.card-category > .icon').first();
  await expect(icon).toBeVisible();

  const svg = icon.locator('svg').first();
  await expect(svg).toBeVisible();

  const iconBox = await icon.boundingBox();
  const svgBox = await svg.boundingBox();
  const svgDisplay = await svg.evaluate((element) => getComputedStyle(element).display);

  expect(iconBox).not.toBeNull();
  expect(svgBox).not.toBeNull();

  // `.card-category > .icon` is 3rem (48px at the default root font size).
  expect(iconBox!.width).toBeGreaterThan(30);
  // `OflSvg`'s global `& svg` rule must reach the SVG injected with `v-html`.
  expect(svgDisplay).toBe('block');
  expect(svgBox!.width).toBeCloseTo(iconBox!.width, 0);
  expect(svgBox!.height).toBeCloseTo(iconBox!.height, 0);
});

test('CapabilityTypeIcon images keep the shared gobo icon styles', async ({ page, goto }) => {
  // `varytec/hero-spot-230` has a wheel slot that uses an embedded gobo resource.
  await goto('/varytec/hero-spot-230', { waitUntil: 'load' });

  // Gobo capability rows live inside collapsed channel details in every mode.
  const expandButtons = page.locator('.icon-button.expand-all');
  for (let index = 0; index < await expandButtons.count(); index++) {
    await expandButtons.nth(index).click();
  }

  const image = page.locator('img.icon.gobo-icon:visible').first();
  await expect(image).toBeVisible();

  const styles = await iconStyles(page, 'img.icon.gobo-icon:visible');

  // Base `.icon` / `.icon.gobo-icon` rules live in `OflSvg.vue` and must style
  // this image from another component.
  expect(styles.display).toBe('inline-block');
  expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
  expect(styles.borderRadius).toBe('50%');
  expect(styles.boxSizing).toBe('border-box');
  expect(styles.padding).toBe('2px');
  expect(styles.width).toBeGreaterThan(18);
  expect(styles.height).toBeCloseTo(styles.width, 1);
});
