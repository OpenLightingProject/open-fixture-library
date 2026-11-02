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

<style lang="scss" scoped>
.links a {
  display: inline-flex;
  gap: 0.5ex;
  align-items: center;
}
</style>

<script setup lang="ts">
import { getEmptyLink } from '@/assets/scripts/editor-utilities.js';

interface Link {
  uuid: string;
  type: string;
  url: string;
}

interface Properties {
  modelValue: Link[];
  formstate: object;
}

const properties = defineProps<Properties>();
const emit = defineEmits<{
  'update:model-value': [value: Link[]];
}>();

const links = ref<any[]>([]);

/**
 * Appends an empty link and focuses its editor.
 */
async function addLink() {
  const newLinks = [...properties.modelValue, getEmptyLink()];
  emit('update:model-value', newLinks);

  await nextTick();
  if (links.value[newLinks.length - 1]) {
    links.value[newLinks.length - 1].focus();
  }
}

/**
 * Updates one property of a link.
 * @param updateLink - The link to update.
 * @param key - The property name.
 * @param value - The new property value.
 */
function updateLinkProperty(updateLink: Link, key: string, value: string) {
  const updatedLink = {
    ...updateLink,
    [key]: value,
  };

  emit('update:model-value', properties.modelValue.map(
    (link) => (link === updateLink ? updatedLink : link),
  ));
}

/**
 * Removes a link from the list.
 * @param linkToRemove - The link to remove.
 */
function removeLink(linkToRemove: Link) {
  emit('update:model-value', properties.modelValue.filter(
    (link) => link !== linkToRemove,
  ));
}
</script>
