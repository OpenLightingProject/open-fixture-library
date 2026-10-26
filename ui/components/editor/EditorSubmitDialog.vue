<template>
  <A11yDialog
    id="submit-dialog"
    is-alert-dialog
    :shown="state !== `closed`"
    :title="title"
    :wide="state === `preview`">

    <template v-if="state === `preview`" #title>
      <span class="preview-fixture-title">{{ title }}</span>
      <select
        v-if="fixtureKeys.length > 1"
        v-model="previewFixtureKey"
        class="preview-fixture-chooser">
        <option disabled>Choose fixture to preview</option>
        <option
          v-for="key of fixtureKeys"
          :key="key"
          :value="key">{{ key }}</option>
      </select>
    </template>

    <div v-if="state === `validating`">Validating…</div>

    <div v-else-if="state === `ready`">
      <template v-if="!hasPreview">
        Unfortunately, the fixture validation returned some issues.
        Due to some of those, there is also no preview available.
        You can try to resolve as many errors as you can (some may be unavoidable in the editor)
        and then submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project.
        After submitting, we will review the fixture{{ isPlural ? `s` : `` }} and fix all remaining issues.
      </template>
      <template v-else-if="hasValidationErrors || hasValidationWarnings">
        Unfortunately, the fixture validation returned some issues.
        You can try to resolve as many as you can (some may be unavoidable in the editor).
        Next, head over to the preview, where it is also possible to download
        your current fixture{{ isPlural ? `s` : `` }} for private use.
        After that, please submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project,
        where {{ isPlural ? `they` : `it` }} will be reviewed and added to the library.
      </template>
      <template v-else>
        Your fixture validation was successful.
        Next, head over to the preview, where it is also possible to download
        your current fixture{{ isPlural ? `s` : `` }} for private use.
        After that, please submit your fixture{{ isPlural ? `s` : `` }} to the Open Fixture Library project,
        where {{ isPlural ? `they` : `it` }} will be reviewed and added to the library.
      </template>

      <ul>
        <li v-for="key of fixtureKeys" :key="key">
          <strong>{{ key }}</strong>
          <ul>
            <li v-for="message of fixtureCreateResult.errors[key]" :key="message">
              Error: {{ message }}
            </li>
            <li v-for="message of fixtureCreateResult.warnings[key]" :key="message">
              {{ message }}
            </li>
          </ul>
        </li>
      </ul>

      <div class="button-bar right">
        <button type="button" class="secondary" @click.prevent="onCancel()">Continue editing</button>
        <button
          v-if="hasPreview"
          type="button"
          class="primary"
          @click.prevent="onPreview()">Preview fixture{{ isPlural ? `s` : `` }}</button>
        <button
          v-else
          type="button"
          class="primary"
          @click.prevent="onSubmit()">Submit to OFL</button>
      </div>
    </div>

    <div v-else-if="state === `preview`">
      <div v-if="previewFixture" class="fixture-page">
        <FixtureHeader>
          <template #title>
            <h1>
              {{ previewFixture.manufacturer.name }} {{ previewFixture.name }}
              <code v-if="previewFixture.hasShortName">{{ previewFixture.shortName }}</code>
            </h1>
          </template>

          <DownloadButton
            v-if="previewFixtureResults.errors.length === 0"
            :editor-fixtures="previewFixtureCreateResult" />
        </FixtureHeader>

        <section v-if="previewFixtureResults.warnings.length > 0" class="card yellow">
          <strong>Warnings:<br></strong>
          <span v-for="message of previewFixtureResults.warnings" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <section v-if="previewFixtureResults.errors.length > 0" class="card red">
          <strong>Errors (prevent showing the fixture preview):<br></strong>
          <span v-for="message of previewFixtureResults.errors" :key="message">
            {{ message }}<br>
          </span>
        </section>

        <FixturePage
          v-if="previewFixtureResults.errors.length === 0"
          :fixture="previewFixture" />
      </div>

      <div class="button-bar right">
        <button type="button" class="secondary" @click.prevent="onCancel()">Continue editing</button>
        <button type="button" class="primary" @click.prevent="onSubmit()">Submit to OFL</button>
      </div>
    </div>

    <div v-else-if="state === `uploading`">Uploading…</div>

    <div v-else-if="state === `success`">
      Your fixture was successfully uploaded to GitHub (see the
      <a :href="pullRequestUrl" target="_blank" rel="noopener">pull request</a>).
      It will be now reviewed and then published on the website (this may take a few days).
      Thank you for your contribution!

      <div class="button-bar right">
        <NuxtLink to="/" class="button secondary">Back to homepage</NuxtLink>
        <button type="button" class="button secondary" @click.prevent="onReset()">Close</button>
        <DownloadButton
          v-if="!hasValidationErrors"
          button-style="select"
          :editor-fixtures="fixtureCreateResult" />
        <a
          :href="pullRequestUrl"
          class="button primary"
          target="_blank"
          rel="noopener">
          See pull request
        </a>
      </div>
    </div>

    <div v-else-if="state === `error`">
      Unfortunately, there was an error while uploading. Please copy the following data and
      <a
        href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
        target="_blank"
        rel="noopener">
        manually submit them to GitHub
      </a>.

      <textarea v-model="rawData" readonly />

      <div class="button-bar right">
        <button type="button" class="button secondary" @click.prevent="onCancel()">Close</button>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank"
          rel="noopener">
          Submit manually
        </a>
      </div>
    </div>

  </A11yDialog>
