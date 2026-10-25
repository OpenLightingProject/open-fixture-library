import { expect, test } from '@nuxt/test-utils/playwright';
import type { Page } from '@playwright/test';

// Both the Nuxt 2 oracle and the Nuxt 4 site share these class names / messages.
// `waitUntil: 'load'` is used for the same reason as typography.spec.ts: the
// Nuxt 3 hydration wait helper does not exist on the Nuxt 2 oracle.
/**
 * Opens the fixture editor and waits for the client-side form.
 * @param page - The Playwright page.
 * @param goto - The test fixture's navigation helper.
 */
async function openEditor(page: Page, goto: (path: string, options?: object) => Promise<void>) {
  await goto('/fixture-editor', { waitUntil: 'load' });
  await page.waitForSelector('form.only-js');
}

/**
 * Fills the editor with the minimum valid fixture data.
 * @param page - The Playwright page.
 */
async function fillValidFixture(page: Page) {
  await page.selectOption('select[name="manufacturerKey"]', { index: 1 });
  await page.fill('input[name="fixture-name"]', 'Test Fixture');
  await page.locator('.category-badge', { hasText: 'Dimmer' }).click();
  await page.fill('input[name="mode-0-name"]', 'Default');
  await page.fill('input[name="author"]', 'Tester');

  const links = page.locator('input[name^="links-"]');
  for (let index = 0; index < await links.count(); index++) {
    await links.nth(index).fill(`https://example.org/link-${index}`);
  }

  // The mode needs at least one channel. Create an Intensity channel.
  await page.click('a:has-text("add channel")');
  await page.waitForSelector('#channel-dialog input[name="name"]');
  await page.fill('#channel-dialog input[name="name"]', 'Intensity');
  await page.locator('#channel-dialog select[name$="-type"]').first().selectOption('Intensity');
  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();
}

test('empty editor submission shows the existing validation messages', async ({ page, goto }) => {
  await openEditor(page, goto);
  await page.click('button.save-fixture');

  await expect(page.locator('.error-message:visible').filter({ hasText: 'Please select a value.' })).toBeVisible();
  await expect(page.locator('.error-message:visible').filter({ hasText: 'Please select at least one category.' })).toBeVisible();
  await expect(page.locator('.error-message:visible').filter({ hasText: 'A mode must contain at least one channel.' })).toBeVisible();

  await expect(page.locator('label:has(input[name="fixture-name"]) .error-message')).toContainText('Please fill out this field.');
  await expect(page.locator('label:has(input[name="author"]) .error-message')).toContainText('Please fill out this field.');

  // The first invalid field is focused by scrollToFirstInvalidField().
  await expect(page.locator('select[name="manufacturerKey"]')).toBeFocused();

  // The submit/preview dialog must not appear for an invalid form.
  await expect(page.locator('#submit-dialog')).toBeHidden();
});

test('valid editor data reaches the fixture preview', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillValidFixture(page);

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture validation was successful.', { timeout: 20_000 });

  await page.getByRole('button', { name: 'Preview fixture' }).click();
  await expect(page.locator('#submit-dialog .fixture-page h1')).toContainText('Test Fixture');
});

test('an incomplete compound field shows its message on blur, before submit', async ({ page, goto }) => {
  await openEditor(page, goto);

  const start = page.locator('input[name="fixture-physical-lens-degreesMinMax-start"]');
  await start.scrollIntoViewIfNeeded();
  await start.fill('10');
  await page.locator('input[name="fixture-name"]').click();

  // Nuxt 2's validator directive was bound to the compound component and
  // marked it touched on blur, so this message appears before any submit.
  const rangeMessage = page.locator('section.fixture-physical-lens-degreesMinMax .error-message');
  await expect(rangeMessage).toBeVisible();
  await expect(rangeMessage).toContainText('Please fill out both start and end of the range.');
  await expect(page.locator('#submit-dialog')).toBeHidden();
});

test('an invalid optional numeric input follows the Nuxt 2 oracle', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillValidFixture(page);

  // The Nuxt 2 oracle drops the 'invalid' sentinel here: no client-side number
  // message is shown, and the form reaches server-side fixture validation.
  const rdmModelId = page.locator('input[name="rdmModelId"]');
  await rdmModelId.scrollIntoViewIfNeeded();
  await rdmModelId.click();
  await page.keyboard.type('e');
  await page.locator('input[name="fixture-name"]').click();

  await expect(page.locator('section.rdmModelId .error-message')).toBeHidden();

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Unfortunately, the fixture validation returned some issues.', { timeout: 20_000 });
});
