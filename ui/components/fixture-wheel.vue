<template>
  <figure class="wheel">
    <svg width="300" height="300" viewBox="-50 -50 100 100">
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
        r="50"
        fill="#444"
        class="wheel" />
      <circle
        cx="0"
        cy="0"
        r="3"
        fill="#fff" />

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
        v-for="(slot, index) in wheel.slots"
        :key="`slot-${index}`"
        :transform="`rotate(${slotRotateAngle * index}, 0, 0)`"
        class="slot">

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
            {{ index + 1 }}
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
              {{ index + 2 }}
            </text>
          </g>
        </template>

        <template v-else-if="slot.type !== `AnimationGoboEnd`">
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius"
            fill="#fff" />

          <text
            :x="0"
            :y="slotRotateRadius + slotRadius * 0.35"
            :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
            :font-size="slotRadius"
            text-anchor="middle"
            fill="#000">
            {{ index + 1 }}
          </text>
        </template>
      </g>
    </svg>
    <figcaption>{{ wheel.name }}</figcaption>
  </figure>
</template>

<style lang="scss" scoped>
figure {
  box-sizing: border-box;
  padding: 0 1rem;
  margin: 0 0 0.5rem;
  display: inline-block;
  width: 32%;
  min-width: 18rem;
}

svg {
  width: 100%;
  height: 100%;
}

.slot {
  & text {
    fill: $primary-text-dark;
    pointer-events: none;
    font-weight: 400;
  }

  &:hover {
    opacity: 0.7;
  }
}

figcaption {
  font-weight: bold;
  text-align: center;
}
</style>

<script>
const { getColorCircleSvgFragment } = require(`~/components/svg.vue`);
import Wheel from '~~/lib/model/Wheel.mjs';

export default {
  props: {
    wheel: {
      type: Wheel,
      required: true
    }
  },
  computed: {
    wheelDirectionFactor() {
      return this.wheel.direction === `CCW` ? -1 : 1;
    },
    slotRadius() {
      return Math.min(70 / this.wheel.slots.length * 1.25, 18.5);
    },
    slotRotateRadius() {
      return -50 + this.slotRadius + 3;
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
          return `Slots ${index + 1}…${index + 2}: Animation Gobo`;
        }

        return `Slot ${index + 1}: ${slot.name}`;
      });
    }
  }
};
</script>