</template>

<style lang="scss" scoped>
.preview-fixture-title {
  margin-right: 1ex;
}

.preview-fixture-chooser {
  width: 350px;
  font-size: 1rem;
  vertical-align: middle;
}

.fixture-page {
  padding: 0.1rem 1rem 1rem;
  margin: 1rem -1rem -1rem;
  background: theme-color(page-background);

  & :deep(.help-wanted .actions) {
    cursor: not-allowed;

    a {
      pointer-events: none;
      opacity: 0.7;
    }
  }
}

.button-bar {
  position: sticky;
  bottom: 0;
  padding: 0.6rem 1rem 1rem;
  margin: 1rem -1rem -1rem;
  background: theme-color(dialog-background);
  box-shadow: 0 0 4px theme-color(icon-inactive);
}
</style>

<script setup lang="ts">
import Fixture from '~~/lib/model/Fixture.js';
import Manufacturer from '~~/lib/model/Manufacturer.js';

interface Properties {
  endpoint: string;
  githubUsername?: string;
  githubComment?: string;
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  success: [];
  reset: [];
}>();

const state = ref<string>('closed');
const requestBody = ref<any>(null);
const error = ref<string | null>(null);
const pullRequestUrl = ref<string | null>(null);
const fixtureCreateResult = ref<any>(null);
const previewFixtureKey = ref<string | null>(null);

const stateTitles: Record<string, string> = {
  closed: 'Closed',
  validating: 'Validating your new fixture…',
  ready: 'Submit your new fixture',
  preview: 'Preview fixture',
  uploading: 'Submitting your new fixture…',
  success: 'Upload complete',
  error: 'Upload failed',
};

const stateTitlesPlural: Record<string, string> = {
  ready: 'Submit your new fixtures',
  uploading: 'Submitting your new fixtures…',
};

const fixtureKeys = computed(() => {
  return fixtureCreateResult.value === null ? [] : Object.keys(fixtureCreateResult.value.fixtures);
});

const isPlural = computed(() => fixtureKeys.value.length > 1);

const title = computed(() => {
  return state.value in stateTitlesPlural && isPlural.value ? stateTitlesPlural[state.value] : stateTitles[state.value];
});

const rawData = computed(() => {
  const data = JSON.stringify(requestBody.value, null, 2);

  if (state.value === 'error') {
    const backticks = '```';
    return `${backticks}json\n${data}\n\n${error.value}\n${backticks}`;
  }

  return data;
});

const hasPreview = computed(() => {
  return fixtureCreateResult.value === null
    ? false
    : Object.values(fixtureCreateResult.value.errors).some(
        (errors) => (errors as unknown[]).length === 0,
      );
});

