<template>
  <div>
    <h1>Import fixture file</h1>

    <section class="card yellow">
      <strong>Warning:</strong> The fixture can not be edited after importing, so please provide as much information as possible in the comment.
    </section>

    <noscript class="card yellow">
      Please enable JavaScript to use the Fixture Importer!
    </noscript>

    <ClientOnly placeholder="Fixture Importer is loading...">

      <form
        action="#"
        class="only-js"
        novalidate
        @submit.prevent="onSubmit()">

        <section class="card">
          <h2>File information</h2>

          <LabeledInput :formstate="formstate" name="plugin" label="Import file type">
            <select
              v-model="plugin"
              :class="{ empty: plugin === '' }"
              required
              name="plugin">

              <option value="" disabled>Please select an import file type</option>

              <template v-for="pluginKey of plugins.importPlugins" :key="pluginKey">
                <option :value="pluginKey">
                  {{ plugins.data[pluginKey].name }}
                </option>
              </template>

            </select>

            <div class="hint">See <a href="/about/plugins" target="_blank">supported import plugins</a>.</div>
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="file"
            label="Fixture definition file"
            hint="Maximum file size is 50MB.">
            <EditorFileUpload
              v-model="file"
              required
              name="file"
              max-file-size="50MB" />
          </LabeledInput>

          <LabeledInput :formstate="formstate" name="githubComment" label="Comment">
            <textarea v-model="githubComment" name="githubComment" />
          </LabeledInput>
        </section>

        <section class="user card">
          <h2>Author data</h2>

          <LabeledInput :formstate="formstate" name="author" label="Your name">
            <input
              v-model="author"
              type="text"
              required
              name="author"
              placeholder="e.g. Anonymous">
          </LabeledInput>

          <LabeledInput
            :formstate="formstate"
            name="githubUsername"
            label="GitHub username"
            hint="If you want to be mentioned in the pull request.">
            <input
              v-model="githubUsername"
              type="text"
              name="githubUsername">
          </LabeledInput>

          <LabeledInput hidden name="honeypot" label="Ignore this!">
            <input v-model="honeypot" type="text" name="honeypot">
            <div class="hint">Spammers are likely to fill this field. Leave it empty to show that you're a human.</div>
          </LabeledInput>
        </section>

        <div class="button-bar right">
          <button type="submit" class="primary">Import fixture</button>
        </div>
      </form>

      <EditorSubmitDialog
        ref="submitDialog"
        endpoint="/api/v1/fixtures/import"
        :github-username="githubUsername"
        :github-comment="githubComment"
        @success="storePrefillData()"
        @reset="reset()" />

    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { getEmptyFormState, scrollToFirstInvalidField } from '@/assets/scripts/editor-utilities.js';
import { useEditorForm } from '~/composables/useEditorForm';
import { getStoredItem, setStoredItem } from '~/utils/storage';

const editorForm = useEditorForm();
const formstate = ref(getEmptyFormState());
const plugin = ref('');
const file = ref<File | undefined>(undefined);
const githubComment = ref('');
const author = ref('');
const githubUsername = ref('');
const honeypot = ref('');
const submitDialog = ref<{ validate: (data: object) => void } | null>(null);

const { data: plugins } = await useFetch('/api/v1/plugins');

function getFileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      resolve(fileReader.result as string);
    });
    fileReader.addEventListener('error', reject);
    fileReader.addEventListener('abort', reject);

    fileReader.readAsDataURL(file);
  });
}

async function onSubmit() {
  const { valid } = await editorForm.submit();
  if (!valid) {
    scrollToFirstInvalidField();
    return;
  }

  if (honeypot.value !== '') {
    alert('Do not fill the "Ignore" fields!');
    return;
  }

  try {
    const fileDataUrl = await getFileDataUrl(file.value!);
    const [, fileContentBase64] = fileDataUrl.match(/base64,(.+)$/)!;

    submitDialog.value?.validate({
      plugin: plugin.value,
      fileName: file.value!.name,
      fileContentBase64,
      author: author.value,
    });
  }
  catch (fileReaderError) {
    alert('Could not read the file.');
    console.error('Could not read the file.', fileReaderError);
  }
}

async function reset() {
  file.value = undefined;
  githubComment.value = '';

  await nextTick();
  editorForm.reset();
}

function applyStoredPrefillData() {
  if (!import.meta.client) {
    return;
  }

  if (author.value === '') {
    author.value = getStoredItem('prefillAuthor') || '';
  }

  if (githubUsername.value === '') {
    githubUsername.value = getStoredItem('prefillGithubUsername') || '';
  }
}

function storePrefillData() {
  setStoredItem('prefillAuthor', author.value);
  setStoredItem('prefillGithubUsername', githubUsername.value);
}

onMounted(() => {
  applyStoredPrefillData();
});

useHead({
  title: 'Import fixture',
});
</script>
