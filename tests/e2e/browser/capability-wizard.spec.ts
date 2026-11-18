import { expect, test } from '@nuxt/test-utils/playwright';
import type { Locator, Page } from '@playwright/test';

/**
 * Opens the fixture editor on both the Nuxt 2 and Nuxt 4 sites.
 * `waitUntil: 'load'` is used for the same reason as editor.spec.ts: the Nuxt 3
 * hydration wait helper does not exist on the Nuxt 2 oracle.
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
  await page.locator('.category-badge', { hasText: 'Color Changer' }).click();
  await page.locator('.category-badge', { hasText: 'Hazer' }).click();
  await page.fill('input[name="mode-0-name"]', 'Default');
  await page.fill('input[name="author"]', 'Tester');

  const links = page.locator('input[name^="links-"]');
  for (let index = 0; index < await links.count(); index++) {
    await links.nth(index).fill(`https://example.org/link-${index}`);
  }
}

/**
 * Opens a new channel dialog, creating a channel from the `add-existing` picker
 * after the first channel exists.
 * @param {Page} page - The Playwright page.
 */
async function openNewChannel(page: Page) {
  await page.locator('section[data-mode-uuid]').first().locator('a:has-text("add channel")').click();
  await expect(page.locator('#channel-dialog')).toBeVisible();

  // With unchosen channels available the dialog first shows the picker;
  // otherwise it already opens the create form.
  const createChannelLink = page.locator('#channel-dialog a:has-text("create a new channel")');
  if (await createChannelLink.isVisible()) {
    await createChannelLink.click();
  }
}

/**
 * Opens the capability wizard for the channel currently being edited.
 * @param {Page} page - The Playwright page.
 * @returns {Locator} The visible wizard.
 */
async function openCapabilityWizard(page: Page) {
  await page.click('#channel-dialog a:has-text("Open Capability Wizard")');
  const wizard = page.locator('#channel-dialog .capability-wizard');
  await expect(wizard).toBeVisible();

  return wizard;
}

/**
 * Generates capabilities through the wizard template form.
 * @param {Page} page - The Playwright page.
 * @param {object} options - Wizard options.
 * @param {string} options.type - Capability type to generate.
 * @param {number} options.start - First DMX value.
 * @param {number} options.width - DMX range width.
 * @param {number} options.count - Number of capabilities to generate.
 * @param {function(Locator): Promise<void>} [options.fillTypeData] - Fills the type data form before generating.
 */
async function generateCapabilities(
  page: Page,
  { type, start, width, count, fillTypeData }: {
    type: string;
    start: number;
    width: number;
    count: number;
    fillTypeData?: (wizard: Locator) => Promise<void>;
  },
) {
  const wizard = await openCapabilityWizard(page);

  const rangeInputs = wizard.locator('section input[type="number"]');
  await rangeInputs.nth(0).fill(String(start));
  await rangeInputs.nth(1).fill(String(width));
  await rangeInputs.nth(2).fill(String(count));

  await wizard.locator('select[name$="-type"]').selectOption(type);

  if (fillTypeData) {
    await fillTypeData(wizard);
  }

  await wizard.locator('button:has-text("Generate capabilities")').click();
  await expect(wizard).toBeHidden();
}

/**
 * Asserts that the capability at the given index has the expected DMX range and type.
 * @param {Page} page - The Playwright page.
 * @param {number} index - Zero-based capability index in the channel dialog.
 * @param {string} range - Expected human-readable DMX range.
 * @param {string} type - Expected capability type.
 */
async function expectCapability(page: Page, index: number, range: string, type: string) {
  const capability = page.locator('#channel-dialog details.capability').nth(index);
  const summary = capability.locator('summary').first();
  await expect(summary).toContainText(range);
  await expect(summary).toContainText(type);
}

/**
 * Saves the channel dialog and asserts that it closes.
 * @param {Page} page - The Playwright page.
 * @param {string} channelName - Name of the channel to save.
 */
async function saveChannel(page: Page, channelName: string) {
  await page.fill('#channel-dialog input[name="name"]', channelName);
  await page.locator('#channel-dialog input[name="name"]').blur();
  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();
}

