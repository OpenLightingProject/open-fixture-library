<template>
  <div class="links">
    <div v-for="(link, index) in links" :key="link.uuid" class="linkRow">
      <select ref="linkTypeSelect" v-model="link.type">
        <option
          v-for="linkType in linkTypes"
          :key="linkType"
          :value="linkType">{{ linkTypeNames[linkType] }}</option>
      </select>

      <OflSvg :name="linkTypeIconNames[link.type]" />

      <Validate :state="formstate" tag="span">
        <PropertyInputText
          v-model="link.url"
          :name="`links-${link.uuid}`"
          :schema-property="properties.definitions.urlString"
          type="url"
          required />
      </Validate>

      <a
        v-if="links.length > 1"
        href="#remove-link"
        title="Remove link"
        @click.prevent="removeLink(index)">
        <OflSvg name="close" />
      </a>
    </div>

    <a href="#add-link" @click.prevent="addLink">
      <OflSvg name="plus" />
      Add link
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
import { getEmptyLink } from '../../assets/scripts/editor-utils.js';
import fixtureLinksMixin from '../../assets/scripts/fixture-links-mixin.js';

import PropertyInputText from '../PropertyInputText.vue';

export default {
  components: {
    PropertyInputText,
  },
  mixins: [fixtureLinksMixin],
  model: {
    prop: `links`,
  },
  props: {
    name: { // allow name prop just for vue-form; has no real use in here
      type: String,
      required: false,
      default: ``,
    },
    links: {
      type: Array,
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
  methods: {
    addLink() {
      const newLength = this.links.push(getEmptyLink());

      this.$nextTick(() => {
        this.$refs.linkTypeSelect[newLength - 1].focus();
      });
    },
    removeLink(index) {
      this.$delete(this.links, index);
    },
  },
};
</script>

