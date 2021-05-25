<template>
  <div class="linkRow">
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

    <a
      v-if="canRemove"
      href="#remove-link"
      title="Remove link"
      @click.prevent="$emit(`remove`)">
      <OflSvg name="close" />
    </a>
  </div>
</template>

<style lang="scss" scoped>
.linkRow {
  margin-bottom: 4px;
}

select {
  width: 17ex;
  margin-right: 1ex;
}

.icon {
  margin-right: 0.5ex;
}
</style>

<script>
import { schemaDefinitions, linksProperties } from '../../../lib/schema-properties.js';
import fixtureLinksMixin from '../../assets/scripts/fixture-links-mixin.js';

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
  mixins: [fixtureLinksMixin],
  props: {
    link: {
      type: Object,
      required: true,
    },
    canRemove: {
      type: Boolean,
      required: true,
    },
    formstate: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      schemaDefinitions,
      linkTypes: Object.keys(linksProperties),
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
