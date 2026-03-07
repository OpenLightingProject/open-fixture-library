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

<script setup lang="ts">
import { getEmptyLink } from '@/assets/scripts/editor-utilities.js';

interface Link {
  uuid: string;
  type: string;
  url: string;
}

interface Props {
  modelValue: Link[];
  formstate: object;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:model-value': [value: Link[]];
}>();

const links = ref<any[]>([]);

async function addLink() {
  const newLinks = [...props.modelValue, getEmptyLink()];
  emit('update:model-value', newLinks);

  await nextTick();
  if (links.value[newLinks.length - 1]) {
    links.value[newLinks.length - 1].focus();
  }
}

function updateLinkProperty(updateLink: Link, key: string, value: string) {
  const updatedLink = {
    ...updateLink,
    [key]: value,
  };

  emit('update:model-value', props.modelValue.map(
    link => (link === updateLink ? updatedLink : link),
  ));
}

function removeLink(removeLink: Link) {
  emit('update:model-value', props.modelValue.filter(
    link => link !== removeLink,
  ));
}
</script>
