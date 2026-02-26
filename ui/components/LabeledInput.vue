<template>
  <Validate
    v-if="formstate"
    :state="formstate"
    :custom="customValidators"
    :tag="multipleInputs ? 'div' : 'label'">

    <LabeledValue :name="name">
      <template #label>
        <template v-if="label">{{ label }}</template>
        <slot name="label" />
      </template>

      <slot />

      <div
        v-show="fieldState?.$touched || fieldState?.$submitted"
        class="error-message">
        <div v-if="isSelectField && fieldErrors.required">Please select a value.</div>
        <div v-else-if="fieldErrors.required">Please fill out this field.</div>

        <!-- custom validators -->
        <div v-else-if="fieldErrors['complete-range']">Please fill out both start and end of the range.</div>
        <div v-else-if="fieldErrors['valid-range']">The start value of a range must not be greater than its end.</div>
        <div v-else-if="fieldErrors['categories-not-empty']">Please select at least one category.</div>
        <div v-else-if="fieldErrors['complete-dimensions']">Please fill out all dimensions.</div>
        <div v-else-if="fieldErrors['start-with-uppercase-or-number']">Please start with an uppercase letter or a number.</div>
        <div v-else-if="fieldErrors['no-manufacturer-name']">Don't include the manufacturer name.</div>
        <div v-else-if="fieldErrors['no-mode-name']">Don't include the word "mode", it is appended automatically.</div>
        <div v-else-if="fieldErrors['no-fine-channel-name']">Don't create fine channels manually, set the channel resolution below instead.</div>
        <div v-else-if="fieldErrors['entity-complete']">Please fill out this field.</div>
        <div v-else-if="fieldErrors['entities-have-same-units']">Please use the same unit or select a keyword for both entities.</div>
        <div v-else-if="fieldErrors['valid-color-hex-list']">Please enter a list of #rrggbb (red, green, blue) hex codes.</div>
        <div v-else-if="fieldErrors['max-file-size']">The file size must be less or equal to {{ fieldState?.$attrs['max-file-size'] }}.</div>
        <div v-else-if="fieldErrors['animation-gobo-end-without-start']">AnimationGoboEnd slots must only be used directly after AnimationGoboStart slots.</div>
        <div v-else-if="fieldErrors['must-be-animation-gobo-end']">An AnimationGoboEnd slot must be used directly after an AnimationGoboStart slot.</div>

        <!-- general validators -->
        <div v-else-if="fieldErrors.number">Please enter a number.</div>
        <div v-else-if="fieldErrors['data-exclusive-minimum']">Please enter a value greater than {{ fieldState?.$attrs['data-exclusive-minimum'] }}.</div>
        <div v-else-if="fieldErrors.min">Please enter a value greater or equal to {{ fieldState?.$attrs.min }}.</div>
        <div v-else-if="fieldErrors['data-exclusive-maximum']">Please enter a value less than {{ fieldState?.$attrs['data-exclusive-maximum'] }}.</div>
        <div v-else-if="fieldErrors.max">Please enter a value less or equal to {{ fieldState?.$attrs.max }}.</div>
        <div v-else-if="fieldErrors.step && Number(fieldState?.$attrs.step) === 1">Please enter a whole number.</div>
        <div v-else-if="fieldErrors.step">Please enter a multiple of {{ fieldState?.$attrs.step }}.</div>
        <div v-else-if="fieldErrors.email">Please enter an email address.</div>
        <div v-else-if="fieldErrors.url">Please enter a URL.</div>
        <div v-else-if="fieldErrors.pattern">
          Has to match pattern<span v-if="fieldState?.$attrs.title">: {{ fieldState.$attrs.title }}</span>.
        </div>
      </div>

      <div v-if="hint" class="hint">{{ hint }}</div>

    </LabeledValue>

  </Validate>

  <label v-else>
    <LabeledValue>
      <template #label>
        <template v-if="label">{{ label }}</template>
        <slot name="label" />
      </template>

      <slot />
      <div v-if="hint" class="hint">{{ hint }}</div>
    </LabeledValue>
  </label>
</template>

<script setup lang="ts">
interface Props {
  name?: string;
  label?: string;
  hint?: string;
  formstate?: object;
  customValidators?: object;
  multipleInputs?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multipleInputs: false,
});

const fieldState = computed(() => {
  if (!props.formstate) {
    return null;
  }

  const formstate = props.formstate as { $error?: Record<string, boolean>; [key: string]: unknown };

  if (props.name && formstate.$error?.[props.name]) {
    return formstate[props.name] as object;
  }

  const subFieldNames = Object.keys(formstate).filter(
    subFieldName => subFieldName.startsWith(props.name || ''),
  );

  for (const subFieldName of subFieldNames) {
    if (formstate.$error?.[subFieldName]) {
      const fieldState = formstate[subFieldName] as { $touched?: boolean; $submitted?: boolean };

      if (fieldState.$touched || fieldState.$submitted) {
        return fieldState;
      }
    }
  }

  return {};
});

const fieldErrors = computed(() => {
  if (!('$valid' in (fieldState.value || {})) || (fieldState.value as { $valid?: boolean })?.$valid) {
    return {};
  }

  return (fieldState.value as { $error?: Record<string, boolean> })?.$error || {};
});

const isSelectField = computed(() => {
  return props.name === 'manufacturerKey' || props.name === 'plugin' || /^capability.*?-(?:type|shutterEffect|color|effectPreset|fogType)$/.test(props.name || '');
});
</script>