const hasValidationErrors = computed(() => {
  return fixtureCreateResult.value !== null && Object.values(fixtureCreateResult.value.errors).flat().length > 0;
});

const hasValidationWarnings = computed(() => {
  return fixtureCreateResult.value !== null && Object.values(fixtureCreateResult.value.warnings).flat().length > 0;
});

const previewFixture = computed(() => {
  if (previewFixtureKey.value === null) {
    return null;
  }

  const [manufacturerKey, fixtureKey] = previewFixtureKey.value.split('/', 2);

  const manufacturer = new Manufacturer(manufacturerKey, fixtureCreateResult.value.manufacturers[manufacturerKey]);

  return new Fixture(manufacturer, fixtureKey, fixtureCreateResult.value.fixtures[previewFixtureKey.value]);
});

const previewFixtureResults = computed(() => {
  if (previewFixtureKey.value === null) {
    return null;
  }

  return {
    warnings: fixtureCreateResult.value.warnings[previewFixtureKey.value],
    errors: fixtureCreateResult.value.errors[previewFixtureKey.value],
  };
});

const previewFixtureCreateResult = computed(() => {
  if (previewFixtureKey.value === null) {
    return null;
  }

  return {
    manufacturers: fixtureCreateResult.value.manufacturers,
    fixtures: {
      [previewFixtureKey.value]: fixtureCreateResult.value.fixtures[previewFixtureKey.value],
    },
    warnings: {
      [previewFixtureKey.value]: previewFixtureResults.value?.warnings,
    },
    errors: {
      [previewFixtureKey.value]: previewFixtureResults.value?.errors,
    },
  };
});

/**
 * Removes Vue reactivity from a value for serialization.
 * @param value - The reactive value.
 * @returns The plain value.
 */
function toPlain<T>(value: T): T {
  // Vue 3 reactive proxies cannot be passed to `structuredClone`.
  // eslint-disable-next-line unicorn/prefer-structured-clone -- JSON clone strips the proxy
  return JSON.parse(JSON.stringify(value));
}

/**
 * Sends the payload to the fixture validation endpoint.
 * @param body - The fixture data to validate.
 */
async function validate(body: any) {
  requestBody.value = toPlain(body);

  state.value = 'validating';
  try {
    const response = await $fetch<any>(properties.endpoint, {
      method: 'POST',
      body: requestBody.value,
    });

    fixtureCreateResult.value = response.data ?? response;
    state.value = 'ready';
  }
  catch (error_: any) {
    // ofetch exposes the parsed non-2xx response body as `err.data`.
    const errorMessage = error_.data?.error ?? error_.message;

    console.error('There was a problem with the request:', errorMessage);

    error.value = errorMessage;
    state.value = 'error';
  }
}

/**
 * Shows the server's preview for the first created fixture.
 */
async function onPreview() {
  previewFixtureKey.value = Object.keys(fixtureCreateResult.value.fixtures)[0];
  state.value = 'preview';
}

/**
 * Submits the editor result and stores the resulting pull request URL.
 */
async function onSubmit() {
  requestBody.value = toPlain({
    fixtureCreateResult: fixtureCreateResult.value,
    githubUsername: properties.githubUsername ?? null,
    githubComment: properties.githubComment ?? null,
  });

  state.value = 'uploading';
  try {
    const response = await $fetch<any>('/api/v1/fixtures/submit', {
      method: 'POST',
      body: requestBody.value,
    });

    pullRequestUrl.value = response.data?.pullRequestUrl ?? response.pullRequestUrl;
    state.value = 'success';
    emit('success');
  }
  catch (error_: any) {
    // ofetch exposes the parsed non-2xx response body as `err.data`.
    const errorMessage = error_.data?.error ?? error_.message;

    console.error('There was a problem with the request:', errorMessage);

    error.value = errorMessage;
    state.value = 'error';
  }
}

/**
 * Closes the dialog and resets the editor.
 */
function onReset() {
  state.value = 'closed';
  emit('reset');
}

/**
 * Closes the dialog without resetting the editor.
 */
function onCancel() {
  state.value = 'closed';
}

defineExpose({ validate });
</script>
