import { expect, test } from '@nuxt/test-utils/playwright';
import type { Locator, Page } from '@playwright/test';

const FROM_EDITOR_ENDPOINT = '**/api/v1/fixtures/from-editor';
const SUBMIT_ENDPOINT = '**/api/v1/fixtures/submit';
const DOWNLOAD_EDITOR_ENDPOINT = '**/download-editor.*';

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
 * @param {string} [githubUsername] - Optional GitHub username to enter.
 */
async function fillFixtureBasics(page: Page, fixtureName: string, githubUsername = '') {
  await page.selectOption('select[name="manufacturerKey"]', { index: 1 });
  await page.fill('input[name="fixture-name"]', fixtureName);
  await page.locator('.category-badge', { hasText: 'Dimmer' }).click();
  await page.fill('input[name="mode-0-name"]', 'Default');
  await page.fill('input[name="author"]', 'Tester');

  if (githubUsername) {
    await page.fill('input[name="github-username"]', githubUsername);
  }

  const links = page.locator('input[name^="links-"]');
  for (let index = 0; index < await links.count(); index++) {
    await links.nth(index).fill(`https://example.org/link-${index}`);
  }
}

/**
 * Creates the first channel in the given mode through the channel dialog.
 * @param {Page} page - The Playwright page.
 * @param {number} modeIndex - Zero-based mode index.
 * @param {string} channelName - Name of the channel to create.
 * @param {number} [resolution] - Channel resolution (1 = 8 bit, 2 = 16 bit).
 */
async function createChannel(page: Page, modeIndex: number, channelName: string, resolution = 1) {
  await page.locator('section[data-mode-uuid]').nth(modeIndex).locator('a:has-text("add channel")').click();
  await expect(page.locator('#channel-dialog')).toBeVisible();

  // With no unchosen channels the dialog already shows the create form.
  const createChannelLink = page.locator('#channel-dialog a:has-text("create a new channel")');
  if (await createChannelLink.isVisible()) {
    await createChannelLink.click();
  }

  await page.fill('#channel-dialog input[name="name"]', channelName);
  await page.locator('#channel-dialog input[name="name"]').blur();

  if (resolution > 1) {
    await page.selectOption('#channel-dialog select[name="resolution"]', String(resolution));
    await expect(page.locator('#channel-dialog select[name="dmxValueResolution"]')).toBeVisible();
    await page.selectOption('#channel-dialog select[name="dmxValueResolution"]', String(resolution));
  }

  const capabilityType = page.locator('#channel-dialog select[name$="-type"]').first();
  await capabilityType.selectOption('Intensity');

  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();
}

/**
 * Adds an existing channel (and its fine channels) to the given mode.
 * @param {Page} page - The Playwright page.
 * @param {number} modeIndex - Zero-based mode index.
 * @param {string} channelName - Name of the existing channel to select.
 */
async function addExistingChannel(page: Page, modeIndex: number, channelName: string) {
  await page.locator('section[data-mode-uuid]').nth(modeIndex).locator('a:has-text("add channel")').click();
  await expect(page.locator('#channel-dialog')).toBeVisible();

  const channelItem = page.locator('#channel-dialog .channel-list-item').filter({ hasText: channelName }).first();
  await channelItem.locator('input[type="checkbox"]').check();
  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();
}

/**
 * Returns the channel names shown in a mode's channel list.
 * @param {Page} page - The Playwright page.
 * @param {number} modeIndex - Zero-based mode index.
 * @returns {Locator} The channel name locator.
 */
function modeChannelNames(page: Page, modeIndex: number): Locator {
  return page.locator('section[data-mode-uuid]').nth(modeIndex).locator('.mode-channels li .channel-name');
}

/**
 * Opens the edit dialog for a channel.
 * @param {Page} page - The Playwright page.
 * @param {number} modeIndex - Zero-based mode index.
 * @param {string} channelName - Name of the channel to edit.
 */
