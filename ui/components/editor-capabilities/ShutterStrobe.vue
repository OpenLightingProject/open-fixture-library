<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-shutterEffect`"
      label="Shutter effect">
      <select
        v-model="capability.typeData.shutterEffect"
        :class="{ empty: capability.typeData.shutterEffect === `` }"
        :name="`capability${capability.uuid}-shutterEffect`"
        required>

        <option value="" disabled>Please select a shutter effect</option>
        <option
          v-for="effect in shutterEffects"
          :key="effect"
          :value="effect">{{ effect }}</option>

      </select>
    </app-simple-label>

    <template v-if="isStrobeEffect">
      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-speed`"
        label="Speed">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="speed"
          entity="speed" />
      </app-simple-label>

      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-duration`"
        label="Duration">
        <app-editor-proportional-capability-data-switcher
          :capability="capability"
          :formstate="formstate"
          property-name="duration" />
      </app-simple-label>

      <app-simple-label
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        label="Comment">
        <app-property-input-text
          v-model="capability.typeData.comment"
          :formstate="formstate"
          :name="`capability${capability.uuid}-comment`"
          :schema-property="properties.definitions.nonEmptyString" />
      </app-simple-label>
    </template>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import simpleLabelVue from '~/components/simple-label.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-property-input-text': propertyInputTextVue,
    'app-simple-label': simpleLabelVue
  },
  props: {
    capability: {
      type: Object,
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
      defaultData: {
        shutterEffect: ``,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        duration: ``,
        durationStart: null,
        durationEnd: null,
        comment: ``
      }
    };
  },
  computed: {
    shutterEffects() {
      return this.properties.capabilityTypes.ShutterStrobe.properties.shutterEffect.enum;
    },
    isStrobeEffect() {
      return ![``, `Open`, `Closed`].includes(this.capability.typeData.shutterEffect);
    },
    resetProps() {
      if (!this.isStrobeEffect) {
        return [`speed`, `speedStart`, `speedEnd`, `duration`, `durationStart`, `durationEnd`];
      }

      return [];
    }
  }
};
</script>
