import { expect, test } from '@nuxt/test-utils/playwright';
import type { Page } from '@playwright/test';

/**
 * Opens the fixture editor on both the Nuxt 2 and Nuxt 4 sites.
 * `waitUntil: 'load'` is used for the same reason as typography.spec.ts: the
 * Nuxt 3 hydration wait helper does not exist on the Nuxt 2 oracle.
 * @param {Page} page - The Playwright page.
 * @param {function(string, object=): Promise<void>} goto - The Nuxt test-utils navigation helper.
 */
async function openEditor(page: Page, goto: (path: string, options?: object) => Promise<void>) {
  await goto('/fixture-editor', { waitUntil: 'load' });
  await page.waitForSelector('form.only-js');
}

/**
 * Fills the minimum fixture data needed for validation.
 * @param {Page} page - The Playwright page.
 * @param {string} fixtureName - The fixture name to enter.
 */
async function fillFixtureBasics(page: Page, fixtureName: string) {
  await page.selectOption('select[name="manufacturerKey"]', { index: 1 });
  await page.fill('input[name="fixture-name"]', fixtureName);
  await page.locator('.category-badge', { hasText: 'Dimmer' }).click();
  await page.fill('input[name="mode-0-name"]', 'Default');
  await page.fill('input[name="author"]', 'Tester');

  const links = page.locator('input[name^="links-"]');
  for (let index = 0; index < await links.count(); index++) {
    await links.nth(index).fill(`https://example.org/link-${index}`);
  }
}

/**
 * Seeds the editor's localStorage auto-save entry before the page loads.
 * @param {Page} page - The Playwright page.
 * @param {object} fixture - Partial fixture data to restore.
 */
async function seedAutoSave(page: Page, fixture: object) {
  await page.addInitScript((autoSaveFixture) => {
    localStorage.setItem('autoSave', JSON.stringify([{
      fixture: autoSaveFixture,
      channel: {},
      timestamp: Date.now(),
    }]));
  }, fixture);
}

test('creating a channel with the capability wizard reaches the fixture preview', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Test Fixture');

  // Adding the first channel opens the create dialog directly (there is no
  // existing channel to pick yet).
  await page.locator('section[data-mode-uuid]').first().locator('a:has-text("add channel")').click();
  await expect(page.locator('#channel-dialog')).toBeVisible();

  // The color-name suggestions come from capabilityTypes and must stay in
  // the datalist.
  const colorSuggestions = page.locator('#channel-name-suggestions option');
  expect(await colorSuggestions.allTextContents()).toContain('Red');

  await page.fill('#channel-dialog input[name="name"]', 'Main');
  await page.locator('#channel-dialog input[name="name"]').blur();

  // Generate two capabilities through the wizard, covering DMX 0…255.
  await page.click('#channel-dialog a:has-text("Open Capability Wizard")');
  const wizard = page.locator('#channel-dialog .capability-wizard');
  await expect(wizard).toBeVisible();
  await wizard.locator('select[name$="-type"]').selectOption('Intensity');
  await wizard.locator('input[type="number"]').nth(0).fill('0');
  await wizard.locator('input[type="number"]').nth(1).fill('128');
  await wizard.locator('input[type="number"]').nth(2).fill('2');
  await wizard.locator('button:has-text("Generate capabilities")').click();

  await expect(wizard).toBeHidden();
  const generatedCapabilities = page.locator('#channel-dialog details.capability');
  await expect(generatedCapabilities).toHaveCount(2);
  await expect(generatedCapabilities.first().locator('summary')).toContainText('0');
  await expect(generatedCapabilities.first().locator('summary')).toContainText('127');
  await expect(generatedCapabilities.nth(1).locator('summary')).toContainText('128');
  await expect(generatedCapabilities.nth(1).locator('summary')).toContainText('255');

  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();

  // The mode channel list must show the human-readable name, not the UUID.
  await expect(page.locator('section[data-mode-uuid] .mode-channels li')).toHaveCount(1);
  await expect(page.locator('section[data-mode-uuid] .mode-channels li .channel-name')).toHaveText('Main');

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture validation was successful.', { timeout: 20_000 });

  await page.getByRole('button', { name: 'Preview fixture' }).click();
  await expect(page.locator('#submit-dialog .fixture-page h1')).toContainText('Test Fixture');
});

test('auto-saved editor data is restored after a reload', async ({ page, goto }) => {
  await seedAutoSave(page, {
    name: 'Restored Fixture',
    categories: ['Dimmer'],
    metaAuthor: 'Tester',
  });

  await openEditor(page, goto);
  const restoreDialog = page.locator('#restore-dialog');
  await expect(restoreDialog).toBeVisible();
  await expect(restoreDialog).toContainText('Auto-saved fixture data found');

  await restoreDialog.locator('button.restore').click();
  await expect(restoreDialog).toBeHidden();
  await expect(page.locator('input[name="fixture-name"]')).toHaveValue('Restored Fixture');
  await expect(page.locator('.category-badge.selected', { hasText: 'Dimmer' })).toBeVisible();
});

test('auto-saved editor data can be discarded', async ({ page, goto }) => {
  await seedAutoSave(page, {
    name: 'Discard Me',
    categories: ['Dimmer'],
    metaAuthor: 'Tester',
  });

  await openEditor(page, goto);
  const restoreDialog = page.locator('#restore-dialog');
  await expect(restoreDialog).toBeVisible();

  await restoreDialog.locator('button.discard').click();
  await expect(restoreDialog).toBeHidden();
  await expect(page.locator('input[name="fixture-name"]')).toHaveValue('');

  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('autoSave') || 'null'))).toEqual([]);
});

test('the editor still renders when localStorage writes fail', async ({ page, goto }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.addInitScript(() => {
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Storage is disabled', 'QuotaExceededError');
    };
  });

  await openEditor(page, goto);
  await expect(page.locator('h1').first()).toHaveText('Fixture Editor');
  await expect(page.locator('form.only-js')).toBeVisible();

  await page.fill('input[name="fixture-name"]', 'No Storage Fixture');
  await expect(page.locator('input[name="fixture-name"]')).toHaveValue('No Storage Fixture');
  await expect(page.locator('form.only-js')).toBeVisible();

  expect(pageErrors).toEqual([]);
});