async function editChannel(page: Page, modeIndex: number, channelName: string) {
  const channelRow = page.locator('section[data-mode-uuid]').nth(modeIndex).locator('.mode-channels li').filter({ hasText: channelName }).first();
  await channelRow.locator('button[title="Edit channel"]').click();
}

/**
 * Picks how an edited channel is saved when it is used in multiple modes.
 * @param {Page} page - The Playwright page.
 * @param {string} buttonName - `In all modes` or `Only in this mode`.
 */
async function chooseChannelEditMode(page: Page, buttonName: string) {
  const chooseDialog = page.locator('#choose-channel-edit-mode-dialog');
  await expect(chooseDialog).toBeVisible();
  await chooseDialog.getByRole('button', { name: buttonName }).click();
  await expect(chooseDialog).toBeHidden();
  await expect(page.locator('#channel-dialog')).toBeVisible();
}

/**
 * Renames the channel in the currently open channel dialog and saves it.
 * @param {Page} page - The Playwright page.
 * @param {string} channelName - New channel name.
 */
async function renameChannel(page: Page, channelName: string) {
  await page.fill('#channel-dialog input[name="name"]', channelName);
  await page.locator('#channel-dialog button[type=submit]').click();
  await expect(page.locator('#channel-dialog')).toBeHidden();
}

/**
 * Reads the text of the submit dialog's error output.
 * The Nuxt 4 site renders a readonly `textarea`, the Nuxt 2 oracle a `pre`.
 * @param {Page} page - The Playwright page.
 * @returns {Promise<string>} The displayed upload/validation error.
 */
async function getSubmitErrorText(page: Page) {
  const errorOutput = page.locator('#submit-dialog textarea, #submit-dialog pre.error-container');
  await expect(errorOutput).toHaveCount(1);

  return errorOutput.evaluate((element) => {
    return element instanceof HTMLTextAreaElement ? element.value : element.textContent ?? '';
  });
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

test('the complete editor flow validates, previews, downloads and submits with a stubbed request', async ({ page, goto }) => {
  const pullRequestUrl = 'https://github.com/OpenLightingProject/open-fixture-library/pull/9999';

  // Validation stays real API behaviour, but the request body is captured so
  // the editor payload contract can be asserted without a GitHub call.
  let fromEditorBody: unknown;
  await page.route(FROM_EDITOR_ENDPOINT, async (route) => {
    fromEditorBody = route.request().postDataJSON();
    await route.fulfill({ response: await route.fetch() });
  });

  let downloadBody: unknown;
  await page.route(DOWNLOAD_EDITOR_ENDPOINT, async (route) => {
    downloadBody = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      headers: {
        'content-disposition': 'attachment; filename="full-flow.qxf"',
        'content-type': 'application/octet-stream',
      },
      body: '<?xml version="1.0"?><FixtureLibrary/>',
    });
  });

  let submitBody: unknown;
  await page.route(SUBMIT_ENDPOINT, async (route) => {
    submitBody = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ pullRequestUrl }),
    });
  });

  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Full Flow Fixture', 'octocat');
  await createChannel(page, 0, 'Intensity');

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture validation was successful.', { timeout: 20_000 });

  expect(Array.isArray(fromEditorBody)).toBe(true);
  const [editorFixture] = fromEditorBody as Array<Record<string, unknown>>;
  expect(editorFixture).toMatchObject({
    name: 'Full Flow Fixture',
    categories: ['Dimmer'],
    metaAuthor: 'Tester',
  });
  expect(editorFixture.manufacturerKey).toEqual(expect.any(String));
  expect(editorFixture.modes).toEqual([expect.objectContaining({ name: 'Default' })]);

  const availableChannels = editorFixture.availableChannels as Record<string, { name?: string }>;
  expect(Object.values(availableChannels).map((channel) => channel.name)).toContain('Intensity');

  await page.getByRole('button', { name: 'Preview fixture' }).click();
  await expect(page.locator('#submit-dialog .fixture-page h1')).toContainText('Full Flow Fixture');
  await expect(page.locator('#submit-dialog .fixture-page')).toContainText('Intensity');

  // Downloading from the preview goes through /download-editor and must send
  // the current editor fixture data.
  await page.locator('#submit-dialog .download-button .title').hover();
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10_000 }),
    page.locator('#submit-dialog .download-button ul a').first().click(),
  ]);
  expect(download.suggestedFilename()).toBe('full-flow.qxf');
  expect(downloadBody).toMatchObject({
    manufacturers: expect.any(Object),
    fixtures: expect.any(Object),
    warnings: expect.any(Object),
    errors: expect.any(Object),
  });
  const downloadedFixtures = (downloadBody as { fixtures: Record<string, unknown> }).fixtures;
  expect(Object.keys(downloadedFixtures)).toHaveLength(1);

  await page.getByRole('button', { name: 'Submit to OFL' }).click();
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture was successfully uploaded to GitHub', { timeout: 20_000 });

  expect(submitBody).toMatchObject({
    githubUsername: 'octocat',
    githubComment: null,
    fixtureCreateResult: expect.objectContaining({
      fixtures: expect.any(Object),
      manufacturers: expect.any(Object),
      warnings: expect.any(Object),
      errors: expect.any(Object),
    }),
  });
  const submitPayload = submitBody as {
    fixtureCreateResult: {
      fixtures: Record<string, unknown>;
      errors: Record<string, string[]>;
    };
  };
  const submitFixtureKeys = Object.keys(submitPayload.fixtureCreateResult.fixtures);
  expect(submitFixtureKeys).toHaveLength(1);
  expect(submitPayload.fixtureCreateResult.errors[submitFixtureKeys[0]]).toEqual([]);

  await expect(page.getByRole('link', { name: 'See pull request' })).toHaveAttribute('href', pullRequestUrl);
});

