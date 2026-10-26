<template>
  <component
    :is="multipleInputs ? 'div' : 'label'"
    v-if="formstate && editorForm"
    ref="root">

    <LabeledValue :name="name">
      <template #label>
        <template v-if="label">{{ label }}</template>
        <slot name="label" />
      </template>

      <slot />

      <div
        v-show="errorVisible"
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
        <div v-else-if="fieldErrors['max-file-size']">The file size must be less or equal to {{ fieldAttributes['max-file-size'] }}.</div>
        <div v-else-if="fieldErrors['animation-gobo-end-without-start']">AnimationGoboEnd slots must only be used directly after AnimationGoboStart slots.</div>
        <div v-else-if="fieldErrors['must-be-animation-gobo-end']">An AnimationGoboEnd slot must be used directly after an AnimationGoboStart slot.</div>

        <!-- general validators -->
        <div v-else-if="fieldErrors.number">Please enter a number.</div>
        <div v-else-if="fieldErrors['data-exclusive-minimum']">Please enter a value greater than {{ fieldAttributes['data-exclusive-minimum'] }}.</div>
        <div v-else-if="fieldErrors.min">Please enter a value greater or equal to {{ fieldAttributes.min }}.</div>
        <div v-else-if="fieldErrors['data-exclusive-maximum']">Please enter a value less than {{ fieldAttributes['data-exclusive-maximum'] }}.</div>
        <div v-else-if="fieldErrors.max">Please enter a value less or equal to {{ fieldAttributes.max }}.</div>
        <div v-else-if="fieldErrors.step && Number(fieldAttributes.step) === 1">Please enter a whole number.</div>
        <div v-else-if="fieldErrors.step">Please enter a multiple of {{ fieldAttributes.step }}.</div>
        <div v-else-if="fieldErrors.email">Please enter an email address.</div>
        <div v-else-if="fieldErrors.url">Please enter a URL.</div>
        <div v-else-if="fieldErrors.pattern">
          Has to match pattern<span v-if="fieldAttributes.title">: {{ fieldAttributes.title }}</span>.
        </div>
      </div>

      <div v-if="hint" class="hint">{{ hint }}</div>

    </LabeledValue>

  </component>

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
import {
  useEditorFieldGroup,
  useEditorFormContext,
} from '~/composables/useEditorForm';

interface Properties {
  name?: string;
  label?: string;
  hint?: string;
  formstate?: object;
  customValidators?: object;
  multipleInputs?: boolean;
}

const properties = withDefaults(defineProps<Properties>(), {
  name: '',
  label: '',
  hint: '',
  formstate: undefined,
  customValidators: undefined,
  multipleInputs: false,
});

const editorForm = useEditorFormContext();
const root = ref<HTMLElement | null>(null);

const fieldGroup = useEditorFieldGroup({
  name: () => properties.name || '',
  root: () => root.value,
  customValidators: () => (properties.customValidators as Record<string, unknown>) ?? {},
  enabled: () => Boolean(editorForm && properties.formstate),
});

const fieldNames = computed(() => {
  return [...new Set([properties.name, ...fieldGroup.names.value].filter(Boolean) as string[])];
});

const errorFieldName = computed(() => {
  if (!editorForm) {
    return '';
  }

  const errors = editorForm.errors.value;

  for (const fieldName of fieldNames.value) {
    if (errors[fieldName] && (editorForm.isTouched(fieldName) || editorForm.submitted.value)) {
      return fieldName;
    }
  }

  return '';
});

const fieldErrors = computed(() => {
  const errorName = editorForm?.errors.value[errorFieldName.value];
  return errorName ? { [errorName]: true } : {};
});

const fieldAttributes = computed(() => {
  return fieldGroup.getAttrs(errorFieldName.value);
});

const errorVisible = computed(() => Boolean(errorFieldName.value));

const isSelectField = computed(() => {
  return properties.name === 'manufacturerKey' || properties.name === 'plugin' || /^capability.*?-(?:type|shutterEffect|color|effectPreset|fogType)$/.test(properties.name || '');
});
</script>
