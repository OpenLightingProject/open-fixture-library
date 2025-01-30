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

<script>
import { booleanProp, objectProp } from 'vue-ts-types';
import { linksProperties, schemaDefinitions } from '../../../lib/schema-properties.js';
import fixtureLinkTypes from '../../assets/scripts/fixture-link-types.js';

import PropertyInputText from '../PropertyInputText.vue';

const placeholders = {
  manual: `e.g. https://example.org/fixture/manual.pdf`,
  productPage: `e.g. https://example.org/fixture`,
  video: `e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
  other: `e.g. https://example.org/relevant-page`,
};

export default {
  components: {
    PropertyInputText,
  },
  props: {
    link: objectProp().required,
    canRemove: booleanProp().required,
    formstate: objectProp().required,
  },
  emits: {
    'set-type': type => true,
    'set-url': url => true,
    remove: () => true,
  },
  data() {
    const { linkTypeIconNames, linkTypeNames } = fixtureLinkTypes;
    return {
      schemaDefinitions,
      linkTypes: Object.keys(linksProperties),
      linkTypeIconNames,
      linkTypeNames,
    };
  },
  computed: {
    type: {
      get() {
        return this.link.type;
      },
      set(type) {
        this.$emit(`set-type`, type);
      },
    },
    url: {
      get() {
        return this.link.url;
      },
      set(url) {
        this.$emit(`set-url`, url);
      },
    },
    placeholder() {
      return placeholders[this.type];
    },
  },
  methods: {
    /** @public */
    focus() {
      this.$refs.linkTypeSelect.focus();
    },
  },
};
</script>
