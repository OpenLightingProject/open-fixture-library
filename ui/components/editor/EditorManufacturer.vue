<template>
  <section class="manufacturer card">
    <h2>Manufacturer</h2>

    <section v-if="fixture.useExistingManufacturer">
      <LabeledInput :formstate="formstate" name="manufacturerKey" label="Choose from list">
        <select
          ref="existingManufacturerSelect"
          v-model="fixture.manufacturerKey"
          :class="{ empty: fixture.manufacturerKey === `` }"
          required
          name="manufacturerKey">

          <option value="" disabled>Please select a manufacturer</option>

          <template v-for="(manufacturer, manufacturerKey) of manufacturers">
            <option v-if="manufacturerKey !== `$schema`" :key="manufacturerKey" :value="manufacturerKey">
              {{ manufacturer.name }}
            </option>
          </template>

        </select>
      </LabeledInput>

      <div>or <a href="#add-new-manufacturer" @click.prevent="switchManufacturer(false)">add a new manufacturer</a></div>
    </section>

    <div v-else>
      <LabeledInput :formstate="formstate" name="new-manufacturer-name" label="Name">
        <PropertyInputText
          ref="newManufacturerNameInput"
          v-model="fixture.newManufacturerName"
          :schema-property="manufacturerProperties.name"
          required
          name="new-manufacturer-name" />
      </LabeledInput>

      <LabeledInput :formstate="formstate" name="new-manufacturer-website" label="Website">
        <PropertyInputText
          v-model="fixture.newManufacturerWebsite"
          :schema-property="manufacturerProperties.website"
          type="url"
          name="new-manufacturer-website" />
      </LabeledInput>

      <LabeledInput :formstate="formstate" name="new-manufacturer-comment" label="Comment">
        <PropertyInputTextarea
          v-model="fixture.newManufacturerComment"
          :schema-property="manufacturerProperties.comment"
          name="new-manufacturer-comment" />
      </LabeledInput>

      <LabeledInput :formstate="formstate" name="new-manufacturer-rdmId">
        <template #label><abbr title="Remote Device Management">RDM</abbr> manufacturer ID</template>
        <PropertyInputNumber
          v-model="fixture.newManufacturerRdmId"
          :schema-property="manufacturerProperties.rdmId"
          name="new-manufacturer-rdmId" />
      </LabeledInput>

      <div>or <a href="#use-existing-manufacturer" @click.prevent="switchManufacturer(true)">choose an existing manufacturer</a></div>
    </div>
  </section>
</template>

<script>
import { objectProp } from 'vue-ts-types';
import { manufacturerProperties } from '../../../lib/schema-properties.js';

import LabeledInput from '../LabeledInput.vue';
import PropertyInputNumber from '../PropertyInputNumber.vue';
import PropertyInputText from '../PropertyInputText.vue';
import PropertyInputTextarea from '../PropertyInputTextarea.vue';

export default {
  components: {
    LabeledInput,
    PropertyInputNumber,
    PropertyInputText,
    PropertyInputTextarea,
  },
  props: {
    fixture: objectProp().required,
    formstate: objectProp().required,
    manufacturers: objectProp().required,
  },
  data() {
    return {
      manufacturerProperties,
    };
  },
  watch: {
    'fixture.useExistingManufacturer': async function(useExisting) {
      await this.$nextTick();
      this.$refs[useExisting ? `existingManufacturerSelect` : `newManufacturerNameInput`].focus();
    },
  },
  methods: {
    switchManufacturer(useExisting) {
      this.fixture.useExistingManufacturer = useExisting;
    },
  },
};
</script>
