<template>
  <span ref="root" class="dimensions">
    <PropertyInputNumber
      ref="xInput"
      v-model="x"
      :name="`${name}-x`"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsSpecified"
      :hint="hints[0]"
      @focus="onFocus()"
      @blur="onBlur($event)" />
    &times;
    <PropertyInputNumber
      v-model="y"
      :name="`${name}-y`"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsSpecified"
      :hint="hints[1]"
      @focus="onFocus()"
      @blur="onBlur($event)" />
    &times;
    <PropertyInputNumber
      v-model="z"
      :name="`${name}-z`"
      :schema-property="schemaProperty.items"
      :required="required || dimensionsSpecified"
      :hint="hints[2]"
      @focus="onFocus()"
      @blur="onBlur($event)" />
    {{ unit }}
  </span>
</template>

<script setup lang="ts">
import { useEditorGroupField } from '~/composables/useEditorForm';
import PropertyInputNumber from './PropertyInputNumber.vue';

interface Properties {
  modelValue?: number[] | null;
  hints?: string[];
  schemaProperty: {
    items: object;
  };
  unit?: string;
  required?: boolean;
  name: string;
  // eslint-disable-next-line vue/no-unused-properties -- absorbs the shared `formstate` attribute from editor parents
  formstate: object;
}

const properties = withDefaults(defineProps<Properties>(), {
  modelValue: null,
  hints: () => ['x', 'y', 'z'],
  unit: '',
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [dimensions: number[] | null];
  'focus': [];
  'blur': [];
  'vf:validate': [validationData: { 'complete-dimensions': string }];
}>();

const xInput = ref<InstanceType<typeof PropertyInputNumber> | null>(null);
const root = ref<HTMLElement | null>(null);

const { touch } = useEditorGroupField(
  () => ({
    name: properties.name,
    getValue: () => properties.modelValue,
    getRules: () => [{ name: 'complete-dimensions' }],
    getAttrs: () => ({}),
    getElement: () => root.value,
  }),
  () => properties.modelValue,
);

const validationData = ref({
  'complete-dimensions': '',
});

const x = computed({
  get: () => (properties.modelValue ? properties.modelValue[0] : null),
  set: (xInputValue: number | null) => {
    emit('update:model-value', getDimensionsArray(xInputValue, y.value, z.value));
  },
});

const y = computed({
  get: () => (properties.modelValue ? properties.modelValue[1] : null),
  set: (yInputValue: number | null) => {
    emit('update:model-value', getDimensionsArray(x.value, yInputValue, z.value));
  },
});

const z = computed({
  get: () => (properties.modelValue ? properties.modelValue[2] : null),
  set: (zInputValue: number | null) => {
    emit('update:model-value', getDimensionsArray(x.value, y.value, zInputValue));
  },
});

const dimensionsSpecified = computed(() => properties.modelValue !== null);

onMounted(() => {
  emit('vf:validate', validationData.value);
});

const onFocus = () => {
  emit('focus');
};

const onBlur = (event: FocusEvent) => {
  if (event.target && event.relatedTarget
    && (event.target as Element).closest('.dimensions') === (event.relatedTarget as Element).closest('.dimensions')) {
    return;
  }

  touch();
  emit('blur');
};

defineExpose({
  focus: () => {
    xInput.value?.focus();
  },
});

/**
 * Builds the dimensions tuple, or `null` when all axes are empty.
 * @param xValue - The width value.
 * @param yValue - The height value.
 * @param zValue - The depth value.
 * @returns The dimensions tuple or `null`.
 */
function getDimensionsArray(xValue: number | null, yValue: number | null, zValue: number | null): [number, number, number] | null {
  return xValue === null && yValue === null && zValue === null ? null : [xValue, yValue, zValue];
}
</script>