test('capability wizard generates ranges and type data for every capability family', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Wizard Fixture');

  // Color: a multi-capability range, so count and range arithmetic are covered.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'ColorPreset',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      // The hint comes from the capability component's exposed `hint` property.
      await expect(wizard).toContainText('This capability enables a static predefined RGB/CMY color.');
      await wizard.locator('input[name$="-colorsHexString"]').fill('#ff0000');
    },
  });

  await expect(page.locator('#channel-dialog details.capability')).toHaveCount(2);
  await expectCapability(page, 0, '0', 'ColorPreset');
  await expectCapability(page, 0, '127', 'ColorPreset');
  await expectCapability(page, 1, '128', 'ColorPreset');
  await expectCapability(page, 1, '255', 'ColorPreset');
  await saveChannel(page, 'Color Presets');

  // Gobo: WheelSlot capability plus the wheel-slot editor (WheelSlotGobo).
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'WheelSlot',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('input[type="checkbox"]').first().check();
      await wizard.locator('input[name$="-slotNumberStart"]').fill('1');
      await wizard.locator('input[name$="-slotNumberEnd"]').fill('2');
    },
  });

  await expect(page.locator('#channel-dialog details.capability')).toHaveCount(2);
  await expectCapability(page, 0, '0', 'WheelSlot');
  await expectCapability(page, 0, '127', 'WheelSlot');
  await expectCapability(page, 1, '128', 'WheelSlot');
  await expectCapability(page, 1, '255', 'WheelSlot');

  const wheelSlotCapability = page.locator('#channel-dialog details.capability').filter({ hasText: 'WheelSlot' }).first();
  const wheelSlotOne = wheelSlotCapability.locator('details.editor-wheel-slot').filter({ hasText: 'wheel slot 1' });
  const wheelSlotTwo = wheelSlotCapability.locator('details.editor-wheel-slot').filter({ hasText: 'wheel slot 2' });
  await expect(wheelSlotOne).toHaveCount(1);
  await expect(wheelSlotTwo).toHaveCount(1);
  await wheelSlotOne.locator('summary').click();
  await wheelSlotOne.locator('select[name^="wheel-slot"]').selectOption('Gobo');
  await wheelSlotOne.locator('input[name$="-name"]').fill('Gobo 1');
  await wheelSlotTwo.locator('summary').click();
  await wheelSlotTwo.locator('select[name^="wheel-slot"]').selectOption('Open');
  await saveChannel(page, 'Gobo Wheel');

  // Prism: proportional speed entity.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'Prism',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('.entity-input select').first().selectOption('fast CW');
    },
  });

  await expectCapability(page, 0, '0', 'Prism');
  await expectCapability(page, 0, '127', 'Prism');
  await expectCapability(page, 1, '128', 'Prism');
  await expectCapability(page, 1, '255', 'Prism');
  await saveChannel(page, 'Prism');

  // Strobe: the shutter effect reveals the strobe-specific type data fields.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'ShutterStrobe',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('select[name$="-shutterEffect"]').selectOption('Strobe');
      const speedSwitcher = wizard.locator('.proportional-capability-data').first();
      await speedSwitcher.locator('input[type="checkbox"]').uncheck();
      await speedSwitcher.locator('.entity-input select').selectOption('fast');
    },
  });

  await expectCapability(page, 0, '0', 'ShutterStrobe');
  await expectCapability(page, 0, '127', 'ShutterStrobe');
  await expectCapability(page, 1, '128', 'ShutterStrobe');
  await expectCapability(page, 1, '255', 'ShutterStrobe');
  await saveChannel(page, 'Shutter / Strobe');

  // Fog: enum plus entity type data.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'Fog',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('select[name$="-fogType"]').selectOption('Haze');
      await wizard.locator('.entity-input select').first().selectOption('strong');
    },
  });

  await expectCapability(page, 0, '0', 'Fog');
  await expectCapability(page, 0, '127', 'Fog');
  await expectCapability(page, 1, '128', 'Fog');
  await expectCapability(page, 1, '255', 'Fog');
  await saveChannel(page, 'Fog');

  // Focus: distance keyword entity.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'Focus',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('.entity-input select').first().selectOption('near');
    },
  });

  await expectCapability(page, 0, '0', 'Focus');
  await expectCapability(page, 0, '127', 'Focus');
  await expectCapability(page, 1, '128', 'Focus');
  await expectCapability(page, 1, '255', 'Focus');
  await saveChannel(page, 'Focus');

  // Zoom: numeric entity with a unit.
  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'Zoom',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('input[type="checkbox"]').first().uncheck();
      await wizard.locator('.entity-input select').first().selectOption('degrees');
      await wizard.locator('input[name$="-angle-number"]').fill('15');
    },
  });

  await expectCapability(page, 0, '0', 'Zoom');
  await expectCapability(page, 0, '127', 'Zoom');
  await expectCapability(page, 1, '128', 'Zoom');
  await expectCapability(page, 1, '255', 'Zoom');
  await saveChannel(page, 'Zoom');

  await expect(page.locator('section[data-mode-uuid] .mode-channels li')).toHaveCount(7);

  // Saving validates the fixture, which exercises the exposed `defaultData` and
  // `resetProperties` contracts and the native vee-validate payload keys.
  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture validation was successful.', { timeout: 20_000 });

  await page.getByRole('button', { name: 'Preview fixture' }).click();
  await expect(page.locator('#submit-dialog .fixture-page h1')).toContainText('Wizard Fixture');
  await expect(page.locator('#submit-dialog .fixture-page')).toContainText('Gobo 1');
});

