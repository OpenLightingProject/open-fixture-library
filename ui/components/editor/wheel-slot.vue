<template>
  <conditional-details class="editor-wheel-slot" :open="open">
    <template slot="summary">Details for wheel slot {{ slotNumber }}</template>

    <div class="wheel-slot-content">
      <labeled-input
        :formstate="formstate"
        :custom-validators="{
          'animation-gobo-end-without-start': animationGoboEndAfterStart,
          'must-be-animation-gobo-end': animationGoboEndValid
        }"
        :name="`wheel-slot${slot.uuid}-type`"
        label="Slot type">
        <select
          v-model="slot.type"
          :class="{ empty: slot.type === `` }"
          :name="`wheel-slot${slot.uuid}-type`"
          required
          @change="changeSlotType">

          <option value="" disabled>Please select a slot type</option>

          <option
            v-for="type in slotTypes"
            :key="type"
            :value="type">{{ type }}</option>

        </select>
      </labeled-input>

      <component
        :is="`app-editor-wheel-slot-${slot.type}`"
        v-if="slot.type !== ``"
        ref="typeData"
        :wheel-slot="slot"
        :formstate="formstate" />
    </div>
  </conditional-details>
</template>

<style lang="scss" scoped>
.wheel-slot-content {
  padding: 0 1.5rem;
}
</style>

<script>
import schemaProperties from '../../../lib/schema-properties.js';
import { getEmptyWheelSlot } from '../../assets/scripts/editor-utils.js';

import conditionalDetails from '../conditional-details.vue';
import labeledInput from '../labeled-input.vue';

import editorWheelSlotAnimationGoboEnd from './wheel-slots/AnimationGoboEnd.vue';
import editorWheelSlotAnimationGoboStart from './wheel-slots/AnimationGoboStart.vue';
import editorWheelSlotClosed from './wheel-slots/Closed.vue';
import editorWheelSlotColor from './wheel-slots/Color.vue';
import editorWheelSlotFrost from './wheel-slots/Frost.vue';
import editorWheelSlotGobo from './wheel-slots/Gobo.vue';
import editorWheelSlotIris from './wheel-slots/Iris.vue';
import editorWheelSlotOpen from './wheel-slots/Open.vue';
import editorWheelSlotPrism from './wheel-slots/Prism.vue';

export default {
  components: {
    'conditional-details': conditionalDetails,
    'labeled-input': labeledInput,
    'editor-wheel-slot-AnimationGoboEnd': editorWheelSlotAnimationGoboEnd,
    'editor-wheel-slot-AnimationGoboStart': editorWheelSlotAnimationGoboStart,
    'editor-wheel-slot-Closed': editorWheelSlotClosed,
    'editor-wheel-slot-Color': editorWheelSlotColor,
    'editor-wheel-slot-Frost': editorWheelSlotFrost,
    'editor-wheel-slot-Gobo': editorWheelSlotGobo,
    'editor-wheel-slot-Iris': editorWheelSlotIris,
    'editor-wheel-slot-Open': editorWheelSlotOpen,
    'editor-wheel-slot-Prism': editorWheelSlotPrism
  },
  model: {
    prop: `capability`
  },
  props: {
    channel: {
      type: Object,
      required: true
    },
    slotNumber: {
      type: Number,
      required: true,
      valid(slotNumber) {
        // only integer slot numbers are allowed
        return slotNumber % 1 === 0;
      }
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
      open: false
    };
  },
  computed: {
    slotTypes() {
      return this.properties.wheelSlot.type.enum;
    },
    slot() {
      return this.channel.wheel.slots[this.slotNumber - 1];
    },
    suggestedType() {
      const prevSlot = this.channel.wheel.slots[this.slotNumber - 2];
      if (prevSlot && prevSlot.type === `AnimationGoboStart`) {
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

      const prevSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !prevSlot || prevSlot.type === `AnimationGoboStart`;
    },
    animationGoboEndValid() {
      const prevSlot = this.channel.wheel.slots[this.slotNumber - 2];
      return !prevSlot || prevSlot.type !== `AnimationGoboStart` || this.slot.type === `AnimationGoboEnd`;
    }
  },
  created() {
    this.$watch(`slotNumber`, function(newSlotNumber) {
      if (!this.channel.wheel.slots[newSlotNumber - 1]) {
        this.$set(this.channel.wheel.slots, newSlotNumber - 1, getEmptyWheelSlot());
        this.open = true;

        this.$nextTick(() => {
          this.slot.type = this.suggestedType;
        });
      }
    }, {
      immediate: true
    });
  },
  methods: {
    /**
     * Add all properties to capability.typeData that are required by the current wheel slot type and are not yet in there.
     */
    changeSlotType() {
      this.$nextTick(() => {
        const defaultData = this.$refs.typeData.defaultData;

        for (const prop of Object.keys(defaultData)) {
          if (!(prop in this.slot.typeData)) {
            this.$set(this.slot.typeData, prop, defaultData[prop]);
          }
        }
      });
    }
  }
};
</script>
