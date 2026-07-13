<!-- Dimensions.vue (Vue 3 + script setup + defineModel + withDefaults) -->
<template>
  <span class="dimensions">
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        ref="xInput"
        v-model="x"
        :name="`${name}-x`
        "
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[0]"
        @focus="onFocus"
        @blur="onBlur"
      />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="y"
        :name="`${name}-y`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[1]"
        @focus="onFocus"
        @blur="onBlur"
      />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="z"
        :name="`${name}-z`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[2]"
        @focus="onFocus"
        @blur="onBlur"
      />
    </Validate>
    {{ unit }}
  </span>
</template>

<script setup lang="ts">

type Dimension = number | null;
type Dimensions = [Dimension, Dimension, Dimension] | null;

const props = withDefaults(
  defineProps<{
    hints?: [string, string, string] | string[]; // keep flexibility
    schemaProperty: { items: unknown };
    unit?: string;
    required?: boolean;
    name: string;
    formstate: unknown;
  }>(),
  {
    hints: () => ['x', 'y', 'z'],
    required: false,
    unit: undefined,
  }
);

// v-model for modelValue; same public type: array of 3 numbers|null or null
const model = defineModel<Dimensions>('modelValue', { default: null });

// Emits: focus, blur, vf:validate
const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'vf:validate', payload: { 'complete-dimensions': string }): void;
}>();

// Validation data (same shape)
const validationData = { 'complete-dimensions': '' };

// x/y/z computed like original
const x = computed<Dimension>({
  get: () => (model.value ? model.value[0] : null),
  set: (xVal: Dimension) => {
    model.value = getDimensionsArray(xVal, y.value, z.value);
  },
});

const y = computed<Dimension>({
  get: () => (model.value ? model.value[1] : null),
  set: (yVal: Dimension) => {
    model.value = getDimensionsArray(x.value, yVal, z.value);
  },
});

const z = computed<Dimension>({
  get: () => (model.value ? model.value[2] : null),
  set: (zVal: Dimension) => {
    model.value = getDimensionsArray(x.value, y.value, zVal);
  },
});

const dimensionsSpecified = computed<boolean>(() => model.value !== null);

// focus/blur event handling
function onFocus() {
  emit('focus');
}

function onBlur(event: FocusEvent) {
  const target = event.target as HTMLElement | null;
  const related = (event as unknown as { relatedTarget?: EventTarget | null }).relatedTarget as HTMLElement | null;
  if (!target || !related || target.closest('.dimensions') !== related.closest('.dimensions')) {
    emit('blur');
  }
}

// Public focus() method
const xInput = ref<{ focus: () => void } | null>(null);
function focus() {
  xInput.value?.focus();
}
defineExpose({ focus });

onMounted(() => {
  emit('vf:validate', validationData);
});

// Util: same behavior—null if all are null, otherwise a 3-tuple
function getDimensionsArray(a: Dimension, b: Dimension, c: Dimension): Dimensions {
  if (a === null && b === null && c === null) return null;
  return [a, b, c];
}

</script>