test('channel management covers editing in all modes, duplication, fine channels and removal', async ({ page, goto }) => {
  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Channel Management Fixture');

  await page.locator('a.add-mode-link').click();
  await page.fill('input[name="mode-1-name"]', 'Extended');

  // 16 bit resolution creates the coarse channel and its fine channel.
  await createChannel(page, 0, 'Dimmer', 2);
  await expect(modeChannelNames(page, 0)).toHaveText(['Dimmer', 'Dimmer fine']);

  // Fine channels cannot be edited directly, only removed.
  const firstModeRows = page.locator('section[data-mode-uuid]').first().locator('.mode-channels li');
  await expect(firstModeRows.nth(0).locator('button[title="Edit channel"]')).toHaveCount(1);
  await expect(firstModeRows.nth(1).locator('button[title="Edit channel"]')).toHaveCount(0);

  // Add the same coarse+fine pair to the second mode.
  await addExistingChannel(page, 1, 'Dimmer fine');
  await expect(modeChannelNames(page, 1)).toHaveText(['Dimmer', 'Dimmer fine']);

  // Editing a channel used by another mode asks whether to edit all modes.
  await editChannel(page, 0, 'Dimmer');
  await chooseChannelEditMode(page, 'In all modes');
  await renameChannel(page, 'Master');
  await expect(modeChannelNames(page, 0)).toHaveText(['Master', 'Master fine']);
  await expect(modeChannelNames(page, 1)).toHaveText(['Master', 'Master fine']);

  // Editing only one mode duplicates the channel for that mode.
  await editChannel(page, 1, 'Master');
  await chooseChannelEditMode(page, 'Only in this mode');
  await expect(page.locator('#channel-dialog')).toContainText('Edit channel duplicate');
  await renameChannel(page, 'Dim');
  await expect(modeChannelNames(page, 0)).toHaveText(['Master', 'Master fine']);
  await expect(modeChannelNames(page, 1)).toHaveText(['Dim', 'Dim fine']);

  // Removing the coarse channel also removes its fine channel from that mode.
  await page.locator('section[data-mode-uuid]').nth(1).locator('.mode-channels li').first().locator('button[title="Remove channel"]').click();
  await expect(modeChannelNames(page, 1)).toHaveText([]);
  await expect(modeChannelNames(page, 0)).toHaveText(['Master', 'Master fine']);
});

