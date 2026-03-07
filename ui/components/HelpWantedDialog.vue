<template>
  <A11yDialog
    id="help-wanted-dialog"
    ref="dialog"
    :is-alert-dialog="state === 'loading'"
    :shown="modelValue !== undefined"
    :title="title"
    @hide="onHide()">

    <form v-if="state === 'ready' && modelValue !== undefined" action="#" @submit.prevent="onSubmit()">
      <LabeledValue
        v-if="location !== null"
        key="location"
        :value="location"
        label="Location" />

      <LabeledValue
        v-if="modelValue.helpWanted !== null"
        key="help-wanted"
        label="Problem description">
        <span v-html="modelValue.helpWanted" />
      </LabeledValue>

      <LabeledInput name="message" label="Message">
        <textarea v-model="message" name="message" />
      </LabeledInput>

      <LabeledInput
        name="github-username"
        label="GitHub username"
        hint="If you want to be mentioned in the issue.">
        <input v-model="githubUsername" type="text" name="github-username">
      </LabeledInput>

      <div class="button-bar right">
        <button :disabled="message === ''" type="submit" class="primary">Send information</button>
      </div>
    </form>

    <template v-else-if="state === 'loading'">
      Uploading…
    </template>

    <template v-else-if="state === 'success'">
      Your information was successfully uploaded to GitHub (see the <a :href="issueUrl" target="_blank" rel="noopener">issue</a>). The fixture will be updated as soon as your information has been reviewed. Thank you for your contribution!

      <div class="button-bar right">
        <a href="#" class="button secondary" @click.prevent="hide()">Close</a>
        <a :href="issueUrl" class="button primary" target="_blank">See issue</a>
      </div>
    </template>

    <template v-else-if="state === 'error'">
      <span>Unfortunately, there was an error while uploading. Please copy the following data and manually submit it.</span>

      <textarea :value="errorData" readonly />

      <div class="button-bar right">
        <a href="#" class="button secondary" @click.prevent="hide()">Close</a>
        <a :href="mailtoUrl" class="button secondary" target="_blank">Send email</a>
        <a
          href="https://github.com/OpenLightingProject/open-fixture-library/issues/new"
          class="button primary"
          target="_blank"
          rel="noopener">
          Create issue on GitHub
        </a>
      </div>
    </template>

  </A11yDialog>
</template>

<style lang="scss" scoped>
.form-dialog {
  .button-bar {
    margin-top: 2ex;
  }
}
.error-textarea {
  width: 100%;
  min-height: 10em;
  margin-top: 1ex;
  font-family: $font-stack-code;
}
.loading-text {
  display: inline-block;
  margin: 1em 0;
  font-weight: bold;
}
.success-message {
  margin: 1ex 0;
}
.dialog-body {
  padding: 1ex 0;
}
.dialog-footer {
  text-align: right;
  padding-top: 1ex;
}

.loading-text, .success-message {
  text-align: center;
}

.error-box {
  border: 1px solid theme-color(error);
  background-color: theme-color(error-background);
  padding: 1em;
  border-radius: 3px;
  margin-top: 1em;
  text-align: center;
}

.dialog-body .form-control {
  margin-bottom: 1.5ex;
}

.dialog-body .error-message {
  color: theme-color(error);
  font-weight: bold;
  margin-top: 0.5ex;
}

.dialog-body .button-bar {
  margin-top: 2ex;
}

.dialog-body textarea {
  width: 100%;
  min-height: 5em;
  margin-top: 1ex;
  font-family: $font-stack-code;
}
</style>

<script setup lang="ts">
interface Capability {
  name: string;
  rawDmxRange: string;
  _channel: {
    key: string;
    fixture: { manufacturer: { key: string }; key: string };
  };
}

interface PluginContext {
  key: string;
}

interface FixtureContext {
  manufacturer: { key: string };
  key: string;
}

interface Props {
  type: 'plugin' | 'fixture' | 'capability';
  modelValue?: (Capability | FixtureContext | PluginContext) & { helpWanted: string | null };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: undefined];
}>();

const dialog = ref<InstanceType<typeof A11yDialog> | null>(null);

const state = ref<'ready' | 'loading' | 'success' | 'error'>('ready');
const message = ref('');
const githubUsername = ref('');
const issueUrl = ref<string | null>(null);
const error = ref<string | null>(null);

const title = computed(() => {
  if (state.value === 'loading') return 'Sending your message…';
  if (state.value === 'success') return 'Message sent';
  if (state.value === 'error') return 'Failed to send message';
  if (props.type === 'plugin') return 'Improve plugin';
  return 'Improve fixture';
});

const location = computed(() => {
  if (props.type === 'capability' && props.modelValue && 'name' in props.modelValue && '_channel' in props.modelValue) {
    const capability = props.modelValue as Capability;
    const channel = capability._channel;
    return `Channel "${channel.key}" → Capability "${capability.name}" (${capability.rawDmxRange})`;
  }
  return null;
});

const fixtureContext = computed(() => {
  if (props.type === 'fixture' && props.modelValue) return props.modelValue as FixtureContext;
  if (props.type === 'capability' && props.modelValue?._channel) return props.modelValue._channel.fixture;
  return null;
});

const sendObject = computed(() => {
  const obj: Record<string, unknown> = {
    type: props.type,
    location: location.value,
    helpWanted: props.modelValue?.helpWanted,
    message: message.value,
    githubUsername: githubUsername.value === '' ? null : githubUsername.value,
  };

  if (props.type === 'plugin' && props.modelValue && 'key' in props.modelValue) {
    obj.context = props.modelValue.key;
  }
  else if (fixtureContext.value) {
    obj.context = `${fixtureContext.value.manufacturer.key}/${fixtureContext.value.key}`;
  }

  return obj;
});

const errorData = computed(() => `${JSON.stringify(sendObject.value, null, 2)}\n\n${error.value}`);

const mailtoUrl = computed(() => {
  const subject = `Feedback for ${sendObject.value.type} '${sendObject.value.context}'`;

  const mailBodyData: Record<string, string | null> = {
    'Problem location': location.value,
    'Problem description': props.modelValue?.helpWanted || null,
    'Message': message.value,
  };

  const body = Object.entries(mailBodyData).filter(
    ([, value]) => value !== null,
  ).map(([key, value]) => {
    const separator = value?.includes('\n') ? '\n' : ' ';
    return `${key}:${separator}${value}`;
  }).join('\n');

  return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

onMounted(() => {
  if (import.meta.client && localStorage) {
    githubUsername.value = localStorage.getItem('prefillGithubUsername') || '';
  }
});

const onSubmit = async () => {
  state.value = 'loading';
  if (import.meta.client && localStorage) {
    localStorage.setItem('prefillGithubUsername', githubUsername.value);
  }

  try {
    const response = await $fetch<{ error?: string; issueUrl?: string }>('/api/v1/submit-feedback', {
      method: 'POST',
      body: sendObject.value,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    issueUrl.value = response.issueUrl || null;
    state.value = 'success';
  }
  catch (e) {
    console.error('There was a problem with the request.', e);
    error.value = (e as Error).message;
    state.value = 'error';
  }
};

const hide = () => {
  dialog.value?.$emit('hide');
};

const onHide = () => {
  if (state.value === 'success') {
    message.value = '';
  }

  state.value = 'ready';
  issueUrl.value = null;
  error.value = null;
  emit('update:model-value', undefined);
};
</script>
