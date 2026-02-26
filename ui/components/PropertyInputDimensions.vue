<template>
  <span class="dimensions">
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        ref="xInput"
        v-model="x"
        :name="`${name}-x`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[0]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="y"
        :name="`${name}-y`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[1]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    &times;
    <Validate :state="formstate" tag="span">
      <PropertyInputNumber
        v-model="z"
        :name="`${name}-z`"
        :schema-property="schemaProperty.items"
        :required="required || dimensionsSpecified"
        :hint="hints[2]"
        @focus="onFocus()"
        @blur="onBlur($event)" />
    </Validate>
    {{ unit }}
  </span>
</template>

<script setup lang="ts">

interface Props {
  modelValue?: number[] | null;
  hints?: string[];
  schemaProperty: {
    items: object;
  };
  unit?: string;
  required?: boolean;
  name: string;
  formstate: object;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  hints: () => ['x', 'y', 'z'],
  required: false,
});

const emit = defineEmits<{
  'update:model-value': [dimensions: number[] | null];
  focus: [];
  blur: [];
  'vf:validate': [validationData: { 'complete-dimensions': string }];
}>();

const xInput = ref<InstanceType<typeof PropertyInputNumber> | null>(null);

const validationData = ref({
  'complete-dimensions': '',
});

const x = computed({
  get: () => props.modelValue ? props.modelValue[0] : null,
  set: (xInputVal: number | null) => {
    emit('update:model-value', getDimensionsArray(xInputVal, y.value, z.value));
  },
});

const y = computed({
  get: () => props.modelValue ? props.modelValue[1] : null,
  set: (yInputVal: number | null) => {
    emit('update:model-value', getDimensionsArray(x.value, yInputVal, z.value));
  },
});

const z = computed({
  get: () => props.modelValue ? props.modelValue[2] : null,
  set: (zInputVal: number | null) => {
    emit('update:model-value', getDimensionsArray(x.value, y.value, zInputVal));
  },
});

const dimensionsSpecified = computed(() => props.modelValue !== null);

onMounted(() => {
  emit('vf:validate', validationData.value);
});

const onFocus = () => {
  emit('focus');
};

const onBlur = (event: FocusEvent) => {
  if (!(event.target && event.relatedTarget) || (event.target as Element).closest('.dimensions') !== (event.relatedTarget as Element)?.closest('.dimensions')) {
    emit('blur');
  }
};

defineExpose({
  focus: () => {
    xInput.value?.focus();
  },
});

function getDimensionsArray(x: number | null, y: number | null, z: number | null): [number, number, number] | null {
  if (x === null && y === null && z === null) {
    return null;
  }

  return [x, y, z];
}
</script>
