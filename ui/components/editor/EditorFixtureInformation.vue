<template>
  <section class="fixture-info card">
    <h2>Fixture info</h2>

    <LabeledInput
      :formstate="formstate"
      :custom-validators="{ 'no-manufacturer-name': fixtureNameIsWithoutManufacturer }"
      name="fixture-name"
      label="Name">
      <PropertyInputText
        v-model="fixture.name"
        :schema-property="fixtureProperties.name"
        required
        name="fixture-name" />
    </LabeledInput>

    <LabeledInput :formstate="formstate" name="fixture-shortName" label="Unique short name">
      <PropertyInputText
        v-model="fixture.shortName"
        :schema-property="fixtureProperties.shortName"
        name="fixture-shortName"
        hint="defaults to name" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      name="fixture-categories"
      label="Categories"
      hint="Select and reorder all applicable categories, the most suitable first.">
      <EditorCategoryChooser
        v-model="fixture.categories"
        :all-categories="fixtureProperties.categories.items.enum"
        name="fixture-categories"
        categories-not-empty />
    </LabeledInput>

    <LabeledInput :formstate="formstate" name="comment" label="Comment">
      <PropertyInputTextarea
        v-model="fixture.comment"
        :schema-property="fixtureProperties.comment"
        name="comment" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      name="links"
      label="Relevant links">
      <EditorLinks v-model="fixture.links" name="links" :formstate="formstate" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      name="rdmModelId"
      hint="The RDM manufacturer ID is saved per manufacturer.">
      <template #label><abbr title="Remote Device Management">RDM</abbr> model ID</template>
      <PropertyInputNumber
        v-model="fixture.rdmModelId"
        :schema-property="fixtureProperties.rdm.properties.modelId"
        name="rdmModelId" />
    </LabeledInput>

    <LabeledInput
      v-if="fixture.rdmModelId !== null"
      :formstate="formstate"
      name="rdmSoftwareVersion"
      label="RDM software version">
      <PropertyInputText
        v-model="fixture.rdmSoftwareVersion"
        :schema-property="fixtureProperties.rdm.properties.softwareVersion"
        name="rdmSoftwareVersion" />
    </LabeledInput>
  </section>
</template>

<script setup lang="ts">
import { fixtureProperties } from '~~/lib/schema-properties.js';

import LabeledInput from '../LabeledInput.vue';
import PropertyInputNumber from '../PropertyInputNumber.vue';
import PropertyInputText from '../PropertyInputText.vue';
import PropertyInputTextarea from '../PropertyInputTextarea.vue';
import EditorCategoryChooser from './EditorCategoryChooser.vue';
import EditorLinks from './EditorLinks.vue';

interface Props {
  fixture: object;
  formstate: object;
  manufacturers: object;
}

const props = defineProps<Props>();

const manufacturerName = computed(() => {
  if (!props.fixture.useExistingManufacturer) {
    return props.fixture.newManufacturerName;
  }

  const manufacturerKey = props.fixture.manufacturerKey;

  if (manufacturerKey === ``) {
    return ``;
  }

  return (props.manufacturers as any)[manufacturerKey]?.name ?? '';
});

const fixtureNameIsWithoutManufacturer = computed(() => {
  const manufacturerNameValue = manufacturerName.value.trim().toLowerCase();
  return manufacturerNameValue === `` || !props.fixture.name.trim().toLowerCase().startsWith(manufacturerNameValue);
});
</script>
