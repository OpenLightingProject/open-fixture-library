<template>
  <div class="capability-type-data">

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-slotNumber`"
      label="Slot number"
      hint="Leave the slot number empty if this capability enables wheel slot rotation for a WheelSlot capability in another channel."
      style="display: inline-block; margin-bottom: 12px;">
      <app-editor-proportional-capability-data-switcher
        :capability="capability"
        :formstate="formstate"
        property-name="slotNumber" />
    </app-labeled-input>

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-${capability.typeData.speedOrAngle}`">

      <template slot="label">
        <template v-if="capability.typeData.speedOrAngle === `speed`">
          Speed / <a
            href="#angle"
            class="button secondary inline"
            title="Specify angle instead of speed"
            @click.prevent="changeSpeedOrAngle(`angle`)">Angle</a>
        </template>
        <template v-else>
          Angle / <a
            href="#speed"
            class="button secondary inline"
            title="Specify speed instead of angle"
            @click.prevent="changeSpeedOrAngle(`speed`)">Speed</a>
        </template>
      </template>

      <app-editor-proportional-capability-data-switcher
        v-if="capability.typeData.speedOrAngle"
        ref="speedOrAngleInput"
        :capability="capability"
        :formstate="formstate"
        :property-name="capability.typeData.speedOrAngle"
        :required="true" />

    </app-labeled-input>

    <app-editor-wheel-slots
      :channel="channel"
      :capability="capability"
      :formstate="formstate" />

    <app-labeled-input
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <app-property-input-text
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="properties.definitions.nonEmptyString" />
    </app-labeled-input>

  </div>
</template>

<script>
import schemaProperties from '~~/lib/schema-properties.js';

import editorProportionalCapabilityDataSwitcher from '~/components/editor-proportional-capability-data-switcher.vue';
import editorWheelSlotsVue from '~/components/editor-wheel-slots.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import labeledInputVue from '~/components/labeled-input.vue';

export default {
  components: {
    'app-editor-proportional-capability-data-switcher': editorProportionalCapabilityDataSwitcher,
    'app-editor-wheel-slots': editorWheelSlotsVue,
    'app-property-input-text': propertyInputTextVue,
    'app-labeled-input': labeledInputVue
  },
  props: {
    capability: {
      type: Object,
      required: true
    },
    channel: {
      type: Object,
      required: true
    },
    formstate: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      properties: schemaProperties,
      defaultData: {
        slotNumber: ``,
        slotNumberStart: null,
        slotNumberEnd: null,
        speedOrAngle: `speed`,
        speed: ``,
        speedStart: null,
        speedEnd: null,
        angle: ``,
        angleStart: null,
        angleEnd: null,
        comment: ``
      }
    };
  },
  computed: {
    resetProps() {
      const resetProp = this.capability.typeData.speedOrAngle === `speed` ? `angle` : `speed`;

      return [resetProp, `${resetProp}Start`, `${resetProp}End`];
    }
  },
  methods: {
    changeSpeedOrAngle(newValue) {
      this.capability.typeData.speedOrAngle = newValue;
      this.$nextTick(() => this.$refs.speedOrAngleInput.focus());
    }
  }
};
</script>