test('wheel slot type data forms work for every wheel slot type', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Wheel Fixture');

  await openNewChannel(page);
  await generateCapabilities(page, {
    type: 'WheelSlot',
    start: 0,
    width: 128,
    count: 2,
    fillTypeData: async (wizard) => {
      await wizard.locator('input[type="checkbox"]').first().check();
      await wizard.locator('input[name$="-slotNumberStart"]').fill('1');
      await wizard.locator('input[name$="-slotNumberEnd"]').fill('8');
    },
  });

  const capability = page.locator('#channel-dialog details.capability').first();
  const slots = capability.locator('details.editor-wheel-slot');
  await expect(slots).toHaveCount(8);

  /**
   * Expands a wheel slot and selects its type.
   * @param {number} index - Zero-based wheel slot index.
   * @param {string} type - Wheel slot type.
   * @returns {Locator} The expanded wheel slot details.
   */
  async function selectSlotType(index: number, type: string) {
    const slot = slots.nth(index);
    await slot.locator('summary').click();
    await slot.locator('select[name^="wheel-slot"]').selectOption(type);
    return slot;
  }

  const colorSlot = await selectSlotType(0, 'Color');
  await colorSlot.locator('input[name$="-name"]').fill('Red');
  await colorSlot.locator('input[name$="-colorsHexString"]').fill('#ff0000');
  await colorSlot.locator('.entity-input select').selectOption('warm');

  const goboSlot = await selectSlotType(1, 'Gobo');
  await goboSlot.locator('input[name$="-name"]').fill('Gobo 2');

  const prismSlot = await selectSlotType(2, 'Prism');
  await prismSlot.locator('input[name$="-name"]').fill('Prism');
  await prismSlot.locator('input[name$="-facets"]').fill('3');

  const irisSlot = await selectSlotType(3, 'Iris');
  await irisSlot.locator('.entity-input select').selectOption('%');
  await irisSlot.locator('input[name$="-openPercent-number"]').fill('50');

  const frostSlot = await selectSlotType(4, 'Frost');
  await frostSlot.locator('.entity-input select').selectOption('%');
  await frostSlot.locator('input[name$="-frostIntensity-number"]').fill('50');

  const animationStartSlot = await selectSlotType(5, 'AnimationGoboStart');
  await animationStartSlot.locator('input[name$="-name"]').fill('Animation');

  await selectSlotType(6, 'AnimationGoboEnd');
  await selectSlotType(7, 'Closed');

  await saveChannel(page, 'Wheel Slots');
  await expect(page.locator('section[data-mode-uuid] .mode-channels li .channel-name')).toHaveText('Wheel Slots');
});
