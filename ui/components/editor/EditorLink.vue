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
        :schema-property="properties.definitions.urlString"
        type="url"
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
import schemaProperties from '../../../lib/schema-properties.js';
import fixtureLinksMixin from '../../assets/scripts/fixture-links-mixin.js';

import PropertyInputText from '../PropertyInputText.vue';

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
      properties: schemaProperties,
      linkTypes: Object.keys(schemaProperties.links),
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
  },
  methods: {
    // Called from parent
    focus() { // eslint-disable-line vue/no-unused-properties
      this.$refs.linkTypeSelect.focus();
    },
  },
};
</script>

