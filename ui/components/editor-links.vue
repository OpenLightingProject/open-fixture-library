<template>
  <div class="links">
    <div v-for="(link, index) in links" :key="link.uuid" class="linkRow">
      <select
        ref="linkTypeSelect"
        v-model="link.type"
        :disabled="index === 0">
        <option
          v-for="linkType in linkTypes"
          :key="linkType"
          :value="linkType">{{ linkTypeNames[linkType] }}</option>
      </select>

      <app-svg :name="linkTypeIconNames[link.type]" />

      <validate
        :state="formstate"
        tag="span">
        <app-property-input-text
          v-model="link.url"
          :name="`links-${link.uuid}`"
          :schema-property="properties.definitions.urlString"
          type="url"
          required />
      </validate>

      <a
        v-if="index !== 0"
        href="#remove-link"
        title="Remove link"
        @click.prevent="removeLink(index)">
        <app-svg name="close" />
      </a>
    </div>

    <a href="#add-link" @click.prevent="addLink">
      <app-svg name="plus" />
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
import schemaProperties from '~~/lib/schema-properties.js';
import { getEmptyLink } from '~/assets/scripts/editor-utils.mjs';

import propertyInputTextVue from '~/components/property-input-text.vue';
import svgVue from '~/components/svg.vue';

export default {
  components: {
    'app-property-input-text': propertyInputTextVue,
    'app-svg': svgVue
  },
  model: {
    prop: `links`
  },
  props: {
    links: {
      type: Array,
      required: true
    },
    formstate: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties,
      linkTypes: Object.keys(schemaProperties.fixture.links.properties),
      linkTypeIconNames: {
        manual: `file-pdf`,
        productPage: `web`,
        video: `youtube`,
        other: `link-variant`
      },
      linkTypeNames: {
        manual: `Manual`,
        productPage: `Product page`,
        video: `Video`,
        other: `Other`
      }
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
    }
  }
};
</script>

