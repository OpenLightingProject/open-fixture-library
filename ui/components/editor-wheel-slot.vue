<template>
  <app-conditional-details class="editor-wheel-slot" :open="open">
    <template slot="summary">Details for wheel slot {{ slotNumber }}</template>

    <div class="wheel-slot-content">
      <app-labeled-input
        :formstate="formstate"
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
      </app-labeled-input>

      <component
        :is="`app-editor-wheel-slot-${slot.type}`"
        v-if="slot.type !== ``"
        ref="typeData"
        :wheel-slot="slot"
        :formstate="formstate" />
    </div>
  </app-conditional-details>
</template>

<style lang="scss" scoped>
.wheel-slot-content {
  padding: 0 1.5rem;
}
</style>

<script>
import schemaProperties from '~~/lib/schema-properties.js';
import { getEmptyWheelSlot } from '~/assets/scripts/editor-utils.mjs';

import conditionalDetailsVue from '~/components/conditional-details.vue';
import labeledInputVue from '~/components/labeled-input.vue';

import editorWheelSlotAnimationGoboEnd from '~/components/wheel-slots/AnimationGoboEnd.vue';
import editorWheelSlotAnimationGoboStart from '~/components/wheel-slots/AnimationGoboStart.vue';
import editorWheelSlotClosed from '~/components/wheel-slots/Closed.vue';
import editorWheelSlotColor from '~/components/wheel-slots/Color.vue';
import editorWheelSlotFrost from '~/components/wheel-slots/Frost.vue';
import editorWheelSlotGobo from '~/components/wheel-slots/Gobo.vue';
import editorWheelSlotIris from '~/components/wheel-slots/Iris.vue';
import editorWheelSlotOpen from '~/components/wheel-slots/Open.vue';
import editorWheelSlotPrism from '~/components/wheel-slots/Prism.vue';

export default {
  components: {
    'app-conditional-details': conditionalDetailsVue,
    'app-labeled-input': labeledInputVue,
    'app-editor-wheel-slot-AnimationGoboEnd': editorWheelSlotAnimationGoboEnd,
    'app-editor-wheel-slot-AnimationGoboStart': editorWheelSlotAnimationGoboStart,
    'app-editor-wheel-slot-Closed': editorWheelSlotClosed,
    'app-editor-wheel-slot-Color': editorWheelSlotColor,
    'app-editor-wheel-slot-Frost': editorWheelSlotFrost,
    'app-editor-wheel-slot-Gobo': editorWheelSlotGobo,
    'app-editor-wheel-slot-Iris': editorWheelSlotIris,
    'app-editor-wheel-slot-Open': editorWheelSlotOpen,
    'app-editor-wheel-slot-Prism': editorWheelSlotPrism
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
      if (this.slotNumber === 1) {
        return `Open`;
      }

      return this.slotTypes.find(type => this.channel.name.toLowerCase().includes(type.toLowerCase())) || ``;
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
