<template>
  <figure class="wheel">
    <svg
      :width="300"
      :height="300"
      :viewBox="`${-wheelRadius} ${-wheelRadius} ${2 * wheelRadius} ${2 * wheelRadius}`">

      <defs>
        <radialGradient id="frostGradient">
          <stop offset="0" stop-color="#fff" />
          <stop offset="0.6" stop-color="#fff" />
          <stop offset="1" stop-color="#000" />
        </radialGradient>
      </defs>

      <circle
        cx="0"
        cy="0"
        :r="wheelRadius"
        fill="#444"
        class="wheel" />
      <circle
        cx="0"
        cy="0"
        r="3"
        fill="#fff"
        class="hole" />

      <g :transform="`scale(${wheel.direction === `CCW` ? -1 : 1}, 1)`" class="arrow">
        <g transform="rotate(-30)">
          <path
            d="M 0,-6 C 3,-6 6,-3 6,0"
            fill="none"
            stroke="#aaa"
            stroke-width="1" />
          <path
            d="M 0,-8 -4,-6 0,-4 Z"
            fill="#aaa" />
        </g>
      </g>

      <g
        v-for="(slot, index) of wheel.slots"
        :key="`slot-${index}`"
        :transform="`rotate(${slotRotateAngle * index}, 0, 0)`"
        class="slot"
        :class="{ dim: highlightedSlot !== null && highlightedSlot !== index }">

        <title>{{ slotTitles[index] }}</title>

        <g
          v-if="slot.colors !== null"
          :transform="`translate(0, ${slotRotateRadius})`"
          v-html="slotSvgFragments[index]" />

        <template v-else-if="slot.type === `Iris`">
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius"
            fill="#000" />
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius * (slot.openPercent ? slot.openPercent.number : 100) / 100"
            fill="#fff" />
        </template>

        <circle
          v-else-if="slot.type === `Frost`"
          :cx="0"
          :cy="slotRotateRadius"
          :r="slotRadius"
          fill="url(#frostGradient)" />

        <template v-else-if="slot.type === `AnimationGoboStart`">
          <!-- use circle's stroke, see https://css-tricks.com/building-a-donut-chart-with-vue-and-svg/ -->
          <circle
            :cx="0"
            :cy="0"
            :r="Math.abs(slotRotateRadius)"
            :stroke-width="2 * slotRadius"
            :stroke-dasharray="slotCircumference"
            :stroke-dashoffset="wheelDirectionFactor * (slotCircumference - animationGoboWidth)"
            :transform="`rotate(${-90 - (wheelDirectionFactor * slotRadius / slotCircumference * 360)}, 0, 0)`"
            stroke="#fff"
            fill="none" />

          <text
            :x="0"
            :y="slotRotateRadius + slotRadius * 0.35"
            :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
            :font-size="slotRadius"
            text-anchor="middle"
            fill="#000">
            S
          </text>

          <!-- rotate once more (like it was drawn in next slot) -->
          <g :transform="`rotate(${slotRotateAngle}, 0, 0)`">
            <text
              :x="0"
              :y="slotRotateRadius + slotRadius * 0.35"
              :transform="`rotate(${-slotRotateAngle * (index + 1)}, 0, ${slotRotateRadius})`"
              :font-size="slotRadius"
              text-anchor="middle"
              fill="#000">
              E
            </text>
          </g>
        </template>

        <template v-else-if="slot.type !== `AnimationGoboEnd`">
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius"
            fill="#fff" />

          <image
            v-if="slot.resource && slot.resource.hasImage"
            :x="-slotRadius"
            :y="slotRotateRadius - slotRadius"
            :width="slotRadius * 2"
            :height="slotRadius * 2"
            :xlink:href="slot.resource.imageDataUrl" />

          <text
            v-else
            :x="0"
            :y="slotRotateRadius + slotRadius * 0.35"
            :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
            :font-size="slotRadius"
            text-anchor="middle"
            fill="#000">
            {{ slot.nthOfType + 1 }}
          </text>
        </template>
      </g>
    </svg>
    <figcaption>
      <ConditionalDetails>
        <template #summary>{{ wheel.name }}</template>

        <table>
          <tbody>
            <tr
              v-for="(slot, index) of wheel.slots"
              :key="`slot-${index}`"
              tabindex="0"
              @mouseover="highlightedSlot = (slot.type === `AnimationGoboEnd` ? index - 1 : index)"
              @focusin="highlightedSlot = (slot.type === `AnimationGoboEnd` ? index - 1 : index)"
              @mouseout="highlightedSlot = null"
              @focusout="highlightedSlot = null">
              <th scope="row">Slot {{ index + 1 }}</th>
              <td>{{ slot.name }}</td>
            </tr>
          </tbody>
        </table>

      </ConditionalDetails>
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
figure {
  box-sizing: border-box;
  display: inline-block;
  width: 32%;
  min-width: 18rem;
  padding: 0 1rem;
  margin: 0 0 0.5rem;
  white-space: normal;
  vertical-align: top;
}