test('the auto-save restore dialog restores an editor draft', async ({ page, goto }) => {
  await seedAutoSave(page, {
    name: 'Restored Full Fixture',
    categories: ['Dimmer'],
    metaAuthor: 'Tester',
  });

  await openEditor(page, goto);
  const restoreDialog = page.locator('#restore-dialog');
  await expect(restoreDialog).toBeVisible();
  await expect(restoreDialog).toContainText('Auto-saved fixture data found');

  await restoreDialog.locator('button.restore').click();
  await expect(restoreDialog).toBeHidden();
  await expect(page.locator('input[name="fixture-name"]')).toHaveValue('Restored Full Fixture');
  await expect(page.locator('.category-badge.selected', { hasText: 'Dimmer' })).toBeVisible();
  await expect(page.locator('input[name="author"]')).toHaveValue('Tester');
});

test('the prefill query fills manufacturer, RDM model ID and existing manufacturer mode', async ({ page, goto }) => {
  const prefill = {
    useExistingManufacturer: true,
    manufacturerKey: 'adb',
    rdmModelId: 1,
  };

  await goto(`/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefill))}`, { waitUntil: 'load' });
  await page.waitForSelector('form.only-js');

  await expect(page.locator('select[name="manufacturerKey"]')).toHaveValue('adb');
  await expect(page.locator('input[name="rdmModelId"]')).toHaveValue('1');
});

test('the RDM lookup not-found page prefills the fixture editor', async ({ page, goto }) => {
  // ADB exists, but its RDM model ID 1 is not in the library.
  await goto('/rdm?manufacturerId=16708&modelId=1', { waitUntil: 'load' });

  await expect(page.locator('h1')).toHaveText('RDM fixture not found');
  await page.getByRole('link', { name: 'add it yourself' }).click();
  await page.waitForSelector('form.only-js');

  await expect(page).toHaveURL(/\/fixture-editor\?prefill=/);
  await expect(page.locator('select[name="manufacturerKey"]')).toHaveValue('adb');
  await expect(page.locator('input[name="rdmModelId"]')).toHaveValue('1');
});

test('a non-2xx validation response shows the API error message', async ({ page, goto }) => {
  await page.route(FROM_EDITOR_ENDPOINT, async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Parse error (test)' }),
    });
  });

  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Validation Error Fixture');
  await createChannel(page, 0, 'Intensity');

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Unfortunately, there was an error while uploading.', { timeout: 20_000 });

  expect(await getSubmitErrorText(page)).toContain('Parse error (test)');
});

test('a non-2xx submission response shows the API error message', async ({ page, goto }) => {
  await page.route(SUBMIT_ENDPOINT, async (route) => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Submit parse error (test)' }),
    });
  });

  await openEditor(page, goto);
  await fillFixtureBasics(page, 'Submission Error Fixture');
  await createChannel(page, 0, 'Intensity');

  await page.click('button.save-fixture');
  await expect(page.locator('#submit-dialog')).toContainText('Your fixture validation was successful.', { timeout: 20_000 });

  await page.getByRole('button', { name: 'Preview fixture' }).click();
  await page.getByRole('button', { name: 'Submit to OFL' }).click();

  await expect(page.locator('#submit-dialog')).toContainText('Unfortunately, there was an error while uploading.', { timeout: 20_000 });
  expect(await getSubmitErrorText(page)).toContain('Submit parse error (test)');
});
