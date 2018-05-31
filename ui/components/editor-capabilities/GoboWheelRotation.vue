<template>
  <div class="capability-type-data">

    <app-simple-label
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.angleOrSpeed}`">

      <template slot="label">
        <template v-if="capability.typeData.angleOrSpeed === `angle`">
          Angle / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of angle"
            @click.prevent="changeAngleOrSpeed(`speed`)">Speed</a>
        </template>
        <template v-else>
          Speed / <a
            href="#angle"
            class="button secondary inline"
            title="Specify angle instead of speed"
            @click.prevent="changeAngleOrSpeed(`angle`)">Angle</a>
        </template>
      </template>

      <app-editor-proportional-capability-data-switcher
        v-if="capability.typeData.angleOrSpeed"
        ref="angleOrSpeedInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.angleOrSpeed" />

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
        angleOrSpeed: `speed`,
        angle: ``,
        angleStart: null,
        angleEnd: null,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        comment: ``
      }
    };
  },
  methods: {
    changeAngleOrSpeed(newValue) {
      this.capability.typeData.angleOrSpeed = newValue;
      this.$nextTick(() => this.$refs.angleOrSpeedInput.focus());
    },
    cleanCapabilityData() {
      const resetProp = this.capability.typeData.angleOrSpeed === `angle` ? `speed` : `angle`;

      this.capability.typeData[resetProp] = this.defaultData[resetProp];
      this.capability.typeData[`${resetProp}Start`] = this.defaultData[`${resetProp}Start`];
      this.capability.typeData[`${resetProp}End`] = this.defaultData[`${resetProp}End`];
    }
  }
};
</script>
