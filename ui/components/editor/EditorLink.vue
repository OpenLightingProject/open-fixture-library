<template>
  <div class="link-row">
    <select ref="linkTypeSelect" v-model="type">
      <option
        v-for="linkType of linkTypes"
        :key="linkType"
        :value="linkType">{{ linkTypeNames[linkType] }}</option>
    </select>

    <OflSvg :name="linkTypeIconNames[link.type]" />

    <PropertyInputText
      v-model="url"
      :name="`links-${link.uuid}`"
      :schema-property="schemaDefinitions.urlString"
      type="url"
      :hint="placeholder"
      required />

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
import fixtureLinkTypes from '@/assets/scripts/fixture-link-types.js';
import { linksProperties, schemaDefinitions } from '~~/lib/schema-properties.js';

interface Properties {
  link: {
    type: string;
    url: string;
    uuid: string;
  };
  canRemove: boolean;
  // eslint-disable-next-line vue/no-unused-properties -- absorbs the shared `formstate` attribute from editor parents
  formstate: object;
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'set-type': [value: string];
  'set-url': [value: string];
  'remove': [];
}>();

const linkTypeSelect = ref<HTMLSelectElement | null>(null);

const placeholders: Record<string, string> = {
  manual: 'e.g. https://example.org/fixture/manual.pdf',
  productPage: 'e.g. https://example.org/fixture',
  video: 'e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  other: 'e.g. https://example.org/relevant-page',
};

const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
const linkTypes = Object.keys(linksProperties);

const type = computed({
  get() {
    return properties.link.type;
  },
  set(value: string) {
    emit('set-type', value);
  },
});

const url = computed({
  get() {
    return properties.link.url;
  },
  set(value: string) {
    emit('set-url', value);
  },
});

const placeholder = computed(() => placeholders[properties.link.type]);

/**
 * Focuses the link type select.
 */
function focus() {
  linkTypeSelect.value?.focus();
}

defineExpose({ focus });
</script>
