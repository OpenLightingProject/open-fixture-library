<template>
  <ConditionalDetails class="editor-wheel-slot" :open="open">
    <template #summary>Details for wheel slot {{ slotNumber }}</template>

    <div class="wheel-slot-content">
      <LabeledInput
        :formstate="formstate"
        :custom-validators="{
          'animation-gobo-end-without-start': animationGoboEndAfterStart,
          'must-be-animation-gobo-end': animationGoboEndValid,
        }"
        :name="`wheel-slot${slot.uuid}-type`"
        label="Slot type">
        <!-- eslint-disable-next-line vuejs-accessibility/no-onchange -- @change is fine here, as the action is non-destructive -->
        <select
          v-model="slot.type"
          :class="{ empty: slot.type === `` }"
          :name="`wheel-slot${slot.uuid}-type`"
          required
          @change="changeSlotType()">

          <option value="" disabled>Please select a slot type</option>

          <option
            v-for="type of slotTypes"
            :key="type"
            :value="type">{{ type }}</option>

        </select>
      </LabeledInput>

      <Component
        :is="`WheelSlot${slot.type}`"
        v-if="slot.type !== ``"
        ref="typeData"
        :wheel-slot="slot"
        :formstate="formstate" />
    </div>
  </ConditionalDetails>
</template>

<style lang="scss" scoped>
.wheel-slot-content {
  padding: 0 1.5rem;
}
</style>

<script>
import { integerProp, objectProp } from 'vue-ts-types';
import { wheelSlotTypes } from '../../../lib/schema-properties.js';
import { getEmptyWheelSlot } from '../../assets/scripts/editor-utils.js';

import ConditionalDetails from '../ConditionalDetails.vue';
import LabeledInput from '../LabeledInput.vue';

import WheelSlotAnimationGoboEnd from './wheel-slots/WheelSlotAnimationGoboEnd.vue';
import WheelSlotAnimationGoboStart from './wheel-slots/WheelSlotAnimationGoboStart.vue';
import WheelSlotClosed from './wheel-slots/WheelSlotClosed.vue';
import WheelSlotColor from './wheel-slots/WheelSlotColor.vue';
import WheelSlotFrost from './wheel-slots/WheelSlotFrost.vue';
import WheelSlotGobo from './wheel-slots/WheelSlotGobo.vue';
import WheelSlotIris from './wheel-slots/WheelSlotIris.vue';
import WheelSlotOpen from './wheel-slots/WheelSlotOpen.vue';
import WheelSlotPrism from './wheel-slots/WheelSlotPrism.vue';

export default {
  components: {
    ConditionalDetails,
    LabeledInput,
    WheelSlotAnimationGoboEnd,
    WheelSlotAnimationGoboStart,
    WheelSlotClosed,
    WheelSlotColor,
    WheelSlotFrost,
    WheelSlotGobo,
    WheelSlotIris,
    WheelSlotOpen,
    WheelSlotPrism,
  },
  props: {
    channel: objectProp().required,
    slotNumber: integerProp().required,
    formstate: objectProp().optional,
  },
  data() {
    return {
      slotTypes: Object.keys(wheelSlotTypes),
      open: false,
    };
  },
  computed: {
    slot() {
      return this.channel.wheel.slots[this.slotNumber - 1];
    },
    suggestedType() {
      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      if (previousSlot && previousSlot.type === `AnimationGoboStart`) {
        return `AnimationGoboEnd`;
      }

      if (this.slotNumber === 1) {
        return /\banimation\b/i.test(this.channel.name) ? `AnimationGoboStart` : `Open`;
      }

      return this.slotTypes.find(type => this.channel.name.toLowerCase().includes(type.toLowerCase())) || ``;
    },
    animationGoboEndAfterStart() {
      if (this.slot.type !== `AnimationGoboEnd`) {
        return true;
      }

      if (this.slotNumber === 1) {
        return false;
      }

      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !previousSlot || previousSlot.type === `AnimationGoboStart`;
    },
    animationGoboEndValid() {
      const previousSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !previousSlot || previousSlot.type !== `AnimationGoboStart` || this.slot.type === `AnimationGoboEnd`;
    },
  },
  created() {
    this.$watch(`slotNumber`, async function(newSlotNumber) {
      if (!this.channel.wheel.slots[newSlotNumber - 1]) {
        this.$set(this.channel.wheel.slots, newSlotNumber - 1, getEmptyWheelSlot());
        this.open = true;

        await this.$nextTick();
        this.slot.type = this.suggestedType;
      }
    }, {
      immediate: true,
    });
  },
  methods: {
    /**
     * Add all properties to capability.typeData that are required by the current wheel slot type and are not yet in there.
     */
    async changeSlotType() {
      await this.$nextTick();

      const defaultData = this.$refs.typeData.defaultData;
      for (const property of Object.keys(defaultData)) {
        if (!(property in this.slot.typeData)) {
          this.$set(this.slot.typeData, property, defaultData[property]);
        }
      }
    },
  },
};
</script>