svg {
  width: 100%;
  height: 100%;
}

.slot {
  & text {
    font-weight: 400;
    pointer-events: none;
    fill: $primary-text-dark;
  }

  &:hover {
    opacity: 0.7;
  }

  &.dim {
    opacity: 0.3;
  }
}

figcaption ::v-deep summary {
  position: sticky;
  top: 0;
  font-weight: 700;
  text-align: center;

  &:not(:hover, :focus) {
    background: theme-color(card-background, 80%);
  }
}

figcaption {
  max-height: 50vh;
  overflow: auto;
}

figcaption table {
  border-spacing: 0;

  & td,
  & th {
    padding: 3px;
    vertical-align: top;
  }

  th {
    white-space: nowrap;
  }
}
</style>

<script>
import { instanceOfProp } from 'vue-ts-types';
import Wheel from '../../../lib/model/Wheel.js';
import ConditionalDetails from '../ConditionalDetails.vue';
import { getColorCircleSvgFragment } from '../global/OflSvg.vue';

export default {
  components: {
    ConditionalDetails,
  },
  props: {
    wheel: instanceOfProp(Wheel).required,
  },
  data() {
    return {
      highlightedSlot: null,
      wheelRadius: 50,
      wheelPadding: 3,
    };
  },
  computed: {
    wheelDirectionFactor() {
      return this.wheel.direction === `CCW` ? -1 : 1;
    },
    slotRadius() {
      const usableRadius = this.wheelRadius - this.wheelPadding;

      const spacingFactor = 0.85;
      const anglePerSlot = (2 * Math.PI / this.wheel.slots.length) * spacingFactor; // radians

      const maximumRadius = (usableRadius / 2) - 5; // preserve some space in the middle

      // (I):       slotRotateRadius = slotRadius / sin(anglePerSlot / 2)
      // (II):      slotRadius + slotRotateRadius = usableRadius
      // (I in II): slotRadius + slotRadius / sin(anglePerSlot / 2) = usableRadius
      //            slotRadius * (1 + 1 / sin(anglePerSlot / 2)) = usableRadius
      //            slotRadius = usableRadius / (1 + 1 / sin(anglePerSlot / 2))
      return Math.min(usableRadius / (1 + (1 / Math.sin(anglePerSlot / 2))), maximumRadius);
    },
    slotRotateRadius() {
      return -this.wheelRadius + this.slotRadius + this.wheelPadding;
    },
    slotRotateAngle() {
      return 360 / this.wheel.slots.length * this.wheelDirectionFactor;
    },
    slotCircumference() {
      return 2 * Math.PI * Math.abs(this.slotRotateRadius);
    },
    slotSvgFragments() {
      return this.wheel.slots.map(slot => {
        if (slot.colors !== null) {
          return getColorCircleSvgFragment(slot.colors, this.slotRadius);
        }

        return null;
      });
    },
    animationGoboWidth() {
      if (this.wheel.slots.length === 2) {
        // wheel only contains AnimationGoboStart and AnimationGoboEnd
        return this.slotCircumference;
      }

      return (2 * this.slotRadius) + (this.slotCircumference * Math.abs(this.slotRotateAngle) / 360);
    },
    slotTitles() {
      return this.wheel.slots.map((slot, index) => {
        if (slot.type === `AnimationGoboStart`) {
          const splitSlot = this.wheel.getSlot(index + 1.5);
          return `Slots ${index + 1}…${index + 2}: ${splitSlot.name}`;
        }

        return `Slot ${index + 1}: ${slot.name}`;
      });
    },
  },
};
</script>
