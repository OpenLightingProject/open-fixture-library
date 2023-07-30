<template>
  <div class="links">
    <EditorLink
      v-for="link of modelValue"
      :key="link.uuid"
      ref="links"
      :link="link"
      :can-remove="modelValue.length > 1"
      :formstate="formstate"
      @set-type="updateLinkProperty(link, `type`, $event)"
      @set-url="updateLinkProperty(link, `url`, $event)"
      @remove="removeLink(link)" />

    <a href="#add-link" @click.prevent="addLink()">
      <OflSvg name="plus" />
      Add link
    </a>
  </div>
</template>

<script>
import { arrayProp, objectProp } from 'vue-ts-types';
import { getEmptyLink } from '../../assets/scripts/editor-utils.js';

import EditorLink from './EditorLink.vue';

export default {
  components: {
    EditorLink,
  },
  inheritAttrs: false,
  model: {
    prop: `model-value`,
    event: `update:model-value`,
  },
  props: {
    modelValue: arrayProp().required,
    formstate: objectProp().required,
  },
  emits: {
    'update:model-value': value => true,
  },
  methods: {
    async addLink() {
      const newLinks = [...this.modelValue, getEmptyLink()];
      this.$emit(`update:model-value`, newLinks);

      await this.$nextTick();
      this.$refs.links[newLinks.length - 1].focus();
    },
    updateLinkProperty(updateLink, key, value) {
      const updatedLink = {
        ...updateLink,
        [key]: value,
      };

      this.$emit(`update:model-value`, this.modelValue.map(
        link => (link === updateLink ? updatedLink : link),
      ));
    },
    removeLink(removeLink) {
      this.$emit(`update:model-value`, this.modelValue.filter(
        link => link !== removeLink,
      ));
    },
  },
};
</script>

