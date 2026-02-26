<template>
  <div class="link-row">
    <select ref="linkTypeSelect" v-model="type">
      <option
        v-for="linkType of linkTypes"
        :key="linkType"
        :value="linkType">{{ linkTypeNames[linkType] }}</option>
    </select>

    <OflSvg :name="linkTypeIconNames[link.type]" />

    <Validate :state="formstate" tag="span">
      <PropertyInputText
        v-model="url"
        :name="`links-${link.uuid}`"
        :schema-property="schemaDefinitions.urlString"
        type="url"
        :hint="placeholder"
        required />
    </Validate>

    <button
      v-if="canRemove"
      type="button"
      class="icon-button"
      title="Remove link"
      @click.prevent="$emit(`remove`)">
      <OflSvg name="close" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.link-row {
  margin-bottom: 4px;

  select {
    width: 17ex;
    margin-right: 1ex;
  }

  & > .icon {
    margin-right: 0.5ex;
  }
}

.icon-button {
  margin-left: 0.5ex;
}
</style>

<script setup lang="ts">
import { linksProperties, schemaDefinitions } from '~~/lib/schema-properties.js';
import fixtureLinkTypes from '@/assets/scripts/fixture-link-types.js';

interface Props {
  link: {
    type: string;
    url: string;
    uuid: string;
  };
  canRemove: boolean;
  formstate: object;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'set-type': [value: string];
  'set-url': [value: string];
  remove: [];
}>();

const linkTypeSelect = ref<HTMLSelectElement | null>(null);

const placeholders: Record<string, string> = {
  manual: `e.g. https://example.org/fixture/manual.pdf`,
  productPage: `e.g. https://example.org/fixture`,
  video: `e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
  other: `e.g. https://example.org/relevant-page`,
};

const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
const linkTypes = Object.keys(linksProperties);

const type = computed({
  get() {
    return props.link.type;
  },
  set(value: string) {
    emit('set-type', value);
  },
});

const url = computed({
  get() {
    return props.link.url;
  },
  set(value: string) {
    emit('set-url', value);
  },
});

const placeholder = computed(() => placeholders[props.type]);

function focus() {
  linkTypeSelect.value?.focus();
}

defineExpose({ focus });
</script>
